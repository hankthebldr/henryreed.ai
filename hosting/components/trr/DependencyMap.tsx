'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { TRR } from '../../types/trr';
import CortexButton from '../CortexButton';

// Simple node and edge interfaces for dependency visualization
interface DependencyNode {
  id: string;
  type: 'trr' | 'milestone';
  data: {
    trr?: TRR;
    title: string;
    status: string;
    priority: string;
    assignee?: string;
    progress: number;
    isOnCriticalPath: boolean;
    isBlocked: boolean;
    estimatedDays: number;
  };
  position: { x: number; y: number };
}

interface DependencyEdge {
  id: string;
  source: string;
  target: string;
  type: 'dependency' | 'blocking';
  isOnCriticalPath: boolean;
}

interface DependencyMapProps {
  trrs: TRR[];
  onDependencyAdd?: (fromId: string, toId: string) => void;
  onDependencyRemove?: (fromId: string, toId: string) => void;
  onNodeClick?: (trr: TRR) => void;
  showCriticalPath?: boolean;
  onToggleCriticalPath?: (show: boolean) => void;
  layoutType?: 'hierarchical' | 'circular' | 'force';
  onLayoutChange?: (layout: 'hierarchical' | 'circular' | 'force') => void;
}

export const DependencyMap: React.FC<DependencyMapProps> = ({
  trrs,
  onDependencyAdd,
  onDependencyRemove,
  onNodeClick,
  showCriticalPath = false,
  onToggleCriticalPath,
  layoutType = 'hierarchical',
  onLayoutChange,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showAddDependency, setShowAddDependency] = useState(false);
  const [pendingDependency, setPendingDependency] = useState<{ from: string; to: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate critical path
  const criticalPath = useMemo(() => {
    return calculateCriticalPath(trrs);
  }, [trrs]);

  // Create nodes and edges from TRRs
  const { nodes, edges } = useMemo(() => {
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];

    // Create nodes for each TRR
    trrs.forEach((trr, index) => {
      const progress = calculateProgress(trr);
      const isBlocked = trr.dependencies?.some(depId => {
        const depTRR = trrs.find(t => t.id === depId);
        return depTRR && depTRR.status !== 'completed' && depTRR.status !== 'validated';
      }) || false;

      const position = calculateNodePosition(index, trrs.length, layoutType);

      nodes.push({
        id: trr.id,
        type: 'trr',
        data: {
          trr,
          title: trr.title,
          status: trr.status,
          priority: trr.priority,
          assignee: trr.assignedTo,
          progress,
          isOnCriticalPath: criticalPath.includes(trr.id),
          isBlocked,
          estimatedDays: trr.estimatedHours ? Math.ceil(trr.estimatedHours / 8) : 0,
        },
        position,
      });
    });

    // Create edges for dependencies
    trrs.forEach(trr => {
      trr.dependencies?.forEach(depId => {
        if (trrs.find(t => t.id === depId)) {
          edges.push({
            id: `${depId}-${trr.id}`,
            source: depId,
            target: trr.id,
            type: 'dependency',
            isOnCriticalPath: criticalPath.includes(depId) && criticalPath.includes(trr.id),
          });
        }
      });
    });

    return { nodes, edges };
  }, [trrs, layoutType, criticalPath]);

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

  function calculateCriticalPath(trrs: TRR[]): string[] {
    // Build dependency graph
    const graph = new Map<string, { duration: number; dependencies: string[] }>();
    
    trrs.forEach(trr => {
      const duration = trr.estimatedHours ? Math.ceil(trr.estimatedHours / 8) : 1;
      graph.set(trr.id, {
        duration,
        dependencies: trr.dependencies || [],
      });
    });

    // Calculate longest path (critical path)
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

    // Find critical path
    trrs.forEach(trr => dfs(trr.id));

    let maxDistance = 0;
    let endNode = '';
    distances.forEach((distance, nodeId) => {
      if (distance > maxDistance) {
        maxDistance = distance;
        endNode = nodeId;
      }
    });

    // Reconstruct path
    const criticalPath: string[] = [];
    let currentNode = endNode;
    while (currentNode) {
      criticalPath.unshift(currentNode);
      currentNode = path.get(currentNode) || '';
    }

    return criticalPath;
  }

  function calculateNodePosition(index: number, total: number, layout: string): { x: number; y: number } {
    const centerX = 400;
    const centerY = 300;
    const radius = 250;

    switch (layout) {
      case 'circular':
        const angle = (index / total) * 2 * Math.PI;
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      
      case 'force':
        // Simple force layout approximation
        const cols = Math.ceil(Math.sqrt(total));
        const row = Math.floor(index / cols);
        const col = index % cols;
        return {
          x: 100 + col * 180,
          y: 100 + row * 120,
        };
      
      case 'hierarchical':
      default:
        // Hierarchical layout based on dependencies
        const level = calculateNodeLevel(trrs[index], trrs);
        const nodesAtLevel = trrs.filter(trr => calculateNodeLevel(trr, trrs) === level);
        const positionInLevel = nodesAtLevel.indexOf(trrs[index]);
        
        return {
          x: 100 + positionInLevel * 200,
          y: 100 + level * 150,
        };
    }
  }

  function calculateNodeLevel(trr: TRR, allTRRs: TRR[]): number {
    if (!trr.dependencies || trr.dependencies.length === 0) {
      return 0;
    }
    
    let maxLevel = 0;
    trr.dependencies.forEach(depId => {
      const depTRR = allTRRs.find(t => t.id === depId);
      if (depTRR) {
        const depLevel = calculateNodeLevel(depTRR, allTRRs);
        maxLevel = Math.max(maxLevel, depLevel + 1);
      }
    });
    
    return maxLevel;
  }

  const getNodeColor = (node: DependencyNode): string => {
    if (node.data.isOnCriticalPath && showCriticalPath) {
      return 'border-cortex-error bg-cortex-error/10';
    }
    
    if (node.data.isBlocked) {
      return 'border-cortex-error bg-cortex-error/5';
    }

    switch (node.data.status) {
      case 'completed': return 'border-cortex-success bg-cortex-success/10';
      case 'validated': return 'border-cortex-green bg-cortex-green/10';
      case 'in-progress': return 'border-cortex-info bg-cortex-info/10';
      case 'in-review': return 'border-cortex-info bg-cortex-info/10';
      case 'pending': return 'border-cortex-warning bg-cortex-warning/10';
      case 'draft': return 'border-cortex-text-muted bg-cortex-bg-hover';
      default: return 'border-cortex-border-secondary bg-cortex-bg-secondary';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'text-cortex-error';
      case 'high': return 'text-cortex-warning';
      case 'medium': return 'text-cortex-info';
      case 'low': return 'text-cortex-success';
      default: return 'text-cortex-text-muted';
    }
  };

  const handleNodeClick = (node: DependencyNode) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
    if (node.data.trr && onNodeClick) {
      onNodeClick(node.data.trr);
    }
  };

  const filteredTRRs = useMemo(() => {
    if (!searchQuery.trim()) return trrs;
    const query = searchQuery.toLowerCase();
    return trrs.filter(trr =>
      trr.title.toLowerCase().includes(query) ||
      trr.id.toLowerCase().includes(query) ||
      trr.assignedTo?.toLowerCase().includes(query)
    );
  }, [trrs, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cortex-text-primary">Dependency Map</h2>
          <p className="text-cortex-text-secondary">
            Visualize TRR dependencies and critical path analysis
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Layout Selector */}
          <select
            value={layoutType}
            onChange={(e) => onLayoutChange?.(e.target.value as any)}
            className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
          >
            <option value="hierarchical">Hierarchical</option>
            <option value="circular">Circular</option>
            <option value="force">Force</option>
          </select>

          {/* Critical Path Toggle */}
          <CortexButton
            onClick={() => onToggleCriticalPath?.(!showCriticalPath)}
            variant={showCriticalPath ? 'primary' : 'outline'}
            icon="🎯"
            size="sm"
          >
            Critical Path
          </CortexButton>

          {/* Add Dependency */}
          {onDependencyAdd && (
            <CortexButton
              onClick={() => setShowAddDependency(true)}
              variant="outline"
              icon="🔗"
              size="sm"
            >
              Add Dependency
            </CortexButton>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search TRRs by title, ID, or assignee..."
          className="w-full pl-10 pr-4 py-2 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
        />
        <div className="absolute left-3 top-2.5 text-cortex-text-muted">
          🔍
        </div>
      </div>

      {/* Dependency Map */}
      <div className="cortex-card">
        <div className="p-4 border-b border-cortex-border-secondary">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-cortex-text-primary">Network Visualization</h3>
            <div className="flex items-center space-x-4 text-sm">
              {showCriticalPath && (
                <div className="text-cortex-text-muted">
                  <span className="inline-block w-3 h-3 bg-cortex-error rounded mr-2"></span>
                  Critical Path ({criticalPath.length} nodes)
                </div>
              )}
              <div className="text-cortex-text-muted">
                {nodes.length} nodes, {edges.length} dependencies
              </div>
            </div>
          </div>
        </div>

        {/* SVG Visualization */}
        <div className="relative bg-cortex-bg-tertiary overflow-hidden" style={{ height: '600px' }}>
          <svg width="100%" height="100%" className="absolute inset-0">
            {/* Definitions for arrows and patterns */}
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
              <marker
                id="critical-arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
              </marker>
            </defs>

            {/* Render edges */}
            {edges.map(edge => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const isCritical = edge.isOnCriticalPath && showCriticalPath;
              const isBlocking = targetNode.data.isBlocked;

              return (
                <g key={edge.id}>
                  <path
                    d={`M ${sourceNode.position.x + 60} ${sourceNode.position.y + 30} 
                        Q ${(sourceNode.position.x + targetNode.position.x) / 2} ${sourceNode.position.y - 50}
                        ${targetNode.position.x + 60} ${targetNode.position.y + 30}`}
                    stroke={isCritical ? '#ef4444' : isBlocking ? '#f59e0b' : '#6b7280'}
                    strokeWidth={isCritical ? 3 : 2}
                    fill="none"
                    markerEnd={`url(#${isCritical ? 'critical-' : ''}arrowhead)`}
                    className="transition-all duration-200"
                  />
                  
                  {/* Edge label for critical path */}
                  {isCritical && (
                    <text
                      x={(sourceNode.position.x + targetNode.position.x) / 2}
                      y={(sourceNode.position.y + targetNode.position.y) / 2 - 20}
                      textAnchor="middle"
                      className="text-xs fill-cortex-error font-medium"
                    >
                      Critical
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render nodes */}
            {nodes
              .filter(node => 
                !searchQuery.trim() || 
                filteredTRRs.some(trr => trr.id === node.id)
              )
              .map(node => {
                const isSelected = selectedNode === node.id;
                const isHovered = hoveredNode === node.id;
                const nodeColor = getNodeColor(node);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.position.x}, ${node.position.y})`}
                    className="cursor-pointer"
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Node background */}
                    <rect
                      width="120"
                      height="60"
                      rx="8"
                      className={`transition-all duration-200 ${nodeColor} ${
                        isSelected || isHovered ? 'drop-shadow-lg' : ''
                      }`}
                      strokeWidth={isSelected ? 3 : 1}
                    />

                    {/* Progress bar */}
                    <rect
                      x="4"
                      y="52"
                      width={(node.data.progress / 100) * 112}
                      height="4"
                      rx="2"
                      className={`${
                        node.data.progress >= 90 ? 'fill-cortex-success' :
                        node.data.progress >= 70 ? 'fill-cortex-info' :
                        node.data.progress >= 40 ? 'fill-cortex-warning' :
                        'fill-cortex-error'
                      }`}
                    />

                    {/* Node title */}
                    <text
                      x="60"
                      y="16"
                      textAnchor="middle"
                      className="text-xs font-semibold fill-cortex-text-primary"
                    >
                      {node.data.title.length > 15 
                        ? `${node.data.title.substring(0, 12)}...` 
                        : node.data.title
                      }
                    </text>

                    {/* Status and priority */}
                    <text
                      x="8"
                      y="28"
                      className="text-xs fill-cortex-text-secondary"
                    >
                      {node.data.status.toUpperCase()}
                    </text>
                    <text
                      x="8"
                      y="40"
                      className={`text-xs ${getPriorityColor(node.data.priority)}`}
                    >
                      {node.data.priority.charAt(0).toUpperCase()}
                    </text>

                    {/* Assignee */}
                    {node.data.assignee && (
                      <text
                        x="112"
                        y="28"
                        textAnchor="end"
                        className="text-xs fill-cortex-text-muted"
                      >
                        {node.data.assignee.split(' ').map(n => n.charAt(0)).join('')}
                      </text>
                    )}

                    {/* Duration */}
                    <text
                      x="112"
                      y="40"
                      textAnchor="end"
                      className="text-xs fill-cortex-text-muted"
                    >
                      {node.data.estimatedDays}d
                    </text>

                    {/* Status indicators */}
                    {node.data.isOnCriticalPath && showCriticalPath && (
                      <circle
                        cx="108"
                        cy="8"
                        r="4"
                        className="fill-cortex-error"
                        title="Critical Path"
                      />
                    )}
                    
                    {node.data.isBlocked && (
                      <polygon
                        points="8,8 16,8 12,16"
                        className="fill-cortex-warning"
                        title="Blocked"
                      />
                    )}
                  </g>
                );
              })}
          </svg>
        </div>
      </div>

      {/* Node Details */}
      {selectedNode && (
        <div className="cortex-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cortex-text-primary">Node Details</h3>
            <CortexButton
              onClick={() => setSelectedNode(null)}
              variant="outline"
              size="sm"
              icon="✕"
            />
          </div>

          {(() => {
            const node = nodes.find(n => n.id === selectedNode);
            if (!node || !node.data.trr) return null;

            const trr = node.data.trr;
            const dependsOn = trr.dependencies || [];
            const blockedBy = trrs.filter(t => t.dependencies?.includes(trr.id));

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-cortex-text-primary mb-3">{trr.title}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-cortex-text-muted">Status:</span>
                      <span className="text-cortex-text-primary">{trr.status.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cortex-text-muted">Priority:</span>
                      <span className={getPriorityColor(trr.priority)}>
                        {trr.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cortex-text-muted">Progress:</span>
                      <span className="text-cortex-text-primary">{node.data.progress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cortex-text-muted">Assignee:</span>
                      <span className="text-cortex-text-primary">{trr.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cortex-text-muted">Estimated:</span>
                      <span className="text-cortex-text-primary">{node.data.estimatedDays} days</span>
                    </div>
                  </div>

                  {node.data.isOnCriticalPath && showCriticalPath && (
                    <div className="mt-4 p-3 bg-cortex-error/10 border border-cortex-error/20 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-cortex-error">🎯</span>
                        <span className="text-sm font-medium text-cortex-error">
                          Critical Path Node
                        </span>
                      </div>
                    </div>
                  )}

                  {node.data.isBlocked && (
                    <div className="mt-4 p-3 bg-cortex-warning/10 border border-cortex-warning/20 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-cortex-warning">🚧</span>
                        <span className="text-sm font-medium text-cortex-warning">
                          Blocked
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Dependencies */}
                  <div>
                    <h5 className="font-medium text-cortex-text-primary mb-2">
                      Depends On ({dependsOn.length})
                    </h5>
                    {dependsOn.length > 0 ? (
                      <div className="space-y-2">
                        {dependsOn.map(depId => {
                          const depTRR = trrs.find(t => t.id === depId);
                          if (!depTRR) return null;
                          return (
                            <div key={depId} className="flex items-center justify-between p-2 bg-cortex-bg-tertiary rounded">
                              <span className="text-sm text-cortex-text-primary">{depTRR.title}</span>
                              {onDependencyRemove && (
                                <button
                                  onClick={() => onDependencyRemove(depId, trr.id)}
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
                  </div>

                  {/* Blocks */}
                  <div>
                    <h5 className="font-medium text-cortex-text-primary mb-2">
                      Blocks ({blockedBy.length})
                    </h5>
                    {blockedBy.length > 0 ? (
                      <div className="space-y-2">
                        {blockedBy.map(blockedTRR => (
                          <div key={blockedTRR.id} className="p-2 bg-cortex-bg-tertiary rounded">
                            <span className="text-sm text-cortex-text-primary">{blockedTRR.title}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-cortex-text-muted">Doesn't block anything</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Statistics */}
      <div className="cortex-card p-6">
        <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Network Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-info">
              {nodes.length}
            </div>
            <p className="text-sm text-cortex-text-muted">Total Nodes</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-error">
              {criticalPath.length}
            </div>
            <p className="text-sm text-cortex-text-muted">Critical Path</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-warning">
              {nodes.filter(n => n.data.isBlocked).length}
            </div>
            <p className="text-sm text-cortex-text-muted">Blocked</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-success">
              {Math.round(
                criticalPath.reduce((sum, id) => {
                  const trr = trrs.find(t => t.id === id);
                  return sum + (trr?.estimatedHours ? Math.ceil(trr.estimatedHours / 8) : 0);
                }, 0)
              )}
            </div>
            <p className="text-sm text-cortex-text-muted">Critical Path Days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DependencyMap;