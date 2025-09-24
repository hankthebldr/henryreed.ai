'use client';

import React from 'react';
import { TRR, SDWStatus } from '../../types/trr';
import { CortexButton } from '../CortexButton';

interface TRRSDWTabProps {
  trr: TRR;
  onUpdateApproval?: (role: string, status: 'approved' | 'rejected', note?: string) => void;
  onRequestApproval?: (role: string) => void;
}

// Software Development Workflow stages and their required roles
const SDW_STAGES = {
  'requirements': {
    title: 'Requirements Review',
    icon: '📋',
    description: 'Initial requirements validation and sign-off',
    requiredRoles: ['Product Owner', 'Business Analyst', 'Technical Lead'],
    duration: '2-3 days'
  },
  'design': {
    title: 'Technical Design',
    icon: '🎨',
    description: 'Architecture and technical design approval',
    requiredRoles: ['Solution Architect', 'Technical Lead', 'Security Lead'],
    duration: '3-5 days'
  },
  'implementation': {
    title: 'Implementation Ready',
    icon: '⚙️',
    description: 'Development environment and resources prepared',
    requiredRoles: ['Technical Lead', 'DevOps Engineer', 'QA Lead'],
    duration: '1-2 days'
  },
  'testing': {
    title: 'Testing Strategy',
    icon: '🧪',
    description: 'Test plans and quality assurance approval',
    requiredRoles: ['QA Lead', 'Test Manager', 'Security Lead'],
    duration: '2-3 days'
  },
  'deployment': {
    title: 'Deployment Ready',
    icon: '🚀',
    description: 'Production deployment and go-live approval',
    requiredRoles: ['DevOps Engineer', 'Release Manager', 'Product Owner'],
    duration: '1-2 days'
  }
};

export const TRRSDWTab: React.FC<TRRSDWTabProps> = ({
  trr,
  onUpdateApproval,
  onRequestApproval,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getApprovalStatusIcon = (status: string): string => {
    const icons = {
      'pending': '⏳',
      'approved': '✅',
      'rejected': '❌',
      'not-required': '➖'
    };
    return icons[status as keyof typeof icons] || '❓';
  };

  const getApprovalStatusColor = (status: string): string => {
    const colors = {
      'pending': 'text-cortex-warning bg-cortex-warning/10',
      'approved': 'text-cortex-success bg-cortex-success/10',
      'rejected': 'text-cortex-error bg-cortex-error/10',
      'not-required': 'text-cortex-text-muted bg-cortex-bg-hover'
    };
    return colors[status as keyof typeof colors] || 'text-cortex-text-muted bg-cortex-bg-hover';
  };

  const getStageProgress = (stage: string): number => {
    if (!trr.sdwStatus?.approvals) return 0;
    
    const stageConfig = SDW_STAGES[stage as keyof typeof SDW_STAGES];
    if (!stageConfig) return 0;

    const approvals = trr.sdwStatus.approvals.filter(approval => 
      stageConfig.requiredRoles.includes(approval.role)
    );
    
    const approvedCount = approvals.filter(approval => approval.status === 'approved').length;
    return Math.round((approvedCount / stageConfig.requiredRoles.length) * 100);
  };

  const isStageComplete = (stage: string): boolean => {
    return getStageProgress(stage) === 100;
  };

  const isStageActive = (stage: string): boolean => {
    if (!trr.sdwStatus) return stage === 'requirements';
    return trr.sdwStatus.stage === stage;
  };

  const getCurrentStageIndex = (): number => {
    if (!trr.sdwStatus) return 0;
    return Object.keys(SDW_STAGES).indexOf(trr.sdwStatus.stage);
  };

  const getNextApprover = (): string | null => {
    if (!trr.sdwStatus?.approvals) return null;
    
    const currentStage = trr.sdwStatus.stage;
    const stageConfig = SDW_STAGES[currentStage as keyof typeof SDW_STAGES];
    if (!stageConfig) return null;

    const pendingApproval = trr.sdwStatus.approvals.find(approval => 
      stageConfig.requiredRoles.includes(approval.role) && approval.status === 'pending'
    );

    return pendingApproval?.role || null;
  };

  const calculateOverallProgress = (): number => {
    const stages = Object.keys(SDW_STAGES);
    const totalProgress = stages.reduce((sum, stage) => sum + getStageProgress(stage), 0);
    return Math.round(totalProgress / stages.length);
  };

  const nextApprover = getNextApprover();
  const overallProgress = calculateOverallProgress();
  const currentStageIndex = getCurrentStageIndex();

  return (
    <div className="space-y-6">
      {/* SDW Overview */}
      <div className="cortex-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-cortex-text-primary">
            Software Development Workflow
          </h3>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-cortex-info">
                {overallProgress}%
              </p>
              <p className="text-sm text-cortex-text-muted">Complete</p>
            </div>
            
            {nextApprover && (
              <div className="text-right">
                <p className="text-sm text-cortex-text-muted">Next Approver:</p>
                <p className="font-semibold text-cortex-warning">
                  {nextApprover}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-cortex-text-muted">Overall Progress</span>
            <span className="font-medium text-cortex-text-primary">{overallProgress}%</span>
          </div>
          <div className="w-full bg-cortex-bg-tertiary rounded-full h-3">
            <div 
              className="bg-cortex-info h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Current Stage */}
        {trr.sdwStatus && (
          <div className="bg-cortex-bg-tertiary p-4 rounded-lg border-l-4 border-cortex-info">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {SDW_STAGES[trr.sdwStatus.stage as keyof typeof SDW_STAGES]?.icon || '📄'}
              </span>
              <div>
                <h4 className="font-semibold text-cortex-text-primary">
                  Current Stage: {SDW_STAGES[trr.sdwStatus.stage as keyof typeof SDW_STAGES]?.title || trr.sdwStatus.stage}
                </h4>
                <p className="text-sm text-cortex-text-secondary">
                  {SDW_STAGES[trr.sdwStatus.stage as keyof typeof SDW_STAGES]?.description || 'Stage in progress'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SDW Stages */}
      <div className="space-y-4">
        {Object.entries(SDW_STAGES).map(([stageKey, stage], index) => {
          const progress = getStageProgress(stageKey);
          const isComplete = isStageComplete(stageKey);
          const isActive = isStageActive(stageKey);
          const isPast = index < currentStageIndex;
          const isFuture = index > currentStageIndex;
          
          return (
            <div key={stageKey} className={`cortex-card overflow-hidden ${
              isActive ? 'ring-2 ring-cortex-info' : ''
            }`}>
              {/* Stage Header */}
              <div className={`p-4 ${
                isComplete ? 'bg-cortex-success/5' :
                isActive ? 'bg-cortex-info/5' :
                isFuture ? 'bg-cortex-bg-hover' : 'bg-cortex-bg-tertiary'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{stage.icon}</span>
                    <div>
                      <h4 className={`font-semibold ${
                        isComplete ? 'text-cortex-success' :
                        isActive ? 'text-cortex-info' :
                        isFuture ? 'text-cortex-text-muted' : 'text-cortex-text-primary'
                      }`}>
                        {stage.title}
                      </h4>
                      <p className="text-sm text-cortex-text-secondary">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Stage Status */}
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      isComplete ? 'bg-cortex-success/10 text-cortex-success' :
                      isActive ? 'bg-cortex-info/10 text-cortex-info' :
                      isPast ? 'bg-cortex-success/10 text-cortex-success' :
                      'bg-cortex-text-muted/10 text-cortex-text-muted'
                    }`}>
                      {progress}%
                    </div>
                    
                    {/* Duration */}
                    <div className="text-xs text-cortex-text-muted">
                      {stage.duration}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-cortex-bg-secondary rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isComplete ? 'bg-cortex-success' :
                      isActive ? 'bg-cortex-info' :
                      isPast ? 'bg-cortex-success' : 'bg-cortex-text-muted'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Stage Approvals */}
              <div className="p-4 space-y-3">
                {stage.requiredRoles.map(role => {
                  const approval = trr.sdwStatus?.approvals.find(a => a.role === role);
                  const status = approval?.status || 'pending';
                  
                  return (
                    <div key={role} className={`flex items-center justify-between p-3 rounded-lg border ${
                      status === 'approved' ? 'bg-cortex-success/5 border-cortex-success/20' :
                      status === 'rejected' ? 'bg-cortex-error/5 border-cortex-error/20' :
                      status === 'pending' ? 'bg-cortex-warning/5 border-cortex-warning/20' :
                      'bg-cortex-bg-hover border-cortex-border-secondary'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {getApprovalStatusIcon(status)}
                        </span>
                        <div>
                          <h5 className="font-medium text-cortex-text-primary">
                            {role}
                          </h5>
                          {approval?.userId && (
                            <p className="text-sm text-cortex-text-muted">
                              {approval.userId}
                            </p>
                          )}
                          {approval?.timestamp && (
                            <p className="text-xs text-cortex-text-muted">
                              {formatDate(approval.timestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatusColor(status)}`}>
                          {status.toUpperCase()}
                        </span>
                        
                        {status === 'pending' && isActive && onRequestApproval && (
                          <CortexButton
                            onClick={() => onRequestApproval(role)}
                            variant="outline"
                            size="sm"
                            icon="📧"
                          >
                            Request
                          </CortexButton>
                        )}
                        
                        {status === 'pending' && isActive && onUpdateApproval && (
                          <div className="flex space-x-1">
                            <CortexButton
                              onClick={() => onUpdateApproval(role, 'approved')}
                              variant="outline"
                              size="sm"
                              icon="✅"
                            >
                              Approve
                            </CortexButton>
                            <CortexButton
                              onClick={() => onUpdateApproval(role, 'rejected')}
                              variant="outline"
                              size="sm"
                              icon="❌"
                            >
                              Reject
                            </CortexButton>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* SDW Metrics */}
      <div className="cortex-card p-6">
        <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">
          Workflow Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Approvals */}
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-info">
              {trr.sdwStatus?.approvals.filter(a => a.status === 'approved').length || 0}
            </div>
            <p className="text-sm text-cortex-text-muted">Approvals</p>
          </div>
          
          {/* Pending Approvals */}
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-warning">
              {trr.sdwStatus?.approvals.filter(a => a.status === 'pending').length || 0}
            </div>
            <p className="text-sm text-cortex-text-muted">Pending</p>
          </div>
          
          {/* Rejected Approvals */}
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-error">
              {trr.sdwStatus?.approvals.filter(a => a.status === 'rejected').length || 0}
            </div>
            <p className="text-sm text-cortex-text-muted">Rejections</p>
          </div>
          
          {/* Current Stage */}
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-green">
              {currentStageIndex + 1}/{Object.keys(SDW_STAGES).length}
            </div>
            <p className="text-sm text-cortex-text-muted">Stage</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {isActive && (
        <div className="cortex-card p-6">
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">
            Quick Actions
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {nextApprover && onRequestApproval && (
              <CortexButton
                onClick={() => onRequestApproval(nextApprover)}
                variant="primary"
                icon="📧"
              >
                Request Approval from {nextApprover}
              </CortexButton>
            )}
            
            <CortexButton
              variant="outline"
              icon="👥"
              onClick={() => {
                // Open assignee modal
              }}
            >
              Update Approvers
            </CortexButton>
            
            <CortexButton
              variant="outline"
              icon="📊"
              onClick={() => {
                // Show detailed metrics
              }}
            >
              View Detailed Metrics
            </CortexButton>
            
            <CortexButton
              variant="outline"
              icon="📋"
              onClick={() => {
                // Export approval report
              }}
            >
              Export Report
            </CortexButton>
          </div>
        </div>
      )}

      {/* Workflow History */}
      {trr.sdwStatus?.approvals && trr.sdwStatus.approvals.length > 0 && (
        <div className="cortex-card p-6">
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">
            Approval History
          </h3>
          
          <div className="space-y-3">
            {trr.sdwStatus.approvals
              .filter(approval => approval.timestamp)
              .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
              .slice(0, 10)
              .map((approval, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-cortex-bg-hover rounded-lg">
                  <span className="text-lg">
                    {getApprovalStatusIcon(approval.status)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-cortex-text-primary">
                        {approval.role}
                      </h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatusColor(approval.status)}`}>
                        {approval.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-cortex-text-secondary">
                      {approval.userId || 'Unknown user'}
                    </p>
                    {approval.timestamp && (
                      <p className="text-xs text-cortex-text-muted">
                        {formatDate(approval.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default TRRSDWTab;