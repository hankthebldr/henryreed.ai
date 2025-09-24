// Extended TRR Types for AI-enhanced multi-tenant TRR management
// This extends the existing hosting/types/trr.ts with additional capabilities

import { TRR } from './trr';

// Hierarchical domain models
export interface Portfolio {
  id: string;
  name: string;
  description: string;
  ownerUserId: string;
  tenantId: string;
  createdDate: string;
  updatedDate: string;
  tags?: string[];
  status?: 'active' | 'planning' | 'on-hold' | 'completed' | 'archived';
  budget?: {
    allocated: number;
    spent: number;
    currency: string;
  };
  kpis?: {
    name: string;
    target: number;
    actual: number;
    unit: string;
  }[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  portfolioId: string;
  tenantId: string;
  leadUserId: string;
  status: 'active' | 'planning' | 'on-hold' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  createdDate: string;
  updatedDate: string;
  teamIds?: string[];
  tags?: string[];
  budget?: {
    allocated: number;
    spent: number;
    currency: string;
  };
  milestones?: ProjectMilestone[];
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  actualDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  dependentTRRs: string[]; // TRR IDs that must be completed for this milestone
}

// Enhanced TRR requirements and test case structures
export interface TRRRequirement {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  testCases: TRRTestCase[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'functional' | 'non-functional' | 'security' | 'compliance' | 'performance';
  estimatedHours?: number;
  ownerUserId?: string;
  status: 'draft' | 'approved' | 'in-progress' | 'completed' | 'rejected';
  dependencies?: string[]; // Other requirement IDs
  tags?: string[];
}

export interface TRRTestCase {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  automated: boolean;
  automationScript?: string;
  status: 'not-started' | 'in-progress' | 'passed' | 'failed' | 'blocked' | 'skipped';
  executedBy?: string;
  executedDate?: string;
  defects?: TRRDefect[];
}

export interface TRRDefect {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'deferred';
  foundBy: string;
  assignedTo?: string;
  createdDate: string;
  resolvedDate?: string;
}

// Status and workflow tracking
export interface TRRStatusEvent {
  status: string;
  timestamp: string;
  authorUserId: string;
  note?: string;
  metadata?: Record<string, any>; // For custom workflow data
}

// DOR (Definition of Ready) enhancements
export interface DORStatus {
  isReady: boolean;
  score: number; // 0-100
  unmetCriteria: string[];
  lastChecked?: string;
  checkedBy?: string;
  autoChecks?: DORAutoCheck[];
}

export interface DORAutoCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  lastRun: string;
}

// SDW (Solution Design Walkthrough) enhancements
export interface SDWStatus {
  stage: 'planning' | 'design' | 'review' | 'implementation' | 'validation' | 'completed';
  approvals: SDWApproval[];
  nextApprover?: string;
  scheduledReviewDate?: string;
  actualReviewDate?: string;
  meetingNotes?: string[];
}

export interface SDWApproval {
  role: string;
  userId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs-revision';
  timestamp?: string;
  comments?: string;
  conditions?: string[]; // Conditions that must be met for approval
}

// Risk assessment enhancements
export interface RiskAssessment {
  likelihood: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  score: number; // Computed from likelihood × impact
  rationale: string;
  mitigationPlan?: string;
  contingencyPlan?: string;
  riskOwner?: string;
  reviewDate?: string;
  residualRisk?: {
    likelihood: 'low' | 'medium' | 'high' | 'critical';
    impact: 'low' | 'medium' | 'high' | 'critical';
    score: number;
  };
}

// AI prediction and assistance
export interface AIPrediction {
  predictedCompletionDate?: string;
  confidence: number; // 0.0 to 1.0
  rationale: string;
  riskFactors?: string[];
  recommendedActions?: string[];
  modelVersion?: string;
  generatedDate: string;
  lastUpdated: string;
}

export interface AIInsight {
  type: 'recommendation' | 'warning' | 'optimization' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  actionItems?: string[];
  relatedTRRs?: string[];
  dismissible: boolean;
  dismissed?: boolean;
  createdDate: string;
}

// Multi-tenant and user management
export interface TenantUser {
  id: string;
  email: string;
  name: string;
  role: TenantRole;
  permissions: Permission[];
  tenantIds: string[];
  lastLogin?: string;
  createdDate: string;
  isActive: boolean;
  preferences?: UserPreferences;
}

export interface TenantRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  tenantId: string;
}

export interface Permission {
  resource: string; // e.g., 'trr', 'project', 'portfolio'
  actions: string[]; // e.g., 'create', 'read', 'update', 'delete', 'approve'
  conditions?: Record<string, any>; // e.g., { assignedTo: 'self' }
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  timeZone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    browser: boolean;
    slack?: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  dashboardLayout?: Record<string, any>;
  defaultFilters?: Record<string, any>;
}

// Analytics and reporting
export interface TRRAnalytics {
  totalTRRs: number;
  completionRate: number;
  averageCompletionTime: number; // in days
  velocityTrend: VelocityDataPoint[];
  riskDistribution: Record<string, number>;
  defectMetrics: DefectMetrics;
  predictiveMetrics: PredictiveMetrics;
  complianceMetrics: ComplianceMetrics;
}

export interface VelocityDataPoint {
  period: string; // ISO date string
  trrCompleted: number;
  hoursCompleted: number;
  defectsFound: number;
  defectsResolved: number;
}

export interface DefectMetrics {
  totalDefects: number;
  openDefects: number;
  defectsByCategory: Record<string, number>;
  defectsBySeverity: Record<string, number>;
  averageResolutionTime: number; // in days
  defectDensity: number; // defects per TRR
}

export interface PredictiveMetrics {
  accuracyScore: number; // How accurate past predictions were
  confidenceAverage: number;
  onTimeDeliveryPrediction: number; // Percentage
  riskEscalationProbability: number;
}

export interface ComplianceMetrics {
  frameworkCoverage: Record<string, number>; // Framework -> percentage covered
  auditReadiness: number; // 0-100 score
  controlValidation: Record<string, 'pass' | 'fail' | 'partial'>;
  lastAuditDate?: string;
  nextAuditDate?: string;
}

// Timeline and dependencies
export interface TimelineEvent {
  id: string;
  trrId?: string;
  projectId?: string;
  type: 'created' | 'status-change' | 'milestone' | 'deadline' | 'review' | 'signoff';
  title: string;
  description?: string;
  date: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  relatedEvents?: string[]; // Other event IDs
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  criticalPath?: string[]; // Node IDs on critical path
  analysis: {
    totalDuration: number;
    criticalPathLength: number;
    parallelizationOpportunities: number;
    riskNodes: string[]; // Node IDs with high risk
  };
}

export interface DependencyNode {
  id: string;
  trrId?: string;
  projectId?: string;
  type: 'trr' | 'milestone' | 'external-dependency';
  title: string;
  status: string;
  estimatedDuration: number;
  actualDuration?: number;
  startDate?: string;
  endDate?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface DependencyEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: 'blocks' | 'enables' | 'informs';
  description?: string;
  lag?: number; // Days of lag between dependencies
}

// Resource planning and allocation
export interface ResourcePlan {
  id: string;
  projectId: string;
  name: string;
  description: string;
  resources: ResourceAllocation[];
  totalHours: number;
  totalCost?: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'approved' | 'active' | 'completed';
}

export interface ResourceAllocation {
  userId: string;
  role: string;
  hoursAllocated: number;
  hoursUsed: number;
  startDate: string;
  endDate: string;
  trrIds: string[]; // TRRs this person is working on
  utilizationRate: number; // 0.0 to 1.0
  skillMatch: number; // 0.0 to 1.0, how well skills match requirements
}

export interface SkillProfile {
  userId: string;
  skills: Skill[];
  certifications: Certification[];
  experience: ExperienceArea[];
  availability: AvailabilityWindow[];
  lastUpdated: string;
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience: number;
  verified: boolean;
  verifiedBy?: string;
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  verificationUrl?: string;
}

export interface ExperienceArea {
  domain: string; // e.g., 'cloud-security', 'compliance', 'integration'
  yearsExperience: number;
  recentProjects: string[]; // Project IDs
}

export interface AvailabilityWindow {
  startDate: string;
  endDate: string;
  hoursPerWeek: number;
  timezone: string;
  constraints?: string[]; // e.g., 'no-weekends', 'core-hours-only'
}

// Workflow automation
export interface WorkflowAutomation {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  isActive: boolean;
  tenantId: string;
  createdBy: string;
  lastExecuted?: string;
  executionCount: number;
}

export interface WorkflowTrigger {
  type: 'status-change' | 'date-based' | 'field-change' | 'external-event';
  parameters: Record<string, any>;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than' | 'in' | 'not-in';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface WorkflowAction {
  type: 'send-notification' | 'assign-user' | 'update-field' | 'create-task' | 'call-api' | 'run-ai-analysis';
  parameters: Record<string, any>;
  retryPolicy?: {
    maxRetries: number;
    delayBetweenRetries: number; // seconds
  };
}

// Notification system
export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  trigger: NotificationTrigger;
  channels: NotificationChannel[];
  recipients: NotificationRecipient[];
  template: NotificationTemplate;
  isActive: boolean;
  tenantId: string;
}

export interface NotificationTrigger {
  event: 'trr-created' | 'status-changed' | 'due-date-approaching' | 'risk-escalated' | 'approval-needed';
  conditions?: WorkflowCondition[];
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'browser';
  configuration: Record<string, any>;
}

export interface NotificationRecipient {
  type: 'user' | 'role' | 'team' | 'external';
  identifier: string;
  conditions?: WorkflowCondition[];
}

export interface NotificationTemplate {
  subject: string;
  body: string;
  format: 'text' | 'html' | 'markdown';
  variables: string[]; // Available template variables
}

// Extended API and state management
export interface ExtendedTRRActions {
  // AI-powered actions
  suggestFields: (data: Partial<any>) => Promise<Record<string, any>>;
  generateArtifacts: (trrId: string) => Promise<{
    acceptanceCriteria: string[];
    testCases: TRRTestCase[];
    riskAssessment: RiskAssessment;
  }>;
  analyzeRisk: (trrId: string) => Promise<RiskAssessment>;
  predictTimeline: (trrId: string) => Promise<AIPrediction>;
  getAIInsights: (trrId?: string) => Promise<AIInsight[]>;

  // DOR/SDW actions
  computeDOR: (trrId: string) => Promise<DORStatus>;
  computeSDW: (trrId: string) => Promise<SDWStatus>;
  updateSDWApproval: (trrId: string, approval: SDWApproval) => Promise<void>;

  // Resource and planning actions
  allocateResources: (params: {
    projectId: string;
    requirements: ResourceAllocation[];
  }) => Promise<ResourcePlan>;
  optimizeSchedule: (projectId: string) => Promise<DependencyGraph>;
  
  // Analytics actions
  getAnalytics: (filters?: any) => Promise<TRRAnalytics>;
  generateReport: (options: {
    type: 'executive' | 'detailed' | 'compliance';
    format: 'pdf' | 'html' | 'csv';
    filters?: any;
  }) => Promise<Blob>;

  // Workflow actions
  executeWorkflow: (workflowId: string, context: any) => Promise<void>;
  scheduleNotification: (ruleId: string, trrId: string) => Promise<void>;
}

// Integration with external systems
export interface ExternalIntegration {
  id: string;
  name: string;
  type: 'jira' | 'servicenow' | 'azure-devops' | 'github' | 'slack' | 'teams' | 'custom';
  configuration: IntegrationConfiguration;
  fieldMappings: FieldMapping[];
  syncConfiguration: SyncConfiguration;
  isActive: boolean;
  tenantId: string;
  lastSync?: string;
  syncStatus: 'success' | 'error' | 'pending' | 'disabled';
  syncErrors?: string[];
}

export interface IntegrationConfiguration {
  baseUrl: string;
  authentication: {
    type: 'api-key' | 'oauth' | 'basic' | 'bearer';
    credentials: Record<string, string>; // Encrypted
  };
  customHeaders?: Record<string, string>;
  rateLimits?: {
    requestsPerMinute: number;
    burstSize: number;
  };
}

export interface FieldMapping {
  localField: string;
  externalField: string;
  direction: 'push' | 'pull' | 'bidirectional';
  transformation?: {
    type: 'direct' | 'lookup' | 'formula' | 'custom';
    parameters?: Record<string, any>;
  };
}

export interface SyncConfiguration {
  schedule: 'manual' | 'hourly' | 'daily' | 'weekly';
  triggers: string[]; // Events that trigger sync
  filters: Record<string, any>; // Only sync items matching filters
  conflictResolution: 'local-wins' | 'remote-wins' | 'manual' | 'timestamp';
}

// Search and filtering enhancements
export interface AdvancedFilter {
  id?: string;
  name?: string;
  isDefault?: boolean;
  userId?: string;
  tenantId: string;
  filters: {
    text?: string;
    status?: string[];
    priority?: string[];
    assignedTo?: string[];
    customer?: string[];
    project?: string[];
    riskLevel?: string[];
    tags?: string[];
    dateRange?: {
      field: 'createdDate' | 'dueDate' | 'updatedDate' | 'completedDate';
      start?: string;
      end?: string;
    };
    customFields?: Record<string, any>;
  };
  sorting: {
    field: string;
    direction: 'asc' | 'desc';
  };
  grouping?: {
    field: string;
    showCounts: boolean;
  };
}

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  facets?: Record<string, { value: string; count: number }[]>;
  suggestions?: string[];
  executionTime: number;
  filters: AdvancedFilter;
}

// Audit and compliance tracking
export interface AuditEvent {
  id: string;
  tenantId: string;
  entityType: 'trr' | 'project' | 'portfolio' | 'user';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'approve' | 'reject' | 'assign';
  userId: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  changes?: FieldChange[];
  metadata?: Record<string, any>;
}

export interface FieldChange {
  field: string;
  oldValue?: any;
  newValue?: any;
  changeType: 'added' | 'removed' | 'modified';
}

export interface ComplianceReport {
  id: string;
  name: string;
  frameworks: string[];
  generatedDate: string;
  generatedBy: string;
  period: {
    start: string;
    end: string;
  };
  summary: ComplianceMetrics;
  findings: ComplianceFinding[];
  recommendations: string[];
  attachments?: string[];
}

export interface ComplianceFinding {
  id: string;
  framework: string;
  control: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'compliant' | 'non-compliant' | 'partially-compliant' | 'not-applicable';
  evidence?: string[];
  remediation?: string;
  dueDate?: string;
  assignedTo?: string;
}