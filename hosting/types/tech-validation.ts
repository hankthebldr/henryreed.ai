/**
 * Tech Validation Playbook Integration
 *
 * Lightweight integration layer that leverages existing POV, TRR, and BVF structures.
 * Does NOT duplicate metrics - aggregates them from existing data sources.
 */

import { BusinessValueFramework, OperationalMetrics, FinancialMetrics } from './business-value-framework';
import { ScenarioDeployment } from '../lib/scenario-types';

/**
 * Tech Validation Status (maps to FY26 Playbook stages)
 * These are VIEW states, not storage states - derived from underlying POV/TRR status
 */
export type TechValidationStage =
  | 'tv-stage-0-1'    // Discovery & Alignment
  | 'tv-stage-2'      // Non-POV Validation
  | 'tv-stage-3'      // POV Planning
  | 'tv-stage-4'      // POV Execution (CORE)
  | 'tv-stage-7'      // Tech Win
  | 'tv-stage-8';     // DC Close Out

/**
 * Playbook Scenario Mapping
 * Maps FY26 Playbook scenarios (Gambit, Turla, CDR) to existing scenario types
 */
export type PlaybookScenarioType =
  | 'cortex-gambit'      // Syslog ingestion (maps to existing scenarios)
  | 'cortex-turla'       // MITRE ATT&CK (maps to apt-simulation, evasion-techniques)
  | 'cortex-cdr'         // Code-to-Cloud (maps to container-vuln, cloud-posture)
  | 'byos';              // Custom scenarios

export interface PlaybookScenarioMapping {
  playbookType: PlaybookScenarioType;
  underlyingScenarios: string[];  // Maps to existing ScenarioDeployment IDs
  guide: string;                  // Link to scenario guide
  estimatedDuration: string;
}

/**
 * Tech Validation Context
 * Lightweight wrapper around existing POV that adds playbook tracking
 */
export interface TechValidationContext {
  // Link to existing POV (source of truth)
  povId: string;

  // Playbook tracking (view layer only)
  currentStage: TechValidationStage;
  stageHistory: TechValidationStageTransition[];

  // Playbook scenario tracking (maps to existing ScenarioDeployments)
  playbookScenarios: PlaybookScenarioMapping[];

  // Asana integration (external system)
  asanaProjectId?: string;
  asanaLastSync?: string;

  // Metrics are DERIVED from underlying POV's Business Value Framework
  // No duplication - just references
  metricsSource: 'derived-from-pov-bvf';

  // Readout generation tracking
  readoutGenerated?: string;  // ISO date when readout was generated
  readoutUrl?: string;        // Link to generated PDF/document

  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Stage Transition Tracking
 * Records when stages change (audit trail)
 */
export interface TechValidationStageTransition {
  fromStage: TechValidationStage | null;
  toStage: TechValidationStage;
  timestamp: string;
  triggeredBy: string;  // User email
  notes?: string;
}

/**
 * Playbook Metrics View
 * COMPUTED from existing POV Business Value Framework
 * This is NOT stored separately - it's a view/aggregation
 */
export interface PlaybookMetricsView {
  // Operational Excellence (from BVF OperationalMetrics)
  alertGroupingRatio?: number;      // DERIVED: Can be computed from scenario results
  automationRate?: number;          // FROM: BVF.operationalMetrics.automationRate
  mttr?: number;                    // FROM: BVF.operationalMetrics.mttr
  mttd?: number;                    // FROM: BVF.operationalMetrics.mttd

  // Security Posture (from BVF OperationalMetrics)
  mitreCoverage?: number;           // DERIVED: From scenario detection results
  detectionAccuracy?: number;       // FROM: BVF.operationalMetrics.threatDetectionAccuracy

  // Cost Optimization (from BVF FinancialMetrics)
  toolConsolidation?: number;       // FROM: BVF.financialMetrics.toolConsolidation
  costSavings?: number;             // FROM: BVF.financialMetrics.estimatedCostSavings

  // Business Growth
  timeToValue?: string;             // DERIVED: From POV timeline
  cloudComplianceScore?: number;    // DERIVED: From cloud-posture scenarios
}

/**
 * Playbook Readout Data
 * Aggregates data from multiple sources for report generation
 */
export interface PlaybookReadoutData {
  povId: string;
  tvContext: TechValidationContext;

  // Data sources (all existing)
  businessValueFramework: BusinessValueFramework;  // FROM POV
  scenarioResults: ScenarioDeployment[];          // FROM existing scenario deployments

  // Computed metrics view
  metricsView: PlaybookMetricsView;

  // Narrative sections (generated from data)
  executiveSummary?: string;
  businessOutcomes?: string[];
  technicalFindings?: string[];
  recommendations?: string[];

  // Supporting artifacts
  mitreExportUrl?: string;          // Link to MITRE dashboard export
  secOpsMetricsUrl?: string;        // Link to SecOps metrics dashboard

  generatedAt: string;
}

/**
 * Helper: Derive TV stage from POV phase and status
 */
export function deriveTechValidationStage(
  povPhase: string,
  povStatus: string
): TechValidationStage {
  // Map POV phase to TV stage
  switch (povPhase) {
    case 'discovery':
      return 'tv-stage-0-1';
    case 'design':
      return 'tv-stage-2';
    case 'deployment':
      return 'tv-stage-3';
    case 'validation':
    case 'demonstration':
      return 'tv-stage-4';  // Core execution stage
    case 'closure':
      return povStatus === 'completed' ? 'tv-stage-7' : 'tv-stage-8';
    default:
      return 'tv-stage-3';  // Default to planning
  }
}

/**
 * Helper: Compute metrics view from BVF
 */
export function computePlaybookMetricsView(
  bvf: BusinessValueFramework,
  scenarios: ScenarioDeployment[]
): PlaybookMetricsView {
  return {
    // From BVF operational metrics
    automationRate: bvf.operationalMetrics.automationRate,
    mttr: bvf.operationalMetrics.mttr,
    mttd: bvf.operationalMetrics.mttd,
    detectionAccuracy: bvf.operationalMetrics.threatDetectionAccuracy,

    // From BVF financial metrics
    toolConsolidation: bvf.financialMetrics.toolConsolidation,
    costSavings: bvf.financialMetrics.estimatedCostSavings,

    // Computed from scenarios
    alertGroupingRatio: computeAlertGroupingRatio(scenarios),
    mitreCoverage: computeMitreCoverage(scenarios),

    // Placeholder for cloud compliance (can be computed from cloud-posture scenarios)
    cloudComplianceScore: computeCloudCompliance(scenarios),
  };
}

/**
 * Helper: Compute alert grouping ratio from scenario results
 */
function computeAlertGroupingRatio(scenarios: ScenarioDeployment[]): number | undefined {
  // Find scenarios with alert data
  const scenariosWithAlerts = scenarios.filter(s =>
    s.results?.detectionAlerts && Array.isArray(s.results.detectionAlerts)
  );

  if (scenariosWithAlerts.length === 0) return undefined;

  // Sum total alerts across scenarios
  const totalAlerts = scenariosWithAlerts.reduce((sum, s) =>
    sum + (s.results?.detectionAlerts?.length || 0), 0
  );

  // For now, assume scenarios group alerts well (this would come from actual XSIAM data)
  // Real implementation would query XSIAM incidents API
  return totalAlerts > 0 ? totalAlerts / Math.max(1, scenariosWithAlerts.length) : undefined;
}

/**
 * Helper: Compute MITRE coverage from scenario detections
 */
function computeMitreCoverage(scenarios: ScenarioDeployment[]): number | undefined {
  // Real implementation would parse MITRE techniques from scenario detections
  // For now, return placeholder
  const scenariosWithDetections = scenarios.filter(s =>
    s.results?.detectionAlerts && s.results.detectionAlerts.length > 0
  );

  if (scenariosWithDetections.length === 0) return undefined;

  // Placeholder: assume each validated scenario covers ~15-20 techniques
  const estimatedTechniques = scenariosWithDetections.length * 17.5;

  // MITRE ATT&CK has ~200 techniques in common use
  return Math.min(100, (estimatedTechniques / 200) * 100);
}

/**
 * Helper: Compute cloud compliance score from cloud-posture scenarios
 */
function computeCloudCompliance(scenarios: ScenarioDeployment[]): number | undefined {
  const cloudScenarios = scenarios.filter(s =>
    s.scenarioId.includes('cloud-posture') && s.status === 'complete'
  );

  if (cloudScenarios.length === 0) return undefined;

  // Real implementation would aggregate compliance findings
  // Placeholder: return average validation pass rate
  return 85;  // Placeholder
}

/**
 * Playbook Scenario Templates
 * Maps FY26 playbook scenarios to existing scenario library
 */
export const PLAYBOOK_SCENARIO_TEMPLATES: Record<PlaybookScenarioType, {
  name: string;
  description: string;
  underlyingScenarioTypes: string[];  // Maps to existing ScenarioType
  guideUrl: string;
  expectedMetrics: {
    mttr?: string;
    automationRate?: string;
    alertReduction?: string;
    mitreTechniques?: number;
  };
}> = {
  'cortex-gambit': {
    name: 'Cortex Gambit - Syslog Ingestion',
    description: 'Demonstrate 3rd party syslog data ingestion and analytics',
    underlyingScenarioTypes: ['custom'],  // Syslog ingestion is typically custom
    guideUrl: '/scenario-guide#cortex-gambit',
    expectedMetrics: {
      mttr: '<2 minutes',
      automationRate: '>60%',
      alertReduction: 'N/A (ingestion focus)',
    }
  },
  'cortex-turla': {
    name: 'Cortex Turla - MITRE ATT&CK Evaluation',
    description: 'BYOS attack simulation using Turla Carbon framework',
    underlyingScenarioTypes: ['apt-simulation', 'evasion-techniques', 'lateral-movement-sim'],
    guideUrl: '/scenario-guide#cortex-turla',
    expectedMetrics: {
      mttr: '<5 minutes',
      automationRate: '>70%',
      alertReduction: '>75% (grouping)',
      mitreTechniques: 15,
    }
  },
  'cortex-cdr': {
    name: 'Cortex CDR - Code-to-Cloud-to-SOC',
    description: 'Cloud detection and response from code scanning to runtime',
    underlyingScenarioTypes: ['container-vuln', 'cloud-posture', 'code-vuln'],
    guideUrl: '/scenario-guide#cortex-cdr',
    expectedMetrics: {
      mttr: '<10 minutes',
      automationRate: '>85%',
      alertReduction: 'N/A (cloud focus)',
      mitreTechniques: 8,
    }
  },
  'byos': {
    name: 'BYOS - Bring Your Own Scenario',
    description: 'Custom customer-specific attack simulations',
    underlyingScenarioTypes: ['custom'],
    guideUrl: '/scenario-guide#byos',
    expectedMetrics: {
      mttr: 'Variable',
      automationRate: 'Variable',
      alertReduction: 'Variable',
    }
  }
};

/**
 * Stage Definitions
 * Maps TV stages to playbook activities and deliverables
 */
export const TV_STAGE_DEFINITIONS: Record<TechValidationStage, {
  name: string;
  description: string;
  duration: string;
  keyActivities: string[];
  deliverables: string[];
  exitCriteria: string[];
}> = {
  'tv-stage-0-1': {
    name: 'Discovery & Alignment',
    description: 'Opportunity alignment and technical discovery',
    duration: '1-2 weeks',
    keyActivities: [
      'Executive engagement',
      'Discovery workshop',
      'Business value definition',
      'SOC team commitment',
    ],
    deliverables: [
      'Business Value Framework',
      'Use Case Mapping',
      'Success Criteria',
    ],
    exitCriteria: [
      'Executive sponsorship secured',
      'SOC team engaged',
      'Business value defined',
    ],
  },
  'tv-stage-2': {
    name: 'Non-POV Technical Validation',
    description: 'Pre-POV validation through demos and workshops',
    duration: '1-2 weeks',
    keyActivities: [
      'Targeted demos',
      'Executive briefings',
      'Hands-on workshops',
    ],
    deliverables: [
      'Technical capability validation',
      'Stakeholder buy-in',
    ],
    exitCriteria: [
      'Decision to proceed with full POV',
    ],
  },
  'tv-stage-3': {
    name: 'POV Planning',
    description: 'POV test plan and logistics setup',
    duration: '1 week',
    keyActivities: [
      'Test plan creation',
      'Logistics setup',
      'Scenario selection',
      'Day One configuration',
    ],
    deliverables: [
      'POV Test Plan',
      'Schedule',
      'Success Metrics',
      'XSIAM Tenant Configuration',
    ],
    exitCriteria: [
      'Internal POV huddle complete',
      'Customer CSP access granted',
    ],
  },
  'tv-stage-4': {
    name: 'POV Technical Validation & Execution',
    description: 'Core POV execution with hands-on testing',
    duration: '2-4 weeks',
    keyActivities: [
      'Scenario deployment',
      'Hands-on testing',
      'Data ingestion',
      'Metric capture',
    ],
    deliverables: [
      'Validated scenarios',
      'Performance metrics',
      'MITRE coverage dashboard',
    ],
    exitCriteria: [
      'All success criteria met',
      'Evidence captured',
    ],
  },
  'tv-stage-7': {
    name: 'Tech Win - Closed',
    description: 'POV readout and business case presentation',
    duration: '3-5 days',
    keyActivities: [
      'POV readout generation',
      'Business outcomes mapping',
      'MITRE dashboard export',
    ],
    deliverables: [
      'Executive Readout',
      'Technical Report',
      'Business Case',
    ],
    exitCriteria: [
      'Customer acceptance',
      'Technical win confirmed',
    ],
  },
  'tv-stage-8': {
    name: 'DC Close Out',
    description: 'PS handoff and final documentation',
    duration: '1 week',
    keyActivities: [
      'SDW/DOR finalization',
      'PS handoff',
      'Badass Blueprint generation',
    ],
    deliverables: [
      'Design of Record',
      'Badass Blueprint',
      'Lessons Learned',
    ],
    exitCriteria: [
      'Clean handoff to PS/CSM',
    ],
  },
};
