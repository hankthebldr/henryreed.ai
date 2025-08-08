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
    // Add welcome message
    setCommands([{
      input: '',
      output: (
        <div className="text-green-400 mb-4">
          <div className="text-xl font-bold">Henry Reed AI Terminal</div>
          <div className="text-sm text-gray-400">Type 'help' for available commands</div>
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
      description: 'List and explore context',
      usage: 'ls [ctx] [--all-products] [--skills] [--projects]',
      handler: (args) => {
        const hasCtx = args.includes('ctx');
        const allProducts = args.includes('--all-products');
        const skills = args.includes('--skills');
        const projects = args.includes('--projects');

        if (hasCtx && allProducts) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-3">🚀 All Products & Services</div>
              <div className="space-y-3">
                <div className="border-l-2 border-green-400 pl-3">
                  <div className="text-green-400 font-bold">AI Consulting</div>
                  <div className="text-sm text-gray-300">Strategic AI implementation for enterprises</div>
                  <div className="text-xs text-gray-500">• Machine Learning Strategy • Data Architecture • AI Governance</div>
                </div>
                <div className="border-l-2 border-blue-400 pl-3">
                  <div className="text-blue-400 font-bold">Custom AI Development</div>
                  <div className="text-sm text-gray-300">Tailored AI solutions and models</div>
                  <div className="text-xs text-gray-500">• LLM Fine-tuning • Computer Vision • NLP Solutions</div>
                </div>
                <div className="border-l-2 border-purple-400 pl-3">
                  <div className="text-purple-400 font-bold">AI Training & Workshops</div>
                  <div className="text-sm text-gray-300">Upskill your team with AI expertise</div>
                  <div className="text-xs text-gray-500">• Technical Training • Executive Briefings • Hands-on Workshops</div>
                </div>
              </div>
            </div>
          );
        }

        if (hasCtx && skills) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-3">🛠️ Technical Skills</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-green-400 font-bold">AI/ML</div>
                  <div className="text-gray-300">• PyTorch, TensorFlow</div>
                  <div className="text-gray-300">• Transformers, LLMs</div>
                  <div className="text-gray-300">• Computer Vision</div>
                </div>
                <div>
                  <div className="text-blue-400 font-bold">Engineering</div>
                  <div className="text-gray-300">• Python, TypeScript</div>
                  <div className="text-gray-300">• React, Next.js</div>
                  <div className="text-gray-300">• Cloud Architecture</div>
                </div>
              </div>
            </div>
          );
        }

        if (hasCtx && projects) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-3">📁 Recent Projects</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-400">enterprise-llm-deployment/</span>
                  <span className="text-gray-500 text-xs">2 days ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">computer-vision-pipeline/</span>
                  <span className="text-gray-500 text-xs">1 week ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-400">ai-training-curriculum/</span>
                  <span className="text-gray-500 text-xs">2 weeks ago</span>
                </div>
              </div>
            </div>
          );
        }

        if (hasCtx) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-2">📋 Available Context</div>
              <div className="text-sm space-y-1">
                <div className="text-gray-300">Use flags to explore specific areas:</div>
                <div className="text-green-400">• --all-products  Show all products and services</div>
                <div className="text-blue-400">• --skills        Show technical skills</div>
                <div className="text-purple-400">• --projects      Show recent projects</div>
              </div>
            </div>
          );
        }

        return (
          <div className="text-blue-300">
            <div className="font-bold mb-2">📁 Terminal Directory</div>
            <div className="space-y-1 font-mono text-sm">
              <div className="text-green-400">ctx/           Context and information</div>
              <div className="text-blue-400">projects/      Project portfolio</div>
              <div className="text-purple-400">services/      Available services</div>
              <div className="text-yellow-400">contact/       Get in touch</div>
            </div>
            <div className="mt-4 text-gray-400 text-sm">
              Try: ls ctx --all-products
            </div>
          </div>
        );
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

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    const config = commandConfigs.find(c => c.name === command);
    
    let output: React.ReactNode;
    if (config) {
      if (command === 'clear') {
        config.handler(args);
        return;
      }
      output = config.handler(args);
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
    }
  };

  return (
    <div className="bg-black text-green-400 font-mono text-sm h-screen flex flex-col">
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto"
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
