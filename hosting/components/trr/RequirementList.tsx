'use client';

import React, { useState } from 'react';
import { TRRRequirement, TRRTestCase } from '../../types/trr';
import { CortexButton } from '../CortexButton';
import { CortexCommandButton } from '../CortexCommandButton';

interface RequirementListProps {
  trrId: string;
  trrTitle: string;
  requirements: TRRRequirement[];
  onCreateRequirement?: () => void;
  onEditRequirement?: (requirement: TRRRequirement) => void;
  onDeleteRequirement?: (requirementId: string) => void;
  onUpdateStatus?: (requirementId: string, status: string) => void;
  onUpdatePriority?: (requirementId: string, priority: string) => void;
  onAddTestCase?: (requirementId: string) => void;
  onEditTestCase?: (requirementId: string, testCase: TRRTestCase) => void;
  onDeleteTestCase?: (requirementId: string, testCaseId: string) => void;
  onRunTests?: (requirementId: string) => void;
  viewMode?: 'list' | 'cards';
  onViewModeChange?: (mode: 'list' | 'cards') => void;
  filters?: {
    status?: string[];
    priority?: string[];
    category?: string[];
    owner?: string;
  };
  onFiltersChange?: (filters: any) => void;
}

export const RequirementList: React.FC<RequirementListProps> = ({
  trrId,
  trrTitle,
  requirements,
  onCreateRequirement,
  onEditRequirement,
  onDeleteRequirement,
  onUpdateStatus,
  onUpdatePriority,
  onAddTestCase,
  onEditTestCase,
  onDeleteTestCase,
  onRunTests,
  viewMode = 'list',
  onViewModeChange,
  filters = {},
  onFiltersChange,
}) => {
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [expandedRequirements, setExpandedRequirements] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const getStatusColor = (status: string): string => {
    const colors = {
      'draft': 'text-cortex-text-muted bg-cortex-bg-hover',
      'pending': 'text-cortex-warning bg-cortex-warning/10',
      'in-progress': 'text-cortex-info bg-cortex-info/10',
      'in-review': 'text-cortex-info bg-cortex-info/10',
      'completed': 'text-cortex-success bg-cortex-success/10',
      'approved': 'text-cortex-success bg-cortex-success/10',
      'rejected': 'text-cortex-error bg-cortex-error/10',
      'blocked': 'text-cortex-error bg-cortex-error/10'
    };
    return colors[status as keyof typeof colors] || 'text-cortex-text-muted bg-cortex-bg-hover';
  };

  const getPriorityColor = (priority: string): string => {
    const colors = {
      'low': 'text-cortex-text-muted bg-cortex-bg-hover',
      'medium': 'text-cortex-info bg-cortex-info/10',
      'high': 'text-cortex-warning bg-cortex-warning/10',
      'critical': 'text-cortex-error bg-cortex-error/10'
    };
    return colors[priority as keyof typeof colors] || 'text-cortex-text-muted bg-cortex-bg-hover';
  };

  const getStatusIcon = (status: string): string => {
    const icons = {
      'draft': '📝',
      'pending': '⏳',
      'in-progress': '🔄',
      'in-review': '👀',
      'completed': '✅',
      'approved': '✅',
      'rejected': '❌',
      'blocked': '🚫'
    };
    return icons[status as keyof typeof icons] || '❓';
  };

  const calculateRequirementProgress = (requirement: TRRRequirement): number => {
    if (requirement.status === 'completed' || requirement.status === 'approved') return 100;
    if (requirement.status === 'rejected' || requirement.status === 'blocked') return 0;
    
    const testCases = requirement.testCases || [];
    if (testCases.length === 0) {
      switch (requirement.status) {
        case 'in-progress': return 50;
        case 'in-review': return 80;
        case 'pending': return 20;
        case 'draft': return 10;
        default: return 0;
      }
    }
    
    const completedTests = testCases.filter(tc => 
      tc.status === 'passed' || tc.status === 'failed'
    ).length;
    return Math.round((completedTests / testCases.length) * 100);
  };

  const getTestStatusSummary = (requirement: TRRRequirement): { passed: number; failed: number; pending: number } => {
    const testCases = requirement.testCases || [];
    return {
      passed: testCases.filter(tc => tc.status === 'passed').length,
      failed: testCases.filter(tc => tc.status === 'failed').length,
      pending: testCases.filter(tc => !tc.status || tc.status === 'not-run').length
    };
  };

  const toggleRequirementSelection = (requirementId: string) => {
    setSelectedRequirements(prev =>
      prev.includes(requirementId)
        ? prev.filter(id => id !== requirementId)
        : [...prev, requirementId]
    );
  };

  const toggleRequirementExpansion = (requirementId: string) => {
    setExpandedRequirements(prev =>
      prev.includes(requirementId)
        ? prev.filter(id => id !== requirementId)
        : [...prev, requirementId]
    );
  };

  const selectAllRequirements = (selected: boolean) => {
    if (selected) {
      setSelectedRequirements(requirements.map(req => req.id));
    } else {
      setSelectedRequirements([]);
    }
  };

  const getEstimatedHours = (requirement: TRRRequirement): number => {
    return requirement.estimatedHours || 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Apply filters
  const filteredRequirements = requirements.filter(requirement => {
    if (filters.status?.length && !filters.status.includes(requirement.status)) return false;
    if (filters.priority?.length && !filters.priority.includes(requirement.priority)) return false;
    if (filters.category?.length && !filters.category.includes(requirement.category)) return false;
    if (filters.owner && requirement.ownerUserId !== filters.owner) return false;
    return true;
  });

  const totalRequirements = filteredRequirements.length;
  const completedRequirements = filteredRequirements.filter(req => 
    req.status === 'completed' || req.status === 'approved'
  ).length;
  const totalEstimatedHours = filteredRequirements.reduce((sum, req) => sum + getEstimatedHours(req), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cortex-text-primary">
              Requirements for {trrTitle}
            </h1>
            <p className="text-cortex-text-secondary">
              {totalRequirements} requirements • {completedRequirements} completed • {totalEstimatedHours}h estimated
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            {onViewModeChange && (
              <div className="flex items-center border border-cortex-border-secondary rounded-lg">
                <button
                  onClick={() => onViewModeChange('list')}
                  className={`px-3 py-2 text-sm rounded-l-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-cortex-green text-white'
                      : 'text-cortex-text-secondary hover:bg-cortex-bg-hover'
                  }`}
                >
                  📋 List
                </button>
                <button
                  onClick={() => onViewModeChange('cards')}
                  className={`px-3 py-2 text-sm rounded-r-lg transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-cortex-green text-white'
                      : 'text-cortex-text-secondary hover:bg-cortex-bg-hover'
                  }`}
                >
                  🎴 Cards
                </button>
              </div>
            )}
            
            {onCreateRequirement && (
              <CortexButton
                onClick={onCreateRequirement}
                variant="primary"
                icon="➕"
              >
                New Requirement
              </CortexButton>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-text-primary">{totalRequirements}</div>
            <p className="text-sm text-cortex-text-muted">Total Requirements</p>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-success">{completedRequirements}</div>
            <p className="text-sm text-cortex-text-muted">Completed</p>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-warning">
              {filteredRequirements.filter(req => req.status === 'in-progress').length}
            </div>
            <p className="text-sm text-cortex-text-muted">In Progress</p>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-info">{totalEstimatedHours}h</div>
            <p className="text-sm text-cortex-text-muted">Estimated Hours</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
              Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true))
                ? 'border-cortex-green bg-cortex-green/10 text-cortex-green'
                : 'border-cortex-border-secondary text-cortex-text-secondary hover:bg-cortex-bg-hover'
            }`}
          >
            <span>🔧 Filters</span>
          </button>
          
          {/* Quick Filters */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onFiltersChange?.({ ...filters, status: ['in-progress', 'in-review'] })}
              className="px-3 py-1 text-sm bg-cortex-info/10 text-cortex-info rounded-full hover:bg-cortex-info/20"
            >
              Active
            </button>
            <button
              onClick={() => onFiltersChange?.({ ...filters, priority: ['high', 'critical'] })}
              className="px-3 py-1 text-sm bg-cortex-warning/10 text-cortex-warning rounded-full hover:bg-cortex-warning/20"
            >
              High Priority
            </button>
            <button
              onClick={() => onFiltersChange?.({ ...filters, status: ['blocked'] })}
              className="px-3 py-1 text-sm bg-cortex-error/10 text-cortex-error rounded-full hover:bg-cortex-error/20"
            >
              Blocked
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="cortex-card p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">Status</label>
                <select
                  multiple
                  value={filters.status || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    onFiltersChange?.({ ...filters, status: values });
                  }}
                  className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="in-review">In Review</option>
                  <option value="completed">Completed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">Priority</label>
                <select
                  multiple
                  value={filters.priority || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    onFiltersChange?.({ ...filters, priority: values });
                  }}
                  className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">Category</label>
                <select
                  multiple
                  value={filters.category || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    onFiltersChange?.({ ...filters, category: values });
                  }}
                  className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
                >
                  <option value="functional">Functional</option>
                  <option value="non-functional">Non-Functional</option>
                  <option value="technical">Technical</option>
                  <option value="business">Business</option>
                  <option value="security">Security</option>
                  <option value="compliance">Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">Owner</label>
                <select
                  value={filters.owner || ''}
                  onChange={(e) => onFiltersChange?.({ ...filters, owner: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
                >
                  <option value="">All Owners</option>
                  <option value="user1">Alice Johnson</option>
                  <option value="user2">Bob Smith</option>
                  <option value="user3">Carol Davis</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedRequirements.length > 0 && (
        <div className="cortex-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-cortex-text-primary font-medium">
                {selectedRequirements.length} requirement{selectedRequirements.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <CortexCommandButton
                command={`requirements export --trr ${trrId} --ids ${selectedRequirements.join(',')}`}
                variant="outline"
                size="sm"
                icon="📤"
              >
                Export
              </CortexCommandButton>
              <CortexButton
                variant="outline"
                size="sm"
                icon="🔄"
                onClick={() => {
                  // Bulk status update
                }}
              >
                Update Status
              </CortexButton>
              <CortexButton
                variant="outline"
                size="sm"
                icon="👥"
                onClick={() => {
                  // Bulk reassign
                }}
              >
                Reassign
              </CortexButton>
            </div>
          </div>
        </div>
      )}

      {/* Requirements List */}
      {filteredRequirements.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-2">
            No requirements found
          </h3>
          <p className="text-cortex-text-secondary mb-4">
            {Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true))
              ? 'Try adjusting your filters to find what you\'re looking for.'
              : 'Get started by creating your first requirement for this TRR.'
            }
          </p>
          {onCreateRequirement && (
            <CortexButton onClick={onCreateRequirement} variant="primary" icon="➕">
              Create First Requirement
            </CortexButton>
          )}
        </div>
      ) : (
        <div className={viewMode === 'cards' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-0'}>
          {viewMode === 'list' ? (
            <div className="cortex-card overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-cortex-border-secondary bg-cortex-bg-tertiary">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedRequirements.length === filteredRequirements.length && filteredRequirements.length > 0}
                    onChange={(e) => selectAllRequirements(e.target.checked)}
                    className="rounded border-cortex-border-secondary focus:ring-cortex-green"
                  />
                  <div className="flex-1 grid grid-cols-7 gap-4 text-sm font-medium text-cortex-text-secondary">
                    <div className="col-span-2">Requirement</div>
                    <div>Status</div>
                    <div>Priority</div>
                    <div>Owner</div>
                    <div>Tests</div>
                    <div>Actions</div>
                  </div>
                </div>
              </div>

              {/* List Items */}
              <div className="divide-y divide-cortex-border-secondary">
                {filteredRequirements.map((requirement) => (
                  <div key={requirement.id} className="p-4 hover:bg-cortex-bg-hover/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedRequirements.includes(requirement.id)}
                        onChange={() => toggleRequirementSelection(requirement.id)}
                        className="rounded border-cortex-border-secondary focus:ring-cortex-green"
                      />
                      
                      <div className="flex-1 grid grid-cols-7 gap-4 items-center">
                        {/* Requirement Info */}
                        <div className="col-span-2">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleRequirementExpansion(requirement.id)}
                              className="text-cortex-text-muted hover:text-cortex-text-secondary"
                            >
                              {expandedRequirements.includes(requirement.id) ? '▼' : '▶'}
                            </button>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-cortex-text-primary font-medium truncate">
                                {requirement.title}
                              </h3>
                              <p className="text-sm text-cortex-text-muted truncate">
                                {requirement.category} • {getEstimatedHours(requirement)}h
                              </p>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-2 ml-8">
                            <div className="w-full bg-cortex-bg-tertiary rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  requirement.status === 'completed' || requirement.status === 'approved' ? 'bg-cortex-green' :
                                  requirement.status === 'in-progress' ? 'bg-cortex-info' :
                                  requirement.status === 'rejected' || requirement.status === 'blocked' ? 'bg-cortex-error' :
                                  'bg-cortex-warning'
                                }`}
                                style={{ width: `${calculateRequirementProgress(requirement)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(requirement.status)}`}>
                            {getStatusIcon(requirement.status)} {requirement.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>

                        {/* Priority */}
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(requirement.priority)}`}>
                            {requirement.priority.toUpperCase()}
                          </span>
                        </div>

                        {/* Owner */}
                        <div className="text-sm text-cortex-text-primary">
                          {requirement.ownerUserId || 'Unassigned'}
                        </div>

                        {/* Tests */}
                        <div className="text-sm">
                          {(() => {
                            const summary = getTestStatusSummary(requirement);
                            return (
                              <div className="flex items-center space-x-1">
                                <span className="text-cortex-success">{summary.passed}</span>
                                <span className="text-cortex-error">{summary.failed}</span>
                                <span className="text-cortex-text-muted">{summary.pending}</span>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1">
                          {onEditRequirement && (
                            <CortexButton
                              onClick={() => onEditRequirement(requirement)}
                              variant="outline"
                              size="sm"
                              icon="✏️"
                            >
                              Edit
                            </CortexButton>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedRequirements.includes(requirement.id) && (
                      <div className="mt-4 ml-8 p-4 bg-cortex-bg-tertiary rounded-lg border border-cortex-border-secondary">
                        <div className="space-y-4">
                          {/* Description */}
                          <div>
                            <h4 className="text-sm font-medium text-cortex-text-secondary mb-1">Description</h4>
                            <p className="text-sm text-cortex-text-primary">{requirement.description}</p>
                          </div>

                          {/* Acceptance Criteria */}
                          {requirement.acceptanceCriteria && requirement.acceptanceCriteria.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-cortex-text-secondary mb-2">Acceptance Criteria</h4>
                              <ul className="space-y-1">
                                {requirement.acceptanceCriteria.map((criterion, idx) => (
                                  <li key={idx} className="flex items-start space-x-2 text-sm text-cortex-text-primary">
                                    <span className="text-cortex-success">✓</span>
                                    <span>{criterion}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Test Cases */}
                          {requirement.testCases && requirement.testCases.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-cortex-text-secondary">
                                  Test Cases ({requirement.testCases.length})
                                </h4>
                                <div className="flex items-center space-x-2">
                                  {onAddTestCase && (
                                    <CortexButton
                                      onClick={() => onAddTestCase(requirement.id)}
                                      variant="outline"
                                      size="sm"
                                      icon="➕"
                                    >
                                      Add Test
                                    </CortexButton>
                                  )}
                                  {onRunTests && (
                                    <CortexButton
                                      onClick={() => onRunTests(requirement.id)}
                                      variant="outline"
                                      size="sm"
                                      icon="▶️"
                                    >
                                      Run Tests
                                    </CortexButton>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2">
                                {requirement.testCases.map((testCase, idx) => (
                                  <div key={testCase.id || idx} className="flex items-center justify-between p-2 bg-cortex-bg-secondary rounded">
                                    <div className="flex items-center space-x-2">
                                      <span className={`w-3 h-3 rounded-full ${
                                        testCase.status === 'passed' ? 'bg-cortex-success' :
                                        testCase.status === 'failed' ? 'bg-cortex-error' :
                                        'bg-cortex-text-muted'
                                      }`}></span>
                                      <span className="text-sm text-cortex-text-primary">{testCase.title}</span>
                                      {testCase.automated && (
                                        <span className="px-1 py-0.5 bg-cortex-info/10 text-cortex-info rounded text-xs">
                                          🤖 Auto
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      {onEditTestCase && (
                                        <CortexButton
                                          onClick={() => onEditTestCase(requirement.id, testCase)}
                                          variant="outline"
                                          size="sm"
                                          icon="✏️"
                                        />
                                      )}
                                      {onDeleteTestCase && (
                                        <CortexButton
                                          onClick={() => onDeleteTestCase(requirement.id, testCase.id!)}
                                          variant="outline"
                                          size="sm"
                                          icon="🗑️"
                                        />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Cards View
            filteredRequirements.map((requirement) => (
              <div key={requirement.id} className="cortex-card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedRequirements.includes(requirement.id)}
                      onChange={() => toggleRequirementSelection(requirement.id)}
                      className="rounded border-cortex-border-secondary focus:ring-cortex-green"
                    />
                    <h3 className="text-lg font-semibold text-cortex-text-primary">
                      {requirement.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(requirement.status)}`}>
                      {getStatusIcon(requirement.status)} {requirement.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(requirement.priority)}`}>
                      {requirement.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-cortex-text-secondary mb-4 line-clamp-3">
                  {requirement.description}
                </p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-cortex-text-muted">Progress</span>
                    <span className="font-medium text-cortex-text-primary">{calculateRequirementProgress(requirement)}%</span>
                  </div>
                  <div className="w-full bg-cortex-bg-tertiary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        requirement.status === 'completed' || requirement.status === 'approved' ? 'bg-cortex-green' :
                        requirement.status === 'in-progress' ? 'bg-cortex-info' :
                        requirement.status === 'rejected' || requirement.status === 'blocked' ? 'bg-cortex-error' :
                        'bg-cortex-warning'
                      }`}
                      style={{ width: `${calculateRequirementProgress(requirement)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm text-cortex-text-muted mb-4">
                  <div>
                    <span className="font-medium">Category:</span> {requirement.category}
                  </div>
                  <div>
                    <span className="font-medium">Owner:</span> {requirement.ownerUserId || 'Unassigned'}
                  </div>
                  <div>
                    <span className="font-medium">Estimated:</span> {getEstimatedHours(requirement)}h
                  </div>
                  <div>
                    <span className="font-medium">Tests:</span> {requirement.testCases?.length || 0}
                  </div>
                </div>

                {/* Test Summary */}
                {requirement.testCases && requirement.testCases.length > 0 && (
                  <div className="mb-4 p-3 bg-cortex-bg-tertiary rounded">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cortex-text-muted">Test Results:</span>
                      <div className="flex items-center space-x-3">
                        {(() => {
                          const summary = getTestStatusSummary(requirement);
                          return (
                            <>
                              <span className="text-cortex-success">✓ {summary.passed}</span>
                              <span className="text-cortex-error">✗ {summary.failed}</span>
                              <span className="text-cortex-text-muted">○ {summary.pending}</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-cortex-border-secondary">
                  <div className="text-xs text-cortex-text-muted">
                    ID: {requirement.id}
                  </div>
                  <div className="flex items-center space-x-2">
                    {onEditRequirement && (
                      <CortexButton
                        onClick={() => onEditRequirement(requirement)}
                        variant="outline"
                        size="sm"
                        icon="✏️"
                      >
                        Edit
                      </CortexButton>
                    )}
                    {onAddTestCase && (
                      <CortexButton
                        onClick={() => onAddTestCase(requirement.id)}
                        variant="outline"
                        size="sm"
                        icon="🧪"
                      >
                        Add Test
                      </CortexButton>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RequirementList;