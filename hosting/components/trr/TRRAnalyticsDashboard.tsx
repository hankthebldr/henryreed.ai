'use client';

import React, { useState, useMemo } from 'react';
import { TRR, Project } from '../../types/trr';
import { CortexButton } from '../CortexButton';

interface TRRAnalyticsDashboardProps {
  trrs: TRR[];
  projects: Project[];
  teamMembers?: Array<{ id: string; name: string; role: string; capacity: number; skills: string[]; }>;
  dateRange?: { start: Date; end: Date };
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
}

interface MetricCard {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon: string;
  color: 'success' | 'warning' | 'error' | 'info';
}

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export const TRRAnalyticsDashboard: React.FC<TRRAnalyticsDashboardProps> = ({
  trrs,
  projects,
  teamMembers = [],
  dateRange,
  onDateRangeChange,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'bottlenecks' | 'predictions'>('overview');

  // Calculate date ranges
  const timeRanges = useMemo(() => {
    const now = new Date();
    const ranges = {
      week: {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
        end: now,
        label: 'Last 7 days'
      },
      month: {
        start: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
        end: now,
        label: 'Last 30 days'
      },
      quarter: {
        start: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
        end: now,
        label: 'Last 3 months'
      },
      year: {
        start: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
        end: now,
        label: 'Last 12 months'
      }
    };
    return ranges;
  }, []);

  const currentRange = dateRange || timeRanges[selectedTimeframe];

  // Filter TRRs by date range
  const filteredTRRs = useMemo(() => {
    return trrs.filter(trr => {
      const trrDate = new Date(trr.updatedAt);
      return trrDate >= currentRange.start && trrDate <= currentRange.end;
    });
  }, [trrs, currentRange]);

  // Core metrics calculation
  const metrics = useMemo(() => {
    const totalTRRs = filteredTRRs.length;
    const completedTRRs = filteredTRRs.filter(t => t.status === 'completed' || t.status === 'validated').length;
    const inProgressTRRs = filteredTRRs.filter(t => t.status === 'in-progress').length;
    const blockedTRRs = filteredTRRs.filter(t => 
      t.status === 'blocked' || 
      t.dependencies?.some(depId => {
        const dep = trrs.find(d => d.id === depId);
        return dep && dep.status !== 'completed' && dep.status !== 'validated';
      })
    ).length;

    // Calculate cycle time (average time from draft to completed)
    const completedWithDates = filteredTRRs.filter(t => 
      (t.status === 'completed' || t.status === 'validated') && t.createdAt
    );
    
    const avgCycleTime = completedWithDates.length > 0 
      ? completedWithDates.reduce((sum, trr) => {
          const start = new Date(trr.createdAt);
          const end = new Date(trr.updatedAt);
          return sum + (end.getTime() - start.getTime());
        }, 0) / completedWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Calculate completion rate
    const completionRate = totalTRRs > 0 ? (completedTRRs / totalTRRs) * 100 : 0;

    // Calculate velocity (TRRs completed per week)
    const weeksInRange = Math.ceil((currentRange.end.getTime() - currentRange.start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const velocity = weeksInRange > 0 ? completedTRRs / weeksInRange : 0;

    return {
      totalTRRs,
      completedTRRs,
      inProgressTRRs,
      blockedTRRs,
      completionRate,
      avgCycleTime,
      velocity,
    };
  }, [filteredTRRs, trrs, currentRange]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    const statusCounts = filteredTRRs.reduce((acc, trr) => {
      acc[trr.status] = (acc[trr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: getStatusColor(status),
    }));
  }, [filteredTRRs]);

  // Priority distribution
  const priorityDistribution = useMemo(() => {
    const priorityCounts = filteredTRRs.reduce((acc, trr) => {
      acc[trr.priority] = (acc[trr.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(priorityCounts).map(([priority, count]) => ({
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
      color: getPriorityColor(priority),
    }));
  }, [filteredTRRs]);

  // Team performance
  const teamPerformance = useMemo(() => {
    const assigneeStats = filteredTRRs.reduce((acc, trr) => {
      if (!trr.assignedTo) return acc;
      
      if (!acc[trr.assignedTo]) {
        acc[trr.assignedTo] = {
          total: 0,
          completed: 0,
          inProgress: 0,
          avgCycleTime: 0,
          totalCycleTime: 0,
          completedWithDates: 0,
        };
      }
      
      acc[trr.assignedTo].total++;
      
      if (trr.status === 'completed' || trr.status === 'validated') {
        acc[trr.assignedTo].completed++;
        if (trr.createdAt) {
          const cycleTime = (new Date(trr.updatedAt).getTime() - new Date(trr.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          acc[trr.assignedTo].totalCycleTime += cycleTime;
          acc[trr.assignedTo].completedWithDates++;
        }
      } else if (trr.status === 'in-progress') {
        acc[trr.assignedTo].inProgress++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(assigneeStats).map(([assignee, stats]) => ({
      assignee,
      total: stats.total,
      completed: stats.completed,
      inProgress: stats.inProgress,
      completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      avgCycleTime: stats.completedWithDates > 0 ? stats.totalCycleTime / stats.completedWithDates : 0,
    })).sort((a, b) => b.completionRate - a.completionRate);
  }, [filteredTRRs]);

  // Trend analysis
  const trendData = useMemo(() => {
    const weeks = Math.ceil((currentRange.end.getTime() - currentRange.start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const weeklyData = [];
    
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(currentRange.start.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekTRRs = filteredTRRs.filter(trr => {
        const trrDate = new Date(trr.updatedAt);
        return trrDate >= weekStart && trrDate < weekEnd;
      });
      
      const completed = weekTRRs.filter(t => t.status === 'completed' || t.status === 'validated').length;
      const created = weekTRRs.filter(t => new Date(t.createdAt) >= weekStart && new Date(t.createdAt) < weekEnd).length;
      
      weeklyData.push({
        week: `Week ${i + 1}`,
        completed,
        created,
        net: completed - created,
      });
    }
    
    return weeklyData;
  }, [filteredTRRs, currentRange]);

  // Bottleneck analysis
  const bottlenecks = useMemo(() => {
    const statusDurations = filteredTRRs
      .filter(trr => trr.statusHistory && trr.statusHistory.length > 1)
      .flatMap(trr => {
        return trr.statusHistory!.slice(1).map((entry, index) => {
          const prevEntry = trr.statusHistory![index];
          const duration = new Date(entry.timestamp).getTime() - new Date(prevEntry.timestamp).getTime();
          return {
            status: prevEntry.status,
            duration: duration / (1000 * 60 * 60 * 24), // Convert to days
          };
        });
      });

    const statusAvgDurations = statusDurations.reduce((acc, { status, duration }) => {
      if (!acc[status]) {
        acc[status] = { total: 0, count: 0 };
      }
      acc[status].total += duration;
      acc[status].count++;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(statusAvgDurations)
      .map(([status, { total, count }]) => ({
        status,
        avgDuration: total / count,
        count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration);
  }, [filteredTRRs]);

  function getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'validated': return '#16a34a';
      case 'in-progress': return '#3b82f6';
      case 'in-review': return '#8b5cf6';
      case 'pending': return '#f59e0b';
      case 'blocked': return '#ef4444';
      case 'draft': return '#6b7280';
      default: return '#9ca3af';
    }
  }

  function getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  }

  const metricCards: MetricCard[] = [
    {
      title: 'Total TRRs',
      value: metrics.totalTRRs,
      icon: '📋',
      color: 'info',
    },
    {
      title: 'Completion Rate',
      value: `${Math.round(metrics.completionRate)}%`,
      icon: '✅',
      color: metrics.completionRate > 80 ? 'success' : metrics.completionRate > 60 ? 'warning' : 'error',
    },
    {
      title: 'Avg Cycle Time',
      value: `${Math.round(metrics.avgCycleTime)} days`,
      icon: '⏱️',
      color: metrics.avgCycleTime < 7 ? 'success' : metrics.avgCycleTime < 14 ? 'warning' : 'error',
    },
    {
      title: 'Velocity',
      value: `${Math.round(metrics.velocity * 10) / 10}/week`,
      icon: '🚀',
      color: 'info',
    },
  ];

  const renderChart = (data: ChartData[], type: 'bar' | 'pie' = 'bar') => {
    if (type === 'pie') {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      let currentAngle = 0;
      
      return (
        <div className="relative w-48 h-48 mx-auto">
          <svg width="192" height="192" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = item.value / total;
              const angle = percentage * 360;
              const radius = 80;
              const centerX = 96;
              const centerY = 96;
              
              const x1 = centerX + radius * Math.cos((currentAngle * Math.PI) / 180);
              const y1 = centerY + radius * Math.sin((currentAngle * Math.PI) / 180);
              const x2 = centerX + radius * Math.cos(((currentAngle + angle) * Math.PI) / 180);
              const y2 = centerY + radius * Math.sin(((currentAngle + angle) * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color || '#3b82f6'}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          
          {/* Legend */}
          <div className="mt-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded mr-2"
                    style={{ backgroundColor: item.color || '#3b82f6' }}
                  />
                  <span className="text-cortex-text-primary">{item.label}</span>
                </div>
                <span className="text-cortex-text-secondary font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Bar chart
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-cortex-text-secondary text-right truncate">
              {item.label}
            </div>
            <div className="flex-1 bg-cortex-bg-tertiary rounded-full h-6 relative overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#3b82f6',
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-cortex-text-primary">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTrendChart = () => {
    if (trendData.length === 0) return null;

    const maxValue = Math.max(...trendData.flatMap(d => [d.completed, d.created]));
    
    return (
      <div className="space-y-4">
        {trendData.map((week, index) => (
          <div key={index} className="space-y-2">
            <div className="text-sm font-medium text-cortex-text-primary">{week.week}</div>
            <div className="flex items-center space-x-2">
              {/* Completed */}
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-cortex-success">Completed</span>
                  <span className="text-cortex-text-secondary">{week.completed}</span>
                </div>
                <div className="bg-cortex-bg-tertiary rounded-full h-3">
                  <div
                    className="bg-cortex-success h-full rounded-full transition-all duration-500"
                    style={{ width: `${(week.completed / maxValue) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Created */}
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-cortex-info">Created</span>
                  <span className="text-cortex-text-secondary">{week.created}</span>
                </div>
                <div className="bg-cortex-bg-tertiary rounded-full h-3">
                  <div
                    className="bg-cortex-info h-full rounded-full transition-all duration-500"
                    style={{ width: `${(week.created / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cortex-text-primary">TRR Analytics</h2>
          <p className="text-cortex-text-secondary">
            Insights and performance metrics for {timeRanges[selectedTimeframe].label.toLowerCase()}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Timeframe Selector */}
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>

          {/* View Selector */}
          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value as any)}
            className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
          >
            <option value="overview">Overview</option>
            <option value="performance">Performance</option>
            <option value="bottlenecks">Bottlenecks</option>
            <option value="predictions">Predictions</option>
          </select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <div key={index} className="cortex-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cortex-text-muted mb-1">{metric.title}</p>
                <p className={`text-2xl font-bold ${
                  metric.color === 'success' ? 'text-cortex-success' :
                  metric.color === 'warning' ? 'text-cortex-warning' :
                  metric.color === 'error' ? 'text-cortex-error' :
                  'text-cortex-info'
                }`}>
                  {metric.value}
                </p>
              </div>
              <div className="text-2xl">{metric.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="cortex-card p-6">
            <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Status Distribution</h3>
            {renderChart(statusDistribution, 'pie')}
          </div>

          {/* Priority Distribution */}
          <div className="cortex-card p-6">
            <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Priority Distribution</h3>
            {renderChart(priorityDistribution)}
          </div>

          {/* Trends */}
          <div className="cortex-card p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Weekly Trends</h3>
            {renderTrendChart()}
          </div>
        </div>
      )}

      {selectedView === 'performance' && (
        <div className="space-y-6">
          {/* Team Performance */}
          <div className="cortex-card p-6">
            <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Team Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cortex-border-secondary">
                    <th className="text-left py-3 px-4 text-cortex-text-primary">Team Member</th>
                    <th className="text-center py-3 px-4 text-cortex-text-primary">Total</th>
                    <th className="text-center py-3 px-4 text-cortex-text-primary">Completed</th>
                    <th className="text-center py-3 px-4 text-cortex-text-primary">In Progress</th>
                    <th className="text-center py-3 px-4 text-cortex-text-primary">Completion Rate</th>
                    <th className="text-center py-3 px-4 text-cortex-text-primary">Avg Cycle Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cortex-border-secondary">
                  {teamPerformance.map((member, index) => (
                    <tr key={index} className="hover:bg-cortex-bg-hover">
                      <td className="py-3 px-4 text-cortex-text-primary font-medium">
                        {member.assignee}
                      </td>
                      <td className="text-center py-3 px-4 text-cortex-text-secondary">
                        {member.total}
                      </td>
                      <td className="text-center py-3 px-4 text-cortex-success font-medium">
                        {member.completed}
                      </td>
                      <td className="text-center py-3 px-4 text-cortex-info font-medium">
                        {member.inProgress}
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          member.completionRate > 80 ? 'bg-cortex-success/20 text-cortex-success' :
                          member.completionRate > 60 ? 'bg-cortex-warning/20 text-cortex-warning' :
                          'bg-cortex-error/20 text-cortex-error'
                        }`}>
                          {Math.round(member.completionRate)}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 text-cortex-text-secondary">
                        {Math.round(member.avgCycleTime)} days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'bottlenecks' && (
        <div className="space-y-6">
          {/* Bottleneck Analysis */}
          <div className="cortex-card p-6">
            <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Status Bottlenecks</h3>
            <p className="text-cortex-text-secondary mb-6">
              Average time spent in each status (based on TRRs with status history)
            </p>
            
            <div className="space-y-4">
              {bottlenecks.map((bottleneck, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-cortex-bg-tertiary rounded-lg">
                  <div>
                    <h4 className="font-medium text-cortex-text-primary">
                      {bottleneck.status.charAt(0).toUpperCase() + bottleneck.status.slice(1)}
                    </h4>
                    <p className="text-sm text-cortex-text-secondary">
                      {bottleneck.count} transitions analyzed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      bottleneck.avgDuration > 14 ? 'text-cortex-error' :
                      bottleneck.avgDuration > 7 ? 'text-cortex-warning' :
                      'text-cortex-success'
                    }`}>
                      {Math.round(bottleneck.avgDuration)} days
                    </div>
                    <p className="text-sm text-cortex-text-muted">avg duration</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blocked TRRs */}
          <div className="cortex-card p-6">
            <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Currently Blocked TRRs</h3>
            <div className="space-y-3">
              {filteredTRRs
                .filter(trr => 
                  trr.status === 'blocked' || 
                  trr.dependencies?.some(depId => {
                    const dep = trrs.find(d => d.id === depId);
                    return dep && dep.status !== 'completed' && dep.status !== 'validated';
                  })
                )
                .map(trr => (
                  <div key={trr.id} className="flex items-center justify-between p-3 bg-cortex-error/5 border border-cortex-error/20 rounded">
                    <div>
                      <h5 className="font-medium text-cortex-text-primary">{trr.title}</h5>
                      <p className="text-sm text-cortex-text-secondary">
                        Assigned to: {trr.assignedTo || 'Unassigned'}
                      </p>
                    </div>
                    <div className="text-sm text-cortex-error font-medium">
                      Blocked {Math.ceil((Date.now() - new Date(trr.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'predictions' && (
        <div className="space-y-6">
          {/* Predictions */}
          <div className="cortex-card p-6">
            <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Predictive Insights</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-cortex-info/10 border border-cortex-info/20 rounded-lg">
                <h4 className="font-medium text-cortex-info mb-2">📈 Projected Completion</h4>
                <p className="text-sm text-cortex-text-secondary mb-3">
                  Based on current velocity of {Math.round(metrics.velocity * 10) / 10} TRRs/week
                </p>
                <div className="text-lg font-bold text-cortex-text-primary">
                  {Math.ceil(metrics.inProgressTRRs / Math.max(metrics.velocity, 0.1))} weeks
                </div>
                <p className="text-sm text-cortex-text-muted">to complete all in-progress TRRs</p>
              </div>

              <div className="p-4 bg-cortex-warning/10 border border-cortex-warning/20 rounded-lg">
                <h4 className="font-medium text-cortex-warning mb-2">⚡ Capacity Alert</h4>
                <p className="text-sm text-cortex-text-secondary mb-3">
                  Based on current workload distribution
                </p>
                <div className="text-lg font-bold text-cortex-text-primary">
                  {teamPerformance.filter(t => t.total > metrics.totalTRRs / teamPerformance.length * 1.5).length}
                </div>
                <p className="text-sm text-cortex-text-muted">team members over-allocated</p>
              </div>

              <div className="p-4 bg-cortex-success/10 border border-cortex-success/20 rounded-lg">
                <h4 className="font-medium text-cortex-success mb-2">🎯 Quality Score</h4>
                <p className="text-sm text-cortex-text-secondary mb-3">
                  Based on completion rate and cycle time
                </p>
                <div className="text-lg font-bold text-cortex-text-primary">
                  {Math.round((metrics.completionRate + (metrics.avgCycleTime > 0 ? Math.max(0, 100 - metrics.avgCycleTime * 5) : 0)) / 2)}%
                </div>
                <p className="text-sm text-cortex-text-muted">overall process health</p>
              </div>

              <div className="p-4 bg-cortex-error/10 border border-cortex-error/20 rounded-lg">
                <h4 className="font-medium text-cortex-error mb-2">🚨 Risk Assessment</h4>
                <p className="text-sm text-cortex-text-secondary mb-3">
                  TRRs at risk of missing deadlines
                </p>
                <div className="text-lg font-bold text-cortex-text-primary">
                  {filteredTRRs.filter(trr => {
                    if (!trr.dueDate) return false;
                    const daysUntilDue = (new Date(trr.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
                    return daysUntilDue < metrics.avgCycleTime && (trr.status === 'draft' || trr.status === 'pending');
                  }).length}
                </div>
                <p className="text-sm text-cortex-text-muted">TRRs at risk</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="cortex-card p-6">
            <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">🤖 AI Recommendations</h3>
            <div className="space-y-3">
              {metrics.avgCycleTime > 14 && (
                <div className="p-3 bg-cortex-warning/10 border border-cortex-warning/20 rounded">
                  <p className="text-sm text-cortex-warning">
                    <strong>Long Cycle Time:</strong> Consider breaking down TRRs into smaller chunks or adding more reviewers to speed up the process.
                  </p>
                </div>
              )}
              
              {metrics.completionRate < 60 && (
                <div className="p-3 bg-cortex-error/10 border border-cortex-error/20 rounded">
                  <p className="text-sm text-cortex-error">
                    <strong>Low Completion Rate:</strong> Review TRR definitions and acceptance criteria. Consider team training on TRR best practices.
                  </p>
                </div>
              )}
              
              {bottlenecks[0]?.avgDuration > 10 && (
                <div className="p-3 bg-cortex-info/10 border border-cortex-info/20 rounded">
                  <p className="text-sm text-cortex-info">
                    <strong>Bottleneck Alert:</strong> The "{bottlenecks[0]?.status}" status is taking {Math.round(bottlenecks[0]?.avgDuration)} days on average. Consider adding automation or additional resources.
                  </p>
                </div>
              )}
              
              {teamPerformance.some(t => t.completionRate < 50) && (
                <div className="p-3 bg-cortex-warning/10 border border-cortex-warning/20 rounded">
                  <p className="text-sm text-cortex-warning">
                    <strong>Team Support Needed:</strong> Some team members have low completion rates. Consider pairing or additional support.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TRRAnalyticsDashboard;