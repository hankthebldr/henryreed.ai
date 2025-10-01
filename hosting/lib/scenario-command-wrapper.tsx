import React from 'react';
import { EnhancedCommandConfig } from './types';
import { scenarioCommands } from './scenario-commands';

// Wrap the scenario commands system into a unified command config
export const scenarioCommandConfig: EnhancedCommandConfig = {
  name: 'scenario',
  description: 'Deploy and manage security assessment scenarios',
  usage: 'scenario <subcommand> [options]',
  aliases: ['scenarios', 'sec-scenario'],
  help: {
    category: 'scenarios',
    longDescription: `The scenario command provides a comprehensive framework for deploying, managing, and validating security assessment environments. This system supports multiple cloud providers and scenario types including cloud posture assessments, container vulnerabilities, code vulnerabilities, insider threat simulations, and ransomware scenarios.

Each scenario deployment creates isolated, secure testing environments that can be used for security training, red team exercises, proof-of-concept demonstrations, and security tool validation.`,
    topics: ['security', 'assessment', 'deployment', 'cloud', 'testing', 'scenarios', 'red-team', 'blue-team'],
    seeAlso: ['download', 'status', 'ctxpov'],
    isInteractive: true,
    examples: [
      {
        cmd: 'scenario list',
        description: 'Show all available scenario templates'
      },
      {
        cmd: 'scenario list --scenario-type cloud-posture',
        description: 'List only cloud posture assessment scenarios'
      },
      {
        cmd: 'scenario generate --scenario-type ai-threat --provider gcp --region us-central1',
        description: 'Deploy an AI threat scenario on Google Cloud Platform'
      },
      {
        cmd: 'scenario generate --scenario-type container-vuln --provider aws --auto-validate --destroy-after 2h',
        description: 'Deploy a container vulnerability scenario with auto-cleanup'
      },
      {
        cmd: 'scenario status abc123def',
        description: 'Check the deployment status of scenario abc123def'
      },
      {
        cmd: 'scenario validate xyz789abc',
        description: 'Run validation tests on deployed scenario xyz789abc'
      }
    ],
    options: [
      {
        flag: '--scenario-type',
        type: 'enum',
        enumValues: ['cloud-posture', 'container-vuln', 'code-vuln', 'insider-threat', 'ransomware', 'waas-exploit', 'ai-threat', 'pipeline-breach', 'identity-compromise', 'lateral-movement-sim', 'data-exfil-behavior', 'beacon-emulation', 'phishing-sim', 'apt-simulation', 'supply-chain', 'deepfake-detection', 'social-engineering', 'zero-day-simulation', 'evasion-techniques', 'iot-security', 'ot-security', 'custom'],
        required: false,
        description: 'Type of security scenario to deploy or filter by'
      },
      {
        flag: '--provider',
        type: 'enum',
        enumValues: ['gcp', 'aws', 'azure', 'kubernetes', 'local'],
        default: 'gcp',
        required: false,
        description: 'Cloud provider or deployment target'
      },
      {
        flag: '--region',
        type: 'string',
        default: 'us-central1',
        required: false,
        description: 'Deployment region (provider-specific)'
      },
      {
        flag: '--auto-validate',
        type: 'boolean',
        default: false,
        required: false,
        description: 'Automatically run validation tests after deployment'
      },
      {
        flag: '--destroy-after',
        type: 'string',
        required: false,
        description: 'Auto-destroy resources after specified duration (e.g., "2h", "30m", "1d")'
      },
      {
        flag: '--template',
        type: 'string',
        required: false,
        description: 'Specific scenario template to use (use "scenario list" to see options)'
      },
      {
        flag: '--config',
        type: 'string',
        required: false,
        description: 'Path to custom configuration file for scenario parameters'
      }
    ],
    subcommands: [
      {
        name: 'list',
        description: 'List available scenario templates',
        examples: [
          { cmd: 'scenario list', description: 'Show all templates' },
          { cmd: 'scenario list --scenario-type cloud-posture', description: 'Filter by scenario type' }
        ],
        options: [
          {
            flag: '--scenario-type',
            type: 'enum',
            enumValues: ['cloud-posture', 'container-vuln', 'code-vuln', 'insider-threat', 'ransomware', 'waas-exploit', 'ai-threat', 'pipeline-breach', 'identity-compromise', 'lateral-movement-sim', 'data-exfil-behavior', 'beacon-emulation', 'phishing-sim', 'apt-simulation', 'supply-chain', 'deepfake-detection', 'social-engineering', 'zero-day-simulation', 'evasion-techniques', 'iot-security', 'ot-security'],
            required: false,
            description: 'Filter templates by scenario type'
          }
        ]
      },
      {
        name: 'generate',
        description: 'Deploy a new scenario instance',
        examples: [
          { cmd: 'scenario generate --scenario-type cloud-posture --provider gcp', description: 'Deploy cloud posture scenario on GCP' },
          { cmd: 'scenario generate --scenario-type container-vuln --provider aws --region us-west-2 --auto-validate', description: 'Deploy with auto-validation on AWS' }
        ],
        options: [
          {
            flag: '--scenario-type',
            type: 'enum',
            enumValues: ['cloud-posture', 'container-vuln', 'code-vuln', 'insider-threat', 'ransomware', 'waas-exploit', 'ai-threat', 'pipeline-breach', 'identity-compromise', 'lateral-movement-sim', 'data-exfil-behavior', 'beacon-emulation', 'phishing-sim', 'apt-simulation', 'supply-chain', 'deepfake-detection', 'social-engineering', 'zero-day-simulation', 'evasion-techniques', 'iot-security', 'ot-security'],
            required: true,
            description: 'Type of scenario to deploy'
          },
          {
            flag: '--provider',
            type: 'enum',
            enumValues: ['gcp', 'aws', 'azure', 'kubernetes', 'local'],
            default: 'gcp',
            required: false,
            description: 'Deployment target'
          }
        ]
      },
      {
        name: 'status',
        description: 'Check deployment status and health',
        examples: [
          { cmd: 'scenario status', description: 'Show all active deployments' },
          { cmd: 'scenario status abc123def', description: 'Check specific deployment status' }
        ]
      },
      {
        name: 'validate',
        description: 'Run validation tests on deployed scenarios',
        examples: [
          { cmd: 'scenario validate abc123def', description: 'Validate specific deployment' },
          { cmd: 'scenario validate abc123def --test-type security', description: 'Run only security validation tests' }
        ],
        options: [
          {
            flag: '--test-type',
            type: 'enum',
            enumValues: ['security', 'performance', 'connectivity', 'all'],
            default: 'all',
            required: false,
            description: 'Type of validation tests to run'
          }
        ]
      },
      {
        name: 'export',
        description: 'Export scenario configurations and results',
        examples: [
          { cmd: 'scenario export abc123def', description: 'Export deployment configuration and results' },
          { cmd: 'scenario export abc123def --format json', description: 'Export in JSON format' }
        ],
        options: [
          {
            flag: '--format',
            type: 'enum',
            enumValues: ['json', 'yaml', 'terraform'],
            default: 'json',
            required: false,
            description: 'Export format'
          }
        ]
      },
      {
        name: 'mitre',
        description: 'Map scenarios to MITRE ATT&CK techniques and simulate mapped detections (safe output only)',
        examples: [
          { cmd: 'scenario mitre --scenario-type cloud-posture', description: 'Show MITRE mappings for cloud posture scenarios' },
          { cmd: 'scenario mitre --scenario-type identity-compromise --simulate-detection', description: 'Emit a stub detection payload for testing' }
        ],
        options: [
          {
            flag: '--scenario-type',
            type: 'enum',
            enumValues: ['cloud-posture', 'container-vuln', 'code-vuln', 'insider-threat', 'ransomware', 'waas-exploit', 'ai-threat', 'pipeline-breach', 'identity-compromise', 'lateral-movement-sim', 'data-exfil-behavior', 'beacon-emulation', 'phishing-sim', 'apt-simulation', 'supply-chain', 'deepfake-detection', 'social-engineering', 'zero-day-simulation', 'evasion-techniques', 'iot-security', 'ot-security'],
            required: false,
            description: 'Filter mappings by scenario type'
          },
          {
            flag: '--simulate-detection',
            type: 'boolean',
            default: false,
            required: false,
            description: 'Output a sample, MITRE-mapped detection event (no execution)'
          }
        ]
      },
      {
        name: 'destroy',
        description: 'Clean up and destroy deployed scenarios',
        examples: [
          { cmd: 'scenario destroy abc123def', description: 'Destroy specific deployment' },
          { cmd: 'scenario destroy --all --confirm', description: 'Destroy all deployments with confirmation' }
        ],
        options: [
          {
            flag: '--all',
            type: 'boolean',
            default: false,
            required: false,
            description: 'Destroy all active deployments'
          },
          {
            flag: '--confirm',
            type: 'boolean',
            default: false,
            required: false,
            description: 'Skip interactive confirmation'
          }
        ]
      }
    ]
  },
  handler: async (args: string[]) => {
    if (args.length === 0) {
      // Show subcommand help
      return (
        <div className="text-blue-300">
          <div className="font-bold mb-4 text-xl">🎯 Scenario Management System</div>
          <div className="mb-4 text-gray-300">
            Deploy and manage security assessment scenarios across cloud environments.
          </div>
          <div className="space-y-3">
            <div className="text-green-400 font-bold">Available Subcommands:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border border-blue-500 p-3 rounded">
                <div className="text-blue-400 font-mono font-bold">list</div>
                <div className="text-sm text-gray-300">Browse available scenario templates</div>
              </div>
              <div className="border border-green-500 p-3 rounded">
                <div className="text-green-400 font-mono font-bold">generate</div>
                <div className="text-sm text-gray-300">Deploy a new scenario instance</div>
              </div>
              <div className="border border-yellow-500 p-3 rounded">
                <div className="text-yellow-400 font-mono font-bold">status</div>
                <div className="text-sm text-gray-300">Check deployment status</div>
              </div>
              <div className="border border-purple-500 p-3 rounded">
                <div className="text-purple-400 font-mono font-bold">validate</div>
                <div className="text-sm text-gray-300">Run validation tests</div>
              </div>
              <div className="border border-cyan-500 p-3 rounded">
                <div className="text-cyan-400 font-mono font-bold">export</div>
                <div className="text-sm text-gray-300">Export configurations and results</div>
              </div>
              <div className="border border-red-500 p-3 rounded">
                <div className="text-red-400 font-mono font-bold">destroy</div>
                <div className="text-sm text-gray-300">Clean up deployed scenarios</div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-800 rounded border border-gray-600">
            <div className="text-cyan-400 font-bold mb-2">🚀 Quick Examples</div>
            <div className="text-sm space-y-1 font-mono">
              <div className="text-green-400">scenario list --scenario-type cloud-posture</div>
              <div className="text-blue-400">scenario generate --scenario-type ai-threat --provider gcp</div>
              <div className="text-yellow-400">scenario status</div>
            </div>
          </div>
        </div>
      );
    }

    const subcommand = args[0].toLowerCase();
    const subArgs = args.slice(1);

    // Delegate to the appropriate scenario command handler
    switch (subcommand) {
      case 'list':
        return await scenarioCommands.list(subArgs);
      
      case 'generate':
        return await scenarioCommands.generate(['generate', ...subArgs]);
      
      case 'status':
        return await scenarioCommands.status(subArgs);
      
      case 'validate':
        // Note: scenarioCommands may not have validate yet, so provide a placeholder
        if ('validate' in scenarioCommands && typeof scenarioCommands.validate === 'function') {
          return await scenarioCommands.validate(subArgs);
        } else {
          return (
            <div className="text-yellow-400">
              <div className="font-bold mb-2">🚧 Validation Coming Soon</div>
              <div className="text-sm">The validation system is currently under development.</div>
              <div className="text-sm mt-2">Use <span className="font-mono">scenario status {subArgs[0] || '[deployment-id]'}</span> to check deployment health in the meantime.</div>
            </div>
          );
        }
      
      case 'export':
        if ('export' in scenarioCommands && typeof scenarioCommands.export === 'function') {
          return await scenarioCommands.export(subArgs);
        } else {
          return (
            <div className="text-yellow-400">
              <div className="font-bold mb-2">🚧 Export Coming Soon</div>
              <div className="text-sm">The export system is currently under development.</div>
            </div>
          );
        }
      
      case 'mitre':
        if ('mitre' in scenarioCommands && typeof (scenarioCommands as any).mitre === 'function') {
          return await (scenarioCommands as any).mitre(subArgs);
        }
        return (
          <div className="text-yellow-400">
            <div className="font-bold mb-2">⚠️ MITRE Mapping Not Available</div>
            <div className="text-sm">The MITRE mapping function is not implemented.</div>
          </div>
        );
      
      case 'destroy':
        if ('destroy' in scenarioCommands && typeof scenarioCommands.destroy === 'function') {
          return await scenarioCommands.destroy(subArgs);
        } else {
          return (
            <div className="text-yellow-400">
              <div className="font-bold mb-2">🚧 Destroy Coming Soon</div>
              <div className="text-sm">The destroy system is currently under development.</div>
              <div className="text-sm mt-2 text-red-400">⚠️ Please manually clean up any deployed resources for now.</div>
            </div>
          );
        }
      
      default:
        return (
          <div className="text-red-400">
            <div className="font-bold mb-2">❌ Unknown Subcommand</div>
            <div className="text-sm">'{subcommand}' is not a recognized scenario subcommand.</div>
            <div className="text-sm mt-2">Available subcommands: list, generate, status, validate, export, destroy</div>
            <div className="text-sm mt-1">Use <span className="font-mono text-green-400">scenario --help</span> for detailed usage.</div>
          </div>
        );
    }
  }
};
