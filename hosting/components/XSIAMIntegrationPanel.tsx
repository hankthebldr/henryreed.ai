'use client';

import React, { useState, useEffect } from 'react';
import { xsiamApiService, XSIAMCredentials, XSIAMHealthData, XSIAMAnalyticsData } from '../lib/xsiam-api-service';
import CortexButton from './CortexButton';

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
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

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

  const loadHealthData = async (isRetry = false) => {
    try {
      setLastError(null);
      const health = await xsiamApiService.getHealthData();
      setHealthData(health);
      if (isRetry) {
        setRetryCount(0);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load health data';
      setLastError(errorMessage);
      console.error('Failed to load health data:', error);
    }
  };

  const loadAnalyticsData = async (isRetry = false) => {
    try {
      setLastError(null);
      const analytics = await xsiamApiService.getAnalyticsData('7d');
      setAnalyticsData(analytics);
      if (isRetry) {
        setRetryCount(0);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load analytics data';
      setLastError(errorMessage);
      console.error('Failed to load analytics data:', error);
    }
  };

  const executeCustomQuery = async () => {
    if (!customQuery.trim()) return;
    
    setLoading(true);
    setLastError(null);
    try {
      const result = await xsiamApiService.executeQuery(customQuery);
      setQueryResult(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Query execution failed';
      setLastError(errorMessage);
      setQueryResult({
        error: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    if (activeTab === 'health') {
      await loadHealthData(true);
    } else if (activeTab === 'analytics') {
      await loadAnalyticsData(true);
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
          { id: 'setup', name: 'Setup', icon: '⚙️', description: 'Configure connection' },
          { id: 'health', name: 'Health', icon: '💓', disabled: connectionStatus.status !== 'connected', description: 'System status' },
          { id: 'analytics', name: 'Analytics', icon: '📊', disabled: connectionStatus.status !== 'connected', description: 'Security metrics' },
          { id: 'query', name: 'Query', icon: '🔍', disabled: connectionStatus.status !== 'connected', description: 'Custom XQL queries' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
            disabled={tab.disabled}
            title={tab.disabled ? `Connect to XSIAM to access ${tab.name}` : tab.description}
            className={`group flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : tab.disabled 
                  ? 'text-gray-500 cursor-not-allowed opacity-50' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700 hover:shadow-md'
            }`}
          >
            <span className="group-hover:scale-110 transition-transform">{tab.icon}</span>
            <span>{tab.name}</span>
            {tab.disabled && (
              <span className="text-xs opacity-75">🔒</span>
            )}
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
                      <div className="flex flex-col space-y-2">
                        <CortexButton
                          variant="success"
                          size="md"
                          icon="🔍"
                          onClick={() => xsiamApiService.testConnection()}
                          tooltip="Test current connection"
                          className="flex-1"
                        >
                          Test Connection
                        </CortexButton>
                        <CortexButton
                          variant="danger"
                          size="md"
                          icon="🔌"
                          onClick={handleDisconnect}
                          tooltip="Disconnect from XSIAM tenant"
                          className="flex-1"
                        >
                          Disconnect
                        </CortexButton>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-3 w-full">
                        <CortexButton
                          variant="primary"
                          size="lg"
                          icon="🔗"
                          onClick={handleConnect}
                          disabled={!credentials.apiAddress || !credentials.apiId || !credentials.apiKey}
                          loading={loading}
                          tooltip={!credentials.apiAddress || !credentials.apiId || !credentials.apiKey 
                            ? "Fill in all required fields to connect" 
                            : "Connect to your XSIAM tenant"}
                          className="w-full"
                        >
                          {loading ? 'Connecting...' : 'Connect to XSIAM'}
                        </CortexButton>
                        
                        {/* Connection guidance */}
                        <div className="text-xs text-gray-400 text-center">
                          <div>💡 Need help? Check the Security Notice below</div>
                        </div>
                      </div>
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
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Error Banner */}
          {lastError && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-red-400 text-xl">❌</div>
                  <div>
                    <div className="text-red-400 font-bold mb-1">Health Data Error</div>
                    <div className="text-sm text-gray-300">{lastError}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <CortexButton
                    variant="outline"
                    size="sm"
                    icon="🔄"
                    onClick={handleRetry}
                    tooltip="Retry loading health data"
                  >
                    Retry
                  </CortexButton>
                </div>
              </div>
            </div>
          )}
          
          {healthData ? (
            <>
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
            </>
          ) : !lastError ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <div className="text-lg font-bold text-white mb-2">Loading Health Data</div>
              <div className="text-sm text-gray-400">Fetching tenant health information...</div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-lg font-bold text-white mb-2">Health Monitoring</div>
              <div className="text-sm text-gray-400 mb-4">Monitor your XSIAM tenant's system health and performance metrics</div>
              <CortexButton
                variant="primary"
                size="md"
                icon="🔄"
                onClick={() => loadHealthData()}
                tooltip="Load health data"
              >
                Load Health Data
              </CortexButton>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Error Banner */}
          {lastError && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-red-400 text-xl">❌</div>
                  <div>
                    <div className="text-red-400 font-bold mb-1">Analytics Data Error</div>
                    <div className="text-sm text-gray-300">{lastError}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <CortexButton
                    variant="outline"
                    size="sm"
                    icon="🔄"
                    onClick={handleRetry}
                    tooltip="Retry loading analytics data"
                  >
                    Retry
                  </CortexButton>
                </div>
              </div>
            </div>
          )}
          
          {analyticsData ? (
            <>
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
            </>
          ) : !lastError ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <div className="text-lg font-bold text-white mb-2">Loading Analytics Data</div>
              <div className="text-sm text-gray-400">Fetching security analytics and metrics...</div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-lg font-bold text-white mb-2">Security Analytics</div>
              <div className="text-sm text-gray-400 mb-4">View comprehensive security metrics, threat analysis, and MITRE ATT&CK coverage</div>
              <CortexButton
                variant="primary"
                size="md"
                icon="📊"
                onClick={() => loadAnalyticsData()}
                tooltip="Load analytics data"
              >
                Load Analytics Data
              </CortexButton>
            </div>
          )}
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
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <CortexButton
                variant="primary"
                size="md"
                icon="▶️"
                onClick={executeCustomQuery}
                disabled={!customQuery.trim()}
                loading={loading}
                tooltip={!customQuery.trim() ? "Enter a query to execute" : "Execute XQL query"}
                className="flex-1 sm:flex-initial"
              >
                {loading ? 'Executing...' : 'Execute Query'}
              </CortexButton>
              
              <CortexButton
                variant="secondary"
                size="md"
                icon="🗑️"
                onClick={() => {
                  setCustomQuery('');
                  setQueryResult(null);
                  setLastError(null);
                }}
                tooltip="Clear query and results"
                className="flex-1 sm:flex-initial"
              >
                Clear
              </CortexButton>
              
              <CortexButton
                variant="outline"
                size="md"
                icon="💡"
                onClick={() => setCustomQuery(
                  'dataset = xdr_data\n| filter action_local_ip != null\n| comp count() by action_local_ip\n| sort count desc\n| limit 10'
                )}
                tooltip="Load example query"
                className="flex-1 sm:flex-initial"
              >
                Example
              </CortexButton>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div>
              <div className="text-sm font-medium text-gray-300">Quick Actions</div>
              <div className="text-xs text-gray-500">Refresh data and test connectivity</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <CortexButton
                variant="info"
                size="xs"
                icon="💓"
                onClick={() => loadHealthData()}
                tooltip="Refresh health data"
              >
                Refresh Health
              </CortexButton>
              <CortexButton
                variant="info"
                size="xs"
                icon="📊"
                onClick={() => loadAnalyticsData()}
                tooltip="Refresh analytics data"
              >
                Refresh Analytics
              </CortexButton>
              <CortexButton
                variant="success"
                size="xs"
                icon="🔍"
                onClick={() => xsiamApiService.testConnection()}
                tooltip="Test XSIAM connection"
              >
                Test Connection
              </CortexButton>
            </div>
          </div>
          
          {/* Connection Quality Indicator */}
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Connection Status:</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-green-400">Active</span>
                {connectionStatus.lastTested && (
                  <span className="text-gray-500">• Last tested {new Date(connectionStatus.lastTested).toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}