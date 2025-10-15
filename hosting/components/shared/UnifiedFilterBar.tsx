'use client';

import React from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface UnifiedFilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  statusOptions?: FilterOption[];
  selectedStatus?: string;
  onStatusChange?: (value: string) => void;

  priorityOptions?: FilterOption[];
  selectedPriority?: string;
  onPriorityChange?: (value: string) => void;

  categoryOptions?: FilterOption[];
  selectedCategory?: string;
  onCategoryChange?: (value: string) => void;

  customFilters?: React.ReactNode;

  onClearFilters?: () => void;
  className?: string;
}

export const UnifiedFilterBar: React.FC<UnifiedFilterBarProps> = ({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  statusOptions,
  selectedStatus = '',
  onStatusChange,
  priorityOptions,
  selectedPriority = '',
  onPriorityChange,
  categoryOptions,
  selectedCategory = '',
  onCategoryChange,
  customFilters,
  onClearFilters,
  className = '',
}) => {
  const hasActiveFilters =
    searchValue ||
    selectedStatus ||
    selectedPriority ||
    selectedCategory;

  return (
    <div className={`bg-cortex-bg-secondary rounded-lg p-4 space-y-4 ${className}`}>
      {/* Search Bar */}
      {onSearchChange && (
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-4 py-2 pl-10 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cortex-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {hasActiveFilters && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2 text-sm text-cortex-text-secondary hover:text-cortex-text-primary transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {statusOptions && onStatusChange && (
          <div>
            <label className="block text-xs font-medium text-cortex-text-secondary mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-3 py-2 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {priorityOptions && onPriorityChange && (
          <div>
            <label className="block text-xs font-medium text-cortex-text-secondary mb-1">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="w-full px-3 py-2 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
            >
              <option value="">All Priorities</option>
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {categoryOptions && onCategoryChange && (
          <div>
            <label className="block text-xs font-medium text-cortex-text-secondary mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {customFilters}
      </div>
    </div>
  );
};
