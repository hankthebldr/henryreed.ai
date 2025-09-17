import React from 'react';
import { CommandConfig } from './commands';

export const enhancedHelpCommands: CommandConfig[] = [
  {
    name: 'help',
    description: 'Show available commands and comprehensive guidance',
    usage: 'help [command] [--category <category>] [--quick]',
    aliases: ['?', 'man'],
    handler: (args) => {
      const hasCommand = args.length > 0 && !args[0].startsWith('--');
      const category = args.includes('--category') ? args[args.indexOf('--category') + 1] : null;
      const quick = args.includes('--quick');

      // Resolve all commands dynamically without import to avoid circular deps
      const allCmds = ((globalThis as any).__ALL_COMMANDS__ as CommandConfig[] | undefined) || [];

      const inferCategory = (cmd: CommandConfig): string => {
        if (cmd.category) return cmd.category;
        const n = cmd.name.toLowerCase();
        if (n.startsWith('pov') || n.includes('proof')) return 'pov';
        if (n.startsWith('trr') || n.includes('signoff')) return 'trr';
        if (n.startsWith('template') || n === 'cdrlab' || n === 'scenario') return 'template';
        if (n.startsWith('customer') || n.includes('cloud-config')) return 'customer';
        if (n.startsWith('detect') || n.startsWith('validate')) return 'detection';
        if (n.startsWith('gemini') || n === 'ai' || n === 'cortex-questions') return 'ai';
        if (n.includes('gui') || n.includes('create-gui')) return 'gui';
        if (n.startsWith('report') || n.includes('analytics') || n.includes('metrics') || n.includes('dashboard')) return 'reporting';
        return 'system';
      };

      const grouped = allCmds
        .filter(c => !c.hidden)
        .reduce((acc: Record<string, CommandConfig[]>, c) => {
          const cat = inferCategory(c);
          acc[cat] = acc[cat] || [];
          // prevent duplicates by name
          if (!acc[cat].some(x => x.name === c.name)) acc[cat].push(c);
          return acc;
        }, {} as Record<string, CommandConfig[]>);
      
      if (hasCommand) {
        // Show detailed help for specific command - this would integrate with allCommands
        const cmdName = args[0].toLowerCase();
        return (
          <div className="text-blue-300">
            <div className="font-bold text-lg text-cyan-400">Command Help: {cmdName}</div>
            <div className="mt-2 text-gray-300">
              This command provides specific functionality within the Cortex DC Portal.
            </div>
            <div className="mt-3 text-yellow-400">
              <strong>Usage:</strong> <span className="font-mono text-white">{cmdName} [options]</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Use the navigation tabs above to explore related commands, or run <span className="font-mono text-green-400">help</span> for all available commands.
            </div>
          </div>
        );
      }

      if (quick) {
        // derive a minimal quick list from available commands
        const povQuick = allCmds.find(c => c.name === 'pov');
        const tmplQuick = allCmds.find(c => c.name === 'template');
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-3 text-lg text-cyan-400">🚀 Quick Reference</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-3 rounded border border-green-500/30">
                <div className="text-green-400 font-bold mb-2">POV Management</div>
                <div className="text-sm space-y-1">
                  <div className="font-mono text-green-300">{povQuick ? 'pov --help' : 'pov init customer-name'}</div>
                  <div className="font-mono text-blue-300">pov execute pov-id --scenario scenario-name</div>
                  <div className="font-mono text-purple-300">pov report pov-id --executive</div>
                </div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded border border-blue-500/30">
                <div className="text-blue-400 font-bold mb-2">Template Management</div>
                <div className="text-sm space-y-1">
                  <div className="font-mono text-green-300">{tmplQuick ? 'template list' : 'template list --category ransomware'}</div>
                  <div className="font-mono text-blue-300">template customize template-id</div>
                  <div className="font-mono text-purple-300">template deploy custom-template</div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              Use <span className="font-mono text-green-400">help</span> (without --quick) for comprehensive documentation.
            </div>
          </div>
        );
      }

      // Build categories dynamically
      const meta = {
        pov: { name: 'POV Management', icon: '🎯', color: 'text-green-400', description: 'Complete POV lifecycle with Gantt charts, task boards, and project management' },
        trr: { name: 'TRR Management', icon: '📊', color: 'text-orange-400', description: 'Technical Requirements Review with CSV import/export and blockchain validation' },
        template: { name: 'Templates & Cloud Detection Response', icon: '📋', color: 'text-blue-400', description: 'Security scenario templates and Cloud Detection and Response deployment' },
        customer: { name: 'Customer Management', icon: '🏢', color: 'text-purple-400', description: 'Customer environment setup, cloud provider configuration' },
        detection: { name: 'Detection & AI Generation', icon: '🔍', color: 'text-cyan-400', description: 'Detection rule generation, validation, and AI-powered analysis' },
        ai: { name: 'Gemini AI Integration', icon: '🤖', color: 'text-indigo-400', description: 'AI-powered insights, analysis, and interactive consultations' },
        gui: { name: 'GUI & Manual Creation', icon: '🛠️', color: 'text-rose-400', description: 'Notion-inspired block editor for creating POVs, templates, and scenarios' },
        reporting: { name: 'Reporting & Analytics', icon: '📊', color: 'text-yellow-400', description: 'Professional reporting, business analytics, and real-time dashboards' },
        system: { name: 'System & Utilities', icon: '⚙️', color: 'text-gray-400', description: 'System utilities, search capabilities, and session management' }
      } as const;

      const orderedKeys = ['pov','trr','template','customer','detection','ai','gui','reporting','system'];
      const selectedKeys = category ? orderedKeys.filter(k => k === category) : orderedKeys;

      return (
        <div className="text-blue-300">
          <div className="font-bold mb-4 text-xl text-cyan-400">
            🛡️ Cortex DC Portal - Command Reference
          </div>
          
          <div className="bg-cyan-900/20 p-4 rounded border border-cyan-500/30 mb-6">
            <div className="text-cyan-400 font-bold mb-2">🎯 Platform Overview</div>
            <div className="text-sm space-y-1">
              <div>• <strong>Terminal/GUI Toggle:</strong> Switch between command-line and visual interfaces</div>
              <div>• <strong>Navigation Tabs:</strong> Quick access to POV, Templates, Customers, Scenarios, TRR, and Help</div>
              <div>• <strong>AI Integration:</strong> Gemini AI for analysis, optimization, and intelligent insights</div>
              <div>• <strong>Project Management:</strong> Gantt charts, Kanban boards, and stakeholder tracking</div>
              <div>• <strong>Blockchain Security:</strong> Immutable TRR validations and audit trails</div>
              <div>• Try <span className="font-mono text-green-400">getting-started</span> for guided introduction</div>
            </div>
          </div>

          <div className="space-y-6">
            {selectedKeys.map((key) => {
              const catMeta = (meta as any)[key];
              const items = (grouped[key] || []).sort((a,b) => a.name.localeCompare(b.name));
              if (items.length === 0) return null;
              return (
                <div key={key} className="border border-gray-600 p-4 rounded">
                  <div className={`${catMeta.color} font-bold text-lg mb-2 flex items-center`}>
                    <span className="mr-2">{catMeta.icon}</span>
                    {catMeta.name}
                  </div>
                  <div className="text-gray-300 text-sm mb-3">{catMeta.description}</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {items.map(cmd => (
                      <div key={cmd.name} className="bg-gray-800/50 p-2 rounded">
                        <div className={`font-mono ${catMeta.color} text-sm`}>{cmd.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{cmd.description}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Try: <span className="font-mono text-green-400">help {items[0]?.name}</span> for detailed usage
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gray-800/50 rounded border border-gray-600">
            <div className="text-yellow-400 font-bold mb-2">💡 Pro Tips & New Features</div>
            <div className="text-sm space-y-1">
              <div>• <span className="font-mono text-green-400">help --quick</span> for condensed reference</div>
              <div>• <span className="font-mono text-blue-400">help --category trr</span> to explore TRR management</div>
              <div>• <span className="font-mono text-purple-400">create-gui</span> to access Notion-inspired block editor</div>
              <div>• <span className="font-mono text-cyan-400">gemini chat</span> for AI-powered consultations</div>
              <div>• <span className="font-mono text-orange-400">trr-signoff create</span> for blockchain-secured validations</div>
              <div>• <span className="font-mono text-rose-400">project dashboard</span> for Gantt charts and task management</div>
              <div>• Press <span className="font-mono text-gray-400">↑/↓</span> for command history, <span className="font-mono text-gray-400">Shift+Enter</span> for multi-line</div>
            </div>
          </div>
        </div>
      );
    }
  },
  {
    name: 'getting-started',
    description: 'Comprehensive introduction and onboarding guide',
    usage: 'getting-started [--workflow <workflow>] [--quick]',
    aliases: ['getting started', 'intro', 'onboard'],
    handler: (args) => {
      const workflow = args.includes('--workflow') ? args[args.indexOf('--workflow') + 1] : null;
      const quick = args.includes('--quick');

      if (quick) {
        return (
          <div className="text-blue-300">
            <div className="font-bold text-lg text-cyan-400 mb-4">🚀 Quick Start Guide</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
                <div className="text-green-400 font-bold mb-3">1. Choose Your Workflow</div>
                <div className="text-sm space-y-1">
                  <div>• Click <strong>POV Management</strong> tab for customer engagements</div>
                  <div>• Click <strong>Templates</strong> tab for scenario customization</div>
                  <div>• Click <strong>Scenarios</strong> tab for quick demonstrations</div>
                </div>
              </div>
              <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
                <div className="text-blue-400 font-bold mb-3">2. Try These Commands</div>
                <div className="text-sm space-y-1">
                  <div className="font-mono text-green-300">pov templates</div>
                  <div className="font-mono text-blue-300">template list</div>
                  <div className="font-mono text-purple-300">help --quick</div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (workflow) {
        const workflows = {
          'executive-pov': {
            name: 'Executive POV Workflow',
            icon: '🎯',
            steps: [
              'Initialize POV: pov init "Customer Name" --template executive-overview',
              'Configure environment: customer configure customer-name --xsiam-tenant tenant.xdr.paloaltonetworks.com',
              'Execute scenarios: pov execute pov-id --scenario cloud-posture --audience executive',
              'Generate report: pov report pov-id --executive --customer-branded'
            ]
          },
          'technical-demo': {
            name: 'Technical Demonstration Workflow',
            icon: '🔬',
            steps: [
              'Browse scenarios: cdrlab list scenarios',
              'Deploy scenario: cdrlab deploy --scenario cryptominer --safe --ttl 2h',
              'Generate detections: cdrlab detect gen --scenario cryptominer --pack xsiam',
              'Validate results: cdrlab validate --scenario cryptominer --checks all'
            ]
          },
          'template-customization': {
            name: 'Template Customization Workflow',
            icon: '📋',
            steps: [
              'List templates: template list --category ransomware',
              'Show details: template show advanced-ransomware-chain',
              'Customize: template customize ransomware-chain --customer customer-name',
              'Deploy custom: template deploy custom-template --dry-run'
            ]
          }
        };

        const wf = workflows[workflow as keyof typeof workflows];
        if (!wf) {
          return (
            <div className="text-red-400">
              Unknown workflow: {workflow}. Available workflows: {Object.keys(workflows).join(', ')}
            </div>
          );
        }

        return (
          <div className="text-blue-300">
            <div className="font-bold text-lg text-cyan-400 mb-4 flex items-center">
              <span className="mr-2">{wf.icon}</span>
              {wf.name}
            </div>
            <div className="space-y-3">
              {wf.steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white mb-1">{step.split(':')[0]}:</div>
                    <div className="font-mono text-green-400 text-sm bg-gray-800 p-2 rounded">
                      {step.split(':')[1]?.trim()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Comprehensive getting started guide
      return (
        <div className="text-blue-300">
          <div className="font-bold text-xl text-cyan-400 mb-4">
            🌟 Welcome to Cortex DC Portal
          </div>
          
          <div className="space-y-6">
            <div className="bg-cyan-900/20 p-4 rounded border border-cyan-500/30">
              <div className="text-cyan-400 font-bold mb-3">What is the Cortex DC Portal?</div>
              <div className="text-sm space-y-2">
                <div>A comprehensive platform designed specifically for domain consultants conducting XSIAM Proof-of-Value engagements.</div>
                <div>It provides end-to-end workflow management, from customer environment setup through professional reporting.</div>
              </div>
            </div>

            <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
              <div className="text-green-400 font-bold mb-3">🎯 Core Capabilities</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-green-300 font-bold mb-1">POV Management</div>
                  <div>• End-to-end engagement orchestration</div>
                  <div>• Customer-specific customization</div>
                  <div>• Executive and technical reporting</div>
                </div>
                <div>
                  <div className="text-blue-300 font-bold mb-1">Security Scenarios</div>
                  <div>• Pre-built threat simulations</div>
                  <div>• MITRE ATT&CK integration</div>
                  <div>• Multi-platform detection rules</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
              <div className="text-blue-400 font-bold mb-3">🚀 Navigation Guide</div>
              <div className="text-sm space-y-2">
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">🎯</span>
                  <strong>POV Management:</strong> Complete engagement lifecycle from planning to reporting
                </div>
                <div className="flex items-center">
                  <span className="text-blue-400 mr-2">📋</span>
                  <strong>Templates:</strong> Customizable security scenarios with variable substitution
                </div>
                <div className="flex items-center">
                  <span className="text-purple-400 mr-2">🏢</span>
                  <strong>Customers:</strong> Environment setup, integrations, and configuration management
                </div>
                <div className="flex items-center">
                  <span className="text-cyan-400 mr-2">🔬</span>
                  <strong>Scenarios:</strong> Security demonstration and detection validation
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-2">❓</span>
                  <strong>Help & Guides:</strong> Documentation, tutorials, and best practices
                </div>
              </div>
            </div>

            <div className="bg-purple-900/20 p-4 rounded border border-purple-500/30">
              <div className="text-purple-400 font-bold mb-3">📚 Common Workflows</div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-mono text-green-400">getting-started --workflow executive-pov</span>
                  <span className="text-gray-400 ml-2">→ Step-by-step executive POV process</span>
                </div>
                <div>
                  <span className="font-mono text-blue-400">getting-started --workflow technical-demo</span>
                  <span className="text-gray-400 ml-2">→ Technical demonstration workflow</span>
                </div>
                <div>
                  <span className="font-mono text-purple-400">getting-started --workflow template-customization</span>
                  <span className="text-gray-400 ml-2">→ Template customization process</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded border border-gray-600">
              <div className="text-yellow-400 font-bold mb-3">💡 Quick Start Actions</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-yellow-300 font-bold mb-2">First Time Users:</div>
                  <div className="space-y-1">
                    <div className="font-mono text-green-400">help --quick</div>
                    <div className="font-mono text-blue-400">pov templates</div>
                    <div className="font-mono text-purple-400">template list</div>
                  </div>
                </div>
                <div>
                  <div className="text-yellow-300 font-bold mb-2">Ready to Start:</div>
                  <div className="space-y-1">
                    <div className="font-mono text-green-400">pov init customer-name</div>
                    <div className="font-mono text-blue-400">customer create customer-name</div>
                    <div className="font-mono text-purple-400">cdrlab list scenarios</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-400 text-center">
            Ready to begin? Try clicking the <strong>POV Management</strong> tab above or run <span className="font-mono text-green-400">pov templates</span>
          </div>
        </div>
      );
    }
  }
];
