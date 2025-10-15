'use client';

import React from 'react';

export interface StatusBadgeProps {
  status: string;
  variant?: 'status' | 'priority' | 'risk' | 'custom';
  colorMap?: Record<string, string>;
  className?: string;
}

const DEFAULT_STATUS_COLORS: Record<string, string> = {
  // POV Status
  'planning': 'bg-gray-500/20 text-cortex-text-secondary border-gray-500/30',
  'active': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'testing': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'demo-ready': 'bg-green-500/20 text-green-400 border-green-500/30',
  'completed': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'paused': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',

  // TRR Status
  'draft': 'text-cortex-text-muted bg-cortex-bg-hover border-cortex-border/40',
  'pending': 'text-status-warning bg-status-warning/10 border-status-warning/30',
  'in-progress': 'text-status-info bg-status-info/10 border-status-info/30',
  'validated': 'text-cortex-primary bg-cortex-primary/10 border-cortex-primary/30',
  'failed': 'text-status-error bg-status-error/10 border-status-error/30',
  'not-applicable': 'text-cortex-text-muted bg-cortex-bg-hover border-cortex-border/40',
};

const DEFAULT_PRIORITY_COLORS: Record<string, string> = {
  'low': 'text-cortex-text-muted bg-cortex-bg-hover border-cortex-border/40',
  'medium': 'text-status-info bg-status-info/10 border-status-info/30',
  'high': 'text-status-warning bg-status-warning/10 border-status-warning/30',
  'critical': 'text-status-error bg-status-error/10 border-status-error/30',
};

const DEFAULT_RISK_COLORS: Record<string, string> = {
  'low': 'text-cortex-text-muted bg-cortex-bg-hover border-cortex-border/40',
  'medium': 'bg-status-info/10 text-status-info border-status-info/30',
  'high': 'bg-status-warning/10 text-status-warning border-status-warning/30',
  'critical': 'bg-status-error/10 text-status-error border-status-error/30',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'status',
  colorMap,
  className = '',
}) => {
  const getColorMap = (): Record<string, string> => {
    if (colorMap) return colorMap;

    switch (variant) {
      case 'priority':
        return DEFAULT_PRIORITY_COLORS;
      case 'risk':
        return DEFAULT_RISK_COLORS;
      case 'status':
      default:
        return DEFAULT_STATUS_COLORS;
    }
  };

  const colors = getColorMap();
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
  const colorClass = colors[normalizedStatus] || 'text-cortex-text-muted bg-cortex-bg-hover border-cortex-border/40';

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass} ${className}`}
    >
      {status.replace('-', ' ').toUpperCase()}
    </span>
  );
};
