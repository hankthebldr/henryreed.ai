'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedContentCreator } from './EnhancedContentCreator';
import { ManualCreationGUI } from './ManualCreationGUI';
import { ContentItem } from './ContentLibrary';
import CortexButton from './CortexButton';

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
      
      {/* Command Integration */}
      <div className="cortex-card p-6">
        <h3 className="text-xl font-bold text-cortex-text-primary mb-4">⚡ Terminal Integration</h3>
        
        <div className="space-y-3">
          <div className="bg-cortex-bg-tertiary rounded-lg p-4">
            <h4 className="font-semibold text-cortex-text-secondary mb-2">Deploy Scenario via Terminal</h4>
            <div className="font-mono text-sm text-cortex-green bg-black p-3 rounded">
              scenario generate --scenario-type {scenarioKey} --provider gcp --auto-validate
            </div>
          </div>
          
          <div className="bg-cortex-bg-tertiary rounded-lg p-4">
            <h4 className="font-semibold text-cortex-text-secondary mb-2">POV Integration</h4>
            <div className="font-mono text-sm text-cortex-green bg-black p-3 rounded">
              pov init "Customer Name" --template technical-deep-dive --scenarios {scenarioKey}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <CortexButton
              variant="outline"
              icon="🚀"
              onClick={() => {
                console.log(`scenario generate --scenario-type ${scenarioKey} --provider gcp`);
              }}
            >
              Deploy Now
            </CortexButton>
            <CortexButton
              variant="outline"
              icon="📋"
              onClick={() => {
                console.log(`scenario list --scenario-type ${scenarioKey}`);
              }}
            >
              View Templates
            </CortexButton>
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