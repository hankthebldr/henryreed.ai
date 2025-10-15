'use client';

import React, { useMemo } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import {
  computePlaybookMetricsView,
  PlaybookMetricsView,
  deriveTechValidationStage,
  TV_STAGE_DEFINITIONS,
  TechValidationStage,
} from '../types/tech-validation';
import { BusinessValueFramework } from '../types/business-value-framework';
import { formatCurrency, formatPercentage } from '../types/business-value-framework';

export interface TechValidationMetricsViewProps {
  povId: string;
  showStageInfo?: boolean;
}

/**
 * Tech Validation Metrics View Component
 *
 * Displays computed metrics from existing POV Business Value Framework
 * organized into 4 value pillars:
 * 1. Operational Excellence
 * 2. Security Posture
 * 3. Cost Optimization
 * 4. Business Growth
 *
 * All metrics are DERIVED from existing data sources - nothing stored separately
 */
export const TechValidationMetricsView: React.FC<TechValidationMetricsViewProps> = ({
  povId,
  showStageInfo = true,
}) => {
  const { state } = useAppState();

  // TODO: Replace with actual POV lookup from AppStateContext
  // const pov = state.povProjects?.find(p => p.id === povId);

  // Mock POV data for MVP (replace with real data)
  const pov = useMemo(() => ({
    id: povId,
    name: 'Global Financial Services - Multi-Cloud Security Assessment',
    phase: 'validation' as const,
    status: 'active' as const,
    businessValueFramework: {
      executiveObjective: ['improve-security-posture-compliance', 'optimize-security-operations'],
      functionalObjective: ['2a-optimize-threat-detection-containment', '1c-safeguard-cloud-environments'],
      useCaseCategories: ['threat-detection', 'cloud-security', 'security-automation'],
      challenges: ['fragmented-security-tools', 'alert-fatigue-noise', 'cloud-complexity'],
      capabilitiesDemonstrated: ['unified-detection-response', 'cloud-workload-protection', 'threat-correlation'],
      businessOutcomes: [
        'Unified security operations across AWS, Azure, and GCP',
        'Reduced alert noise by 65% through intelligent correlation',
        'Decreased mean time to detect (MTTD) from 4 hours to 15 minutes',
      ],
      operationalMetrics: {
        mttr: 1.5,
        mttd: 15,
        alertReduction: 96,
        automationRate: 100,
        coverageImprovement: 95,
        threatDetectionAccuracy: 94,
      },
      financialMetrics: {
        estimatedCostSavings: 850000,
        roiPercentage: 325,
        efficiencyGains: 25,
        resourceOptimization: 2.5,
        toolConsolidation: 5,
      },
      telemetrySources: ['xdr-agents', 'cloud-connectors', 'network-sensors'],
      quantificationInCVP: true,
      includeInDiscovery: true,
      customTags: ['multi-cloud', 'enterprise', 'fy26-playbook'],
    } as BusinessValueFramework,
    scenarios: [
      { id: 'SCEN-001', type: 'cloud-posture', status: 'validated', provider: 'aws' },
      { id: 'SCEN-002', type: 'insider-threat', status: 'tested', provider: 'azure' },
    ],
  }), [povId]);

  // Mock scenario results (replace with actual from ScenarioDeployment)
  const scenarios = useMemo(() => [
    {
      id: 'SCEN-001',
      scenarioId: 'cloud-posture-aws',
      status: 'complete' as const,
      startTime: new Date('2024-01-15T00:00:00Z'),
      endTime: new Date('2024-01-15T01:30:00Z'),
      provider: 'aws' as const,
      region: 'us-east-1',
      resources: {
        cloudFunctionUrl: 'https://example.com/function',
        logs: [],
      },
      results: {
        validationPassed: true,
        detectionAlerts: [
          { mitreId: 'T1078', technique: 'Valid Accounts' },
          { mitreId: 'T1190', technique: 'Exploit Public-Facing Application' },
        ],
        telemetryData: [],
        performanceMetrics: {},
      },
    },
    {
      id: 'SCEN-002',
      scenarioId: 'insider-threat-azure',
      status: 'complete' as const,
      startTime: new Date('2024-01-16T00:00:00Z'),
      endTime: new Date('2024-01-16T02:00:00Z'),
      provider: 'azure' as const,
      region: 'eastus',
      resources: {
        cloudFunctionUrl: 'https://example.com/function2',
        logs: [],
      },
      results: {
        validationPassed: true,
        detectionAlerts: [
          { mitreId: 'T1078', technique: 'Valid Accounts' },
          { mitreId: 'T1098', technique: 'Account Manipulation' },
        ],
        telemetryData: [],
        performanceMetrics: {},
      },
    },
  ], []);

  // Compute metrics from BVF (not stored separately)
  const metricsView = useMemo(() => {
    if (!pov?.businessValueFramework) return null;
    return computePlaybookMetricsView(pov.businessValueFramework, scenarios);
  }, [pov, scenarios]);

  // Derive TV stage from POV phase
  const tvStage = useMemo(() => {
    if (!pov) return null;
    return deriveTechValidationStage(pov.phase, pov.status);
  }, [pov]);

  const stageDefinition = tvStage ? TV_STAGE_DEFINITIONS[tvStage] : null;

  if (!pov || !metricsView) {
    return (
      <div className="bg-cortex-bg-secondary p-8 rounded-lg text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-cortex-text-primary mb-2">
          No Metrics Available
        </h3>
        <p className="text-cortex-text-secondary">
          POV not found or no Business Value Framework data available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tech Validation Stage Info */}
      {showStageInfo && stageDefinition && (
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-cortex-text-primary mb-1">
                🎯 Tech Validation Stage
              </h3>
              <p className="text-sm text-cortex-text-secondary">
                {stageDefinition.description}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{stageDefinition.name}</div>
              <div className="text-xs text-cortex-text-muted">{stageDefinition.duration}</div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Value Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Operational Excellence */}
        <div className="bg-cortex-bg-secondary p-5 rounded-lg border border-cortex-border/40">
          <h4 className="font-semibold text-cortex-text-primary mb-4 flex items-center space-x-2">
            <span className="text-2xl">⚡</span>
            <span>Operational Excellence</span>
          </h4>
          <div className="space-y-3">
            {metricsView.mttr !== undefined && (
              <div className="flex items-center justify-between p-3 bg-cortex-bg-tertiary rounded">
                <div>
                  <div className="text-xs text-cortex-text-muted">Mean Time to Respond</div>
                  <div className="text-2xl font-bold text-status-success">{metricsView.mttr}m</div>
                </div>
                <div className="text-3xl">🚀</div>
              </div>
            )}

            {metricsView.mttd !== undefined && (
              <div className="flex items-center justify-between p-3 bg-cortex-bg-tertiary rounded">
                <div>
                  <div className="text-xs text-cortex-text-muted">Mean Time to Detect</div>
                  <div className="text-2xl font-bold text-status-success">{metricsView.mttd}m</div>
                </div>
                <div className="text-3xl">🔍</div>
              </div>
            )}

            {metricsView.automationRate !== undefined && (
              <div className="flex items-center justify-between p-3 bg-cortex-bg-tertiary rounded">
                <div>
                  <div className="text-xs text-cortex-text-muted">Automation Rate</div>
                  <div className="text-2xl font-bold text-cortex-primary">
                    {formatPercentage(metricsView.automationRate)}
                  </div>
                </div>
                <div className="text-3xl">🤖</div>
              </div>
            )}

            {metricsView.alertGroupingRatio !== undefined && (
              <div className="flex items-center justify-between p-3 bg-cortex-bg-tertiary rounded">
                <div>
                  <div className="text-xs text-cortex-text-muted">Alert Grouping Ratio</div>
                  <div className="text-2xl font-bold text-cortex-info">
                    {metricsView.alertGroupingRatio.toFixed(1)}:1
                  </div>
                  <div className="text-xs text-cortex-text-muted">
                    {((1 - 1/metricsView.alertGroupingRatio) * 100).toFixed(0)}% reduction
                  </div>
                </div>
                <div className="text-3xl">📉</div>
              </div>
            )}
          </div>
        </div>

        {/* Pillar 2: Security Posture */}
        <div className="bg-cortex-bg-secondary p-5 rounded-lg border border-cortex-border/40">
          <h4 className="font-semibold text-cortex-text-primary mb-4 flex items-center space-x-2">
            <span className="text-2xl">🛡️</span>
            <span>Security Posture</span>
          </h4>
          <div className="space-y-3">
            {metricsView.mitreCoverage !== undefined && (
              <div className="flex items-center justify-between p-3 bg-cortex-bg-tertiary rounded">
                <div>
                  <div className="text-xs text-cortex-text-muted">MITRE ATT&CK Coverage</div>
                  <div className="text-2xl font-bold text-cortex-primary">
                    {formatPercentage(metricsView.mitreCoverage)}
                  </div>
                  <div className="text-xs text-cortex-text-muted">
                    ~{Math.round((metricsView.mitreCoverage / 100) * 200)} techniques
                  </div>
                </div>
                <div className="text-3xl">🎯</div>
              </div>
            )}

            {metricsView.detectionAccuracy !== undefined && (
              <div className="flex items-center justify-between p-3 bg-cortex-bg-tertiary rounded">
                <div>
                  <div className="text-xs text-cortex-text-muted">Detection Accuracy</div>
                  <div className="text-2xl font-bold text-status-success">
                    {formatPercentage(metricsView.detectionAccuracy)}
                  </div>
                </div>
                <div className="text-3xl">✓</div>
              </div>
            )}

            {metricsView.cloudComplianceScore !== undefined && (
              <div className="flex items-center justify-between p-3 bg-cortex-bg-tertiary rounded">
                <div>
                  <div className="text-xs text-cortex-text-muted">Cloud Compliance</div>
                  <div className="text-2xl font-bold text-cortex-info">
                    {formatPercentage(metricsView.cloudComplianceScore)}
                  </div>
                </div>
                <div className="text-3xl">☁️</div>
              </div>
            )}
          </div>
        </div>

        {/* Pillar 3: Cost Optimization */}
        <div className="bg-cortex-bg-secondary p-5 rounded-lg border border-cortex-border/40">
          <h4 className="font-semibold text-cortex-text-primary mb-4 flex items-center space-x-2">
            <span className="text-2xl">💰</span>
            <span>Cost Optimization</span>
          </h4>
          <div className="space-y-3">
            {metricsView.costSavings !== undefined && (
              <div className="flex items-center justify-between p-3 bg-cortex-bg-tertiary rounded">
                <div>
                  <div className="text-xs text-cortex-text-muted">Annual Cost Savings</div>
                  <div className="text-2xl font-bold text-status-success">
                    {formatCurrency(metricsView.costSavings)}
                  </div>
                </div>
                <div className="text-3xl">💵</div>
              </div>
            )}

            {metricsView.toolConsolidation !== undefined && (
              <div className="flex items-center justify-between p-3 bg-cortex-bg-tertiary rounded">
                <div>
                  <div className="text-xs text-cortex-text-muted">Tools Consolidated</div>
                  <div className="text-2xl font-bold text-cortex-warning">
                    {metricsView.toolConsolidation}
                  </div>
                  <div className="text-xs text-cortex-text-muted">
                    Legacy tools replaced
                  </div>
                </div>
                <div className="text-3xl">🔧</div>
              </div>
            )}
          </div>
        </div>

        {/* Pillar 4: Business Growth */}
        <div className="bg-cortex-bg-secondary p-5 rounded-lg border border-cortex-border/40">
          <h4 className="font-semibold text-cortex-text-primary mb-4 flex items-center space-x-2">
            <span className="text-2xl">📈</span>
            <span>Business Growth</span>
          </h4>
          <div className="space-y-3">
            {metricsView.timeToValue && (
              <div className="flex items-center justify-between p-3 bg-cortex-bg-tertiary rounded">
                <div>
                  <div className="text-xs text-cortex-text-muted">Time to Value</div>
                  <div className="text-2xl font-bold text-cortex-primary">
                    {metricsView.timeToValue}
                  </div>
                </div>
                <div className="text-3xl">⏱️</div>
              </div>
            )}

            <div className="p-3 bg-cortex-bg-tertiary rounded">
              <div className="text-xs text-cortex-text-muted mb-2">Business Outcomes</div>
              <div className="space-y-1">
                {pov.businessValueFramework.businessOutcomes.slice(0, 3).map((outcome, index) => (
                  <div key={index} className="flex items-start space-x-2 text-xs">
                    <span className="text-status-success mt-0.5">✓</span>
                    <span className="text-cortex-text-primary">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-cortex-primary/10 to-cortex-primary/5 border border-cortex-primary/30 rounded-lg p-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-cortex-text-muted mb-1">Scenarios Validated</div>
            <div className="text-2xl font-bold text-cortex-primary">
              {scenarios.filter(s => s.status === 'complete').length}
            </div>
          </div>
          <div>
            <div className="text-xs text-cortex-text-muted mb-1">MITRE Techniques</div>
            <div className="text-2xl font-bold text-cortex-info">
              {metricsView.mitreCoverage
                ? Math.round((metricsView.mitreCoverage / 100) * 200)
                : 0}
            </div>
          </div>
          <div>
            <div className="text-xs text-cortex-text-muted mb-1">Automation Rate</div>
            <div className="text-2xl font-bold text-status-success">
              {metricsView.automationRate ? formatPercentage(metricsView.automationRate) : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-xs text-cortex-text-muted mb-1">Annual Savings</div>
            <div className="text-2xl font-bold text-status-success">
              {metricsView.costSavings ? formatCurrency(metricsView.costSavings) : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Attribution */}
      <div className="text-xs text-cortex-text-muted text-center p-3 bg-cortex-bg-tertiary rounded">
        📊 All metrics derived from existing POV Business Value Framework and Scenario Deployment data
        <br />
        No duplicate storage - computed on-demand for Tech Validation Playbook tracking
      </div>
    </div>
  );
};
