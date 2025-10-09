import React from 'react';
import { CommandConfig } from './commands';
import { xsiamApiService, XSIAMCredentials } from './xsiam-api-service';

export const xsiamCommands: CommandConfig[] = [
  {
    name: 'xsiam-connect',
    description: 'Configure and connect to XSIAM tenant API',
    usage: 'xsiam-connect [--api-address <url>] [--api-id <id>] [--api-key <key>] [--tenant-name <name>] [--region <region>]',
    aliases: ['xsiam-config', 'xsiam-setup'],
    category: 'integration',
    tags: ['xsiam', 'api', 'integration', 'security', 'tenant'],
    examples: [
      'xsiam-connect --api-address https://api-tenant.xdr.paloaltonetworks.com --api-id your-api-id --api-key your-api-key',
      'xsiam-connect --tenant-name "Production Tenant" --region us'
    ],
    handler: async (args) => {
      const startTime = Date.now();
      
      try {
        // Parse command line arguments
        const getArg = (flag: string): string | undefined => {
          const index = args.indexOf(flag);
          return index >= 0 && index + 1 < args.length ? args[index + 1] : undefined;
        };

        const apiAddress = getArg('--api-address');
        const apiId = getArg('--api-id');
        const apiKey = getArg('--api-key');
        const tenantName = getArg('--tenant-name');
        const region = getArg('--region');

        // Show help if no arguments provided
        if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-4 text-xl">🛡️ XSIAM Tenant Connection</div>
              
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-yellow-400 font-bold mb-2">Usage:</div>
                  <div className="font-mono bg-gray-800 p-2 rounded">xsiam-connect [options]</div>
                </div>
                
                <div>
                  <div className="text-yellow-400 font-bold mb-2">Required Options:</div>
                  <div className="space-y-1 ml-4">
                    <div><span className="font-mono text-green-400">--api-address</span> - XSIAM API endpoint URL</div>
                    <div><span className="font-mono text-green-400">--api-id</span> - API authentication ID</div>
                    <div><span className="font-mono text-green-400">--api-key</span> - API authentication key</div>
                  </div>
                </div>

                <div>
                  <div className="text-yellow-400 font-bold mb-2">Optional:</div>
                  <div className="space-y-1 ml-4">
                    <div><span className="font-mono text-blue-400">--tenant-name</span> - Friendly name for tenant</div>
                    <div><span className="font-mono text-blue-400">--region</span> - Tenant region (us|eu|apac|uk|ca|au)</div>
                  </div>
                </div>

                <div>
                  <div className="text-yellow-400 font-bold mb-2">Examples:</div>
                  <div className="space-y-1 ml-4 font-mono text-gray-300 text-xs">
                    <div>xsiam-connect --api-address https://api-tenant.xdr.paloaltonetworks.com \\</div>
                    <div className="ml-4">--api-id 12345 --api-key abcdef123456</div>
                    <div className="mt-2">xsiam-connect --tenant-name "Prod Tenant" --region us</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-900/20 rounded border border-yellow-600">
                <div className="text-yellow-400 font-bold">💡 Current Status</div>
                <div className="text-sm text-gray-300 mt-1">
                  {xsiamApiService.isConfigured() 
                    ? `Connected to ${xsiamApiService.getCredentials()?.tenantName || 'XSIAM tenant'}`
                    : 'No XSIAM tenant configured. Use this command to set up your connection.'
                  }
                </div>
              </div>
            </div>
          );
        }

        // Show current status
        if (args.includes('--status')) {
          const credentials = xsiamApiService.getCredentials();
          
          if (!credentials) {
            return (
              <div className="text-yellow-300">
                <div className="font-bold mb-2">⚠️ No XSIAM Connection</div>
                <div className="text-sm">No XSIAM tenant is currently configured.</div>
                <div className="text-xs text-cortex-text-secondary mt-2">
                  Use <span className="font-mono">xsiam-connect --help</span> for setup instructions.
                </div>
              </div>
            );
          }

          return (
            <div className="text-cyan-300">
              <div className="font-bold mb-3 text-xl">🛡️ XSIAM Connection Status</div>
              <div className="bg-gray-800 p-4 rounded border border-cyan-600 space-y-2 text-sm">
                <div><span className="text-yellow-400">Tenant:</span> <span className="text-white">{credentials.tenantName || 'Unnamed'}</span></div>
                <div><span className="text-yellow-400">API Address:</span> <span className="font-mono text-gray-300 text-xs break-all">{credentials.apiAddress}</span></div>
                <div><span className="text-yellow-400">API ID:</span> <span className="font-mono text-gray-300">{credentials.apiId}</span></div>
                <div><span className="text-yellow-400">Region:</span> <span className="text-white">{credentials.region || 'Not specified'}</span></div>
                <div><span className="text-yellow-400">Status:</span> <span className={`font-mono ${credentials.isValid ? 'text-green-400' : 'text-red-400'}`}>
                  {credentials.isValid ? 'Connected ✓' : 'Connection needs verification'}
                </span></div>
                {credentials.lastTested && (
                  <div><span className="text-yellow-400">Last Tested:</span> <span className="text-gray-300">{new Date(credentials.lastTested).toLocaleString()}</span></div>
                )}
              </div>
            </div>
          );
        }

        // Test connection
        if (args.includes('--test')) {
          if (!xsiamApiService.isConfigured()) {
            return (
              <div className="text-red-300">
                <div className="font-bold mb-2">❌ No Configuration</div>
                <div className="text-sm">Please configure XSIAM connection first.</div>
              </div>
            );
          }

          try {
            const isValid = await xsiamApiService.testConnection();
            
            return (
              <div className={`${isValid ? 'text-green-300' : 'text-red-300'}`}>
                <div className="font-bold mb-2">{isValid ? '✅ Connection Successful' : '❌ Connection Failed'}</div>
                <div className="text-sm">
                  {isValid 
                    ? 'XSIAM tenant API connection is working correctly.'
                    : 'Failed to connect to XSIAM tenant. Please check your credentials.'
                  }
                </div>
                <div className="mt-2 text-xs text-cortex-text-secondary">
                  Tested at: {new Date().toLocaleString()}
                </div>
              </div>
            );
          } catch (error) {
            return (
              <div className="text-red-300">
                <div className="font-bold mb-2">❌ Connection Test Failed</div>
                <div className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</div>
              </div>
            );
          }
        }

        // Clear/disconnect
        if (args.includes('--disconnect') || args.includes('--clear')) {
          xsiamApiService.clearCredentials();
          return (
            <div className="text-green-300">
              <div className="font-bold mb-2">🔌 Disconnected</div>
              <div className="text-sm">XSIAM tenant credentials have been cleared.</div>
            </div>
          );
        }

        // Configure new connection
        if (apiAddress || apiId || apiKey || tenantName || region) {
          // Get existing credentials or create new ones
          const existingCredentials = xsiamApiService.getCredentials() || {
            apiAddress: '',
            apiId: '',
            apiKey: ''
          };

          // Update credentials with provided values
          const newCredentials: XSIAMCredentials = {
            ...existingCredentials,
            ...(apiAddress && { apiAddress }),
            ...(apiId && { apiId }),
            ...(apiKey && { apiKey }),
            ...(tenantName && { tenantName }),
            ...(region && { region })
          };

          // Validate that required fields are present
          if (!newCredentials.apiAddress || !newCredentials.apiId || !newCredentials.apiKey) {
            return (
              <div className="text-red-300">
                <div className="font-bold mb-2">❌ Missing Required Fields</div>
                <div className="text-sm space-y-1">
                  <div>Required fields: --api-address, --api-id, --api-key</div>
                  <div className="mt-2">Current values:</div>
                  <div className="ml-4 text-xs text-cortex-text-secondary">
                    <div>API Address: {newCredentials.apiAddress || 'NOT SET'}</div>
                    <div>API ID: {newCredentials.apiId || 'NOT SET'}</div>
                    <div>API Key: {newCredentials.apiKey ? '***SET***' : 'NOT SET'}</div>
                  </div>
                </div>
              </div>
            );
          }

          try {
            // Store and test the connection
            await xsiamApiService.storeCredentials(newCredentials);
            const executionTime = Date.now() - startTime;
            
            const isValid = await xsiamApiService.testConnection();
            
            return (
              <div className={`${isValid ? 'text-green-300' : 'text-yellow-300'}`}>
                <div className="font-bold mb-3 text-xl">
                  {isValid ? '✅ XSIAM Connection Configured' : '⚠️ Configuration Saved (Connection Issue)'}
                </div>
                
                <div className="bg-gray-800 p-4 rounded border border-gray-600 space-y-2 text-sm">
                  <div><span className="text-yellow-400">Tenant:</span> <span className="text-white">{newCredentials.tenantName || 'Unnamed'}</span></div>
                  <div><span className="text-yellow-400">API Address:</span> <span className="font-mono text-gray-300 text-xs break-all">{newCredentials.apiAddress}</span></div>
                  <div><span className="text-yellow-400">Region:</span> <span className="text-white">{newCredentials.region || 'Not specified'}</span></div>
                  <div><span className="text-yellow-400">Configuration Time:</span> <span className="text-gray-300">{executionTime}ms</span></div>
                  <div><span className="text-yellow-400">Connection Status:</span> <span className={`font-mono ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                    {isValid ? 'Verified ✓' : 'Needs attention ⚠️'}
                  </span></div>
                </div>
                
                {!isValid && (
                  <div className="mt-3 text-xs text-cortex-text-secondary">
                    💡 Connection could not be verified. Check your credentials and network connectivity.
                  </div>
                )}
                
                <div className="mt-3 text-xs text-cortex-text-secondary">
                  Next steps: Use <span className="font-mono text-cyan-400">xsiam-health</span> or <span className="font-mono text-cyan-400">xsiam-analytics</span> to query your tenant.
                </div>
              </div>
            );
            
          } catch (error) {
            return (
              <div className="text-red-300">
                <div className="font-bold mb-2">❌ Configuration Failed</div>
                <div className="text-sm">{error instanceof Error ? error.message : 'Unknown error occurred'}</div>
              </div>
            );
          }
        }

        // If no specific action, show current status
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-2">🛡️ XSIAM Integration</div>
            <div className="text-sm">
              {xsiamApiService.isConfigured() 
                ? `Currently connected to ${xsiamApiService.getCredentials()?.tenantName || 'XSIAM tenant'}.`
                : 'No XSIAM tenant configured.'
              }
            </div>
            <div className="text-xs text-cortex-text-secondary mt-2">
              Use <span className="font-mono">xsiam-connect --help</span> for configuration options.
            </div>
          </div>
        );

      } catch (error) {
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
    name: 'xsiam-health',
    description: 'Get XSIAM tenant health status and system metrics',
    usage: 'xsiam-health [--json] [--refresh]',
    aliases: ['xsiam-status'],
    category: 'integration',
    tags: ['xsiam', 'health', 'monitoring', 'metrics'],
    examples: [
      'xsiam-health',
      'xsiam-health --json',
      'xsiam-health --refresh'
    ],
    handler: async (args) => {
      const startTime = Date.now();
      
      try {
        if (!xsiamApiService.isConfigured()) {
          return (
            <div className="text-yellow-300">
              <div className="font-bold mb-2">⚠️ Not Connected</div>
              <div className="text-sm">Please configure XSIAM connection first.</div>
              <div className="text-xs text-cortex-text-secondary mt-2">
                Use <span className="font-mono text-cyan-400">xsiam-connect</span> to set up your connection.
              </div>
            </div>
          );
        }

        const wantJson = args.includes('--json');
        
        // Show loading state
        const healthData = await xsiamApiService.getHealthData();
        const executionTime = Date.now() - startTime;

        if (!healthData) {
          return (
            <div className="text-red-300">
              <div className="font-bold mb-2">❌ Failed to retrieve health data</div>
              <div className="text-sm">Could not connect to XSIAM tenant or retrieve health information.</div>
            </div>
          );
        }

        if (wantJson) {
          return (
            <pre className="text-xs bg-black p-3 rounded border border-gray-700 whitespace-pre-wrap">
              {JSON.stringify({ ...healthData, executionTime }, null, 2)}
            </pre>
          );
        }

        const getHealthStatusColor = (status: string) => {
          switch (status) {
            case 'healthy': return 'text-green-400';
            case 'degraded': return 'text-yellow-400';
            case 'unhealthy': return 'text-red-400';
            default: return 'text-cortex-text-secondary';
          }
        };

        return (
          <div className="text-cyan-300">
            <div className="font-bold mb-4 text-xl">💓 XSIAM Tenant Health</div>
            
            {/* Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded border border-gray-600 bg-gray-800">
                <div className={`text-lg font-bold ${getHealthStatusColor(healthData.status)}`}>
                  {healthData.status.toUpperCase()}
                </div>
                <div className="text-xs text-cortex-text-secondary">System Status</div>
              </div>
              <div className="p-3 rounded border border-gray-600 bg-gray-800">
                <div className="text-lg font-bold text-white">{healthData.uptime}%</div>
                <div className="text-xs text-cortex-text-secondary">Uptime</div>
              </div>
              <div className="p-3 rounded border border-gray-600 bg-gray-800">
                <div className="text-lg font-bold text-blue-400">{healthData.metrics.activeUsers}</div>
                <div className="text-xs text-cortex-text-secondary">Active Users</div>
              </div>
              <div className="p-3 rounded border border-gray-600 bg-gray-800">
                <div className="text-lg font-bold text-purple-400">{healthData.metrics.storageUsed}%</div>
                <div className="text-xs text-cortex-text-secondary">Storage Used</div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="mb-4">
              <div className="text-yellow-400 font-bold mb-2">📊 Key Metrics</div>
              <div className="bg-gray-800 p-4 rounded border border-gray-600 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Incidents Processed:</span>
                  <span className="text-white font-mono">{healthData.metrics.incidentsProcessed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Alerts Generated:</span>
                  <span className="text-white font-mono">{healthData.metrics.alertsGenerated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Data Ingestion Rate:</span>
                  <span className="text-white font-mono">{healthData.metrics.dataIngestionRate} GB/h</span>
                </div>
              </div>
            </div>

            {/* System Components */}
            <div className="mb-4">
              <div className="text-yellow-400 font-bold mb-2">🔧 System Components</div>
              <div className="space-y-2">
                {healthData.components.map((component, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="text-white text-sm">{component.name}</div>
                      {component.responseTime && (
                        <div className="text-xs text-cortex-text-secondary">({component.responseTime}ms)</div>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      component.status === 'operational' ? 'bg-green-900 text-green-300' :
                      component.status === 'degraded' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {component.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-cortex-text-secondary">
              Last updated: {new Date(healthData.lastUpdate).toLocaleString()} • Query time: {executionTime}ms
            </div>
          </div>
        );

      } catch (error) {
        return (
          <div className="text-red-300">
            <div className="font-bold mb-2">❌ Health Check Failed</div>
            <div className="text-sm">{error instanceof Error ? error.message : 'Unknown error occurred'}</div>
          </div>
        );
      }
    }
  },

  {
    name: 'xsiam-analytics',
    description: 'Get XSIAM tenant analytics and security metrics',
    usage: 'xsiam-analytics [--time-range 24h|7d|30d] [--json] [--summary]',
    aliases: ['xsiam-stats'],
    category: 'integration',
    tags: ['xsiam', 'analytics', 'security', 'metrics', 'threats'],
    examples: [
      'xsiam-analytics',
      'xsiam-analytics --time-range 30d',
      'xsiam-analytics --json --time-range 7d',
      'xsiam-analytics --summary'
    ],
    handler: async (args) => {
      const startTime = Date.now();
      
      try {
        if (!xsiamApiService.isConfigured()) {
          return (
            <div className="text-yellow-300">
              <div className="font-bold mb-2">⚠️ Not Connected</div>
              <div className="text-sm">Please configure XSIAM connection first.</div>
              <div className="text-xs text-cortex-text-secondary mt-2">
                Use <span className="font-mono text-cyan-400">xsiam-connect</span> to set up your connection.
              </div>
            </div>
          );
        }

        const timeRangeIndex = args.indexOf('--time-range');
        const timeRange = timeRangeIndex >= 0 ? args[timeRangeIndex + 1] || '7d' : '7d';
        const wantJson = args.includes('--json');
        const wantSummary = args.includes('--summary');
        
        const analyticsData = await xsiamApiService.getAnalyticsData(timeRange);
        const executionTime = Date.now() - startTime;

        if (!analyticsData) {
          return (
            <div className="text-red-300">
              <div className="font-bold mb-2">❌ Failed to retrieve analytics data</div>
              <div className="text-sm">Could not connect to XSIAM tenant or retrieve analytics information.</div>
            </div>
          );
        }

        if (wantJson) {
          return (
            <pre className="text-xs bg-black p-3 rounded border border-gray-700 whitespace-pre-wrap">
              {JSON.stringify({ ...analyticsData, executionTime }, null, 2)}
            </pre>
          );
        }

        if (wantSummary) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-3 text-xl">📊 Analytics Summary ({timeRange})</div>
              <div className="bg-gray-800 p-4 rounded border border-gray-600 space-y-2 text-sm">
                <div><span className="text-yellow-400">Total Incidents:</span> <span className="text-white font-mono">{analyticsData.summary.totalIncidents}</span></div>
                <div><span className="text-yellow-400">Resolved:</span> <span className="text-green-400 font-mono">{analyticsData.summary.resolvedIncidents}</span></div>
                <div><span className="text-yellow-400">Avg Resolution Time:</span> <span className="text-white font-mono">{analyticsData.summary.averageResolutionTime}h</span></div>
                <div><span className="text-yellow-400">False Positive Rate:</span> <span className="text-purple-400 font-mono">{analyticsData.summary.falsePositiveRate}%</span></div>
                <div><span className="text-yellow-400">Critical Alerts:</span> <span className="text-red-400 font-mono">{analyticsData.summary.criticalAlerts}</span></div>
                <div><span className="text-yellow-400">Query Time:</span> <span className="text-gray-300 font-mono">{executionTime}ms</span></div>
              </div>
            </div>
          );
        }

        const getSeverityColor = (severity: string) => {
          switch (severity) {
            case 'critical': return 'text-red-400';
            case 'high': return 'text-orange-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
            default: return 'text-cortex-text-secondary';
          }
        };

        return (
          <div className="text-cyan-300">
            <div className="font-bold mb-4 text-xl">📊 XSIAM Analytics ({timeRange})</div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
              <div className="p-3 rounded border border-gray-600 bg-gray-800">
                <div className="text-lg font-bold text-blue-400">{analyticsData.summary.totalIncidents}</div>
                <div className="text-xs text-cortex-text-secondary">Total Incidents</div>
              </div>
              <div className="p-3 rounded border border-gray-600 bg-gray-800">
                <div className="text-lg font-bold text-green-400">{analyticsData.summary.resolvedIncidents}</div>
                <div className="text-xs text-cortex-text-secondary">Resolved</div>
              </div>
              <div className="p-3 rounded border border-gray-600 bg-gray-800">
                <div className="text-lg font-bold text-yellow-400">{analyticsData.summary.averageResolutionTime}h</div>
                <div className="text-xs text-cortex-text-secondary">Avg Resolution</div>
              </div>
              <div className="p-3 rounded border border-gray-600 bg-gray-800">
                <div className="text-lg font-bold text-purple-400">{analyticsData.summary.falsePositiveRate}%</div>
                <div className="text-xs text-cortex-text-secondary">False Positive</div>
              </div>
              <div className="p-3 rounded border border-gray-600 bg-gray-800">
                <div className="text-lg font-bold text-red-400">{analyticsData.summary.criticalAlerts}</div>
                <div className="text-xs text-cortex-text-secondary">Critical Alerts</div>
              </div>
            </div>

            {/* Top Threats */}
            <div className="mb-4">
              <div className="text-yellow-400 font-bold mb-2">🎯 Top Threats</div>
              <div className="space-y-1">
                {analyticsData.topThreats.slice(0, 5).map((threat, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="text-white">{threat.name}</div>
                      <div className="text-xs text-cortex-text-secondary">({threat.count}x)</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      threat.severity === 'critical' ? 'bg-red-900 text-red-300' :
                      threat.severity === 'high' ? 'bg-orange-900 text-orange-300' :
                      threat.severity === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-green-900 text-green-300'
                    }`}>
                      {threat.severity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MITRE Coverage */}
            <div className="mb-4">
              <div className="text-yellow-400 font-bold mb-2">🛡️ MITRE Detection Coverage</div>
              <div className="space-y-2">
                {analyticsData.detectionCoverage.slice(0, 4).map((detection, index) => (
                  <div key={index} className="p-2 bg-gray-800 rounded text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-white font-medium">{detection.technique}</div>
                      <div className="text-blue-400 font-bold">{detection.coverage}%</div>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${detection.coverage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-cortex-text-secondary">
              Time range: {timeRange} • Query time: {executionTime}ms • Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        );

      } catch (error) {
        return (
          <div className="text-red-300">
            <div className="font-bold mb-2">❌ Analytics Query Failed</div>
            <div className="text-sm">{error instanceof Error ? error.message : 'Unknown error occurred'}</div>
          </div>
        );
      }
    }
  },

  {
    name: 'xsiam-query',
    description: 'Execute custom XQL queries on XSIAM tenant',
    usage: 'xsiam-query <query> [--time-range 24h|7d|30d] [--json] [--limit <number>]',
    aliases: ['xql', 'xsiam-xql'],
    category: 'integration',
    tags: ['xsiam', 'query', 'xql', 'search', 'data'],
    examples: [
      'xsiam-query "dataset = xdr_data | filter action_local_ip != null | comp count() by action_local_ip | limit 10"',
      'xsiam-query "dataset = auth_data | filter event_type = \\"login\\" | sort _time desc" --limit 50',
      'xsiam-query "dataset = process_data | filter process_name contains \\"powershell\\"" --time-range 24h --json'
    ],
    handler: async (args) => {
      const startTime = Date.now();
      
      try {
        if (!xsiamApiService.isConfigured()) {
          return (
            <div className="text-yellow-300">
              <div className="font-bold mb-2">⚠️ Not Connected</div>
              <div className="text-sm">Please configure XSIAM connection first.</div>
              <div className="text-xs text-cortex-text-secondary mt-2">
                Use <span className="font-mono text-cyan-400">xsiam-connect</span> to set up your connection.
              </div>
            </div>
          );
        }

        if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-4 text-xl">🔍 XSIAM XQL Query</div>
              
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-yellow-400 font-bold mb-2">Usage:</div>
                  <div className="font-mono bg-gray-800 p-2 rounded">xsiam-query "&lt;xql-query&gt;" [options]</div>
                </div>
                
                <div>
                  <div className="text-yellow-400 font-bold mb-2">Options:</div>
                  <div className="space-y-1 ml-4">
                    <div><span className="font-mono text-green-400">--time-range</span> - Time range: 24h|7d|30d (default: 24h)</div>
                    <div><span className="font-mono text-green-400">--json</span> - Output results in JSON format</div>
                    <div><span className="font-mono text-green-400">--limit</span> - Limit number of results</div>
                  </div>
                </div>

                <div>
                  <div className="text-yellow-400 font-bold mb-2">Example Queries:</div>
                  <div className="space-y-1 ml-4 text-xs font-mono text-gray-300">
                    <div>dataset = xdr_data | filter action_local_ip != null | comp count() by action_local_ip</div>
                    <div>dataset = process_data | filter process_name contains "powershell" | sort _time desc</div>
                    <div>dataset = auth_data | filter event_type = "login_failed" | comp count() by user_name</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-900/20 rounded border border-blue-600">
                <div className="text-blue-400 font-bold">💡 XQL Tips</div>
                <div className="text-sm text-gray-300 mt-1 space-y-1">
                  <div>• Use quotes around string values: event_type = "login"</div>
                  <div>• Pipe operations: dataset = data | filter | comp | sort</div>
                  <div>• Always specify a dataset to start your query</div>
                </div>
              </div>
            </div>
          );
        }

        // Extract query (everything before first -- option)
        const firstOptionIndex = args.findIndex(arg => arg.startsWith('--'));
        const queryArgs = firstOptionIndex >= 0 ? args.slice(0, firstOptionIndex) : args;
        const optionArgs = firstOptionIndex >= 0 ? args.slice(firstOptionIndex) : [];
        
        const query = queryArgs.join(' ');
        
        if (!query.trim()) {
          return (
            <div className="text-red-300">
              <div className="font-bold mb-2">❌ No Query Provided</div>
              <div className="text-sm">Please provide an XQL query to execute.</div>
            </div>
          );
        }

        // Parse options
        const timeRangeIndex = optionArgs.indexOf('--time-range');
        const timeRange = timeRangeIndex >= 0 ? optionArgs[timeRangeIndex + 1] || '24h' : '24h';
        const limitIndex = optionArgs.indexOf('--limit');
        const limit = limitIndex >= 0 ? parseInt(optionArgs[limitIndex + 1] || '100') : 100;
        const wantJson = optionArgs.includes('--json');

        // Execute query
        const result = await xsiamApiService.executeQuery(query, timeRange);
        const executionTime = Date.now() - startTime;

        if (wantJson) {
          return (
            <pre className="text-xs bg-black p-3 rounded border border-gray-700 whitespace-pre-wrap">
              {JSON.stringify({ query, timeRange, result, executionTime }, null, 2)}
            </pre>
          );
        }

        return (
          <div className="text-cyan-300">
            <div className="font-bold mb-3 text-xl">🔍 XQL Query Result</div>
            
            <div className="mb-4 bg-gray-800 p-3 rounded border border-gray-600">
              <div className="text-yellow-400 font-bold mb-2">Query:</div>
              <div className="font-mono text-xs text-gray-300 break-all">{query}</div>
              <div className="mt-2 text-xs text-cortex-text-muted">
                Time range: {timeRange} • Execution time: {executionTime}ms
              </div>
            </div>

            <div className="mb-4">
              <div className="text-yellow-400 font-bold mb-2">Results:</div>
              <div className="bg-gray-900 border border-gray-600 rounded p-4 max-h-96 overflow-auto">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>

            <div className="text-xs text-cortex-text-secondary">
              💡 Use <span className="font-mono text-cyan-400">--json</span> flag for structured output
            </div>
          </div>
        );

      } catch (error) {
        return (
          <div className="text-red-300">
            <div className="font-bold mb-2">❌ Query Execution Failed</div>
            <div className="text-sm">{error instanceof Error ? error.message : 'Unknown error occurred'}</div>
            <div className="text-xs text-cortex-text-secondary mt-2">
              Check your query syntax and XSIAM connection status.
            </div>
          </div>
        );
      }
    }
  }
];

export default xsiamCommands;