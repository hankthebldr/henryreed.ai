import React from 'react';
import { CommandConfig } from './commands';
import {
  requestBlueprintGeneration,
  subscribeToBlueprint,
  BadassBlueprintRecord,
  BlueprintRecordSelection,
} from './badass-blueprint-service';
import { dcContextStore, type CustomerEngagement, type ActivePOV, type TRRRecord } from './dc-context-store';
import { DCAPIClient } from './dc-api-client';

// POV engagement data structures
interface POVEngagement {
  id: string;
  customer: string;
  template: string;
  status: 'planning' | 'setup' | 'executing' | 'completed' | 'failed';
  environment: string;
  createdAt: Date;
  scheduledDate?: Date;
  completedAt?: Date;
  scenarios: POVScenario[];
  metrics: POVMetrics;
  configuration: POVConfiguration;
}

interface POVScenario {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration: string;
  detectionsCovered: string[];
  businessValue: string;
  executedAt?: Date;
}

interface POVMetrics {
  detectionsTriggered: number;
  falsePositives: number;
  meanTimeToDetection: string;
  coveragePercentage: number;
  businessImpact: {
    riskReduction: number;
    timeToValue: string;
    costSavings: number;
  };
}

interface POVConfiguration {
  xsiamTenant: string;
  dataSources: string[];
  integrations: string[];
  customFields: Record<string, string>;
  securityControls: string[];
}

// Mock POV engagement storage
const povEngagements = new Map<string, POVEngagement>();

// Sample POV template library
const POV_TEMPLATES = {
  'executive-overview': {
    name: 'Executive Security Overview',
    description: 'High-level security posture assessment and threat landscape demonstration',
    audience: 'C-Suite, Security Leadership',
    duration: '60 minutes',
    scenarios: ['cloud-posture', 'insider-threat', 'ransomware-demo'],
    deliverables: ['executive-summary', 'roi-analysis', 'roadmap'],
    difficulty: 'beginner'
  },
  'technical-deep-dive': {
    name: 'Technical Deep Dive',
    description: 'In-depth XSIAM capabilities demonstration for security analysts and engineers',
    audience: 'SOC Analysts, Security Engineers',
    duration: '2-3 hours',
    scenarios: ['advanced-persistent-threat', 'container-security', 'api-security', 'zero-day-response'],
    deliverables: ['technical-report', 'playbooks', 'detection-rules'],
    difficulty: 'advanced'
  },
  'industry-specific': {
    name: 'Industry-Specific Use Cases',
    description: 'Tailored scenarios based on industry vertical and compliance requirements',
    audience: 'Mixed Technical & Business',
    duration: '90 minutes',
    scenarios: ['compliance-validation', 'industry-threats', 'data-protection'],
    deliverables: ['compliance-report', 'risk-assessment', 'implementation-plan'],
    difficulty: 'intermediate'
  }
};

export const povCommands: CommandConfig[] = [
  {
    name: 'pov',
    description: 'POV (Proof of Value) lifecycle management for XSIAM demonstrations',
    usage: 'pov <command> [options]',
    aliases: ['proof-of-value'],
    handler: (args) => {
      if (args.length === 0) {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">🎯 POV Management - XSIAM Proof of Value</div>
            <div className="text-gray-300 mb-4">
              Comprehensive toolkit for managing customer proof-of-value engagements, from initial setup through final reporting.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-green-600 p-3 rounded">
                <div className="text-green-400 font-bold mb-2">🚀 POV Lifecycle</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-green-300">pov init customer-name --template executive-overview</div>
                  <div className="font-mono text-blue-300">pov configure --xsiam-tenant tenant.xdr.paloaltonetworks.com</div>
                  <div className="font-mono text-purple-300">pov execute --scenario cloud-posture --live</div>
                  <div className="font-mono text-yellow-300">pov report --executive --customer-branded</div>
                </div>
              </div>
              
              <div className="border border-blue-600 p-3 rounded">
                <div className="text-blue-400 font-bold mb-2">📊 Management & Tracking</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-cyan-300">pov list --status active --customer acme-corp</div>
                  <div className="font-mono text-purple-300">pov status pov-12345 --detailed</div>
                  <div className="font-mono text-yellow-300">pov metrics --timeframe 7d --compare-baseline</div>
                  <div className="font-mono text-red-300">pov cleanup pov-12345 --preserve-evidence</div>
                </div>
              </div>
            </div>

            <div className="border border-yellow-600 p-4 rounded mb-4">
              <div className="text-yellow-400 font-bold mb-2">⭐ POV Success Factors</div>
              <div className="text-sm text-gray-300 space-y-1">
                <div>• <strong>Customer-Centric:</strong> Scenarios tailored to customer environment and use cases</div>
                <div>• <strong>Business-Focused:</strong> Clear ROI metrics and business value demonstration</div>
                <div>• <strong>Production-Ready:</strong> Professional reporting and executive-ready deliverables</div>
                <div>• <strong>Recovery-Safe:</strong> Built-in error handling and graceful demo recovery</div>
              </div>
            </div>

            <div className="text-cyan-400 text-sm">
              Use <span className="font-mono">pov --help</span> or <span className="font-mono">pov &lt;command&gt; --help</span> for detailed usage information.
            </div>
          </div>
        );
      }

      // Special blueprint flag producing a cumulative roll-up and transformation journey
      if (args.includes('--badass-blueprint')) {
        return handlePovBadassBlueprint(args);
      }

      const subcommand = args[0];
      const subArgs = args.slice(1);

      switch (subcommand) {
        case 'init':
          return handlePovInit(subArgs);
        case 'list':
          return handlePovList(subArgs);
        case 'configure':
          return handlePovConfigure(subArgs);
        case 'execute':
          return handlePovExecute(subArgs);
        case 'status':
          return handlePovStatus(subArgs);
        case 'report':
          return handlePovReport(subArgs);
        case 'cleanup':
          return handlePovCleanup(subArgs);
        case 'metrics':
          return handlePovMetrics(subArgs);
        case 'templates':
          return handlePovTemplates(subArgs);
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
  }
];

const handlePovInit = (args: string[]) => {
  const customerName = args.find(arg => !arg.startsWith('--')) || '';
  const templateIndex = args.indexOf('--template');
  const template = templateIndex >= 0 ? args[templateIndex + 1] : 'executive-overview';
  const envIndex = args.indexOf('--environment');
  const environment = envIndex >= 0 ? args[envIndex + 1] : 'production';

  if (!customerName) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Customer Name Required</div>
        <div className="text-sm">
          Usage: <span className="font-mono text-yellow-400">pov init &lt;customer-name&gt; [--template &lt;template&gt;] [--environment &lt;env&gt;]</span>
        </div>
        <div className="mt-2 text-gray-300">
          Available templates: executive-overview, technical-deep-dive, industry-specific
        </div>
      </div>
    );
  }

  if (!POV_TEMPLATES[template as keyof typeof POV_TEMPLATES]) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Invalid Template</div>
        <div className="text-sm">
          Template '{template}' not found. Available templates:
        </div>
        <div className="mt-2 space-y-1">
          {Object.entries(POV_TEMPLATES).map(([key, tmpl]) => (
            <div key={key} className="text-gray-300">
              • <span className="font-mono text-green-400">{key}</span> - {tmpl.name} ({tmpl.audience})
            </div>
          ))}
        </div>
      </div>
    );
  }

  const povId = `pov-${customerName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 8)}`;
  const selectedTemplate = POV_TEMPLATES[template as keyof typeof POV_TEMPLATES];
  
  const newEngagement: POVEngagement = {
    id: povId,
    customer: customerName,
    template,
    status: 'planning',
    environment,
    createdAt: new Date(),
    scenarios: selectedTemplate.scenarios.map(scenario => ({
      id: `${scenario}-${Math.random().toString(36).substring(2, 6)}`,
      name: scenario.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      category: scenario.includes('cloud') ? 'cloud-security' : 
                scenario.includes('container') ? 'container-security' : 'general-security',
      status: 'pending',
      duration: '15-20 minutes',
      detectionsCovered: [`T10${Math.floor(Math.random() * 99)}`, `T11${Math.floor(Math.random() * 99)}`],
      businessValue: 'High impact threat detection and response validation'
    })),
    metrics: {
      detectionsTriggered: 0,
      falsePositives: 0,
      meanTimeToDetection: '0s',
      coveragePercentage: 0,
      businessImpact: {
        riskReduction: 0,
        timeToValue: 'TBD',
        costSavings: 0
      }
    },
    configuration: {
      xsiamTenant: '',
      dataSources: [],
      integrations: [],
      customFields: {},
      securityControls: []
    }
  };

  povEngagements.set(povId, newEngagement);

  return (
    <div className="text-green-300">
      <div className="font-bold mb-4 text-xl">🎯 POV Engagement Initialized</div>
      <div className="space-y-3">
        <div><strong>POV ID:</strong> <span className="text-yellow-400 font-mono">{povId}</span></div>
        <div><strong>Customer:</strong> {customerName}</div>
        <div><strong>Template:</strong> {selectedTemplate.name}</div>
        <div><strong>Target Audience:</strong> {selectedTemplate.audience}</div>
        <div><strong>Estimated Duration:</strong> {selectedTemplate.duration}</div>
        <div><strong>Environment:</strong> {environment}</div>
        
        <div className="mt-4">
          <div className="text-cyan-400 font-bold mb-2">📋 Planned Scenarios</div>
          <div className="space-y-2">
            {newEngagement.scenarios.map((scenario, index) => (
              <div key={index} className="flex justify-between items-center p-2 border border-gray-700 rounded">
                <div>
                  <div className="text-green-400">{scenario.name}</div>
                  <div className="text-xs text-cortex-text-secondary">{scenario.category} • {scenario.duration}</div>
                </div>
                <div className="text-purple-300 text-xs">
                  {scenario.detectionsCovered.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-blue-400 font-bold mb-2">📦 Expected Deliverables</div>
          <div className="text-sm space-y-1">
            {selectedTemplate.deliverables.map(deliverable => (
              <div key={deliverable} className="text-gray-300">
                • {deliverable.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-800 rounded">
          <div className="text-blue-200 font-bold mb-2">🚀 Next Steps</div>
          <div className="space-y-1 text-sm">
            <div className="font-mono text-green-400">pov configure {povId} --xsiam-tenant &lt;tenant&gt;</div>
            <div className="text-cortex-text-muted ml-4">→ Configure XSIAM connection and data sources</div>
            <div className="font-mono text-purple-400">pov execute {povId} --scenario &lt;scenario-id&gt;</div>
            <div className="text-cortex-text-muted ml-4">→ Start executing scenarios</div>
            <div className="font-mono text-yellow-400">pov status {povId}</div>
            <div className="text-cortex-text-muted ml-4">→ Monitor POV progress</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const handlePovList = (args: string[]) => {
  const statusFilter = args.includes('--status') ? args[args.indexOf('--status') + 1] : null;
  const customerFilter = args.includes('--customer') ? args[args.indexOf('--customer') + 1] : null;
  
  let engagements = Array.from(povEngagements.values());
  
  if (statusFilter) {
    engagements = engagements.filter(e => e.status === statusFilter);
  }
  
  if (customerFilter) {
    engagements = engagements.filter(e => e.customer.toLowerCase().includes(customerFilter.toLowerCase()));
  }
  
  if (engagements.length === 0) {
    return (
      <div className="text-yellow-400">
        <div className="font-bold mb-2">📊 No POV Engagements Found</div>
        <div className="text-gray-300 text-sm">
          {statusFilter || customerFilter ? 'No engagements match your filters.' : 'No POV engagements have been created yet.'}
          <div className="mt-2">
            Use <span className="font-mono text-green-400">pov init &lt;customer&gt;</span> to create your first engagement.
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📊 POV Engagements</div>
      <div className="space-y-4">
        {engagements.map(engagement => (
          <div key={engagement.id} className="border border-gray-600 p-4 rounded">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-mono text-yellow-400">{engagement.id}</div>
                <div className="text-lg text-white">{engagement.customer}</div>
              </div>
              <div className={`px-3 py-1 rounded text-xs font-bold ${
                engagement.status === 'completed' ? 'bg-green-800 text-green-200' :
                engagement.status === 'executing' ? 'bg-blue-800 text-blue-200' :
                engagement.status === 'setup' ? 'bg-purple-800 text-purple-200' :
                engagement.status === 'failed' ? 'bg-red-800 text-red-200' :
                'bg-gray-800 text-gray-200'
              }`}>
                {engagement.status.toUpperCase()}
              </div>
            </div>
            
            <div className="text-sm text-gray-300 space-y-1">
              <div>Template: <span className="text-cyan-400">{engagement.template}</span></div>
              <div>Environment: <span className="text-purple-400">{engagement.environment}</span></div>
              <div>Created: {engagement.createdAt.toLocaleString()}</div>
              <div>Scenarios: <span className="text-green-400">{engagement.scenarios.length} planned</span></div>
              {engagement.scheduledDate && (
                <div>Scheduled: <span className="text-yellow-400">{engagement.scheduledDate.toLocaleString()}</span></div>
              )}
            </div>
            
            <div className="mt-3 flex gap-2 text-xs">
              <div className="font-mono text-blue-400">pov status {engagement.id}</div>
              <div className="font-mono text-purple-400">pov execute {engagement.id}</div>
              <div className="font-mono text-green-400">pov report {engagement.id}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-gray-800 rounded">
        <div className="text-cyan-400 font-bold mb-2">🔍 Filter Options</div>
        <div className="text-sm space-y-1">
          <div className="font-mono text-green-400">pov list --status executing</div>
          <div className="font-mono text-blue-400">pov list --customer acme</div>
          <div className="font-mono text-purple-400">pov list --status completed --customer financial-corp</div>
        </div>
      </div>
    </div>
  );
};

const handlePovTemplates = (args: string[]) => {
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📋 POV Template Library</div>
      <div className="text-gray-300 mb-4">
        Pre-built POV templates optimized for different audiences and use cases.
      </div>
      
      <div className="space-y-4">
        {Object.entries(POV_TEMPLATES).map(([key, template]) => (
          <div key={key} className="border border-gray-600 p-4 rounded">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-cyan-400 font-bold text-lg">{template.name}</div>
                <div className="text-gray-300 text-sm mt-1">{template.description}</div>
              </div>
              <div className="text-right text-sm">
                <div className={`px-2 py-1 rounded text-xs mb-1 ${
                  template.difficulty === 'beginner' ? 'bg-green-800 text-green-200' :
                  template.difficulty === 'intermediate' ? 'bg-yellow-800 text-yellow-200' :
                  'bg-red-800 text-red-200'
                }`}>
                  {template.difficulty}
                </div>
                <div className="text-cortex-text-secondary">{template.duration}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <div className="text-purple-400 font-bold text-sm mb-1">👥 Target Audience</div>
                <div className="text-gray-300 text-xs">{template.audience}</div>
              </div>
              <div>
                <div className="text-blue-400 font-bold text-sm mb-1">📦 Deliverables</div>
                <div className="text-xs space-y-0">
                  {template.deliverables.map(deliverable => (
                    <div key={deliverable} className="text-gray-300">
                      • {deliverable.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="text-green-400 font-bold text-sm mb-1">🎯 Included Scenarios</div>
              <div className="flex flex-wrap gap-1">
                {template.scenarios.map(scenario => (
                  <span key={scenario} className="text-xs bg-green-800 text-green-200 px-2 py-1 rounded">
                    {scenario.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-gray-800 rounded text-xs">
              <div className="text-yellow-400 font-mono">
                pov init customer-name --template {key}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Additional handlers would be implemented here for configure, execute, status, report, cleanup, and metrics
// Keeping the response length manageable - these would follow similar patterns

const handlePovConfigure = (args: string[]) => {
  return (
    <div className="text-yellow-400">
      <div className="font-bold mb-2">🔧 POV Configuration</div>
      <div className="text-gray-300">Configuration management for POV engagements coming soon...</div>
    </div>
  );
};

const handlePovExecute = (args: string[]) => {
  return (
    <div className="text-yellow-400">
      <div className="font-bold mb-2">🚀 POV Execution</div>
      <div className="text-gray-300">Scenario execution management coming soon...</div>
    </div>
  );
};

const handlePovStatus = (args: string[]) => {
  return (
    <div className="text-yellow-400">
      <div className="font-bold mb-2">📊 POV Status</div>
      <div className="text-gray-300">Detailed status reporting coming soon...</div>
    </div>
  );
};

const handlePovReport = (args: string[]) => {
  return (
    <div className="text-yellow-400">
      <div className="font-bold mb-2">📋 POV Reporting</div>
      <div className="text-gray-300">Executive and technical reporting coming soon...</div>
    </div>
  );
};

const handlePovCleanup = (args: string[]) => {
  return (
    <div className="text-yellow-400">
      <div className="font-bold mb-2">🧹 POV Cleanup</div>
      <div className="text-gray-300">Safe environment cleanup coming soon...</div>
    </div>
  );
};

// Generate a "badass blueprint" roll-up with transformation journey and PDF link
interface SelectableBlueprintRecord {
  id: string;
  label: string;
  description: string;
  selection: BlueprintRecordSelection;
  details?: {
    typeLabel: string;
    status?: string;
    healthScore?: number;
  };
}

const sanitizeContextPayload = <T,>(value: T): T => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to sanitize blueprint selection context', error);
    return value;
  }
};

const computeHealthScoreFromCustomer = (customer: CustomerEngagement): number => {
  const milestones = customer.timeline?.keyMilestones || [];
  const completed = milestones.filter(milestone => milestone.status === 'complete').length;
  const atRisk = milestones.filter(milestone => milestone.status === 'at-risk').length;
  const total = Math.max(milestones.length, 1);
  const completionScore = (completed / total) * 45;
  const momentumScore = Math.min(customer.notes?.length || 0, 6) * 4;
  const maturityWeights: Record<CustomerEngagement['maturityLevel'], number> = {
    basic: 6,
    intermediate: 12,
    advanced: 18,
    expert: 22,
  };
  const maturityScore = maturityWeights[customer.maturityLevel] ?? 10;
  const riskPenalty = atRisk * 6;
  const base = 45 + completionScore + momentumScore + maturityScore - riskPenalty;
  return Math.max(35, Math.min(95, Math.round(base)));
};

const toCustomerSelectionContext = (customer: CustomerEngagement) =>
  sanitizeContextPayload({
    id: customer.id,
    name: customer.name,
    industry: customer.industry,
    maturityLevel: customer.maturityLevel,
    primaryConcerns: customer.primaryConcerns,
    techStack: customer.techStack,
    stakeholders: customer.stakeholders,
    timeline: customer.timeline,
    budget: customer.budget,
    competition: customer.competition,
    notes: customer.notes,
  });

const toPovSelectionContext = (pov: ActivePOV) =>
  sanitizeContextPayload({
    id: pov.id,
    name: pov.name,
    status: pov.status,
    scenarios: pov.scenarios,
    objectives: pov.objectives,
    successMetrics: pov.successMetrics,
    timeline: pov.timeline,
    outcomes: pov.outcomes,
    nextSteps: pov.nextSteps,
    aiInsights: pov.aiInsights,
    resources: pov.resources,
  });

const toTrrSelectionContext = (trr: TRRRecord) =>
  sanitizeContextPayload({
    id: trr.id,
    title: trr.title,
    priority: trr.priority,
    status: trr.status,
    description: trr.description,
    acceptanceCriteria: trr.acceptanceCriteria,
    validationMethod: trr.validationMethod,
    validationEvidence: trr.validationEvidence,
    timeline: trr.timeline,
    riskLevel: trr.riskLevel,
    businessImpact: trr.businessImpact,
    dependencies: trr.dependencies,
    notes: trr.notes,
    reviewers: trr.reviewers,
    assignedTo: trr.assignedTo,
  });

const buildSelectableRecordsFromContext = (): SelectableBlueprintRecord[] => {
  if (typeof window === 'undefined') return [];

  const customers = dcContextStore.getAllCustomerEngagements();
  const povs = dcContextStore.getAllActivePOVs();
  const trrs = dcContextStore.getAllTRRRecords();

  const customerMap = new Map<string, CustomerEngagement>(customers.map(customer => [customer.id, customer]));
  const records: SelectableBlueprintRecord[] = [];

  customers.forEach(customer => {
    const commonName = customer.name || `Customer ${customer.id}`;
    records.push({
      id: `customer:${customer.id}`,
      label: `${commonName} • Customer Engagement`,
      description: `${customer.industry} • ${customer.maturityLevel} maturity • ${
        customer.timeline?.keyMilestones?.length || 0
      } milestones`,
      selection: {
        source: 'customer',
        recordId: customer.id,
        commonName,
        customerId: customer.id,
        context: toCustomerSelectionContext(customer),
      },
      details: {
        typeLabel: 'Customer',
        status: customer.timeline?.keyMilestones?.slice(-1)[0]?.status,
      },
    });
  });

  povs.forEach(pov => {
    const baseCustomer = customerMap.get(pov.customerId);
    const commonName = baseCustomer?.name || pov.name || pov.id;
    records.push({
      id: `pov:${pov.id}`,
      label: `${commonName} • POV: ${pov.name}`,
      description: `Status: ${pov.status} • ${pov.scenarios.length} scenarios`,
      selection: {
        source: 'pov',
        recordId: pov.id,
        commonName,
        customerId: pov.customerId,
        context: toPovSelectionContext(pov),
      },
      details: {
        typeLabel: 'POV',
        status: pov.status,
      },
    });
  });

  trrs.forEach(trr => {
    const baseCustomer = customerMap.get(trr.customerId);
    const commonName = baseCustomer?.name || trr.title || trr.customerId || trr.id;
    records.push({
      id: `trr:${trr.id}`,
      label: `${commonName} • TRR: ${trr.title}`,
      description: `Priority: ${trr.priority} • Status: ${trr.status}`,
      selection: {
        source: 'trr',
        recordId: trr.id,
        commonName,
        customerId: trr.customerId,
        context: toTrrSelectionContext(trr),
      },
      details: {
        typeLabel: 'TRR',
        status: trr.status,
      },
    });
  });

  customers.forEach(customer => {
    const commonName = customer.name || `Customer ${customer.id}`;
    const healthScore = computeHealthScoreFromCustomer(customer);
    records.push({
      id: `health:${customer.id}`,
      label: `${commonName} • Health Flow`,
      description: `Composite health score ${healthScore}/100 across ${
        customer.timeline?.keyMilestones?.length || 0
      } milestones`,
      selection: {
        source: 'health',
        recordId: `health-${customer.id}`,
        commonName,
        customerId: customer.id,
        context: sanitizeContextPayload({
          customerId: customer.id,
          healthScore,
          milestones: customer.timeline?.keyMilestones || [],
          notes: customer.notes || [],
          maturityLevel: customer.maturityLevel,
          primaryConcerns: customer.primaryConcerns,
        }),
      },
      details: {
        typeLabel: 'Health Flow',
        status: `${healthScore}/100`,
        healthScore,
      },
    });
  });

  const unique = new Map<string, SelectableBlueprintRecord>();
  records.forEach(record => {
    unique.set(record.id, record);
  });

  return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
};

const loadSelectableRecords = async (): Promise<SelectableBlueprintRecord[]> => {
  if (typeof window === 'undefined') return [];
  let records = buildSelectableRecordsFromContext();
  if (records.length > 0) {
    return records;
  }

  try {
    const apiClient = new DCAPIClient();
    const response = await apiClient.fetchUserContext();
    if (!response.success) {
      console.warn('Failed to refresh DC context before blueprint selection', response.error);
    }
  } catch (error) {
    console.warn('Blueprint record fetch failed', error);
  }

  records = buildSelectableRecordsFromContext();
  return records;
};

const PovBadassBlueprintView: React.FC<{ args: string[] }> = ({ args }) => {
  const getArgValue = React.useCallback((flag: string): string | undefined => {
    const index = args.indexOf(flag);
    if (index >= 0) {
      return args[index + 1];
    }
    return undefined;
  }, [args]);

  const parseList = React.useCallback(
    (flag: string): string[] => {
      const value = getArgValue(flag);
      if (!value) return [];
      return value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
    },
    [getArgValue]
  );

  const engagementId =
    getArgValue('--engagement') ||
    getArgValue('--id') ||
    args.find(arg => !arg.startsWith('--')) ||
    'demo-engagement';
  const executiveTone = getArgValue('--tone') || 'Transformation Momentum';
  const emphasis = React.useMemo(
    () => ({
      wins: parseList('--wins'),
      risks: parseList('--risks'),
      roadmap: parseList('--roadmap'),
    }),
    [parseList]
  );

  const emphasisKey = React.useMemo(
    () => `${emphasis.wins.join('|')}::${emphasis.risks.join('|')}::${emphasis.roadmap.join('|')}`,
    [emphasis]
  );
  const [availableRecords, setAvailableRecords] = React.useState<SelectableBlueprintRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = React.useState(false);
  const [selectedRecordIds, setSelectedRecordIds] = React.useState<string[]>([]);
  const [promptDraft, setPromptDraft] = React.useState('');
  const [debouncedPrompt, setDebouncedPrompt] = React.useState('');

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let cancelled = false;

    const load = async () => {
      setLoadingRecords(true);
      try {
        const records = await loadSelectableRecords();
        if (cancelled) return;
        setAvailableRecords(records);
        setSelectedRecordIds(current => {
          if (current.length > 0) return current;
          if (records.length === 0) return current;

          const preferred = records
            .filter(record => {
              if (!engagementId) return false;
              if (record.selection.recordId === engagementId) return true;
              if (record.selection.customerId === engagementId) return true;
              return record.selection.commonName
                .toLowerCase()
                .includes(engagementId.toLowerCase());
            })
            .map(record => record.id);

          const fallback = preferred.length > 0
            ? preferred
            : records.slice(0, Math.min(2, records.length)).map(record => record.id);

          return Array.from(new Set(fallback));
        });
      } finally {
        if (!cancelled) {
          setLoadingRecords(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [engagementId]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handle = window.setTimeout(() => {
      setDebouncedPrompt(promptDraft.trim());
    }, 400);
    return () => window.clearTimeout(handle);
  }, [promptDraft]);

  const selectionKey = React.useMemo(() => {
    const keys = selectedRecordIds
      .map(id => {
        const record = availableRecords.find(item => item.id === id);
        if (!record) return null;
        return `${record.selection.source}:${record.selection.recordId}`;
      })
      .filter(Boolean) as string[];
    return keys.sort().join(',');
  }, [availableRecords, selectedRecordIds]);

  const requestKey = `${engagementId}|${executiveTone}|${emphasisKey}|${selectionKey}|${debouncedPrompt || ''}`;

  const selectedRecords = React.useMemo(() => {
    const set = new Set(selectedRecordIds);
    return availableRecords.filter(record => set.has(record.id));
  }, [availableRecords, selectedRecordIds]);

  const [blueprint, setBlueprint] = React.useState<BadassBlueprintRecord | null>(null);
  const [blueprintId, setBlueprintId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'requesting' | 'watching' | 'ready' | 'error'>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = React.useState(0);

  const handleRecordChange = React.useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions).map(option => option.value);
    setSelectedRecordIds(values);
  }, []);

  const handlePromptChange = React.useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptDraft(event.target.value);
  }, []);

  const requestRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [requestKey]);

  React.useEffect(() => {
    let cancelled = false;

    if (typeof window === 'undefined') {
      return undefined;
    }

    if (!engagementId) {
      setError('An engagement identifier is required. Use --engagement <id>.');
      setStatus('error');
      return undefined;
    }

    if (requestRef.current === requestKey) {
      return undefined;
    }

    const run = async () => {
      requestRef.current = requestKey;

      setBlueprint(null);
      setBlueprintId(null);
      setElapsedMs(0);
      setStatus('requesting');
      setError(null);

      try {
        const selectionsPayload = selectedRecordIds
          .map(id => availableRecords.find(item => item.id === id)?.selection)
          .filter(Boolean) as BlueprintRecordSelection[];

        const response = await requestBlueprintGeneration({
          engagementId,
          executiveTone,
          emphasis,
          recordSelections: selectionsPayload,
          tailoredPrompt: debouncedPrompt || undefined,
        });

        if (cancelled) {
          return;
        }

        setBlueprintId(response.blueprintId);
      } catch (err: any) {
        if (cancelled) return;
        setStatus('error');
        setError(err?.message || 'Failed to start blueprint generation');
        requestRef.current = null;
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    requestKey,
    engagementId,
    executiveTone,
    emphasis,
    availableRecords,
    selectedRecordIds,
    debouncedPrompt,
  ]);

  React.useEffect(() => {
    if (!blueprintId || typeof window === 'undefined') {
      return undefined;
    }

    setStatus(current => (current === 'requesting' ? 'watching' : current));

    let cancelled = false;
    const unsubscribe = subscribeToBlueprint(blueprintId, record => {
      if (cancelled || !record) return;

      setBlueprint(record);
      if (record.status === 'succeeded') {
        setStatus('ready');
      } else if (record.status === 'failed') {
        setStatus('error');
        setError(record.error?.message || 'Blueprint generation failed');
      } else if (
        record.status === 'processing' ||
        record.status === 'rendered' ||
        record.status === 'export_pending' ||
        record.status === 'bundled'
      ) {
        setStatus('watching');
      }
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [blueprintId]);

  const humanStatus = React.useMemo(() => {
    if (status === 'requesting') return 'Submitting to multi-modal extension…';
    if (status === 'watching') {
      const blueprintStatus = blueprint?.status;
      switch (blueprintStatus) {
        case 'processing':
          return 'Processing engagement context';
        case 'rendered':
          return 'PDF rendered – preparing bundle';
        case 'export_pending':
          return 'Publishing artifact bundle';
        case 'bundled':
          return 'Bundle ready – awaiting analytics export';
        default:
          return 'Streaming extension output…';
      }
    }
    if (status === 'ready') return 'Blueprint succeeded – downloads available';
    if (status === 'error') return error || 'Blueprint failed';
    return 'Ready to request blueprint';
  }, [status, blueprint, error]);

  const analytics = blueprint?.analytics;
  const elapsedSeconds = Math.max(1, Math.round(elapsedMs / 1000));

  const renderTimeline = React.useCallback(() => {
    const timeline = blueprint?.contextSnapshot?.timeline;
    if (!timeline || !Array.isArray(timeline) || timeline.length === 0) return null;
    return (
      <div className="border border-slate-700 rounded p-4 bg-slate-900/40">
        <div className="text-cyan-400 font-semibold mb-2">Engagement Timeline</div>
        <ol className="space-y-2 text-xs text-gray-200">
          {timeline.map((entry: any, index: number) => (
            <li key={`${entry.label}-${index}`} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400"></span>
              <div>
                <div className="font-semibold text-white">{entry.label}</div>
                <div className="text-gray-300">{entry.timestamp}</div>
                <div className="text-gray-400">{entry.description}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }, [blueprint]);

  const renderDeliverables = React.useCallback(() => (
    <div className="border border-slate-700 rounded p-4 bg-slate-900/40">
      <div className="text-cyan-400 font-semibold mb-2">Deliverables</div>
      <ul className="space-y-2 text-sm text-gray-200">
        <li>
          PDF Export:{' '}
          {blueprint?.pdf?.downloadUrl ? (
            <a
              href={blueprint.pdf.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 underline"
            >
              Download Blueprint
            </a>
          ) : (
            <span className="text-gray-400">Rendering…</span>
          )}
        </li>
        <li>
          Artifact Bundle:{' '}
          {blueprint?.artifactBundle?.downloadUrl ? (
            <a
              href={blueprint.artifactBundle.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 underline"
            >
              Download ZIP
            </a>
          ) : (
            <span className="text-gray-400">Bundling evidence…</span>
          )}
        </li>
        <li>
          BigQuery Job: {analytics?.bigQueryJobId ? analytics.bigQueryJobId : 'Pending export'}
        </li>
      </ul>
    </div>
  ), [analytics, blueprint]);

  const renderRecordPicker = React.useCallback(() => {
    if (loadingRecords) {
      return (
        <div className="border border-slate-700 rounded p-4 bg-slate-900/40">
          <div className="text-cyan-400 font-semibold mb-1">Supporting Records</div>
          <div className="text-xs text-cortex-text-secondary">Loading record catalog…</div>
        </div>
      );
    }

    if (availableRecords.length === 0) {
      return (
        <div className="border border-slate-700 rounded p-4 bg-slate-900/40">
          <div className="text-cyan-400 font-semibold mb-1">Supporting Records</div>
          <div className="text-xs text-cortex-text-secondary">
            No saved POV/TRR records found yet. Run{' '}
            <span className="font-mono text-green-400">dc sync</span> to import your customer workspace.
          </div>
        </div>
      );
    }

    return (
      <div className="border border-slate-700 rounded p-4 bg-slate-900/40 space-y-3">
        <div>
          <div className="text-cyan-400 font-semibold">Supporting Records</div>
          <div className="text-xs text-cortex-text-secondary">
            Select multiple customer artifacts to weave into the blueprint narrative.
          </div>
        </div>
        <select
          multiple
          value={selectedRecordIds}
          onChange={handleRecordChange}
          className="w-full h-32 bg-slate-950/70 border border-slate-700 rounded px-2 py-2 text-sm text-gray-100 focus:outline-none focus:border-cyan-500"
        >
          {availableRecords.map(record => (
            <option key={record.id} value={record.id}>
              {record.label}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          {selectedRecords.length > 0 ? (
            selectedRecords.map(record => (
              <span
                key={record.id}
                className="px-2 py-1 rounded border border-cyan-600/60 bg-cyan-900/30 text-xs text-cyan-100"
              >
                {record.details?.typeLabel ? `${record.details.typeLabel}: ` : ''}
                {record.selection.commonName}
              </span>
            ))
          ) : (
            <span className="text-xs text-cortex-text-secondary">
              Select at least one record to activate blueprint blending.
            </span>
          )}
        </div>
      </div>
    );
  }, [availableRecords, handleRecordChange, loadingRecords, selectedRecordIds, selectedRecords]);

  const renderTailoredPrompt = React.useCallback(
    () => (
      <div className="border border-slate-700 rounded p-4 bg-slate-900/40 space-y-2">
        <div className="text-cyan-400 font-semibold">Tailored Prompt</div>
        <div className="text-xs text-cortex-text-secondary">
          Give the multi-modal engine a pointed executive ask (e.g. board readiness, automation velocity, risk posture).
        </div>
        <textarea
          value={promptDraft}
          onChange={handlePromptChange}
          rows={4}
          placeholder="Focus on the automation wins that resonate with the CISO and highlight roadmap acceleration."
          className="w-full bg-slate-950/70 border border-slate-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
        />
        {debouncedPrompt && (
          <div className="text-xs text-cortex-text-secondary">
            Locked prompt: <span className="text-cyan-200">{debouncedPrompt}</span>
          </div>
        )}
      </div>
    ),
    [debouncedPrompt, handlePromptChange, promptDraft]
  );

  const renderSupportingRecords = React.useCallback(() => {
    const supporting = (blueprint?.contextSnapshot?.supportingRecords as any[]) || [];
    const fallback = blueprint?.selections || [];

    if (supporting.length === 0 && fallback.length === 0 && selectedRecords.length === 0) {
      return (
        <div className="border border-slate-700 rounded p-4 bg-slate-900/40 text-xs text-cortex-text-secondary">
          Selected records will appear here once the blueprint run begins.
        </div>
      );
    }

    const recordsToRender = supporting.length > 0
      ? supporting
      : fallback.length > 0
      ? fallback
      : selectedRecords.map(record => ({
          source: record.selection.source,
          recordId: record.selection.recordId,
          commonName: record.selection.commonName,
          summary: record.description,
          details: record.details,
        }));

    return (
      <div className="border border-slate-700 rounded p-4 bg-slate-900/40 space-y-3">
        <div className="text-cyan-400 font-semibold">Context Blend</div>
        <div className="text-xs text-cortex-text-secondary">
          Blueprint is combining {recordsToRender.length} record{recordsToRender.length === 1 ? '' : 's'} across POV, TRR, and health data.
        </div>
        <ul className="space-y-2 text-xs text-gray-200">
          {recordsToRender.map((record: any, index: number) => (
            <li
              key={`${record.recordId || record.id || index}`}
              className="border border-slate-700/60 rounded px-3 py-2 bg-slate-950/40"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="font-semibold text-white">{record.commonName || record.label}</div>
                <div className="text-[10px] uppercase tracking-wide text-cyan-300">
                  {(record.source || record.type || record.details?.typeLabel || 'record').toString()}
                </div>
              </div>
              {record.summary && <div className="text-cortex-text-secondary mt-1">{record.summary}</div>}
              {Array.isArray(record.highlights) && record.highlights.length > 0 && (
                <div className="text-cortex-text-secondary mt-1">
                  {(record.highlights as string[]).slice(0, 3).join(' • ')}
                </div>
              )}
              {record.details?.status && (
                <div className="text-cortex-text-secondary mt-1">Status: {record.details.status}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }, [blueprint, selectedRecords]);

  const renderAnalytics = React.useCallback(() => {
    if (!analytics) return null;
    const formatPercent = (value: number | null | undefined) =>
      typeof value === 'number' ? `${Math.round(value * 100)}%` : '—';

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-green-600/60 bg-green-900/20 rounded p-4">
          <div className="text-xs uppercase text-green-300">Recommendation Coverage</div>
          <div className="text-2xl font-mono text-white">{formatPercent(analytics.recommendationCoverage)}</div>
        </div>
        <div className="border border-blue-600/60 bg-blue-900/20 rounded p-4">
          <div className="text-xs uppercase text-blue-300">Automation Confidence</div>
          <div className="text-2xl font-mono text-white">{formatPercent(analytics.automationConfidence)}</div>
        </div>
        <div className="border border-yellow-600/60 bg-yellow-900/20 rounded p-4">
          <div className="text-xs uppercase text-yellow-300">Risk Score</div>
          <div className="text-2xl font-mono text-white">{formatPercent(analytics.riskScore)}</div>
        </div>
      </div>
    );
  }, [analytics]);

  const renderEmphasis = React.useCallback(() => {
    const hasEmphasis =
      (emphasis.wins && emphasis.wins.length > 0) ||
      (emphasis.risks && emphasis.risks.length > 0) ||
      (emphasis.roadmap && emphasis.roadmap.length > 0);
    if (!hasEmphasis) return null;
    return (
      <div className="border border-slate-700 rounded p-4 bg-slate-900/40">
        <div className="text-cyan-400 font-semibold mb-2">Emphasis Overrides</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-200">
          <div>
            <div className="uppercase tracking-wide text-green-300 mb-1">Wins</div>
            <ul className="space-y-1 list-disc list-inside">
              {emphasis.wins?.map(win => (
                <li key={win}>{win}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="uppercase tracking-wide text-yellow-300 mb-1">Risks</div>
            <ul className="space-y-1 list-disc list-inside">
              {emphasis.risks?.map(risk => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="uppercase tracking-wide text-blue-300 mb-1">Roadmap</div>
            <ul className="space-y-1 list-disc list-inside">
              {emphasis.roadmap?.map(step => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }, [emphasis]);

  return (
    <div className="space-y-4 text-blue-200">
      <div>
        <div className="text-2xl font-bold text-cyan-400">🧭 POV Badass Blueprint</div>
        <div className="text-sm text-cortex-text-secondary">
          Multi-modal extension that compiles POV/TRR context into an executive-ready blueprint and artifact bundle.
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="px-2 py-1 rounded-full border border-cyan-500/60 bg-cyan-900/30 text-cyan-200">
          {humanStatus}
        </span>
        <span className="px-2 py-1 rounded-full border border-slate-600 bg-slate-900/40 text-slate-200">
          Engagement: {engagementId}
        </span>
        <span className="px-2 py-1 rounded-full border border-slate-600 bg-slate-900/40 text-slate-200">
          Tone: {executiveTone}
        </span>
        <span className="px-2 py-1 rounded-full border border-slate-600 bg-slate-900/40 text-slate-200">
          Elapsed: {elapsedSeconds}s
        </span>
        <span className="px-2 py-1 rounded-full border border-cyan-700/60 bg-cyan-900/40 text-cyan-100">
          Records: {Math.max(selectedRecords.length, blueprint?.selections?.length || 0)}
        </span>
        {(debouncedPrompt || promptDraft || blueprint?.tailoredPrompt) && (
          <span className="px-2 py-1 rounded-full border border-purple-600/60 bg-purple-900/40 text-purple-100">
            Prompt: {(blueprint?.tailoredPrompt || debouncedPrompt || promptDraft).slice(0, 48)}
            {(blueprint?.tailoredPrompt || debouncedPrompt || promptDraft).length > 48 ? '…' : ''}
          </span>
        )}
        {blueprint?.payload?.executiveTheme && (
          <span className="px-2 py-1 rounded-full border border-green-600/50 bg-green-900/30 text-green-200">
            Theme: {blueprint.payload.executiveTheme}
          </span>
        )}
      </div>

      {error && (
        <div className="border border-red-600/60 bg-red-900/20 text-red-200 text-sm p-3 rounded">
          {error}
        </div>
      )}

      {renderAnalytics()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          {renderRecordPicker()}
          {renderTailoredPrompt()}
        </div>
        <div>{renderSupportingRecords()}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {renderTimeline()}
          {renderEmphasis()}
        </div>
        <div className="space-y-4">
          {renderDeliverables()}
          {blueprint?.analytics?.recommendationCategories && (
            <div className="border border-slate-700 rounded p-4 bg-slate-900/40 text-xs text-gray-200">
              <div className="text-cyan-400 font-semibold mb-2">Recommendation Categories</div>
              <ul className="space-y-1 list-disc list-inside">
                {blueprint.analytics.recommendationCategories.map(category => (
                  <li key={category}>{category}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-cortex-text-secondary">
        Tip: Adjust tone with <span className="font-mono text-green-400">--tone "Transformation Velocity"</span> and emphasize wins/risks using{' '}
        <span className="font-mono text-green-400">--wins</span>, <span className="font-mono text-green-400">--risks</span>, and{' '}
        <span className="font-mono text-green-400">--roadmap</span> flags.
      </div>
    </div>
  );
};


const handlePovBadassBlueprint = (args: string[]) => <PovBadassBlueprintView args={args} />;

const handlePovMetrics = (args: string[]) => {
  return (
    <div className="text-yellow-400">
      <div className="font-bold mb-2">📈 POV Metrics</div>
      <div className="text-gray-300">Performance and business metrics coming soon...</div>
    </div>
  );
};
