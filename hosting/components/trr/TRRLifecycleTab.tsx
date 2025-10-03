'use client';

import React from 'react';
import { TRR, TRRStatusEvent } from '../../types/trr';
import CortexButton from '../CortexButton';

interface TRRLifecycleTabProps {
  trr: TRR;
  onStatusChange?: (newStatus: string, note?: string) => void;
  onAddEvent?: (event: Omit<TRRStatusEvent, 'timestamp' | 'authorUserId'>) => void;
}

export const TRRLifecycleTab: React.FC<TRRLifecycleTabProps> = ({
  trr,
  onStatusChange,
  onAddEvent,
}) => {
  const getStatusIcon = (status: string): string => {
    const icons = {
      'draft': '📝',
      'pending': '⏳',
      'in-progress': '🔄',
      'in-review': '👀',
      'validated': '✅',
      'approved': '✅',
      'completed': '🎉',
      'failed': '❌',
      'rejected': '❌',
      'deferred': '⏸️',
      'not-applicable': '🚫'
    };
    return icons[status as keyof typeof icons] || '📄';
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      'draft': 'text-cortex-text-muted',
      'pending': 'text-cortex-warning',
      'in-progress': 'text-cortex-info',
      'in-review': 'text-cortex-info',
      'validated': 'text-cortex-green',
      'approved': 'text-cortex-success',
      'completed': 'text-cortex-success',
      'failed': 'text-cortex-error',
      'rejected': 'text-cortex-error',
      'deferred': 'text-cortex-text-muted',
      'not-applicable': 'text-cortex-text-muted'
    };
    return colors[status as keyof typeof colors] || 'text-cortex-text-muted';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextPossibleStatuses = (currentStatus: string): string[] => {
    const statusFlow = {
      'draft': ['pending', 'deferred'],
      'pending': ['in-progress', 'deferred', 'not-applicable'],
      'in-progress': ['in-review', 'failed', 'deferred'],
      'in-review': ['validated', 'rejected', 'in-progress'],
      'validated': ['approved', 'rejected'],
      'approved': ['completed', 'in-progress'],
      'completed': [],
      'failed': ['in-progress', 'deferred'],
      'rejected': ['in-progress', 'deferred'],
      'deferred': ['pending', 'in-progress'],
      'not-applicable': []
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || [];
  };

  const calculateDuration = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInHours = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.round(diffInHours)}h`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day';
    if (diffInDays < 7) return `${diffInDays} days`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 1) return '1 week';
    return `${diffInWeeks} weeks`;
  };

  // Sort status history by timestamp
  const sortedHistory = [...(trr.statusHistory || [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const nextStatuses = getNextPossibleStatuses(trr.status);

  return (
    <div className="space-y-6">
      {/* Current Status & Quick Actions */}
      <div className="cortex-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-cortex-text-primary">
            Current Status
          </h3>
          {nextStatuses.length > 0 && onStatusChange && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-cortex-text-muted">Transition to:</span>
              {nextStatuses.map(status => (
                <CortexButton
                  key={status}
                  onClick={() => onStatusChange(status)}
                  variant="outline"
                  size="sm"
                  icon={getStatusIcon(status)}
                >
                  {status.replace('-', ' ').toUpperCase()}
                </CortexButton>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(trr.status)}</span>
            <div>
              <h4 className={`text-xl font-semibold ${getStatusColor(trr.status)}`}>
                {trr.status.replace('-', ' ').toUpperCase()}
              </h4>
              <p className="text-cortex-text-muted">
                Since {formatDate(trr.updatedDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lifecycle Timeline */}
      <div className="cortex-card p-6">
        <h3 className="text-lg font-semibold text-cortex-text-primary mb-6">
          Lifecycle Timeline
        </h3>
        
        {sortedHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-cortex-text-muted">No status history available</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-cortex-border-secondary"></div>
            
            {/* Timeline Events */}
            <div className="space-y-6">
              {sortedHistory.map((event, index) => {
                const isFirst = index === 0;
                const isLast = index === sortedHistory.length - 1;
                const previousEvent = index > 0 ? sortedHistory[index - 1] : null;
                
                return (
                  <div key={`${event.timestamp}-${event.status}`} className="relative flex items-start space-x-4">
                    {/* Timeline Marker */}
                    <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-4 border-cortex-bg-primary flex items-center justify-center ${
                      isLast 
                        ? 'bg-cortex-green text-white' 
                        : 'bg-cortex-bg-secondary'
                    }`}>
                      <span className="text-lg">
                        {getStatusIcon(event.status)}
                      </span>
                    </div>
                    
                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                      <div className="cortex-card p-4 bg-cortex-bg-tertiary">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className={`font-semibold ${getStatusColor(event.status)}`}>
                              {event.status.replace('-', ' ').toUpperCase()}
                            </h4>
                            <p className="text-sm text-cortex-text-muted">
                              {formatDate(event.timestamp)}
                            </p>
                          </div>
                          
                          {/* Duration Badge */}
                          {previousEvent && (
                            <div className="text-xs text-cortex-text-muted bg-cortex-bg-hover px-2 py-1 rounded">
                              {calculateDuration(previousEvent.timestamp, event.timestamp)}
                            </div>
                          )}
                        </div>
                        
                        {/* Author */}
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm text-cortex-text-secondary">
                            by {event.authorUserId || 'System'}
                          </span>
                        </div>
                        
                        {/* Note */}
                        {event.note && (
                          <div className="text-sm text-cortex-text-primary bg-cortex-bg-hover p-3 rounded border-l-4 border-cortex-info">
                            {event.note}
                          </div>
                        )}
                        
                        {/* Stage Metrics */}
                        {!isFirst && previousEvent && (
                          <div className="mt-3 pt-3 border-t border-cortex-border-secondary">
                            <div className="grid grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-cortex-text-muted">Duration:</span>
                                <div className="font-medium text-cortex-text-primary">
                                  {calculateDuration(previousEvent.timestamp, event.timestamp)}
                                </div>
                              </div>
                              <div>
                                <span className="text-cortex-text-muted">From:</span>
                                <div className="font-medium text-cortex-text-primary">
                                  {formatDateShort(previousEvent.timestamp)}
                                </div>
                              </div>
                              <div>
                                <span className="text-cortex-text-muted">To:</span>
                                <div className="font-medium text-cortex-text-primary">
                                  {formatDateShort(event.timestamp)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lifecycle Metrics */}
      <div className="cortex-card p-6">
        <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">
          Lifecycle Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Time */}
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-info">
              {sortedHistory.length >= 2 
                ? calculateDuration(sortedHistory[0].timestamp, sortedHistory[sortedHistory.length - 1].timestamp)
                : '—'
              }
            </div>
            <p className="text-sm text-cortex-text-muted">Total Time</p>
          </div>
          
          {/* Status Changes */}
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-green">
              {sortedHistory.length}
            </div>
            <p className="text-sm text-cortex-text-muted">Status Changes</p>
          </div>
          
          {/* Average Stage Duration */}
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-warning">
              {sortedHistory.length >= 3 ? (
                (() => {
                  const durations = [];
                  for (let i = 1; i < sortedHistory.length; i++) {
                    const start = new Date(sortedHistory[i - 1].timestamp);
                    const end = new Date(sortedHistory[i].timestamp);
                    durations.push(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60));
                  }
                  const avgHours = durations.reduce((sum, h) => sum + h, 0) / durations.length;
                  return avgHours < 24 ? `${Math.round(avgHours)}h` : `${Math.round(avgHours / 24)}d`;
                })()
              ) : '—'}
            </div>
            <p className="text-sm text-cortex-text-muted">Avg Stage Duration</p>
          </div>
        </div>
      </div>

      {/* Predictive Timeline */}
      {trr.aiPrediction && (
        <div className="cortex-card p-6">
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">
            Predictive Timeline
          </h3>
          
          <div className="bg-cortex-bg-tertiary p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🔮</span>
                <h4 className="font-semibold text-cortex-text-primary">
                  AI Prediction
                </h4>
              </div>
              <div className="text-sm text-cortex-text-muted">
                Confidence: {Math.round(trr.aiPrediction.confidence * 100)}%
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-cortex-text-muted">Predicted Completion:</p>
                <p className="font-semibold text-cortex-info">
                  {trr.aiPrediction.predictedCompletionDate 
                    ? formatDate(trr.aiPrediction.predictedCompletionDate)
                    : 'Not available'
                  }
                </p>
              </div>
              
              <div>
                <div className="w-full bg-cortex-bg-hover rounded-full h-3">
                  <div 
                    className="bg-cortex-green h-3 rounded-full transition-all duration-300"
                    style={{ width: `${trr.aiPrediction.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {trr.aiPrediction.rationale && (
              <div className="mt-4 p-3 bg-cortex-bg-hover rounded border-l-4 border-cortex-info">
                <p className="text-sm text-cortex-text-primary">
                  <strong>Rationale:</strong> {trr.aiPrediction.rationale}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TRRLifecycleTab;