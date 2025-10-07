/**
 * Content Management Types for henryreed.ai
 * Enhanced schema for Unit42 integration and content optimization
 */

// Base content interface
export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  type: 'doc' | 'guide' | 'template' | 'playbook' | 'reference';
  category: string;
  tags: string[];
  summary: string;
  bodyPath?: string; // Path to full content file
  sourcePath: string; // Original file path
  author: string;
  publishedAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  relatedIds: string[]; // Related content items
  attribution?: string; // Attribution text if needed
  checksum: string; // For update detection
  searchable: boolean;
  metadata?: Record<string, any>;
}

// Unit42 threat intelligence content
export interface Unit42Article {
  id: string;
  title: string;
  slug: string;
  url: string; // Original Unit42 URL
  publishedAt: string;
  authors: string[];
  categories: string[];
  tags: string[];
  summary: string;
  bodyPath?: string; // Path to processed markdown
  rawPath: string; // Path to raw HTML/content
  iocs: {
    ips: string[];
    domains: string[];
    hashes: string[];
    urls: string[];
  };
  mitre: {
    tactics: string[];
    techniques: string[];
    groups?: string[];
  };
  attribution: string; // "Palo Alto Networks Unit 42"
  relatedTrrIds: string[]; // Associated TRRs
  severity?: 'low' | 'medium' | 'high' | 'critical';
  industry?: string[];
  threat_actors?: string[];
  malware_families?: string[];
  cve_ids?: string[];
  embedding?: number[]; // Vector embedding for semantic search
  ingestionDate: string;
  lastValidated: string;
}

// Generated reports reference
export interface ReportRef {
  id: string;
  ownerUid: string;
  trrId?: string;
  povId?: string;
  path: string; // Storage path
  format: 'pdf' | 'html' | 'json';
  checksum: string;
  createdAt: string;
  metadata: {
    title: string;
    template: string;
    includesUnit42: boolean;
    pageCount?: number;
    fileSize: number;
  };
}

// Knowledge base entries (for internal content)
export interface KBEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
  searchable: boolean;
}

// Analytics and metrics
export interface UserAnalytic {
  id: string; // Format: userId_date
  userId: string;
  date: string; // YYYY-MM-DD
  actions: {
    povCreated: number;
    trrCreated: number;
    unit42Viewed: number;
    unit42Searched: number;
    reportsGenerated: number;
    terminalCommands: number;
  };
  engagement: {
    sessionDuration: number; // minutes
    pagesViewed: number;
    featuresUsed: string[];
  };
}

export interface POVMetric {
  id: string; // povId
  povId: string;
  phase: 'planning' | 'execution' | 'validation' | 'completed';
  timeline: {
    started: string;
    estimated_completion: string;
    actual_completion?: string;
  };
  success_indicators: {
    technical_win: boolean;
    customer_satisfaction: number; // 1-5
    followup_opportunities: number;
  };
  unit42_references: number;
  attachments_count: number;
  stakeholders_count: number;
}

export interface ContentAnalytic {
  id: string; // contentId_date
  contentId: string;
  contentType: 'unit42' | 'internal' | 'knowledge_base';
  date: string;
  views: number;
  searches: number;
  attachments: number; // Times attached to TRR/POV
  avg_time_spent: number; // seconds
  user_ratings: number[]; // If implemented
}

// Search and filtering
export interface ContentSearchFilters {
  query?: string;
  type?: ContentItem['type'] | 'unit42';
  category?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  author?: string;
  source?: 'internal' | 'unit42';
  severity?: Unit42Article['severity'];
  industry?: string;
}

export interface ContentSearchResult {
  item: ContentItem | Unit42Article;
  score: number;
  matchedFields: string[];
  highlights: string[];
  type: 'content' | 'unit42';
}

// API responses
export interface ContentAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
  };
}

// Content creation/update payloads
export interface CreateContentItemPayload {
  title: string;
  type: ContentItem['type'];
  category: string;
  tags: string[];
  summary: string;
  content?: string;
  author: string;
  sourcePath?: string;
  metadata?: Record<string, any>;
}

export interface UpdateContentItemPayload extends Partial<CreateContentItemPayload> {
  id: string;
  status?: ContentItem['status'];
}

// Unit42 ingestion payloads
export interface Unit42FeedEntry {
  guid: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  content: string;
  authors: string[];
  categories: string[];
}

export interface ProcessedUnit42Article extends Omit<Unit42Article, 'id' | 'slug' | 'ingestionDate'> {
  feedGuid: string; // Original GUID from feed
}

// Error types
export class ContentError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ContentError';
  }
}

// Utility types
export type ContentType = ContentItem | Unit42Article | KBEntry;

export type ContentSource = 'internal' | 'unit42' | 'knowledge_base';

export interface ContentManagementState {
  loading: boolean;
  error?: string;
  items: ContentItem[];
  unit42Articles: Unit42Article[];
  searchResults: ContentSearchResult[];
  filters: ContentSearchFilters;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

// Configuration interfaces
export interface Unit42Config {
  enabled: boolean;
  feedUrl: string;
  ingestionSchedule: string; // cron expression
  maxArticlesPerBatch: number;
  retentionDays: number;
  vectorSearchEnabled: boolean;
}

export interface ContentConfig {
  maxFileSize: number; // bytes
  allowedFileTypes: string[];
  defaultCategory: string;
  autoTagging: boolean;
  searchIndexUpdateInterval: number; // minutes
}

// Firebase-specific types
export interface FirestoreContentItem extends Omit<ContentItem, 'checksum'> {
  _checksum: string; // Firestore doesn't allow fields starting with numbers
}

export interface FirestoreUnit42Article extends Omit<Unit42Article, 'embedding'> {
  _embedding?: number[]; // Optional vector field
}

// Export type guards
export const isContentItem = (item: any): item is ContentItem => {
  return item && typeof item.id === 'string' && typeof item.title === 'string' && item.type && item.sourcePath;
};

export const isUnit42Article = (item: any): item is Unit42Article => {
  return item && typeof item.id === 'string' && typeof item.url === 'string' && item.attribution?.includes('Unit 42');
};

export const isKBEntry = (item: any): item is KBEntry => {
  return item && typeof item.id === 'string' && typeof item.content === 'string' && item.searchable !== undefined;
};

// Constants
export const CONTENT_CATEGORIES = [
  'threat-intelligence',
  'pov-templates', 
  'trr-guides',
  'compliance',
  'incident-response',
  'detection-engineering',
  'customer-communication',
  'technical-documentation',
  'training-materials',
  'competitive-analysis'
] as const;

export const UNIT42_CATEGORIES = [
  'malware-analysis',
  'threat-actor-profiling', 
  'vulnerability-research',
  'incident-analysis',
  'campaign-tracking',
  'technique-analysis',
  'industry-reports',
  'security-advisories'
] as const;

export const CONTENT_TYPES = [
  'doc',
  'guide', 
  'template',
  'playbook',
  'reference'
] as const;

export type ContentCategory = typeof CONTENT_CATEGORIES[number];
export type Unit42Category = typeof UNIT42_CATEGORIES[number];
export type ContentTypeValue = typeof CONTENT_TYPES[number];