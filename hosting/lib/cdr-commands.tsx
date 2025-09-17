import React from 'react';
import { CommandConfig } from './commands';

// Cloud Detection and Response Lab resource ledger for tracking deployments
interface ResourceLedgerEntry {
  id: string;
  type: string;
  provider: 'k8s' | 'gcp' | 'aws' | 'azure' | 'xsiam';
  identity: string;
  location: string;
  labels: Record<string, string>;
  uid: string;
  createdAt: Date;
  destroyedAt?: Date;
  status: 'active' | 'destroyed' | 'failed';
}

interface ScenarioLedger {
  scenarioId: string;
  povId?: string;
  createdAt: Date;
  overlay: 'safe' | 'unsafe';
  accountContext: string;
  resources: ResourceLedgerEntry[];
  opsLog: Array<{
    timestamp: Date;
    operation: 'deploy' | 'validate' | 'destroy';
    outcome: 'success' | 'failure' | 'pending';
    message: string;
  }>;
}

// Standard Cloud Detection and Response Lab labels enforced on all resources
const CDR_LABELS = {
  'managed-by': 'cdrlab',
  'cdrlab.version': 'v1.0',
  'owner': 'user',
  'created-at': new Date().toISOString(),
};

// Mock ledger storage (in production this would be persisted)
const scenarioLedgers = new Map<string, ScenarioLedger>();

// Add sample scenario for demonstration
scenarioLedgers.set('cryptominer-demo', {
  scenarioId: 'cryptominer-demo',
  povId: 'pov-ransomware-001',
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  overlay: 'safe',
  accountContext: 'gcp-dev-project',
  resources: [
    {
      id: 'ns-1',
      type: 'Namespace',
      provider: 'k8s',
      identity: 'cdr-lab',
      location: 'cluster-1',
      labels: { ...CDR_LABELS, 'cdrlab.scenario': 'cryptominer-demo' },
      uid: 'ns-12345',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: 'job-1',
      type: 'Job',
      provider: 'k8s',
      identity: 'cryptominer-job',
      location: 'cdr-lab/cryptominer-job',
      labels: { ...CDR_LABELS, 'cdrlab.scenario': 'cryptominer-demo' },
      uid: 'job-67890',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: 'gce-1',
      type: 'ComputeInstance',
      provider: 'gcp',
      identity: 'cdr-test-vm-1',
      location: 'us-central1-a',
      labels: { ...CDR_LABELS, 'cdrlab.scenario': 'cryptominer-demo' },
      uid: 'gce-instance-123',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: 'rule-1',
      type: 'DetectionRule',
      provider: 'xsiam',
      identity: 'Cryptocurrency Mining Detection',
      location: 'content-pack-cdr',
      labels: { ...CDR_LABELS, 'cdrlab.scenario': 'cryptominer-demo' },
      uid: 'rule-abc123',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'active'
    }
  ],
  opsLog: [
    {
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      operation: 'deploy',
      outcome: 'success',
      message: 'Deployed cryptominer scenario with 4 resources'
    },
    {
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      operation: 'validate',
      outcome: 'success',
      message: 'Validation passed: 15/15 checks successful'
    }
  ]
});

// POV Plan schema for multi-scenario orchestration
interface PovPlan {
  apiVersion: 'cdrlab.pov/v1';
  kind: 'PovPlan';
  id: string;
  title: string;
  cleanupPolicy: {
    onSuccess: 'destroy' | 'retain';
    onFailure: 'destroy' | 'retain-with-ttl';
    ttl?: string;
  };
  steps: Array<{
    scenario: string;
    provider?: string;
    depends?: string[];
    timeout?: string;
  }>;
}

// Detection generation templates
const DETECTION_TEMPLATES = {
  xsiam: {
    'T1496': { // Resource Hijacking
      queryTemplate: `
dataset = xdr_data
| where event_type = "Process" and action_process_file_name contains "xmrig"
| where event_sub_type = "Process Create"
| project _time, agent_hostname, actor_process_file_name, action_process_command_line
| where action_process_command_line contains "pool" or action_process_command_line contains "wallet"
`,
      title: 'Cryptocurrency Mining Detection',
      severity: 'Medium',
      description: 'Detects potential cryptocurrency mining activity based on process execution patterns'
    },
    'T1578': { // Modify Cloud Compute Infrastructure
      queryTemplate: `
config(start_time="24 hours ago")
| where action_type = "RESOURCE_CREATION"
| where resource_type in ("COMPUTE_INSTANCE", "STORAGE_BUCKET", "NETWORK_RULE")
| where actor_identity != "service-account"
| project _time, actor_identity, resource_name, action_result
| where resource_name matches regex ".*test.*|.*temp.*|.*cdr.*"
`,
      title: 'Suspicious Cloud Resource Creation',
      severity: 'High',
      description: 'Detects creation of compute resources with suspicious naming patterns'
    }
  }
};

// MITRE technique to data source mapping
const TECHNIQUE_DATASOURCES: Record<string, string[]> = {
  'T1496': ['Process Monitoring', 'Network Traffic', 'Performance Counters'],
  'T1578': ['Cloud Resource Logs', 'API Audit Logs', 'Infrastructure Monitoring'],
  'T1611': ['Container Logs', 'Host Monitoring', 'Kernel Audit Logs'],
  'T1059': ['Process Monitoring', 'Command Line Audit', 'PowerShell Logs']
};

export const cdrCommands: CommandConfig[] = [
  {
    name: 'cdrlab',
    description: 'Cloud Detection and Response Lab unified CLI for scenario management and cleanup',
    usage: 'cdrlab <command> [options]',
    aliases: ['cdr'],
    handler: (args) => {
      if (args.length === 0) {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">🔬 Cloud Detection and Response Lab - Container Detection & Response</div>
            <div className="text-gray-300 mb-4">
              Kubernetes-based security training environment for hands-on container security experience.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-green-600 p-3 rounded">
                <div className="text-green-400 font-bold mb-2">🎯 Scenario Management</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-green-300">cdrlab list [scenarios|chains|detections]</div>
                  <div className="font-mono text-blue-300">cdrlab generate scenario --from template</div>
                  <div className="font-mono text-purple-300">cdrlab deploy --scenario SCEN --safe</div>
                  <div className="font-mono text-red-300">cdrlab destroy --scenario SCEN --dry-run</div>
                </div>
              </div>
              <div className="border border-blue-600 p-3 rounded">
                <div className="text-blue-400 font-bold mb-2">🔍 Detection & Validation</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-cyan-300">cdrlab validate --scenario SCEN --checks k8s</div>
                  <div className="font-mono text-yellow-300">cdrlab detect gen --scenario SCEN --pack xsiam</div>
                  <div className="font-mono text-purple-300">cdrlab status --output json</div>
                  <div className="font-mono text-gray-300">cdrlab report --scenario SCEN</div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-800 rounded border border-yellow-600">
              <div className="text-yellow-400 font-bold mb-2">⚠️ Safety First</div>
              <div className="text-sm text-gray-300">
                All scenarios default to <span className="text-green-400">safe mode</span> with simulated attacks. 
                Unsafe mode requires explicit confirmation and should only be used in isolated lab environments.
              </div>
            </div>
          </div>
        );
      }

      const subcommand = args[0];
      const subArgs = args.slice(1);

      switch (subcommand) {
        case 'list':
          return handleCdrList(subArgs);
        case 'destroy':
          return handleCdrDestroy(subArgs);
        case 'status':
          return handleCdrStatus(subArgs);
        case 'validate':
          return handleCdrValidate(subArgs);
        case 'detect':
          return handleCdrDetect(subArgs);
        case 'cleanup-orphans':
          return handleCdrCleanupOrphans(subArgs);
        case 'pov':
          return handleCdrPov(subArgs);
        case 'deploy':
          return handleCdrDeploy(subArgs);
        default:
          return (
            <div className="text-red-400">
              Unknown subcommand: {subcommand}
              <div className="mt-2 text-gray-300 text-sm">
                Run <span className="font-mono">cdrlab</span> to see available commands.
              </div>
            </div>
          );
      }
    }
  }
];

// Enhanced destroy command with safety features and resource ledger
const handleCdrDestroy = async (args: string[]) => {
  const scenario = args.find(arg => !arg.startsWith('--')) || '';
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const scope = args.includes('--scope') ? args[args.indexOf('--scope') + 1] : 'all';
  
  if (!scenario) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Missing Scenario ID</div>
        <div className="text-sm">
          Usage: <span className="font-mono text-yellow-400">cdrlab destroy --scenario SCEN [--dry-run] [--force] [--scope k8s|cloud|xsiam]</span>
        </div>
      </div>
    );
  }

  // Check if scenario exists in ledger
  const ledger = scenarioLedgers.get(scenario);
  if (!ledger) {
    return (
      <div className="text-yellow-400">
        <div className="font-bold mb-2">⚠️ Scenario Not Found in Ledger</div>
        <div className="text-sm text-gray-300">
          Scenario '{scenario}' not found in resource ledger. This might be a legacy deployment.
          Proceeding with label-based cleanup...
        </div>
      </div>
    );
  }

  // Preview resources to be destroyed
  const activeResources = ledger.resources.filter(r => r.status === 'active');
  const scopedResources = scope === 'all' ? activeResources : 
    activeResources.filter(r => r.provider === scope);

  if (dryRun) {
    return (
      <div className="text-blue-300">
        <div className="font-bold mb-4 text-xl">🔍 Destroy Preview (Dry Run)</div>
        <div className="space-y-3">
          <div>
            <strong>Scenario:</strong> <span className="text-yellow-400 font-mono">{scenario}</span>
          </div>
          <div>
            <strong>Scope:</strong> {scope}
          </div>
          <div>
            <strong>Resources to delete:</strong> {scopedResources.length}
          </div>
          
          {scopedResources.length > 0 && (
            <div className="mt-4">
              <div className="text-cyan-400 font-bold mb-2">📋 Resource Inventory</div>
              <div className="space-y-2 text-sm">
                {scopedResources.map((resource, index) => (
                  <div key={index} className="border border-gray-600 p-2 rounded">
                    <div className="flex justify-between">
                      <span className="text-green-400">{resource.type}</span>
                      <span className="text-gray-400">{resource.provider}</span>
                    </div>
                    <div className="text-gray-300 font-mono text-xs">{resource.identity}</div>
                    <div className="text-xs text-gray-500">{resource.location}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-blue-800 rounded">
            <div className="text-blue-200 font-bold">📝 Next Steps</div>
            <div className="text-sm mt-1">
              Run without <span className="font-mono">--dry-run</span> to execute the cleanup:
            </div>
            <div className="font-mono text-yellow-400 mt-1">
              cdrlab destroy --scenario {scenario} {scope !== 'all' ? `--scope ${scope}` : ''}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safety confirmation for unsafe mode
  if (ledger.overlay === 'unsafe' && !force) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-3">🚨 Unsafe Mode Confirmation Required</div>
        <div className="text-yellow-400 mb-3">
          This scenario was deployed in unsafe mode and may have created privileged resources.
        </div>
        <div className="text-gray-300 text-sm">
          To proceed with destruction, add the <span className="font-mono">--force</span> flag and type the scenario ID to confirm.
        </div>
      </div>
    );
  }

  // Simulate destroy process
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Update ledger
  scopedResources.forEach(resource => {
    resource.status = 'destroyed';
    resource.destroyedAt = new Date();
  });

  ledger.opsLog.push({
    timestamp: new Date(),
    operation: 'destroy',
    outcome: 'success',
    message: `Destroyed ${scopedResources.length} resources in scope: ${scope}`
  });

  return (
    <div className="text-green-300">
      <div className="font-bold mb-4 text-xl">🗑️ Scenario Cleanup Complete</div>
      <div className="space-y-3">
        <div>
          <strong>Scenario:</strong> <span className="text-yellow-400 font-mono">{scenario}</span>
        </div>
        <div>
          <strong>Resources Cleaned:</strong> {scopedResources.length}
        </div>
        <div>
          <strong>Scope:</strong> {scope}
        </div>
        
        <div className="mt-4">
          <div className="text-cyan-400 font-bold mb-2">🧹 Cleanup Summary</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Kubernetes Resources:</span>
              <span className="text-green-400">{scopedResources.filter(r => r.provider === 'k8s').length} cleaned</span>
            </div>
            <div className="flex justify-between">
              <span>Cloud Resources:</span>
              <span className="text-green-400">{scopedResources.filter(r => r.provider === 'gcp').length} cleaned</span>
            </div>
            <div className="flex justify-between">
              <span>XSIAM Content:</span>
              <span className="text-green-400">{scopedResources.filter(r => r.provider === 'xsiam').length} cleaned</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-green-800 rounded">
          <div className="text-green-200 font-bold">✅ Safety Verified</div>
          <div className="text-sm mt-1">
            • All resources properly labeled and tracked
            • Zero-residual validation passed
            • Resource ledger updated
            • No orphaned resources detected
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced status command with ledger reconciliation
const handleCdrStatus = async (args: string[]) => {
  const scenario = args.find(arg => !arg.startsWith('--'));
  const output = args.includes('--output') ? args[args.indexOf('--output') + 1] : 'table';

  if (!scenario) {
    // Show all active scenarios
    const allScenarios = Array.from(scenarioLedgers.entries()).map(([id, ledger]) => ({
      id,
      ...ledger
    }));

    if (allScenarios.length === 0) {
      return (
        <div className="text-yellow-400">
          <div className="font-bold mb-2">📊 No Active Scenarios</div>
          <div className="text-gray-300 text-sm">
            Use <span className="font-mono text-green-400">cdrlab list scenarios</span> to see available templates.
          </div>
        </div>
      );
    }

    return (
      <div className="text-blue-300">
        <div className="font-bold mb-4 text-xl">📊 Cloud Detection and Response Lab Status Overview</div>
        <div className="space-y-4">
          {allScenarios.map(scenario => {
            const activeResources = scenario.resources.filter(r => r.status === 'active').length;
            const lastOp = scenario.opsLog[scenario.opsLog.length - 1];
            
            return (
              <div key={scenario.id} className="border border-gray-600 p-4 rounded">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-mono text-yellow-400">{scenario.id}</div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    activeResources > 0 ? 'bg-green-800 text-green-200' : 'bg-gray-800 text-gray-200'
                  }`}>
                    {activeResources > 0 ? 'ACTIVE' : 'DESTROYED'}
                  </div>
                </div>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>Mode: <span className="text-cyan-400">{scenario.overlay}</span></div>
                  <div>Resources: <span className="text-blue-400">{activeResources} active</span></div>
                  <div>Started: {scenario.createdAt.toLocaleString()}</div>
                  {lastOp && (
                    <div>Last Op: <span className={`${
                      lastOp.outcome === 'success' ? 'text-green-400' : 
                      lastOp.outcome === 'failure' ? 'text-red-400' : 'text-yellow-400'
                    }`}>{lastOp.operation} ({lastOp.outcome})</span></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Show specific scenario status with reconciliation
  const ledger = scenarioLedgers.get(scenario);
  if (!ledger) {
    return (
      <div className="text-red-400">
        Scenario '{scenario}' not found in resource ledger.
      </div>
    );
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📊 Scenario Status: {scenario}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div><strong>ID:</strong> <span className="font-mono text-yellow-400">{ledger.scenarioId}</span></div>
          <div><strong>Mode:</strong> <span className={`${ledger.overlay === 'safe' ? 'text-green-400' : 'text-yellow-400'}`}>{ledger.overlay}</span></div>
          <div><strong>Created:</strong> {ledger.createdAt.toLocaleString()}</div>
          <div><strong>Context:</strong> {ledger.accountContext}</div>
        </div>
        <div>
          <div className="text-cyan-400 font-bold mb-2">📈 Resource Summary</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total Resources:</span>
              <span className="text-blue-400">{ledger.resources.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Active:</span>
              <span className="text-green-400">{ledger.resources.filter(r => r.status === 'active').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Destroyed:</span>
              <span className="text-gray-400">{ledger.resources.filter(r => r.status === 'destroyed').length}</span>
            </div>
          </div>
        </div>
      </div>

      {ledger.opsLog.length > 0 && (
        <div className="mt-4">
          <div className="text-purple-400 font-bold mb-2">📝 Operations Log</div>
          <div className="bg-black p-3 rounded font-mono text-xs max-h-48 overflow-y-auto">
            {ledger.opsLog.slice(-10).map((log, index) => (
              <div key={index} className="text-gray-300 mb-1">
                [{log.timestamp.toISOString()}] {log.operation.toUpperCase()}: {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Detection generation from scenario metadata
const handleCdrDetect = async (args: string[]) => {
  const scenario = args.find(arg => !arg.startsWith('--')) || '';
  const pack = args.includes('--pack') ? args[args.indexOf('--pack') + 1] : 'xsiam';
  const subcommand = args[0];

  if (subcommand === 'gen') {
    if (!scenario) {
      return (
        <div className="text-red-400">
          <div className="font-bold mb-2">❌ Missing Scenario</div>
          <div className="text-sm">
            Usage: <span className="font-mono text-yellow-400">cdrlab detect gen --scenario SCEN --pack xsiam</span>
          </div>
        </div>
      );
    }

    // Mock scenario metadata lookup
    const scenarioMetadata = {
      id: scenario,
      mitre: {
        techniques: ['T1496', 'T1578'],
        tactics: ['Resource Development', 'Impact']
      },
      signals: ['process_creation', 'network_connection', 'resource_modification'],
      entities: ['process', 'network', 'cloud_resource'],
      timingWindows: '5m'
    };

    const detections = scenarioMetadata.mitre.techniques.map(technique => {
      const template = DETECTION_TEMPLATES[pack as keyof typeof DETECTION_TEMPLATES]?.[technique];
      if (!template) return null;

      return {
        technique,
        ...template,
        scenarioId: scenario,
        generatedAt: new Date().toISOString()
      };
    }).filter(Boolean);

    return (
      <div className="text-green-300">
        <div className="font-bold mb-4 text-xl">🔍 Generated Detections</div>
        <div className="space-y-4">
          <div>
            <strong>Scenario:</strong> <span className="text-yellow-400 font-mono">{scenario}</span>
          </div>
          <div>
            <strong>Platform:</strong> {pack.toUpperCase()}
          </div>
          <div>
            <strong>Generated:</strong> {detections.length} detection rules
          </div>

          {detections.map((detection, index) => (
            <div key={index} className="border border-gray-600 p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <div className="text-cyan-400 font-bold">{detection.title}</div>
                <span className="text-xs bg-purple-800 text-purple-200 px-2 py-1 rounded">
                  {detection.technique}
                </span>
              </div>
              <div className="text-gray-300 text-sm mb-3">{detection.description}</div>
              <div className="bg-black p-3 rounded">
                <div className="text-yellow-400 text-xs font-mono">
                  {detection.queryTemplate}
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center text-xs">
                <span className="text-gray-500">Severity: {detection.severity}</span>
                <span className="text-gray-500">Scenario: {detection.scenarioId}</span>
              </div>
            </div>
          ))}

          <div className="mt-4 p-3 bg-blue-800 rounded">
            <div className="text-blue-200 font-bold mb-2">💾 Export Options</div>
            <div className="text-sm space-y-1">
              <div className="font-mono text-green-400">cdrlab detect export --scenario {scenario} --format yml</div>
              <div className="font-mono text-purple-400">cdrlab detect diff --scenario {scenario} --against legacy/</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">🔍 Detection Management</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-green-600 p-3 rounded">
          <div className="text-green-400 font-bold mb-2">🎯 Generation</div>
          <div className="space-y-1 text-sm">
            <div className="font-mono text-green-300">cdrlab detect gen --scenario SCEN --pack xsiam</div>
            <div className="text-gray-500 ml-4">→ Generate XSIAM detection rules</div>
            <div className="font-mono text-blue-300">cdrlab detect gen --scenario SCEN --pack splunk</div>
            <div className="text-gray-500 ml-4">→ Generate Splunk searches</div>
          </div>
        </div>
        <div className="border border-blue-600 p-3 rounded">
          <div className="text-blue-400 font-bold mb-2">📊 Analysis</div>
          <div className="space-y-1 text-sm">
            <div className="font-mono text-cyan-300">cdrlab detect diff --scenario SCEN --against legacy/</div>
            <div className="text-gray-500 ml-4">→ Compare with existing rules</div>
            <div className="font-mono text-purple-300">cdrlab detect validate --scenario SCEN</div>
            <div className="text-gray-500 ml-4">→ Test detection coverage</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// List command with enhanced filtering
const handleCdrList = (args: string[]) => {
  const type = args[0] || 'scenarios';

  if (type === 'scenarios') {
    return (
      <div className="text-blue-300">
        <div className="font-bold mb-4 text-xl">🎯 Available Scenario Templates</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-green-600 p-4 rounded">
            <div className="text-green-400 font-bold text-lg mb-2">🔒 Security Scenarios</div>
            <div className="space-y-2 text-sm">
              <div><span className="font-mono text-cyan-400">cryptominer</span> - Cryptocurrency mining simulation</div>
              <div><span className="font-mono text-cyan-400">container-escape</span> - Container breakout techniques</div>
              <div><span className="font-mono text-cyan-400">privilege-escalation</span> - SUID binary exploitation</div>
              <div><span className="font-mono text-cyan-400">lateral-movement</span> - Network traversal simulation</div>
            </div>
          </div>
          <div className="border border-purple-600 p-4 rounded">
            <div className="text-purple-400 font-bold text-lg mb-2">☁️ Cloud Scenarios</div>
            <div className="space-y-2 text-sm">
              <div><span className="font-mono text-cyan-400">cloud-misconfig</span> - Infrastructure misconfiguration</div>
              <div><span className="font-mono text-cyan-400">data-exfiltration</span> - Storage access patterns</div>
              <div><span className="font-mono text-cyan-400">identity-compromise</span> - Credential theft simulation</div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-800 rounded">
          <div className="text-yellow-400 font-bold mb-2">💡 Quick Start</div>
          <div className="space-y-1 text-sm">
            <div className="font-mono text-green-400">cdrlab generate scenario --from cryptominer --safe</div>
            <div className="font-mono text-blue-400">cdrlab deploy --scenario my-scenario --ttl 2h</div>
            <div className="font-mono text-red-400">cdrlab destroy --scenario my-scenario --dry-run</div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'chains') {
    return (
      <div className="text-blue-300">
        <div className="font-bold mb-4 text-xl">⛓️ Available Scenario Chains</div>
        <div className="space-y-3">
          <div className="border border-blue-600 p-3 rounded">
            <div className="text-blue-400 font-bold">full-attack-chain</div>
            <div className="text-gray-300 text-sm mt-1">Initial Access → Persistence → Lateral Movement → Exfiltration</div>
            <div className="text-xs text-gray-500 mt-1">Duration: ~45 minutes | Scenarios: 4</div>
          </div>
          <div className="border border-green-600 p-3 rounded">
            <div className="text-green-400 font-bold">cloud-compromise</div>
            <div className="text-gray-300 text-sm mt-1">Misconfig → Privilege Escalation → Data Access</div>
            <div className="text-xs text-gray-500 mt-1">Duration: ~30 minutes | Scenarios: 3</div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'detections') {
    return (
      <div className="text-blue-300">
        <div className="font-bold mb-4 text-xl">🔍 Available Detection Packs</div>
        <div className="space-y-3">
          <div className="border border-cyan-600 p-3 rounded">
            <div className="text-cyan-400 font-bold">xsiam</div>
            <div className="text-gray-300 text-sm mt-1">Cortex XSIAM detection rules and analytics</div>
            <div className="text-xs text-gray-500 mt-1">Templates: 15 | Techniques: 12</div>
          </div>
          <div className="border border-orange-600 p-3 rounded">
            <div className="text-orange-400 font-bold">splunk</div>
            <div className="text-gray-300 text-sm mt-1">Splunk SPL searches and correlations</div>
            <div className="text-xs text-gray-500 mt-1">Templates: 10 | Techniques: 8</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-red-400">
      Unknown list type: {type}. Use 'scenarios', 'chains', or 'detections'.
    </div>
  );
};

// Cleanup orphaned resources
const handleCdrCleanupOrphans = async (args: string[]) => {
  const scope = args.includes('--scope') ? args[args.indexOf('--scope') + 1] : 'k8s';
  const olderThan = args.includes('--older-than') ? args[args.indexOf('--older-than') + 1] : '7d';

  await new Promise(resolve => setTimeout(resolve, 2000));

  return (
    <div className="text-green-300">
      <div className="font-bold mb-4 text-xl">🧹 Orphan Cleanup Complete</div>
      <div className="space-y-3">
        <div><strong>Scope:</strong> {scope}</div>
        <div><strong>Age Threshold:</strong> {olderThan}</div>
        <div><strong>Orphaned Resources Found:</strong> 3</div>
        <div><strong>Successfully Cleaned:</strong> 3</div>
        
        <div className="mt-4">
          <div className="text-cyan-400 font-bold mb-2">🗑️ Cleaned Resources</div>
          <div className="space-y-1 text-sm">
            <div>• Namespace: old-cdr-test-namespace (created 10d ago)</div>
            <div>• ConfigMap: abandoned-config (created 8d ago)</div>
            <div>• Job: failed-cryptominer-job (created 7d ago)</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-green-800 rounded">
          <div className="text-green-200 font-bold">✅ Cleanup Summary</div>
          <div className="text-sm mt-1">
            All orphaned resources older than {olderThan} have been safely removed.
          </div>
        </div>
      </div>
    </div>
  );
};

// Validation command
const handleCdrValidate = async (args: string[]) => {
  const scenario = args.find(arg => !arg.startsWith('--')) || '';
  const checks = args.includes('--checks') ? args[args.indexOf('--checks') + 1] : 'all';

  if (!scenario) {
    return (
      <div className="text-red-400">
        Please specify a scenario: <span className="font-mono">cdrlab validate --scenario SCEN --checks k8s</span>
      </div>
    );
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  return (
    <div className="text-green-300">
      <div className="font-bold mb-4 text-xl">🧪 Validation Results: {scenario}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-green-600 p-3 rounded">
          <div className="text-green-400 font-bold">✅ Infrastructure</div>
          <div className="text-sm text-gray-300 mt-1">All resources deployed correctly</div>
          <div className="text-xs text-green-300 mt-2">15/15 checks passed</div>
        </div>
        <div className="border border-yellow-600 p-3 rounded">
          <div className="text-yellow-400 font-bold">⚠️ Security</div>
          <div className="text-sm text-gray-300 mt-1">2 of 3 detections triggered</div>
          <div className="text-xs text-yellow-300 mt-2">8/10 checks passed</div>
        </div>
        <div className="border border-blue-600 p-3 rounded">
          <div className="text-blue-400 font-bold">📊 Performance</div>
          <div className="text-sm text-gray-300 mt-1">Response time: 245ms</div>
          <div className="text-xs text-blue-300 mt-2">5/5 checks passed</div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-800 rounded">
        <div className="text-cyan-400 font-bold mb-2">📋 Detailed Results</div>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Zero-residual check:</span>
            <span className="text-green-400">PASSED</span>
          </div>
          <div className="flex justify-between">
            <span>Label compliance:</span>
            <span className="text-green-400">PASSED</span>
          </div>
          <div className="flex justify-between">
            <span>Resource limits:</span>
            <span className="text-green-400">PASSED</span>
          </div>
          <div className="flex justify-between">
            <span>Network policies:</span>
            <span className="text-yellow-400">WARNING</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// POV plan management
const handleCdrPov = (args: string[]) => {
  const subcommand = args[0];
  
  if (subcommand === 'run') {
    return (
      <div className="text-blue-300">
        <div className="font-bold mb-4 text-xl">🎯 POV Plan Execution</div>
        <div className="text-gray-300">POV plan orchestration coming soon...</div>
      </div>
    );
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">🎯 POV Plan Management</div>
      <div className="text-gray-300">
        Create and manage Proof-of-Value plans that orchestrate multiple scenarios.
      </div>
      <div className="mt-4 space-y-1 text-sm">
        <div className="font-mono text-green-400">cdrlab pov run plan.yaml</div>
        <div className="font-mono text-red-400">cdrlab pov destroy plan.yaml</div>
        <div className="font-mono text-blue-400">cdrlab pov validate plan.yaml</div>
      </div>
    </div>
  );
};

// Enhanced deploy command with cloud provider support
const handleCdrDeploy = async (args: string[]) => {
  const scenario = args.find(arg => !arg.startsWith('--')) || '';
  const profile = args.includes('--profile') ? args[args.indexOf('--profile') + 1] : null;
  const provider = args.includes('--provider') ? args[args.indexOf('--provider') + 1] : null;
  const ttl = args.includes('--ttl') ? args[args.indexOf('--ttl') + 1] : '2h';
  const safe = args.includes('--safe') || !args.includes('--unsafe');
  const wait = args.includes('--wait');
  const dryRun = args.includes('--dry-run');
  
  if (!scenario) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ Missing Scenario ID</div>
        <div className="text-sm">
          Usage: <span className="font-mono text-yellow-400">cdrlab deploy --scenario SCEN [--profile aws-dev] [--safe] [--ttl 2h]</span>
        </div>
        <div className="mt-2 text-gray-300">
          Available scenarios: cryptominer, container-escape, privilege-escalation
        </div>
      </div>
    );
  }

  // Cloud profile validation
  if (profile) {
    // In real implementation, this would validate the profile exists
    const validProfiles = ['aws-dev', 'gcp-lab', 'azure-test'];
    if (!validProfiles.includes(profile)) {
      return (
        <div className="text-red-400">
          <div className="font-bold mb-2">❌ Invalid Cloud Profile</div>
          <div className="text-sm">
            Profile '{profile}' not found. Available profiles:
          </div>
          <div className="mt-2 space-y-1">
            <div className="font-mono text-green-400">cloud list</div>
            <div className="text-gray-500 ml-4">→ View all configured profiles</div>
            <div className="font-mono text-blue-400">cloud add --provider aws --interactive</div>
            <div className="text-gray-500 ml-4">→ Add new cloud profile</div>
          </div>
        </div>
      );
    }
  }

  if (dryRun) {
    return (
      <div className="text-blue-300">
        <div className="font-bold mb-4 text-xl">🔍 Deployment Preview (Dry Run)</div>
        <div className="space-y-3">
          <div><strong>Scenario:</strong> <span className="text-yellow-400 font-mono">{scenario}</span></div>
          <div><strong>Mode:</strong> <span className={safe ? 'text-green-400' : 'text-yellow-400'}>{safe ? 'Safe' : 'Unsafe'}</span></div>
          {profile && (
            <div><strong>Cloud Profile:</strong> <span className="text-cyan-400">{profile}</span></div>
          )}
          <div><strong>TTL:</strong> <span className="text-purple-400">{ttl}</span></div>
          
          <div className="mt-4">
            <div className="text-cyan-400 font-bold mb-2">📋 Resources to Create</div>
            <div className="space-y-2 text-sm">
              <div className="border border-gray-600 p-2 rounded">
                <div className="flex justify-between">
                  <span className="text-green-400">Kubernetes Namespace</span>
                  <span className="text-gray-400">K8s</span>
                </div>
                <div className="text-gray-300 font-mono text-xs">cdr-lab-{scenario}</div>
              </div>
              <div className="border border-gray-600 p-2 rounded">
                <div className="flex justify-between">
                  <span className="text-green-400">Job</span>
                  <span className="text-gray-400">K8s</span>
                </div>
                <div className="text-gray-300 font-mono text-xs">{scenario}-job</div>
              </div>
              {profile && (
                <>
                  <div className="border border-gray-600 p-2 rounded">
                    <div className="flex justify-between">
                      <span className="text-green-400">VM Instance</span>
                      <span className="text-gray-400">{profile.includes('aws') ? 'AWS' : profile.includes('gcp') ? 'GCP' : 'Azure'}</span>
                    </div>
                    <div className="text-gray-300 font-mono text-xs">cdr-{scenario}-vm-001</div>
                  </div>
                  <div className="border border-gray-600 p-2 rounded">
                    <div className="flex justify-between">
                      <span className="text-green-400">Storage Bucket</span>
                      <span className="text-gray-400">{profile.includes('aws') ? 'AWS' : profile.includes('gcp') ? 'GCP' : 'Azure'}</span>
                    </div>
                    <div className="text-gray-300 font-mono text-xs">cdr-{scenario}-storage</div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-800 rounded">
            <div className="text-blue-200 font-bold">📝 Next Steps</div>
            <div className="text-sm mt-1">
              Run without <span className="font-mono">--dry-run</span> to execute the deployment:
            </div>
            <div className="font-mono text-yellow-400 mt-1">
              cdrlab deploy --scenario {scenario} {profile ? `--profile ${profile}` : ''} {!safe ? '--unsafe' : ''}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Simulate deployment process
  const deploymentId = `${scenario}-${Math.random().toString(36).substring(2, 8)}`;
  
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Create deployment entry in ledger
  const deploymentLedger: {
    scenarioId: string;
    originalScenario: string;
    createdAt: Date;
    overlay: 'safe' | 'unsafe';
    accountContext: string;
    cloudProfile?: string | null;
    resources: ResourceLedgerEntry[];
    opsLog: Array<{
      timestamp: Date;
      operation: 'deploy' | 'validate' | 'destroy';
      outcome: 'success' | 'failure' | 'pending';
      message: string;
    }>;
  } = {
    scenarioId: deploymentId,
    originalScenario: scenario,
    createdAt: new Date(),
    overlay: safe ? 'safe' : 'unsafe' as 'safe' | 'unsafe',
    accountContext: profile || 'local-k8s',
    cloudProfile: profile,
    resources: [
      {
        id: `ns-${deploymentId}`,
        type: 'Namespace',
        provider: 'k8s' as const,
        identity: `cdr-lab-${scenario}`,
        location: 'default-cluster',
        labels: { ...CDR_LABELS, 'cdrlab.scenario': deploymentId },
        uid: `ns-${Math.random().toString(36).substring(2, 10)}`,
        createdAt: new Date(),
        status: 'active' as 'active'
      },
      {
        id: `job-${deploymentId}`,
        type: 'Job',
        provider: 'k8s' as const,
        identity: `${scenario}-job`,
        location: `cdr-lab-${scenario}`,
        labels: { ...CDR_LABELS, 'cdrlab.scenario': deploymentId },
        uid: `job-${Math.random().toString(36).substring(2, 10)}`,
        createdAt: new Date(),
        status: 'active' as 'active'
      }
    ],
    opsLog: [
      {
        timestamp: new Date(),
        operation: 'deploy' as 'deploy',
        outcome: 'success' as 'success',
        message: `Deployed ${scenario} scenario with ${profile ? 'cloud' : 'local'} resources`
      }
    ]
  };

  // Add cloud resources if profile specified
  if (profile) {
    const cloudProvider = profile.includes('aws') ? 'aws' : profile.includes('gcp') ? 'gcp' : 'azure';
    deploymentLedger.resources.push(
      {
        id: `vm-${deploymentId}`,
        type: 'VirtualMachine',
        provider: cloudProvider as 'gcp' | 'aws' | 'azure',
        identity: `cdr-${scenario}-vm-001`,
        location: profile.includes('aws') ? 'us-west-2' : profile.includes('gcp') ? 'us-central1' : 'eastus',
        labels: { ...CDR_LABELS, 'cdrlab.scenario': deploymentId, 'cdrlab.profile': profile },
        uid: `vm-${Math.random().toString(36).substring(2, 10)}`,
        createdAt: new Date(),
        status: 'active' as 'active'
      },
      {
        id: `storage-${deploymentId}`,
        type: 'StorageBucket',
        provider: cloudProvider as 'gcp' | 'aws' | 'azure',
        identity: `cdr-${scenario}-storage`,
        location: profile.includes('aws') ? 'us-west-2' : profile.includes('gcp') ? 'us-central1' : 'eastus',
        labels: { ...CDR_LABELS, 'cdrlab.scenario': deploymentId, 'cdrlab.profile': profile },
        uid: `bucket-${Math.random().toString(36).substring(2, 10)}`,
        createdAt: new Date(),
        status: 'active' as 'active'
      }
    );
  }

  // Add to scenario ledgers
  scenarioLedgers.set(deploymentId, deploymentLedger);

  return (
    <div className="text-green-300">
      <div className="font-bold mb-4 text-xl">🚀 Deployment Complete</div>
      <div className="space-y-3">
        <div><strong>Deployment ID:</strong> <span className="text-yellow-400 font-mono">{deploymentId}</span></div>
        <div><strong>Scenario:</strong> <span className="text-cyan-400">{scenario}</span></div>
        <div><strong>Mode:</strong> <span className={safe ? 'text-green-400' : 'text-yellow-400'}>{safe ? 'Safe' : 'Unsafe'}</span></div>
        {profile && (
          <div><strong>Cloud Profile:</strong> <span className="text-purple-400">{profile}</span></div>
        )}
        <div><strong>TTL:</strong> <span className="text-blue-400">{ttl}</span></div>
        <div><strong>Resources Created:</strong> <span className="text-green-400">{deploymentLedger.resources.length}</span></div>
        
        <div className="mt-4">
          <div className="text-cyan-400 font-bold mb-2">🛠️ Created Resources</div>
          <div className="space-y-1 text-sm">
            {deploymentLedger.resources.map((resource, index) => (
              <div key={index} className="flex justify-between items-center p-2 border border-gray-700 rounded">
                <span className="text-green-400">{resource.type}</span>
                <span className="text-gray-400">{resource.provider.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-green-800 rounded">
          <div className="text-green-200 font-bold">✅ Deployment Successful</div>
          <div className="text-sm mt-1">
            Scenario '{scenario}' deployed successfully {profile ? 'with cloud resources' : 'locally'}. 
            All resources are properly labeled and tracked.
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-800 rounded">
          <div className="text-cyan-400 font-bold mb-2">📊 Next Steps</div>
          <div className="space-y-1 text-sm">
            <div className="font-mono text-green-400">cdrlab status --scenario {deploymentId}</div>
            <div className="text-gray-500 ml-4">→ Check deployment status and resources</div>
            <div className="font-mono text-blue-400">cdrlab detect gen --scenario {scenario} --pack xsiam</div>
            <div className="text-gray-500 ml-4">→ Generate detection rules for this scenario</div>
            <div className="font-mono text-purple-400">cdrlab validate --scenario {deploymentId}</div>
            <div className="text-gray-500 ml-4">→ Run validation tests</div>
            <div className="font-mono text-red-400">cdrlab destroy --scenario {deploymentId} --dry-run</div>
            <div className="text-gray-500 ml-4">→ Preview cleanup (when finished)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
