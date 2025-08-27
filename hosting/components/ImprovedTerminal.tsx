'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import { TerminalOutput } from './TerminalOutput';
import { contextStorage, UserContext } from '../lib/context-storage';
import { VFS, initVFS, serializeVFS, deserializeVFS } from '../lib/vfs';
import { buildLinuxCommands } from '../lib/linux-commands';

interface Command {
  input: string;
  output: React.ReactNode;
  timestamp: Date;
  cwd?: string; // Current working directory when command was executed
}

interface CommandHandlerCtx {
  rawInput: string;
  cwd: string;
  setCwd: (p: string) => void;
  vfs: VFS;
  user?: { email?: string } | null;
  history: string[];
  bootTimeMs: number;
  prevCwd: string | null;
  setPrevCwd: (p: string | null) => void;
  persistData: () => void;
}

interface CommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  handler: (args: string[], ctx?: CommandHandlerCtx) => React.ReactNode | Promise<React.ReactNode>;
}


export default function ImprovedTerminal() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showLogin, setShowLogin] = useState(false);
  const [cwd, setCwd] = useState<string>('/home/guest');
  const [prevCwd, setPrevCwd] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const vfsRef = useRef<VFS>(initVFS());
  const bootRef = useRef(Date.now());
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // Helper for formatting the prompt with current directory
  const formatPrompt = (p: string) => `henry@ai:${p}$`;

  // Auto-resize textarea based on content
  const adjustHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  // Adjust height when input changes
  useEffect(() => {
    if (inputRef.current) {
      adjustHeight(inputRef.current);
    }
  }, [input]);

  // Persist VFS and current directory
  const persistData = () => {
    try {
      localStorage.setItem('terminal.cwd', cwd);
      localStorage.setItem('terminal.vfs', serializeVFS(vfsRef.current));
      localStorage.setItem('terminal.prevCwd', prevCwd || '');
    } catch (error) {
      console.warn('Failed to persist terminal data:', error);
    }
  };

  // Load persisted data on mount
  useEffect(() => {
    try {
      const savedCwd = localStorage.getItem('terminal.cwd');
      const savedVFS = localStorage.getItem('terminal.vfs');
      const savedPrevCwd = localStorage.getItem('terminal.prevCwd');
      
      if (savedCwd) {
        setCwd(savedCwd);
      }
      
      if (savedVFS) {
        vfsRef.current = deserializeVFS(savedVFS);
      }
      
      if (savedPrevCwd) {
        setPrevCwd(savedPrevCwd || null);
      }
    } catch (error) {
      console.warn('Failed to load persisted terminal data:', error);
      // Fall back to defaults
      vfsRef.current = initVFS();
    }
  }, []);

  // Persist data when cwd or prevCwd changes
  useEffect(() => {
    persistData();
  }, [cwd, prevCwd]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  useEffect(() => {
    // Initialize context storage session
    contextStorage.startSession();
    
    // Add welcome message
    setCommands([{
      input: '',
      output: (
        <TerminalOutput type="info">
          <pre className="text-lg font-bold text-cyan-400 mb-2">
{`
 ██╗  ██╗███████╗██╗ █████╗ ███╗   ███╗
 ╚██╗██╔╝██╔════╝██║██╔══██╗████╗ ████║
  ╚███╔╝ ███████╗██║███████║██╔████╔██║
  ██╔██╗ ╚════██║██║██╔══██║██║╚██╔╝██║
 ██╔╝ ██╗███████║██║██║  ██║██║ ╚═╝ ██║
 ╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
`}
          </pre>
          <div className="text-sm">
            <div className="mb-2">🤖 <strong>Henry Reed AI Terminal</strong></div>
            <div className="text-sm text-gray-400">
              Professional AI consulting and development services
            </div>
            <div className="mt-3 text-sm">
              <div>• Type <span className="text-green-400 font-bold">getting started</span> for an introduction or <span className="text-green-400 font-bold">help</span> for all commands</div>
              <div>• Press <span className="text-blue-400 font-bold">↑/↓</span> for command history</div>
              <div>• Try <span className="text-purple-400 font-bold">proof-of-value start</span> to begin a proof of value</div>
            </div>
          </div>
        </TerminalOutput>
      ),
      timestamp: new Date()
    }]);
  }, []);

  // Build command configs from AI-focused commands and Linux primitives
  const aiCommands: CommandConfig[] = [
    {
      name: 'help',
      description: 'Show available commands',
      usage: 'help [command]',
      aliases: ['?'],
      handler: (args) => {
        if (args.length > 0) {
          const cmdName = args[0].toLowerCase();
          const cmd = commandConfigs.find(c => c.name === cmdName || c.aliases?.includes(cmdName));
          if (cmd) {
            return (
              <TerminalOutput type="info">
                <div className="font-bold text-lg text-blue-300">{cmd.name}</div>
                <div className="text-gray-300 mt-2">{cmd.description}</div>
                <div className="text-yellow-400 mt-3">
                  <strong>Usage:</strong> <span className="font-mono text-white">{cmd.usage}</span>
                </div>
                {cmd.aliases && (
                  <div className="text-gray-500 mt-2 text-sm">
                    <strong>Aliases:</strong> {cmd.aliases.join(', ')}
                  </div>
                )}
              </TerminalOutput>
            );
          }
          return (
            <TerminalOutput type="error">
              Command '{args[0]}' not found. Type 'help' to see all available commands.
            </TerminalOutput>
          );
        }
        
        return (
          <TerminalOutput type="info">
            <div className="font-bold mb-4 text-xl text-blue-300">🎯 PoV-CLI Commands</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commandConfigs.map(cmd => (
                <div key={cmd.name} className="border border-gray-600 p-3 rounded bg-gray-800/50">
                  <div className="text-green-400 font-bold">{cmd.name}</div>
                  <div className="text-sm text-gray-300 mt-1">{cmd.description}</div>
                  {cmd.aliases && (
                    <div className="text-xs text-gray-500 mt-1">
                      Aliases: {cmd.aliases.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-cyan-900/20 rounded border border-cyan-500/30">
              <div className="text-cyan-400 font-bold mb-2">🚀 Quick Start</div>
              <div className="text-sm space-y-1">
                <div>1. Use <span className="text-green-400 font-mono">Shift+Enter</span> to add new lines; <span className="text-blue-400 font-mono">Enter</span> to execute</div>
                <div>2. Try <span className="text-purple-400 font-mono">mkdir test && cd test && touch file.txt && echo Hello</span></div>
                <div>3. Run <span className="text-cyan-400 font-mono">proof-of-value start</span> to begin AI assessments</div>
              </div>
            </div>
          </TerminalOutput>
        );
      }
    },
    {
      name: 'getting started',
      description: 'Introduction to Henry Reed AI Terminal',
      usage: 'getting started',
      aliases: ['getting-started', 'intro'],
      handler: () => {
        return (
          <TerminalOutput type="info">
            <div className="space-y-4">
              <div className="font-bold text-lg text-cyan-300">🚀 Welcome to Henry Reed AI Terminal</div>
              
              <div className="bg-cyan-900/20 p-4 rounded border border-cyan-500/30">
                <div className="text-cyan-400 font-bold mb-3">What is this?</div>
                <div className="text-sm space-y-2">
                  <div>This is an interactive terminal interface for exploring AI consulting services, proof-of-value assessments, and custom detection development.</div>
                  <div>Built for security professionals, AI engineers, and business leaders looking to leverage AI for cybersecurity.</div>
                </div>
              </div>
              
              <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
                <div className="text-green-400 font-bold mb-3">🎯 Quick Start Guide</div>
                <div className="text-sm space-y-2">
                  <div><span className="text-green-400 font-mono">proof-of-value start</span> - Begin a proof of value assessment</div>
                  <div><span className="text-blue-400 font-mono">template list</span> - Browse detection templates</div>
                  <div><span className="text-purple-400 font-mono">detect create</span> - Build custom detection rules</div>
                  <div><span className="text-yellow-400 font-mono">whoami</span> - Learn about Henry Reed</div>
                </div>
              </div>
              
              <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
                <div className="text-blue-400 font-bold mb-3">💡 Pro Tips</div>
                <div className="text-sm space-y-2">
                  <div>• Use <span className="text-green-400 font-mono">Shift+Enter</span> for multiline input, <span className="text-blue-400 font-mono">Enter</span> to execute</div>
                  <div>• Try Linux commands: <span className="text-yellow-400 font-mono">ls -la</span>, <span className="text-purple-400 font-mono">pwd</span>, <span className="text-cyan-400 font-mono">cat readme.txt</span></div>
                  <div>• Press <span className="text-blue-400 font-mono">↑/↓</span> for history, <span className="text-purple-400 font-mono">Tab</span> for completion</div>
                  <div>• Type <span className="text-red-400 font-mono">clear</span> to reset or <span className="text-green-400 font-mono">help</span> for commands</div>
                </div>
              </div>
              
              <div className="text-sm text-gray-400">
                Ready to get started? Try <span className="text-green-400 font-mono">proof-of-value start</span> or <span className="text-blue-400 font-mono">help</span> to explore all commands.
              </div>
            </div>
          </TerminalOutput>
        );
      }
    },
    {
      name: 'pov',
      description: 'Proof-of-Value execution and management',
      usage: 'pov <start|list|status|deploy> [options]',
      aliases: ['proof'],
      handler: (args) => {
        const action = args[0]?.toLowerCase();
        
        if (!action) {
          return (
            <TerminalOutput type="info">
              <div className="space-y-4">
                <div className="font-bold text-lg text-cyan-300">🎯 Proof-of-Value Engine</div>
                
                <div className="bg-gray-800/60 p-4 rounded border border-cyan-500/30">
                  <div className="text-cyan-400 font-bold mb-3">Available Actions:</div>
                  <div className="text-sm space-y-1">
                    <div><span className="text-green-300 font-mono">pov start</span> - Initialize new POV assessment</div>
                    <div><span className="text-blue-300 font-mono">pov list</span> - Show available POV templates</div>
                    <div><span className="text-purple-300 font-mono">pov status</span> - Check current POV progress</div>
                    <div><span className="text-yellow-300 font-mono">pov deploy [template]</span> - Deploy POV scenario</div>
                  </div>
                </div>
                
                <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
                  <div className="text-blue-400 font-bold mb-2">🔬 Focus Areas</div>
                  <div className="text-sm space-y-1">
                    <div>• AI-powered threat detection</div>
                    <div>• Real-time security monitoring</div>
                    <div>• Custom rule development</div>
                    <div>• Performance benchmarking</div>
                  </div>
                </div>
              </div>
            </TerminalOutput>
          );
        }
        
        switch (action) {
          case 'start':
            return (
              <TerminalOutput type="success">
                <div className="space-y-4">
                  <div className="font-bold text-lg text-green-300">🚀 POV Assessment Started</div>
                  
                  <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
                    <div className="text-green-400 font-bold mb-3">Assessment Phases:</div>
                    <div className="text-sm space-y-2">
                      <div className="flex items-center">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Environment Discovery</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-2">○</span>
                        <span>Baseline Detection Setup</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">○</span>
                        <span>Custom Rule Development</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">○</span>
                        <span>Performance Evaluation</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    Next: Run <span className="text-blue-400 font-mono">template list</span> to explore detection templates
                  </div>
                </div>
              </TerminalOutput>
            );
            
          case 'list':
            return (
              <TerminalOutput type="info">
                <div className="space-y-4">
                  <div className="font-bold text-lg text-blue-300">📋 Available POV Templates</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-900/20 p-4 rounded border border-red-500/30">
                      <div className="text-red-400 font-bold mb-2">🛡️ Threat Detection</div>
                      <div className="text-sm text-gray-300">Advanced threat hunting and anomaly detection</div>
                      <div className="text-xs text-gray-500 mt-2">Duration: 2-3 weeks</div>
                    </div>
                    
                    <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
                      <div className="text-blue-400 font-bold mb-2">📊 Log Analytics</div>
                      <div className="text-sm text-gray-300">Real-time log processing and correlation</div>
                      <div className="text-xs text-gray-500 mt-2">Duration: 1-2 weeks</div>
                    </div>
                    
                    <div className="bg-purple-900/20 p-4 rounded border border-purple-500/30">
                      <div className="text-purple-400 font-bold mb-2">🔍 Behavioral Analysis</div>
                      <div className="text-sm text-gray-300">User and entity behavior monitoring</div>
                      <div className="text-xs text-gray-500 mt-2">Duration: 3-4 weeks</div>
                    </div>
                    
                    <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
                      <div className="text-green-400 font-bold mb-2">⚡ Performance Optimization</div>
                      <div className="text-sm text-gray-300">Detection rule performance tuning</div>
                      <div className="text-xs text-gray-500 mt-2">Duration: 1 week</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    Use <span className="text-green-400 font-mono">pov deploy [template-name]</span> to start a specific assessment
                  </div>
                </div>
              </TerminalOutput>
            );
            
          case 'status':
            return (
              <TerminalOutput type="info">
                <div className="space-y-4">
                  <div className="font-bold text-lg text-blue-300">📊 POV Status Dashboard</div>
                  
                  <div className="bg-gray-800/50 p-4 rounded border border-gray-600">
                    <div className="text-green-400 font-bold mb-3">Current Assessment: Threat Detection POV</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Progress:</span>
                        <span className="text-yellow-400">Phase 2/4 (45%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Rules Created:</span>
                        <span className="text-green-400">12/20</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Detection Rate:</span>
                        <span className="text-cyan-400">87.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">False Positives:</span>
                        <span className="text-red-400">2.1%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    Estimated completion: 5 days | Next milestone: Custom rule deployment
                  </div>
                </div>
              </TerminalOutput>
            );
            
          case 'deploy':
            const template = args[1] || 'threat-detection';
            return (
              <TerminalOutput type="success">
                <div className="space-y-4">
                  <div className="font-bold text-lg text-green-300">🚀 Deploying POV: {template}</div>
                  
                  <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
                    <div className="text-green-400 font-bold mb-3">Deployment Steps:</div>
                    <div className="text-sm space-y-2">
                      <div className="flex items-center">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Environment validation complete</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Base detection rules deployed</span>
                      </div>
                      <div className="flex items-center">
                        <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400 mr-2"></span>
                        <span>Configuring data sources...</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">○</span>
                        <span>Initializing monitoring dashboards</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    POV environment will be ready in approximately 5 minutes.
                  </div>
                </div>
              </TerminalOutput>
            );
            
          default:
            return (
              <TerminalOutput type="error">
                <div className="space-y-2">
                  <div className="font-bold">Unknown POV Action</div>
                  <div className="text-sm">Available actions: start, list, status, deploy</div>
                </div>
              </TerminalOutput>
            );
        }
      }
    },
    {
      name: 'template',
      description: 'Detection template management',
      usage: 'template <list|create|edit|deploy> [name]',
      aliases: ['tpl'],
      handler: (args) => {
        const action = args[0]?.toLowerCase();
        
        if (!action) {
          return (
            <TerminalOutput type="info">
              <div className="space-y-4">
                <div className="font-bold text-lg text-purple-300">📝 Detection Template Engine</div>
                
                <div className="bg-gray-800/60 p-4 rounded border border-purple-500/30">
                  <div className="text-purple-400 font-bold mb-3">Available Actions:</div>
                  <div className="text-sm space-y-1">
                    <div><span className="text-green-300 font-mono">template list</span> - Browse template library</div>
                    <div><span className="text-blue-300 font-mono">template create</span> - Build new detection template</div>
                    <div><span className="text-yellow-300 font-mono">template edit [name]</span> - Modify existing template</div>
                    <div><span className="text-cyan-300 font-mono">template deploy [name]</span> - Deploy template to environment</div>
                  </div>
                </div>
              </div>
            </TerminalOutput>
          );
        }
        
        switch (action) {
          case 'list':
            return (
              <TerminalOutput type="info">
                <div className="space-y-4">
                  <div className="font-bold text-lg text-purple-300">📚 Template Library</div>
                  
                  <div className="space-y-3">
                    <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-red-400 font-bold">Lateral Movement Detection</div>
                          <div className="text-sm text-gray-300">Detects suspicious network traversal patterns</div>
                        </div>
                        <div className="text-xs text-gray-500">SIGMA | HIGH</div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-900/20 p-3 rounded border border-yellow-500/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-yellow-400 font-bold">Credential Stuffing</div>
                          <div className="text-sm text-gray-300">Identifies brute force authentication attempts</div>
                        </div>
                        <div className="text-xs text-gray-500">KQL | MEDIUM</div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-blue-400 font-bold">Data Exfiltration</div>
                          <div className="text-sm text-gray-300">Monitors for unusual data transfer volumes</div>
                        </div>
                        <div className="text-xs text-gray-500">SPL | HIGH</div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-purple-400 font-bold">Process Injection</div>
                          <div className="text-sm text-gray-300">Detects malicious process manipulation</div>
                        </div>
                        <div className="text-xs text-gray-500">YARA | CRITICAL</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    Use <span className="text-blue-400 font-mono">template deploy [name]</span> to activate a template
                  </div>
                </div>
              </TerminalOutput>
            );
            
          case 'create':
            return (
              <TerminalOutput type="success">
                <div className="space-y-4">
                  <div className="font-bold text-lg text-green-300">🔨 Template Creation Wizard</div>
                  
                  <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
                    <div className="text-green-400 font-bold mb-3">Step 1: Template Configuration</div>
                    <div className="text-sm space-y-2">
                      <div><span className="text-gray-400">Name:</span> <span className="text-white">Custom_Threat_Detection_v1</span></div>
                      <div><span className="text-gray-400">Type:</span> <span className="text-blue-400">Behavioral Analysis</span></div>
                      <div><span className="text-gray-400">Language:</span> <span className="text-purple-400">KQL (Kusto Query Language)</span></div>
                      <div><span className="text-gray-400">Severity:</span> <span className="text-yellow-400">Medium</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded border border-gray-600">
                    <div className="text-blue-400 font-bold mb-2">Generated Template Preview:</div>
                    <pre className="text-xs text-gray-300 overflow-auto bg-black p-3 rounded">
{`SecurityEvent
| where EventID == 4624
| where LogonType in (2, 10)
| summarize count() by Account, Computer
| where count_ > 10
| project-rename SuspiciousLogons = count_`}
                    </pre>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    Template created successfully! Use <span className="text-cyan-400 font-mono">template deploy Custom_Threat_Detection_v1</span> to activate.
                  </div>
                </div>
              </TerminalOutput>
            );
            
          case 'deploy':
            const templateName = args[1] || 'lateral-movement';
            return (
              <TerminalOutput type="success">
                <div className="space-y-4">
                  <div className="font-bold text-lg text-cyan-300">🚀 Deploying Template: {templateName}</div>
                  
                  <div className="bg-cyan-900/20 p-4 rounded border border-cyan-500/30">
                    <div className="text-cyan-400 font-bold mb-3">Deployment Progress:</div>
                    <div className="text-sm space-y-2">
                      <div className="flex items-center">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Template validation complete</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>SIEM integration configured</span>
                      </div>
                      <div className="flex items-center">
                        <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400 mr-2"></span>
                        <span>Deploying detection rules...</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">○</span>
                        <span>Setting up alerting workflows</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    Template deployment will complete in 2-3 minutes. Monitoring active.
                  </div>
                </div>
              </TerminalOutput>
            );
            
          default:
            return (
              <TerminalOutput type="error">
                <div className="space-y-2">
                  <div className="font-bold">Unknown Template Action</div>
                  <div className="text-sm">Available actions: list, create, edit, deploy</div>
                </div>
              </TerminalOutput>
            );
        }
      }
    },
    {
      name: 'detect',
      description: 'Custom detection rule development',
      usage: 'detect <create|test|validate|export> [options]',
      aliases: ['rule'],
      handler: (args) => {
        const action = args[0]?.toLowerCase();
        
        if (!action) {
          return (
            <TerminalOutput type="info">
              <div className="space-y-4">
                <div className="font-bold text-lg text-orange-300">🔍 Detection Rule Engine</div>
                
                <div className="bg-gray-800/60 p-4 rounded border border-orange-500/30">
                  <div className="text-orange-400 font-bold mb-3">Available Actions:</div>
                  <div className="text-sm space-y-1">
                    <div><span className="text-green-300 font-mono">detect create</span> - Interactive rule builder</div>
                    <div><span className="text-blue-300 font-mono">detect test [rule]</span> - Test rule against sample data</div>
                    <div><span className="text-purple-300 font-mono">detect validate</span> - Validate rule syntax</div>
                    <div><span className="text-yellow-300 font-mono">detect export</span> - Export rules for deployment</div>
                  </div>
                </div>
                
                <div className="bg-orange-900/20 p-4 rounded border border-orange-500/30">
                  <div className="text-orange-400 font-bold mb-2">🎯 Supported Formats</div>
                  <div className="text-sm space-y-1">
                    <div>• SIGMA Rules • KQL Queries • Splunk SPL • YARA Rules</div>
                  </div>
                </div>
              </div>
            </TerminalOutput>
          );
        }
        
        switch (action) {
          case 'create':
            return (
              <TerminalOutput type="success">
                <div className="space-y-4">
                  <div className="font-bold text-lg text-green-300">🔨 Interactive Rule Builder</div>
                  
                  <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
                    <div className="text-green-400 font-bold mb-3">Rule Configuration:</div>
                    <div className="text-sm space-y-2">
                      <div><span className="text-gray-400">Attack Technique:</span> <span className="text-red-400">T1055 - Process Injection</span></div>
                      <div><span className="text-gray-400">Data Source:</span> <span className="text-blue-400">Windows Security Logs</span></div>
                      <div><span className="text-gray-400">Detection Logic:</span> <span className="text-purple-400">Behavioral + Signature</span></div>
                      <div><span className="text-gray-400">Confidence:</span> <span className="text-yellow-400">High (85%)</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded border border-gray-600">
                    <div className="text-blue-400 font-bold mb-2">Generated Detection Rule:</div>
                    <pre className="text-xs text-gray-300 overflow-auto bg-black p-3 rounded">
{`title: Suspicious Process Injection Activity
status: experimental
logsource:
  category: process_access
detection:
  selection:
    GrantedAccess|endswith:
      - '1F0FFF'
      - '1F1FFF'
    CallTrace|contains:
      - 'UNKNOWN'
  condition: selection
falsepositives:
  - Legitimate software with debugging
level: high`}
                    </pre>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    Rule created! Use <span className="text-blue-400 font-mono">detect test</span> to validate against sample data.
                  </div>
                </div>
              </TerminalOutput>
            );
            
          case 'test':
            return (
              <TerminalOutput type="info">
                <div className="space-y-4">
                  <div className="font-bold text-lg text-blue-300">🧪 Rule Testing Results</div>
                  
                  <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
                    <div className="text-blue-400 font-bold mb-3">Test Dataset: 10,000 events (24hr sample)</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">True Positives:</span>
                        <span className="text-green-400">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">False Positives:</span>
                        <span className="text-red-400">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Detection Rate:</span>
                        <span className="text-cyan-400">94.0%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Performance:</span>
                        <span className="text-yellow-400">2.3ms avg</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
                    <div className="text-green-400 font-bold">✓ Test Passed</div>
                    <div className="text-sm text-gray-300 mt-1">Rule meets quality thresholds for production deployment</div>
                  </div>
                </div>
              </TerminalOutput>
            );
            
          default:
            return (
              <TerminalOutput type="error">
                <div className="space-y-2">
                  <div className="font-bold">Unknown Detection Action</div>
                  <div className="text-sm">Available actions: create, test, validate, export</div>
                </div>
              </TerminalOutput>
            );
        }
      }
    },
    {
      name: 'login',
      description: 'Sign in to access premium features',
      usage: 'login',
      aliases: ['auth'],
      handler: () => {
        if (user) {
          return (
            <TerminalOutput type="success">
              <div className="flex items-center">
                <div className="mr-3 text-2xl">👤</div>
                <div>
                  <div className="font-bold">Already signed in</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Email: {user.email}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Use <span className="text-red-400 font-mono">logout</span> to sign out
                  </div>
                </div>
              </div>
            </TerminalOutput>
          );
        }
        
        setShowLogin(true);
        return (
          <TerminalOutput type="info">
            <div className="flex items-center">
              <div className="mr-3 text-2xl">🔐</div>
              <div>
                <div className="font-bold">Opening login form...</div>
                <div className="text-sm text-gray-300 mt-1">
                  Sign in to access premium features and save your preferences
                </div>
              </div>
            </div>
          </TerminalOutput>
        );
      }
    },
    {
      name: 'logout',
      description: 'Sign out of your account',
      usage: 'logout',
      aliases: [],
      handler: async () => {
        if (!user) {
          return (
            <TerminalOutput type="warning">
              <div className="flex items-center">
                <div className="mr-3 text-2xl">⚠️</div>
                <div>
                  <div className="font-bold">Not signed in</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Use <span className="text-green-400 font-mono">login</span> to sign in
                  </div>
                </div>
              </div>
            </TerminalOutput>
          );
        }

        try {
          await logout();
          return (
            <TerminalOutput type="success">
              <div className="flex items-center">
                <div className="mr-3 text-2xl">👋</div>
                <div>
                  <div className="font-bold">Successfully signed out</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Thank you for using Henry Reed AI Terminal!
                  </div>
                </div>
              </div>
            </TerminalOutput>
          );
        } catch (error) {
          return (
            <TerminalOutput type="error">
              <div className="flex items-center">
                <div className="mr-3 text-2xl">❌</div>
                <div>
                  <div className="font-bold">Sign out failed</div>
                  <div className="text-sm text-gray-300 mt-1">
                    {error instanceof Error ? error.message : 'Unknown error'}
                  </div>
                </div>
              </div>
            </TerminalOutput>
          );
        }
      }
    },
    {
      name: 'docs',
      description: 'Open documentation page',
      usage: 'docs [section]',
      aliases: [],
      handler: (args) => {
        const section = args[0] || '';
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        
        // Open docs in new window/tab
        if (typeof window !== 'undefined') {
          window.open(`${baseUrl}/docs${section ? `#${section}` : ''}`, '_blank');
        }

        return (
          <TerminalOutput type="success">
            <div className="flex items-center">
              <div className="mr-3 text-2xl">📖</div>
              <div>
                <div className="font-bold">Documentation opened</div>
                <div className="text-sm text-gray-300 mt-1">
                  {section 
                    ? `Navigating to section: ${section}`
                    : 'Opening complete documentation in new tab'
                  }
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  Available sections: commands, api, tutorials, examples
                </div>
              </div>
            </div>
          </TerminalOutput>
        );
      }
    },
    {
      name: 'whoami',
      description: 'Display information about Henry Reed or current user',
      usage: 'whoami [--detailed] [--linux|-l|--system]',
      aliases: [],
      handler: (args, ctx) => {
        const detailed = args.includes('--detailed');
        const linuxMode = args.includes('--linux') || args.includes('-l') || args.includes('--system');
        const isLoggedIn = !!user;
        
        // Linux-style whoami
        if (linuxMode) {
          const username = ctx?.user?.email ? ctx.user.email.split('@')[0] : 'guest';
          return (
            <TerminalOutput type="default">
              {username}
            </TerminalOutput>
          );
        }
        
        if (detailed) {
          return (
            <TerminalOutput type="info">
              <div className="space-y-4">
                <div className="font-bold text-2xl text-cyan-300 border-b border-gray-600 pb-2">
                  Henry Reed - AI Engineer & Consultant
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <div className="text-green-400 font-bold">🚀 Mission</div>
                      <div className="text-sm text-gray-300">
                        Bridge the gap between cutting-edge AI research and practical, impactful business applications.
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-blue-400 font-bold">🎯 Expertise</div>
                      <div className="text-sm text-gray-300">
                        Machine Learning, Large Language Models (LLMs), Computer Vision, and Enterprise AI Strategy.
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-purple-400 font-bold">🔬 Focus</div>
                      <div className="text-sm text-gray-300">
                        Building scalable, reliable, and high-performance AI systems that deliver measurable ROI.
                      </div>
                    </div>
                    
                    {isLoggedIn && (
                      <div>
                        <div className="text-yellow-400 font-bold">👤 Your Session</div>
                        <div className="text-sm text-gray-300">
                          Signed in as: {user?.email}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-800 rounded border border-gray-600">
                  <div className="text-yellow-400 italic">
                    "I believe in a future where AI is a powerful tool for innovation and problem-solving 
                    in every industry. My goal is to help you navigate that future with confidence."
                  </div>
                </div>
              </div>
            </TerminalOutput>
          );
        }

        return (
          <TerminalOutput type="info">
            <div className="flex items-center">
              <div className="mr-4 text-3xl">🤖</div>
              <div>
                <div className="text-xl font-bold text-cyan-300">Henry Reed</div>
                <div className="text-gray-300">AI Engineer & Consultant</div>
                {isLoggedIn && (
                  <div className="text-sm text-green-400 mt-1">
                    ✓ Signed in as {user?.email}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  Use <span className="text-cyan-400 font-mono">whoami --detailed</span> for more info or <span className="text-green-400 font-mono">whoami --linux</span> for username
                </div>
              </div>
            </div>
          </TerminalOutput>
        );
      }
    },
    {
      name: 'clear',
      description: 'Clear the terminal screen',
      usage: 'clear',
      aliases: ['cls'],
      handler: () => {
        // This will be handled in the main component
        return null;
      }
    },
    {
      name: 'exit',
      description: 'Exit the terminal and return to login',
      usage: 'exit',
      aliases: ['quit'],
      handler: () => {
        // Clear session storage and redirect to landing
        sessionStorage.removeItem('authenticated');
        sessionStorage.removeItem('auth_user');
        
        // Show goodbye message then redirect
        setTimeout(() => {
          router.push('/');
        }, 1500);
        
        return (
          <TerminalOutput type="success">
            <div className="flex items-center">
              <div className="mr-3 text-2xl">👋</div>
              <div>
                <div className="font-bold">Session ended</div>
                <div className="text-sm text-gray-300 mt-1">
                  Thank you for using Henry Reed AI Terminal! Redirecting to login...
                </div>
              </div>
            </div>
          </TerminalOutput>
        );
      }
    }
  ];

  // Combine AI commands with Linux primitives
  const linuxCommands = buildLinuxCommands();
  const commandConfigs: CommandConfig[] = [...aiCommands, ...linuxCommands];

  const executeCommand = async (inputStr: string) => {
    const trimmed = inputStr.trim();
    if (!trimmed) return;

    // Parse command from first line for multi-word commands
    const firstLine = trimmed.split(/\r?\n/)[0];
    
    // Handle multi-word commands like 'getting started'
    let config = commandConfigs.find(c => firstLine.toLowerCase().startsWith(c.name.toLowerCase()));
    let command = '';
    let args: string[] = [];
    
    if (config) {
      command = config.name.toLowerCase();
      args = firstLine.slice(config.name.length).trim().split(' ').filter(arg => arg.length > 0);
    } else {
      // Fall back to single word command parsing
      const parts = firstLine.split(' ');
      command = parts[0].toLowerCase();
      args = parts.slice(1);
      config = commandConfigs.find(c => c.name === command || c.aliases?.includes(command));
    }
    
    // Build context object for command handlers
    const ctx: CommandHandlerCtx = {
      rawInput: trimmed,
      cwd,
      setCwd,
      vfs: vfsRef.current,
      user,
      history,
      bootTimeMs: bootRef.current,
      prevCwd,
      setPrevCwd,
      persistData
    };
    
    let output: React.ReactNode = null;
    
    if (config) {
      if (command === 'clear' || config.name === 'clear') {
        setCommands([]);
        return;
      }
      
      try {
        // Handle both sync and async handlers
        const result = config.handler(args, ctx);
        if (result && typeof result === 'object' && 'then' in result) {
          // Show loading state for async operations
          const loadingCommand: Command = {
            input: trimmed,
            output: (
              <TerminalOutput type="info">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-3"></div>
                  <span>Processing command...</span>
                </div>
              </TerminalOutput>
            ),
            timestamp: new Date(),
            cwd // capture at execution
          };
          
          setCommands(prev => [...prev, loadingCommand]);
          setHistory(prev => [...prev, trimmed]);
          setHistoryIndex(-1);
          
          // Wait for async result and update
          try {
            const asyncOutput = await (result as Promise<React.ReactNode>);
            setCommands(prev => {
              const newCommands = [...prev];
              newCommands[newCommands.length - 1] = {
                input: trimmed,
                output: asyncOutput || null, // Allow null outputs
                timestamp: new Date(),
                cwd: newCommands[newCommands.length - 1].cwd // preserve original cwd
              };
              return newCommands;
            });
          } catch (asyncError) {
            setCommands(prev => {
              const newCommands = [...prev];
              newCommands[newCommands.length - 1] = {
                input: trimmed,
                output: (
                  <TerminalOutput type="error">
                    <div className="flex items-center">
                      <div className="mr-3 text-xl">❌</div>
                      <div>
                        <div className="font-bold">Async Command Error</div>
                        <div className="text-sm mt-1">
                          {asyncError instanceof Error ? asyncError.message : 'Unknown error'}
                        </div>
                      </div>
                    </div>
                  </TerminalOutput>
                ),
                timestamp: new Date(),
                cwd: newCommands[newCommands.length - 1].cwd // preserve original cwd
              };
              return newCommands;
            });
          }
          return;
        } else {
          output = result; // Allow null outputs
        }
      } catch (error) {
        output = (
          <TerminalOutput type="error">
            <div className="flex items-center">
              <div className="mr-3 text-xl">❌</div>
              <div>
                <div className="font-bold">Command Error</div>
                <div className="text-sm mt-1">
                  {error instanceof Error ? error.message : 'Unknown error'}
                </div>
              </div>
            </div>
          </TerminalOutput>
        );
      }
    } else {
      output = (
        <TerminalOutput type="error">
          <div className="flex items-center">
            <div className="mr-3 text-xl">❓</div>
            <div>
              <div className="font-bold">Command not found</div>
              <div className="text-sm mt-1">
                '{command}' is not a recognized command. Type <span className="text-green-400 font-mono">help</span> for available commands.
              </div>
            </div>
          </div>
        </TerminalOutput>
      );
    }

    // ALWAYS create a new command entry, even for null outputs (like successful cd)
    // This ensures Enter key always advances to a new line like in Linux terminals
    const newCommand: Command = {
      input: trimmed,
      output,
      timestamp: new Date(),
      cwd // capture at execution
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter: allow default (insert newline)
        return;
      } else {
        // Enter: prevent default and execute command
        e.preventDefault();
        handleSubmit(e);
        return;
      }
    }
    
    if (e.key === 'ArrowUp') {
      // Only navigate history if at first line
      const { selectionStart, value } = target;
      const beforeCursor = value.substring(0, selectionStart);
      const isAtFirstLine = !beforeCursor.includes('\n');
      
      if (isAtFirstLine && history.length > 0) {
        e.preventDefault();
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      // Only navigate history if at last line
      const { selectionEnd, value } = target;
      const afterCursor = value.substring(selectionEnd);
      const isAtLastLine = !afterCursor.includes('\n');
      
      if (isAtLastLine && historyIndex >= 0) {
        e.preventDefault();
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
      // Enhanced tab completion for current line's last token
      const { selectionStart, value } = target;
      const beforeCursor = value.substring(0, selectionStart);
      const lines = beforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];
      const tokens = currentLine.trim().split(/\s+/);
      const lastToken = tokens[tokens.length - 1] || '';
      
      if (tokens.length === 1 && lastToken) {
        // Complete command name
        const matchingCommands = commandConfigs
          .filter(c => c.name.startsWith(lastToken.toLowerCase()) || c.aliases?.some(a => a.startsWith(lastToken.toLowerCase())))
          .map(c => c.name);
          
        if (matchingCommands.length === 1) {
          const newValue = value.substring(0, selectionStart - lastToken.length) + matchingCommands[0] + ' ' + value.substring(selectionStart);
          setInput(newValue);
          setTimeout(() => {
            if (inputRef.current) {
              const newCursorPos = selectionStart - lastToken.length + matchingCommands[0].length + 1;
              inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
          }, 0);
        }
      }
    }
  };

  return (
    <div className="bg-black text-green-400 font-mono h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-lg font-bold text-cyan-400">PoV-CLI Terminal</div>
          <div className="text-sm text-gray-400">Henry Reed AI Platform</div>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-green-400">●</span>
              <span className="text-gray-300">{user.email}</span>
              <button 
                onClick={() => executeCommand('logout')}
                className="text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-600/30 hover:border-red-500/50 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLogin(true)}
              className="text-blue-400 hover:text-blue-300 px-2 py-1 rounded border border-blue-600/30 hover:border-blue-500/50 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto terminal-scrollbar bg-gradient-to-b from-black to-gray-900"
        style={{ fontSize: '14px', lineHeight: '1.5' }}
      >
        {commands.map((cmd, index) => (
          <div key={index} className="mb-4">
            {cmd.input && (
              <div className="flex items-start mb-2">
                <span className="text-blue-400 mr-2 select-none whitespace-nowrap">{formatPrompt(cmd.cwd ?? cwd)}</span>
                <span className="text-white font-mono whitespace-pre-wrap break-words">{cmd.input}</span>
              </div>
            )}
            {cmd.output && (
              <div className="ml-0 mb-2">
                {cmd.output}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-700 bg-gray-900 p-4">
        <div className="flex items-start">
          <span className="text-blue-400 mr-2 select-none whitespace-nowrap mt-1">{formatPrompt(cwd)}</span>
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white font-mono text-sm resize-none min-h-[1.5em] max-h-40 overflow-y-auto"
            placeholder="Enter = run • Shift+Enter = newline • ↑/↓ history • Tab completion"
            autoFocus
            style={{ fontSize: '14px', lineHeight: '1.5' }}
          />
        </div>
      </form>

      {/* Login Modal */}
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
    </div>
  );
}
