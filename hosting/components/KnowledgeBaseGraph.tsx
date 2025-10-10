'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { cloudStoreService } from '../lib/cloud-store';
import { cn } from '../lib/utils';

// Types for knowledge base entries
interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  relatedEntries: string[]; // IDs of related entries
  metadata: {
    author?: string;
    version?: string;
    status?: 'draft' | 'published' | 'archived';
    [key: string]: any;
  };
}

interface GraphNode {
  id: string;
  label: string;
  category: string;
  tags: string[];
  x: number;
  y: number;
  connections: string[];
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number; // Number of shared tags
}

type ViewMode = 'list' | 'graph' | 'editor';

const CATEGORY_COLORS: Record<string, string> = {
  'demo': 'bg-blue-500',
  'pov': 'bg-green-500',
  'trr': 'bg-purple-500',
  'scenario': 'bg-orange-500',
  'documentation': 'bg-cyan-500',
  'template': 'bg-pink-500',
  'other': 'bg-gray-500',
};

const KnowledgeBaseGraph: React.FC = () => {
  const { state, actions } = useAppState();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeBaseEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Editor state for creating/editing entries
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorTags, setEditorTags] = useState<string[]>([]);
  const [editorCategory, setEditorCategory] = useState('demo');
  const [currentTagInput, setCurrentTagInput] = useState('');

  // Load entries from cloud store
  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load markdown notes from cloud store
      const notes = await cloudStoreService.listMarkdownNotes();
      const kbEntries: KnowledgeBaseEntry[] = notes.map(note => {
        const metadata = note.metadata || {};
        const tags = metadata.tags || [];
        const category = metadata.category || 'other';

        return {
          id: note.id || `kb-${Date.now()}-${Math.random()}`,
          title: metadata.title || note.name || 'Untitled',
          content: note.contentText || '',
          tags: Array.isArray(tags) ? tags : [],
          category,
          createdAt: metadata.createdAt || new Date().toISOString(),
          updatedAt: metadata.updatedAt || new Date().toISOString(),
          relatedEntries: metadata.relatedEntries || [],
          metadata,
        };
      });

      setEntries(kbEntries);
    } catch (error) {
      console.error('Failed to load knowledge base entries:', error);
      actions.notify('error', 'Failed to load knowledge base entries');
    } finally {
      setIsLoading(false);
    }
  }, [actions]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Calculate graph nodes and edges based on tag relationships
  const { nodes, edges } = useMemo(() => {
    const filteredEntries = entries.filter(entry => {
      const matchesSearch = !searchQuery ||
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => entry.tags.includes(tag));

      const matchesCategory = !selectedCategory || entry.category === selectedCategory;

      return matchesSearch && matchesTags && matchesCategory;
    });

    // Create nodes
    const graphNodes: GraphNode[] = filteredEntries.map((entry, index) => {
      const angle = (index / filteredEntries.length) * 2 * Math.PI;
      const radius = 250;

      return {
        id: entry.id,
        label: entry.title,
        category: entry.category,
        tags: entry.tags,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        connections: entry.relatedEntries,
      };
    });

    // Create edges based on shared tags
    const graphEdges: GraphEdge[] = [];
    for (let i = 0; i < filteredEntries.length; i++) {
      for (let j = i + 1; j < filteredEntries.length; j++) {
        const entry1 = filteredEntries[i];
        const entry2 = filteredEntries[j];
        const sharedTags = entry1.tags.filter(tag => entry2.tags.includes(tag));

        if (sharedTags.length > 0 || entry1.relatedEntries.includes(entry2.id) || entry2.relatedEntries.includes(entry1.id)) {
          graphEdges.push({
            source: entry1.id,
            target: entry2.id,
            weight: sharedTags.length,
          });
        }
      }
    }

    return { nodes: graphNodes, edges: graphEdges };
  }, [entries, searchQuery, selectedTags, selectedCategory]);

  // Render graph on canvas
  useEffect(() => {
    if (viewMode !== 'graph' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      const height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const centerX = canvas.offsetWidth / 2;
      const centerY = canvas.offsetHeight / 2;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw edges
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.2)'; // cortex-accent with opacity
      ctx.lineWidth = 1;
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return;

        ctx.beginPath();
        ctx.moveTo(centerX + sourceNode.x, centerY + sourceNode.y);
        ctx.lineTo(centerX + targetNode.x, centerY + targetNode.y);
        ctx.lineWidth = Math.max(1, edge.weight);
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(node => {
        const x = centerX + node.x;
        const y = centerY + node.y;
        const isSelected = selectedEntry?.id === node.id;

        // Node circle
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 12 : 8, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? '#7c3aed' : getCategoryColor(node.category);
        ctx.fill();

        // Node border
        ctx.strokeStyle = isSelected ? '#fff' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.stroke();

        // Node label
        if (isSelected || nodes.length < 20) {
          ctx.fillStyle = '#e2e8f0';
          ctx.font = isSelected ? 'bold 12px monospace' : '10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            node.label.length > 20 ? node.label.substring(0, 17) + '...' : node.label,
            x,
            y - 15
          );
        }
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [viewMode, nodes, edges, selectedEntry]);

  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      demo: '#3b82f6',
      pov: '#10b981',
      trr: '#a855f7',
      scenario: '#f97316',
      documentation: '#06b6d4',
      template: '#ec4899',
      other: '#6b7280',
    };
    return colorMap[category] || colorMap.other;
  };

  // Handle canvas click to select nodes
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - canvas.offsetWidth / 2;
    const y = event.clientY - rect.top - canvas.offsetHeight / 2;

    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance < 15;
    });

    if (clickedNode) {
      const entry = entries.find(e => e.id === clickedNode.id);
      setSelectedEntry(entry || null);
    } else {
      setSelectedEntry(null);
    }
  }, [nodes, entries]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach(entry => {
      entry.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [entries]);

  // Handle file upload
  const handleFileUpload = async (file: File, tags: string[], category: string) => {
    try {
      const content = await file.text();

      // Parse markdown front matter if present
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      let title = file.name.replace(/\.md$/i, '');
      let parsedTags = tags;
      let parsedContent = content;

      if (frontMatterMatch) {
        const frontMatter = frontMatterMatch[1];
        parsedContent = frontMatterMatch[2];

        // Parse YAML front matter
        const titleMatch = frontMatter.match(/title:\s*(.+)/);
        if (titleMatch) title = titleMatch[1].trim();

        const tagsMatch = frontMatter.match(/tags:\s*\[(.+)\]/);
        if (tagsMatch) {
          parsedTags = tagsMatch[1].split(',').map(t => t.trim());
        }
      }

      await cloudStoreService.saveMarkdownNote(file, {
        metadata: {
          name: file.name,
          title,
          tags: parsedTags,
          category,
          type: 'knowledge-base',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        contentText: parsedContent,
      });

      actions.notify('success', `Uploaded "${title}" to knowledge base`);
      await loadEntries();
    } catch (error) {
      console.error('Failed to upload file:', error);
      actions.notify('error', 'Failed to upload file to knowledge base');
    }
  };

  // Save new entry
  const handleSaveEntry = async () => {
    if (!editorTitle.trim()) {
      actions.notify('warning', 'Please enter a title');
      return;
    }

    try {
      const newEntry: KnowledgeBaseEntry = {
        id: `kb-${Date.now()}-${Math.random()}`,
        title: editorTitle,
        content: editorContent,
        tags: editorTags,
        category: editorCategory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        relatedEntries: [],
        metadata: {
          author: state.auth.user?.displayName || 'Unknown',
          status: 'published',
        },
      };

      // Create a markdown file
      const markdownContent = `---
title: ${newEntry.title}
tags: [${newEntry.tags.join(', ')}]
category: ${newEntry.category}
createdAt: ${newEntry.createdAt}
---

${newEntry.content}`;

      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const file = new File([blob], `${newEntry.title}.md`, { type: 'text/markdown' });

      await cloudStoreService.saveMarkdownNote(file, {
        metadata: {
          name: file.name,
          title: newEntry.title,
          tags: newEntry.tags,
          category: newEntry.category,
          type: 'knowledge-base',
          createdAt: newEntry.createdAt,
          updatedAt: newEntry.updatedAt,
        },
        contentText: newEntry.content,
      });

      actions.notify('success', `Created "${newEntry.title}"`);

      // Reset editor
      setEditorTitle('');
      setEditorContent('');
      setEditorTags([]);
      setEditorCategory('demo');
      setViewMode('list');

      await loadEntries();
    } catch (error) {
      console.error('Failed to save entry:', error);
      actions.notify('error', 'Failed to save entry');
    }
  };

  const handleAddTag = () => {
    if (currentTagInput.trim() && !editorTags.includes(currentTagInput.trim())) {
      setEditorTags([...editorTags, currentTagInput.trim()]);
      setCurrentTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditorTags(editorTags.filter(t => t !== tag));
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchQuery ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => entry.tags.includes(tag));

    const matchesCategory = !selectedCategory || entry.category === selectedCategory;

    return matchesSearch && matchesTags && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col bg-cortex-bg-primary">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-cortex-border/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-cortex-text-primary flex items-center">
              <span className="text-cortex-accent mr-3">📚</span>
              Knowledge Base
            </h2>
            <p className="text-sm text-cortex-text-muted mt-1">
              Markdown-based documentation with graph visualization
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-modern px-4 py-2 bg-cortex-accent/20 border border-cortex-accent/40 text-cortex-accent hover:bg-cortex-accent/30"
            >
              📤 Upload Markdown
            </button>
            <button
              onClick={() => setViewMode('editor')}
              className="btn-modern px-4 py-2 bg-cortex-success/20 border border-cortex-success/40 text-cortex-success hover:bg-cortex-success/30"
            >
              ✏️ New Entry
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              viewMode === 'list'
                ? 'bg-cortex-primary text-cortex-dark'
                : 'bg-cortex-bg-secondary text-cortex-text-muted hover:text-cortex-text-primary'
            )}
          >
            📋 List View
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              viewMode === 'graph'
                ? 'bg-cortex-primary text-cortex-dark'
                : 'bg-cortex-bg-secondary text-cortex-text-muted hover:text-cortex-text-primary'
            )}
          >
            🕸️ Graph View
          </button>
          <div className="flex-1" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-cortex-bg-secondary border border-cortex-border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-accent w-64"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 p-4 border-b border-cortex-border/20 bg-cortex-bg-secondary/30">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-cortex-text-secondary">Filters:</div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(CATEGORY_COLORS).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  selectedCategory === category
                    ? 'bg-cortex-primary text-cortex-dark'
                    : 'bg-cortex-bg-tertiary text-cortex-text-muted hover:text-cortex-text-primary'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        {selectedTags.length > 0 && (
          <div className="flex items-center space-x-2 mt-2">
            <div className="text-sm text-cortex-text-secondary">Tags:</div>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTagFilter(tag)}
                  className="px-2 py-1 rounded-full text-xs font-medium bg-cortex-accent/20 text-cortex-accent border border-cortex-accent/40"
                >
                  {tag} ×
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntries.map(entry => (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={cn(
                    'glass-card p-4 cursor-pointer transition-all hover:shadow-cortex-lg',
                    selectedEntry?.id === entry.id && 'ring-2 ring-cortex-accent'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-cortex-text-primary truncate">
                      {entry.title}
                    </h3>
                    <div className={cn('w-3 h-3 rounded-full', CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.other)} />
                  </div>
                  <p className="text-sm text-cortex-text-muted line-clamp-2 mb-3">
                    {entry.content.substring(0, 100)}...
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTagFilter(tag);
                        }}
                        className="px-2 py-0.5 rounded-full text-xs bg-cortex-accent/10 text-cortex-accent border border-cortex-accent/20 hover:bg-cortex-accent/20 cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                    {entry.tags.length > 3 && (
                      <span className="px-2 py-0.5 rounded-full text-xs text-cortex-text-muted">
                        +{entry.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {filteredEntries.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-cortex-text-muted">
                <div className="text-4xl mb-4">📭</div>
                <div className="text-lg">No entries found</div>
                <div className="text-sm">Try adjusting your filters or create a new entry</div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'graph' && (
          <div className="h-full relative">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full h-full cursor-pointer"
              style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #0f0f1e 100%)' }}
            />
            <div className="absolute top-4 right-4 bg-cortex-bg-tertiary/90 backdrop-blur-xl border border-cortex-border/60 rounded-lg p-4 max-w-xs">
              <div className="text-sm font-medium text-cortex-text-primary mb-2">Graph Legend</div>
              <div className="space-y-2 text-xs text-cortex-text-muted">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Demo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>POV</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>TRR</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Scenario</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-cortex-border/40 text-xs text-cortex-text-muted">
                Click on a node to view details
              </div>
            </div>
          </div>
        )}

        {viewMode === 'editor' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto glass-card p-8">
              <h3 className="text-xl font-bold text-cortex-text-primary mb-6">Create New Entry</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    placeholder="Enter entry title..."
                    className="w-full px-4 py-2 bg-cortex-bg-secondary border border-cortex-border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                    Category *
                  </label>
                  <select
                    value={editorCategory}
                    onChange={(e) => setEditorCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-cortex-bg-secondary border border-cortex-border rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-accent"
                  >
                    {Object.keys(CATEGORY_COLORS).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                    Tags (for graph relationships)
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={currentTagInput}
                      onChange={(e) => setCurrentTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-2 bg-cortex-bg-secondary border border-cortex-border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-accent"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-cortex-accent/20 border border-cortex-accent/40 text-cortex-accent rounded-lg hover:bg-cortex-accent/30"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editorTags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-sm bg-cortex-accent/20 text-cortex-accent border border-cortex-accent/40 flex items-center space-x-2"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="text-cortex-accent hover:text-cortex-error"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                    Content (Markdown)
                  </label>
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Write your content in markdown..."
                    rows={15}
                    className="w-full px-4 py-2 bg-cortex-bg-secondary border border-cortex-border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-accent font-mono text-sm"
                  />
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button
                    onClick={handleSaveEntry}
                    className="px-6 py-2 bg-cortex-success/20 border border-cortex-success/40 text-cortex-success rounded-lg hover:bg-cortex-success/30 font-medium"
                  >
                    💾 Save Entry
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className="px-6 py-2 bg-cortex-bg-secondary border border-cortex-border text-cortex-text-secondary rounded-lg hover:bg-cortex-bg-tertiary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedEntry && viewMode !== 'editor' && (
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-cortex-bg-tertiary/95 backdrop-blur-xl border-l border-cortex-border/60 shadow-cortex-xl overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-cortex-text-primary">{selectedEntry.title}</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-cortex-text-muted hover:text-cortex-error"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className={cn('w-3 h-3 rounded-full', CATEGORY_COLORS[selectedEntry.category])} />
                <span className="text-sm text-cortex-text-secondary">{selectedEntry.category}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedEntry.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full text-xs bg-cortex-accent/10 text-cortex-accent border border-cortex-accent/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-sm text-cortex-text-muted whitespace-pre-wrap">
              {selectedEntry.content}
            </div>

            <div className="mt-6 pt-6 border-t border-cortex-border/40 text-xs text-cortex-text-muted">
              <div>Created: {new Date(selectedEntry.createdAt).toLocaleDateString()}</div>
              <div>Updated: {new Date(selectedEntry.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadMarkdownModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
          allTags={allTags}
        />
      )}
    </div>
  );
};

// Upload Modal Component
interface UploadMarkdownModalProps {
  onClose: () => void;
  onUpload: (file: File, tags: string[], category: string) => Promise<void>;
  allTags: string[];
}

const UploadMarkdownModal: React.FC<UploadMarkdownModalProps> = ({ onClose, onUpload, allTags }) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [category, setCategory] = useState('demo');
  const [newTag, setNewTag] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.md') || droppedFile.type === 'text/markdown')) {
      setFile(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    await onUpload(file, selectedTags, category);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card p-8 max-w-2xl w-full mx-4">
        <h3 className="text-2xl font-bold text-cortex-text-primary mb-6">Upload Markdown Document</h3>

        {/* File Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors',
            isDragging ? 'border-cortex-accent bg-cortex-accent/10' : 'border-cortex-border',
            file && 'bg-cortex-success/10 border-cortex-success'
          )}
        >
          {file ? (
            <div>
              <div className="text-4xl mb-2">📄</div>
              <div className="text-cortex-text-primary font-medium">{file.name}</div>
              <div className="text-sm text-cortex-text-muted mt-1">
                {(file.size / 1024).toFixed(2)} KB
              </div>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-2">📤</div>
              <div className="text-cortex-text-primary mb-2">Drop markdown file here</div>
              <div className="text-sm text-cortex-text-muted mb-4">or</div>
              <label className="btn-modern px-6 py-2 bg-cortex-accent/20 border border-cortex-accent/40 text-cortex-accent cursor-pointer inline-block">
                Browse Files
                <input
                  type="file"
                  accept=".md,text/markdown"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Category Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-cortex-bg-secondary border border-cortex-border rounded-lg text-cortex-text-primary"
          >
            {Object.keys(CATEGORY_COLORS).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Tag Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
            Tags (select or create new) *
          </label>
          <div className="flex items-center space-x-2 mb-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Add new tag..."
              className="flex-1 px-4 py-2 bg-cortex-bg-secondary border border-cortex-border rounded-lg text-cortex-text-primary"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-cortex-accent/20 border border-cortex-accent/40 text-cortex-accent rounded-lg"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {allTags.slice(0, 10).map(tag => (
              <button
                key={tag}
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter(t => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
                className={cn(
                  'px-3 py-1 rounded-full text-sm transition-colors',
                  selectedTags.includes(tag)
                    ? 'bg-cortex-accent text-cortex-dark'
                    : 'bg-cortex-bg-tertiary text-cortex-text-muted hover:bg-cortex-bg-secondary'
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-sm bg-cortex-accent/20 text-cortex-accent border border-cortex-accent/40 flex items-center space-x-2"
              >
                <span>{tag}</span>
                <button
                  onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                  className="text-cortex-accent hover:text-cortex-error"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-cortex-bg-secondary border border-cortex-border text-cortex-text-secondary rounded-lg hover:bg-cortex-bg-tertiary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || selectedTags.length === 0}
            className="px-6 py-2 bg-cortex-success/20 border border-cortex-success/40 text-cortex-success rounded-lg hover:bg-cortex-success/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseGraph;
