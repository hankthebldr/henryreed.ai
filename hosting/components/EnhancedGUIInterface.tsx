'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '../contexts/AppStateContext';
import { useCommandExecutor } from '../hooks/useCommandExecutor';
import EnhancedTerminalSidebar from './EnhancedTerminalSidebar';
import CortexButton from './CortexButton';
import { cn } from '../lib/utils';

interface GUISection {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  commands: {
    name: string;
    command: string;
    description: string;
    variant: 'primary' | 'secondary' | 'outline';
    icon?: string;
    disabled?: boolean;
  }[];
}

const EnhancedGUIInterface: React.FC = () => {
  const router = useRouter();
  const { state, actions } = useAppState();
  const { run: executeCommand, isRunning } = useCommandExecutor();
  const [terminalExpanded, setTerminalExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('overview');

  // GUI sections configuration
  const guiSections: GUISection[] = useMemo(() => [
    {
      id: 'overview',
      title: 'Platform Overview',
      description: 'Quick status and system information',
      icon: '🎯',
      color: 'text-cortex-green',
      commands: [
        {
          name: 'System Status',
          command: 'whoami',
          description: 'Check current user and system status',
          variant: 'outline',
          icon: '👤'
        },
        {
          name: 'List Available Commands',
          command: 'help',
          description: 'Show all available terminal commands',
          variant: 'outline',
          icon: '📖'
        }
      ]
    },
    {
      id: 'pov-management',
      title: 'POV Management',
      description: 'Create and manage Proof of Value projects',
      icon: '📊',
      color: 'text-cortex-info',
      commands: [
        {
          name: 'Create New POV',
          command: 'pov init --interactive',
          description: 'Start interactive POV creation wizard',
          variant: 'primary',
          icon: '🚀',
          disabled: !!state.data.currentPovId
        },
        {
          name: 'POV Status',
          command: 'pov status --current --detailed',
          description: 'Check current POV project status',
          variant: 'secondary',
          icon: '📋',
          disabled: !state.data.currentPovId
        },
        {
          name: 'Generate Report',
          command: 'pov report --format executive --export pdf',
          description: 'Generate executive summary report',
          variant: 'outline',
          icon: '📄',
          disabled: !state.data.currentPovId
        }
      ]
    },
    {
      id: 'scenarios',
      title: 'Security Scenarios',
      description: 'Deploy and manage security testing scenarios',
      icon: '🛡️',
      color: 'text-cortex-warning',
      commands: [
        {
          name: 'List Scenarios',
          command: 'scenario list --detailed',
          description: 'View all available security scenarios',
          variant: 'outline',
          icon: '📋'
        },
        {
          name: 'Deploy Cloud Security',
          command: 'scenario generate --type cloud-posture --provider auto',
          description: 'Deploy cloud security posture scenario',
          variant: 'primary',
          icon: '☁️'
        },
        {
          name: 'Container Vulnerability',
          command: 'scenario generate --type container-vuln --severity high',
          description: 'Deploy container vulnerability scenario',
          variant: 'secondary',
          icon: '📦'
        },
        {
          name: 'Ransomware Simulation',
          command: 'scenario generate --type ransomware --safe-mode',
          description: 'Deploy ransomware simulation in safe mode',
          variant: 'outline',
          icon: '⚠️'
        }
      ]
    },
    {
      id: 'monitoring',
      title: 'Detection & Monitoring',
      description: 'Monitor deployments and validate detection rules',
      icon: '🔍',
      color: 'text-cortex-text-accent',
      commands: [
        {
          name: 'Start Monitoring',
          command: 'monitor start --real-time --alerts',
          description: 'Begin real-time monitoring with alerts',
          variant: 'primary',
          icon: '🔴'
        },
        {
          name: 'Test Detection Rules',
          command: 'detect test --all-rules --coverage-report',
          description: 'Comprehensive detection rule validation',
          variant: 'secondary',
          icon: '🎯'
        },
        {
          name: 'MITRE Validation',
          command: 'mitre validate --techniques all --coverage-report',
          description: 'Validate MITRE ATT&CK technique coverage',
          variant: 'outline',
          icon: '📊'
        }
      ]
    },
    {
      id: 'resources',
      title: 'Resources & Downloads',
      description: 'Access documentation and downloadable resources',
      icon: '📚',
      color: 'text-cortex-info',
      commands: [
        {
          name: 'Download Resources',
          command: 'download list --category all',
          description: 'Show available downloadable resources',
          variant: 'outline',
          icon: '📥'
        },
        {
          name: 'API Documentation',
          command: 'docs api --interactive',
          description: 'Open interactive API documentation',
          variant: 'secondary',
          icon: '📖'
        },
        {
          name: 'Schedule Meeting',
          command: 'contact calendar --type demo',
          description: 'Schedule a demo or consultation',
          variant: 'primary',
          icon: '📅'
        }
      ]
    }
  ], [state.data.currentPovId]);

  const handleCommandExecution = async (command: string, sectionId: string, commandName: string) => {
    // Auto-expand terminal when command is executed
    if (!terminalExpanded) {
      setTerminalExpanded(true);
    }

    await executeCommand(command, {
      openTerminal: true,
      focus: true,
      trackActivity: {
        event: `gui-command-execute`,
        source: `enhanced-gui-${sectionId}`,
        payload: { 
          command: command.split(' ')[0], 
          commandName,
          sectionId,
          hasActivePov: !!state.data.currentPovId
        }
      },
      onSuccess: () => {
        console.log(`Command executed successfully: ${command}`);
      },
      onError: (error) => {
        console.error('Command execution failed:', error);
      }
    });
  };

  const currentSection = guiSections.find(s => s.id === activeSection) || guiSections[0];

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Main Content Area */}
      <div 
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          terminalExpanded ? 'mr-96' : 'mr-12' // Adjust margin based on terminal state
        )}
      >
        {/* Header */}
        <header className="flex-shrink-0 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Cortex Domain Consultant Platform
                </h1>
                <p className="text-cortex-text-secondary mt-1">
                  Enhanced security scenario deployment and POV management
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* POV Status Indicator */}
                {state.data.currentPovId && (
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-cortex-green/20 border border-cortex-green/30 rounded-lg">
                    <div className="w-2 h-2 bg-cortex-green rounded-full animate-pulse"></div>
                    <span className="text-sm text-cortex-green font-medium">
                      Active POV: {state.data.currentPovId}
                    </span>
                  </div>
                )}
                
                {/* Terminal Toggle */}
                <CortexButton
                  variant="outline"
                  icon="⌨️"
                  onClick={() => setTerminalExpanded(!terminalExpanded)}
                  ariaLabel={terminalExpanded ? 'Collapse terminal' : 'Expand terminal'}
                  className={cn(
                    'transition-colors',
                    terminalExpanded ? 'border-cortex-green text-cortex-green' : ''
                  )}
                >
                  {terminalExpanded ? 'Hide Terminal' : 'Show Terminal'}
                </CortexButton>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex-shrink-0 border-b border-gray-700 bg-gray-800/30">
          <div className="px-6">
            <div className="flex space-x-1 overflow-x-auto">
              {guiSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap',
                    activeSection === section.id
                      ? 'bg-gray-800 text-white border-b-2 border-cortex-green'
                      : 'text-cortex-text-secondary hover:text-gray-200 hover:bg-gray-800/50'
                  )}
                >
                  <span>{section.icon}</span>
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Section Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{currentSection.icon}</span>
                <h2 className={cn('text-xl font-semibold', currentSection.color)}>
                  {currentSection.title}
                </h2>
              </div>
              <p className="text-cortex-text-secondary">{currentSection.description}</p>
            </div>

            {/* Command Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentSection.commands.map((cmd, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 border border-gray-600 rounded-lg p-6 hover:border-gray-500 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {cmd.icon && <span className="text-xl">{cmd.icon}</span>}
                      <h3 className="font-semibold text-white">{cmd.name}</h3>
                    </div>
                  </div>
                  
                  <p className="text-cortex-text-secondary text-sm mb-4 leading-relaxed">
                    {cmd.description}
                  </p>
                  
                  <div className="space-y-2">
                    <CortexButton
                      variant={cmd.variant}
                      onClick={() => handleCommandExecution(cmd.command, currentSection.id, cmd.name)}
                      disabled={cmd.disabled || isRunning}
                      loading={isRunning}
                      className="w-full"
                      ariaLabel={`Execute ${cmd.name} command`}
                    >
                      {cmd.disabled ? 'Not Available' : 'Execute'}
                    </CortexButton>
                    
                    <div className="text-xs text-cortex-text-muted font-mono bg-gray-900/50 px-3 py-2 rounded border">
                      {cmd.command}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Section-Specific Content */}
            {activeSection === 'overview' && (
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                    <span>📈</span>
                    <span>Platform Statistics</span>
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-cortex-text-secondary">Active Sessions</span>
                      <span className="text-cortex-green font-mono">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cortex-text-secondary">Commands Available</span>
                      <span className="text-cortex-info font-mono">45+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cortex-text-secondary">Scenario Templates</span>
                      <span className="text-cortex-warning font-mono">12</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                    <span>🎯</span>
                    <span>Quick Actions</span>
                  </h3>
                  <div className="space-y-3">
                    <CortexButton
                      variant="outline"
                      className="w-full justify-start"
                      icon="📚"
                      onClick={() => handleCommandExecution('help', 'overview', 'Help')}
                    >
                      View Documentation
                    </CortexButton>
                    <CortexButton
                      variant="outline"
                      className="w-full justify-start"
                      icon="🔧"
                      onClick={() => setActiveSection('scenarios')}
                    >
                      Browse Scenarios
                    </CortexButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Terminal Sidebar */}
      <EnhancedTerminalSidebar
        defaultExpanded={terminalExpanded}
        onToggle={setTerminalExpanded}
      />
    </div>
  );
};

export default EnhancedGUIInterface;