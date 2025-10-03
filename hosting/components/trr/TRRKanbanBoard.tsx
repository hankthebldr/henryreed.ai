'use client';

import React, { useState, useCallback } from 'react';
import { TRR } from '../../types/trr';
import CortexButton from '../CortexButton';

interface TRRKanbanBoardProps {
  trrs: TRR[];
  onTRRMove: (trrId: string, newStatus: string) => void;
  onTRRClick?: (trr: TRR) => void;
  onCreateTRR?: (status: string) => void;
  onBulkUpdate?: (trrIds: string[], updates: any) => void;
  loading?: boolean;
}

// Define Kanban columns configuration
const KANBAN_COLUMNS = [
  {
    id: 'draft',
    title: 'Draft',
    icon: '📝',
    color: 'border-cortex-text-muted bg-cortex-text-muted/5',
    maxItems: 20
  },
  {
    id: 'pending',
    title: 'Pending',
    icon: '⏳',
    color: 'border-cortex-warning bg-cortex-warning/5',
    maxItems: 15
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    icon: '🔄',
    color: 'border-cortex-info bg-cortex-info/5',
    maxItems: 10
  },
  {
    id: 'in-review',
    title: 'In Review',
    icon: '👀',
    color: 'border-cortex-info bg-cortex-info/5',
    maxItems: 8
  },
  {
    id: 'validated',
    title: 'Validated',
    icon: '✅',
    color: 'border-cortex-green bg-cortex-green/5',
    maxItems: 12
  },
  {
    id: 'completed',
    title: 'Completed',
    icon: '🎉',
    color: 'border-cortex-success bg-cortex-success/5',
    maxItems: 25
  },
  {
    id: 'rejected',
    title: 'Rejected',
    icon: '❌',
    color: 'border-cortex-error bg-cortex-error/5',
    maxItems: 10
  },
  {
    id: 'deferred',
    title: 'Deferred',
    icon: '⏸️',
    color: 'border-cortex-text-muted bg-cortex-text-muted/5',
    maxItems: 15
  }
];

export const TRRKanbanBoard: React.FC<TRRKanbanBoardProps> = ({
  trrs,
  onTRRMove,
  onTRRClick,
  onCreateTRR,
  onBulkUpdate,
  loading = false
}) => {
  const [selectedTRRs, setSelectedTRRs] = useState<string[]>([]);
  const [draggedTRR, setDraggedTRR] = useState<string | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string): string => {
    const colors = {
      'low': 'bg-cortex-text-muted/20 text-cortex-text-muted',
      'medium': 'bg-cortex-info/20 text-cortex-info',
      'high': 'bg-cortex-warning/20 text-cortex-warning',
      'critical': 'bg-cortex-error/20 text-cortex-error'
    };
    return colors[priority as keyof typeof colors] || 'bg-cortex-text-muted/20 text-cortex-text-muted';
  };

  const getRiskLevelColor = (riskLevel: string): string => {
    const colors = {
      'low': 'text-cortex-success',
      'medium': 'text-cortex-info',
      'high': 'text-cortex-warning',
      'critical': 'text-cortex-error'
    };
    return colors[riskLevel as keyof typeof colors] || 'text-cortex-text-muted';
  };

  const calculateProgress = (trr: TRR): number => {
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
  };

  const getAssigneeInitials = (assignee: string): string => {
    return assignee
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleDragStart = (e: React.DragEvent, trrId: string) => {
    setDraggedTRR(trrId);
    e.dataTransfer.setData('text/plain', trrId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOver(columnId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the column area
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDraggedOver(null);
    }
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const trrId = e.dataTransfer.getData('text/plain');
    
    if (trrId && trrId !== newStatus) {
      // Find the TRR and check if status change is valid
      const trr = trrs.find(t => t.id === trrId);
      if (trr && trr.status !== newStatus) {
        onTRRMove(trrId, newStatus);
      }
    }
    
    setDraggedTRR(null);
    setDraggedOver(null);
  };

  const handleDragEnd = () => {
    setDraggedTRR(null);
    setDraggedOver(null);
  };

  const toggleTRRSelection = (trrId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedTRRs(prev =>
      prev.includes(trrId)
        ? prev.filter(id => id !== trrId)
        : [...prev, trrId]
    );
  };

  const selectAllInColumn = (columnId: string) => {
    const columnTRRs = trrs
      .filter(trr => trr.status === columnId)
      .map(trr => trr.id);
    setSelectedTRRs(prev => [...new Set([...prev, ...columnTRRs])]);
  };

  const clearSelection = () => {
    setSelectedTRRs([]);
  };

  // Group TRRs by status
  const trrsByStatus = trrs.reduce((acc, trr) => {
    if (!acc[trr.status]) {
      acc[trr.status] = [];
    }
    acc[trr.status].push(trr);
    return acc;
  }, {} as Record<string, TRR[]>);

  const getTotalEstimatedHours = (columnTRRs: TRR[]): number => {
    return columnTRRs.reduce((sum, trr) => sum + (trr.estimatedHours || 0), 0);
  };

  const getColumnWipLimit = (columnId: string, count: number): { isOverLimit: boolean; limit: number } => {
    const column = KANBAN_COLUMNS.find(col => col.id === columnId);
    const limit = column?.maxItems || 20;
    return {
      isOverLimit: count > limit,
      limit
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cortex-text-primary">TRR Kanban Board</h2>
          <p className="text-cortex-text-secondary">
            {trrs.length} total TRRs • Drag cards to update status
          </p>
        </div>
        
        {/* Bulk Actions */}
        {selectedTRRs.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-cortex-text-primary font-medium">
              {selectedTRRs.length} selected
            </span>
            <CortexButton
              onClick={clearSelection}
              variant="outline"
              size="sm"
            >
              Clear
            </CortexButton>
            {onBulkUpdate && (
              <>
                <CortexButton
                  onClick={() => onBulkUpdate(selectedTRRs, { priority: 'high' })}
                  variant="outline"
                  size="sm"
                  icon="⚠️"
                >
                  Mark High Priority
                </CortexButton>
                <CortexButton
                  onClick={() => onBulkUpdate(selectedTRRs, { assignee: 'bulk-assign' })}
                  variant="outline"
                  size="sm"
                  icon="👥"
                >
                  Reassign
                </CortexButton>
              </>
            )}
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex space-x-6 pb-6" style={{ minWidth: 'max-content' }}>
          {KANBAN_COLUMNS.map(column => {
            const columnTRRs = trrsByStatus[column.id] || [];
            const wipStatus = getColumnWipLimit(column.id, columnTRRs.length);
            const totalHours = getTotalEstimatedHours(columnTRRs);
            
            return (
              <div
                key={column.id}
                className={`flex-shrink-0 w-80 h-full min-h-[600px] border-2 rounded-lg transition-all duration-200 ${
                  column.color
                } ${
                  draggedOver === column.id
                    ? 'border-cortex-green shadow-lg transform scale-105'
                    : wipStatus.isOverLimit
                    ? 'border-cortex-error shadow-md'
                    : ''
                }`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-cortex-border-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{column.icon}</span>
                      <h3 className="font-semibold text-cortex-text-primary">
                        {column.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        wipStatus.isOverLimit 
                          ? 'bg-cortex-error text-white' 
                          : 'bg-cortex-text-muted/20 text-cortex-text-muted'
                      }`}>
                        {columnTRRs.length}
                        {wipStatus.isOverLimit && ` / ${wipStatus.limit}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => selectAllInColumn(column.id)}
                        className="text-xs text-cortex-text-muted hover:text-cortex-text-secondary"
                        title="Select all in column"
                      >
                        □
                      </button>
                      {onCreateTRR && (
                        <CortexButton
                          onClick={() => onCreateTRR(column.id)}
                          variant="outline"
                          size="sm"
                          icon="➕"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Column Stats */}
                  <div className="text-xs text-cortex-text-muted">
                    {totalHours}h estimated
                    {wipStatus.isOverLimit && (
                      <span className="text-cortex-error ml-2">
                        ⚠️ Over WIP limit ({wipStatus.limit})
                      </span>
                    )}
                  </div>
                </div>

                {/* Column Content */}
                <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-96">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-cortex-green"></div>
                      <p className="text-cortex-text-muted mt-2">Loading...</p>
                    </div>
                  ) : columnTRRs.length === 0 ? (
                    <div className="text-center py-8 text-cortex-text-muted">
                      <div className="text-2xl mb-2">{column.icon}</div>
                      <p className="text-sm">No TRRs in {column.title.toLowerCase()}</p>
                      {onCreateTRR && (
                        <CortexButton
                          onClick={() => onCreateTRR(column.id)}
                          variant="outline"
                          size="sm"
                          icon="➕"
                          className="mt-2"
                        >
                          Create TRR
                        </CortexButton>
                      )}
                    </div>
                  ) : (
                    columnTRRs.map(trr => {
                      const progress = calculateProgress(trr);
                      const isSelected = selectedTRRs.includes(trr.id);
                      const isDragging = draggedTRR === trr.id;
                      const isOverdue = trr.dueDate && new Date(trr.dueDate) < new Date();
                      
                      return (
                        <div
                          key={trr.id}
                          className={`cortex-card p-4 cursor-pointer transition-all duration-200 ${
                            isSelected ? 'ring-2 ring-cortex-green shadow-md' : ''
                          } ${
                            isDragging ? 'opacity-50 transform rotate-2' : 'hover:shadow-md'
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, trr.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => onTRRClick?.(trr)}
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => toggleTRRSelection(trr.id, e)}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded border-cortex-border-secondary focus:ring-cortex-green"
                              />
                              <h4 className="font-medium text-cortex-text-primary truncate">
                                {trr.title}
                              </h4>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              {/* Priority Badge */}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(trr.priority)}`}>
                                {trr.priority.charAt(0).toUpperCase()}
                              </span>
                              
                              {/* Risk Indicator */}
                              <span className={`w-2 h-2 rounded-full ${getRiskLevelColor(trr.riskLevel)}`} 
                                    title={`${trr.riskLevel} risk`}>
                              </span>
                            </div>
                          </div>

                          {/* TRR ID and Customer */}
                          <div className="text-xs text-cortex-text-muted mb-2 font-mono">
                            {trr.id} • {trr.customer}
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="text-cortex-text-muted">Progress</span>
                              <span className="font-medium text-cortex-text-primary">{progress}%</span>
                            </div>
                            <div className="w-full bg-cortex-bg-tertiary rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  trr.status === 'validated' || trr.status === 'completed' ? 'bg-cortex-green' :
                                  trr.status === 'in-progress' ? 'bg-cortex-info' :
                                  trr.status === 'rejected' ? 'bg-cortex-error' :
                                  'bg-cortex-warning'
                                }`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {/* Assignee Avatar */}
                              {trr.assignedTo && (
                                <div className="w-6 h-6 bg-cortex-info text-white rounded-full flex items-center justify-center text-xs font-bold"
                                     title={trr.assignedTo}>
                                  {getAssigneeInitials(trr.assignedTo)}
                                </div>
                              )}
                              
                              {/* Test Cases Count */}
                              {trr.testCases && trr.testCases.length > 0 && (
                                <span className="px-2 py-1 bg-cortex-info/10 text-cortex-info rounded text-xs">
                                  🧪 {trr.testCases.length}
                                </span>
                              )}
                              
                              {/* Comments Count */}
                              {trr.comments && trr.comments.length > 0 && (
                                <span className="px-2 py-1 bg-cortex-success/10 text-cortex-success rounded text-xs">
                                  💬 {trr.comments.length}
                                </span>
                              )}
                            </div>
                            
                            {/* Due Date */}
                            {trr.dueDate && (
                              <div className={`text-xs px-2 py-1 rounded ${
                                isOverdue 
                                  ? 'bg-cortex-error/10 text-cortex-error' 
                                  : new Date(trr.dueDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
                                    ? 'bg-cortex-warning/10 text-cortex-warning'
                                    : 'text-cortex-text-muted'
                              }`}>
                                📅 {formatDate(trr.dueDate)}
                                {isOverdue && ' ⚠️'}
                              </div>
                            )}
                          </div>

                          {/* Quick Actions on Hover */}
                          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-cortex-text-muted">
                                {trr.estimatedHours || 0}h estimated
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Quick edit priority
                                  }}
                                  className="p-1 hover:bg-cortex-bg-hover rounded"
                                  title="Edit priority"
                                >
                                  ⚡
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Quick assign
                                  }}
                                  className="p-1 hover:bg-cortex-bg-hover rounded"
                                  title="Reassign"
                                >
                                  👤
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="cortex-card p-6">
        <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Board Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-info">
              {trrs.filter(trr => trr.status === 'in-progress').length}
            </div>
            <p className="text-sm text-cortex-text-muted">Active TRRs</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-success">
              {trrs.filter(trr => trr.status === 'completed').length}
            </div>
            <p className="text-sm text-cortex-text-muted">Completed</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-warning">
              {trrs.filter(trr => trr.dueDate && new Date(trr.dueDate) < new Date()).length}
            </div>
            <p className="text-sm text-cortex-text-muted">Overdue</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cortex-text-primary">
              {trrs.reduce((sum, trr) => sum + (trr.estimatedHours || 0), 0)}h
            </div>
            <p className="text-sm text-cortex-text-muted">Total Effort</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TRRKanbanBoard;