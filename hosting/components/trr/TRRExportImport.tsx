'use client';

import React, { useState, useCallback, useRef } from 'react';
import { TRR, Project } from '../../types/trr';
import { CortexButton } from '../CortexButton';

interface ExportOptions {
  format: 'pdf' | 'excel' | 'json';
  includeTestCases: boolean;
  includeDORCriteria: boolean;
  includeSDWProgress: boolean;
  includeComments: boolean;
  includeAttachments: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filterBy?: {
    statuses: string[];
    priorities: string[];
    assignees: string[];
    tags: string[];
  };
}

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  preview?: TRR[];
}

interface TRRExportImportProps {
  trrs: TRR[];
  projects: Project[];
  onImport?: (trrs: Omit<TRR, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<ImportResult>;
  onExportComplete?: (result: { format: string; count: number; success: boolean }) => void;
  currentUser?: string;
}

export const TRRExportImport: React.FC<TRRExportImportProps> = ({
  trrs,
  projects,
  onImport,
  onExportComplete,
  currentUser = 'Anonymous',
}) => {
  const [selectedTab, setSelectedTab] = useState<'export' | 'import'>('export');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeTestCases: true,
    includeDORCriteria: true,
    includeSDWProgress: true,
    includeComments: false,
    includeAttachments: false,
  });
  
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<TRR[] | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter TRRs based on export options
  const getFilteredTRRs = useCallback(() => {
    let filtered = trrs;

    // Date range filter
    if (exportOptions.dateRange) {
      filtered = filtered.filter(trr => {
        const trrDate = new Date(trr.updatedAt);
        return trrDate >= exportOptions.dateRange!.start && trrDate <= exportOptions.dateRange!.end;
      });
    }

    // Status filter
    if (exportOptions.filterBy?.statuses && exportOptions.filterBy.statuses.length > 0) {
      filtered = filtered.filter(trr => exportOptions.filterBy!.statuses.includes(trr.status));
    }

    // Priority filter
    if (exportOptions.filterBy?.priorities && exportOptions.filterBy.priorities.length > 0) {
      filtered = filtered.filter(trr => exportOptions.filterBy!.priorities.includes(trr.priority));
    }

    // Assignee filter
    if (exportOptions.filterBy?.assignees && exportOptions.filterBy.assignees.length > 0) {
      filtered = filtered.filter(trr => trr.assignedTo && exportOptions.filterBy!.assignees.includes(trr.assignedTo));
    }

    // Tags filter
    if (exportOptions.filterBy?.tags && exportOptions.filterBy.tags.length > 0) {
      filtered = filtered.filter(trr => 
        trr.tags && trr.tags.some(tag => exportOptions.filterBy!.tags.includes(tag))
      );
    }

    return filtered;
  }, [trrs, exportOptions]);

  // Export to JSON
  const exportToJSON = useCallback((trrs: TRR[]) => {
    const data = trrs.map(trr => {
      const exportTRR: any = {
        id: trr.id,
        title: trr.title,
        description: trr.description,
        status: trr.status,
        priority: trr.priority,
        assignedTo: trr.assignedTo,
        projectId: trr.projectId,
        estimatedHours: trr.estimatedHours,
        tags: trr.tags,
        dependencies: trr.dependencies,
        dueDate: trr.dueDate,
        createdAt: trr.createdAt,
        updatedAt: trr.updatedAt,
      };

      if (exportOptions.includeTestCases) {
        exportTRR.testCases = trr.testCases;
      }

      if (exportOptions.includeDORCriteria) {
        exportTRR.dorCriteria = trr.dorCriteria;
      }

      if (exportOptions.includeSDWProgress) {
        exportTRR.sdwProgress = trr.sdwProgress;
      }

      if (exportOptions.includeComments) {
        exportTRR.comments = trr.comments;
      }

      return exportTRR;
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trrs-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportOptions]);

  // Export to Excel (CSV format for simplicity)
  const exportToExcel = useCallback((trrs: TRR[]) => {
    const headers = [
      'ID',
      'Title',
      'Description',
      'Status',
      'Priority',
      'Assigned To',
      'Project',
      'Estimated Hours',
      'Tags',
      'Dependencies',
      'Due Date',
      'Created At',
      'Updated At',
    ];

    if (exportOptions.includeTestCases) {
      headers.push('Test Cases Count', 'Failed Tests');
    }

    if (exportOptions.includeDORCriteria) {
      headers.push('DOR Criteria Count', 'DOR Complete');
    }

    if (exportOptions.includeSDWProgress) {
      headers.push('SDW Progress', 'Pending Approvals');
    }

    const rows = trrs.map(trr => {
      const project = projects.find(p => p.id === trr.projectId);
      const row = [
        trr.id,
        trr.title,
        trr.description.replace(/"/g, '""'), // Escape quotes
        trr.status,
        trr.priority,
        trr.assignedTo || '',
        project?.name || '',
        trr.estimatedHours || 0,
        (trr.tags || []).join('; '),
        (trr.dependencies || []).join('; '),
        trr.dueDate ? new Date(trr.dueDate).toLocaleDateString() : '',
        new Date(trr.createdAt).toLocaleDateString(),
        new Date(trr.updatedAt).toLocaleDateString(),
      ];

      if (exportOptions.includeTestCases) {
        const testCases = trr.testCases || [];
        const failedTests = testCases.filter(tc => tc.status === 'failed').length;
        row.push(testCases.length.toString(), failedTests.toString());
      }

      if (exportOptions.includeDORCriteria) {
        const dorCriteria = trr.dorCriteria || [];
        const completedDOR = dorCriteria.filter(dor => dor.status === 'completed').length;
        row.push(dorCriteria.length.toString(), completedDOR === dorCriteria.length ? 'Yes' : 'No');
      }

      if (exportOptions.includeSDWProgress) {
        const sdwProgress = trr.sdwProgress || [];
        const pendingApprovals = sdwProgress.filter(step => step.status === 'pending_approval').length;
        const progressPct = sdwProgress.length > 0 
          ? Math.round((sdwProgress.filter(s => s.status === 'approved').length / sdwProgress.length) * 100)
          : 0;
        row.push(`${progressPct}%`, pendingApprovals.toString());
      }

      return row;
    });

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trrs-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportOptions, projects]);

  // Export to PDF (simplified version)
  const exportToPDF = useCallback((trrs: TRR[]) => {
    // Note: In a real implementation, you'd use a library like jsPDF or Puppeteer
    // For now, we'll create an HTML version that can be printed to PDF
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TRR Export Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
          .trr { margin-bottom: 30px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
          .trr-header { background: #f5f5f5; padding: 10px; margin: -15px -15px 15px -15px; border-radius: 5px 5px 0 0; }
          .trr-title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
          .trr-meta { font-size: 12px; color: #666; }
          .status { padding: 2px 8px; border-radius: 3px; font-size: 11px; text-transform: uppercase; }
          .status.completed { background: #d4edda; color: #155724; }
          .status.in-progress { background: #d1ecf1; color: #0c5460; }
          .status.pending { background: #fff3cd; color: #856404; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 5px; border: 1px solid #ddd; text-align: left; font-size: 12px; }
          th { background: #f8f9fa; }
        </style>
      </head>
      <body>
        <h1>TRR Export Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <p>Total TRRs: ${trrs.length}</p>
        
        ${trrs.map(trr => {
          const project = projects.find(p => p.id === trr.projectId);
          return `
            <div class="trr">
              <div class="trr-header">
                <div class="trr-title">${trr.title}</div>
                <div class="trr-meta">
                  <span class="status ${trr.status}">${trr.status}</span>
                  Priority: ${trr.priority} | 
                  Assignee: ${trr.assignedTo || 'Unassigned'} | 
                  Project: ${project?.name || 'Unknown'}
                </div>
              </div>
              <div class="trr-content">
                <p><strong>Description:</strong> ${trr.description}</p>
                ${trr.estimatedHours ? `<p><strong>Estimated Hours:</strong> ${trr.estimatedHours}</p>` : ''}
                ${trr.dueDate ? `<p><strong>Due Date:</strong> ${new Date(trr.dueDate).toLocaleDateString()}</p>` : ''}
                ${trr.tags && trr.tags.length > 0 ? `<p><strong>Tags:</strong> ${trr.tags.join(', ')}</p>` : ''}
                
                ${exportOptions.includeTestCases && trr.testCases && trr.testCases.length > 0 ? `
                  <table>
                    <thead>
                      <tr><th>Test Case</th><th>Status</th><th>Expected Result</th></tr>
                    </thead>
                    <tbody>
                      ${trr.testCases.map(tc => `
                        <tr>
                          <td>${tc.name}</td>
                          <td><span class="status ${tc.status || 'pending'}">${tc.status || 'pending'}</span></td>
                          <td>${tc.expectedResult}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trrs-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportOptions, projects]);

  // Handle export
  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const filteredTRRs = getFilteredTRRs();
      
      switch (exportOptions.format) {
        case 'json':
          exportToJSON(filteredTRRs);
          break;
        case 'excel':
          exportToExcel(filteredTRRs);
          break;
        case 'pdf':
          exportToPDF(filteredTRRs);
          break;
      }

      if (onExportComplete) {
        onExportComplete({
          format: exportOptions.format,
          count: filteredTRRs.length,
          success: true,
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      if (onExportComplete) {
        onExportComplete({
          format: exportOptions.format,
          count: 0,
          success: false,
        });
      }
    }
    setExporting(false);
  }, [exportOptions, getFilteredTRRs, exportToJSON, exportToExcel, exportToPDF, onExportComplete]);

  // Parse CSV file
  const parseCSV = useCallback((text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }

    return data;
  }, []);

  // Convert imported data to TRR format
  const convertToTRRFormat = useCallback((data: any[]): Omit<TRR, 'id' | 'createdAt' | 'updatedAt'>[] => {
    return data.map((row, index) => {
      const now = new Date();
      
      // Find project by name
      const project = projects.find(p => p.name === row.Project || p.id === row['Project ID']);
      const projectId = project?.id || projects[0]?.id || 'default-project';

      return {
        title: row.Title || `Imported TRR ${index + 1}`,
        description: row.Description || '',
        status: ['draft', 'pending', 'in-progress', 'in-review', 'completed', 'validated'].includes(row.Status?.toLowerCase()) 
          ? row.Status.toLowerCase() : 'draft',
        priority: ['low', 'medium', 'high', 'critical'].includes(row.Priority?.toLowerCase()) 
          ? row.Priority.toLowerCase() : 'medium',
        assignedTo: row['Assigned To'] || undefined,
        projectId,
        estimatedHours: parseInt(row['Estimated Hours']) || undefined,
        tags: row.Tags ? row.Tags.split(';').map((tag: string) => tag.trim()).filter(Boolean) : [],
        dependencies: row.Dependencies ? row.Dependencies.split(';').map((dep: string) => dep.trim()).filter(Boolean) : [],
        dueDate: row['Due Date'] ? new Date(row['Due Date']) : undefined,
        testCases: [],
        dorCriteria: [],
        sdwProgress: [],
        comments: [],
        statusHistory: [{
          status: 'draft',
          timestamp: now,
          changedBy: currentUser,
        }],
      };
    });
  }, [projects, currentUser]);

  // Handle file selection
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImportResult(null);
    setPreviewData(null);

    try {
      const text = await file.text();
      let parsedData: any[] = [];

      if (file.name.endsWith('.json')) {
        parsedData = JSON.parse(text);
        if (!Array.isArray(parsedData)) {
          throw new Error('JSON file must contain an array of TRRs');
        }
      } else if (file.name.endsWith('.csv')) {
        parsedData = parseCSV(text);
      } else {
        throw new Error('Unsupported file format. Please upload JSON or CSV files.');
      }

      const trrData = convertToTRRFormat(parsedData);
      setPreviewData(trrData.slice(0, 5)); // Show first 5 for preview
    } catch (error) {
      console.error('Failed to parse file:', error);
      setImportResult({
        success: false,
        imported: 0,
        failed: 1,
        errors: [{
          row: 0,
          field: 'file',
          message: error instanceof Error ? error.message : 'Failed to parse file'
        }]
      });
    }
  }, [parseCSV, convertToTRRFormat]);

  // Handle import
  const handleImport = useCallback(async () => {
    if (!selectedFile || !onImport) return;

    setImporting(true);
    try {
      const text = await selectedFile.text();
      let parsedData: any[] = [];

      if (selectedFile.name.endsWith('.json')) {
        parsedData = JSON.parse(text);
      } else if (selectedFile.name.endsWith('.csv')) {
        parsedData = parseCSV(text);
      }

      const trrData = convertToTRRFormat(parsedData);
      const result = await onImport(trrData);
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: false,
        imported: 0,
        failed: 1,
        errors: [{
          row: 0,
          field: 'import',
          message: error instanceof Error ? error.message : 'Import failed'
        }]
      });
    }
    setImporting(false);
  }, [selectedFile, onImport, parseCSV, convertToTRRFormat]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cortex-text-primary">Export / Import</h2>
          <p className="text-cortex-text-secondary">
            Export TRRs for reporting or import from external systems
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-cortex-border-secondary">
        <nav className="flex space-x-8">
          {[
            { key: 'export', label: 'Export', icon: '📤' },
            { key: 'import', label: 'Import', icon: '📥' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                selectedTab === tab.key
                  ? 'border-cortex-green text-cortex-text-primary'
                  : 'border-transparent text-cortex-text-muted hover:text-cortex-text-primary hover:border-cortex-border-secondary'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Export Tab */}
      {selectedTab === 'export' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Export Options */}
            <div className="lg:col-span-2 space-y-6">
              <div className="cortex-card p-6">
                <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Export Options</h3>
                
                {/* Format Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-cortex-text-primary mb-2">
                      Export Format
                    </label>
                    <div className="flex space-x-4">
                      {[
                        { key: 'json', label: 'JSON', icon: '📄', desc: 'Complete data with full structure' },
                        { key: 'excel', label: 'Excel/CSV', icon: '📊', desc: 'Spreadsheet format for analysis' },
                        { key: 'pdf', label: 'PDF', icon: '📋', desc: 'Formatted report for sharing' },
                      ].map((format) => (
                        <label
                          key={format.key}
                          className={`flex-1 cursor-pointer p-4 border-2 rounded-lg transition-colors ${
                            exportOptions.format === format.key
                              ? 'border-cortex-green bg-cortex-green/10'
                              : 'border-cortex-border-secondary hover:border-cortex-green/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="format"
                            value={format.key}
                            checked={exportOptions.format === format.key}
                            onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value as any })}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className="text-2xl mb-2">{format.icon}</div>
                            <div className="font-medium text-cortex-text-primary">{format.label}</div>
                            <div className="text-sm text-cortex-text-muted mt-1">{format.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Include Options */}
                  <div>
                    <label className="block text-sm font-medium text-cortex-text-primary mb-2">
                      Include in Export
                    </label>
                    <div className="space-y-2">
                      {[
                        { key: 'includeTestCases', label: 'Test Cases' },
                        { key: 'includeDORCriteria', label: 'DOR Criteria' },
                        { key: 'includeSDWProgress', label: 'SDW Progress' },
                        { key: 'includeComments', label: 'Comments' },
                        { key: 'includeAttachments', label: 'Attachments' },
                      ].map((option) => (
                        <label key={option.key} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(exportOptions as any)[option.key]}
                            onChange={(e) => setExportOptions({
                              ...exportOptions,
                              [option.key]: e.target.checked
                            })}
                            className="rounded border-cortex-border-secondary"
                          />
                          <span className="text-sm text-cortex-text-primary">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-cortex-text-primary mb-2">
                      Date Range (Optional)
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="date"
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          dateRange: {
                            ...exportOptions.dateRange,
                            start: new Date(e.target.value)
                          }
                        })}
                        className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary"
                      />
                      <span className="text-cortex-text-muted">to</span>
                      <input
                        type="date"
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          dateRange: {
                            ...exportOptions.dateRange,
                            end: new Date(e.target.value)
                          }
                        })}
                        className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Preview */}
            <div className="cortex-card p-6">
              <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Export Preview</h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cortex-info">
                    {getFilteredTRRs().length}
                  </div>
                  <p className="text-sm text-cortex-text-muted">TRRs will be exported</p>
                </div>

                {/* Format-specific info */}
                {exportOptions.format === 'json' && (
                  <div className="p-3 bg-cortex-info/10 border border-cortex-info/20 rounded">
                    <p className="text-sm text-cortex-info">
                      💡 JSON format preserves all data structures and relationships. Perfect for backup or migration.
                    </p>
                  </div>
                )}

                {exportOptions.format === 'excel' && (
                  <div className="p-3 bg-cortex-warning/10 border border-cortex-warning/20 rounded">
                    <p className="text-sm text-cortex-warning">
                      📊 CSV format is great for analysis but may lose some data structure. Complex fields will be flattened.
                    </p>
                  </div>
                )}

                {exportOptions.format === 'pdf' && (
                  <div className="p-3 bg-cortex-success/10 border border-cortex-success/20 rounded">
                    <p className="text-sm text-cortex-success">
                      📋 PDF format creates a formatted report. Best for presentations and documentation.
                    </p>
                  </div>
                )}

                <CortexButton
                  onClick={handleExport}
                  variant="primary"
                  disabled={exporting || getFilteredTRRs().length === 0}
                  icon={exporting ? '⏳' : '📤'}
                  className="w-full"
                >
                  {exporting ? 'Exporting...' : `Export ${getFilteredTRRs().length} TRRs`}
                </CortexButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Tab */}
      {selectedTab === 'import' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Import Options */}
            <div className="cortex-card p-6">
              <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Import TRRs</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cortex-text-primary mb-2">
                    Select File
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-cortex-green file:text-white file:rounded"
                  />
                  <p className="text-xs text-cortex-text-muted mt-1">
                    Supported formats: JSON, CSV
                  </p>
                </div>

                {/* Import Template Info */}
                <div className="p-4 bg-cortex-info/10 border border-cortex-info/20 rounded">
                  <h4 className="font-medium text-cortex-info mb-2">CSV Format Requirements</h4>
                  <p className="text-sm text-cortex-text-secondary mb-2">
                    Your CSV file should include these columns:
                  </p>
                  <div className="text-xs text-cortex-text-muted space-y-1">
                    <div>• <strong>Title</strong> (required)</div>
                    <div>• <strong>Description</strong></div>
                    <div>• <strong>Status</strong> (draft, pending, in-progress, etc.)</div>
                    <div>• <strong>Priority</strong> (low, medium, high, critical)</div>
                    <div>• <strong>Assigned To</strong></div>
                    <div>• <strong>Project</strong> (project name or ID)</div>
                    <div>• <strong>Estimated Hours</strong></div>
                    <div>• <strong>Tags</strong> (semicolon separated)</div>
                  </div>
                </div>

                <CortexButton
                  onClick={handleImport}
                  variant="primary"
                  disabled={!selectedFile || importing || !onImport}
                  icon={importing ? '⏳' : '📥'}
                  className="w-full"
                >
                  {importing ? 'Importing...' : 'Import TRRs'}
                </CortexButton>
              </div>
            </div>

            {/* Preview/Results */}
            <div className="cortex-card p-6">
              <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">
                {importResult ? 'Import Results' : 'Preview'}
              </h3>
              
              {importResult && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    importResult.success 
                      ? 'bg-cortex-success/10 border border-cortex-success/20'
                      : 'bg-cortex-error/10 border border-cortex-error/20'
                  }`}>
                    <div className={`font-medium ${
                      importResult.success ? 'text-cortex-success' : 'text-cortex-error'
                    }`}>
                      {importResult.success ? '✅ Import Successful' : '❌ Import Failed'}
                    </div>
                    <div className="text-sm mt-2">
                      <div>Imported: {importResult.imported} TRRs</div>
                      <div>Failed: {importResult.failed} TRRs</div>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-cortex-text-primary mb-2">Errors:</h4>
                      <div className="space-y-1 text-sm">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="text-cortex-error">
                            Row {error.row}: {error.field} - {error.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {previewData && !importResult && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cortex-info">
                      {previewData.length}+
                    </div>
                    <p className="text-sm text-cortex-text-muted">TRRs ready for import</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-cortex-text-primary">Preview (first 5):</h4>
                    {previewData.map((trr, index) => (
                      <div key={index} className="p-3 bg-cortex-bg-tertiary rounded">
                        <div className="font-medium text-cortex-text-primary">{trr.title}</div>
                        <div className="text-sm text-cortex-text-muted">
                          {trr.status} • {trr.priority} • {trr.assignedTo || 'Unassigned'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!previewData && !importResult && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📁</div>
                  <p className="text-cortex-text-muted">Select a file to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TRRExportImport;