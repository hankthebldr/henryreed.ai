/**
 * Knowledge Base Service
 * Handles storage, indexing, and retrieval of knowledge base documents
 * Uses Firebase Firestore for storage
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import {
  KnowledgeDocument,
  DocumentMetadata,
  DocumentRelationship,
  SearchFilters,
  SearchResult,
  KnowledgeGraph,
  GraphNode,
  GraphEdge
} from '../types/knowledgeBase';

const COLLECTION_NAME = 'knowledgeBase';

/**
 * Save a new knowledge document to Firestore
 */
export async function saveKnowledgeDocument(
  document: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!db) throw new Error('Firebase not initialized');

  const docData = {
    ...document,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);

  // Update search index
  await updateSearchIndex(docRef.id, document);

  return docRef.id;
}

/**
 * Update an existing knowledge document
 */
export async function updateKnowledgeDocument(
  id: string,
  updates: Partial<KnowledgeDocument>
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const docRef = doc(db, COLLECTION_NAME, id);

  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });

  // Update search index
  await updateSearchIndex(id, updates);
}

/**
 * Get a knowledge document by ID
 */
export async function getKnowledgeDocument(id: string): Promise<KnowledgeDocument | null> {
  if (!db) throw new Error('Firebase not initialized');

  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data()
  } as KnowledgeDocument;
}

/**
 * Delete a knowledge document
 */
export async function deleteKnowledgeDocument(id: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);

  // Remove from search index
  await removeFromSearchIndex(id);
}

/**
 * Get all knowledge documents
 */
export async function getAllKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  if (!db) throw new Error('Firebase not initialized');

  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as KnowledgeDocument[];
}

/**
 * Search knowledge documents with filters
 */
export async function searchKnowledgeDocuments(
  filters: SearchFilters
): Promise<SearchResult[]> {
  if (!db) throw new Error('Firebase not initialized');

  let q = query(collection(db, COLLECTION_NAME));

  // Apply filters
  if (filters.categories && filters.categories.length > 0) {
    q = query(q, where('metadata.category', 'in', filters.categories));
  }

  if (filters.tags && filters.tags.length > 0) {
    q = query(q, where('metadata.tags', 'array-contains-any', filters.tags));
  }

  if (filters.author) {
    q = query(q, where('metadata.author', '==', filters.author));
  }

  if (filters.complexity && filters.complexity.length > 0) {
    q = query(q, where('metadata.complexity', 'in', filters.complexity));
  }

  // Date range filter
  if (filters.dateRange?.from) {
    q = query(q, where('createdAt', '>=', Timestamp.fromDate(filters.dateRange.from)));
  }
  if (filters.dateRange?.to) {
    q = query(q, where('createdAt', '<=', Timestamp.fromDate(filters.dateRange.to)));
  }

  const querySnapshot = await getDocs(q);
  const documents = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as KnowledgeDocument[];

  // Apply text search if query is provided
  let results = documents;
  if (filters.query) {
    results = performTextSearch(documents, filters.query);
  }

  // Convert to SearchResult format
  return results.map(doc => ({
    document: doc,
    score: calculateRelevanceScore(doc, filters),
    highlights: extractHighlights(doc, filters.query),
    matchedFields: getMatchedFields(doc, filters)
  }));
}

/**
 * Perform client-side text search (in production, use Algolia or Elasticsearch)
 */
function performTextSearch(documents: KnowledgeDocument[], query: string): KnowledgeDocument[] {
  const lowerQuery = query.toLowerCase();

  return documents.filter(doc => {
    return (
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.content.toLowerCase().includes(lowerQuery) ||
      doc.metadata.description?.toLowerCase().includes(lowerQuery) ||
      doc.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      doc.metadata.keywords.some(kw => kw.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Calculate relevance score for search results
 */
function calculateRelevanceScore(doc: KnowledgeDocument, filters: SearchFilters): number {
  let score = 0;

  if (filters.query) {
    const lowerQuery = filters.query.toLowerCase();

    // Title match
    if (doc.title.toLowerCase().includes(lowerQuery)) score += 10;

    // Description match
    if (doc.metadata.description?.toLowerCase().includes(lowerQuery)) score += 5;

    // Tag match
    if (doc.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) score += 3;

    // Keyword match
    if (doc.metadata.keywords.some(kw => kw.toLowerCase().includes(lowerQuery))) score += 2;

    // Content match
    if (doc.content.toLowerCase().includes(lowerQuery)) score += 1;
  }

  return score;
}

/**
 * Extract highlighted snippets from document
 */
function extractHighlights(doc: KnowledgeDocument, query?: string): string[] {
  if (!query) return [];

  const highlights: string[] = [];
  const lowerQuery = query.toLowerCase();
  const sentences = doc.content.split(/[.!?]+/);

  sentences.forEach(sentence => {
    if (sentence.toLowerCase().includes(lowerQuery)) {
      highlights.push(sentence.trim().substring(0, 150) + '...');
    }
  });

  return highlights.slice(0, 3); // Return top 3 highlights
}

/**
 * Get matched fields for search result
 */
function getMatchedFields(doc: KnowledgeDocument, filters: SearchFilters): string[] {
  const matched: string[] = [];

  if (filters.query) {
    const lowerQuery = filters.query.toLowerCase();

    if (doc.title.toLowerCase().includes(lowerQuery)) matched.push('title');
    if (doc.metadata.description?.toLowerCase().includes(lowerQuery)) matched.push('description');
    if (doc.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) matched.push('tags');
    if (doc.content.toLowerCase().includes(lowerQuery)) matched.push('content');
  }

  if (filters.categories?.includes(doc.metadata.category || '')) matched.push('category');
  if (filters.author === doc.metadata.author) matched.push('author');

  return matched;
}

/**
 * Build knowledge graph from documents
 */
export async function buildKnowledgeGraph(): Promise<KnowledgeGraph> {
  const documents = await getAllKnowledgeDocuments();

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const categories = new Set<string>();
  const tags = new Set<string>();

  // Create document nodes
  documents.forEach(doc => {
    nodes.push({
      id: doc.id,
      label: doc.title,
      type: 'document',
      metadata: doc.metadata
    });

    if (doc.metadata.category) {
      categories.add(doc.metadata.category);
    }

    doc.metadata.tags.forEach(tag => tags.add(tag));
  });

  // Create category nodes
  categories.forEach(category => {
    nodes.push({
      id: `category-${category}`,
      label: category,
      type: 'category',
      metadata: {} as DocumentMetadata
    });
  });

  // Create tag nodes
  tags.forEach(tag => {
    nodes.push({
      id: `tag-${tag}`,
      label: tag,
      type: 'tag',
      metadata: {} as DocumentMetadata
    });
  });

  // Create edges from relationships
  documents.forEach(doc => {
    // Category edges
    if (doc.metadata.category) {
      edges.push({
        id: `${doc.id}-category-${doc.metadata.category}`,
        source: doc.id,
        target: `category-${doc.metadata.category}`,
        type: 'parent-child',
        weight: 0.8
      });
    }

    // Tag edges
    doc.metadata.tags.forEach(tag => {
      edges.push({
        id: `${doc.id}-tag-${tag}`,
        source: doc.id,
        target: `tag-${tag}`,
        type: 'related-by-tag',
        weight: 0.6
      });
    });

    // Relationship edges
    doc.relationships.forEach(rel => {
      edges.push({
        id: `${rel.sourceId}-${rel.targetId}`,
        source: rel.sourceId,
        target: rel.targetId,
        type: rel.type,
        weight: rel.weight || 0.5
      });
    });
  });

  return {
    nodes,
    edges,
    metadata: {
      totalDocuments: documents.length,
      categories: Array.from(categories),
      tags: Array.from(tags),
      lastUpdated: new Date()
    }
  };
}

/**
 * Find related documents based on tags, categories, and content
 */
export async function findRelatedDocuments(
  documentId: string,
  limit: number = 5
): Promise<KnowledgeDocument[]> {
  const doc = await getKnowledgeDocument(documentId);
  if (!doc) return [];

  const allDocs = await getAllKnowledgeDocuments();

  // Calculate similarity scores
  const scored = allDocs
    .filter(d => d.id !== documentId)
    .map(d => ({
      doc: d,
      score: calculateSimilarity(doc, d)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(s => s.doc);
}

/**
 * Calculate similarity between two documents
 */
function calculateSimilarity(doc1: KnowledgeDocument, doc2: KnowledgeDocument): number {
  let score = 0;

  // Category match
  if (doc1.metadata.category === doc2.metadata.category) score += 5;

  // Tag overlap
  const commonTags = doc1.metadata.tags.filter(tag =>
    doc2.metadata.tags.includes(tag)
  );
  score += commonTags.length * 3;

  // Keyword overlap
  const commonKeywords = doc1.metadata.keywords.filter(kw =>
    doc2.metadata.keywords.includes(kw)
  );
  score += commonKeywords.length * 2;

  // Topic overlap
  const commonTopics = doc1.metadata.topics.filter(topic =>
    doc2.metadata.topics.includes(topic)
  );
  score += commonTopics.length * 2;

  // Complexity match
  if (doc1.metadata.complexity === doc2.metadata.complexity) score += 1;

  return score;
}

/**
 * Update search index (placeholder for future Algolia/Elasticsearch integration)
 */
async function updateSearchIndex(
  docId: string,
  data: Partial<KnowledgeDocument>
): Promise<void> {
  // TODO: Implement search index update
  // This would integrate with Algolia or Elasticsearch in production
  console.log('Updating search index for document:', docId);
}

/**
 * Remove from search index
 */
async function removeFromSearchIndex(docId: string): Promise<void> {
  // TODO: Implement search index removal
  console.log('Removing from search index:', docId);
}

/**
 * Get statistics about the knowledge base
 */
export async function getKnowledgeBaseStats() {
  const documents = await getAllKnowledgeDocuments();

  const stats = {
    totalDocuments: documents.length,
    totalWords: documents.reduce((sum, doc) => sum + doc.content.split(/\s+/).length, 0),
    categories: new Set(documents.map(d => d.metadata.category).filter(Boolean)).size,
    tags: new Set(documents.flatMap(d => d.metadata.tags)).size,
    complexity: {
      beginner: documents.filter(d => d.metadata.complexity === 'beginner').length,
      intermediate: documents.filter(d => d.metadata.complexity === 'intermediate').length,
      advanced: documents.filter(d => d.metadata.complexity === 'advanced').length,
      expert: documents.filter(d => d.metadata.complexity === 'expert').length
    },
    averageReadTime: Math.round(
      documents.reduce((sum, d) => sum + d.metadata.estimatedReadTime, 0) / documents.length
    )
  };

  return stats;
}

/**
 * Export knowledge base to JSON
 */
export async function exportKnowledgeBase(): Promise<string> {
  const documents = await getAllKnowledgeDocuments();
  return JSON.stringify(documents, null, 2);
}

/**
 * Import knowledge base from JSON
 */
export async function importKnowledgeBase(jsonData: string): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  try {
    const documents = JSON.parse(jsonData) as KnowledgeDocument[];

    for (const doc of documents) {
      try {
        const { id, createdAt, updatedAt, ...docData } = doc;
        await saveKnowledgeDocument(docData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to import "${doc.title}": ${error}`);
      }
    }
  } catch (error) {
    results.errors.push(`JSON parsing error: ${error}`);
  }

  return results;
}
