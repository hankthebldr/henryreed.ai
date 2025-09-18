'use client';

import React from 'react';
import { TRR } from './TRRManagement';
import { CortexButton } from './CortexButton';
import { CortexCommandButton } from './CortexCommandButton';

interface TRRDetailViewProps {
  trr: TRR;
}

const TRRDetailView: React.FC<TRRDetailViewProps> = ({ trr }) => {
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
      case 'approved': return 'bg-cortex-success/10 text-cortex-success border-cortex-success/20';
      case 'in-review': return 'bg-cortex-warning/10 text-cortex-warning border-cortex-warning/20';
      case 'rejected': return 'bg-cortex-error/10 text-cortex-error border-cortex-error/20';
      case 'draft': return 'bg-cortex-info/10 text-cortex-info border-cortex-info/20';
      default: return 'bg-cortex-bg-tertiary text-cortex-text-muted border-cortex-border-secondary';
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

  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <div className="cortex-card">
        <div className="p-6">
          <h2 className="text-xl font-bold text-cortex-text-primary mb-4">Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-1">Status</label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(trr.status)}`}>
                {trr.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-1">Priority</label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(trr.priority)}`}>
                {trr.priority.toUpperCase()}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-1">Risk Level</label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(trr.riskLevel)}`}>
                {trr.riskLevel.toUpperCase()}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-1">Version</label>
              <span className="text-cortex-text-primary font-mono">v{trr.version}</span>
            </div>
          </div>

          <div className="prose prose-cortex max-w-none">
            <h3 className="text-lg font-semibold text-cortex-text-primary mb-2">Description</h3>
            <p className="text-cortex-text-secondary mb-4">{trr.description}</p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pt-6 border-t border-cortex-border-secondary">
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-1">Assigned To</label>
              <p className="text-cortex-text-primary">{trr.assignedTo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-1">Customer</label>
              <p className="text-cortex-text-primary">{trr.customer}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-1">Due Date</label>
              <p className="text-cortex-text-primary">{formatDate(trr.dueDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-1">Created</label>
              <p className="text-cortex-text-primary">{formatDate(trr.createdDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-1">Last Updated</label>
              <p className="text-cortex-text-primary">{formatDate(trr.updatedDate)}</p>
            </div>
            {trr.estimatedHours && (
              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-1">Estimated Hours</label>
                <p className="text-cortex-text-primary">{trr.estimatedHours}h</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {trr.tags.length > 0 && (
        <div className="cortex-card">
          <div className="p-6">
            <h2 className="text-xl font-bold text-cortex-text-primary mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {trr.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-cortex-bg-tertiary text-cortex-text-muted rounded-full border border-cortex-border-secondary text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Technical Requirements */}
      <div className="cortex-card">
        <div className="p-6">
          <h2 className="text-xl font-bold text-cortex-text-primary mb-4">Technical Requirements</h2>
          <div className="space-y-4">
            {trr.technicalRequirements.map((req, index) => (
              <div key={index} className="p-4 bg-cortex-bg-tertiary rounded-lg border border-cortex-border-secondary">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-cortex-text-primary">{req.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(req.priority)}`}>
                    {req.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-cortex-text-secondary text-sm mb-2">{req.description}</p>
                <div className="flex items-center space-x-4 text-xs text-cortex-text-muted">
                  <span>Category: {req.category}</span>
                  {req.estimatedHours && <span>Est. {req.estimatedHours}h</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comments */}
      {trr.comments.length > 0 && (
        <div className="cortex-card">
          <div className="p-6">
            <h2 className="text-xl font-bold text-cortex-text-primary mb-4">Comments</h2>
            <div className="space-y-4">
              {trr.comments.map((comment, index) => (
                <div key={index} className="p-4 bg-cortex-bg-tertiary rounded-lg border border-cortex-border-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-cortex-text-primary">{comment.author}</span>
                    <span className="text-xs text-cortex-text-muted">{formatDate(comment.timestamp)}</span>
                  </div>
                  <p className="text-cortex-text-secondary">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="cortex-card">
        <div className="p-6">
          <h2 className="text-xl font-bold text-cortex-text-primary mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <CortexButton variant="primary" icon="✏️">
              Edit TRR
            </CortexButton>
            <CortexButton variant="outline" icon="📋">
              Duplicate
            </CortexButton>
            <CortexButton variant="outline" icon="📄">
              Export PDF
            </CortexButton>
            <CortexButton variant="outline" icon="📊">
              Generate Report
            </CortexButton>
            <CortexCommandButton
              command={`trr-signoff create ${trr.id}`}
              variant="outline"
              icon="⛓️"
              tooltip="Create blockchain signoff for this TRR"
            >
              Create Signoff
            </CortexCommandButton>
          </div>
        </div>
      </div>

      {/* Workflow Information */}
      <div className="cortex-card">
        <div className="p-6">
          <h2 className="text-xl font-bold text-cortex-text-primary mb-4">Workflow Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-1">Current Stage</label>
              <p className="text-cortex-text-primary capitalize">{trr.workflowStage}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-1">Dependencies</label>
              <p className="text-cortex-text-primary">{trr.dependencies.length} items</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-1">Blocked By</label>
              <p className="text-cortex-text-primary">{trr.blockedBy.length} items</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TRRDetailView;