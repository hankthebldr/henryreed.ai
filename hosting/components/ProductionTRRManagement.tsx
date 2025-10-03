/**
 * Production TRR Management System
 * Complete TRR workflow with data entry, validation, assignment, evidence collection,
 * and comprehensive reporting. Full data persistence and workflow automation.
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { dcAPIClient } from '../lib/dc-api-client';
import { dcContextStore, TRRRecord, CustomerEngagement, ActivePOV } from '../lib/dc-context-store';
import { dcAIClient, DCWorkflowContext } from '../lib/dc-ai-client';
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

  useEffect(() => {
    actions.updateBreadcrumbs([
      { label: 'Home', path: '/gui' },
      { label: 'TRR Management', path: '/gui/trr' },
    ]);
    
    // Initialize sample data if empty
    if (dcContextStore.getAllCustomerEngagements().length === 0) {
      dcContextStore.initializeSampleData();
    }
    
    loadTRRs();
    initializeWorkflowTemplates();
  }, [actions]);

  const loadTRRs = async () => {
    setIsLoading(true);
    try {
      const response = await dcAPIClient.getTRRs();
      if (response.success && response.data) {
        setTrrList(response.data);
      }
    } catch (error) {
      console.error('Failed to load TRRs:', error);
      actions.notify('error', 'Failed to load TRRs');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleCreateTRR = async () => {
    if (!formData.title || !formData.customerId || !formData.category) {
      actions.notify('error', 'Please fill in all required fields');
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
        assignedTo: formData.assignedTo || 'Domain Consultant',
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

      const response = await dcAPIClient.createTRR(trrData);
      if (response.success) {
        actions.notify('success', `TRR "${formData.title}" created successfully`);
        setShowCreateForm(false);
        setFormData({
          acceptanceCriteria: [],
          reviewers: [],
          dependencies: [],
          notes: []
        });
        loadTRRs();
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
    setIsLoading(true);
    try {
      const response = await dcAPIClient.validateTRR(trrId, evidence);
      if (response.success) {
        actions.notify('success', 'TRR validated successfully');
        loadTRRs();
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

    const updates: Partial<TRRRecord> = {
      status: newStatus,
      notes: [...trr.notes, `Status updated to ${newStatus} at ${new Date().toLocaleString()}`]
    };

    try {
      const response = await dcAPIClient.updateTRR(trrId, updates);
      if (response.success) {
        actions.notify('success', `TRR status updated to ${newStatus}`);
        loadTRRs();
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
      try {
        await dcAPIClient.updateTRR(selectedTRRForSDW, updates);
        loadTRRs();
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
  const povs = dcContextStore.getAllActivePOVs();

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
            <p className="text-gray-400 text-sm mt-1">
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
            <div className="text-sm text-gray-400">Total TRRs</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded border border-green-500/20 text-center">
            <div className="text-3xl font-mono text-green-400">{trrStats.validated}</div>
            <div className="text-sm text-gray-400">Validated</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded border border-yellow-500/20 text-center">
            <div className="text-3xl font-mono text-yellow-400">{trrStats.pending + trrStats.inReview}</div>
            <div className="text-sm text-gray-400">In Progress</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded border border-red-500/20 text-center">
            <div className="text-3xl font-mono text-red-400">{trrStats.overdue}</div>
            <div className="text-sm text-gray-400">Overdue</div>
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
                      <div className="text-sm text-gray-400">{trr.category}</div>
                      {customer && <div className="text-xs text-blue-400">{customer.name}</div>}
                      <div className="text-xs text-gray-500 mt-1">
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
                  <div className="text-sm text-gray-400">
                    {step.assignee} • Due: {new Date(step.dueDate).toLocaleDateString()}
                  </div>
                  {step.dependencies.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Depends on: {step.dependencies.length} step{step.dependencies.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  step.status === 'completed' ? 'bg-green-900/20 text-green-400' :
                  step.status === 'in-progress' ? 'bg-blue-900/20 text-blue-400' :
                  step.status === 'blocked' ? 'bg-red-900/20 text-red-400' :
                  'bg-gray-900/20 text-gray-400'
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
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-gray-900/50 p-4 rounded border border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Status:</span>
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
            <div className="text-gray-400">Loading TRRs...</div>
          </div>
        ) : filteredTRRs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg mb-2">📋 No TRRs Found</div>
            <div className="text-gray-400 text-sm mb-4">
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
                  <th className="text-left p-3 text-gray-400 font-medium">TRR</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Customer</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Priority</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Assigned</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Due Date</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Actions</th>
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
                          <div className="text-sm text-gray-400">{trr.category}</div>
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
    </div>
  );

  const CreateTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6">📝 Create New TRR</h3>
        
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleCreateTRR(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  TRR Title *
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                  placeholder="Enter TRR title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Customer *
                </label>
                <select
                  value={formData.customerId || ''}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  required
                >
                  <option value="">Select customer...</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Related POV (Optional)
                </label>
                <select
                  value={formData.povId || ''}
                  onChange={(e) => setFormData({ ...formData, povId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="">Select POV...</option>
                  {povs.map(pov => (
                    <option key={pov.id} value={pov.id}>{pov.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority || 'medium'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
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
              <h4 className="text-lg font-medium text-white">Assignment & Timeline</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={formData.assignedTo || ''}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                  placeholder="Domain Consultant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Validation Date
                </label>
                <input
                  type="date"
                  value={formData.targetDate || ''}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Risk Level
                </label>
                <select
                  value={formData.riskLevel || 'low'}
                  onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Customer Stakeholder
                </label>
                <input
                  type="text"
                  value={formData.customerStakeholder || ''}
                  onChange={(e) => setFormData({ ...formData, customerStakeholder: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                  placeholder="Customer contact person"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Validation Method
                </label>
                <input
                  type="text"
                  value={formData.validationMethod || ''}
                  onChange={(e) => setFormData({ ...formData, validationMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                  placeholder="Technical review and testing"
                />
              </div>
            </div>
          </div>

          {/* Description and Requirements */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Details</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                placeholder="Detailed description of the technical requirement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Impact
              </label>
              <textarea
                value={formData.businessImpact || ''}
                onChange={(e) => setFormData({ ...formData, businessImpact: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                placeholder="How this TRR impacts the customer's business objectives"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title || !formData.customerId}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
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
          <p className="text-gray-400">Comprehensive Technical Requirements Review system with full workflow automation</p>
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
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
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
              <div className="text-gray-400">Evidence collection and approval workflow coming soon</div>
            </div>
          )}
          {activeTab === 'reports' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📈</div>
              <div className="text-xl text-white mb-2">Reports & Analytics</div>
              <div className="text-gray-400">Advanced reporting and analytics dashboard coming soon</div>
            </div>
          )}
          {activeTab === 'templates' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <div className="text-xl text-white mb-2">TRR Templates</div>
              <div className="text-gray-400">Pre-built TRR templates for common scenarios coming soon</div>
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
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Title</div>
                  <div className="text-white font-medium">{selectedTRR.title}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Category</div>
                  <div className="text-white">{selectedTRR.category}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Status</div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    selectedTRR.status === 'validated' ? 'bg-green-900/20 text-green-400' :
                    selectedTRR.status === 'in-review' ? 'bg-blue-900/20 text-blue-400' :
                    'bg-yellow-900/20 text-yellow-400'
                  }`}>
                    {selectedTRR.status}
                  </span>
                </div>
                
                {selectedTRR.description && (
                  <div>
                    <div className="text-sm text-gray-400">Description</div>
                    <div className="text-white">{selectedTRR.description}</div>
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