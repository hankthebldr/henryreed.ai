#!/usr/bin/env tsx

/**
 * Content Indexer for henryreed.ai
 * 
 * Scans all markdown files across the repository and generates a unified content index.
 * Non-destructive approach - archives and tags legacy content without deletion.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import matter from 'gray-matter';
import { ContentItem } from '../types/content';

interface RawContentItem {
  title: string;
  content: string;
  frontmatter: Record<string, any>;
  path: string;
  stats: fs.Stats;
}

interface IndexerConfig {
  rootDir: string;
  outputPath: string;
  scanPaths: string[];
  excludePaths: string[];
  fallbackAuthor: string;
}

class ContentIndexer {
  private config: IndexerConfig;
  private contentItems: ContentItem[] = [];

  constructor(config: IndexerConfig) {
    this.config = config;
  }

  /**
   * Main indexing process
   */
  async indexContent(): Promise<void> {
    console.log('🔍 Starting content indexing...');
    
    // Scan each configured path
    for (const scanPath of this.config.scanPaths) {
      const fullPath = path.join(this.config.rootDir, scanPath);
      if (fs.existsSync(fullPath)) {
        console.log(`📁 Scanning ${scanPath}...`);
        await this.scanDirectory(fullPath, scanPath);
      } else {
        console.log(`⚠️  Path not found: ${scanPath}`);
      }
    }

    // Sort by updated date, most recent first
    this.contentItems.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Write the index
    await this.writeIndex();
    
    console.log(`✅ Indexed ${this.contentItems.length} content items`);
    this.printSummary();
  }

  /**
   * Recursively scan directory for markdown files
   */
  private async scanDirectory(dirPath: string, relativePath: string): Promise<void> {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const entryRelativePath = path.join(relativePath, entry.name);

      // Skip excluded paths
      if (this.shouldExclude(entryRelativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath, entryRelativePath);
      } else if (entry.isFile() && this.isMarkdownFile(entry.name)) {
        await this.processMarkdownFile(fullPath, entryRelativePath);
      }
    }
  }

  /**
   * Process a single markdown file
   */
  private async processMarkdownFile(filePath: string, relativePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const stats = fs.statSync(filePath);
      const parsed = matter(content);

      const rawItem: RawContentItem = {
        title: this.extractTitle(parsed, filePath),
        content: parsed.content,
        frontmatter: parsed.data,
        path: relativePath,
        stats
      };

      const contentItem = this.createContentItem(rawItem);
      this.contentItems.push(contentItem);

      console.log(`  ✓ ${contentItem.title}`);
    } catch (error) {
      console.error(`❌ Error processing ${relativePath}:`, error);
    }
  }

  /**
   * Create ContentItem from raw markdown data
   */
  private createContentItem(raw: RawContentItem): ContentItem {
    const id = this.generateId(raw.path);
    const checksum = this.generateChecksum(raw.content);
    
    // Extract metadata from frontmatter or infer from content
    const title = raw.frontmatter.title || raw.title;
    const category = this.inferCategory(raw.path, raw.frontmatter);
    const type = this.inferType(raw.path, raw.frontmatter, raw.content);
    const tags = this.extractTags(raw.frontmatter, raw.content, raw.path);
    const summary = this.generateSummary(raw.frontmatter, raw.content);
    const author = raw.frontmatter.author || this.inferAuthor(raw.path);
    
    return {
      id,
      title,
      slug: this.generateSlug(title),
      type,
      category,
      tags,
      summary,
      sourcePath: raw.path,
      bodyPath: raw.path, // Same as source for markdown files
      author,
      publishedAt: raw.frontmatter.date || raw.stats.birthtime.toISOString(),
      updatedAt: raw.stats.mtime.toISOString(),
      status: this.inferStatus(raw.path, raw.frontmatter),
      relatedIds: [],
      attribution: raw.frontmatter.attribution,
      checksum,
      searchable: raw.frontmatter.searchable !== false,
      metadata: {
        fileSize: raw.stats.size,
        wordCount: this.countWords(raw.content),
        headingCount: this.countHeadings(raw.content),
        lastModified: raw.stats.mtime.toISOString(),
        isLegacy: this.isLegacyContent(raw.path),
        ...raw.frontmatter
      }
    };
  }

  /**
   * Generate unique ID for content item
   */
  private generateId(filepath: string): string {
    return crypto.createHash('md5').update(filepath).digest('hex').substring(0, 12);
  }

  /**
   * Generate content checksum for change detection
   */
  private generateChecksum(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Extract title from frontmatter or content
   */
  private extractTitle(parsed: matter.GrayMatterFile<string>, filepath: string): string {
    if (parsed.data.title) return parsed.data.title;
    
    // Look for first H1 heading
    const h1Match = parsed.content.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1].trim();
    
    // Fall back to filename
    const basename = path.basename(filepath, path.extname(filepath));
    return basename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Infer content category from path and frontmatter
   */
  private inferCategory(filepath: string, frontmatter: Record<string, any>): string {
    if (frontmatter.category) return frontmatter.category;
    
    const pathSegments = filepath.split(path.sep);
    
    // Category inference rules
    if (filepath.includes('docs')) return 'Documentation';
    if (filepath.includes('examples')) return 'Examples';
    if (filepath.includes('README')) return 'Overview';
    if (filepath.includes('PLAN') || filepath.includes('SUMMARY')) return 'Planning';
    if (filepath.includes('SCHEMA') || filepath.includes('CONFIG')) return 'Configuration';
    if (filepath.includes('knowledge-base')) return 'Knowledge Base';
    if (filepath.includes('hosting')) return 'Application';
    
    return 'General';
  }

  /**
   * Infer content type from path and content
   */
  private inferType(
    filepath: string, 
    frontmatter: Record<string, any>, 
    content: string
  ): ContentItem['type'] {
    if (frontmatter.type) return frontmatter.type;
    
    const lowercasePath = filepath.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (lowercasePath.includes('template') || contentLower.includes('template')) return 'template';
    if (lowercasePath.includes('guide') || contentLower.includes('step-by-step')) return 'guide';
    if (lowercasePath.includes('playbook') || contentLower.includes('playbook')) return 'playbook';
    if (lowercasePath.includes('readme') || lowercasePath.includes('docs')) return 'doc';
    if (contentLower.includes('reference') || contentLower.includes('api')) return 'reference';
    
    return 'doc';
  }

  /**
   * Extract and normalize tags
   */
  private extractTags(
    frontmatter: Record<string, any>, 
    content: string, 
    filepath: string
  ): string[] {
    const tags = new Set<string>();
    
    // From frontmatter
    if (frontmatter.tags) {
      const fmTags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [frontmatter.tags];
      fmTags.forEach(tag => tags.add(String(tag).toLowerCase()));
    }
    
    // Infer from path
    const pathParts = filepath.split(path.sep);
    pathParts.forEach(part => {
      if (part && !part.includes('.')) {
        tags.add(part.toLowerCase().replace(/[-_]/g, ' '));
      }
    });
    
    // Infer from content
    const contentTags = this.inferTagsFromContent(content);
    contentTags.forEach(tag => tags.add(tag));
    
    return Array.from(tags).slice(0, 10); // Limit to 10 tags
  }

  /**
   * Generate summary from frontmatter or content
   */
  private generateSummary(frontmatter: Record<string, any>, content: string): string {
    if (frontmatter.summary || frontmatter.description) {
      return frontmatter.summary || frontmatter.description;
    }
    
    // Extract first paragraph that's not a heading
    const paragraphs = content.split('\n\n').map(p => p.trim()).filter(p => p && !p.startsWith('#'));
    const firstParagraph = paragraphs[0] || '';
    
    // Clean up markdown syntax
    const cleaned = firstParagraph
      .replace(/[#*`[\]]/g, '')
      .replace(/\n/g, ' ')
      .substring(0, 200);
    
    return cleaned + (cleaned.length >= 200 ? '...' : '');
  }

  /**
   * Infer author from path or use fallback
   */
  private inferAuthor(filepath: string): string {
    // Could be enhanced to parse git blame or use more sophisticated logic
    if (filepath.includes('hosting')) return 'Platform Team';
    if (filepath.includes('functions')) return 'Backend Team';
    if (filepath.includes('docs')) return 'Documentation Team';
    return this.config.fallbackAuthor;
  }

  /**
   * Infer content status
   */
  private inferStatus(filepath: string, frontmatter: Record<string, any>): ContentItem['status'] {
    if (frontmatter.status) return frontmatter.status;
    if (frontmatter.draft === true) return 'draft';
    if (this.isLegacyContent(filepath)) return 'archived';
    return 'published';
  }

  /**
   * Check if content should be considered legacy
   */
  private isLegacyContent(filepath: string): boolean {
    const legacyIndicators = [
      'old', 'legacy', 'deprecated', 'archive',
      'README_OLD', 'BACKUP', 'temp'
    ];
    
    return legacyIndicators.some(indicator => 
      filepath.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * Infer tags from content analysis
   */
  private inferTagsFromContent(content: string): string[] {
    const tags: string[] = [];
    const contentLower = content.toLowerCase();
    
    // Technology tags
    const techTerms = ['firebase', 'react', 'nextjs', 'typescript', 'ai', 'cortex', 'unit42', 'pov', 'trr'];
    techTerms.forEach(term => {
      if (contentLower.includes(term)) tags.push(term);
    });
    
    // Functional tags
    if (contentLower.includes('auth') || contentLower.includes('login')) tags.push('authentication');
    if (contentLower.includes('deploy') || contentLower.includes('build')) tags.push('deployment');
    if (contentLower.includes('test') || contentLower.includes('spec')) tags.push('testing');
    if (contentLower.includes('api') || contentLower.includes('endpoint')) tags.push('api');
    
    return tags;
  }

  /**
   * Utility methods
   */
  private generateSlug(title: string): string {
    return title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private countWords(content: string): number {
    return content.replace(/[#*`]/g, '').split(/\s+/).filter(word => word.length > 0).length;
  }

  private countHeadings(content: string): number {
    return (content.match(/^#+\s/gm) || []).length;
  }

  private isMarkdownFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return ['.md', '.markdown'].includes(ext);
  }

  private shouldExclude(filepath: string): boolean {
    return this.config.excludePaths.some(excluded => 
      filepath.includes(excluded)
    );
  }

  /**
   * Write the content index to JSON file
   */
  private async writeIndex(): Promise<void> {
    const indexData = {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      totalItems: this.contentItems.length,
      items: this.contentItems,
      metadata: {
        categories: this.getUniqueValues('category'),
        types: this.getUniqueValues('type'),
        tags: this.getAllTags(),
        authors: this.getUniqueValues('author')
      }
    };

    fs.writeFileSync(this.config.outputPath, JSON.stringify(indexData, null, 2));
    console.log(`📝 Index written to ${this.config.outputPath}`);
  }

  /**
   * Print indexing summary
   */
  private printSummary(): void {
    const categories = this.getUniqueValues('category');
    const types = this.getUniqueValues('type');
    
    console.log('\n📊 Indexing Summary:');
    console.log(`   Total Items: ${this.contentItems.length}`);
    console.log(`   Categories: ${categories.join(', ')}`);
    console.log(`   Types: ${types.join(', ')}`);
    console.log(`   Legacy Items: ${this.contentItems.filter(item => item.metadata?.isLegacy).length}`);
  }

  /**
   * Helper methods for summary stats
   */
  private getUniqueValues(field: keyof ContentItem): string[] {
    return [...new Set(this.contentItems.map(item => String(item[field])))];
  }

  private getAllTags(): string[] {
    const allTags = this.contentItems.flatMap(item => item.tags);
    return [...new Set(allTags)].slice(0, 50); // Top 50 tags
  }
}

/**
 * Main execution
 */
async function main() {
  const config: IndexerConfig = {
    rootDir: path.join(process.cwd(), '..'), // Repository root
    outputPath: path.join(process.cwd(), 'public', 'content-index.json'),
    scanPaths: [
      '.',
      'docs',
      'hosting/docs',
      'hosting/lib',
      'examples'
    ],
    excludePaths: [
      'node_modules',
      '.git',
      '.next',
      'out',
      'build',
      'dist',
      '.vercel',
      '.firebase',
      'functions/lib'
    ],
    fallbackAuthor: 'Platform Team'
  };

  const indexer = new ContentIndexer(config);
  
  try {
    await indexer.indexContent();
    console.log('\n🎉 Content indexing completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Content indexing failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ContentIndexer, type IndexerConfig };