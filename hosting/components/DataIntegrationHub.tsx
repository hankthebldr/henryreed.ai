'use client';

import React, { useState } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { behavioralAnalyticsService } from '../lib/behavioral-analytics-service';
import { cn } from '../lib/utils';

export const DataIntegrationHub: React.FC = () => {
  const { actions } = useAppState();
  const [activeExportType, setActiveExportType] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const handleExport = async (exportType: string, format: string) => {
    setActiveExportType(exportType);
    setExportProgress(0);

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setActiveExportType(null);
          actions.notify('success', `${exportType} export completed successfully`);
          behavioralAnalyticsService.trackExport(exportType, 100, format);
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        actions.notify('info', `Importing ${file.name}...`);
        behavioralAnalyticsService.trackUpload('data-import', file.size, true);
      }
    };
    input.click();
  };

  return (
    <section
      id="data-integration-hub"
      aria-labelledby="data-integration-hub-heading"
      className="p-8 space-y-8 scroll-mt-28"
    >
      {/* Header */}
      <div className="glass-card p-8">
        <h1
          id="data-integration-hub-heading"
          className="text-3xl font-bold text-cortex-text-primary mb-2"
        >
          📊 Data Integration Hub
        </h1>
        <p className="text-cortex-text-muted">Export, analyze, and integrate your demo and POV data</p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="glass-card p-6">
          <h3 className="text-2xl font-bold text-cortex-text-primary mb-4">Integration Overview</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="cortex-card-elevated p-4">
              <div className="text-cortex-primary font-bold mb-2 flex items-center space-x-2">
                <span>📤</span>
                <span>Data Exports</span>
              </div>
              <div className="text-3xl font-mono text-cortex-text-primary mb-1">24</div>
              <div className="text-sm text-cortex-text-muted">This month</div>
              <button
                onClick={() => actions.notify('info', 'Opening export history...')}
                className="mt-3 w-full btn-modern button-hover-lift cortex-interactive px-4 py-2 bg-cortex-primary/20 hover:bg-cortex-primary/30 text-cortex-primary rounded transition-colors"
              >
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
              <button
                onClick={() => actions.notify('info', 'Opening integrations manager...')}
                className="mt-3 w-full btn-modern button-hover-lift cortex-interactive px-4 py-2 bg-cortex-info/20 hover:bg-cortex-info/30 text-cortex-info rounded transition-colors"
              >
                Manage
              </button>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-cortex-text-primary mb-4">📤 Data Export</h3>
          <p className="text-sm text-cortex-text-muted mb-6">
            Export your data to various formats for analysis, reporting, or integration with external systems
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'pov-data',
                icon: '🎯',
                title: 'POV Data',
                description: 'Export all POV projects and metrics',
                formats: ['CSV', 'JSON', 'Excel']
              },
              {
                id: 'trr-data',
                icon: '📋',
                title: 'TRR Data',
                description: 'Export TRR records and requirements',
                formats: ['CSV', 'JSON', 'PDF']
              },
              {
                id: 'demo-analytics',
                icon: '🎬',
                title: 'Demo Analytics',
                description: 'Export demo execution metrics',
                formats: ['CSV', 'JSON', 'Excel']
              },
              {
                id: 'customer-data',
                icon: '🤝',
                title: 'Customer Data',
                description: 'Export customer engagement data',
                formats: ['CSV', 'JSON', 'Excel']
              },
              {
                id: 'activity-logs',
                icon: '📝',
                title: 'Activity Logs',
                description: 'Export user activity and audit logs',
                formats: ['CSV', 'JSON']
              },
              {
                id: 'bigquery-export',
                icon: '📊',
                title: 'BigQuery Export',
                description: 'Direct export to BigQuery dataset',
                formats: ['BigQuery']
              }
            ].map((exportOption) => (
              <div key={exportOption.id} className="cortex-card p-4">
                <div className="text-3xl mb-3">{exportOption.icon}</div>
                <h4 className="font-bold text-cortex-text-primary mb-1">{exportOption.title}</h4>
                <p className="text-xs text-cortex-text-muted mb-4">{exportOption.description}</p>

                {activeExportType === exportOption.id ? (
                  <div className="space-y-2">
                    <div className="w-full bg-cortex-bg-secondary rounded-full h-2">
                      <div
                        className="bg-cortex-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${exportProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-cortex-text-muted text-center">{exportProgress}%</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {exportOption.formats.map(format => (
                      <button
                        key={format}
                        onClick={() => handleExport(exportOption.title, format)}
                        className="text-xs px-2 py-1 bg-cortex-primary/20 hover:bg-cortex-primary/30 text-cortex-primary rounded transition-colors"
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Import Options */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-cortex-text-primary mb-4">📥 Data Import</h3>
          <p className="text-sm text-cortex-text-muted mb-6">
            Import data from external sources to populate your POV and demo environments
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: '📄',
                title: 'CSV Import',
                description: 'Import customer data, TRR records, or bulk updates from CSV files',
                action: handleImport
              },
              {
                icon: '📊',
                title: 'JSON Import',
                description: 'Import structured data from JSON files or API responses',
                action: handleImport
              },
              {
                icon: '🔗',
                title: 'API Integration',
                description: 'Connect to external APIs for real-time data synchronization',
                action: () => actions.notify('info', 'Opening API integration settings...')
              },
              {
                icon: '☁️',
                title: 'Cloud Storage',
                description: 'Import from Google Drive, Dropbox, or other cloud storage',
                action: () => actions.notify('info', 'Opening cloud storage connectors...')
              }
            ].map((importOption, index) => (
              <button
                key={index}
                onClick={importOption.action}
                className="cortex-card p-4 text-left cortex-interactive button-hover-lift group"
              >
                <div className="text-3xl mb-3">{importOption.icon}</div>
                <h4 className="font-bold text-cortex-text-primary mb-1 group-hover:text-cortex-accent transition-colors">
                  {importOption.title}
                </h4>
                <p className="text-xs text-cortex-text-muted">{importOption.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-cortex-text-primary mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                icon: '🔄',
                label: 'Sync with CRM',
                description: 'Synchronize customer data with Salesforce',
                action: () => {
                  actions.notify('info', 'Starting CRM sync...');
                  behavioralAnalyticsService.trackFeatureUsage('data-integration', 'crm-sync');
                }
              },
              {
                icon: '📊',
                label: 'Generate Analytics Report',
                description: 'Create executive summary report',
                action: () => {
                  actions.notify('info', 'Generating report...');
                  behavioralAnalyticsService.trackFeatureUsage('data-integration', 'generate-report');
                }
              },
              {
                icon: '🗄️',
                label: 'Backup All Data',
                description: 'Create complete data backup',
                action: () => {
                  actions.notify('info', 'Starting backup process...');
                  behavioralAnalyticsService.trackFeatureUsage('data-integration', 'backup');
                }
              },
              {
                icon: '🔍',
                label: 'Data Quality Check',
                description: 'Validate data integrity and completeness',
                action: () => {
                  actions.notify('info', 'Running data quality checks...');
                  behavioralAnalyticsService.trackFeatureUsage('data-integration', 'quality-check');
                }
              }
            ].map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center space-x-3 p-4 rounded-lg border border-cortex-border hover:border-cortex-primary/50 hover:bg-cortex-bg-hover transition-all cortex-interactive text-left"
              >
                <span className="text-2xl">{action.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-cortex-text-primary">{action.label}</div>
                  <div className="text-xs text-cortex-text-muted">{action.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Integration Status */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-cortex-text-primary mb-4">🔗 Active Integrations</h3>
          <div className="space-y-3">
            {[
              { name: 'BigQuery', status: 'connected', lastSync: '5 minutes ago', icon: '📊' },
              { name: 'Salesforce', status: 'connected', lastSync: '1 hour ago', icon: '☁️' },
              { name: 'Google Drive', status: 'connected', lastSync: '3 hours ago', icon: '📁' },
              { name: 'Slack', status: 'connected', lastSync: '10 minutes ago', icon: '💬' },
              { name: 'JIRA', status: 'configured', lastSync: 'Never', icon: '📋' }
            ].map((integration, index) => (
              <div key={index} className="cortex-card p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <div className="font-medium text-cortex-text-primary">{integration.name}</div>
                    <div className="text-xs text-cortex-text-muted">Last sync: {integration.lastSync}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    integration.status === 'connected'
                      ? 'bg-status-success/20 text-status-success'
                      : 'bg-status-warning/20 text-status-warning'
                  )}>
                    {integration.status}
                  </span>
                  <button
                    onClick={() => actions.notify('info', `Opening ${integration.name} settings...`)}
                    className="text-cortex-primary hover:text-cortex-accent transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataIntegrationHub;
