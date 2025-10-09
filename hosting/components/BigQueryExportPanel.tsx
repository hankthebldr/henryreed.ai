'use client';
// legacy-orange: replaced by green per Cortex rebrand (2025-10-08)


import React, { useState, useEffect } from 'react';
import { bigQueryService, ExportResult, trackGUIAction } from '../lib/bigquery-service';
import { useAppState } from '../contexts/AppStateContext';

interface ExportConfig {
  includeQueuedData: boolean;
  collectFreshData: boolean;
  includePII: boolean;
  timeRange: 'last24h' | 'last7d' | 'last30d' | 'all';
  exportType: 'analytics' | 'commands' | 'povs' | 'trrs' | 'scenarios' | 'all';
}

export default function BigQueryExportPanel() {
  const { actions } = useAppState();
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    includeQueuedData: true,
    collectFreshData: true,
    includePII: false,
    timeRange: 'last24h',
    exportType: 'all'
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportResult, setLastExportResult] = useState<ExportResult | null>(null);
  const [queueStatus, setQueueStatus] = useState<{ queueSize: number; oldestItem?: string; newestItem?: string }>({ queueSize: 0, oldestItem: '', newestItem: '' });

  useEffect(() => {
    // Update queue status periodically
    const updateQueueStatus = () => {
      const status = bigQueryService.getQueueStatus();
      setQueueStatus(status);
    };

    updateQueueStatus();
    const interval = setInterval(updateQueueStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleExport = async (quickExport: boolean = false) => {
    if (isExporting) return;

    setIsExporting(true);
    actions.setLoading('bigquery_export', true);
    
    try {
      trackGUIAction('bigquery_export_initiated', 'BigQueryExportPanel', {
        config: exportConfig,
        quickExport,
        queueSize: queueStatus.queueSize
      });

      // Configure time range
      const timeRangeConfig = (() => {
        const now = new Date();
        const ranges = {
          'last24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
          'last7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          'last30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          'all': new Date(0) // Beginning of time
        };
        return {
          start: ranges[exportConfig.timeRange].toISOString(),
          end: now.toISOString()
        };
      })();

      const result = await bigQueryService.exportToBigQuery({
        includeQueuedData: quickExport ? true : exportConfig.includeQueuedData,
        collectFreshData: quickExport ? true : exportConfig.collectFreshData,
        customConfig: {
          includePII: quickExport ? false : exportConfig.includePII,
          timeRange: timeRangeConfig
        }
      });

      setLastExportResult(result);
      
      if (result.success) {
        actions.notify('success', `Successfully exported ${result.recordsExported} records to BigQuery`);
        trackGUIAction('bigquery_export_success', 'BigQueryExportPanel', {
          recordsExported: result.recordsExported,
          jobId: result.bigqueryJobId
        });
      } else {
        actions.notify('error', `Export failed: ${result.error}`);
        trackGUIAction('bigquery_export_failure', 'BigQueryExportPanel', {
          error: result.error
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      actions.notify('error', `Export error: ${errorMessage}`);
      setLastExportResult({
        success: false,
        recordsExported: 0,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsExporting(false);
      actions.setLoading('bigquery_export', false);
    }
  };

  const handleClearQueue = () => {
    bigQueryService.clearQueue();
    setQueueStatus({ queueSize: 0, oldestItem: '', newestItem: '' });
    actions.notify('info', 'Export queue cleared');
    trackGUIAction('bigquery_queue_cleared', 'BigQueryExportPanel', {});
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getExportTypeDescription = (type: string) => {
    const descriptions = {
      'all': 'Export all data types (POVs, TRRs, scenarios, commands, GUI interactions)',
      'analytics': 'Export analytics and performance data only',
      'commands': 'Export terminal command execution data only',
      'povs': 'Export POV-related data only',
      'trrs': 'Export TRR management data only',
      'scenarios': 'Export scenario deployment data only'
    };
    return descriptions[type as keyof typeof descriptions] || 'Unknown export type';
  };

  return (
    <div className="cortex-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-cortex-accent">📊 BigQuery Data Export</h3>
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isExporting ? 'bg-cortex-warning animate-pulse' : 'bg-cortex-success'}`}></div>
          <span className="text-cortex-text-secondary">
            {isExporting ? 'Exporting...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Quick Export Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => handleExport(true)}
          disabled={isExporting}
          className="p-4 btn-cortex-primary disabled:bg-cortex-bg-quaternary disabled:cursor-not-allowed disabled:text-cortex-text-disabled text-sm font-medium flex items-center justify-center space-x-2"
        >
          <span className="text-lg">⚡</span>
          <div className="text-left">
            <div>Quick Export</div>
            <div className="text-xs opacity-80">Current session + queue</div>
          </div>
        </button>

        <button
          onClick={() => handleExport(false)}
          disabled={isExporting}
          className="p-4 btn-cortex-success disabled:bg-cortex-bg-quaternary disabled:cursor-not-allowed disabled:text-cortex-text-disabled text-sm font-medium flex items-center justify-center space-x-2"
        >
          <span className="text-lg">📋</span>
          <div className="text-left">
            <div>Custom Export</div>
            <div className="text-xs opacity-80">Use config below</div>
          </div>
        </button>

        <button
          onClick={handleClearQueue}
          disabled={isExporting}
          className="p-4 bg-cortex-error hover:bg-cortex-error-dark disabled:bg-cortex-bg-quaternary disabled:cursor-not-allowed text-black rounded-lg transition-colors text-sm font-medium flex items-center justify-center space-x-2"
        >
          <span className="text-lg">🗱️</span>
          <div className="text-left">
            <div>Clear Queue</div>
            <div className="text-xs opacity-80">{queueStatus.queueSize} items</div>
          </div>
        </button>
      </div>

      {/* Export Configuration */}
      <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-gray-600 mb-6">
        <h4 className="text-lg font-bold text-gray-300 mb-4">Export Configuration</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Data Sources */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Data Sources</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportConfig.includeQueuedData}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, includeQueuedData: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-800 text-cyan-400"
                />
                <span className="text-sm text-gray-300">Include queued data ({queueStatus.queueSize} items)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportConfig.collectFreshData}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, collectFreshData: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-800 text-cyan-400"
                />
                <span className="text-sm text-gray-300">Collect fresh analytics data</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportConfig.includePII}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, includePII: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-800 text-cyan-400"
                />
                <span className="text-sm text-gray-300">Include PII data (⚠️ Use with caution)</span>
              </label>
            </div>
          </div>

          {/* Time Range & Type */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time Range</label>
              <select
                value={exportConfig.timeRange}
                onChange={(e) => setExportConfig(prev => ({ ...prev, timeRange: e.target.value as any }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-300"
              >
                <option value="last24h">Last 24 hours</option>
                <option value="last7d">Last 7 days</option>
                <option value="last30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Export Type</label>
              <select
                value={exportConfig.exportType}
                onChange={(e) => setExportConfig(prev => ({ ...prev, exportType: e.target.value as any }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-300"
              >
                <option value="all">All data types</option>
                <option value="analytics">Analytics only</option>
                <option value="commands">Commands only</option>
                <option value="povs">POVs only</option>
                <option value="trrs">TRRs only</option>
                <option value="scenarios">Scenarios only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Export Type Description */}
        <div className="mt-3 p-3 bg-gray-700 bg-opacity-50 rounded text-sm text-cortex-text-secondary">
          {getExportTypeDescription(exportConfig.exportType)}
        </div>
      </div>

      {/* Queue Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 bg-opacity-30 p-3 rounded border border-gray-600">
          <div className="text-sm text-cortex-text-secondary">Queue Size</div>
          <div className="text-xl font-mono text-cyan-400">{queueStatus.queueSize}</div>
          <div className="text-xs text-cortex-text-muted">Pending export items</div>
        </div>

        <div className="bg-gray-800 bg-opacity-30 p-3 rounded border border-gray-600">
          <div className="text-sm text-cortex-text-secondary">Oldest Item</div>
          <div className="text-sm font-mono text-gray-300">
            {queueStatus.oldestItem ? formatTimestamp(queueStatus.oldestItem) : 'None'}
          </div>
        </div>

        <div className="bg-gray-800 bg-opacity-30 p-3 rounded border border-gray-600">
          <div className="text-sm text-cortex-text-secondary">Newest Item</div>
          <div className="text-sm font-mono text-gray-300">
            {queueStatus.newestItem ? formatTimestamp(queueStatus.newestItem) : 'None'}
          </div>
        </div>
      </div>

      {/* Last Export Result */}
      {lastExportResult && (
        <div className={`p-4 rounded border mb-4 ${
          lastExportResult.success 
            ? 'bg-green-900 bg-opacity-20 border-green-500 border-opacity-30' 
            : 'bg-red-900 bg-opacity-20 border-red-500 border-opacity-30'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h5 className={`font-bold ${lastExportResult.success ? 'text-green-400' : 'text-red-400'}`}>
              {lastExportResult.success ? '✅ Export Successful' : '❌ Export Failed'}
            </h5>
            <div className="text-xs text-cortex-text-secondary">
              {formatTimestamp(lastExportResult.timestamp)}
            </div>
          </div>
          
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-cortex-text-secondary">Records Exported:</span>
              <span className="ml-2 font-mono text-white">{lastExportResult.recordsExported}</span>
            </div>
            
            {lastExportResult.bigqueryJobId && (
              <div>
                <span className="text-cortex-text-secondary">BigQuery Job ID:</span>
                <span className="ml-2 font-mono text-cyan-400">{lastExportResult.bigqueryJobId}</span>
              </div>
            )}
            
            {lastExportResult.error && (
              <div>
                <span className="text-cortex-text-secondary">Error:</span>
                <span className="ml-2 text-red-300">{lastExportResult.error}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BigQuery Configuration Info */}
      <div className="bg-gray-800 bg-opacity-30 p-4 rounded border border-gray-600">
        <h5 className="font-bold text-gray-300 mb-3">BigQuery Configuration</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-cortex-text-secondary">Dataset:</span>
            <span className="ml-2 font-mono text-gray-300">{bigQueryService.getConfig().dataset}</span>
          </div>
          <div>
            <span className="text-cortex-text-secondary">Table:</span>
            <span className="ml-2 font-mono text-gray-300">{bigQueryService.getConfig().table}</span>
          </div>
          <div>
            <span className="text-cortex-text-secondary">Project ID:</span>
            <span className="ml-2 font-mono text-gray-300">{bigQueryService.getConfig().projectId}</span>
          </div>
          <div>
            <span className="text-cortex-text-secondary">Function URL:</span>
            <span className="ml-2 font-mono text-gray-300 truncate">
              {bigQueryService.getConfig().cloudFunctionUrl.substring(0, 40)}...
            </span>
          </div>
        </div>
        
        <div className="mt-3 p-2 bg-yellow-900 bg-opacity-20 rounded border border-yellow-500 border-opacity-30 text-xs text-yellow-400">
          ⚠️ Ensure your GCP Cloud Function is deployed and accessible before exporting data.
        </div>
      </div>
    </div>
  );
}