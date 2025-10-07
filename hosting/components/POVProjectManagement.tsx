/**
 * POV Project Management System
 * Comprehensive POV lifecycle management with scenario planning, timeline tracking, and outcome reporting
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { dcAPIClient } from '../lib/dc-api-client';
import { dcContextStore, ActivePOV as POVRecord, CustomerEngagement } from '../lib/dc-context-store';
import { dcAIClient, DCWorkflowContext } from '../lib/dc-ai-client';

interface POVScenario {
  id: string;
  name: string;
  type: string;
  status: 'planned' | 'deployed' | 'validated' | 'completed';
  results?: string;
  customerFeedback?: string;
}

interface POVFormData {
  name: string;
  customerId: string;
  objectives: string[];
  timeline: {
    start: string;
    end: string;
    milestones: Array<{
      name: string;
      date: string;
      description: string;
      status: 'planned' | 'in-progress' | 'completed' | 'delayed';
    }>;
  };
  scenarios: POVScenario[];
  successCriteria: string[];
  resources: Array<{
    type: 'personnel' | 'technical' | 'budget';
    name: string;
    allocation: string;
    notes?: string;
  }>;
  stakeholders: Array<{
    name: string;
    role: string;
    department: string;
    influence: 'high' | 'medium' | 'low';
    engagement: 'champion' | 'supporter' | 'neutral' | 'skeptical';
  }>;
  risks: Array<{
    description: string;
    impact: 'high' | 'medium' | 'low';
    probability: 'high' | 'medium' | 'low';
    mitigation: string;
    status: 'open' | 'mitigated' | 'closed';
  }>;
}

interface POVTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  scenarios: string[];
  timeline: number; // days
  objectives: string[];
  successCriteria: string[];
}

export const POVProjectManagement: React.FC = () => {
  const { state, actions } = useAppState();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'manage' | 'templates' | 'analytics'>('dashboard');
  const [selectedPOV, setSelectedPOV] = useState<POVRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<Partial<POVFormData>>({
    objectives: [],
    scenarios: [],
    successCriteria: [],
    resources: [],
    stakeholders: [],
    risks: [],
    timeline: {
      start: '',
      end: '',
      milestones: []
    }
  });

  useEffect(() => {
    actions.updateBreadcrumbs([
      { label: 'Home', path: '/gui' },
      { label: 'POV Management', path: '/gui/pov' },
    ]);
    
    // Initialize sample data if empty
    if (dcContextStore.getAllCustomerEngagements().length === 0) {
      dcContextStore.initializeSampleData();
    }
  }, [actions]);

  const povTemplates: POVTemplate[] = [
    {
      id: 'tpl_001',
      name: 'Financial Services Security POV',
      description: 'Comprehensive security assessment for financial institutions',
      industry: 'Financial Services',
      scenarios: ['Insider Threat Detection', 'Compliance Monitoring', 'Fraud Prevention', 'Data Loss Prevention'],
      timeline: 45,
      objectives: [
        'Demonstrate advanced threat detection capabilities',
        'Validate compliance reporting accuracy',
        'Prove ROI through automated incident response',
        'Show integration with existing security stack'
      ],
      successCriteria: [
        'Detect 95% of simulated insider threats',
        'Reduce false positive rate by 60%',
        'Achieve 80% automation in incident response',
        'Complete integration with 3+ existing tools'
      ]
    },
    {
      id: 'tpl_002',
      name: 'Healthcare Compliance POV',
      description: 'HIPAA-focused security validation for healthcare organizations',
      industry: 'Healthcare',
      scenarios: ['HIPAA Compliance Validation', 'Medical IoT Security', 'Patient Data Protection', 'Breach Response'],
      timeline: 30,
      objectives: [
        'Validate HIPAA compliance automation',
        'Secure medical device communications',
        'Protect patient data across systems',
        'Demonstrate rapid breach response'
      ],
      successCriteria: [
        'Achieve 100% HIPAA audit compliance',
        'Secure 100% of medical IoT devices',
        'Encrypt all patient data in transit',
        'Respond to breaches within 4 hours'
      ]
    },
    {
      id: 'tpl_003',
      name: 'Manufacturing OT Security POV',
      description: 'Operational technology security for manufacturing environments',
      industry: 'Manufacturing',
      scenarios: ['OT Network Visibility', 'Industrial Control Security', 'Supply Chain Protection', 'Production Continuity'],
      timeline: 60,
      objectives: [
        'Gain complete OT network visibility',
        'Secure industrial control systems',
        'Protect supply chain communications',
        'Ensure production uptime during security events'
      ],
      successCriteria: [
        'Map 100% of OT assets and communications',
        'Implement zero-trust for critical systems',
        'Monitor all supply chain connections',
        'Maintain 99.9% production uptime'
      ]
    }
  ];

  const customers = dcContextStore.getAllCustomerEngagements();
  const povs = dcContextStore.getAllActivePOVs();

  const handleCreatePOV = async () => {
    if (!formData.name || !formData.customerId) {
      actions.notify('error', 'Please provide POV name and select a customer');
      return;
    }

    setIsLoading(true);
    try {
      const povData: Omit<POVRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        customerId: formData.customerId,
        name: formData.name,
        status: 'planning',
        objectives: formData.objectives || [],
        scenarios: formData.scenarios || [],
        timeline: {
          planned: formData.timeline?.start || new Date().toISOString(),
          actual: undefined,
          milestones: formData.timeline?.milestones?.map(m => ({
            name: m.name,
            planned: m.date,
            actual: undefined
          })) || []
        },
        successMetrics: formData.successCriteria || [],
        resources: {
          dcHours: 40,
          seHours: 20,
          infrastructure: []
        },
        outcomes: {
          technicalWins: [],
          businessImpact: [],
          lessonsLearned: []
        },
        nextSteps: []
      };

      const response = await dcAPIClient.createPOV(povData);
      if (response.success && response.data) {
        actions.notify('success', `POV "${formData.name}" created successfully`);
        setShowCreateForm(false);
        setFormData({
          objectives: [],
          scenarios: [],
          successCriteria: [],
          resources: [],
          stakeholders: [],
          risks: [],
          timeline: { start: '', end: '', milestones: [] }
        });
      } else {
        actions.notify('error', response.error || 'Failed to create POV');
      }
    } catch (error) {
      actions.notify('error', `Failed to create POV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTemplate = (template: POVTemplate) => {
    setFormData({
      name: template.name,
      objectives: template.objectives,
      scenarios: template.scenarios.map((name, index) => ({
        id: `scenario_${index}`,
        name,
        type: 'security-assessment',
        status: 'planned',
        description: `${name} scenario for ${template.industry} industry`,
        estimatedDuration: 7,
        actualDuration: 0,
        successCriteria: template.successCriteria.slice(index, index + 1),
        outcomes: {
          completed: false,
          evidence: [],
          metrics: {},
          notes: ''
        }
      })),
      successCriteria: template.successCriteria,
      timeline: {
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + template.timeline * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        milestones: [
          {
            name: 'POV Kickoff',
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: 'Initial stakeholder meeting and scope confirmation',
            status: 'planned' as const
          },
          {
            name: 'Environment Setup',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: 'Technical environment configuration and testing',
            status: 'planned' as const
          },
          {
            name: 'Scenario Execution',
            date: new Date(Date.now() + (template.timeline - 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: 'Execute all POV scenarios and collect evidence',
            status: 'planned' as const
          },
          {
            name: 'Results Review',
            date: new Date(Date.now() + (template.timeline - 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: 'Review results with stakeholders and document outcomes',
            status: 'planned' as const
          }
        ]
      },
      resources: [
        { type: 'personnel', name: 'Domain Consultant', allocation: '100%' },
        { type: 'personnel', name: 'Customer Technical Lead', allocation: '50%' },
        { type: 'technical', name: 'Lab Environment', allocation: 'Full access' }
      ],
      stakeholders: [
        { name: 'CISO', role: 'Decision Maker', department: 'Security', influence: 'high', engagement: 'champion' },
        { name: 'Security Architect', role: 'Technical Evaluator', department: 'Security', influence: 'high', engagement: 'supporter' },
        { name: 'IT Director', role: 'Implementation Owner', department: 'IT', influence: 'medium', engagement: 'neutral' }
      ],
      risks: [
        {
          description: 'Stakeholder availability conflicts',
          impact: 'medium',
          probability: 'medium',
          mitigation: 'Schedule flexibility and backup resources',
          status: 'open'
        },
        {
          description: 'Technical integration challenges',
          impact: 'high',
          probability: 'low',
          mitigation: 'Pre-POV technical validation and fallback scenarios',
          status: 'open'
        }
      ]
    });
    setShowCreateForm(true);
    setActiveTab('create');
    actions.notify('success', `Template "${template.name}" loaded`);
  };

  const DashboardTab = () => (
    <div className="space-y-8">
      {/* POV Overview */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-cortex-text-primary">🎯 POV Portfolio Overview</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-modern button-hover-lift cortex-interactive px-4 py-2 bg-cortex-purple hover:bg-cortex-purple-dark text-white rounded transition-colors"
          >
            New POV
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="cortex-card-elevated p-4 text-center">
            <div className="text-3xl font-mono text-cortex-text-primary">{povs.length}</div>
            <div className="text-sm text-cortex-text-muted">Total POVs</div>
          </div>
          <div className="cortex-card-elevated p-4 text-center">
            <div className="text-3xl font-mono text-cortex-success">{povs.filter(p => p.status === 'executing').length}</div>
            <div className="text-sm text-cortex-text-muted">Active</div>
          </div>
          <div className="cortex-card-elevated p-4 text-center">
            <div className="text-3xl font-mono text-cortex-blue">{povs.filter(p => p.status === 'completed').length}</div>
            <div className="text-sm text-cortex-text-muted">Completed</div>
          </div>
          <div className="cortex-card-elevated p-4 text-center">
            <div className="text-3xl font-mono text-cortex-warning">{povs.filter(p => p.status === 'completed' && p.outcomes.technicalWins.length > 0).length}</div>
            <div className="text-sm text-cortex-text-muted">Successful</div>
          </div>
        </div>
      </div>

      {/* Active POVs */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-cortex-text-primary mb-4">🚀 Active POVs</h3>
        <div className="space-y-4">
          {povs.filter(pov => pov.status === 'executing' || pov.status === 'planning').map(pov => {
            const customer = customers.find(c => c.id === pov.customerId);
            const endDate = pov.timeline.actual || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            const daysRemaining = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const scenarioProgress = pov.scenarios.length > 0 ? 
              Math.round((pov.scenarios.filter(s => s.status === 'completed').length / pov.scenarios.length) * 100) : 0;
            
            return (
              <div key={pov.id} className="cortex-card p-4 cortex-interactive" onClick={() => setSelectedPOV(pov)}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-cortex-text-primary font-medium">{pov.name}</div>
                    <div className="text-sm text-cortex-text-muted">
                      Customer: {customer?.name || 'Unknown'} • {customer?.industry}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${{
                      'executing': 'bg-cortex-success/20 text-cortex-success border border-cortex-success/30',
                      'planning': 'bg-cortex-warning/20 text-cortex-warning border border-cortex-warning/30'
                    }[pov.status]}`}>
                      {pov.status}
                    </div>
                    <div className={`text-xs mt-1 ${daysRemaining < 7 ? 'text-cortex-error' : 'text-cortex-text-muted'}`}>
                      {daysRemaining} days remaining
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-cortex-text-muted">
                  <div>
                    Scenarios: {pov.scenarios.length} • Progress: {scenarioProgress}%
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPOV(pov);
                        setActiveTab('manage');
                      }}
                      className="text-cortex-blue hover:underline cortex-interactive"
                    >
                      Manage
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        setIsLoading(true);
                        try {
                          const customer = customers.find(c => c.id === pov.customerId);
                          if (customer) {
                            const context: DCWorkflowContext = {
                              workflowType: 'pov_planning',
                              customerProfile: {
                                industry: customer.industry,
                                size: customer.size,
                                maturityLevel: customer.maturityLevel,
                                primaryConcerns: customer.primaryConcerns
                              }
                            };
                            await dcAIClient.optimizePOVPlan(pov, context);
                            actions.notify('success', 'POV optimization recommendations generated');
                          }
                        } catch (error) {
                          actions.notify('error', 'Failed to generate recommendations');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="text-cortex-purple hover:underline cortex-interactive"
                      disabled={isLoading}
                    >
                      AI Optimize
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 w-full bg-cortex-bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cortex-purple to-cortex-blue h-2 rounded-full transition-all duration-300"
                    style={{ width: `${scenarioProgress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
          
          {povs.filter(pov => pov.status === 'executing' || pov.status === 'planning').length === 0 && (
            <div className="text-center py-8">
              <div className="text-cortex-text-muted text-lg mb-2">🎯 No Active POVs</div>
              <div className="text-cortex-text-secondary text-sm mb-4">Create your first POV to start managing customer engagements</div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-modern button-hover-lift cortex-interactive px-4 py-2 bg-cortex-purple hover:bg-cortex-purple-dark text-white rounded transition-colors"
              >
                Create First POV
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CreateTab = () => (
    <div className="space-y-6">
      {!showCreateForm ? (
        <>
          {/* Template Selection */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-cortex-text-primary mb-4">📋 POV Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {povTemplates.map(template => (
                <div key={template.id} className="cortex-card p-4 cortex-interactive button-hover-lift">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-cortex-text-primary font-medium">{template.name}</div>
                      <div className="text-sm text-cortex-text-muted">{template.industry}</div>
                    </div>
                    <div className="text-xs text-cortex-text-muted">{template.timeline} days</div>
                  </div>
                  
                  <div className="text-sm text-cortex-text-secondary mb-3 line-clamp-2">{template.description}</div>
                  
                  <div className="mb-3">
                    <div className="text-xs text-cortex-text-muted mb-1">Scenarios ({template.scenarios.length}):</div>
                    <div className="flex flex-wrap gap-1">
                      {template.scenarios.slice(0, 3).map((scenario, idx) => (
                        <span key={idx} className="text-xs bg-cortex-bg-secondary text-cortex-text-secondary px-2 py-1 rounded">
                          {scenario}
                        </span>
                      ))}
                      {template.scenarios.length > 3 && (
                        <span className="text-xs text-cortex-text-muted">+{template.scenarios.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full btn-modern button-hover-lift cortex-interactive px-3 py-2 bg-cortex-blue hover:bg-cortex-blue-dark text-white rounded transition-colors text-sm"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-modern button-hover-lift cortex-interactive px-6 py-3 bg-cortex-purple hover:bg-cortex-purple-dark text-white rounded-lg transition-colors"
            >
              Create Custom POV
            </button>
          </div>
        </>
      ) : (
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-cortex-text-primary">➕ Create New POV</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-cortex-text-muted hover:text-white cortex-interactive"
            >
              ✕ Cancel
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-2">POV Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-orange"
                placeholder="Enter POV name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-2">Customer *</label>
              <select
                value={formData.customerId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-orange"
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name} - {customer.industry}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-2">Start Date</label>
              <input
                type="date"
                value={formData.timeline?.start || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  timeline: { ...prev.timeline, start: e.target.value, end: prev.timeline?.end || '', milestones: prev.timeline?.milestones || [] }
                }))}
                className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-orange"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-2">End Date</label>
              <input
                type="date"
                value={formData.timeline?.end || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  timeline: { ...prev.timeline, start: prev.timeline?.start || '', end: e.target.value, milestones: prev.timeline?.milestones || [] }
                }))}
                className="w-full cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-orange"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">Objectives</label>
            <div className="space-y-2">
              {(formData.objectives || []).map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => {
                      const newObjectives = [...(formData.objectives || [])];
                      newObjectives[index] = e.target.value;
                      setFormData(prev => ({ ...prev, objectives: newObjectives }));
                    }}
                    className="flex-1 cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-orange"
                    placeholder="Enter objective"
                  />
                  <button
                    onClick={() => {
                      const newObjectives = (formData.objectives || []).filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, objectives: newObjectives }));
                    }}
                    className="btn-modern button-hover-lift cortex-interactive px-3 py-2 bg-cortex-error hover:bg-cortex-error-dark text-white rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => setFormData(prev => ({ ...prev, objectives: [...(prev.objectives || []), ''] }))}
                className="btn-modern button-hover-lift cortex-interactive px-3 py-2 bg-cortex-blue hover:bg-cortex-blue-dark text-white rounded text-sm"
              >
                Add Objective
              </button>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleCreatePOV}
              disabled={isLoading || !formData.name || !formData.customerId}
              className="btn-modern button-hover-lift cortex-interactive px-6 py-3 bg-cortex-purple hover:bg-cortex-purple-dark text-white rounded transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create POV'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="btn-modern button-hover-lift cortex-interactive px-6 py-3 bg-cortex-bg-secondary hover:bg-cortex-bg-hover text-cortex-text-primary rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const ManageTab = () => {
    if (!selectedPOV) {
      return (
        <div className="text-center py-12">
          <div className="text-cortex-text-muted text-lg mb-2">📋 No POV Selected</div>
          <div className="text-cortex-text-secondary text-sm mb-4">Select a POV from the dashboard to manage it</div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="btn-modern button-hover-lift cortex-interactive px-4 py-2 bg-cortex-blue hover:bg-cortex-blue-dark text-white rounded transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      );
    }

    const customer = customers.find(c => c.id === selectedPOV.customerId);
    const scenarioProgress = selectedPOV.scenarios.length > 0 ? 
      Math.round((selectedPOV.scenarios.filter(s => s.status === 'completed').length / selectedPOV.scenarios.length) * 100) : 0;

    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-cortex-text-primary">{selectedPOV.name}</h3>
              <div className="text-cortex-text-muted">Customer: {customer?.name} • {customer?.industry}</div>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded text-sm font-medium ${{
                'executing': 'bg-cortex-success/20 text-cortex-success border border-cortex-success/30',
                'completed': 'bg-cortex-blue/20 text-cortex-blue border border-cortex-blue/30',
                'planning': 'bg-cortex-warning/20 text-cortex-warning border border-cortex-warning/30'
              }[selectedPOV.status]}`}>
                {selectedPOV.status}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="cortex-card-elevated p-4 text-center">
              <div className="text-2xl font-mono text-cortex-text-primary">{selectedPOV.scenarios.length}</div>
              <div className="text-sm text-cortex-text-muted">Total Scenarios</div>
            </div>
            <div className="cortex-card-elevated p-4 text-center">
              <div className="text-2xl font-mono text-cortex-success">{selectedPOV.scenarios.filter(s => s.status === 'completed').length}</div>
              <div className="text-sm text-cortex-text-muted">Completed</div>
            </div>
            <div className="cortex-card-elevated p-4 text-center">
              <div className="text-2xl font-mono text-cortex-purple">{scenarioProgress}%</div>
              <div className="text-sm text-cortex-text-muted">Progress</div>
            </div>
            <div className="cortex-card-elevated p-4 text-center">
              <div className="text-2xl font-mono text-cortex-cyan">
                {Math.ceil((new Date(selectedPOV.timeline.actual || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-cortex-text-muted">Days Remaining</div>
            </div>
          </div>
          
          <div className="w-full bg-cortex-bg-secondary rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-cortex-purple to-cortex-blue h-3 rounded-full transition-all duration-300"
              style={{ width: `${scenarioProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Scenarios Management */}
        <div className="glass-card p-6">
          <h4 className="text-lg font-bold text-cortex-text-primary mb-4">🎬 Scenarios</h4>
          <div className="space-y-3">
            {selectedPOV.scenarios.map((scenario, index) => (
              <div key={scenario.id} className="cortex-card p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-cortex-text-primary font-medium">{scenario.name}</div>
                    <div className="text-sm text-cortex-text-muted">{scenario.type}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${{
                    'completed': 'bg-cortex-success/20 text-cortex-success border border-cortex-success/30',
                    'deployed': 'bg-cortex-blue/20 text-cortex-blue border border-cortex-blue/30',
                    'validated': 'bg-cortex-purple/20 text-cortex-purple border border-cortex-purple/30',
                    'planned': 'bg-cortex-warning/20 text-cortex-warning border border-cortex-warning/30'
                  }[scenario.status]}`}>
                    {scenario.status}
                  </div>
                </div>
                <div className="text-xs text-cortex-text-muted">
                  Status: {scenario.status} • Type: {scenario.type}
                  {scenario.results && (
                    <div className="text-xs text-cortex-blue mt-1">Results: {scenario.results}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Objectives */}
        <div className="glass-card p-6">
          <h4 className="text-lg font-bold text-cortex-text-primary mb-4">🎯 Objectives</h4>
          <div className="space-y-2">
            {selectedPOV.objectives.map((objective, index) => (
              <div key={index} className="flex items-center text-cortex-text-secondary">
                <span className="text-cortex-success mr-2">•</span>
                {objective}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-8">
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cortex-text-primary mb-2">POV Project Management</h1>
            <p className="text-cortex-text-muted">Comprehensive POV lifecycle management with AI-powered optimization</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-cortex-bg-secondary p-1 rounded-lg">
          {[{
            id: 'dashboard',
            label: 'Dashboard',
            desc: 'POV portfolio overview'
          }, {
            id: 'create',
            label: 'Create POV',
            desc: 'New POV creation'
          }, {
            id: 'manage',
            label: 'Manage',
            desc: 'POV lifecycle management'
          }, {
            id: 'templates',
            label: 'Templates',
            desc: 'POV templates & best practices'
          }, {
            id: 'analytics',
            label: 'Analytics',
            desc: 'Performance metrics'
          }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-4 py-2 text-center transition-colors rounded-md cortex-interactive ${
                activeTab === tab.id
                  ? 'bg-cortex-purple text-white'
                  : 'text-cortex-text-muted hover:text-white hover:bg-cortex-bg-hover'
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
          {activeTab === 'templates' && <div className="text-center py-12"><div className="text-cortex-text-muted">Templates coming soon...</div></div>}
          {activeTab === 'analytics' && <div className="text-center py-12"><div className="text-cortex-text-muted">Analytics coming soon...</div></div>}
        </div>
      </div>
    </div>
  );
};