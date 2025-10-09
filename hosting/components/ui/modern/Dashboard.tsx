'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../../../lib/utils';
import { ModernCard, ModernButton, ModernBadge /*, ModernProgressBar - unused 2025-01-08 */ } from './index';

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: 'accent' | 'success' | 'warning' | 'error' | 'info';
  description?: string;
}

interface DashboardProps {
  metrics: DashboardMetric[];
  className?: string;
}

export const ModernDashboard: React.FC<DashboardProps> = ({
  metrics,
  className
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
};

interface MetricCardProps {
  metric: DashboardMetric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  // Memoize numericValue calculation to avoid inconsistent effect triggers
  // Sanitize NaN cases by falling back to 0 (2025-01-09 - fixes React hooks exhaustive-deps warning)
  const numericValue = useMemo(() => {
    if (typeof metric.value === 'number') {
      return isNaN(metric.value) ? 0 : metric.value;
    }
    const parsed = parseFloat(metric.value.toString().replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }, [metric.value]);

  useEffect(() => {
    if (typeof metric.value === 'number') {
      let start = 0;
      const end = numericValue;
      const duration = 1000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setAnimatedValue(end);
          clearInterval(timer);
        } else {
          setAnimatedValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
    // Dependencies: numericValue and metric.value (2025-01-09 - fixes React hooks exhaustive-deps warning)
  }, [numericValue, metric.value]);

  /* LEGACY color mappings (preserved for backward compatibility)
  const legacyColorClasses = {
    accent: 'border-cortex-accent/30 bg-gradient-to-br from-cortex-accent/5 to-cortex-accent/10',
    success: 'border-cortex-success/30 bg-gradient-to-br from-cortex-success/5 to-cortex-success/10',
    warning: 'border-cortex-warning/30 bg-gradient-to-br from-cortex-warning/5 to-cortex-warning/10',
    error: 'border-cortex-error/30 bg-gradient-to-br from-cortex-error/5 to-cortex-error/10',
    info: 'border-cortex-info/30 bg-gradient-to-br from-cortex-info/5 to-cortex-info/10'
  };
  */

  // MODERN: Updated color mappings with semantic token system
  const colorClasses = {
    accent: 'border-cortex-primary/30 bg-gradient-to-br from-cortex-primary/5 to-cortex-primary/10',
    success: 'border-status-success/30 bg-gradient-to-br from-status-success/5 to-status-success/10',
    warning: 'border-status-warning/30 bg-gradient-to-br from-status-warning/5 to-status-warning/10',
    error: 'border-status-error/30 bg-gradient-to-br from-status-error/5 to-status-error/10',
    info: 'border-cortex-blue/30 bg-gradient-to-br from-cortex-blue/5 to-cortex-blue/10'
  };

  const iconColors = {
    accent: 'text-cortex-primary',
    success: 'text-status-success',
    warning: 'text-status-warning',
    error: 'text-status-error',
    info: 'text-cortex-blue'
  };

  const changeColors = {
    increase: 'text-status-success',
    decrease: 'text-status-error',
    neutral: 'text-cortex-text-muted'
  };

  // MODERN: Enhanced number formatting with internationalization
  const formatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
  const displayValue = typeof metric.value === 'number' ? formatter.format(animatedValue) : metric.value;

  return (
    <ModernCard 
      variant="glass"
      padding="md"
      className={cn(
        'motion-safe-scale cursor-pointer focus-visible:ring-2 focus-visible:ring-ring-brand focus-visible:outline-none',
        colorClasses[metric.color],
        isHovered && 'shadow-glass-lg'
      )}
      tabIndex={0}
      role="button"
      aria-label={`${metric.title}: ${displayValue}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className={cn('text-lg', iconColors[metric.color])}>
              {metric.icon}
            </span>
            <h3 className="text-sm font-medium text-cortex-text-secondary">
              {metric.title}
            </h3>
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-bold text-cortex-text-primary">
              {displayValue}
            </div>
            
            {metric.change !== undefined && (
              <div className="flex items-center space-x-1">
                <svg 
                  className={cn(
                    'h-3 w-3',
                    changeColors[metric.changeType || 'neutral'],
                    metric.changeType === 'increase' && 'rotate-0',
                    metric.changeType === 'decrease' && 'rotate-180'
                  )} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l10-10M17 7l-3-3m3 3v3" />
                </svg>
                <span className={cn('text-xs font-medium', changeColors[metric.changeType || 'neutral'])}>
                  {Math.abs(metric.change)}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        {isHovered && (
          <div className="text-xs text-cortex-text-muted opacity-0 animate-fade-in">
            {metric.description && (
              <p className="max-w-24 text-right">{metric.description}</p>
            )}
          </div>
        )}
      </div>
    </ModernCard>
  );
};

// Activity Feed Component
interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  className?: string;
}

export const ModernActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxItems = 5,
  className
}) => {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <ModernCard variant="glass" padding="md" className={className}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-cortex-text-primary flex items-center">
          <svg className="h-5 w-5 mr-2 text-cortex-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Activity
        </h3>
        
        <div className="space-y-3">
          {displayActivities.map((activity, index) => (
            <ActivityItem 
              key={activity.id} 
              activity={activity} 
              index={index}
            />
          ))}
        </div>
        
        {activities.length > maxItems && (
          <div className="pt-3 border-t border-cortex-border-secondary">
            <ModernButton 
              variant="ghost" 
              size="sm" 
              className="w-full"
            >
              View All Activity
            </ModernButton>
          </div>
        )}
      </div>
    </ModernCard>
  );
};

interface ActivityItemProps {
  activity: ActivityItem;
  index: number;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, index }) => {
  const typeIcons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️'
  };

  const typeColors = {
    success: 'text-cortex-success',
    warning: 'text-cortex-warning',
    error: 'text-cortex-error',
    info: 'text-cortex-info'
  };

  return (
    <div 
      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-cortex-elevated/50 transition-colors motion-safe:animate-slide-right-modern"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <span className={cn('text-sm', typeColors[activity.type])}>
        {typeIcons[activity.type]}
      </span>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-cortex-text-primary">
            {activity.title}
          </h4>
          <time className="text-xs text-cortex-text-muted">
            {activity.timestamp.toLocaleTimeString()}
          </time>
        </div>
        
        <p className="text-xs text-cortex-text-secondary">
          {activity.description}
        </p>
        
        {activity.user && (
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-cortex-accent rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {activity.user.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-cortex-text-muted">
              {activity.user}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Actions Grid
interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'accent' | 'success' | 'warning' | 'error' | 'info';
  action: () => void;
  badge?: string | number;
}

interface QuickActionsProps {
  actions: QuickActionItem[];
  className?: string;
}

export const ModernQuickActions: React.FC<QuickActionsProps> = ({
  actions,
  className
}) => {
  return (
    <ModernCard variant="glass" padding="md" className={className}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-cortex-text-primary flex items-center">
          <svg className="h-5 w-5 mr-2 text-cortex-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <QuickActionButton 
              key={action.id} 
              action={action} 
              index={index}
            />
          ))}
        </div>
      </div>
    </ModernCard>
  );
};

interface QuickActionButtonProps {
  action: QuickActionItem;
  index: number;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ action, index }) => {
  // Map action colors to valid ModernBadge variants (2025-01-08 - fixes TS error)
  const badgeVariantMap: Record<QuickActionItem['color'], 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    accent: 'info',    // accent maps to info for ModernBadge compatibility
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info'
  };

  // MODERN: Updated color mappings for QuickActionButton
  const colorClasses = {
    accent: 'border-cortex-primary/30 hover:bg-cortex-primary/10 hover:border-cortex-primary/50',
    success: 'border-status-success/30 hover:bg-status-success/10 hover:border-status-success/50',
    warning: 'border-status-warning/30 hover:bg-status-warning/10 hover:border-status-warning/50',
    error: 'border-status-error/30 hover:bg-status-error/10 hover:border-status-error/50',
    info: 'border-cortex-blue/30 hover:bg-cortex-blue/10 hover:border-cortex-blue/50'
  };

  const iconColors = {
    accent: 'text-cortex-primary',
    success: 'text-status-success',
    warning: 'text-status-warning',
    error: 'text-status-error',
    info: 'text-cortex-blue'
  };

  return (
    <button
      onClick={action.action}
      className={cn(
        'relative p-4 border rounded-xl transition-all duration-200 text-left group motion-safe:animate-scale-in-modern motion-safe-scale focus-visible:ring-2 focus-visible:ring-ring-brand focus-visible:outline-none',
        colorClasses[action.color]
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={cn('text-lg', iconColors[action.color])}>
            {action.icon}
          </span>
          {action.badge && (
            // Original line: <ModernBadge variant={action.color} size="sm"> - commented 2025-01-08
            <ModernBadge variant={badgeVariantMap[action.color]} size="sm">
              {action.badge}
            </ModernBadge>
          )}
        </div>
        
        <div>
          <h4 className="font-medium text-cortex-text-primary group-hover:text-cortex-accent transition-colors">
            {action.title}
          </h4>
          <p className="text-xs text-cortex-text-muted">
            {action.description}
          </p>
        </div>
      </div>
    </button>
  );
};