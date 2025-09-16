import React from 'react';
import { CommandConfig } from './commands';
import { SafetyPolicyManager, DeploymentRequest, PolicyValidationResult } from './safety-policy';
import { ResourceLedgerManager, ScenarioLedger, DeploymentSummary, CleanupPlan } from './resource-ledger';
import { CloudProfile } from './cloud-config-commands';

// Mock instances for demonstration
const policyManager = new SafetyPolicyManager();
const ledgerManager = new ResourceLedgerManager();

// Mock scenario data
const mockScenarios = [
  { id: 'ransomware-crypto', title: 'Ransomware with Crypto Mining', category: 'ransomware', difficulty: 'advanced' },
  { id: 'container-escape', title: 'Container Escape Attack', category: 'container', difficulty: 'intermediate' },
  { id: 'cloud-privesc', title: 'Cloud Privilege Escalation', category: 'cloud-security', difficulty: 'advanced' },
  { id: 'lateral-movement', title: 'Lateral Movement via SMB', category: 'lateral-movement', difficulty: 'beginner' },
  { id: 'data-exfiltration', title: 'Data Exfiltration via DNS', category: 'exfiltration', difficulty: 'intermediate' }
];

const mockCloudProfiles: CloudProfile[] = [
  { id: 'aws-dev', name: 'AWS Development', provider: 'aws', isDefault: true, lastUsed: new Date(), status: 'active' },
  { id: 'gcp-lab', name: 'GCP Security Lab', provider: 'gcp', isDefault: false, lastUsed: new Date(), status: 'active' }
];

interface DeploymentOptions {
  scenario?: string;
  cloudProfile?: string;
  unsafe?: boolean;
  dryRun?: boolean;
  ttlHours?: number;
  overlay?: 'safe' | 'unsafe';
}

interface CleanupOptions {
  scenario?: string;
  all?: boolean;
  scope?: string[];
  dryRun?: boolean;
  force?: boolean;
  expired?: boolean;
}

// Enhanced CDR Commands with Safety Integration
export const enhancedCdrCommands: CommandConfig[] = [
  {
    name: 'cdrlab',
    description: 'CDR Lab management system with safety policies and resource tracking',
    usage: 'cdrlab <command> [options]',
    aliases: ['cdr'],
    handler: async (args: string[]) => {
      if (args.length === 0) {
        return <CdrLabHelp />;
      }

      const command = args[0];
      const commandArgs = args.slice(1);

      switch (command) {
        case 'list':
        case 'ls':
          return <ScenarioList />;
        
        case 'deploy':
          return await handleDeploy(commandArgs);
        
        case 'destroy':
        case 'cleanup':
          return await handleCleanup(commandArgs);
        
        case 'status':
          return await handleStatus(commandArgs);
        
        case 'validate':
          return await handleValidate(commandArgs);
        
        case 'policy':
          return await handlePolicy(commandArgs);
        
        case 'ledger':
          return await handleLedger(commandArgs);
        
        case 'sweep':
          return await handleSweep(commandArgs);
        
        default:
          return (
            <div className="text-red-400">
              Unknown command: {command}
              <br />
              <span className="text-gray-400">Run 'cdrlab' for help</span>
            </div>
          );
      }
    }
  }
];

// Command Handlers
async function handleDeploy(args: string[]): Promise<React.ReactNode> {
  const options = parseDeployArgs(args);
  
  if (!options.scenario) {
    return (
      <div className="text-red-400">
        Error: Scenario ID required
        <br />
        <span className="text-gray-400">Usage: cdrlab deploy &lt;scenario-id&gt; [options]</span>
      </div>
    );
  }

  const scenario = mockScenarios.find(s => s.id === options.scenario);
  if (!scenario) {
    return (
      <div className="text-red-400">
        Error: Scenario not found: {options.scenario}
        <br />
        <span className="text-gray-400">Run 'cdrlab list' to see available scenarios</span>
      </div>
    );
  }

  // Create deployment request
  const deploymentRequest: DeploymentRequest = {
    scenarioId: options.scenario,
    unsafe: options.unsafe,
    ttlHours: options.ttlHours,
    estimatedResources: {
      cloudInstances: options.cloudProfile ? 3 : 0,
      k8sNamespaces: 1,
      storageGB: 10
    },
    kubernetesResources: {
      namespaces: [`cdrlab-${options.scenario}`],
      resourceTypes: ['Deployment', 'Service', 'Pod', 'Job']
    },
    cloudResources: options.cloudProfile ? {
      aws: {
        region: 'us-west-2',
        instanceCount: 2,
        services: ['EC2', 'S3']
      }
    } : undefined
  };

  // Validate against safety policy
  const validation = policyManager.validateDeployment(deploymentRequest);
  
  if (!validation.valid) {
    return <PolicyViolationDisplay validation={validation} />;
  }

  if (options.dryRun || validation.dryRunRecommended) {
    return <DeploymentPreview request={deploymentRequest} validation={validation} />;
  }

  // Execute deployment
  const ledger = await ledgerManager.createScenarioLedger(
    options.scenario,
    'user@example.com',
    options.overlay || 'safe',
    {
      ttlHours: options.ttlHours,
      accountContext: {
        kubernetesContext: 'lab-cluster',
        cloudProfiles: options.cloudProfile ? [options.cloudProfile] : undefined
      }
    }
  );

  // Simulate resource creation
  await simulateDeployment(ledger, deploymentRequest);

  const summary = ledgerManager.getDeploymentSummary(options.scenario);
  return <DeploymentResult summary={summary!} />;
}

async function handleCleanup(args: string[]): Promise<React.ReactNode> {
  const options = parseCleanupArgs(args);

  if (options.expired) {
    return await handleExpiredCleanup();
  }

  if (options.all) {
    return <div className="text-yellow-400">All cleanup requires --force flag for safety</div>;
  }

  if (!options.scenario) {
    return (
      <div className="text-red-400">
        Error: Scenario ID required
        <br />
        <span className="text-gray-400">Usage: cdrlab destroy &lt;scenario-id&gt; [options]</span>
      </div>
    );
  }

  try {
    const cleanupPlan = await ledgerManager.getCleanupPlan(options.scenario);
    
    if (options.dryRun) {
      return <CleanupPlanDisplay plan={cleanupPlan} />;
    }

    if (cleanupPlan.requiresConfirmation && !options.force) {
      return <CleanupConfirmation plan={cleanupPlan} />;
    }

    const result = await ledgerManager.executeCleanup(options.scenario, {
      dryRun: false,
      force: options.force,
      scope: options.scope as any
    });

    return <CleanupResult result={result} />;
  } catch (error) {
    return (
      <div className="text-red-400">
        Cleanup failed: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }
}

async function handleStatus(args: string[]): Promise<React.ReactNode> {
  const scenarioId = args[0];
  
  if (scenarioId) {
    const summary = ledgerManager.getDeploymentSummary(scenarioId);
    if (!summary) {
      return <div className="text-red-400">Scenario not found: {scenarioId}</div>;
    }
    return <ScenarioStatus summary={summary} />;
  }

  // Show all active scenarios
  const activeScenarios = mockScenarios.map(s => ledgerManager.getDeploymentSummary(s.id))
    .filter(s => s !== null) as DeploymentSummary[];

  return <OverallStatus scenarios={activeScenarios} />;
}

async function handleValidate(args: string[]): Promise<React.ReactNode> {
  const scenarioId = args[0];
  
  if (!scenarioId) {
    return <div className="text-red-400">Error: Scenario ID required</div>;
  }

  // Mock validation results
  const validationResults = {
    scenarioId,
    kubernetes: { passed: 8, failed: 1, warnings: 2 },
    cloud: { passed: 5, failed: 0, warnings: 1 },
    xsiam: { passed: 3, failed: 0, warnings: 0 },
    overall: 'warning' as const
  };

  return <ValidationResults results={validationResults} />;
}

async function handlePolicy(args: string[]): Promise<React.ReactNode> {
  const subcommand = args[0];
  
  switch (subcommand) {
    case 'show':
      return <PolicyDisplay />;
    case 'check':
      return <PolicyCheck scenarioId={args[1]} />;
    default:
      return <div className="text-gray-400">Usage: cdrlab policy &lt;show|check&gt;</div>;
  }
}

async function handleLedger(args: string[]): Promise<React.ReactNode> {
  const subcommand = args[0];
  
  switch (subcommand) {
    case 'show':
      return <LedgerDisplay scenarioId={args[1]} />;
    case 'query':
      return <LedgerQuery />;
    default:
      return <div className="text-gray-400">Usage: cdrlab ledger &lt;show|query&gt;</div>;
  }
}

async function handleExpiredCleanup(): Promise<React.ReactNode> {
  const expiredScenarios = ledgerManager.getExpiredScenarios();
  
  if (expiredScenarios.length === 0) {
    return <div className="text-green-400">No expired scenarios found</div>;
  }

  return <ExpiredScenariosCleanup scenarios={expiredScenarios} />;
}

async function handleSweep(args: string[]): Promise<React.ReactNode> {
  const scope = args[0] || 'all';
  
  // Mock orphaned resources
  const orphanedResources = [
    { type: 'kubernetes:Pod', name: 'orphaned-pod-1', age: '2d' },
    { type: 'aws:EC2Instance', name: 'i-orphaned123', age: '1d' }
  ];

  return <OrphanSweepResults scope={scope} orphans={orphanedResources} />;
}

// Utility Functions
function parseDeployArgs(args: string[]): DeploymentOptions {
  const options: DeploymentOptions = {};
  let i = 0;

  while (i < args.length) {
    const arg = args[i];
    
    if (!arg.startsWith('-') && !options.scenario) {
      options.scenario = arg;
    } else if (arg === '--cloud-profile') {
      options.cloudProfile = args[++i];
    } else if (arg === '--unsafe') {
      options.unsafe = true;
      options.overlay = 'unsafe';
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--ttl') {
      options.ttlHours = parseInt(args[++i]);
    }
    i++;
  }

  return options;
}

function parseCleanupArgs(args: string[]): CleanupOptions {
  const options: CleanupOptions = {};
  let i = 0;

  while (i < args.length) {
    const arg = args[i];
    
    if (!arg.startsWith('-') && !options.scenario) {
      options.scenario = arg;
    } else if (arg === '--all') {
      options.all = true;
    } else if (arg === '--scope') {
      options.scope = args[++i].split(',');
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--expired') {
      options.expired = true;
    }
    i++;
  }

  return options;
}

async function simulateDeployment(ledger: ScenarioLedger, request: DeploymentRequest): Promise<void> {
  // Simulate resource creation for demo
  const resources = [
    {
      identity: {
        provider: 'kubernetes' as const,
        type: 'Namespace',
        name: `cdrlab-${ledger.scenarioId}`,
        namespace: undefined
      },
      labels: {},
      metadata: {},
      deletionPolicy: 'delete' as const
    },
    {
      identity: {
        provider: 'kubernetes' as const,
        type: 'Deployment',
        name: 'attack-simulator',
        namespace: `cdrlab-${ledger.scenarioId}`
      },
      labels: {},
      metadata: {},
      deletionPolicy: 'delete' as const
    }
  ];

  if (request.cloudResources?.aws) {
    resources.push({
      identity: {
        provider: 'aws' as const,
        type: 'EC2Instance',
        name: 'attack-target-1',
        region: 'us-west-2'
      },
      labels: {},
      metadata: {},
      deletionPolicy: 'delete' as const,
      cost: { estimated: 0.12, currency: 'USD' as const, period: 'hour' as const }
    });
  }

  for (const resource of resources) {
    await ledgerManager.addResource(ledger.scenarioId, resource, 'user@example.com');
    await ledgerManager.updateResourceStatus(
      ledger.scenarioId,
      `${resource.identity.provider}:${resource.identity.type}:${resource.identity.namespace || 'default'}:${resource.identity.name}`,
      'ready'
    );
  }

  await ledgerManager.markScenarioDeployed(ledger.scenarioId);
}

// React Components
const CdrLabHelp = () => (
  <div className="text-blue-300 space-y-2">
    <div className="text-white font-bold">CDR Lab - Cloud Detection & Response Laboratory</div>
    <div className="ml-4 space-y-1 text-sm">
      <div><span className="text-yellow-300">cdrlab list</span> - List available scenarios</div>
      <div><span className="text-yellow-300">cdrlab deploy &lt;scenario&gt;</span> - Deploy a security scenario</div>
      <div><span className="text-yellow-300">cdrlab destroy &lt;scenario&gt;</span> - Clean up scenario resources</div>
      <div><span className="text-yellow-300">cdrlab status [scenario]</span> - Show deployment status</div>
      <div><span className="text-yellow-300">cdrlab validate &lt;scenario&gt;</span> - Validate scenario health</div>
      <div><span className="text-yellow-300">cdrlab policy show</span> - Display safety policies</div>
      <div><span className="text-yellow-300">cdrlab sweep</span> - Clean up orphaned resources</div>
    </div>
    <div className="text-gray-400 text-sm mt-3">
      Use --dry-run with deploy/destroy for safe previews
    </div>
  </div>
);

const ScenarioList = () => (
  <div className="space-y-3">
    <div className="text-blue-300 font-semibold">Available Security Scenarios</div>
    <div className="space-y-2">
      {mockScenarios.map(scenario => (
        <div key={scenario.id} className="flex items-center space-x-4 text-sm">
          <span className="text-yellow-300 w-20">{scenario.id}</span>
          <span className="text-white flex-1">{scenario.title}</span>
          <span className="text-gray-400">{scenario.category}</span>
          <span className={`px-2 py-1 rounded text-xs ${
            scenario.difficulty === 'beginner' ? 'bg-green-900 text-green-300' :
            scenario.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-300' :
            'bg-red-900 text-red-300'
          }`}>
            {scenario.difficulty}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const PolicyViolationDisplay = ({ validation }: { validation: PolicyValidationResult }) => (
  <div className="space-y-3">
    <div className="text-red-400 font-semibold">⚠️ Policy Violations Detected</div>
    {validation.violations.map((violation, index) => (
      <div key={index} className="ml-4 space-y-1">
        <div className="text-red-300">{violation.message}</div>
        {violation.suggestions && (
          <div className="ml-4 text-gray-400 text-sm space-y-1">
            {violation.suggestions.map((suggestion, i) => (
              <div key={i}>• {suggestion}</div>
            ))}
          </div>
        )}
      </div>
    ))}
    <div className="text-gray-400 text-sm mt-3">
      Use --force to override (unsafe mode)
    </div>
  </div>
);

const DeploymentPreview = ({ request, validation }: { 
  request: DeploymentRequest; 
  validation: PolicyValidationResult 
}) => (
  <div className="space-y-3">
    <div className="text-blue-300 font-semibold">🔍 Deployment Preview - {request.scenarioId}</div>
    
    <div className="ml-4 space-y-2">
      <div className="text-white">Resources to be created:</div>
      <div className="ml-4 space-y-1 text-sm">
        <div>• Kubernetes namespace: <span className="text-yellow-300">cdrlab-{request.scenarioId}</span></div>
        <div>• K8s resources: <span className="text-yellow-300">{request.estimatedResources?.k8sNamespaces || 1} namespace(s)</span></div>
        {request.cloudResources && (
          <div>• Cloud instances: <span className="text-yellow-300">{request.estimatedResources?.cloudInstances || 0}</span></div>
        )}
        {request.ttlHours && (
          <div>• Auto-cleanup: <span className="text-yellow-300">{request.ttlHours}h</span></div>
        )}
      </div>
    </div>

    {validation.violations.length > 0 && (
      <div className="ml-4">
        <div className="text-yellow-400">Warnings:</div>
        <div className="ml-4 space-y-1 text-sm text-yellow-300">
          {validation.violations.map((v, i) => (
            <div key={i}>• {v.message}</div>
          ))}
        </div>
      </div>
    )}

    <div className="text-gray-400 text-sm">
      Run without --dry-run to execute deployment
    </div>
  </div>
);

const DeploymentResult = ({ summary }: { summary: DeploymentSummary }) => (
  <div className="space-y-3">
    <div className="text-green-400 font-semibold">✅ Deployment Successful - {summary.scenarioId}</div>
    
    <div className="ml-4 space-y-2">
      <div className="flex space-x-8">
        <div>Status: <span className="text-green-300">{summary.status}</span></div>
        <div>Resources: <span className="text-blue-300">{summary.totalResources}</span></div>
        {summary.estimatedCostPerHour > 0 && (
          <div>Cost: <span className="text-yellow-300">${summary.estimatedCostPerHour.toFixed(2)}/hr</span></div>
        )}
      </div>
      
      {summary.ttl && (
        <div className="text-gray-400 text-sm">
          Auto-cleanup at: {summary.ttl.toLocaleString()}
        </div>
      )}
      
      <div className="text-sm space-y-1">
        <div className="text-white">Resource breakdown:</div>
        {Object.entries(summary.resourcesByProvider).map(([provider, stats]) => (
          <div key={provider} className="ml-4">
            <span className="text-blue-300">{provider}:</span> {stats.ready}/{stats.total} ready
          </div>
        ))}
      </div>
    </div>

    <div className="text-gray-400 text-sm">
      Use 'cdrlab status {summary.scenarioId}' to monitor progress
    </div>
  </div>
);

const CleanupPlanDisplay = ({ plan }: { plan: CleanupPlan }) => (
  <div className="space-y-3">
    <div className="text-blue-300 font-semibold">🧹 Cleanup Plan - {plan.scenarioId}</div>
    
    <div className="ml-4 space-y-2">
      <div>Estimated duration: <span className="text-yellow-300">{plan.estimatedDurationMinutes} minutes</span></div>
      
      {plan.warnings.length > 0 && (
        <div>
          <div className="text-yellow-400">Warnings:</div>
          <div className="ml-4 space-y-1 text-sm text-yellow-300">
            {plan.warnings.map((warning, i) => (
              <div key={i}>⚠️ {warning}</div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-white">Deletion waves:</div>
        {plan.deletionWaves.map((wave, i) => (
          <div key={i} className="ml-4">
            <div className="text-blue-300">Wave {wave.order}: {wave.description}</div>
            <div className="ml-4 text-gray-400 text-sm">
              {wave.resourceKeys.length} resources
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="text-gray-400 text-sm">
      Run without --dry-run to execute cleanup
    </div>
  </div>
);

const CleanupConfirmation = ({ plan }: { plan: CleanupPlan }) => (
  <div className="space-y-3">
    <div className="text-yellow-400 font-semibold">⚠️ Cleanup Confirmation Required</div>
    
    <div className="ml-4 space-y-2">
      <div>Scenario: <span className="text-white">{plan.scenarioId}</span></div>
      <div>Resources to delete: <span className="text-red-300">{
        Object.values(plan.resourcesByProvider).reduce((sum, resources) => sum + resources.length, 0)
      }</span></div>
      
      {plan.warnings.length > 0 && (
        <div className="space-y-1">
          {plan.warnings.map((warning, i) => (
            <div key={i} className="text-yellow-300">⚠️ {warning}</div>
          ))}
        </div>
      )}
    </div>

    <div className="text-gray-400 text-sm">
      Add --force flag to proceed with cleanup
    </div>
  </div>
);

const CleanupResult = ({ result }: { result: any }) => (
  <div className="space-y-3">
    <div className={`font-semibold ${result.errors.length > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
      🧹 Cleanup {result.errors.length > 0 ? 'Completed with Errors' : 'Successful'} - {result.scenarioId}
    </div>
    
    <div className="ml-4 space-y-2">
      <div className="flex space-x-8">
        <div>Processed: <span className="text-blue-300">{result.resourcesProcessed}</span></div>
        <div>Deleted: <span className="text-green-300">{result.resourcesDeleted}</span></div>
        {result.errors.length > 0 && (
          <div>Errors: <span className="text-red-300">{result.errors.length}</span></div>
        )}
      </div>
      
      {result.errors.length > 0 && (
        <div>
          <div className="text-red-400">Errors:</div>
          <div className="ml-4 space-y-1 text-sm text-red-300">
            {result.errors.map((error: any, i: number) => (
              <div key={i}>{error.resource}: {error.error}</div>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-gray-400 text-sm">
        Duration: {result.completedAt ? 
          Math.round((result.completedAt - result.startedAt) / 1000) + 's' : 
          'In progress'
        }
      </div>
    </div>
  </div>
);

const ScenarioStatus = ({ summary }: { summary: DeploymentSummary }) => (
  <div className="space-y-3">
    <div className="text-blue-300 font-semibold">📊 Scenario Status - {summary.scenarioId}</div>
    
    <div className="ml-4 space-y-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-white">Overview</div>
          <div className="ml-4 space-y-1 text-sm">
            <div>Status: <span className={`${
              summary.status === 'deployed' ? 'text-green-300' :
              summary.status === 'deploying' ? 'text-yellow-300' :
              summary.status === 'destroying' ? 'text-orange-300' :
              'text-red-300'
            }`}>{summary.status}</span></div>
            <div>Resources: <span className="text-blue-300">{summary.totalResources}</span></div>
            <div>Created: <span className="text-gray-300">{summary.createdAt.toLocaleString()}</span></div>
            {summary.ttl && (
              <div>TTL: <span className={summary.isExpired ? 'text-red-300' : 'text-yellow-300'}>
                {summary.ttl.toLocaleString()} {summary.isExpired ? '(EXPIRED)' : ''}
              </span></div>
            )}
          </div>
        </div>
        
        <div>
          <div className="text-white">Resources by Provider</div>
          <div className="ml-4 space-y-1 text-sm">
            {Object.entries(summary.resourcesByProvider).map(([provider, stats]) => (
              <div key={provider}>
                <span className="text-blue-300">{provider}:</span> {stats.ready}/{stats.total}
                {stats.error > 0 && <span className="text-red-300"> ({stats.error} errors)</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {summary.estimatedCostPerHour > 0 && (
        <div className="text-yellow-300">
          Estimated cost: ${summary.estimatedCostPerHour.toFixed(2)}/hour
        </div>
      )}
    </div>
  </div>
);

const OverallStatus = ({ scenarios }: { scenarios: DeploymentSummary[] }) => (
  <div className="space-y-3">
    <div className="text-blue-300 font-semibold">📊 Overall CDR Lab Status</div>
    
    {scenarios.length === 0 ? (
      <div className="text-gray-400">No active scenarios</div>
    ) : (
      <div className="ml-4 space-y-2">
        <div className="text-white">Active Scenarios: {scenarios.length}</div>
        <div className="space-y-1">
          {scenarios.map(scenario => (
            <div key={scenario.scenarioId} className="flex items-center space-x-4 text-sm">
              <span className="text-yellow-300 w-20">{scenario.scenarioId}</span>
              <span className={`w-16 ${
                scenario.status === 'deployed' ? 'text-green-300' :
                scenario.status === 'deploying' ? 'text-yellow-300' :
                'text-red-300'
              }`}>{scenario.status}</span>
              <span className="text-blue-300">{scenario.totalResources} resources</span>
              {scenario.isExpired && <span className="text-red-300">EXPIRED</span>}
            </div>
          ))}
        </div>
        
        <div className="text-gray-400 text-sm pt-2">
          Total cost: ${scenarios.reduce((sum, s) => sum + s.estimatedCostPerHour, 0).toFixed(2)}/hour
        </div>
      </div>
    )}
  </div>
);

const PolicyDisplay = () => (
  <div className="space-y-3">
    <div className="text-blue-300 font-semibold">🛡️ Safety Policy Configuration</div>
    
    <div className="ml-4 space-y-2 text-sm">
      <div>Mode: <span className="text-green-300">safe</span></div>
      <div>Max scenarios: <span className="text-yellow-300">10</span></div>
      <div>Max TTL: <span className="text-yellow-300">24h</span></div>
      <div>Max cloud resources: <span className="text-yellow-300">20</span></div>
      <div>Dry run default: <span className="text-green-300">enabled</span></div>
      <div>Confirmation required: <span className="text-green-300">enabled</span></div>
      
      <div className="pt-2">
        <div className="text-white">Allowed Kubernetes namespaces:</div>
        <div className="ml-4 text-gray-300">cdrlab-*, test-*, demo-*</div>
      </div>
      
      <div>
        <div className="text-white">Forbidden resources:</div>
        <div className="ml-4 text-gray-300">ClusterRole, ClusterRoleBinding</div>
      </div>
    </div>
  </div>
);

const PolicyCheck = ({ scenarioId }: { scenarioId?: string }) => (
  <div className="space-y-3">
    <div className="text-blue-300 font-semibold">🔍 Policy Check - {scenarioId || 'All Scenarios'}</div>
    
    <div className="ml-4 space-y-2 text-sm">
      <div className="text-green-400">✅ Namespace compliance</div>
      <div className="text-green-400">✅ Resource limits</div>
      <div className="text-green-400">✅ TTL configuration</div>
      <div className="text-yellow-400">⚠️ Cloud resource tagging incomplete</div>
    </div>
    
    <div className="text-gray-400 text-sm">
      Overall compliance: <span className="text-green-400">92%</span>
    </div>
  </div>
);

const LedgerDisplay = ({ scenarioId }: { scenarioId?: string }) => (
  <div className="space-y-3">
    <div className="text-blue-300 font-semibold">📋 Resource Ledger - {scenarioId || 'All'}</div>
    
    <div className="ml-4 space-y-2 text-sm">
      <div className="grid grid-cols-4 gap-4 text-gray-400">
        <div>Resource</div>
        <div>Provider</div>
        <div>Status</div>
        <div>Created</div>
      </div>
      <div className="space-y-1">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-yellow-300">cdrlab-ransomware/attack-simulator</div>
          <div className="text-blue-300">kubernetes</div>
          <div className="text-green-300">ready</div>
          <div className="text-gray-300">2m ago</div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-yellow-300">i-attack-target-1</div>
          <div className="text-blue-300">aws</div>
          <div className="text-green-300">ready</div>
          <div className="text-gray-300">3m ago</div>
        </div>
      </div>
    </div>
  </div>
);

const LedgerQuery = () => (
  <div className="space-y-3">
    <div className="text-blue-300 font-semibold">🔎 Resource Query</div>
    
    <div className="ml-4 space-y-2 text-sm">
      <div>Total tracked resources: <span className="text-yellow-300">127</span></div>
      <div>Active scenarios: <span className="text-green-300">3</span></div>
      <div>Kubernetes resources: <span className="text-blue-300">89</span></div>
      <div>Cloud resources: <span className="text-blue-300">23</span></div>
      <div>XSIAM rules: <span className="text-blue-300">15</span></div>
      <div>Expired resources: <span className="text-red-300">2</span></div>
    </div>
  </div>
);

const ValidationResults = ({ results }: { results: any }) => (
  <div className="space-y-3">
    <div className="text-blue-300 font-semibold">🔍 Validation Results - {results.scenarioId}</div>
    
    <div className="ml-4 space-y-2">
      {Object.entries(results).filter(([key]) => key !== 'scenarioId' && key !== 'overall').map(([scope, stats]: [string, any]) => (
        <div key={scope} className="flex items-center space-x-4">
          <span className="text-white w-16">{scope}:</span>
          <span className="text-green-300">{stats.passed} passed</span>
          <span className="text-red-300">{stats.failed} failed</span>
          <span className="text-yellow-300">{stats.warnings} warnings</span>
        </div>
      ))}
      
      <div className={`pt-2 font-semibold ${
        results.overall === 'passed' ? 'text-green-400' :
        results.overall === 'warning' ? 'text-yellow-400' :
        'text-red-400'
      }`}>
        Overall: {results.overall.toUpperCase()}
      </div>
    </div>
  </div>
);

const ExpiredScenariosCleanup = ({ scenarios }: { scenarios: ScenarioLedger[] }) => (
  <div className="space-y-3">
    <div className="text-yellow-400 font-semibold">⏰ Expired Scenarios ({scenarios.length})</div>
    
    <div className="ml-4 space-y-2">
      {scenarios.map(scenario => (
        <div key={scenario.scenarioId} className="flex items-center space-x-4 text-sm">
          <span className="text-red-300">{scenario.scenarioId}</span>
          <span className="text-gray-400">TTL: {scenario.ttl?.toLocaleString()}</span>
          <span className="text-blue-300">{scenario.resources.length} resources</span>
        </div>
      ))}
    </div>
    
    <div className="text-gray-400 text-sm">
      Run 'cdrlab destroy --expired --force' to clean up all expired scenarios
    </div>
  </div>
);

const OrphanSweepResults = ({ scope, orphans }: { scope: string; orphans: any[] }) => (
  <div className="space-y-3">
    <div className="text-blue-300 font-semibold">🧹 Orphan Resource Sweep - {scope}</div>
    
    {orphans.length === 0 ? (
      <div className="text-green-400 ml-4">No orphaned resources found</div>
    ) : (
      <div className="ml-4 space-y-2">
        <div className="text-yellow-400">Found {orphans.length} orphaned resources:</div>
        <div className="space-y-1 text-sm">
          {orphans.map((orphan, i) => (
            <div key={i} className="flex items-center space-x-4">
              <span className="text-red-300">{orphan.type}</span>
              <span className="text-white">{orphan.name}</span>
              <span className="text-gray-400">Age: {orphan.age}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);
