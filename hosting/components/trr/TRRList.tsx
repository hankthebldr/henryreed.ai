'use client';

import React, { useState, useMemo } from 'react';
import { TRR, TRRFilters } from '../../types/trr';
import CortexButton from '../CortexButton';

interface TRRListProps {
  trrs: TRR[];
  onEdit?: (trr: TRR) => void;
  onView?: (trr: TRR) => void;
  onDelete?: (trrId: string) => void;
  onCreateTRR?: () => void;
  filters: TRRFilters;
  onFiltersChange: (filters: Partial<TRRFilters>) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTRRs: string[];
  onSelectTRR: (trrId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  viewMode?: 'list' | 'cards';
  onViewModeChange?: (mode: 'list' | 'cards') => void;
  loading?: boolean;
}

export const TRRList: React.FC<TRRListProps> = ({
  trrs,
  onEdit,
  onView,
  onDelete,
  onCreateTRR,
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
  selectedTRRs,
  onSelectTRR,
  onSelectAll,
  viewMode = 'list',
  onViewModeChange,
  loading = false,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search TRRs
  const filteredTRRs = useMemo(() => {
    let result = [...trrs];

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(trr =>
        trr.title.toLowerCase().includes(query) ||
        trr.description.toLowerCase().includes(query) ||
        trr.id.toLowerCase().includes(query) ||
        trr.assignedTo?.toLowerCase().includes(query) ||
        trr.customer?.toLowerCase().includes(query) ||
        trr.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.status?.length) {
      result = result.filter(trr => filters.status!.includes(trr.status));
    }

    if (filters.priority?.length) {
      result = result.filter(trr => filters.priority!.includes(trr.priority));
    }

    if (filters.category?.length) {
      result = result.filter(trr => filters.category!.includes(trr.category));
    }

    if (filters.assignedTo) {
      result = result.filter(trr => trr.assignedTo === filters.assignedTo);
    }

    if (filters.tags?.length) {
      result = result.filter(trr => 
        filters.tags!.some(tag => trr.tags?.includes(tag))
      );
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'updatedDate';
    const sortOrder = filters.sortOrder || 'desc';
    
    result.sort((a, b) => {
      let aVal: any = a[sortBy as keyof TRR];
      let bVal: any = b[sortBy as keyof TRR];

      // Handle date fields
      if (sortBy.includes('Date')) {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }

      // Handle string comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }

      // Handle numeric comparison
      if (sortOrder === 'desc') {
        return bVal - aVal;
      }
      return aVal - bVal;
    });

    return result;
  }, [trrs, searchQuery, filters]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      'draft': 'text-cortex-text-muted bg-cortex-bg-hover',
      'pending': 'text-cortex-warning bg-cortex-warning/10',
      'in-progress': 'text-cortex-info bg-cortex-info/10',
      'in-review': 'text-cortex-info bg-cortex-info/10',
      'validated': 'text-cortex-green bg-cortex-green/10',
      'approved': 'text-cortex-success bg-cortex-success/10',
      'completed': 'text-cortex-success bg-cortex-success/10',
      'failed': 'text-cortex-error bg-cortex-error/10',
      'rejected': 'text-cortex-error bg-cortex-error/10',
      'deferred': 'text-cortex-text-muted bg-cortex-bg-hover',
      'not-applicable': 'text-cortex-text-muted bg-cortex-bg-hover'
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

  const calculateProgress = (trr: TRR): number => {
    switch (trr.status) {
      case 'completed': return 100;
      case 'validated': return 95;
      case 'in-progress':
        const completedTests = trr.testCases?.filter(tc => 
          tc.status === 'passed' || tc.status === 'failed' || tc.status === 'skipped'
        ).length || 0;
        const totalTests = trr.testCases?.length || 1;
        return Math.round((completedTests / totalTests) * 70) + 20;
      case 'in-review': return 75;
      case 'pending': return 10;
      case 'draft': return 5;
      default: return 0;
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      priority: [],
      category: [],
      assignedTo: undefined,
      tags: [],
    });
    onSearchChange('');
  };

  const hasActiveFilters = !!(
    filters.status?.length ||
    filters.priority?.length ||
    filters.category?.length ||
    filters.assignedTo ||
    filters.tags?.length ||
    searchQuery.trim()
  );

  // Get unique values for filter dropdowns
  const uniqueAssignees = [...new Set(trrs.map(trr => trr.assignedTo).filter(Boolean))];
  const uniqueTags = [...new Set(trrs.flatMap(trr => trr.tags || []))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-cortex-text-primary">
            Technical Requirements Reviews
          </h2>
          <p className="text-cortex-text-secondary">
            {filteredTRRs.length} of {trrs.length} TRRs
            {hasActiveFilters && ' (filtered)'}
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
          
          {onCreateTRR && (
            <CortexButton
              onClick={onCreateTRR}
              variant="primary"
              icon="➕"
            >
              New TRR
            </CortexButton>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search TRRs by title, description, ID, assignee, customer, or tags..."
            className="w-full pl-10 pr-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
          />
          <div className="absolute left-3 top-3 text-cortex-text-muted">
            🔍
          </div>
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-3 text-cortex-text-muted hover:text-cortex-text-secondary"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
              hasActiveFilters
                ? 'border-cortex-green bg-cortex-green/10 text-cortex-green'
                : 'border-cortex-border-secondary text-cortex-text-secondary hover:bg-cortex-bg-hover'
            }`}
          >
            <span>🔧 Filters</span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-cortex-green text-white text-xs rounded-full">
                {[
                  filters.status?.length || 0,
                  filters.priority?.length || 0,
                  filters.category?.length || 0,
                  filters.assignedTo ? 1 : 0,
                  filters.tags?.length || 0
                ].reduce((sum, count) => sum + count, 0)}
              </span>
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-cortex-text-muted hover:text-cortex-text-secondary text-sm"
            >
              Clear all
            </button>
          )}

          {/* Quick Filters */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onFiltersChange({ status: ['in-progress', 'in-review'] })}
              className="px-3 py-1 text-sm bg-cortex-info/10 text-cortex-info rounded-full hover:bg-cortex-info/20"
            >
              Active
            </button>
            <button
              onClick={() => onFiltersChange({ priority: ['high', 'critical'] })}
              className="px-3 py-1 text-sm bg-cortex-warning/10 text-cortex-warning rounded-full hover:bg-cortex-warning/20"
            >
              High Priority
            </button>
            <button
              onClick={() => onFiltersChange({ status: ['pending', 'draft'] })}
              className="px-3 py-1 text-sm bg-cortex-text-muted/10 text-cortex-text-muted rounded-full hover:bg-cortex-text-muted/20"
            >
              Not Started
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-cortex-bg-tertiary p-4 rounded-lg border border-cortex-border-secondary">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">Status</label>
                <select
                  multiple
                  value={filters.status || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    onFiltersChange({ status: values });
                  }}
                  className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="in-review">In Review</option>
                  <option value="validated">Validated</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="rejected">Rejected</option>
                  <option value="deferred">Deferred</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">Priority</label>
                <select
                  multiple
                  value={filters.priority || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    onFiltersChange({ priority: values });
                  }}
                  className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">Category</label>
                <select
                  multiple
                  value={filters.category || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    onFiltersChange({ category: values });
                  }}
                  className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
                >
                  <option value="security">Security</option>
                  <option value="performance">Performance</option>
                  <option value="compliance">Compliance</option>
                  <option value="integration">Integration</option>
                  <option value="usability">Usability</option>
                  <option value="scalability">Scalability</option>
                  <option value="reliability">Reliability</option>
                </select>
              </div>

              {/* Assignee Filter */}
              <div>
                <label className="block text-sm font-medium text-cortex-text-secondary mb-2">Assignee</label>
                <select
                  value={filters.assignedTo || ''}
                  onChange={(e) => onFiltersChange({ assignedTo: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
                >
                  <option value="">All Assignees</option>
                  {uniqueAssignees.map(assignee => (
                    <option key={assignee} value={assignee}>{assignee}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedTRRs.length > 0 && (
        <div className="bg-cortex-bg-accent p-4 rounded-lg border border-cortex-border-accent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-cortex-text-primary font-medium">
                {selectedTRRs.length} TRR{selectedTRRs.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <CortexButton
                variant="outline"
                size="sm"
                icon="📤"
                onClick={() => {
                  // TODO: Integrate with terminal command system
                  console.log(`trr export --format csv --ids ${selectedTRRs.join(',')}`);
                }}
              >
                Export
              </CortexButton>
              <CortexButton
                variant="outline"
                size="sm"
                icon="🔄"
                onClick={() => {
                  // Bulk status update modal would open here
                }}
              >
                Bulk Update
              </CortexButton>
              <CortexButton
                variant="outline"
                size="sm"
                icon="👥"
                onClick={() => {
                  // Bulk reassign modal would open here
                }}
              >
                Reassign
              </CortexButton>
            </div>
          </div>
        </div>
      )}

      {/* TRR List/Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cortex-green"></div>
          <p className="text-cortex-text-muted mt-2">Loading TRRs...</p>
        </div>
      ) : filteredTRRs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-2">
            {hasActiveFilters ? 'No TRRs match your filters' : 'No TRRs found'}
          </h3>
          <p className="text-cortex-text-secondary mb-4">
            {hasActiveFilters 
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Get started by creating your first Technical Requirements Review.'
            }
          </p>
          {hasActiveFilters ? (
            <CortexButton onClick={clearAllFilters} variant="outline">
              Clear Filters
            </CortexButton>
          ) : onCreateTRR ? (
            <CortexButton onClick={onCreateTRR} variant="primary" icon="➕">
              Create First TRR
            </CortexButton>
          ) : null}
        </div>
      ) : (
        <div className={viewMode === 'cards' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-0'}>
          {viewMode === 'list' ? (
            <div className="cortex-card overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-cortex-border-secondary bg-cortex-bg-tertiary">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedTRRs.length === filteredTRRs.length && filteredTRRs.length > 0}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="rounded border-cortex-border-secondary focus:ring-cortex-green"
                  />
                  <div className="flex-1 grid grid-cols-8 gap-4 text-sm font-medium text-cortex-text-secondary">
                    <div className="col-span-3">TRR</div>
                    <div>Status</div>
                    <div>Priority</div>
                    <div>Assignee</div>
                    <div>Due Date</div>
                    <div>Actions</div>
                  </div>
                </div>
              </div>

              {/* List Items */}
              <div className="divide-y divide-cortex-border-secondary">
                {filteredTRRs.map((trr) => (
                  <div key={trr.id} className="p-4 hover:bg-cortex-bg-hover/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedTRRs.includes(trr.id)}
                        onChange={(e) => onSelectTRR(trr.id, e.target.checked)}
                        className="rounded border-cortex-border-secondary focus:ring-cortex-green"
                      />
                      
                      <div className="flex-1 grid grid-cols-8 gap-4 items-center">
                        {/* TRR Info */}
                        <div className="col-span-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-cortex-text-primary font-medium truncate cursor-pointer hover:text-cortex-green" 
                                  onClick={() => onView?.(trr)}>
                                {trr.title}
                              </h3>
                              <div className="flex items-center space-x-2 text-sm text-cortex-text-muted">
                                <span className="font-mono">{trr.id}</span>
                                <span>•</span>
                                <span>{trr.customer}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-2">
                            <div className="flex justify-between items-center text-xs text-cortex-text-muted mb-1">
                              <span>Progress</span>
                              <span>{calculateProgress(trr)}%</span>
                            </div>
                            <div className="w-full bg-cortex-bg-tertiary rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  trr.status === 'validated' || trr.status === 'completed' ? 'bg-cortex-green' :
                                  trr.status === 'in-progress' ? 'bg-cortex-info' :
                                  trr.status === 'failed' ? 'bg-cortex-error' :
                                  'bg-cortex-warning'
                                }`}
                                style={{ width: `${calculateProgress(trr)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trr.status)}`}>
                            {trr.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>

                        {/* Priority */}
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(trr.priority)}`}>
                            {trr.priority.toUpperCase()}
                          </span>
                        </div>

                        {/* Assignee */}
                        <div className="text-sm text-cortex-text-primary truncate">
                          {trr.assignedTo}
                        </div>

                        {/* Due Date */}
                        <div className="text-sm text-cortex-text-secondary">
                          {trr.dueDate ? formatDate(trr.dueDate) : '—'}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1">
                          {onView && (
                            <CortexButton
                              onClick={() => onView(trr)}
                              variant="outline"
                              size="sm"
                              icon="👁️"
                            >
                              View
                            </CortexButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Cards View
            filteredTRRs.map((trr) => (
              <div key={trr.id} className="cortex-card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedTRRs.includes(trr.id)}
                      onChange={(e) => onSelectTRR(trr.id, e.target.checked)}
                      className="rounded border-cortex-border-secondary focus:ring-cortex-green"
                    />
                    <h3 className="text-lg font-semibold text-cortex-text-primary hover:text-cortex-green cursor-pointer"
                        onClick={() => onView?.(trr)}>
                      {trr.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trr.status)}`}>
                      {trr.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(trr.priority)}`}>
                      {trr.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-cortex-text-secondary mb-4 line-clamp-3">
                  {trr.description}
                </p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-cortex-text-muted">Progress</span>
                    <span className="font-medium text-cortex-text-primary">{calculateProgress(trr)}%</span>
                  </div>
                  <div className="w-full bg-cortex-bg-tertiary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        trr.status === 'validated' || trr.status === 'completed' ? 'bg-cortex-green' :
                        trr.status === 'in-progress' ? 'bg-cortex-info' :
                        trr.status === 'failed' ? 'bg-cortex-error' :
                        'bg-cortex-warning'
                      }`}
                      style={{ width: `${calculateProgress(trr)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm text-cortex-text-muted mb-4">
                  <div>
                    <span className="font-medium">Assignee:</span> {trr.assignedTo}
                  </div>
                  <div>
                    <span className="font-medium">Customer:</span> {trr.customer}
                  </div>
                  <div>
                    <span className="font-medium">Due:</span> {trr.dueDate ? formatDate(trr.dueDate) : 'Not set'}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {formatDate(trr.updatedDate)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-cortex-border-secondary">
                  <div className="text-xs text-cortex-text-muted font-mono">
                    {trr.id}
                  </div>
                  <div className="flex items-center space-x-2">
                    {onView && (
                      <CortexButton
                        onClick={() => onView(trr)}
                        variant="outline"
                        size="sm"
                        icon="👁️"
                      >
                        View
                      </CortexButton>
                    )}
                    {onEdit && (
                      <CortexButton
                        onClick={() => onEdit(trr)}
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
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TRRList;