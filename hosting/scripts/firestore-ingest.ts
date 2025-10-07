#!/usr/bin/env tsx

/**
 * Firestore Content Ingestion Script
 * 
 * Populates Firestore content_items collection from the generated content index.
 * Handles incremental updates based on content checksums.
 */

import fs from 'fs';
import path from 'path';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, doc, writeBatch, getDocs, query, where, limit } from 'firebase/firestore';
import { ContentItem } from '../types/content';

interface ContentIndex {
  generatedAt: string;
  version: string;
  totalItems: number;
  items: ContentItem[];
  metadata: {
    categories: string[];
    types: string[];
    tags: string[];
    authors: string[];
  };
}

interface IngestionStats {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

class FirestoreContentIngester {
  private db: any;
  private stats: IngestionStats = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  };

  constructor(useEmulator: boolean = false) {
    this.initializeFirebase(useEmulator);
  }

  private initializeFirebase(useEmulator: boolean) {
    // Initialize Firebase if not already initialized
    if (getApps().length === 0) {
      const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY || "demo-api-key",
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || "henryreedai.firebaseapp.com",
        projectId: process.env.FIREBASE_PROJECT_ID || "henryreedai",
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "henryreedai.appspot.com",
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "demo-sender-id",
        appId: process.env.FIREBASE_APP_ID || "demo-app-id"
      };
      
      initializeApp(firebaseConfig);
    }

    this.db = getFirestore();

    // Connect to emulator if requested
    if (useEmulator && !process.env.FIRESTORE_EMULATOR_HOST) {
      console.log('🔧 Connecting to Firestore emulator...');
      connectFirestoreEmulator(this.db, 'localhost', 8080);
    }
  }

  /**
   * Main ingestion process
   */
  async ingestContent(indexPath: string): Promise<void> {
    console.log('📥 Starting Firestore content ingestion...');
    
    // Load the content index
    const contentIndex = await this.loadContentIndex(indexPath);
    console.log(`📊 Loaded ${contentIndex.totalItems} items from index`);

    // Process items in batches
    const batchSize = 500; // Firestore batch limit
    const batches = this.createBatches(contentIndex.items, batchSize);
    
    console.log(`🔄 Processing ${batches.length} batches...`);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\n📦 Processing batch ${i + 1}/${batches.length} (${batch.length} items)...`);
      
      await this.processBatch(batch);
      
      // Add delay between batches to avoid rate limits
      if (i < batches.length - 1) {
        await this.sleep(100);
      }
    }

    // Update metadata collection
    await this.updateMetadata(contentIndex);

    this.printStats();
    console.log('\n✅ Firestore content ingestion completed!');
  }

  /**
   * Load and parse content index file
   */
  private async loadContentIndex(indexPath: string): Promise<ContentIndex> {
    if (!fs.existsSync(indexPath)) {
      throw new Error(`Content index not found at: ${indexPath}`);
    }

    const content = fs.readFileSync(indexPath, 'utf-8');
    return JSON.parse(content) as ContentIndex;
  }

  /**
   * Split items into batches for processing
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Process a single batch of content items
   */
  private async processBatch(items: ContentItem[]): Promise<void> {
    const batch = writeBatch(this.db);
    const contentCollection = collection(this.db, 'content_items');

    for (const item of items) {
      try {
        this.stats.total++;
        
        // Check if item already exists with same checksum
        const existingItem = await this.getExistingItem(item.id);
        
        if (existingItem && existingItem.checksum === item.checksum) {
          console.log(`  ⏭️  Skipped: ${item.title} (unchanged)`);
          this.stats.skipped++;
          continue;
        }

        // Prepare item for Firestore
        const firestoreItem = this.prepareForFirestore(item);
        const docRef = doc(contentCollection, item.id);
        
        if (existingItem) {
          // Update existing item
          batch.update(docRef, {
            ...firestoreItem,
            updatedAt: new Date().toISOString()
          });
          console.log(`  🔄 Updated: ${item.title}`);
          this.stats.updated++;
        } else {
          // Create new item
          batch.set(docRef, firestoreItem);
          console.log(`  ✅ Created: ${item.title}`);
          this.stats.created++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${item.title}:`, error);
        this.stats.errors++;
      }
    }

    // Commit the batch
    if (this.stats.created > 0 || this.stats.updated > 0) {
      await batch.commit();
      console.log(`  💾 Batch committed`);
    }
  }

  /**
   * Check if item exists in Firestore
   */
  private async getExistingItem(id: string): Promise<any | null> {
    try {
      const contentCollection = collection(this.db, 'content_items');
      const q = query(contentCollection, where('id', '==', id), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      }
      return null;
    } catch (error) {
      console.warn(`Warning: Could not check existing item ${id}:`, error);
      return null;
    }
  }

  /**
   * Prepare content item for Firestore storage
   */
  private prepareForFirestore(item: ContentItem): any {
    return {
      ...item,
      // Convert dates to Firestore timestamps if needed
      publishedAt: new Date(item.publishedAt).toISOString(),
      updatedAt: new Date(item.updatedAt).toISOString(),
      // Ensure arrays are properly formatted
      tags: item.tags || [],
      relatedIds: item.relatedIds || [],
      // Add indexing fields for search
      searchText: this.generateSearchText(item),
      // Add ingestion timestamp
      ingestedAt: new Date().toISOString()
    };
  }

  /**
   * Generate searchable text from content item
   */
  private generateSearchText(item: ContentItem): string {
    const searchFields = [
      item.title,
      item.summary,
      item.category,
      item.author,
      ...item.tags
    ].filter(Boolean);
    
    return searchFields.join(' ').toLowerCase();
  }

  /**
   * Update metadata collection with index statistics
   */
  private async updateMetadata(contentIndex: ContentIndex): Promise<void> {
    try {
      const metadataCollection = collection(this.db, 'content_metadata');
      const metadataDoc = doc(metadataCollection, 'index_stats');
      
      const metadata = {
        generatedAt: contentIndex.generatedAt,
        version: contentIndex.version,
        totalItems: contentIndex.totalItems,
        categories: contentIndex.metadata.categories,
        types: contentIndex.metadata.types,
        tags: contentIndex.metadata.tags,
        authors: contentIndex.metadata.authors,
        lastIngestion: new Date().toISOString(),
        ingestionStats: this.stats
      };
      
      const batch = writeBatch(this.db);
      batch.set(metadataDoc, metadata);
      await batch.commit();
      
      console.log('📊 Updated content metadata');
    } catch (error) {
      console.error('❌ Failed to update metadata:', error);
    }
  }

  /**
   * Utility function for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Print ingestion statistics
   */
  private printStats(): void {
    console.log('\n📊 Ingestion Statistics:');
    console.log(`   Total processed: ${this.stats.total}`);
    console.log(`   Created: ${this.stats.created}`);
    console.log(`   Updated: ${this.stats.updated}`);
    console.log(`   Skipped (unchanged): ${this.stats.skipped}`);
    console.log(`   Errors: ${this.stats.errors}`);
    
    const successRate = ((this.stats.created + this.stats.updated + this.stats.skipped) / this.stats.total * 100).toFixed(1);
    console.log(`   Success rate: ${successRate}%`);
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  const useEmulator = args.includes('--emulator');
  const indexPath = args.find(arg => arg.startsWith('--index='))?.split('=')[1] 
    || path.join(process.cwd(), 'public', 'content-index.json');

  console.log(`🎯 Ingesting content from: ${indexPath}`);
  if (useEmulator) {
    console.log('🔧 Using Firestore emulator');
  }

  const ingester = new FirestoreContentIngester(useEmulator);
  
  try {
    await ingester.ingestContent(indexPath);
    process.exit(0);
  } catch (error) {
    console.error('💥 Content ingestion failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { FirestoreContentIngester };
