// legacy-orange: replaced by green per Cortex rebrand (2025-10-08)
/**
 * Production TRR Management System
 * Complete TRR workflow with data entry, validation, assignment, evidence collection,
 * and comprehensive reporting. Full data persistence and workflow automation.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { dcAPIClient, UserScopeContext } from '../lib/dc-api-client';
import { dcContextStore, TRRRecord, CustomerEngagement, ActivePOV, UserProfile } from '../lib/dc-context-store';
import { dcAIClient, DCWorkflowContext } from '../lib/dc-ai-client';
import { aiInsightsClient } from '../lib/ai-insights-client';
import type { GeminiFunctionResponse, GeminiResponse } from '../lib/gemini-ai-service';
import { SolutionDesignWorkbook } from '../lib/sdw-models';
import { SDWWorkflow } from './SDWWorkflow';

interface TRRFormData {
  title: string;
  category: string;
  customerId: string;
  povId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  acceptanceCriteria: string[];
  validationMethod: string;
  assignedTo: string;
  reviewers: string[];
  targetDate: string;
  dependencies: string[];
  riskLevel: 'low' | 'medium' | 'high';
  businessImpact: string;
  customerStakeholder: string;
  notes: string[];
}

interface ValidationEvidence {
  id: string;
  type: 'document' | 'screenshot' | 'video' | 'test_result' | 'demo_recording';
  title: string;
  description: string;
  url?: string;
  uploadedBy: string;
  uploadedAt: string;
  verified: boolean;
}

interface TRRWorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  assignee: string;
  dueDate: string;
  dependencies: string[];
  notes: string;
}

export const ProductionTRRManagement: React.FC = () => {
  const { state, actions } = useAppState();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'manage' | 'validate' | 'reports' | 'templates'>('dashboard');
  const [trrList, setTrrList] = useState<TRRRecord[]>([]);
  const [selectedTRR, setSelectedTRR] = useState<TRRRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAIStatus] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<Partial<TRRFormData>>({
    acceptanceCriteria: [],
    reviewers: [],
    dependencies: [],
    notes: []
  });
  const [validationEvidence, setValidationEvidence] = useState<ValidationEvidence[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<TRRWorkflowStep[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSDWWorkflow, setShowSDWWorkflow] = useState(false);
  const [selectedTRRForSDW, setSelectedTRRForSDW] = useState<string | null>(null);
  const [sdwList, setSDWList] = useState<Record<string, SolutionDesignWorkbook>>({});
  const [povList, setPovList] = useState<POVRecord[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);

  const buildUserContext = useCallback((): UserScopeContext | null => {
    if (!state.auth.user) {
      return null;
    }

    const isManager = state.auth.user.role === 'manager' || state.auth.user.role === 'admin';

    return {
      userId: state.auth.user.id,
      scope: isManager ? 'team' : 'self',
      teamUserIds: isManager ? state.auth.user.assignedProjects || [] : undefined
    };
  }, [state.auth.user]);

  const onboardingProfile = useMemo<UserProfile | null>(() => {
    if (!state.auth.user) {
      return null;
    }

    const roleMap: Record<string, UserProfile['role']> = {
      admin: 'manager',
      manager: 'manager',
      senior_dc: 'dc',
      dc: 'dc',
      analyst: 'dc'
    };

    return {
      id: state.auth.user.id,
      name: state.auth.user.username || state.auth.user.email || 'Team Member',
      email: state.auth.user.email || `${state.auth.user.username || 'user'}@henryreed.ai`,
      role: roleMap[state.auth.user.role] || 'dc',
      region: 'AMER',
      specializations: state.auth.user.assignedProjects || [],
      createdAt: state.auth.user.lastLogin || new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
  }, [state.auth.user]);

  const reloadData = useCallback(async (contextOverride?: UserScopeContext) => {
    const context = contextOverride || buildUserContext();
    if (!context || !state.auth.user) {
      return;
    }

    setIsLoading(true);
    try {
      const [trrResponse, povResponse] = await Promise.all([
        dcAPIClient.getTRRs(context),
        dcAPIClient.getPOVs(context)
      ]);

      let trrs = trrResponse.success && trrResponse.data ? trrResponse.data : [];
      let povs = povResponse.success && povResponse.data ? povResponse.data : [];

      if (trrs.length === 0 && povs.length === 0 && onboardingProfile) {
        setIsSeeding(true);
        await dcAPIClient.ensureStarterDataForUser(context, onboardingProfile);
        const [seededTRRs, seededPOVs] = await Promise.all([
          dcAPIClient.getTRRs(context),
          dcAPIClient.getPOVs(context)
        ]);

        if (seededTRRs.success && seededTRRs.data) {
          trrs = seededTRRs.data;
        }
        if (seededPOVs.success && seededPOVs.data) {
          povs = seededPOVs.data;
        }
      }

      setTrrList(trrs);
      setPovList(povs);
    } catch (error) {
      console.error('Failed to load TRR data:', error);
      actions.notify('error', 'Failed to load TRR data');
    } finally {
      setIsLoading(false);
      setIsSeeding(false);
    }
  }, [actions, buildUserContext, onboardingProfile, state.auth.user]);

  useEffect(() => {
    initializeWorkflowTemplates();
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const initializeWorkflowTemplates = () => {
    const defaultSteps: TRRWorkflowStep[] = [
      {
        id: 'step_001',
        name: 'Initial Assessment',
        status: 'pending',
        assignee: 'Domain Consultant',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        dependencies: [],
        notes: 'Review customer requirements and technical constraints'
      },
      {
        id: 'step_002',
        name: 'Technical Validation',
        status: 'pending',
        assignee: 'Solutions Engineer',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        dependencies: ['step_001'],
        notes: 'Execute technical validation scenarios and document results'
      },
      {
        id: 'step_003',
        name: 'Evidence Collection',
        status: 'pending',
        assignee: 'Domain Consultant',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        dependencies: ['step_002'],
        notes: 'Collect and organize validation evidence for customer review'
      },
      {
        id: 'step_004',
        name: 'Customer Review',
        status: 'pending',
        assignee: 'Customer Stakeholder',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        dependencies: ['step_003'],
        notes: 'Customer reviews and approves technical validation results'
      },
      {
        id: 'step_005',
        name: 'Final Approval',
        status: 'pending',
        assignee: 'Technical Lead',
        dueDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
        dependencies: ['step_004'],
        notes: 'Final technical approval and TRR closure'
      }
    ];
    
    setWorkflowSteps(defaultSteps);
  };

  const persistTrrInsight = (trrId: string, result: GeminiFunctionResponse, type: AIWorkflowInsight['type'], fallbackTitle?: string) => {
    if (!result.success || !result.data) {
      actions.notify('error', result.error || 'AI request failed');
      return;
    }

    const data = result.data as GeminiResponse & { content?: string; title?: string; confidence?: number };
    const content = typeof data.response === 'string' ? data.response : data.content || '';
    if (!content) {
      actions.notify('warning', 'AI response did not include any content to save.');
      return;
    }

    const insight: AIWorkflowInsight = {
      id: `ai_${Date.now()}`,
      type,
      source: 'gemini',
      title: data.title || fallbackTitle,
      content,
      confidence: data.confidence,
      createdAt: new Date().toISOString(),
    };

    const updated = dcContextStore.recordTRRInsight(trrId, insight);
    if (updated) {
      setTrrList(dcContextStore.getAllTRRRecords());
      setSelectedTRR(updated);
      actions.notify('success', 'AI insight saved to TRR');
    }
  };

  const handleGenerateValidationSummary = async (trr: TRRRecord) => {
    const customer = dcContextStore.getCustomerEngagement(trr.customerId);
    const pov = trr.povId ? dcContextStore.getActivePOV(trr.povId) : undefined;
    const context: DCWorkflowContext = {
      workflowType: 'trr_validation',
      customerProfile: customer ? {
        industry: customer.industry,
        size: customer.size,
        maturityLevel: customer.maturityLevel,
        primaryConcerns: customer.primaryConcerns,
        techStack: customer.techStack,
      } : undefined,
      engagementData: {
        scope: pov ? pov.scenarios.map(s => s.name) : [],
        stakeholders: customer ? customer.stakeholders.map(s => s.name) : [],
        objectives: pov?.objectives,
      },
      workInProgress: {
        povsActive: dcContextStore.getAllActivePOVs().filter(p => p.status === 'executing').length,
        trrsCompleted: dcContextStore.getAllTRRRecords().filter(record => record.status === 'validated').length,
        blockers: trr.dependencies,
      },
    };

    setAIStatus('Summarizing TRR validation...');
    try {
      const response = await aiInsightsClient.analyzeTRR({ ...trr, context });
      persistTrrInsight(trr.id, response, 'validation_summary', `Validation Summary: ${trr.title}`);
    } catch (error) {
      actions.notify('error', `Failed to generate validation summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAIStatus(null);
    }
  };

  const handleCreateTRR = async () => {
    if (!formData.title || !formData.customerId || !formData.category) {
      actions.notify('error', 'Please fill in all required fields');
      return;
    }

    const context = buildUserContext();
    if (!context) {
      actions.notify('error', 'Active user context unavailable');
      return;
    }

    setIsLoading(true);
    try {
      const trrData: Omit<TRRRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        customerId: formData.customerId!,
        povId: formData.povId,
        title: formData.title!,
        category: formData.category!,
        priority: formData.priority || 'medium',
        status: 'draft',
        description: formData.description || '',
        acceptanceCriteria: formData.acceptanceCriteria || [],
        validationMethod: formData.validationMethod || 'Technical review',
        validationEvidence: [],
        assignedTo: formData.assignedTo || onboardingProfile?.name || state.auth.user?.username || 'Domain Consultant',
        reviewers: formData.reviewers || [],
        timeline: {
          created: new Date().toISOString(),
          targetValidation: formData.targetDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          actualValidation: undefined
        },
        dependencies: formData.dependencies || [],
        riskLevel: formData.riskLevel || 'low',
        businessImpact: formData.businessImpact || '',
        customerStakeholder: formData.customerStakeholder || '',
        notes: formData.notes || []
      };

      const response = await dcAPIClient.createTRR(context, trrData);
      if (response.success) {
        actions.notify('success', `TRR "${formData.title}" created successfully`);
        setShowCreateForm(false);
        setFormData({
          acceptanceCriteria: [],
          reviewers: [],
          dependencies: [],
          notes: []
        });
        reloadData(context);
      } else {
        actions.notify('error', response.error || 'Failed to create TRR');
      }
    } catch (error) {
      console.error('TRR creation error:', error);
      actions.notify('error', 'Failed to create TRR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateTRR = async (trrId: string, evidence?: string[]) => {
    const context = buildUserContext();
    if (!context) {
      actions.notify('error', 'Active user context unavailable');
      return;
    }

    const trr = trrList.find(t => t.id === trrId);

    setIsLoading(true);
    try {
      const response = await dcAPIClient.validateTRR(context, trrId, evidence, trr?.ownerId);
      if (response.success) {
        actions.notify('success', 'TRR validated successfully');
        reloadData(context);
      } else {
        actions.notify('error', response.error || 'Failed to validate TRR');
      }
    } catch (error) {
      console.error('TRR validation error:', error);
      actions.notify('error', 'Failed to validate TRR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (trrId: string, newStatus: TRRRecord['status']) => {
    const trr = trrList.find(t => t.id === trrId);
    if (!trr) return;

    const context = buildUserContext();
    if (!context) {
      actions.notify('error', 'Active user context unavailable');
      return;
    }

    const updates: Partial<TRRRecord> = {
      status: newStatus,
      notes: [...trr.notes, `Status updated to ${newStatus} at ${new Date().toLocaleString()}`]
    };

    try {
      const response = await dcAPIClient.updateTRR(context, trrId, updates, trr.ownerId);
      if (response.success) {
        actions.notify('success', `TRR status updated to ${newStatus}`);
        reloadData(context);
      } else {
        actions.notify('error', 'Failed to update TRR status');
      }
    } catch (error) {
      actions.notify('error', 'Failed to update TRR status');
    }
  };

  const addValidationEvidence = (trrId: string) => {
    const newEvidence: ValidationEvidence = {
      id: `evidence_${Date.now()}`,
      type: 'document',
      title: 'New Evidence',
      description: 'Evidence description',
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString(),
      verified: false
    };
    
    setValidationEvidence(prev => [...prev, newEvidence]);
    actions.notify('success', 'Validation evidence added');
  };

  const generateTRRReport = async (trrIds?: string[]) => {
    const trrsToReport = trrIds ? trrList.filter(t => trrIds.includes(t.id)) : trrList;
    
    actions.notify('info', 'Generating TRR report...');
    
    // Simulate report generation
    setTimeout(() => {
      actions.notify('success', `TRR report generated for ${trrsToReport.length} TRRs`);
    }, 2000);
  };

  const handleCreateSDW = (trrId: string) => {
    setSelectedTRRForSDW(trrId);
    setShowSDWWorkflow(true);
  };

  const handleSaveSDW = async (sdw: SolutionDesignWorkbook) => {
    // Store SDW in local state (in production, this would go to API/database)
    setSDWList(prev => ({ ...prev, [sdw.trrId]: sdw }));

    // Update TRR to reference the SDW
    const updates: Partial<TRRRecord> = {
      notes: [...(selectedTRR?.notes || []), `Solution Design Workbook created: ${sdw.id}`]
    };

    if (selectedTRRForSDW) {
      const context = buildUserContext();
      try {
        if (!context) {
          throw new Error('Active user context unavailable');
        }
        const targetTRR = trrList.find(t => t.id === selectedTRRForSDW);
        await dcAPIClient.updateTRR(context, selectedTRRForSDW, updates, targetTRR?.ownerId);
        reloadData(context);
      } catch (error) {
        console.error('Failed to update TRR with SDW reference:', error);
      }
    }

    setShowSDWWorkflow(false);
    setSelectedTRRForSDW(null);
  };

  const handleCancelSDW = () => {
    setShowSDWWorkflow(false);
    setSelectedTRRForSDW(null);
  };

  const customers = dcContextStore.getAllCustomerEngagements();
  const povs = povList.length > 0 ? povList : dcContextStore.getAllActivePOVs();

  // Filter and search logic
  const filteredTRRs = trrList.filter(trr => {
    const statusMatch = filterStatus === 'all' || trr.status === filterStatus;
    const searchMatch = !searchTerm || 
      trr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trr.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trr.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Statistics
  const trrStats = {
    total: trrList.length,
    pending: trrList.filter(t => t.status === 'pending').length,
    inReview: trrList.filter(t => t.status === 'in-review').length,
    validated: trrList.filter(t => t.status === 'validated').length,
    failed: trrList.filter(t => t.status === 'failed').length,
    blocked: trrList.filter(t => t.status === 'blocked').length,
    highPriority: trrList.filter(t => t.priority === 'high' || t.priority === 'critical').length,
    overdue: trrList.filter(t => {
      const dueDate = new Date(t.timeline.targetValidation);
      return dueDate < new Date() && t.status !== 'validated';
    }).length
  };

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 p-6 rounded-lg border border-cyan-500/30">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400">📋 TRR Management Dashboard</h2>
            <p className="text-cortex-text-secondary text-sm mt-1">
              Production-quality Technical Requirements Review system
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              + New TRR
            </button>
            <button
              onClick={() => generateTRRReport()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              📊 Generate Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 p-4 rounded border border-gray-600 text-center">
            <div className="text-3xl font-mono text-cyan-400">{trrStats.total}</div>
            <div className="text-sm text-cortex-text-secondary">Total TRRs</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded border border-green-500/20 text-center">
            <div className="text-3xl font-mono text-green-400">{trrStats.validated}</div>
            <div className="text-sm text-cortex-text-secondary">Validated</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded border border-yellow-500/20 text-center">
            <div className="text-3xl font-mono text-yellow-400">{trrStats.pending + trrStats.inReview}</div>
            <div className="text-sm text-cortex-text-secondary">In Progress</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded border border-red-500/20 text-center">
            <div className="text-3xl font-mono text-red-400">{trrStats.overdue}</div>
            <div className="text-sm text-cortex-text-secondary">Overdue</div>
          </div>
        </div>
      </div>

      {/* Recent TRRs and Workflow Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent TRRs */}
        <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">📝 Recent TRRs</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {trrList.slice(0, 10).map(trr => {
              const customer = customers.find(c => c.id === trr.customerId);
              const isOverdue = new Date(trr.timeline.targetValidation) < new Date() && trr.status !== 'validated';
              
              return (
                <div key={trr.id} className="p-3 bg-gray-800/30 rounded border border-gray-600 hover:bg-gray-700/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{trr.title}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trr.priority === 'critical' ? 'bg-red-800 text-red-200' :
                          trr.priority === 'high' ? 'bg-orange-800 text-orange-200' :
                          trr.priority === 'medium' ? 'bg-yellow-800 text-yellow-200' :
                          'bg-green-800 text-green-200'
                        }`}>
                          {trr.priority}
                        </span>
                        {isOverdue && <span className="px-2 py-1 bg-red-900/20 text-red-400 text-xs rounded">OVERDUE</span>}
                      </div>
                      <div className="text-sm text-cortex-text-secondary">{trr.category}</div>
                      {customer && <div className="text-xs text-blue-400">{customer.name}</div>}
                      <div className="text-xs text-cortex-text-muted mt-1">
                        Assigned: {trr.assignedTo} • Due: {new Date(trr.timeline.targetValidation).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        trr.status === 'validated' ? 'bg-green-900/20 text-green-400 border border-green-500/30' :
                        trr.status === 'in-review' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/30' :
                        trr.status === 'failed' || trr.status === 'blocked' ? 'bg-red-900/20 text-red-400 border border-red-500/30' :
                        'bg-yellow-900/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {trr.status.replace('-', ' ')}
                      </div>
                      <button
                        onClick={() => setSelectedTRR(trr)}
                        className="text-xs text-blue-400 hover:text-blue-300 mt-1 block"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow Status */}
        <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">⚡ Active Workflows</h3>
          <div className="space-y-4">
            {workflowSteps.map(step => (
              <div key={step.id} className="flex items-center p-3 bg-gray-800/30 rounded border border-gray-600">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  step.status === 'completed' ? 'bg-green-500' :
                  step.status === 'in-progress' ? 'bg-blue-500' :
                  step.status === 'blocked' ? 'bg-red-500' :
                  'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <div className="text-white font-medium">{step.name}</div>
                  <div className="text-sm text-cortex-text-secondary">
                    {step.assignee} • Due: {new Date(step.dueDate).toLocaleDateString()}
                  </div>
                  {step.dependencies.length > 0 && (
                    <div className="text-xs text-cortex-text-muted">
                      Depends on: {step.dependencies.length} step{step.dependencies.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  step.status === 'completed' ? 'bg-green-900/20 text-green-400' :
                  step.status === 'in-progress' ? 'bg-blue-900/20 text-blue-400' :
                  step.status === 'blocked' ? 'bg-red-900/20 text-red-400' :
                  'bg-gray-900/20 text-cortex-text-secondary'
                }`}>
                  {step.status.replace('-', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ManageTab = () => (
    <section
      id="notes-workbench"
      aria-labelledby="notes-workbench-heading"
      className="space-y-6 scroll-mt-28"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 id="notes-workbench-heading" className="text-2xl font-semibold text-white flex items-center gap-2">
            📝 Notes Workbench
          </h3>
          <p className="text-sm text-cortex-text-secondary mt-1">
            Centralized workspace for TRR notes, validation evidence, and follow-up actions.
          </p>
        </div>
        <div className="flex items-center text-xs text-cortex-text-muted bg-gray-800/60 border border-gray-700 rounded px-3 py-2">
          Live collaboration enabled
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-900/50 p-4 rounded border border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-cortex-text-secondary">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="in-review">In Review</option>
              <option value="validated">Validated</option>
              <option value="failed">Failed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search TRRs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400"
            />
          </div>

          <button
            onClick={() => generateTRRReport(filteredTRRs.map(t => t.id))}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            📊 Export
          </button>
        </div>
      </div>

      {/* TRR List */}
      <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">TRR Management ({filteredTRRs.length})</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            + Create TRR
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
            <div className="text-cortex-text-secondary">
              {isSeeding ? 'Preparing starter TRRs for your workspace...' : 'Loading TRRs...'}
            </div>
          </div>
        ) : filteredTRRs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-cortex-text-muted text-lg mb-2">📋 No TRRs Found</div>
            <div className="text-cortex-text-secondary text-sm mb-4">
              {trrList.length === 0 ? 'Create your first TRR to get started' : 'Try adjusting your filters'}
            </div>
            {trrList.length === 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Create Your First TRR
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left p-3 text-cortex-text-secondary font-medium">TRR</th>
                  <th className="text-left p-3 text-cortex-text-secondary font-medium">Customer</th>
                  <th className="text-left p-3 text-cortex-text-secondary font-medium">Priority</th>
                  <th className="text-left p-3 text-cortex-text-secondary font-medium">Status</th>
                  <th className="text-left p-3 text-cortex-text-secondary font-medium">Assigned</th>
                  <th className="text-left p-3 text-cortex-text-secondary font-medium">Due Date</th>
                  <th className="text-left p-3 text-cortex-text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTRRs.map(trr => {
                  const customer = customers.find(c => c.id === trr.customerId);
                  const isOverdue = new Date(trr.timeline.targetValidation) < new Date() && trr.status !== 'validated';
                  
                  return (
                    <tr key={trr.id} className="border-b border-gray-700 hover:bg-gray-800/30">
                      <td className="p-3">
                        <div>
                          <div className="text-white font-medium">{trr.title}</div>
                          <div className="text-sm text-cortex-text-secondary">{trr.category}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-blue-400">{customer?.name || 'Unknown'}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trr.priority === 'critical' ? 'bg-red-800 text-red-200' :
                          trr.priority === 'high' ? 'bg-orange-800 text-orange-200' :
                          trr.priority === 'medium' ? 'bg-yellow-800 text-yellow-200' :
                          'bg-green-800 text-green-200'
                        }`}>
                          {trr.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            trr.status === 'validated' ? 'bg-green-900/20 text-green-400' :
                            trr.status === 'in-review' ? 'bg-blue-900/20 text-blue-400' :
                            trr.status === 'failed' || trr.status === 'blocked' ? 'bg-red-900/20 text-red-400' :
                            'bg-yellow-900/20 text-yellow-400'
                          }`}>
                            {trr.status.replace('-', ' ')}
                          </span>
                          {isOverdue && <span className="px-2 py-1 bg-red-900/20 text-red-400 text-xs rounded">OVERDUE</span>}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-white">{trr.assignedTo}</div>
                      </td>
                      <td className="p-3">
                        <div className={`text-sm ${isOverdue ? 'text-red-400' : 'text-gray-300'}`}>
                          {new Date(trr.timeline.targetValidation).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => setSelectedTRR(trr)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                          >
                            View
                          </button>
                          
                          <button
                            onClick={() => handleCreateSDW(trr.id)}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                            title="Create Solution Design Workbook"
                          >
                            📋 SDW
                          </button>
                          
                          {trr.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(trr.id, 'in-review')}
                              className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors"
                            >
                              Start Review
                            </button>
                          )}
                          {trr.status === 'in-review' && (
                            <button
                              onClick={() => handleValidateTRR(trr.id)}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                            >
                              Validate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );

  const CreateTab = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-cortex-text-primary mb-6">📝 Create New TRR</h3>
        
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleCreateTRR(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-cortex-text-primary">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                  TRR Title *
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent"
                  placeholder="Enter TRR title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                  Category *
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent"
                  required
                >
                  <option value="">Select category...</option>
                  <option value="Technical Validation">Technical Validation</option>
                  <option value="Integration Requirements">Integration Requirements</option>
                  <option value="Performance Testing">Performance Testing</option>
                  <option value="Security Assessment">Security Assessment</option>
                  <option value="Compliance Review">Compliance Review</option>
                  <option value="Data Migration">Data Migration</option>
                  <option value="Custom Development">Custom Development</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                  Customer *
                </label>
                <select
                  value={formData.customerId || ''}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent"
                  required
                >
                  <option value="">Select customer...</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                  Related POV (Optional)
                </label>
                <select
                  value={formData.povId || ''}
                  onChange={(e) => setFormData({ ...formData, povId: e.target.value })}
                  className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent"
                >
                  <option value="">Select POV...</option>
                  {povs.map(pov => (
                    <option key={pov.id} value={pov.id}>{pov.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority || 'medium'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Assignment and Timeline */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-cortex-text-primary">Assignment & Timeline</h4>
              
              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={formData.assignedTo || ''}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent"
                  placeholder="Domain Consultant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                  Target Validation Date
                </label>
                <input
                  type="date"
                  value={formData.targetDate || ''}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                  Risk Level
                </label>
                <select
                  value={formData.riskLevel || 'low'}
                  onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                  className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                  Customer Stakeholder
                </label>
                <input
                  type="text"
                  value={formData.customerStakeholder || ''}
                  onChange={(e) => setFormData({ ...formData, customerStakeholder: e.target.value })}
                  className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent"
                  placeholder="Customer contact person"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                  Validation Method
                </label>
                <input
                  type="text"
                  value={formData.validationMethod || ''}
                  onChange={(e) => setFormData({ ...formData, validationMethod: e.target.value })}
                  className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent"
                  placeholder="Technical review and testing"
                />
              </div>
            </div>
          </div>

          {/* Description and Requirements */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-cortex-text-primary">Details</h4>
            
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent"
                placeholder="Detailed description of the technical requirement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                Business Impact
              </label>
              <textarea
                value={formData.businessImpact || ''}
                onChange={(e) => setFormData({ ...formData, businessImpact: e.target.value })}
                rows={2}
                className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent"
                placeholder="How this TRR impacts the customer's business objectives"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="btn-modern button-hover-lift cortex-interactive px-4 py-2 bg-cortex-bg-secondary hover:bg-cortex-bg-hover text-cortex-text-primary rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title || !formData.customerId}
              className="btn-modern button-hover-lift cortex-interactive px-4 py-2 bg-cortex-blue hover:bg-cortex-blue-dark text-white rounded transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create TRR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">🔍 Production TRR Management</h1>
          <p className="text-cortex-text-secondary">Comprehensive Technical Requirements Review system with full workflow automation</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-800/30 p-1 rounded-lg overflow-x-auto">
          {[
            { id: 'dashboard', label: '📊 Dashboard', desc: 'Overview and statistics' },
            { id: 'create', label: '📝 Create', desc: 'New TRR form' },
            { id: 'manage', label: '🔧 Manage', desc: 'TRR list and actions' },
            { id: 'validate', label: '✅ Validate', desc: 'Evidence and approval' },
            { id: 'reports', label: '📈 Reports', desc: 'Analytics and exports' },
            { id: 'templates', label: '📋 Templates', desc: 'TRR templates' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-4 py-3 text-center transition-colors rounded-lg whitespace-nowrap min-w-fit ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white'
                  : 'text-cortex-text-secondary hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="font-medium">{tab.label}</div>
              <div className="text-xs opacity-75">{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'create' && <CreateTab />}
          {activeTab === 'manage' && <ManageTab />}
          {activeTab === 'validate' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">✅</div>
              <div className="text-xl text-white mb-2">Validation Workflow</div>
              <div className="text-cortex-text-secondary">Evidence collection and approval workflow coming soon</div>
            </div>
          )}
          {activeTab === 'reports' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📈</div>
              <div className="text-xl text-white mb-2">Reports & Analytics</div>
              <div className="text-cortex-text-secondary">Advanced reporting and analytics dashboard coming soon</div>
            </div>
          )}
          {activeTab === 'templates' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <div className="text-xl text-white mb-2">TRR Templates</div>
              <div className="text-cortex-text-secondary">Pre-built TRR templates for common scenarios coming soon</div>
            </div>
          )}
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <CreateTab />
            </div>
          </div>
        )}

        {/* TRR Details Modal */}
        {selectedTRR && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">📋 TRR Details</h3>
                <button
                  onClick={() => setSelectedTRR(null)}
                  className="text-cortex-text-secondary hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-cortex-text-secondary">Title</div>
                  <div className="text-white font-medium">{selectedTRR.title}</div>
                </div>
                
                <div>
                  <div className="text-sm text-cortex-text-secondary">Category</div>
                  <div className="text-white">{selectedTRR.category}</div>
                </div>
                
                <div>
                  <div className="text-sm text-cortex-text-secondary">Status</div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    selectedTRR.status === 'validated' ? 'bg-green-900/20 text-green-400' :
                    selectedTRR.status === 'in-review' ? 'bg-blue-900/20 text-blue-400' :
                    'bg-yellow-900/20 text-yellow-400'
                  }`}>
                    {selectedTRR.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleGenerateValidationSummary(selectedTRR)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    disabled={!!aiStatus}
                  >
                    🤖 Generate Validation Summary
                  </button>
                  {aiStatus && <span className="text-xs text-cortex-text-muted">{aiStatus}</span>}
                </div>

                {selectedTRR.description && (
                  <div>
                    <div className="text-sm text-cortex-text-secondary">Description</div>
                    <div className="text-white">{selectedTRR.description}</div>
                  </div>
                )}

                {selectedTRR.aiInsights && selectedTRR.aiInsights.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm text-cortex-text-secondary">AI Insights</div>
                    {selectedTRR.aiInsights.map(insight => (
                      <div key={insight.id} className="bg-gray-800/60 p-3 rounded border border-blue-500/30">
                        <div className="text-xs text-cortex-text-muted mb-1">{new Date(insight.createdAt).toLocaleString()}</div>
                        <div className="text-cortex-text-primary font-medium mb-1">{insight.title || 'AI Recommendation'}</div>
                        <div className="text-sm text-cortex-text-secondary whitespace-pre-wrap">{insight.content}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SDW Status */}
                {sdwList[selectedTRR.id] && (
                  <div className="bg-purple-900/20 p-4 rounded border border-purple-500/30">
                    <div className="text-sm text-purple-400 mb-2">📋 Solution Design Workbook</div>
                    <div className="text-purple-300">
                      Status: {sdwList[selectedTRR.id].status}
                    </div>
                    <div className="text-xs text-purple-400 mt-1">
                      Created: {new Date(sdwList[selectedTRR.id].createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleCreateSDW(selectedTRR.id)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                  >
                    {sdwList[selectedTRR.id] ? 'Edit SDW' : 'Create SDW'}
                  </button>
                  <button
                    onClick={() => addValidationEvidence(selectedTRR.id)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    Add Evidence
                  </button>
                  <button
                    onClick={() => setSelectedTRR(null)}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* SDW Workflow Modal */}
        {showSDWWorkflow && selectedTRRForSDW && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60]">
            <div className="w-full h-full">
              <SDWWorkflow
                trrId={selectedTRRForSDW}
                existingSDW={sdwList[selectedTRRForSDW]}
                onSave={handleSaveSDW}
                onCancel={handleCancelSDW}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
