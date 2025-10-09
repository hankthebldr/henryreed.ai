/**
 * Type definitions for Knowledge Base system
 */

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  relationships: DocumentRelationship[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DocumentMetadata {
  // Core metadata
  description?: string;
  category?: string;
  tags: string[];
  author?: string;

  // Auto-extracted metadata
  keywords: string[];
  topics: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedReadTime: number;

  // Custom fields defined by user
  customFields: Record<string, CustomFieldValue>;

  // System metadata
  version?: number;
  status?: 'draft' | 'published' | 'archived';
}

export interface CustomFieldValue {
  value: any;
  type: CustomFieldType;
  label: string;
}

export type CustomFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'url'
  | 'email';

export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: CustomFieldType;
  required?: boolean;
  options?: string[]; // For select/multiselect
  defaultValue?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    message?: string;
  };
}

export interface DocumentRelationship {
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  weight?: number; // Strength of relationship (0-1)
  metadata?: Record<string, any>;
}

export type RelationshipType =
  | 'references'        // Direct link/citation
  | 'related-by-tag'    // Shares tags
  | 'related-by-topic'  // Shares topics
  | 'prerequisite'      // Must be read before
  | 'follow-up'         // Continuation/next step
  | 'alternative'       // Alternative approach
  | 'parent-child'      // Hierarchical relationship
  | 'custom';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  metadata: DocumentMetadata;
  x?: number;
  y?: number;
  color?: string;
  size?: number;
}

export type NodeType =
  | 'document'
  | 'category'
  | 'tag'
  | 'topic'
  | 'author';

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  weight: number;
  color?: string;
  label?: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    totalDocuments: number;
    categories: string[];
    tags: string[];
    lastUpdated: Date;
  };
}

export interface SearchFilters {
  query?: string;
  categories?: string[];
  tags?: string[];
  complexity?: string[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  author?: string;
  customFilters?: Record<string, any>;
}

export interface SearchResult {
  document: KnowledgeDocument;
  score: number;
  highlights: string[];
  matchedFields: string[];
}

export interface ImportResult {
  success: boolean;
  documentId?: string;
  errors?: string[];
  warnings?: string[];
  suggestedMetadata?: Partial<DocumentMetadata>;
}
