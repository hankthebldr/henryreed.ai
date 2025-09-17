// TRR (Technical Requirements Review) Type Definitions

export type TRRStatus = 'draft' | 'pending' | 'in-progress' | 'validated' | 'failed' | 'not-applicable' | 'completed';
export type TRRPriority = 'critical' | 'high' | 'medium' | 'low';
export type TRRCategory = 'security' | 'performance' | 'compliance' | 'integration' | 'usability' | 'scalability' | 'reliability';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type SignoffType = 'technical' | 'business' | 'executive' | 'final';
export type ValidationMethod = 'manual' | 'automated' | 'hybrid' | 'peer-review' | 'compliance-check';

// Core TRR interface
export interface TRR {
  id: string;
  title: string;
  description: string;
  category: TRRCategory;
  priority: TRRPriority;
  status: TRRStatus;
  
  // Assignment and ownership
  assignedTo: string;
  assignedToEmail: string;
  customer: string;
  customerContact?: string;
  project?: string;
  scenario?: string;
  
  // Validation details
  validationMethod: ValidationMethod;
  expectedOutcome: string;
  actualOutcome?: string;
  acceptanceCriteria: string[];
  
  // Evidence and documentation
  evidence: TRREvidence[];
  attachments: TRRAttachment[];
  comments: TRRComment[];
  
  // Timeline
  createdDate: string;
  updatedDate: string;
  dueDate?: string;
  startDate?: string;
  completedDate?: string;
  
  // Effort estimation
  estimatedHours?: number;
  actualHours?: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  
  // Dependencies and relationships
  dependencies: string[]; // Array of TRR IDs that this depends on
  blockedBy: string[]; // Array of TRR IDs that block this
  relatedTRRs: string[]; // Array of related TRR IDs
  
  // Risk and business impact
  riskLevel: RiskLevel;
  businessImpact: string;
  technicalRisk: string;
  mitigationPlan?: string;
  
  // Compliance and governance
  complianceFrameworks: string[]; // e.g., ['SOC2', 'ISO27001', 'HIPAA']
  regulatoryRequirements: string[];
  
  // Validation tracking
  validationResults: TRRValidationResult[];
  testCases: TRRTestCase[];
  
  // Signoff and approval
  signoffs: TRRSignoff[];
  approvals: TRRApproval[];
  
  // Metadata
  tags: string[];
  customFields: Record<string, any>;
  archived: boolean;
  version: number;
  
  // Integration data
  externalIds?: Record<string, string>; // For integration with external systems
  
  // Workflow state
  workflowStage: string;
  nextActionRequired?: string;
  escalationDate?: string;
}

// Evidence tracking
export interface TRREvidence {
  id: string;
  type: 'screenshot' | 'log-file' | 'test-result' | 'document' | 'video' | 'configuration' | 'other';
  title: string;
  description: string;
  filePath?: string;
  url?: string;
  content?: string; // For inline content
  collectedBy: string;
  collectedDate: string;
  verifiedBy?: string;
  verifiedDate?: string;
  tags: string[];
}

// File attachments
export interface TRRAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedDate: string;
  description?: string;
  category: 'requirement' | 'specification' | 'test-data' | 'result' | 'documentation' | 'other';
}

// Comments and notes
export interface TRRComment {
  id: string;
  content: string;
  author: string;
  authorEmail: string;
  createdDate: string;
  updatedDate?: string;
  type: 'note' | 'question' | 'concern' | 'resolution' | 'escalation';
  isInternal: boolean; // Internal vs customer-facing
  parentCommentId?: string; // For threaded comments
  mentions: string[]; // Array of mentioned user emails
  reactions: TRRCommentReaction[];
}

export interface TRRCommentReaction {
  emoji: string;
  userId: string;
  createdDate: string;
}

// Validation results
export interface TRRValidationResult {
  id: string;
  testName: string;
  description: string;
  result: 'pass' | 'fail' | 'warning' | 'skipped' | 'not-applicable';
  executedBy: string;
  executedDate: string;
  details: string;
  metrics?: Record<string, number>;
  screenshots?: string[];
  logs?: string[];
}

// Test cases
export interface TRRTestCase {
  id: string;
  name: string;
  description: string;
  preconditions: string[];
  steps: TRRTestStep[];
  expectedResult: string;
  actualResult?: string;
  status: 'not-started' | 'in-progress' | 'passed' | 'failed' | 'blocked' | 'skipped';
  executedBy?: string;
  executedDate?: string;
  automatable: boolean;
  automationScript?: string;
}

export interface TRRTestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
  actualResult?: string;
  status?: 'pass' | 'fail' | 'warning' | 'skipped';
  notes?: string;
}

// Signoffs (blockchain-enabled)
export interface TRRSignoff {
  id: string;
  trrId: string;
  signoffType: SignoffType;
  signerName: string;
  signerEmail: string;
  signerRole: string;
  signoffDate: string;
  comments: string;
  conditions?: string[]; // Conditions under which signoff is given
  validUntil?: string; // Expiration date if applicable
  
  // Blockchain integration
  blockchainSignature?: BlockchainSignature;
  ipfsHash?: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  
  // Evidence and attachments for signoff
  supportingEvidence: string[];
  attachments: string[];
  
  // Compliance
  complianceFlags: string[];
  auditTrail: SignoffAuditEntry[];
}

export interface BlockchainSignature {
  hash: string;
  timestamp: string;
  blockNumber: string;
  transactionId: string;
  signerAddress: string;
  networkId: string;
  gasUsed?: string;
  signatureData: string;
  verificationKeys?: string[];
}

export interface SignoffAuditEntry {
  action: string;
  timestamp: string;
  userId: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

// Approvals (internal workflow)
export interface TRRApproval {
  id: string;
  trrId: string;
  approverName: string;
  approverEmail: string;
  approverRole: string;
  approvalDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'conditional';
  comments: string;
  conditions?: string[]; // Conditions that must be met
  rejectionReason?: string;
}

// Form data interfaces for TRR creation and editing
export interface CreateTRRFormData {
  title: string;
  description: string;
  category: TRRCategory;
  priority: TRRPriority;
  assignedTo: string;
  assignedToEmail: string;
  customer: string;
  customerContact?: string;
  project?: string;
  scenario?: string;
  validationMethod: ValidationMethod;
  expectedOutcome: string;
  acceptanceCriteria: string[];
  dueDate?: string;
  estimatedHours?: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  riskLevel: RiskLevel;
  businessImpact: string;
  technicalRisk: string;
  complianceFrameworks: string[];
  tags: string[];
}

export interface UpdateTRRFormData extends Partial<CreateTRRFormData> {
  actualOutcome?: string;
  actualHours?: number;
  mitigationPlan?: string;
  status?: TRRStatus;
  completedDate?: string;
}

// Filter and search interfaces
export interface TRRFilters {
  status?: TRRStatus[];
  category?: TRRCategory[];
  priority?: TRRPriority[];
  assignedTo?: string[];
  customer?: string[];
  riskLevel?: RiskLevel[];
  dueDate?: {
    from?: string;
    to?: string;
  };
  tags?: string[];
  searchQuery?: string;
  sortBy?: 'createdDate' | 'updatedDate' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
  currentPage?: number;
}

// Bulk operations
export interface TRRBulkOperation {
  operation: 'update' | 'delete' | 'assign' | 'add-tag' | 'remove-tag' | 'change-status' | 'export';
  trrIds: string[];
  parameters?: Record<string, any>;
  performedBy: string;
  performedDate: string;
  results: BulkOperationResult[];
}

export interface BulkOperationResult {
  trrId: string;
  success: boolean;
  error?: string;
  changes?: Record<string, any>;
}

// Dashboard and analytics
export interface TRRDashboardMetrics {
  totalTRRs: number;
  byStatus: Record<TRRStatus, number>;
  byPriority: Record<TRRPriority, number>;
  byCategory: Record<TRRCategory, number>;
  byAssignee: Record<string, number>;
  overdueCount: number;
  completionRate: number;
  averageCompletionTime: number; // in hours
  riskDistribution: Record<RiskLevel, number>;
  recentActivity: TRRActivity[];
  trendsData: TRRTrendData[];
}

export interface TRRActivity {
  id: string;
  trrId: string;
  trrTitle: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

export interface TRRTrendData {
  date: string;
  created: number;
  completed: number;
  validated: number;
}

// Import/Export interfaces
export interface TRRImportResult {
  successful: number;
  failed: number;
  warnings: number;
  errors: TRRImportError[];
  createdTRRs: string[];
  updatedTRRs: string[];
}

export interface TRRImportError {
  row: number;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
  data?: any;
}

export interface TRRExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  filters?: TRRFilters;
  includeComments?: boolean;
  includeEvidence?: boolean;
  includeSignoffs?: boolean;
  templateType?: 'detailed' | 'summary' | 'compliance';
}

// Template interfaces for TRR creation
export interface TRRTemplate {
  id: string;
  name: string;
  description: string;
  category: TRRCategory;
  defaultPriority: TRRPriority;
  defaultComplexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  requiredFields: string[];
  defaultAcceptanceCriteria: string[];
  defaultTestCases: Partial<TRRTestCase>[];
  complianceFrameworks: string[];
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdDate: string;
  usageCount: number;
}

// Workflow and automation
export interface TRRWorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: TRRWorkflowTrigger;
  conditions: TRRWorkflowCondition[];
  actions: TRRWorkflowAction[];
  isActive: boolean;
  priority: number;
}

export interface TRRWorkflowTrigger {
  type: 'status-change' | 'assignment' | 'due-date' | 'comment-added' | 'escalation';
  parameters?: Record<string, any>;
}

export interface TRRWorkflowCondition {
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than' | 'in' | 'not-in';
  value: any;
}

export interface TRRWorkflowAction {
  type: 'send-notification' | 'assign-to' | 'add-comment' | 'change-status' | 'escalate' | 'create-subtask';
  parameters: Record<string, any>;
}

// Notification interfaces
export interface TRRNotification {
  id: string;
  trrId: string;
  type: 'assignment' | 'due-date' | 'status-change' | 'comment' | 'escalation' | 'approval-request';
  title: string;
  message: string;
  recipientEmail: string;
  createdDate: string;
  sentDate?: string;
  readDate?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

// Integration interfaces
export interface TRRIntegration {
  id: string;
  name: string;
  type: 'jira' | 'servicenow' | 'azure-devops' | 'github' | 'slack' | 'teams' | 'email' | 'webhook';
  configuration: Record<string, any>;
  isActive: boolean;
  syncDirection: 'pull' | 'push' | 'bidirectional';
  lastSync?: string;
  syncStatus: 'success' | 'error' | 'pending';
  fieldMappings: Record<string, string>;
}

// Utility types for API responses
export interface TRRListResponse {
  trrs: TRR[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export interface TRRValidationResponse {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// State management interfaces
export interface TRRState {
  trrs: TRR[];
  filteredTRRs: TRR[];
  selectedTRRs: string[];
  currentTRR?: TRR;
  filters: TRRFilters;
  dashboardMetrics?: TRRDashboardMetrics;
  templates: TRRTemplate[];
  isLoading: boolean;
  error?: string;
  lastUpdated: string;
}

export interface TRRActions {
  // CRUD operations
  createTRR: (data: CreateTRRFormData) => Promise<TRR>;
  updateTRR: (id: string, data: UpdateTRRFormData) => Promise<TRR>;
  deleteTRR: (id: string) => Promise<void>;
  getTRR: (id: string) => Promise<TRR>;
  listTRRs: (filters?: TRRFilters) => Promise<TRRListResponse>;
  
  // Bulk operations
  bulkUpdate: (operation: TRRBulkOperation) => Promise<BulkOperationResult[]>;
  
  // Comments and evidence
  addComment: (trrId: string, comment: Omit<TRRComment, 'id' | 'createdDate'>) => Promise<TRRComment>;
  addEvidence: (trrId: string, evidence: Omit<TRREvidence, 'id' | 'collectedDate'>) => Promise<TRREvidence>;
  
  // Signoffs and approvals
  requestSignoff: (trrId: string, signoffType: SignoffType, recipientEmail: string) => Promise<void>;
  submitSignoff: (signoffData: Omit<TRRSignoff, 'id' | 'signoffDate'>) => Promise<TRRSignoff>;
  
  // Import/Export
  importTRRs: (file: File) => Promise<TRRImportResult>;
  exportTRRs: (options: TRRExportOptions) => Promise<Blob>;
  
  // Templates
  createFromTemplate: (templateId: string, overrides?: Partial<CreateTRRFormData>) => Promise<TRR>;
  saveAsTemplate: (trrId: string, templateData: Partial<TRRTemplate>) => Promise<TRRTemplate>;
  
  // Dashboard and metrics
  getDashboardMetrics: (filters?: TRRFilters) => Promise<TRRDashboardMetrics>;
  
  // State management
  setFilters: (filters: TRRFilters) => void;
  clearFilters: () => void;
  selectTRRs: (ids: string[]) => void;
  setCurrentTRR: (trr?: TRR) => void;
}