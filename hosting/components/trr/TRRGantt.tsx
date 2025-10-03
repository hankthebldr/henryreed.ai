'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { TRR } from '../../types/trr';
import CortexButton from '../CortexButton';

interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies?: string[];
  type: 'project' | 'trr';
  priority?: string;
  assignee?: string;
  status?: string;
  isOnCriticalPath?: boolean;
}

interface TRRGanttProps {
  trrs: TRR[];
  projects?: { id: string; name: string; startDate: string; endDate: string }[];
  onTaskUpdate?: (taskId: string, updates: { start?: Date; end?: Date; progress?: number }) => void;
  onDependencyAdd?: (fromId: string, toId: string) => void;
  onDependencyRemove?: (fromId: string, toId: string) => void;
  viewMode?: 'day' | 'week' | 'month';
  onViewModeChange?: (mode: 'day' | 'week' | 'month') => void;
  showCriticalPath?: boolean;
  onToggleCriticalPath?: (show: boolean) => void;
}

export const TRRGantt: React.FC<TRRGanttProps> = ({
  trrs,
  projects = [],
  onTaskUpdate,
  onDependencyAdd,
  onDependencyRemove,
  viewMode = 'week',
  onViewModeChange,
  showCriticalPath = false,
  onToggleCriticalPath,
}) => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [showDependencies, setShowDependencies] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Convert TRRs and projects to Gantt tasks
  const ganttTasks = useMemo<GanttTask[]>(() => {
    const tasks: GanttTask[] = [];
    
    // Add project tasks
    projects.forEach(project => {
      tasks.push({
        id: `project-${project.id}`,
        name: project.name,
        start: new Date(project.startDate),
        end: new Date(project.endDate),
        progress: 0, // Calculate from TRRs
        type: 'project',
      });
    });

    // Add TRR tasks
    trrs.forEach(trr => {
      const startDate = trr.startDate ? new Date(trr.startDate) : new Date();
      const endDate = trr.dueDate ? new Date(trr.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      tasks.push({
        id: trr.id,
        name: trr.title,
        start: startDate,
        end: endDate,
        progress: calculateProgress(trr),
        dependencies: trr.dependencies || [],
        type: 'trr',
        priority: trr.priority,
        assignee: trr.assignedTo,
        status: trr.status,
        isOnCriticalPath: false, // Will be calculated
      });
    });

    return tasks;
  }, [trrs, projects]);

  // Calculate critical path
  const criticalPathTasks = useMemo(() => {
    return calculateCriticalPath(ganttTasks);
  }, [ganttTasks]);

  // Update critical path indicators
  const tasksWithCriticalPath = useMemo(() => {
    return ganttTasks.map(task => ({
      ...task,
      isOnCriticalPath: criticalPathTasks.includes(task.id),
    }));
  }, [ganttTasks, criticalPathTasks]);

  function calculateProgress(trr: TRR): number {
    switch (trr.status) {
      case 'completed': return 100;
      case 'validated': return 95;
      case 'in-review': return 75;
      case 'in-progress':
        const testCases = trr.testCases || [];
        if (testCases.length === 0) return 50;
        const completedTests = testCases.filter(tc => tc.status === 'passed' || tc.status === 'failed').length;
        return Math.round((completedTests / testCases.length) * 70) + 25;
      case 'pending': return 20;
      case 'draft': return 10;
      default: return 0;
    }
  }

  function calculateCriticalPath(tasks: GanttTask[]): string[] {
    // Simplified critical path calculation using longest path algorithm
    const graph = new Map<string, { duration: number; dependencies: string[]; task: GanttTask }>();
    
    // Build graph
    tasks.forEach(task => {
      const duration = (task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24); // days
      graph.set(task.id, {
        duration,
        dependencies: task.dependencies || [],
        task,
      });
    });

    // Find longest path (critical path)
    const visited = new Set<string>();
    const distances = new Map<string, number>();
    const path = new Map<string, string>();

    function dfs(nodeId: string): number {
      if (visited.has(nodeId)) {
        return distances.get(nodeId) || 0;
      }

      visited.add(nodeId);
      const node = graph.get(nodeId);
      if (!node) return 0;

      let maxDistance = 0;
      let maxPredecessor = '';

      node.dependencies.forEach(depId => {
        const depDistance = dfs(depId);
        if (depDistance > maxDistance) {
          maxDistance = depDistance;
          maxPredecessor = depId;
        }
      });

      const totalDistance = maxDistance + node.duration;
      distances.set(nodeId, totalDistance);
      if (maxPredecessor) {
        path.set(nodeId, maxPredecessor);
      }

      return totalDistance;
    }

    // Calculate distances for all nodes
    tasks.forEach(task => dfs(task.id));

    // Find the node with maximum distance (end of critical path)
    let maxDistance = 0;
    let endNode = '';
    distances.forEach((distance, nodeId) => {
      if (distance > maxDistance) {
        maxDistance = distance;
        endNode = nodeId;
      }
    });

    // Reconstruct critical path
    const criticalPath: string[] = [];
    let currentNode = endNode;
    while (currentNode) {
      criticalPath.unshift(currentNode);
      currentNode = path.get(currentNode) || '';
    }

    return criticalPath;
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTaskColor = (task: GanttTask): string => {
    if (task.isOnCriticalPath && showCriticalPath) {
      return 'bg-cortex-error';
    }
    
    if (task.type === 'project') {
      return 'bg-cortex-info';
    }

    switch (task.priority) {
      case 'critical': return 'bg-cortex-error';
      case 'high': return 'bg-cortex-warning';
      case 'medium': return 'bg-cortex-info';
      case 'low': return 'bg-cortex-success';
      default: return 'bg-cortex-text-muted';
    }
  };

  const getProgressColor = (task: GanttTask): string => {
    if (task.progress >= 90) return 'bg-cortex-success';
    if (task.progress >= 70) return 'bg-cortex-info';
    if (task.progress >= 40) return 'bg-cortex-warning';
    return 'bg-cortex-error';
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTask(selectedTask === taskId ? null : taskId);
  };

  const handleTaskDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleTaskDragEnd = () => {
    setDraggedTask(null);
  };

  const generateTimeScale = () => {
    const minDate = Math.min(...tasksWithCriticalPath.map(task => task.start.getTime()));
    const maxDate = Math.max(...tasksWithCriticalPath.map(task => task.end.getTime()));
    
    const startDate = new Date(minDate);
    const endDate = new Date(maxDate);
    
    // Add padding
    startDate.setDate(startDate.getDate() - 7);
    endDate.setDate(endDate.getDate() + 7);
    
    const timeScale = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      timeScale.push(new Date(current));
      if (viewMode === 'day') {
        current.setDate(current.getDate() + 1);
      } else if (viewMode === 'week') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }
    
    return timeScale;
  };

  const timeScale = generateTimeScale();
  const totalDays = timeScale.length * (viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30);
  const pixelsPerDay = 2; // Adjust for zoom level

  const calculateTaskPosition = (task: GanttTask) => {
    const minDate = timeScale[0].getTime();
    const startOffset = (task.start.getTime() - minDate) / (1000 * 60 * 60 * 24) * pixelsPerDay;
    const duration = (task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24) * pixelsPerDay;
    
    return {
      left: Math.max(0, startOffset),
      width: Math.max(10, duration), // Minimum width
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cortex-text-primary">TRR Gantt Chart</h2>
          <p className="text-cortex-text-secondary">
            Timeline view with dependencies and critical path analysis
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* View Mode */}
          <div className="flex items-center border border-cortex-border-secondary rounded-lg">
            {['day', 'week', 'month'].map(mode => (
              <button
                key={mode}
                onClick={() => onViewModeChange?.(mode as any)}
                className={`px-3 py-2 text-sm transition-colors ${
                  viewMode === mode
                    ? 'bg-cortex-green text-white'
                    : 'text-cortex-text-secondary hover:bg-cortex-bg-hover'
                } ${mode === 'day' ? 'rounded-l-lg' : mode === 'month' ? 'rounded-r-lg' : ''}`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Critical Path Toggle */}
          <CortexButton
            onClick={() => onToggleCriticalPath?.(!showCriticalPath)}
            variant={showCriticalPath ? 'primary' : 'outline'}
            icon="🎯"
            size="sm"
          >
            Critical Path
          </CortexButton>

          {/* Dependencies Toggle */}
          <CortexButton
            onClick={() => setShowDependencies(!showDependencies)}
            variant={showDependencies ? 'primary' : 'outline'}
            icon="🔗"
            size="sm"
          >
            Dependencies
          </CortexButton>
        </div>
      </div>

      {/* Timeline View */}
      <div className="cortex-card">
        <div className="p-4 border-b border-cortex-border-secondary">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-cortex-text-primary">Timeline</h3>
            <div className="flex items-center space-x-4">
              {showCriticalPath && (
                <div className="text-sm text-cortex-text-muted">
                  <span className="inline-block w-3 h-3 bg-cortex-error rounded mr-2"></span>
                  Critical Path ({criticalPathTasks.length} tasks)
                </div>
              )}
              <div className="text-sm text-cortex-text-muted">
                {tasksWithCriticalPath.length} tasks total
              </div>
            </div>
          </div>
        </div>

        {/* Time Scale Header */}
        <div className="p-4 border-b border-cortex-border-secondary overflow-x-auto">
          <div className="flex" style={{ minWidth: `${timeScale.length * 100}px` }}>
            {timeScale.map((date, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-24 text-center text-sm text-cortex-text-secondary border-r border-cortex-border-secondary last:border-r-0"
              >
                {formatDate(date)}
                {viewMode === 'week' && (
                  <div className="text-xs text-cortex-text-muted">Week</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Gantt Chart Body */}
        <div className="relative">
          <div className="space-y-2 p-4">
            {tasksWithCriticalPath.map((task, index) => {
              const position = calculateTaskPosition(task);
              const isSelected = selectedTask === task.id;
              const isDragged = draggedTask === task.id;

              return (
                <div key={task.id} className="relative flex items-center min-h-[40px]">
                  {/* Task Label */}
                  <div className="w-64 pr-4 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded ${getTaskColor(task)}`}></div>
                      <div>
                        <h4 className={`text-sm font-medium truncate ${
                          task.type === 'project' ? 'text-cortex-info' : 'text-cortex-text-primary'
                        }`}>
                          {task.name}
                        </h4>
                        <div className="text-xs text-cortex-text-muted">
                          {task.type === 'trr' ? `${task.assignee || 'Unassigned'}` : 'Project'}
                          {task.isOnCriticalPath && showCriticalPath && (
                            <span className="ml-2 text-cortex-error">🎯 Critical</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="flex-1 relative h-6 bg-cortex-bg-tertiary rounded overflow-x-auto">
                    <div
                      className={`absolute top-0 h-full rounded cursor-pointer transition-all duration-200 ${
                        getTaskColor(task)
                      } ${
                        isSelected ? 'ring-2 ring-cortex-green' : ''
                      } ${
                        isDragged ? 'opacity-50' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{
                        left: `${position.left}px`,
                        width: `${position.width}px`,
                      }}
                      onClick={() => handleTaskClick(task.id)}
                      draggable
                      onDragStart={() => handleTaskDragStart(task.id)}
                      onDragEnd={handleTaskDragEnd}
                      title={`${task.name} (${formatDate(task.start)} - ${formatDate(task.end)})`}
                    >
                      {/* Progress Bar */}
                      <div
                        className={`h-full ${getProgressColor(task)} opacity-60`}
                        style={{ width: `${task.progress}%` }}
                      ></div>

                      {/* Task Text */}
                      {position.width > 80 && (
                        <div className="absolute inset-0 flex items-center px-2">
                          <span className="text-xs text-white font-medium truncate">
                            {task.progress}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Dependencies Lines */}
                    {showDependencies && task.dependencies?.map(depId => {
                      const depTask = tasksWithCriticalPath.find(t => t.id === depId);
                      if (!depTask) return null;

                      const depPosition = calculateTaskPosition(depTask);
                      const startX = depPosition.left + depPosition.width;
                      const endX = position.left;
                      const startY = tasksWithCriticalPath.indexOf(depTask) * 42 + 20;
                      const endY = index * 42 + 20;

                      return (
                        <svg
                          key={`dep-${depId}-${task.id}`}
                          className="absolute top-0 left-0 w-full h-full pointer-events-none"
                          style={{ zIndex: 10 }}
                        >
                          <path
                            d={`M ${startX} ${startY - index * 42} Q ${(startX + endX) / 2} ${startY - index * 42} ${endX} ${endY - index * 42}`}
                            stroke={task.isOnCriticalPath && depTask.isOnCriticalPath && showCriticalPath ? '#ef4444' : '#6b7280'}
                            strokeWidth="2"
                            fill="none"
                            markerEnd="url(#arrowhead)"
                          />
                        </svg>
                      );
                    })}
                  </div>

                  {/* Task Info */}
                  <div className="w-32 pl-4 text-xs text-cortex-text-muted">
                    <div>{formatDate(task.start)} - {formatDate(task.end)}</div>
                    <div>{Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24))} days</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Arrow marker for dependencies */}
          <svg className="absolute top-0 left-0 w-0 h-0">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>

      {/* Task Details Panel */}
      {selectedTask && (
        <div className="cortex-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cortex-text-primary">Task Details</h3>
            <CortexButton
              onClick={() => setSelectedTask(null)}
              variant="outline"
              size="sm"
              icon="✕"
            />
          </div>

          {(() => {
            const task = tasksWithCriticalPath.find(t => t.id === selectedTask);
            if (!task) return null;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-cortex-text-primary mb-2">{task.name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-cortex-text-muted">Type:</span>
                      <span className="text-cortex-text-primary">{task.type.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cortex-text-muted">Start:</span>
                      <span className="text-cortex-text-primary">{formatDate(task.start)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cortex-text-muted">End:</span>
                      <span className="text-cortex-text-primary">{formatDate(task.end)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cortex-text-muted">Progress:</span>
                      <span className="text-cortex-text-primary">{task.progress}%</span>
                    </div>
                    {task.assignee && (
                      <div className="flex justify-between">
                        <span className="text-cortex-text-muted">Assignee:</span>
                        <span className="text-cortex-text-primary">{task.assignee}</span>
                      </div>
                    )}
                    {task.priority && (
                      <div className="flex justify-between">
                        <span className="text-cortex-text-muted">Priority:</span>
                        <span className={`${
                          task.priority === 'critical' ? 'text-cortex-error' :
                          task.priority === 'high' ? 'text-cortex-warning' :
                          task.priority === 'medium' ? 'text-cortex-info' :
                          'text-cortex-success'
                        }`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-cortex-text-primary mb-2">Dependencies</h5>
                  {task.dependencies && task.dependencies.length > 0 ? (
                    <div className="space-y-2">
                      {task.dependencies.map(depId => {
                        const depTask = tasksWithCriticalPath.find(t => t.id === depId);
                        if (!depTask) return null;
                        return (
                          <div key={depId} className="flex items-center justify-between p-2 bg-cortex-bg-tertiary rounded">
                            <span className="text-sm text-cortex-text-primary">{depTask.name}</span>
                            {onDependencyRemove && (
                              <button
                                onClick={() => onDependencyRemove(depId, task.id)}
                                className="text-cortex-error hover:text-cortex-error-dark text-xs"
                                title="Remove dependency"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-cortex-text-muted">No dependencies</p>
                  )}

                  {task.isOnCriticalPath && showCriticalPath && (
                    <div className="mt-4 p-3 bg-cortex-error/10 border border-cortex-error/20 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-cortex-error">🎯</span>
                        <span className="text-sm font-medium text-cortex-error">
                          Critical Path Task
                        </span>
                      </div>
                      <p className="text-sm text-cortex-text-secondary mt-1">
                        This task is on the critical path. Delays will impact the overall timeline.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="cortex-card p-6">
        <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Project Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-info">
              {tasksWithCriticalPath.filter(task => task.type === 'trr').length}
            </div>
            <p className="text-sm text-cortex-text-muted">Total TRRs</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-error">
              {criticalPathTasks.length}
            </div>
            <p className="text-sm text-cortex-text-muted">Critical Path Tasks</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-warning">
              {tasksWithCriticalPath.filter(task => task.progress < 100 && new Date(task.end) < new Date()).length}
            </div>
            <p className="text-sm text-cortex-text-muted">Overdue Tasks</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-success">
              {Math.round(tasksWithCriticalPath.reduce((sum, task) => sum + task.progress, 0) / tasksWithCriticalPath.length)}%
            </div>
            <p className="text-sm text-cortex-text-muted">Overall Progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TRRGantt;