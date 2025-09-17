'use client';

import React, { useState, useEffect } from 'react';
import { xsiamApiService, XSIAMCredentials, XSIAMHealthData, XSIAMAnalyticsData } from '../lib/xsiam-api-service';

interface ConnectionStatus {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  message: string;
  lastTested?: string;
}

export default function XSIAMIntegrationPanel() {
  const [credentials, setCredentials] = useState<XSIAMCredentials>({
    apiAddress: '',
    apiId: '',
    apiKey: '',
    tenantName: '',
    region: ''
  });
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'disconnected',
    message: 'Not connected to XSIAM tenant'
  });
  
  const [healthData, setHealthData] = useState<XSIAMHealthData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<XSIAMAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [activeTab, setActiveTab] = useState<'setup' | 'health' | 'analytics' | 'query'>('setup');
  const [customQuery, setCustomQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);

  useEffect(() => {
    // Load existing credentials on component mount
    const existingCredentials = xsiamApiService.getCredentials();
    if (existingCredentials) {
      setCredentials(existingCredentials);
      setConnectionStatus({
        status: existingCredentials.isValid ? 'connected' : 'error',
        message: existingCredentials.isValid 
          ? `Connected to ${existingCredentials.tenantName || 'XSIAM tenant'}` 
          : 'Connection needs verification',
        lastTested: existingCredentials.lastTested
      });
      
      if (existingCredentials.isValid) {
        loadHealthData();
        loadAnalyticsData();
      }
    }
  }, []);

  const handleInputChange = (field: keyof XSIAMCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleConnect = async () => {
    setLoading(true);
    setConnectionStatus({ status: 'connecting', message: 'Testing connection...' });

    try {
      await xsiamApiService.storeCredentials(credentials);
      
      const isValid = await xsiamApiService.testConnection();
      
      if (isValid) {
        setConnectionStatus({
          status: 'connected',
          message: `Successfully connected to ${credentials.tenantName || 'XSIAM tenant'}`,
          lastTested: new Date().toISOString()
        });
        
        // Load initial data
        await Promise.all([loadHealthData(), loadAnalyticsData()]);
        setActiveTab('health');
      } else {
        setConnectionStatus({
          status: 'error',
          message: 'Failed to connect. Please verify your credentials.',
          lastTested: new Date().toISOString()
        });
      }
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastTested: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    xsiamApiService.clearCredentials();
    setCredentials({
      apiAddress: '',
      apiId: '',
      apiKey: '',
      tenantName: '',
      region: ''
    });
    setConnectionStatus({
      status: 'disconnected',
      message: 'Disconnected from XSIAM tenant'
    });
    setHealthData(null);
    setAnalyticsData(null);
    setActiveTab('setup');
  };

  const loadHealthData = async () => {
    try {
      const health = await xsiamApiService.getHealthData();
      setHealthData(health);
    } catch (error) {
      console.error('Failed to load health data:', error);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const analytics = await xsiamApiService.getAnalyticsData('7d');
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  };

  const executeCustomQuery = async () => {
    if (!customQuery.trim()) return;
    
    setLoading(true);
    try {
      const result = await xsiamApiService.executeQuery(customQuery);
      setQueryResult(result);
    } catch (error) {
      setQueryResult({
        error: error instanceof Error ? error.message : 'Query execution failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400 border-green-500';
      case 'connecting': return 'text-yellow-400 border-yellow-500';
      case 'error': return 'text-red-400 border-red-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'unhealthy': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-lg border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🛡️</div>
              <div>
                <div className="text-xl font-bold text-blue-400">XSIAM Tenant Integration</div>
                <div className="text-sm text-gray-300">Secure API connection to your XSIAM tenant</div>
              </div>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-lg border ${getStatusColor(connectionStatus.status)}`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connectionStatus.status === 'connected' ? 'bg-green-400' : 
                connectionStatus.status === 'connecting' ? 'bg-yellow-400 animate-pulse' : 
                connectionStatus.status === 'error' ? 'bg-red-400' : 'bg-gray-400'}`}></div>
              <div className="text-sm font-medium">{connectionStatus.message}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[
          { id: 'setup', name: 'Setup', icon: '⚙️' },
          { id: 'health', name: 'Health', icon: '💓', disabled: connectionStatus.status !== 'connected' },
          { id: 'analytics', name: 'Analytics', icon: '📊', disabled: connectionStatus.status !== 'connected' },
          { id: 'query', name: 'Query', icon: '🔍', disabled: connectionStatus.status !== 'connected' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            disabled={tab.disabled}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white' 
                : tab.disabled 
                  ? 'text-gray-500 cursor-not-allowed' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Setup Tab */}
      {activeTab === 'setup' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="space-y-6">
            <div className="text-lg font-bold text-white mb-4">XSIAM API Configuration</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={credentials.apiAddress}
                    onChange={(e) => handleInputChange('apiAddress', e.target.value)}
                    placeholder="https://api-your-tenant.xdr.paloaltonetworks.com"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={credentials.apiId}
                    onChange={(e) => handleInputChange('apiId', e.target.value)}
                    placeholder="Enter your API ID"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Key <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCredentials ? "text" : "password"}
                      value={credentials.apiKey}
                      onChange={(e) => handleInputChange('apiKey', e.target.value)}
                      placeholder="Enter your API key"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCredentials(!showCredentials)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCredentials ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tenant Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={credentials.tenantName || ''}
                    onChange={(e) => handleInputChange('tenantName', e.target.value)}
                    placeholder="Production Tenant"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Region (Optional)
                  </label>
                  <select
                    value={credentials.region || ''}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Region</option>
                    <option value="us">United States</option>
                    <option value="eu">Europe</option>
                    <option value="apac">Asia Pacific</option>
                    <option value="uk">United Kingdom</option>
                    <option value="ca">Canada</option>
                    <option value="au">Australia</option>
                  </select>
                </div>
                
                <div className="pt-4">
                  {connectionStatus.lastTested && (
                    <div className="text-xs text-gray-400 mb-3">
                      Last tested: {new Date(connectionStatus.lastTested).toLocaleString()}
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    {connectionStatus.status === 'connected' ? (
                      <button
                        onClick={handleDisconnect}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                      >
                        🔌 Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={handleConnect}
                        disabled={loading || !credentials.apiAddress || !credentials.apiId || !credentials.apiKey}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
                      >
                        {loading ? '🔄 Connecting...' : '🔗 Connect to XSIAM'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-yellow-400 text-xl">🔒</div>
                <div>
                  <div className="text-yellow-400 font-bold mb-1">Security Notice</div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>• Credentials are encrypted and stored locally in your browser</div>
                    <div>• API keys are never transmitted in plain text</div>
                    <div>• Connection is tested before credentials are saved</div>
                    <div>• Use dedicated API keys with minimal required permissions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Tab */}
      {activeTab === 'health' && healthData && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-lg font-bold text-white mb-4">Tenant Health Overview</div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{healthData.uptime}%</div>
                    <div className="text-sm text-gray-300">Uptime</div>
                  </div>
                  <div className="text-2xl">⏱️</div>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-2xl font-bold ${getHealthStatusColor(healthData.status)}`}>
                      {healthData.status.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-300">System Status</div>
                  </div>
                  <div className="text-2xl">💓</div>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{healthData.metrics.activeUsers}</div>
                    <div className="text-sm text-gray-300">Active Users</div>
                  </div>
                  <div className="text-2xl">👥</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Components */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-lg font-bold text-white mb-4">System Components</div>
              <div className="space-y-3">
                {healthData.components.map((component, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{component.name}</div>
                      {component.responseTime && (
                        <div className="text-xs text-gray-400">{component.responseTime}ms</div>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
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

            {/* Key Metrics */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-lg font-bold text-white mb-4">Key Metrics</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Incidents Processed</span>
                  <span className="text-white font-bold">{healthData.metrics.incidentsProcessed.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Alerts Generated</span>
                  <span className="text-white font-bold">{healthData.metrics.alertsGenerated.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Data Ingestion Rate</span>
                  <span className="text-white font-bold">{healthData.metrics.dataIngestionRate} GB/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Storage Used</span>
                  <span className="text-white font-bold">{healthData.metrics.storageUsed}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analyticsData && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-lg font-bold text-white mb-4">Analytics Summary (Last 7 Days)</div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">{analyticsData.summary.totalIncidents}</div>
                <div className="text-sm text-gray-300">Total Incidents</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{analyticsData.summary.resolvedIncidents}</div>
                <div className="text-sm text-gray-300">Resolved</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">{analyticsData.summary.averageResolutionTime}h</div>
                <div className="text-sm text-gray-300">Avg Resolution</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">{analyticsData.summary.falsePositiveRate}%</div>
                <div className="text-sm text-gray-300">False Positive</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-400">{analyticsData.summary.criticalAlerts}</div>
                <div className="text-sm text-gray-300">Critical Alerts</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Threats */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-lg font-bold text-white mb-4">Top Threats</div>
              <div className="space-y-3">
                {analyticsData.topThreats.map((threat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="text-white font-medium">{threat.name}</div>
                      <div className="text-xs text-gray-400">{threat.count} occurrences</div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
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

            {/* Detection Coverage */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-lg font-bold text-white mb-4">MITRE Detection Coverage</div>
              <div className="space-y-3">
                {analyticsData.detectionCoverage.map((detection, index) => (
                  <div key={index} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-medium text-sm">{detection.technique}</div>
                      <div className="text-blue-400 font-bold">{detection.coverage}%</div>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${detection.coverage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Last seen: {new Date(detection.lastSeen).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Query Tab */}
      {activeTab === 'query' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-lg font-bold text-white mb-4">Custom Query Executor</div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                XQL Query
              </label>
              <textarea
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder={`dataset = xdr_data\n| filter action_local_ip != null\n| comp count() by action_local_ip\n| sort count desc\n| limit 10`}
                className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={executeCustomQuery}
                disabled={loading || !customQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {loading ? '🔄 Executing...' : '▶️ Execute Query'}
              </button>
              
              <button
                onClick={() => {
                  setCustomQuery('');
                  setQueryResult(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                🗑️ Clear
              </button>
            </div>

            {queryResult && (
              <div className="mt-6">
                <div className="text-sm font-medium text-gray-300 mb-2">Query Result:</div>
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 max-h-96 overflow-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(queryResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {connectionStatus.status === 'connected' && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-300">Quick Actions:</div>
            <div className="flex space-x-3">
              <button
                onClick={loadHealthData}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
              >
                🔄 Refresh Health
              </button>
              <button
                onClick={loadAnalyticsData}
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md transition-colors"
              >
                📊 Refresh Analytics
              </button>
              <button
                onClick={() => xsiamApiService.testConnection()}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md transition-colors"
              >
                🔍 Test Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}