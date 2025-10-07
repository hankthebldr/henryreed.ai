import React from 'react';
import { cloudFunctionsAPI } from './cloud-functions-api';

const USE_FUNCTIONS = process.env.NEXT_PUBLIC_USE_FUNCTIONS === '1';

// Active monitoring sessions storage
const monitoringSessions = new Map<string, any>();

// Generate realistic monitoring data
const generateMonitoringData = (scenario: string) => {
  const baseMetrics = {
    'cloud-posture': { alerts: Math.floor(Math.random() * 15) + 5, coverage: 85 + Math.random() * 10 },
    'insider-threat': { alerts: Math.floor(Math.random() * 8) + 2, coverage: 75 + Math.random() * 15 },
    'ransomware': { alerts: Math.floor(Math.random() * 20) + 10, coverage: 90 + Math.random() * 8 },
    'container-vuln': { alerts: Math.floor(Math.random() * 12) + 3, coverage: 80 + Math.random() * 12 },
    'code-vuln': { alerts: Math.floor(Math.random() * 25) + 8, coverage: 70 + Math.random() * 20 }
  };

  const metrics = baseMetrics[scenario as keyof typeof baseMetrics] || baseMetrics['cloud-posture'];
  
  return {
    activeAlerts: metrics.alerts,
    coverage: Math.round(metrics.coverage * 100) / 100,
    responseTime: Math.floor(Math.random() * 300) + 150,
    falsePositiveRate: Math.round((Math.random() * 5 + 2) * 100) / 100,
    detectionRate: Math.round((85 + Math.random() * 12) * 100) / 100,
    systemHealth: Math.random() > 0.1 ? 'healthy' : 'degraded',
    lastUpdate: new Date().toISOString()
  };
};

import { CommandConfig } from './commands';

// Function declarations
const handleMonitorStart = async (args: string[]) => {
    const scenario = args.includes('--scenario') ? args[args.indexOf('--scenario') + 1] : '';
    const realTime = args.includes('--real-time');
    const alerts = args.includes('--alerts');
    const duration = args.includes('--duration') ? args[args.indexOf('--duration') + 1] : '24h';

    if (!scenario) {
      return (
        <div className="text-red-400">
          Please specify a scenario: <span className="font-mono">monitor start --scenario cloud-posture --real-time --alerts</span>
        </div>
      );
    }

    try {
      const sessionId = `MON-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Note: startMonitoring method would need to be implemented in cloudFunctionsAPI
      // if (USE_FUNCTIONS) {
      //   await cloudFunctionsAPI.startMonitoring({
      //     sessionId,
      //     scenario,
      //     realTime,
      //     alerts,
      //     duration
      //   });
      // } else {
        // Simulate monitoring startup
        await new Promise(resolve => setTimeout(resolve, 2000));
      // }

      const monitoringData = generateMonitoringData(scenario);
      
      monitoringSessions.set(sessionId, {
        id: sessionId,
        scenario,
        realTime,
        alerts,
        duration,
        startTime: new Date().toISOString(),
        status: 'active',
        ...monitoringData
      });

      return (
        <div className="text-green-300">
          <div className="font-bold mb-4 text-xl">📊 Monitoring Session Started</div>
          
          <div className="mb-4 bg-gray-800 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Session ID:</strong> <span className="font-mono text-yellow-400">{sessionId}</span></div>
              <div><strong>Scenario:</strong> <span className="capitalize">{scenario.replace('-', ' ')}</span></div>
              <div><strong>Mode:</strong> {realTime ? 'Real-time' : 'Batch'}</div>
              <div><strong>Duration:</strong> {duration}</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-800 p-3 rounded text-center">
              <div className="text-2xl font-bold text-blue-300">{monitoringData.activeAlerts}</div>
              <div className="text-xs text-blue-200">Active Alerts</div>
            </div>
            <div className="bg-green-800 p-3 rounded text-center">
              <div className="text-2xl font-bold text-green-300">{monitoringData.coverage}%</div>
              <div className="text-xs text-green-200">Coverage</div>
            </div>
            <div className="bg-yellow-800 p-3 rounded text-center">
              <div className="text-2xl font-bold text-yellow-300">{monitoringData.responseTime}ms</div>
              <div className="text-xs text-yellow-200">Response Time</div>
            </div>
            <div className="bg-purple-800 p-3 rounded text-center">
              <div className="text-2xl font-bold text-purple-300">{monitoringData.detectionRate}%</div>
              <div className="text-xs text-purple-200">Detection Rate</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className={`p-3 rounded ${
              monitoringData.systemHealth === 'healthy' ? 'bg-green-800 text-green-200' : 'bg-yellow-800 text-yellow-200'
            }`}>
              <div className="font-bold mb-1">🏥 System Health</div>
              <div className="text-sm">
                Status: <span className="font-medium">{monitoringData.systemHealth.toUpperCase()}</span>
                {monitoringData.systemHealth === 'degraded' && (
                  <span className="ml-2">⚠️ Performance impact detected</span>
                )}
              </div>
            </div>

            {alerts && (
              <div className="bg-red-800 p-3 rounded text-red-200">
                <div className="font-bold mb-1">🚨 Alert Configuration</div>
                <div className="text-sm">
                  Real-time alerts enabled for critical and high severity events.
                  Notifications will be sent to configured endpoints.
                </div>
              </div>
            )}

            <div className="bg-gray-800 p-3 rounded">
              <div className="font-bold text-cyan-400 mb-2">📋 Monitoring Scope</div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• XSIAM detection rule execution</li>
                <li>• Event correlation and analysis</li>
                <li>• Performance metrics collection</li>
                <li>• False positive rate tracking</li>
                {realTime && <li>• Real-time event streaming</li>}
                {alerts && <li>• Automated alert generation</li>}
              </ul>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-400">
            <strong>Commands:</strong> monitor status {sessionId}, monitor stop {sessionId}
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="text-red-400">
          <div className="font-bold mb-2">❌ Monitoring Start Failed</div>
          <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      );
    }
};

  const handleMonitorStop = async (args: string[]) => {
    const sessionId = args[0];
    
    if (!sessionId) {
      return (
        <div className="text-red-400">
          Please specify a session ID: <span className="font-mono">monitor stop MON-12345</span>
        </div>
      );
    }

    const session = monitoringSessions.get(sessionId);
    if (!session) {
      return (
        <div className="text-red-400">
          Monitoring session "{sessionId}" not found
        </div>
      );
    }

    try {
      // Note: stopMonitoring method would need to be implemented in cloudFunctionsAPI
      // if (USE_FUNCTIONS) {
      //   await cloudFunctionsAPI.stopMonitoring(sessionId);
      // } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      // }

      // Update session status
      session.status = 'stopped';
      session.endTime = new Date().toISOString();
      
      // Calculate session duration
      const startTime = new Date(session.startTime);
      const endTime = new Date(session.endTime);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

      return (
        <div className="text-green-300">
          <div className="font-bold mb-4 text-xl">🛑 Monitoring Session Stopped</div>
          
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Session ID:</strong> <span className="font-mono text-yellow-400">{sessionId}</span></div>
              <div><strong>Scenario:</strong> {session.scenario}</div>
              <div><strong>Duration:</strong> {Math.floor(duration / 60)}m {duration % 60}s</div>
              <div><strong>Status:</strong> <span className="text-red-400">Stopped</span></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-800 p-3 rounded text-blue-200">
              <div className="font-bold mb-2">📈 Session Summary</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Total Alerts: {session.activeAlerts}</div>
                <div>Coverage: {session.coverage}%</div>
                <div>Avg Response: {session.responseTime}ms</div>
                <div>Detection Rate: {session.detectionRate}%</div>
              </div>
            </div>

            <div className="bg-gray-800 p-3 rounded">
              <div className="font-bold text-cyan-400 mb-2">💾 Data Retention</div>
              <div className="text-sm text-gray-300">
                Monitoring data and logs have been preserved for analysis.
                Use <span className="font-mono">monitor report {sessionId}</span> to generate detailed reports.
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-400">
            Session data available for 30 days. Export with: monitor export {sessionId}
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="text-red-400">
          <div className="font-bold mb-2">❌ Failed to Stop Monitoring</div>
          <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      );
    }
};

const handleMonitorStatus = async (args: string[]) => {
    const sessionId = args[0];
    
    if (!sessionId) {
      // Show all active monitoring sessions
      const activeSessions = Array.from(monitoringSessions.values()).filter(s => s.status === 'active');
      
      return (
        <div className="text-blue-300">
          <div className="font-bold mb-4 text-xl">📊 Active Monitoring Sessions</div>
          
          {activeSessions.length === 0 ? (
            <div className="text-gray-500">No active monitoring sessions</div>
          ) : (
            <div className="space-y-3">
              {activeSessions.map(session => {
                const currentData = generateMonitoringData(session.scenario);
                const uptime = Math.round((Date.now() - new Date(session.startTime).getTime()) / 1000);
                
                return (
                  <div key={session.id} className="border border-gray-600 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-green-400">{session.id}</div>
                        <div className="text-sm text-gray-400">
                          Scenario: {session.scenario} • Uptime: {Math.floor(uptime / 60)}m {uptime % 60}s
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded text-xs ${
                          currentData.systemHealth === 'healthy' ? 'bg-green-600 text-green-200' : 'bg-yellow-600 text-yellow-200'
                        }`}>
                          {currentData.systemHealth.toUpperCase()}
                        </div>
                        {session.realTime && <div className="text-xs text-blue-400 mt-1">REAL-TIME</div>}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{currentData.activeAlerts}</div>
                        <div className="text-xs text-gray-400">Alerts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{currentData.coverage}%</div>
                        <div className="text-xs text-gray-400">Coverage</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400">{currentData.responseTime}ms</div>
                        <div className="text-xs text-gray-400">Response</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">{currentData.detectionRate}%</div>
                        <div className="text-xs text-gray-400">Detection</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-400">
            Use <span className="font-mono">monitor status SESSION_ID</span> for detailed session info
          </div>
        </div>
      );
    }

    // Show specific session status
    const session = monitoringSessions.get(sessionId);
    if (!session) {
      return (
        <div className="text-red-400">
          Monitoring session "{sessionId}" not found
        </div>
      );
    }

    const currentData = session.status === 'active' ? generateMonitoringData(session.scenario) : session;
    const uptime = session.status === 'active' 
      ? Math.round((Date.now() - new Date(session.startTime).getTime()) / 1000)
      : session.endTime 
        ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000)
        : 0;

    return (
      <div className="text-blue-300">
        <div className="font-bold mb-4 text-xl">📊 Monitoring Session: {session.scenario}</div>
        
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Session ID:</strong> <span className="font-mono text-yellow-400">{sessionId}</span></div>
            <div><strong>Status:</strong> <span className={session.status === 'active' ? 'text-green-400' : 'text-red-400'}>
              {session.status.toUpperCase()}
            </span></div>
            <div><strong>Started:</strong> {new Date(session.startTime).toLocaleString()}</div>
            <div><strong>Duration:</strong> {Math.floor(uptime / 60)}m {uptime % 60}s</div>
            <div><strong>Mode:</strong> {session.realTime ? 'Real-time' : 'Batch'}</div>
            <div><strong>Alerts:</strong> {session.alerts ? 'Enabled' : 'Disabled'}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            <div className="bg-blue-800 p-3 rounded">
              <div className="font-bold text-blue-200 mb-2">📈 Current Metrics</div>
              <div className="space-y-1 text-sm">
                <div>Active Alerts: <span className="font-bold">{currentData.activeAlerts}</span></div>
                <div>Coverage: <span className="font-bold">{currentData.coverage}%</span></div>
                <div>Response Time: <span className="font-bold">{currentData.responseTime}ms</span></div>
                <div>Detection Rate: <span className="font-bold">{currentData.detectionRate}%</span></div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className={`p-3 rounded ${
              currentData.systemHealth === 'healthy' ? 'bg-green-800' : 'bg-yellow-800'
            }`}>
              <div className="font-bold mb-2">🏥 System Health</div>
              <div className="text-sm">
                <div>Status: <span className="font-bold">{currentData.systemHealth.toUpperCase()}</span></div>
                <div>False Positive Rate: <span className="font-bold">{currentData.falsePositiveRate}%</span></div>
                <div>Last Update: <span className="font-bold">{new Date(currentData.lastUpdate).toLocaleTimeString()}</span></div>
              </div>
            </div>
          </div>
        </div>

        {session.status === 'active' && (
          <div className="bg-cyan-800 p-3 rounded text-cyan-200">
            <div className="font-bold mb-1">⚡ Live Monitoring</div>
            <div className="text-sm">
              Session is actively monitoring {session.scenario} events.
              {session.alerts && ' Alert notifications are enabled.'}
              {session.realTime && ' Real-time event processing is active.'}
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-400">
          <strong>Commands:</strong> {session.status === 'active' ? `monitor stop ${sessionId}` : `monitor report ${sessionId}`}
        </div>
      </div>
    );
};

const handleMonitorList = async (args: string[]) => {
    const allSessions = Array.from(monitoringSessions.values());
    const activeSessions = allSessions.filter(s => s.status === 'active');
    const stoppedSessions = allSessions.filter(s => s.status === 'stopped');

    return (
      <div className="text-blue-300">
        <div className="font-bold mb-4 text-xl">📊 Monitoring Sessions Overview</div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-800 p-3 rounded text-center">
            <div className="text-2xl font-bold text-green-300">{activeSessions.length}</div>
            <div className="text-xs text-green-200">Active Sessions</div>
          </div>
          <div className="bg-gray-800 p-3 rounded text-center">
            <div className="text-2xl font-bold text-gray-300">{stoppedSessions.length}</div>
            <div className="text-xs text-gray-200">Stopped Sessions</div>
          </div>
          <div className="bg-blue-800 p-3 rounded text-center">
            <div className="text-2xl font-bold text-blue-300">{allSessions.length}</div>
            <div className="text-xs text-blue-200">Total Sessions</div>
          </div>
        </div>

        {allSessions.length === 0 ? (
          <div className="text-gray-500">No monitoring sessions found</div>
        ) : (
          <div className="space-y-4">
            {activeSessions.length > 0 && (
              <div>
                <div className="font-bold text-green-400 mb-2">🟢 Active Sessions</div>
                <div className="space-y-2">
                  {activeSessions.map(session => {
                    const uptime = Math.round((Date.now() - new Date(session.startTime).getTime()) / 1000);
                    return (
                      <div key={session.id} className="bg-green-900/20 border border-green-600 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-mono text-yellow-400">{session.id}</span>
                            <span className="ml-3 capitalize">{session.scenario.replace('-', ' ')}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {Math.floor(uptime / 60)}m {uptime % 60}s
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {stoppedSessions.length > 0 && (
              <div>
                <div className="font-bold text-gray-400 mb-2">⚪ Stopped Sessions</div>
                <div className="space-y-2">
                  {stoppedSessions.slice(-5).map(session => {
                    const duration = session.endTime 
                      ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000)
                      : 0;
                    return (
                      <div key={session.id} className="bg-gray-800 border border-gray-600 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-mono text-yellow-400">{session.id}</span>
                            <span className="ml-3 capitalize">{session.scenario.replace('-', ' ')}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            Ran for {Math.floor(duration / 60)}m {duration % 60}s
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-400">
          Use <span className="font-mono">monitor status SESSION_ID</span> for detailed information
        </div>
      </div>
    );
};

export const monitorCommands: CommandConfig[] = [
  {
    name: 'monitor',
    description: 'Security monitoring and alerting',
    usage: 'monitor [start|stop|status|list] [options]',
    aliases: ['mon'],
    handler: async (args: string[]) => {
      const subcommand = args[0] || 'help';
      const subArgs = args.slice(1);
      
      switch (subcommand) {
        case 'start':
          return await handleMonitorStart(subArgs);
        case 'stop':
          return await handleMonitorStop(subArgs);
        case 'status':
          return await handleMonitorStatus(subArgs);
        case 'list':
          return await handleMonitorList(subArgs);
        default:
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-2">📊 Monitoring Commands</div>
              <div className="space-y-1 text-sm">
                <div>• <span className="font-mono">monitor start --scenario [type]</span> - Start monitoring</div>
                <div>• <span className="font-mono">monitor stop SESSION_ID</span> - Stop monitoring</div>
                <div>• <span className="font-mono">monitor status [SESSION_ID]</span> - Check status</div>
                <div>• <span className="font-mono">monitor list</span> - List all sessions</div>
              </div>
            </div>
          );
      }
    },
  }
];
