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

  const command: ScenarioCommand = { action };
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--scenario-type') && args[i + 1]) {
      command.scenarioType = args[i + 1] as ScenarioType;
      i++;
    } else if (arg.startsWith('--provider') && args[i + 1]) {
      command.provider = args[i + 1] as Provider;
      i++;
    } else if (arg.startsWith('--region') && args[i + 1]) {
      command.region = args[i + 1];
      i++;
    } else if (arg.startsWith('--template') && args[i + 1]) {
      command.template = args[i + 1];
      i++;
    } else if (arg.startsWith('--file') && args[i + 1]) {
      command.file = args[i + 1];
      i++;
    } else if (arg === '--auto-validate') {
      command.autoValidate = true;
    } else if (arg.startsWith('--destroy-after') && args[i + 1]) {
      command.destroyAfter = args[i + 1];
      i++;
    } else if (arg.startsWith('--output') && args[i + 1]) {
      command.output = args[i + 1];
      i++;
    } else if (arg.startsWith('--xsiam-token') && args[i + 1]) {
      command.xsiamToken = args[i + 1];
      i++;
    } else if (arg.startsWith('--xsoar-playbook') && args[i + 1]) {
      command.xsoarPlaybook = args[i + 1];
      i++;
    } else if (arg.startsWith('--pipeline') && args[i + 1]) {
      command.pipeline = args[i + 1] as Pipeline;
      i++;
    } else if (arg === '--verbose') {
      command.verbose = true;
    } else if (arg === '--dry-run') {
      command.dryRun = true;
    } else if (arg.startsWith('--tag') && args[i + 1]) {
      const tagPair = args[i + 1].split(':');
      if (tagPair.length === 2) {
        command.tags = command.tags || {};
        command.tags[tagPair[0]] = tagPair[1];
      }
      i++;
    }
  }
  
  return command;
};
