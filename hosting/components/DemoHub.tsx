'use client';

import React, { useState, useEffect } from 'react';
import { DemoRecord, DemoFilter, DemoType, DemoStatus } from '../types/demo';
import demoRecordsService from '../lib/demo-records-service';
import { SyslogGeneratorTool } from './dc-tooling/SyslogGeneratorTool';
import { cn } from '../lib/utils';

type ViewMode = 'grid' | 'list' | 'table';

export const DemoHub: React.FC = () => {
  const [demos, setDemos] = useState<DemoRecord[]>([]);
  const [filteredDemos, setFilteredDemos] = useState<DemoRecord[]>([]);
  const [selectedDemo, setSelectedDemo] = useState<DemoRecord | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<DemoType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<DemoStatus | 'all'>('all');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTooling, setShowTooling] = useState(false);

  useEffect(() => {
    loadDemos();
    loadStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [demos, searchQuery, filterType, filterStatus]);

  const loadDemos = async () => {
    try {
      const data = await demoRecordsService.getAllDemos();
      setDemos(data);
    } catch (error) {
      console.error('Failed to load demos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await demoRecordsService.getDemoStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...demos];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        d =>
          d.title.toLowerCase().includes(query) ||
          d.customer.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(d => d.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(d => d.status === filterStatus);
    }

    setFilteredDemos(filtered);
  };

  const getTypeIcon = (type: DemoType) => {
    const icons: Record<DemoType, string> = {
      'pov': '🎯',
      'technical-demo': '🔧',
      'executive-demo': '👔',
      'workshop': '🎓',
      'poc': '🧪',
      'competitive': '⚔️',
      'scenario': '🔬'
    };
    return icons[type] || '📁';
  };

  const getStatusColor = (status: DemoStatus) => {
    const colors: Record<DemoStatus, string> = {
      'draft': 'bg-cortex-text-muted/20 text-cortex-text-muted',
      'in-progress': 'bg-cortex-info/20 text-cortex-info',
      'completed': 'bg-status-success/20 text-status-success',
      'archived': 'bg-cortex-text-disabled/20 text-cortex-text-disabled'
    };
    return colors[status];
  };

  const handleDemoClick = (demo: DemoRecord) => {
    setSelectedDemo(demo);
    setShowTooling(!!demo.toolingConfig?.syslogGenerator);
  };

  const DemoCard = ({ demo }: { demo: DemoRecord }) => (
    <div
      onClick={() => handleDemoClick(demo)}
      className="cortex-card p-6 cortex-interactive button-hover-lift cursor-pointer h-full flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{getTypeIcon(demo.type)}</div>
        <div className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(demo.status))}>
          {demo.status}
        </div>
      </div>

      <h3 className="text-lg font-bold text-cortex-text-primary mb-2 line-clamp-2">{demo.title}</h3>
      <p className="text-sm text-cortex-text-secondary mb-2">{demo.customer}</p>
      <p className="text-sm text-cortex-text-muted mb-4 line-clamp-2 flex-grow">{demo.description}</p>

      <div className="space-y-2">
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {demo.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-cortex-primary/20 text-cortex-primary text-xs rounded">
              {tag}
            </span>
          ))}
          {demo.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-cortex-bg-secondary text-cortex-text-muted text-xs rounded">
              +{demo.tags.length - 3}
            </span>
          )}
        </div>

        {/* Metrics */}
        {demo.metrics && (
          <div className="flex items-center space-x-3 text-xs text-cortex-text-muted pt-2 border-t border-cortex-border">
            <span>👁️ {demo.metrics.views}</span>
            {demo.metrics.logsGenerated && <span>📊 {demo.metrics.logsGenerated.toLocaleString()}</span>}
            {demo.metrics.successRate && <span>✓ {demo.metrics.successRate}%</span>}
          </div>
        )}

        {/* Tooling indicator */}
        {demo.toolingConfig?.syslogGenerator?.enabled && (
          <div className="flex items-center space-x-1 text-xs text-cortex-accent pt-1">
            <span>🔧</span>
            <span>DC Tooling Configured</span>
          </div>
        )}
      </div>
    </div>
  );

  const DemoListItem = ({ demo }: { demo: DemoRecord }) => (
    <div
      onClick={() => handleDemoClick(demo)}
      className="cortex-card p-4 cortex-interactive cursor-pointer flex items-center space-x-4"
    >
      <div className="text-3xl">{getTypeIcon(demo.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h3 className="font-bold text-cortex-text-primary truncate">{demo.title}</h3>
          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(demo.status))}>
            {demo.status}
          </span>
        </div>
        <p className="text-sm text-cortex-text-secondary mb-1">{demo.customer}</p>
        <div className="flex flex-wrap gap-1">
          {demo.tags.slice(0, 5).map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-cortex-bg-secondary text-cortex-text-muted text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-4 text-sm text-cortex-text-muted">
        {demo.metrics && (
          <>
            <span>👁️ {demo.metrics.views}</span>
            {demo.toolingConfig?.syslogGenerator?.enabled && <span className="text-cortex-accent">🔧</span>}
          </>
        )}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cortex-primary border-t-transparent"></div>
      </div>
    );
  }

  // Detail View
  if (selectedDemo) {
    return (
      <section className="p-8 space-y-6">
        {/* Back button */}
        <button
          onClick={() => {
            setSelectedDemo(null);
            setShowTooling(false);
          }}
          className="flex items-center space-x-2 text-cortex-primary hover:text-cortex-accent transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Demo Hub</span>
        </button>

        {/* Demo Details */}
        <div className="glass-card p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <div className="text-5xl">{getTypeIcon(selectedDemo.type)}</div>
              <div>
                <h1 className="text-3xl font-bold text-cortex-text-primary mb-2">{selectedDemo.title}</h1>
                <p className="text-lg text-cortex-text-secondary mb-2">{selectedDemo.customer}</p>
                <div className="flex items-center space-x-3 text-sm text-cortex-text-muted">
                  <span className={cn('px-3 py-1 rounded-full text-xs font-medium', getStatusColor(selectedDemo.status))}>
                    {selectedDemo.status}
                  </span>
                  <span>Created {new Date(selectedDemo.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>By {selectedDemo.createdBy}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none mb-6">
            <p className="text-cortex-text-secondary leading-relaxed">{selectedDemo.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedDemo.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-cortex-primary/20 text-cortex-primary text-sm rounded-lg">
                #{tag}
              </span>
            ))}
          </div>

          {/* Metrics */}
          {selectedDemo.metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="cortex-card-elevated p-4">
                <div className="text-2xl font-mono text-cortex-text-primary">{selectedDemo.metrics.views}</div>
                <div className="text-sm text-cortex-text-muted">Total Views</div>
              </div>
              {selectedDemo.metrics.logsGenerated && (
                <div className="cortex-card-elevated p-4">
                  <div className="text-2xl font-mono text-cortex-text-primary">
                    {selectedDemo.metrics.logsGenerated.toLocaleString()}
                  </div>
                  <div className="text-sm text-cortex-text-muted">Logs Generated</div>
                </div>
              )}
              {selectedDemo.metrics.duration && (
                <div className="cortex-card-elevated p-4">
                  <div className="text-2xl font-mono text-cortex-text-primary">{selectedDemo.metrics.duration}m</div>
                  <div className="text-sm text-cortex-text-muted">Duration</div>
                </div>
              )}
              {selectedDemo.metrics.successRate && (
                <div className="cortex-card-elevated p-4">
                  <div className="text-2xl font-mono text-status-success">{selectedDemo.metrics.successRate}%</div>
                  <div className="text-sm text-cortex-text-muted">Success Rate</div>
                </div>
              )}
            </div>
          )}

          {/* Artifacts */}
          {selectedDemo.artifacts.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-cortex-text-primary mb-3">📁 Demo Artifacts</h3>
              <div className="space-y-2">
                {selectedDemo.artifacts.map(artifact => (
                  <div key={artifact.id} className="cortex-card p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {artifact.type === 'markdown' ? '📝' :
                         artifact.type === 'json' ? '📊' :
                         artifact.type === 'csv' ? '📈' :
                         artifact.type === 'pdf' ? '📄' : '📁'}
                      </span>
                      <div>
                        <div className="font-medium text-cortex-text-primary">{artifact.name}</div>
                        <div className="text-xs text-cortex-text-muted">
                          Uploaded {new Date(artifact.uploadedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {artifact.url && (
                      <a
                        href={artifact.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cortex-primary hover:text-cortex-accent transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DC Tooling Section */}
        {selectedDemo.toolingConfig?.syslogGenerator && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-cortex-text-primary">DC Supplemental Tooling</h2>
              <button
                onClick={() => setShowTooling(!showTooling)}
                className="text-cortex-primary hover:text-cortex-accent flex items-center space-x-2"
              >
                <span>{showTooling ? 'Hide' : 'Show'} Tooling</span>
                <svg
                  className={cn('w-5 h-5 transition-transform', showTooling && 'rotate-180')}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {showTooling && (
              <SyslogGeneratorTool
                config={selectedDemo.toolingConfig.syslogGenerator}
                onStart={async (config) => {
                  console.log('Starting log generation:', config);
                  // TODO: Integrate with actual cortex-syslog-generator
                }}
                onStop={async () => {
                  console.log('Stopping log generation');
                }}
              />
            )}
          </div>
        )}
      </section>
    );
  }

  // Main Hub View
  return (
    <section className="p-8 space-y-6">
      {/* Header */}
      <div className="glass-card p-8">
        <h1 className="text-3xl font-bold text-cortex-text-primary mb-2">Demo Hub</h1>
        <p className="text-cortex-text-muted">Manage and execute your demo library with integrated DC tooling</p>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="cortex-card-elevated p-4">
              <div className="text-3xl font-mono text-cortex-text-primary">{stats.total}</div>
              <div className="text-sm text-cortex-text-muted">Total Demos</div>
            </div>
            <div className="cortex-card-elevated p-4">
              <div className="text-3xl font-mono text-status-success">{stats.byStatus?.['completed'] || 0}</div>
              <div className="text-sm text-cortex-text-muted">Completed</div>
            </div>
            <div className="cortex-card-elevated p-4">
              <div className="text-3xl font-mono text-cortex-info">{stats.totalViews}</div>
              <div className="text-sm text-cortex-text-muted">Total Views</div>
            </div>
            <div className="cortex-card-elevated p-4">
              <div className="text-3xl font-mono text-cortex-primary">{Math.round(stats.avgSuccessRate)}%</div>
              <div className="text-sm text-cortex-text-muted">Avg Success Rate</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search demos by title, customer, or tags..."
              className="w-full px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary placeholder-cortex-text-disabled focus:ring-2 focus:ring-cortex-primary focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as DemoType | 'all')}
            className="px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary focus:ring-2 focus:ring-cortex-primary focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="pov">POV</option>
            <option value="technical-demo">Technical Demo</option>
            <option value="executive-demo">Executive Demo</option>
            <option value="workshop">Workshop</option>
            <option value="poc">POC</option>
            <option value="competitive">Competitive</option>
            <option value="scenario">Scenario</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as DemoStatus | 'all')}
            className="px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary focus:ring-2 focus:ring-cortex-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex space-x-1 bg-cortex-bg-secondary/50 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-1 rounded transition-colors',
                viewMode === 'grid' ? 'bg-cortex-primary text-white' : 'text-cortex-text-muted hover:text-cortex-text-primary'
              )}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1 rounded transition-colors',
                viewMode === 'list' ? 'bg-cortex-primary text-white' : 'text-cortex-text-muted hover:text-cortex-text-primary'
              )}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-cortex-text-muted">
          Showing {filteredDemos.length} of {demos.length} demos
        </div>
      </div>

      {/* Demos Grid/List */}
      {filteredDemos.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-cortex-text-primary mb-2">No demos found</h3>
          <p className="text-cortex-text-muted">Try adjusting your filters or search query</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDemos.map(demo => (
            <DemoCard key={demo.id} demo={demo} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDemos.map(demo => (
            <DemoListItem key={demo.id} demo={demo} />
          ))}
        </div>
      )}
    </section>
  );
};

export default DemoHub;
