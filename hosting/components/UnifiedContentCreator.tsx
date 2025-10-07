'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedContentCreator } from './EnhancedContentCreator';
import { ManualCreationGUI } from './ManualCreationGUI';
import { ContentItem } from './ContentLibrary';
import CortexButton from './CortexButton';
import TerminalWindow from './TerminalWindow';
import userActivityService from '../lib/user-activity-service';

// Extended POV Detection Scenario types covering all security domains
const POV_DETECTION_SCENARIOS = {
  // Cloud Security
  'cloud-posture': {
    name: 'Cloud Security Posture Management',
    description: 'Misconfigured cloud resources, excessive permissions, and compliance violations',
    subcategories: ['storage-exposure', 'iam-overprivilege', 'network-misconfiguration', 'encryption-gaps'],
    mitreMapping: ['T1580', 'T1578', 'T1526'],
    detectionTypes: ['CSPM', 'Configuration Drift', 'Permission Anomalies'],
    businessImpact: 'High - Data exposure, compliance violations, unauthorized access'
  },
  'container-vuln': {
    name: 'Container Security Vulnerabilities',
    description: 'Vulnerable base images, runtime threats, and container escape attempts',
    subcategories: ['vulnerable-images', 'runtime-protection', 'container-escape', 'secrets-exposure'],
    mitreMapping: ['T1190', 'T1611', 'T1055'],
    detectionTypes: ['CVE Scanning', 'Runtime Behavioral Analysis', 'Container Anomalies'],
    businessImpact: 'High - Supply chain attacks, data breaches, lateral movement'
  },
  'code-vuln': {
    name: 'Application Security Vulnerabilities',
    description: 'Code-level vulnerabilities including injection attacks and insecure coding practices',
    subcategories: ['sql-injection', 'xss-attacks', 'deserialization', 'buffer-overflow'],
    mitreMapping: ['T1190', 'T1203', 'T1055'],
    detectionTypes: ['SAST', 'DAST', 'IAST', 'WAF'],
    businessImpact: 'Critical - Application compromise, data theft, business disruption'
  },
  
  // Threat-based Scenarios
  'insider-threat': {
    name: 'Insider Threat Detection',
    description: 'Malicious or negligent actions by authorized personnel',
    subcategories: ['data-exfiltration', 'privilege-abuse', 'sabotage', 'credential-theft'],
    mitreMapping: ['T1530', 'T1078', 'T1087', 'T1083'],
    detectionTypes: ['UEBA', 'Data Loss Prevention', 'Access Analytics'],
    businessImpact: 'Critical - IP theft, data breaches, operational sabotage'
  },
  'ransomware': {
    name: 'Ransomware Attack Simulation',
    description: 'Multi-stage ransomware attacks including encryption, staging, and C&C',
    subcategories: ['file-encryption', 'lateral-movement', 'backup-deletion', 'payment-demands'],
    mitreMapping: ['T1486', 'T1490', 'T1489', 'T1021'],
    detectionTypes: ['EDR', 'File System Monitoring', 'Network Analysis', 'Behavioral Analytics'],
    businessImpact: 'Critical - Business shutdown, data loss, financial extortion'
  },
  'waas-exploit': {
    name: 'Web Application Attack Surface',
    description: 'OWASP Top 10 vulnerabilities and advanced web application attacks',
    subcategories: ['injection-attacks', 'broken-auth', 'sensitive-exposure', 'xxe'],
    mitreMapping: ['T1190', 'T1055', 'T1203'],
    detectionTypes: ['WAF', 'Application Security', 'API Protection'],
    businessImpact: 'High - Web defacement, data breaches, service disruption'
  },
  
  // Advanced Persistent Threats
  'apt-simulation': {
    name: 'Advanced Persistent Threat Campaign',
    description: 'Multi-stage APT attack simulation with stealth and persistence',
    subcategories: ['spear-phishing', 'lateral-movement', 'persistence', 'exfiltration'],
    mitreMapping: ['T1566', 'T1021', 'T1547', 'T1041'],
    detectionTypes: ['Threat Hunting', 'IOC Detection', 'Behavioral Analytics'],
    businessImpact: 'Critical - Long-term compromise, IP theft, espionage'
  },
  'supply-chain': {
    name: 'Supply Chain Attack Vectors',
    description: 'Third-party software compromise and dependency attacks',
    subcategories: ['dependency-confusion', 'typosquatting', 'backdoor-injection', 'update-hijacking'],
    mitreMapping: ['T1195', 'T1547', 'T1574'],
    detectionTypes: ['Software Composition Analysis', 'Build Process Monitoring'],
    businessImpact: 'Critical - Widespread compromise, trusted software weaponization'
  },
  
  // AI and Modern Threats
  'ai-threat': {
    name: 'AI/ML Security Threats',
    description: 'Attacks targeting AI systems including prompt injection and model poisoning',
    subcategories: ['prompt-injection', 'model-poisoning', 'adversarial-examples', 'data-extraction'],
    mitreMapping: ['T1204', 'T1565', 'T1199'],
    detectionTypes: ['AI Guardrails', 'Model Integrity Checks', 'Input Validation'],
    businessImpact: 'High - AI system manipulation, biased decisions, data leakage'
  },
  'deepfake-detection': {
    name: 'Deepfake and Synthetic Media',
    description: 'Detection of AI-generated fake content and synthetic identities',
    subcategories: ['voice-cloning', 'face-swap', 'text-generation', 'synthetic-documents'],
    mitreMapping: ['T1566', 'T1204', 'T1199'],
    detectionTypes: ['Media Authentication', 'Biometric Analysis', 'Content Provenance'],
    businessImpact: 'High - Social engineering, fraud, reputation damage'
  },
  
  // Infrastructure and DevOps
  'pipeline-breach': {
    name: 'CI/CD Pipeline Security',
    description: 'Attacks on development and deployment pipelines',
    subcategories: ['code-injection', 'credential-theft', 'artifact-tampering', 'pipeline-hijacking'],
    mitreMapping: ['T1653', 'T1195', 'T1078'],
    detectionTypes: ['Pipeline Security Scanning', 'Artifact Integrity', 'Access Controls'],
    businessImpact: 'Critical - Software supply chain compromise, backdoor injection'
  },
  'identity-compromise': {
    name: 'Identity and Access Management Threats',
    description: 'Identity-based attacks including credential stuffing and privilege escalation',
    subcategories: ['credential-stuffing', 'password-spraying', 'privilege-escalation', 'token-theft'],
    mitreMapping: ['T1078', 'T1110', 'T1068', 'T1134'],
    detectionTypes: ['Identity Analytics', 'Privileged Access Monitoring', 'Authentication Analytics'],
    businessImpact: 'High - Unauthorized access, data breaches, system compromise'
  },
  
  // Behavioral and Anomaly Detection
  'lateral-movement-sim': {
    name: 'Lateral Movement Detection',
    description: 'Post-compromise movement patterns and network reconnaissance',
    subcategories: ['network-discovery', 'credential-dumping', 'remote-access', 'service-enumeration'],
    mitreMapping: ['T1570', 'T1021', 'T1018', 'T1003'],
    detectionTypes: ['Network Traffic Analysis', 'Host-based Monitoring', 'Credential Monitoring'],
    businessImpact: 'High - Expanded attack surface, privilege escalation, data access'
  },
  'data-exfil-behavior': {
    name: 'Data Exfiltration Patterns',
    description: 'Abnormal data access and egress patterns indicating data theft',
    subcategories: ['volume-anomalies', 'timing-patterns', 'destination-analysis', 'protocol-abuse'],
    mitreMapping: ['T1567', 'T1041', 'T1020'],
    detectionTypes: ['Data Loss Prevention', 'Network Analytics', 'Behavioral Baselines'],
    businessImpact: 'Critical - Intellectual property theft, compliance violations'
  },
  'beacon-emulation': {
    name: 'Command and Control Communications',
    description: 'C&C beacon patterns and covert channel communications',
    subcategories: ['dns-tunneling', 'http-beaconing', 'icmp-covert', 'social-media-c2'],
    mitreMapping: ['T1071', 'T1095', 'T1102'],
    detectionTypes: ['Network Pattern Analysis', 'DNS Analytics', 'Protocol Analysis'],
    businessImpact: 'High - Persistent access, command execution, ongoing compromise'
  },
  
  // Social Engineering and Human Factors
  'phishing-sim': {
    name: 'Advanced Phishing Campaigns',
    description: 'Sophisticated phishing including spear phishing and BEC attacks',
    subcategories: ['spear-phishing', 'bec-attacks', 'credential-harvesting', 'malware-delivery'],
    mitreMapping: ['T1566', 'T1204', 'T1078'],
    detectionTypes: ['Email Security', 'URL Analysis', 'Attachment Sandboxing'],
    businessImpact: 'High - Credential theft, financial fraud, malware infection'
  },
  'social-engineering': {
    name: 'Social Engineering Attack Vectors',
    description: 'Human manipulation techniques beyond traditional phishing',
    subcategories: ['pretexting', 'baiting', 'tailgating', 'watering-hole'],
    mitreMapping: ['T1566', 'T1204', 'T1199'],
    detectionTypes: ['User Behavior Analytics', 'Communication Analysis', 'Access Pattern Detection'],
    businessImpact: 'High - Unauthorized access, information disclosure, security bypass'
  },
  
  // Zero-day and Exploit Detection
  'zero-day-simulation': {
    name: 'Zero-Day Exploit Detection',
    description: 'Unknown vulnerability exploitation and novel attack techniques',
    subcategories: ['memory-corruption', 'logic-flaws', 'race-conditions', 'crypto-weaknesses'],
    mitreMapping: ['T1203', 'T1068', 'T1055'],
    detectionTypes: ['Behavioral Analysis', 'Sandboxing', 'Memory Protection', 'Anomaly Detection'],
    businessImpact: 'Critical - Unknown threat vectors, advanced evasion, system compromise'
  },
  'evasion-techniques': {
    name: 'Advanced Evasion Techniques',
    description: 'Anti-detection and anti-analysis techniques used by sophisticated threats',
    subcategories: ['obfuscation', 'packing', 'polymorphism', 'living-off-land'],
    mitreMapping: ['T1027', 'T1140', 'T1055', 'T1218'],
    detectionTypes: ['Static Analysis Evasion', 'Dynamic Analysis Evasion', 'Behavioral Masquerading'],
    businessImpact: 'High - Security tool bypass, persistent threats, advanced malware'
  },
  
  // IoT and OT Security
  'iot-security': {
    name: 'IoT Device Security Threats',
    description: 'Internet of Things device vulnerabilities and attack vectors',
    subcategories: ['device-hijacking', 'firmware-attacks', 'protocol-abuse', 'botnet-recruitment'],
    mitreMapping: ['T1190', 'T1200', 'T1557'],
    detectionTypes: ['Device Behavior Analytics', 'Network Segmentation', 'Protocol Analysis'],
    businessImpact: 'Medium - Device compromise, network pivot, DDoS amplification'
  },
  'ot-security': {
    name: 'Operational Technology Threats',
    description: 'Industrial control system and SCADA security threats',
    subcategories: ['hmi-attacks', 'plc-manipulation', 'protocol-disruption', 'safety-bypass'],
    mitreMapping: ['T0883', 'T0836', 'T0856'],
    detectionTypes: ['OT Network Monitoring', 'Protocol Analysis', 'Safety System Monitoring'],
    businessImpact: 'Critical - Physical damage, safety hazards, production disruption'
  },
  
  // Custom and Emerging Threats
  'custom': {
    name: 'Custom Threat Scenarios',
    description: 'Organization-specific or emerging threat patterns',
    subcategories: ['industry-specific', 'organization-tailored', 'emerging-threats', 'hybrid-attacks'],
    mitreMapping: ['Custom'],
    detectionTypes: ['Custom Rules', 'Threat Intelligence', 'Behavioral Baselines'],
    businessImpact: 'Variable - Depends on specific threat and context'
  }
};

interface ScenarioCreatorProps {
  mode: 'enhanced' | 'manual' | 'unified';
  onModeChange: (mode: 'enhanced' | 'manual' | 'unified' | 'library') => void;
  selectedLibraryItem?: ContentItem | null;
  onClearLibraryItem?: () => void;
}

const ScenarioOverviewCard: React.FC<{
  scenarioKey: string;
  scenario: any;
  onSelect: (scenarioKey: string) => void;
}> = ({ scenarioKey, scenario, onSelect }) => {
  return (
    <div 
      className="cortex-card p-4 cursor-pointer hover:border-cortex-green transition-all duration-300 group"
      onClick={() => onSelect(scenarioKey)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-cortex-text-primary group-hover:text-cortex-green transition-colors">
          {scenario.name}
        </h3>
        <div className="flex flex-wrap gap-1">
          {scenario.mitreMapping.slice(0, 2).map((technique: string) => (
            <span key={technique} className="px-2 py-1 text-xs bg-cortex-bg-tertiary text-cortex-text-muted rounded border border-cortex-border-secondary">
              {technique}
            </span>
          ))}
        </div>
      </div>
      
      <p className="text-sm text-cortex-text-secondary mb-4 line-clamp-2">
        {scenario.description}
      </p>
      
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          {scenario.subcategories.slice(0, 3).map((sub: string) => (
            <span key={sub} className="px-2 py-1 text-xs bg-cortex-info/10 text-cortex-info rounded">
              {sub.replace('-', ' ')}
            </span>
          ))}
          {scenario.subcategories.length > 3 && (
            <span className="px-2 py-1 text-xs text-cortex-text-muted">+{scenario.subcategories.length - 3} more</span>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-cortex-text-muted">
            {scenario.detectionTypes.length} detection types
          </span>
          <span className={`px-2 py-1 rounded ${
            scenario.businessImpact.startsWith('Critical') ? 'bg-cortex-error/20 text-cortex-error' :
            scenario.businessImpact.startsWith('High') ? 'bg-cortex-warning/20 text-cortex-warning' :
            'bg-cortex-info/20 text-cortex-info'
          }`}>
            {scenario.businessImpact.split(' - ')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper function to determine the best provider for each scenario type
const getScenarioProvider = (scenarioKey: string): string => {
  const providerMapping: Record<string, string> = {
    'cloud-posture': 'gcp',
    'container-vuln': 'k8s',
    'code-vuln': 'local',
    'insider-threat': 'azure',
    'ransomware': 'aws',
    'waas-exploit': 'local',
    'apt-simulation': 'multi-cloud',
    'supply-chain': 'local',
    'ai-threat': 'gcp',
    'deepfake-detection': 'aws',
    'pipeline-breach': 'local',
    'identity-compromise': 'azure',
    'lateral-movement-sim': 'multi-cloud',
    'data-exfil-behavior': 'aws',
    'beacon-emulation': 'local',
    'phishing-sim': 'gcp',
    'social-engineering': 'local',
    'zero-day-simulation': 'multi-cloud',
    'evasion-techniques': 'local',
    'iot-security': 'aws',
    'ot-security': 'local',
    'custom': 'gcp'
  };
  return providerMapping[scenarioKey] || 'gcp';
};

// Helper function to get scenario-specific detection commands
const getDetectionCommands = (scenarioKey: string, scenario: any): string[] => {
  const baseCommands = [
    `# Test detection rules for ${scenario.name}`,
    `detect test --scenario ${scenarioKey} --all-rules --verbose`,
    ``,
    `# Validate MITRE coverage`,
    `mitre validate --techniques ${scenario.mitreMapping.join(',')} --coverage-report`,
    ``,
  ];
  
  // Add scenario-specific detection commands
  const specificCommands: Record<string, string[]> = {
    'cloud-posture': [
      `# Test cloud security posture rules`,
      `detect test-cspm --provider ${getScenarioProvider(scenarioKey)} --check-misconfigurations`,
      `cloud-audit --scan-permissions --check-encryption`
    ],
    'container-vuln': [
      `# Scan container images for vulnerabilities`,
      `detect scan-images --registry all --severity high,critical`,
      `runtime-scan --monitor-containers --detect-escapes`
    ],
    'apt-simulation': [
      `# Advanced threat hunting queries`,
      `threat-hunt --ioc-sweep --behavioral-analysis`,
      `detect lateral-movement --network-analysis --credential-tracking`
    ],
    'ransomware': [
      `# Ransomware-specific detection tests`,
      `detect anti-ransomware --monitor-encryption --backup-integrity`,
      `behavioral-analysis --file-access-patterns --suspicious-processes`
    ],
    'identity-compromise': [
      `# Identity and access monitoring`,
      `detect identity-threats --privilege-escalation --credential-stuffing`,
      `identity-analytics --anomaly-detection --access-patterns`
    ]
  };
  
  const scenarioSpecific = specificCommands[scenarioKey] || [
    `# Scenario-specific detection test`,
    `detect custom --scenario ${scenarioKey} --threat-vectors all`
  ];
  
  return [...baseCommands, ...scenarioSpecific, ``, `# Generate detection report`, `detect report --scenario ${scenarioKey} --format technical --export pdf`];
};

const ScenarioDetailView: React.FC<{
  scenarioKey: string;
  scenario: any;
  onBack: () => void;
  onCreateContent: (scenarioKey: string, mode: 'enhanced' | 'manual') => void;
}> = ({ scenarioKey, scenario, onBack, onCreateContent }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <CortexButton onClick={onBack} variant="outline" size="sm" icon="←">
            Back
          </CortexButton>
          <div>
            <h1 className="text-3xl font-bold text-cortex-text-primary">{scenario.name}</h1>
            <p className="text-cortex-text-secondary mt-1">{scenario.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <CortexButton 
            onClick={() => onCreateContent(scenarioKey, 'enhanced')}
            variant="primary" 
            icon="📝"
          >
            Enhanced Creator
          </CortexButton>
          <CortexButton 
            onClick={() => onCreateContent(scenarioKey, 'manual')}
            variant="outline" 
            icon="🛠️"
          >
            Manual Form
          </CortexButton>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Details */}
        <div className="cortex-card p-6">
          <h3 className="text-xl font-bold text-cortex-text-primary mb-4">🔍 Technical Details</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-cortex-text-secondary mb-2">Attack Subcategories</h4>
              <div className="flex flex-wrap gap-2">
                {scenario.subcategories.map((sub: string) => (
                  <span key={sub} className="px-3 py-1 text-sm bg-cortex-info/10 text-cortex-info rounded-full border border-cortex-info/30">
                    {sub.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-cortex-text-secondary mb-2">MITRE ATT&CK Mapping</h4>
              <div className="flex flex-wrap gap-2">
                {scenario.mitreMapping.map((technique: string) => (
                  <span key={technique} className="px-3 py-1 text-sm bg-cortex-warning/10 text-cortex-warning rounded-full border border-cortex-warning/30 font-mono">
                    {technique}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-cortex-text-secondary mb-2">Detection Technologies</h4>
              <div className="flex flex-wrap gap-2">
                {scenario.detectionTypes.map((type: string) => (
                  <span key={type} className="px-3 py-1 text-sm bg-cortex-green/10 text-cortex-green rounded-full border border-cortex-green/30">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Business Impact */}
        <div className="cortex-card p-6">
          <h3 className="text-xl font-bold text-cortex-text-primary mb-4">💼 Business Impact</h3>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-l-4 ${
              scenario.businessImpact.startsWith('Critical') ? 'bg-cortex-error/10 border-cortex-error' :
              scenario.businessImpact.startsWith('High') ? 'bg-cortex-warning/10 border-cortex-warning' :
              'bg-cortex-info/10 border-cortex-info'
            }`}>
              <h4 className="font-semibold text-cortex-text-primary mb-2">Risk Level</h4>
              <p className="text-cortex-text-secondary">{scenario.businessImpact}</p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-cortex-text-secondary">POV Demonstration Value</h4>
              <ul className="space-y-2 text-sm text-cortex-text-secondary">
                <li className="flex items-start space-x-2">
                  <span className="text-cortex-green mt-0.5">✓</span>
                  <span>Demonstrates real-world threat patterns</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cortex-green mt-0.5">✓</span>
                  <span>Shows detection and response capabilities</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cortex-green mt-0.5">✓</span>
                  <span>Validates security control effectiveness</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cortex-green mt-0.5">✓</span>
                  <span>Provides actionable security insights</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Terminal Integration with Interactive Windows */}
      <div className="cortex-card p-6">
        <h3 className="text-xl font-bold text-cortex-text-primary mb-6">⚡ Terminal Integration & CLI Guidance</h3>
        
        <div className="space-y-6">
          {/* Scenario Deployment Commands */}
          <div>
            <h4 className="font-semibold text-cortex-text-secondary mb-3">🚀 Scenario Deployment</h4>
            <TerminalWindow
              title={`Deploy ${scenario.name} Scenario`}
              commands={[
                `# Deploy ${scenario.name} scenario with validation`,
                `scenario generate --scenario-type ${scenarioKey} --provider ${getScenarioProvider(scenarioKey)} --auto-validate`,
                ``,
                `# Configure scenario parameters`,
                `scenario config --scenario-type ${scenarioKey} --set-parameters`,
                ``,
                `# Monitor deployment status`,
                `scenario status --follow --scenario-id latest`,
                ``,
                `# View deployment logs with filtering`,
                `scenario logs --deployment-id latest --tail --filter="${scenarioKey}"`,
                ``,
                `# Get scenario execution metrics`,
                `scenario metrics --scenario-type ${scenarioKey} --timeframe 1h`
              ]}
              height="h-64"
              initialOutput={
                <div className="text-cyan-400">
                  <div className="text-lg font-bold mb-1">🔬 Scenario Deployment Terminal</div>
                  <div className="text-sm text-gray-400 mb-3">Ready to deploy {scenario.name} scenario</div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• Provider: {getScenarioProvider(scenarioKey).toUpperCase()} with auto-validation</div>
                    <div>• MITRE Mapping: {scenario.mitreMapping.join(', ')}</div>
                    <div>• Detection Types: {scenario.detectionTypes.join(', ')}</div>
                    <div>• Business Impact: {scenario.businessImpact.split(' - ')[0]}</div>
                    <div>• Subcategories: {scenario.subcategories.length} attack vectors</div>
                  </div>
                </div>
              }
              onCommand={(command) => {
                userActivityService.trackActivity('scenario-terminal-command', 'unified-creator', {
                  scenarioKey,
                  command: command.split(' ')[0],
                  fullCommand: command
                });
              }}
            />
            
            <div className="mt-3 bg-cortex-bg-tertiary rounded-lg p-4">
              <div className="font-medium text-cortex-text-secondary mb-2">📋 Essential Commands - Copy and execute:</div>
              <div className="space-y-2 text-sm font-mono">
                <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                  <span>scenario generate --scenario-type {scenarioKey} --provider {getScenarioProvider(scenarioKey)}</span>
                  <button className="text-cortex-text-muted hover:text-cortex-green text-xs" onClick={() => navigator.clipboard?.writeText(`scenario generate --scenario-type ${scenarioKey} --provider ${getScenarioProvider(scenarioKey)}`)}>
                    📋 Copy
                  </button>
                </div>
                <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                  <span>scenario status --follow --scenario-id latest</span>
                  <button className="text-cortex-text-muted hover:text-cortex-green text-xs" onClick={() => navigator.clipboard?.writeText('scenario status --follow --scenario-id latest')}>
                    📋 Copy
                  </button>
                </div>
                <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                  <span>scenario metrics --scenario-type {scenarioKey} --timeframe 1h</span>
                  <button className="text-cortex-text-muted hover:text-cortex-green text-xs" onClick={() => navigator.clipboard?.writeText(`scenario metrics --scenario-type ${scenarioKey} --timeframe 1h`)}>
                    📋 Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* POV Integration Commands */}
          <div>
            <h4 className="font-semibold text-cortex-text-secondary mb-3">🎯 POV Integration & Customer Demo</h4>
            <TerminalWindow
              title={`POV Integration - ${scenario.name}`}
              commands={[
                `# Initialize comprehensive POV with ${scenario.name} scenario`,
                `pov init "Customer Name" --template technical-deep-dive --scenarios ${scenarioKey} --industry manufacturing`,
                ``,
                `# Configure customer-specific parameters`,
                `pov config --scenario ${scenarioKey} --customer-env production --sensitivity high`,
                ``,
                `# Add detection rules with automatic MITRE mapping`,
                `pov add-detection --scenario ${scenarioKey} --auto-map-mitre --include-hunting-queries`,
                ``,
                `# Generate threat landscape assessment`,
                `pov threat-landscape --scenario ${scenarioKey} --competitor-analysis`,
                ``,
                `# Create demo environment`,
                `pov demo-setup --scenario ${scenarioKey} --interactive --safe-mode`,
                ``,
                `# Generate executive and technical reports`,
                `pov report --scenario ${scenarioKey} --format executive --include-metrics --export pdf`,
                `pov report --scenario ${scenarioKey} --format technical --include-queries --export markdown`
              ]}
              height="h-80"
              initialOutput={
                <div className="text-cyan-400">
                  <div className="text-lg font-bold mb-1">🎯 POV Integration Terminal</div>
                  <div className="text-sm text-gray-400 mb-3">Integrate {scenario.name} into customer POV demonstration</div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• Business Impact: {scenario.businessImpact.split(' - ')[0]}</div>
                    <div>• MITRE Techniques: {scenario.mitreMapping.length} mapped</div>
                    <div>• Detection Methods: {scenario.detectionTypes.length} technologies</div>
                    <div>• Attack Vectors: {scenario.subcategories.length} subcategories</div>
                    <div>• POV Templates: Executive, Technical, Competitive available</div>
                  </div>
                </div>
              }
              onCommand={(command) => {
                userActivityService.trackActivity('pov-terminal-command', 'unified-creator', {
                  scenarioKey,
                  command: command.split(' ')[0],
                  fullCommand: command
                });
              }}
            />
            
            <div className="mt-3 bg-cortex-bg-tertiary rounded-lg p-4">
              <div className="font-medium text-cortex-text-secondary mb-2">🎯 POV Workflow Commands:</div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm font-mono">
                <div className="space-y-2">
                  <div className="text-xs text-cortex-text-muted mb-1">Setup & Configuration:</div>
                  <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                    <span className="truncate">pov init "Customer" --scenarios {scenarioKey}</span>
                    <button className="text-cortex-text-muted hover:text-cortex-green text-xs ml-2" onClick={() => navigator.clipboard?.writeText(`pov init "Customer Name" --scenarios ${scenarioKey}`)}>
                      📋
                    </button>
                  </div>
                  <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                    <span className="truncate">pov demo-setup --scenario {scenarioKey}</span>
                    <button className="text-cortex-text-muted hover:text-cortex-green text-xs ml-2" onClick={() => navigator.clipboard?.writeText(`pov demo-setup --scenario ${scenarioKey}`)}>                      
                      📋
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-cortex-text-muted mb-1">Reports & Analysis:</div>
                  <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                    <span className="truncate">pov report --format executive</span>
                    <button className="text-cortex-text-muted hover:text-cortex-green text-xs ml-2" onClick={() => navigator.clipboard?.writeText('pov report --format executive --export pdf')}>
                      📋
                    </button>
                  </div>
                  <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                    <span className="truncate">pov threat-landscape --competitor</span>
                    <button className="text-cortex-text-muted hover:text-cortex-green text-xs ml-2" onClick={() => navigator.clipboard?.writeText('pov threat-landscape --competitor-analysis')}>
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Detection and Validation Commands */}
          <div>
            <h4 className="font-semibold text-cortex-text-secondary mb-3">🔍 Detection & Validation Engine</h4>
            <TerminalWindow
              title={`Detection Validation - ${scenario.name}`}
              commands={getDetectionCommands(scenarioKey, scenario)}
              height="h-96"
              initialOutput={
                <div className="text-cyan-400">
                  <div className="text-lg font-bold mb-1">🔍 Detection Validation Terminal</div>
                  <div className="text-sm text-gray-400 mb-3">Comprehensive detection testing for {scenario.name}</div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• Detection Technologies: {scenario.detectionTypes.join(', ')}</div>
                    <div>• MITRE Techniques: {scenario.mitreMapping.join(', ')}</div>
                    <div>• Provider: {getScenarioProvider(scenarioKey).toUpperCase()}</div>
                    <div>• Attack Vectors: {scenario.subcategories.length} threat patterns</div>
                    <div>• Validation Mode: Comprehensive with false positive analysis</div>
                  </div>
                </div>
              }
              onCommand={(command) => {
                userActivityService.trackActivity('detection-terminal-command', 'unified-creator', {
                  scenarioKey,
                  command: command.split(' ')[0],
                  fullCommand: command
                });
              }}
            />
            
            <div className="mt-3 bg-cortex-bg-tertiary rounded-lg p-4">
              <div className="font-medium text-cortex-text-secondary mb-2">🔍 Detection Testing Workflow:</div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm font-mono">
                <div className="space-y-2">
                  <div className="text-xs text-cortex-text-muted mb-1">Basic Testing:</div>
                  <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                    <span className="truncate">detect test --scenario {scenarioKey}</span>
                    <button className="text-cortex-text-muted hover:text-cortex-green text-xs ml-2" onClick={() => navigator.clipboard?.writeText(`detect test --scenario ${scenarioKey} --all-rules --verbose`)}>
                      📋
                    </button>
                  </div>
                  <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                    <span className="truncate">mitre validate --techniques</span>
                    <button className="text-cortex-text-muted hover:text-cortex-green text-xs ml-2" onClick={() => navigator.clipboard?.writeText(`mitre validate --techniques ${scenario.mitreMapping.join(',')} --coverage-report`)}>
                      📋
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-cortex-text-muted mb-1">Advanced Analysis:</div>
                  <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                    <span className="truncate">threat-hunt --behavioral</span>
                    <button className="text-cortex-text-muted hover:text-cortex-green text-xs ml-2" onClick={() => navigator.clipboard?.writeText('threat-hunt --ioc-sweep --behavioral-analysis')}>
                      📋
                    </button>
                  </div>
                  <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                    <span className="truncate">runtime-scan --monitor</span>
                    <button className="text-cortex-text-muted hover:text-cortex-green text-xs ml-2" onClick={() => navigator.clipboard?.writeText('runtime-scan --monitor-containers --detect-escapes')}>
                      📋
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-cortex-text-muted mb-1">Reporting:</div>
                  <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                    <span className="truncate">detect report --technical</span>
                    <button className="text-cortex-text-muted hover:text-cortex-green text-xs ml-2" onClick={() => navigator.clipboard?.writeText(`detect report --scenario ${scenarioKey} --format technical --export pdf`)}>
                      📋
                    </button>
                  </div>
                  <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                    <span className="truncate">metrics --coverage</span>
                    <button className="text-cortex-text-muted hover:text-cortex-green text-xs ml-2" onClick={() => navigator.clipboard?.writeText(`scenario metrics --scenario-type ${scenarioKey} --detection-coverage`)}>
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Monitoring and Analysis Commands */}
          <div>
            <h4 className="font-semibold text-cortex-text-secondary mb-3">📈 Monitoring & Analysis Dashboard</h4>
            <TerminalWindow
              title={`Real-time Monitoring - ${scenario.name}`}
              commands={[
                `# Real-time scenario monitoring and analysis`,
                `monitor start --scenario ${scenarioKey} --real-time --alerts`,
                ``,
                `# Performance metrics and KPIs`,
                `metrics dashboard --scenario ${scenarioKey} --kpi-view --export json`,
                ``,
                `# Threat intelligence correlation`,
                `threat-intel correlate --scenario ${scenarioKey} --ioc-feeds --reputation-check`,
                ``,
                `# Continuous compliance checking`,
                `compliance check --framework mitre,nist --scenario ${scenarioKey} --auto-remediate`,
                ``,
                `# Log analysis and forensics`,
                `forensics analyze --scenario ${scenarioKey} --timeline --artifact-collection`,
                ``,
                `# Executive summary generation`,
                `summary generate --scenario ${scenarioKey} --stakeholder executive --include-recommendations`
              ]}
              height="h-64"
              initialOutput={
                <div className="text-cyan-400">
                  <div className="text-lg font-bold mb-1">📈 Monitoring Dashboard Terminal</div>
                  <div className="text-sm text-gray-400 mb-3">Comprehensive monitoring and analysis for {scenario.name}</div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• Real-time Alerts: Enabled for {scenario.businessImpact.split(' - ')[0].toLowerCase()} risk events</div>
                    <div>• KPI Tracking: MITRE coverage, detection efficiency, false positive rate</div>
                    <div>• Threat Intel: Integrated with IOC feeds and reputation services</div>
                    <div>• Compliance: MITRE ATT&CK, NIST, ISO 27001 framework alignment</div>
                    <div>• Forensics: Timeline analysis and artifact preservation ready</div>
                  </div>
                </div>
              }
              onCommand={(command) => {
                userActivityService.trackActivity('monitoring-terminal-command', 'unified-creator', {
                  scenarioKey,
                  command: command.split(' ')[0],
                  fullCommand: command
                });
              }}
            />
            
            <div className="mt-3 bg-cortex-bg-tertiary rounded-lg p-4">
              <div className="font-medium text-cortex-text-secondary mb-2">📈 Monitoring & Analysis Workflows:</div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm font-mono">
                <div className="space-y-2">
                  <div className="text-xs text-cortex-text-muted mb-1">Real-time Monitoring:</div>
                  <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                    <span className="truncate">monitor start --real-time</span>
                    <button className="text-cortex-text-muted hover:text-cortex-green text-xs ml-2" onClick={() => navigator.clipboard?.writeText(`monitor start --scenario ${scenarioKey} --real-time --alerts`)}>
                      📋
                    </button>
                  </div>
                  <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                    <span className="truncate">metrics dashboard --kpi</span>
                    <button className="text-cortex-text-muted hover:text-cortex-green text-xs ml-2" onClick={() => navigator.clipboard?.writeText(`metrics dashboard --scenario ${scenarioKey} --kpi-view --export json`)}>
                      📋
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-cortex-text-muted mb-1">Analysis & Reporting:</div>
                  <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                    <span className="truncate">forensics analyze --timeline</span>
                    <button className="text-cortex-text-muted hover:text-cortex-green text-xs ml-2" onClick={() => navigator.clipboard?.writeText(`forensics analyze --scenario ${scenarioKey} --timeline --artifact-collection`)}>
                      📋
                    </button>
                  </div>
                  <div className="text-cortex-green bg-black p-2 rounded flex justify-between items-center">
                    <span className="truncate">summary executive --recs</span>
                    <button className="text-cortex-text-muted hover:text-cortex-green text-xs ml-2" onClick={() => navigator.clipboard?.writeText(`summary generate --scenario ${scenarioKey} --stakeholder executive --include-recommendations`)}>
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="bg-cortex-bg-tertiary rounded-lg p-6">
            <h4 className="font-semibold text-cortex-text-secondary mb-4">🏃‍♂️ Quick Actions</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <CortexButton
                variant="primary"
                icon="🚀"
                onClick={() => {
                  userActivityService.trackActivity('scenario-deploy-click', 'unified-creator', { scenarioKey });
                  console.log(`scenario generate --scenario-type ${scenarioKey} --provider ${getScenarioProvider(scenarioKey)} --auto-validate`);
                }}
              >
                Deploy Scenario
              </CortexButton>
              <CortexButton
                variant="outline"
                icon="🎯"
                onClick={() => {
                  userActivityService.trackActivity('pov-integration-click', 'unified-creator', { scenarioKey });
                  console.log(`pov init "Customer Name" --template technical-deep-dive --scenarios ${scenarioKey}`);
                }}
              >
                Integrate with POV
              </CortexButton>
              <CortexButton
                variant="outline"
                icon="🔍"
                onClick={() => {
                  userActivityService.trackActivity('detection-test-click', 'unified-creator', { scenarioKey });
                  console.log(`detect test --scenario ${scenarioKey} --all-rules`);
                }}
              >
                Test Detections
              </CortexButton>
              <CortexButton
                variant="outline"
                icon="📈"
                onClick={() => {
                  userActivityService.trackActivity('monitoring-start-click', 'unified-creator', { scenarioKey });
                  console.log(`monitor start --scenario ${scenarioKey} --real-time --alerts`);
                }}
              >
                Start Monitoring
              </CortexButton>
            </div>
            
            <div className="mt-4 pt-4 border-t border-cortex-border-secondary">
              <div className="flex flex-wrap gap-2 text-sm">
                <div className="flex items-center space-x-2 px-3 py-1 bg-cortex-bg-primary rounded">
                  <span className="text-cortex-text-muted">Provider:</span>
                  <span className="text-cortex-text-primary font-mono">{getScenarioProvider(scenarioKey).toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-cortex-bg-primary rounded">
                  <span className="text-cortex-text-muted">MITRE:</span>
                  <span className="text-cortex-text-primary font-mono">{scenario.mitreMapping.length} techniques</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-cortex-bg-primary rounded">
                  <span className="text-cortex-text-muted">Impact:</span>
                  <span className={`font-mono ${
                    scenario.businessImpact.startsWith('Critical') ? 'text-cortex-error' :
                    scenario.businessImpact.startsWith('High') ? 'text-cortex-warning' :
                    'text-cortex-info'
                  }`}>
                    {scenario.businessImpact.split(' - ')[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UnifiedContentCreator: React.FC<ScenarioCreatorProps> = ({ 
  mode, 
  onModeChange, 
  selectedLibraryItem,
  onClearLibraryItem 
}) => {
  const [view, setView] = useState<'overview' | 'detail' | 'create'>('overview');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<'enhanced' | 'manual'>('enhanced');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Get unique categories for filtering
  const categories = ['all', ...Array.from(new Set(Object.values(POV_DETECTION_SCENARIOS).flatMap(s => s.subcategories)))]
    .sort();

  // Filter scenarios based on search and category
  const filteredScenarios = Object.entries(POV_DETECTION_SCENARIOS).filter(([key, scenario]) => {
    const matchesSearch = searchTerm === '' || 
      scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.subcategories.some(sub => sub.includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || 
      scenario.subcategories.includes(filterCategory);
    
    return matchesSearch && matchesCategory;
  });

  const handleScenarioSelect = (scenarioKey: string) => {
    setSelectedScenario(scenarioKey);
    setView('detail');
  };

  const handleCreateContent = (scenarioKey: string, creationMode: 'enhanced' | 'manual') => {
    setSelectedScenario(scenarioKey);
    setCreateMode(creationMode);
    setView('create');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cortex-text-primary">POV Detection Scenarios</h1>
          <p className="text-cortex-text-secondary mt-1">
            Comprehensive library of {Object.keys(POV_DETECTION_SCENARIOS).length} security scenarios for proof-of-value demonstrations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <CortexButton 
            onClick={() => onModeChange('library')}
            variant="outline" 
            icon="📚"
            tooltip="Browse content library"
          >
            Library
          </CortexButton>
          <CortexButton 
            onClick={() => onModeChange(mode === 'unified' ? 'enhanced' : 'unified')}
            variant="outline" 
            icon="🔄"
          >
            Switch Mode
          </CortexButton>
        </div>
      </div>
      
      {/* Selected Library Item */}
      {selectedLibraryItem && (
        <div className="cortex-card p-6 border-cortex-info">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-cortex-text-primary">📚 Library Item Selected</h3>
            <CortexButton
              onClick={onClearLibraryItem}
              variant="outline"
              size="sm"
              icon="✕"
            >
              Clear Selection
            </CortexButton>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-cortex-text-primary mb-2">{selectedLibraryItem.title}</h4>
              <p className="text-sm text-cortex-text-secondary mb-3">{selectedLibraryItem.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedLibraryItem.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs bg-cortex-info/10 text-cortex-info rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="space-y-2 text-sm text-cortex-text-secondary">
                <div><strong>Category:</strong> {selectedLibraryItem.category.replace('-', ' ')}</div>
                <div><strong>Difficulty:</strong> {selectedLibraryItem.difficulty}</div>
                <div><strong>Version:</strong> {selectedLibraryItem.version}</div>
                <div><strong>Rating:</strong> ⭐ {selectedLibraryItem.rating}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Search and Filter */}
      <div className="cortex-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Search Scenarios
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
              placeholder="Search by name, description, or category..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Filter by Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>
                  {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map(([key, scenario]) => (
          <ScenarioOverviewCard
            key={key}
            scenarioKey={key}
            scenario={scenario}
            onSelect={handleScenarioSelect}
          />
        ))}
      </div>
      
      {filteredScenarios.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-2">No Scenarios Found</h3>
          <p className="text-cortex-text-secondary">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );

  const renderDetail = () => {
    if (!selectedScenario || !POV_DETECTION_SCENARIOS[selectedScenario]) {
      return (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-2">Scenario Not Found</h3>
          <CortexButton onClick={() => setView('overview')} variant="primary">
            Back to Overview
          </CortexButton>
        </div>
      );
    }

    return (
      <ScenarioDetailView
        scenarioKey={selectedScenario}
        scenario={POV_DETECTION_SCENARIOS[selectedScenario]}
        onBack={() => setView('overview')}
        onCreateContent={handleCreateContent}
      />
    );
  };

  const renderCreate = () => {
    if (!selectedScenario) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CortexButton onClick={() => setView('detail')} variant="outline" size="sm" icon="←">
              Back to Details
            </CortexButton>
            <div>
              <h1 className="text-2xl font-bold text-cortex-text-primary">
                Create Content: {POV_DETECTION_SCENARIOS[selectedScenario].name}
              </h1>
              <p className="text-cortex-text-secondary mt-1">
                Using {createMode === 'enhanced' ? 'Enhanced Template-based' : 'Manual Form-based'} Creator
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CortexButton 
              onClick={() => setCreateMode(createMode === 'enhanced' ? 'manual' : 'enhanced')}
              variant="outline" 
              icon="🔄"
            >
              Switch to {createMode === 'enhanced' ? 'Manual' : 'Enhanced'}
            </CortexButton>
          </div>
        </div>
        
        {createMode === 'enhanced' ? (
          <EnhancedContentCreator />
        ) : (
          <ManualCreationGUI />
        )}
      </div>
    );
  };

  // Render based on current view
  switch (view) {
    case 'detail':
      return renderDetail();
    case 'create':
      return renderCreate();
    default:
      return renderOverview();
  }
};

export default UnifiedContentCreator;