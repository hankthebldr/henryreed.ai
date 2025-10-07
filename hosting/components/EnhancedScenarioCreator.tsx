'use client';

import React, { useState, useRef, useEffect } from 'react';
import CortexButton from './CortexButton';
import ImprovedTerminal from './ImprovedTerminal';
import userActivityService from '../lib/user-activity-service';

// Import scenario commands and types
import { scenarioCommands } from '../lib/scenario-commands';
import { SCENARIO_TEMPLATES, ScenarioType, Provider } from '../lib/scenario-types';

export interface ScenarioCreatorProps {
  className?: string;
  selectedScenario?: string;
  onScenarioCreated?: (scenario: any) => void;
  integratedTerminal?: boolean;
}

interface ScenarioFormData {
  name: string;
  description: string;
  scenarioType: ScenarioType;
  provider: Provider;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedDuration: string;
  objectives: string[];
  detectionRules: string[];
  mitreMapping: string[];
  tags: string[];
  customFields: Record<string, any>;
}

const SCENARIO_TYPES: { value: ScenarioType; label: string; description: string; icon: string }[] = [
  { value: 'cloud-posture', label: 'Cloud Security Posture', description: 'Misconfigured cloud resources and compliance violations', icon: '☁️' },
  { value: 'container-vuln', label: 'Container Vulnerabilities', description: 'Container security threats and runtime protection', icon: '📦' },
  { value: 'code-vuln', label: 'Application Security', description: 'Code-level vulnerabilities and injection attacks', icon: '💻' },
  { value: 'insider-threat', label: 'Insider Threats', description: 'Malicious or negligent insider activities', icon: '🕵️' },
  { value: 'ransomware', label: 'Ransomware Attack', description: 'Multi-stage ransomware simulation', icon: '🔐' },
  { value: 'waas-exploit', label: 'Web App Attacks', description: 'OWASP Top 10 and web application exploits', icon: '🌐' },
  { value: 'apt-simulation', label: 'APT Campaign', description: 'Advanced persistent threat simulation', icon: '🎯' },
  { value: 'supply-chain', label: 'Supply Chain', description: 'Third-party software compromise', icon: '🔗' },
  { value: 'ai-threat', label: 'AI/ML Threats', description: 'AI system attacks and prompt injection', icon: '🤖' },
  { value: 'pipeline-breach', label: 'CI/CD Pipeline', description: 'Development pipeline security', icon: '🚀' },
  { value: 'identity-compromise', label: 'Identity Attacks', description: 'Credential stuffing and privilege escalation', icon: '🔑' },
  { value: 'lateral-movement-sim', label: 'Lateral Movement', description: 'Post-compromise network movement', icon: '↔️' },
  { value: 'data-exfil-behavior', label: 'Data Exfiltration', description: 'Abnormal data access patterns', icon: '📤' },
  { value: 'beacon-emulation', label: 'C&C Communications', description: 'Command and control beaconing', icon: '📡' },
  { value: 'phishing-sim', label: 'Phishing Campaign', description: 'Advanced phishing simulations', icon: '🎣' },
  { value: 'social-engineering', label: 'Social Engineering', description: 'Human manipulation techniques', icon: '🎭' },
  { value: 'zero-day-simulation', label: 'Zero-Day Exploits', description: 'Unknown vulnerability exploitation', icon: '🔥' },
  { value: 'evasion-techniques', label: 'Evasion Methods', description: 'Anti-detection techniques', icon: '👻' },
  { value: 'iot-security', label: 'IoT Security', description: 'Internet of Things vulnerabilities', icon: '🏠' },
  { value: 'ot-security', label: 'OT Security', description: 'Operational technology threats', icon: '🏭' }
];

const PROVIDERS: { value: Provider; label: string; icon: string; description: string }[] = [
  { value: 'gcp', label: 'Google Cloud', icon: '🌐', description: 'Deploy on Google Cloud Platform' },
  { value: 'aws', label: 'Amazon Web Services', icon: '☁️', description: 'Deploy on AWS' },
  { value: 'azure', label: 'Microsoft Azure', icon: '🔷', description: 'Deploy on Azure' },
  { value: 'k8s', label: 'Kubernetes', icon: '⚙️', description: 'Deploy on Kubernetes cluster' },
  { value: 'local', label: 'Local Environment', icon: '💻', description: 'Local development environment' }
];

const EnhancedScenarioCreator: React.FC<ScenarioCreatorProps> = ({
  className = '',
  selectedScenario,
  onScenarioCreated,
  integratedTerminal = true
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'terminal' | 'deploy'>('create');
  const [formData, setFormData] = useState<ScenarioFormData>({
    name: '',
    description: '',
    scenarioType: 'cloud-posture',
    provider: 'gcp',
    difficulty: 'intermediate',
    estimatedDuration: '30-60 minutes',
    objectives: [''],
    detectionRules: [''],
    mitreMapping: [''],
    tags: [],
    customFields: {}
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalCommands, setTerminalCommands] = useState<string[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState<{
    active: boolean;
    deploymentId?: string;
    status?: string;
    progress?: number;
  }>({ active: false });

  const terminalRef = useRef<any>(null);

  // Initialize with selected scenario if provided
  useEffect(() => {
    if (selectedScenario && SCENARIO_TEMPLATES[selectedScenario as ScenarioType]) {
      const template = SCENARIO_TEMPLATES[selectedScenario as ScenarioType][0];
      if (template) {
        setFormData(prev => ({
          ...prev,
          name: template.name,
          description: template.description,
          scenarioType: selectedScenario as ScenarioType,
          difficulty: template.difficulty,
          estimatedDuration: template.estimatedDuration,
          tags: template.tags
        }));
      }
    }
  }, [selectedScenario]);

  const handleInputChange = (field: keyof ScenarioFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Track user activity
    userActivityService.trackActivity('scenario-field-change', 'scenario-creator', {
      field,
      scenarioType: formData.scenarioType,
      timestamp: new Date().toISOString()
    });
  };

  const handleArrayFieldChange = (field: 'objectives' | 'detectionRules' | 'mitreMapping', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field: 'objectives' | 'detectionRules' | 'mitreMapping') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field: 'objectives' | 'detectionRules' | 'mitreMapping', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const generateTerminalCommands = () => {
    const commands = [
      `# Generate ${formData.scenarioType} scenario`,
      `scenario generate --scenario-type ${formData.scenarioType} --provider ${formData.provider}`,
      '',
      '# List available templates',
      `scenario list --scenario-type ${formData.scenarioType}`,
      '',
      '# Deploy scenario (after generation)',
      'scenario deploy <deployment-id>',
      '',
      '# Monitor deployment status',
      'scenario status <deployment-id>',
      '',
      '# Validate scenario results',
      'scenario validate <deployment-id>',
      '',
      '# Clean up resources',
      'scenario destroy <deployment-id>'
    ];
    
    setTerminalCommands(commands);
    setShowTerminal(true);
    setActiveTab('terminal');
  };

  const executeScenarioGeneration = async () => {
    setIsCreating(true);
    
    try {
      // Track activity
      userActivityService.trackActivity('scenario-generate', 'scenario-creator', {
        scenarioType: formData.scenarioType,
        provider: formData.provider,
        name: formData.name
      });

      // Add timeline event
      userActivityService.addTimelineEvent({
        type: 'scenario-generated',
        title: 'Scenario Generated',
        description: `Generated ${formData.scenarioType} scenario: ${formData.name}`,
        metadata: { 
          scenarioType: formData.scenarioType, 
          provider: formData.provider,
          difficulty: formData.difficulty
        },
        priority: 'medium',
        category: 'technical'
      });

      // Execute the scenario generate command
      const result = await scenarioCommands.generate([
        '--scenario-type', formData.scenarioType,
        '--provider', formData.provider,
        '--name', formData.name || `${formData.scenarioType}-scenario`
      ]);

      // Simulate deployment ID generation
      const deploymentId = `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
      
      setDeploymentStatus({
        active: true,
        deploymentId,
        status: 'generating',
        progress: 25
      });

      // Simulate progress updates
      setTimeout(() => {
        setDeploymentStatus(prev => ({ ...prev, status: 'deploying', progress: 50 }));
      }, 2000);

      setTimeout(() => {
        setDeploymentStatus(prev => ({ ...prev, status: 'validating', progress: 75 }));
      }, 4000);

      setTimeout(() => {
        setDeploymentStatus(prev => ({ ...prev, status: 'ready', progress: 100 }));
      }, 6000);

      if (onScenarioCreated) {
        onScenarioCreated({
          ...formData,
          deploymentId,
          createdAt: new Date().toISOString()
        });
      }

      // Switch to deployment tab to show progress
      setActiveTab('deploy');
      
    } catch (error) {
      console.error('Failed to generate scenario:', error);
      setDeploymentStatus({ active: false });
    } finally {
      setIsCreating(false);
    }
  };

  const renderCreateForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Scenario Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Enter scenario name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the scenario objectives and scope"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Scenario Type</label>
            <select
              value={formData.scenarioType}
              onChange={(e) => handleInputChange('scenarioType', e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              {SCENARIO_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-400 mt-1">
              {SCENARIO_TYPES.find(t => t.value === formData.scenarioType)?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cloud Provider</label>
            <select
              value={formData.provider}
              onChange={(e) => handleInputChange('provider', e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              {PROVIDERS.map(provider => (
                <option key={provider.value} value={provider.value}>
                  {provider.icon} {provider.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty Level</label>
            <select
              value={formData.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">🟢 Beginner</option>
              <option value="intermediate">🟡 Intermediate</option>
              <option value="advanced">🟠 Advanced</option>
              <option value="expert">🔴 Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Duration</label>
            <select
              value={formData.estimatedDuration}
              onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="15-30 minutes">15-30 minutes</option>
              <option value="30-60 minutes">30-60 minutes</option>
              <option value="1-2 hours">1-2 hours</option>
              <option value="2-4 hours">2-4 hours</option>
              <option value="4+ hours">4+ hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Objectives</label>
            {formData.objectives.map((objective, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => handleArrayFieldChange('objectives', index, e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                  placeholder={`Objective ${index + 1}`}
                />
                <button
                  onClick={() => removeArrayField('objectives', index)}
                  className="px-2 py-1 text-red-400 hover:bg-red-900/20 rounded text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayField('objectives')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              + Add Objective
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Detection Rules</label>
          {formData.detectionRules.map((rule, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={rule}
                onChange={(e) => handleArrayFieldChange('detectionRules', index, e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                placeholder={`Detection rule ${index + 1}`}
              />
              <button
                onClick={() => removeArrayField('detectionRules', index)}
                className="px-2 py-1 text-red-400 hover:bg-red-900/20 rounded text-sm"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => addArrayField('detectionRules')}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            + Add Detection Rule
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">MITRE ATT&CK Mapping</label>
          {formData.mitreMapping.map((technique, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={technique}
                onChange={(e) => handleArrayFieldChange('mitreMapping', index, e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                placeholder="T1078, T1110, etc."
              />
              <button
                onClick={() => removeArrayField('mitreMapping', index)}
                className="px-2 py-1 text-red-400 hover:bg-red-900/20 rounded text-sm"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => addArrayField('mitreMapping')}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            + Add MITRE Technique
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-700">
        <div className="flex space-x-3">
          <CortexButton
            variant="outline"
            icon="📋"
            onClick={generateTerminalCommands}
            tooltip="Generate terminal commands for this scenario"
          >
            Show Commands
          </CortexButton>
          <CortexButton
            variant="ghost"
            icon="📚"
            onClick={() => setActiveTab('library')}
          >
            Browse Templates
          </CortexButton>
        </div>

        <CortexButton
          variant="primary"
          icon="🚀"
          onClick={executeScenarioGeneration}
          loading={isCreating}
          disabled={!formData.name || !formData.description}
          size="lg"
          gradient={true}
          successMessage="Scenario generated successfully!"
          trackActivity={true}
          activityContext="scenario-generation"
        >
          {isCreating ? 'Generating...' : 'Generate Scenario'}
        </CortexButton>
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-bold text-gray-300 mb-2">Scenario Library</h3>
        <p className="text-gray-400 mb-6">Browse pre-built scenario templates and examples</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {SCENARIO_TYPES.slice(0, 6).map(type => (
            <div key={type.value} className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">{type.icon}</div>
              <h4 className="font-bold text-white mb-1">{type.label}</h4>
              <p className="text-sm text-gray-400 mb-3">{type.description}</p>
              <button
                onClick={() => {
                  handleInputChange('scenarioType', type.value);
                  setActiveTab('create');
                }}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Use Template →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTerminal = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Integrated Terminal</h3>
        <div className="flex space-x-2">
          <CortexButton
            variant="ghost"
            size="sm"
            icon="📋"
            onClick={() => {
              if (terminalCommands.length > 0) {
                navigator.clipboard.writeText(terminalCommands.join('\n'));
              }
            }}
          >
            Copy Commands
          </CortexButton>
          <CortexButton
            variant="outline"
            size="sm"
            icon="🔄"
            onClick={generateTerminalCommands}
          >
            Refresh
          </CortexButton>
        </div>
      </div>

      {showTerminal && terminalCommands.length > 0 && (
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 mb-4">
          <div className="text-sm font-medium text-gray-300 mb-2">Generated Commands:</div>
          <pre className="text-sm text-green-400 font-mono bg-black p-3 rounded overflow-x-auto">
            {terminalCommands.join('\n')}
          </pre>
        </div>
      )}

      <div className="bg-gray-900 rounded-lg border border-gray-700">
        {/* The ImprovedTerminal component does not currently accept ref or extra props. */}
        {/* Preserving intended integration details as comments per non-deletion policy: */}
        {/*
        <ImprovedTerminal 
          ref={terminalRef}
          className="min-h-96"
          initialCommands={[
            'echo "🔬 Scenario Creator Terminal - Ready for commands"',
            'echo "Type \'help scenario\' for scenario-specific commands"',
            ''
          ]}
          onCommand={(command) => {
            // Track terminal usage
            userActivityService.trackActivity('terminal-command', 'scenario-creator', {
              command: command.split(' ')[0],
              fullCommand: command,
              context: 'scenario-creation'
            });
          }}
        />
        */}
        <ImprovedTerminal />
      </div>
    </div>
  );

  const renderDeployment = () => (
    <div className="space-y-6">
      {deploymentStatus.active ? (
        <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-3xl">🚀</div>
            <div>
              <h3 className="text-xl font-bold text-white">Scenario Deployment</h3>
              <p className="text-gray-400">ID: {deploymentStatus.deploymentId}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>Status: {deploymentStatus.status}</span>
              <span>{deploymentStatus.progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${deploymentStatus.progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-400">Type:</span> 
                <span className="ml-2 text-white">{formData.scenarioType}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Provider:</span> 
                <span className="ml-2 text-white">{formData.provider}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Difficulty:</span> 
                <span className="ml-2 text-white">{formData.difficulty}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-400">Duration:</span> 
                <span className="ml-2 text-white">{formData.estimatedDuration}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Objectives:</span> 
                <span className="ml-2 text-white">{formData.objectives.filter(o => o).length}</span>
              </div>
            </div>
          </div>

          {deploymentStatus.status === 'ready' && (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-600 rounded-lg">
              <div className="flex items-center space-x-2 text-green-400 font-bold mb-2">
                <span>✅</span>
                <span>Deployment Ready</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                Your scenario has been successfully deployed and is ready for testing.
              </p>
              <div className="flex space-x-3">
                <CortexButton
                  variant="success"
                  size="sm"
                  icon="🧪"
                  onClick={() => {
                    setActiveTab('terminal');
                    if (terminalRef.current) {
                      terminalRef.current.executeCommand(`scenario validate ${deploymentStatus.deploymentId}`);
                    }
                  }}
                >
                  Validate
                </CortexButton>
                <CortexButton
                  variant="outline"
                  size="sm"
                  icon="📊"
                  onClick={() => {
                    setActiveTab('terminal');
                    if (terminalRef.current) {
                      terminalRef.current.executeCommand(`scenario status ${deploymentStatus.deploymentId}`);
                    }
                  }}
                >
                  Check Status
                </CortexButton>
                <CortexButton
                  variant="danger"
                  size="sm"
                  icon="🗑️"
                  onClick={() => {
                    setActiveTab('terminal');
                    if (terminalRef.current) {
                      terminalRef.current.executeCommand(`scenario destroy ${deploymentStatus.deploymentId}`);
                    }
                  }}
                  confirmAction={true}
                  confirmMessage="Are you sure you want to destroy this scenario deployment?"
                >
                  Destroy
                </CortexButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">No Active Deployments</h3>
          <p className="text-gray-400 mb-6">Create and generate a scenario to see deployment status here.</p>
          <CortexButton
            variant="primary"
            icon="🔬"
            onClick={() => setActiveTab('create')}
          >
            Create Scenario
          </CortexButton>
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🔬</div>
            <div>
              <h2 className="text-2xl font-bold text-white">Enhanced Scenario Creator</h2>
              <p className="text-gray-400">Create, deploy, and manage security testing scenarios</p>
            </div>
          </div>

          {deploymentStatus.active && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-900/20 border border-blue-600 rounded-lg">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-400">Active Deployment</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          {[
            { id: 'create', name: 'Create', icon: '🔬', description: 'Create new scenario' },
            { id: 'library', name: 'Library', icon: '📚', description: 'Browse templates' },
            { id: 'terminal', name: 'Terminal', icon: '💻', description: 'Command interface' },
            { id: 'deploy', name: 'Deploy', icon: '🚀', description: 'Deployment status' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              title={tab.description}
              className={`group flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700 hover:shadow-md'
              }`}
            >
              <span className="group-hover:scale-110 transition-transform">{tab.icon}</span>
              <span>{tab.name}</span>
              {tab.id === 'deploy' && deploymentStatus.active && (
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'create' && renderCreateForm()}
        {activeTab === 'library' && renderLibrary()}
        {activeTab === 'terminal' && renderTerminal()}
        {activeTab === 'deploy' && renderDeployment()}
      </div>
    </div>
  );
};

export default EnhancedScenarioCreator;