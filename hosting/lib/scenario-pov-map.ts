/**
 * Scenario-POV Integration Mapping
 * 
 * Maps scenario types to appropriate POV templates and generates
 * context-aware POV commands for seamless integration.
 */

export type ScenarioKey = string;
export type Provider = 'aws' | 'azure' | 'gcp' | 'k8s' | 'local' | 'multi-cloud';
export type PovTemplate = 
  | 'technical-deep-dive'
  | 'executive-overview' 
  | 'identity-hardening'
  | 'multi-cloud-readiness'
  | 'zero-trust-assessment'
  | 'incident-response'
  | 'compliance-validation'
  | 'threat-hunting'
  | 'devsecops-integration';

/**
 * Maps scenario types to their recommended POV templates
 */
export const SCENARIO_POV_TEMPLATE_MAP: Record<ScenarioKey, PovTemplate> = {
  'cloud-posture': 'multi-cloud-readiness',
  'container-vuln': 'devsecops-integration',
  'code-vuln': 'devsecops-integration',
  'insider-threat': 'identity-hardening',
  'ransomware': 'incident-response',
  'waas-exploit': 'technical-deep-dive',
  'apt-simulation': 'threat-hunting',
  'supply-chain': 'devsecops-integration',
  'ai-threat': 'technical-deep-dive',
  'pipeline-breach': 'devsecops-integration',
  'identity-compromise': 'identity-hardening',
  'lateral-movement-sim': 'threat-hunting',
  'data-exfil-behavior': 'incident-response',
  'beacon-emulation': 'threat-hunting',
  'phishing-sim': 'executive-overview',
  'social-engineering': 'executive-overview',
  'zero-day-simulation': 'technical-deep-dive',
  'evasion-techniques': 'threat-hunting',
  'iot-security': 'multi-cloud-readiness',
  'ot-security': 'compliance-validation',
  'deepfake-detection': 'executive-overview'
};

/**
 * Template descriptions for user-facing display
 */
export const POV_TEMPLATE_DESCRIPTIONS: Record<PovTemplate, string> = {
  'technical-deep-dive': 'Comprehensive technical evaluation with hands-on testing',
  'executive-overview': 'Business-focused demonstration for decision makers',
  'identity-hardening': 'Identity and access management security assessment',
  'multi-cloud-readiness': 'Cross-cloud security posture evaluation',
  'zero-trust-assessment': 'Zero trust architecture validation and planning',
  'incident-response': 'Incident response and threat containment capabilities',
  'compliance-validation': 'Regulatory compliance and audit preparation',
  'threat-hunting': 'Advanced threat detection and hunting workflows',
  'devsecops-integration': 'Development pipeline security integration'
};

/**
 * Gets the recommended POV template for a given scenario
 */
export function getPovTemplateForScenario(scenarioKey: ScenarioKey): PovTemplate {
  return SCENARIO_POV_TEMPLATE_MAP[scenarioKey] || 'technical-deep-dive';
}

/**
 * Gets the description for a POV template
 */
export function getPovTemplateDescription(template: PovTemplate): string {
  return POV_TEMPLATE_DESCRIPTIONS[template] || 'Custom POV template';
}

/**
 * Builds a POV initialization command with scenario integration
 */
export function buildPovInitCommand(options: {
  scenarioKey: ScenarioKey;
  provider: Provider;
  customerName: string;
  template?: PovTemplate;
}): string {
  const { scenarioKey, provider, customerName, template } = options;
  const povTemplate = template || getPovTemplateForScenario(scenarioKey);
  
  return `pov init "${customerName}" --template ${povTemplate} --scenarios ${scenarioKey} --provider ${provider}`;
}

/**
 * Builds a command to add a scenario to an existing POV
 */
export function buildPovAddScenarioCommand(options: {
  scenarioKey: ScenarioKey;
  povId?: string;
}): string {
  const { scenarioKey, povId } = options;
  
  if (povId) {
    return `pov add-scenario --scenario ${scenarioKey} --pov-id ${povId}`;
  }
  
  return `pov add-scenario --scenario ${scenarioKey}`;
}

/**
 * Gets contextual POV commands based on current state
 */
export function getPovIntegrationCommands(options: {
  scenarioKey: ScenarioKey;
  provider: Provider;
  hasActivePov?: boolean;
  activePovId?: string;
  customerName?: string;
}): {
  primary: {
    command: string;
    label: string;
    description: string;
  };
  secondary?: {
    command: string;
    label: string;
    description: string;
  };
} {
  const { scenarioKey, provider, hasActivePov, activePovId, customerName } = options;
  
  if (hasActivePov) {
    // User has an active POV - offer to add scenario to it
    return {
      primary: {
        command: buildPovAddScenarioCommand({ scenarioKey, povId: activePovId }),
        label: 'Add to Current POV',
        description: 'Add this scenario to your active POV project'
      },
      secondary: {
        command: `pov init --interactive --scenarios ${scenarioKey}`,
        label: 'New POV Wizard',
        description: 'Create a new POV with guided setup'
      }
    };
  }
  
  // No active POV - offer to create new one
  const template = getPovTemplateForScenario(scenarioKey);
  const templateDescription = getPovTemplateDescription(template);
  
  if (customerName) {
    return {
      primary: {
        command: buildPovInitCommand({ scenarioKey, provider, customerName, template }),
        label: 'Create POV',
        description: `Create POV using ${templateDescription.toLowerCase()}`
      },
      secondary: {
        command: `pov init --interactive --scenarios ${scenarioKey}`,
        label: 'POV Wizard',
        description: 'Use interactive wizard for custom setup'
      }
    };
  }
  
  return {
    primary: {
      command: `pov init --interactive --scenarios ${scenarioKey}`,
      label: 'Start POV Wizard',
      description: 'Create new POV with guided customer setup'
    }
  };
}

/**
 * Validates if a scenario-provider combination is supported
 */
export function isScenarioProviderSupported(scenarioKey: ScenarioKey, provider: Provider): boolean {
  // Define unsupported combinations
  const unsupportedCombinations: Array<[ScenarioKey, Provider]> = [
    ['ot-security', 'gcp'], // OT security typically not cloud-based
    ['iot-security', 'k8s'], // IoT scenarios better suited for cloud providers
  ];
  
  return !unsupportedCombinations.some(([key, prov]) => key === scenarioKey && prov === provider);
}

/**
 * Gets recommended next steps after POV integration
 */
export function getPostPovIntegrationSteps(scenarioKey: ScenarioKey): string[] {
  const baseSteps = [
    'Configure customer environment parameters',
    'Review and customize detection rules',
    'Schedule scenario execution timeline'
  ];
  
  const scenarioSpecificSteps: Record<string, string[]> = {
    'ransomware': [
      'Set up backup validation checks',
      'Configure incident response playbooks',
      'Test recovery procedures'
    ],
    'identity-compromise': [
      'Review identity provider integration',
      'Configure privilege escalation detection',
      'Set up access anomaly monitoring'
    ],
    'cloud-posture': [
      'Validate cloud resource permissions',
      'Configure compliance reporting',
      'Set up continuous monitoring'
    ]
  };
  
  return [
    ...baseSteps,
    ...(scenarioSpecificSteps[scenarioKey] || [])
  ];
}