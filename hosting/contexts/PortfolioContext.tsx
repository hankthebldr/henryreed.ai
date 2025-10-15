'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Portfolio,
  Project,
  PortfolioState,
  ProjectState,
  PortfolioActions,
  ProjectActions,
  CreatePortfolioFormData,
  UpdatePortfolioFormData,
  CreateProjectFormData,
  UpdateProjectFormData,
  PortfolioDashboard,
  ProjectDashboard,
  PortfolioFilters,
  ProjectFilters,
  ProjectMilestone,
} from '../types/portfolio';

// Mock data for development - will be replaced with Firestore/Cloud Functions
const MOCK_PORTFOLIOS: Portfolio[] = [
  {
    id: 'PORT-2024-001',
    name: 'Enterprise Security Initiatives',
    description: 'Strategic security projects for enterprise customers',
    ownerUserId: 'user1',
    ownerUserEmail: 'user1@company.com',
    tenantId: 'tenant-1',
    status: 'active',
    createdDate: '2024-01-01T00:00:00Z',
    updatedDate: '2024-01-15T00:00:00Z',
    tags: ['enterprise', 'security', 'strategic'],
    budget: {
      allocated: 500000,
      spent: 125000,
      currency: 'USD',
      fiscalYear: '2024',
    },
    kpis: [
      { name: 'POV Success Rate', target: 80, actual: 75, unit: '%', trend: 'up' },
      { name: 'Customer Satisfaction', target: 90, actual: 88, unit: '%', trend: 'stable' },
    ],
    projectCount: 3,
    trrCount: 24,
    completionRate: 65,
  },
];

const MOCK_PROJECTS: Project[] = [
  {
    id: 'PROJ-2024-001',
    name: 'Acme Corp - Multi-Cloud Security',
    description: 'Comprehensive security assessment across AWS, Azure, and GCP',
    portfolioId: 'PORT-2024-001',
    tenantId: 'tenant-1',
    leadUserId: 'user1',
    leadUserEmail: 'user1@company.com',
    status: 'active',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-03-15T00:00:00Z',
    createdDate: '2024-01-10T00:00:00Z',
    updatedDate: '2024-01-20T00:00:00Z',
    customer: 'Acme Corp',
    customerContact: 'john.doe@acmecorp.com',
    tags: ['multi-cloud', 'POV', 'financial-services'],
    budget: {
      allocated: 150000,
      spent: 45000,
      currency: 'USD',
    },
    milestones: [
      {
        id: 'MS-001',
        name: 'Discovery Complete',
        description: 'Complete initial discovery and scoping',
        targetDate: '2024-01-22T00:00:00Z',
        actualDate: '2024-01-22T00:00:00Z',
        status: 'completed',
        dependentTRRIds: ['TRR-2024-001', 'TRR-2024-002'],
        completedTRRIds: ['TRR-2024-001', 'TRR-2024-002'],
        progress: 100,
      },
      {
        id: 'MS-002',
        name: 'Environment Setup',
        description: 'Configure cloud environments and integrations',
        targetDate: '2024-01-29T00:00:00Z',
        status: 'in-progress',
        dependentTRRIds: ['TRR-2024-003', 'TRR-2024-004'],
        completedTRRIds: ['TRR-2024-003'],
        progress: 50,
      },
      {
        id: 'MS-003',
        name: 'Validation Testing',
        description: 'Complete validation of all security scenarios',
        targetDate: '2024-02-26T00:00:00Z',
        status: 'pending',
        dependentTRRIds: ['TRR-2024-005', 'TRR-2024-006', 'TRR-2024-007'],
        completedTRRIds: [],
        progress: 0,
      },
    ],
    trrCount: 8,
    completedTRRCount: 3,
    progress: 37.5,
    health: 'on-track',
  },
];

// Context types
interface PortfolioContextType {
  portfolioState: PortfolioState;
  projectState: ProjectState;
  portfolioActions: PortfolioActions;
  projectActions: ProjectActions;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Portfolio state
  const [portfolioState, setPortfolioState] = useState<PortfolioState>({
    portfolios: [],
    selectedPortfolio: undefined,
    filters: {},
    isLoading: false,
    error: undefined,
  });

  // Project state
  const [projectState, setProjectState] = useState<ProjectState>({
    projects: [],
    selectedProject: undefined,
    filters: {},
    isLoading: false,
    error: undefined,
  });

  // Load initial data
  useEffect(() => {
    setPortfolioState((prev) => ({ ...prev, portfolios: MOCK_PORTFOLIOS }));
    setProjectState((prev) => ({ ...prev, projects: MOCK_PROJECTS }));
  }, []);

  // Portfolio Actions
  const portfolioActions: PortfolioActions = {
    createPortfolio: useCallback(async (data: CreatePortfolioFormData): Promise<Portfolio> => {
      // TODO: Replace with Cloud Functions API call
      const newPortfolio: Portfolio = {
        id: `PORT-${Date.now()}`,
        name: data.name,
        description: data.description,
        ownerUserId: 'current-user-id', // TODO: Get from auth context
        ownerUserEmail: 'current-user@company.com', // TODO: Get from auth context
        tenantId: 'current-tenant-id', // TODO: Get from auth context
        status: data.status || 'active',
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        tags: data.tags || [],
        budget: data.budget ? {
          allocated: data.budget.allocated,
          spent: 0,
          currency: data.budget.currency,
          fiscalYear: data.budget.fiscalYear,
        } : undefined,
        kpis: data.kpis?.map((kpi) => ({
          name: kpi.name,
          target: kpi.target,
          actual: 0,
          unit: kpi.unit,
        })) || [],
        projectCount: 0,
        trrCount: 0,
        completionRate: 0,
      };

      setPortfolioState((prev) => ({
        ...prev,
        portfolios: [...prev.portfolios, newPortfolio],
      }));

      return newPortfolio;
    }, []),

    updatePortfolio: useCallback(async (id: string, data: UpdatePortfolioFormData): Promise<Portfolio> => {
      // TODO: Replace with Cloud Functions API call
      const updatedPortfolio = portfolioState.portfolios.find((p) => p.id === id);
      if (!updatedPortfolio) {
        throw new Error(`Portfolio ${id} not found`);
      }

      const updated: Portfolio = {
        ...updatedPortfolio,
        ...data,
        // Merge budget properly to preserve 'spent' field
        budget: data.budget ? {
          ...updatedPortfolio.budget,
          ...data.budget,
          spent: updatedPortfolio.budget?.spent || 0,
        } : updatedPortfolio.budget,
        // Merge KPIs properly to preserve 'actual' and other fields
        kpis: data.kpis ? data.kpis.map((kpi, index) => ({
          name: kpi.name,
          target: kpi.target,
          actual: updatedPortfolio.kpis?.[index]?.actual || 0,
          unit: kpi.unit,
          trend: updatedPortfolio.kpis?.[index]?.trend,
        })) : updatedPortfolio.kpis,
        updatedDate: new Date().toISOString(),
      };

      setPortfolioState((prev) => ({
        ...prev,
        portfolios: prev.portfolios.map((p) => (p.id === id ? updated : p)),
      }));

      return updated;
    }, [portfolioState.portfolios]),

    deletePortfolio: useCallback(async (id: string): Promise<void> => {
      // TODO: Replace with Cloud Functions API call
      // TODO: Add confirmation dialog
      // TODO: Check if portfolio has projects - prevent deletion if not empty

      setPortfolioState((prev) => ({
        ...prev,
        portfolios: prev.portfolios.filter((p) => p.id !== id),
        selectedPortfolio: prev.selectedPortfolio?.id === id ? undefined : prev.selectedPortfolio,
      }));
    }, []),

    getPortfolio: useCallback(async (id: string): Promise<Portfolio> => {
      // TODO: Replace with Cloud Functions API call
      const portfolio = portfolioState.portfolios.find((p) => p.id === id);
      if (!portfolio) {
        throw new Error(`Portfolio ${id} not found`);
      }
      return portfolio;
    }, [portfolioState.portfolios]),

    listPortfolios: useCallback(async (filters?: PortfolioFilters): Promise<Portfolio[]> => {
      // TODO: Replace with Cloud Functions API call with proper filtering
      let filtered = [...portfolioState.portfolios];

      if (filters?.status) {
        filtered = filtered.filter((p) => filters.status?.includes(p.status));
      }

      if (filters?.ownerUserId) {
        filtered = filtered.filter((p) => filters.ownerUserId?.includes(p.ownerUserId));
      }

      if (filters?.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      // Sorting
      if (filters?.sortBy) {
        const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
        filtered.sort((a, b) => {
          const aVal = a[filters.sortBy!];
          const bVal = b[filters.sortBy!];
          if (aVal === undefined) return 1;
          if (bVal === undefined) return -1;
          return aVal > bVal ? sortOrder : -sortOrder;
        });
      }

      return filtered;
    }, [portfolioState.portfolios]),

    getPortfolioDashboard: useCallback(async (portfolioId: string): Promise<PortfolioDashboard> => {
      // TODO: Replace with Cloud Functions API call
      const portfolio = portfolioState.portfolios.find((p) => p.id === portfolioId);
      if (!portfolio) {
        throw new Error(`Portfolio ${portfolioId} not found`);
      }

      const projects = projectState.projects.filter((proj) => proj.portfolioId === portfolioId);

      const metrics = {
        totalProjects: projects.length,
        activeProjects: projects.filter((p) => p.status === 'active').length,
        completedProjects: projects.filter((p) => p.status === 'completed').length,
        totalTRRs: projects.reduce((sum, p) => sum + (p.trrCount || 0), 0),
        completedTRRs: projects.reduce((sum, p) => sum + (p.completedTRRCount || 0), 0),
        overallProgress: projects.reduce((sum, p) => sum + (p.progress || 0), 0) / (projects.length || 1),
        budgetUtilization: portfolio.budget
          ? (portfolio.budget.spent / portfolio.budget.allocated) * 100
          : 0,
        healthDistribution: {
          onTrack: projects.filter((p) => p.health === 'on-track').length,
          atRisk: projects.filter((p) => p.health === 'at-risk').length,
          delayed: projects.filter((p) => p.health === 'delayed').length,
          blocked: projects.filter((p) => p.health === 'blocked').length,
        },
      };

      return {
        portfolio,
        projects,
        metrics,
        recentActivity: [], // TODO: Implement activity tracking
        upcomingMilestones: [], // TODO: Aggregate milestones across projects
      };
    }, [portfolioState.portfolios, projectState.projects]),

    selectPortfolio: useCallback((portfolio?: Portfolio) => {
      setPortfolioState((prev) => ({ ...prev, selectedPortfolio: portfolio }));
    }, []),

    setFilters: useCallback((filters: PortfolioFilters) => {
      setPortfolioState((prev) => ({ ...prev, filters }));
    }, []),

    clearFilters: useCallback(() => {
      setPortfolioState((prev) => ({ ...prev, filters: {} }));
    }, []),
  };

  // Project Actions
  const projectActions: ProjectActions = {
    createProject: useCallback(async (data: CreateProjectFormData): Promise<Project> => {
      // TODO: Replace with Cloud Functions API call
      const newProject: Project = {
        id: `PROJ-${Date.now()}`,
        name: data.name,
        description: data.description,
        portfolioId: data.portfolioId,
        tenantId: 'current-tenant-id', // TODO: Get from auth context
        leadUserId: data.leadUserId,
        leadUserEmail: data.leadUserEmail,
        status: data.status || 'planning',
        startDate: data.startDate,
        endDate: data.endDate,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        teamIds: data.teamIds || [],
        tags: data.tags || [],
        customer: data.customer,
        customerContact: data.customerContact,
        budget: data.budget ? {
          ...data.budget,
          spent: 0,
        } : undefined,
        milestones: data.milestones?.map((ms, index) => ({
          id: `MS-${Date.now()}-${index}`,
          name: ms.name,
          description: ms.description,
          targetDate: ms.targetDate,
          status: 'pending' as const,
          dependentTRRIds: [],
          completedTRRIds: [],
          progress: 0,
        })) || [],
        trrCount: 0,
        completedTRRCount: 0,
        progress: 0,
        health: 'on-track',
      };

      setProjectState((prev) => ({
        ...prev,
        projects: [...prev.projects, newProject],
      }));

      return newProject;
    }, []),

    updateProject: useCallback(async (id: string, data: UpdateProjectFormData): Promise<Project> => {
      // TODO: Replace with Cloud Functions API call
      const existingProject = projectState.projects.find((p) => p.id === id);
      if (!existingProject) {
        throw new Error(`Project ${id} not found`);
      }

      const updated: Project = {
        ...existingProject,
        ...data,
        // Merge budget properly to preserve 'spent' field
        budget: data.budget ? {
          ...existingProject.budget,
          ...data.budget,
          spent: existingProject.budget?.spent || 0,
        } : existingProject.budget,
        // Preserve milestones - don't allow partial milestone updates here
        // Use addMilestone, updateMilestone, deleteMilestone for milestone management
        milestones: existingProject.milestones,
        updatedDate: new Date().toISOString(),
      };

      setProjectState((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => (p.id === id ? updated : p)),
      }));

      return updated;
    }, [projectState.projects]),

    deleteProject: useCallback(async (id: string): Promise<void> => {
      // TODO: Replace with Cloud Functions API call
      // TODO: Add confirmation dialog
      // TODO: Check if project has TRRs - prevent deletion if not empty

      setProjectState((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== id),
        selectedProject: prev.selectedProject?.id === id ? undefined : prev.selectedProject,
      }));
    }, []),

    getProject: useCallback(async (id: string): Promise<Project> => {
      // TODO: Replace with Cloud Functions API call
      const project = projectState.projects.find((p) => p.id === id);
      if (!project) {
        throw new Error(`Project ${id} not found`);
      }
      return project;
    }, [projectState.projects]),

    listProjects: useCallback(async (filters?: ProjectFilters): Promise<Project[]> => {
      // TODO: Replace with Cloud Functions API call with proper filtering
      let filtered = [...projectState.projects];

      if (filters?.portfolioId) {
        filtered = filtered.filter((p) => p.portfolioId === filters.portfolioId);
      }

      if (filters?.status) {
        filtered = filtered.filter((p) => filters.status?.includes(p.status));
      }

      if (filters?.leadUserId) {
        filtered = filtered.filter((p) => filters.leadUserId?.includes(p.leadUserId));
      }

      if (filters?.customer) {
        filtered = filtered.filter((p) => p.customer && filters.customer?.includes(p.customer));
      }

      if (filters?.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.customer?.toLowerCase().includes(query) ||
            p.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      // Sorting
      if (filters?.sortBy) {
        const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
        filtered.sort((a, b) => {
          const aVal = a[filters.sortBy!];
          const bVal = b[filters.sortBy!];
          if (aVal === undefined) return 1;
          if (bVal === undefined) return -1;
          return aVal > bVal ? sortOrder : -sortOrder;
        });
      }

      return filtered;
    }, [projectState.projects]),

    addMilestone: useCallback(async (projectId: string, milestone: Omit<ProjectMilestone, 'id'>): Promise<ProjectMilestone> => {
      // TODO: Replace with Cloud Functions API call
      const project = projectState.projects.find((p) => p.id === projectId);
      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      const newMilestone: ProjectMilestone = {
        ...milestone,
        id: `MS-${Date.now()}`,
      };

      const updatedProject: Project = {
        ...project,
        milestones: [...(project.milestones || []), newMilestone],
        updatedDate: new Date().toISOString(),
      };

      setProjectState((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => (p.id === projectId ? updatedProject : p)),
      }));

      return newMilestone;
    }, [projectState.projects]),

    updateMilestone: useCallback(async (projectId: string, milestoneId: string, data: Partial<ProjectMilestone>): Promise<ProjectMilestone> => {
      // TODO: Replace with Cloud Functions API call
      const project = projectState.projects.find((p) => p.id === projectId);
      if (!project || !project.milestones) {
        throw new Error(`Project ${projectId} or milestones not found`);
      }

      const milestoneIndex = project.milestones.findIndex((m) => m.id === milestoneId);
      if (milestoneIndex === -1) {
        throw new Error(`Milestone ${milestoneId} not found`);
      }

      const updatedMilestone: ProjectMilestone = {
        ...project.milestones[milestoneIndex],
        ...data,
      };

      const updatedMilestones = [...project.milestones];
      updatedMilestones[milestoneIndex] = updatedMilestone;

      const updatedProject: Project = {
        ...project,
        milestones: updatedMilestones,
        updatedDate: new Date().toISOString(),
      };

      setProjectState((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => (p.id === projectId ? updatedProject : p)),
      }));

      return updatedMilestone;
    }, [projectState.projects]),

    deleteMilestone: useCallback(async (projectId: string, milestoneId: string): Promise<void> => {
      // TODO: Replace with Cloud Functions API call
      const project = projectState.projects.find((p) => p.id === projectId);
      if (!project || !project.milestones) {
        throw new Error(`Project ${projectId} or milestones not found`);
      }

      const updatedProject: Project = {
        ...project,
        milestones: project.milestones.filter((m) => m.id !== milestoneId),
        updatedDate: new Date().toISOString(),
      };

      setProjectState((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => (p.id === projectId ? updatedProject : p)),
      }));
    }, [projectState.projects]),

    getProjectDashboard: useCallback(async (projectId: string): Promise<ProjectDashboard> => {
      // TODO: Replace with Cloud Functions API call
      const project = projectState.projects.find((p) => p.id === projectId);
      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      // TODO: Fetch actual TRRs from TRR context/API
      const trrs: ProjectDashboard['trrs'] = [];

      const metrics = {
        totalTRRs: project.trrCount || 0,
        completedTRRs: project.completedTRRCount || 0,
        pendingTRRs: (project.trrCount || 0) - (project.completedTRRCount || 0),
        overdueTRRs: 0, // TODO: Calculate from TRR data
        progress: project.progress || 0,
        health: project.health || 'on-track',
      };

      return {
        project,
        trrs,
        metrics,
        milestones: project.milestones || [],
        resourceAllocation: [], // TODO: Implement resource tracking
      };
    }, [projectState.projects]),

    selectProject: useCallback((project?: Project) => {
      setProjectState((prev) => ({ ...prev, selectedProject: project }));
    }, []),

    setFilters: useCallback((filters: ProjectFilters) => {
      setProjectState((prev) => ({ ...prev, filters }));
    }, []),

    clearFilters: useCallback(() => {
      setProjectState((prev) => ({ ...prev, filters: {} }));
    }, []),
  };

  const value: PortfolioContextType = {
    portfolioState,
    projectState,
    portfolioActions,
    projectActions,
  };

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};

// Custom hook for using portfolio context
export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
