/**
 * UserTimeline Component
 *
 * Displays user activity timeline with filtering, search, and visualization
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useTimeline } from '../hooks/useTimeline';
import {
  TimelineEvent,
  EventSource,
  EventAction,
  TimelineFilter,
  UserStats,
} from '../types/timeline';
import { Timestamp } from 'firebase/firestore';

interface UserTimelineProps {
  userId: string;
  realtime?: boolean;
  showStats?: boolean;
  showFilters?: boolean;
  compact?: boolean;
}

export function UserTimeline({
  userId,
  realtime = false,
  showStats = true,
  showFilters = true,
  compact = false,
}: UserTimelineProps) {
  const [filters, setFilters] = useState<TimelineFilter>({});
  const [searchTerm, setSearchTerm] = useState('');

  const { events, stats, loading, error, hasMore, loadMore, refresh } = useTimeline({
    userId,
    filters,
    pageSize: 50,
    realtime,
  });

  // Filter events by search term (client-side)
  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events;

    const term = searchTerm.toLowerCase();
    return events.filter(
      (event) =>
        event.object.name.toLowerCase().includes(term) ||
        event.action.toLowerCase().includes(term) ||
        event.source.toLowerCase().includes(term)
    );
  }, [events, searchTerm]);

  const handleFilterChange = (key: keyof TimelineFilter, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
  };

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-lg">
        <h3 className="text-red-400 font-semibold mb-2">Error Loading Timeline</h3>
        <p className="text-red-300/80 text-sm">{error.message}</p>
        <button
          onClick={refresh}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      {showStats && stats && <StatsCard stats={stats} />}

      {/* Filters */}
      {showFilters && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Source</label>
              <select
                value={filters.source || 'all'}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sources</option>
                <option value="trr">TRR</option>
                <option value="training">Training</option>
                <option value="knowledgebase">Knowledge Base</option>
                <option value="ui">UI</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Action</label>
              <select
                value={filters.action || 'all'}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Actions</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="status_changed">Status Changed</option>
                <option value="completed">Completed</option>
                <option value="published">Published</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={refresh}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Events */}
      <div className="space-y-3">
        {loading && events.length === 0 ? (
          <LoadingSkeleton />
        ) : filteredEvents.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {filteredEvents.map((event) => (
              <TimelineEventCard key={event.eventId} event={event} compact={compact} />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function StatsCard({ stats }: { stats: UserStats }) {
  const totalEvents =
    Object.values(stats.countsByType).reduce((sum, count) => sum + (count || 0), 0) || 0;

  return (
    <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-300 mb-4">Activity Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatItem label="Total Events" value={totalEvents} />
        <StatItem label="TRRs" value={stats.countsByType.trr || 0} color="text-green-400" />
        <StatItem
          label="Training"
          value={stats.countsByType.training || 0}
          color="text-yellow-400"
        />
        <StatItem label="KB" value={stats.countsByType.knowledgebase || 0} color="text-purple-400" />
        <StatItem
          label="7-day Velocity"
          value={stats.velocity7d?.toFixed(1) || '0'}
          suffix="/day"
          color="text-blue-400"
        />
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  suffix = '',
  color = 'text-slate-200',
}: {
  label: string;
  value: number | string;
  suffix?: string;
  color?: string;
}) {
  return (
    <div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}
        {suffix && <span className="text-sm font-normal text-slate-400">{suffix}</span>}
      </div>
      <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function TimelineEventCard({ event, compact }: { event: TimelineEvent; compact: boolean }) {
  const timestamp = event.ts instanceof Timestamp ? event.ts.toDate() : new Date();
  const formattedTime = formatTimestamp(timestamp);

  const sourceColors: Record<EventSource, string> = {
    trr: 'bg-green-500/20 text-green-300 border-green-500/30',
    training: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    knowledgebase: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    ui: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    system: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  const actionIcons: Record<EventAction, string> = {
    created: '➕',
    updated: '✏️',
    deleted: '🗑️',
    status_changed: '🔄',
    completed: '✅',
    published: '📤',
    archived: '📦',
    viewed: '👁️',
    note_added: '📝',
    linked: '🔗',
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="text-2xl">{actionIcons[event.action] || '📌'}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium border ${sourceColors[event.source]}`}
            >
              {event.source.toUpperCase()}
            </span>
            <span className="text-slate-400 text-xs">{formattedTime}</span>
          </div>

          <div className="text-slate-200 font-medium mb-1">
            {formatAction(event.action)} <span className="text-slate-400">→</span>{' '}
            <span className="text-blue-300">{event.object.name}</span>
          </div>

          {!compact && event.object.status_before !== event.object.status_after && (
            <div className="text-sm text-slate-400">
              Status: <span className="text-slate-300">{event.object.status_before || 'None'}</span>{' '}
              → <span className="text-green-400">{event.object.status_after}</span>
            </div>
          )}

          {!compact && event.delta.fields.length > 0 && (
            <div className="text-xs text-slate-500 mt-1">
              Changed: {event.delta.fields.join(', ')}
            </div>
          )}
        </div>

        {/* Severity Badge */}
        {event.severity !== 'info' && (
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              event.severity === 'error'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : event.severity === 'warn'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}
          >
            {event.severity.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-slate-700 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-700 rounded w-1/4" />
              <div className="h-6 bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-slate-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">📭</div>
      <h3 className="text-xl font-semibold text-slate-300 mb-2">No Events Found</h3>
      <p className="text-slate-400 text-sm">
        Your activity timeline will appear here as you work with TRRs, Training, and Knowledge Base.
      </p>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAction(action: EventAction): string {
  const labels: Record<EventAction, string> = {
    created: 'Created',
    updated: 'Updated',
    deleted: 'Deleted',
    status_changed: 'Status Changed',
    viewed: 'Viewed',
    note_added: 'Note Added',
    linked: 'Linked',
    completed: 'Completed',
    published: 'Published',
    archived: 'Archived',
  };
  return labels[action] || action;
}
