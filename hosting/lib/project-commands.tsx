import React from 'react';
import { CommandConfig } from './commands';

// Project Data Models
interface Project {
  id: string;
  name: string;
  description: string;
  customer: string;
  type: 'pov' | 'pilot' | 'deployment' | 'training' | 'assessment';
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  estimatedHours: number;
  actualHours: number;
  budget?: number;
  owner: string;
  stakeholders: ProjectStakeholder[];
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  trr?: TRRValidation;
  notes: string[];
  tags: string[];
}

interface ProjectStakeholder {
  name: string;
  role: string;
  company: string;
  email: string;
  responsibility: string;
  influence: 'low' | 'medium' | 'high';
}

interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  estimatedHours: number;
  actualHours: number;
  dueDate: Date;
  dependencies: string[];
  completedAt?: Date;
}

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'upcoming' | 'in-progress' | 'completed' | 'delayed';
  deliverables: string[];
  completedAt?: Date;
}

// TRR Validation Data Models
interface TRRValidation {
  id: string;
  projectId: string;
  version: string;
  status: 'draft' | 'in-review' | 'approved' | 'rejected' | 'requires-changes';
  createdAt: Date;
  createdBy: string;
  lastUpdated: Date;
  approvers: TRRApprover[];
  requirements: TechnicalRequirement[];
  validationCriteria: ValidationCriteria[];
  testResults: TestResult[];
  riskAssessment: RiskItem[];
  signOffDate?: Date;
  notes: string[];
}

interface TRRApprover {
  name: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'requires-changes';
  comments: string;
  signedDate?: Date;
}

interface TechnicalRequirement {
  id: string;
  category: 'performance' | 'security' | 'integration' | 'scalability' | 'compliance' | 'usability';
  title: string;
  description: string;
  priority: 'must-have' | 'should-have' | 'nice-to-have';
  status: 'pending' | 'validated' | 'failed' | 'not-applicable';
  validationMethod: 'demo' | 'documentation' | 'testing' | 'interview';
  acceptanceCriteria: string[];
  evidence: string[];
  validatedBy?: string;
  validatedDate?: Date;
  comments: string;
}

interface ValidationCriteria {
  id: string;
  requirement: string;
  criteria: string;
  method: string;
  expectedResult: string;
  actualResult?: string;
  status: 'pass' | 'fail' | 'pending' | 'not-applicable';
  evidence: string[];
  validatedBy?: string;
  validatedDate?: Date;
}

interface TestResult {
  id: string;
  testName: string;
  category: string;
  status: 'pass' | 'fail' | 'pending';
  executedBy: string;
  executedDate: Date;
  results: string;
  evidence: string[];
  issues: string[];
}

interface RiskItem {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'business' | 'operational' | 'security';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  owner: string;
  status: 'identified' | 'mitigated' | 'accepted' | 'transferred';
}

// Mock project data
const mockProjects = new Map<string, Project>();
const mockTRRs = new Map<string, TRRValidation>();

// Sample project data
const sampleProject: Project = {
  id: 'proj-acme-siem-001',
  name: 'Acme Corporation SIEM Migration POV',
  description: 'Comprehensive proof-of-value for XSIAM platform migration from legacy Splunk infrastructure',
  customer: 'Acme Corporation',
  type: 'pov',
  status: 'active',
  priority: 'high',
  createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
  startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
  estimatedHours: 120,
  actualHours: 85,
  budget: 25000,
  owner: 'Domain Consultant',
  stakeholders: [
    {
      name: 'John Smith',
      role: 'CISO',
      company: 'Acme Corporation',
      email: 'john.smith@acme.com',
      responsibility: 'Executive sponsor and final decision maker',
      influence: 'high'
    },
    {
      name: 'Sarah Wilson',
      role: 'SOC Manager',
      company: 'Acme Corporation', 
      email: 'sarah.wilson@acme.com',
      responsibility: 'Technical evaluation and day-to-day operations',
      influence: 'high'
    },
    {
      name: 'Mike Johnson',
      role: 'IT Director',
      company: 'Acme Corporation',
      email: 'mike.johnson@acme.com',
      responsibility: 'Infrastructure and integration oversight',
      influence: 'medium'
    }
  ],
  tasks: [
    {
      id: 'task-001',
      title: 'Technical Requirements Gathering',
      description: 'Comprehensive analysis of current infrastructure and requirements',
      status: 'completed',
      priority: 'high',
      assignee: 'Domain Consultant',
      estimatedHours: 16,
      actualHours: 18,
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      dependencies: [],
      completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'task-002',
      title: 'Demo Environment Setup',
      description: 'Configure XSIAM demo environment with customer-relevant data',
      status: 'completed',
      priority: 'high',
      assignee: 'Technical Specialist',
      estimatedHours: 12,
      actualHours: 10,
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      dependencies: ['task-001'],
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'task-003',
      title: 'Technical Demo Delivery',
      description: 'Present XSIAM capabilities to technical stakeholders',
      status: 'completed',
      priority: 'high',
      assignee: 'Domain Consultant',
      estimatedHours: 8,
      actualHours: 9,
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      dependencies: ['task-002'],
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'task-004',
      title: 'TRR Validation Process',
      description: 'Complete technical requirements review and validation',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Domain Consultant',
      estimatedHours: 20,
      actualHours: 12,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      dependencies: ['task-003']
    },
    {
      id: 'task-005',
      title: 'Executive Presentation',
      description: 'Present business case and ROI analysis to C-suite',
      status: 'todo',
      priority: 'high',
      assignee: 'Domain Consultant',
      estimatedHours: 6,
      actualHours: 0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      dependencies: ['task-004']
    }
  ],
  milestones: [
    {
      id: 'milestone-001',
      title: 'Technical Discovery Complete',
      description: 'Requirements gathered and validated',
      dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      status: 'completed',
      deliverables: ['Requirements document', 'Infrastructure assessment'],
      completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'milestone-002',
      title: 'Technical Validation Complete',
      description: 'Demo delivered and TRR approved',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'in-progress',
      deliverables: ['Technical demo', 'TRR document', 'Validation report']
    },
    {
      id: 'milestone-003',
      title: 'Executive Decision',
      description: 'Business case presented and decision received',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      deliverables: ['Executive presentation', 'ROI analysis', 'Decision documentation']
    }
  ],
  notes: [
    'Customer very impressed with ML-based threat detection capabilities',
    'Some concerns about migration timeline - addressed with phased approach',
    'Strong support from SOC team, need to focus on business value for executives'
  ],
  tags: ['siem-migration', 'xdr', 'enterprise', 'finance']
};

// Sample TRR validation
const sampleTRR: TRRValidation = {
  id: 'trr-acme-001',
  projectId: 'proj-acme-siem-001',
  version: '1.2',
  status: 'in-review',
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  createdBy: 'Domain Consultant',
  lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  approvers: [
    {
      name: 'John Smith',
      role: 'CISO',
      status: 'approved',
      comments: 'Satisfied with security and compliance validation',
      signedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      name: 'Sarah Wilson',
      role: 'SOC Manager',
      status: 'pending',
      comments: 'Reviewing performance benchmarks'
    },
    {
      name: 'Mike Johnson',
      role: 'IT Director',
      status: 'requires-changes',
      comments: 'Need additional details on integration with existing LDAP'
    }
  ],
  requirements: [
    {
      id: 'req-001',
      category: 'performance',
      title: 'Data Ingestion Performance',
      description: 'System must ingest minimum 2TB/day of log data with <5min latency',
      priority: 'must-have',
      status: 'validated',
      validationMethod: 'testing',
      acceptanceCriteria: [
        'Sustained ingestion rate ≥ 2TB/day',
        'Average latency ≤ 5 minutes',
        '99.9% uptime during testing period'
      ],
      evidence: ['Performance test results', 'Load testing report', 'Monitoring dashboards'],
      validatedBy: 'Technical Specialist',
      validatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      comments: 'Exceeded requirements - achieved 3.2TB/day with 2.8min average latency'
    },
    {
      id: 'req-002',
      category: 'security',
      title: 'Data Encryption and Access Control',
      description: 'All data must be encrypted at rest and in transit with RBAC controls',
      priority: 'must-have',
      status: 'validated',
      validationMethod: 'demo',
      acceptanceCriteria: [
        'AES-256 encryption for data at rest',
        'TLS 1.3 for data in transit',
        'Role-based access control implemented',
        'SOC 2 Type II compliance'
      ],
      evidence: ['Security demo recording', 'Compliance certificates', 'Access control matrix'],
      validatedBy: 'Security Specialist',
      validatedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      comments: 'All security requirements met and documented'
    },
    {
      id: 'req-003',
      category: 'integration',
      title: 'LDAP Authentication Integration',
      description: 'Single sign-on integration with existing Active Directory',
      priority: 'must-have',
      status: 'pending',
      validationMethod: 'testing',
      acceptanceCriteria: [
        'Seamless LDAP/AD integration',
        'Group-based role assignment',
        'Password policy synchronization'
      ],
      evidence: [],
      comments: 'Pending detailed LDAP configuration requirements from IT'
    }
  ],
  validationCriteria: [
    {
      id: 'criteria-001',
      requirement: 'Data Ingestion Performance',
      criteria: 'System processes 2TB daily volume within latency requirements',
      method: 'Load testing with realistic data volumes',
      expectedResult: '≥2TB/day processing with ≤5min latency',
      actualResult: '3.2TB/day processing with 2.8min average latency',
      status: 'pass',
      evidence: ['Load test results', 'Performance monitoring data'],
      validatedBy: 'Technical Specialist',
      validatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ],
  testResults: [
    {
      id: 'test-001',
      testName: 'Data Ingestion Load Test',
      category: 'Performance',
      status: 'pass',
      executedBy: 'Technical Specialist',
      executedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      results: 'Successfully processed 3.2TB over 24hr period with 2.8min average latency',
      evidence: ['Test execution logs', 'Performance graphs', 'System metrics'],
      issues: []
    },
    {
      id: 'test-002',
      testName: 'Security Validation Test',
      category: 'Security',
      status: 'pass',
      executedBy: 'Security Specialist',
      executedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      results: 'All security controls validated including encryption and access control',
      evidence: ['Security scan reports', 'Access control tests'],
      issues: []
    }
  ],
  riskAssessment: [
    {
      id: 'risk-001',
      title: 'LDAP Integration Complexity',
      description: 'Potential delays in LDAP integration due to complex existing AD structure',
      category: 'technical',
      probability: 'medium',
      impact: 'medium',
      riskLevel: 'medium',
      mitigation: 'Engage AD specialist early, allow additional time for integration testing',
      owner: 'IT Director',
      status: 'identified'
    },
    {
      id: 'risk-002',
      title: 'Data Migration Timeline',
      description: 'Historical data migration may take longer than estimated',
      category: 'operational',
      probability: 'low',
      impact: 'medium',
      riskLevel: 'low',
      mitigation: 'Phased migration approach, prioritize recent data first',
      owner: 'Domain Consultant',
      status: 'mitigated'
    }
  ],
  notes: [
    'Initial TRR review went well with strong technical validation',
    'Need to address LDAP integration concerns before final approval',
    'Performance results exceeded expectations - good selling point'
  ]
};

mockProjects.set(sampleProject.id, sampleProject);
mockTRRs.set(sampleTRR.id, sampleTRR);

export const projectCommands: CommandConfig[] = [
  {
    name: 'project',
    description: 'Create and manage customer engagement projects',
    usage: 'project <command> [options]',
    aliases: ['proj'],
    handler: (args) => {
      if (args.length === 0) {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">📋 Project Management Hub</div>
            <div className="text-gray-300 mb-4">
              Comprehensive project management for customer engagements, POVs, and technical validations.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-green-600 p-3 rounded">
                <div className="text-green-400 font-bold mb-2">🚀 Project Lifecycle</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-green-300">project create --name "Customer POV" --type pov</div>
                  <div className="font-mono text-blue-300">project list --active --priority high</div>
                  <div className="font-mono text-purple-300">project update --add-task "Demo Prep"</div>
                  <div className="font-mono text-yellow-300">project status --detailed --timeline</div>
                </div>
              </div>
              <div className="border border-purple-600 p-3 rounded">
                <div className="text-purple-400 font-bold mb-2">✅ Task Management</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-cyan-300">project tasks --project-id acme-001</div>
                  <div className="font-mono text-orange-300">project task complete --id task-003</div>
                  <div className="font-mono text-pink-300">project milestone --upcoming --overdue</div>
                </div>
              </div>
            </div>

            <div className="border border-blue-600 p-4 rounded mb-6">
              <div className="text-blue-400 font-bold mb-2">📊 Active Projects Summary</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">{Array.from(mockProjects.values()).filter(p => p.status === 'active').length}</div>
                  <div className="text-sm text-gray-300">Active Projects</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">85%</div>
                  <div className="text-sm text-gray-300">Avg Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">12</div>
                  <div className="text-sm text-gray-300">Tasks Due</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">3</div>
                  <div className="text-sm text-gray-300">Milestones</div>
                </div>
              </div>
            </div>

            <div className="border border-yellow-600 p-4 rounded">
              <div className="text-yellow-400 font-bold mb-2">⚡ Quick Actions</div>
              <div className="space-y-1 text-sm">
                <div>📋 <span className="font-mono text-green-400">project list --my-tasks</span> - View your assigned tasks</div>
                <div>🎯 <span className="font-mono text-blue-400">project create --template pov</span> - Start new POV project</div>
                <div>📈 <span className="font-mono text-purple-400">project dashboard</span> - View project analytics</div>
              </div>
            </div>
          </div>
        );
      }

      const subcommand = args[0];
      const subArgs = args.slice(1);

      switch (subcommand) {
        case 'create':
          return handleProjectCreate(subArgs);
        case 'list':
          return handleProjectList(subArgs);
        case 'status':
          return handleProjectStatus(subArgs);
        case 'tasks':
          return handleProjectTasks(subArgs);
        case 'milestone':
        case 'milestones':
          return handleProjectMilestones(subArgs);
        case 'update':
          return handleProjectUpdate(subArgs);
        case 'dashboard':
          return handleProjectDashboard(subArgs);
        default:
          return (
            <div className="text-red-400">
              Unknown project command: {subcommand}
              <div className="mt-2 text-gray-300 text-sm">
                Run <span className="font-mono">project</span> to see available commands.
              </div>
            </div>
          );
      }
    }
  },

  {
    name: 'trr',
    description: 'Create and manage Technical Requirements Review validations',
    usage: 'trr <command> [options]',
    aliases: ['validation', 'technical-review'],
    handler: (args) => {
      if (args.length === 0) {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">🔍 Technical Requirements Review (TRR)</div>
            <div className="text-gray-300 mb-4">
              Comprehensive technical validation and requirements review management for customer engagements.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-cyan-600 p-3 rounded">
                <div className="text-cyan-400 font-bold mb-2">📝 TRR Management</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-green-300">trr create --project acme-001 --template standard</div>
                  <div className="font-mono text-blue-300">trr list --status in-review --pending</div>
                  <div className="font-mono text-purple-300">trr validate --requirement req-001 --method demo</div>
                  <div className="font-mono text-yellow-300">trr approve --approver CISO --comments</div>
                </div>
              </div>
              <div className="border border-green-600 p-3 rounded">
                <div className="text-green-400 font-bold mb-2">✅ Validation Process</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-cyan-300">trr requirements --category security --priority must-have</div>
                  <div className="font-mono text-orange-300">trr test --execute performance-test</div>
                  <div className="font-mono text-pink-300">trr report --generate --include-evidence</div>
                  <div className="font-mono text-gray-300">trr sign-off --final-approval</div>
                </div>
              </div>
            </div>

            <div className="border border-purple-600 p-4 rounded mb-6">
              <div className="text-purple-400 font-bold mb-2">📊 TRR Status Overview</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{Array.from(mockTRRs.values()).length}</div>
                  <div className="text-sm text-gray-300">Active TRRs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">78%</div>
                  <div className="text-sm text-gray-300">Requirements Validated</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">2</div>
                  <div className="text-sm text-gray-300">Pending Approvals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">1</div>
                  <div className="text-sm text-gray-300">Requires Changes</div>
                </div>
              </div>
            </div>

            <div className="border border-orange-600 p-4 rounded">
              <div className="text-orange-400 font-bold mb-2">🎯 TRR Categories</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="bg-blue-800 text-blue-200 px-2 py-1 rounded text-center">Performance</div>
                <div className="bg-green-800 text-green-200 px-2 py-1 rounded text-center">Security</div>
                <div className="bg-purple-800 text-purple-200 px-2 py-1 rounded text-center">Integration</div>
                <div className="bg-yellow-800 text-yellow-200 px-2 py-1 rounded text-center">Scalability</div>
                <div className="bg-red-800 text-red-200 px-2 py-1 rounded text-center">Compliance</div>
                <div className="bg-pink-800 text-pink-200 px-2 py-1 rounded text-center">Usability</div>
              </div>
            </div>
          </div>
        );
      }

      const subcommand = args[0];
      const subArgs = args.slice(1);

      switch (subcommand) {
        case 'create':
          return handleTRRCreate(subArgs);
        case 'list':
          return handleTRRList(subArgs);
        case 'status':
          return handleTRRStatus(subArgs);
        case 'requirements':
          return handleTRRRequirements(subArgs);
        case 'validate':
          return handleTRRValidate(subArgs);
        case 'approve':
          return handleTRRApprove(subArgs);
        case 'report':
          return handleTRRReport(subArgs);
        case 'test':
          return handleTRRTest(subArgs);
        default:
          return (
            <div className="text-red-400">
              Unknown TRR command: {subcommand}
              <div className="mt-2 text-gray-300 text-sm">
                Run <span className="font-mono">trr</span> to see available commands.
              </div>
            </div>
          );
      }
    }
  }
];

// Project Command Handlers
const handleProjectCreate = (args: string[]) => {
  const name = args.includes('--name') ? args[args.indexOf('--name') + 1] : '';
  const type = args.includes('--type') ? args[args.indexOf('--type') + 1] as Project['type'] : 'pov';
  const customer = args.includes('--customer') ? args[args.indexOf('--customer') + 1] : '';

  if (!name) {
    return (
      <div className="text-red-400">
        Project name is required.
        <div className="mt-2 text-sm">
          Usage: <span className="font-mono">project create --name "Project Name" --type pov --customer "Customer"</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-green-300">
      <div className="font-bold mb-3 text-lg">🚀 Creating New Project</div>
      
      <div className="border border-green-600 p-4 rounded mb-4">
        <div className="font-bold text-white mb-2">Project Configuration</div>
        <div className="space-y-1 text-sm">
          <div><strong>Name:</strong> {name.replace(/"/g, '')}</div>
          <div><strong>Type:</strong> <span className="capitalize">{type}</span></div>
          <div><strong>Customer:</strong> {customer.replace(/"/g, '') || 'TBD'}</div>
          <div><strong>Created:</strong> {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div className="bg-green-800 p-3 rounded mb-4">
        <div className="text-green-200 font-bold">✅ Project Created Successfully</div>
        <div className="text-sm mt-1">
          Project ID: <span className="font-mono">proj-{Date.now().toString(36)}</span>
        </div>
      </div>

      <div className="p-3 bg-gray-800 rounded border border-blue-600">
        <div className="text-blue-400 font-bold">📋 Next Steps</div>
        <div className="text-sm text-gray-300 mt-1">
          1. Add stakeholders and team members<br/>
          2. Define project tasks and milestones<br/>
          3. Set up TRR validation if required<br/>
          4. Configure project timeline and budget
        </div>
      </div>
    </div>
  );
};

const handleProjectList = (args: string[]) => {
  const active = args.includes('--active');
  const myTasks = args.includes('--my-tasks');
  const priority = args.includes('--priority') ? args[args.indexOf('--priority') + 1] : null;

  let projects = Array.from(mockProjects.values());

  if (active) {
    projects = projects.filter(p => p.status === 'active');
  }

  if (priority) {
    projects = projects.filter(p => p.priority === priority);
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📋 Project List ({projects.length})</div>
      
      {myTasks ? (
        <div className="space-y-3">
          <div className="text-yellow-400 font-bold mb-2">📝 My Assigned Tasks</div>
          {Array.from(mockProjects.values()).flatMap(project => 
            project.tasks
              .filter(task => task.assignee === 'Domain Consultant' && task.status !== 'completed')
              .map(task => (
                <div key={task.id} className="border border-yellow-600 p-3 rounded">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-bold text-white">{task.title}</div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      task.status === 'in-progress' ? 'bg-blue-800 text-blue-200' :
                      task.status === 'todo' ? 'bg-gray-800 text-gray-200' :
                      'bg-red-800 text-red-200'
                    }`}>
                      {task.status.replace('-', ' ').toUpperCase()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">{task.description}</div>
                  <div className="text-xs space-y-1">
                    <div><strong>Project:</strong> {project.name}</div>
                    <div><strong>Due:</strong> {task.dueDate.toLocaleDateString()}</div>
                    <div><strong>Priority:</strong> <span className={
                      task.priority === 'high' ? 'text-red-400' :
                      task.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                    }>{task.priority}</span></div>
                  </div>
                </div>
              ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <div key={project.id} className="border border-gray-600 p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-green-400">{project.name}</div>
                <div className="flex gap-2">
                  <div className={`px-2 py-1 rounded text-xs ${
                    project.status === 'active' ? 'bg-green-800 text-green-200' :
                    project.status === 'planning' ? 'bg-blue-800 text-blue-200' :
                    project.status === 'completed' ? 'bg-gray-800 text-gray-200' :
                    'bg-yellow-800 text-yellow-200'
                  }`}>
                    {project.status.replace('-', ' ').toUpperCase()}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    project.priority === 'critical' ? 'bg-red-800 text-red-200' :
                    project.priority === 'high' ? 'bg-orange-800 text-orange-200' :
                    project.priority === 'medium' ? 'bg-yellow-800 text-yellow-200' :
                    'bg-green-800 text-green-200'
                  }`}>
                    {project.priority.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-300 mb-3">{project.description}</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div><strong>Customer:</strong> {project.customer}</div>
                  <div><strong>Type:</strong> <span className="capitalize">{project.type}</span></div>
                  <div><strong>Owner:</strong> {project.owner}</div>
                </div>
                <div>
                  <div><strong>Start:</strong> {project.startDate.toLocaleDateString()}</div>
                  <div><strong>End:</strong> {project.endDate.toLocaleDateString()}</div>
                  <div><strong>Progress:</strong> 
                    <span className="text-blue-400 ml-2">
                      {Math.round((project.actualHours / project.estimatedHours) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <div className="text-xs text-cortex-text-muted">
                  Tasks: {project.tasks.filter(t => t.status === 'completed').length}/{project.tasks.length} completed
                </div>
                <div className="text-green-400 font-mono text-sm">
                  project status --id {project.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const handleProjectStatus = (args: string[]) => {
  const projectId = args.includes('--id') ? args[args.indexOf('--id') + 1] : 'proj-acme-siem-001';
  const project = mockProjects.get(projectId);
  
  if (!project) {
    return <div className="text-red-400">Project not found: {projectId}</div>;
  }

  const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = project.tasks.length;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📊 Project Status: {project.name}</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <div><strong>Customer:</strong> {project.customer}</div>
          <div><strong>Type:</strong> <span className="capitalize">{project.type}</span></div>
          <div><strong>Status:</strong> 
            <span className={`ml-2 capitalize ${
              project.status === 'active' ? 'text-green-400' :
              project.status === 'completed' ? 'text-blue-400' :
              'text-yellow-400'
            }`}>
              {project.status.replace('-', ' ')}
            </span>
          </div>
          <div><strong>Priority:</strong> 
            <span className={`ml-2 capitalize ${
              project.priority === 'critical' ? 'text-red-400' :
              project.priority === 'high' ? 'text-orange-400' :
              project.priority === 'medium' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {project.priority}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div><strong>Start Date:</strong> {project.startDate.toLocaleDateString()}</div>
          <div><strong>End Date:</strong> {project.endDate.toLocaleDateString()}</div>
          <div><strong>Hours:</strong> {project.actualHours} / {project.estimatedHours}</div>
          <div><strong>Budget:</strong> {project.budget ? `$${project.budget.toLocaleString()}` : 'N/A'}</div>
        </div>
      </div>

      <div className="border border-gray-600 p-4 rounded mb-6">
        <div className="text-green-400 font-bold mb-2">📈 Progress Overview</div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Task Completion:</span>
            <span className="text-blue-400">{completedTasks}/{totalTasks} ({progressPercentage}%)</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-400 h-2 rounded-full" 
              style={{width: `${progressPercentage}%`}}
            />
          </div>
        </div>
      </div>

      {project.stakeholders.length > 0 && (
        <div className="border border-gray-600 p-4 rounded mb-6">
          <div className="text-purple-400 font-bold mb-2">👥 Key Stakeholders</div>
          <div className="space-y-2">
            {project.stakeholders.map((stakeholder, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm">{stakeholder.name}</div>
                  <div className="text-xs text-cortex-text-secondary">{stakeholder.role} • {stakeholder.company}</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  stakeholder.influence === 'high' ? 'bg-red-800 text-red-200' :
                  stakeholder.influence === 'medium' ? 'bg-yellow-800 text-yellow-200' :
                  'bg-green-800 text-green-200'
                }`}>
                  {stakeholder.influence} influence
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {project.notes.length > 0 && (
        <div className="border border-gray-600 p-4 rounded">
          <div className="text-yellow-400 font-bold mb-2">📝 Recent Notes</div>
          <div className="space-y-1 text-sm">
            {project.notes.slice(-3).map((note, idx) => (
              <div key={idx} className="text-gray-300">• {note}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const handleProjectTasks = (args: string[]) => {
  const projectId = args.includes('--project-id') ? args[args.indexOf('--project-id') + 1] : 'proj-acme-siem-001';
  const project = mockProjects.get(projectId);
  
  if (!project) {
    return <div className="text-red-400">Project not found: {projectId}</div>;
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📋 Project Tasks: {project.name}</div>
      
      <div className="space-y-3">
        {project.tasks.map(task => (
          <div key={task.id} className="border border-gray-600 p-4 rounded">
            <div className="flex justify-between items-start mb-2">
              <div className="font-bold text-green-400">{task.title}</div>
              <div className={`px-2 py-1 rounded text-xs ${
                task.status === 'completed' ? 'bg-green-800 text-green-200' :
                task.status === 'in-progress' ? 'bg-blue-800 text-blue-200' :
                task.status === 'blocked' ? 'bg-red-800 text-red-200' :
                'bg-gray-800 text-gray-200'
              }`}>
                {task.status.replace('-', ' ').toUpperCase()}
              </div>
            </div>
            
            <div className="text-sm text-gray-300 mb-3">{task.description}</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div><strong>Assignee:</strong> {task.assignee}</div>
                <div><strong>Priority:</strong> 
                  <span className={`ml-2 ${
                    task.priority === 'high' ? 'text-red-400' :
                    task.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div><strong>Due Date:</strong> {task.dueDate.toLocaleDateString()}</div>
              </div>
              <div>
                <div><strong>Estimated Hours:</strong> {task.estimatedHours}</div>
                <div><strong>Actual Hours:</strong> {task.actualHours}</div>
                {task.completedAt && (
                  <div><strong>Completed:</strong> {task.completedAt.toLocaleDateString()}</div>
                )}
              </div>
            </div>

            {task.dependencies.length > 0 && (
              <div className="mt-2 text-xs text-cortex-text-muted">
                <strong>Dependencies:</strong> {task.dependencies.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const handleProjectMilestones = (args: string[]) => {
  const upcoming = args.includes('--upcoming');
  const overdue = args.includes('--overdue');

  let allMilestones: (ProjectMilestone & { projectName: string })[] = [];
  
  Array.from(mockProjects.values()).forEach(project => {
    project.milestones.forEach(milestone => {
      allMilestones.push({ ...milestone, projectName: project.name });
    });
  });

  if (upcoming) {
    allMilestones = allMilestones.filter(m => m.status === 'upcoming' || m.status === 'in-progress');
  }

  if (overdue) {
    allMilestones = allMilestones.filter(m => 
      m.status !== 'completed' && new Date() > m.dueDate
    );
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">
        🎯 Project Milestones ({allMilestones.length})
      </div>
      
      <div className="space-y-4">
        {allMilestones.map(milestone => {
          const isOverdue = milestone.status !== 'completed' && new Date() > milestone.dueDate;
          
          return (
            <div key={milestone.id} className="border border-gray-600 p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-green-400">{milestone.title}</div>
                <div className={`px-2 py-1 rounded text-xs ${
                  milestone.status === 'completed' ? 'bg-green-800 text-green-200' :
                  milestone.status === 'in-progress' ? 'bg-blue-800 text-blue-200' :
                  milestone.status === 'delayed' || isOverdue ? 'bg-red-800 text-red-200' :
                  'bg-gray-800 text-gray-200'
                }`}>
                  {isOverdue && milestone.status !== 'completed' ? 'OVERDUE' : milestone.status.replace('-', ' ').toUpperCase()}
                </div>
              </div>
              
              <div className="text-sm text-gray-300 mb-3">{milestone.description}</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div><strong>Project:</strong> {milestone.projectName}</div>
                  <div><strong>Due Date:</strong> 
                    <span className={isOverdue ? 'text-red-400 ml-2' : 'ml-2'}>
                      {milestone.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                  {milestone.completedAt && (
                    <div><strong>Completed:</strong> {milestone.completedAt.toLocaleDateString()}</div>
                  )}
                </div>
                <div>
                  <div><strong>Deliverables:</strong></div>
                  <ul className="ml-4 text-xs">
                    {milestone.deliverables.map((deliverable, idx) => (
                      <li key={idx} className="text-cortex-text-secondary">• {deliverable}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const handleProjectUpdate = (args: string[]) => {
  return (
    <div className="text-green-300">
      <div className="font-bold mb-3">📝 Project Update</div>
      <div className="text-gray-300">Project update functionality coming soon...</div>
    </div>
  );
};

const handleProjectDashboard = (args: string[]) => {
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📊 Project Dashboard</div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="border border-green-600 p-3 rounded text-center">
          <div className="text-2xl font-bold text-green-400">5</div>
          <div className="text-sm text-gray-300">Active Projects</div>
        </div>
        <div className="border border-blue-600 p-3 rounded text-center">
          <div className="text-2xl font-bold text-blue-400">23</div>
          <div className="text-sm text-gray-300">Open Tasks</div>
        </div>
        <div className="border border-purple-600 p-3 rounded text-center">
          <div className="text-2xl font-bold text-purple-400">12</div>
          <div className="text-sm text-gray-300">Milestones</div>
        </div>
        <div className="border border-yellow-600 p-3 rounded text-center">
          <div className="text-2xl font-bold text-yellow-400">87%</div>
          <div className="text-sm text-gray-300">On-Time Delivery</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-600 p-4 rounded">
          <div className="text-cyan-400 font-bold mb-3">📈 Project Health</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Green (On Track):</span>
              <span className="text-green-400">60%</span>
            </div>
            <div className="flex justify-between">
              <span>Yellow (At Risk):</span>
              <span className="text-yellow-400">30%</span>
            </div>
            <div className="flex justify-between">
              <span>Red (Critical):</span>
              <span className="text-red-400">10%</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-600 p-4 rounded">
          <div className="text-orange-400 font-bold mb-3">⏰ Upcoming Deadlines</div>
          <div className="space-y-2 text-sm">
            <div>• TRR Validation - 3 days</div>
            <div>• Executive Presentation - 7 days</div>
            <div>• Pilot Environment Setup - 10 days</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// TRR Command Handlers
const handleTRRCreate = (args: string[]) => {
  const projectId = args.includes('--project') ? args[args.indexOf('--project') + 1] : '';
  const template = args.includes('--template') ? args[args.indexOf('--template') + 1] : 'standard';

  if (!projectId) {
    return (
      <div className="text-red-400">
        Project ID is required.
        <div className="mt-2 text-sm">
          Usage: <span className="font-mono">trr create --project proj-001 --template standard</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-green-300">
      <div className="font-bold mb-3 text-lg">🔍 Creating TRR Validation</div>
      
      <div className="border border-green-600 p-4 rounded mb-4">
        <div className="font-bold text-white mb-2">TRR Configuration</div>
        <div className="space-y-1 text-sm">
          <div><strong>Project ID:</strong> {projectId}</div>
          <div><strong>Template:</strong> {template}</div>
          <div><strong>Version:</strong> 1.0</div>
          <div><strong>Status:</strong> Draft</div>
        </div>
      </div>

      <div className="bg-blue-800 p-3 rounded mb-4">
        <div className="text-blue-200 font-bold">📋 Template Applied: {template}</div>
        <div className="text-sm mt-1">
          Standard requirements template includes Performance, Security, Integration, and Compliance categories.
        </div>
      </div>

      <div className="p-3 bg-gray-800 rounded border border-yellow-600">
        <div className="text-yellow-400 font-bold">🎯 Next Steps</div>
        <div className="text-sm text-gray-300 mt-1">
          1. Review and customize requirements<br/>
          2. Define validation criteria and methods<br/>
          3. Assign approvers and set timeline<br/>
          4. Begin validation testing process
        </div>
      </div>
    </div>
  );
};

const handleTRRList = (args: string[]) => {
  const status = args.includes('--status') ? args[args.indexOf('--status') + 1] : null;
  const pending = args.includes('--pending');

  let trrs = Array.from(mockTRRs.values());

  if (status) {
    trrs = trrs.filter(trr => trr.status === status);
  }

  if (pending) {
    trrs = trrs.filter(trr => 
      trr.status === 'in-review' || 
      trr.approvers.some(a => a.status === 'pending')
    );
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">🔍 TRR Validations ({trrs.length})</div>
      
      <div className="space-y-4">
        {trrs.map(trr => {
          const project = mockProjects.get(trr.projectId);
          const pendingApprovers = trr.approvers.filter(a => a.status === 'pending').length;
          const totalRequirements = trr.requirements.length;
          const validatedRequirements = trr.requirements.filter(r => r.status === 'validated').length;
          
          return (
            <div key={trr.id} className="border border-gray-600 p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-green-400">TRR v{trr.version}</div>
                <div className={`px-2 py-1 rounded text-xs ${
                  trr.status === 'approved' ? 'bg-green-800 text-green-200' :
                  trr.status === 'in-review' ? 'bg-blue-800 text-blue-200' :
                  trr.status === 'rejected' ? 'bg-red-800 text-red-200' :
                  trr.status === 'requires-changes' ? 'bg-yellow-800 text-yellow-200' :
                  'bg-gray-800 text-gray-200'
                }`}>
                  {trr.status.replace('-', ' ').toUpperCase()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div><strong>Project:</strong> {project?.name || trr.projectId}</div>
                  <div><strong>Created:</strong> {trr.createdAt.toLocaleDateString()}</div>
                  <div><strong>Last Updated:</strong> {trr.lastUpdated.toLocaleDateString()}</div>
                </div>
                <div>
                  <div><strong>Requirements:</strong> {validatedRequirements}/{totalRequirements} validated</div>
                  <div><strong>Pending Approvals:</strong> {pendingApprovers}</div>
                  {trr.signOffDate && (
                    <div><strong>Signed Off:</strong> {trr.signOffDate.toLocaleDateString()}</div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <div className="text-xs text-cortex-text-muted">
                  Progress: {Math.round((validatedRequirements / totalRequirements) * 100)}% validated
                </div>
                <div className="text-green-400 font-mono text-sm">
                  trr status --id {trr.id}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const handleTRRStatus = (args: string[]) => {
  const trrId = args.includes('--id') ? args[args.indexOf('--id') + 1] : 'trr-acme-001';
  const trr = mockTRRs.get(trrId);
  
  if (!trr) {
    return <div className="text-red-400">TRR not found: {trrId}</div>;
  }

  const project = mockProjects.get(trr.projectId);
  const validatedReqs = trr.requirements.filter(r => r.status === 'validated').length;
  const totalReqs = trr.requirements.length;
  const validationPercentage = Math.round((validatedReqs / totalReqs) * 100);

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">🔍 TRR Status: Version {trr.version}</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <div><strong>Project:</strong> {project?.name || trr.projectId}</div>
          <div><strong>Status:</strong> 
            <span className={`ml-2 capitalize ${
              trr.status === 'approved' ? 'text-green-400' :
              trr.status === 'rejected' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {trr.status.replace('-', ' ')}
            </span>
          </div>
          <div><strong>Created By:</strong> {trr.createdBy}</div>
          <div><strong>Last Updated:</strong> {trr.lastUpdated.toLocaleDateString()}</div>
        </div>
        <div className="space-y-3">
          <div><strong>Requirements:</strong> {validatedReqs}/{totalReqs} validated</div>
          <div><strong>Validation Progress:</strong> 
            <span className="text-blue-400 ml-2">{validationPercentage}%</span>
          </div>
          <div><strong>Test Results:</strong> {trr.testResults.filter(t => t.status === 'pass').length}/{trr.testResults.length} passed</div>
          <div><strong>Risk Items:</strong> {trr.riskAssessment.length}</div>
        </div>
      </div>

      <div className="border border-gray-600 p-4 rounded mb-6">
        <div className="text-purple-400 font-bold mb-2">👥 Approval Status</div>
        <div className="space-y-2">
          {trr.approvers.map((approver, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div>
                <div className="font-bold text-sm">{approver.name}</div>
                <div className="text-xs text-cortex-text-secondary">{approver.role}</div>
              </div>
              <div className={`px-2 py-1 rounded text-xs ${
                approver.status === 'approved' ? 'bg-green-800 text-green-200' :
                approver.status === 'rejected' ? 'bg-red-800 text-red-200' :
                approver.status === 'requires-changes' ? 'bg-yellow-800 text-yellow-200' :
                'bg-gray-800 text-gray-200'
              }`}>
                {approver.status.replace('-', ' ').toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gray-600 p-4 rounded">
        <div className="text-cyan-400 font-bold mb-2">📊 Validation Summary</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-green-400 text-lg font-bold">{trr.requirements.filter(r => r.status === 'validated').length}</div>
            <div>Validated</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 text-lg font-bold">{trr.requirements.filter(r => r.status === 'pending').length}</div>
            <div>Pending</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 text-lg font-bold">{trr.requirements.filter(r => r.status === 'failed').length}</div>
            <div>Failed</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 text-lg font-bold">{trr.testResults.filter(t => t.status === 'pass').length}</div>
            <div>Tests Passed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const handleTRRRequirements = (args: string[]) => {
  const category = args.includes('--category') ? args[args.indexOf('--category') + 1] : null;
  const priority = args.includes('--priority') ? args[args.indexOf('--priority') + 1] : null;

  const trr = mockTRRs.get('trr-acme-001')!;
  let requirements = trr.requirements;

  if (category) {
    requirements = requirements.filter(r => r.category === category);
  }

  if (priority) {
    requirements = requirements.filter(r => r.priority === priority);
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📋 Technical Requirements ({requirements.length})</div>
      
      <div className="space-y-4">
        {requirements.map(req => (
          <div key={req.id} className="border border-gray-600 p-4 rounded">
            <div className="flex justify-between items-start mb-2">
              <div className="font-bold text-green-400">{req.title}</div>
              <div className="flex gap-2">
                <div className={`px-2 py-1 rounded text-xs ${
                  req.priority === 'must-have' ? 'bg-red-800 text-red-200' :
                  req.priority === 'should-have' ? 'bg-yellow-800 text-yellow-200' :
                  'bg-green-800 text-green-200'
                }`}>
                  {req.priority.replace('-', ' ').toUpperCase()}
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  req.status === 'validated' ? 'bg-green-800 text-green-200' :
                  req.status === 'failed' ? 'bg-red-800 text-red-200' :
                  'bg-gray-800 text-gray-200'
                }`}>
                  {req.status.toUpperCase()}
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-300 mb-3">{req.description}</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div><strong>Category:</strong> <span className="capitalize">{req.category}</span></div>
                <div><strong>Validation Method:</strong> <span className="capitalize">{req.validationMethod}</span></div>
                {req.validatedBy && (
                  <div><strong>Validated By:</strong> {req.validatedBy}</div>
                )}
              </div>
              <div>
                {req.validatedDate && (
                  <div><strong>Validated Date:</strong> {req.validatedDate.toLocaleDateString()}</div>
                )}
                <div><strong>Evidence:</strong> {req.evidence.length} items</div>
              </div>
            </div>

            {req.acceptanceCriteria.length > 0 && (
              <div className="mt-3">
                <div className="text-yellow-400 font-bold text-sm mb-1">Acceptance Criteria:</div>
                <ul className="text-xs space-y-1">
                  {req.acceptanceCriteria.map((criteria, idx) => (
                    <li key={idx} className="text-cortex-text-secondary">• {criteria}</li>
                  ))}
                </ul>
              </div>
            )}

            {req.comments && (
              <div className="mt-2 text-xs text-cortex-text-muted">
                <strong>Comments:</strong> {req.comments}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const handleTRRValidate = (args: string[]) => {
  return (
    <div className="text-green-300">
      <div className="font-bold mb-3">✅ TRR Validation</div>
      <div className="text-gray-300">TRR validation functionality coming soon...</div>
    </div>
  );
};

const handleTRRApprove = (args: string[]) => {
  return (
    <div className="text-green-300">
      <div className="font-bold mb-3">✅ TRR Approval</div>
      <div className="text-gray-300">TRR approval functionality coming soon...</div>
    </div>
  );
};

const handleTRRReport = (args: string[]) => {
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-3">📊 TRR Report Generation</div>
      <div className="text-gray-300">TRR report generation coming soon...</div>
    </div>
  );
};

const handleTRRTest = (args: string[]) => {
  return (
    <div className="text-green-300">
      <div className="font-bold mb-3">🧪 TRR Testing</div>
      <div className="text-gray-300">TRR test execution functionality coming soon...</div>
    </div>
  );
};
