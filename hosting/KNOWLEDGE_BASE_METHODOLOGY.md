# Knowledge Base Integration Methodology

## Overview

This document describes the complete methodology for integrating a markdown-based knowledge base with automatic metadata extraction, custom field tagging, and graph visualization into your Demo Creation Page.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                 Knowledge Base System                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1. Markdown Parser (lib/markdownParser.ts)             │
│     ├─ Frontmatter extraction (gray-matter)             │
│     ├─ Auto keyword extraction                          │
│     ├─ Complexity determination                         │
│     ├─ Link detection ([[wikilinks]] & [text](url))    │
│     └─ Relationship mapping                             │
│                                                           │
│  2. Metadata Editor (components/MetadataEditor.tsx)     │
│     ├─ Three-tab interface (Basic/Advanced/Custom)      │
│     ├─ Auto-suggested tags and keywords                 │
│     ├─ Custom field builder with type support           │
│     └─ Real-time validation                             │
│                                                           │
│  3. Knowledge Base Service (lib/knowledgeBaseService.ts)│
│     ├─ Firestore document storage                       │
│     ├─ Full-text search (client-side, upgradeable)      │
│     ├─ Relationship indexing                            │
│     ├─ Similarity calculation                           │
│     └─ Graph building                                   │
│                                                           │
│  4. Graph Visualization (components/KnowledgeGraph...)  │
│     ├─ Force-directed layout (custom SVG)               │
│     ├─ Interactive node dragging                        │
│     ├─ Relationship filtering                           │
│     ├─ Zoom and pan controls                            │
│     └─ Node type color coding                           │
│                                                           │
│  5. Manager Interface (components/KnowledgeBase...)     │
│     ├─ File upload & text paste                         │
│     ├─ Document listing with search                     │
│     ├─ Statistics dashboard                             │
│     └─ Graph navigation                                 │
└─────────────────────────────────────────────────────────┘
```

## Workflow

### 1. Document Import Process

```
User Action → Parse → Extract → Tag → Save → Index
```

#### Step 1: Upload/Paste Markdown

```markdown
---
title: "XSIAM Detection Setup Guide"
category: "Tutorial"
tags: ["security", "xsiam", "detection"]
author: "John Doe"
---

# XSIAM Detection Setup Guide

This guide covers the essential steps...

## Prerequisites

- XSIAM instance access
- Admin privileges

## Setup Steps

1. Configure data sources
2. Create detection rules
3. Test scenarios
```

#### Step 2: Automatic Field Extraction

The parser automatically extracts:

- **Frontmatter**: Title, category, tags, author, date
- **Keywords**: Frequency analysis of meaningful terms
- **Topics**: From headings and content patterns
- **Complexity**: Based on length, code blocks, technical terms
- **Links**: Both markdown `[text](url)` and wikilinks `[[page]]`
- **Read Time**: Word count / 200 words per minute

#### Step 3: Metadata Enrichment

User reviews and enhances metadata:

```typescript
{
  title: "XSIAM Detection Setup Guide",
  description: "Comprehensive guide for setting up detections",
  category: "Tutorial",
  tags: ["security", "xsiam", "detection", "siem"],
  keywords: ["detection", "rules", "xsiam", "setup", "configure"],
  topics: ["Prerequisites", "Setup Steps", "Testing"],
  complexity: "intermediate",
  estimatedReadTime: 8,
  customFields: {
    productVersion: { value: "2.5", type: "text" },
    deploymentDate: { value: "2025-01-15", type: "date" },
    criticality: { value: "High", type: "select" }
  }
}
```

#### Step 4: Relationship Detection

System identifies connections:

- **Direct Links**: References to other documents
- **Tag Overlap**: Shared tags create relationships
- **Topic Similarity**: Common topics link documents
- **Keyword Matching**: Similar terminology

#### Step 5: Storage & Indexing

Document saved to Firestore with:

```typescript
{
  id: "auto-generated-id",
  title: "...",
  content: "raw markdown",
  metadata: { ... },
  relationships: [
    { sourceId, targetId, type: "references", weight: 0.8 }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "userId"
}
```

### 2. Graph Visualization

#### Node Types

1. **Document Nodes** (Purple)
   - Primary knowledge documents
   - Size based on connections
   - Label shows title

2. **Category Nodes** (Green)
   - Document classification
   - Links to all docs in category

3. **Tag Nodes** (Amber)
   - Shared taxonomies
   - Links to tagged documents

4. **Topic Nodes** (Pink)
   - Content themes
   - Generated from headings

5. **Author Nodes** (Indigo)
   - Document creators
   - Useful for expertise mapping

#### Edge Types

| Type | Color | Description |
|------|-------|-------------|
| `references` | Blue | Direct citations or links |
| `related-by-tag` | Green | Shared tags |
| `related-by-topic` | Amber | Common topics |
| `prerequisite` | Red | Must read first |
| `follow-up` | Purple | Continuation |
| `alternative` | Gray | Alternative approach |
| `parent-child` | Teal | Hierarchical |

#### Interaction Features

- **Drag & Drop**: Rearrange nodes
- **Zoom**: Mouse wheel or controls
- **Filter**: By relationship type
- **Click**: View node details
- **Hover**: Highlight connections

### 3. Custom Fields System

#### Supported Field Types

1. **Text**: Single-line text input
2. **Number**: Numeric values with validation
3. **Date**: Date picker
4. **Boolean**: Yes/No checkbox
5. **Select**: Dropdown with options
6. **Multiselect**: Multiple choice checkboxes
7. **URL**: Validated URL input
8. **Email**: Validated email input

#### Creating Custom Fields

```typescript
const fieldDefinition: CustomFieldDefinition = {
  id: "deployment_environment",
  label: "Deployment Environment",
  type: "select",
  required: true,
  options: ["Production", "Staging", "Development"],
  validation: {
    message: "Please select an environment"
  }
};
```

#### Use Cases

- **Deployment Tracking**: Version, date, environment
- **Compliance**: Audit status, reviewer, compliance level
- **Project Management**: Owner, priority, status
- **Technical Details**: API version, dependencies
- **Custom Taxonomies**: Business unit, region, product line

## Integration with Demo Creation Page

### Option 1: Standalone Tab

Add to `ManualCreationGUI.tsx`:

```tsx
import { KnowledgeBaseManager } from './KnowledgeBaseManager';

// In your tab navigation:
<button onClick={() => setActiveTab('knowledge')}>
  📚 Knowledge Base
</button>

{activeTab === 'knowledge' && <KnowledgeBaseManager />}
```

### Option 2: Resource Library Section

Add as a dedicated section:

```tsx
<section id="resource-library">
  <h2>Resource Library & Guides</h2>
  <KnowledgeBaseManager />
</section>
```

### Option 3: Integrated with POV/Scenario Creation

Reference knowledge base articles during creation:

```tsx
const [selectedGuides, setSelectedGuides] = useState<string[]>([]);

// During POV creation
<div>
  <label>Related Guides</label>
  <KnowledgeDocumentSelector
    onSelect={(docs) => setSelectedGuides(docs)}
  />
</div>
```

## Firebase Setup

### Firestore Structure

```
knowledgeBase/
  {documentId}/
    - title: string
    - content: string
    - metadata: object
      - description: string
      - category: string
      - tags: array
      - keywords: array
      - topics: array
      - complexity: string
      - estimatedReadTime: number
      - customFields: object
    - relationships: array
      - sourceId: string
      - targetId: string
      - type: string
      - weight: number
    - createdAt: timestamp
    - updatedAt: timestamp
    - createdBy: string
```

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /knowledgeBase/{docId} {
      // Allow authenticated users to read
      allow read: if request.auth != null;

      // Allow authenticated users to create
      allow create: if request.auth != null &&
        request.resource.data.createdBy == request.auth.uid;

      // Allow owner or admin to update
      allow update: if request.auth != null &&
        (resource.data.createdBy == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');

      // Allow owner or admin to delete
      allow delete: if request.auth != null &&
        (resource.data.createdBy == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

### Indexes

Create these composite indexes in Firestore:

1. **Search by category and date**:
   - Collection: `knowledgeBase`
   - Fields: `metadata.category` (Ascending), `createdAt` (Descending)

2. **Search by tags and complexity**:
   - Collection: `knowledgeBase`
   - Fields: `metadata.tags` (Array), `metadata.complexity` (Ascending)

3. **Search by author and date**:
   - Collection: `knowledgeBase`
   - Fields: `metadata.author` (Ascending), `createdAt` (Descending)

## Advanced Features

### 1. Full-Text Search Enhancement

For production, integrate Algolia or Elasticsearch:

```typescript
// lib/searchService.ts
import algoliasearch from 'algoliasearch';

const client = algoliasearch('APP_ID', 'API_KEY');
const index = client.initIndex('knowledge_base');

export async function searchDocuments(query: string) {
  const { hits } = await index.search(query);
  return hits;
}

// Sync on document save
export async function indexDocument(doc: KnowledgeDocument) {
  await index.saveObject({
    objectID: doc.id,
    title: doc.title,
    content: doc.content,
    ...doc.metadata
  });
}
```

### 2. AI-Powered Enhancements

Use Vertex AI for better extraction:

```typescript
import { VertexAI } from '@google-cloud/vertexai';

async function extractWithAI(content: string) {
  const vertex = new VertexAI({ project: 'PROJECT_ID' });

  const prompt = `
    Analyze this document and extract:
    1. Main topics (5-7)
    2. Key concepts (10-15)
    3. Complexity level (beginner/intermediate/advanced/expert)
    4. Suggested tags (8-10)

    Document:
    ${content}
  `;

  const response = await vertex.generateContent(prompt);
  return parseAIResponse(response);
}
```

### 3. Version Control

Track document revisions:

```typescript
interface DocumentVersion {
  documentId: string;
  version: number;
  content: string;
  metadata: DocumentMetadata;
  changedBy: string;
  changedAt: Date;
  changeDescription: string;
}

async function saveVersion(doc: KnowledgeDocument) {
  await addDoc(collection(db, 'knowledgeVersions'), {
    documentId: doc.id,
    version: (doc.metadata.version || 0) + 1,
    content: doc.content,
    metadata: doc.metadata,
    changedBy: getCurrentUserId(),
    changedAt: new Date(),
    changeDescription: "Updated content and metadata"
  });
}
```

### 4. Export/Import

Bulk operations:

```typescript
// Export entire knowledge base
const exportData = await exportKnowledgeBase();
downloadJSON(exportData, 'knowledge-base-export.json');

// Import from JSON
const file = await readFile('import.json');
const result = await importKnowledgeBase(file);
console.log(`Imported: ${result.success}, Failed: ${result.failed}`);
```

### 5. Analytics

Track usage and engagement:

```typescript
interface DocumentAnalytics {
  documentId: string;
  views: number;
  uniqueViewers: string[];
  avgTimeSpent: number;
  lastViewed: Date;
  searchAppearances: number;
  linkedFrom: string[];
}

async function trackView(docId: string, userId: string) {
  const analyticsRef = doc(db, 'documentAnalytics', docId);
  await updateDoc(analyticsRef, {
    views: increment(1),
    uniqueViewers: arrayUnion(userId),
    lastViewed: Timestamp.now()
  });
}
```

## Best Practices

### 1. Content Organization

- **Use consistent frontmatter**: Always include title, category, tags
- **Write clear descriptions**: Help users understand content at a glance
- **Link liberally**: Use wikilinks `[[Document Title]]` for connections
- **Tag strategically**: Use 3-8 tags per document
- **Categorize thoughtfully**: Create meaningful category hierarchies

### 2. Metadata Management

- **Review auto-extracted data**: Always verify AI-generated metadata
- **Add custom fields sparingly**: Only create fields used by multiple docs
- **Keep tags consistent**: Use a controlled vocabulary
- **Update regularly**: Refresh metadata as content evolves

### 3. Graph Maintenance

- **Prune weak relationships**: Remove low-weight connections
- **Verify links**: Check that relationships are still relevant
- **Balance node types**: Don't over-categorize or over-tag
- **Monitor orphans**: Identify and connect isolated documents

### 4. Search Optimization

- **Use descriptive titles**: Include key search terms
- **Write comprehensive descriptions**: First paragraph is crucial
- **Include synonyms**: Tag with alternative terms
- **Update based on searches**: Track what users search for

### 5. Performance

- **Paginate document lists**: Load 20-50 at a time
- **Lazy load graph**: Build incrementally for large bases
- **Cache frequently accessed**: Use React Query or SWR
- **Index strategically**: Only index fields you search/filter by

## Example Markdown Templates

### Tutorial Template

```markdown
---
title: "How to Configure XSIAM Detection Rules"
category: "Tutorial"
tags: ["xsiam", "detection", "configuration", "security"]
author: "Security Team"
complexity: "intermediate"
estimatedReadTime: 15
---

# How to Configure XSIAM Detection Rules

Brief introduction to what this tutorial covers.

## Prerequisites

- [ ] XSIAM instance access
- [ ] Admin role
- [ ] Basic understanding of SIEM

## Steps

### 1. Access Detection Configuration

Instructions...

### 2. Create New Rule

Instructions...

## Testing

How to test your configuration...

## Troubleshooting

Common issues and solutions...

## Related Documents

- [[XSIAM Overview]]
- [[Detection Best Practices]]
- [[Incident Response Workflow]]
```

### Reference Template

```markdown
---
title: "XSIAM API Reference"
category: "Reference"
tags: ["api", "xsiam", "documentation", "technical"]
author: "Engineering"
complexity: "advanced"
---

# XSIAM API Reference

Complete API documentation for XSIAM platform.

## Authentication

### API Keys

Details...

### OAuth 2.0

Details...

## Endpoints

### GET /api/v1/detections

Purpose, parameters, response format...

### POST /api/v1/detections

Purpose, parameters, response format...

## Code Examples

```python
import xsiam

client = xsiam.Client(api_key="...")
detections = client.get_detections()
```

## Rate Limits

Details...

## Related APIs

- [[XSOAR API Reference]]
- [[Cortex Data Lake API]]
```

## Maintenance & Updates

### Regular Tasks

1. **Weekly**:
   - Review new documents for quality
   - Check for broken links
   - Update trending tags

2. **Monthly**:
   - Analyze search patterns
   - Identify gaps in content
   - Update outdated documents

3. **Quarterly**:
   - Audit custom fields usage
   - Optimize graph structure
   - Review analytics data

### Monitoring

Track these metrics:

- Total documents
- Documents per category
- Average read time
- Search success rate
- Graph connection density
- Orphaned documents count
- Most viewed documents
- Most linked documents

## Future Enhancements

### Planned Features

1. **Collaborative Editing**: Real-time multi-user editing
2. **Comments & Annotations**: Allow users to add notes
3. **AI Suggestions**: Recommend related content while browsing
4. **Automated Linking**: AI-powered relationship detection
5. **Content Health Score**: Quality metrics for documents
6. **Translation Support**: Multi-language content
7. **Mobile App**: Native mobile access
8. **Offline Mode**: PWA with sync capabilities

## Support & Resources

- **Documentation**: See inline code comments
- **Examples**: Check `/examples` directory
- **Issues**: Report bugs via GitHub
- **Discussions**: Join community forum

## License

This knowledge base system is part of the henryreed.ai platform.

---

**Version**: 1.0
**Last Updated**: 2025-01-09
**Maintainer**: Development Team
