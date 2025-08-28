'use client';

import React, { useState, useRef, useEffect } from 'react';
import { scenarioCommands } from '../lib/scenario-commands';
import { downloadCommands } from '../lib/download-commands';

interface Command {
  input: string;
  output: React.ReactNode;
  timestamp: Date;
}

interface CommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  handler: (args: string[]) => React.ReactNode | Promise<React.ReactNode>;
}

export default function EnhancedTerminal() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  useEffect(() => {
    setCommands([{
      input: '',
      output: (
        <div className="text-green-400 mb-4">
          <pre className="text-lg font-bold text-cyan-400">{`
 ██╗  ██╗███████╗██╗ █████╗ ███╗   ███╗
 ╚██╗██╔╝██╔════╝██║██╔══██╗████╗ ████║
  ╚███╔╝ ███████╗██║███████║██╔████╔██║
  ██╔██╗ ╚════██║██║██╔══██║██║╚██╔╝██║
 ██╔╝ ██╗███████║██║██║  ██║██║ ╚═╝ ██║
 ╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
`}</pre>
          <div className="text-sm text-gray-400 mt-2">
            <div className="text-lg text-cyan-300 font-semibold mb-1">Next Generation Security Operations Toolkit</div>
            <div>Proof-of-Value CLI • Type 'getting-started' or 'help' for available commands</div>
          </div>
        </div>
      ),
      timestamp: new Date()
    }]);
  }, []);

  const baseCommands: CommandConfig[] = [
    {
      name: 'getting-started',
      description: 'Introduction to the XSIAM & Cortex Terminal',
      usage: 'getting-started',
      aliases: ['gs', 'start', 'welcome'],
      handler: () => {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">🚀 Welcome to the XSIAM & Cortex Terminal</div>
            <div className="space-y-6">
              <div className="border-l-4 border-cyan-500 bg-gray-900 p-4 rounded-r">
                <div className="text-cyan-400 font-bold text-lg mb-3">👋 Welcome to XSIAM & Cortex Security Products</div>
                <div className="text-gray-300 space-y-2">
                  <p>Welcome to the next generation of security operations! XSIAM (Extended Security Intelligence and Automation Management) represents the evolution of security operations, providing AI-driven threat detection, investigation, and response capabilities.</p>
                  <p>Our Cortex security product suite delivers comprehensive protection across your entire digital ecosystem, from endpoints to cloud infrastructure.</p>
                </div>
              </div>
              
              <div className="border-l-4 border-blue-500 bg-gray-900 p-4 rounded-r">
                <div className="text-blue-400 font-bold text-lg mb-3">🎯 About POV-CLI (Proof-of-Value CLI)</div>
                <div className="text-gray-300 space-y-2">
                  <p>The POV-CLI is your interactive gateway to experiencing our security capabilities firsthand. This terminal provides hands-on access to realistic security scenarios, assessment tools, and demonstration environments.</p>
                  <p>Deploy, test, and validate security controls in controlled environments that mirror real-world threats and challenges.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-green-600 p-4 rounded">
                  <div className="text-green-400 font-bold mb-3">🔒 Security Operations</div>
                  <div className="text-gray-300 text-sm space-y-2">
                    <div>• SIEM/SOAR Integration</div>
                    <div>• Threat Intelligence</div>
                    <div>• Incident Response</div>
                    <div>• Security Orchestration</div>
                  </div>
                </div>
                
                <div className="border border-blue-600 p-4 rounded">
                  <div className="text-blue-400 font-bold mb-3">🛡️ Threat Detection</div>
                  <div className="text-gray-300 text-sm space-y-2">
                    <div>• AI-Powered Analytics</div>
                    <div>• Behavioral Analysis</div>
                    <div>• Zero-Day Protection</div>
                    <div>• Advanced Persistent Threats</div>
                  </div>
                </div>
                
                <div className="border border-purple-600 p-4 rounded">
                  <div className="text-purple-400 font-bold mb-3">⚡ Automated Response</div>
                  <div className="text-gray-300 text-sm space-y-2">
                    <div>• Playbook Automation</div>
                    <div>• Threat Containment</div>
                    <div>• Evidence Collection</div>
                    <div>• Remediation Workflows</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded border border-yellow-600">
                <div className="text-yellow-400 font-bold mb-3">🗺️ Step-by-Step Navigation Guide</div>
                <div className="text-gray-300 text-sm space-y-2">
                  <div className="flex items-start">
                    <span className="text-cyan-400 font-bold mr-2">1.</span>
                    <div>Start with <span className="font-mono text-blue-400">scenario list</span> to explore available security scenarios</div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-cyan-400 font-bold mr-2">2.</span>
                    <div>Deploy a scenario using <span className="font-mono text-green-400">scenario generate --scenario-type [type]</span></div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-cyan-400 font-bold mr-2">3.</span>
                    <div>Monitor deployment with <span className="font-mono text-purple-400">scenario status [id]</span></div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-cyan-400 font-bold mr-2">4.</span>
                    <div>Validate security controls using <span className="font-mono text-yellow-400">scenario validate [id]</span></div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-cyan-400 font-bold mr-2">5.</span>
                    <div>Export results with <span className="font-mono text-orange-400">scenario export [id]</span></div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-600 p-4 rounded">
                <div className="text-gray-200 font-bold mb-3">🚀 Essential Commands to Try</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-mono text-green-400">help</span>
                      <span className="text-gray-400">Show all available commands</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono text-blue-400">scenario list</span>
                      <span className="text-gray-400">Browse security scenarios</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono text-purple-400">scenario mitre --scenario-type cloud-posture</span>
                      <span className="text-gray-400">View MITRE mappings</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-mono text-yellow-400">whoami --detailed</span>
                      <span className="text-gray-400">Learn about expertise</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono text-cyan-400">ai [question]</span>
                      <span className="text-gray-400">Ask the AI assistant</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono text-cyan-400">detect</span>
                      <span className="text-gray-400">Output MITRE-mapped stub event</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-blue-900 to-purple-900 rounded border border-cyan-500">
                <div className="text-cyan-300 font-semibold text-lg">Ready to Validate Your Detection Content?</div>
                <div className="text-gray-300 mt-2">Explore scenarios and MITRE mappings to accelerate your XSIAM & Cortex workflows.</div>
                <div className="mt-3">
                  <span className="font-mono text-yellow-400 bg-gray-800 px-3 py-1 rounded">scenario mitre</span>
                </div>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      name: 'help',
      description: 'Show available commands',
      usage: 'help [command]',
      aliases: ['?', 'man'],
      handler: (args) => {
        if (args.length > 0) {
          const cmdName = args[0].toLowerCase();
          const cmd = commandConfigs.find(c => c.name === cmdName || c.aliases?.includes(cmdName));
          if (cmd) {
            return (
              <div className="text-blue-300">
                <div className="font-bold text-lg">{cmd.name}</div>
                <div className="text-gray-300 mt-1">{cmd.description}</div>
                <div className="text-yellow-400 mt-2">Usage: <span className="font-mono">{cmd.usage}</span></div>
                {cmd.aliases && (
                  <div className="text-gray-500 mt-1 text-sm">Aliases: {cmd.aliases.join(', ')}</div>
                )}
              </div>
            );
          }
          return <div className="text-red-400">Command '{args[0]}' not found</div>;
        }
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-lg">🔐 Cloud Security Terminal - Available Commands</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commandConfigs.map(cmd => (
                <div key={cmd.name} className="border border-gray-600 p-3 rounded">
                  <div className="text-green-400 font-mono font-bold">{cmd.name}</div>
                  <div className="text-sm text-gray-300 mt-1">{cmd.description}</div>
                  {cmd.aliases && (
                    <div className="text-xs text-gray-500 mt-1">
                      Aliases: {cmd.aliases.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 text-gray-400 text-sm border-t border-gray-600 pt-4">
              💡 <strong>Pro Tips:</strong><br/>
              • Use 'help [command]' for detailed usage<br/>
              • Press ↑/↓ arrows to navigate command history<br/>
              • Try 'ls scenarios' to explore security drills<br/>
              • Run 'owasp' to review common web risks
            </div>
          </div>
        );
      }
    },
    {
      name: 'ls',
      description: 'List available security scenario categories',
      usage: 'ls scenarios',
      aliases: ['list', 'dir'],
      handler: (args) => {
        if (args.includes('scenarios')) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-3">🧪 Security Scenario Categories</div>
              <div className="space-y-1 text-sm">
                <div className="text-green-400">cloud-posture – misconfigured cloud resources</div>
                <div className="text-blue-400">container-vuln – vulnerable container images</div>
                <div className="text-purple-400">code-vuln – application code flaws</div>
                <div className="text-yellow-400">insider-threat – simulated insider attacks</div>
                <div className="text-red-400">ransomware – encryption behavior simulation</div>
                <div className="text-cyan-400">waas-exploit – web application exploits</div>
                <div className="text-orange-400">pipeline-breach – CI/CD pipeline attacks</div>
              </div>
            </div>
          );
        }
        return <div className="text-gray-400">Usage: ls scenarios</div>;
      }
    },
    {
      name: 'owasp',
      description: 'List the OWASP Top 10 application security risks',
      usage: 'owasp',
      handler: () => (
        <div className="text-blue-300">
          <div className="font-bold mb-3">OWASP Top 10 (2021)</div>
          <ol className="list-decimal ml-5 space-y-1 text-sm">
            <li>Broken Access Control</li>
            <li>Cryptographic Failures</li>
            <li>Injection</li>
            <li>Insecure Design</li>
            <li>Security Misconfiguration</li>
            <li>Vulnerable and Outdated Components</li>
            <li>Identification and Authentication Failures</li>
            <li>Software and Data Integrity Failures</li>
            <li>Security Logging and Monitoring Failures</li>
            <li>Server-Side Request Forgery (SSRF)</li>
          </ol>
        </div>
      )
    },
    {
      name: 'scenario',
      description: 'Deploy and manage security assessment scenarios',
      usage: 'scenario <action> [options]',
      aliases: ['sc'],
      handler: async (args) => {
        if (args.length === 0) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-3">Scenario Command</div>
              <div className="space-y-2 text-sm">
                <div className="font-mono text-green-400">scenario list</div>
                <div className="text-gray-500 ml-4">→ Browse all available scenario templates</div>
                <div className="font-mono text-blue-400">scenario generate --scenario-type cloud-posture --provider gcp</div>
                <div className="text-gray-500 ml-4">→ Deploy a cloud security posture scenario</div>
              </div>
            </div>
          );
        }
        const [action, ...remainingArgs] = args;
        switch (action) {
          case 'list':
            return await scenarioCommands.list(remainingArgs);
          case 'generate':
            return await scenarioCommands.generate(remainingArgs);
          case 'status':
            return await scenarioCommands.status(remainingArgs);
          case 'validate':
            return await scenarioCommands.validate(remainingArgs);
          case 'destroy':
            return await scenarioCommands.destroy(remainingArgs);
          case 'export':
            return await scenarioCommands.export(remainingArgs);
          default:
            return (
              <div className="text-red-400">
                Unknown scenario action '{action}'. Use 'scenario' for help or 'scenario list' to start.
              </div>
            );
        }
      }
    }
  ];

  const commandConfigs: CommandConfig[] = [...baseCommands, ...downloadCommands];

  const executeCommand = async (inputStr: string) => {
    const trimmed = inputStr.trim();
    if (!trimmed) return;

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    const config = commandConfigs.find(c => c.name === command || c.aliases?.includes(command));

    let output: React.ReactNode;
    if (config) {
      if (command === 'clear' || config.name === 'clear') {
        setCommands([]);
        return;
      }

      try {
        const result = config.handler(args);
        if (result && typeof result === 'object' && 'then' in result) {
          const loadingCommand: Command = {
            input: trimmed,
            output: (
              <div className="text-blue-300">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-3"></div>
                  <span>Processing command...</span>
                </div>
              </div>
            ),
            timestamp: new Date()
          };

          setCommands(prev => [...prev, loadingCommand]);
          setHistory(prev => [...prev, trimmed]);
          setHistoryIndex(-1);

          try {
            const asyncOutput = await (result as Promise<React.ReactNode>);
            setCommands(prev => {
              const newCommands = [...prev];
              newCommands[newCommands.length - 1] = {
                input: trimmed,
                output: asyncOutput,
                timestamp: new Date()
              };
              return newCommands;
            });
          } catch (asyncError) {
            setCommands(prev => {
              const newCommands = [...prev];
              newCommands[newCommands.length - 1] = {
                input: trimmed,
                output: (
                  <div className="text-red-400">
                    <div className="font-bold mb-2">❌ Async Command Error</div>
                    <div>Failed to execute async command: {asyncError instanceof Error ? asyncError.message : 'Unknown error'}</div>
                  </div>
                ),
                timestamp: new Date()
              };
              return newCommands;
            });
          }
          return;
        } else {
          output = result as React.ReactNode;
        }
      } catch (error) {
        output = (
          <div className="text-red-400">
            <div className="font-bold mb-2">❌ Command Error</div>
            <div>Failed to execute command: {error instanceof Error ? error.message : 'Unknown error'}</div>
          </div>
        );
      }
    } else {
      output = (
        <div className="text-red-400">
          Command '{command}' not found. Type 'help' for available commands.
        </div>
      );
    }

    const newCommand: Command = {
      input: trimmed,
      output,
      timestamp: new Date()
    };

    setCommands(prev => [...prev, newCommand]);
    setHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (input.trim() && !input.includes(' ')) {
        const matchingCommands = commandConfigs
          .filter(c => c.name.startsWith(input.toLowerCase()) || c.aliases?.some(a => a.startsWith(input.toLowerCase())))
          .map(c => c.name);

        if (matchingCommands.length === 1) {
          setInput(matchingCommands[0]);
        }
      }
    }
  };

  return (
    <div className="bg-black text-green-400 font-mono text-sm h-screen flex flex-col">
      <div
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto terminal-scrollbar"
      >
        {commands.map((cmd, index) => (
          <div key={index} className="mb-4">
            {cmd.input && (
              <div className="flex">
                <span className="text-blue-400 mr-2">henry@ai:~$</span>
                <span className="text-white">{cmd.input}</span>
              </div>
            )}
            {cmd.output && (
              <div className="mt-1 ml-0">
                {cmd.output}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-700 p-4">
        <div className="flex">
          <span className="text-blue-400 mr-2">henry@ai:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white"
            placeholder="Type a command..."
            autoFocus
          />
        </div>
      </form>
    </div>
  );
}
