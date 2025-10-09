import React from 'react';
import { CommandConfig } from './commands';
import { bigQueryService, trackCommand } from './bigquery-service';

export const bigQueryCommands: CommandConfig[] = [
  {
    name: 'bq-export',
    description: 'Export data to Google BigQuery',
    usage: 'bq-export [--quick] [--no-queue] [--no-fresh] [--include-pii] [--time-range 24h|7d|30d|all] [--type all|commands|povs|trrs|scenarios]',
    aliases: ['bigquery', 'export-bq', 'bqx'],
    category: 'data',
    tags: ['bigquery', 'export', 'analytics', 'gcp', 'data'],
    examples: [
      'bq-export --quick',
      'bq-export --time-range 7d --type povs',
      'bq-export --no-queue --include-pii'
    ],
    handler: async (args) => {
      const startTime = Date.now();
      
      try {
        const isQuick = args.includes('--quick');
        const includeQueuedData = !args.includes('--no-queue');
        const collectFreshData = !args.includes('--no-fresh');
        const includePII = args.includes('--include-pii');
        
        // Parse time range
        const timeRangeIndex = args.indexOf('--time-range');
        const timeRangeValue = timeRangeIndex >= 0 ? args[timeRangeIndex + 1] : 'last24h';
        const timeRangeMap: Record<string, string> = {
          '24h': 'last24h',
          '7d': 'last7d', 
          '30d': 'last30d',
          'all': 'all'
        };
        const timeRange = timeRangeMap[timeRangeValue] || 'last24h';
        
        // Parse export type
        const typeIndex = args.indexOf('--type');
        const exportType = typeIndex >= 0 ? args[typeIndex + 1] : 'all';
        
        // Show configuration
        if (args.includes('--config')) {
          const config = bigQueryService.getConfig();
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-3 text-xl">📊 BigQuery Export Configuration</div>
              <div className="space-y-2 text-sm">
                <div><span className="text-yellow-400">Dataset:</span> <span className="font-mono">{config.dataset}</span></div>
                <div><span className="text-yellow-400">Table:</span> <span className="font-mono">{config.table}</span></div>
                <div><span className="text-yellow-400">Project ID:</span> <span className="font-mono">{config.projectId}</span></div>
                <div><span className="text-yellow-400">Cloud Function:</span> <span className="font-mono text-xs">{config.cloudFunctionUrl}</span></div>
                <div><span className="text-yellow-400">Include PII:</span> <span className="font-mono">{config.includePII ? 'Yes' : 'No'}</span></div>
              </div>
            </div>
          );
        }
        
        // Show queue status
        if (args.includes('--status') || args.includes('--queue')) {
          const status = bigQueryService.getQueueStatus();
          return (
            <div className="text-cyan-300">
              <div className="font-bold mb-3 text-xl">📋 Export Queue Status</div>
              <div className="space-y-2 text-sm">
                <div><span className="text-yellow-400">Queue Size:</span> <span className="font-mono text-white">{status.queueSize}</span> items</div>
                <div><span className="text-yellow-400">Oldest Item:</span> <span className="font-mono text-gray-300">{status.oldestItem || 'None'}</span></div>
                <div><span className="text-yellow-400">Newest Item:</span> <span className="font-mono text-gray-300">{status.newestItem || 'None'}</span></div>
              </div>
            </div>
          );
        }
        
        // Clear queue
        if (args.includes('--clear-queue')) {
          bigQueryService.clearQueue();
          trackCommand('bq-export', args, 'queue_cleared', Date.now() - startTime);
          return (
            <div className="text-green-400">
              <div className="font-bold mb-2">🗑️ Queue Cleared</div>
              <div className="text-sm">Export queue has been cleared successfully.</div>
            </div>
          );
        }
        
        // Show help
        if (args.includes('--help') || args.includes('-h')) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-4 text-xl">📊 BigQuery Export Help</div>
              
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-yellow-400 font-bold mb-2">Usage:</div>
                  <div className="font-mono bg-gray-800 p-2 rounded">bq-export [options]</div>
                </div>
                
                <div>
                  <div className="text-yellow-400 font-bold mb-2">Options:</div>
                  <div className="space-y-1 ml-4">
                    <div><span className="font-mono text-green-400">--quick</span> - Quick export with default settings</div>
                    <div><span className="font-mono text-green-400">--no-queue</span> - Skip queued data</div>
                    <div><span className="font-mono text-green-400">--no-fresh</span> - Skip fresh data collection</div>
                    <div><span className="font-mono text-green-400">--include-pii</span> - Include personally identifiable information</div>
                    <div><span className="font-mono text-green-400">--time-range</span> - Time range: 24h|7d|30d|all</div>
                    <div><span className="font-mono text-green-400">--type</span> - Data type: all|commands|povs|trrs|scenarios</div>
                    <div><span className="font-mono text-green-400">--config</span> - Show current configuration</div>
                    <div><span className="font-mono text-green-400">--status</span> - Show queue status</div>
                    <div><span className="font-mono text-green-400">--clear-queue</span> - Clear export queue</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-yellow-400 font-bold mb-2">Examples:</div>
                  <div className="space-y-1 ml-4 font-mono text-gray-300">
                    <div>bq-export --quick</div>
                    <div>bq-export --time-range 7d --type povs</div>
                    <div>bq-export --no-queue --include-pii</div>
                    <div>bq-export --config</div>
                    <div>bq-export --status</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        // Configure time range
        const now = new Date();
        const timeRangeConfig = (() => {
          const ranges: Record<string, Date> = {
            'last24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
            'last7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            'last30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            'all': new Date(0)
          };
          return {
            start: ranges[timeRange].toISOString(),
            end: now.toISOString()
          };
        })();
        
        // Show export preview
        if (args.includes('--preview') || args.includes('--dry-run')) {
          const status = bigQueryService.getQueueStatus();
          return (
            <div className="text-yellow-300">
              <div className="font-bold mb-3 text-xl">👁️ Export Preview</div>
              <div className="bg-gray-800 p-4 rounded border border-yellow-600 space-y-2 text-sm">
                <div><span className="text-yellow-400">Export Type:</span> {exportType}</div>
                <div><span className="text-yellow-400">Time Range:</span> {timeRange}</div>
                <div><span className="text-yellow-400">Include Queue:</span> {includeQueuedData ? 'Yes' : 'No'} ({status.queueSize} items)</div>
                <div><span className="text-yellow-400">Collect Fresh:</span> {collectFreshData ? 'Yes' : 'No'}</div>
                <div><span className="text-yellow-400">Include PII:</span> {includePII ? 'Yes ⚠️' : 'No'}</div>
                <div className="pt-2 border-t border-yellow-600">
                  <div className="text-yellow-400">Estimated Records:</div>
                  <div className="ml-4">
                    <div>• Queued data: ~{status.queueSize}</div>
                    <div>• Fresh analytics: ~50-200</div>
                    <div>• Total estimated: ~{status.queueSize + 100}</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-cortex-text-secondary">
                Run without --preview to execute the actual export.
              </div>
            </div>
          );
        }
        
        // Perform the actual export
        return new Promise((resolve) => {
          // Show initial status
          const initialStatus = (
            <div className="text-cyan-300">
              <div className="font-bold mb-3 text-xl">📊 Exporting to BigQuery...</div>
              <div className="space-y-2 text-sm">
                <div>🔄 Preparing data...</div>
                <div className="text-cortex-text-secondary">Configuration: {isQuick ? 'Quick Export' : 'Custom Export'}</div>
                <div className="text-cortex-text-secondary">Time Range: {timeRange}</div>
                <div className="text-cortex-text-secondary">Export Type: {exportType}</div>
              </div>
            </div>
          );
          
          // Immediately show the loading state
          setTimeout(async () => {
            try {
              const result = await bigQueryService.exportToBigQuery({
                includeQueuedData: isQuick ? true : includeQueuedData,
                collectFreshData: isQuick ? true : collectFreshData,
                customConfig: {
                  includePII: isQuick ? false : includePII,
                  timeRange: timeRangeConfig
                }
              });
              
              const executionTime = Date.now() - startTime;
              trackCommand('bq-export', args, result.success ? 'success' : 'failure', executionTime);
              
              const finalResult = (
                <div className={`${result.success ? 'text-green-300' : 'text-red-300'}`}>
                  <div className="font-bold mb-3 text-xl">
                    {result.success ? '✅ Export Complete' : '❌ Export Failed'}
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded border border-gray-600 space-y-2 text-sm">
                    <div><span className="text-yellow-400">Records Exported:</span> <span className="font-mono text-white">{result.recordsExported}</span></div>
                    <div><span className="text-yellow-400">Timestamp:</span> <span className="font-mono text-gray-300">{new Date(result.timestamp).toLocaleString()}</span></div>
                    <div><span className="text-yellow-400">Execution Time:</span> <span className="font-mono text-gray-300">{executionTime}ms</span></div>
                    
                    {result.bigqueryJobId && (
                      <div><span className="text-yellow-400">BigQuery Job ID:</span> <span className="font-mono text-cyan-400">{result.bigqueryJobId}</span></div>
                    )}
                    
                    {result.error && (
                      <div className="pt-2 border-t border-red-600">
                        <div className="text-red-400">Error Details:</div>
                        <div className="text-red-300 mt-1">{result.error}</div>
                      </div>
                    )}
                  </div>
                  
                  {result.success && (
                    <div className="mt-3 text-xs text-cortex-text-secondary">
                      💡 Data is now available in BigQuery dataset: <span className="font-mono text-cyan-400">{bigQueryService.getConfig().dataset}</span>
                    </div>
                  )}
                </div>
              );
              
              resolve(finalResult);
            } catch (error) {
              const executionTime = Date.now() - startTime;
              trackCommand('bq-export', args, 'error', executionTime);
              
              const errorResult = (
                <div className="text-red-300">
                  <div className="font-bold mb-3 text-xl">❌ Export Error</div>
                  <div className="bg-red-900 bg-opacity-20 p-4 rounded border border-red-600 text-sm">
                    <div className="text-red-400">Error:</div>
                    <div className="mt-1">{error instanceof Error ? error.message : 'Unknown error occurred'}</div>
                  </div>
                  <div className="mt-3 text-xs text-cortex-text-secondary">
                    Check your BigQuery configuration and cloud function deployment.
                  </div>
                </div>
              );
              
              resolve(errorResult);
            }
          }, 100);
          
          // Return initial loading state immediately
          resolve(initialStatus);
        });
        
      } catch (error) {
        const executionTime = Date.now() - startTime;
        trackCommand('bq-export', args, 'error', executionTime);
        
        return (
          <div className="text-red-300">
            <div className="font-bold mb-2">❌ Command Error</div>
            <div className="text-sm">{error instanceof Error ? error.message : 'Unknown error occurred'}</div>
          </div>
        );
      }
    }
  },
  
  {
    name: 'bq-track',
    description: 'Manually track an event for BigQuery export',
    usage: 'bq-track <event-type> <component> [--data "json-data"]',
    aliases: ['track'],
    category: 'data',
    tags: ['bigquery', 'tracking', 'analytics', 'events'],
    examples: [
      'bq-track gui_interaction dashboard_click',
      'bq-track pov_action create --data "{\\"pov_id\\": \\"POV-001\\"}"'
    ],
    handler: (args) => {
      if (args.length < 2) {
        return (
          <div className="text-yellow-300">
            <div className="font-bold mb-2">Usage:</div>
            <div className="font-mono text-sm">bq-track &lt;event-type&gt; &lt;component&gt; [--data "json-data"]</div>
            <div className="mt-2 text-xs text-cortex-text-secondary">
              Event types: gui_interaction, command_execution, pov_action, trr_update, scenario_deployment
            </div>
          </div>
        );
      }
      
      const eventType = args[0];
      const component = args[1];
      const dataIndex = args.indexOf('--data');
      let eventData = {};
      
      if (dataIndex >= 0 && args[dataIndex + 1]) {
        try {
          eventData = JSON.parse(args[dataIndex + 1]);
        } catch (error) {
          return (
            <div className="text-red-300">
              <div className="font-bold mb-2">❌ Invalid JSON Data</div>
              <div className="text-sm">Could not parse the provided JSON data.</div>
            </div>
          );
        }
      }
      
      try {
        // Track the event based on type
        switch (eventType) {
          case 'gui_interaction':
            trackCommand('bq-track', args, 'gui_interaction_tracked', 0);
            bigQueryService.trackGUIInteraction(component, 'manual_track', eventData);
            break;
          case 'pov_action':
            trackCommand('bq-track', args, 'pov_action_tracked', 0);
            bigQueryService.trackPOVAction(component, (eventData as any).pov_id || 'manual', eventData);
            break;
          default:
            // Generic tracking
            trackCommand('bq-track', args, 'manual_event_tracked', 0);
            bigQueryService.trackGUIInteraction(component, eventType, eventData);
        }
        
        const status = bigQueryService.getQueueStatus();
        
        return (
          <div className="text-green-300">
            <div className="font-bold mb-3">✅ Event Tracked</div>
            <div className="bg-gray-800 p-3 rounded border border-gray-600 space-y-1 text-sm">
              <div><span className="text-yellow-400">Event Type:</span> {eventType}</div>
              <div><span className="text-yellow-400">Component:</span> {component}</div>
              <div><span className="text-yellow-400">Data:</span> <span className="font-mono text-gray-300">{JSON.stringify(eventData)}</span></div>
              <div><span className="text-yellow-400">Queue Size:</span> {status.queueSize} items</div>
            </div>
            <div className="mt-2 text-xs text-cortex-text-secondary">
              Event added to export queue. Use <span className="font-mono">bq-export</span> to export to BigQuery.
            </div>
          </div>
        );
        
      } catch (error) {
        return (
          <div className="text-red-300">
            <div className="font-bold mb-2">❌ Tracking Error</div>
            <div className="text-sm">{error instanceof Error ? error.message : 'Unknown error occurred'}</div>
          </div>
        );
      }
    }
  },

  {
    name: 'bq-config',
    description: 'Configure BigQuery export settings',
    usage: 'bq-config [--set key=value] [--get key] [--reset] [--show]',
    aliases: ['bigquery-config'],
    category: 'data',
    tags: ['bigquery', 'configuration', 'settings'],
    examples: [
      'bq-config --show',
      'bq-config --set dataset=my_analytics',
      'bq-config --set includePII=true',
      'bq-config --reset'
    ],
    handler: (args) => {
      const config = bigQueryService.getConfig();
      
      if (args.includes('--show') || args.length === 0) {
        return (
          <div className="text-cyan-300">
            <div className="font-bold mb-4 text-xl">⚙️ BigQuery Configuration</div>
            <div className="bg-gray-800 p-4 rounded border border-gray-600 space-y-2 text-sm">
              <div><span className="text-yellow-400">Dataset:</span> <span className="font-mono text-white">{config.dataset}</span></div>
              <div><span className="text-yellow-400">Table:</span> <span className="font-mono text-white">{config.table}</span></div>
              <div><span className="text-yellow-400">Project ID:</span> <span className="font-mono text-white">{config.projectId}</span></div>
              <div><span className="text-yellow-400">Include PII:</span> <span className="font-mono text-white">{config.includePII ? 'Yes ⚠️' : 'No'}</span></div>
              <div><span className="text-yellow-400">Cloud Function:</span></div>
              <div className="font-mono text-xs text-gray-300 ml-4 break-all">{config.cloudFunctionUrl}</div>
              {config.timeRange && (
                <>
                  <div><span className="text-yellow-400">Default Time Range:</span></div>
                  <div className="ml-4 text-xs">
                    <div>Start: <span className="font-mono text-gray-300">{config.timeRange.start}</span></div>
                    <div>End: <span className="font-mono text-gray-300">{config.timeRange.end}</span></div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      }
      
      // Set configuration
      const setIndex = args.findIndex(arg => arg === '--set');
      if (setIndex >= 0 && args[setIndex + 1]) {
        const setValue = args[setIndex + 1];
        const [key, value] = setValue.split('=');
        
        if (!key || value === undefined) {
          return (
            <div className="text-red-300">
              <div className="font-bold mb-2">❌ Invalid Format</div>
              <div className="text-sm">Use format: --set key=value</div>
            </div>
          );
        }
        
        try {
          const newConfig: any = {};
          
          // Parse value based on key
          if (key === 'includePII') {
            newConfig[key] = value.toLowerCase() === 'true';
          } else {
            newConfig[key] = value;
          }
          
          bigQueryService.updateConfig(newConfig);
          
          return (
            <div className="text-green-300">
              <div className="font-bold mb-2">✅ Configuration Updated</div>
              <div className="text-sm">
                <span className="text-yellow-400">{key}:</span> {value}
              </div>
            </div>
          );
        } catch (error) {
          return (
            <div className="text-red-300">
              <div className="font-bold mb-2">❌ Configuration Error</div>
              <div className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</div>
            </div>
          );
        }
      }
      
      // Get configuration value
      const getIndex = args.findIndex(arg => arg === '--get');
      if (getIndex >= 0 && args[getIndex + 1]) {
        const key = args[getIndex + 1];
        const value = (config as any)[key];
        
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-2">Configuration Value</div>
            <div className="text-sm">
              <span className="text-yellow-400">{key}:</span> <span className="font-mono text-white">{JSON.stringify(value)}</span>
            </div>
          </div>
        );
      }
      
      // Reset configuration
      if (args.includes('--reset')) {
        bigQueryService.updateConfig({
          dataset: 'cortex_dc_analytics',
          table: 'user_interactions',
          projectId: 'cortex-dc-project',
          includePII: false
        });
        
        return (
          <div className="text-green-300">
            <div className="font-bold mb-2">🔄 Configuration Reset</div>
            <div className="text-sm">All settings have been reset to defaults.</div>
          </div>
        );
      }
      
      return (
        <div className="text-yellow-300">
          <div className="font-bold mb-2">BigQuery Configuration Help</div>
          <div className="text-sm space-y-1">
            <div><span className="font-mono text-green-400">--show</span> - Show current configuration</div>
            <div><span className="font-mono text-green-400">--set key=value</span> - Set configuration value</div>
            <div><span className="font-mono text-green-400">--get key</span> - Get specific configuration value</div>
            <div><span className="font-mono text-green-400">--reset</span> - Reset to default configuration</div>
          </div>
        </div>
      );
    }
  }
];

export default bigQueryCommands;