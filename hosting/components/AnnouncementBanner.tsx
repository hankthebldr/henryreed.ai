'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { ACTIVE_ANNOUNCEMENTS, getPlatformAnnouncements, getProductAnnouncements, Announcement } from '../lib/announcements';

/**
 * AnnouncementBanner Component
 *
 * Welcome banner displaying key product announcements for platform and product updates
 */

interface AnnouncementBannerProps {
  onDismiss?: () => void;
  className?: string;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  onDismiss,
  className
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'platform' | 'product'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Check if banner was previously dismissed (using localStorage)
  useEffect(() => {
    const dismissed = localStorage.getItem('announcementBannerDismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('announcementBannerDismissed', 'true');
    onDismiss?.();
  };

  const handleRestore = () => {
    setIsDismissed(false);
    localStorage.removeItem('announcementBannerDismissed');
  };

  // Filter announcements based on active tab
  const displayedAnnouncements = React.useMemo(() => {
    switch (activeTab) {
      case 'platform':
        return getPlatformAnnouncements();
      case 'product':
        return getProductAnnouncements();
      default:
        return ACTIVE_ANNOUNCEMENTS;
    }
  }, [activeTab]);

  const getCategoryColor = (category: Announcement['category']) => {
    switch (category) {
      case 'platform':
        return 'bg-cortex-primary/10 text-cortex-primary border-cortex-primary/30';
      case 'product':
        return 'bg-cortex-accent/10 text-cortex-accent border-cortex-accent/30';
      case 'feature':
        return 'bg-cortex-success/10 text-cortex-success border-cortex-success/30';
      case 'maintenance':
        return 'bg-cortex-warning/10 text-cortex-warning border-cortex-warning/30';
      default:
        return 'bg-cortex-info/10 text-cortex-info border-cortex-info/30';
    }
  };

  const getPriorityIndicator = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'high':
        return <div className="w-2 h-2 bg-cortex-success rounded-full animate-pulse" />;
      case 'medium':
        return <div className="w-2 h-2 bg-cortex-info rounded-full" />;
      case 'low':
        return <div className="w-2 h-2 bg-cortex-text-muted rounded-full" />;
    }
  };

  if (isDismissed) {
    // Show minimal restore button
    return (
      <div className={cn('flex items-center justify-center py-2', className)}>
        <button
          onClick={handleRestore}
          className="text-xs text-cortex-text-muted hover:text-cortex-primary transition-colors flex items-center space-x-2"
        >
          <span>📢</span>
          <span>Show Announcements</span>
        </button>
      </div>
    );
  }

  return (
    <div className={cn('cortex-card overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-cortex-primary/20 to-cortex-accent/20 border-b border-cortex-border/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">📢</span>
            <div>
              <h2 className="text-xl font-bold text-cortex-text-primary">Key Product Announcements</h2>
              <p className="text-sm text-cortex-text-muted">Latest updates for DC Portal & XSIAM</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-cortex-bg-tertiary/50 text-cortex-text-muted hover:text-cortex-text-primary hover:bg-cortex-bg-tertiary transition-colors"
            title="Dismiss announcements"
          >
            ✕ Dismiss
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 mt-4">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === 'all'
                ? 'bg-cortex-bg-primary text-cortex-text-primary shadow-md'
                : 'bg-cortex-bg-tertiary/30 text-cortex-text-muted hover:text-cortex-text-primary hover:bg-cortex-bg-tertiary/50'
            )}
          >
            All Updates ({ACTIVE_ANNOUNCEMENTS.length})
          </button>
          <button
            onClick={() => setActiveTab('platform')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2',
              activeTab === 'platform'
                ? 'bg-cortex-primary/20 text-cortex-primary border border-cortex-primary/40'
                : 'bg-cortex-bg-tertiary/30 text-cortex-text-muted hover:text-cortex-text-primary hover:bg-cortex-bg-tertiary/50'
            )}
          >
            <span>🏢</span>
            <span>DC Portal ({getPlatformAnnouncements().length})</span>
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2',
              activeTab === 'product'
                ? 'bg-cortex-accent/20 text-cortex-accent border border-cortex-accent/40'
                : 'bg-cortex-bg-tertiary/30 text-cortex-text-muted hover:text-cortex-text-primary hover:bg-cortex-bg-tertiary/50'
            )}
          >
            <span>🛡️</span>
            <span>XSIAM ({getProductAnnouncements().length})</span>
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto terminal-scrollbar">
        {displayedAnnouncements.length === 0 ? (
          <div className="text-center py-8 text-cortex-text-muted">
            <div className="text-4xl mb-2">🔍</div>
            <p>No announcements in this category</p>
          </div>
        ) : (
          displayedAnnouncements.map((announcement) => {
            const isExpanded = expandedId === announcement.id;

            return (
              <div
                key={announcement.id}
                className="cortex-card p-4 hover:bg-cortex-bg-hover/30 transition-all duration-200"
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="text-3xl mt-1">{announcement.icon}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {getPriorityIndicator(announcement.priority)}
                          <h3 className="text-base font-bold text-cortex-text-primary">
                            {announcement.title}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2 flex-wrap gap-2">
                          <span className={cn('px-2 py-0.5 text-xs rounded border', getCategoryColor(announcement.category))}>
                            {announcement.category.toUpperCase()}
                          </span>
                          {announcement.version && (
                            <span className="px-2 py-0.5 text-xs bg-cortex-bg-tertiary text-cortex-text-secondary rounded border border-cortex-border/30">
                              {announcement.version}
                            </span>
                          )}
                          <span className="text-xs text-cortex-text-muted">
                            {new Date(announcement.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Expand/Collapse */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
                        className="ml-4 text-cortex-primary hover:text-cortex-primary-light transition-colors"
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-cortex-text-secondary mb-3 leading-relaxed">
                      {announcement.description}
                    </p>

                    {/* Expanded Content */}
                    {isExpanded && announcement.tags && (
                      <div className="mb-3 flex items-center space-x-2 flex-wrap gap-2">
                        <span className="text-xs text-cortex-text-muted">Tags:</span>
                        {announcement.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-cortex-bg-secondary text-cortex-text-primary rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Link */}
                    {announcement.link && (
                      <a
                        href={announcement.link}
                        target={announcement.link.startsWith('http') ? '_blank' : '_self'}
                        rel={announcement.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center space-x-2 text-sm text-cortex-primary hover:text-cortex-primary-light transition-colors"
                      >
                        <span>{announcement.linkText || 'Learn More'}</span>
                        <span>{announcement.link.startsWith('http') ? '↗' : '→'}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="bg-cortex-bg-secondary/30 border-t border-cortex-border/30 px-6 py-3 text-center">
        <p className="text-xs text-cortex-text-muted">
          Have feedback on these updates?{' '}
          <a
            href="https://github.com/anthropics/claude-code/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cortex-primary hover:text-cortex-primary-light"
          >
            Share your thoughts
          </a>
        </p>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
