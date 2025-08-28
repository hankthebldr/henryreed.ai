// Scenario Management System for POV-CLI
// Based on security assessment and deployment scenarios

export type ScenarioType = 
  | 'cloud-posture' 
  | 'container-vuln' 
  | 'code-vuln' 
  | 'insider-threat' 
  | 'ransomware' 
  | 'waas-exploit' 
  | 'ai-threat' 
  | 'pipeline-breach' 
  | 'identity-compromise'
  | 'lateral-movement-sim'
  | 'data-exfil-behavior'
  | 'beacon-emulation'
  | 'phishing-sim'
  | 'custom';

export type Provider = 'aws' | 'gcp' | 'azure' | 'k8s' | 'local';
export type Pipeline = 'ci' | 'gitlab' | 'github';

export interface ScenarioConfig {
  id: string;
  name: string;
  type: ScenarioType;
  description: string;
  provider: Provider;
  region?: string;
  template?: string;
  estimatedDuration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  resources: {
    compute?: string;
    storage?: string;
    network?: string;
  };
}

export interface ScenarioManifest {
  metadata: {
    name: string;
    version: string;
    author: string;
    created: string;
    description: string;
  };
  scenario: ScenarioConfig;
  deployment: {
    infrastructure: string[];
    dependencies: string[];
    environment: Record<string, string>;
  };
  validation: {
    tests: string[];
    expectedResults: string[];
    detectionRules: string[];
  };
  cleanup: {
    autoDestroy: boolean;
    retentionPeriod: string;
    preserveData: string[];
  };
}

export interface ScenarioDeployment {
  id: string;
  scenarioId: string;
  status: 'pending' | 'deploying' | 'running' | 'validating' | 'complete' | 'failed' | 'destroying';
  startTime: Date;
  endTime?: Date;
  provider: Provider;
  region: string;
  resources: {
    cloudFunctionUrl?: string;
    storageUrl?: string;
    logs?: string[];
  };
  results?: {
    validationPassed: boolean;
    detectionAlerts: any[];
    telemetryData: any[];
    performanceMetrics: any;
  };
}

export const SCENARIO_TEMPLATES: Record<ScenarioType, ScenarioConfig[]> = {
  'cloud-posture': [
    {
      id: 'cp-misconfigured-s3',
      name: 'Misconfigured S3 Bucket Detection',
      type: 'cloud-posture',
      description: 'Deploy intentionally misconfigured cloud storage to test CSPM detection capabilities',
      provider: 'gcp',
      region: 'us-central1',
      template: 'cloud-storage-misconfig',
      estimatedDuration: '15-30 minutes',
      difficulty: 'beginner',
      tags: ['storage', 'permissions', 'cspm', 'compliance'],
      resources: {
        storage: 'Cloud Storage bucket',
        compute: 'Cloud Function for testing'
      }
    },
    {
      id: 'cp-excessive-permissions',
      name: 'Over-Privileged IAM Roles',
      type: 'cloud-posture',
      description: 'Create service accounts with excessive permissions to demonstrate privilege escalation risks',
      provider: 'gcp',
      region: 'us-central1',
      template: 'iam-overprivileged',
      estimatedDuration: '20-40 minutes',
      difficulty: 'intermediate',
      tags: ['iam', 'permissions', 'privilege-escalation', 'rbac'],
      resources: {
        compute: 'Cloud Functions with various IAM roles'
      }
    }
  ],
  'container-vuln': [
    {
      id: 'cv-vulnerable-base-image',
      name: 'Vulnerable Container Base Images',
      type: 'container-vuln',
      description: 'Deploy containers with known vulnerabilities to test scanning and runtime protection',
      provider: 'gcp',
      region: 'us-central1',
      template: 'vulnerable-containers',
      estimatedDuration: '25-45 minutes',
      difficulty: 'intermediate',
      tags: ['containers', 'vulnerability-scanning', 'runtime-protection', 'docker'],
      resources: {
        compute: 'Cloud Run containers',
        storage: 'Container Registry'
      }
    }
  ],
  'code-vuln': [
    {
      id: 'cv-sql-injection',
      name: 'SQL Injection Vulnerabilities',
      type: 'code-vuln',
      description: 'Deploy web application with SQL injection vulnerabilities for SAST/DAST testing',
      provider: 'gcp',
      region: 'us-central1',
      template: 'sql-injection-app',
      estimatedDuration: '30-60 minutes',
      difficulty: 'intermediate',
      tags: ['web-security', 'sql-injection', 'sast', 'dast'],
      resources: {
        compute: 'Cloud Run web application',
        storage: 'Cloud SQL database'
      }
    }
  ],
  'insider-threat': [
    {
      id: 'it-data-exfiltration',
      name: 'Insider Data Exfiltration',
      type: 'insider-threat',
      description: 'Simulate insider threat behavior including lateral movement and data exfiltration',
      provider: 'gcp',
      region: 'us-central1',
      template: 'insider-threat-sim',
      estimatedDuration: '45-90 minutes',
      difficulty: 'advanced',
      tags: ['insider-threat', 'data-exfiltration', 'lateral-movement', 'ueba'],
      resources: {
        compute: 'Multiple Cloud Functions simulating user behavior',
        storage: 'Data repositories and logs'
      }
    }
  ],
  'ransomware': [
    {
      id: 'rw-encryption-simulation',
      name: 'Ransomware Encryption Patterns',
      type: 'ransomware',
      description: 'Simulate ransomware encryption patterns and staging behaviors (safe simulation)',
      provider: 'gcp',
      region: 'us-central1',
      template: 'ransomware-staging',
      estimatedDuration: '30-60 minutes',
      difficulty: 'advanced',
      tags: ['ransomware', 'encryption', 'behavioral-analysis', 'edr'],
      resources: {
        compute: 'Cloud Functions simulating encryption behavior',
        storage: 'Test data for encryption simulation'
      }
    }
  ],
  'waas-exploit': [
    {
      id: 'we-owasp-top10',
      name: 'OWASP Top 10 Vulnerabilities',
      type: 'waas-exploit',
      description: 'Deploy web application with OWASP Top 10 vulnerabilities for WAF testing',
      provider: 'gcp',
      region: 'us-central1',
      template: 'owasp-vulnerable-app',
      estimatedDuration: '60-120 minutes',
      difficulty: 'expert',
      tags: ['web-security', 'owasp', 'waf', 'application-security'],
      resources: {
        compute: 'Cloud Run application with load balancer',
        storage: 'Database and file storage',
        network: 'Cloud Armor WAF configuration'
      }
    }
  ],
  'ai-threat': [
    {
      id: 'ai-prompt-injection',
      name: 'LLM Prompt Injection Attacks',
      type: 'ai-threat',
      description: 'Deploy LLM application vulnerable to prompt injection and test AI security controls',
      provider: 'gcp',
      region: 'us-central1',
      template: 'llm-prompt-injection',
      estimatedDuration: '45-75 minutes',
      difficulty: 'advanced',
      tags: ['ai-security', 'llm', 'prompt-injection', 'ai-red-team'],
      resources: {
        compute: 'Cloud Functions with LLM integration',
        storage: 'AI model artifacts'
      }
    }
  ],
  'pipeline-breach': [
    {
      id: 'pb-cicd-injection',
      name: 'CI/CD Pipeline Injection',
      type: 'pipeline-breach',
      description: 'Simulate CI/CD pipeline compromise and injection attacks',
      provider: 'gcp',
      region: 'us-central1',
      template: 'cicd-injection',
      estimatedDuration: '60-90 minutes',
      difficulty: 'expert',
      tags: ['cicd', 'pipeline-security', 'supply-chain', 'devsecops'],
      resources: {
        compute: 'Cloud Build pipelines and functions',
        storage: 'Source repositories and artifacts'
      }
    }
  ],
'identity-compromise': [
    {
      id: 'idc-credential-misuse',
      name: 'Credential Misuse Simulation',
      type: 'identity-compromise',
      description: 'Simulate credential misuse and anomalous sign-in behavior (safe, synthetic telemetry).',
      provider: 'gcp',
      region: 'us-central1',
      template: 'identity-credential-misuse',
      estimatedDuration: '20-40 minutes',
      difficulty: 'intermediate',
      tags: ['identity', 'anomalous-login', 'UEBA', 'account-takeover'],
      resources: {
        compute: 'Function to emit synthetic auth events'
      }
    }
  ],
  'lateral-movement-sim': [
    {
      id: 'lm-anomalous-access-patterns',
      name: 'Lateral Movement Behavioral Patterns',
      type: 'lateral-movement-sim',
      description: 'Emulate resource access patterns that resemble lateral movement for detection validation.',
      provider: 'gcp',
      region: 'us-central1',
      template: 'lateral-movement-behavior',
      estimatedDuration: '30-60 minutes',
      difficulty: 'advanced',
      tags: ['lateral-movement', 'behavioral', 'anomalies'],
      resources: {
        compute: 'Orchestrated functions producing access logs'
      }
    }
  ],
  'data-exfil-behavior': [
    {
      id: 'dx-volume-anomaly',
      name: 'Data Egress Volume Anomaly',
      type: 'data-exfil-behavior',
      description: 'Generate safe, synthetic egress telemetry to validate exfiltration anomaly detections.',
      provider: 'gcp',
      region: 'us-central1',
      template: 'data-egress-anomaly',
      estimatedDuration: '20-45 minutes',
      difficulty: 'intermediate',
      tags: ['exfiltration', 'egress', 'network', 'UEBA'],
      resources: {
        network: 'Synthetic egress logs via logging sink'
      }
    }
  ],
  'beacon-emulation': [
    {
      id: 'beacon-timing-irregular',
      name: 'Beacon Timing Irregularities (Emulated)',
      type: 'beacon-emulation',
      description: 'Emit synthetic periodic signals to emulate benign beacon-like telemetry for analytics tuning.',
      provider: 'gcp',
      region: 'us-central1',
      template: 'beacon-timing-emulation',
      estimatedDuration: '25-50 minutes',
      difficulty: 'intermediate',
      tags: ['beaconing', 'network', 'timing-anomaly'],
      resources: {
        compute: 'Scheduler + function to emit synthetic events'
      }
    }
  ],
  'phishing-sim': [
    {
      id: 'phish-sim-email-flow',
      name: 'Phishing Simulation (Safe Metadata)',
      type: 'phishing-sim',
      description: 'Simulate phishing campaign metadata (headers/indicators only) for mail flow detection mapping.',
      provider: 'gcp',
      region: 'us-central1',
      template: 'phishing-simulated-metadata',
      estimatedDuration: '15-30 minutes',
      difficulty: 'beginner',
      tags: ['phishing', 'email', 'metadata', 'detections'],
      resources: {
        storage: 'Static JSON indicators delivered via logs'
      }
    }
  ],
  'custom': []
};

export interface ScenarioCommand {
  action: 'generate' | 'list' | 'destroy' | 'validate' | 'export';
  scenarioType?: ScenarioType;
  provider?: Provider;
  region?: string;
  template?: string;
  file?: string;
  autoValidate?: boolean;
  destroyAfter?: string;
  output?: string;
  xsiamToken?: string;
  xsoarPlaybook?: string;
  pipeline?: Pipeline;
  verbose?: boolean;
  dryRun?: boolean;
  tags?: Record<string, string>;
}

export const parseScenarioCommand = (args: string[]): ScenarioCommand | null => {
  if (args.length === 0) return null;
  
  const action = args[0] as ScenarioCommand['action'];
  if (!['generate', 'list', 'destroy', 'validate', 'export'].includes(action)) {
    return null;
  }

  // Use the shared arg parser for consistency
  const rest = args.slice(1);
  // Import inline to avoid server-side issues
  const { parseArgs } = require('./arg-parser');
  const parsed = parseArgs([
    { flag: '--scenario-type', type: 'enum', enumValues: ['cloud-posture','container-vuln','code-vuln','insider-threat','ransomware','waas-exploit','ai-threat','pipeline-breach','identity-compromise','lateral-movement-sim','data-exfil-behavior','beacon-emulation','phishing-sim','custom'] },
    { flag: '--provider', type: 'enum', enumValues: ['gcp','aws','azure','kubernetes','local'], default: 'gcp' },
    { flag: '--region', type: 'string', default: 'us-central1' },
    { flag: '--template', type: 'string' },
    { flag: '--file', type: 'string' },
    { flag: '--auto-validate', type: 'boolean', default: false },
    { flag: '--destroy-after', type: 'string' },
    { flag: '--output', type: 'string' },
    { flag: '--xsiam-token', type: 'string' },
    { flag: '--xsoar-playbook', type: 'string' },
    { flag: '--pipeline', type: 'enum', enumValues: ['ci','gitlab','github'] },
    { flag: '--verbose', type: 'boolean', default: false },
    { flag: '--dry-run', type: 'boolean', default: false },
    { flag: '--tag', type: 'string' }
  ], rest);

  const command: ScenarioCommand = {
    action,
    scenarioType: parsed['--scenario-type'],
    provider: parsed['--provider'],
    region: parsed['--region'],
    template: parsed['--template'],
    file: parsed['--file'],
    autoValidate: parsed['--auto-validate'],
    destroyAfter: parsed['--destroy-after'],
    output: parsed['--output'],
    xsiamToken: parsed['--xsiam-token'],
    xsoarPlaybook: parsed['--xsoar-playbook'],
    pipeline: parsed['--pipeline'],
    verbose: parsed['--verbose'],
    dryRun: parsed['--dry-run']
  };

  // Handle tags: can appear multiple times --tag key:value
  const tags: Record<string,string> = {};
  const positions = rest.reduce<number[]>((acc, t, i) => (t === '--tag' ? (acc.push(i), acc) : acc), []);
  for (const idx of positions) {
    const val = rest[idx + 1];
    if (val && !val.startsWith('--')) {
      const [k, v] = val.split(':');
      if (k && v) tags[k] = v;
    }
  }
  if (Object.keys(tags).length > 0) command.tags = tags;

  return command;
};
