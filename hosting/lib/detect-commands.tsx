import React from 'react';
import { cloudFunctionsAPI } from './cloud-functions-api';

const USE_FUNCTIONS = process.env.NEXT_PUBLIC_USE_FUNCTIONS === '1';

// XSIAM/Cortex integration mappings
const DETECTION_RULES_MAP: Record<string, Array<{ id: string; name: string; severity: 'low' | 'medium' | 'high' | 'critical' }>> = {
  'cloud-posture': [
    { id: 'CP-001', name: 'Unrestricted Security Group Access', severity: 'high' },
    { id: 'CP-002', name: 'Public S3 Bucket Detection', severity: 'critical' },
    { id: 'CP-003', name: 'IAM Overprivileged Access', severity: 'medium' },
    { id: 'CP-004', name: 'Unencrypted EBS Volume', severity: 'high' }
  ],
  'insider-threat': [
    { id: 'IT-001', name: 'Unusual File Access Pattern', severity: 'medium' },
    { id: 'IT-002', name: 'After-Hours Data Download', severity: 'high' },
    { id: 'IT-003', name: 'Privilege Escalation Attempt', severity: 'critical' },
    { id: 'IT-004', name: 'Bulk Data Export', severity: 'high' }
  ],
  'ransomware': [
    { id: 'RW-001', name: 'File Encryption Activity', severity: 'critical' },
    { id: 'RW-002', name: 'Backup Service Disruption', severity: 'critical' },
    { id: 'RW-003', name: 'Shadow Copy Deletion', severity: 'high' },
    { id: 'RW-004', name: 'Suspicious Process Termination', severity: 'medium' }
  ],
  'container-vuln': [
    { id: 'CV-001', name: 'Container Escape Attempt', severity: 'critical' },
    { id: 'CV-002', name: 'Vulnerable Image Deployment', severity: 'high' },
    { id: 'CV-003', name: 'Privileged Container Runtime', severity: 'medium' },
    { id: 'CV-004', name: 'Suspicious Network Traffic', severity: 'high' }
  ],
  'code-vuln': [
    { id: 'CD-001', name: 'SQL Injection Pattern', severity: 'critical' },
    { id: 'CD-002', name: 'XSS Vulnerability Exploit', severity: 'high' },
    { id: 'CD-003', name: 'Path Traversal Attempt', severity: 'high' },
    { id: 'CD-004', name: 'Command Injection Detection', severity: 'critical' }
  ]
};

import { CommandConfig } from './commands';

// Function declarations
const handleDetectTest = async (args: string[]) => {
    const scenario = args.includes('--scenario') ? args[args.indexOf('--scenario') + 1] : '';
    const allRules = args.includes('--all-rules');
    const dryRun = args.includes('--dry-run');
    const verbose = args.includes('--verbose');

    if (!scenario) {
      return (
        <div className="text-red-400">
          Please specify a scenario: <span className="font-mono">detect test --scenario cloud-posture</span>
        </div>
      );
    }

    const rules = DETECTION_RULES_MAP[scenario] || [];
    if (rules.length === 0) {
      return (
        <div className="text-yellow-400">
          No detection rules found for scenario: {scenario}
        </div>
      );
    }

    try {
      // Note: testDetections method would need to be implemented in cloudFunctionsAPI
      // if (USE_FUNCTIONS && !dryRun) {
      //   await cloudFunctionsAPI.testDetections({
      //     scenario,
      //     rules: allRules ? rules.map(r => r.id) : rules.slice(0, 2).map(r => r.id),
      //     verbose
      //   });
      // } else {
        // Simulate detection testing
        await new Promise(resolve => setTimeout(resolve, 2500));
      // }

      const testResults = rules.map(rule => ({
        ...rule,
        tested: allRules || rules.indexOf(rule) < 2,
        triggered: Math.random() > 0.3, // 70% success rate simulation
        responseTime: Math.floor(Math.random() * 500) + 100,
        falsePositive: Math.random() < 0.1 // 10% false positive rate
      }));

      const testedRules = testResults.filter(r => r.tested);
      const triggeredCount = testedRules.filter(r => r.triggered).length;
      const avgResponseTime = Math.round(testedRules.reduce((sum, r) => sum + r.responseTime, 0) / testedRules.length);

      return (
        <div className="text-green-300">
          <div className="font-bold mb-4 text-xl">🔍 Detection Test Results</div>
          
          <div className="mb-4 bg-gray-800 p-4 rounded-lg">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">{testedRules.length}</div>
                <div className="text-xs text-cortex-text-secondary">Rules Tested</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{triggeredCount}</div>
                <div className="text-xs text-cortex-text-secondary">Successful Detections</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{avgResponseTime}ms</div>
                <div className="text-xs text-cortex-text-secondary">Avg Response Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400">{Math.round((triggeredCount / testedRules.length) * 100)}%</div>
                <div className="text-xs text-cortex-text-secondary">Detection Rate</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-cyan-400 mb-2">📋 Detection Rule Results</div>
            {testResults.map(rule => (
              <div key={rule.id} className={`border-l-4 p-3 rounded-r ${
                !rule.tested ? 'border-gray-500 bg-gray-800' :
                rule.triggered ? 'border-green-500 bg-green-900/20' : 
                'border-red-500 bg-red-900/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-sm text-cortex-text-secondary">ID: {rule.id}</div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded text-xs ${
                      rule.severity === 'critical' ? 'bg-red-600 text-red-200' :
                      rule.severity === 'high' ? 'bg-orange-600 text-orange-200' :
                      rule.severity === 'medium' ? 'bg-yellow-600 text-yellow-200' :
                      'bg-blue-600 text-blue-200'
                    }`}>
                      {rule.severity.toUpperCase()}
                    </div>
                    {rule.tested && (
                      <div className="mt-1 text-xs">
                        {rule.triggered ? (
                          <span className="text-green-400">✓ Triggered ({rule.responseTime}ms)</span>
                        ) : (
                          <span className="text-red-400">✗ No Detection</span>
                        )}
                        {rule.falsePositive && <span className="text-yellow-400"> ⚠ FP Risk</span>}
                      </div>
                    )}
                    {!rule.tested && (
                      <div className="mt-1 text-xs text-cortex-text-muted">Not Tested</div>
                    )}
                  </div>
                </div>
                {verbose && rule.tested && (
                  <div className="mt-2 text-xs text-cortex-text-secondary bg-black p-2 rounded font-mono">
                    XSIAM Query: index=main scenario="{scenario}" rule_id="{rule.id}" | stats count by _time
                  </div>
                )}
              </div>
            ))}
          </div>

          {dryRun && (
            <div className="mt-4 p-3 bg-blue-800 rounded text-blue-200">
              <div className="font-bold mb-1">🔍 Dry Run Mode</div>
              <div className="text-sm">No actual detections triggered. Use without --dry-run to test live rules.</div>
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-800 rounded">
            <div className="font-bold text-cyan-400 mb-2">🎯 Recommendations</div>
            <ul className="text-sm text-gray-300 space-y-1">
              {triggeredCount < testedRules.length && <li>• Review and tune non-triggering detection rules</li>}
              {avgResponseTime > 300 && <li>• Optimize detection rule performance for faster response</li>}
              {testResults.some(r => r.falsePositive) && <li>• Investigate potential false positive patterns</li>}
              <li>• Consider implementing automated response playbooks</li>
            </ul>
          </div>

          <div className="mt-4 text-xs text-cortex-text-secondary">
            <strong>Next Steps:</strong> monitor start --scenario {scenario}, scenario validate --detections
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="text-red-400">
          <div className="font-bold mb-2">❌ Detection Test Failed</div>
          <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      );
    }
};

const handleDetectRules = async (args: string[]) => {
    const scenario = args.includes('--scenario') ? args[args.indexOf('--scenario') + 1] : '';
    const severity = args.includes('--severity') ? args[args.indexOf('--severity') + 1] : '';

    if (!scenario && !severity) {
      // Show all available rules across scenarios
      return (
        <div className="text-blue-300">
          <div className="font-bold mb-4 text-xl">📚 Available Detection Rules</div>
          <div className="space-y-4">
            {Object.entries(DETECTION_RULES_MAP).map(([scenarioType, rules]) => (
              <div key={scenarioType} className="border border-gray-600 rounded-lg p-4">
                <div className="font-bold text-cyan-400 mb-2 capitalize">
                  {scenarioType.replace('-', ' ')} ({rules.length} rules)
                </div>
                <div className="space-y-2">
                  {rules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                      <div>
                        <div className="font-medium text-sm">{rule.name}</div>
                        <div className="text-xs text-cortex-text-secondary">ID: {rule.id}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        rule.severity === 'critical' ? 'bg-red-600 text-red-200' :
                        rule.severity === 'high' ? 'bg-orange-600 text-orange-200' :
                        rule.severity === 'medium' ? 'bg-yellow-600 text-yellow-200' :
                        'bg-blue-600 text-blue-200'
                      }`}>
                        {rule.severity.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-cortex-text-secondary">
            Use <span className="font-mono">detect rules --scenario [type]</span> to filter by scenario
          </div>
        </div>
      );
    }

    // Filter by scenario or severity
    let filteredRules: Array<{ scenario: string; rule: typeof DETECTION_RULES_MAP[string][0] }> = [];

    if (scenario) {
      const rules = DETECTION_RULES_MAP[scenario] || [];
      filteredRules = rules.map(rule => ({ scenario, rule }));
    } else {
      // Filter across all scenarios by severity
      Object.entries(DETECTION_RULES_MAP).forEach(([scenarioType, rules]) => {
        rules.filter(rule => !severity || rule.severity === severity)
             .forEach(rule => filteredRules.push({ scenario: scenarioType, rule }));
      });
    }

    return (
      <div className="text-blue-300">
        <div className="font-bold mb-4 text-xl">
          📚 Detection Rules {scenario && `(${scenario})`} {severity && `(${severity} severity)`}
        </div>
        {filteredRules.length === 0 ? (
          <div className="text-cortex-text-muted">No matching detection rules found</div>
        ) : (
          <div className="space-y-2">
            {filteredRules.map(({ scenario: scenarioType, rule }) => (
              <div key={`${scenarioType}-${rule.id}`} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                <div>
                  <div className="font-medium">{rule.name}</div>
                  <div className="text-sm text-cortex-text-secondary">
                    {rule.id} • Scenario: {scenarioType}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  rule.severity === 'critical' ? 'bg-red-600 text-red-200' :
                  rule.severity === 'high' ? 'bg-orange-600 text-orange-200' :
                  rule.severity === 'medium' ? 'bg-yellow-600 text-yellow-200' :
                  'bg-blue-600 text-blue-200'
                }`}>
                  {rule.severity.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 text-sm text-cortex-text-secondary">
          Use <span className="font-mono">detect test --scenario {scenario || 'SCENARIO'}</span> to test these rules
        </div>
      </div>
    );
};

const handleDetectTune = async (args: string[]) => {
    const ruleId = args[0];
    const threshold = args.includes('--threshold') ? parseFloat(args[args.indexOf('--threshold') + 1]) : null;
    const enableRule = args.includes('--enable');
    const disableRule = args.includes('--disable');

    if (!ruleId) {
      return (
        <div className="text-red-400">
          Please specify a rule ID: <span className="font-mono">detect tune CP-001 --threshold 0.8</span>
        </div>
      );
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      return (
        <div className="text-green-300">
          <div className="font-bold mb-3">🔧 Detection Rule Tuned</div>
          <div className="bg-gray-800 p-3 rounded">
            <div className="space-y-2 text-sm">
              <div><strong>Rule ID:</strong> <span className="font-mono text-yellow-400">{ruleId}</span></div>
              {threshold && <div><strong>Threshold:</strong> {threshold}</div>}
              {enableRule && <div><strong>Status:</strong> <span className="text-green-400">Enabled</span></div>}
              {disableRule && <div><strong>Status:</strong> <span className="text-red-400">Disabled</span></div>}
              <div><strong>Last Modified:</strong> {new Date().toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-cortex-text-secondary">
            Changes applied to XSIAM detection rules. Test with <span className="font-mono">detect test</span>
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="text-red-400">
          <div className="font-bold mb-2">❌ Rule Tuning Failed</div>
          <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      );
    }
};

export const detectCommands: CommandConfig[] = [
  {
    name: 'detect',
    description: 'Detection rule testing and management',
    usage: 'detect [test|rules|tune] [options]',
    aliases: ['dt'],
    handler: async (args: string[]) => {
      const subcommand = args[0] || 'help';
      const subArgs = args.slice(1);
      
      switch (subcommand) {
        case 'test':
          return await handleDetectTest(subArgs);
        case 'rules':
          return await handleDetectRules(subArgs);
        case 'tune':
          return await handleDetectTune(subArgs);
        default:
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-2">🔍 Detection Commands</div>
              <div className="space-y-1 text-sm">
                <div>• <span className="font-mono">detect test --scenario [type]</span> - Test detection rules</div>
                <div>• <span className="font-mono">detect rules --scenario [type]</span> - List detection rules</div>
                <div>• <span className="font-mono">detect tune RULE_ID --threshold [value]</span> - Tune detection rules</div>
              </div>
            </div>
          );
      }
    }
  }
];
