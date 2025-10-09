# Knowledge Base Integration - Quick Start Guide

## Overview

You now have a complete markdown-based knowledge base system with automatic metadata extraction, custom field tagging, and graph visualization ready to integrate into your Demo Creation Page.

## What Was Created

### Core Files

1. **lib/markdownParser.ts** - Markdown parsing with auto-extraction
2. **lib/knowledgeBaseService.ts** - Firestore storage and search
3. **types/knowledgeBase.ts** - TypeScript type definitions
4. **components/MetadataEditor.tsx** - Three-tab metadata editing interface
5. **components/KnowledgeGraphVisualization.tsx** - Interactive graph component
6. **components/KnowledgeBaseManager.tsx** - Main orchestrator component

### Documentation

7. **KNOWLEDGE_BASE_METHODOLOGY.md** - Complete system documentation
8. **INTEGRATION_EXAMPLE.tsx** - Integration patterns and examples
9. **KNOWLEDGE_BASE_QUICKSTART.md** - This file

## Quick Start (5 Minutes)

### Step 1: Add to Your Demo Creation Page

Edit `hosting/components/ManualCreationGUI.tsx` or create new page:

```tsx
import { KnowledgeBaseManager } from './KnowledgeBaseManager';

// Add to your component:
<KnowledgeBaseManager />
```

### Step 2: Update Firebase Security Rules

In Firebase Console → Firestore → Rules:

```javascript
match /knowledgeBase/{docId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
}
```

### Step 3: Test the System

1. Start your dev server: `npm run dev`
2. Navigate to the Knowledge Base section
3. Upload a test markdown file or paste content
4. Review auto-extracted metadata
5. Save the document
6. View the knowledge graph

## Sample Test Document

Create a file named `test-guide.md`:

```markdown
---
title: "XSIAM Quick Start Guide"
category: "Tutorial"
tags: ["xsiam", "getting-started", "security"]
author: "Security Team"
---

# XSIAM Quick Start Guide

This guide helps you get started with XSIAM in 30 minutes.

## Prerequisites

- XSIAM instance access
- Admin credentials
- Basic security knowledge

## Step 1: Initial Configuration

Configure your XSIAM instance by accessing the admin panel...

## Step 2: Data Source Integration

Connect your data sources to start collecting security events...

## Step 3: Create Detection Rules

Set up your first detection rule to identify threats...

## Related Documents

- [[XSIAM Architecture Overview]]
- [[Advanced Detection Patterns]]
- [[Incident Response Workflow]]

## Tags

security, xsiam, tutorial, getting-started
```

## Key Features

### 1. Automatic Metadata Extraction

- **Keywords**: Extracted via frequency analysis
- **Topics**: Detected from headings
- **Complexity**: Calculated from content characteristics
- **Read Time**: Estimated from word count
- **Links**: Both markdown `[text](url)` and wikilinks `[[page]]`

### 2. Metadata Enrichment

Three-tab interface:

- **Basic**: Title, category, tags, author, description
- **Advanced**: Keywords, topics, complexity, read time
- **Custom**: User-defined fields with 8 data types

### 3. Graph Visualization

- Force-directed layout
- 5 node types (document, category, tag, topic, author)
- 7 relationship types (references, related-by-tag, etc.)
- Interactive drag, zoom, filter
- Click for details

### 4. Search & Discovery

- Full-text search (client-side, upgradeable to Algolia)
- Filter by category, tags, complexity, date
- Related document suggestions
- Similar document detection

## Integration Options

### Option A: Standalone Page (Recommended)

Create `hosting/app/knowledge/page.tsx`:

```tsx
'use client';

import { KnowledgeBaseManager } from '@/components/KnowledgeBaseManager';

export default function KnowledgePage() {
  return (
    <main className="container mx-auto p-8">
      <KnowledgeBaseManager />
    </main>
  );
}
```

Add to navigation in `AppHeader.tsx`.

### Option B: Tab in Demo Creation Page

Update `ManualCreationGUI.tsx`:

```tsx
type CreationMode = 'pov' | 'template' | 'scenario' | 'knowledge' | 'none';

// In render:
{activeMode === 'knowledge' && <KnowledgeBaseManager />}
```

### Option C: Sidebar Reference Panel

See `INTEGRATION_EXAMPLE.tsx` for full code.

## Workflow Example

### Creating a Knowledge Document

1. **Upload/Paste** markdown content
2. **Auto-Extract** system parses and extracts metadata
3. **Review** suggested tags, keywords, topics
4. **Enhance** add custom fields, adjust metadata
5. **Save** document stored in Firestore with relationships
6. **Visualize** view in knowledge graph

### Searching Documents

1. **Enter query** in search box
2. **Apply filters** category, tags, complexity
3. **View results** sorted by relevance
4. **Click document** to open/view

### Exploring Graph

1. **View graph** force-directed layout
2. **Filter** by relationship type
3. **Drag nodes** to rearrange
4. **Click node** to see details
5. **Zoom/Pan** to navigate

## Custom Field Examples

### Deployment Tracking

```typescript
{
  id: "deployment_date",
  label: "Deployment Date",
  type: "date",
  required: true
}
```

### Version Management

```typescript
{
  id: "product_version",
  label: "Product Version",
  type: "select",
  options: ["2.5", "3.0", "3.1"],
  required: true
}
```

### Compliance Status

```typescript
{
  id: "compliance_review",
  label: "Compliance Review Complete",
  type: "boolean",
  required: false
}
```

## Performance Tips

### For Large Knowledge Bases (1000+ docs)

1. **Enable pagination** in document list
2. **Lazy load graph** build incrementally
3. **Use Algolia** for search (see methodology doc)
4. **Cache frequently** accessed documents
5. **Index strategically** only searched fields

### Firestore Optimization

```typescript
// Create composite indexes for common queries:
// 1. category (asc) + createdAt (desc)
// 2. tags (array) + complexity (asc)
// 3. author (asc) + createdAt (desc)
```

## Common Patterns

### Link to Document in POV

```tsx
const [selectedGuides, setSelectedGuides] = useState<string[]>([]);

// In POV form:
<KnowledgeDocumentSelector
  selected={selectedGuides}
  onSelect={setSelectedGuides}
  filter={{ category: "Tutorial" }}
/>
```

### Show Related Docs in Sidebar

```tsx
const relatedDocs = await findRelatedDocuments(currentDocId, 5);
```

### Global Search (Cmd+K)

```tsx
// Add to main layout:
<GlobalKnowledgeSearch />
```

### Export/Import

```tsx
// Export
const json = await exportKnowledgeBase();
downloadFile(json, 'knowledge-base.json');

// Import
const result = await importKnowledgeBase(fileContent);
```

## Troubleshooting

### "Firebase not initialized"

Ensure `lib/firebase.ts` exports `getFirebaseServices()` that returns `{ db }`.

### Graph not rendering

Check that documents have valid relationships array. Clear cache and reload.

### Search returns nothing

Verify Firestore security rules allow reads. Check browser console for errors.

### Metadata not auto-extracting

Verify markdown has proper structure. Check frontmatter format (YAML).

### Custom fields not saving

Ensure field definitions are added before setting values.

## Next Steps

### Immediate (Day 1)

- [ ] Test with sample documents
- [ ] Add to navigation menu
- [ ] Create initial categories and tags
- [ ] Train team on upload process

### Short Term (Week 1)

- [ ] Import existing documentation
- [ ] Define custom fields for your use case
- [ ] Set up Firestore indexes
- [ ] Create document templates

### Medium Term (Month 1)

- [ ] Integrate with POV/Scenario creation
- [ ] Add global search (Cmd+K)
- [ ] Implement analytics tracking
- [ ] Create style guide for docs

### Long Term (Quarter 1)

- [ ] Upgrade to Algolia search
- [ ] Add AI-powered suggestions
- [ ] Implement version control
- [ ] Create mobile-friendly view
- [ ] Add collaborative editing

## Resources

- **Full Methodology**: `KNOWLEDGE_BASE_METHODOLOGY.md`
- **Integration Examples**: `INTEGRATION_EXAMPLE.tsx`
- **Type Definitions**: `types/knowledgeBase.ts`
- **Parser Logic**: `lib/markdownParser.ts`
- **Service Layer**: `lib/knowledgeBaseService.ts`

## Support

If you encounter issues:

1. Check the methodology doc for detailed explanations
2. Review integration examples for patterns
3. Inspect browser console for errors
4. Verify Firestore security rules
5. Check that Firebase is properly initialized

## Example Workflows

### Content Creator Workflow

1. Write guide in markdown editor
2. Add frontmatter (title, tags, category)
3. Upload to knowledge base
4. Review auto-extracted metadata
5. Add custom fields (version, owner, etc.)
6. Link to related documents
7. Save and share

### Demo Engineer Workflow

1. Search for relevant guides
2. Filter by complexity/category
3. View document details
4. Link guides to POV project
5. Track which guides used
6. Update guides based on feedback

### Manager Workflow

1. View knowledge graph
2. Identify gaps in coverage
3. Check document statistics
4. Review popular content
5. Assign content creation
6. Track completion

## File Checklist

Created files in your project:

```
hosting/
├── lib/
│   ├── markdownParser.ts         ✓ Created
│   └── knowledgeBaseService.ts   ✓ Created
├── types/
│   └── knowledgeBase.ts          ✓ Created
├── components/
│   ├── MetadataEditor.tsx        ✓ Created
│   ├── KnowledgeGraphVisualization.tsx ✓ Created
│   └── KnowledgeBaseManager.tsx  ✓ Created
├── KNOWLEDGE_BASE_METHODOLOGY.md ✓ Created
├── INTEGRATION_EXAMPLE.tsx       ✓ Created
└── KNOWLEDGE_BASE_QUICKSTART.md  ✓ Created (this file)
```

## Getting Help

For questions or issues with this implementation:

1. Review the methodology document for comprehensive explanations
2. Check integration examples for common patterns
3. Examine inline code comments for implementation details
4. Test with the provided sample document

---

**Ready to go!** 🚀

Start by uploading your first markdown document to see the system in action.

**Version**: 1.0
**Created**: 2025-01-09
**Last Updated**: 2025-01-09
