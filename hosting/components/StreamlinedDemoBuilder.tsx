'use client';

import React, { useState, useCallback } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import cloudStoreService from '../lib/cloud-store-service';
import userActivityService from '../lib/user-activity-service';
import { cn } from '../lib/utils';

type ViewMode = 'upload' | 'knowledge-base' | 'data-hub';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  url?: string;
  error?: string;
}

export const StreamlinedDemoBuilder: React.FC = () => {
  const { actions } = useAppState();
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File): Promise<void> => {
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      status: 'uploading'
    };

    setUploadedFiles(prev => [newFile, ...prev]);

    try {
      // Determine file type and upload accordingly
      if (file.type.includes('markdown') || file.name.endsWith('.md')) {
        const content = await file.text();
        const result = await cloudStoreService.saveMarkdownNote(file, {
          metadata: {
            name: file.name,
            title: file.name.replace(/\.md$/i, ''),
            type: 'demo',
            createdAt: new Date().toISOString(),
            component: 'streamlined-demo-builder',
          },
          contentText: content,
        });

        setUploadedFiles(prev => prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'ready', url: result.downloadUrl }
            : f
        ));

        userActivityService.trackActivity('markdown-uploaded', 'streamlined-demo-builder', {
          fileName: file.name,
          size: file.size,
          storageId: result.id
        });

        actions.notify('success', `Markdown file "${file.name}" uploaded successfully`);
      } else if (file.type.includes('json')) {
        const content = await file.text();
        const jsonData = JSON.parse(content);

        // Store JSON data
        const result = await cloudStoreService.saveJsonDocument(file, {
          metadata: {
            name: file.name,
            type: 'data',
            createdAt: new Date().toISOString(),
            component: 'streamlined-demo-builder',
          },
          jsonData
        });

        setUploadedFiles(prev => prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'ready', url: result.downloadUrl }
            : f
        ));

        actions.notify('success', `JSON file "${file.name}" uploaded successfully`);
      } else if (file.type.includes('csv')) {
        const result = await cloudStoreService.uploadFile(file, 'data-imports');

        setUploadedFiles(prev => prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'ready', url: result.downloadUrl }
            : f
        ));

        actions.notify('success', `CSV file "${file.name}" uploaded successfully`);
      } else {
        // Generic file upload
        const result = await cloudStoreService.uploadFile(file, 'demo-assets');

        setUploadedFiles(prev => prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'ready', url: result.downloadUrl }
            : f
        ));

        actions.notify('success', `File "${file.name}" uploaded successfully`);
      }
    } catch (error) {
      setUploadedFiles(prev => prev.map(f =>
        f.id === fileId
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ));

      actions.notify('error', `Failed to upload "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setIsUploading(true);
    for (const file of files) {
      await processFile(file);
    }
    setIsUploading(false);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    for (const file of files) {
      await processFile(file);
    }
    setIsUploading(false);

    // Reset input
    e.target.value = '';
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const UploadView = () => (
    <div className="space-y-6">
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-2xl p-12 transition-all duration-300',
          isDragging
            ? 'border-cortex-primary bg-cortex-primary/10 scale-[1.02]'
            : 'border-cortex-border hover:border-cortex-primary/50 hover:bg-cortex-bg-hover/30'
        )}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">📤</div>
          <h3 className="text-2xl font-bold text-cortex-text-primary mb-2">
            {isDragging ? 'Drop files here' : 'Upload Demo Assets'}
          </h3>
          <p className="text-cortex-text-secondary mb-6">
            Drag and drop files or click to browse
          </p>

          <div className="flex items-center justify-center space-x-4 mb-6">
            <label className="btn-modern button-hover-lift cortex-interactive px-6 py-3 bg-gradient-to-r from-cortex-primary to-cortex-accent text-white rounded-lg cursor-pointer transition-all font-medium">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".md,.json,.csv,.pdf,.xlsx,.pptx,.docx,.txt"
              />
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Select Files</span>
              </span>
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {[
              { icon: '📝', label: 'Markdown', ext: '.md' },
              { icon: '📊', label: 'Data Files', ext: '.json, .csv' },
              { icon: '📄', label: 'Documents', ext: '.pdf, .docx' },
              { icon: '📁', label: 'Presentations', ext: '.pptx' }
            ].map((type, index) => (
              <div key={index} className="p-3 bg-cortex-bg-tertiary/50 rounded-lg border border-cortex-border/50">
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-xs font-medium text-cortex-text-primary">{type.label}</div>
                <div className="text-xs text-cortex-text-muted">{type.ext}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="glass-card p-4 border-l-4 border-cortex-primary">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-cortex-primary border-t-transparent"></div>
            <div className="text-cortex-text-primary font-medium">Uploading files...</div>
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-cortex-text-primary">Recent Uploads</h3>
          <div className="space-y-2">
            {uploadedFiles.slice(0, 10).map((file) => (
              <div key={file.id} className="cortex-card p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-2xl">
                    {file.type.includes('markdown') ? '📝' :
                     file.type.includes('json') ? '📊' :
                     file.type.includes('csv') ? '📈' :
                     file.type.includes('pdf') ? '📄' : '📁'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-cortex-text-primary truncate">{file.name}</div>
                    <div className="text-xs text-cortex-text-muted">
                      {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    file.status === 'ready' && 'bg-status-success/20 text-status-success',
                    file.status === 'uploading' && 'bg-cortex-info/20 text-cortex-info',
                    file.status === 'processing' && 'bg-status-warning/20 text-status-warning',
                    file.status === 'error' && 'bg-status-error/20 text-status-error'
                  )}>
                    {file.status}
                  </div>
                  {file.status === 'ready' && file.url && (
                    <a
                      href={file.url}
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const KnowledgeBaseView = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-2xl font-bold text-cortex-text-primary mb-4">📚 Knowledge Base</h3>
        <p className="text-cortex-text-secondary mb-6">
          Access documentation, demo scripts, and reference materials
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '📖', title: 'Demo Scripts', count: 24, color: 'from-blue-500 to-blue-600', path: '/knowledge/scripts' },
            { icon: '🎯', title: 'POV Templates', count: 12, color: 'from-green-500 to-green-600', path: '/knowledge/pov' },
            { icon: '🔬', title: 'Scenario Library', count: 48, color: 'from-purple-500 to-purple-600', path: '/knowledge/scenarios' },
            { icon: '🏆', title: 'Success Stories', count: 18, color: 'from-yellow-500 to-yellow-600', path: '/knowledge/success' },
            { icon: '📊', title: 'Analytics Dashboards', count: 8, color: 'from-cyan-500 to-cyan-600', path: '/knowledge/analytics' },
            { icon: '🛠️', title: 'Tools & Utilities', count: 15, color: 'from-orange-500 to-orange-600', path: '/knowledge/tools' }
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => {
                // Navigate to knowledge base section
                actions.notify('info', `Opening ${item.title}...`);
              }}
              className="group cortex-card p-6 cortex-interactive button-hover-lift text-left"
            >
              <div className={cn(
                'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl mb-4',
                item.color
              )}>
                {item.icon}
              </div>
              <h4 className="font-bold text-cortex-text-primary mb-1 group-hover:text-cortex-accent transition-colors">
                {item.title}
              </h4>
              <p className="text-sm text-cortex-text-muted">{item.count} items</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <h4 className="font-bold text-cortex-text-primary mb-3">🔗 Quick Links</h4>
          <div className="space-y-2">
            {[
              'Cortex XSIAM Documentation',
              'Competitive Battlecards',
              'Integration Guides',
              'Security Best Practices'
            ].map((link, index) => (
              <a
                key={index}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  actions.notify('info', `Opening ${link}...`);
                }}
                className="block p-2 rounded hover:bg-cortex-bg-hover transition-colors text-sm text-cortex-text-secondary hover:text-cortex-primary"
              >
                → {link}
              </a>
            ))}
          </div>
        </div>

        <div className="glass-card p-4">
          <h4 className="font-bold text-cortex-text-primary mb-3">📈 Recently Accessed</h4>
          <div className="space-y-2">
            {[
              { title: 'Ransomware Detection Demo', time: '2h ago' },
              { title: 'Cloud Security POV Template', time: '5h ago' },
              { title: 'Customer Success: ACME Corp', time: '1d ago' }
            ].map((item, index) => (
              <div key={index} className="p-2 rounded hover:bg-cortex-bg-hover transition-colors text-sm">
                <div className="text-cortex-text-primary">{item.title}</div>
                <div className="text-xs text-cortex-text-muted">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const DataHubView = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-2xl font-bold text-cortex-text-primary mb-4">📊 Data Integration Hub</h3>
        <p className="text-cortex-text-secondary mb-6">
          Export, analyze, and integrate your demo and POV data
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="cortex-card-elevated p-4">
            <div className="text-cortex-primary font-bold mb-2 flex items-center space-x-2">
              <span>📤</span>
              <span>Data Exports</span>
            </div>
            <div className="text-3xl font-mono text-cortex-text-primary mb-1">24</div>
            <div className="text-sm text-cortex-text-muted">This month</div>
            <button className="mt-3 w-full btn-modern button-hover-lift cortex-interactive px-4 py-2 bg-cortex-primary/20 hover:bg-cortex-primary/30 text-cortex-primary rounded transition-colors">
              View Exports
            </button>
          </div>

          <div className="cortex-card-elevated p-4">
            <div className="text-status-success font-bold mb-2 flex items-center space-x-2">
              <span>💾</span>
              <span>Storage Used</span>
            </div>
            <div className="text-3xl font-mono text-cortex-text-primary mb-1">4.2 GB</div>
            <div className="text-sm text-cortex-text-muted">Of 100 GB</div>
            <div className="mt-3 w-full bg-cortex-bg-secondary rounded-full h-2">
              <div className="bg-status-success h-2 rounded-full" style={{ width: '4.2%' }}></div>
            </div>
          </div>

          <div className="cortex-card-elevated p-4">
            <div className="text-cortex-info font-bold mb-2 flex items-center space-x-2">
              <span>🔗</span>
              <span>Integrations</span>
            </div>
            <div className="text-3xl font-mono text-cortex-text-primary mb-1">8</div>
            <div className="text-sm text-cortex-text-muted">Active connections</div>
            <button className="mt-3 w-full btn-modern button-hover-lift cortex-interactive px-4 py-2 bg-cortex-info/20 hover:bg-cortex-info/30 text-cortex-info rounded transition-colors">
              Manage
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="font-bold text-cortex-text-primary">⚡ Quick Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: '📥', label: 'Import CSV Data', action: () => document.querySelector<HTMLInputElement>('input[type="file"]')?.click() },
              { icon: '📤', label: 'Export to BigQuery', action: () => actions.notify('info', 'Opening BigQuery export...') },
              { icon: '🔄', label: 'Sync with CRM', action: () => actions.notify('info', 'Starting CRM sync...') },
              { icon: '📊', label: 'Generate Analytics Report', action: () => actions.notify('info', 'Generating report...') }
            ].map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="flex items-center space-x-3 p-4 rounded-lg border border-cortex-border hover:border-cortex-primary/50 hover:bg-cortex-bg-hover transition-all cortex-interactive"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium text-cortex-text-primary">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section
      id="demo-blueprint-studio"
      aria-labelledby="demo-blueprint-studio-heading"
      className="p-8 space-y-8 scroll-mt-28"
    >
      {/* Header */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              id="demo-blueprint-studio-heading"
              className="text-3xl font-bold text-cortex-text-primary mb-2"
            >
              Demo Builder Studio
            </h1>
            <p className="text-cortex-text-muted">Upload assets, access knowledge base, and manage demo data</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 bg-cortex-bg-secondary/50 p-1 rounded-lg">
          {[
            { id: 'upload' as ViewMode, icon: '📤', label: 'Upload Assets', desc: 'Add demo files and content' },
            { id: 'knowledge-base' as ViewMode, icon: '📚', label: 'Knowledge Base', desc: 'Browse documentation' },
            { id: 'data-hub' as ViewMode, icon: '📊', label: 'Data Hub', desc: 'Export and integrate' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={cn(
                'flex-1 px-4 py-3 text-center transition-all rounded-md cortex-interactive',
                viewMode === tab.id
                  ? 'bg-gradient-to-r from-cortex-primary to-cortex-accent text-white shadow-lg'
                  : 'text-cortex-text-muted hover:text-cortex-text-primary hover:bg-cortex-bg-hover'
              )}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl">{tab.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs opacity-75">{tab.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {viewMode === 'upload' && <UploadView />}
        {viewMode === 'knowledge-base' && <KnowledgeBaseView />}
        {viewMode === 'data-hub' && <DataHubView />}
      </div>
    </section>
  );
};

export default StreamlinedDemoBuilder;
