'use client';

import React from 'react';
import CortexButton from '../CortexButton';

export interface ListLayoutAction {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'info' | 'warning' | 'ghost' | 'elevated';
}

export interface ListLayoutBulkAction {
  label: string;
  icon?: string;
  onClick: (selectedIds: string[]) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'info' | 'warning' | 'ghost' | 'elevated';
}

export interface ListLayoutProps {
  title: string;
  subtitle?: string;
  icon?: string;

  // Header Actions
  actions?: ListLayoutAction[];

  // Bulk selection
  items: { id: string }[];
  selectedIds?: string[];
  onSelectAll?: (selected: boolean) => void;
  bulkActions?: ListLayoutBulkAction[];

  // Filter bar
  filterBar?: React.ReactNode;

  // Stats cards
  stats?: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;

  // List content
  children: React.ReactNode;

  // Empty state
  emptyState?: {
    icon?: string;
    title: string;
    message: string;
    action?: ListLayoutAction;
  };

  className?: string;
}

export const ListLayout: React.FC<ListLayoutProps> = ({
  title,
  subtitle,
  icon,
  actions = [],
  items = [],
  selectedIds = [],
  onSelectAll,
  bulkActions = [],
  filterBar,
  stats,
  children,
  emptyState,
  className = '',
}) => {
  const hasSelection = selectedIds.length > 0;
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-3">
            {icon && <span className="text-3xl">{icon}</span>}
            <h1 className="text-3xl font-bold text-cortex-text-primary">{title}</h1>
          </div>
          {subtitle && (
            <p className="text-cortex-text-secondary mt-2">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {actions.map((action, index) => (
            <CortexButton
              key={index}
              onClick={action.onClick}
              variant={action.variant || 'outline'}
              icon={action.icon}
            >
              {action.label}
            </CortexButton>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && stats.length > 0 && (
        <div className={`grid gap-4 ${
          stats.length <= 4 ? `grid-cols-2 md:grid-cols-${stats.length}` : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-7'
        }`}>
          {stats.map((stat, index) => (
            <div key={index} className="cortex-card p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color || 'text-cortex-text-primary'}`}>
                {stat.value}
              </div>
              <div className="text-sm text-cortex-text-secondary">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Bar */}
      {filterBar}

      {/* List Container */}
      <div className="cortex-card">
        {/* List Header with Bulk Actions */}
        <div className="p-6 border-b border-cortex-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {onSelectAll && items.length > 0 && (
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-cortex-border/40 focus:ring-cortex-primary"
                  aria-label="Select all items"
                />
              )}
              <h3 className="text-lg font-bold text-cortex-text-primary">
                {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </h3>
            </div>

            {hasSelection && bulkActions.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-cortex-text-secondary">
                  {selectedIds.length} selected
                </span>
                {bulkActions.map((action, index) => (
                  <CortexButton
                    key={index}
                    onClick={() => action.onClick(selectedIds)}
                    variant={action.variant || 'outline'}
                    size="sm"
                    icon={action.icon}
                  >
                    {action.label}
                  </CortexButton>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* List Content */}
        {items.length > 0 ? (
          <div className="divide-y divide-cortex-border/40">
            {children}
          </div>
        ) : emptyState ? (
          <div className="p-12 text-center">
            {emptyState.icon && <div className="text-4xl mb-4">{emptyState.icon}</div>}
            <h3 className="text-lg font-semibold text-cortex-text-primary mb-2">
              {emptyState.title}
            </h3>
            <p className="text-cortex-text-secondary mb-4">{emptyState.message}</p>
            {emptyState.action && (
              <CortexButton
                onClick={emptyState.action.onClick}
                variant={emptyState.action.variant || 'primary'}
                icon={emptyState.action.icon}
              >
                {emptyState.action.label}
              </CortexButton>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
