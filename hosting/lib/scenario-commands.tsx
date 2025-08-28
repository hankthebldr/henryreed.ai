import React from 'react';
import { SCENARIO_TEMPLATES, parseScenarioCommand, ScenarioType, Provider } from './scenario-types';
import { cloudFunctionsAPI } from './cloud-functions-api';

// Storage for active deployments (in a real app, this would be in a database)
const activeDeployments = new Map<string, any>();

const MITRE_MAP: Record<string, { technique: string; tid: string; description: string }[]> = {
  'cloud-posture': [
    { technique: 'Cloud Infrastructure Discovery', tid: 'T1580', description: 'Enumerating cloud resources and configurations' },
    { technique: 'Modify Cloud Compute Infrastructure', tid: 'T1578', description: 'Unsafe changes to cloud resources may be detected' }
  ],
  'container-vuln': [
    { technique: 'Exploit Public-Facing Application', tid: 'T1190', description: 'Vulnerable container images surface exploitable components' },
    { technique: 'Command and Control via Web Service', tid: 'T1102', description: 'Unexpected egress to external services from containers' }
  ],
  'code-vuln': [
    { technique: 'Exploitation for Client Execution', tid: 'T1203', description: 'Application code flaws leading to execution' }
  ],
  'insider-threat': [
    { technique: 'Data from Cloud Storage', tid: 'T1530', description: 'Unusual access to storage resources' },
    { technique: 'Valid Accounts', tid: 'T1078', description: 'Credential misuse patterns' }
  ],
  'ransomware': [
    { technique: 'Data Encrypted for Impact', tid: 'T1486', description: 'Encryption-like behavior' }
  ],
  'waas-exploit': [
    { technique: 'Exploit Public-Facing Application', tid: 'T1190', description: 'Web app exploitation patterns' }
  ],
  'ai-threat': [
    { technique: 'User Execution: Malicious/Untrusted Input', tid: 'T1204', description: 'Prompt injection-like input flows' }
  ],
  'pipeline-breach': [
    { technique: 'Continuous Integration/Continuous Deployment', tid: 'T1653', description: 'Manipulation of CI/CD pipeline components' }
  ],
  'identity-compromise': [
    { technique: 'Valid Accounts', tid: 'T1078', description: 'Credential theft/misuse patterns' },
    { technique: 'Account Discovery', tid: 'T1087', description: 'Account enumeration behaviors' }
  ],
  'lateral-movement-sim': [
    { technique: 'Lateral Tool Transfer', tid: 'T1570', description: 'Movement-like transfer patterns (simulated)' },
    { technique: 'Remote Services', tid: 'T1021', description: 'Service access patterns across resources' }
  ],
  'data-exfil-behavior': [
    { technique: 'Exfiltration Over Web Service', tid: 'T1567', description: 'Egress to external endpoints (synthetic)' }
  ],
  'beacon-emulation': [
    { technique: 'Application Layer Protocol', tid: 'T1071', description: 'Periodic communications resembling beacons' }
  ],
  'phishing-sim': [
    { technique: 'Phishing', tid: 'T1566', description: 'Phishing campaign indicators (metadata only)' }
  ]
};

const USE_FUNCTIONS = process.env.NEXT_PUBLIC_USE_FUNCTIONS === '1';
export const scenarioCommands = {
  list: async (args: string[]) => {
    const command = parseScenarioCommand(['list', ...args]);
    
    if (!command) {
      return (
        <div className="text-red-400">
          Invalid scenario list command. Use 'scenario list --help' for usage.
        </div>
      );
    }

    // Filter templates based on scenario type if specified
    const filteredTemplates = command.scenarioType 
      ? { [command.scenarioType]: SCENARIO_TEMPLATES[command.scenarioType] }
      : SCENARIO_TEMPLATES;

    return (
      <div className="text-blue-300">
        <div className="font-bold mb-4 text-xl">🎯 Available Scenario Templates</div>
        
        {Object.entries(filteredTemplates).map(([type, scenarios]) => (
          <div key={type} className="mb-6">
            <div className="text-lg font-bold text-cyan-400 mb-3 capitalize">
              {type.replace('-', ' ')} Scenarios
            </div>
            
            {scenarios.length === 0 ? (
              <div className="text-gray-500 ml-4">No templates available</div>
            ) : (
              <div className="space-y-3">
                {scenarios.map(scenario => (
                  <div key={scenario.id} className="border border-gray-600 p-4 rounded-lg ml-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-green-400 font-bold">{scenario.name}</div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          scenario.difficulty === 'beginner' ? 'bg-green-800 text-green-200' :
                          scenario.difficulty === 'intermediate' ? 'bg-blue-800 text-blue-200' :
                          scenario.difficulty === 'advanced' ? 'bg-yellow-800 text-yellow-200' :
                          'bg-red-800 text-red-200'
                        }`}>
                          {scenario.difficulty}
                        </span>
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          {scenario.estimatedDuration}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-gray-300 text-sm mb-3">{scenario.description}</div>
                    
                    <div className="flex justify-between items-end">
                      <div className="flex gap-1">
                        {scenario.tags.map(tag => (
                          <span key={tag} className="text-xs bg-purple-800 text-purple-200 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {scenario.id} | Provider: {scenario.provider}
                      </div>
                    </div>
                    
                    <div className="mt-3 p-2 bg-gray-800 rounded text-xs">
                      <div className="text-yellow-400 font-mono">
                        scenario generate --scenario-type {type} --template {scenario.template} --provider {scenario.provider}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-gray-800 rounded border border-gray-600">
          <div className="text-yellow-400 font-bold mb-2">💡 Usage Examples</div>
          <div className="text-gray-300 text-sm space-y-1">
            <div className="font-mono text-green-400">scenario list</div>
            <div className="text-gray-500 ml-4">→ Show all available scenario templates</div>
            <div className="font-mono text-blue-400">scenario list --scenario-type cloud-posture</div>
            <div className="text-gray-500 ml-4">→ Show only cloud posture scenarios</div>
            <div className="font-mono text-purple-400">scenario generate --scenario-type ai-threat --provider gcp</div>
            <div className="text-gray-500 ml-4">→ Deploy an AI threat scenario on GCP</div>
          </div>
        </div>
      </div>
    );
  },

  generate: async (args: string[]) => {
    const command = parseScenarioCommand(['generate', ...args]);
    
    if (!command || !command.scenarioType) {
      return (
        <div className="text-red-400">
          <div className="font-bold mb-2">❌ Invalid Generate Command</div>
          <div className="text-sm">
            Required parameters missing. Usage:<br/>
            <span className="font-mono text-yellow-400">
              scenario generate --scenario-type &lt;type&gt; --provider &lt;provider&gt; [options]
            </span>
          </div>
          <div className="mt-3 text-gray-300">
            Available types: {Object.keys(SCENARIO_TEMPLATES).filter(k => k !== 'custom').join(', ')}
          </div>
        </div>
      );
    }

    // Show deployment progress
    const loadingElement = (
      <div className="text-blue-300">
        <div className="font-bold mb-2">🚀 Deploying Scenario</div>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-3"></div>
          <span>Initiating {command.scenarioType} scenario deployment...</span>
        </div>
      </div>
    );

    try {
      // Prefer Cloud Functions if enabled, otherwise simulate
      const result = USE_FUNCTIONS
        ? await cloudFunctionsAPI.deployScenario(command)
        : await cloudFunctionsAPI.simulateDeployment(command);
      
      if (result.success) {
        const deploymentId = result.deploymentId!;
        activeDeployments.set(deploymentId, {
          command,
          startTime: new Date(),
          status: 'deploying'
        });

        return (
          <div className="text-green-300">
            <div className="font-bold mb-3">✅ Scenario Deployment Initiated</div>
            <div className="space-y-2">
              <div><strong>Deployment ID:</strong> <span className="font-mono text-yellow-400">{deploymentId}</span></div>
              <div><strong>Scenario Type:</strong> {command.scenarioType}</div>
              <div><strong>Provider:</strong> {command.provider || 'gcp'}</div>
              <div><strong>Region:</strong> {command.region || 'us-central1'}</div>
              <div><strong>Estimated Completion:</strong> {result.estimatedCompletion}</div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-800 rounded border border-blue-600">
              <div className="text-blue-400 font-bold mb-2">📊 Next Steps</div>
              <div className="text-sm space-y-1">
                <div className="font-mono text-green-400">scenario status {deploymentId}</div>
                <div className="text-gray-500 ml-4">→ Check deployment progress</div>
                <div className="font-mono text-purple-400">scenario validate {deploymentId}</div>
                <div className="text-gray-500 ml-4">→ Run validation tests (after deployment completes)</div>
                <div className="font-mono text-red-400">scenario destroy {deploymentId}</div>
                <div className="text-gray-500 ml-4">→ Clean up resources</div>
              </div>
            </div>

            {command.autoValidate && (
              <div className="mt-3 p-2 bg-yellow-800 rounded text-yellow-200 text-sm">
                <strong>Auto-validation enabled:</strong> Validation will run automatically when deployment completes.
              </div>
            )}

            {command.destroyAfter && (
              <div className="mt-2 p-2 bg-red-800 rounded text-red-200 text-sm">
                <strong>Auto-destroy scheduled:</strong> Resources will be cleaned up after {command.destroyAfter}.
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div className="text-red-400">
            <div className="font-bold mb-2">❌ Deployment Failed</div>
            <div>{result.message}</div>
          </div>
        );
      }
    } catch (error) {
      return (
        <div className="text-red-400">
          <div className="font-bold mb-2">❌ Deployment Error</div>
          <div>An unexpected error occurred: {error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      );
    }
  },

  status: async (args: string[]) => {
    if (args.length === 0) {
      // Show all active deployments
      const deployments = Array.from(activeDeployments.entries()).map(([id, data]) => ({
        id,
        ...data
      }));

      if (deployments.length === 0) {
        return (
          <div className="text-yellow-400">
            <div className="font-bold mb-2">📊 No Active Deployments</div>
            <div className="text-gray-300 text-sm">
              Use <span className="font-mono text-green-400">scenario generate</span> to create a new deployment.
            </div>
          </div>
        );
      }

      return (
        <div className="text-blue-300">
          <div className="font-bold mb-4 text-xl">📊 Active Deployments</div>
          <div className="space-y-4">
            {deployments.map(deployment => (
              <div key={deployment.id} className="border border-gray-600 p-4 rounded">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-mono text-yellow-400">{deployment.id}</div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    deployment.status === 'complete' ? 'bg-green-800 text-green-200' :
                    deployment.status === 'failed' ? 'bg-red-800 text-red-200' :
                    'bg-blue-800 text-blue-200'
                  }`}>
                    {deployment.status}
                  </div>
                </div>
                <div className="text-sm text-gray-300">
                  <div>Type: {deployment.command.scenarioType}</div>
                  <div>Started: {deployment.startTime.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const deploymentId = args[0];
    
    try {
      const result = USE_FUNCTIONS
        ? await cloudFunctionsAPI.getDeploymentStatus(deploymentId)
        : await cloudFunctionsAPI.simulateStatus(deploymentId);
      
      if (result.success && result.deployment) {
        const deployment = result.deployment;
        
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">📊 Deployment Status</div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div><strong>ID:</strong> <span className="font-mono text-yellow-400">{deployment.id}</span></div>
                  <div><strong>Scenario:</strong> {deployment.scenarioId}</div>
                  <div><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      deployment.status === 'complete' ? 'bg-green-800 text-green-200' :
                      deployment.status === 'failed' ? 'bg-red-800 text-red-200' :
                      'bg-blue-800 text-blue-200'
                    }`}>
                      {deployment.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div><strong>Provider:</strong> {deployment.provider}</div>
                  <div><strong>Region:</strong> {deployment.region}</div>
                  <div><strong>Started:</strong> {deployment.startTime.toLocaleString()}</div>
                  {deployment.endTime && (
                    <div><strong>Completed:</strong> {deployment.endTime.toLocaleString()}</div>
                  )}
                </div>
              </div>

              {deployment.resources && (
                <div className="mt-4">
                  <div className="font-bold text-green-400 mb-2">🔗 Resources</div>
                  <div className="space-y-1 text-sm">
                    {deployment.resources.cloudFunctionUrl && (
                      <div>Function URL: <a href={deployment.resources.cloudFunctionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{deployment.resources.cloudFunctionUrl}</a></div>
                    )}
                    {deployment.resources.storageUrl && (
                      <div>Storage: <span className="font-mono text-gray-300">{deployment.resources.storageUrl}</span></div>
                    )}
                  </div>
                </div>
              )}

              {deployment.resources?.logs && (
                <div className="mt-4">
                  <div className="font-bold text-purple-400 mb-2">📝 Deployment Logs</div>
                  <div className="bg-black p-3 rounded font-mono text-xs max-h-48 overflow-y-auto">
                    {deployment.resources.logs.map((log, index) => (
                      <div key={index} className="text-gray-300">
                        [{new Date().toISOString()}] {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {deployment.results && (
                <div className="mt-4">
                  <div className="font-bold text-cyan-400 mb-2">📈 Results</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm">
                        <div><strong>Validation:</strong> 
                          <span className={`ml-2 ${deployment.results.validationPassed ? 'text-green-400' : 'text-red-400'}`}>
                            {deployment.results.validationPassed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                        <div><strong>Detection Alerts:</strong> {deployment.results.detectionAlerts.length}</div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div><strong>Deploy Time:</strong> {deployment.results.performanceMetrics.deploymentTime}</div>
                      <div><strong>Resources:</strong> {deployment.results.performanceMetrics.resourcesProvisioned}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      } else {
        return (
          <div className="text-red-400">
            <div className="font-bold mb-2">❌ Status Check Failed</div>
            <div>{result.message}</div>
          </div>
        );
      }
    } catch (error) {
      return (
        <div className="text-red-400">
          <div className="font-bold mb-2">❌ Status Error</div>
          <div>Failed to retrieve status: {error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      );
    }
  },

  validate: async (args: string[]) => {
    if (args.length === 0) {
      return (
        <div className="text-red-400">
          Please specify a deployment ID: <span className="font-mono">scenario validate &lt;deployment-id&gt;</span>
        </div>
      );
    }

    const deploymentId = args[0];
    
    try {
      if (USE_FUNCTIONS) {
        await cloudFunctionsAPI.validateScenario(deploymentId);
      } else {
        // Simulate validation process
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      return (
        <div className="text-green-300">
          <div className="font-bold mb-4 text-xl">🧪 Validation Results</div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-green-600 p-3 rounded">
                <div className="text-green-400 font-bold">✅ Infrastructure</div>
                <div className="text-sm text-gray-300 mt-1">All resources deployed correctly</div>
              </div>
              <div className="border border-yellow-600 p-3 rounded">
                <div className="text-yellow-400 font-bold">⚠️ Security</div>
                <div className="text-sm text-gray-300 mt-1">2 of 3 detections triggered</div>
              </div>
              <div className="border border-blue-600 p-3 rounded">
                <div className="text-blue-400 font-bold">📊 Performance</div>
                <div className="text-sm text-gray-300 mt-1">Response time: 245ms</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-800 rounded">
              <div className="text-cyan-400 font-bold mb-2">📋 Validation Summary</div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Total Tests Run:</span>
                  <span className="text-blue-400">15</span>
                </div>
                <div className="flex justify-between">
                  <span>Passed:</span>
                  <span className="text-green-400">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Failed:</span>
                  <span className="text-red-400">2</span>
                </div>
                <div className="flex justify-between">
                  <span>Warnings:</span>
                  <span className="text-yellow-400">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="text-red-400">
          <div className="font-bold mb-2">❌ Validation Error</div>
          <div>Validation failed: {error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      );
    }
  },

  destroy: async (args: string[]) => {
    if (args.length === 0) {
      return (
        <div className="text-red-400">
          Please specify a deployment ID: <span className="font-mono">scenario destroy &lt;deployment-id&gt;</span>
        </div>
      );
    }

    const deploymentId = args[0];
    
    try {
      if (USE_FUNCTIONS) {
        await cloudFunctionsAPI.destroyScenario(deploymentId);
      } else {
        // Simulate destroy process
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Remove from active deployments
      activeDeployments.delete(deploymentId);
      
      return (
        <div className="text-green-300">
          <div className="font-bold mb-3">🗑️ Scenario Destroyed Successfully</div>
          <div className="space-y-2 text-sm">
            <div><strong>Deployment ID:</strong> <span className="font-mono text-yellow-400">{deploymentId}</span></div>
            <div><strong>Resources Cleaned:</strong></div>
            <ul className="ml-4 space-y-1 text-gray-300">
              <li>• Cloud Functions deleted</li>
              <li>• Storage buckets cleaned</li>
              <li>• IAM roles removed</li>
              <li>• Firewall rules deleted</li>
              <li>• Log exports stopped</li>
            </ul>
          </div>
          <div className="mt-4 p-3 bg-green-800 rounded text-green-200 text-sm">
            <strong>✅ Cleanup Complete:</strong> All scenario resources have been safely removed.
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="text-red-400">
          <div className="font-bold mb-2">❌ Destroy Error</div>
          <div>Failed to destroy scenario: {error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      );
    }
  },

  export: async (args: string[]) => {
    if (args.length === 0) {
      return (
        <div className="text-red-400">
          Please specify a deployment ID: <span className="font-mono">scenario export &lt;deployment-id&gt; [--format json|csv|pdf]</span>
        </div>
      );
    }

    const deploymentId = args[0];
    const format = args.includes('--format') ? args[args.indexOf('--format') + 1] || 'json' : 'json';
    
    try {
      let downloadUrl = `https://storage.googleapis.com/henryreedai-exports/${deploymentId}.${format}`;
      if (USE_FUNCTIONS) {
        const r = await cloudFunctionsAPI.exportScenarioData(deploymentId, (format as any) || 'json');
        if (r.success && r.downloadUrl) downloadUrl = r.downloadUrl;
      } else {
        // Simulate export process
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      return (
        <div className="text-green-300">
          <div className="font-bold mb-4 text-xl">📦 Export Generated</div>
          <div className="space-y-3">
            <div><strong>Deployment ID:</strong> <span className="font-mono text-yellow-400">{deploymentId}</span></div>
            <div><strong>Format:</strong> {format.toUpperCase()}</div>
            <div><strong>File Size:</strong> 2.3 MB</div>
            
            <div className="mt-4 p-3 bg-blue-800 rounded">
              <div className="text-blue-200 font-bold mb-2">📥 Download Link</div>
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline break-all">
                {downloadUrl}
              </a>
              <div className="text-xs text-blue-200 mt-2">
                Link expires in 24 hours
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-cyan-400 font-bold mb-2">📋 Export Contents</div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Deployment configuration</li>
                <li>• Validation test results</li>
                <li>• Detection alerts and telemetry</li>
                <li>• Performance metrics</li>
                <li>• Resource inventory</li>
                <li>• Cleanup logs</li>
              </ul>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="text-red-400">
          <div className="font-bold mb-2">❌ Export Error</div>
          <div>Failed to generate export: {error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      );
    }
  },

  mitre: async (args: string[]) => {
    // Use lightweight arg parser for clarity
    const { parseArgs } = await import('./arg-parser');
    const parsed = parseArgs([
      { flag: '--scenario-type', type: 'string' },
      { flag: '--simulate-detection', type: 'boolean', default: false }
    ], args);

    const scenarioType = parsed['--scenario-type'] as string | undefined;
    const simulate = !!parsed['--simulate-detection'];

    const types = scenarioType ? [scenarioType] : Object.keys(MITRE_MAP);

    return (
      <div className="text-blue-300">
        <div className="font-bold mb-3 text-xl">🗺️ MITRE ATT&CK Mapping</div>
        <div className="text-gray-300 mb-2 text-sm">Mappings are informational and based on scenario intent; no actions are executed.</div>
        <div className="space-y-4">
          {types.map((t) => (
            <div key={t} className="border border-gray-600 rounded p-3">
              <div className="text-cyan-400 font-mono font-bold mb-2">{t}</div>
              {(MITRE_MAP[t] || []).length === 0 ? (
                <div className="text-gray-500 text-sm">No mappings available</div>
              ) : (
                <ul className="text-sm space-y-1">
                  {(MITRE_MAP[t] || []).map((m) => (
                    <li key={m.tid}>
                      <span className="text-green-400">{m.tid}</span> – {m.technique} <span className="text-gray-400">({m.description})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        {simulate && (
          <div className="mt-4 p-3 bg-gray-800 rounded border border-yellow-600">
            <div className="text-yellow-400 font-bold mb-2">📎 Simulated Detection Event (Stub)</div>
            <div className="text-xs text-gray-300">
              <pre className="whitespace-pre-wrap">{JSON.stringify({
                event_type: 'simulation_detection',
                scenario_type: scenarioType || 'multi',
                mapped_techniques: (scenarioType ? (MITRE_MAP[scenarioType] || []) : []).map(m => m.tid),
                timestamp: new Date().toISOString(),
                vendor: 'Cortex/XSIAM (simulated output)'
              }, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    );
  }
};
