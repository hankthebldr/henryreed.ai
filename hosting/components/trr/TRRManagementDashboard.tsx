'use client';

import React, { useState, useMemo, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { TRR, Project } from '../../types/trr';
import CortexButton from '../CortexButton';
import { PortfolioSidebar } from './PortfolioSidebar';
import { ProjectHeader } from './ProjectHeader';

// Dynamic imports for performance
const TRRDetailView = dynamic(() => import('./TRRDetailView'), { 
  loading: () => <div className="animate-pulse bg-cortex-bg-secondary h-96 rounded"></div> 
});
const TRRKanbanBoard = dynamic(() => import('./TRRKanbanBoard'), { 
  loading: () => <div className="animate-pulse bg-cortex-bg-secondary h-96 rounded"></div> 
});
const TRRGantt = dynamic(() => import('./TRRGantt'), { 
  loading: () => <div className="animate-pulse bg-cortex-bg-secondary h-96 rounded"></div> 
});
const DependencyMap = dynamic(() => import('./DependencyMap'), { 
  loading: () => <div className="animate-pulse bg-cortex-bg-secondary h-96 rounded"></div> 
});
const ResourcePlanner = dynamic(() => import('./ResourcePlanner'), { 
  loading: () => <div className="animate-pulse bg-cortex-bg-secondary h-96 rounded"></div> 
});

interface Portfolio {
  id: string;
  name: string;
  description: string;
  projects: Project[];
}

interface TRRManagementDashboardProps {
  initialPortfolios?: Portfolio[];
  initialTRRs?: TRR[];
  teamMembers?: Array<{ id: string; name: string; role: string; capacity: number; skills: string[]; }>;
  onTRRUpdate?: (trr: TRR) => Promise<void>;
  onTRRCreate?: (projectId: string, trr: Omit<TRR, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TRR>;
  onTRRDelete?: (trrId: string) => Promise<void>;
}

type ViewMode = 'overview' | 'kanban' | 'gantt' | 'dependencies' | 'resources' | 'trr-detail';

interface AppState {
  selectedPortfolioId: string | null;
  selectedProjectId: string | null;
  selectedTRRId: string | null;
  viewMode: ViewMode;
  sidebarCollapsed: boolean;
  searchQuery: string;
  filters: {
    status: string[];
    priority: string[];
    assignee: string[];
    tags: string[];
  };
}

export const TRRManagementDashboard: React.FC<TRRManagementDashboardProps> = ({
  initialPortfolios = [],
  initialTRRs = [],
  teamMembers = [],
  onTRRUpdate,
  onTRRCreate,
  onTRRDelete,
}) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>(initialPortfolios);
  const [trrs, setTRRs] = useState<TRR[]>(initialTRRs);
  const [appState, setAppState] = useState<AppState>({
    selectedPortfolioId: initialPortfolios[0]?.id || null,
    selectedProjectId: null,
    selectedTRRId: null,
    viewMode: 'overview',
    sidebarCollapsed: false,
    searchQuery: '',
    filters: {
      status: [],
      priority: [],
      assignee: [],
      tags: [],
    },
  });

  // Computed values
  const selectedPortfolio = useMemo(() => 
    portfolios.find(p => p.id === appState.selectedPortfolioId),
    [portfolios, appState.selectedPortfolioId]
  );

  const selectedProject = useMemo(() => 
    selectedPortfolio?.projects.find(p => p.id === appState.selectedProjectId),
    [selectedPortfolio, appState.selectedProjectId]
  );

  const selectedTRR = useMemo(() => 
    trrs.find(t => t.id === appState.selectedTRRId),
    [trrs, appState.selectedTRRId]
  );

  const filteredTRRs = useMemo(() => {
    let filtered = trrs;

    // Filter by project if selected
    if (appState.selectedProjectId) {
      filtered = filtered.filter(trr => trr.projectId === appState.selectedProjectId);
    } else if (appState.selectedPortfolioId) {
      const projectIds = selectedPortfolio?.projects.map(p => p.id) || [];
      filtered = filtered.filter(trr => projectIds.includes(trr.projectId));
    }

    // Apply search query
    if (appState.searchQuery.trim()) {
      const query = appState.searchQuery.toLowerCase();
      filtered = filtered.filter(trr => 
        trr.title.toLowerCase().includes(query) ||
        trr.description.toLowerCase().includes(query) ||
        trr.id.toLowerCase().includes(query) ||
        trr.assignedTo?.toLowerCase().includes(query) ||
        trr.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (appState.filters.status.length > 0) {
      filtered = filtered.filter(trr => appState.filters.status.includes(trr.status));
    }
    if (appState.filters.priority.length > 0) {
      filtered = filtered.filter(trr => appState.filters.priority.includes(trr.priority));
    }
    if (appState.filters.assignee.length > 0) {
      filtered = filtered.filter(trr => trr.assignedTo && appState.filters.assignee.includes(trr.assignedTo));
    }
    if (appState.filters.tags.length > 0) {
      filtered = filtered.filter(trr => 
        trr.tags?.some(tag => appState.filters.tags.includes(tag))
      );
    }

    return filtered;
  }, [trrs, appState, selectedPortfolio]);

  // Event handlers
  const updateAppState = useCallback((updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  }, []);

  const handlePortfolioSelect = useCallback((portfolioId: string) => {
    updateAppState({
      selectedPortfolioId: portfolioId,
      selectedProjectId: null,
      selectedTRRId: null,
      viewMode: 'overview',
    });
  }, [updateAppState]);

  const handleProjectSelect = useCallback((projectId: string) => {
    updateAppState({
      selectedProjectId: projectId,
      selectedTRRId: null,
      viewMode: 'overview',
    });
  }, [updateAppState]);

  const handleTRRSelect = useCallback((trrId: string) => {
    updateAppState({
      selectedTRRId: trrId,
      viewMode: 'trr-detail',
    });
  }, [updateAppState]);

  const handleTRRUpdate = useCallback(async (updatedTRR: TRR) => {
    try {
      if (onTRRUpdate) {
        await onTRRUpdate(updatedTRR);
      }
      setTRRs(prev => prev.map(trr => trr.id === updatedTRR.id ? updatedTRR : trr));
    } catch (error) {
      console.error('Failed to update TRR:', error);
      // TODO: Show error notification
    }
  }, [onTRRUpdate]);

  const handleTRRCreate = useCallback(async (trrData: Omit<TRR, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!appState.selectedProjectId) return;

    try {
      let newTRR: TRR;
      if (onTRRCreate) {
        newTRR = await onTRRCreate(appState.selectedProjectId, trrData);
      } else {
        // Fallback local creation
        newTRR = {
          ...trrData,
          id: `trr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          projectId: appState.selectedProjectId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      setTRRs(prev => [...prev, newTRR]);
      updateAppState({ selectedTRRId: newTRR.id, viewMode: 'trr-detail' });
    } catch (error) {
      console.error('Failed to create TRR:', error);
      // TODO: Show error notification
    }
  }, [appState.selectedProjectId, onTRRCreate, updateAppState]);

  const handleTRRDelete = useCallback(async (trrId: string) => {
    try {
      if (onTRRDelete) {
        await onTRRDelete(trrId);
      }
      setTRRs(prev => prev.filter(trr => trr.id !== trrId));
      if (appState.selectedTRRId === trrId) {
        updateAppState({ selectedTRRId: null, viewMode: 'overview' });
      }
    } catch (error) {
      console.error('Failed to delete TRR:', error);
      // TODO: Show error notification
    }
  }, [onTRRDelete, appState.selectedTRRId, updateAppState]);

  const handleSearch = useCallback((query: string) => {
    updateAppState({ searchQuery: query });
  }, [updateAppState]);

  const handleFilterChange = useCallback((filterType: keyof AppState['filters'], values: string[]) => {
    updateAppState({
      filters: { ...appState.filters, [filterType]: values }
    });
  }, [appState.filters, updateAppState]);

  const clearFilters = useCallback(() => {
    updateAppState({
      searchQuery: '',
      filters: { status: [], priority: [], assignee: [], tags: [] }
    });
  }, [updateAppState]);

  // Get available filter options
  const filterOptions = useMemo(() => {
    const statuses = Array.from(new Set(trrs.map(trr => trr.status)));
    const priorities = Array.from(new Set(trrs.map(trr => trr.priority)));
    const assignees = Array.from(new Set(trrs.map(trr => trr.assignedTo).filter(Boolean)));
    const tags = Array.from(new Set(trrs.flatMap(trr => trr.tags || [])));

    return { statuses, priorities, assignees, tags };
  }, [trrs]);

  const renderMainContent = () => {
    switch (appState.viewMode) {
      case 'trr-detail':
        if (!selectedTRR) return <div className="p-8 text-center text-cortex-text-muted">No TRR selected</div>;
        return (
          <Suspense fallback={<div className="animate-pulse bg-cortex-bg-secondary h-96 rounded"></div>}>
            <TRRDetailView
              trr={selectedTRR}
              onUpdate={handleTRRUpdate}
              onBack={() => updateAppState({ viewMode: 'overview', selectedTRRId: null })}
            />
          </Suspense>
        );

      case 'kanban':
        return (
          <Suspense fallback={<div className="animate-pulse bg-cortex-bg-secondary h-96 rounded"></div>}>
            <TRRKanbanBoard
              trrs={filteredTRRs}
              onTRRUpdate={handleTRRUpdate}
              onTRRClick={handleTRRSelect}
            />
          </Suspense>
        );

      case 'gantt':
        return (
          <Suspense fallback={<div className="animate-pulse bg-cortex-bg-secondary h-96 rounded"></div>}>
            <TRRGantt
              trrs={filteredTRRs}
              projects={selectedProject ? [selectedProject] : selectedPortfolio?.projects || []}
              onTRRUpdate={handleTRRUpdate}
              onTRRClick={handleTRRSelect}
            />
          </Suspense>
        );

      case 'dependencies':
        return (
          <Suspense fallback={<div className="animate-pulse bg-cortex-bg-secondary h-96 rounded"></div>}>
            <DependencyMap
              trrs={filteredTRRs}
              onNodeClick={handleTRRSelect}
              onDependencyAdd={(fromId, toId) => {
                const trr = trrs.find(t => t.id === toId);
                if (trr) {
                  const updatedTRR = {
                    ...trr,
                    dependencies: [...(trr.dependencies || []), fromId],
                    updatedAt: new Date(),
                  };
                  handleTRRUpdate(updatedTRR);
                }
              }}
              onDependencyRemove={(fromId, toId) => {
                const trr = trrs.find(t => t.id === toId);
                if (trr) {
                  const updatedTRR = {
                    ...trr,
                    dependencies: (trr.dependencies || []).filter(id => id !== fromId),
                    updatedAt: new Date(),
                  };
                  handleTRRUpdate(updatedTRR);
                }
              }}
            />
          </Suspense>
        );

      case 'resources':
        return (
          <Suspense fallback={<div className="animate-pulse bg-cortex-bg-secondary h-96 rounded"></div>}>
            <ResourcePlanner
              trrs={filteredTRRs}
              projects={selectedPortfolio?.projects || []}
              teamMembers={teamMembers}
              onReassignTRR={(trrId, assignee) => {
                const trr = trrs.find(t => t.id === trrId);
                if (trr) {
                  handleTRRUpdate({ ...trr, assignedTo: assignee, updatedAt: new Date() });
                }
              }}
            />
          </Suspense>
        );

      case 'overview':
      default:
        return (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="cortex-card p-6 text-center">
                <div className="text-2xl font-bold text-cortex-info">
                  {filteredTRRs.length}
                </div>
                <p className="text-sm text-cortex-text-muted">Total TRRs</p>
              </div>
              <div className="cortex-card p-6 text-center">
                <div className="text-2xl font-bold text-cortex-success">
                  {filteredTRRs.filter(t => t.status === 'completed' || t.status === 'validated').length}
                </div>
                <p className="text-sm text-cortex-text-muted">Completed</p>
              </div>
              <div className="cortex-card p-6 text-center">
                <div className="text-2xl font-bold text-cortex-warning">
                  {filteredTRRs.filter(t => t.status === 'in-progress').length}
                </div>
                <p className="text-sm text-cortex-text-muted">In Progress</p>
              </div>
              <div className="cortex-card p-6 text-center">
                <div className="text-2xl font-bold text-cortex-error">
                  {filteredTRRs.filter(t => t.status === 'blocked' || (
                    t.dependencies?.some(depId => {
                      const dep = trrs.find(d => d.id === depId);
                      return dep && dep.status !== 'completed' && dep.status !== 'validated';
                    })
                  )).length}
                </div>
                <p className="text-sm text-cortex-text-muted">Blocked</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="cortex-card p-6">
              <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <CortexButton
                  onClick={() => updateAppState({ viewMode: 'kanban' })}
                  variant="outline"
                  icon="📋"
                  className="justify-start"
                >
                  Kanban Board
                </CortexButton>
                <CortexButton
                  onClick={() => updateAppState({ viewMode: 'gantt' })}
                  variant="outline"
                  icon="📊"
                  className="justify-start"
                >
                  Gantt Chart
                </CortexButton>
                <CortexButton
                  onClick={() => updateAppState({ viewMode: 'dependencies' })}
                  variant="outline"
                  icon="🔗"
                  className="justify-start"
                >
                  Dependencies
                </CortexButton>
                <CortexButton
                  onClick={() => updateAppState({ viewMode: 'resources' })}
                  variant="outline"
                  icon="👥"
                  className="justify-start"
                >
                  Resources
                </CortexButton>
              </div>
            </div>

            {/* Recent TRRs */}
            <div className="cortex-card">
              <div className="p-4 border-b border-cortex-border-secondary">
                <h3 className="font-semibold text-cortex-text-primary">Recent TRRs</h3>
              </div>
              <div className="divide-y divide-cortex-border-secondary">
                {filteredTRRs
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 10)
                  .map(trr => (
                    <div 
                      key={trr.id} 
                      className="p-4 hover:bg-cortex-bg-hover cursor-pointer transition-colors"
                      onClick={() => handleTRRSelect(trr.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-cortex-text-primary">{trr.title}</h4>
                          <p className="text-sm text-cortex-text-secondary">
                            {selectedPortfolio?.projects.find(p => p.id === trr.projectId)?.name || 'Unknown Project'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            trr.status === 'completed' ? 'bg-cortex-success/20 text-cortex-success' :
                            trr.status === 'in-progress' ? 'bg-cortex-info/20 text-cortex-info' :
                            trr.status === 'pending' ? 'bg-cortex-warning/20 text-cortex-warning' :
                            'bg-cortex-bg-secondary text-cortex-text-muted'
                          }`}>
                            {trr.status.toUpperCase()}
                          </span>
                          <span className="text-sm text-cortex-text-muted">
                            {new Date(trr.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-cortex-bg-primary">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${appState.sidebarCollapsed ? 'w-16' : 'w-80'} border-r border-cortex-border-secondary bg-cortex-bg-secondary`}>
        <PortfolioSidebar
          portfolios={portfolios}
          selectedPortfolioId={appState.selectedPortfolioId}
          selectedProjectId={appState.selectedProjectId}
          onPortfolioSelect={handlePortfolioSelect}
          onProjectSelect={handleProjectSelect}
          collapsed={appState.sidebarCollapsed}
          onToggleCollapse={() => updateAppState({ sidebarCollapsed: !appState.sidebarCollapsed })}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-cortex-border-secondary bg-cortex-bg-secondary">
          <ProjectHeader
            project={selectedProject}
            portfolio={selectedPortfolio}
            viewMode={appState.viewMode}
            onViewModeChange={(mode) => updateAppState({ viewMode: mode })}
            searchQuery={appState.searchQuery}
            onSearch={handleSearch}
            filters={appState.filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            onCreateTRR={() => {
              if (appState.selectedProjectId) {
                handleTRRCreate({
                  title: 'New TRR',
                  description: '',
                  status: 'draft',
                  priority: 'medium',
                  projectId: appState.selectedProjectId,
                });
              }
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default TRRManagementDashboard;