'use client';

import React from 'react';
import { StatusBadge } from './StatusBadge';
import CortexButton from '../CortexButton';

export interface ResourceCardAction {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'info' | 'warning' | 'ghost' | 'elevated';
  ariaLabel?: string;
  className?: string;
}

export interface ResourceCardMetadata {
  label: string;
  value: string | React.ReactNode;
}

export interface ResourceCardProps {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  riskLevel?: string;
  tags?: string[];
  metadata: ResourceCardMetadata[];
  actions: ResourceCardAction[];
  secondaryActions?: ResourceCardAction[];
  onSelect?: (id: string, selected: boolean) => void;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  id,
  title,
  description,
  status,
  priority,
  riskLevel,
  tags = [],
  metadata,
  actions,
  secondaryActions = [],
  onSelect,
  selected = false,
  onClick,
  className = '',
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input[type="checkbox"]')) {
      return;
    }
    onClick?.();
  };

  return (
    <div
      className={`p-6 hover:bg-cortex-bg-hover/50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleCardClick}
    >
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(id, e.target.checked)}
            className="mt-1 rounded border-cortex-border/40 focus:ring-cortex-primary"
            aria-label={`Select ${title}`}
          />
        )}

        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-cortex-text-primary truncate">
                {title}
              </h4>
              <span className="font-mono text-sm text-cortex-accent shrink-0">
                {id}
              </span>
            </div>

            <div className="flex items-center space-x-2 shrink-0 ml-4">
              <StatusBadge status={status} variant="status" />
              {priority && <StatusBadge status={priority} variant="priority" />}
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-cortex-text-secondary mb-3 line-clamp-2">
              {description}
            </p>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-cortex-text-muted mb-3">
            {metadata.map((item, index) => (
              <div key={index}>
                <span className="font-medium">{item.label}:</span>{' '}
                {typeof item.value === 'string' ? (
                  <span className="text-cortex-text-primary">{item.value}</span>
                ) : (
                  item.value
                )}
              </div>
            ))}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-cortex-bg-tertiary text-cortex-text-muted rounded border border-cortex-border/40"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-1 text-xs text-cortex-text-muted">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              {actions.map((action, index) => (
                <CortexButton
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || 'outline'}
                  size="sm"
                  icon={action.icon}
                  ariaLabel={action.ariaLabel}
                  className={action.className}
                >
                  {action.label}
                </CortexButton>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              {riskLevel && riskLevel !== 'low' && (
                <StatusBadge status={`${riskLevel} RISK`} variant="risk" />
              )}
              {secondaryActions.map((action, index) => (
                <CortexButton
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || 'outline'}
                  size="sm"
                  icon={action.icon}
                  ariaLabel={action.ariaLabel}
                  className={action.className}
                >
                  {action.label}
                </CortexButton>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
