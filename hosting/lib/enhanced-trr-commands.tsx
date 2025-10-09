import React, { useState, useRef } from 'react';
import { CommandConfig } from './commands';
import { TerminalOutput } from '../components/TerminalOutput';

// Enhanced TRR data model
export interface TRRValidation {
  id: string;
  requirement: string;
  description: string;
  category: 'security' | 'performance' | 'compliance' | 'integration' | 'usability';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'validated' | 'failed' | 'not-applicable';
  assignedTo: string;
  customer: string;
  scenario?: string;
  validationMethod: string;
  expectedOutcome: string;
  actualOutcome?: string;
  evidence?: string[];
  comments: string[];
  createdDate: string;
  updatedDate: string;
  dueDate?: string;
  completedDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  businessImpact: string;
}

// Mock TRR data store
const trrValidations: TRRValidation[] = [
  {
    id: 'TRR-001',
    requirement: 'SIEM Integration Validation',
    description: 'Validate integration with customer existing SIEM solution',
    category: 'integration',
    priority: 'critical',
    status: 'in-progress',
    assignedTo: 'john.consultant',
    customer: 'acme-corp',
    scenario: 'siem-integration-demo',
    validationMethod: 'Live integration test with customer SIEM',
    expectedOutcome: 'Successful bi-directional data flow and alert correlation',
    evidence: ['integration-test-log.txt', 'siem-config-screenshot.png'],
    comments: ['Initial testing completed', 'Waiting for customer firewall rules'],
    createdDate: '2024-01-15T10:00:00Z',
    updatedDate: '2024-01-18T14:30:00Z',
    dueDate: '2024-01-25T17:00:00Z',
    estimatedHours: 16,
    actualHours: 12,
    dependencies: ['TRR-002'],
    riskLevel: 'medium',
    businessImpact: 'Critical for customer security operations workflow'
  },
  {
    id: 'TRR-002',
    requirement: 'Network Connectivity',
    description: 'Verify network connectivity between XSIAM and customer endpoints',
    category: 'integration',
    priority: 'high',
    status: 'validated',
    assignedTo: 'sarah.engineer',
    customer: 'acme-corp',
    validationMethod: 'Network connectivity testing and port validation',
    expectedOutcome: 'All required ports accessible with proper latency',
    actualOutcome: 'All connections successful, latency within acceptable range',
    evidence: ['network-test-results.csv', 'port-scan-report.pdf'],
    comments: ['All tests passed successfully'],
    createdDate: '2024-01-10T09:00:00Z',
    updatedDate: '2024-01-16T11:45:00Z',
    completedDate: '2024-01-16T11:45:00Z',
    estimatedHours: 8,
    actualHours: 6,
    riskLevel: 'low',
    businessImpact: 'Essential for platform functionality'
  }
];

// CSV parsing utility
const parseCSV = (csvContent: string): Partial<TRRValidation>[] => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must contain at least a header and one data row');
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const data: Partial<TRRValidation>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) continue;
    
    const row: Partial<TRRValidation> = {};
    headers.forEach((header, index) => {
      const value = values[index];
      
      // Map CSV headers to TRR fields
      switch (header) {
        case 'id':
        case 'requirement':
        case 'description':
        case 'assignedto':
        case 'customer':
        case 'scenario':
        case 'validationmethod':
        case 'expectedoutcome':
        case 'actualoutcome':
        case 'businessimpact':
          (row as any)[header === 'assignedto' ? 'assignedTo' : 
                      header === 'validationmethod' ? 'validationMethod' :
                      header === 'expectedoutcome' ? 'expectedOutcome' :
                      header === 'actualoutcome' ? 'actualOutcome' :
                      header === 'businessimpact' ? 'businessImpact' : header] = value;
          break;
        case 'category':
          if (['security', 'performance', 'compliance', 'integration', 'usability'].includes(value)) {
            row.category = value as TRRValidation['category'];
          }
          break;
        case 'priority':
          if (['critical', 'high', 'medium', 'low'].includes(value)) {
            row.priority = value as TRRValidation['priority'];
          }
          break;
        case 'status':
          if (['pending', 'in-progress', 'validated', 'failed', 'not-applicable'].includes(value)) {
            row.status = value as TRRValidation['status'];
          }
          break;
        case 'risklevel':
          if (['low', 'medium', 'high', 'critical'].includes(value)) {
            row.riskLevel = value as TRRValidation['riskLevel'];
          }
          break;
        case 'estimatedhours':
        case 'actualhours':
          const hours = parseInt(value);
          if (!isNaN(hours)) {
            (row as any)[header === 'estimatedhours' ? 'estimatedHours' : 'actualHours'] = hours;
          }
          break;
        case 'duedate':
        case 'createddate':
        case 'updateddate':
        case 'completeddate':
          if (value && value !== '') {
            (row as any)[header === 'duedate' ? 'dueDate' :
                        header === 'createddate' ? 'createdDate' :
                        header === 'updateddate' ? 'updatedDate' :
                        'completedDate'] = value;
          }
          break;
        case 'comments':
          if (value && value !== '') {
            row.comments = value.split('|').map(c => c.trim());
          }
          break;
        case 'evidence':
          if (value && value !== '') {
            row.evidence = value.split('|').map(e => e.trim());
          }
          break;
        case 'dependencies':
          if (value && value !== '') {
            row.dependencies = value.split('|').map(d => d.trim());
          }
          break;
      }
    });
    
    // Set defaults for required fields
    if (!row.id) row.id = `TRR-${Date.now()}-${i}`;
    if (!row.createdDate) row.createdDate = new Date().toISOString();
    if (!row.updatedDate) row.updatedDate = new Date().toISOString();
    if (!row.comments) row.comments = [];
    if (!row.evidence) row.evidence = [];
    if (!row.status) row.status = 'pending';
    if (!row.priority) row.priority = 'medium';
    if (!row.riskLevel) row.riskLevel = 'low';
    
    data.push(row);
  }
  
  return data;
};

// CSV Upload Component
const CSVUploadComponent: React.FC<{
  onUpload: (data: Partial<TRRValidation>[]) => void;
}> = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setErrorMessage('Please upload a CSV file');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('processing');
    setErrorMessage('');

    try {
      const content = await file.text();
      const parsedData = parseCSV(content);
      onUpload(parsedData);
      setUploadStatus('success');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse CSV');
      setUploadStatus('error');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-orange-400 mb-2">📤 CSV Upload</h3>
        <p className="text-sm text-gray-300 mb-4">
          Upload a CSV file to bulk import TRR validations. The CSV should contain headers matching TRR fields.
        </p>
      </div>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-orange-400 bg-orange-400/10' : 'border-gray-600 hover:border-gray-500'
        } ${uploadStatus === 'error' ? 'border-red-500' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center">
          <div className="text-4xl mb-4">
            {uploadStatus === 'processing' ? '⏳' : 
             uploadStatus === 'success' ? '✅' : 
             uploadStatus === 'error' ? '❌' : '📁'}
          </div>
          
          <div className="text-lg font-semibold text-gray-300 mb-2">
            {uploadStatus === 'processing' ? 'Processing...' :
             uploadStatus === 'success' ? 'Upload Successful!' :
             uploadStatus === 'error' ? 'Upload Failed' :
             'Drop CSV file here or click to browse'}
          </div>
          
          {uploadStatus === 'idle' && (
            <div className="text-sm text-cortex-text-muted">
              Supported format: CSV files with TRR validation data
            </div>
          )}
          
          {uploadStatus === 'error' && (
            <div className="text-sm text-red-400 mt-2">{errorMessage}</div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-cortex-text-muted">
        <details className="cursor-pointer">
          <summary className="font-semibold text-cortex-text-secondary hover:text-gray-300">
            View expected CSV format ▶
          </summary>
          <div className="mt-2 bg-gray-900 p-3 rounded font-mono text-xs overflow-x-auto">
            <div className="text-green-400 mb-2">Expected CSV Headers:</div>
            <div className="whitespace-nowrap">
              id,requirement,description,category,priority,status,assignedTo,customer,scenario,validationMethod,expectedOutcome,dueDate,estimatedHours,riskLevel,businessImpact,comments,evidence
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export const enhancedTrrCommands: CommandConfig[] = [
  {
    name: 'trr',
    description: 'TRR (Technical Requirements Review) management with CSV import support',
    usage: 'trr [list|create|upload|update|status|export] [options]',
    aliases: ['trr-mgmt', 'validation'],
    handler: (args) => {
      const subcommand = args[0] || 'dashboard';

      if (subcommand === 'upload' || subcommand === 'import') {
        return (
          <TerminalOutput type="info">
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">📊</div>
                <div>
                  <div className="font-bold text-xl">TRR CSV Upload</div>
                  <div className="text-sm text-gray-300">Bulk import TRR validations from CSV file</div>
                </div>
              </div>
              
              <CSVUploadComponent 
                onUpload={(data) => {
                  // Add imported validations to the store
                  data.forEach(validation => {
                    if (validation.requirement && validation.description) {
                      trrValidations.push({
                        ...validation,
                        id: validation.id || `TRR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        requirement: validation.requirement,
                        description: validation.description,
                        category: validation.category || 'integration',
                        priority: validation.priority || 'medium',
                        status: validation.status || 'pending',
                        assignedTo: validation.assignedTo || 'unassigned',
                        customer: validation.customer || 'unknown',
                        validationMethod: validation.validationMethod || 'Manual verification',
                        expectedOutcome: validation.expectedOutcome || 'TBD',
                        comments: validation.comments || [],
                        evidence: validation.evidence || [],
                        createdDate: validation.createdDate || new Date().toISOString(),
                        updatedDate: validation.updatedDate || new Date().toISOString(),
                        riskLevel: validation.riskLevel || 'low',
                        businessImpact: validation.businessImpact || 'TBD'
                      } as TRRValidation);
                    }
                  });
                }}
              />
            </div>
          </TerminalOutput>
        );
      }

      if (subcommand === 'export') {
        const csvHeaders = [
          'id', 'requirement', 'description', 'category', 'priority', 'status',
          'assignedTo', 'customer', 'scenario', 'validationMethod', 'expectedOutcome',
          'actualOutcome', 'dueDate', 'estimatedHours', 'actualHours', 'riskLevel',
          'businessImpact', 'comments', 'evidence', 'createdDate', 'updatedDate'
        ];
        
        const csvData = trrValidations.map(trr => [
          trr.id,
          trr.requirement,
          trr.description,
          trr.category,
          trr.priority,
          trr.status,
          trr.assignedTo,
          trr.customer,
          trr.scenario || '',
          trr.validationMethod,
          trr.expectedOutcome,
          trr.actualOutcome || '',
          trr.dueDate || '',
          trr.estimatedHours || '',
          trr.actualHours || '',
          trr.riskLevel,
          trr.businessImpact,
          trr.comments.join('|'),
          trr.evidence?.join('|') || '',
          trr.createdDate,
          trr.updatedDate
        ]);

        const csvContent = [csvHeaders, ...csvData]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');

        return (
          <TerminalOutput type="success">
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">📤</div>
                <div>
                  <div className="font-bold text-xl">TRR Data Export</div>
                  <div className="text-sm text-gray-300">Generated CSV export of all TRR validations</div>
                </div>
              </div>
              
              <div className="bg-gray-900 p-4 rounded border border-gray-600">
                <div className="text-sm text-cortex-text-secondary mb-2">Export Summary:</div>
                <div className="text-green-400">✅ {trrValidations.length} TRR validations exported</div>
                <div className="mt-4 text-xs">
                  <details className="cursor-pointer">
                    <summary className="text-blue-400 hover:text-blue-300">View CSV Data ▶</summary>
                    <pre className="mt-2 bg-black p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {csvContent}
                    </pre>
                  </details>
                </div>
              </div>
            </div>
          </TerminalOutput>
        );
      }

      if (subcommand === 'list') {
        const filterBy = args.includes('--customer') ? args[args.indexOf('--customer') + 1] : null;
        const statusFilter = args.includes('--status') ? args[args.indexOf('--status') + 1] : null;
        
        let filtered = [...trrValidations];
        if (filterBy) filtered = filtered.filter(trr => trr.customer.toLowerCase().includes(filterBy.toLowerCase()));
        if (statusFilter) filtered = filtered.filter(trr => trr.status === statusFilter);

        return (
          <TerminalOutput type="info">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">📋</div>
                  <div>
                    <div className="font-bold text-xl">TRR Validations</div>
                    <div className="text-sm text-gray-300">
                      {filtered.length} validation{filtered.length !== 1 ? 's' : ''} found
                      {filterBy && ` for customer: ${filterBy}`}
                      {statusFilter && ` with status: ${statusFilter}`}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-cortex-text-secondary">
                  Use --customer or --status to filter
                </div>
              </div>
              
              <div className="space-y-3">
                {filtered.map(trr => (
                  <div key={trr.id} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="font-mono text-sm text-blue-400">{trr.id}</div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          trr.status === 'validated' ? 'bg-green-800 text-green-200' :
                          trr.status === 'in-progress' ? 'bg-yellow-800 text-yellow-200' :
                          trr.status === 'failed' ? 'bg-red-800 text-red-200' :
                          'bg-gray-700 text-gray-200'
                        }`}>
                          {trr.status.toUpperCase()}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          trr.priority === 'critical' ? 'bg-red-700 text-red-200' :
                          trr.priority === 'high' ? 'bg-orange-700 text-orange-200' :
                          trr.priority === 'medium' ? 'bg-blue-700 text-blue-200' :
                          'bg-gray-700 text-gray-200'
                        }`}>
                          {trr.priority}
                        </div>
                      </div>
                      <div className="text-xs text-cortex-text-muted">
                        {trr.assignedTo} • {trr.customer}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="font-bold text-white">{trr.requirement}</div>
                      <div className="text-sm text-gray-300 mt-1">{trr.description}</div>
                    </div>
                    
                    <div className="text-xs text-cortex-text-secondary grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-cortex-text-muted">Method:</span> {trr.validationMethod}
                      </div>
                      <div>
                        <span className="text-cortex-text-muted">Expected:</span> {trr.expectedOutcome}
                      </div>
                      {trr.dueDate && (
                        <div>
                          <span className="text-cortex-text-muted">Due:</span> {new Date(trr.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {trr.estimatedHours && (
                        <div>
                          <span className="text-cortex-text-muted">Est. Hours:</span> {trr.estimatedHours}h
                        </div>
                      )}
                    </div>
                    
                    {trr.comments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="text-xs text-cortex-text-muted mb-1">Recent Comments:</div>
                        <div className="text-xs text-gray-300">{trr.comments[trr.comments.length - 1]}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TerminalOutput>
        );
      }

      // Dashboard view (default)
      const statusCounts = trrValidations.reduce((acc, trr) => {
        acc[trr.status] = (acc[trr.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const priorityCounts = trrValidations.reduce((acc, trr) => {
        acc[trr.priority] = (acc[trr.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return (
        <TerminalOutput type="info">
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="text-3xl mr-4">📊</div>
              <div>
                <div className="font-bold text-2xl text-orange-400">TRR Management Dashboard</div>
                <div className="text-sm text-gray-300">Technical Requirements Review tracking and validation</div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 text-center">
                <div className="text-2xl font-bold text-white">{trrValidations.length}</div>
                <div className="text-sm text-cortex-text-secondary">Total TRRs</div>
              </div>
              <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30 text-center">
                <div className="text-2xl font-bold text-green-400">{statusCounts.validated || 0}</div>
                <div className="text-sm text-cortex-text-secondary">Validated</div>
              </div>
              <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30 text-center">
                <div className="text-2xl font-bold text-yellow-400">{statusCounts['in-progress'] || 0}</div>
                <div className="text-sm text-cortex-text-secondary">In Progress</div>
              </div>
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30 text-center">
                <div className="text-2xl font-bold text-red-400">{priorityCounts.critical || 0}</div>
                <div className="text-sm text-cortex-text-secondary">Critical Priority</div>
              </div>
            </div>

            {/* Available Commands */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
              <div className="font-bold text-lg mb-4 text-orange-400">📋 Available Commands</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-green-400 font-mono mb-2">trr list</div>
                  <div className="text-sm text-gray-300 ml-4">List all TRR validations</div>
                  
                  <div className="text-blue-400 font-mono mb-2 mt-3">trr upload</div>
                  <div className="text-sm text-gray-300 ml-4">Upload CSV file with TRR data</div>
                  
                  <div className="text-purple-400 font-mono mb-2 mt-3">trr export</div>
                  <div className="text-sm text-gray-300 ml-4">Export TRR data to CSV format</div>
                </div>
                <div>
                  <div className="text-yellow-400 font-mono mb-2">trr list --customer acme-corp</div>
                  <div className="text-sm text-gray-300 ml-4">Filter by customer</div>
                  
                  <div className="text-cyan-400 font-mono mb-2 mt-3">trr list --status validated</div>
                  <div className="text-sm text-gray-300 ml-4">Filter by validation status</div>
                  
                  <div className="text-orange-400 font-mono mb-2 mt-3">trr create</div>
                  <div className="text-sm text-gray-300 ml-4">Create new TRR validation</div>
                </div>
              </div>
            </div>
          </div>
        </TerminalOutput>
      );
    }
  }
];
