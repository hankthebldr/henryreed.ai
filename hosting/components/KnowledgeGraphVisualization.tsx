'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GraphNode, GraphEdge, KnowledgeGraph, RelationshipType } from '../types/knowledgeBase';

interface KnowledgeGraphVisualizationProps {
  graph: KnowledgeGraph;
  onNodeClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
  highlightedNodeId?: string;
  width?: number;
  height?: number;
}

interface SimulationNode extends GraphNode {
  vx: number;
  vy: number;
  fx?: number;
  fy?: number;
}

export const KnowledgeGraphVisualization: React.FC<KnowledgeGraphVisualizationProps> = ({
  graph,
  onNodeClick,
  onNodeHover,
  highlightedNodeId,
  width = 1200,
  height = 800
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<SimulationNode[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<SimulationNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [filterRelationType, setFilterRelationType] = useState<RelationshipType | 'all'>('all');

  // Initialize node positions with force-directed layout simulation
  useEffect(() => {
    const initialNodes: SimulationNode[] = graph.nodes.map(node => ({
      ...node,
      x: node.x || Math.random() * width,
      y: node.y || Math.random() * height,
      vx: 0,
      vy: 0
    }));

    setNodes(initialNodes);

    // Run simple force simulation
    const simulate = () => {
      const alpha = 0.1;
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        // Apply forces
        applyForces(initialNodes, graph.edges, alpha * (1 - i / iterations));
      }

      setNodes([...initialNodes]);
    };

    simulate();
  }, [graph, width, height]);

  // Simple force-directed layout algorithm
  const applyForces = (simNodes: SimulationNode[], edges: GraphEdge[], alpha: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const repulsionStrength = 5000;
    const attractionStrength = 0.01;
    const centeringStrength = 0.01;

    // Reset velocities
    simNodes.forEach(node => {
      node.vx = 0;
      node.vy = 0;
    });

    // Repulsion between nodes
    for (let i = 0; i < simNodes.length; i++) {
      for (let j = i + 1; j < simNodes.length; j++) {
        const node1 = simNodes[i];
        const node2 = simNodes[j];

        const dx = (node2.x || 0) - (node1.x || 0);
        const dy = (node2.y || 0) - (node1.y || 0);
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = repulsionStrength / (distance * distance);
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        node1.vx -= fx;
        node1.vy -= fy;
        node2.vx += fx;
        node2.vy += fy;
      }
    }

    // Attraction along edges
    edges.forEach(edge => {
      const source = simNodes.find(n => n.id === edge.source);
      const target = simNodes.find(n => n.id === edge.target);

      if (source && target) {
        const dx = (target.x || 0) - (source.x || 0);
        const dy = (target.y || 0) - (source.y || 0);
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = distance * attractionStrength * (edge.weight || 0.5);
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        source.vx += fx;
        source.vy += fy;
        target.vx -= fx;
        target.vy -= fy;
      }
    });

    // Center gravity
    simNodes.forEach(node => {
      const dx = centerX - (node.x || 0);
      const dy = centerY - (node.y || 0);
      node.vx += dx * centeringStrength;
      node.vy += dy * centeringStrength;
    });

    // Update positions
    simNodes.forEach(node => {
      if (!node.fx && !node.fy) {
        node.x = (node.x || 0) + node.vx * alpha;
        node.y = (node.y || 0) + node.vy * alpha;

        // Keep within bounds
        node.x = Math.max(50, Math.min(width - 50, node.x || 0));
        node.y = Math.max(50, Math.min(height - 50, node.y || 0));
      }
    });
  };

  // Filter edges based on selected relationship type
  const filteredEdges = useMemo(() => {
    if (filterRelationType === 'all') return graph.edges;
    return graph.edges.filter(edge => edge.type === filterRelationType);
  }, [graph.edges, filterRelationType]);

  // Get color based on node type
  const getNodeColor = (node: GraphNode): string => {
    if (highlightedNodeId === node.id || selectedNode?.id === node.id) {
      return '#3B82F6'; // blue-500
    }
    if (hoveredNode?.id === node.id) {
      return '#60A5FA'; // blue-400
    }

    switch (node.type) {
      case 'document':
        return '#8B5CF6'; // purple-500
      case 'category':
        return '#10B981'; // green-500
      case 'tag':
        return '#F59E0B'; // amber-500
      case 'topic':
        return '#EC4899'; // pink-500
      case 'author':
        return '#6366F1'; // indigo-500
      default:
        return '#6B7280'; // gray-500
    }
  };

  // Get edge color based on relationship type
  const getEdgeColor = (edge: GraphEdge): string => {
    switch (edge.type) {
      case 'references':
        return '#3B82F6'; // blue
      case 'related-by-tag':
        return '#10B981'; // green
      case 'related-by-topic':
        return '#F59E0B'; // amber
      case 'prerequisite':
        return '#EF4444'; // red
      case 'follow-up':
        return '#8B5CF6'; // purple
      default:
        return '#6B7280'; // gray
    }
  };

  // Mouse event handlers
  const handleMouseDown = (node: SimulationNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedNode(node);
    node.fx = node.x;
    node.fy = node.y;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && draggedNode && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - viewTransform.x) / viewTransform.scale;
      const y = (e.clientY - rect.top - viewTransform.y) / viewTransform.scale;

      draggedNode.fx = x;
      draggedNode.fy = y;
      draggedNode.x = x;
      draggedNode.y = y;

      setNodes([...nodes]);
    }
  };

  const handleMouseUp = () => {
    if (draggedNode) {
      draggedNode.fx = undefined;
      draggedNode.fy = undefined;
    }
    setIsDragging(false);
    setDraggedNode(null);
  };

  const handleNodeClick = (node: GraphNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(node);
    onNodeClick?.(node);
  };

  const handleNodeHover = (node: GraphNode | null) => {
    setHoveredNode(node);
    onNodeHover?.(node);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setViewTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 3) }));
  };

  const handleZoomOut = () => {
    setViewTransform(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.3) }));
  };

  const handleResetView = () => {
    setViewTransform({ x: 0, y: 0, scale: 1 });
  };

  // Get unique relationship types for filter
  const relationshipTypes = useMemo(() => {
    const types = new Set(graph.edges.map(e => e.type));
    return Array.from(types);
  }, [graph.edges]);

  return (
    <div className="glass-card p-6 space-y-4">
      {/* Header and Controls */}
      <div className="flex items-center justify-between border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Knowledge Graph</h2>
          <p className="text-gray-400 text-sm mt-1">
            {graph.nodes.length} documents • {graph.edges.length} connections
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Relationship Filter */}
          <select
            value={filterRelationType}
            onChange={(e) => setFilterRelationType(e.target.value as RelationshipType | 'all')}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
          >
            <option value="all">All Relationships</option>
            {relationshipTypes.map(type => (
              <option key={type} value={type}>
                {type.replace(/-/g, ' ')}
              </option>
            ))}
          </select>

          {/* Zoom Controls */}
          <div className="flex space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
              title="Zoom Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <button
              onClick={handleResetView}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors text-sm"
              title="Reset View"
            >
              {Math.round(viewTransform.scale * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
              title="Zoom In"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-grab active:cursor-grabbing"
        >
          <g transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.scale})`}>
            {/* Render edges */}
            {filteredEdges.map((edge, i) => {
              const source = nodes.find(n => n.id === edge.source);
              const target = nodes.find(n => n.id === edge.target);

              if (!source || !target) return null;

              const isHighlighted =
                selectedNode?.id === source.id ||
                selectedNode?.id === target.id ||
                hoveredNode?.id === source.id ||
                hoveredNode?.id === target.id;

              return (
                <g key={`${edge.source}-${edge.target}-${i}`}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={edge.color || getEdgeColor(edge)}
                    strokeWidth={isHighlighted ? 2.5 : 1.5}
                    strokeOpacity={isHighlighted ? 0.8 : 0.3}
                    markerEnd="url(#arrowhead)"
                  />
                  {edge.label && (
                    <text
                      x={(source.x! + target.x!) / 2}
                      y={(source.y! + target.y!) / 2}
                      fill="#9CA3AF"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render nodes */}
            {nodes.map(node => {
              const isHighlighted =
                highlightedNodeId === node.id ||
                selectedNode?.id === node.id ||
                hoveredNode?.id === node.id;

              const nodeSize = (node.size || 20) + (isHighlighted ? 5 : 0);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={(e) => handleMouseDown(node, e)}
                  onClick={(e) => handleNodeClick(node, e)}
                  onMouseEnter={() => handleNodeHover(node)}
                  onMouseLeave={() => handleNodeHover(null)}
                  className="cursor-pointer"
                >
                  <circle
                    r={nodeSize}
                    fill={node.color || getNodeColor(node)}
                    stroke="#fff"
                    strokeWidth={isHighlighted ? 3 : 2}
                    opacity={0.9}
                  />
                  <text
                    y={nodeSize + 15}
                    textAnchor="middle"
                    fill="#E5E7EB"
                    fontSize="12"
                    fontWeight={isHighlighted ? 'bold' : 'normal'}
                  >
                    {node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label}
                  </text>
                </g>
              );
            })}

            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#6B7280" />
              </marker>
            </defs>
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-purple-500"></div>
          <span className="text-sm text-gray-300">Document</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-300">Category</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-amber-500"></div>
          <span className="text-sm text-gray-300">Tag</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-pink-500"></div>
          <span className="text-sm text-gray-300">Topic</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
          <span className="text-sm text-gray-300">Author</span>
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="bg-gray-800 rounded p-4 border border-blue-500">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-white text-lg">{selectedNode.label}</h3>
              <p className="text-sm text-gray-400">{selectedNode.type}</p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          {selectedNode.metadata && (
            <div className="space-y-2 text-sm">
              {selectedNode.metadata.description && (
                <p className="text-gray-300">{selectedNode.metadata.description}</p>
              )}
              {selectedNode.metadata.tags && selectedNode.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedNode.metadata.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphVisualization;
