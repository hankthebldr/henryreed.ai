'use client';

import React, { useState, useMemo } from 'react';
import CortexButton from './CortexButton';
import {
  POVPhase,
  BestPractice,
  POV_BEST_PRACTICES,
  POV_BEST_PRACTICES_METADATA,
  getCriticalBestPractices,
  searchBestPractices,
} from '../types/pov-best-practices';

export const POVBestPractices: React.FC = () => {
  const [activePhase, setActivePhase] = useState<POVPhase>('discovery-planning');
  const [expandedPractice, setExpandedPractice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  const currentChecklist = useMemo(() => {
    return POV_BEST_PRACTICES.find(c => c.phase === activePhase);
  }, [activePhase]);

  const displayedPractices = useMemo(() => {
    if (searchQuery.trim()) {
      return searchBestPractices(searchQuery);
    }

    if (showCriticalOnly) {
      return getCriticalBestPractices();
    }

    return currentChecklist?.practices || [];
  }, [activePhase, searchQuery, showCriticalOnly, currentChecklist]);

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-status-error/10 text-status-error border-status-error/30',
      high: 'bg-status-warning/10 text-status-warning border-status-warning/30',
      medium: 'bg-status-info/10 text-status-info border-status-info/30',
      low: 'bg-cortex-text-muted/10 text-cortex-text-muted border-cortex-border/40',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getPhaseIcon = (phase: POVPhase) => {
    const icons = {
      'discovery-planning': '🎯',
      'logistics': '📋',
      'initial-deployment': '🚀',
      'execution-measurement': '📊',
      'closure': '✅',
    };
    return icons[phase];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cortex-text-primary flex items-center space-x-3">
            <span>📖</span>
            <span>XSIAM PoV Best Practices</span>
          </h1>
          <p className="text-cortex-text-secondary mt-2 max-w-3xl">
            Guidelines and best practices for XSIAM Proof of Value engagements
          </p>
          <div className="flex items-center space-x-4 mt-3 text-sm">
            <span className="text-cortex-text-muted">
              Created by: <span className="text-cortex-text-primary">{POV_BEST_PRACTICES_METADATA.createdBy}</span>
            </span>
            <span className="text-cortex-text-muted">
              Version: <span className="text-cortex-text-primary">{POV_BEST_PRACTICES_METADATA.version}</span>
            </span>
            <span className="text-cortex-text-muted">
              Updated: <span className="text-cortex-text-primary">{new Date(POV_BEST_PRACTICES_METADATA.lastUpdatedOn).toLocaleDateString()}</span>
            </span>
          </div>
        </div>
        <CortexButton
          onClick={() => {
            window.open(POV_BEST_PRACTICES_METADATA.feedbackForm, '_blank');
          }}
          variant="primary"
          icon="📝"
        >
          Submit Feedback
        </CortexButton>
      </div>

      {/* Search and Filters */}
      <div className="cortex-card p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search best practices..."
              className="w-full px-4 py-2 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
            />
          </div>
          <button
            onClick={() => setShowCriticalOnly(!showCriticalOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showCriticalOnly
                ? 'bg-status-error/20 text-status-error border-2 border-status-error/40'
                : 'bg-cortex-bg-tertiary text-cortex-text-secondary border border-cortex-border/40'
            }`}
          >
            {showCriticalOnly ? '🔴 Critical Only' : 'Show All'}
          </button>
        </div>
      </div>

      {/* Phase Navigation */}
      {!searchQuery && !showCriticalOnly && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {POV_BEST_PRACTICES.map((checklist) => (
            <button
              key={checklist.phase}
              onClick={() => setActivePhase(checklist.phase)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center space-x-2 ${
                activePhase === checklist.phase
                  ? 'bg-cortex-primary text-black shadow-lg'
                  : 'bg-cortex-bg-secondary text-cortex-text-secondary hover:text-cortex-text-primary hover:bg-cortex-bg-hover'
              }`}
            >
              <span className="text-lg">{getPhaseIcon(checklist.phase)}</span>
              <span>{checklist.phaseName}</span>
            </button>
          ))}
        </div>
      )}

      {/* Phase Description */}
      {!searchQuery && !showCriticalOnly && currentChecklist && (
        <div className="cortex-card p-4 bg-cortex-primary/10 border-cortex-primary/30">
          <p className="text-cortex-text-primary">{currentChecklist.phaseDescription}</p>
        </div>
      )}

      {/* Results Info */}
      {(searchQuery || showCriticalOnly) && (
        <div className="text-sm text-cortex-text-secondary">
          {searchQuery && `Search results for "${searchQuery}": `}
          {showCriticalOnly && !searchQuery && 'Showing critical best practices: '}
          <span className="font-bold text-cortex-primary">{displayedPractices.length} practices</span>
        </div>
      )}

      {/* Best Practices List */}
      <div className="space-y-4">
        {displayedPractices.length === 0 ? (
          <div className="cortex-card p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-cortex-text-primary mb-2">No practices found</h3>
            <p className="text-cortex-text-secondary">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          displayedPractices.map((practice) => (
            <div
              key={practice.id}
              className="cortex-card p-6 hover:bg-cortex-bg-hover/30 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-cortex-text-primary">
                      {practice.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(practice.priority)}`}>
                      {practice.priority.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 text-xs bg-cortex-primary/10 text-cortex-primary border border-cortex-primary/30 rounded font-medium">
                      Stage {practice.opportunityStage}
                    </span>
                    {(searchQuery || showCriticalOnly) && (
                      <span className="px-2 py-1 text-xs bg-cortex-bg-tertiary text-cortex-text-muted rounded">
                        {getPhaseIcon(practice.phase)} {practice.phase.replace('-', ' ')}
                      </span>
                    )}
                  </div>
                  <p className="text-cortex-text-secondary">{practice.description}</p>
                </div>
                <button
                  onClick={() => setExpandedPractice(expandedPractice === practice.id ? null : practice.id)}
                  className="ml-4 text-cortex-primary hover:text-cortex-primary-light transition-colors"
                >
                  {expandedPractice === practice.id ? '▼' : '▶'}
                </button>
              </div>

              {/* Expanded Content */}
              {expandedPractice === practice.id && (
                <div className="mt-4 pt-4 border-t border-cortex-border/40 space-y-4">
                  {/* Notes */}
                  {practice.notes && (
                    <div className="bg-cortex-bg-secondary p-4 rounded-lg">
                      <h4 className="font-semibold text-cortex-text-primary mb-2 flex items-center space-x-2">
                        <span>📝</span>
                        <span>Notes</span>
                      </h4>
                      <p className="text-sm text-cortex-text-secondary leading-relaxed">
                        {practice.notes}
                      </p>
                    </div>
                  )}

                  {/* XQL Example */}
                  {practice.xqlExample && (
                    <div className="bg-cortex-bg-tertiary p-4 rounded-lg">
                      <h4 className="font-semibold text-cortex-text-primary mb-2 flex items-center space-x-2">
                        <span>💻</span>
                        <span>XQL Example</span>
                      </h4>
                      <pre className="text-xs text-cortex-text-primary overflow-x-auto bg-black/20 p-3 rounded">
                        {practice.xqlExample}
                      </pre>
                    </div>
                  )}

                  {/* Related Tools */}
                  {practice.relatedTools && practice.relatedTools.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-cortex-text-primary mb-2 flex items-center space-x-2">
                        <span>🔧</span>
                        <span>Related Tools</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {practice.relatedTools.map((tool, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-sm bg-cortex-bg-secondary text-cortex-text-primary rounded border border-cortex-border/40"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  {practice.links && practice.links.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-cortex-text-primary mb-2 flex items-center space-x-2">
                        <span>🔗</span>
                        <span>Resources</span>
                      </h4>
                      <div className="space-y-2">
                        {practice.links.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-sm text-cortex-primary hover:text-cortex-primary-light transition-colors"
                          >
                            <span>
                              {link.type === 'doc' && '📄'}
                              {link.type === 'tool' && '🛠️'}
                              {link.type === 'video' && '🎥'}
                              {link.type === 'form' && '📋'}
                            </span>
                            <span>{link.title}</span>
                            <span className="text-cortex-text-muted">↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Summary */}
      {!searchQuery && !showCriticalOnly && (
        <div className="cortex-card p-6 bg-cortex-bg-secondary">
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">
            📊 Best Practices Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {POV_BEST_PRACTICES.map((checklist) => (
              <div key={checklist.phase} className="text-center">
                <div className="text-3xl mb-2">{getPhaseIcon(checklist.phase)}</div>
                <div className="text-2xl font-bold text-cortex-primary">
                  {checklist.practices.length}
                </div>
                <div className="text-xs text-cortex-text-muted">
                  {checklist.phaseName}
                </div>
                <div className="text-xs text-cortex-text-secondary mt-1">
                  {checklist.practices.filter(p => p.priority === 'critical').length} critical
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
