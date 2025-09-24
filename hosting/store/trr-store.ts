// Zustand store for TRR state management
// Real-time sync with Firestore, optimistic updates, and comprehensive state management

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  TechnicalRequirementReview,
  TRRFilters,
  CreateTRRFormData,
  TRRStatusEvent,
  RiskAssessment,
  DORStatus,
  SDWStatus,
  AIPrediction,
  TRRTestCase,
  TRRRequirement,
} from '../types/trr-extended';
import {
  Portfolio,
  Project,
  UserProfile,
  Organization,
} from '../lib/firebase/data-model';
import * as trrAPI from '../lib/api/trr';
import * as aiAssist from '../lib/ai/trr-assist';

// ============================================================================
// State Interfaces
// ============================================================================

export interface TRRState {
  // Core data
  trrs: Record<string, TechnicalRequirementReview>;
  portfolios: Record<string, Portfolio>;
  projects: Record<string, Project>;
  users: Record<string, UserProfile>;
  
  // Current selection/navigation
  currentOrganization: string | null;
  currentPortfolio: string | null;
  currentProject: string | null;
  currentTRR: string | null;
  
  // Filters and view state
  filters: TRRFilters;
  viewMode: 'list' | 'kanban' | 'timeline' | 'gantt' | 'analytics';
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // UI State
  loading: {
    trrs: boolean;
    creating: boolean;
    updating: boolean;
    ai: boolean;
  };
  errors: {
    [key: string]: string | null;
  };
  
  // Real-time subscriptions
  subscriptions: Record<string, (() => void)>;
  
  // Optimistic updates tracking
  optimisticUpdates: Record<string, {
    type: 'create' | 'update' | 'delete';
    data: any;
    timestamp: number;
  }>;
  
  // AI state
  aiSuggestions: Record<string, {
    data: any;
    confidence: number;
    timestamp: number;
  }>;
  
  // Analytics cache
  analytics: {
    dashboardData: any;
    lastUpdated: number | null;
  };
}

export interface TRRActions {
  // Navigation actions
  setCurrentOrganization: (orgId: string | null) => void;
  setCurrentPortfolio: (portfolioId: string | null) => void;
  setCurrentProject: (projectId: string | null) => void;
  setCurrentTRR: (trrId: string | null) => void;
  
  // Filter and view actions
  setFilters: (filters: Partial<TRRFilters>) => void;
  setViewMode: (mode: TRRState['viewMode']) => void;
  setSearchQuery: (query: string) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  
  // TRR CRUD operations
  createTRR: (formData: CreateTRRFormData) => Promise<TechnicalRequirementReview>;
  updateTRR: (trrId: string, updates: Partial<TechnicalRequirementReview>) => Promise<void>;
  deleteTRR: (trrId: string) => Promise<void>;
  getTRR: (trrId: string) => Promise<TechnicalRequirementReview | null>;
  
  // Bulk operations
  bulkUpdateTRRs: (trrIds: string[], updates: Partial<TechnicalRequirementReview>) => Promise<void>;
  
  // Real-time subscription management
  subscribeTo: (type: 'trrs' | 'trr', id?: string) => void;
  unsubscribeFrom: (type: 'trrs' | 'trr', id?: string) => void;
  unsubscribeAll: () => void;
  
  // AI assistance
  suggestFields: (data: Partial<CreateTRRFormData>) => Promise<aiAssist.AIFieldSuggestions>;
  generateArtifacts: (trrId: string) => Promise<aiAssist.AIArtifacts>;
  analyzeRisk: (trrId: string) => Promise<RiskAssessment>;
  predictTimeline: (trrId: string) => Promise<AIPrediction>;
  computeDOR: (trrId: string) => Promise<DORStatus>;
  computeSDW: (trrId: string) => Promise<SDWStatus>;
  
  // Comments and collaboration
  addComment: (trrId: string, content: string, mentions?: string[]) => Promise<void>;
  getComments: (trrId: string) => Promise<trrAPI.TRRComment[]>;
  
  // Requirements management
  addRequirement: (trrId: string, requirement: Omit<TRRRequirement, 'id'>) => Promise<void>;
  getRequirements: (trrId: string) => Promise<TRRRequirement[]>;
  
  // Export/import
  exportTRRs: (options: trrAPI.TRRExportOptions) => Promise<Blob>;
  createSignoff: (trrId: string, role: string, comments?: string) => Promise<void>;
  
  // Error handling
  setError: (key: string, error: string | null) => void;
  clearErrors: () => void;
  
  // Cache management
  invalidateCache: (type?: 'trrs' | 'analytics' | 'ai') => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useTRRStore = create<TRRState & TRRActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        trrs: {},
        portfolios: {},
        projects: {},
        users: {},
        currentOrganization: null,
        currentPortfolio: null,
        currentProject: null,
        currentTRR: null,
        filters: {
          status: [],
          priority: [],
          category: [],
          assignedTo: undefined,
          projectId: undefined,
          portfolioId: undefined,
          tags: [],
          dateRange: undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
        viewMode: 'list',
        searchQuery: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        loading: {
          trrs: false,
          creating: false,
          updating: false,
          ai: false,
        },
        errors: {},
        subscriptions: {},
        optimisticUpdates: {},
        aiSuggestions: {},
        analytics: {
          dashboardData: null,
          lastUpdated: null,
        },
        
        // ============================================================================
        // Navigation Actions
        // ============================================================================
        
        setCurrentOrganization: (orgId) =>
          set((state) => {
            state.currentOrganization = orgId;
            state.currentPortfolio = null;
            state.currentProject = null;
            state.currentTRR = null;
          }),
        
        setCurrentPortfolio: (portfolioId) =>
          set((state) => {
            state.currentPortfolio = portfolioId;
            state.currentProject = null;
            state.currentTRR = null;
            // Update filters to include portfolio
            state.filters.portfolioId = portfolioId || undefined;
          }),
        
        setCurrentProject: (projectId) =>
          set((state) => {
            state.currentProject = projectId;
            state.currentTRR = null;
            // Update filters to include project
            state.filters.projectId = projectId || undefined;
          }),
        
        setCurrentTRR: (trrId) =>
          set((state) => {
            state.currentTRR = trrId;
          }),
        
        // ============================================================================
        // Filter and View Actions
        // ============================================================================
        
        setFilters: (newFilters) =>
          set((state) => {
            state.filters = { ...state.filters, ...newFilters };
          }),
        
        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode;
          }),
        
        setSearchQuery: (query) =>
          set((state) => {
            state.searchQuery = query;
          }),
        
        setSorting: (sortBy, sortOrder) =>
          set((state) => {
            state.sortBy = sortBy;
            state.sortOrder = sortOrder;
            state.filters.sortBy = sortBy;
            state.filters.sortOrder = sortOrder;
          }),
        
        // ============================================================================
        // TRR CRUD Operations
        // ============================================================================
        
        createTRR: async (formData) => {
          const { currentOrganization } = get();
          if (!currentOrganization) {
            throw new Error('No organization selected');
          }
          
          set((state) => {
            state.loading.creating = true;
            state.errors.create = null;
          });
          
          try {
            // Create optimistic update
            const tempId = `temp-${Date.now()}`;
            const optimisticTRR: TechnicalRequirementReview = {
              id: tempId,
              ...formData,
              organizationId: currentOrganization,
              createdBy: 'current-user', // Will be replaced by actual user ID
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
              statusHistory: [],
              dorStatus: { isReady: false, unmetCriteria: [], score: 0 },
              sdwStatus: { stage: 'requirements', approvals: [] },
              watchers: [],
              attachments: [],
              dependencies: [],
              blockedBy: [],
              tags: formData.tags || [],
              status: 'draft',
              acceptanceCriteria: formData.acceptanceCriteria || [],
              testCases: formData.testCases || [],
              businessImpact: formData.businessImpact || 'medium',
              riskAssessment: formData.riskAssessment || {
                likelihood: 'medium',
                impact: 'medium',
                score: 5.0,
                rationale: 'Initial assessment pending',
              },
            } as TechnicalRequirementReview;
            
            set((state) => {
              state.trrs[tempId] = optimisticTRR;
              state.optimisticUpdates[tempId] = {
                type: 'create',
                data: optimisticTRR,
                timestamp: Date.now(),
              };
            });
            
            // Actual API call
            const createdTRR = await trrAPI.createTRR(
              formData,
              currentOrganization,
              'current-user' // Will be replaced by actual user ID from auth
            );
            
            // Replace optimistic update with real data
            set((state) => {
              delete state.trrs[tempId];
              delete state.optimisticUpdates[tempId];
              state.trrs[createdTRR.id] = createdTRR;
              state.currentTRR = createdTRR.id;
              state.loading.creating = false;
            });
            
            return createdTRR;
          } catch (error) {
            // Rollback optimistic update
            const tempId = Object.keys(get().optimisticUpdates).find(
              id => get().optimisticUpdates[id].type === 'create'
            );
            
            set((state) => {
              if (tempId) {
                delete state.trrs[tempId];
                delete state.optimisticUpdates[tempId];
              }
              state.loading.creating = false;
              state.errors.create = error instanceof Error ? error.message : 'Failed to create TRR';
            });
            
            throw error;
          }
        },
        
        updateTRR: async (trrId, updates) => {
          set((state) => {
            state.loading.updating = true;
            state.errors.update = null;
          });
          
          try {
            // Store original for rollback
            const originalTRR = get().trrs[trrId];
            if (!originalTRR) {
              throw new Error('TRR not found');
            }
            
            // Optimistic update
            set((state) => {
              state.trrs[trrId] = { ...originalTRR, ...updates };
              state.optimisticUpdates[trrId] = {
                type: 'update',
                data: originalTRR,
                timestamp: Date.now(),
              };
            });
            
            // Actual API call
            const updatedTRR = await trrAPI.updateTRR(trrId, updates, 'current-user');
            
            // Replace optimistic update with real data
            set((state) => {
              state.trrs[trrId] = updatedTRR;
              delete state.optimisticUpdates[trrId];
              state.loading.updating = false;
            });
          } catch (error) {
            // Rollback optimistic update
            const original = get().optimisticUpdates[trrId]?.data;
            if (original) {
              set((state) => {
                state.trrs[trrId] = original;
                delete state.optimisticUpdates[trrId];
                state.loading.updating = false;
                state.errors.update = error instanceof Error ? error.message : 'Failed to update TRR';
              });
            }
            
            throw error;
          }
        },
        
        deleteTRR: async (trrId) => {
          try {
            // Store original for rollback
            const originalTRR = get().trrs[trrId];
            if (!originalTRR) {
              throw new Error('TRR not found');
            }
            
            // Optimistic delete
            set((state) => {
              delete state.trrs[trrId];
              state.optimisticUpdates[trrId] = {
                type: 'delete',
                data: originalTRR,
                timestamp: Date.now(),
              };
            });
            
            // Actual API call
            await trrAPI.deleteTRR(trrId);
            
            // Confirm delete
            set((state) => {
              delete state.optimisticUpdates[trrId];
              if (state.currentTRR === trrId) {
                state.currentTRR = null;
              }
            });
          } catch (error) {
            // Rollback optimistic delete
            const original = get().optimisticUpdates[trrId]?.data;
            if (original) {
              set((state) => {
                state.trrs[trrId] = original;
                delete state.optimisticUpdates[trrId];
                state.errors.delete = error instanceof Error ? error.message : 'Failed to delete TRR';
              });
            }
            
            throw error;
          }
        },
        
        getTRR: async (trrId) => {
          try {
            const trr = await trrAPI.getTRR(trrId);
            if (trr) {
              set((state) => {
                state.trrs[trrId] = trr;
              });
            }
            return trr;
          } catch (error) {
            set((state) => {
              state.errors.fetch = error instanceof Error ? error.message : 'Failed to fetch TRR';
            });
            throw error;
          }
        },
        
        bulkUpdateTRRs: async (trrIds, updates) => {
          try {
            // Store originals for rollback
            const originals = trrIds.reduce((acc, id) => {
              const trr = get().trrs[id];
              if (trr) acc[id] = trr;
              return acc;
            }, {} as Record<string, TechnicalRequirementReview>);
            
            // Optimistic updates
            set((state) => {
              trrIds.forEach(id => {
                if (state.trrs[id]) {
                  state.trrs[id] = { ...state.trrs[id], ...updates };
                  state.optimisticUpdates[id] = {
                    type: 'update',
                    data: originals[id],
                    timestamp: Date.now(),
                  };
                }
              });
            });
            
            // Actual API call
            await trrAPI.bulkUpdateTRRs(trrIds, updates, 'current-user');
            
            // Clear optimistic updates
            set((state) => {
              trrIds.forEach(id => {
                delete state.optimisticUpdates[id];
              });
            });
          } catch (error) {
            // Rollback all optimistic updates
            set((state) => {
              trrIds.forEach(id => {
                const original = state.optimisticUpdates[id]?.data;
                if (original) {
                  state.trrs[id] = original;
                  delete state.optimisticUpdates[id];
                }
              });
              state.errors.bulkUpdate = error instanceof Error ? error.message : 'Failed to bulk update TRRs';
            });
            
            throw error;
          }
        },
        
        // ============================================================================
        // Real-time Subscription Management
        // ============================================================================
        
        subscribeTo: (type, id) => {
          const { currentOrganization, filters } = get();
          if (!currentOrganization) return;
          
          const subscriptionKey = `${type}-${id || 'list'}`;
          
          // Don't subscribe if already subscribed
          if (get().subscriptions[subscriptionKey]) return;
          
          let unsubscribe: (() => void) | null = null;
          
          if (type === 'trrs') {
            unsubscribe = trrAPI.subscribeTRRs(
              currentOrganization,
              filters,
              (trrs) => {
                set((state) => {
                  // Update TRRs from real-time updates
                  trrs.forEach(trr => {
                    // Don't overwrite optimistic updates
                    if (!state.optimisticUpdates[trr.id]) {
                      state.trrs[trr.id] = trr;
                    }
                  });
                });
              }
            );
          } else if (type === 'trr' && id) {
            unsubscribe = trrAPI.subscribeTRR(id, (trr) => {
              set((state) => {
                if (trr && !state.optimisticUpdates[trr.id]) {
                  state.trrs[trr.id] = trr;
                } else if (!trr) {
                  delete state.trrs[id];
                }
              });
            });
          }
          
          if (unsubscribe) {
            set((state) => {
              state.subscriptions[subscriptionKey] = unsubscribe!;
            });
          }
        },
        
        unsubscribeFrom: (type, id) => {
          const subscriptionKey = `${type}-${id || 'list'}`;
          const unsubscribe = get().subscriptions[subscriptionKey];
          
          if (unsubscribe) {
            unsubscribe();
            set((state) => {
              delete state.subscriptions[subscriptionKey];
            });
          }
        },
        
        unsubscribeAll: () => {
          const subscriptions = get().subscriptions;
          Object.values(subscriptions).forEach(unsubscribe => unsubscribe());
          
          set((state) => {
            state.subscriptions = {};
          });
        },
        
        // ============================================================================
        // AI Assistance
        // ============================================================================
        
        suggestFields: async (data) => {
          const { currentOrganization, currentProject } = get();
          if (!currentOrganization) {
            throw new Error('No organization selected');
          }
          
          set((state) => {
            state.loading.ai = true;
          });
          
          try {
            const context = {
              organizationId: currentOrganization,
              projectId: currentProject || '',
            };
            
            const suggestions = await aiAssist.suggestFields(data, context);
            
            set((state) => {
              state.loading.ai = false;
              state.aiSuggestions[`fields-${Date.now()}`] = {
                data: suggestions,
                confidence: 0.8,
                timestamp: Date.now(),
              };
            });
            
            return suggestions;
          } catch (error) {
            set((state) => {
              state.loading.ai = false;
              state.errors.ai = error instanceof Error ? error.message : 'AI suggestion failed';
            });
            throw error;
          }
        },
        
        generateArtifacts: async (trrId) => {
          const { currentOrganization, currentProject, trrs } = get();
          if (!currentOrganization) {
            throw new Error('No organization selected');
          }
          
          const trr = trrs[trrId];
          if (!trr) {
            throw new Error('TRR not found');
          }
          
          set((state) => {
            state.loading.ai = true;
          });
          
          try {
            const context = {
              organizationId: currentOrganization,
              projectId: currentProject || trr.projectId,
            };
            
            const artifacts = await aiAssist.generateArtifacts(trrId, trr, context);
            
            set((state) => {
              state.loading.ai = false;
              state.aiSuggestions[`artifacts-${trrId}`] = {
                data: artifacts,
                confidence: 0.75,
                timestamp: Date.now(),
              };
            });
            
            return artifacts;
          } catch (error) {
            set((state) => {
              state.loading.ai = false;
              state.errors.ai = error instanceof Error ? error.message : 'Artifact generation failed';
            });
            throw error;
          }
        },
        
        analyzeRisk: async (trrId) => {
          const { currentOrganization, currentProject, trrs } = get();
          if (!currentOrganization) {
            throw new Error('No organization selected');
          }
          
          const trr = trrs[trrId];
          if (!trr) {
            throw new Error('TRR not found');
          }
          
          const context = {
            organizationId: currentOrganization,
            projectId: currentProject || trr.projectId,
          };
          
          return await aiAssist.analyzeRisk(trrId, trr, context);
        },
        
        predictTimeline: async (trrId) => {
          const { currentOrganization, currentProject, trrs } = get();
          if (!currentOrganization) {
            throw new Error('No organization selected');
          }
          
          const trr = trrs[trrId];
          if (!trr) {
            throw new Error('TRR not found');
          }
          
          const context = {
            organizationId: currentOrganization,
            projectId: currentProject || trr.projectId,
          };
          
          return await aiAssist.predictTimeline(trrId, trr, context);
        },
        
        computeDOR: async (trrId) => {
          const { trrs } = get();
          const trr = trrs[trrId];
          if (!trr) {
            throw new Error('TRR not found');
          }
          
          const context = {
            organizationId: trr.organizationId,
            projectId: trr.projectId,
          };
          
          return await aiAssist.computeDOR(trrId, trr, context);
        },
        
        computeSDW: async (trrId) => {
          const { trrs } = get();
          const trr = trrs[trrId];
          if (!trr) {
            throw new Error('TRR not found');
          }
          
          const context = {
            organizationId: trr.organizationId,
            projectId: trr.projectId,
          };
          
          return await aiAssist.computeSDW(trrId, trr, context);
        },
        
        // ============================================================================
        // Comments and Collaboration
        // ============================================================================
        
        addComment: async (trrId, content, mentions = []) => {
          try {
            await trrAPI.addTRRComment(
              trrId,
              content,
              'current-user', // Will be replaced by actual user ID
              'Current User', // Will be replaced by actual user name
              mentions
            );
          } catch (error) {
            set((state) => {
              state.errors.comment = error instanceof Error ? error.message : 'Failed to add comment';
            });
            throw error;
          }
        },
        
        getComments: async (trrId) => {
          try {
            return await trrAPI.getTRRComments(trrId);
          } catch (error) {
            set((state) => {
              state.errors.comments = error instanceof Error ? error.message : 'Failed to fetch comments';
            });
            throw error;
          }
        },
        
        // ============================================================================
        // Requirements Management
        // ============================================================================
        
        addRequirement: async (trrId, requirement) => {
          try {
            await trrAPI.addTRRRequirement(trrId, requirement);
          } catch (error) {
            set((state) => {
              state.errors.requirement = error instanceof Error ? error.message : 'Failed to add requirement';
            });
            throw error;
          }
        },
        
        getRequirements: async (trrId) => {
          try {
            return await trrAPI.getTRRRequirements(trrId);
          } catch (error) {
            set((state) => {
              state.errors.requirements = error instanceof Error ? error.message : 'Failed to fetch requirements';
            });
            throw error;
          }
        },
        
        // ============================================================================
        // Export/Import and Signoff
        // ============================================================================
        
        exportTRRs: async (options) => {
          const { currentOrganization } = get();
          if (!currentOrganization) {
            throw new Error('No organization selected');
          }
          
          try {
            return await trrAPI.exportTRRs(currentOrganization, options);
          } catch (error) {
            set((state) => {
              state.errors.export = error instanceof Error ? error.message : 'Export failed';
            });
            throw error;
          }
        },
        
        createSignoff: async (trrId, role, comments) => {
          const { currentOrganization } = get();
          if (!currentOrganization) {
            throw new Error('No organization selected');
          }
          
          try {
            await trrAPI.createTRRSignoff(trrId, currentOrganization, role, comments);
          } catch (error) {
            set((state) => {
              state.errors.signoff = error instanceof Error ? error.message : 'Signoff failed';
            });
            throw error;
          }
        },
        
        // ============================================================================
        // Error Handling
        // ============================================================================
        
        setError: (key, error) =>
          set((state) => {
            state.errors[key] = error;
          }),
        
        clearErrors: () =>
          set((state) => {
            state.errors = {};
          }),
        
        // ============================================================================
        // Cache Management
        // ============================================================================
        
        invalidateCache: (type) =>
          set((state) => {
            if (!type || type === 'trrs') {
              state.trrs = {};
            }
            if (!type || type === 'analytics') {
              state.analytics = { dashboardData: null, lastUpdated: null };
            }
            if (!type || type === 'ai') {
              state.aiSuggestions = {};
            }
          }),
      }))
    ),
    {
      name: 'trr-store',
      version: 1,
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const useTRRSelectors = () => {
  const store = useTRRStore();
  
  return {
    // Filtered TRRs based on current filters
    filteredTRRs: useTRRStore((state) => {
      const trrs = Object.values(state.trrs);
      const { filters, searchQuery } = state;
      
      return trrs.filter((trr) => {
        // Filter by status
        if (filters.status?.length && !filters.status.includes(trr.status)) {
          return false;
        }
        
        // Filter by priority
        if (filters.priority?.length && !filters.priority.includes(trr.priority)) {
          return false;
        }
        
        // Filter by category
        if (filters.category?.length && !filters.category.includes(trr.category)) {
          return false;
        }
        
        // Filter by assignee
        if (filters.assignedTo && trr.assignedTo !== filters.assignedTo) {
          return false;
        }
        
        // Filter by project
        if (filters.projectId && trr.projectId !== filters.projectId) {
          return false;
        }
        
        // Filter by portfolio
        if (filters.portfolioId && trr.portfolioId !== filters.portfolioId) {
          return false;
        }
        
        // Search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            trr.title.toLowerCase().includes(query) ||
            trr.description.toLowerCase().includes(query) ||
            trr.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }
        
        return true;
      });
    }),
    
    // Dashboard metrics
    dashboardMetrics: useTRRStore((state) => {
      const trrs = Object.values(state.trrs);
      
      return {
        total: trrs.length,
        byStatus: trrs.reduce((acc, trr) => {
          acc[trr.status] = (acc[trr.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byPriority: trrs.reduce((acc, trr) => {
          acc[trr.priority] = (acc[trr.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        overdue: trrs.filter((trr) => 
          trr.timeline.dueDate && new Date(trr.timeline.dueDate) < new Date() && 
          !['approved', 'rejected', 'completed'].includes(trr.status)
        ).length,
        dorReady: trrs.filter((trr) => trr.dorStatus.isReady).length,
        avgScore: trrs.reduce((sum, trr) => sum + trr.dorStatus.score, 0) / trrs.length || 0,
      };
    }),
    
    // Current TRR details
    currentTRRDetails: useTRRStore((state) => 
      state.currentTRR ? state.trrs[state.currentTRR] : null
    ),
    
    // Loading states
    isLoading: useTRRStore((state) => 
      Object.values(state.loading).some(loading => loading)
    ),
    
    // Has errors
    hasErrors: useTRRStore((state) => 
      Object.values(state.errors).some(error => error !== null)
    ),
  };
};

export default useTRRStore;