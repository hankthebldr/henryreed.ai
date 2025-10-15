'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { behavioralAnalyticsService } from '../lib/behavioral-analytics-service';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Vault structure inspired by Obsidian
interface VaultNote {
  id: string;
  title: string;
  path: string;
  content: string;
  tags: string[];
  category: string;
  linkedNotes: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

interface VaultFolder {
  id: string;
  name: string;
  icon: string;
  color: string;
  notes: VaultNote[];
  subfolders?: VaultFolder[];
}

type ViewMode = 'grid' | 'list' | 'graph';

export const KnowledgeBaseLibrary: React.FC = () => {
  const { actions } = useAppState();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedNote, setSelectedNote] = useState<VaultNote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isEditMode, setIsEditMode] = useState(false);

  // Mock vault structure - in production, this would come from Firebase/Firestore
  const vaultStructure: VaultFolder[] = useMemo(() => [
    {
      id: 'demo-scripts',
      name: 'Demo Scripts',
      icon: '📖',
      color: 'from-blue-500 to-blue-600',
      notes: [
        {
          id: 'ransomware-demo',
          title: 'Ransomware Detection Demo',
          path: 'demo-scripts/ransomware-demo.md',
          content: '# Ransomware Detection Demo\n\nThis demo showcases Cortex XSIAM\'s ability to detect and respond to ransomware attacks in real-time.\n\n## Prerequisites\n- XSIAM tenant configured\n- Demo environment with Windows endpoints\n- Syslog generator running\n\n## Demo Flow\n1. **Initial State**: Show baseline activity\n2. **Attack Simulation**: Trigger ransomware behavior\n3. **Detection**: Highlight XSIAM alerts\n4. **Response**: Demonstrate automated playbooks\n5. **Remediation**: Show containment actions\n\n## Key Talking Points\n- Real-time detection capabilities\n- Automated response playbooks\n- Integration with endpoint security\n\n[[pov-templates]] | [[competitive-battlecards]]',
          tags: ['demo', 'ransomware', 'detection', 'xsiam'],
          category: 'demo-scripts',
          linkedNotes: ['pov-templates', 'competitive-battlecards'],
          createdAt: '2025-01-15T10:00:00Z',
          updatedAt: '2025-01-15T14:30:00Z'
        }
      ]
    },
    {
      id: 'pov-templates',
      name: 'POV Templates',
      icon: '🎯',
      color: 'from-green-500 to-green-600',
      notes: [
        {
          id: 'cloud-security-pov',
          title: 'Cloud Security POV Template',
          path: 'pov-templates/cloud-security-pov.md',
          content: '# Cloud Security POV Template\n\n## Executive Summary\nThis POV demonstrates Cortex XSIAM\'s comprehensive cloud security capabilities.\n\n## Objectives\n1. Validate cloud workload protection\n2. Test multi-cloud visibility\n3. Demonstrate automated response\n\n## Success Criteria\n- [ ] AWS integration validated\n- [ ] Azure integration validated\n- [ ] GCP integration validated\n- [ ] Cloud-native threats detected\n- [ ] Automated remediation working\n\n## Timeline\n- Week 1: Environment setup\n- Week 2: Integration configuration\n- Week 3: Testing and validation\n- Week 4: Executive presentation\n\n[[demo-scripts]] | [[success-stories]]',
          tags: ['pov', 'cloud', 'security', 'template'],
          category: 'pov-templates',
          linkedNotes: ['demo-scripts', 'success-stories'],
          createdAt: '2025-01-10T09:00:00Z',
          updatedAt: '2025-01-18T16:45:00Z'
        }
      ]
    },
    {
      id: 'scenarios',
      name: 'Scenario Library',
      icon: '🔬',
      color: 'from-purple-500 to-purple-600',
      notes: []
    },
    {
      id: 'success-stories',
      name: 'Success Stories',
      icon: '🏆',
      color: 'from-yellow-500 to-yellow-600',
      notes: []
    },
    {
      id: 'competitive-battlecards',
      name: 'Competitive Battlecards',
      icon: '⚔️',
      color: 'from-red-500 to-red-600',
      notes: []
    },
    {
      id: 'tools',
      name: 'Tools & Utilities',
      icon: '🛠️',
      color: 'from-orange-500 to-orange-600',
      notes: []
    }
  ], []);

  // Flatten all notes for searching
  const allNotes = useMemo(() => {
    return vaultStructure.flatMap(folder => folder.notes);
  }, [vaultStructure]);

  // Filter notes based on search and category
  const filteredNotes = useMemo(() => {
    let notes = allNotes;

    if (selectedCategory !== 'all') {
      notes = notes.filter(note => note.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      notes = notes.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return notes;
  }, [allNotes, searchQuery, selectedCategory]);

  // Track analytics
  useEffect(() => {
    behavioralAnalyticsService.trackFeatureUsage('knowledge-base', 'view', {
      viewMode,
      category: selectedCategory
    });
  }, [viewMode, selectedCategory]);

  const handleNoteSelect = (note: VaultNote) => {
    setSelectedNote(note);
    setIsEditMode(false);
    behavioralAnalyticsService.trackContentInteraction('note', note.id, 'view', {
      title: note.title,
      category: note.category
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    behavioralAnalyticsService.trackSearch(query, filteredNotes.length, {
      category: selectedCategory
    });
  };

  // Render note content with Obsidian-style features
  const renderNoteContent = (content: string) => {
    // Replace [[note]] links with clickable links
    const processedContent = content.replace(/\[\[(.*?)\]\]/g, (_, linkText) => {
      return `[${linkText}](#link-${linkText})`;
    });

    return (
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className="text-3xl font-bold text-cortex-text-primary mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-2xl font-bold text-cortex-text-primary mb-3 mt-6">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xl font-bold text-cortex-text-primary mb-2 mt-4">{children}</h3>,
            p: ({ children }) => <p className="text-cortex-text-secondary mb-4 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside text-cortex-text-secondary space-y-1 mb-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside text-cortex-text-secondary space-y-1 mb-4">{children}</ol>,
            code: ({ inline, children }: any) =>
              inline ? (
                <code className="bg-cortex-bg-tertiary px-1.5 py-0.5 rounded text-cortex-accent font-mono text-sm">{children}</code>
              ) : (
                <code className="block bg-cortex-bg-tertiary p-4 rounded-lg text-cortex-accent font-mono text-sm overflow-x-auto">{children}</code>
              ),
            a: ({ href, children }: any) => (
              <a
                href={href}
                className="text-cortex-primary hover:text-cortex-accent underline transition-colors"
                onClick={(e) => {
                  if (href?.startsWith('#link-')) {
                    e.preventDefault();
                    const noteId = href.replace('#link-', '');
                    actions.notify('info', `Opening linked note: ${noteId}`);
                  }
                }}
              >
                {children}
              </a>
            )
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <section
      id="knowledge-base-library"
      aria-labelledby="knowledge-base-library-heading"
      className="p-8 space-y-6 scroll-mt-28"
    >
      {/* Header */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              id="knowledge-base-library-heading"
              className="text-3xl font-bold text-cortex-text-primary mb-2"
            >
              📚 Knowledge Vault
            </h1>
            <p className="text-cortex-text-muted">Obsidian-inspired knowledge base for DC platform content</p>
          </div>
          <div className="flex items-center space-x-2">
            {['grid', 'list', 'graph'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as ViewMode)}
                className={cn(
                  'px-4 py-2 rounded-lg transition-colors capitalize',
                  viewMode === mode
                    ? 'bg-cortex-primary text-white'
                    : 'bg-cortex-bg-tertiary text-cortex-text-muted hover:text-cortex-text-primary'
                )}
              >
                {mode === 'grid' && '⊞'}
                {mode === 'list' && '☰'}
                {mode === 'graph' && '🕸️'}
                <span className="ml-2">{mode}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search notes, tags, or content..."
              className="w-full px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary placeholder-cortex-text-disabled focus:ring-2 focus:ring-cortex-primary"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary focus:ring-2 focus:ring-cortex-primary"
          >
            <option value="all">All Categories</option>
            {vaultStructure.map(folder => (
              <option key={folder.id} value={folder.id}>{folder.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Vault Structure */}
        <div className="glass-card p-6 lg:col-span-1">
          <h3 className="text-lg font-bold text-cortex-text-primary mb-4">📁 Vault Structure</h3>
          <div className="space-y-2">
            {vaultStructure.map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedCategory(folder.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between',
                  selectedCategory === folder.id
                    ? 'bg-cortex-primary/20 text-cortex-primary'
                    : 'hover:bg-cortex-bg-hover text-cortex-text-secondary'
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{folder.icon}</span>
                  <span className="font-medium">{folder.name}</span>
                </div>
                <span className="text-sm text-cortex-text-muted">{folder.notes.length}</span>
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-cortex-border">
            <div className="text-sm text-cortex-text-muted space-y-2">
              <div className="flex justify-between">
                <span>Total Notes:</span>
                <span className="text-cortex-text-primary font-mono">{allNotes.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Filtered:</span>
                <span className="text-cortex-text-primary font-mono">{filteredNotes.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Notes List or Note Viewer */}
        <div className="glass-card p-6 lg:col-span-2">
          {selectedNote ? (
            // Note Viewer
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setSelectedNote(null)}
                  className="text-cortex-primary hover:text-cortex-accent flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to vault</span>
                </button>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="px-4 py-2 bg-cortex-accent/20 text-cortex-accent rounded-lg hover:bg-cortex-accent/30 transition-colors"
                >
                  {isEditMode ? '👁️ Preview' : '✏️ Edit'}
                </button>
              </div>

              <div className="mb-4">
                <h2 className="text-2xl font-bold text-cortex-text-primary mb-2">{selectedNote.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-cortex-text-muted">
                  <span>Updated {new Date(selectedNote.updatedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{selectedNote.tags.length} tags</span>
                  <span>•</span>
                  <span>{selectedNote.linkedNotes.length} links</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedNote.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-cortex-primary/20 text-cortex-primary text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                {isEditMode ? (
                  <textarea
                    className="w-full h-96 p-4 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary font-mono text-sm focus:ring-2 focus:ring-cortex-primary"
                    value={selectedNote.content}
                    onChange={(e) => {
                      setSelectedNote({ ...selectedNote, content: e.target.value });
                    }}
                  />
                ) : (
                  renderNoteContent(selectedNote.content)
                )}
              </div>
            </div>
          ) : (
            // Notes List
            <div>
              <h3 className="text-xl font-bold text-cortex-text-primary mb-4">
                {searchQuery ? `Search Results (${filteredNotes.length})` : 'Recent Notes'}
              </h3>

              {filteredNotes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-cortex-text-primary mb-2">No notes found</h3>
                  <p className="text-cortex-text-muted">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className={cn(
                  viewMode === 'grid' && 'grid grid-cols-1 md:grid-cols-2 gap-4',
                  viewMode === 'list' && 'space-y-3'
                )}>
                  {filteredNotes.map(note => (
                    <button
                      key={note.id}
                      onClick={() => handleNoteSelect(note)}
                      className="cortex-card p-4 text-left cortex-interactive button-hover-lift"
                    >
                      <h4 className="font-bold text-cortex-text-primary mb-2">{note.title}</h4>
                      <p className="text-sm text-cortex-text-muted mb-3 line-clamp-2">
                        {note.content.substring(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between text-xs text-cortex-text-muted">
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        <div className="flex space-x-2">
                          {note.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-cortex-bg-tertiary rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default KnowledgeBaseLibrary;
