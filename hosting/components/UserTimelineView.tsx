'use client';

import React, { useState, useEffect, useMemo } from 'react';
import CortexButton from './CortexButton';
import userActivityService, { TimelineEvent, UserNote, MeetingCapture, ActionItem } from '../lib/user-activity-service';

interface UserTimelineViewProps {
  className?: string;
  maxEvents?: number;
  showFilters?: boolean;
  compactMode?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface TimelineGroup {
  date: string;
  events: TimelineEvent[];
}

const UserTimelineView: React.FC<UserTimelineViewProps> = ({
  className = '',
  maxEvents = 100,
  showFilters = true,
  compactMode = false,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);

  // Load timeline events
  const loadTimelineEvents = () => {
    setIsLoading(true);
    
    try {
      let dateFilter: { start: string; end: string } | undefined;
      const now = new Date();
      
      switch (dateRange) {
        case 'today':
          dateFilter = {
            start: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
            end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
          };
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - 7);
          dateFilter = { start: weekStart.toISOString(), end: now.toISOString() };
          break;
        case 'month':
          const monthStart = new Date(now);
          monthStart.setDate(now.getDate() - 30);
          dateFilter = { start: monthStart.toISOString(), end: now.toISOString() };
          break;
      }

      const allEvents = userActivityService.getTimelineEvents({
        ...(selectedCategory !== 'all' && { category: selectedCategory as any }),
        ...(selectedType !== 'all' && { type: selectedType as any }),
        ...(dateFilter && { dateRange: dateFilter })
      });

      setEvents(allEvents.slice(0, maxEvents));
      
      // Get insights
      const insightData = userActivityService.getInsights();
      setInsights(insightData);
    } catch (error) {
      console.error('Failed to load timeline events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = [...events];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term)
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  // Initial load
  useEffect(() => {
    loadTimelineEvents();
  }, [selectedCategory, selectedType, dateRange]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(loadTimelineEvents, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, selectedCategory, selectedType, dateRange]);

  // Group events by date
  const groupedEvents = useMemo<TimelineGroup[]>(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    
    filteredEvents.forEach(event => {
      const date = new Date(event.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
    });

    return Object.entries(groups)
      .map(([date, events]) => ({ date, events }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredEvents]);

  const getEventIcon = (type: TimelineEvent['type']): string => {
    const icons = {
      'pov-created': '🎯',
      'pov-updated': '📝',
      'meeting': '👥',
      'note': '📋',
      'scenario-generated': '🔬',
      'customer-interaction': '🤝',
      'milestone': '🏆',
      'action-item': '✅'
    };
    return icons[type] || '📌';
  };

  const getEventColor = (type: TimelineEvent['type'], priority: TimelineEvent['priority']): string => {
    const priorityColors = {
      high: 'border-red-500 bg-red-500/10',
      medium: 'border-yellow-500 bg-yellow-500/10',
      low: 'border-blue-500 bg-blue-500/10'
    };
    return priorityColors[priority] || 'border-gray-500 bg-gray-500/10';
  };

  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return eventTime.toLocaleDateString();
  };

  // Quick actions
  const createQuickNote = async () => {
    try {
      await userActivityService.createNote({
        title: 'Quick Note',
        content: '',
        type: 'general',
        tags: [],
        pinned: false,
        archived: false
      });
      loadTimelineEvents();
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const scheduleQuickMeeting = async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      await userActivityService.scheduleMeeting({
        title: 'New Meeting',
        type: 'demo',
        participants: [],
        scheduledAt: tomorrow.toISOString(),
        agenda: [],
        notes: '',
        actionItems: []
      });
      loadTimelineEvents();
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
    }
  };

  if (isLoading && events.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="cortex-spinner mx-auto mb-4"></div>
          <p className="text-cortex-text-secondary">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">⏰</div>
            <div>
              <h2 className="text-2xl font-bold text-white">Activity Timeline</h2>
              <p className="text-cortex-text-secondary">Track your progress and activities</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <CortexButton
              variant="ghost"
              size="sm"
              icon="📝"
              onClick={createQuickNote}
              tooltip="Create quick note"
              trackActivity={true}
              activityContext="timeline-quick-note"
            >
              Quick Note
            </CortexButton>
            <CortexButton
              variant="ghost"
              size="sm"
              icon="📅"
              onClick={scheduleQuickMeeting}
              tooltip="Schedule meeting"
              trackActivity={true}
              activityContext="timeline-quick-meeting"
            >
              Schedule
            </CortexButton>
            <CortexButton
              variant="outline"
              size="sm"
              icon="🔄"
              onClick={loadTimelineEvents}
              tooltip="Refresh timeline"
              trackActivity={true}
              activityContext="timeline-refresh"
            >
              Refresh
            </CortexButton>
          </div>
        </div>

        {/* Insights Dashboard */}
        {insights && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{insights.totalNotes}</div>
              <div className="text-xs text-cortex-text-secondary">Notes</div>
            </div>
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{insights.totalMeetings}</div>
              <div className="text-xs text-cortex-text-secondary">Meetings</div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">{insights.pendingActionItems}</div>
              <div className="text-xs text-cortex-text-secondary">Pending</div>
            </div>
            <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{insights.recentActivity}</div>
              <div className="text-xs text-cortex-text-secondary">Recent</div>
            </div>
            <div className="bg-cyan-900/20 border border-cyan-600/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-cyan-400">{insights.productivityScore}%</div>
              <div className="text-xs text-cortex-text-secondary">Score</div>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white"
              >
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="all">All Time</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white"
              >
                <option value="all">All Categories</option>
                <option value="pov">POV</option>
                <option value="customer">Customer</option>
                <option value="technical">Technical</option>
                <option value="administrative">Administrative</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white"
              >
                <option value="all">All Types</option>
                <option value="pov-created">POV Created</option>
                <option value="pov-updated">POV Updated</option>
                <option value="meeting">Meetings</option>
                <option value="note">Notes</option>
                <option value="scenario-generated">Scenarios</option>
                <option value="customer-interaction">Customer</option>
                <option value="milestone">Milestones</option>
                <option value="action-item">Action Items</option>
              </select>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search timeline events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cortex-text-secondary">
                🔍
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="p-6">
        {groupedEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No activities yet</h3>
            <p className="text-cortex-text-secondary mb-6">Start creating POVs, taking notes, or scheduling meetings to see your timeline.</p>
            <div className="flex justify-center space-x-3">
              <CortexButton
                variant="primary"
                icon="📝"
                onClick={createQuickNote}
                trackActivity={true}
                activityContext="timeline-empty-quick-note"
              >
                Create Note
              </CortexButton>
              <CortexButton
                variant="outline"
                icon="📅"
                onClick={scheduleQuickMeeting}
                trackActivity={true}
                activityContext="timeline-empty-schedule-meeting"
              >
                Schedule Meeting
              </CortexButton>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedEvents.map(group => (
              <div key={group.date}>
                <div className="sticky top-0 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 mb-4 z-10">
                  <h3 className="font-bold text-white">{group.date}</h3>
                  <p className="text-sm text-cortex-text-secondary">{group.events.length} events</p>
                </div>

                <div className="space-y-4">
                  {group.events.map((event, index) => (
                    <div key={event.id} className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-6 top-12 bottom-0 w-px bg-gray-600"></div>

                      {/* Event card */}
                      <div className={`ml-14 p-4 rounded-lg border-l-4 ${getEventColor(event.type, event.priority)} ${compactMode ? 'py-2' : 'py-4'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="text-2xl" title={event.type}>
                              {getEventIcon(event.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-bold text-white text-sm">{event.title}</h4>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  event.priority === 'high' ? 'bg-red-600 text-white' :
                                  event.priority === 'medium' ? 'bg-yellow-600 text-white' :
                                  'bg-blue-600 text-white'
                                }`}>
                                  {event.priority}
                                </span>
                              </div>
                              
                              <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                              
                              {/* Metadata */}
                              {Object.keys(event.metadata).length > 0 && !compactMode && (
                                <div className="text-xs text-cortex-text-secondary space-x-4">
                                  {Object.entries(event.metadata).map(([key, value]) => (
                                    <span key={key}>
                                      <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-right text-xs text-cortex-text-secondary ml-4">
                            <div>{formatRelativeTime(event.timestamp)}</div>
                            <div>{new Date(event.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </div>

                        {/* Associated content preview */}
                        {event.associatedId && !compactMode && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <div className="flex items-center space-x-2 text-xs text-cortex-text-secondary">
                              <span>🔗</span>
                              <span>Related ID: {event.associatedId}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Timeline dot */}
                      <div className="absolute left-4 top-4 w-4 h-4 bg-blue-500 border-2 border-gray-900 rounded-full z-10"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more button */}
        {filteredEvents.length === maxEvents && (
          <div className="text-center mt-8">
            <CortexButton
              variant="outline"
              onClick={() => {
                // This would load more events in a real implementation
                console.log('Load more events');
              }}
              trackActivity={true}
              activityContext="timeline-load-more"
            >
              Load More Events
            </CortexButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTimelineView;