'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ContentItem } from './ContentLibrary';
import { contentLibraryService } from '../lib/content-library-service';
import CortexButton from './CortexButton';

interface ContentAnalyticsProps {
  items: ContentItem[];
  className?: string;
}

const ContentAnalytics: React.FC<ContentAnalyticsProps> = ({ items, className = '' }) => {
  const [activeView, setActiveView] = useState<'overview' | 'categories' | 'trends' | 'export'>('overview');
  
  // Initialize service
  useEffect(() => {
    contentLibraryService.initialize();
  }, []);

  const analytics = useMemo(() => {
    return contentLibraryService.getContentAnalytics(items);
  }, [items]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cortex-card p-6 text-center">
          <div className="text-3xl font-bold text-cortex-green mb-2">{analytics.totalItems}</div>
          <div className="text-sm text-cortex-text-secondary">Total Items</div>
        </div>
        <div className="cortex-card p-6 text-center">
          <div className="text-3xl font-bold text-cortex-info mb-2">
            {Math.round(analytics.avgRating * 10) / 10}
          </div>
          <div className="text-sm text-cortex-text-secondary">Avg Rating</div>
        </div>
        <div className="cortex-card p-6 text-center">
          <div className="text-3xl font-bold text-cortex-warning mb-2">{analytics.totalUsage}</div>
          <div className="text-sm text-cortex-text-secondary">Total Usage</div>
        </div>
        <div className="cortex-card p-6 text-center">
          <div className="text-3xl font-bold text-cortex-text-accent mb-2">
            {Object.keys(analytics.categoryCounts).length}
          </div>
          <div className="text-sm text-cortex-text-secondary">Categories</div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="cortex-card p-6">
        <h3 className="text-xl font-bold text-cortex-text-primary mb-4">📊 Rating Distribution</h3>
        <div className="space-y-3">
          {Object.entries(analytics.ratingDistribution)
            .reverse()
            .map(([rating, count]) => {
              const percentage = (count / analytics.totalItems) * 100;
              return (
                <div key={rating} className="flex items-center space-x-4">
                  <div className="w-12 text-sm text-cortex-text-secondary">
                    {rating}★
                  </div>
                  <div className="flex-1 bg-cortex-bg-tertiary rounded-full h-3">
                    <div
                      className="bg-cortex-warning h-3 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm text-cortex-text-secondary">
                    {count} ({Math.round(percentage)}%)
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Top Tags */}
      <div className="cortex-card p-6">
        <h3 className="text-xl font-bold text-cortex-text-primary mb-4">🏷️ Most Popular Tags</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(analytics.topTags).map(([tag, count]) => (
            <div
              key={tag}
              className="flex items-center space-x-2 bg-cortex-info/10 text-cortex-info px-3 py-2 rounded-full border border-cortex-info/30"
            >
              <span className="font-medium">{tag}</span>
              <span className="bg-cortex-info/20 text-cortex-info text-xs px-2 py-1 rounded-full">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="cortex-card p-6">
        <h3 className="text-xl font-bold text-cortex-text-primary mb-4">📂 Content by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analytics.categoryCounts).map(([category, count]) => {
            const percentage = (count / analytics.totalItems) * 100;
            const categoryIcon = {
              'secops': '🛡️',
              'cloud-security': '☁️',
              'detection-rules': '🎯',
              'scenarios': '🎭',
              'templates': '📋',
              'playbooks': '📖'
            }[category] || '📄';

            return (
              <div key={category} className="cortex-card p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">{categoryIcon}</span>
                  <div>
                    <div className="font-bold text-cortex-text-primary">
                      {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="text-sm text-cortex-text-secondary">
                      {count} items ({Math.round(percentage)}%)
                    </div>
                  </div>
                </div>
                <div className="bg-cortex-bg-tertiary rounded-full h-2">
                  <div
                    className="bg-cortex-green h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cortex-card p-6">
        <h3 className="text-xl font-bold text-cortex-text-primary mb-4">⚡ Difficulty Distribution</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(analytics.difficultyCounts).map(([difficulty, count]) => {
            const percentage = (count / analytics.totalItems) * 100;
            const difficultyColor = {
              'beginner': 'text-cortex-success bg-cortex-success/10 border-cortex-success/30',
              'intermediate': 'text-cortex-info bg-cortex-info/10 border-cortex-info/30',
              'advanced': 'text-cortex-warning bg-cortex-warning/10 border-cortex-warning/30',
              'expert': 'text-cortex-error bg-cortex-error/10 border-cortex-error/30'
            }[difficulty] || 'text-cortex-text-muted bg-cortex-bg-tertiary';

            return (
              <div key={difficulty} className={`p-4 rounded-lg border ${difficultyColor}`}>
                <div className="text-2xl font-bold mb-2">{count}</div>
                <div className="text-sm font-medium mb-2">
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </div>
                <div className="text-xs opacity-75">{Math.round(percentage)}% of total</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTrends = () => {
    // Get favorites data
    const favorites = contentLibraryService.getFavorites();
    const favoriteItems = items.filter(item => favorites.includes(item.id));

    return (
      <div className="space-y-6">
        <div className="cortex-card p-6">
          <h3 className="text-xl font-bold text-cortex-text-primary mb-4">⭐ User Favorites</h3>
          {favoriteItems.length > 0 ? (
            <div className="space-y-3">
              {favoriteItems.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center space-x-4 p-3 bg-cortex-bg-tertiary rounded-lg">
                  <div className="text-2xl">⭐</div>
                  <div className="flex-1">
                    <div className="font-medium text-cortex-text-primary">{item.title}</div>
                    <div className="text-sm text-cortex-text-secondary">{item.category} • {item.difficulty}</div>
                  </div>
                  <div className="text-sm text-cortex-text-muted">
                    Rating: {item.rating}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-cortex-text-muted">
              <div className="text-4xl mb-2">💫</div>
              <p>No favorites yet. Start exploring content!</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="cortex-card p-6">
            <h4 className="text-lg font-bold text-cortex-text-primary mb-4">🔥 Most Used Categories</h4>
            <div className="space-y-3">
              {Object.entries(analytics.categoryCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-cortex-text-secondary">
                      {category.replace('-', ' ')}
                    </span>
                    <span className="font-bold text-cortex-green">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="cortex-card p-6">
            <h4 className="text-lg font-bold text-cortex-text-primary mb-4">📈 Content Growth</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-cortex-text-secondary">This month</span>
                <span className="font-bold text-cortex-info">+3 items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cortex-text-secondary">Last month</span>
                <span className="font-bold text-cortex-info">+5 items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cortex-text-secondary">Total growth</span>
                <span className="font-bold text-cortex-green">+8 items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderExport = () => {
    const handleExport = () => {
      const exportData = contentLibraryService.exportContent(items);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-library-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const importResult = contentLibraryService.importContent(result);
          if (importResult.success) {
            alert(`Successfully imported ${importResult.items?.length} items!`);
          } else {
            alert(`Import failed: ${importResult.error}`);
          }
        }
      };
      reader.readAsText(file);
    };

    return (
      <div className="space-y-6">
        <div className="cortex-card p-6">
          <h3 className="text-xl font-bold text-cortex-text-primary mb-4">📤 Export Content</h3>
          <p className="text-cortex-text-secondary mb-6">
            Export your content library for backup, sharing, or migration purposes.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-cortex-bg-tertiary rounded-lg">
              <div>
                <div className="font-medium text-cortex-text-primary">Full Library Export</div>
                <div className="text-sm text-cortex-text-secondary">
                  Export all {analytics.totalItems} items with metadata
                </div>
              </div>
              <CortexButton onClick={handleExport} variant="primary" icon="📥">
                Download JSON
              </CortexButton>
            </div>
          </div>
        </div>

        <div className="cortex-card p-6">
          <h3 className="text-xl font-bold text-cortex-text-primary mb-4">📥 Import Content</h3>
          <p className="text-cortex-text-secondary mb-6">
            Import content from a JSON export file to expand your library.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-cortex-bg-tertiary rounded-lg border-2 border-dashed border-cortex-border-secondary">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="w-full text-cortex-text-primary"
                id="import-file"
              />
              <label htmlFor="import-file" className="block text-center cursor-pointer">
                <div className="text-4xl mb-2">📁</div>
                <div className="text-cortex-text-primary font-medium">
                  Choose JSON file to import
                </div>
                <div className="text-sm text-cortex-text-secondary">
                  Supports content library export format
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="cortex-card p-6">
          <h3 className="text-xl font-bold text-cortex-text-primary mb-4">📊 Export Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cortex-green mb-1">{analytics.totalItems}</div>
              <div className="text-sm text-cortex-text-secondary">Items to Export</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cortex-info mb-1">
                {Object.keys(analytics.categoryCounts).length}
              </div>
              <div className="text-sm text-cortex-text-secondary">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cortex-warning mb-1">
                {Math.round(analytics.avgRating * 10) / 10}
              </div>
              <div className="text-sm text-cortex-text-secondary">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'categories':
        return renderCategories();
      case 'trends':
        return renderTrends();
      case 'export':
        return renderExport();
      default:
        return renderOverview();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cortex-text-primary">📊 Content Analytics</h2>
          <p className="text-cortex-text-secondary">Insights and statistics for your content library</p>
        </div>
        <div className="flex space-x-2">
          {[
            { id: 'overview', name: 'Overview', icon: '📈' },
            { id: 'categories', name: 'Categories', icon: '📂' },
            { id: 'trends', name: 'Trends', icon: '📊' },
            { id: 'export', name: 'Export', icon: '📤' }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === view.id
                  ? 'bg-cortex-green text-black'
                  : 'text-cortex-text-secondary hover:text-cortex-text-primary hover:bg-cortex-bg-hover'
              }`}
            >
              {view.icon} {view.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default ContentAnalytics;