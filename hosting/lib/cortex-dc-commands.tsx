import React from 'react';
import { CommandConfig } from './commands';

// POV Data Models
interface POV {
  id: string;
  customerName: string;
  useCase: string;
  stage: 'discovery' | 'demo' | 'pilot' | 'decision' | 'closed';
  createdAt: Date;
  estimatedClose: Date;
  stakeholders: Stakeholder[];
  status: 'active' | 'won' | 'lost' | 'on-hold';
  notes: string[];
  activities: Activity[];
}

interface Customer {
  id: string;
  name: string;
  industry: string;
  size: 'SMB' | 'Mid-Market' | 'Enterprise';
  environment: {
    cloudProviders: string[];
    currentTools: string[];
    compliance: string[];
    dataVolume: string;
  };
  contacts: Contact[];
  healthScore: number;
}

interface Stakeholder {
  name: string;
  role: string;
  influence: 'low' | 'medium' | 'high';
  contactPreference: string;
}

interface Contact {
  name: string;
  role: string;
  email: string;
  phone?: string;
  decisionMaker: boolean;
}

interface Activity {
  id: string;
  type: 'meeting' | 'demo' | 'call' | 'email' | 'presentation';
  date: Date;
  description: string;
  attendees: string[];
  outcome: string;
  nextSteps: string[];
}

// Mock data storage (in production, this would be a proper database)
const mockPOVs = new Map<string, POV>();
const mockCustomers = new Map<string, Customer>();

// Initialize with sample data
const sampleCustomer: Customer = {
  id: 'acme-corp',
  name: 'Acme Corporation',
  industry: 'Financial Services',
  size: 'Enterprise',
  environment: {
    cloudProviders: ['AWS', 'Azure'],
    currentTools: ['Splunk', 'CrowdStrike', 'Okta'],
    compliance: ['PCI-DSS', 'SOX', 'GDPR'],
    dataVolume: '2TB/day'
  },
  contacts: [
    { name: 'John Smith', role: 'CISO', email: 'john.smith@acme.com', decisionMaker: true },
    { name: 'Sarah Wilson', role: 'SOC Manager', email: 'sarah.wilson@acme.com', decisionMaker: false }
  ],
  healthScore: 85
};

const samplePOV: POV = {
  id: 'acme-siem-migration',
  customerName: 'Acme Corporation',
  useCase: 'SIEM Migration & XDR Implementation',
  stage: 'demo',
  createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
  estimatedClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  stakeholders: [
    { name: 'John Smith', role: 'CISO', influence: 'high', contactPreference: 'email' },
    { name: 'Sarah Wilson', role: 'SOC Manager', influence: 'high', contactPreference: 'phone' }
  ],
  status: 'active',
  notes: [
    'Customer impressed with ML-based threat detection capabilities',
    'Concern about migration complexity - addressed with phased approach',
    'Positive feedback on automation capabilities during demo'
  ],
  activities: [
    {
      id: 'act-1',
      type: 'meeting',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      description: 'Initial discovery call with CISO and SOC team',
      attendees: ['John Smith', 'Sarah Wilson', 'Mike Johnson'],
      outcome: 'Identified key requirements and pain points',
      nextSteps: ['Prepare technical demo', 'Send architecture overview']
    },
    {
      id: 'act-2',
      type: 'demo',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      description: 'Technical demo - Advanced threat detection & response',
      attendees: ['Sarah Wilson', 'Tech Team (4 people)'],
      outcome: 'Strong positive feedback on automation and ML capabilities',
      nextSteps: ['Schedule pilot discussion', 'Provide ROI analysis']
    }
  ]
};

mockCustomers.set(sampleCustomer.id, sampleCustomer);
mockPOVs.set(samplePOV.id, samplePOV);

// XSIAM Demo Scenarios
const xsiamScenarios = [
  {
    id: 'ransomware-detection',
    name: 'Ransomware Attack Detection & Response',
    description: 'End-to-end ransomware attack simulation with automated response',
    duration: '45 minutes',
    audience: 'Technical',
    techniques: ['File encryption behavior', 'Network anomalies', 'Process injection'],
    outcomes: ['Threat hunting', 'Automated containment', 'Forensic timeline']
  },
  {
    id: 'insider-threat',
    name: 'Insider Threat Detection',
    description: 'Behavioral analytics to detect malicious insider activity',
    duration: '30 minutes',
    audience: 'Executive + Technical',
    techniques: ['Behavioral analysis', 'Data access patterns', 'Privilege escalation'],
    outcomes: ['Risk scoring', 'Policy violations', 'Investigation workflow']
  },
  {
    id: 'cloud-security',
    name: 'Cloud Security Posture Management',
    description: 'Multi-cloud security monitoring and compliance',
    duration: '60 minutes',
    audience: 'Cloud architects',
    techniques: ['Configuration drift', 'Identity analytics', 'Resource monitoring'],
    outcomes: ['Compliance dashboards', 'Auto-remediation', 'Cost optimization']
  }
];

export const cortexDCCommands: CommandConfig[] = [
  // POV Management Commands
  {
    name: 'pov',
    description: 'Proof-of-Value lifecycle management for customer engagements',
    usage: 'pov <command> [options]',
    aliases: ['proof-of-value'],
    handler: (args) => {
      if (args.length === 0) {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">🎯 POV Management Hub</div>
            <div className="text-gray-300 mb-4">
              Complete proof-of-value lifecycle management for customer engagements.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-green-600 p-3 rounded">
                <div className="text-green-400 font-bold mb-2">📋 Planning & Setup</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-green-300">pov create --customer "Acme Corp" --use-case "SIEM Migration"</div>
                  <div className="font-mono text-blue-300">pov template list --industry finance</div>
                  <div className="font-mono text-purple-300">pov timeline generate --milestones discovery,demo,pilot</div>
                </div>
              </div>
              <div className="border border-blue-600 p-3 rounded">
                <div className="text-blue-400 font-bold mb-2">⚡ Execution & Tracking</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-cyan-300">pov status --active --summary</div>
                  <div className="font-mono text-yellow-300">pov progress update --stage demo --notes</div>
                  <div className="font-mono text-purple-300">pov report generate --template executive</div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-800 rounded border border-yellow-600">
              <div className="text-yellow-400 font-bold mb-2">🚀 Quick Actions</div>
              <div className="text-sm text-gray-300">
                Active POVs: <span className="text-green-400">{Array.from(mockPOVs.values()).filter(p => p.status === 'active').length}</span> | 
                This Week: <span className="text-blue-400">3 demos, 2 follow-ups</span> | 
                Win Rate: <span className="text-purple-400">73%</span>
              </div>
            </div>
          </div>
        );
      }

      const subcommand = args[0];
      const subArgs = args.slice(1);

      switch (subcommand) {
        case 'create':
          return handlePovCreate(subArgs);
        case 'list':
          return handlePovList(subArgs);
        case 'status':
          return handlePovStatus(subArgs);
        case 'update':
          return handlePovUpdate(subArgs);
        case 'demo':
          return handlePovDemo(subArgs);
        case 'report':
          return handlePovReport(subArgs);
        default:
          return (
            <div className="text-red-400">
              Unknown POV command: {subcommand}
              <div className="mt-2 text-gray-300 text-sm">
                Run <span className="font-mono">pov</span> to see available commands.
              </div>
            </div>
          );
      }
    }
  },

  // Customer Management Commands
  {
    name: 'customer',
    description: 'Customer relationship and engagement management',
    usage: 'customer <command> [options]',
    aliases: ['client'],
    handler: (args) => {
      if (args.length === 0) {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">🏢 Customer Engagement Hub</div>
            <div className="text-gray-300 mb-4">
              Comprehensive customer relationship and engagement management.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-purple-600 p-3 rounded">
                <div className="text-purple-400 font-bold mb-2">👥 Profile Management</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-green-300">customer profile create "Acme Corp" --industry finance</div>
                  <div className="font-mono text-blue-300">customer contacts add --name "John Doe" --role CISO</div>
                  <div className="font-mono text-purple-300">customer environment assess --cloud aws</div>
                </div>
              </div>
              <div className="border border-green-600 p-3 rounded">
                <div className="text-green-400 font-bold mb-2">📅 Engagement Tracking</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-cyan-300">customer meeting schedule --type demo</div>
                  <div className="font-mono text-yellow-300">customer health check --indicators all</div>
                  <div className="font-mono text-orange-300">customer follow-up generate --action-items</div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      const subcommand = args[0];
      const subArgs = args.slice(1);

      switch (subcommand) {
        case 'list':
          return handleCustomerList(subArgs);
        case 'profile':
          return handleCustomerProfile(subArgs);
        case 'health':
          return handleCustomerHealth(subArgs);
        default:
          return (
            <div className="text-red-400">
              Unknown customer command: {subcommand}
            </div>
          );
      }
    }
  },

  // XSIAM Demonstration Commands
  {
    name: 'xsiam',
    description: 'XSIAM platform demonstrations and technical deep-dives',
    usage: 'xsiam <command> [options]',
    aliases: ['cortex'],
    handler: (args) => {
      if (args.length === 0) {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">🛡️ XSIAM Demonstration Hub</div>
            <div className="text-gray-300 mb-4">
              Comprehensive XSIAM platform demonstrations and technical explanations.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-cyan-600 p-3 rounded">
                <div className="text-cyan-400 font-bold mb-2">🎯 Live Demonstrations</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-green-300">xsiam demo start --scenario ransomware-detection</div>
                  <div className="font-mono text-blue-300">xsiam playbook demonstrate --use-case phishing</div>
                  <div className="font-mono text-purple-300">xsiam investigation walkthrough --incident apt</div>
                </div>
              </div>
              <div className="border border-orange-600 p-3 rounded">
                <div className="text-orange-400 font-bold mb-2">🔧 Technical Deep-Dives</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-cyan-300">xsiam architecture explain --component data-lake</div>
                  <div className="font-mono text-yellow-300">xsiam query language tutorial --examples hunting</div>
                  <div className="font-mono text-pink-300">xsiam api demonstrate --integration soar</div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-green-400 font-bold mb-2">🎬 Featured Demo Scenarios</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                {xsiamScenarios.slice(0, 3).map(scenario => (
                  <div key={scenario.id} className="border border-gray-600 p-2 rounded">
                    <div className="font-mono text-blue-300">{scenario.name}</div>
                    <div className="text-xs text-cortex-text-secondary">{scenario.duration} • {scenario.audience}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      const subcommand = args[0];
      const subArgs = args.slice(1);

      switch (subcommand) {
        case 'demo':
          return handleXsiamDemo(subArgs);
        case 'capabilities':
          return handleXsiamCapabilities(subArgs);
        case 'scenarios':
          return handleXsiamScenarios(subArgs);
        case 'architecture':
          return handleXsiamArchitecture(subArgs);
        default:
          return (
            <div className="text-red-400">
              Unknown XSIAM command: {subcommand}
            </div>
          );
      }
    }
  },

  // Dashboard Commands
  {
    name: 'dashboard',
    description: 'Domain consultant performance and engagement analytics',
    usage: 'dashboard [overview|calendar|tasks|performance] [options]',
    aliases: ['dash', 'stats'],
    handler: (args) => {
      const view = args[0] || 'overview';

      switch (view) {
        case 'overview':
          return handleDashboardOverview(args.slice(1));
        case 'calendar':
          return handleDashboardCalendar(args.slice(1));
        case 'performance':
          return handleDashboardPerformance(args.slice(1));
        default:
          return handleDashboardOverview(args);
      }
    }
  }
];

// POV Command Handlers
const handlePovCreate = (args: string[]) => {
  return (
    <div className="text-green-300">
      <div className="font-bold mb-3 text-lg">🎯 Create New POV</div>
      <div className="text-gray-300 mb-3">POV creation wizard coming soon...</div>
      <div className="p-3 bg-gray-800 rounded border border-green-600">
        <div className="text-green-400 font-bold">💡 Quick Template</div>
        <div className="text-sm mt-1">
          <div>Customer: <span className="text-blue-400">New Enterprise Customer</span></div>
          <div>Use Case: <span className="text-purple-400">SIEM Migration & XDR</span></div>
          <div>Timeline: <span className="text-yellow-400">45 days</span></div>
          <div>Stakeholders: <span className="text-cyan-400">CISO, SOC Manager, IT Director</span></div>
        </div>
      </div>
    </div>
  );
};

const handlePovList = (args: string[]) => {
  const activePOVs = Array.from(mockPOVs.values()).filter(pov => pov.status === 'active');

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📋 Active POVs ({activePOVs.length})</div>
      <div className="space-y-3">
        {activePOVs.map(pov => (
          <div key={pov.id} className="border border-gray-600 p-4 rounded">
            <div className="flex justify-between items-start mb-2">
              <div className="font-mono text-yellow-400">{pov.id}</div>
              <div className={`px-2 py-1 rounded text-xs ${
                pov.stage === 'demo' ? 'bg-blue-800 text-blue-200' :
                pov.stage === 'pilot' ? 'bg-green-800 text-green-200' :
                pov.stage === 'decision' ? 'bg-yellow-800 text-yellow-200' :
                'bg-gray-800 text-gray-200'
              }`}>
                {pov.stage.toUpperCase()}
              </div>
            </div>
            <div className="text-sm space-y-1">
              <div><strong>Customer:</strong> <span className="text-green-400">{pov.customerName}</span></div>
              <div><strong>Use Case:</strong> {pov.useCase}</div>
              <div><strong>Est. Close:</strong> <span className="text-purple-400">{pov.estimatedClose.toLocaleDateString()}</span></div>
              <div><strong>Stakeholders:</strong> {pov.stakeholders.map(s => s.name).join(', ')}</div>
            </div>
            {pov.notes.length > 0 && (
              <div className="mt-2 text-xs text-cortex-text-secondary">
                <strong>Latest:</strong> {pov.notes[pov.notes.length - 1]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const handlePovStatus = (args: string[]) => {
  const pov = mockPOVs.get('acme-siem-migration');
  if (!pov) {
    return <div className="text-red-400">POV not found</div>;
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📊 POV Status: {pov.customerName}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div><strong>ID:</strong> <span className="font-mono text-yellow-400">{pov.id}</span></div>
          <div><strong>Stage:</strong> <span className="text-blue-400 capitalize">{pov.stage}</span></div>
          <div><strong>Status:</strong> <span className="text-green-400 capitalize">{pov.status}</span></div>
          <div><strong>Created:</strong> {pov.createdAt.toLocaleDateString()}</div>
          <div><strong>Est. Close:</strong> <span className="text-purple-400">{pov.estimatedClose.toLocaleDateString()}</span></div>
        </div>
        <div>
          <div className="text-cyan-400 font-bold mb-2">👥 Key Stakeholders</div>
          <div className="space-y-1 text-sm">
            {pov.stakeholders.map((stakeholder, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{stakeholder.name}</span>
                <span className="text-cortex-text-secondary">{stakeholder.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pov.activities.length > 0 && (
        <div className="mt-4">
          <div className="text-green-400 font-bold mb-2">📅 Recent Activities</div>
          <div className="space-y-2">
            {pov.activities.slice(-3).map(activity => (
              <div key={activity.id} className="border-l-2 border-blue-400 pl-3 py-1">
                <div className="text-white font-mono text-sm">{activity.description}</div>
                <div className="text-xs text-cortex-text-secondary">
                  {activity.date.toLocaleDateString()} • {activity.type} • {activity.attendees.length} attendees
                </div>
                <div className="text-xs text-blue-300 mt-1">{activity.outcome}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const handlePovUpdate = (args: string[]) => {
  return (
    <div className="text-green-300">
      <div className="font-bold mb-3">📝 POV Progress Update</div>
      <div className="text-gray-300">Progress update functionality coming soon...</div>
    </div>
  );
};

const handlePovDemo = (args: string[]) => {
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-3">🎬 POV Demo Preparation</div>
      <div className="text-gray-300">Demo preparation tools coming soon...</div>
    </div>
  );
};

const handlePovReport = (args: string[]) => {
  return (
    <div className="text-purple-300">
      <div className="font-bold mb-3">📊 POV Reporting</div>
      <div className="text-gray-300">Report generation coming soon...</div>
    </div>
  );
};

// Customer Command Handlers
const handleCustomerList = (args: string[]) => {
  const customers = Array.from(mockCustomers.values());

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">🏢 Customer Directory ({customers.length})</div>
      <div className="space-y-3">
        {customers.map(customer => (
          <div key={customer.id} className="border border-gray-600 p-4 rounded">
            <div className="flex justify-between items-start mb-2">
              <div className="font-bold text-green-400">{customer.name}</div>
              <div className="text-xs bg-purple-800 text-purple-200 px-2 py-1 rounded">
                {customer.size}
              </div>
            </div>
            <div className="text-sm space-y-1">
              <div><strong>Industry:</strong> {customer.industry}</div>
              <div><strong>Environment:</strong> {customer.environment.cloudProviders.join(', ')}</div>
              <div><strong>Current Tools:</strong> {customer.environment.currentTools.join(', ')}</div>
              <div><strong>Data Volume:</strong> <span className="text-yellow-400">{customer.environment.dataVolume}</span></div>
              <div><strong>Health Score:</strong> 
                <span className={`ml-2 ${customer.healthScore >= 80 ? 'text-green-400' : customer.healthScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {customer.healthScore}/100
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const handleCustomerProfile = (args: string[]) => {
  const customer = mockCustomers.get('acme-corp');
  if (!customer) {
    return <div className="text-red-400">Customer not found</div>;
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">👤 Customer Profile: {customer.name}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div><strong>Industry:</strong> {customer.industry}</div>
          <div><strong>Size:</strong> <span className="text-purple-400">{customer.size}</span></div>
          <div><strong>Health Score:</strong> 
            <span className="text-green-400 ml-2">{customer.healthScore}/100</span>
          </div>
          <div><strong>Data Volume:</strong> <span className="text-yellow-400">{customer.environment.dataVolume}</span></div>
        </div>
        <div>
          <div className="text-cyan-400 font-bold mb-2">🏗️ Environment</div>
          <div className="space-y-1 text-sm">
            <div><strong>Cloud:</strong> {customer.environment.cloudProviders.join(', ')}</div>
            <div><strong>Security Tools:</strong> {customer.environment.currentTools.join(', ')}</div>
            <div><strong>Compliance:</strong> {customer.environment.compliance.join(', ')}</div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-green-400 font-bold mb-2">📞 Key Contacts</div>
        <div className="space-y-2">
          {customer.contacts.map((contact, idx) => (
            <div key={idx} className="flex justify-between items-center border border-gray-700 p-2 rounded">
              <div>
                <div className="font-bold">{contact.name}</div>
                <div className="text-sm text-cortex-text-secondary">{contact.role}</div>
              </div>
              <div className="text-right text-sm">
                <div className="text-blue-300">{contact.email}</div>
                {contact.decisionMaker && (
                  <div className="text-xs text-yellow-400">Decision Maker</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const handleCustomerHealth = (args: string[]) => {
  return (
    <div className="text-green-300">
      <div className="font-bold mb-3">💚 Customer Health Analysis</div>
      <div className="text-gray-300">Health check functionality coming soon...</div>
    </div>
  );
};

// XSIAM Command Handlers
const handleXsiamDemo = (args: string[]) => {
  if (args.length === 0) {
    return (
      <div className="text-cyan-300">
        <div className="font-bold mb-4 text-xl">🎬 Available Demo Scenarios</div>
        <div className="space-y-3">
          {xsiamScenarios.map(scenario => (
            <div key={scenario.id} className="border border-cyan-600 p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-white">{scenario.name}</div>
                <div className="text-xs bg-blue-800 text-blue-200 px-2 py-1 rounded">
                  {scenario.duration}
                </div>
              </div>
              <div className="text-sm text-gray-300 mb-3">{scenario.description}</div>
              <div className="text-xs space-y-1">
                <div><strong>Audience:</strong> <span className="text-purple-400">{scenario.audience}</span></div>
                <div><strong>Key Techniques:</strong> {scenario.techniques.join(', ')}</div>
                <div><strong>Demo Outcomes:</strong> {scenario.outcomes.join(', ')}</div>
              </div>
              <div className="mt-2">
                <span className="text-green-400 font-mono text-sm">
                  xsiam demo start --scenario {scenario.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-cyan-300">
      <div className="font-bold mb-3">🚀 Starting XSIAM Demo...</div>
      <div className="text-gray-300">Demo execution coming soon...</div>
    </div>
  );
};

const handleXsiamCapabilities = (args: string[]) => {
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">⚡ XSIAM Core Capabilities</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-green-600 p-4 rounded">
          <div className="text-green-400 font-bold text-lg mb-2">🗃️ Data Lake</div>
          <div className="text-sm space-y-1">
            <div>• Petabyte-scale storage</div>
            <div>• 400+ pre-built parsers</div>
            <div>• Real-time data ingestion</div>
            <div>• Advanced compression</div>
          </div>
        </div>
        <div className="border border-blue-600 p-4 rounded">
          <div className="text-blue-400 font-bold text-lg mb-2">🧠 AI/ML Engine</div>
          <div className="text-sm space-y-1">
            <div>• Behavioral analytics</div>
            <div>• Threat intelligence correlation</div>
            <div>• Anomaly detection</div>
            <div>• Predictive analysis</div>
          </div>
        </div>
        <div className="border border-purple-600 p-4 rounded">
          <div className="text-purple-400 font-bold text-lg mb-2">🔄 Automation</div>
          <div className="text-sm space-y-1">
            <div>• 300+ playbook templates</div>
            <div>• Custom workflow builder</div>
            <div>• API integrations</div>
            <div>• Automated response</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const handleXsiamScenarios = (args: string[]) => {
  return handleXsiamDemo([]);
};

const handleXsiamArchitecture = (args: string[]) => {
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-3">🏗️ XSIAM Architecture Deep-Dive</div>
      <div className="text-gray-300">Architecture explanation coming soon...</div>
    </div>
  );
};

// Dashboard Command Handlers
const handleDashboardOverview = (args: string[]) => {
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📊 Domain Consultant Dashboard</div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="border border-green-600 p-3 rounded text-center">
          <div className="text-2xl font-bold text-green-400">3</div>
          <div className="text-sm text-gray-300">Active POVs</div>
        </div>
        <div className="border border-blue-600 p-3 rounded text-center">
          <div className="text-2xl font-bold text-blue-400">73%</div>
          <div className="text-sm text-gray-300">Win Rate</div>
        </div>
        <div className="border border-purple-600 p-3 rounded text-center">
          <div className="text-2xl font-bold text-purple-400">$2.1M</div>
          <div className="text-sm text-gray-300">Pipeline Value</div>
        </div>
        <div className="border border-yellow-600 p-3 rounded text-center">
          <div className="text-2xl font-bold text-yellow-400">4.8</div>
          <div className="text-sm text-gray-300">Customer Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-600 p-4 rounded">
          <div className="text-green-400 font-bold mb-3">📅 This Week</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Technical Demos:</span>
              <span className="text-blue-400">3 scheduled</span>
            </div>
            <div className="flex justify-between">
              <span>Follow-up Calls:</span>
              <span className="text-yellow-400">2 pending</span>
            </div>
            <div className="flex justify-between">
              <span>POV Deliveries:</span>
              <span className="text-purple-400">1 due</span>
            </div>
            <div className="flex justify-between">
              <span>Customer Meetings:</span>
              <span className="text-green-400">5 total</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-600 p-4 rounded">
          <div className="text-blue-400 font-bold mb-3">🎯 Recent Wins</div>
          <div className="space-y-2 text-sm">
            <div>• Acme Corp - Advanced to pilot stage</div>
            <div>• TechStart Inc - Positive demo feedback</div>
            <div>• Global Bank - Compliance validation passed</div>
            <div>• Retail Chain - ROI analysis approved</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const handleDashboardCalendar = (args: string[]) => {
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-3">📅 Calendar & Upcoming Activities</div>
      <div className="text-gray-300">Calendar integration coming soon...</div>
    </div>
  );
};

const handleDashboardPerformance = (args: string[]) => {
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-3">📈 Performance Analytics</div>
      <div className="text-gray-300">Performance metrics coming soon...</div>
    </div>
  );
};
