/**
 * NICCEE Framework Type Definitions
 *
 * NICCEE = Network, Identity, Cloud Identity Engine, Cloud, Endpoint, Email
 * Standardized framework for XSIAM data ingestion, analytics, and playbook design
 */

export type NICCEELayer =
  | 'network'
  | 'identity'
  | 'cloud-identity-engine'
  | 'cloud'
  | 'endpoint'
  | 'email';

export interface NICCEELayerDefinition {
  id: NICCEELayer;
  name: string;
  icon: string;
  description: string;
  xsiamComponents: string[];
  playbookFunctions: string[];
  businessValueTouchpoints: string[];
  testValidationCases: string[];
  color: string;
  borderColor: string;
  bgColor: string;
}

export interface NICCEEDataSource {
  id: string;
  layer: NICCEELayer;
  name: string;
  type: 'logs' | 'telemetry' | 'api' | 'agent';
  ingestionRate?: string;
  volumeEstimate?: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
}

export interface NICCEEPlaybook {
  id: string;
  name: string;
  description: string;
  triggeredBy: NICCEELayer[];
  zone: 'detection' | 'containment' | 'mitigation' | 'forensics' | 'notification' | 'escalation';
  actions: PlaybookAction[];
  businessValue: string;
  testScenario: string;
  mitreTactics?: string[];
}

export interface PlaybookAction {
  id: string;
  name: string;
  type: 'isolate' | 'block' | 'notify' | 'escalate' | 'collect' | 'remediate';
  targetLayer: NICCEELayer;
  automationLevel: 'manual' | 'semi-auto' | 'full-auto';
  description: string;
}

export interface NICCEEAlert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  sourceLayers: NICCEELayer[];
  title: string;
  description: string;
  correlationId?: string;
  playbookId?: string;
  mitreTechniques?: string[];
  affectedAssets: string[];
  status: 'new' | 'investigating' | 'contained' | 'resolved' | 'false-positive';
}

export interface NICCEECorrelation {
  id: string;
  name: string;
  layers: NICCEELayer[];
  description: string;
  detectionLogic: string;
  businessImpact: string;
  falsePositiveRate: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
}

export interface BusinessValueMetric {
  category: string;
  analyticFeature: string;
  testCase: string;
  expectedOutcome: string;
  businessImpact: 'high' | 'medium' | 'low';
  nicceeLayersInvolved: NICCEELayer[];
}

/**
 * NICCEE Layer Definitions
 */
export const NICCEE_LAYERS: NICCEELayerDefinition[] = [
  {
    id: 'network',
    name: 'Network',
    icon: '🌐',
    description: 'Network infrastructure, firewall logs, NDR, IDS/IPS',
    xsiamComponents: [
      'Firewall logs',
      'Network Detection & Response (NDR)',
      'IDS/IPS telemetry',
      'Flow logs',
      'DNS logs'
    ],
    playbookFunctions: [
      'Network anomaly detection',
      'Lateral movement correlation',
      'DDoS detection',
      'Port scanning alerts'
    ],
    businessValueTouchpoints: [
      'Reduce attack surface',
      'Faster detection of network intrusions',
      'Visibility into east-west traffic'
    ],
    testValidationCases: [
      'Feed normal vs lateral traversal patterns',
      'Simulate DDoS events',
      'Port scan detection validation'
    ],
    color: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 'identity',
    name: 'Identity',
    icon: '👤',
    description: 'AD logs, SAML, MFA, Identity Provider logs',
    xsiamComponents: [
      'Active Directory logs',
      'SAML authentication events',
      'MFA telemetry',
      'Identity Provider logs',
      'Okta/Azure AD integration'
    ],
    playbookFunctions: [
      'Identity analytics',
      'Abnormal login detection',
      'Privilege escalation alerts',
      'Account compromise detection'
    ],
    businessValueTouchpoints: [
      'Detect account compromise early',
      'Enforce Zero Trust principles',
      'Reduce insider threat risk'
    ],
    testValidationCases: [
      'Simulate brute-force attacks',
      'Credential stuffing scenarios',
      'Privilege escalation tests'
    ],
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: 'cloud-identity-engine',
    name: 'Cloud Identity Engine',
    icon: '🔐',
    description: 'IAM APIs, cloud identity services (Azure AD, GCP IAM)',
    xsiamComponents: [
      'Azure AD IAM',
      'GCP IAM',
      'AWS IAM',
      'Cloud role bindings',
      'Service account telemetry'
    ],
    playbookFunctions: [
      'Governance of identity to workload binding',
      'Role drift detection',
      'Overprivileged account alerts',
      'Service account anomalies'
    ],
    businessValueTouchpoints: [
      'Prevent overprivilege',
      'Detect configuration drift',
      'Enforce least privilege'
    ],
    testValidationCases: [
      'Create role drift scenario',
      'Validate overprivilege alerts',
      'Service account misuse detection'
    ],
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-500/10'
  },
  {
    id: 'cloud',
    name: 'Cloud',
    icon: '☁️',
    description: 'Cloud logs (AWS CloudTrail, GCP Audit), config, runtime',
    xsiamComponents: [
      'AWS CloudTrail',
      'GCP Audit Logs',
      'Azure Activity Logs',
      'Cloud configuration data',
      'Runtime telemetry'
    ],
    playbookFunctions: [
      'Cloud misconfiguration detection',
      'Runtime posture monitoring',
      'Resource anomaly detection',
      'Compliance validation'
    ],
    businessValueTouchpoints: [
      'Catch infrastructure misconfigurations',
      'Reduce cloud security risk',
      'Continuous compliance monitoring'
    ],
    testValidationCases: [
      'Misconfigure S3 bucket permissions',
      'Track configuration drift alerts',
      'Validate compliance checks'
    ],
    color: 'text-sky-400',
    borderColor: 'border-sky-500/40',
    bgColor: 'bg-sky-500/10'
  },
  {
    id: 'endpoint',
    name: 'Endpoint',
    icon: '💻',
    description: 'XDR agents, EDR logs, process behavior',
    xsiamComponents: [
      'Cortex XDR agents',
      'EDR logs',
      'Process behavior analytics',
      'File integrity monitoring',
      'USB device tracking'
    ],
    playbookFunctions: [
      'Behavior-based threat detection',
      'Exploit prevention',
      'Ransomware detection',
      'Anomaly detection on endpoints'
    ],
    businessValueTouchpoints: [
      'Prevent endpoint compromise',
      'Enforce automated response',
      'Reduce mean time to detect (MTTD)'
    ],
    testValidationCases: [
      'Run benign/malicious processes',
      'Validate detection accuracy',
      'Test automated containment'
    ],
    color: 'text-green-400',
    borderColor: 'border-green-500/40',
    bgColor: 'bg-green-500/10'
  },
  {
    id: 'email',
    name: 'Email',
    icon: '📧',
    description: 'Email gateways, phishing telemetry, spam detection',
    xsiamComponents: [
      'Email gateway logs',
      'Phishing detection telemetry',
      'Spam filter logs',
      'Attachment sandboxing results',
      'Link analysis'
    ],
    playbookFunctions: [
      'Phishing detection playbooks',
      'Attachment sandboxing',
      'Malicious link blocking',
      'BEC (Business Email Compromise) detection'
    ],
    businessValueTouchpoints: [
      'Reduce phishing risk',
      'Alert priority optimization',
      'Protect executives from BEC'
    ],
    testValidationCases: [
      'Send malicious phishing email',
      'Ensure capture and quarantine',
      'Validate attachment analysis'
    ],
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/40',
    bgColor: 'bg-yellow-500/10'
  }
];

/**
 * Business Value to Test Case Matrix
 */
export const BUSINESS_VALUE_MATRIX: BusinessValueMetric[] = [
  {
    category: 'Faster incident detection',
    analyticFeature: 'Identity + network correlation',
    testCase: 'Inject slow lateral movement over time; validate early detection triggers',
    expectedOutcome: 'Alert generated within 15 minutes of suspicious activity',
    businessImpact: 'high',
    nicceeLayersInvolved: ['identity', 'network']
  },
  {
    category: 'Lower false positives',
    analyticFeature: 'Multi-modal correlation + model tuning',
    testCase: 'Generate noise events (login failures across many accounts); ensure no alert unless meaningful',
    expectedOutcome: 'False positive rate < 5%',
    businessImpact: 'high',
    nicceeLayersInvolved: ['identity', 'network', 'endpoint']
  },
  {
    category: 'Auto-remediation & consistency',
    analyticFeature: 'Automated playbooks',
    testCase: 'Simulate endpoint malware; verify auto-quarantine + evidence collection',
    expectedOutcome: 'Containment action executed within 2 minutes',
    businessImpact: 'high',
    nicceeLayersInvolved: ['endpoint', 'network']
  },
  {
    category: 'Auditability & trust',
    analyticFeature: '"Why" explanation trace',
    testCase: 'Confirm every action has an explanation trail and can be replayed',
    expectedOutcome: 'Complete audit trail with rationale for all automated actions',
    businessImpact: 'medium',
    nicceeLayersInvolved: ['identity', 'cloud', 'endpoint']
  },
  {
    category: 'Scalable model retraining',
    analyticFeature: 'Feedback loop integration',
    testCase: 'Evaluate model drift over fake data epochs',
    expectedOutcome: 'Model accuracy maintained > 95% after retraining',
    businessImpact: 'medium',
    nicceeLayersInvolved: ['network', 'endpoint', 'cloud']
  },
  {
    category: 'Cloud security posture',
    analyticFeature: 'Runtime misconfiguration detection',
    testCase: 'Purposely misconfigure S3 bucket; track alert generation',
    expectedOutcome: 'Alert within 5 minutes of misconfiguration',
    businessImpact: 'high',
    nicceeLayersInvolved: ['cloud', 'cloud-identity-engine']
  },
  {
    category: 'Phishing protection',
    analyticFeature: 'Email + identity correlation',
    testCase: 'Send phishing email with credential harvest; validate detection and user notification',
    expectedOutcome: 'Email quarantined, user notified, credentials reset if compromised',
    businessImpact: 'high',
    nicceeLayersInvolved: ['email', 'identity']
  }
];

/**
 * Sample NICCEE Playbooks
 */
export const SAMPLE_PLAYBOOKS: NICCEEPlaybook[] = [
  {
    id: 'pb-identity-compromise',
    name: 'Identity Compromise Response',
    description: 'Automated response to suspected account compromise',
    triggeredBy: ['identity', 'email'],
    zone: 'containment',
    actions: [
      {
        id: 'act-disable-account',
        name: 'Disable Compromised Account',
        type: 'isolate',
        targetLayer: 'identity',
        automationLevel: 'full-auto',
        description: 'Immediately disable the compromised user account in AD/Azure AD'
      },
      {
        id: 'act-notify-soc',
        name: 'Notify SOC Team',
        type: 'notify',
        targetLayer: 'identity',
        automationLevel: 'full-auto',
        description: 'Send high-priority alert to SOC with user context and timeline'
      },
      {
        id: 'act-collect-logs',
        name: 'Collect Identity Logs',
        type: 'collect',
        targetLayer: 'identity',
        automationLevel: 'full-auto',
        description: 'Gather all authentication logs for the affected user (last 30 days)'
      }
    ],
    businessValue: 'Prevent unauthorized access, reduce dwell time from hours to minutes',
    testScenario: 'Simulate credential stuffing attack followed by successful login from new geo-location',
    mitreTactics: ['TA0001', 'TA0006'] // Initial Access, Credential Access
  },
  {
    id: 'pb-lateral-movement',
    name: 'Lateral Movement Detection & Response',
    description: 'Detect and contain lateral movement across network',
    triggeredBy: ['network', 'identity', 'endpoint'],
    zone: 'detection',
    actions: [
      {
        id: 'act-isolate-host',
        name: 'Isolate Affected Host',
        type: 'isolate',
        targetLayer: 'endpoint',
        automationLevel: 'semi-auto',
        description: 'Network isolate the endpoint showing lateral movement behavior'
      },
      {
        id: 'act-block-traffic',
        name: 'Block Suspicious Traffic',
        type: 'block',
        targetLayer: 'network',
        automationLevel: 'full-auto',
        description: 'Block traffic patterns matching lateral movement signatures'
      },
      {
        id: 'act-escalate-to-analyst',
        name: 'Escalate to Tier 2 Analyst',
        type: 'escalate',
        targetLayer: 'network',
        automationLevel: 'full-auto',
        description: 'Create incident ticket with full context for manual investigation'
      }
    ],
    businessValue: 'Prevent ransomware spread, protect critical assets',
    testScenario: 'Inject slow lateral movement using PSExec over 48 hours; validate early detection',
    mitreTactics: ['TA0008'] // Lateral Movement
  },
  {
    id: 'pb-cloud-misconfig',
    name: 'Cloud Misconfiguration Remediation',
    description: 'Detect and auto-remediate cloud misconfigurations',
    triggeredBy: ['cloud', 'cloud-identity-engine'],
    zone: 'mitigation',
    actions: [
      {
        id: 'act-remediate-s3',
        name: 'Fix S3 Bucket Permissions',
        type: 'remediate',
        targetLayer: 'cloud',
        automationLevel: 'semi-auto',
        description: 'Automatically apply least-privilege policy to public S3 buckets'
      },
      {
        id: 'act-notify-devops',
        name: 'Notify DevOps Team',
        type: 'notify',
        targetLayer: 'cloud',
        automationLevel: 'full-auto',
        description: 'Alert DevOps with specific bucket and policy violation details'
      }
    ],
    businessValue: 'Prevent data exposure, maintain compliance (GDPR, HIPAA)',
    testScenario: 'Create publicly accessible S3 bucket with sensitive data tags; validate alert and remediation',
    mitreTactics: ['TA0005'] // Defense Evasion
  },
  {
    id: 'pb-ransomware-prevention',
    name: 'Ransomware Prevention & Containment',
    description: 'Detect ransomware behavior and prevent encryption',
    triggeredBy: ['endpoint', 'network'],
    zone: 'containment',
    actions: [
      {
        id: 'act-kill-process',
        name: 'Terminate Malicious Process',
        type: 'isolate',
        targetLayer: 'endpoint',
        automationLevel: 'full-auto',
        description: 'Kill process exhibiting ransomware-like file encryption behavior'
      },
      {
        id: 'act-quarantine-endpoint',
        name: 'Quarantine Endpoint',
        type: 'isolate',
        targetLayer: 'endpoint',
        automationLevel: 'full-auto',
        description: 'Network isolate endpoint to prevent spread'
      },
      {
        id: 'act-backup-restore',
        name: 'Initiate Backup Restore',
        type: 'remediate',
        targetLayer: 'endpoint',
        automationLevel: 'manual',
        description: 'Provide analyst with backup restore options for affected files'
      }
    ],
    businessValue: 'Prevent business disruption, protect revenue-critical systems',
    testScenario: 'Run controlled ransomware simulator; validate detection within 60 seconds',
    mitreTactics: ['TA0040'] // Impact
  }
];

/**
 * Helper function to get layer definition by ID
 */
export function getNICCEELayer(layerId: NICCEELayer): NICCEELayerDefinition | undefined {
  return NICCEE_LAYERS.find(layer => layer.id === layerId);
}

/**
 * Helper function to get playbooks by layer
 */
export function getPlaybooksByLayer(layerId: NICCEELayer): NICCEEPlaybook[] {
  return SAMPLE_PLAYBOOKS.filter(playbook =>
    playbook.triggeredBy.includes(layerId)
  );
}

/**
 * Helper function to get business value metrics by layer
 */
export function getBusinessValueByLayer(layerId: NICCEELayer): BusinessValueMetric[] {
  return BUSINESS_VALUE_MATRIX.filter(metric =>
    metric.nicceeLayersInvolved.includes(layerId)
  );
}
