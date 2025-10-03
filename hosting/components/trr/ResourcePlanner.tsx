'use client';

import React, { useState, useMemo } from 'react';
import { TRR } from '../../types/trr';
import CortexButton from '../CortexButton';

interface ResourcePlannerProps {
  trrs: TRR[];
  projects?: Array<{ id: string; name: string; startDate: string; endDate: string; }>;
  teamMembers?: Array<{ id: string; name: string; role: string; capacity: number; skills: string[]; }>;
  onReassignTRR?: (trrId: string, assignee: string) => void;
  onUpdateCapacity?: (memberId: string, capacity: number) => void;
  onAiRebalance?: () => Promise<Array<{ trrId: string; recommendedAssignee: string; confidence: number; reason: string; }>>;
}

interface WorkloadData {
  assignee: string;
  totalHours: number;
  capacity: number;
  utilizationRate: number;
  trrs: TRR[];
  upcomingHours: number;
  overallocation: number;
  skills: string[];
  role: string;
}

interface TimelineSlot {
  date: string;
  assignee: string;
  hours: number;
  trrs: Array<{ id: string; title: string; hours: number; priority: string; }>;
}

export const ResourcePlanner: React.FC<ResourcePlannerProps> = ({
  trrs,
  projects = [],
  teamMembers = [],
  onReassignTRR,
  onUpdateCapacity,
  onAiRebalance,
}) => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'workload' | 'timeline' | 'skills'>('workload');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [showOverallocated, setShowOverallocated] = useState(false);
  const [aiRebalancing, setAiRebalancing] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Array<{
    trrId: string; 
    recommendedAssignee: string; 
    confidence: number; 
    reason: string;
  }>>([]);

  // Calculate workload data for all team members
  const workloadData = useMemo(() => {
    const data: WorkloadData[] = [];
    
    // Get all unique assignees from TRRs
    const assignees = Array.from(new Set(trrs.map(trr => trr.assignedTo).filter(Boolean)));
    
    // Add team members who might not have current assignments
    teamMembers.forEach(member => {
      if (!assignees.includes(member.name)) {
        assignees.push(member.name);
      }
    });

    assignees.forEach(assignee => {
      const assigneeTRRs = trrs.filter(trr => trr.assignedTo === assignee);
      const member = teamMembers.find(m => m.name === assignee);
      
      const totalHours = assigneeTRRs.reduce((sum, trr) => sum + (trr.estimatedHours || 0), 0);
      const upcomingHours = assigneeTRRs
        .filter(trr => trr.status === 'draft' || trr.status === 'pending' || trr.status === 'in-progress')
        .reduce((sum, trr) => sum + (trr.estimatedHours || 0), 0);
      
      const capacity = member?.capacity || 40; // Default 40 hours/week
      const utilizationRate = capacity > 0 ? (upcomingHours / capacity) * 100 : 0;
      const overallocation = Math.max(0, upcomingHours - capacity);

      data.push({
        assignee,
        totalHours,
        capacity,
        utilizationRate,
        trrs: assigneeTRRs,
        upcomingHours,
        overallocation,
        skills: member?.skills || [],
        role: member?.role || 'Developer',
      });
    });

    return data.sort((a, b) => b.utilizationRate - a.utilizationRate);
  }, [trrs, teamMembers]);

  // Generate timeline data
  const timelineData = useMemo(() => {
    const slots: TimelineSlot[] = [];
    const startDate = new Date();
    const daysToShow = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      workloadData.forEach(data => {
        const dailyHours = data.upcomingHours / daysToShow; // Simple distribution
        const activeTRRs = data.trrs
          .filter(trr => trr.status === 'in-progress' || trr.status === 'pending')
          .map(trr => ({
            id: trr.id,
            title: trr.title,
            hours: (trr.estimatedHours || 0) / daysToShow,
            priority: trr.priority,
          }));

        if (dailyHours > 0) {
          slots.push({
            date: dateStr,
            assignee: data.assignee,
            hours: dailyHours,
            trrs: activeTRRs,
          });
        }
      });
    }

    return slots;
  }, [workloadData, timeRange]);

  // Skills analysis
  const skillsAnalysis = useMemo(() => {
    const skillMap = new Map<string, { demand: number; supply: number; members: string[]; }>();

    // Calculate skill demand from TRRs (using tags as proxy for required skills)
    trrs.forEach(trr => {
      trr.tags?.forEach(tag => {
        const current = skillMap.get(tag) || { demand: 0, supply: 0, members: [] };
        current.demand += trr.estimatedHours || 0;
        skillMap.set(tag, current);
      });
    });

    // Calculate skill supply from team members
    teamMembers.forEach(member => {
      member.skills.forEach(skill => {
        const current = skillMap.get(skill) || { demand: 0, supply: 0, members: [] };
        current.supply += member.capacity;
        current.members.push(member.name);
        skillMap.set(skill, current);
      });
    });

    return Array.from(skillMap.entries()).map(([skill, data]) => ({
      skill,
      ...data,
      gap: data.demand - data.supply,
      utilizationRate: data.supply > 0 ? (data.demand / data.supply) * 100 : 0,
    })).sort((a, b) => b.gap - a.gap);
  }, [trrs, teamMembers]);

  const handleAiRebalance = async () => {
    if (!onAiRebalance) return;
    
    setAiRebalancing(true);
    try {
      const recommendations = await onAiRebalance();
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('AI rebalancing failed:', error);
    }
    setAiRebalancing(false);
  };

  const getUtilizationColor = (rate: number): string => {
    if (rate > 100) return 'text-cortex-error bg-cortex-error/10';
    if (rate > 85) return 'text-cortex-warning bg-cortex-warning/10';
    if (rate > 70) return 'text-cortex-info bg-cortex-info/10';
    if (rate > 40) return 'text-cortex-success bg-cortex-success/10';
    return 'text-cortex-text-muted bg-cortex-bg-secondary';
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'border-l-cortex-error';
      case 'high': return 'border-l-cortex-warning';
      case 'medium': return 'border-l-cortex-info';
      case 'low': return 'border-l-cortex-success';
      default: return 'border-l-cortex-border-secondary';
    }
  };

  const filteredWorkloadData = showOverallocated 
    ? workloadData.filter(data => data.utilizationRate > 100)
    : workloadData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cortex-text-primary">Resource Planner</h2>
          <p className="text-cortex-text-secondary">
            Manage team workload and optimize resource allocation
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* View Mode Selector */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
          >
            <option value="workload">Workload View</option>
            <option value="timeline">Timeline View</option>
            <option value="skills">Skills Analysis</option>
          </select>

          {viewMode === 'timeline' && (
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
            </select>
          )}

          {viewMode === 'workload' && (
            <CortexButton
              onClick={() => setShowOverallocated(!showOverallocated)}
              variant={showOverallocated ? 'primary' : 'outline'}
              icon="⚠️"
              size="sm"
            >
              Overallocated Only
            </CortexButton>
          )}

          {/* AI Rebalance */}
          {onAiRebalance && (
            <CortexButton
              onClick={handleAiRebalance}
              variant="primary"
              icon="🤖"
              size="sm"
              disabled={aiRebalancing}
            >
              {aiRebalancing ? 'Analyzing...' : 'AI Rebalance'}
            </CortexButton>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <div className="cortex-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cortex-text-primary">AI Recommendations</h3>
            <CortexButton
              onClick={() => setAiRecommendations([])}
              variant="outline"
              size="sm"
              icon="✕"
            />
          </div>

          <div className="space-y-3">
            {aiRecommendations.map((rec, index) => {
              const trr = trrs.find(t => t.id === rec.trrId);
              if (!trr) return null;

              return (
                <div key={index} className="flex items-center justify-between p-4 bg-cortex-bg-tertiary rounded-lg border border-cortex-border-secondary">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-cortex-text-primary">{trr.title}</span>
                      <span className="text-sm text-cortex-text-muted">
                        {trr.assignedTo} → {rec.recommendedAssignee}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        rec.confidence > 80 ? 'bg-cortex-success/20 text-cortex-success' :
                        rec.confidence > 60 ? 'bg-cortex-info/20 text-cortex-info' :
                        'bg-cortex-warning/20 text-cortex-warning'
                      }`}>
                        {rec.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-cortex-text-secondary mt-1">{rec.reason}</p>
                  </div>

                  {onReassignTRR && (
                    <div className="flex items-center space-x-2">
                      <CortexButton
                        onClick={() => onReassignTRR(rec.trrId, rec.recommendedAssignee)}
                        variant="outline"
                        size="sm"
                      >
                        Apply
                      </CortexButton>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'workload' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="cortex-card p-6 text-center">
              <div className="text-2xl font-bold text-cortex-info">
                {workloadData.length}
              </div>
              <p className="text-sm text-cortex-text-muted">Team Members</p>
            </div>
            <div className="cortex-card p-6 text-center">
              <div className="text-2xl font-bold text-cortex-error">
                {workloadData.filter(d => d.utilizationRate > 100).length}
              </div>
              <p className="text-sm text-cortex-text-muted">Overallocated</p>
            </div>
            <div className="cortex-card p-6 text-center">
              <div className="text-2xl font-bold text-cortex-warning">
                {Math.round(workloadData.reduce((sum, d) => sum + d.totalHours, 0))}
              </div>
              <p className="text-sm text-cortex-text-muted">Total Hours</p>
            </div>
            <div className="cortex-card p-6 text-center">
              <div className="text-2xl font-bold text-cortex-success">
                {Math.round(workloadData.reduce((sum, d) => sum + d.capacity, 0))}
              </div>
              <p className="text-sm text-cortex-text-muted">Total Capacity</p>
            </div>
          </div>

          {/* Workload List */}
          <div className="cortex-card">
            <div className="p-4 border-b border-cortex-border-secondary">
              <h3 className="font-semibold text-cortex-text-primary">Team Workload</h3>
            </div>
            
            <div className="divide-y divide-cortex-border-secondary">
              {filteredWorkloadData.map((data) => (
                <div key={data.assignee} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium text-cortex-text-primary">{data.assignee}</h4>
                        <p className="text-sm text-cortex-text-secondary">{data.role}</p>
                      </div>
                      
                      {/* Utilization Badge */}
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getUtilizationColor(data.utilizationRate)}`}>
                        {Math.round(data.utilizationRate)}% utilized
                      </div>
                      
                      {data.overallocation > 0 && (
                        <div className="text-sm text-cortex-error bg-cortex-error/10 px-2 py-1 rounded">
                          +{Math.round(data.overallocation)}h overallocated
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm">
                        <div className="text-cortex-text-primary font-medium">
                          {Math.round(data.upcomingHours)}h / {data.capacity}h
                        </div>
                        <div className="text-cortex-text-muted">
                          {data.trrs.length} TRRs
                        </div>
                      </div>
                      
                      {onUpdateCapacity && (
                        <CortexButton
                          onClick={() => setSelectedMember(data.assignee)}
                          variant="outline"
                          size="sm"
                          icon="⚙️"
                        />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-cortex-bg-tertiary rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        data.utilizationRate > 100 ? 'bg-cortex-error' :
                        data.utilizationRate > 85 ? 'bg-cortex-warning' :
                        data.utilizationRate > 70 ? 'bg-cortex-info' :
                        'bg-cortex-success'
                      }`}
                      style={{ width: `${Math.min(data.utilizationRate, 100)}%` }}
                    />
                  </div>

                  {/* Skills */}
                  {data.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {data.skills.map(skill => (
                        <span
                          key={skill}
                          className="text-xs px-2 py-1 bg-cortex-info/20 text-cortex-info rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Active TRRs */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-cortex-text-primary">Active TRRs:</h5>
                    {data.trrs
                      .filter(trr => trr.status !== 'completed' && trr.status !== 'validated')
                      .slice(0, 5)
                      .map(trr => (
                        <div
                          key={trr.id}
                          className={`flex items-center justify-between p-3 bg-cortex-bg-tertiary rounded border-l-4 ${getPriorityColor(trr.priority)}`}
                        >
                          <div>
                            <span className="text-sm font-medium text-cortex-text-primary">{trr.title}</span>
                            <span className="text-xs text-cortex-text-muted ml-2">
                              ({trr.status.toUpperCase()})
                            </span>
                          </div>
                          <div className="text-sm text-cortex-text-secondary">
                            {trr.estimatedHours || 0}h
                          </div>
                        </div>
                      ))}
                    
                    {data.trrs.filter(trr => trr.status !== 'completed' && trr.status !== 'validated').length > 5 && (
                      <p className="text-sm text-cortex-text-muted">
                        +{data.trrs.filter(trr => trr.status !== 'completed' && trr.status !== 'validated').length - 5} more TRRs
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'timeline' && (
        <div className="cortex-card">
          <div className="p-4 border-b border-cortex-border-secondary">
            <h3 className="font-semibold text-cortex-text-primary">Resource Timeline</h3>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <div className="min-w-full" style={{ width: 'max-content' }}>
                {/* Timeline Header */}
                <div className="grid grid-cols-8 gap-4 mb-4">
                  <div className="text-sm font-medium text-cortex-text-primary">Assignee</div>
                  {Array.from(new Set(timelineData.map(slot => slot.date)))
                    .slice(0, 7)
                    .map(date => {
                      const dateObj = new Date(date);
                      return (
                        <div key={date} className="text-sm text-cortex-text-secondary text-center">
                          <div>{dateObj.getMonth() + 1}/{dateObj.getDate()}</div>
                          <div className="text-xs text-cortex-text-muted">
                            {dateObj.toLocaleDateString('en', { weekday: 'short' })}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Timeline Rows */}
                {workloadData.map(data => (
                  <div key={data.assignee} className="grid grid-cols-8 gap-4 mb-2 items-center">
                    <div className="text-sm font-medium text-cortex-text-primary py-2">
                      {data.assignee}
                    </div>
                    
                    {Array.from(new Set(timelineData.map(slot => slot.date)))
                      .slice(0, 7)
                      .map(date => {
                        const slot = timelineData.find(s => s.date === date && s.assignee === data.assignee);
                        const dailyCapacity = data.capacity / 5; // Assuming 5 working days
                        const utilization = slot ? (slot.hours / dailyCapacity) * 100 : 0;

                        return (
                          <div
                            key={`${data.assignee}-${date}`}
                            className={`h-12 rounded border-2 flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                              utilization > 100 ? 'bg-cortex-error/20 border-cortex-error text-cortex-error' :
                              utilization > 85 ? 'bg-cortex-warning/20 border-cortex-warning text-cortex-warning' :
                              utilization > 50 ? 'bg-cortex-info/20 border-cortex-info text-cortex-info' :
                              utilization > 0 ? 'bg-cortex-success/20 border-cortex-success text-cortex-success' :
                              'bg-cortex-bg-tertiary border-cortex-border-secondary text-cortex-text-muted'
                            }`}
                            title={slot ? `${Math.round(slot.hours)}h (${slot.trrs.length} TRRs)` : 'No work'}
                          >
                            {slot ? `${Math.round(slot.hours)}h` : '0h'}
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'skills' && (
        <div className="cortex-card">
          <div className="p-4 border-b border-cortex-border-secondary">
            <h3 className="font-semibold text-cortex-text-primary">Skills Analysis</h3>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {skillsAnalysis.map((skill) => (
                <div key={skill.skill} className="p-4 bg-cortex-bg-tertiary rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <h4 className="font-medium text-cortex-text-primary">{skill.skill}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        skill.gap > 0 ? 'bg-cortex-error/20 text-cortex-error' :
                        skill.gap < -20 ? 'bg-cortex-success/20 text-cortex-success' :
                        'bg-cortex-info/20 text-cortex-info'
                      }`}>
                        {skill.gap > 0 ? `${Math.round(skill.gap)}h shortage` :
                         skill.gap < 0 ? `${Math.abs(Math.round(skill.gap))}h surplus` :
                         'Balanced'}
                      </span>
                    </div>
                    <div className="text-sm text-cortex-text-secondary">
                      {Math.round(skill.utilizationRate)}% utilization
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-cortex-error">
                        {Math.round(skill.demand)}h
                      </div>
                      <p className="text-sm text-cortex-text-muted">Demand</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-cortex-success">
                        {Math.round(skill.supply)}h
                      </div>
                      <p className="text-sm text-cortex-text-muted">Supply</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-cortex-info">
                        {skill.members.length}
                      </div>
                      <p className="text-sm text-cortex-text-muted">Team Members</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-cortex-bg-secondary rounded-full h-2 mt-3">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        skill.utilizationRate > 100 ? 'bg-cortex-error' :
                        skill.utilizationRate > 85 ? 'bg-cortex-warning' :
                        'bg-cortex-info'
                      }`}
                      style={{ width: `${Math.min(skill.utilizationRate, 100)}%` }}
                    />
                  </div>

                  {/* Team Members */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skill.members.map(member => (
                      <span
                        key={member}
                        className="text-xs px-2 py-1 bg-cortex-bg-secondary text-cortex-text-primary rounded border border-cortex-border-secondary"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcePlanner;