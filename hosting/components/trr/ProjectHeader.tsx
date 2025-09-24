'use client';

import React from 'react';
import { Portfolio, Project } from '../../types/trr';
import { CortexButton } from '../CortexButton';

interface ProjectHeaderProps {
  selectedPortfolio: Portfolio | null;
  selectedProject: Project | null;
  onClearSelection: () => void;
  onSelectPortfolio: (portfolioId: string) => void;
  onSelectProject?: (projectId: string) => void;
  trrCount?: number;
  onCreateTRR?: () => void;
  onManageProject?: () => void;
  showStats?: boolean;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  selectedPortfolio,
  selectedProject,
  onClearSelection,
  onSelectPortfolio,
  onSelectProject,
  trrCount = 0,
  onCreateTRR,
  onManageProject,
  showStats = true,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-cortex-green/10 text-cortex-green border-cortex-green/20';
      case 'planning': return 'bg-cortex-info/10 text-cortex-info border-cortex-info/20';
      case 'completed': return 'bg-cortex-text-muted/10 text-cortex-text-muted border-cortex-border-secondary';
      case 'on-hold': return 'bg-cortex-warning/10 text-cortex-warning border-cortex-warning/20';
      case 'cancelled': return 'bg-cortex-error/10 text-cortex-error border-cortex-error/20';
      default: return 'bg-cortex-bg-tertiary text-cortex-text-muted border-cortex-border-secondary';
    }
  };

  const getProjectStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🚀';
      case 'planning': return '📋';
      case 'completed': return '✅';
      case 'on-hold': return '⏸️';
      case 'cancelled': return '❌';
      default: return '📂';
    }
  };

  const calculateProjectProgress = () => {
    if (!selectedProject) return 0;
    
    if (selectedProject.status === 'completed') return 100;
    if (selectedProject.status === 'cancelled') return 0;
    if (selectedProject.status === 'planning') return 10;
    
    // For active projects, calculate based on dates
    if (selectedProject.startDate && selectedProject.endDate) {
      const start = new Date(selectedProject.startDate);
      const end = new Date(selectedProject.endDate);
      const now = new Date();
      
      if (now < start) return 10;
      if (now > end) return 90;
      
      const total = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      return Math.min(Math.max(Math.round((elapsed / total) * 100), 10), 90);
    }
    
    return 50; // Default for active projects without dates
  };

  const calculateDaysRemaining = () => {
    if (!selectedProject?.endDate) return null;
    
    const end = new Date(selectedProject.endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const progress = calculateProjectProgress();
  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="bg-cortex-bg-tertiary rounded-lg border border-cortex-border-secondary mb-6">
      {/* Breadcrumb Navigation */}
      <div className="px-6 py-4 border-b border-cortex-border-secondary">
        <div className="flex items-center text-sm">
          <button
            onClick={onClearSelection}
            className="text-cortex-text-secondary hover:text-cortex-green transition-colors font-medium"
          >
            🏠 All Projects
          </button>
          
          {selectedPortfolio && (
            <>
              <span className="mx-2 text-cortex-text-muted">/</span>
              <button
                onClick={() => onSelectPortfolio(selectedPortfolio.id)}
                className={`font-medium transition-colors ${
                  selectedProject 
                    ? 'text-cortex-text-secondary hover:text-cortex-green' 
                    : 'text-cortex-green'
                }`}
              >
                💼 {selectedPortfolio.name}
              </button>
            </>
          )}
          
          {selectedProject && (
            <>
              <span className="mx-2 text-cortex-text-muted">/</span>
              <span className="text-cortex-green font-medium flex items-center">
                {getProjectStatusIcon(selectedProject.status)} {selectedProject.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Project Details */}
      {selectedProject && (
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-cortex-text-primary">
                  {selectedProject.name}
                </h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getProjectStatusColor(selectedProject.status)}`}>
                  {getProjectStatusIcon(selectedProject.status)} {selectedProject.status.toUpperCase()}
                </span>
              </div>
              
              {selectedProject.description && (
                <p className="text-cortex-text-secondary mb-4 leading-relaxed">
                  {selectedProject.description}
                </p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3 ml-6">
              {onManageProject && (
                <CortexButton
                  onClick={onManageProject}
                  variant="outline"
                  size="sm"
                  icon="⚙️"
                >
                  Manage
                </CortexButton>
              )}
              {onCreateTRR && (
                <CortexButton
                  onClick={onCreateTRR}
                  variant="primary"
                  size="sm"
                  icon="➕"
                >
                  New TRR
                </CortexButton>
              )}
            </div>
          </div>

          {/* Project Stats */}
          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Progress */}
              <div>
                <div className="text-sm text-cortex-text-muted mb-1">Progress</div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="w-full bg-cortex-bg-secondary rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progress >= 90 ? 'bg-cortex-success' :
                          progress >= 70 ? 'bg-cortex-green' :
                          progress >= 40 ? 'bg-cortex-info' :
                          progress >= 20 ? 'bg-cortex-warning' :
                          'bg-cortex-error'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-cortex-text-primary">
                    {progress}%
                  </span>
                </div>
              </div>

              {/* TRR Count */}
              <div>
                <div className="text-sm text-cortex-text-muted mb-1">TRRs</div>
                <div className="text-2xl font-bold text-cortex-text-primary">
                  {trrCount}
                </div>
              </div>

              {/* Timeline */}
              {selectedProject.startDate && selectedProject.endDate && (
                <div>
                  <div className="text-sm text-cortex-text-muted mb-1">Timeline</div>
                  <div className="text-sm text-cortex-text-primary">
                    {formatDate(selectedProject.startDate)} — {formatDate(selectedProject.endDate)}
                  </div>
                </div>
              )}

              {/* Days Remaining */}
              {daysRemaining !== null && (
                <div>
                  <div className="text-sm text-cortex-text-muted mb-1">
                    {daysRemaining > 0 ? 'Days Remaining' : 'Days Overdue'}
                  </div>
                  <div className={`text-2xl font-bold ${
                    daysRemaining > 30 ? 'text-cortex-text-primary' :
                    daysRemaining > 7 ? 'text-cortex-warning' :
                    daysRemaining >= 0 ? 'text-cortex-error' :
                    'text-cortex-error'
                  }`}>
                    {Math.abs(daysRemaining)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Portfolio Details (when no project selected) */}
      {selectedPortfolio && !selectedProject && (
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-cortex-text-primary">
                  {selectedPortfolio.name}
                </h1>
              </div>
              
              {selectedPortfolio.description && (
                <p className="text-cortex-text-secondary mb-4 leading-relaxed">
                  {selectedPortfolio.description}
                </p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3 ml-6">
              {onCreateTRR && (
                <CortexButton
                  onClick={onCreateTRR}
                  variant="primary"
                  size="sm"
                  icon="➕"
                >
                  New TRR
                </CortexButton>
              )}
            </div>
          </div>

          {/* Portfolio Stats */}
          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-cortex-text-muted mb-1">Total TRRs</div>
                <div className="text-2xl font-bold text-cortex-text-primary">
                  {trrCount}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-cortex-text-muted mb-1">Created</div>
                <div className="text-sm text-cortex-text-primary">
                  {formatDate(selectedPortfolio.createdDate)}
                </div>
              </div>

              <div>
                <div className="text-sm text-cortex-text-muted mb-1">Last Updated</div>
                <div className="text-sm text-cortex-text-primary">
                  {formatDate(selectedPortfolio.updatedDate)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectHeader;