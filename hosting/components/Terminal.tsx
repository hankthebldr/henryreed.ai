'use client';

import React, { useState, useRef, useEffect } from 'react';

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
  handler: (args: string[]) => React.ReactNode;
}

export default function Terminal() {
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
          <div className="text-xl font-bold text-cyan-400">Henry Reed AI Terminal</div>
          <div className="text-sm text-gray-400 mt-2">
            <div className="text-lg text-cyan-300 font-semibold mb-1">Professional AI Services & Consulting</div>
            <div>Type 'getting started' or 'help' for available commands</div>
          </div>
        </div>
      ),
      timestamp: new Date()
    }]);
  }, []);

  const commandConfigs: CommandConfig[] = [
    {
      name: 'help',
      description: 'Show available commands',
      usage: 'help [command]',
      handler: (args) => {
        if (args.length > 0) {
          const cmd = commandConfigs.find(c => c.name === args[0]);
          if (cmd) {
            return (
              <div className="text-blue-300">
                <div className="font-bold">{cmd.name}</div>
                <div>{cmd.description}</div>
                <div className="text-gray-400">Usage: {cmd.usage}</div>
              </div>
            );
          }
          return <div className="text-red-400">Command '{args[0]}' not found</div>;
        }

        return (
          <div className="text-blue-300">
            <div className="font-bold mb-2">Available Commands:</div>
            {commandConfigs.map(cmd => (
              <div key={cmd.name} className="mb-1">
                <span className="text-green-400 font-mono">{cmd.name.padEnd(15)}</span>
                <span>{cmd.description}</span>
              </div>
            ))}
            <div className="mt-4 text-gray-400 text-sm">
              Tip: Use 'help [command]' for detailed usage information
            </div>
          </div>
        );
      }
    },
    {
      name: 'ls',
      description: 'List available security scenario categories',
      usage: 'ls scenarios',
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
      name: 'whoami',
      description: 'Display information about Henry Reed',
      usage: 'whoami [--detailed]',
      handler: (args) => {
        const detailed = args.includes('--detailed');
        
        if (detailed) {
          return (
            <div className="text-blue-300">
              <div className="font-bold text-xl mb-3">Henry Reed</div>
              <div className="space-y-2 text-sm">
                <div><span className="text-green-400">Role:</span> AI Engineer & Consultant</div>
                <div><span className="text-green-400">Expertise:</span> Machine Learning, LLMs, Computer Vision</div>
                <div><span className="text-green-400">Focus:</span> Enterprise AI implementation and strategy</div>
                <div><span className="text-green-400">Mission:</span> Making AI accessible and practical for businesses</div>
                <div className="mt-3 text-gray-400">
                  "Bridging the gap between cutting-edge AI research and real-world business applications"
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="text-blue-300">
            <div className="text-lg font-bold">Henry Reed</div>
            <div className="text-sm text-gray-300">AI Engineer & Consultant</div>
            <div className="text-xs text-gray-500 mt-1">Use --detailed for more info</div>
          </div>
        );
      }
    },
    {
      name: 'contact',
      description: 'Get contact information',
      usage: 'contact [--email] [--linkedin] [--schedule]',
      handler: (args) => {
        const email = args.includes('--email');
        const linkedin = args.includes('--linkedin');
        const schedule = args.includes('--schedule');

        if (email || linkedin || schedule) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-3">📞 Contact Information</div>
              <div className="space-y-2">
                {email && (
                  <div className="text-green-400">
                    📧 Email: henry@henryreed.ai
                  </div>
                )}
                {linkedin && (
                  <div className="text-blue-400">
                    💼 LinkedIn: /in/henryreedai
                  </div>
                )}
                {schedule && (
                  <div className="text-purple-400">
                    📅 Schedule: cal.com/henryreed
                  </div>
                )}
              </div>
            </div>
          );
        }

        return (
          <div className="text-blue-300">
            <div className="font-bold mb-3">📞 How to reach me</div>
            <div className="space-y-1 text-sm">
              <div className="text-green-400">• --email     Get email address</div>
              <div className="text-blue-400">• --linkedin  LinkedIn profile</div>
              <div className="text-purple-400">• --schedule  Book a meeting</div>
            </div>
          </div>
        );
      }
    },
    {
      name: 'services',
      description: 'Explore available services',
      usage: 'services [--consulting] [--development] [--training]',
      handler: (args) => {
        const consulting = args.includes('--consulting');
        const development = args.includes('--development');
        const training = args.includes('--training');

        if (consulting) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-3">🎯 AI Consulting Services</div>
              <div className="space-y-3">
                <div className="border border-green-400 p-3 rounded">
                  <div className="text-green-400 font-bold">Strategy & Assessment</div>
                  <div className="text-sm text-gray-300 mt-1">
                    • AI readiness evaluation<br/>
                    • Technology roadmap development<br/>
                    • ROI analysis and business case development
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Perfect for: C-suite executives, CTOs, Product Managers
                </div>
              </div>
            </div>
          );
        }

        if (development) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-3">⚡ Custom AI Development</div>
              <div className="space-y-3">
                <div className="border border-blue-400 p-3 rounded">
                  <div className="text-blue-400 font-bold">End-to-End Solutions</div>
                  <div className="text-sm text-gray-300 mt-1">
                    • Custom model development and fine-tuning<br/>
                    • MLOps pipeline setup<br/>
                    • Production deployment and monitoring
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Perfect for: Engineering teams, Startups, Scale-ups
                </div>
              </div>
            </div>
          );
        }

        if (training) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-3">🎓 Training & Education</div>
              <div className="space-y-3">
                <div className="border border-purple-400 p-3 rounded">
                  <div className="text-purple-400 font-bold">Skill Development</div>
                  <div className="text-sm text-gray-300 mt-1">
                    • Technical workshops for engineers<br/>
                    • Executive AI briefings<br/>
                    • Hands-on coding bootcamps
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Perfect for: Teams, Organizations, Individuals
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="text-blue-300">
            <div className="font-bold mb-3">🚀 Available Services</div>
            <div className="space-y-2">
              <div className="text-green-400">• --consulting    Strategic AI guidance</div>
              <div className="text-blue-400">• --development   Custom AI solutions</div>
              <div className="text-purple-400">• --training      Team education & workshops</div>
            </div>
            <div className="mt-4 text-gray-400 text-sm">
              Try: services --consulting
            </div>
          </div>
        );
      }
    },
    {
      name: 'getting started',
      description: 'Introduction to Henry Reed AI Terminal',
      usage: 'getting started',
      handler: () => {
        return (
          <div className="text-blue-300">
            <div className="font-bold text-xl mb-4">🚀 Welcome to Henry Reed AI Terminal</div>
            
            <div className="space-y-4">
              <div className="bg-cyan-900/20 p-4 rounded border border-cyan-500/30">
                <div className="text-cyan-400 font-bold mb-3">What is this?</div>
                <div className="text-sm space-y-2">
                  <div>This is an interactive terminal interface for exploring Henry Reed's AI consulting services, technical expertise, and professional offerings.</div>
                  <div>Built for business leaders, technical teams, and anyone interested in AI implementation and strategy.</div>
                </div>
              </div>
              
              <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
                <div className="text-green-400 font-bold mb-3">🎯 Quick Start Guide</div>
                <div className="text-sm space-y-2">
                  <div><span className="text-green-400 font-mono">whoami --detailed</span> - Learn about Henry Reed's expertise</div>
                  <div><span className="text-blue-400 font-mono">services --consulting</span> - Explore AI consulting services</div>
                  <div><span className="text-purple-400 font-mono">ls ctx --all-products</span> - View all products and services</div>
                  <div><span className="text-yellow-400 font-mono">contact --schedule</span> - Book a consultation</div>
                </div>
              </div>
              
              <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
                <div className="text-blue-400 font-bold mb-3">💡 Pro Tips</div>
                <div className="text-sm space-y-2">
                  <div>• Use <span className="text-green-400 font-mono">help [command]</span> for detailed command info</div>
                  <div>• Press <span className="text-blue-400 font-mono">↑/↓</span> to navigate command history</div>
                  <div>• Try <span className="text-purple-400 font-mono">ls ctx</span> to explore different contexts</div>
                  <div>• Type <span className="text-red-400 font-mono">clear</span> to reset the terminal</div>
                </div>
              </div>
              
              <div className="text-sm text-gray-400">
                Ready to get started? Try <span className="text-green-400 font-mono">services</span> or <span className="text-blue-400 font-mono">whoami</span> to explore.
              </div>
            </div>
          </div>
        );
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
      name: 'clear',
      description: 'Clear the terminal',
      usage: 'clear',
      handler: () => {
        setCommands([]);
        return null;
      }
    }
  ];

  const executeCommand = (inputStr: string) => {
    const trimmed = inputStr.trim();
    if (!trimmed) return;

    // Handle multi-word commands like 'getting started'
    let config = commandConfigs.find(c => trimmed.toLowerCase().startsWith(c.name.toLowerCase()));
    let command = '';
    let args: string[] = [];
    
    if (config) {
      command = config.name.toLowerCase();
      args = trimmed.slice(config.name.length).trim().split(' ').filter(arg => arg.length > 0);
    } else {
      // Fall back to single word command parsing
      const parts = trimmed.split(' ');
      command = parts[0].toLowerCase();
      args = parts.slice(1);
      config = commandConfigs.find(c => c.name === command);
    }
    let output: React.ReactNode;
    if (config) {
      output = config.handler(args);
    } else {
      output = <div className="text-red-400">Command '{command}' not found</div>;
    }

    setCommands(prev => [...prev, { input: trimmed, output, timestamp: new Date() }]);
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
