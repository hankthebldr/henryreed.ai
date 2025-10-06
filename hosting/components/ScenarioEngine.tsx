'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CortexButton from './CortexButton';
import { ImprovedTerminal } from './ImprovedTerminal';
import userActivityService from '../lib/user-activity-service';
import { 
  scenarioEngine, 
  ScenarioBlueprint, 
  ScenarioExecution, 
  ThreatVector, 
  ScenarioStage, 
  DetectionPoint,
  EnvironmentSpec
} from '../lib/scenario-engine';

interface ScenarioEngineProps {
  className?: string;
  onScenarioCreated?: (scenario: ScenarioExecution) => void;
}

type ViewMode = 'dashboard' | 'blueprint-designer' | 'execution-monitor' | 'intelligence' | 'analytics';
type ExecutionFilter = 'all' | 'running' | 'completed' | 'failed' | 'paused';

const ScenarioEngine: React.FC<ScenarioEngineProps> = ({ 
  className = '', 
  onScenarioCreated 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [blueprints, setBlueprints] = useState<ScenarioBlueprint[]>([]);
  const [executions, setExecutions] = useState<ScenarioExecution[]>([]);
  const [activeBlueprint, setActiveBlueprint] = useState<ScenarioBlueprint | null>(null);
  const [activeExecution, setActiveExecution] = useState<ScenarioExecution | null>(null);
  const [executionFilter, setExecutionFilter] = useState<ExecutionFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Real-time updates
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Load data on component mount
  useEffect(() => {
    refreshData();
    
    // Set up real-time refresh for active executions
    const interval = setInterval(refreshExecutions, 2000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const refreshData = useCallback(() => {
    setBlueprints(scenarioEngine.listBlueprints());
    setExecutions(scenarioEngine.listExecutions());
  }, []);

  const refreshExecutions = useCallback(() => {
    const newExecutions = scenarioEngine.listExecutions();
    setExecutions(prev => {
      const hasChanges = JSON.stringify(prev.map(e => ({ id: e.id, status: e.status }))) !== 
                        JSON.stringify(newExecutions.map(e => ({ id: e.id, status: e.status })));
      return hasChanges ? newExecutions : prev;
    });
  }, []);

  // Filtered executions based on current filter
  const filteredExecutions = useMemo(() => {
    if (executionFilter === 'all') return executions;
    return executions.filter(exec => exec.status === executionFilter);
  }, [executions, executionFilter]);

  // Dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const totalExecutions = executions.length;
    const runningExecutions = executions.filter(e => e.status === 'running').length;
    const completedExecutions = executions.filter(e => e.status === 'completed').length;
    const failedExecutions = executions.filter(e => e.status === 'failed').length;
    const avgDuration = executions
      .filter(e => e.endTime)
      .reduce((acc, e) => acc + (e.endTime!.getTime() - e.startTime.getTime()), 0) / 
      Math.max(1, executions.filter(e => e.endTime).length);

    return {
      totalBlueprints: blueprints.length,
      totalExecutions,
      runningExecutions,
      completedExecutions,
      failedExecutions,
      successRate: totalExecutions > 0 ? (completedExecutions / totalExecutions * 100).toFixed(1) : '0',
      avgDuration: Math.round(avgDuration / 1000 / 60) // minutes
    };
  }, [blueprints, executions]);

  // AI-driven scenario generation
  const generateScenarioFromThreatActor = async (actorName: string) => {
    setAiGenerating(true);
    try {
      userActivityService.trackActivity('ai-scenario-generation', 'scenario-engine', {
        threatActor: actorName,
        timestamp: new Date().toISOString()
      });

      const environment: EnvironmentSpec = {
        cloudProvider: 'gcp',
        infrastructure: { vms: 3, containers: 8, networks: 2, storage: '100GB' },
        applications: ['web-app', 'api-gateway', 'database', 'file-storage'],
        dataTypes: ['customer-data', 'financial', 'operational'],
        users: [
          { name: 'admin', permissions: ['*'] },
          { name: 'developer', permissions: ['read', 'write'] },
          { name: 'analyst', permissions: ['read'] }
        ],
        permissions: [
          { resource: 'databases', actions: ['read', 'write'], scope: 'admin' },
          { resource: 'logs', actions: ['read'], scope: 'all' }
        ]
      };

      const blueprint = await scenarioEngine.generateScenarioFromThreatActor(
        actorName,
        environment,
        {
          complexity: 'high',
          duration: 180,
          includeDefensiveActions: true
        }
      );

      setActiveBlueprint(blueprint);
      refreshData();

      userActivityService.addTimelineEvent({
        type: 'ai-scenario-generated',
        title: 'AI Scenario Generated',
        description: `Generated scenario for threat actor: ${actorName}`,
        metadata: { 
          blueprintId: blueprint.id,
          threatActor: actorName,
          aiEnhanced: true
        },
        priority: 'medium',
        category: 'technical'
      });

    } catch (error) {
      console.error('Failed to generate AI scenario:', error);
    } finally {
      setAiGenerating(false);
    }
  };

  // Execute a scenario
  const executeScenario = async (blueprintId: string) => {
    setIsLoading(true);
    try {
      const execution = await scenarioEngine.executeScenario(blueprintId, {
        adaptiveBehavior: true,
        pauseOnDetection: false
      });

      setActiveExecution(execution);
      refreshData();
      
      if (onScenarioCreated) {
        onScenarioCreated(execution);
      }

      userActivityService.addTimelineEvent({
        type: 'scenario-executed',
        title: 'Scenario Execution Started',
        description: `Started execution for scenario: ${execution.id}`,
        metadata: { executionId: execution.id, blueprintId },
        priority: 'high',
        category: 'operational'
      });

    } catch (error) {
      console.error('Failed to execute scenario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Control execution
  const pauseExecution = async (executionId: string) => {
    await scenarioEngine.pauseExecution(executionId);
    refreshExecutions();
  };

  const resumeExecution = async (executionId: string) => {
    await scenarioEngine.resumeExecution(executionId);
    refreshExecutions();
  };

  const cancelExecution = async (executionId: string) => {
    await scenarioEngine.cancelExecution(executionId);
    refreshExecutions();
  };

  // Render different views
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-cyan-400">{dashboardMetrics.totalBlueprints}</div>
          <div className="text-sm text-slate-400">Total Blueprints</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{dashboardMetrics.runningExecutions}</div>
          <div className="text-sm text-slate-400">Running Now</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{dashboardMetrics.successRate}%</div>
          <div className="text-sm text-slate-400">Success Rate</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">{dashboardMetrics.avgDuration}m</div>
          <div className="text-sm text-slate-400">Avg Duration</div>
        </div>
      </div>

      {/* AI Generation Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">🤖 AI-Driven Scenario Generation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['APT29', 'Lazarus Group', 'FIN7', 'Carbanak', 'APT1', 'Equation Group'].map((actor) => (
            <CortexButton
              key={actor}
              onClick={() => generateScenarioFromThreatActor(actor)}
              disabled={aiGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {aiGenerating ? '🔄 Generating...' : `Generate ${actor} Campaign`}
            </CortexButton>
          ))}
        </div>
      </div>

      {/* Recent Executions */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-cyan-400">Recent Executions</h3>
          <div className="flex gap-2">
            {(['all', 'running', 'completed', 'failed', 'paused'] as ExecutionFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setExecutionFilter(filter)}
                className={`px-3 py-1 rounded text-sm ${
                  executionFilter === filter 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredExecutions.slice(0, 10).map((execution) => (
            <div 
              key={execution.id}
              className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:bg-slate-600 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-white">
                      Execution {execution.id.split('-')[0]}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      execution.status === 'running' ? 'bg-green-600 text-white' :
                      execution.status === 'completed' ? 'bg-blue-600 text-white' :
                      execution.status === 'failed' ? 'bg-red-600 text-white' :
                      execution.status === 'paused' ? 'bg-yellow-600 text-white' :
                      'bg-slate-600 text-slate-300'
                    }`}>
                      {execution.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    Started: {execution.startTime.toLocaleString()}
                  </div>
                  {execution.currentStage && (
                    <div className="text-sm text-cyan-400">
                      Current Stage: {execution.currentStage}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {execution.status === 'running' && (
                    <CortexButton
                      onClick={() => pauseExecution(execution.id)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-xs px-2 py-1"
                    >
                      Pause
                    </CortexButton>
                  )}
                  {execution.status === 'paused' && (
                    <CortexButton
                      onClick={() => resumeExecution(execution.id)}
                      className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                    >
                      Resume
                    </CortexButton>
                  )}
                  {(execution.status === 'running' || execution.status === 'paused') && (
                    <CortexButton
                      onClick={() => cancelExecution(execution.id)}
                      className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1"
                    >
                      Cancel
                    </CortexButton>
                  )}
                  <CortexButton
                    onClick={() => {
                      setActiveExecution(execution);
                      setViewMode('execution-monitor');
                    }}
                    className="bg-slate-600 hover:bg-slate-500 text-xs px-2 py-1"
                  >
                    Monitor
                  </CortexButton>
                </div>
              </div>

              {/* Progress indicators */}
              {execution.status === 'running' && execution.stageResults.length > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{execution.stageResults.length} stages completed</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min(100, (execution.stageResults.length / Math.max(1, execution.stageResults.length + 3)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Blueprint Library */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">Scenario Blueprints</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blueprints.map((blueprint) => (
            <div key={blueprint.id} className="bg-slate-700 border border-slate-600 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-white text-sm">{blueprint.name}</h4>
                <span className={`px-2 py-1 rounded text-xs ${
                  blueprint.category === 'red-team' ? 'bg-red-600 text-white' :
                  blueprint.category === 'blue-team' ? 'bg-blue-600 text-white' :
                  blueprint.category === 'purple-team' ? 'bg-purple-600 text-white' :
                  'bg-slate-600 text-slate-300'
                }`}>
                  {blueprint.category}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                {blueprint.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {blueprint.platforms.slice(0, 3).map((platform) => (
                  <span key={platform} className="px-2 py-1 bg-slate-600 rounded text-xs text-slate-300">
                    {platform}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                <span>Duration: {blueprint.estimatedDuration}m</span>
                <span className={`${
                  blueprint.difficulty === 'beginner' ? 'text-green-400' :
                  blueprint.difficulty === 'intermediate' ? 'text-yellow-400' :
                  blueprint.difficulty === 'advanced' ? 'text-orange-400' :
                  'text-red-400'
                }`}>
                  {blueprint.difficulty}
                </span>
              </div>

              <div className="flex gap-2">
                <CortexButton
                  onClick={() => executeScenario(blueprint.id)}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 flex-1 text-xs"
                >
                  Execute
                </CortexButton>
                <CortexButton
                  onClick={() => {
                    setActiveBlueprint(blueprint);
                    setViewMode('blueprint-designer');
                  }}
                  className="bg-slate-600 hover:bg-slate-500 text-xs"
                >
                  Edit
                </CortexButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderExecutionMonitor = () => (
    <div className="space-y-6">
      {activeExecution ? (
        <>
          {/* Execution Header */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-cyan-400">
                  Execution Monitor: {activeExecution.id.split('-')[0]}
                </h2>
                <p className="text-slate-400">
                  Blueprint: {scenarioEngine.getBlueprint(activeExecution.blueprintId)?.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded ${
                  activeExecution.status === 'running' ? 'bg-green-600 text-white' :
                  activeExecution.status === 'completed' ? 'bg-blue-600 text-white' :
                  activeExecution.status === 'failed' ? 'bg-red-600 text-white' :
                  activeExecution.status === 'paused' ? 'bg-yellow-600 text-white' :
                  'bg-slate-600 text-slate-300'
                }`}>
                  {activeExecution.status.toUpperCase()}
                </span>
                {(activeExecution.status === 'running' || activeExecution.status === 'paused') && (
                  <div className="flex gap-2">
                    {activeExecution.status === 'running' && (
                      <CortexButton
                        onClick={() => pauseExecution(activeExecution.id)}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        Pause
                      </CortexButton>
                    )}
                    {activeExecution.status === 'paused' && (
                      <CortexButton
                        onClick={() => resumeExecution(activeExecution.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Resume
                      </CortexButton>
                    )}
                    <CortexButton
                      onClick={() => cancelExecution(activeExecution.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Cancel
                    </CortexButton>
                  </div>
                )}
              </div>
            </div>

            {/* Execution Timeline */}
            <div className="text-sm text-slate-400 space-y-1">
              <div>Started: {activeExecution.startTime.toLocaleString()}</div>
              {activeExecution.endTime && (
                <div>Ended: {activeExecution.endTime.toLocaleString()}</div>
              )}
              <div>
                Duration: {Math.round((
                  (activeExecution.endTime || new Date()).getTime() - 
                  activeExecution.startTime.getTime()
                ) / 1000 / 60)} minutes
              </div>
            </div>
          </div>

          {/* Stage Results */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Stage Results</h3>
            <div className="space-y-4">
              {activeExecution.stageResults.map((result, index) => (
                <div key={result.stageId} className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-white">Stage {index + 1}: {result.stageId}</h4>
                      <div className="text-sm text-slate-400">
                        {result.startTime.toLocaleString()} - {result.endTime?.toLocaleString() || 'Running...'}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.status === 'running' ? 'bg-green-600 text-white' :
                      result.status === 'completed' ? 'bg-blue-600 text-white' :
                      result.status === 'failed' ? 'bg-red-600 text-white' :
                      result.status === 'skipped' ? 'bg-yellow-600 text-white' :
                      'bg-slate-600 text-slate-300'
                    }`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Detections */}
                  {result.detections.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-bold text-cyan-400 mb-2">Detections</h5>
                      <div className="space-y-2">
                        {result.detections.map((detection, detIndex) => (
                          <div key={detIndex} className="bg-slate-600 rounded p-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-white">
                                Detection Point: {detection.detectionPointId}
                              </span>
                              <span className={`text-sm font-bold ${
                                detection.findings > 0 ? 'text-red-400' : 'text-green-400'
                              }`}>
                                {detection.findings} findings
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              Confidence: {(detection.confidence * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {result.errors.length > 0 && (
                    <div className="bg-red-900 border border-red-700 rounded p-3">
                      <h5 className="text-sm font-bold text-red-400 mb-2">Errors</h5>
                      {result.errors.map((error, errorIndex) => (
                        <div key={errorIndex} className="text-sm text-red-300">
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Execution Logs */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Execution Logs</h3>
            <div className="bg-black rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
              {activeExecution.logs.slice(-50).map((log, index) => (
                <div key={index} className={`${
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'warning' ? 'text-yellow-400' :
                  log.level === 'info' ? 'text-cyan-400' :
                  log.level === 'debug' ? 'text-slate-500' :
                  'text-white'
                }`}>
                  [{log.timestamp.toLocaleTimeString()}] [{log.level.toUpperCase()}] [{log.source}] {log.message}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-slate-400">No execution selected</div>
          <CortexButton
            onClick={() => setViewMode('dashboard')}
            className="mt-4 bg-cyan-600 hover:bg-cyan-700"
          >
            Return to Dashboard
          </CortexButton>
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen bg-slate-900 text-white ${className}`}>
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyan-400">
            🚀 Comprehensive Scenario Engine
          </h1>

          <div className="flex items-center gap-4">
            {/* View Mode Tabs */}
            <div className="flex bg-slate-700 rounded-lg p-1">
              {[
                { mode: 'dashboard', label: '🏠 Dashboard', icon: '🏠' },
                { mode: 'execution-monitor', label: '📊 Monitor', icon: '📊' },
                { mode: 'blueprint-designer', label: '🎨 Designer', icon: '🎨' },
                { mode: 'intelligence', label: '🧠 Intel', icon: '🧠' },
                { mode: 'analytics', label: '📈 Analytics', icon: '📈' }
              ].map(({ mode, label, icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as ViewMode)}
                  className={`px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors ${
                    viewMode === mode 
                      ? 'bg-cyan-600 text-white' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  {icon} {label.split(' ')[1]}
                </button>
              ))}
            </div>

            {/* Controls */}
            <CortexButton
              onClick={() => setShowTerminal(!showTerminal)}
              className="bg-slate-700 hover:bg-slate-600"
            >
              {showTerminal ? '🔽' : '⚡'} Terminal
            </CortexButton>

            <CortexButton
              onClick={refreshData}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              🔄 Refresh
            </CortexButton>
          </div>
        </div>
      </div>

      {/* Terminal Integration */}
      {showTerminal && (
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="bg-black rounded-lg">
            <ImprovedTerminal />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        {viewMode === 'dashboard' && renderDashboard()}
        {viewMode === 'execution-monitor' && renderExecutionMonitor()}
        {viewMode === 'blueprint-designer' && (
          <div className="text-center py-12">
            <div className="text-slate-400">Blueprint Designer - Coming Soon</div>
            <p className="text-sm text-slate-500 mt-2">
              Advanced visual blueprint designer with drag-and-drop stage creation
            </p>
          </div>
        )}
        {viewMode === 'intelligence' && (
          <div className="text-center py-12">
            <div className="text-slate-400">Threat Intelligence Hub - Coming Soon</div>
            <p className="text-sm text-slate-500 mt-2">
              Real-time threat intel integration and IOC management
            </p>
          </div>
        )}
        {viewMode === 'analytics' && (
          <div className="text-center py-12">
            <div className="text-slate-400">Advanced Analytics - Coming Soon</div>
            <p className="text-sm text-slate-500 mt-2">
              ML-driven performance analytics and optimization recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioEngine;