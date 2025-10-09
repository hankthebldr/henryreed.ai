'use client';

import React, { useState, useEffect } from 'react';
import { parseMarkdown, generateSuggestedTags, extractRelationships } from '../lib/markdownParser';
import { MetadataEditor } from './MetadataEditor';
import { KnowledgeGraphVisualization } from './KnowledgeGraphVisualization';
import {
  saveKnowledgeDocument,
  getAllKnowledgeDocuments,
  buildKnowledgeGraph,
  searchKnowledgeDocuments,
  getKnowledgeBaseStats
} from '../lib/knowledgeBaseService';
import {
  KnowledgeDocument,
  DocumentMetadata,
  KnowledgeGraph,
  SearchFilters,
  ImportResult
} from '../types/knowledgeBase';

type ViewMode = 'upload' | 'metadata' | 'graph' | 'list';

export const KnowledgeBaseManager: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [markdownContent, setMarkdownContent] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [metadata, setMetadata] = useState<DocumentMetadata | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraph | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Load documents and stats on mount
  useEffect(() => {
    loadDocuments();
    loadStats();
  }, []);

  // Load all documents
  const loadDocuments = async () => {
    try {
      const docs = await getAllKnowledgeDocuments();
      setDocuments(docs);
    } catch (error) {
      showNotification('error', 'Failed to load documents');
    }
  };

  // Load knowledge base stats
  const loadStats = async () => {
    try {
      const statsData = await getKnowledgeBaseStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Build and load graph
  const loadGraph = async () => {
    try {
      setIsLoading(true);
      const graph = await buildKnowledgeGraph();
      setKnowledgeGraph(graph);
    } catch (error) {
      showNotification('error', 'Failed to build knowledge graph');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md')) {
      showNotification('error', 'Please upload a markdown (.md) file');
      return;
    }

    try {
      const text = await file.text();
      setMarkdownContent(text);

      // Parse markdown
      const parsed = parseMarkdown(text);
      setParsedData(parsed);

      // Initialize metadata with parsed data
      const initialMetadata: DocumentMetadata = {
        ...parsed.metadata,
        tags: parsed.metadata.tags || [],
        keywords: parsed.metadata.keywords || [],
        topics: parsed.metadata.topics || [],
        complexity: parsed.metadata.complexity || 'intermediate',
        estimatedReadTime: parsed.metadata.estimatedReadTime || 1,
        customFields: {}
      };

      setMetadata(initialMetadata);
      setViewMode('metadata');

      showNotification('success', 'Markdown file parsed successfully!');
    } catch (error) {
      showNotification('error', 'Failed to parse markdown file');
      console.error(error);
    }
  };

  // Handle text paste
  const handleTextPaste = () => {
    if (!markdownContent.trim()) {
      showNotification('error', 'Please enter markdown content');
      return;
    }

    try {
      const parsed = parseMarkdown(markdownContent);
      setParsedData(parsed);

      const initialMetadata: DocumentMetadata = {
        ...parsed.metadata,
        tags: parsed.metadata.tags || [],
        keywords: parsed.metadata.keywords || [],
        topics: parsed.metadata.topics || [],
        complexity: parsed.metadata.complexity || 'intermediate',
        estimatedReadTime: parsed.metadata.estimatedReadTime || 1,
        customFields: {}
      };

      setMetadata(initialMetadata);
      setViewMode('metadata');

      showNotification('success', 'Markdown content parsed successfully!');
    } catch (error) {
      showNotification('error', 'Failed to parse markdown content');
      console.error(error);
    }
  };

  // Save document
  const handleSaveDocument = async () => {
    if (!parsedData || !metadata) {
      showNotification('error', 'No document to save');
      return;
    }

    try {
      setIsLoading(true);

      // Extract relationships with existing documents
      const existingDocTitles = documents.map(d => d.title);
      const relationships = extractRelationships(parsedData, existingDocTitles);

      const newDoc = {
        title: parsedData.metadata.title || 'Untitled Document',
        content: parsedData.content,
        metadata,
        relationships: relationships.map(rel => ({
          sourceId: '',
          targetId: rel.target,
          type: rel.type as any,
          weight: 0.5
        })),
        createdBy: 'current-user' // TODO: Get from auth context
      };

      const docId = await saveKnowledgeDocument(newDoc);

      showNotification('success', 'Document saved successfully!');

      // Reload documents and reset form
      await loadDocuments();
      await loadStats();
      resetForm();
      setViewMode('list');
    } catch (error) {
      showNotification('error', 'Failed to save document');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setMarkdownContent('');
    setParsedData(null);
    setMetadata(null);
  };

  // Show notification
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Search documents
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadDocuments();
      return;
    }

    try {
      const filters: SearchFilters = { query: searchQuery };
      const results = await searchKnowledgeDocuments(filters);
      setDocuments(results.map(r => r.document));
    } catch (error) {
      showNotification('error', 'Search failed');
    }
  };

  // Render upload view
  const renderUploadView = () => (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="text-4xl">📄</div>
          <div>
            <h2 className="text-2xl font-bold text-white">Import Knowledge Document</h2>
            <p className="text-gray-400">Upload or paste markdown content to add to your knowledge base</p>
          </div>
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept=".md,.markdown"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-3"
          >
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p className="text-lg text-white font-medium">Click to upload markdown file</p>
              <p className="text-sm text-gray-400">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">Supports .md and .markdown files</p>
          </label>
        </div>

        {/* Text Area */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-300">Or paste markdown content:</label>
            <button
              onClick={() => setMarkdownContent('')}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Clear
            </button>
          </div>
          <textarea
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white font-mono text-sm h-64"
            placeholder="# Document Title

## Introduction

Paste your markdown content here..."
          />
          <button
            onClick={handleTextPaste}
            disabled={!markdownContent.trim()}
            className="mt-3 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white transition-colors"
          >
            Parse Markdown
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="font-bold text-white mb-2">Auto-Extraction</h3>
          <p className="text-sm text-gray-400">
            Keywords, topics, and complexity are automatically extracted from your content
          </p>
        </div>
        <div className="glass-card p-6">
          <div className="text-3xl mb-3">🏷️</div>
          <h3 className="font-bold text-white mb-2">Smart Tagging</h3>
          <p className="text-sm text-gray-400">
            Suggested tags based on content analysis with manual override options
          </p>
        </div>
        <div className="glass-card p-6">
          <div className="text-3xl mb-3">🔗</div>
          <h3 className="font-bold text-white mb-2">Link Detection</h3>
          <p className="text-sm text-gray-400">
            Automatically identifies relationships between documents in your knowledge base
          </p>
        </div>
      </div>
    </div>
  );

  // Render document list view
  const renderListView = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Knowledge Base</h2>
            <p className="text-gray-400">{documents.length} documents</p>
          </div>
          <div className="flex space-x-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
              placeholder="Search documents..."
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.totalDocuments}</div>
              <div className="text-xs text-gray-400">Documents</div>
            </div>
            <div className="bg-gray-800 rounded p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.categories}</div>
              <div className="text-xs text-gray-400">Categories</div>
            </div>
            <div className="bg-gray-800 rounded p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.tags}</div>
              <div className="text-xs text-gray-400">Tags</div>
            </div>
            <div className="bg-gray-800 rounded p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{stats.averageReadTime}m</div>
              <div className="text-xs text-gray-400">Avg Read</div>
            </div>
          </div>
        )}

        {/* Document List */}
        <div className="space-y-3">
          {documents.map(doc => (
            <div key={doc.id} className="bg-gray-800 rounded p-4 hover:bg-gray-750 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{doc.title}</h3>
                  {doc.metadata.description && (
                    <p className="text-sm text-gray-400 mb-2">{doc.metadata.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {doc.metadata.category && (
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                        {doc.metadata.category}
                      </span>
                    )}
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      {doc.metadata.complexity}
                    </span>
                    <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                      {doc.metadata.estimatedReadTime}m read
                    </span>
                    {doc.metadata.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-600'
              : notification.type === 'error'
              ? 'bg-red-600'
              : 'bg-blue-600'
          } text-white`}
        >
          {notification.message}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="glass-card p-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('upload')}
            className={`px-6 py-3 rounded font-medium transition-colors ${
              viewMode === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📤 Upload
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-6 py-3 rounded font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📚 Documents
          </button>
          <button
            onClick={() => {
              setViewMode('graph');
              loadGraph();
            }}
            className={`px-6 py-3 rounded font-medium transition-colors ${
              viewMode === 'graph'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🕸️ Graph
          </button>
        </div>
      </div>

      {/* Content Views */}
      {viewMode === 'upload' && renderUploadView()}
      {viewMode === 'metadata' && metadata && parsedData && (
        <MetadataEditor
          metadata={metadata}
          suggestedTags={generateSuggestedTags(parsedData)}
          suggestedKeywords={parsedData.metadata.keywords}
          onMetadataChange={setMetadata}
          onSave={handleSaveDocument}
          onCancel={() => {
            resetForm();
            setViewMode('upload');
          }}
        />
      )}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'graph' && knowledgeGraph && (
        <KnowledgeGraphVisualization
          graph={knowledgeGraph}
          onNodeClick={(node) => console.log('Node clicked:', node)}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 flex items-center space-x-4">
            <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white font-medium">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseManager;
