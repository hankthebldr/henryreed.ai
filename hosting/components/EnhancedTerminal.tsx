'use client';

import React, { useState, useRef, useEffect } from 'react';
import { scenarioCommands } from '../lib/scenario-commands';

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
    // Add welcome message
    setCommands([{
      input: '',
      output: (
        <div className="text-green-400 mb-4">
          <pre className="text-lg font-bold text-cyan-400">
{`
 ██╗  ██╗███████╗██╗ █████╗ ███╗   ███╗
 ╚██╗██╔╝██╔════╝██║██╔══██╗████╗ ████║
  ╚███╔╝ ███████╗██║███████║██╔████╔██║
  ██╔██╗ ╚════██║██║██╔══██║██║╚██╔╝██║
 ██╔╝ ██╗███████║██║██║  ██║██║ ╚═╝ ██║
 ╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
`}
          </pre>
          <div className="text-sm text-gray-400 mt-2">Proof-of-Value CLI • Type 'help' for available commands</div>
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
            <div className="font-bold mb-4 text-lg">🤖 Henry Reed AI Terminal - Available Commands</div>
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
              • Try 'ls ctx --all-products' to explore services<br/>
              • Use tab completion for faster typing
            </div>
          </div>
        );
      }
    },
    {
      name: 'ls',
      description: 'List and explore context',
      usage: 'ls [ctx|projects|services] [--all-products] [--skills] [--recent]',
      aliases: ['list', 'dir'],
      handler: (args) => {
        const hasCtx = args.includes('ctx');
        const hasProjects = args.includes('projects');
        const hasServices = args.includes('services');
        const allProducts = args.includes('--all-products');
        const skills = args.includes('--skills');
        const recent = args.includes('--recent');

        if (hasCtx && allProducts) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-4 text-xl">🚀 All Products & Services</div>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 bg-gray-900 p-4 rounded-r">
                  <div className="text-green-400 font-bold text-lg flex items-center">
                    <span className="mr-2">🎯</span> AI Strategy & Consulting
                  </div>
                  <div className="text-gray-300 mt-2">Transform your business with strategic AI implementation</div>
                  <div className="mt-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="text-green-300">• Readiness Assessment</div>
                      <div className="text-green-300">• Technology Roadmaps</div>
                      <div className="text-green-300">• ROI Analysis</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Perfect for: CTOs, Product Leaders, C-Suite Executives
                  </div>
                </div>
                
                <div className="border-l-4 border-blue-500 bg-gray-900 p-4 rounded-r">
                  <div className="text-blue-400 font-bold text-lg flex items-center">
                    <span className="mr-2">⚡</span> Custom AI Development
                  </div>
                  <div className="text-gray-300 mt-2">End-to-end AI solutions tailored to your needs</div>
                  <div className="mt-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="text-blue-300">• LLM Fine-tuning</div>
                      <div className="text-blue-300">• Computer Vision</div>
                      <div className="text-blue-300">• MLOps Pipelines</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Perfect for: Engineering Teams, Startups, Scale-ups
                  </div>
                </div>
                
                <div className="border-l-4 border-purple-500 bg-gray-900 p-4 rounded-r">
                  <div className="text-purple-400 font-bold text-lg flex items-center">
                    <span className="mr-2">🎓</span> Training & Education
                  </div>
                  <div className="text-gray-300 mt-2">Upskill your team with cutting-edge AI knowledge</div>
                  <div className="mt-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="text-purple-300">• Technical Workshops</div>
                      <div className="text-purple-300">• Executive Briefings</div>
                      <div className="text-purple-300">• Coding Bootcamps</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Perfect for: Teams, Organizations, Individual Contributors
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (hasCtx && skills) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-4 text-xl">🛠️ Technical Expertise</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border border-green-500 p-4 rounded">
                    <div className="text-green-400 font-bold text-lg mb-3">🤖 AI/ML Stack</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">PyTorch & TensorFlow</span>
                        <span className="text-green-400">Expert</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Transformers & LLMs</span>
                        <span className="text-green-400">Expert</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Computer Vision</span>
                        <span className="text-green-400">Expert</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">MLOps & Deployment</span>
                        <span className="text-blue-400">Advanced</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-blue-500 p-4 rounded">
                    <div className="text-blue-400 font-bold text-lg mb-3">🚀 Engineering</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Python & TypeScript</span>
                        <span className="text-green-400">Expert</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">React & Next.js</span>
                        <span className="text-blue-400">Advanced</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Docker & Kubernetes</span>
                        <span className="text-blue-400">Advanced</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">AWS & GCP</span>
                        <span className="text-blue-400">Advanced</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border border-purple-500 p-4 rounded">
                    <div className="text-purple-400 font-bold text-lg mb-3">📊 Data & Analytics</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Pandas & NumPy</span>
                        <span className="text-green-400">Expert</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">SQL & NoSQL</span>
                        <span className="text-blue-400">Advanced</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Data Pipelines</span>
                        <span className="text-blue-400">Advanced</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Visualization</span>
                        <span className="text-blue-400">Advanced</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-yellow-500 p-4 rounded">
                    <div className="text-yellow-400 font-bold text-lg mb-3">🏗️ Architecture</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">System Design</span>
                        <span className="text-green-400">Expert</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Microservices</span>
                        <span className="text-blue-400">Advanced</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">API Design</span>
                        <span className="text-blue-400">Advanced</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Cloud Architecture</span>
                        <span className="text-blue-400">Advanced</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (hasProjects || (hasCtx && recent)) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-4 text-xl">📁 Recent Projects & Case Studies</div>
              <div className="space-y-4">
                <div className="border border-green-500 bg-gray-900 p-4 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-green-400 font-bold">enterprise-llm-deployment/</div>
                    <div className="text-gray-500 text-xs">2 days ago</div>
                  </div>
                  <div className="text-gray-300 text-sm mb-2">
                    Large enterprise LLM deployment with custom fine-tuning and RAG implementation
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-green-800 text-green-200 px-2 py-1 rounded">PyTorch</span>
                    <span className="bg-blue-800 text-blue-200 px-2 py-1 rounded">Transformers</span>
                    <span className="bg-purple-800 text-purple-200 px-2 py-1 rounded">Docker</span>
                  </div>
                </div>
                
                <div className="border border-blue-500 bg-gray-900 p-4 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-blue-400 font-bold">computer-vision-pipeline/</div>
                    <div className="text-gray-500 text-xs">1 week ago</div>
                  </div>
                  <div className="text-gray-300 text-sm mb-2">
                    Real-time object detection and tracking system for manufacturing quality control
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-green-800 text-green-200 px-2 py-1 rounded">OpenCV</span>
                    <span className="bg-blue-800 text-blue-200 px-2 py-1 rounded">YOLO</span>
                    <span className="bg-purple-800 text-purple-200 px-2 py-1 rounded">FastAPI</span>
                  </div>
                </div>
                
                <div className="border border-purple-500 bg-gray-900 p-4 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-purple-400 font-bold">ai-training-curriculum/</div>
                    <div className="text-gray-500 text-xs">2 weeks ago</div>
                  </div>
                  <div className="text-gray-300 text-sm mb-2">
                    Comprehensive AI/ML training program for Fortune 500 engineering teams
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-green-800 text-green-200 px-2 py-1 rounded">Education</span>
                    <span className="bg-blue-800 text-blue-200 px-2 py-1 rounded">Jupyter</span>
                    <span className="bg-purple-800 text-purple-200 px-2 py-1 rounded">MLflow</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (hasCtx) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-4 text-xl">📋 Available Context</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="text-green-400 font-mono">ls ctx --all-products</div>
                  <div className="text-gray-300 text-sm ml-4">→ Show all products and services</div>
                  
                  <div className="text-blue-400 font-mono">ls ctx --skills</div>
                  <div className="text-gray-300 text-sm ml-4">→ Display technical expertise</div>
                  
                  <div className="text-purple-400 font-mono">ls ctx --recent</div>
                  <div className="text-gray-300 text-sm ml-4">→ Show recent projects</div>
                </div>
                <div className="space-y-3">
                  <div className="text-yellow-400 font-mono">ls projects</div>
                  <div className="text-gray-300 text-sm ml-4">→ Browse project portfolio</div>
                  
                  <div className="text-cyan-400 font-mono">ls services</div>
                  <div className="text-gray-300 text-sm ml-4">→ Explore available services</div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">📁 Terminal Directory Structure</div>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-green-400">ctx/</span>
                <span className="text-gray-500">Context and information about Henry Reed AI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-400">projects/</span>
                <span className="text-gray-500">Project portfolio and case studies</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">services/</span>
                <span className="text-gray-500">Available AI consulting services</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">cloud-detect</span>
                <span className="text-gray-500">Get in touch and schedule meetings</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-800 rounded border border-gray-600">
              <div className="text-yellow-400 font-bold mb-2">💡 Quick Start</div>
              <div className="text-gray-300 text-sm">
                Try these commands to get started:<br/>
                <span className="text-green-400 font-mono">ls ctx --all-products</span> - Explore all services<br/>
                <span className="text-green-400 font-mono">cloud-detect</span> - View cloud detection rules
              </div>
            </div>
          </div>
        );
      }
    },
    {
      name: 'services',
      description: 'Explore available AI services',
      usage: 'services [--all] [--consulting] [--development] [--training]',
      aliases: ['offerings', 'solutions'],
      handler: (args) => {
        // Redirect to ls ctx --all-products for a unified view
        return commandConfigs.find(c => c.name === 'ls')?.handler(['ctx', '--all-products']) || (
          <div className="text-red-400">Services command unavailable</div>
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
      name: 'scenario',
      description: 'Deploy and manage security assessment scenarios',
      usage: 'scenario <action> [options]',
      aliases: ['deploy', 'pov'],
      handler: async (args) => {
        if (args.length === 0) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-4 text-xl">🎯 Proof-of-Value Scenario Management</div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-blue-600 p-4 rounded">
                    <div className="text-blue-400 font-bold mb-2">Available Actions</div>
                    <div className="space-y-1 text-sm">
                      <div className="font-mono text-green-400">scenario list</div>
                      <div className="text-gray-500 ml-4">→ Show available templates</div>
                      <div className="font-mono text-yellow-400">scenario generate --scenario-type &lt;type&gt;</div>
                      <div className="text-gray-500 ml-4">→ Deploy a scenario</div>
                      <div className="font-mono text-purple-400">scenario status [deployment-id]</div>
                      <div className="text-gray-500 ml-4">→ Check deployment status</div>
                      <div className="font-mono text-cyan-400">scenario validate &lt;deployment-id&gt;</div>
                      <div className="text-gray-500 ml-4">→ Run validation tests</div>
                      <div className="font-mono text-red-400">scenario destroy &lt;deployment-id&gt;</div>
                      <div className="text-gray-500 ml-4">→ Clean up resources</div>
                      <div className="font-mono text-orange-400">scenario export &lt;deployment-id&gt;</div>
                      <div className="text-gray-500 ml-4">→ Export results and data</div>
                    </div>
                  </div>
                  <div className="border border-green-600 p-4 rounded">
                    <div className="text-green-400 font-bold mb-2">Scenario Types</div>
                    <div className="space-y-1 text-sm">
                      <div className="text-green-300">• cloud-posture</div>
                      <div className="text-blue-300">• container-vuln</div>
                      <div className="text-purple-300">• code-vuln</div>
                      <div className="text-yellow-300">• insider-threat</div>
                      <div className="text-red-300">• ransomware</div>
                      <div className="text-cyan-300">• waas-exploit</div>
                      <div className="text-pink-300">• ai-threat</div>
                      <div className="text-orange-300">• pipeline-breach</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-800 rounded border border-gray-600">
                  <div className="text-yellow-400 font-bold mb-2">💡 Quick Start</div>
                  <div className="text-gray-300 text-sm space-y-1">
                    <div className="font-mono text-green-400">scenario list</div>
                    <div className="text-gray-500 ml-4">→ Browse all available scenario templates</div>
                    <div className="font-mono text-blue-400">scenario generate --scenario-type cloud-posture --provider gcp</div>
                    <div className="text-gray-500 ml-4">→ Deploy a cloud security posture scenario</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        const action = args[0].toLowerCase();
        const remainingArgs = args.slice(1);

        try {
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
        } catch (error) {
          return (
            <div className="text-red-400">
              <div className="font-bold mb-2">❌ Scenario Command Error</div>
              <div>Failed to execute scenario command: {error instanceof Error ? error.message : 'Unknown error'}</div>
            </div>
          );
        }
      }
    },
    {
      name: 'ai',
      description: 'Interact with the Henry Reed AI assistant',
      usage: 'ai [prompt]',
      aliases: ['ask', 'chat'],
      handler: (args) => {
        const prompt = args.join(' ');
        if (!prompt) {
          return (
            <div className="text-yellow-400">
              <div className="font-bold mb-2">🤖 Henry Reed AI Assistant</div>
              <div className="text-gray-300">Ask me anything about AI, machine learning, or my services!</div>
              <div className="mt-3 text-sm">
                <div className="font-mono text-blue-400">ai What is the future of LLMs?</div>
                <div className="font-mono text-green-400">ai How can AI help my business?</div>
                <div className="font-mono text-purple-400">ai What services do you offer?</div>
              </div>
            </div>
          );
        }
        
        // Simulated AI responses based on common queries
        const lowerPrompt = prompt.toLowerCase();
        
        if (lowerPrompt.includes('llm') || lowerPrompt.includes('language model')) {
          return (
            <div className="text-cyan-400">
              <div className="font-bold mb-2">🤖 Henry Reed AI:</div>
              <div className="text-gray-300">
                The future of Large Language Models is incredibly exciting! I see three key trends:
                <br/><br/>
                1. <span className="text-blue-400">Specialization</span>: Domain-specific models will outperform general-purpose ones
                <br/>
                2. <span className="text-green-400">Efficiency</span>: Smaller, more efficient models through better training techniques
                <br/>
                3. <span className="text-purple-400">Integration</span>: Seamless integration into everyday business workflows
                <br/><br/>
                Want to explore how LLMs can transform your organization? Try: <span className="font-mono text-yellow-400">cloud-detect</span>
              </div>
            </div>
          );
        }
        
        if (lowerPrompt.includes('business') || lowerPrompt.includes('company')) {
          return (
            <div className="text-cyan-400">
              <div className="font-bold mb-2">🤖 Henry Reed AI:</div>
              <div className="text-gray-300">
                AI can revolutionize your business in several ways:
                <br/><br/>
                • <span className="text-green-400">Automation</span>: Streamline repetitive tasks and processes
                <br/>
                • <span className="text-blue-400">Insights</span>: Extract valuable patterns from your data
                <br/>
                • <span className="text-purple-400">Customer Experience</span>: Personalize interactions at scale
                <br/>
                • <span className="text-yellow-400">Decision Making</span>: Data-driven strategic planning
                <br/><br/>
                Ready to start your AI journey? Run: <span className="font-mono text-blue-400">ls ctx --all-products</span>
              </div>
            </div>
          );
        }
        
        if (lowerPrompt.includes('service') || lowerPrompt.includes('offer') || lowerPrompt.includes('help')) {
          return (
            <div className="text-cyan-400">
              <div className="font-bold mb-2">🤖 Henry Reed AI:</div>
              <div className="text-gray-300">
                I offer comprehensive AI solutions:
                <br/><br/>
                🎯 <span className="text-green-400">AI Strategy & Consulting</span> - Transform your business approach
                <br/>
                ⚡ <span className="text-blue-400">Custom AI Development</span> - Build tailored solutions
                <br/>
                🎓 <span className="text-purple-400">Training & Education</span> - Upskill your team
                <br/><br/>
                Explore all services: <span className="font-mono text-yellow-400">services</span>
              </div>
            </div>
          );
        }
        
        // Default response for unrecognized queries
        return (
          <div className="text-cyan-400">
            <div className="font-bold mb-2">🤖 Henry Reed AI:</div>
            <div className="text-gray-300">
              That's an interesting question about "{prompt}"! While I can provide some general insights, I'd love to discuss this in more detail.
              <br/><br/>
              For personalized advice and detailed answers, explore detection scenarios: <span className="font-mono text-green-400">cloud-detect --egg</span>
              <br/><br/>
              Or explore my services: <span className="font-mono text-blue-400">ls ctx --all-products</span>
            </div>
          </div>
        );
      }
    }
  ];

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
        // Handle both sync and async handlers
        const result = config.handler(args);
        if (result && typeof result === 'object' && 'then' in result) {
          // Show loading state for async operations
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
          
          // Wait for async result and update
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
      // Simple tab completion for commands
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
