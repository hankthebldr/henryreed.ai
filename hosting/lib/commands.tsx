import React from 'react';

export interface CommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  handler: (args: string[]) => React.ReactNode;
}

export const commands: CommandConfig[] = [
  {
    name: 'help',
    description: 'Show available commands',
    usage: 'help [command]',
    aliases: ['?', 'man'],
    handler: (args) => {
      if (args.length > 0) {
        const cmdName = args[0].toLowerCase();
        const cmd = commands.find(c => c.name === cmdName || c.aliases?.includes(cmdName));
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
<div className="font-bold mb-4 text-lg">🔐 XSIAM & Cortex Terminal - Available Commands</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commands.map(cmd => (
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
            <div className="mt-6 p-4 bg-gray-800 rounded border border-yellow-600">
              <div className="text-yellow-400 font-bold">🎯 Explore</div>
              <div className="text-gray-300 mt-1">Try the following to get started:</div>
              <div className="text-green-400 mt-2 font-mono">→ scenario list</div>
              <div className="text-blue-400 mt-1 font-mono">→ scenario mitre --scenario-type cloud-posture</div>
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
              <span className="text-yellow-400">contact/</span>
              <span className="text-gray-500">Get in touch and schedule meetings</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-800 rounded border border-gray-600">
            <div className="text-yellow-400 font-bold mb-2">💡 Quick Start</div>
            <div className="text-gray-300 text-sm">
              Try these commands to get started:<br/>
              <span className="text-green-400 font-mono">ls ctx --all-products</span> - Explore all services<br/>
              <span className="text-blue-400 font-mono">whoami --detailed</span> - Learn about Henry Reed<br/>
              <span className="text-purple-400 font-mono">contact --schedule</span> - Book a consultation
            </div>
          </div>
        </div>
      );
    }
  },
  // ... (continuing in next part due to length)
];
