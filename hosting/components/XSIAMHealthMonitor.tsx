/**
 * XSIAM Health Monitor
 * Real-time XSIAM system health and performance monitoring with intelligent alerting
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { dcAPIClient, XSIAMHealthStatus } from '../lib/dc-api-client';
import { dcContextStore } from '../lib/dc-context-store';

interface HealthAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  component: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolvedAt?: string;
  details?: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  history: Array<{
    timestamp: string;
    value: number;
  }>;
}

interface TroubleshootingStep {
  id: string;
  title: string;
  description: string;
  category: 'diagnostic' | 'remediation' | 'escalation';
  severity: 'low' | 'medium' | 'high';
  estimatedTime: number; // minutes
  automated: boolean;
}

export const XSIAMHealthMonitor: React.FC = () => {
  const { state, actions } = useAppState();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'performance' | 'troubleshoot' | 'settings'>('dashboard');
  const [healthStatus, setHealthStatus] = useState<XSIAMHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  useEffect(() => {
    actions.updateBreadcrumbs([
      { label: 'Home', path: '/gui' },
      { label: 'XSIAM Health', path: '/gui/xsiam' },
    ]);
    
    // Initialize sample data if empty
    if (dcContextStore.getAllCustomerEngagements().length === 0) {
      dcContextStore.initializeSampleData();
    }
    
    loadHealthStatus();
    loadAlerts();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadHealthStatus();
      loadAlerts();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [actions, selectedCustomer]);

  const loadHealthStatus = async () => {
    try {
      const response = await dcAPIClient.getXSIAMHealth(selectedCustomer);
      if (response.success && response.data) {
        setHealthStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to load health status:', error);
    }
  };

  const loadAlerts = () => {
    // Mock alerts - in production, this would come from XSIAM APIs
    const mockAlerts: HealthAlert[] = [
      {
        id: 'alert_001',
        severity: 'warning',
        component: 'Correlation Engine',
        message: 'Memory usage approaching threshold (82%)',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        acknowledged: false,
        details: 'Correlation engine memory usage has been steadily increasing. Consider reviewing rule complexity and data volume.'
      },
      {
        id: 'alert_002',
        severity: 'info',
        component: 'Data Ingestion',
        message: 'New data source detected: AWS CloudTrail',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        acknowledged: true,
        details: 'A new AWS CloudTrail integration has been automatically configured and is processing events.'
      },
      {
        id: 'alert_003',
        severity: 'critical',
        component: 'API Gateway',
        message: 'Elevated error rates detected (12% over 5 minutes)',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        acknowledged: false,
        resolvedAt: new Date(Date.now() - 60000).toISOString(),
        details: 'API Gateway experienced elevated error rates due to temporary network issues. Auto-resolved after failover to backup gateway.'
      }
    ];
    setAlerts(mockAlerts);
  };

  const performanceMetrics: PerformanceMetric[] = [
    {
      name: 'Events Per Second',
      value: 12547,
      unit: 'EPS',
      threshold: 15000,
      status: 'healthy',
      trend: 'up',
      history: Array.from({ length: 12 }, (_, i) => ({
        timestamp: new Date(Date.now() - (11 - i) * 300000).toISOString(),
        value: 11000 + Math.random() * 3000
      }))
    },
    {
      name: 'Correlation Engine CPU',
      value: 67,
      unit: '%',
      threshold: 80,
      status: 'healthy',
      trend: 'stable',
      history: Array.from({ length: 12 }, (_, i) => ({
        timestamp: new Date(Date.now() - (11 - i) * 300000).toISOString(),
        value: 60 + Math.random() * 20
      }))
    },
    {
      name: 'Memory Usage',
      value: 82,
      unit: '%',
      threshold: 85,
      status: 'warning',
      trend: 'up',
      history: Array.from({ length: 12 }, (_, i) => ({
        timestamp: new Date(Date.now() - (11 - i) * 300000).toISOString(),
        value: 70 + i * 2 + Math.random() * 5
      }))
    },
    {
      name: 'API Response Time',
      value: 247,
      unit: 'ms',
      threshold: 500,
      status: 'healthy',
      trend: 'down',
      history: Array.from({ length: 12 }, (_, i) => ({
        timestamp: new Date(Date.now() - (11 - i) * 300000).toISOString(),
        value: 300 - i * 5 + Math.random() * 50
      }))
    }
  ];

  const troubleshootingSteps: TroubleshootingStep[] = [
    {
      id: 'ts_001',
      title: 'Check Data Ingestion Rate',
      description: 'Verify that data sources are sending events at expected rates',
      category: 'diagnostic',
      severity: 'low',
      estimatedTime: 5,
      automated: true
    },
    {
      id: 'ts_002',
      title: 'Analyze Correlation Rules',
      description: 'Review correlation rules for performance bottlenecks',
      category: 'diagnostic',
      severity: 'medium',
      estimatedTime: 15,
      automated: false
    },
    {
      id: 'ts_003',
      title: 'Restart Correlation Engine',
      description: 'Safely restart correlation engine to clear memory leaks',
      category: 'remediation',
      severity: 'high',
      estimatedTime: 10,
      automated: true
    },
    {
      id: 'ts_004',
      title: 'Escalate to Engineering',
      description: 'Create support ticket for engineering team review',
      category: 'escalation',
      severity: 'high',
      estimatedTime: 30,
      automated: false
    }
  ];

  const customers = dcContextStore.getAllCustomerEngagements();

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
    actions.notify('success', 'Alert acknowledged');
  };

  const executeTroubleshootingStep = async (step: TroubleshootingStep) => {
    if (!step.automated) {
      actions.notify('info', `Manual step: ${step.title}. Please follow the procedure in the system documentation.`);
      return;
    }

    setIsLoading(true);
    actions.notify('info', `Executing: ${step.title}...`);
    
    // Simulate automated execution
    setTimeout(() => {
      setIsLoading(false);
      actions.notify('success', `${step.title} completed successfully`);
    }, step.estimatedTime * 100); // Simulate time
  };

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Health Overview */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-6 rounded-lg border border-green-500/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-green-400">🏥 XSIAM System Health</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                healthStatus?.overall === 'healthy' ? 'bg-green-500' :
                healthStatus?.overall === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-300">
                Overall Status: <span className={`font-medium ${
                  healthStatus?.overall === 'healthy' ? 'text-green-400' :
                  healthStatus?.overall === 'warning' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>{healthStatus?.overall || 'Unknown'}</span>
              </span>
            </div>
            <button
              onClick={loadHealthStatus}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
            >
              {isLoading ? '⏳ Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {healthStatus && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded border text-center ${
                healthStatus.components.dataIngestion === 'healthy' ? 'bg-green-900/20 border-green-500/30' :
                healthStatus.components.dataIngestion === 'warning' ? 'bg-yellow-900/20 border-yellow-500/30' :
                'bg-red-900/20 border-red-500/30'
              }`}>
                <div className={`text-2xl font-mono ${
                  healthStatus.components.dataIngestion === 'healthy' ? 'text-green-400' :
                  healthStatus.components.dataIngestion === 'warning' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {healthStatus.components.dataIngestion === 'healthy' ? '✅' :
                   healthStatus.components.dataIngestion === 'warning' ? '⚠️' : '❌'}
                </div>
                <div className="text-sm text-gray-400">Data Ingestion</div>
                <div className={`text-xs mt-1 ${
                  healthStatus.components.dataIngestion === 'healthy' ? 'text-green-300' :
                  healthStatus.components.dataIngestion === 'warning' ? 'text-yellow-300' :
                  'text-red-300'
                }`}>
                  {healthStatus.components.dataIngestion}
                </div>
              </div>

              <div className={`p-4 rounded border text-center ${
                healthStatus.components.correlationEngine === 'healthy' ? 'bg-green-900/20 border-green-500/30' :
                healthStatus.components.correlationEngine === 'warning' ? 'bg-yellow-900/20 border-yellow-500/30' :
                'bg-red-900/20 border-red-500/30'
              }`}>
                <div className={`text-2xl font-mono ${
                  healthStatus.components.correlationEngine === 'healthy' ? 'text-green-400' :
                  healthStatus.components.correlationEngine === 'warning' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {healthStatus.components.correlationEngine === 'healthy' ? '✅' :
                   healthStatus.components.correlationEngine === 'warning' ? '⚠️' : '❌'}
                </div>
                <div className="text-sm text-gray-400">Correlation Engine</div>
                <div className={`text-xs mt-1 ${
                  healthStatus.components.correlationEngine === 'healthy' ? 'text-green-300' :
                  healthStatus.components.correlationEngine === 'warning' ? 'text-yellow-300' :
                  'text-red-300'
                }`}>
                  {healthStatus.components.correlationEngine}
                </div>
              </div>

              <div className={`p-4 rounded border text-center ${
                healthStatus.components.apiGateway === 'healthy' ? 'bg-green-900/20 border-green-500/30' :
                healthStatus.components.apiGateway === 'warning' ? 'bg-yellow-900/20 border-yellow-500/30' :
                'bg-red-900/20 border-red-500/30'
              }`}>
                <div className={`text-2xl font-mono ${
                  healthStatus.components.apiGateway === 'healthy' ? 'text-green-400' :
                  healthStatus.components.apiGateway === 'warning' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {healthStatus.components.apiGateway === 'healthy' ? '✅' :
                   healthStatus.components.apiGateway === 'warning' ? '⚠️' : '❌'}
                </div>
                <div className="text-sm text-gray-400">API Gateway</div>
                <div className={`text-xs mt-1 ${
                  healthStatus.components.apiGateway === 'healthy' ? 'text-green-300' :
                  healthStatus.components.apiGateway === 'warning' ? 'text-yellow-300' :
                  'text-red-300'
                }`}>
                  {healthStatus.components.apiGateway}
                </div>
              </div>

              <div className={`p-4 rounded border text-center ${
                healthStatus.components.dataLake === 'healthy' ? 'bg-green-900/20 border-green-500/30' :
                healthStatus.components.dataLake === 'warning' ? 'bg-yellow-900/20 border-yellow-500/30' :
                'bg-red-900/20 border-red-500/30'
              }`}>
                <div className={`text-2xl font-mono ${
                  healthStatus.components.dataLake === 'healthy' ? 'text-green-400' :
                  healthStatus.components.dataLake === 'warning' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {healthStatus.components.dataLake === 'healthy' ? '✅' :
                   healthStatus.components.dataLake === 'warning' ? '⚠️' : '❌'}
                </div>
                <div className="text-sm text-gray-400">Data Lake</div>
                <div className={`text-xs mt-1 ${
                  healthStatus.components.dataLake === 'healthy' ? 'text-green-300' :
                  healthStatus.components.dataLake === 'warning' ? 'text-yellow-300' :
                  'text-red-300'
                }`}>
                  {healthStatus.components.dataLake}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-mono text-cyan-400">{healthStatus.metrics.eventsPerSecond.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Events/Sec</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono text-purple-400">{healthStatus.metrics.alertsGenerated}</div>
                <div className="text-sm text-gray-400">Alerts Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono text-blue-400">{healthStatus.metrics.responseTime}ms</div>
                <div className="text-sm text-gray-400">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono text-green-400">{healthStatus.metrics.uptime}%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Alerts */}
      <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-bold text-white">🚨 Recent Alerts</h4>
          <button
            onClick={() => setActiveTab('alerts')}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View All →
          </button>
        </div>
        
        <div className="space-y-3">
          {alerts.slice(0, 3).map(alert => (
            <div key={alert.id} className={`p-3 rounded border ${
              alert.severity === 'critical' ? 'bg-red-900/20 border-red-500/30' :
              alert.severity === 'warning' ? 'bg-yellow-900/20 border-yellow-500/30' :
              'bg-blue-900/20 border-blue-500/30'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      alert.severity === 'critical' ? 'bg-red-800 text-red-200' :
                      alert.severity === 'warning' ? 'bg-yellow-800 text-yellow-200' :
                      'bg-blue-800 text-blue-200'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-white font-medium">{alert.component}</span>
                    {alert.resolvedAt && <span className="text-green-400 text-xs">✅ RESOLVED</span>}
                  </div>
                  <div className="text-gray-300 text-sm">{alert.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
                {!alert.acknowledged && !alert.resolvedAt && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 p-6 rounded-lg border border-violet-500/30">
        <h4 className="text-lg font-bold text-violet-400 mb-4">🤖 AI Health Recommendations</h4>
        <div className="space-y-3">
          <div className="bg-gray-800/50 p-3 rounded border border-violet-500/20">
            <div className="text-violet-300 font-medium mb-1">Memory Optimization</div>
            <div className="text-sm text-gray-300">Consider implementing memory cleanup routines during low-activity periods to prevent correlation engine memory leaks.</div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded border border-violet-500/20">
            <div className="text-violet-300 font-medium mb-1">Scaling Recommendation</div>
            <div className="text-sm text-gray-300">Current EPS trending upward. Plan for 20% capacity increase within 2 weeks to maintain performance.</div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded border border-violet-500/20">
            <div className="text-violet-300 font-medium mb-1">Alert Tuning</div>
            <div className="text-sm text-gray-300">3 correlation rules generating 67% of false positives. Review rules CR-2847, CR-3921, and CR-4156.</div>
          </div>
        </div>
      </div>
    </div>
  );

  const AlertsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">🚨 System Alerts</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            Acknowledge All
          </button>
          <button
            onClick={loadAlerts}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-900/20 p-4 rounded border border-red-500/30 text-center">
          <div className="text-2xl font-mono text-red-400">{alerts.filter(a => a.severity === 'critical' && !a.resolvedAt).length}</div>
          <div className="text-sm text-gray-400">Critical</div>
        </div>
        <div className="bg-yellow-900/20 p-4 rounded border border-yellow-500/30 text-center">
          <div className="text-2xl font-mono text-yellow-400">{alerts.filter(a => a.severity === 'warning' && !a.resolvedAt).length}</div>
          <div className="text-sm text-gray-400">Warning</div>
        </div>
        <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30 text-center">
          <div className="text-2xl font-mono text-blue-400">{alerts.filter(a => a.severity === 'info' && !a.resolvedAt).length}</div>
          <div className="text-sm text-gray-400">Info</div>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.id} className={`p-4 rounded border ${
            alert.severity === 'critical' ? 'bg-red-900/20 border-red-500/30' :
            alert.severity === 'warning' ? 'bg-yellow-900/20 border-yellow-500/30' :
            'bg-blue-900/20 border-blue-500/30'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  alert.severity === 'critical' ? 'bg-red-800 text-red-200' :
                  alert.severity === 'warning' ? 'bg-yellow-800 text-yellow-200' :
                  'bg-blue-800 text-blue-200'
                }`}>
                  {alert.severity.toUpperCase()}
                </span>
                <span className="text-white font-medium">{alert.component}</span>
                {alert.acknowledged && <span className="text-gray-400 text-xs">👁️ ACKNOWLEDGED</span>}
                {alert.resolvedAt && <span className="text-green-400 text-xs">✅ RESOLVED</span>}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(alert.timestamp).toLocaleString()}
              </div>
            </div>
            
            <div className="text-white mb-2">{alert.message}</div>
            
            {alert.details && (
              <div className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded mb-3">
                {alert.details}
              </div>
            )}
            
            <div className="flex gap-2">
              {!alert.acknowledged && !alert.resolvedAt && (
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                >
                  Acknowledge
                </button>
              )}
              <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors">
                View Details
              </button>
              {alert.severity !== 'info' && (
                <button 
                  onClick={() => setActiveTab('troubleshoot')}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                >
                  Troubleshoot
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PerformanceTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">📊 Performance Metrics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {performanceMetrics.map((metric, index) => (
          <div key={index} className="bg-gray-900/50 p-6 rounded border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-lg font-medium text-white">{metric.name}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>Current: </span>
                  <span className={`font-mono ${
                    metric.status === 'healthy' ? 'text-green-400' :
                    metric.status === 'warning' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {metric.value.toLocaleString()} {metric.unit}
                  </span>
                  <span className={`text-xs ${
                    metric.trend === 'up' ? 'text-red-400' :
                    metric.trend === 'down' ? 'text-green-400' :
                    'text-gray-400'
                  }`}>
                    {metric.trend === 'up' ? '↗️' : metric.trend === 'down' ? '↘️' : '➡️'}
                  </span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded text-sm font-medium ${
                metric.status === 'healthy' ? 'bg-green-900/20 text-green-400 border border-green-500/30' :
                metric.status === 'warning' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/30' :
                'bg-red-900/20 text-red-400 border border-red-500/30'
              }`}>
                {metric.status}
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mb-2">
              Threshold: {metric.threshold.toLocaleString()} {metric.unit}
            </div>
            
            <div className="h-24 bg-gray-800/50 rounded border border-gray-600 flex items-center justify-center">
              <div className="text-gray-500 text-sm">📈 Chart visualization would appear here</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TroubleshootTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">🔧 Troubleshooting Guide</h3>
        <button
          onClick={() => actions.notify('info', 'Automated health check initiated')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          🤖 Run Automated Diagnostics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['diagnostic', 'remediation', 'escalation'].map(category => (
          <div key={category} className="bg-gray-900/50 p-6 rounded border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4 capitalize">
              {category === 'diagnostic' ? '🔍 Diagnostic' :
               category === 'remediation' ? '🛠️ Remediation' :
               '🆘 Escalation'} Steps
            </h4>
            
            <div className="space-y-3">
              {troubleshootingSteps.filter(step => step.category === category).map(step => (
                <div key={step.id} className="bg-gray-800/30 p-3 rounded border border-gray-600">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="text-white font-medium">{step.title}</div>
                      <div className="text-sm text-gray-400">{step.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {step.automated && <span className="text-green-400 text-xs">🤖</span>}
                      <span className={`text-xs px-2 py-1 rounded ${
                        step.severity === 'high' ? 'bg-red-900/20 text-red-300' :
                        step.severity === 'medium' ? 'bg-yellow-900/20 text-yellow-300' :
                        'bg-green-900/20 text-green-300'
                      }`}>
                        {step.severity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Est. time: {step.estimatedTime} min</span>
                    <button
                      onClick={() => executeTroubleshootingStep(step)}
                      disabled={isLoading}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
                    >
                      {step.automated ? '🤖 Execute' : '📋 Guide'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">⚙️ Health Monitor Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4">🎯 Customer Environment</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Customer</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="">All Customers</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4">🔔 Alert Configuration</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Email Notifications</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">SMS Alerts (Critical)</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Auto-Acknowledge Info</span>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-400 mb-2">XSIAM Health Monitor</h1>
          <p className="text-gray-400">Real-time system health monitoring with intelligent alerting and automated troubleshooting</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-800/30 p-1 rounded-lg">
          {[
            { id: 'dashboard', label: '🏥 Dashboard', desc: 'System health overview' },
            { id: 'alerts', label: '🚨 Alerts', desc: 'Alert management' },
            { id: 'performance', label: '📊 Performance', desc: 'Metrics and trends' },
            { id: 'troubleshoot', label: '🔧 Troubleshoot', desc: 'Diagnostic tools' },
            { id: 'settings', label: '⚙️ Settings', desc: 'Configuration' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-4 py-3 text-center transition-colors rounded-lg ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
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
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'alerts' && <AlertsTab />}
          {activeTab === 'performance' && <PerformanceTab />}
          {activeTab === 'troubleshoot' && <TroubleshootTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
};