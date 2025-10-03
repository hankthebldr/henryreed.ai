/**
 * BigQuery Data Explorer
 * Comprehensive data export and analytics platform for DC workflows
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { dcAPIClient, DataExportConfig } from '../lib/dc-api-client';
import { dcContextStore } from '../lib/dc-context-store';

interface ExportJob {
  id: string;
  name: string;
  config: DataExportConfig;
  status: 'pending' | 'running' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
  size?: string;
  records?: number;
}

interface QueryTemplate {
  id: string;
  name: string;
  description: string;
  category: 'customer' | 'pov' | 'trr' | 'analytics' | 'custom';
  sql: string;
  parameters: { name: string; type: string; description: string }[];
}

export const BigQueryExplorer: React.FC = () => {
  const { state, actions } = useAppState();
  const [activeTab, setActiveTab] = useState<'explorer' | 'exports' | 'templates' | 'analytics'>('explorer');
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exportConfig, setExportConfig] = useState<DataExportConfig>({
    scope: 'all',
    filters: {},
    format: 'json',
    includeMetadata: true
  });

  useEffect(() => {
    actions.updateBreadcrumbs([
      { label: 'Home', path: '/gui' },
      { label: 'BigQuery Explorer', path: '/gui/bigquery' },
    ]);
    
    // Initialize sample data if empty
    if (dcContextStore.getAllCustomerEngagements().length === 0) {
      dcContextStore.initializeSampleData();
    }
    
    loadExportHistory();
  }, [actions]);

  const loadExportHistory = () => {
    // Mock export history - in production, this would load from API
    const mockJobs: ExportJob[] = [
      {
        id: 'exp_001',
        name: 'Full Data Dump - Q4 2024',
        config: { scope: 'all', filters: {}, format: 'json', includeMetadata: true },
        status: 'completed',
        downloadUrl: '/api/exports/exp_001/download',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86000000).toISOString(),
        size: '24.7 MB',
        records: 1247
      },
      {
        id: 'exp_002',
        name: 'Acme Corp - Customer Export',
        config: { scope: 'customer', filters: { customerId: 'cust_001' }, format: 'excel', includeMetadata: true },
        status: 'completed',
        downloadUrl: '/api/exports/exp_002/download',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        completedAt: new Date(Date.now() - 172000000).toISOString(),
        size: '4.2 MB',
        records: 156
      },
      {
        id: 'exp_003',
        name: 'TRR Analytics - Last 30 Days',
        config: { 
          scope: 'timeframe', 
          filters: { 
            startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
            endDate: new Date().toISOString(),
            dataTypes: ['trr'] 
          }, 
          format: 'csv', 
          includeMetadata: false 
        },
        status: 'running',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        size: 'Processing...'
      }
    ];
    setExportJobs(mockJobs);
  };

  const executeExport = async () => {
    setIsLoading(true);
    try {
      const response = await dcAPIClient.exportData(exportConfig);
      if (response.success && response.data) {
        const newJob: ExportJob = {
          id: `exp_${Date.now()}`,
          name: `Export - ${new Date().toLocaleString()}`,
          config: exportConfig,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        setExportJobs(prev => [newJob, ...prev]);
        actions.notify('success', 'Export job started successfully');
        
        // Simulate job completion after delay
        setTimeout(() => {
          setExportJobs(prev => prev.map(job => 
            job.id === newJob.id 
              ? { ...job, status: 'completed', completedAt: new Date().toISOString(), downloadUrl: response.data!.downloadUrl, size: '12.3 MB', records: 892 }
              : job
          ));
        }, 3000);
      } else {
        actions.notify('error', response.error || 'Export failed');
      }
    } catch (error) {
      actions.notify('error', `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const queryTemplates: QueryTemplate[] = [
    {
      id: 'tmpl_001',
      name: 'Customer Success Analysis',
      description: 'Analyze customer engagement success rates and patterns',
      category: 'customer',
      sql: `SELECT 
  c.name as customer_name,
  c.industry,
  c.maturity_level,
  COUNT(p.id) as total_povs,
  COUNT(CASE WHEN p.outcomes_success THEN 1 END) as successful_povs,
  AVG(DATETIME_DIFF(p.updated_at, p.created_at, DAY)) as avg_pov_duration
FROM customers c
LEFT JOIN povs p ON c.id = p.customer_id
WHERE c.created_at >= @start_date
GROUP BY c.id, c.name, c.industry, c.maturity_level
ORDER BY successful_povs DESC`,
      parameters: [
        { name: 'start_date', type: 'DATE', description: 'Analysis start date' }
      ]
    },
    {
      id: 'tmpl_002',
      name: 'TRR Validation Performance',
      description: 'Track TRR validation rates and bottlenecks',
      category: 'trr',
      sql: `SELECT 
  DATE_TRUNC(t.created_at, WEEK) as week,
  t.priority,
  COUNT(*) as total_trrs,
  COUNT(CASE WHEN t.status = 'validated' THEN 1 END) as validated_trrs,
  AVG(DATETIME_DIFF(t.validated_at, t.created_at, HOUR)) as avg_validation_hours
FROM trrs t
WHERE t.created_at >= @start_date
GROUP BY week, t.priority
ORDER BY week DESC, t.priority`,
      parameters: [
        { name: 'start_date', type: 'DATE', description: 'Analysis period start' }
      ]
    },
    {
      id: 'tmpl_003',
      name: 'POV Scenario Effectiveness',
      description: 'Analyze which scenarios lead to the highest success rates',
      category: 'pov',
      sql: `SELECT 
  s.name as scenario_name,
  s.type as scenario_type,
  COUNT(s.id) as times_used,
  COUNT(CASE WHEN p.outcomes_success THEN 1 END) as successful_outcomes,
  ROUND(COUNT(CASE WHEN p.outcomes_success THEN 1 END) * 100.0 / COUNT(s.id), 2) as success_rate
FROM pov_scenarios s
JOIN povs p ON s.pov_id = p.id
WHERE p.created_at >= @start_date
GROUP BY s.name, s.type
HAVING COUNT(s.id) >= @min_usage
ORDER BY success_rate DESC, times_used DESC`,
      parameters: [
        { name: 'start_date', type: 'DATE', description: 'Analysis period start' },
        { name: 'min_usage', type: 'INT64', description: 'Minimum usage count' }
      ]
    }
  ];

  const ExplorerTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-lg border border-blue-500/30">
        <h3 className="text-xl font-bold text-blue-400 mb-4">🔍 Data Export Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Export Scope</label>
            <select
              value={exportConfig.scope}
              onChange={(e) => setExportConfig(prev => ({ ...prev, scope: e.target.value as DataExportConfig['scope'] }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="all">All Data</option>
              <option value="customer">Customer-Specific</option>
              <option value="timeframe">Time Range</option>
              <option value="type">Data Type</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Export Format</label>
            <select
              value={exportConfig.format}
              onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value as DataExportConfig['format'] }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="bigquery">BigQuery Direct</option>
            </select>
          </div>
        </div>
        
        {exportConfig.scope === 'customer' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Customer</label>
            <select
              value={exportConfig.filters.customerId || ''}
              onChange={(e) => setExportConfig(prev => ({ ...prev, filters: { ...prev.filters, customerId: e.target.value } }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="">Select a customer...</option>
              {dcContextStore.getAllCustomerEngagements().map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
        )}
        
        {exportConfig.scope === 'timeframe' && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                value={exportConfig.filters.startDate?.split('T')[0] || ''}
                onChange={(e) => setExportConfig(prev => ({ ...prev, filters: { ...prev.filters, startDate: new Date(e.target.value).toISOString() } }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
              <input
                type="date"
                value={exportConfig.filters.endDate?.split('T')[0] || ''}
                onChange={(e) => setExportConfig(prev => ({ ...prev, filters: { ...prev.filters, endDate: new Date(e.target.value).toISOString() } }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </div>
        )}
        
        {exportConfig.scope === 'type' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Data Types</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['customers', 'povs', 'trrs', 'scenarios', 'workflows', 'analytics'].map(type => (
                <label key={type} className="flex items-center text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={exportConfig.filters.dataTypes?.includes(type) || false}
                    onChange={(e) => {
                      const types = exportConfig.filters.dataTypes || [];
                      if (e.target.checked) {
                        setExportConfig(prev => ({ ...prev, filters: { ...prev.filters, dataTypes: [...types, type] } }));
                      } else {
                        setExportConfig(prev => ({ ...prev, filters: { ...prev.filters, dataTypes: types.filter(t => t !== type) } }));
                      }
                    }}
                    className="mr-2"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <label className="flex items-center text-sm text-gray-300">
            <input
              type="checkbox"
              checked={exportConfig.includeMetadata}
              onChange={(e) => setExportConfig(prev => ({ ...prev, includeMetadata: e.target.checked }))}
              className="mr-2"
            />
            Include metadata and system fields
          </label>
        </div>
        
        <div className="mt-6 flex gap-4">
          <button
            onClick={executeExport}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded transition-colors font-medium"
          >
            {isLoading ? '⏳ Starting Export...' : '🚀 Start Export'}
          </button>
          
          <button
            onClick={() => setExportConfig({ scope: 'all', filters: {}, format: 'json', includeMetadata: true })}
            className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );

  const ExportsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">📦 Export History</h3>
        <button
          onClick={loadExportHistory}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          🔄 Refresh
        </button>
      </div>
      
      <div className="space-y-4">
        {exportJobs.map(job => (
          <div key={job.id} className="bg-gray-800/50 p-4 rounded border border-gray-600">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-white font-medium">{job.name}</div>
                <div className="text-sm text-gray-400">
                  {job.config.scope} • {job.config.format} • {job.config.includeMetadata ? 'with metadata' : 'data only'}
                </div>
              </div>
              <div className="text-right">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  job.status === 'completed' ? 'bg-green-900/20 text-green-400 border border-green-500/30' :
                  job.status === 'running' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/30' :
                  job.status === 'failed' ? 'bg-red-900/20 text-red-400 border border-red-500/30' :
                  'bg-gray-900/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {job.status}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div>
                Created: {new Date(job.createdAt).toLocaleString()}
                {job.completedAt && (
                  <span className="ml-4">Completed: {new Date(job.completedAt).toLocaleString()}</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {job.size && <span>{job.size}</span>}
                {job.records && <span>{job.records} records</span>}
                {job.downloadUrl && (
                  <a
                    href={job.downloadUrl}
                    className="text-blue-400 hover:text-blue-300 underline"
                    download
                  >
                    📥 Download
                  </a>
                )}
              </div>
            </div>
            
            {job.error && (
              <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">
                Error: {job.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const TemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">📝 Query Templates</h3>
        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
          ➕ New Template
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {queryTemplates.map(template => (
          <div key={template.id} className="bg-gray-800/50 p-4 rounded border border-gray-600">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-white font-medium">{template.name}</div>
                <div className="text-sm text-gray-400">{template.description}</div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                template.category === 'customer' ? 'bg-blue-900/20 text-blue-400' :
                template.category === 'pov' ? 'bg-green-900/20 text-green-400' :
                template.category === 'trr' ? 'bg-yellow-900/20 text-yellow-400' :
                'bg-purple-900/20 text-purple-400'
              }`}>
                {template.category}
              </div>
            </div>
            
            <div className="mb-3">
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-400 hover:text-white">View SQL</summary>
                <pre className="mt-2 p-2 bg-black rounded text-xs text-green-400 overflow-x-auto">
                  {template.sql}
                </pre>
              </details>
            </div>
            
            {template.parameters.length > 0 && (
              <div className="mb-3">
                <div className="text-sm text-gray-400 mb-1">Parameters:</div>
                <div className="space-y-1">
                  {template.parameters.map((param, idx) => (
                    <div key={idx} className="text-xs text-gray-500">
                      <span className="font-mono text-cyan-400">@{param.name}</span> ({param.type}): {param.description}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                Run Query
              </button>
              <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">📊 Analytics Dashboard</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-4 rounded border border-green-500/30">
          <div className="text-green-400 font-bold mb-2">📈 Export Activity</div>
          <div className="text-2xl font-mono text-white mb-1">{exportJobs.length}</div>
          <div className="text-sm text-gray-400">Total exports</div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded border border-blue-500/30">
          <div className="text-blue-400 font-bold mb-2">💾 Data Volume</div>
          <div className="text-2xl font-mono text-white mb-1">47.2 GB</div>
          <div className="text-sm text-gray-400">Total processed</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-4 rounded border border-purple-500/30">
          <div className="text-purple-400 font-bold mb-2">🎯 Success Rate</div>
          <div className="text-2xl font-mono text-white mb-1">98.5%</div>
          <div className="text-sm text-gray-400">Export success</div>
        </div>
      </div>
      
      <div className="bg-gray-800/30 p-6 rounded border border-gray-600">
        <h4 className="text-lg font-bold text-white mb-4">Recent Export Trends</h4>
        <div className="h-64 bg-gray-900/50 rounded border border-gray-700 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <div className="text-2xl mb-2">📊</div>
            <div>Chart visualization would appear here</div>
            <div className="text-sm mt-2">Export volume, success rates, and format preferences over time</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">BigQuery Data Explorer</h1>
          <p className="text-gray-400">Comprehensive data export and analytics platform for DC workflows</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-800/30 p-1 rounded-lg">
          {[
            { id: 'explorer', label: '🔍 Export Builder', desc: 'Configure and run exports' },
            { id: 'exports', label: '📦 Export History', desc: 'View and manage exports' },
            { id: 'templates', label: '📝 Query Templates', desc: 'Pre-built analytics queries' },
            { id: 'analytics', label: '📊 Analytics', desc: 'Usage and performance metrics' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-4 py-3 text-center transition-colors rounded-lg ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="font-medium">{tab.label}</div>
              <div className="text-xs opacity-75">{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'explorer' && <ExplorerTab />}
          {activeTab === 'exports' && <ExportsTab />}
          {activeTab === 'templates' && <TemplatesTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </div>
      </div>
    </div>
  );
};