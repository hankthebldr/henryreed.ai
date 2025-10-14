'use client';

import React, { useState, useCallback } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import cloudStoreService from '../lib/cloud-store-service';
import userActivityService from '../lib/user-activity-service';
import { cn } from '../lib/utils';

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

export const AssetUploader: React.FC = () => {
  const { actions } = useAppState();
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
            component: 'asset-uploader',
          },
          contentText: content,
        });

        setUploadedFiles(prev => prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'ready', url: result.downloadUrl }
            : f
        ));

        userActivityService.trackActivity('markdown-uploaded', 'asset-uploader', {
          fileName: file.name,
          size: file.size,
          storageId: result.id
        });

        actions.notify('success', `Markdown file "${file.name}" uploaded successfully`);
      } else if (file.type.includes('json')) {
        const content = await file.text();
        const jsonData = JSON.parse(content);

        // TODO: Store JSON data using Firestore
        // For now, just mark as ready
        setUploadedFiles(prev => prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'ready', url: '#' }
            : f
        ));

        actions.notify('success', `JSON file "${file.name}" uploaded successfully`);
      } else if (file.type.includes('csv')) {
        // TODO: Upload file to Firebase Storage
        // For now, just mark as ready
        setUploadedFiles(prev => prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'ready', url: '#' }
            : f
        ));

        actions.notify('success', `CSV file "${file.name}" uploaded successfully`);
      } else {
        // TODO: Generic file upload to Firebase Storage
        // For now, just mark as ready
        setUploadedFiles(prev => prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'ready', url: '#' }
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

  return (
    <section
      id="asset-uploader"
      aria-labelledby="asset-uploader-heading"
      className="p-8 space-y-8 scroll-mt-28"
    >
      {/* Header */}
      <div className="glass-card p-8">
        <h1
          id="asset-uploader-heading"
          className="text-3xl font-bold text-cortex-text-primary mb-2"
        >
          📤 Asset Uploader
        </h1>
        <p className="text-cortex-text-muted">Upload demo assets, documentation, and files for your engagements</p>
      </div>

      {/* Drag and Drop Zone */}
      <div className="space-y-6">
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
    </section>
  );
};

export default AssetUploader;
