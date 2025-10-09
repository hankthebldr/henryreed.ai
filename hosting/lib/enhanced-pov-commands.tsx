import React, { useState } from 'react';
import { CommandConfig } from './commands';
import { TerminalOutput } from '../components/TerminalOutput';

// Enhanced POV data model with project management features
export interface POVProject {
  id: string;
  name: string;
  customer: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate?: string;
  estimatedEndDate: string;
  progress: number; // 0-100
  milestones: POVMilestone[];
  tasks: POVTask[];
  team: POVTeamMember[];
  budget?: number;
  actualCost?: number;
  objectives: string[];
  successCriteria: string[];
  risks: POVRisk[];
  stakeholders: POVStakeholder[];
  scenarios: string[];
  createdBy: string;
  createdDate: string;
  lastUpdated: string;
  tags: string[];
  customFields?: Record<string, any>;
}

export interface POVMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dependencies: string[];
  deliverables: string[];
  completedDate?: string;
  owner: string;
}

export interface POVTask {
  id: string;
  name: string;
  description: string;
  status: 'todo' | 'in-progress' | 'blocked' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  estimatedHours: number;
  actualHours?: number;
  dueDate: string;
  completedDate?: string;
  dependencies: string[];
  tags: string[];
  milestone?: string;
  comments: string[];
}

export interface POVTeamMember {
  id: string;
  name: string;
  role: 'lead' | 'consultant' | 'engineer' | 'pm' | 'stakeholder';
  email: string;
  availability: number; // 0-100 percentage
  skills: string[];
  utilization?: number;
}

export interface POVRisk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'identified' | 'mitigated' | 'accepted' | 'monitoring';
  mitigation: string;
  owner: string;
  dueDate?: string;
}

export interface POVStakeholder {
  id: string;
  name: string;
  role: string;
  organization: string;
  influence: 'low' | 'medium' | 'high';
  interest: 'low' | 'medium' | 'high';
  contactInfo: string;
}

// Mock POV data with project management features
const povProjects: POVProject[] = [
  {
    id: 'POV-2024-001',
    name: 'ACME Corp XSIAM Implementation',
    customer: 'acme-corp',
    description: 'Comprehensive XSIAM POV demonstrating threat hunting, incident response, and SIEM integration capabilities',
    status: 'active',
    priority: 'high',
    startDate: '2024-01-15T09:00:00Z',
    estimatedEndDate: '2024-03-15T17:00:00Z',
    progress: 65,
    milestones: [
      {
        id: 'M1',
        name: 'Environment Setup',
        description: 'Complete XSIAM tenant configuration and network connectivity',
        dueDate: '2024-01-25T17:00:00Z',
        status: 'completed',
        dependencies: [],
        deliverables: ['Tenant configuration', 'Network connectivity report'],
        completedDate: '2024-01-24T16:30:00Z',
        owner: 'john.doe'
      },
      {
        id: 'M2',
        name: 'Data Ingestion',
        description: 'Configure and validate data sources from customer environment',
        dueDate: '2024-02-05T17:00:00Z',
        status: 'completed',
        dependencies: ['M1'],
        deliverables: ['Data source configuration', 'Ingestion validation report'],
        completedDate: '2024-02-04T14:00:00Z',
        owner: 'sarah.smith'
      },
      {
        id: 'M3',
        name: 'Use Case Demonstrations',
        description: 'Execute core security use cases and scenarios',
        dueDate: '2024-02-25T17:00:00Z',
        status: 'in-progress',
        dependencies: ['M2'],
        deliverables: ['Use case execution reports', 'Demo recordings'],
        owner: 'mike.johnson'
      },
      {
        id: 'M4',
        name: 'Final Presentation',
        description: 'Deliver final POV results and recommendations',
        dueDate: '2024-03-10T17:00:00Z',
        status: 'pending',
        dependencies: ['M3'],
        deliverables: ['Final report', 'Executive presentation'],
        owner: 'john.doe'
      }
    ],
    tasks: [
      {
        id: 'T1',
        name: 'Configure SIEM Integration',
        description: 'Set up bi-directional integration with customer Splunk environment',
        status: 'in-progress',
        priority: 'high',
        assignee: 'sarah.smith',
        estimatedHours: 16,
        actualHours: 12,
        dueDate: '2024-02-20T17:00:00Z',
        dependencies: ['M2'],
        tags: ['integration', 'splunk'],
        milestone: 'M3',
        comments: ['Initial configuration complete', 'Testing data flow']
      },
      {
        id: 'T2',
        name: 'Create Custom Dashboards',
        description: 'Design customer-specific dashboards for executive reporting',
        status: 'todo',
        priority: 'medium',
        assignee: 'mike.johnson',
        estimatedHours: 24,
        dueDate: '2024-02-28T17:00:00Z',
        dependencies: ['T1'],
        tags: ['dashboards', 'reporting'],
        milestone: 'M3',
        comments: []
      }
    ],
    team: [
      {
        id: 'TM1',
        name: 'John Doe',
        role: 'lead',
        email: 'john.doe@company.com',
        availability: 80,
        skills: ['XSIAM', 'Project Management', 'Customer Relations'],
        utilization: 75
      },
      {
        id: 'TM2',
        name: 'Sarah Smith',
        role: 'consultant',
        email: 'sarah.smith@company.com',
        availability: 100,
        skills: ['SIEM Integration', 'Data Engineering', 'Splunk'],
        utilization: 90
      },
      {
        id: 'TM3',
        name: 'Mike Johnson',
        role: 'engineer',
        email: 'mike.johnson@company.com',
        availability: 60,
        skills: ['Dashboard Development', 'Visualization', 'Analytics'],
        utilization: 85
      }
    ],
    budget: 150000,
    actualCost: 95000,
    objectives: [
      'Demonstrate XSIAM threat hunting capabilities',
      'Validate integration with existing security stack',
      'Show ROI through automation and efficiency gains',
      'Establish foundation for full deployment'
    ],
    successCriteria: [
      '95% data ingestion success rate',
      'Sub-5 minute incident response time',
      'Executive stakeholder approval',
      'Technical validation of all use cases'
    ],
    risks: [
      {
        id: 'R1',
        title: 'Network Connectivity Issues',
        description: 'Potential delays due to customer firewall restrictions',
        probability: 'medium',
        impact: 'high',
        status: 'mitigated',
        mitigation: 'Worked with customer IT to pre-approve required ports',
        owner: 'john.doe',
        dueDate: '2024-02-01T17:00:00Z'
      },
      {
        id: 'R2',
        title: 'Data Quality Concerns',
        description: 'Customer data may require extensive normalization',
        probability: 'high',
        impact: 'medium',
        status: 'monitoring',
        mitigation: 'Implement data validation and cleansing pipeline',
        owner: 'sarah.smith'
      }
    ],
    stakeholders: [
      {
        id: 'S1',
        name: 'Alice Cooper',
        role: 'CISO',
        organization: 'ACME Corp',
        influence: 'high',
        interest: 'high',
        contactInfo: 'alice.cooper@acme-corp.com'
      },
      {
        id: 'S2',
        name: 'Bob Wilson',
        role: 'Security Architect',
        organization: 'ACME Corp',
        influence: 'medium',
        interest: 'high',
        contactInfo: 'bob.wilson@acme-corp.com'
      }
    ],
    scenarios: ['ransomware-simulation', 'insider-threat-demo', 'advanced-hunting'],
    createdBy: 'john.doe',
    createdDate: '2024-01-10T09:00:00Z',
    lastUpdated: '2024-02-15T14:30:00Z',
    tags: ['xsiam', 'enterprise', 'high-value']
  }
];

// Gantt Chart Component
const GanttChart: React.FC<{ project: POVProject }> = ({ project }) => {
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.estimatedEndDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const getPositionAndWidth = (itemStart: string, itemEnd?: string) => {
    const itemStartDate = new Date(itemStart);
    const itemEndDate = itemEnd ? new Date(itemEnd) : new Date();
    
    const daysFromStart = Math.ceil((itemStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((itemEndDate.getTime() - itemStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const left = Math.max(0, (daysFromStart / totalDays) * 100);
    const width = Math.min(100 - left, (duration / totalDays) * 100);
    
    return { left: `${left}%`, width: `${width}%` };
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
      <h3 className="text-lg font-bold text-blue-400 mb-4">📊 Project Timeline</h3>
      
      {/* Timeline Header */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-cortex-text-secondary mb-2">
          <span>{startDate.toLocaleDateString()}</span>
          <span>{endDate.toLocaleDateString()}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded">
          <div 
            className="h-full bg-blue-500 rounded transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <div className="text-xs text-cortex-text-secondary mt-1">Overall Progress: {project.progress}%</div>
      </div>

      {/* Milestones */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-300">Milestones</h4>
        {project.milestones.map(milestone => {
          const position = getPositionAndWidth(
            project.startDate, 
            milestone.completedDate || milestone.dueDate
          );
          
          return (
            <div key={milestone.id} className="relative">
              <div className="flex items-center mb-1">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  milestone.status === 'completed' ? 'bg-green-500' :
                  milestone.status === 'in-progress' ? 'bg-yellow-500' :
                  milestone.status === 'overdue' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} />
                <span className="text-sm font-medium text-white">{milestone.name}</span>
                <span className="text-xs text-cortex-text-secondary ml-2">
                  Due: {new Date(milestone.dueDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="ml-6 h-4 bg-gray-700 rounded relative">
                <div 
                  className={`h-full rounded ${
                    milestone.status === 'completed' ? 'bg-green-600' :
                    milestone.status === 'in-progress' ? 'bg-yellow-600' :
                    milestone.status === 'overdue' ? 'bg-red-600' :
                    'bg-gray-600'
                  }`}
                  style={position}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Task Board Component
const TaskBoard: React.FC<{ tasks: POVTask[] }> = ({ tasks }) => {
  const columns = {
    'todo': { title: 'To Do', color: 'border-gray-500', bgColor: 'bg-gray-800' },
    'in-progress': { title: 'In Progress', color: 'border-yellow-500', bgColor: 'bg-yellow-900/20' },
    'blocked': { title: 'Blocked', color: 'border-red-500', bgColor: 'bg-red-900/20' },
    'completed': { title: 'Completed', color: 'border-green-500', bgColor: 'bg-green-900/20' }
  };

  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) acc[task.status] = [];
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, POVTask[]>);

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
      <h3 className="text-lg font-bold text-purple-400 mb-4">📋 Task Board</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(columns).map(([status, config]) => (
          <div key={status} className={`border rounded-lg p-4 ${config.color} ${config.bgColor}`}>
            <h4 className="font-semibold text-white mb-3">
              {config.title} ({tasksByStatus[status]?.length || 0})
            </h4>
            
            <div className="space-y-3">
              {(tasksByStatus[status] || []).map(task => (
                <div key={task.id} className="bg-gray-900 p-3 rounded border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-white text-sm">{task.name}</h5>
                    <div className={`px-2 py-1 rounded text-xs ${
                      task.priority === 'critical' ? 'bg-red-700 text-red-200' :
                      task.priority === 'high' ? 'bg-orange-700 text-orange-200' :
                      task.priority === 'medium' ? 'bg-blue-700 text-blue-200' :
                      'bg-gray-700 text-gray-200'
                    }`}>
                      {task.priority}
                    </div>
                  </div>
                  
                  <p className="text-xs text-cortex-text-secondary mb-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-cortex-text-muted">
                    <span>{task.assignee}</span>
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  
                  {task.estimatedHours && (
                    <div className="mt-2 text-xs text-cortex-text-secondary">
                      Est: {task.estimatedHours}h
                      {task.actualHours && ` | Actual: ${task.actualHours}h`}
                    </div>
                  )}
                  
                  {task.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {task.tags.map(tag => (
                        <span key={tag} className="px-1 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Team Utilization Component
const TeamUtilization: React.FC<{ team: POVTeamMember[] }> = ({ team }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
      <h3 className="text-lg font-bold text-cyan-400 mb-4">👥 Team Utilization</h3>
      
      <div className="space-y-4">
        {team.map(member => (
          <div key={member.id} className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white">{member.name}</span>
                <span className="text-sm text-cortex-text-secondary">{member.role}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-full rounded-full ${
                      (member.utilization || 0) > 90 ? 'bg-red-500' :
                      (member.utilization || 0) > 70 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${member.utilization || 0}%` }}
                  />
                </div>
                <span className="text-xs text-cortex-text-secondary min-w-[3rem]">
                  {member.utilization || 0}%
                </span>
              </div>
              
              <div className="mt-1 text-xs text-cortex-text-muted">
                Available: {member.availability}% | Skills: {member.skills.slice(0, 3).join(', ')}
                {member.skills.length > 3 && ` +${member.skills.length - 3} more`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const enhancedPovCommands: CommandConfig[] = [
  {
    name: 'pov',
    description: 'Enhanced POV management with project management features',
    usage: 'pov [dashboard|list|create|timeline|tasks|team|risks] [options]',
    aliases: ['pov-pm', 'project'],
    handler: (args) => {
      const subcommand = args[0] || 'dashboard';

      if (subcommand === 'timeline' || subcommand === 'gantt') {
        const projectId = args[1] || povProjects[0]?.id;
        const project = povProjects.find(p => p.id === projectId);
        
        if (!project) {
          return (
            <TerminalOutput type="error">
              <div>Project not found: {projectId}</div>
            </TerminalOutput>
          );
        }

        return (
          <TerminalOutput type="info">
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-4">📊</div>
                <div>
                  <div className="font-bold text-2xl text-blue-400">Project Timeline</div>
                  <div className="text-sm text-gray-300">{project.name} - {project.customer}</div>
                </div>
              </div>
              
              <GanttChart project={project} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                  <h3 className="font-bold text-green-400 mb-3">📈 Progress Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Overall Progress:</span>
                      <span className="text-green-400">{project.progress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Milestones Completed:</span>
                      <span className="text-blue-400">
                        {project.milestones.filter(m => m.status === 'completed').length} / {project.milestones.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tasks Completed:</span>
                      <span className="text-purple-400">
                        {project.tasks.filter(t => t.status === 'completed').length} / {project.tasks.length}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                  <h3 className="font-bold text-yellow-400 mb-3">⏰ Timeline Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span>{new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End Date:</span>
                      <span>{new Date(project.estimatedEndDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>
                        {Math.ceil((new Date(project.estimatedEndDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TerminalOutput>
        );
      }

      if (subcommand === 'tasks' || subcommand === 'board') {
        const projectId = args[1] || povProjects[0]?.id;
        const project = povProjects.find(p => p.id === projectId);
        
        if (!project) {
          return (
            <TerminalOutput type="error">
              <div>Project not found: {projectId}</div>
            </TerminalOutput>
          );
        }

        return (
          <TerminalOutput type="info">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">📋</div>
                  <div>
                    <div className="font-bold text-2xl text-purple-400">Task Management</div>
                    <div className="text-sm text-gray-300">{project.name}</div>
                  </div>
                </div>
                <div className="text-sm text-cortex-text-secondary">
                  Total Tasks: {project.tasks.length}
                </div>
              </div>
              
              <TaskBoard tasks={project.tasks} />
            </div>
          </TerminalOutput>
        );
      }

      if (subcommand === 'team' || subcommand === 'resources') {
        const projectId = args[1] || povProjects[0]?.id;
        const project = povProjects.find(p => p.id === projectId);
        
        if (!project) {
          return (
            <TerminalOutput type="error">
              <div>Project not found: {projectId}</div>
            </TerminalOutput>
          );
        }

        return (
          <TerminalOutput type="info">
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-4">👥</div>
                <div>
                  <div className="font-bold text-2xl text-cyan-400">Team Management</div>
                  <div className="text-sm text-gray-300">{project.name}</div>
                </div>
              </div>
              
              <TeamUtilization team={project.team} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                  <h3 className="text-lg font-bold text-green-400 mb-4">📊 Team Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Team Members:</span>
                      <span className="text-white">{project.team.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Utilization:</span>
                      <span className="text-yellow-400">
                        {Math.round(project.team.reduce((sum, m) => sum + (m.utilization || 0), 0) / project.team.length)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Availability:</span>
                      <span className="text-blue-400">
                        {project.team.reduce((sum, m) => sum + m.availability, 0)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                  <h3 className="text-lg font-bold text-purple-400 mb-4">🎯 Skills Matrix</h3>
                  <div className="space-y-2">
                    {Array.from(new Set(project.team.flatMap(m => m.skills))).slice(0, 8).map(skill => (
                      <div key={skill} className="flex justify-between text-sm">
                        <span className="text-gray-300">{skill}:</span>
                        <span className="text-cyan-400">
                          {project.team.filter(m => m.skills.includes(skill)).length} members
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TerminalOutput>
        );
      }

      if (subcommand === 'list') {
        return (
          <TerminalOutput type="info">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">📁</div>
                  <div>
                    <div className="font-bold text-2xl text-green-400">POV Projects</div>
                    <div className="text-sm text-gray-300">{povProjects.length} active projects</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {povProjects.map(project => (
                  <div key={project.id} className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="font-mono text-blue-400">{project.id}</div>
                        <div>
                          <h3 className="font-bold text-xl text-white">{project.name}</h3>
                          <p className="text-gray-300">{project.customer}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded text-sm font-bold ${
                          project.status === 'completed' ? 'bg-green-800 text-green-200' :
                          project.status === 'active' ? 'bg-blue-800 text-blue-200' :
                          project.status === 'on-hold' ? 'bg-yellow-800 text-yellow-200' :
                          project.status === 'cancelled' ? 'bg-red-800 text-red-200' :
                          'bg-gray-700 text-gray-200'
                        }`}>
                          {project.status.toUpperCase()}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          project.priority === 'critical' ? 'bg-red-700 text-red-200' :
                          project.priority === 'high' ? 'bg-orange-700 text-orange-200' :
                          project.priority === 'medium' ? 'bg-blue-700 text-blue-200' :
                          'bg-gray-700 text-gray-200'
                        }`}>
                          {project.priority}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-cortex-text-secondary mb-4">{project.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{project.progress}%</div>
                        <div className="text-xs text-cortex-text-secondary">Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{project.milestones.length}</div>
                        <div className="text-xs text-cortex-text-secondary">Milestones</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{project.tasks.length}</div>
                        <div className="text-xs text-cortex-text-secondary">Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-400">{project.team.length}</div>
                        <div className="text-xs text-cortex-text-secondary">Team</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-cortex-text-muted">
                      <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                      <span>End: {new Date(project.estimatedEndDate).toLocaleDateString()}</span>
                      <span>Lead: {project.team.find(m => m.role === 'lead')?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TerminalOutput>
        );
      }

      // Dashboard view (default)
      const totalProjects = povProjects.length;
      const activeProjects = povProjects.filter(p => p.status === 'active').length;
      const completedProjects = povProjects.filter(p => p.status === 'completed').length;
      const avgProgress = Math.round(povProjects.reduce((sum, p) => sum + p.progress, 0) / totalProjects);

      return (
        <TerminalOutput type="info">
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="text-3xl mr-4">🎯</div>
              <div>
                <div className="font-bold text-2xl text-green-400">POV Management Dashboard</div>
                <div className="text-sm text-gray-300">Project management for proof-of-value engagements</div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 text-center">
                <div className="text-2xl font-bold text-white">{totalProjects}</div>
                <div className="text-sm text-cortex-text-secondary">Total Projects</div>
              </div>
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30 text-center">
                <div className="text-2xl font-bold text-blue-400">{activeProjects}</div>
                <div className="text-sm text-cortex-text-secondary">Active</div>
              </div>
              <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30 text-center">
                <div className="text-2xl font-bold text-green-400">{completedProjects}</div>
                <div className="text-sm text-cortex-text-secondary">Completed</div>
              </div>
              <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30 text-center">
                <div className="text-2xl font-bold text-purple-400">{avgProgress}%</div>
                <div className="text-sm text-cortex-text-secondary">Avg Progress</div>
              </div>
            </div>

            {/* Available Commands */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
              <div className="font-bold text-lg mb-4 text-green-400">🎯 POV Management Commands</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-blue-400 font-mono mb-2">pov list</div>
                  <div className="text-sm text-gray-300 ml-4">List all POV projects</div>
                  
                  <div className="text-cyan-400 font-mono mb-2 mt-3">pov timeline [project-id]</div>
                  <div className="text-sm text-gray-300 ml-4">View Gantt chart and timeline</div>
                  
                  <div className="text-purple-400 font-mono mb-2 mt-3">pov tasks [project-id]</div>
                  <div className="text-sm text-gray-300 ml-4">View task board (Kanban style)</div>
                </div>
                <div>
                  <div className="text-green-400 font-mono mb-2">pov team [project-id]</div>
                  <div className="text-sm text-gray-300 ml-4">Team utilization and resources</div>
                  
                  <div className="text-yellow-400 font-mono mb-2 mt-3">pov create</div>
                  <div className="text-sm text-gray-300 ml-4">Create new POV project</div>
                  
                  <div className="text-orange-400 font-mono mb-2 mt-3">pov risks [project-id]</div>
                  <div className="text-sm text-gray-300 ml-4">Risk management and mitigation</div>
                </div>
              </div>
            </div>
          </div>
        </TerminalOutput>
      );
    }
  }
];
