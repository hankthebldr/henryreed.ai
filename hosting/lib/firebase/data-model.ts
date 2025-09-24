// Comprehensive data model and Firestore collection structure
// for the multi-tenant TRR Management System

import {
  TRRCategory,
  Priority,
  TRRStatus,
  TRRTestCase,
  RiskAssessment,
  TRRStatusEvent,
  DORStatus,
  SDWStatus,
  AIPrediction,
} from '../../types/trr-extended';

export interface FirestoreCollections {
  // Root collections
  users: UserProfile;
  organizations: Organization;
  
  // Hierarchical collections
  portfolios: Portfolio;
  projects: Project;
  trrs: TechnicalRequirementReview;
  
  // Support collections
  signoffs: BlockchainSignoff;
  activityLogs: ActivityLog;
  aiPredictions: AIPredictionRecord;
  config: SystemConfiguration;
  templates: TRRTemplate;
  notifications: UserNotification;
  analytics: AnalyticsData;
  fileMetadata: FileMetadata;
}

// ============================================================================
// Core Entity Types
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  
  // Multi-tenant associations
  organizations: {
    [orgId: string]: {
      role: UserRole;
      permissions: Permission[];
      joinedAt: string;
      isActive: boolean;
    };
  };
  
  // Preferences
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: NotificationPreferences;
    dashboard: DashboardPreferences;
    timezone: string;
  };
  
  // Metadata
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  
  // Ownership
  ownerId: string;
  
  // Configuration
  settings: {
    allowPublicTRRs: boolean;
    requireTwoFactorAuth: boolean;
    defaultTRRTemplate?: string;
    workflowSettings: WorkflowSettings;
    integrations: IntegrationSettings;
  };
  
  // Members (denormalized for quick access)
  memberCount: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  
  // Hierarchy
  organizationId: string;
  
  // Ownership and permissions
  ownerId: string;
  members: {
    [userId: string]: {
      role: 'viewer' | 'editor' | 'manager' | 'admin';
      addedAt: string;
      addedBy: string;
    };
  };
  
  // Classification
  tags: string[];
  category?: string;
  status: 'active' | 'archived' | 'planning';
  
  // Metrics (derived/cached)
  projectCount: number;
  trrCount: number;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  
  // Hierarchy
  organizationId: string;
  portfolioId: string;
  
  // Ownership and permissions
  leadUserId: string;
  members: {
    [userId: string]: {
      role: 'contributor' | 'reviewer' | 'lead' | 'admin';
      addedAt: string;
      addedBy: string;
    };
  };
  
  // Project details
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Timeline
  timeline: {
    startDate?: string;
    endDate?: string;
    milestones: ProjectMilestone[];
  };
  
  // Budget and resources
  budget?: {
    allocated: number;
    spent: number;
    currency: string;
  };
  
  // Classification
  tags: string[];
  category?: string;
  
  // Metrics (derived/cached)
  trrCount: number;
  completedTRRCount: number;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TRR and Related Types (Extended from trr-extended.ts)
// ============================================================================

export interface TechnicalRequirementReview {
  id: string;
  title: string;
  description: string;
  
  // Hierarchy
  organizationId: string;
  portfolioId: string;
  projectId: string;
  
  // Core fields
  category: TRRCategory;
  priority: Priority;
  status: TRRStatus;
  
  // Assignment
  createdBy: string;
  assignedTo?: string;
  reviewers: string[];
  watchers: string[];
  
  // Extended fields (from trr-extended.ts)
  acceptanceCriteria: string[];
  testCases: TRRTestCase[];
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  riskAssessment: RiskAssessment;
  
  // Technical details
  technicalApproach?: string;
  resourceRequirements: ResourceRequirement[];
  
  // Timeline
  timeline: {
    estimatedHours?: number;
    startDate?: string;
    dueDate?: string;
  };
  
  // Dependencies
  dependencies: string[]; // TRR IDs
  blockedBy: string[]; // TRR IDs (computed)
  
  // Status tracking
  statusHistory: TRRStatusEvent[];
  dorStatus: DORStatus;
  sdwStatus: SDWStatus;
  
  // AI enhancements
  aiPrediction?: AIPrediction;
  aiMetadata?: {
    lastSuggestionAt?: string;
    suggestionCount: number;
    acceptanceRate: number;
  };
  
  // Evidence and attachments
  attachments: TRRAttachment[];
  
  // Compliance and signoff
  signoffData?: {
    requiredSignoffs: string[]; // Role names
    completedSignoffs: CompletedSignoff[];
    blockchainSignoffs: string[]; // Signoff IDs
  };
  
  // External integrations
  externalIds: {
    scenarioId?: string;
    templateId?: string;
    jiraTicket?: string;
    githubIssue?: string;
  };
  
  // Classification
  tags: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

// ============================================================================
// Supporting Types
// ============================================================================

export interface ProjectMilestone {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'overdue';
  trrIds: string[];
}

export interface ResourceRequirement {
  type: 'person' | 'tool' | 'infrastructure' | 'budget';
  name: string;
  description?: string;
  quantity?: number;
  unit?: string;
  estimatedCost?: {
    amount: number;
    currency: string;
  };
  availability?: 'available' | 'limited' | 'unavailable';
}

export interface TRRAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  metadata?: Record<string, any>;
}

export interface CompletedSignoff {
  role: string;
  userId: string;
  signedAt: string;
  comments?: string;
  digitalSignature?: string;
}

export interface BlockchainSignoff {
  id: string;
  trrId: string;
  organizationId: string;
  
  // Blockchain data
  transactionHash: string;
  blockNumber: number;
  network: string;
  contractAddress?: string;
  
  // Signoff details
  signedBy: string;
  signoffData: {
    trrHash: string;
    timestamp: string;
    metadata: Record<string, any>;
  };
  
  // Validation
  isValid: boolean;
  validatedAt?: string;
  
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  
  // Context
  organizationId: string;
  userId: string;
  
  // Action details
  action: ActivityAction;
  entityType: 'trr' | 'project' | 'portfolio' | 'organization';
  entityId: string;
  
  // Data
  details: Record<string, any>;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AIPredictionRecord {
  id: string;
  
  // Context
  organizationId: string;
  trrId: string;
  
  // Prediction data
  type: 'completion' | 'risk' | 'effort' | 'priority';
  prediction: any;
  confidence: number;
  
  // Model info
  modelUsed: string;
  modelVersion?: string;
  
  // Feedback
  feedback?: {
    isAccurate: boolean;
    actualOutcome?: any;
    feedbackBy: string;
    feedbackAt: string;
  };
  
  createdAt: string;
  expiresAt?: string;
}

export interface SystemConfiguration {
  id: string;
  
  // Scope
  organizationId?: string; // Global if null
  
  // Configuration data
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  
  // Access control
  isPublic: boolean;
  editableBy: UserRole[];
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TRRTemplate {
  id: string;
  name: string;
  description?: string;
  
  // Scope
  organizationId?: string; // Global if null
  isPublic: boolean;
  
  // Template data
  template: Partial<TechnicalRequirementReview>;
  
  // Metadata
  createdBy: string;
  usageCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  organizationId: string;
  
  // Notification content
  type: NotificationType;
  title: string;
  message: string;
  
  // Related entities
  entityType?: 'trr' | 'project' | 'portfolio';
  entityId?: string;
  
  // State
  isRead: boolean;
  readAt?: string;
  
  // Actions
  actions?: NotificationAction[];
  
  // Delivery
  channels: ('app' | 'email' | 'slack')[];
  sentAt: string;
  
  createdAt: string;
}

export interface AnalyticsData {
  id: string;
  organizationId: string;
  
  // Time period
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: string; // ISO date string
  
  // Metrics
  metrics: {
    trrCreated: number;
    trrCompleted: number;
    trrInProgress: number;
    avgCycleTime: number;
    dorComplianceRate: number;
    sdwCompletionRate: number;
    
    // By category/priority
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    byAssignee: Record<string, number>;
  };
  
  // Trends
  trends: {
    completionTrend: number; // % change
    cycleTrend: number;
    volumeTrend: number;
  };
  
  createdAt: string;
}

export interface FileMetadata {
  id: string;
  
  // File info
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  
  // Storage
  path: string;
  bucket: string;
  
  // Access control
  organizationId: string;
  uploadedBy: string;
  sharedWith: string[];
  
  // Associations
  entityType?: 'trr' | 'project' | 'portfolio';
  entityId?: string;
  
  // Processing status
  status: 'uploading' | 'processing' | 'ready' | 'error';
  processingError?: string;
  
  // Metadata
  metadata: Record<string, any>;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Enums and Union Types
// ============================================================================

export type UserRole = 'viewer' | 'contributor' | 'editor' | 'manager' | 'admin' | 'owner';

export type Permission = 
  | 'read_trr'
  | 'write_trr' 
  | 'delete_trr'
  | 'manage_projects'
  | 'manage_portfolios'
  | 'manage_users'
  | 'export_data'
  | 'view_analytics'
  | 'manage_integrations'
  | 'blockchain_signoff';

export type ActivityAction = 
  | 'create'
  | 'update' 
  | 'delete'
  | 'view'
  | 'assign'
  | 'comment'
  | 'signoff'
  | 'export'
  | 'import'
  | 'ai_suggest';

export type NotificationType = 
  | 'trr_assigned'
  | 'trr_due_soon'
  | 'trr_overdue'
  | 'trr_blocked'
  | 'signoff_required'
  | 'review_requested'
  | 'comment_added'
  | 'status_changed'
  | 'ai_suggestion'
  | 'system_alert';

export interface NotificationAction {
  type: 'view' | 'approve' | 'reject' | 'comment' | 'assign';
  label: string;
  url?: string;
  payload?: Record<string, any>;
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    types: NotificationType[];
  };
  app: {
    enabled: boolean;
    types: NotificationType[];
  };
  slack?: {
    enabled: boolean;
    webhook?: string;
    types: NotificationType[];
  };
}

export interface DashboardPreferences {
  defaultView: 'list' | 'kanban' | 'timeline' | 'gantt' | 'analytics';
  defaultFilters: Record<string, any>;
  visibleColumns: string[];
  chartsConfig: Record<string, any>;
}

export interface WorkflowSettings {
  requireDOR: boolean;
  requireSDW: boolean;
  autoAssignReviewers: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'monthly';
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  condition: 'overdue' | 'blocked' | 'high_priority';
  threshold: number; // days or hours
  action: 'notify_manager' | 'reassign' | 'escalate_priority';
  recipients: string[];
}

export interface IntegrationSettings {
  jira?: {
    enabled: boolean;
    url: string;
    projectKey?: string;
  };
  github?: {
    enabled: boolean;
    repository?: string;
  };
  slack?: {
    enabled: boolean;
    webhook?: string;
  };
  calendar?: {
    enabled: boolean;
    calendarId?: string;
  };
}

// ============================================================================
// Firestore Path Helpers
// ============================================================================

export const COLLECTION_PATHS = {
  users: 'users',
  organizations: 'organizations',
  portfolios: 'portfolios',
  projects: 'projects',
  trrs: 'trrs',
  signoffs: 'signoffs',
  activityLogs: 'activityLogs',
  aiPredictions: 'aiPredictions',
  config: 'config',
  templates: 'templates',
  notifications: 'notifications',
  analytics: 'analytics',
  fileMetadata: 'fileMetadata',
  
  // Subcollections
  trrRequirements: (trrId: string) => `trrs/${trrId}/requirements`,
  trrTestCases: (trrId: string) => `trrs/${trrId}/testCases`,
  trrComments: (trrId: string) => `trrs/${trrId}/comments`,
  trrAttachments: (trrId: string) => `trrs/${trrId}/attachments`,
  organizationMembers: (orgId: string) => `organizations/${orgId}/members`,
} as const;

export const COLLECTION_GROUP_PATHS = {
  allTRRs: 'trrs',
  allRequirements: 'requirements',
  allTestCases: 'testCases',
  allComments: 'comments',
  allAttachments: 'attachments',
} as const;

// ============================================================================
// Firestore Index Requirements
// ============================================================================

export const REQUIRED_INDEXES = [
  // TRR queries
  { collection: 'trrs', fields: ['organizationId', 'status', 'priority'] },
  { collection: 'trrs', fields: ['organizationId', 'projectId', 'status'] },
  { collection: 'trrs', fields: ['organizationId', 'assignedTo', 'status'] },
  { collection: 'trrs', fields: ['organizationId', 'createdAt'] },
  { collection: 'trrs', fields: ['organizationId', 'dueDate', 'status'] },
  
  // Project queries
  { collection: 'projects', fields: ['organizationId', 'portfolioId', 'status'] },
  { collection: 'projects', fields: ['organizationId', 'leadUserId'] },
  
  // Portfolio queries
  { collection: 'portfolios', fields: ['organizationId', 'status'] },
  { collection: 'portfolios', fields: ['organizationId', 'ownerId'] },
  
  // Activity logs
  { collection: 'activityLogs', fields: ['organizationId', 'userId', 'timestamp'] },
  { collection: 'activityLogs', fields: ['organizationId', 'entityType', 'entityId'] },
  
  // Notifications
  { collection: 'notifications', fields: ['userId', 'isRead', 'createdAt'] },
  { collection: 'notifications', fields: ['organizationId', 'type', 'sentAt'] },
  
  // Analytics
  { collection: 'analytics', fields: ['organizationId', 'period', 'date'] },
] as const;

export default {
  COLLECTION_PATHS,
  COLLECTION_GROUP_PATHS,
  REQUIRED_INDEXES,
};