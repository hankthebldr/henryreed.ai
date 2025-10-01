'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TRR, RiskAssessment, TRRStatusEvent, DORStatus, SDWStatus, AIPrediction } from '../types/trr';
import CortexButton from './CortexButton';
import CortexCommandButton from './CortexCommandButton';

// Dynamically import heavy visualization components
const TRRTimeline = dynamic(() => import('./TRRTimeline').then(mod => mod.TRRTimeline), {
  ssr: false,
  loading: () => <div className="text-center p-6 text-cortex-text-muted">Loading timeline...</div>
});

// Import new tab components
const TRRLifecycleTab = dynamic(() => import('./trr/TRRLifecycleTab'), {
  ssr: false,
  loading: () => <div className="text-center p-6 text-cortex-text-muted">Loading lifecycle...</div>
});

const TRRDORTab = dynamic(() => import('./trr/TRRDORTab'), {
  ssr: false,
  loading: () => <div className="text-center p-6 text-cortex-text-muted">Loading DOR...</div>
});

const TRRSDWTab = dynamic(() => import('./trr/TRRSDWTab'), {
  ssr: false,
  loading: () => <div className="text-center p-6 text-cortex-text-muted">Loading SDW...</div>
});

const TRRTestingTab = dynamic(() => import('./trr/TRRTestingTab'), {
  ssr: false,
  loading: () => <div className="text-center p-6 text-cortex-text-muted">Loading testing...</div>
});

const TRRCollaborationTab = dynamic(() => import('./trr/TRRCollaborationTab'), {
  ssr: false,
  loading: () => <div className="text-center p-6 text-cortex-text-muted">Loading collaboration...</div>
});

interface TRRDetailViewProps {
  trr: TRR;
  onEdit?: (trr: TRR) => void;
  onBack?: () => void;
}

const TRRDetailView: React.FC<TRRDetailViewProps> = ({ trr, onEdit, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'lifecycle' | 'dor' | 'sdw' | 'testing' | 'collaboration'>('overview');
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-cortex-error/10 text-cortex-error border-cortex-error/20';
      case 'high': return 'bg-cortex-warning/10 text-cortex-warning border-cortex-warning/20';
      case 'medium': return 'bg-cortex-info/10 text-cortex-info border-cortex-info/20';
      case 'low': return 'bg-cortex-success/10 text-cortex-success border-cortex-success/20';
      default: return 'bg-cortex-bg-tertiary text-cortex-text-muted border-cortex-border-secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-cortex-text-muted/10 text-cortex-text-muted border-cortex-border-secondary';
      case 'pending': return 'bg-cortex-warning/10 text-cortex-warning border-cortex-warning/20';
      case 'in-progress': return 'bg-cortex-info/10 text-cortex-info border-cortex-info/20';
      case 'in-review': return 'bg-cortex-info/10 text-cortex-info border-cortex-info/20';
      case 'validated': return 'bg-cortex-green/10 text-cortex-green border-cortex-green/20';
      case 'approved': return 'bg-cortex-success/10 text-cortex-success border-cortex-success/20';
      case 'completed': return 'bg-cortex-success/10 text-cortex-success border-cortex-success/20';
      case 'failed': return 'bg-cortex-error/10 text-cortex-error border-cortex-error/20';
      case 'rejected': return 'bg-cortex-error/10 text-cortex-error border-cortex-error/20';
      case 'deferred': return 'bg-cortex-text-muted/10 text-cortex-text-muted border-cortex-border-secondary';
      case 'not-applicable': return 'bg-cortex-bg-tertiary text-cortex-text-muted border-cortex-border-secondary';
      default: return 'bg-cortex-bg-tertiary text-cortex-text-muted border-cortex-border-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return '📝';
      case 'pending': return '⏳';
      case 'in-progress': return '🔄';
      case 'in-review': return '👀';
      case 'validated': return '✅';
      case 'approved': return '✅';
      case 'completed': return '🎉';
      case 'failed': return '❌';
      case 'rejected': return '❌';
      case 'deferred': return '⏸️';
      case 'not-applicable': return '⚪';
      default: return '❓';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-cortex-error/10 text-cortex-error border-cortex-error/20';
      case 'high': return 'bg-cortex-warning/10 text-cortex-warning border-cortex-warning/20';
      case 'medium': return 'bg-cortex-info/10 text-cortex-info border-cortex-info/20';
      case 'low': return 'bg-cortex-success/10 text-cortex-success border-cortex-success/20';
      default: return 'bg-cortex-bg-tertiary text-cortex-text-muted border-cortex-border-secondary';
    }
  };

  // Compute metrics
  const metrics = useMemo(() => {
    const riskScore = trr.riskAssessment?.score || calculateBasicRiskScore(trr);
    const completionProgress = calculateCompletionProgress(trr);
    const estimatedHours = trr.estimatedHours || 0;
    const actualHours = trr.actualHours || 0;
    const predictedHours = trr.aiPrediction?.predictedCompletionDate ? 
      calculatePredictedHours(trr.createdDate, trr.aiPrediction.predictedCompletionDate) : 0;

    return {
      riskScore,
      completionProgress,
      estimatedHours,
      actualHours,
      predictedHours,
      businessImpact: trr.businessImpact || 'medium',
    };
  }, [trr]);

  const calculateBasicRiskScore = (trr: TRR): number => {
    let score = 5; // baseline
    if (trr.priority === 'critical') score += 3;
    else if (trr.priority === 'high') score += 2;
    else if (trr.priority === 'medium') score += 1;
    
    if (trr.complexity === 'very-complex') score += 3;
    else if (trr.complexity === 'complex') score += 2;
    else if (trr.complexity === 'moderate') score += 1;
    
    return Math.min(score, 10);
  };

  const calculateCompletionProgress = (trr: TRR): number => {
    switch (trr.status) {
      case 'completed': return 100;
      case 'validated': return 95;
      case 'in-progress': 
        const testCasesCompleted = trr.testCases?.filter(tc => tc.status === 'passed' || tc.status === 'failed').length || 0;
        const totalTestCases = trr.testCases?.length || 1;
        return Math.round((testCasesCompleted / totalTestCases) * 80) + 15;
      case 'in-review': return 75;
      case 'pending': return 20;
      case 'draft': return 10;
      default: return 0;
    }
  };

  const calculatePredictedHours = (startDate: string, predictedEnd: string): number => {
    const start = new Date(startDate);
    const end = new Date(predictedEnd);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return Math.round(diffDays * 8); // Assuming 8 hours per day
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <CortexButton onClick={onBack} variant="outline" size="sm" icon="←">
              Back
            </CortexButton>
          )}
          <div>
            <h1 className="text-2xl font-bold text-cortex-text-primary flex items-center">
              {getStatusIcon(trr.status)} {trr.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-cortex-text-muted mt-1">
              <span className="font-mono">{trr.id}</span>
              <span>•</span>
              <span>v{trr.version || 1}</span>
              <span>•</span>
              <span>Updated {formatDate(trr.updatedDate)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {onEdit && (
            <CortexButton onClick={() => onEdit(trr)} variant="primary" icon="✏️">
              Edit
            </CortexButton>
          )}
          <CortexCommandButton
            command={`trr-signoff create ${trr.id}`}
            variant="outline"
            icon="⛓️"
            tooltip="Create blockchain signoff for this TRR"
          >
            Sign Off
          </CortexCommandButton>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="cortex-card p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-text-primary">{metrics.completionProgress}%</div>
            <div className="text-sm text-cortex-text-secondary">Complete</div>
            <div className="w-full bg-cortex-bg-tertiary rounded-full h-1.5 mt-1">
              <div 
                className="h-1.5 rounded-full bg-cortex-green transition-all duration-300"
                style={{ width: `${metrics.completionProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-warning">{metrics.riskScore}/10</div>
            <div className="text-sm text-cortex-text-secondary">Risk Score</div>
            <div className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
              metrics.riskScore >= 8 ? 'bg-cortex-error/10 text-cortex-error' :
              metrics.riskScore >= 6 ? 'bg-cortex-warning/10 text-cortex-warning' :
              metrics.riskScore >= 4 ? 'bg-cortex-info/10 text-cortex-info' :
              'bg-cortex-success/10 text-cortex-success'
            }`}>
              {metrics.riskScore >= 8 ? 'Critical' :
               metrics.riskScore >= 6 ? 'High' :
               metrics.riskScore >= 4 ? 'Medium' : 'Low'}
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              metrics.businessImpact === 'critical' ? 'text-cortex-error' :
              metrics.businessImpact === 'high' ? 'text-cortex-warning' :
              metrics.businessImpact === 'medium' ? 'text-cortex-info' :
              'text-cortex-success'
            }`}>
              {metrics.businessImpact.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm text-cortex-text-secondary">Business Impact</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-text-primary">{metrics.estimatedHours}h</div>
            <div className="text-sm text-cortex-text-secondary">Estimated</div>
            {metrics.actualHours > 0 && (
              <div className={`text-xs mt-1 ${
                metrics.actualHours > metrics.estimatedHours ? 'text-cortex-error' : 'text-cortex-success'
              }`}>
                {metrics.actualHours}h actual
              </div>
            )}
          </div>
          
          {trr.aiPrediction && (
            <div className="text-center">
              <div className="text-2xl font-bold text-cortex-info">{metrics.predictedHours}h</div>
              <div className="text-sm text-cortex-text-secondary">AI Predicted</div>
              <div className="text-xs mt-1 text-cortex-text-muted">
                {Math.round(trr.aiPrediction.confidence * 100)}% confident
              </div>
            </div>
          )}
          
          {trr.dueDate && (
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                new Date(trr.dueDate) < new Date() ? 'text-cortex-error' :
                new Date(trr.dueDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 ? 'text-cortex-warning' :
                'text-cortex-text-primary'
              }`}>
                {Math.ceil((new Date(trr.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-cortex-text-secondary">Days Left</div>
            </div>
          )}
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center space-x-3">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(trr.status)}`}>
          {getStatusIcon(trr.status)} {trr.status.replace('-', ' ').toUpperCase()}
        </span>
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(trr.priority)}`}>
          {trr.priority.toUpperCase()}
        </span>
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(trr.riskLevel)}`}>
          {trr.riskLevel.toUpperCase()} RISK
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="cortex-card">
        <div className="border-b border-cortex-border-secondary">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'lifecycle', label: 'Lifecycle', icon: '🔄' },
              { id: 'dor', label: 'DOR', icon: '✅' },
              { id: 'sdw', label: 'SDW', icon: '🚀' },
              { id: 'testing', label: 'Testing', icon: '🧪' },
              { id: 'collaboration', label: 'Collaboration', icon: '👥' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-cortex-green text-cortex-green'
                    : 'border-transparent text-cortex-text-muted hover:text-cortex-text-secondary hover:border-cortex-border-secondary'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-cortex-text-primary mb-3">Description</h3>
                <p className="text-cortex-text-secondary leading-relaxed">{trr.description}</p>
              </div>

              {/* DOR Compliance Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-cortex-text-primary flex items-center">
                    📋 Definition of Ready (DOR) Compliance
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      trr.dorStatus?.isReady 
                        ? 'bg-cortex-success/10 text-cortex-success border-cortex-success/20' 
                        : 'bg-cortex-error/10 text-cortex-error border-cortex-error/20'
                    }`}>
                      {trr.dorStatus?.isReady ? '✅ Ready' : '❌ Not Ready'}
                    </span>
                    {trr.dorStatus?.score !== undefined && (
                      <span className="text-sm text-cortex-text-muted">
                        Score: {Math.round(trr.dorStatus.score)}%
                      </span>
                    )}
                  </div>
                </div>
                
                {trr.dorStatus?.unmetCriteria?.length > 0 && (
                  <div className="bg-cortex-error/5 border border-cortex-error/20 rounded-lg p-4">
                    <h4 className="font-medium text-cortex-error mb-2">Unmet Criteria:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {trr.dorStatus.unmetCriteria.map((criterion, idx) => (
                        <li key={idx} className="text-cortex-text-secondary">{criterion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {trr.dorStatus?.isReady && (
                  <div className="bg-cortex-success/5 border border-cortex-success/20 rounded-lg p-4">
                    <p className="text-cortex-success">✅ All DOR criteria have been met. This TRR is ready for execution.</p>
                  </div>
                )}
              </div>

              {/* SDW Progress Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-cortex-text-primary flex items-center">
                    🚀 Software Development Workflow (SDW) Progress
                  </h3>
                  <div className="px-3 py-1 bg-cortex-info/10 text-cortex-info border border-cortex-info/20 rounded-full text-sm font-medium">
                    Stage: {trr.sdwStatus?.stage || 'requirements'}
                  </div>
                </div>
                
                {trr.sdwStatus?.approvals && trr.sdwStatus.approvals.length > 0 && (
                  <div className="space-y-3">
                    {trr.sdwStatus.approvals.map((approval, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-cortex-bg-tertiary rounded-lg border border-cortex-border-secondary">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            approval.status === 'approved' ? 'bg-cortex-success' :
                            approval.status === 'rejected' ? 'bg-cortex-error' :
                            'bg-cortex-warning'
                          }`}></div>
                          <div>
                            <div className="font-medium text-cortex-text-primary capitalize">
                              {approval.role.replace('-', ' ')}
                            </div>
                            {approval.userId && (
                              <div className="text-sm text-cortex-text-muted">Assigned to user {approval.userId}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            approval.status === 'approved' ? 'bg-cortex-success/10 text-cortex-success' :
                            approval.status === 'rejected' ? 'bg-cortex-error/10 text-cortex-error' :
                            'bg-cortex-warning/10 text-cortex-warning'
                          }`}>
                            {approval.status.toUpperCase()}
                          </span>
                          {approval.timestamp && (
                            <span className="text-xs text-cortex-text-muted">
                              {formatDate(approval.timestamp)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Next Approver */}
                {trr.sdwStatus?.approvals && (
                  <div className="mt-4 p-3 bg-cortex-info/5 border border-cortex-info/20 rounded-lg">
                    <div className="text-sm text-cortex-info font-medium">
                      Next: {trr.sdwStatus.approvals.find(a => a.status === 'pending')?.role.replace('-', ' ') || 'All approvals complete'}
                    </div>
                  </div>
                )}
              </div>

              {/* Expected Outcome */}
              <div>
                <h3 className="text-lg font-semibold text-cortex-text-primary mb-3">Expected Outcome</h3>
                <p className="text-cortex-text-secondary bg-cortex-bg-tertiary p-4 rounded-lg border border-cortex-border-secondary">
                  {trr.expectedOutcome}
                </p>
              </div>

              {/* AI Prediction */}
              {trr.aiPrediction && (
                <div className="bg-cortex-info/5 border border-cortex-info/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-cortex-text-primary mb-3 flex items-center">
                    🤖 AI Prediction
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trr.aiPrediction.predictedCompletionDate && (
                      <div>
                        <div className="text-sm text-cortex-text-muted">Predicted Completion</div>
                        <div className="text-lg font-semibold text-cortex-info">
                          {formatDate(trr.aiPrediction.predictedCompletionDate)}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-cortex-text-muted">Confidence Level</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-cortex-bg-tertiary rounded-full h-2">
                          <div 
                            className="h-2 bg-cortex-info rounded-full transition-all duration-300"
                            style={{ width: `${trr.aiPrediction.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-cortex-info">
                          {Math.round(trr.aiPrediction.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {trr.aiPrediction.rationale && (
                    <div className="mt-3 text-sm text-cortex-text-secondary italic">
                      "{trr.aiPrediction.rationale}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'lifecycle' && (
            <TRRLifecycleTab 
              trr={trr}
              onStatusChange={(newStatus, note) => {
                // Handle status change
                console.log('Status change:', newStatus, note);
              }}
              onAddEvent={(event) => {
                // Handle add event
                console.log('Add event:', event);
              }}
            />
          )}

          {activeTab === 'dor' && (
            <TRRDORTab 
              trr={trr}
              onUpdateDOR={(dorStatus) => {
                // Handle DOR update
                console.log('DOR update:', dorStatus);
              }}
              onRunAIVerification={() => {
                // Handle AI verification
                console.log('Run AI verification');
              }}
            />
          )}

          {activeTab === 'sdw' && (
            <TRRSDWTab 
              trr={trr}
              onUpdateApproval={(role, status, note) => {
                // Handle approval update
                console.log('Approval update:', role, status, note);
              }}
              onRequestApproval={(role) => {
                // Handle approval request
                console.log('Request approval:', role);
              }}
            />
          )}

          {activeTab === 'testing' && (
            <TRRTestingTab 
              trr={trr}
              onUpdateTestCase={(testCaseId, updates) => {
                // Handle test case update
                console.log('Test case update:', testCaseId, updates);
              }}
              onAddTestCase={(testCase) => {
                // Handle add test case
                console.log('Add test case:', testCase);
              }}
              onDeleteTestCase={(testCaseId) => {
                // Handle delete test case
                console.log('Delete test case:', testCaseId);
              }}
              onRunTest={(testCaseId) => {
                // Handle run test
                console.log('Run test:', testCaseId);
              }}
              onUpdateAcceptanceCriteria={(criteria) => {
                // Handle acceptance criteria update
                console.log('Acceptance criteria update:', criteria);
              }}
            />
          )}
          {activeTab === 'collaboration' && (
            <TRRCollaborationTab 
              trr={trr}
              comments={[]}
              activities={[]}
              currentUserId={'current-user'}
              currentUserName={'Current User'}
              onAddComment={(content, mentions, parentId) => {
                // Handle add comment
                console.log('Add comment:', content, mentions, parentId);
              }}
              onEditComment={(commentId, content) => {
                // Handle edit comment
                console.log('Edit comment:', commentId, content);
              }}
              onDeleteComment={(commentId) => {
                // Handle delete comment
                console.log('Delete comment:', commentId);
              }}
              onAddReaction={(commentId, emoji) => {
                // Handle add reaction
                console.log('Add reaction:', commentId, emoji);
              }}
              onRemoveReaction={(commentId, emoji) => {
                // Handle remove reaction
                console.log('Remove reaction:', commentId, emoji);
              }}
              onMention={(userIds) => {
                // Handle mention
                console.log('Mention users:', userIds);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TRRDetailView;
