'use client';

import React from 'react';
import { TRR, TRRStatusEvent } from '../types/trr';

interface TRRTimelineProps {
  trr?: TRR;
  trrs?: TRR[]; // For multi-TRR view
  showPredictions?: boolean;
  compact?: boolean;
  maxEvents?: number; // Limit number of events shown
}

export const TRRTimeline: React.FC<TRRTimelineProps> = ({ 
  trr, 
  trrs, 
  showPredictions = true,
  compact = false,
  maxEvents
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'validated':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'completed':
        return 'bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };

  // Get all status events (from one TRR or multiple TRRs)
  const getAllEvents = (): {trrId?: string; trrTitle?: string; event: TRRStatusEvent}[] => {
    if (trr) {
      // Single TRR view
      return trr.statusHistory.map(event => ({
        event
      }));
    } else if (trrs) {
      // Multiple TRRs view
      const allEvents: {trrId: string; trrTitle: string; event: TRRStatusEvent}[] = [];
      
      trrs.forEach(t => {
        t.statusHistory.forEach(event => {
          allEvents.push({
            trrId: t.id,
            trrTitle: t.title,
            event
          });
        });
      });
      
      return allEvents;
    }
    
    return [];
  };

  // Get all events and sort by timestamp (newest first)
  const sortedEvents = getAllEvents()
    .sort((a, b) => new Date(b.event.timestamp).getTime() - new Date(a.event.timestamp).getTime());
  
  // Apply maxEvents limit if specified
  const displayEvents = maxEvents ? sortedEvents.slice(0, maxEvents) : sortedEvents;
  
  // For single TRR, check if we should show prediction
  const showAIPrediction = 
    showPredictions && 
    trr && 
    trr.aiPrediction && 
    trr.status !== 'completed' && 
    trr.status !== 'validated';

  return (
    <div className="cortex-card p-6">
      <h3 className="text-lg font-bold text-cortex-text-primary mb-4">
        {trrs ? 'TRR Status Timeline' : `Status Timeline: ${trr?.title}`}
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-cortex-border-secondary"></div>
        
        {/* Timeline events */}
        <div className="space-y-8 relative">
          {displayEvents.map((item, idx) => (
            <div key={idx} className="relative pl-12">
              {/* Status circle */}
              <div className={`absolute left-2.5 w-3 h-3 rounded-full ${getStatusColor(item.event.status)} z-10 transform -translate-x-1/2`}></div>
              
              {/* Content */}
              <div className={compact ? "pl-2" : "bg-cortex-bg-tertiary p-3 rounded border border-cortex-border-secondary"}>
                {/* Show TRR title for multi-TRR view */}
                {item.trrTitle && (
                  <div className="text-cortex-text-primary font-medium">{item.trrTitle}</div>
                )}
                
                {/* Status and time */}
                <div className="flex justify-between items-center text-sm">
                  <div className="font-medium text-cortex-text-primary">
                    Status: <span className="capitalize">{item.event.status.replace('-', ' ')}</span>
                  </div>
                  <div className="text-cortex-text-muted text-xs">
                    {formatDate(item.event.timestamp)} at {formatTime(item.event.timestamp)}
                  </div>
                </div>
                
                {/* Additional details */}
                {item.event.note && (
                  <div className="mt-1 text-cortex-text-secondary text-sm">
                    {item.event.note}
                  </div>
                )}
                
                {/* Author (not shown in compact mode) */}
                {!compact && (
                  <div className="mt-2 text-xs text-cortex-text-muted">
                    By: User {item.event.authorUserId}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* AI Prediction (only for single TRR view) */}
          {showAIPrediction && (
            <div className="relative pl-12">
              {/* Prediction marker */}
              <div className="absolute left-2.5 w-3 h-3 rounded-full bg-purple-500 z-10 transform -translate-x-1/2 animate-pulse"></div>
              
              {/* Content */}
              <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
                <div className="flex justify-between items-center text-sm">
                  <div className="font-medium text-purple-400">
                    <span className="mr-2">🤖</span> 
                    Predicted Completion
                  </div>
                  <div className="text-cortex-text-muted text-xs">
                    {formatDate(trr!.aiPrediction!.predictedCompletionDate || '')}
                  </div>
                </div>
                
                {/* Confidence */}
                <div className="mt-1 text-purple-300 text-sm flex items-center">
                  <div className="flex-1">
                    Confidence: {Math.round(trr!.aiPrediction!.confidence * 100)}%
                  </div>
                  <div className="w-24 h-2 bg-purple-900/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500" 
                      style={{ width: `${Math.round(trr!.aiPrediction!.confidence * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Rationale */}
                {trr!.aiPrediction!.rationale && (
                  <div className="mt-2 text-xs text-cortex-text-muted italic">
                    "{trr!.aiPrediction!.rationale}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Show more/less controls for maxEvents */}
      {maxEvents && sortedEvents.length > maxEvents && (
        <div className="text-center mt-4">
          <button className="text-cortex-info hover:text-cortex-info-dark text-sm transition-colors">
            Show More Events
          </button>
        </div>
      )}
      
      {/* Empty state */}
      {displayEvents.length === 0 && (
        <div className="text-center py-6 text-cortex-text-muted">
          No status events found
        </div>
      )}
    </div>
  );
};