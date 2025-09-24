'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TRR, Project } from '../../types/trr';
import { CortexButton } from '../CortexButton';

interface SearchFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in' | 'before' | 'after' | 'between' | 'is_empty' | 'is_not_empty';
  value: string | string[] | Date | { start: Date; end: Date };
  label?: string;
}

interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  createdBy: string;
  createdAt: Date;
  isPublic: boolean;
  usageCount: number;
}

interface TRRAdvancedSearchProps {
  trrs: TRR[];
  projects: Project[];
  teamMembers?: Array<{ id: string; name: string; role: string; }>;
  onSearchResults?: (results: TRR[], query: string) => void;
  savedSearches?: SavedSearch[];
  onSaveSearch?: (search: Omit<SavedSearch, 'id' | 'createdAt' | 'usageCount'>) => Promise<SavedSearch>;
  onDeleteSavedSearch?: (searchId: string) => Promise<void>;
  onUpdateSavedSearch?: (search: SavedSearch) => Promise<void>;
  currentUser?: string;
  defaultFilters?: SearchFilter[];
}

export const TRRAdvancedSearch: React.FC<TRRAdvancedSearchProps> = ({
  trrs,
  projects,
  teamMembers = [],
  onSearchResults,
  savedSearches = [],
  onSaveSearch,
  onDeleteSavedSearch,
  onUpdateSavedSearch,
  currentUser = 'Anonymous',
  defaultFilters = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>(defaultFilters);
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedSavedSearch, setSelectedSavedSearch] = useState<SavedSearch | null>(null);

  // New saved search state
  const [newSavedSearch, setNewSavedSearch] = useState({
    name: '',
    description: '',
    isPublic: false,
  });

  // Available filter fields
  const filterFields = [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['draft', 'pending', 'in-progress', 'in-review', 'completed', 'validated', 'rejected'] },
    { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
    { key: 'assignedTo', label: 'Assigned To', type: 'select', options: teamMembers.map(m => m.name) },
    { key: 'projectId', label: 'Project', type: 'select', options: projects.map(p => ({ value: p.id, label: p.name })) },
    { key: 'tags', label: 'Tags', type: 'multiselect', options: Array.from(new Set(trrs.flatMap(t => t.tags || []))) },
    { key: 'dependencies', label: 'Dependencies', type: 'multiselect', options: trrs.map(t => ({ value: t.id, label: t.title })) },
    { key: 'estimatedHours', label: 'Estimated Hours', type: 'number' },
    { key: 'createdAt', label: 'Created Date', type: 'date' },
    { key: 'updatedAt', label: 'Updated Date', type: 'date' },
    { key: 'dueDate', label: 'Due Date', type: 'date' },
  ];

  // Filter operators based on field type
  const getOperatorsForField = (fieldType: string) => {
    switch (fieldType) {
      case 'text':
        return [
          { key: 'contains', label: 'Contains' },
          { key: 'equals', label: 'Equals' },
          { key: 'starts_with', label: 'Starts with' },
          { key: 'ends_with', label: 'Ends with' },
          { key: 'is_empty', label: 'Is empty' },
          { key: 'is_not_empty', label: 'Is not empty' },
        ];
      case 'select':
        return [
          { key: 'equals', label: 'Equals' },
          { key: 'in', label: 'Is one of' },
          { key: 'not_in', label: 'Is not one of' },
        ];
      case 'multiselect':
        return [
          { key: 'contains', label: 'Contains' },
          { key: 'in', label: 'Contains any of' },
          { key: 'not_in', label: 'Does not contain' },
        ];
      case 'number':
        return [
          { key: 'equals', label: 'Equals' },
          { key: 'before', label: 'Less than' },
          { key: 'after', label: 'Greater than' },
          { key: 'between', label: 'Between' },
        ];
      case 'date':
        return [
          { key: 'equals', label: 'On date' },
          { key: 'before', label: 'Before' },
          { key: 'after', label: 'After' },
          { key: 'between', label: 'Between' },
          { key: 'is_empty', label: 'Is empty' },
          { key: 'is_not_empty', label: 'Is not empty' },
        ];
      default:
        return [{ key: 'equals', label: 'Equals' }];
    }
  };

  // Apply filters to TRRs
  const applyFilters = useCallback((trrList: TRR[], searchFilters: SearchFilter[], query: string = '') => {
    let filtered = [...trrList];

    // Apply text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(trr =>
        trr.title.toLowerCase().includes(searchTerm) ||
        trr.description.toLowerCase().includes(searchTerm) ||
        trr.id.toLowerCase().includes(searchTerm) ||
        trr.assignedTo?.toLowerCase().includes(searchTerm) ||
        (trr.tags && trr.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
        projects.find(p => p.id === trr.projectId)?.name.toLowerCase().includes(searchTerm)
      );
    }

    // Apply advanced filters
    searchFilters.forEach(filter => {
      const fieldValue = getFieldValue(trr => trr, filter.field);

      filtered = filtered.filter(trr => {
        const value = fieldValue(trr);
        
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          
          case 'contains':
            if (typeof value === 'string' && typeof filter.value === 'string') {
              return value.toLowerCase().includes(filter.value.toLowerCase());
            }
            if (Array.isArray(value) && typeof filter.value === 'string') {
              return value.some(v => v.toLowerCase().includes(filter.value.toLowerCase()));
            }
            return false;
          
          case 'starts_with':
            return typeof value === 'string' && typeof filter.value === 'string' && 
                   value.toLowerCase().startsWith(filter.value.toLowerCase());
          
          case 'ends_with':
            return typeof value === 'string' && typeof filter.value === 'string' && 
                   value.toLowerCase().endsWith(filter.value.toLowerCase());
          
          case 'in':
            if (Array.isArray(filter.value)) {
              if (Array.isArray(value)) {
                return value.some(v => filter.value.includes(v));
              }
              return filter.value.includes(value);
            }
            return false;
          
          case 'not_in':
            if (Array.isArray(filter.value)) {
              if (Array.isArray(value)) {
                return !value.some(v => filter.value.includes(v));
              }
              return !filter.value.includes(value);
            }
            return true;
          
          case 'before':
            if (value instanceof Date && filter.value instanceof Date) {
              return value < filter.value;
            }
            if (typeof value === 'number' && typeof filter.value === 'string') {
              return value < parseFloat(filter.value);
            }
            return false;
          
          case 'after':
            if (value instanceof Date && filter.value instanceof Date) {
              return value > filter.value;
            }
            if (typeof value === 'number' && typeof filter.value === 'string') {
              return value > parseFloat(filter.value);
            }
            return false;
          
          case 'between':
            if (typeof filter.value === 'object' && 'start' in filter.value && 'end' in filter.value) {
              const { start, end } = filter.value as { start: Date | string; end: Date | string };
              if (value instanceof Date) {
                return value >= new Date(start) && value <= new Date(end);
              }
              if (typeof value === 'number') {
                return value >= parseFloat(start as string) && value <= parseFloat(end as string);
              }
            }
            return false;
          
          case 'is_empty':
            return !value || (Array.isArray(value) && value.length === 0) || value === '';
          
          case 'is_not_empty':
            return value && !(Array.isArray(value) && value.length === 0) && value !== '';
          
          default:
            return true;
        }
      });
    });

    return filtered;
  }, [projects]);

  // Get field value from TRR
  const getFieldValue = (accessor: (trr: TRR) => TRR, field: string) => {
    return (trr: TRR) => {
      const obj = accessor(trr);
      switch (field) {
        case 'createdAt':
        case 'updatedAt':
        case 'dueDate':
          const dateValue = (obj as any)[field];
          return dateValue ? new Date(dateValue) : null;
        default:
          return (obj as any)[field];
      }
    };
  };

  // Filtered and sorted results
  const searchResults = useMemo(() => {
    let results = applyFilters(trrs, filters, searchQuery);

    // Apply sorting
    results.sort((a, b) => {
      let aValue = (a as any)[sortBy];
      let bValue = (b as any)[sortBy];

      // Handle date fields
      if (['createdAt', 'updatedAt', 'dueDate'].includes(sortBy)) {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === 'string') {
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return results;
  }, [trrs, filters, searchQuery, sortBy, sortOrder, applyFilters]);

  // Notify parent of search results
  useEffect(() => {
    if (onSearchResults) {
      onSearchResults(searchResults, searchQuery);
    }
  }, [searchResults, searchQuery, onSearchResults]);

  // Add new filter
  const addFilter = useCallback(() => {
    const newFilter: SearchFilter = {
      id: `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      field: 'title',
      operator: 'contains',
      value: '',
    };
    setFilters([...filters, newFilter]);
  }, [filters]);

  // Update filter
  const updateFilter = useCallback((filterId: string, updates: Partial<SearchFilter>) => {
    setFilters(filters.map(filter => 
      filter.id === filterId 
        ? { ...filter, ...updates }
        : filter
    ));
  }, [filters]);

  // Remove filter
  const removeFilter = useCallback((filterId: string) => {
    setFilters(filters.filter(filter => filter.id !== filterId));
  }, [filters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters([]);
    setSearchQuery('');
  }, []);

  // Apply saved search
  const applySavedSearch = useCallback((savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
    setSortBy(savedSearch.sortBy || 'updatedAt');
    setSortOrder(savedSearch.sortOrder || 'desc');
    setSelectedSavedSearch(savedSearch);
    
    // Update usage count
    if (onUpdateSavedSearch) {
      onUpdateSavedSearch({
        ...savedSearch,
        usageCount: savedSearch.usageCount + 1,
      });
    }
  }, [onUpdateSavedSearch]);

  // Save current search
  const handleSaveSearch = useCallback(async () => {
    if (!onSaveSearch || !newSavedSearch.name.trim()) return;

    try {
      const savedSearch = await onSaveSearch({
        name: newSavedSearch.name,
        description: newSavedSearch.description,
        filters,
        sortBy,
        sortOrder,
        createdBy: currentUser,
        isPublic: newSavedSearch.isPublic,
        usageCount: 0,
      });

      setSelectedSavedSearch(savedSearch);
      setNewSavedSearch({ name: '', description: '', isPublic: false });
      setShowSaveModal(false);
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  }, [onSaveSearch, newSavedSearch, filters, sortBy, sortOrder, currentUser]);

  // Quick filters
  const quickFilters = [
    { label: 'My TRRs', action: () => setFilters([{ id: 'quick-my', field: 'assignedTo', operator: 'equals', value: currentUser }]) },
    { label: 'Overdue', action: () => setFilters([{ id: 'quick-overdue', field: 'dueDate', operator: 'before', value: new Date() }]) },
    { label: 'In Progress', action: () => setFilters([{ id: 'quick-progress', field: 'status', operator: 'equals', value: 'in-progress' }]) },
    { label: 'High Priority', action: () => setFilters([{ id: 'quick-priority', field: 'priority', operator: 'in', value: ['high', 'critical'] }]) },
    { label: 'Recently Updated', action: () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      setFilters([{ id: 'quick-recent', field: 'updatedAt', operator: 'after', value: weekAgo }]);
    }},
  ];

  const renderFilterValue = (filter: SearchFilter, field: any) => {
    const needsValue = !['is_empty', 'is_not_empty'].includes(filter.operator);
    
    if (!needsValue) {
      return null;
    }

    switch (field.type) {
      case 'select':
        if (filter.operator === 'in' || filter.operator === 'not_in') {
          return (
            <select
              multiple
              value={Array.isArray(filter.value) ? filter.value : []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                updateFilter(filter.id, { value: values });
              }}
              className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm min-w-40"
            >
              {(Array.isArray(field.options) ? field.options : field.options || []).map((option: any) => (
                <option key={typeof option === 'object' ? option.value : option} value={typeof option === 'object' ? option.value : option}>
                  {typeof option === 'object' ? option.label : option}
                </option>
              ))}
            </select>
          );
        } else {
          return (
            <select
              value={filter.value as string}
              onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
              className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm min-w-40"
            >
              <option value="">Select...</option>
              {(Array.isArray(field.options) ? field.options : field.options || []).map((option: any) => (
                <option key={typeof option === 'object' ? option.value : option} value={typeof option === 'object' ? option.value : option}>
                  {typeof option === 'object' ? option.label : option}
                </option>
              ))}
            </select>
          );
        }

      case 'multiselect':
        return (
          <input
            type="text"
            value={Array.isArray(filter.value) ? filter.value.join(', ') : filter.value as string}
            onChange={(e) => {
              const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
              updateFilter(filter.id, { value: values });
            }}
            placeholder="Enter values separated by commas..."
            className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm min-w-40"
          />
        );

      case 'date':
        if (filter.operator === 'between') {
          return (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={typeof filter.value === 'object' && 'start' in filter.value ? new Date(filter.value.start).toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilter(filter.id, { 
                  value: { 
                    ...((filter.value as any) || {}), 
                    start: new Date(e.target.value) 
                  }
                })}
                className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
              />
              <span className="text-cortex-text-muted">to</span>
              <input
                type="date"
                value={typeof filter.value === 'object' && 'end' in filter.value ? new Date(filter.value.end).toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilter(filter.id, { 
                  value: { 
                    ...((filter.value as any) || {}), 
                    end: new Date(e.target.value) 
                  }
                })}
                className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
              />
            </div>
          );
        } else {
          return (
            <input
              type="date"
              value={filter.value instanceof Date ? filter.value.toISOString().split('T')[0] : ''}
              onChange={(e) => updateFilter(filter.id, { value: new Date(e.target.value) })}
              className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
            />
          );
        }

      case 'number':
        if (filter.operator === 'between') {
          return (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={typeof filter.value === 'object' && 'start' in filter.value ? filter.value.start as string : ''}
                onChange={(e) => updateFilter(filter.id, { 
                  value: { 
                    ...((filter.value as any) || {}), 
                    start: e.target.value 
                  }
                })}
                placeholder="Min"
                className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm w-20"
              />
              <span className="text-cortex-text-muted">to</span>
              <input
                type="number"
                value={typeof filter.value === 'object' && 'end' in filter.value ? filter.value.end as string : ''}
                onChange={(e) => updateFilter(filter.id, { 
                  value: { 
                    ...((filter.value as any) || {}), 
                    end: e.target.value 
                  }
                })}
                placeholder="Max"
                className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm w-20"
              />
            </div>
          );
        } else {
          return (
            <input
              type="number"
              value={filter.value as string}
              onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
              className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm min-w-32"
            />
          );
        }

      default:
        return (
          <input
            type="text"
            value={filter.value as string}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            placeholder="Enter value..."
            className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm min-w-40"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cortex-text-primary">Advanced Search</h2>
          <p className="text-cortex-text-secondary">
            Search and filter TRRs with advanced criteria
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {onSaveSearch && (
            <CortexButton
              onClick={() => setShowSaveModal(true)}
              variant="outline"
              icon="💾"
              size="sm"
              disabled={filters.length === 0 && !searchQuery}
            >
              Save Search
            </CortexButton>
          )}
        </div>
      </div>

      {/* Main Search */}
      <div className="cortex-card p-6">
        <div className="space-y-4">
          {/* Global Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search TRRs by title, description, ID, assignee, tags, or project..."
              className="w-full pl-10 pr-4 py-3 bg-cortex-bg-secondary border border-cortex-border-secondary rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50 text-lg"
            />
            <div className="absolute left-3 top-3.5 text-cortex-text-muted">
              🔍
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-cortex-text-muted flex items-center">Quick filters:</span>
            {quickFilters.map((filter, index) => (
              <button
                key={index}
                onClick={filter.action}
                className="px-3 py-1 bg-cortex-info/20 text-cortex-info rounded-full text-sm hover:bg-cortex-info/30 transition-colors"
              >
                {filter.label}
              </button>
            ))}
            {(filters.length > 0 || searchQuery) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-cortex-error/20 text-cortex-error rounded-full text-sm hover:bg-cortex-error/30 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between py-2 border-t border-cortex-border-secondary">
            <div className="text-sm text-cortex-text-secondary">
              {searchResults.length} of {trrs.length} TRRs match your criteria
            </div>
            
            {/* Sort Controls */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-cortex-text-muted">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
              >
                <option value="title">Title</option>
                <option value="status">Status</option>
                <option value="priority">Priority</option>
                <option value="assignedTo">Assignee</option>
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="dueDate">Due Date</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-cortex-text-muted hover:text-cortex-text-primary"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center space-x-2 text-cortex-green hover:text-cortex-green-dark transition-colors"
            >
              <span>{showAdvancedFilters ? '▼' : '▶'}</span>
              <span>Advanced Filters</span>
              {filters.length > 0 && (
                <span className="px-2 py-1 bg-cortex-green/20 text-cortex-green rounded-full text-xs">
                  {filters.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="cortex-card p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-cortex-text-primary">Advanced Filters</h3>
              <CortexButton
                onClick={addFilter}
                variant="outline"
                size="sm"
                icon="+"
              >
                Add Filter
              </CortexButton>
            </div>

            {filters.length === 0 ? (
              <div className="text-center py-8 text-cortex-text-muted">
                No filters applied. Click "Add Filter" to create advanced search criteria.
              </div>
            ) : (
              <div className="space-y-3">
                {filters.map((filter, index) => {
                  const field = filterFields.find(f => f.key === filter.field);
                  const operators = getOperatorsForField(field?.type || 'text');

                  return (
                    <div key={filter.id} className="flex items-center space-x-3 p-3 bg-cortex-bg-tertiary rounded-lg">
                      {index > 0 && (
                        <span className="text-sm font-medium text-cortex-text-muted">AND</span>
                      )}

                      {/* Field */}
                      <select
                        value={filter.field}
                        onChange={(e) => {
                          const newField = filterFields.find(f => f.key === e.target.value);
                          const newOperators = getOperatorsForField(newField?.type || 'text');
                          updateFilter(filter.id, {
                            field: e.target.value,
                            operator: newOperators[0]?.key as any,
                            value: '',
                          });
                        }}
                        className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm min-w-32"
                      >
                        {filterFields.map(field => (
                          <option key={field.key} value={field.key}>
                            {field.label}
                          </option>
                        ))}
                      </select>

                      {/* Operator */}
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(filter.id, { operator: e.target.value as any })}
                        className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm min-w-32"
                      >
                        {operators.map(op => (
                          <option key={op.key} value={op.key}>
                            {op.label}
                          </option>
                        ))}
                      </select>

                      {/* Value */}
                      {field && renderFilterValue(filter, field)}

                      {/* Remove */}
                      <button
                        onClick={() => removeFilter(filter.id)}
                        className="text-cortex-error hover:text-cortex-error-dark p-1"
                        title="Remove filter"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="cortex-card p-6">
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Saved Searches</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedSearches.map((savedSearch) => (
              <div
                key={savedSearch.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedSavedSearch?.id === savedSearch.id
                    ? 'border-cortex-green bg-cortex-green/10'
                    : 'border-cortex-border-secondary hover:border-cortex-green/50'
                }`}
                onClick={() => applySavedSearch(savedSearch)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-cortex-text-primary truncate">
                      {savedSearch.name}
                    </h4>
                    {savedSearch.description && (
                      <p className="text-sm text-cortex-text-secondary mt-1 line-clamp-2">
                        {savedSearch.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-cortex-text-muted">
                      <span>By {savedSearch.createdBy}</span>
                      <span>Used {savedSearch.usageCount} times</span>
                      {savedSearch.isPublic && <span className="text-cortex-success">📢 Public</span>}
                    </div>
                  </div>
                  
                  {savedSearch.createdBy === currentUser && onDeleteSavedSearch && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete saved search "${savedSearch.name}"?`)) {
                          onDeleteSavedSearch(savedSearch.id);
                        }
                      }}
                      className="text-cortex-error hover:text-cortex-error-dark ml-2"
                      title="Delete saved search"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                
                <div className="mt-3">
                  <div className="text-xs text-cortex-text-muted">
                    {savedSearch.filters.length} filter(s)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-cortex-bg-primary rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-cortex-border-secondary">
              <h3 className="text-lg font-semibold text-cortex-text-primary">Save Search</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-cortex-text-primary mb-2">
                  Search Name
                </label>
                <input
                  type="text"
                  value={newSavedSearch.name}
                  onChange={(e) => setNewSavedSearch({ ...newSavedSearch, name: e.target.value })}
                  className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary"
                  placeholder="Enter a name for this search..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-primary mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newSavedSearch.description}
                  onChange={(e) => setNewSavedSearch({ ...newSavedSearch, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary resize-none"
                  placeholder="Describe what this search is for..."
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSavedSearch.isPublic}
                    onChange={(e) => setNewSavedSearch({ ...newSavedSearch, isPublic: e.target.checked })}
                    className="rounded border-cortex-border-secondary"
                  />
                  <span className="text-sm text-cortex-text-primary">
                    Make this search public (visible to all team members)
                  </span>
                </label>
              </div>

              {/* Preview */}
              <div className="p-3 bg-cortex-bg-tertiary rounded">
                <h4 className="text-sm font-medium text-cortex-text-primary mb-2">Search Preview:</h4>
                <div className="text-xs text-cortex-text-muted space-y-1">
                  {searchQuery && (
                    <div>Text search: "{searchQuery}"</div>
                  )}
                  <div>{filters.length} advanced filter(s)</div>
                  <div>Sort by: {sortBy} ({sortOrder})</div>
                  <div>Results: {searchResults.length} TRRs</div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-cortex-border-secondary flex justify-end space-x-3">
              <CortexButton
                onClick={() => setShowSaveModal(false)}
                variant="outline"
              >
                Cancel
              </CortexButton>
              <CortexButton
                onClick={handleSaveSearch}
                variant="primary"
                disabled={!newSavedSearch.name.trim()}
              >
                Save Search
              </CortexButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TRRAdvancedSearch;