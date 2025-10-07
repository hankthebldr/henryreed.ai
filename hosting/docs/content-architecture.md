# Content Architecture Documentation

## Overview

The henryreed.ai platform implements a comprehensive content management and indexing system that provides unified access to all documentation, guides, and knowledge base content across the repository.

## Architecture Components

### 1. Content Indexing System

The content indexing system automatically scans all markdown files across the repository and generates a unified content index with rich metadata.

#### Key Features:
- **Non-destructive**: Archives and tags legacy content without deletion
- **Automatic metadata extraction**: Titles, categories, tags, summaries
- **Content analysis**: Word counts, heading structures, technology detection
- **Change detection**: SHA-256 checksums for incremental updates
- **Flexible categorization**: Automatic inference with manual override support

#### Scanned Locations:
- Repository root (README, planning documents)
- `docs/` directory (architectural documentation)
- `hosting/docs/` directory (application documentation)
- `hosting/lib/` directory (code documentation)
- `examples/` directory (example configurations)

### 2. Content Types and Schema

#### ContentItem Interface
```typescript
interface ContentItem {
  id: string;              // MD5 hash of file path
  title: string;           // Extracted or inferred title
  slug: string;            // URL-friendly version
  type: 'doc' | 'guide' | 'template' | 'playbook' | 'reference';
  category: string;        // Inferred or explicit category
  tags: string[];          // Technology and functional tags
  summary: string;         // Auto-generated or frontmatter
  sourcePath: string;      // Original file path
  bodyPath?: string;       // Path to full content
  author: string;          // Inferred or explicit author
  publishedAt: string;     // File creation or frontmatter date
  updatedAt: string;       // Last modification time
  status: 'draft' | 'published' | 'archived';
  relatedIds: string[];    // Related content items
  attribution?: string;    // Attribution text if needed
  checksum: string;        // SHA-256 for change detection
  searchable: boolean;     // Whether included in search
  metadata: {
    fileSize: number;
    wordCount: number;
    headingCount: number;
    isLegacy: boolean;
    [key: string]: any;    // Additional frontmatter
  };
}
```

### 3. Automated Classification

#### Content Type Inference
- **doc**: README files, general documentation
- **guide**: Step-by-step instructions, tutorials
- **template**: Reusable templates and boilerplates  
- **playbook**: Operational procedures and runbooks
- **reference**: API documentation, technical references

#### Category Inference Rules
- `docs` → Documentation
- `examples` → Examples
- `README` → Overview
- `PLAN|SUMMARY` → Planning
- `SCHEMA|CONFIG` → Configuration
- `knowledge-base` → Knowledge Base
- `hosting` → Application

#### Tag Generation
- **Path-based**: Directory structure analysis
- **Technology**: firebase, react, nextjs, typescript, ai, cortex
- **Functional**: authentication, deployment, testing, api
- **Content-based**: Keyword extraction from text

### 4. Search and Discovery

#### Search Features
- Full-text search across title, summary, content
- Tag-based filtering and faceted search
- Category and type filtering
- Date range filtering
- Author and source filtering

#### Search Index Structure
```json
{
  "generatedAt": "2025-10-07T04:55:38.997Z",
  "version": "1.0.0",
  "totalItems": 187,
  "items": [...],
  "metadata": {
    "categories": ["Documentation", "Application", "Planning"],
    "types": ["doc", "template", "guide", "reference"],
    "tags": ["firebase", "react", "cortex", "ai", "pov", "trr"],
    "authors": ["Platform Team", "Documentation Team"]
  }
}
```

### 5. Firestore Integration

#### Collections Structure
- **content_items**: Main content collection with full metadata
- **content_metadata**: Index statistics and configuration

#### Firestore Document Example
```javascript
{
  id: "a1b2c3d4e5f6",
  title: "Cortex DC Portal - Architecture Guide",
  slug: "cortex-dc-portal-architecture-guide",
  type: "doc",
  category: "Documentation",
  tags: ["cortex", "architecture", "firebase", "react"],
  summary: "Comprehensive architecture overview...",
  searchText: "cortex dc portal architecture firebase react...",
  publishedAt: "2025-10-07T04:19:07.367Z",
  updatedAt: "2025-10-07T04:19:07.367Z",
  ingestedAt: "2025-10-07T04:55:38.997Z",
  // ... other fields
}
```

## Usage

### Running the Content Indexer

```bash
# Generate content index
cd hosting
npx tsx scripts/content-index.ts

# Output: hosting/public/content-index.json
```

### Ingesting into Firestore

```bash
# Ingest to Firestore (production)
npx tsx scripts/firestore-ingest.ts

# Ingest to emulator for testing
npx tsx scripts/firestore-ingest.ts --emulator

# Custom index path
npx tsx scripts/firestore-ingest.ts --index=path/to/index.json
```

### Integration with Application

```typescript
// Client-side content access
import contentIndex from '/content-index.json';

// Search content
const searchResults = contentIndex.items.filter(item =>
  item.searchText.includes(query.toLowerCase()) &&
  (category ? item.category === category : true) &&
  (tags ? tags.some(tag => item.tags.includes(tag)) : true)
);

// Firestore queries
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

const contentQuery = query(
  collection(db, 'content_items'),
  where('category', '==', 'Documentation'),
  where('status', '==', 'published'),
  orderBy('updatedAt', 'desc'),
  limit(20)
);
```

## Content Management Workflow

### 1. Content Creation
1. Create markdown files with frontmatter (optional)
2. Use standard markdown formatting
3. Include appropriate file naming conventions

### 2. Automatic Processing
1. Content indexer scans on build/deploy
2. Metadata extraction and categorization
3. JSON index generation
4. Firestore ingestion (optional)

### 3. Search and Discovery
1. Client-side search via JSON index
2. Server-side search via Firestore
3. Real-time updates and synchronization

## Best Practices

### Content Authors
- Use descriptive filenames and titles
- Include frontmatter for explicit metadata
- Use consistent heading structures
- Tag content appropriately
- Keep summaries concise and informative

### Frontmatter Example
```yaml
---
title: "Custom Title Override"
category: "Custom Category"
tags: ["tag1", "tag2", "tag3"]
summary: "Custom summary text"
author: "Author Name"
date: "2025-10-07"
status: "published"
type: "guide"
---
```

### File Organization
- Use clear directory structures
- Group related content together
- Follow naming conventions
- Avoid deep nesting where possible

## Performance Considerations

### Indexing Performance
- Incremental updates via checksums
- Batch processing for large repositories
- Configurable scan paths and exclusions
- Memory-efficient streaming for large files

### Search Performance
- Client-side filtering for responsive UI
- Server-side queries for complex searches
- Caching strategies for frequently accessed content
- Pagination for large result sets

## Monitoring and Maintenance

### Index Health
- Regular index regeneration
- Content freshness monitoring
- Broken link detection
- Metadata quality validation

### Analytics
- Search query analysis
- Content usage patterns
- Performance metrics
- User engagement tracking

## Future Enhancements

### Planned Features
- Vector embeddings for semantic search
- Real-time content synchronization
- Advanced analytics and insights
- Multi-language support
- Content recommendation engine

### Integration Roadmap
- Unit42 threat intelligence ingestion
- AI-powered content enhancement
- Automated content classification
- Cross-platform synchronization

## Troubleshooting

### Common Issues
1. **Missing content**: Check file paths and exclusion rules
2. **Incorrect metadata**: Verify frontmatter format
3. **Search not working**: Regenerate index and clear cache
4. **Performance issues**: Optimize queries and implement caching

### Debug Commands
```bash
# Verbose indexing
DEBUG=true npx tsx scripts/content-index.ts

# Test Firestore connectivity
npx tsx scripts/firestore-ingest.ts --emulator --dry-run

# Validate content structure
npm run validate-content
```

## API Reference

### ContentIndexer Class
- `indexContent()`: Main indexing process
- `scanDirectory()`: Recursive directory scanning
- `processMarkdownFile()`: Individual file processing
- `writeIndex()`: JSON output generation

### FirestoreContentIngester Class  
- `ingestContent()`: Main ingestion process
- `processBatch()`: Batch processing for Firestore
- `updateMetadata()`: Statistics and metadata updates

---

For more information, see the [Technical Implementation Guide](./technical-implementation.md) and [API Documentation](./api-reference.md).