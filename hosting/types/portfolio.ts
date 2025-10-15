/**
 * Portfolio Type Definitions
 * Hierarchical domain models for Portfolio → Project → TRR structure
 */

export type PortfolioStatus = 'active' | 'planning' | 'on-hold' | 'completed' | 'archived';
export type ProjectStatus = 'active' | 'planning' | 'on-hold' | 'completed' | 'cancelled';
export type MilestoneStatus = 'pending' | 'in-progress' | 'completed' | 'delayed';

// Portfolio - Top-level organizational unit
export interface Portfolio {
  id: string;
  name: string;
  description: string;
  ownerUserId: string;
  ownerUserEmail: string;
  tenantId: string;
  createdDate: string;
  updatedDate: string;
  status: PortfolioStatus;

  // Optional metadata
  tags?: string[];
  budget?: PortfolioBudget;
  kpis?: PortfolioKPI[];

  // Computed fields
  projectCount?: number;
  trrCount?: number;
  completionRate?: number;
}

export interface PortfolioBudget {
  allocated: number;
  spent: number;
  currency: string;
  fiscalYear?: string;
}

export interface PortfolioKPI {
  name: string;
  target: number;
  actual: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
}

// Project - Mid-level organizational unit
export interface Project {
  id: string;
  name: string;
  description: string;
  portfolioId: string;
  tenantId: string;

  // Ownership and team
  leadUserId: string;
  leadUserEmail: string;
  teamIds?: string[];

  // Status and timeline
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  createdDate: string;
  updatedDate: string;

  // Optional metadata
  tags?: string[];
  budget?: ProjectBudget;
  milestones?: ProjectMilestone[];

  // Customer information (from POV integration)
  customer?: string;
  customerContact?: string;

  // Computed fields
  trrCount?: number;
  completedTRRCount?: number;
  progress?: number;
  health?: 'on-track' | 'at-risk' | 'delayed' | 'blocked';
}

export interface ProjectBudget {
  allocated: number;
  spent: number;
  currency: string;
  lastUpdated?: string;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  actualDate?: string;
  status: MilestoneStatus;
  dependentTRRIds: string[]; // TRR IDs that must be completed for this milestone
  completedTRRIds?: string[];
  progress?: number;
}

// Form data interfaces for creation and editing
export interface CreatePortfolioFormData {
  name: string;
  description: string;
  status?: PortfolioStatus;
  tags?: string[];
  budget?: {
    allocated: number;
    currency: string;
    fiscalYear?: string;
  };
  kpis?: {
    name: string;
    target: number;
    unit: string;
  }[];
}

export interface UpdatePortfolioFormData extends Partial<CreatePortfolioFormData> {
  status?: PortfolioStatus;
}

export interface CreateProjectFormData {
  name: string;
  description: string;
  portfolioId: string;
  leadUserId: string;
  leadUserEmail: string;
  startDate: string;
  endDate: string;
  status?: ProjectStatus;
  teamIds?: string[];
  tags?: string[];
  customer?: string;
  customerContact?: string;
  budget?: {
    allocated: number;
    currency: string;
  };
  milestones?: {
    name: string;
    description: string;
    targetDate: string;
  }[];
}

export interface UpdateProjectFormData extends Partial<CreateProjectFormData> {
  status?: ProjectStatus;
}

// Filter interfaces
export interface PortfolioFilters {
  status?: PortfolioStatus[];
  ownerUserId?: string[];
  tags?: string[];
  searchQuery?: string;
  sortBy?: 'name' | 'createdDate' | 'updatedDate' | 'completionRate';
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectFilters {
  portfolioId?: string;
  status?: ProjectStatus[];
  leadUserId?: string[];
  teamIds?: string[];
  customer?: string[];
  tags?: string[];
  dateRange?: {
    field: 'startDate' | 'endDate' | 'createdDate' | 'updatedDate';
    from?: string;
    to?: string;
  };
  searchQuery?: string;
  sortBy?: 'name' | 'startDate' | 'endDate' | 'progress' | 'health';
  sortOrder?: 'asc' | 'desc';
}

// Dashboard and analytics
export interface PortfolioDashboard {
  portfolio: Portfolio;
  projects: Project[];
  metrics: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTRRs: number;
    completedTRRs: number;
    overallProgress: number;
    budgetUtilization: number;
    healthDistribution: {
      onTrack: number;
      atRisk: number;
      delayed: number;
      blocked: number;
    };
  };
  recentActivity: ActivityEvent[];
  upcomingMilestones: MilestoneWithProject[];
}

export interface ProjectDashboard {
  project: Project;
  trrs: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    assignedTo: string;
    dueDate?: string;
    progress?: number;
  }>;
  metrics: {
    totalTRRs: number;
    completedTRRs: number;
    pendingTRRs: number;
    overdueTRRs: number;
    progress: number;
    health: 'on-track' | 'at-risk' | 'delayed' | 'blocked';
  };
  milestones: ProjectMilestone[];
  resourceAllocation?: {
    userId: string;
    userName: string;
    hoursAllocated: number;
    hoursUsed: number;
    utilizationRate: number;
  }[];
}

export interface ActivityEvent {
  id: string;
  type: 'portfolio' | 'project' | 'trr';
  entityId: string;
  entityName: string;
  action: 'created' | 'updated' | 'completed' | 'deleted' | 'status-changed';
  userId: string;
  userName: string;
  timestamp: string;
  description?: string;
}

export interface MilestoneWithProject extends ProjectMilestone {
  projectId: string;
  projectName: string;
  portfolioId: string;
  portfolioName: string;
}

// Breadcrumb navigation
export interface BreadcrumbItem {
  label: string;
  path?: string;
  type: 'portfolio' | 'project' | 'trr';
  id?: string;
  active?: boolean;
}

// State management
export interface PortfolioState {
  portfolios: Portfolio[];
  selectedPortfolio?: Portfolio;
  filters: PortfolioFilters;
  isLoading: boolean;
  error?: string;
}

export interface ProjectState {
  projects: Project[];
  selectedProject?: Project;
  filters: ProjectFilters;
  isLoading: boolean;
  error?: string;
}

// Actions
export interface PortfolioActions {
  // CRUD operations
  createPortfolio: (data: CreatePortfolioFormData) => Promise<Portfolio>;
  updatePortfolio: (id: string, data: UpdatePortfolioFormData) => Promise<Portfolio>;
  deletePortfolio: (id: string) => Promise<void>;
  getPortfolio: (id: string) => Promise<Portfolio>;
  listPortfolios: (filters?: PortfolioFilters) => Promise<Portfolio[]>;

  // Dashboard
  getPortfolioDashboard: (portfolioId: string) => Promise<PortfolioDashboard>;

  // State management
  selectPortfolio: (portfolio?: Portfolio) => void;
  setFilters: (filters: PortfolioFilters) => void;
  clearFilters: () => void;
}

export interface ProjectActions {
  // CRUD operations
  createProject: (data: CreateProjectFormData) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectFormData) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Promise<Project>;
  listProjects: (filters?: ProjectFilters) => Promise<Project[]>;

  // Milestone operations
  addMilestone: (projectId: string, milestone: Omit<ProjectMilestone, 'id'>) => Promise<ProjectMilestone>;
  updateMilestone: (projectId: string, milestoneId: string, data: Partial<ProjectMilestone>) => Promise<ProjectMilestone>;
  deleteMilestone: (projectId: string, milestoneId: string) => Promise<void>;

  // Dashboard
  getProjectDashboard: (projectId: string) => Promise<ProjectDashboard>;

  // State management
  selectProject: (project?: Project) => void;
  setFilters: (filters: ProjectFilters) => void;
  clearFilters: () => void;
}

// Utility types
export interface HierarchicalView {
  portfolio: Portfolio;
  projects: Array<{
    project: Project;
    trrCount: number;
    completionRate: number;
  }>;
}

export interface PortfolioTreeNode {
  id: string;
  name: string;
  type: 'portfolio' | 'project';
  children?: PortfolioTreeNode[];
  metadata?: {
    status: string;
    progress?: number;
    trrCount?: number;
  };
}
