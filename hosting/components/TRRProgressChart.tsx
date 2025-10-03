'use client';

import React, { useMemo } from 'react';
import { TRR } from '../types/trr';

interface TRRProgressChartProps {
  trrs: TRR[];
  type?: 'completion' | 'velocity' | 'burndown' | 'risk' | 'workload';
  timeframe?: 'week' | 'month' | 'quarter';
  groupBy?: 'status' | 'priority' | 'assignee' | 'customer' | 'project';
  showPredictions?: boolean;
}

export const TRRProgressChart: React.FC<TRRProgressChartProps> = ({
  trrs,
  type = 'completion',
  timeframe = 'month',
  groupBy = 'status',
  showPredictions = true
}) => {
  // Helper function to calculate completion percentage
  const getCompletionPercentage = (trr: TRR): number => {
    switch (trr.status) {
      case 'completed':
        return 100;
      case 'validated':
        return 95;
      case 'in-progress':
        // Base progress on test cases completion
        const completedTests = trr.testCases.filter(tc => 
          tc.status === 'passed' || tc.status === 'failed' || tc.status === 'skipped'
        ).length;
        const totalTests = trr.testCases.length || 1;
        return Math.round((completedTests / totalTests) * 70) + 20; // 20-90%
      case 'pending':
        return 10;
      case 'draft':
        return 5;
      default:
        return 0;
    }
  };

  // Calculate metrics based on type
  const chartData = useMemo(() => {
    switch (type) {
      case 'completion':
        return calculateCompletionData();
      case 'velocity':
        return calculateVelocityData();
      case 'burndown':
        return calculateBurndownData();
      case 'risk':
        return calculateRiskData();
      case 'workload':
        return calculateWorkloadData();
      default:
        return calculateCompletionData();
    }
  }, [trrs, type, timeframe, groupBy]);

  function calculateCompletionData() {
    const groups = new Map<string, TRR[]>();
    
    trrs.forEach(trr => {
      let key = 'all';
      
      switch (groupBy) {
        case 'status':
          key = trr.status;
          break;
        case 'priority':
          key = trr.priority;
          break;
        case 'assignee':
          key = trr.assignedTo;
          break;
        case 'customer':
          key = trr.customer;
          break;
        case 'project':
          key = trr.project || 'unassigned';
          break;
      }
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(trr);
    });

    return Array.from(groups.entries()).map(([key, groupTrrs]) => {
      const totalProgress = groupTrrs.reduce((sum, trr) => sum + getCompletionPercentage(trr), 0);
      const averageProgress = groupTrrs.length > 0 ? totalProgress / groupTrrs.length : 0;
      
      return {
        label: key,
        value: averageProgress,
        count: groupTrrs.length,
        trrs: groupTrrs
      };
    });
  }

  function calculateVelocityData() {
    // Calculate TRRs completed per week/month
    const now = new Date();
    const periods = [];
    const periodLength = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
    
    for (let i = 5; i >= 0; i--) {
      const endDate = new Date(now.getTime() - (i * periodLength * 24 * 60 * 60 * 1000));
      const startDate = new Date(endDate.getTime() - (periodLength * 24 * 60 * 60 * 1000));
      
      const completedInPeriod = trrs.filter(trr => {
        if (!trr.completedDate) return false;
        const completedDate = new Date(trr.completedDate);
        return completedDate >= startDate && completedDate <= endDate;
      }).length;
      
      periods.push({
        label: endDate.toLocaleDateString('en-US', { 
          month: 'short', 
          ...(timeframe === 'week' ? { day: 'numeric' } : {})
        }),
        value: completedInPeriod,
        count: completedInPeriod
      });
    }
    
    return periods;
  }

  function calculateBurndownData() {
    // Show remaining hours over time
    const now = new Date();
    const periods = [];
    const periodLength = timeframe === 'week' ? 7 : 30;
    
    for (let i = 10; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * periodLength * 24 * 60 * 60 * 1000));
      
      const remainingHours = trrs
        .filter(trr => new Date(trr.createdDate) <= date && trr.status !== 'completed')
        .reduce((sum, trr) => {
          const estimated = trr.estimatedHours || 0;
          const actual = trr.actualHours || 0;
          return sum + Math.max(0, estimated - actual);
        }, 0);
      
      periods.push({
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: remainingHours,
        count: remainingHours
      });
    }
    
    return periods;
  }

  function calculateRiskData() {
    const riskLevels = ['low', 'medium', 'high', 'critical'];
    
    return riskLevels.map(level => {
      const risksAtLevel = trrs.filter(trr => trr.riskLevel === level);
      return {
        label: level,
        value: risksAtLevel.length,
        count: risksAtLevel.length,
        trrs: risksAtLevel
      };
    });
  }

  function calculateWorkloadData() {
    const workload = new Map<string, {hours: number, count: number, trrs: TRR[]}>();
    
    trrs.forEach(trr => {
      const assignee = trr.assignedTo;
      if (!workload.has(assignee)) {
        workload.set(assignee, {hours: 0, count: 0, trrs: []});
      }
      
      const current = workload.get(assignee)!;
      current.hours += trr.estimatedHours || 0;
      current.count += 1;
      current.trrs.push(trr);
    });
    
    return Array.from(workload.entries()).map(([assignee, data]) => ({
      label: assignee,
      value: data.hours,
      count: data.count,
      trrs: data.trrs
    }));
  }

  // Get color for different chart types
  const getBarColor = (index: number, label?: string) => {
    if (type === 'risk') {
      switch (label) {
        case 'low': return 'bg-green-500';
        case 'medium': return 'bg-yellow-500';
        case 'high': return 'bg-orange-500';
        case 'critical': return 'bg-red-500';
        default: return 'bg-gray-500';
      }
    } else if (type === 'completion' && groupBy === 'status') {
      switch (label) {
        case 'draft': return 'bg-gray-500';
        case 'pending': return 'bg-yellow-500';
        case 'in-progress': return 'bg-blue-500';
        case 'validated': return 'bg-green-500';
        case 'completed': return 'bg-green-600';
        default: return 'bg-gray-500';
      }
    }
    
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-red-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  // Calculate max value for scaling
  const maxValue = Math.max(...chartData.map(d => d.value));
  const scaleValue = maxValue || 1;

  // Chart title
  const getChartTitle = () => {
    switch (type) {
      case 'completion': return `Completion Progress by ${groupBy}`;
      case 'velocity': return `Velocity (TRRs completed per ${timeframe})`;
      case 'burndown': return `Burndown (Remaining hours over time)`;
      case 'risk': return 'Risk Distribution';
      case 'workload': return 'Workload by Assignee';
      default: return 'TRR Progress';
    }
  };

  return (
    <div className="cortex-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-cortex-text-primary">
          {getChartTitle()}
        </h3>
        
        {/* Chart controls */}
        <div className="flex space-x-2">
          {type === 'velocity' || type === 'burndown' ? (
            <select 
              className="px-2 py-1 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded text-xs text-cortex-text-primary"
              value={timeframe}
              disabled
            >
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="quarter">Quarterly</option>
            </select>
          ) : null}
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={item.label} className="flex items-center">
            {/* Label */}
            <div className="w-24 text-sm text-cortex-text-secondary truncate" title={item.label}>
              {item.label}
            </div>
            
            {/* Bar */}
            <div className="flex-1 ml-3">
              <div className="flex items-center">
                <div className="flex-1 bg-cortex-bg-tertiary rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getBarColor(index, item.label)} transition-all duration-300`}
                    style={{ 
                      width: `${maxValue > 0 ? (item.value / scaleValue) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                
                {/* Value */}
                <div className="ml-3 text-sm text-cortex-text-primary font-mono w-16 text-right">
                  {type === 'completion' ? `${item.value.toFixed(1)}%` : 
                   type === 'workload' ? `${item.value}h` :
                   item.value.toString()}
                </div>
                
                {/* Count */}
                {item.count !== undefined && (
                  <div className="ml-2 text-xs text-cortex-text-muted w-12 text-right">
                    ({item.count})
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-cortex-border-secondary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-cortex-text-primary">{trrs.length}</div>
            <div className="text-cortex-text-secondary">Total TRRs</div>
          </div>
          
          {type === 'completion' && (
            <div className="text-center">
              <div className="text-lg font-bold text-cortex-green">
                {trrs.filter(t => t.status === 'completed' || t.status === 'validated').length}
              </div>
              <div className="text-cortex-text-secondary">Completed</div>
            </div>
          )}
          
          {type === 'workload' && (
            <div className="text-center">
              <div className="text-lg font-bold text-cortex-info">
                {chartData.reduce((sum, item) => sum + item.value, 0)}h
              </div>
              <div className="text-cortex-text-secondary">Total Hours</div>
            </div>
          )}
          
          {type === 'risk' && (
            <div className="text-center">
              <div className="text-lg font-bold text-cortex-error">
                {trrs.filter(t => t.riskLevel === 'high' || t.riskLevel === 'critical').length}
              </div>
              <div className="text-cortex-text-secondary">High Risk</div>
            </div>
          )}
          
          <div className="text-center">
            <div className="text-lg font-bold text-cortex-warning">
              {trrs.filter(t => t.status === 'in-progress').length}
            </div>
            <div className="text-cortex-text-secondary">In Progress</div>
          </div>
        </div>
      </div>

      {/* AI Predictions Summary */}
      {showPredictions && type === 'completion' && (
        <div className="mt-4 p-3 bg-purple-900/20 rounded border border-purple-500/30">
          <div className="text-sm text-purple-400 font-medium mb-2">
            🤖 AI Predictions Summary
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-purple-300">Average Confidence</div>
              <div className="text-white">
                85%
              </div>
            </div>
            
            <div>
              <div className="text-purple-300">Early Completions</div>
              <div className="text-white">
                {trrs.filter(t => t.status === 'completed').length} / {trrs.length}
              </div>
            </div>
            
            <div>
              <div className="text-purple-300">At Risk</div>
              <div className="text-white">
                {trrs.filter(t => t.status === 'pending' && t.riskLevel === 'high').length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {chartData.length === 0 && (
        <div className="text-center py-6 text-cortex-text-muted">
          No data available for selected criteria
        </div>
      )}
    </div>
  );
};