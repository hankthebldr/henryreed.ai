/**
 * Example: Integrating Knowledge Base into Demo Creation Page
 *
 * This file demonstrates how to integrate the KnowledgeBaseManager
 * into your existing ManualCreationGUI or EnhancedManualCreationGUI
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CortexCloudFrame } from './components/CortexCloudFrame';
import { KnowledgeBaseManager } from './components/KnowledgeBaseManager';
import { searchKnowledgeDocuments } from './lib/knowledgeBaseService';

// Extend your existing CreationMode type
type CreationMode = 'pov' | 'template' | 'scenario' | 'knowledge' | 'none';

export const IntegratedDemoCreationPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<CreationMode>('none');
  const [showDocs, setShowDocs] = useState(false);

  return (
    <div className="space-y-6">
      {/* Action Buttons - Add Knowledge Base Button */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🛠️</div>
            <div>
              <h2 className="text-2xl font-bold text-white">Demo Creation & Resources</h2>
              <p className="text-cortex-text-secondary">
                Create POVs, Templates, Scenarios, and manage your Knowledge Base
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDocs(!showDocs)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors flex items-center space-x-2"
          >
            <span>📚</span>
            <span>{showDocs ? 'Hide' : 'Show'} Documentation</span>
          </button>
        </div>

        {/* Updated Grid - Now with 4 options */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Existing POV Button */}
          <button
            onClick={() => setActiveMode('pov')}
            className="p-6 bg-blue-900/20 border border-blue-500/30 rounded-lg hover:bg-blue-900/40 transition-colors group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎯</div>
            <h3 className="text-lg font-bold text-blue-400 mb-2">Create POV</h3>
            <p className="text-sm text-gray-300">
              Start a new Proof of Value project with comprehensive planning
            </p>
          </button>

          {/* Existing Template Button */}
          <button
            onClick={() => setActiveMode('template')}
            className="p-6 bg-green-900/20 border border-green-500/30 rounded-lg hover:bg-green-900/40 transition-colors group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📋</div>
            <h3 className="text-lg font-bold text-green-400 mb-2">Create Template</h3>
            <p className="text-sm text-gray-300">
              Design reusable templates for common scenarios
            </p>
          </button>

          {/* Existing Scenario Button */}
          <button
            onClick={() => setActiveMode('scenario')}
            className="p-6 bg-purple-900/20 border border-purple-500/30 rounded-lg hover:bg-purple-900/40 transition-colors group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔬</div>
            <h3 className="text-lg font-bold text-purple-400 mb-2">Detection Scenario</h3>
            <p className="text-sm text-gray-300">
              Build Cloud Detection and Response scenarios with MITRE mapping
            </p>
          </button>

          {/* NEW: Knowledge Base Button */}
          <button
            onClick={() => setActiveMode('knowledge')}
            className="p-6 bg-amber-900/20 border border-amber-500/30 rounded-lg hover:bg-amber-900/40 transition-colors group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📚</div>
            <h3 className="text-lg font-bold text-amber-400 mb-2">Knowledge Base</h3>
            <p className="text-sm text-gray-300">
              Import guides, view graph, and manage your documentation
            </p>
          </button>
        </div>

        {/* Quick Stats - Enhanced with Knowledge Base Stats */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">12</div>
              <div className="text-sm text-cortex-text-secondary">Active POVs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">8</div>
              <div className="text-sm text-cortex-text-secondary">Templates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">24</div>
              <div className="text-sm text-cortex-text-secondary">Scenarios</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">156</div>
              <div className="text-sm text-cortex-text-secondary">KB Articles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Frame */}
      {showDocs && (
        <CortexCloudFrame
          title="Cortex Cloud Detection and Response Documentation"
          height="500px"
          className="border-2 border-blue-500"
        />
      )}

      {/* Render appropriate interface based on activeMode */}
      {activeMode === 'pov' && (
        <div>
          {/* Your existing POV creation form */}
          <p>POV Creation Form</p>
        </div>
      )}

      {activeMode === 'template' && (
        <div>
          {/* Your existing Template creation form */}
          <p>Template Creation Form</p>
        </div>
      )}

      {activeMode === 'scenario' && (
        <div>
          {/* Your existing Scenario creation form */}
          <p>Scenario Creation Form</p>
        </div>
      )}

      {/* NEW: Knowledge Base Interface */}
      {activeMode === 'knowledge' && <KnowledgeBaseManager />}
    </div>
  );
};

export default IntegratedDemoCreationPage;

/**
 * ALTERNATIVE INTEGRATION: Sidebar Reference Panel
 *
 * Add a collapsible sidebar that shows relevant KB articles
 * while creating POVs/Scenarios
 */

export const POVCreationWithKnowledgeReference: React.FC = () => {
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);

  // Fetch related articles based on POV context
  const fetchRelatedArticles = async (povData: any) => {
    const filters = {
      tags: povData.tags || [],
      categories: [povData.category],
      query: povData.name
    };

    // Use search service to find related docs
    const results = await searchKnowledgeDocuments(filters);
    setRelatedArticles(results.map(r => r.document));
  };

  return (
    <div className="flex gap-6">
      {/* Main POV Creation Form */}
      <div className="flex-1">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Create New POV</h2>

          {/* POV Form Fields */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="POV Name"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />

            {/* Button to show knowledge reference */}
            <button
              onClick={() => setShowKnowledgePanel(!showKnowledgePanel)}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-2"
            >
              <span>📚</span>
              <span>
                {showKnowledgePanel ? 'Hide' : 'Show'} Related Guides
              </span>
            </button>

            {/* More form fields... */}
          </div>
        </div>
      </div>

      {/* Knowledge Reference Sidebar */}
      {showKnowledgePanel && (
        <div className="w-80 bg-gray-800 rounded-lg p-4 border border-amber-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Related Guides</h3>
            <button
              onClick={() => setShowKnowledgePanel(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {relatedArticles.map(article => (
              <div
                key={article.id}
                className="bg-gray-700 rounded p-3 hover:bg-gray-600 cursor-pointer transition-colors"
              >
                <h4 className="font-medium text-white text-sm mb-1">
                  {article.title}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {article.metadata.description}
                </p>
                <div className="flex gap-2 mt-2">
                  {article.metadata.tags.slice(0, 2).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ALTERNATIVE INTEGRATION: Quick Search Modal
 *
 * Add a keyboard shortcut (Cmd/Ctrl+K) to quickly search KB
 * from anywhere in the app
 */

export const GlobalKnowledgeSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  // Listen for keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search as user types
  useEffect(() => {
    if (searchQuery.trim()) {
      const delaySearch = setTimeout(async () => {
        const searchResults = await searchKnowledgeDocuments({
          query: searchQuery
        });
        setResults(searchResults.map(r => r.document));
      }, 300);

      return () => clearTimeout(delaySearch);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl shadow-2xl">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search knowledge base... (Press Esc to close)"
              className="flex-1 bg-transparent border-none outline-none text-white text-lg"
              autoFocus
              onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
            />
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400">
              Esc
            </kbd>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 && searchQuery && (
            <div className="p-8 text-center text-gray-400">
              No results found for "{searchQuery}"
            </div>
          )}

          {results.map((doc) => (
            <div
              key={doc.id}
              className="p-4 border-b border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors"
              onClick={() => {
                // Navigate to document
                window.location.href = `/knowledge/${doc.id}`;
              }}
            >
              <h3 className="font-bold text-white mb-1">{doc.title}</h3>
              {doc.metadata.description && (
                <p className="text-sm text-gray-400 mb-2">
                  {doc.metadata.description}
                </p>
              )}
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-gray-500">
                  {doc.metadata.category}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">
                  {doc.metadata.estimatedReadTime}m read
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-blue-400">
                  {doc.metadata.complexity}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700 bg-gray-900 rounded-b-lg">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{results.length} results</span>
            <div className="flex items-center space-x-4">
              <span>
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded ml-1">↓</kbd>
                {' '}to navigate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Enter</kbd>
                {' '}to select
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * USAGE IN EXISTING COMPONENTS
 *
 * 1. Add to ManualCreationGUI.tsx:
 *    Import and render KnowledgeBaseManager when activeMode === 'knowledge'
 *
 * 2. Add to AppShell or main layout:
 *    <GlobalKnowledgeSearch /> for app-wide search
 *
 * 3. Add to POV/Scenario forms:
 *    <POVCreationWithKnowledgeReference /> for contextual help
 *
 * 4. Update navigation:
 *    Add "Knowledge Base" link to your main navigation menu
 */

// Helper hook for knowledge base integration

export function useKnowledgeBase() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = async (query: string) => {
    setIsLoading(true);
    try {
      const results = await searchKnowledgeDocuments({ query });
      setDocuments(results.map(r => r.document));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { documents, isLoading, search };
}

// Usage example:
function MyComponent() {
  const { documents, isLoading, search } = useKnowledgeBase();

  return (
    <div>
      <input
        onChange={(e) => search(e.target.value)}
        placeholder="Search..."
      />
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        documents.map(doc => <div key={doc.id}>{doc.title}</div>)
      )}
    </div>
  );
}
