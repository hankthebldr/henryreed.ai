/**
 * Business Value Framework (BVF) Types
 * Standardized metadata for POV/Engagement records aligned with business outcomes
 */

export type ExecutiveObjective =
  | 'improve-security-posture-compliance'
  | 'reduce-operational-costs'
  | 'accelerate-threat-response'
  | 'enable-digital-transformation'
  | 'optimize-security-operations'
  | 'ensure-business-continuity';

export type FunctionalObjective =
  | '1a-secure-network-infrastructure'
  | '1b-protect-endpoints-workloads'
  | '1c-safeguard-cloud-environments'
  | '1d-defend-critical-applications'
  | '2a-optimize-threat-detection-containment'
  | '2b-streamline-incident-response'
  | '2c-automate-security-workflows'
  | '2d-enhance-threat-intelligence'
  | '3a-achieve-regulatory-compliance'
  | '3b-implement-zero-trust-architecture'
  | '3c-strengthen-identity-access-management'
  | '3d-improve-data-governance';

export type UseCaseCategory =
  | 'threat-detection'
  | 'incident-response'
  | 'compliance-governance'
  | 'cloud-security'
  | 'endpoint-protection'
  | 'network-security'
  | 'application-security'
  | 'identity-access-management'
  | 'data-protection'
  | 'security-automation'
  | 'threat-intelligence'
  | 'vulnerability-management';

export type BusinessChallenge =
  | 'alert-fatigue-noise'
  | 'fragmented-security-tools'
  | 'slow-incident-response'
  | 'limited-threat-visibility'
  | 'compliance-gaps'
  | 'resource-constraints'
  | 'cloud-complexity'
  | 'advanced-persistent-threats'
  | 'insider-threats'
  | 'ransomware-exposure'
  | 'supply-chain-risks'
  | 'legacy-infrastructure';

export type CapabilityDemonstrated =
  | 'unified-detection-response'
  | 'automated-investigation'
  | 'threat-correlation'
  | 'behavioral-analytics'
  | 'attack-surface-management'
  | 'security-orchestration'
  | 'compliance-reporting'
  | 'forensic-analysis'
  | 'threat-hunting'
  | 'vulnerability-prioritization'
  | 'cloud-workload-protection'
  | 'network-traffic-analysis';

export type TelemetrySource =
  | 'xdr-agents'
  | 'network-sensors'
  | 'cloud-connectors'
  | 'siem-integration'
  | 'firewall-logs'
  | 'endpoint-telemetry'
  | 'identity-providers'
  | 'application-logs'
  | 'threat-feeds'
  | 'vulnerability-scanners'
  | 'container-security'
  | 'email-security';

export interface OperationalMetrics {
  mttr?: number; // Mean Time to Respond (minutes)
  mttd?: number; // Mean Time to Detect (minutes)
  alertReduction?: number; // Percentage
  automationRate?: number; // Percentage
  coverageImprovement?: number; // Percentage
  investigationEfficiency?: number; // Percentage
  threatDetectionAccuracy?: number; // Percentage
  falsePositiveReduction?: number; // Percentage
}

export interface FinancialMetrics {
  estimatedCostSavings?: number; // Annual in USD
  roiPercentage?: number;
  efficiencyGains?: number; // Hours saved per week
  resourceOptimization?: number; // FTE reduction
  riskMitigation?: number; // Estimated cost avoidance
  toolConsolidation?: number; // Number of tools replaced
}

export interface BusinessValueFramework {
  // Core BVF Fields
  executiveObjective: ExecutiveObjective[];
  functionalObjective: FunctionalObjective[];
  useCaseCategories: UseCaseCategory[];
  challenges: BusinessChallenge[];
  capabilitiesDemonstrated: CapabilityDemonstrated[];

  // Outcomes & Metrics
  businessOutcomes: string[]; // Free text outcomes
  operationalMetrics: OperationalMetrics;
  financialMetrics: FinancialMetrics;

  // Technical Details
  telemetrySources: TelemetrySource[];
  productTelemetryData?: string; // Detailed telemetry description

  // Engagement Metadata
  quantificationInCVP: boolean; // Customer Value Proposition
  includeInDiscovery: boolean;
  customTags?: string[]; // Additional free-form tags

  // Supporting Information
  supportingDocs?: string[]; // Links, file references, Jira IDs
  notes?: string;
}

// BVF Label Mappings
export const EXECUTIVE_OBJECTIVES: Record<ExecutiveObjective, string> = {
  'improve-security-posture-compliance': 'Improve Overall Security Posture and Ensure Compliance',
  'reduce-operational-costs': 'Reduce Operational Costs and Complexity',
  'accelerate-threat-response': 'Accelerate Threat Detection and Response',
  'enable-digital-transformation': 'Enable Secure Digital Transformation',
  'optimize-security-operations': 'Optimize Security Operations and Efficiency',
  'ensure-business-continuity': 'Ensure Business Continuity and Resilience',
};

export const FUNCTIONAL_OBJECTIVES: Record<FunctionalObjective, string> = {
  '1a-secure-network-infrastructure': '1a) Secure Network Infrastructure',
  '1b-protect-endpoints-workloads': '1b) Protect Endpoints and Workloads',
  '1c-safeguard-cloud-environments': '1c) Safeguard Cloud Environments',
  '1d-defend-critical-applications': '1d) Defend Critical Applications',
  '2a-optimize-threat-detection-containment': '2a) Optimize Threat Detection & Containment',
  '2b-streamline-incident-response': '2b) Streamline Incident Response',
  '2c-automate-security-workflows': '2c) Automate Security Workflows',
  '2d-enhance-threat-intelligence': '2d) Enhance Threat Intelligence',
  '3a-achieve-regulatory-compliance': '3a) Achieve Regulatory Compliance',
  '3b-implement-zero-trust-architecture': '3b) Implement Zero Trust Architecture',
  '3c-strengthen-identity-access-management': '3c) Strengthen Identity & Access Management',
  '3d-improve-data-governance': '3d) Improve Data Governance',
};

export const USE_CASE_CATEGORIES: Record<UseCaseCategory, string> = {
  'threat-detection': 'Threat Detection',
  'incident-response': 'Incident Response',
  'compliance-governance': 'Compliance & Governance',
  'cloud-security': 'Cloud Security',
  'endpoint-protection': 'Endpoint Protection',
  'network-security': 'Network Security',
  'application-security': 'Application Security',
  'identity-access-management': 'Identity & Access Management',
  'data-protection': 'Data Protection',
  'security-automation': 'Security Automation',
  'threat-intelligence': 'Threat Intelligence',
  'vulnerability-management': 'Vulnerability Management',
};

export const BUSINESS_CHALLENGES: Record<BusinessChallenge, string> = {
  'alert-fatigue-noise': 'Alert Fatigue & Noise',
  'fragmented-security-tools': 'Fragmented Security Tools',
  'slow-incident-response': 'Slow Incident Response',
  'limited-threat-visibility': 'Limited Threat Visibility',
  'compliance-gaps': 'Compliance Gaps',
  'resource-constraints': 'Resource Constraints',
  'cloud-complexity': 'Cloud Complexity',
  'advanced-persistent-threats': 'Advanced Persistent Threats',
  'insider-threats': 'Insider Threats',
  'ransomware-exposure': 'Ransomware Exposure',
  'supply-chain-risks': 'Supply Chain Risks',
  'legacy-infrastructure': 'Legacy Infrastructure',
};

export const CAPABILITIES_DEMONSTRATED: Record<CapabilityDemonstrated, string> = {
  'unified-detection-response': 'Unified Detection & Response',
  'automated-investigation': 'Automated Investigation',
  'threat-correlation': 'Threat Correlation',
  'behavioral-analytics': 'Behavioral Analytics',
  'attack-surface-management': 'Attack Surface Management',
  'security-orchestration': 'Security Orchestration',
  'compliance-reporting': 'Compliance Reporting',
  'forensic-analysis': 'Forensic Analysis',
  'threat-hunting': 'Threat Hunting',
  'vulnerability-prioritization': 'Vulnerability Prioritization',
  'cloud-workload-protection': 'Cloud Workload Protection',
  'network-traffic-analysis': 'Network Traffic Analysis',
};

export const TELEMETRY_SOURCES: Record<TelemetrySource, string> = {
  'xdr-agents': 'XDR Agents',
  'network-sensors': 'Network Sensors',
  'cloud-connectors': 'Cloud Connectors',
  'siem-integration': 'SIEM Integration',
  'firewall-logs': 'Firewall Logs',
  'endpoint-telemetry': 'Endpoint Telemetry',
  'identity-providers': 'Identity Providers',
  'application-logs': 'Application Logs',
  'threat-feeds': 'Threat Feeds',
  'vulnerability-scanners': 'Vulnerability Scanners',
  'container-security': 'Container Security',
  'email-security': 'Email Security',
};

// Helper function to calculate business value score
export function calculateBusinessValueScore(bvf: BusinessValueFramework): number {
  let score = 0;

  // Executive objectives (20 points max)
  score += Math.min(bvf.executiveObjective.length * 5, 20);

  // Functional objectives (20 points max)
  score += Math.min(bvf.functionalObjective.length * 4, 20);

  // Capabilities demonstrated (20 points max)
  score += Math.min(bvf.capabilitiesDemonstrated.length * 3, 20);

  // Operational metrics (20 points max)
  const metrics = bvf.operationalMetrics;
  const metricCount = Object.keys(metrics).filter(k => metrics[k as keyof OperationalMetrics] !== undefined).length;
  score += Math.min(metricCount * 3, 20);

  // Financial metrics (20 points max)
  const financial = bvf.financialMetrics;
  const financialCount = Object.keys(financial).filter(k => financial[k as keyof FinancialMetrics] !== undefined).length;
  score += Math.min(financialCount * 4, 20);

  return Math.round(score);
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper function to format percentage
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
