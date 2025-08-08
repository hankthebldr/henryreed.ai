import React from 'react';
import { commands as baseCommands, CommandConfig } from './commands';

const extendedCommands: CommandConfig[] = [
  {
    name: 'whoami',
    description: 'Display information about Henry Reed',
    usage: 'whoami [--detailed]',
    aliases: ['me', 'info'],
    handler: (args) => {
      const detailed = args.includes('--detailed');
      
      if (detailed) {
        return (
          <div className="text-blue-300">
            <div className="font-bold text-2xl mb-4 text-cyan-300">Henry Reed - AI Engineer & Consultant</div>
            <div className="space-y-4 text-base">
              <div className="border-b border-gray-600 pb-3">
                <p><span className="text-green-400">🚀 Mission:</span> To bridge the gap between cutting-edge AI research and practical, impactful business applications.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong className="text-blue-400">Expertise:</strong> Machine Learning, Large Language Models (LLMs), Computer Vision, and Enterprise AI Strategy.</p>
                </div>
                <div>
                  <p><strong className="text-purple-400">Focus:</strong> Building scalable, reliable, and high-performance AI systems that deliver measurable ROI.</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-600">
                <p className="text-yellow-400 italic">"I believe in a future where AI is a powerful tool for innovation and problem-solving in every industry. My goal is to help you navigate that future with confidence."</p>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="text-blue-300">
          <div className="text-xl font-bold">Henry Reed</div>
          <div className="text-gray-300">AI Engineer & Consultant</div>
          <div className="text-xs text-gray-500 mt-2">Use <span className="font-mono">whoami --detailed</span> for more info</div>
        </div>
      );
    }
  },
  {
    name: 'contact',
    description: 'Get contact information',
    usage: 'contact [--all] [--email] [--linkedin] [--schedule]',
    aliases: ['reach', 'connect'],
    handler: (args) => {
      const all = args.includes('--all');
      const email = args.includes('--email');
      const linkedin = args.includes('--linkedin');
      const schedule = args.includes('--schedule');

      if (all || email || linkedin || schedule) {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">📞 Get in Touch</div>
            <div className="space-y-3">
              {(all || email) && (
                <div className="flex items-center text-green-400">
                  <span className="text-xl mr-3">📧</span>
                  <div>
                    <div className="font-bold">Email</div>
                    <a href="mailto:henry@henryreed.ai" className="text-gray-300 hover:underline">henry@henryreed.ai</a>
                  </div>
                </div>
              )}
              {(all || linkedin) && (
                <div className="flex items-center text-blue-400">
                  <span className="text-xl mr-3">💼</span>
                  <div>
                    <div className="font-bold">LinkedIn</div>
                    <a href="https://linkedin.com/in/henryreedai" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:underline">linkedin.com/in/henryreedai</a>
                  </div>
                </div>
              )}
              {(all || schedule) && (
                <div className="flex items-center text-purple-400">
                  <span className="text-xl mr-3">📅</span>
                  <div>
                    <div className="font-bold">Schedule a Meeting</div>
                    <a href="https://cal.com/henryreed" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:underline">cal.com/henryreed</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      return (
        <div className="text-blue-300">
          <div className="font-bold mb-3 text-xl">📞 How to reach me</div>
          <div className="space-y-2 text-sm">
            <div className="text-green-400 font-mono">contact --email</div>
            <div className="text-blue-400 font-mono">contact --linkedin</div>
            <div className="text-purple-400 font-mono">contact --schedule</div>
            <div className="text-yellow-400 font-mono mt-2">contact --all</div>
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
      // This command can redirect to ls ctx --all-products for a unified view
      return baseCommands.find(c => c.name === 'ls')?.handler(['ctx', '--all-products']);
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
    name: 'theme',
    description: 'Change terminal color theme',
    usage: 'theme [default|matrix|solarized]',
    handler: (args) => {
      const theme = args[0] || 'default';
      // Logic to change theme would be implemented here
      return <div className="text-yellow-400">Theme changing to '{theme}'... (Not yet implemented)</div>;
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
            <div className="font-bold">🤖 AI Assistant</div>
            <div>Please provide a prompt. For example:</div>
            <div className="font-mono mt-2">ai What is the future of LLMs?</div>
          </div>
        );
      }
      // AI response logic would be here
      return <div className="text-cyan-400">AI response to "{prompt}"... (Not yet implemented)</div>;
    }
  },
  {
    name: 'ctxpov',
    description: 'Generate custom context point-of-view URLs and resources',
    usage: 'ctxpov [--cloud] [--c1] [--enterprise] [--startups] [--all]',
    aliases: ['ctx-pov', 'perspective'],
    handler: (args) => {
      const cloud = args.includes('--cloud');
      const c1 = args.includes('--c1');
      const enterprise = args.includes('--enterprise');
      const startups = args.includes('--startups');
      const all = args.includes('--all');

      // Generate URLs based on context
      const generateURL = (service: string, context: string) => {
        const baseURL = 'https://henryreed.ai';
        const timestamp = Date.now();
        const sessionId = Math.random().toString(36).substring(2, 15);
        return `${baseURL}/${service}/${context}?session=${sessionId}&t=${timestamp}`;
      };

      if (cloud && c1) {
        return (
          <div className="text-cyan-300">
            <div className="font-bold mb-4 text-xl">☁️ Cloud + C1 Enterprise URLs</div>
            <div className="space-y-3">
              <div className="border border-cyan-500 bg-gray-900 p-4 rounded">
                <div className="text-cyan-400 font-bold mb-2">🏢 Enterprise Cloud Strategy</div>
                <div className="text-sm text-gray-300 mb-2">Custom cloud migration and AI strategy for C1 level executives</div>
                <div className="font-mono text-xs bg-black p-2 rounded">
                  <span className="text-green-400">URL:</span> {generateURL('enterprise', 'cloud-strategy-c1')}
                </div>
              </div>
              
              <div className="border border-blue-500 bg-gray-900 p-4 rounded">
                <div className="text-blue-400 font-bold mb-2">⚡ Multi-Cloud AI Architecture</div>
                <div className="text-sm text-gray-300 mb-2">Executive briefing on multi-cloud AI deployment strategies</div>
                <div className="font-mono text-xs bg-black p-2 rounded">
                  <span className="text-green-400">URL:</span> {generateURL('solutions', 'multi-cloud-ai-executive')}
                </div>
              </div>
              
              <div className="border border-purple-500 bg-gray-900 p-4 rounded">
                <div className="text-purple-400 font-bold mb-2">📊 Cloud ROI Calculator</div>
                <div className="text-sm text-gray-300 mb-2">Interactive tool for C1 executives to calculate cloud AI ROI</div>
                <div className="font-mono text-xs bg-black p-2 rounded">
                  <span className="text-green-400">URL:</span> {generateURL('tools', 'cloud-roi-calculator-c1')}
                </div>
              </div>
              
              <div className="border border-yellow-500 bg-gray-900 p-4 rounded">
                <div className="text-yellow-400 font-bold mb-2">🎯 Executive Dashboard</div>
                <div className="text-sm text-gray-300 mb-2">Real-time metrics and KPIs for cloud AI initiatives</div>
                <div className="font-mono text-xs bg-black p-2 rounded">
                  <span className="text-green-400">URL:</span> {generateURL('dashboard', 'executive-cloud-metrics')}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-800 rounded border border-cyan-600">
              <div className="text-cyan-400 font-bold">💡 Quick Actions</div>
              <div className="text-sm text-gray-300 mt-1">These URLs are dynamically generated and include session tracking for personalized experiences.</div>
              <div className="text-green-400 mt-2 font-mono text-xs">→ contact --schedule  # Book executive consultation</div>
            </div>
          </div>
        );
      }
      
      if (cloud) {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">☁️ Cloud AI Resources</div>
            <div className="space-y-3">
              <div className="border border-blue-500 bg-gray-900 p-3 rounded">
                <div className="text-blue-400 font-bold">Cloud Migration Assessment</div>
                <div className="font-mono text-xs bg-black p-2 rounded mt-1">
                  <span className="text-green-400">URL:</span> {generateURL('assessment', 'cloud-migration')}
                </div>
              </div>
              
              <div className="border border-green-500 bg-gray-900 p-3 rounded">
                <div className="text-green-400 font-bold">Multi-Cloud AI Strategy</div>
                <div className="font-mono text-xs bg-black p-2 rounded mt-1">
                  <span className="text-green-400">URL:</span> {generateURL('strategy', 'multi-cloud-ai')}
                </div>
              </div>
              
              <div className="border border-purple-500 bg-gray-900 p-3 rounded">
                <div className="text-purple-400 font-bold">Cloud Cost Optimization</div>
                <div className="font-mono text-xs bg-black p-2 rounded mt-1">
                  <span className="text-green-400">URL:</span> {generateURL('optimization', 'cloud-cost')}
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      if (c1) {
        return (
          <div className="text-purple-300">
            <div className="font-bold mb-4 text-xl">🏢 C1 Executive Resources</div>
            <div className="space-y-3">
              <div className="border border-purple-500 bg-gray-900 p-3 rounded">
                <div className="text-purple-400 font-bold">AI Strategy Briefing</div>
                <div className="font-mono text-xs bg-black p-2 rounded mt-1">
                  <span className="text-green-400">URL:</span> {generateURL('briefing', 'ai-strategy-c1')}
                </div>
              </div>
              
              <div className="border border-yellow-500 bg-gray-900 p-3 rounded">
                <div className="text-yellow-400 font-bold">Executive Dashboard</div>
                <div className="font-mono text-xs bg-black p-2 rounded mt-1">
                  <span className="text-green-400">URL:</span> {generateURL('dashboard', 'executive-metrics')}
                </div>
              </div>
              
              <div className="border border-red-500 bg-gray-900 p-3 rounded">
                <div className="text-red-400 font-bold">Risk Assessment</div>
                <div className="font-mono text-xs bg-black p-2 rounded mt-1">
                  <span className="text-green-400">URL:</span> {generateURL('risk', 'ai-implementation')}
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      if (enterprise) {
        return (
          <div className="text-green-300">
            <div className="font-bold mb-4 text-xl">🏭 Enterprise AI Solutions</div>
            <div className="space-y-3">
              <div className="border border-green-500 bg-gray-900 p-3 rounded">
                <div className="text-green-400 font-bold">Enterprise AI Platform</div>
                <div className="font-mono text-xs bg-black p-2 rounded mt-1">
                  <span className="text-green-400">URL:</span> {generateURL('platform', 'enterprise-ai')}
                </div>
              </div>
              
              <div className="border border-blue-500 bg-gray-900 p-3 rounded">
                <div className="text-blue-400 font-bold">Scalability Assessment</div>
                <div className="font-mono text-xs bg-black p-2 rounded mt-1">
                  <span className="text-green-400">URL:</span> {generateURL('assessment', 'enterprise-scalability')}
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      if (startups) {
        return (
          <div className="text-orange-300">
            <div className="font-bold mb-4 text-xl">🚀 Startup AI Resources</div>
            <div className="space-y-3">
              <div className="border border-orange-500 bg-gray-900 p-3 rounded">
                <div className="text-orange-400 font-bold">AI MVP Development</div>
                <div className="font-mono text-xs bg-black p-2 rounded mt-1">
                  <span className="text-green-400">URL:</span> {generateURL('mvp', 'ai-startup')}
                </div>
              </div>
              
              <div className="border border-pink-500 bg-gray-900 p-3 rounded">
                <div className="text-pink-400 font-bold">Funding Pitch Deck</div>
                <div className="font-mono text-xs bg-black p-2 rounded mt-1">
                  <span className="text-green-400">URL:</span> {generateURL('pitch', 'ai-startup-funding')}
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      if (all) {
        return (
          <div className="text-white">
            <div className="font-bold mb-4 text-xl">🌐 All Context POV URLs</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-cyan-400 font-bold">☁️ Cloud Resources</div>
                <div className="text-xs space-y-1">
                  <div className="font-mono">{generateURL('cloud', 'strategy')}</div>
                  <div className="font-mono">{generateURL('cloud', 'migration')}</div>
                  <div className="font-mono">{generateURL('cloud', 'optimization')}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-purple-400 font-bold">🏢 C1 Executive</div>
                <div className="text-xs space-y-1">
                  <div className="font-mono">{generateURL('c1', 'briefing')}</div>
                  <div className="font-mono">{generateURL('c1', 'dashboard')}</div>
                  <div className="font-mono">{generateURL('c1', 'risk-assessment')}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-green-400 font-bold">🏭 Enterprise</div>
                <div className="text-xs space-y-1">
                  <div className="font-mono">{generateURL('enterprise', 'platform')}</div>
                  <div className="font-mono">{generateURL('enterprise', 'assessment')}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-orange-400 font-bold">🚀 Startups</div>
                <div className="text-xs space-y-1">
                  <div className="font-mono">{generateURL('startup', 'mvp')}</div>
                  <div className="font-mono">{generateURL('startup', 'funding')}</div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      // Default response with usage examples
      return (
        <div className="text-cyan-300">
          <div className="font-bold mb-4 text-xl">🎯 Context Point-of-View Generator</div>
          <div className="space-y-3">
            <div className="text-gray-300">Generate custom URLs and resources based on your perspective:</div>
            
            <div className="space-y-2 text-sm">
              <div className="text-cyan-400 font-mono">ctxpov --cloud --c1</div>
              <div className="text-gray-400 ml-4">→ Executive cloud strategy resources</div>
              
              <div className="text-blue-400 font-mono">ctxpov --cloud</div>
              <div className="text-gray-400 ml-4">→ General cloud AI resources</div>
              
              <div className="text-purple-400 font-mono">ctxpov --c1</div>
              <div className="text-gray-400 ml-4">→ C-level executive resources</div>
              
              <div className="text-green-400 font-mono">ctxpov --enterprise</div>
              <div className="text-gray-400 ml-4">→ Enterprise-focused solutions</div>
              
              <div className="text-orange-400 font-mono">ctxpov --startups</div>
              <div className="text-gray-400 ml-4">→ Startup and scale-up resources</div>
              
              <div className="text-white font-mono">ctxpov --all</div>
              <div className="text-gray-400 ml-4">→ All available context URLs</div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-800 rounded border border-cyan-600">
              <div className="text-cyan-400 font-bold">💡 Pro Tip</div>
              <div className="text-sm text-gray-300 mt-1">URLs are dynamically generated with session tracking and timestamps for personalized experiences.</div>
            </div>
          </div>
        </div>
      );
    }
  }
];

export const allCommands: CommandConfig[] = [...baseCommands, ...extendedCommands.filter(extCmd => !baseCommands.some(baseCmd => baseCmd.name === extCmd.name))];
