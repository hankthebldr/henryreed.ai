import React from 'react';
import { CommandConfig } from './commands';
import {
  deriveTechValidationStage,
  computePlaybookMetricsView,
  TV_STAGE_DEFINITIONS,
  PLAYBOOK_SCENARIO_TEMPLATES,
  TechValidationStage,
  PlaybookScenarioType,
} from '../types/tech-validation';

// Mock data access (replace with actual context/state management)
const getPOVProject = (povId: string) => {
  // This would come from AppStateContext in real implementation
  return null;
};

export const techValidationCommands: CommandConfig[] = [
  {
    name: 'tv',
    description: 'Tech Validation playbook commands (FY26)',
    usage: 'tv <command> [options]',
    aliases: ['tech-validation'],
    handler: (args) => {
      if (args.length === 0) {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">🎯 Tech Validation Playbook (FY26)</div>
            <div className="text-gray-300 mb-4">
              Lightweight integration layer for XSIAM POV execution aligned with sales processes.
              Metrics derived from existing POV Business Value Framework.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-blue-600 p-3 rounded">
                <div className="text-blue-400 font-bold mb-2">📊 Core Commands</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-green-300">tv status &lt;pov-id&gt;</div>
                  <div className="text-gray-400 ml-4">→ Show current TV stage (derived from POV)</div>
                  <div className="font-mono text-purple-300">tv metrics &lt;pov-id&gt;</div>
                  <div className="text-gray-400 ml-4">→ Display computed metrics from BVF</div>
                  <div className="font-mono text-yellow-300">tv scenarios</div>
                  <div className="text-gray-400 ml-4">→ List playbook scenario templates</div>
                </div>
              </div>

              <div className="border border-green-600 p-3 rounded">
                <div className="text-green-400 font-bold mb-2">🔗 POV Integration</div>
                <div className="space-y-1 text-sm">
                  <div className="font-mono text-cyan-300">tv enable &lt;pov-id&gt;</div>
                  <div className="text-gray-400 ml-4">→ Enable TV tracking for existing POV</div>
                  <div className="font-mono text-blue-300">tv readout &lt;pov-id&gt;</div>
                  <div className="text-gray-400 ml-4">→ Generate executive readout (aggregates BVF)</div>
                </div>
              </div>
            </div>

            <div className="border border-yellow-600 p-4 rounded mb-4">
              <div className="text-yellow-400 font-bold mb-2">⭐ Key Concepts</div>
              <div className="text-sm text-gray-300 space-y-1">
                <div>• <strong>Lightweight Integration:</strong> Wraps existing POV, no data duplication</div>
                <div>• <strong>Derived Metrics:</strong> All metrics computed from POV Business Value Framework</div>
                <div>• <strong>Stage Mapping:</strong> TV stages derived from POV phase/status automatically</div>
                <div>• <strong>Playbook Scenarios:</strong> Gambit, Turla, CDR map to existing scenario library</div>
              </div>
            </div>

            <div className="text-cyan-400 text-sm">
              Use <span className="font-mono">tv &lt;command&gt; --help</span> for detailed usage.
            </div>
          </div>
        );
      }

      const subcommand = args[0];
      const subArgs = args.slice(1);

      switch (subcommand) {
        case 'status':
          return handleTVStatus(subArgs);
        case 'metrics':
          return handleTVMetrics(subArgs);
        case 'scenarios':
          return handleTVScenarios(subArgs);
        case 'enable':
          return handleTVEnable(subArgs);
        case 'readout':
          return handleTVReadout(subArgs);
        case 'stages':
          return handleTVStages(subArgs);
        default:
          return (
            <div className="text-red-400">
              Unknown TV command: {subcommand}
              <div className="mt-2 text-gray-300 text-sm">
                Run <span className="font-mono">tv</span> to see available commands.
              </div>
            </div>
          );
      }
    },
  },
];

// Handler: tv status <pov-id>
const handleTVStatus = (args: string[]) => {
  const povId = args[0];

  if (!povId) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ POV ID Required</div>
        <div className="text-sm">
          Usage: <span className="font-mono text-yellow-400">tv status &lt;pov-id&gt;</span>
        </div>
      </div>
    );
  }

  // Mock POV data (replace with actual data from AppStateContext)
  const mockPOV = {
    id: povId,
    name: 'Acme Corp - XSIAM POV',
    phase: 'validation' as const,
    status: 'active' as const,
    customer: { name: 'Acme Corp' },
  };

  const tvStage = deriveTechValidationStage(mockPOV.phase, mockPOV.status);
  const stageDef = TV_STAGE_DEFINITIONS[tvStage];

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📊 Tech Validation Status</div>

      <div className="space-y-3">
        <div>
          <span className="text-gray-400">POV ID:</span>{' '}
          <span className="text-yellow-400 font-mono">{mockPOV.id}</span>
        </div>
        <div>
          <span className="text-gray-400">Customer:</span>{' '}
          <span className="text-white">{mockPOV.customer.name}</span>
        </div>
        <div>
          <span className="text-gray-400">POV Phase:</span>{' '}
          <span className="text-cyan-400">{mockPOV.phase}</span>
        </div>

        <div className="mt-4 p-4 bg-blue-900/30 border border-blue-600 rounded">
          <div className="text-blue-400 font-bold mb-2">Current TV Stage</div>
          <div className="text-xl text-white mb-2">{stageDef.name}</div>
          <div className="text-sm text-gray-300 mb-3">{stageDef.description}</div>
          <div className="text-xs text-gray-400">Duration: {stageDef.duration}</div>
        </div>

        <div className="mt-4">
          <div className="text-green-400 font-bold mb-2">📋 Key Activities</div>
          <div className="space-y-1 text-sm">
            {stageDef.keyActivities.map((activity, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="text-green-400">•</span>
                <span className="text-gray-300">{activity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-purple-400 font-bold mb-2">📦 Expected Deliverables</div>
          <div className="space-y-1 text-sm">
            {stageDef.deliverables.map((deliverable, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="text-purple-400">•</span>
                <span className="text-gray-300">{deliverable}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-yellow-400 font-bold mb-2">✅ Exit Criteria</div>
          <div className="space-y-1 text-sm">
            {stageDef.exitCriteria.map((criteria, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="text-yellow-400">○</span>
                <span className="text-gray-300">{criteria}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded text-sm">
        <div className="text-cyan-400 font-bold mb-2">💡 Next Steps</div>
        <div className="space-y-1">
          <div className="font-mono text-green-400">tv metrics {povId}</div>
          <div className="text-gray-400 ml-4">→ View computed metrics from BVF</div>
          <div className="font-mono text-purple-400">tv readout {povId}</div>
          <div className="text-gray-400 ml-4">→ Generate executive readout</div>
        </div>
      </div>
    </div>
  );
};

// Handler: tv metrics <pov-id>
const handleTVMetrics = (args: string[]) => {
  const povId = args[0];

  if (!povId) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ POV ID Required</div>
        <div className="text-sm">
          Usage: <span className="font-mono text-yellow-400">tv metrics &lt;pov-id&gt;</span>
        </div>
      </div>
    );
  }

  // Mock BVF data (replace with actual from POV)
  const mockBVF = {
    operationalMetrics: {
      automationRate: 100,
      mttr: 1.5,
      mttd: 15,
      alertReduction: 96,
      threatDetectionAccuracy: 94,
    },
    financialMetrics: {
      estimatedCostSavings: 850000,
      roiPercentage: 325,
      toolConsolidation: 5,
    },
  };

  // Mock scenarios
  const mockScenarios = [
    { results: { detectionAlerts: new Array(25) } },
    { results: { detectionAlerts: new Array(18) } },
  ];

  const metricsView = computePlaybookMetricsView(mockBVF as any, mockScenarios as any);

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📈 Tech Validation Metrics</div>
      <div className="text-sm text-gray-400 mb-4">
        Computed from POV Business Value Framework (no duplication)
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Operational Excellence */}
        <div className="border border-green-600 p-4 rounded bg-green-900/20">
          <div className="text-green-400 font-bold mb-3">🎯 Operational Excellence</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Alert Grouping:</span>
              <span className="text-white font-mono">
                {metricsView.alertGroupingRatio?.toFixed(1)}:1
                {metricsView.alertGroupingRatio && (
                  <span className="text-green-400 ml-2">
                    (↓{((1 - 1 / metricsView.alertGroupingRatio) * 100).toFixed(0)}%)
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Automation Rate:</span>
              <span className="text-white font-mono">{metricsView.automationRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">MTTR:</span>
              <span className="text-white font-mono">{metricsView.mttr} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">MTTD:</span>
              <span className="text-white font-mono">{metricsView.mttd} min</span>
            </div>
          </div>
        </div>

        {/* Security Posture */}
        <div className="border border-blue-600 p-4 rounded bg-blue-900/20">
          <div className="text-blue-400 font-bold mb-3">🛡️ Security Posture</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">MITRE Coverage:</span>
              <span className="text-white font-mono">
                {metricsView.mitreCoverage?.toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Detection Accuracy:</span>
              <span className="text-white font-mono">{metricsView.detectionAccuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Cloud Compliance:</span>
              <span className="text-white font-mono">
                {metricsView.cloudComplianceScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Cost Optimization */}
        <div className="border border-yellow-600 p-4 rounded bg-yellow-900/20">
          <div className="text-yellow-400 font-bold mb-3">💰 Cost Optimization</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Est. Cost Savings:</span>
              <span className="text-white font-mono">
                ${(metricsView.costSavings! / 1000).toFixed(0)}K/yr
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Tools Consolidated:</span>
              <span className="text-white font-mono">{metricsView.toolConsolidation}</span>
            </div>
          </div>
        </div>

        {/* Business Growth */}
        <div className="border border-purple-600 p-4 rounded bg-purple-900/20">
          <div className="text-purple-400 font-bold mb-3">🚀 Business Growth</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Time to Value:</span>
              <span className="text-white font-mono">{metricsView.timeToValue || '2 weeks'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <div className="text-cyan-400 font-bold mb-2">📊 Metrics Source</div>
        <div className="text-sm text-gray-400">
          All metrics derived from POV Business Value Framework. No separate storage.
        </div>
      </div>
    </div>
  );
};

// Handler: tv scenarios
const handleTVScenarios = (args: string[]) => {
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">🔬 Playbook Scenario Templates</div>
      <div className="text-sm text-gray-400 mb-4">
        FY26 XSIAM POV scenarios mapped to existing scenario library
      </div>

      <div className="space-y-4">
        {Object.entries(PLAYBOOK_SCENARIO_TEMPLATES).map(([key, template]) => (
          <div
            key={key}
            className="border border-gray-600 p-4 rounded bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-cyan-400 font-bold text-lg">{template.name}</div>
                <div className="text-gray-300 text-sm mt-1">{template.description}</div>
              </div>
              <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                {key}
              </div>
            </div>

            <div className="mt-3 text-sm">
              <div className="text-purple-400 font-semibold mb-1">📍 Maps To:</div>
              <div className="flex flex-wrap gap-1 mb-3">
                {template.underlyingScenarioTypes.map((type) => (
                  <span
                    key={type}
                    className="text-xs bg-purple-800 text-purple-200 px-2 py-1 rounded"
                  >
                    {type}
                  </span>
                ))}
              </div>

              <div className="text-green-400 font-semibold mb-1">📊 Expected Metrics:</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                {template.expectedMetrics.mttr && (
                  <div>MTTR: {template.expectedMetrics.mttr}</div>
                )}
                {template.expectedMetrics.automationRate && (
                  <div>Automation: {template.expectedMetrics.automationRate}</div>
                )}
                {template.expectedMetrics.alertReduction && (
                  <div>Alert Reduction: {template.expectedMetrics.alertReduction}</div>
                )}
                {template.expectedMetrics.mitreTechniques && (
                  <div>MITRE Techniques: {template.expectedMetrics.mitreTechniques}</div>
                )}
              </div>
            </div>

            <div className="mt-3 text-xs">
              <a href={template.guideUrl} className="text-blue-400 hover:underline">
                📖 View Scenario Guide →
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-gray-800 rounded text-sm">
        <div className="text-cyan-400 font-bold mb-2">💡 Usage</div>
        <div className="space-y-1">
          <div className="text-gray-300">
            1. Deploy scenarios using existing <span className="font-mono text-green-400">scenario generate</span> commands
          </div>
          <div className="text-gray-300">
            2. Execute during <span className="font-mono text-yellow-400">TV Stage 4</span> (POV Execution)
          </div>
          <div className="text-gray-300">
            3. Metrics automatically captured in POV Business Value Framework
          </div>
        </div>
      </div>
    </div>
  );
};

// Handler: tv enable <pov-id>
const handleTVEnable = (args: string[]) => {
  const povId = args[0];

  if (!povId) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ POV ID Required</div>
        <div className="text-sm">
          Usage: <span className="font-mono text-yellow-400">tv enable &lt;pov-id&gt;</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-green-300">
      <div className="font-bold mb-4 text-xl">✅ Tech Validation Enabled</div>

      <div className="space-y-3">
        <div>
          <span className="text-gray-400">POV ID:</span>{' '}
          <span className="text-yellow-400 font-mono">{povId}</span>
        </div>
        <div>
          <span className="text-gray-400">Status:</span>{' '}
          <span className="text-green-400">TV tracking enabled</span>
        </div>

        <div className="mt-4 p-4 bg-green-900/30 border border-green-600 rounded">
          <div className="text-green-400 font-bold mb-2">🎯 What's Next</div>
          <div className="space-y-2 text-sm text-gray-300">
            <div>• Tech Validation stages will be derived from POV phase automatically</div>
            <div>• Metrics will be computed from POV Business Value Framework</div>
            <div>• Playbook scenarios can be executed using existing scenario commands</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-cyan-400 font-bold mb-2">📋 Recommended Commands</div>
          <div className="space-y-1 text-sm">
            <div className="font-mono text-green-400">tv status {povId}</div>
            <div className="text-gray-400 ml-4">→ View current TV stage and activities</div>
            <div className="font-mono text-purple-400">tv scenarios</div>
            <div className="text-gray-400 ml-4">→ Browse playbook scenario templates</div>
            <div className="font-mono text-yellow-400">tv metrics {povId}</div>
            <div className="text-gray-400 ml-4">→ View computed metrics</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Handler: tv readout <pov-id>
const handleTVReadout = (args: string[]) => {
  const povId = args[0];

  if (!povId) {
    return (
      <div className="text-red-400">
        <div className="font-bold mb-2">❌ POV ID Required</div>
        <div className="text-sm">
          Usage: <span className="font-mono text-yellow-400">tv readout &lt;pov-id&gt;</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📄 Generating Tech Validation Readout</div>

      <div className="space-y-3">
        <div>
          <span className="text-gray-400">POV ID:</span>{' '}
          <span className="text-yellow-400 font-mono">{povId}</span>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-green-400">✓</span>
            <span className="text-gray-300">Aggregating POV Business Value Framework</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-400">✓</span>
            <span className="text-gray-300">Computing metrics from scenarios</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-400">✓</span>
            <span className="text-gray-300">Mapping technical findings to business outcomes</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400">⏳</span>
            <span className="text-gray-300">Generating executive readout PDF...</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-900/30 border border-blue-600 rounded">
          <div className="text-blue-400 font-bold mb-2">📊 Readout Contents</div>
          <div className="space-y-1 text-sm text-gray-300">
            <div>• Executive Summary</div>
            <div>• Business Outcomes (mapped from BVF)</div>
            <div>• Technical Findings (from scenarios)</div>
            <div>• Metrics Analysis (4 value pillars)</div>
            <div>• MITRE ATT&CK Coverage Dashboard</div>
            <div>• Recommendations & Next Steps</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded">
          <div className="text-green-400 font-bold mb-2">✅ Readout Generated</div>
          <div className="text-sm text-gray-300 mb-2">
            Executive readout ready for download
          </div>
          <div className="text-blue-400 hover:underline cursor-pointer">
            📥 Download PDF: pov-{povId}-readout.pdf
          </div>
        </div>
      </div>
    </div>
  );
};

// Handler: tv stages
const handleTVStages = (args: string[]) => {
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📅 Tech Validation Stages (FY26)</div>
      <div className="text-sm text-gray-400 mb-4">
        All stages derived from POV phase/status - no separate tracking needed
      </div>

      <div className="space-y-3">
        {Object.entries(TV_STAGE_DEFINITIONS).map(([stageKey, stageDef], index) => (
          <div
            key={stageKey}
            className="border border-gray-600 p-4 rounded bg-gray-900/50"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-cyan-400 font-bold">
                  {index === 3 && '⭐ '}
                  Stage {stageKey.replace('tv-stage-', '')}: {stageDef.name}
                </div>
                <div className="text-gray-300 text-sm mt-1">{stageDef.description}</div>
              </div>
              <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                {stageDef.duration}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-green-400 font-semibold mb-1">Key Activities:</div>
                <div className="space-y-0.5 text-gray-300">
                  {stageDef.keyActivities.slice(0, 3).map((activity, idx) => (
                    <div key={idx}>• {activity}</div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-purple-400 font-semibold mb-1">Deliverables:</div>
                <div className="space-y-0.5 text-gray-300">
                  {stageDef.deliverables.slice(0, 3).map((deliverable, idx) => (
                    <div key={idx}>• {deliverable}</div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-yellow-400 font-semibold mb-1">Exit Criteria:</div>
                <div className="space-y-0.5 text-gray-300">
                  {stageDef.exitCriteria.slice(0, 2).map((criteria, idx) => (
                    <div key={idx}>• {criteria}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-gray-800 rounded text-sm">
        <div className="text-cyan-400 font-bold mb-2">💡 Stage Progression</div>
        <div className="text-gray-300">
          Stages automatically update as POV progresses through phases.
          Use <span className="font-mono text-green-400">tv status &lt;pov-id&gt;</span> to view
          current stage.
        </div>
      </div>
    </div>
  );
};
