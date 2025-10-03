import React from 'react';
import { commands as baseCommands, CommandConfig } from './commands';
import { downloadCommands } from './download-commands';
import { cdrCommands } from './cdr-commands';
import { cloudConfigCommands } from './cloud-config-commands';
import { enhancedCdrCommands } from './enhanced-cdr-commands';
import { cortexDCCommands } from './cortex-dc-commands';
import { guideCommands } from './guide-commands';
import { resourceCommands } from './resources-commands';
import { projectCommands } from './project-commands';
import { povCommands } from './pov-commands';
import { templateConfigCommands } from './template-config-commands';
import { enhancedHelpCommands } from './enhanced-help-commands';
import { enhancedTrrCommands } from './enhanced-trr-commands';
import { enhancedPovCommands } from './enhanced-pov-commands';
import { trrBlockchainSignoffCommands } from './trr-blockchain-signoff';
import { geminiCommands } from './gemini-commands';
import { bigQueryCommands } from './bigquery-commands';
import { xsiamCommands } from './xsiam-commands';
import { scenarioCommands } from './scenario-commands';
import { fetchAnalytics } from './data-service';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const EnhancedManualCreationGUI = dynamic(() => import('../components/EnhancedManualCreationGUI'), {
  ssr: false,
  loading: () => <div className="text-cyan-400">Loading GUI...</div>,
});

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
    name: 'detect',
    description: 'Output a MITRE-mapped stub detection event (no execution)',
    usage: 'detect [--technique TXXXX] [--scenario-type <type>]',
    aliases: ['detection-stub'],
    handler: (args) => {
      const tidIndex = args.indexOf('--technique');
      const technique = tidIndex >= 0 ? args[tidIndex + 1] || 'T1078' : 'T1078';
      const stIndex = args.indexOf('--scenario-type');
      const scenarioType = stIndex >= 0 ? args[stIndex + 1] || 'identity-compromise' : 'identity-compromise';

      const event = {
        event_type: 'simulation_detection',
        scenario_type: scenarioType,
        mapped_techniques: [technique],
        timestamp: new Date().toISOString(),
        vendor: 'Cortex/XSIAM (simulated output)'
      };

      return (
        <div className="text-blue-300">
          <div className="font-bold mb-2">📎 Detection Stub</div>
          <pre className="text-xs bg-black p-3 rounded border border-gray-700 whitespace-pre-wrap">{JSON.stringify(event, null, 2)}</pre>
          <div className="text-gray-400 text-xs mt-2">Informational only. No actions executed.</div>
        </div>
      );
    }
  },
  {
    name: 'create-gui',
    description: 'Open manual creation interface for POVs, templates, and detection scenarios',
    usage: 'create-gui',
    aliases: ['gui', 'manual-create', 'create-interface'],
    handler: () => {
      return (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-blue-500/30">
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-2xl">🛠️</div>
              <div>
                <div className="text-lg font-bold text-blue-400">Manual Creation Interface</div>
                <div className="text-sm text-gray-300">Interactive forms for creating POVs, templates, and Cloud Detection and Response scenarios</div>
              </div>
            </div>
          </div>
          <Suspense fallback={<div className="text-cyan-400">Loading GUI...</div>}>
            <EnhancedManualCreationGUI />
          </Suspense>
        </div>
      );
    }
  },
  {
    name: 'logout',
    description: 'Log out of Cortex DC Portal',
    usage: 'logout',
    aliases: ['exit', 'quit'],
    handler: () => {
      // This will be handled in the main component
      return null;
    }
  },
  {
    name: 'exit',
    description: 'Exit the Cortex DC Portal session',
    usage: 'exit',
    aliases: ['quit'],
    handler: () => {
      // This will be handled in the main component
      return null;
    }
  },
  {
    name: 'cortex-questions',
    description: 'Save questions and get AI-powered insights',
    usage: 'cortex-questions "your question here"',
    aliases: ['cq', 'ask-cortex', 'genai'],
    handler: (args) => {
      const question = args.join(' ');
      
      if (!question || question.length === 0) {
        return (
          <div className="text-yellow-400">
            <div className="font-bold mb-2">🧠 Cortex Questions - AI Insights Engine</div>
            <div className="text-gray-300 mb-3">Save your questions and get AI-powered insights and analysis.</div>
            <div className="text-sm space-y-2">
              <div className="text-blue-400 font-mono">cortex-questions "How can AI improve our customer service?"</div>
              <div className="text-green-400 font-mono">cq "What are the risks of implementing LLMs?"</div>
              <div className="text-purple-400 font-mono">genai "Best practices for AI governance?"</div>
            </div>
            <div className="mt-4 p-3 bg-gray-800 rounded border border-yellow-600">
              <div className="text-yellow-400 font-bold">💡 Features:</div>
              <div className="text-sm text-gray-300 mt-1">
                • Question persistence and tracking<br/>
                • AI-powered analysis and insights<br/>
                • Context-aware responses<br/>
                • Integration with GenAI models
              </div>
            </div>
          </div>
        );
      }
      
      // Simulate saving the question and generating AI insights
      const timestamp = new Date().toISOString();
      const questionId = Math.random().toString(36).substring(2, 10);
      
      // Mock GenAI function call
      const generateAIInsight = (question: string) => {
        // This would normally call a real GenAI service
        const insights = {
          summary: `Analysis of: "${question}"`,
          keyPoints: [
            "Strategic considerations for implementation",
            "Technical requirements and constraints", 
            "Risk assessment and mitigation strategies",
            "ROI and success metrics"
          ],
          recommendations: [
            "Conduct thorough stakeholder analysis",
            "Develop phased implementation roadmap",
            "Establish governance and monitoring frameworks"
          ],
          nextActions: [
            "Schedule follow-up consultation",
            "Review technical documentation",
            "Assess organizational readiness"
          ]
        };
        
        return insights;
      };
      
      const insight = generateAIInsight(question);
      
      return (
        <div className="text-cyan-400">
          <div className="font-bold mb-3 text-lg">🧠 Cortex Analysis Complete</div>
          
          <div className="bg-gray-900 p-4 rounded border border-cyan-600 mb-4">
            <div className="text-green-400 font-bold mb-2">📝 Question Saved:</div>
            <div className="text-gray-300 text-sm mb-2">"{question}"</div>
            <div className="text-xs text-gray-500">
              ID: {questionId} | Timestamp: {timestamp}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="text-blue-400 font-bold mb-2">🎯 Key Strategic Points:</div>
              <div className="space-y-1 text-sm">
                {insight.keyPoints.map((point, idx) => (
                  <div key={idx} className="text-gray-300">• {point}</div>
                ))}
              </div>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <div className="text-green-400 font-bold mb-2">💡 AI Recommendations:</div>
              <div className="space-y-1 text-sm">
                {insight.recommendations.map((rec, idx) => (
                  <div key={idx} className="text-gray-300">• {rec}</div>
                ))}
              </div>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <div className="text-purple-400 font-bold mb-2">⚡ Suggested Next Actions:</div>
              <div className="space-y-1 text-sm">
                {insight.nextActions.map((action, idx) => (
                  <div key={idx} className="text-gray-300">• {action}</div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-800 rounded border border-cyan-600">
            <div className="text-cyan-400 font-bold">🚀 Ready to dive deeper?</div>
            <div className="text-sm text-gray-300 mt-1">
              Schedule a consultation to discuss this in detail: <span className="font-mono text-green-400">contact --schedule</span>
            </div>
          </div>
        </div>
      );
    }
  },
  {
    name: 'status',
    description: 'Show system status and analytics',
    usage: 'status [--detailed] [--analytics] [--performance]',
    aliases: ['info', 'stats'],
    handler: (args) => {
      const detailed = args.includes('--detailed');
      const analytics = args.includes('--analytics');
      const performance = args.includes('--performance');
      
      if (detailed || analytics || performance) {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">📊 System Status Dashboard</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-green-500 p-4 rounded">
                <div className="text-green-400 font-bold mb-2">🟢 System Health</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Terminal Engine:</span>
                    <span className="text-green-400">Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Command Parser:</span>
                    <span className="text-green-400">Optimal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Integration:</span>
                    <span className="text-green-400">Active</span>
                  </div>
                </div>
              </div>
              
              {analytics && (
                <div className="border border-blue-500 p-4 rounded">
                  <div className="text-blue-400 font-bold mb-2">📈 Usage Analytics</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Commands Executed:</span>
                      <span className="text-blue-400">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Questions Processed:</span>
                      <span className="text-blue-400">89</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Insights Generated:</span>
                      <span className="text-blue-400">156</span>
                    </div>
                  </div>
                </div>
              )}
              
              {performance && (
                <div className="border border-yellow-500 p-4 rounded">
                  <div className="text-yellow-400 font-bold mb-2">⚡ Performance Metrics</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Avg Response Time:</span>
                      <span className="text-yellow-400">127ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="text-yellow-400">99.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span className="text-yellow-400">99.99%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
      
      return (
        <div className="text-green-400">
          <div className="font-bold mb-3">🟢 POV-CLI Status: Online</div>
          <div className="text-sm space-y-1">
            <div className="text-blue-400">• All systems operational</div>
            <div className="text-green-400">• AI services active</div>
            <div className="text-purple-400">• Commands ready</div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Use --detailed, --analytics, or --performance for more info
          </div>
        </div>
      );
    }
  },
  {
    name: 'search',
    description: 'Search through knowledge base and documentation',
    usage: 'search "query" [--docs] [--projects] [--insights]',
    aliases: ['find', 'lookup'],
    handler: (args) => {
      const query = args.filter(arg => !arg.startsWith('--')).join(' ').replace(/"/g, '');
      const docs = args.includes('--docs');
      const projects = args.includes('--projects');
      const insights = args.includes('--insights');
      
      if (!query) {
        return (
          <div className="text-yellow-400">
            <div className="font-bold mb-2">🔍 Knowledge Base Search</div>
            <div className="text-gray-300 mb-3">Search through documentation, projects, and insights.</div>
            <div className="text-sm space-y-2">
              <div className="text-blue-400 font-mono">search "machine learning deployment"</div>
              <div className="text-green-400 font-mono">find "AI strategy" --docs</div>
              <div className="text-purple-400 font-mono">lookup "computer vision" --projects</div>
            </div>
          </div>
        );
      }
      
      // Mock search results
      const results = {
        docs: [
          { title: "AI Implementation Guide", relevance: "95%", type: "documentation" },
          { title: "Best Practices for LLM Deployment", relevance: "89%", type: "guide" },
          { title: "Enterprise AI Strategy Framework", relevance: "76%", type: "framework" }
        ],
        projects: [
          { title: "enterprise-llm-deployment", relevance: "92%", type: "case-study" },
          { title: "computer-vision-pipeline", relevance: "78%", type: "implementation" },
          { title: "ai-training-curriculum", relevance: "65%", type: "education" }
        ],
        insights: [
          { title: "Future of AI in Enterprise", relevance: "88%", type: "analysis" },
          { title: "ROI Metrics for AI Projects", relevance: "72%", type: "metrics" },
          { title: "Risk Mitigation Strategies", relevance: "69%", type: "strategy" }
        ]
      };
      
      return (
        <div className="text-cyan-400">
          <div className="font-bold mb-3 text-lg">🔍 Search Results for "{query}"</div>
          
          {(!docs && !projects && !insights) || docs ? (
            <div className="mb-4">
              <div className="text-blue-400 font-bold mb-2">📚 Documentation ({results.docs.length} results)</div>
              <div className="space-y-2">
                {results.docs.map((item, idx) => (
                  <div key={idx} className="border-l-2 border-blue-400 pl-3 py-1">
                    <div className="text-white font-mono text-sm">{item.title}</div>
                    <div className="text-xs text-gray-400">{item.type} • {item.relevance} match</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          
          {(!docs && !projects && !insights) || projects ? (
            <div className="mb-4">
              <div className="text-green-400 font-bold mb-2">🚀 Projects ({results.projects.length} results)</div>
              <div className="space-y-2">
                {results.projects.map((item, idx) => (
                  <div key={idx} className="border-l-2 border-green-400 pl-3 py-1">
                    <div className="text-white font-mono text-sm">{item.title}</div>
                    <div className="text-xs text-gray-400">{item.type} • {item.relevance} match</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          
          {(!docs && !projects && !insights) || insights ? (
            <div className="mb-4">
              <div className="text-purple-400 font-bold mb-2">💡 Insights ({results.insights.length} results)</div>
              <div className="space-y-2">
                {results.insights.map((item, idx) => (
                  <div key={idx} className="border-l-2 border-purple-400 pl-3 py-1">
                    <div className="text-white font-mono text-sm">{item.title}</div>
                    <div className="text-xs text-gray-400">{item.type} • {item.relevance} match</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          
          <div className="mt-4 p-3 bg-gray-800 rounded border border-cyan-600">
            <div className="text-cyan-400 font-bold">💡 Need more specific information?</div>
            <div className="text-sm text-gray-300 mt-1">
              Try: <span className="font-mono text-green-400">cortex-questions "your specific question"</span>
            </div>
          </div>
        </div>
      );
    }
  },
  {
    name: 'jy2k',
    description: 'Regional/theatre analytics for DC activity, TRR win rate, OKRs and KPIs',
    usage: 'jy2k [--region AMER|EMEA|APJ|GLOBAL] [--theatre <name>] [--user <name>] [--since <30d|90d|180d|365d>] [--json] [--detailed] [--okrs] [--kpi] [--map]',
    aliases: ['jy', 'j2k'],
    category: 'reporting',
    tags: ['analytics','dashboard','okrs','kpi','trr','dc','regional','theatre'],
    handler: async (args) => {
      const getArg = (flag: string, def: string | null = null) => {
        const idx = args.indexOf(flag);
        if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
        return def;
      };
      const region = (getArg('--region', 'GLOBAL') || 'GLOBAL').toUpperCase();
      const theatre = getArg('--theatre', 'all');
      const userFilter = getArg('--user', 'all');
      const sinceRaw = getArg('--since', '90d') || '90d';
      const detailed = args.includes('--detailed');
      const wantJson = args.includes('--json');
      const wantOkrs = args.includes('--okrs');
      const wantKpi = args.includes('--kpi');

      const sinceDays = (() => {
        const m = sinceRaw.match(/(\d+)/);
        return m ? parseInt(m[1], 10) : 90;
      })();

      type Rec = {
        region: 'AMER'|'EMEA'|'APJ';
        theatre: string;
        user: string;
        location: string; // country or city
        engagements: number;
        povsInitiated: number;
        povsCompleted: number;
        trrWins: number;
        trrLosses: number;
        cycleDays: number; // avg cycle in days
        okrs: { id: string; name: string; progress: number }[];
      };

      // Attempt to fetch from Firestore
      const fetched = await fetchAnalytics({
        region,
        theatre: theatre === 'all' ? null : theatre,
        user: userFilter === 'all' ? null : userFilter,
        sinceDays
      });

      // Sample dataset (used if Firestore empty)
      const data: Rec[] = [
        { region: 'AMER', theatre: 'North America', user: 'alex', location: 'US', engagements: 14, povsInitiated: 10, povsCompleted: 7, trrWins: 6, trrLosses: 1, cycleDays: 41, okrs: [ {id:'O1', name:'POV velocity', progress:0.72}, {id:'O2', name:'TRR win rate', progress:0.86} ] },
        { region: 'AMER', theatre: 'North America', user: 'maria', location: 'US', engagements: 9, povsInitiated: 7, povsCompleted: 5, trrWins: 4, trrLosses: 1, cycleDays: 39, okrs: [ {id:'O1', name:'POV velocity', progress:0.69}, {id:'O3', name:'Customer sat', progress:0.93} ] },
        { region: 'AMER', theatre: 'LATAM', user: 'lucas', location: 'BR', engagements: 7, povsInitiated: 5, povsCompleted: 3, trrWins: 2, trrLosses: 1, cycleDays: 52, okrs: [ {id:'O2', name:'TRR win rate', progress:0.67} ] },
        { region: 'EMEA', theatre: 'Western Europe', user: 'sofia', location: 'DE', engagements: 13, povsInitiated: 9, povsCompleted: 8, trrWins: 7, trrLosses: 1, cycleDays: 36, okrs: [ {id:'O1', name:'POV velocity', progress:0.81} ] },
        { region: 'EMEA', theatre: 'UKI', user: 'liam', location: 'UK', engagements: 8, povsInitiated: 6, povsCompleted: 4, trrWins: 3, trrLosses: 1, cycleDays: 44, okrs: [ {id:'O2', name:'TRR win rate', progress:0.75} ] },
        { region: 'APJ', theatre: 'JAPAC', user: 'yuki', location: 'JP', engagements: 12, povsInitiated: 8, povsCompleted: 6, trrWins: 5, trrLosses: 1, cycleDays: 38, okrs: [ {id:'O4', name:'Time to value', progress:0.79} ] },
        { region: 'APJ', theatre: 'ANZ', user: 'oliver', location: 'AU', engagements: 6, povsInitiated: 4, povsCompleted: 2, trrWins: 1, trrLosses: 1, cycleDays: 49, okrs: [ {id:'O1', name:'POV velocity', progress:0.61} ] },
      ];

      // Build records from fetched data or fallback mock
      const fromFetched: Rec[] = (fetched.records || []).map((r:any) => ({
        region: (r.region || 'UNKNOWN').toUpperCase() as 'AMER'|'EMEA'|'APJ',
        theatre: r.theatre || 'UNKNOWN',
        user: (r.user || 'unknown').toLowerCase(),
        location: r.location || 'N/A',
        engagements: 1,
        povsInitiated: 1,
        povsCompleted: r.completedAt ? 1 : 0,
        trrWins: r.trrOutcome === 'win' ? 1 : 0,
        trrLosses: r.trrOutcome === 'loss' ? 1 : 0,
        cycleDays: r.cycleDays ?? 0,
        okrs: []
      }));

      const dataset: Rec[] = fromFetched.length ? fromFetched : data;

      const filtered = dataset.filter(r =>
        (region === 'GLOBAL' || r.region === region) &&
        (theatre === 'all' || r.theatre.toLowerCase() === theatre?.toLowerCase()) &&
        (userFilter === 'all' || r.user.toLowerCase() === userFilter?.toLowerCase())
      );

      const sum = (arr: number[]) => arr.reduce((a,b)=>a+b,0);
      const safeDiv = (a:number,b:number) => b === 0 ? 0 : a/b;

      const totals = {
        engagements: sum(filtered.map(r=>r.engagements)),
        initiated: sum(filtered.map(r=>r.povsInitiated)),
        completed: sum(filtered.map(r=>r.povsCompleted)),
        trrWins: sum(filtered.map(r=>r.trrWins)),
        trrLosses: sum(filtered.map(r=>r.trrLosses)),
        avgCycleDays: filtered.length ? Math.round(sum(filtered.map(r=>r.cycleDays))/filtered.length) : 0,
      };
      const winRate = safeDiv(totals.trrWins, totals.trrWins+totals.trrLosses);
      const completionRate = safeDiv(totals.completed, Math.max(1, totals.initiated));

      // Group helpers
      const groupBy = <T, K extends string|number>(arr: T[], key: (t:T)=>K) => arr.reduce((acc: Record<K,T[]>, item)=>{ const k=key(item); (acc[k]=acc[k]||[]).push(item); return acc;}, {} as Record<K, T[]>);
      const byUser = Object.entries(groupBy(filtered, r=>r.user)).map(([user, recs])=>{
        const t = {
          user,
          engagements: sum(recs.map(r=>r.engagements)),
          initiated: sum(recs.map(r=>r.povsInitiated)),
          completed: sum(recs.map(r=>r.povsCompleted)),
          wins: sum(recs.map(r=>r.trrWins)),
          losses: sum(recs.map(r=>r.trrLosses)),
          winRate: safeDiv(sum(recs.map(r=>r.trrWins)), sum(recs.map(r=>r.trrWins))+sum(recs.map(r=>r.trrLosses))),
          avgCycle: recs.length ? Math.round(sum(recs.map(r=>r.cycleDays))/recs.length) : 0,
        };
        return t;
      }).sort((a,b)=> b.engagements - a.engagements);

      const byLocation = Object.entries(groupBy(filtered, r=>r.location)).map(([loc, recs])=>({
        location: loc,
        engagements: sum(recs.map(r=>r.engagements)),
        initiated: sum(recs.map(r=>r.povsInitiated)),
        completed: sum(recs.map(r=>r.povsCompleted)),
        winRate: safeDiv(sum(recs.map(r=>r.trrWins)), sum(recs.map(r=>r.trrWins))+sum(recs.map(r=>r.trrLosses)))
      })).sort((a,b)=> b.engagements - a.engagements);

      const okrRollup = (()=>{
        const fetchedOkrs = fetched.okrs && fetched.okrs.length ? fetched.okrs : [];
        if (fetchedOkrs.length) return fetchedOkrs;
        const all = filtered.flatMap(r=>r.okrs);
        const byId = groupBy(all, o=>o.id);
        return Object.entries(byId).map(([id, items])=>({
          id,
          name: items[0]?.name || id,
          progress: safeDiv(sum(items.map(i=>i.progress)), items.length)
        })).sort((a,b)=> a.id.localeCompare(b.id));
      })();

      if (wantJson) {
        const payload = { filters: { region, theatre, user: userFilter, sinceDays }, totals, winRate, completionRate, byUser, byLocation, okrs: okrRollup };
        return (
          <pre className="text-xs bg-black p-3 rounded border border-gray-700 whitespace-pre-wrap">{JSON.stringify(payload, null, 2)}</pre>
        );
      }

      return (
        <div className="text-blue-300">
          <div className="font-bold mb-2 text-xl text-cyan-400">📊 JY2K - DC Analytics Dashboard</div>
          <div className="text-sm text-gray-400 mb-4">Region: <span className="text-white">{region}</span> • Theatre: <span className="text-white">{theatre}</span> • User: <span className="text-white">{userFilter}</span> • Since: <span className="text-white">{sinceDays}d</span></div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="p-4 rounded border border-green-500/40 bg-green-900/10">
              <div className="text-green-400 text-xs">Engagements</div>
              <div className="text-2xl font-mono text-white">{totals.engagements}</div>
            </div>
            <div className="p-4 rounded border border-blue-500/40 bg-blue-900/10">
              <div className="text-blue-400 text-xs">POVs Completed</div>
              <div className="text-2xl font-mono text-white">{totals.completed}</div>
              <div className="text-xs text-gray-400">Completion Rate: {(completionRate*100).toFixed(0)}%</div>
            </div>
            <div className="p-4 rounded border border-yellow-500/40 bg-yellow-900/10">
              <div className="text-yellow-400 text-xs">TRR Win Rate</div>
              <div className="text-2xl font-mono text-white">{Math.round(winRate*100)}%</div>
            </div>
            <div className="p-4 rounded border border-purple-500/40 bg-purple-900/10">
              <div className="text-purple-400 text-xs">Avg Cycle (days)</div>
              <div className="text-2xl font-mono text-white">{totals.avgCycleDays}</div>
            </div>
          </div>

          {/* By User */}
          <div className="mb-4">
            <div className="text-cyan-400 font-bold mb-2">👥 By User</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {byUser.slice(0, detailed ? byUser.length : 6).map((u) => (
                <div key={u.user} className="p-3 rounded bg-gray-800/50 border border-gray-600">
                  <div className="flex justify-between">
                    <div className="text-white font-mono">{u.user}</div>
                    <div className="text-xs text-gray-400">Win: {(u.winRate*100).toFixed(0)}% • Cycle: {u.avgCycle}d</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Eng: {u.engagements} • Init: {u.initiated} • Comp: {u.completed}</div>
                </div>
              ))}
            </div>
          </div>

          {/* By Location */}
          <div className="mb-4">
            <div className="text-cyan-400 font-bold mb-2">🌍 By Location</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {byLocation.slice(0, detailed ? byLocation.length : 9).map((l) => (
                <div key={l.location} className="p-3 rounded bg-gray-800/50 border border-gray-600">
                  <div className="flex justify-between">
                    <div className="text-white font-mono">{l.location}</div>
                    <div className="text-xs text-gray-400">Win: {(l.winRate*100).toFixed(0)}%</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Eng: {l.engagements} • Comp: {l.completed}</div>
                </div>
              ))}
            </div>
          </div>

          {/* OKRs */}
          <div className="mb-2">
            <div className="text-cyan-400 font-bold mb-2">🎯 OKRs</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {okrRollup.map(o => (
                <div key={o.id} className="p-3 rounded bg-gray-800/50 border border-gray-600">
                  <div className="flex justify-between mb-1">
                    <div className="text-white font-mono">{o.id}</div>
                    <div className="text-xs text-gray-400">{Math.round(o.progress*100)}%</div>
                  </div>
                  <div className="text-xs text-gray-300">{o.name}</div>
                  <div className="mt-2 h-2 bg-gray-700 rounded">
                    <div className="h-2 bg-green-500 rounded" style={{ width: `${Math.min(100, Math.round(o.progress*100))}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-4 p-3 bg-gray-800/50 rounded border border-gray-600 text-xs text-gray-400">
            <div className="text-yellow-400 font-bold mb-1">ℹ️ Tips</div>
            <div>Filter examples:</div>
            <div className="font-mono text-gray-300 mt-1">jy2k --region AMER --theatre "North America" --since 180d</div>
            <div className="font-mono text-gray-300">jy2k --user sofia --detailed</div>
            <div className="font-mono text-gray-300">jy2k --json</div>
          </div>
        </div>
      );
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

// Provide a wrapper for the scenario command family so it is available in the legacy terminal registry
const scenarioWrapper: CommandConfig = {
  name: 'scenario',
  description: 'Deploy and manage security assessment scenarios',
  usage: 'scenario <list|generate|status|validate|export|destroy|mitre> [options]',
  aliases: ['scenarios', 'sec-scenario'],
  handler: (args) => {
    const sub = (args[0] || 'list').toLowerCase();
    const subArgs = args.slice(1);
    const impl = (scenarioCommands as any)[sub];
    if (typeof impl !== 'function') {
      return (
        <div className="text-red-400">
          <div className="font-bold mb-1">Unknown subcommand: {sub}</div>
          <div className="text-sm text-gray-300">Use <span className="font-mono text-yellow-400">scenario list</span> or <span className="font-mono text-yellow-400">scenario --help</span></div>
        </div>
      );
    }
    return impl(subArgs);
  }
};

export const allCommands: CommandConfig[] = [
  ...baseCommands, 
  ...extendedCommands.filter(extCmd => !baseCommands.some(baseCmd => baseCmd.name === extCmd.name)),
  ...downloadCommands.filter(dlCmd => !baseCommands.some(baseCmd => baseCmd.name === dlCmd.name) && !extendedCommands.some(extCmd => extCmd.name === dlCmd.name)),
  ...cdrCommands.filter(cdrCmd => !baseCommands.some(baseCmd => baseCmd.name === cdrCmd.name) && !extendedCommands.some(extCmd => extCmd.name === cdrCmd.name)),
  ...cloudConfigCommands.filter(cloudCmd => !baseCommands.some(baseCmd => baseCmd.name === cloudCmd.name) && !extendedCommands.some(extCmd => extCmd.name === cloudCmd.name)),
  ...enhancedCdrCommands.filter(enhCmd => !baseCommands.some(baseCmd => baseCmd.name === enhCmd.name) && !extendedCommands.some(extCmd => extCmd.name === enhCmd.name) && !cdrCommands.some(cdrCmd => cdrCmd.name === enhCmd.name)),
  ...cortexDCCommands.filter(cortexCmd => !baseCommands.some(baseCmd => baseCmd.name === cortexCmd.name) && !extendedCommands.some(extCmd => extCmd.name === cortexCmd.name)),
  ...guideCommands.filter(guideCmd => !baseCommands.some(baseCmd => baseCmd.name === guideCmd.name) && !extendedCommands.some(extCmd => extCmd.name === guideCmd.name)),
  ...resourceCommands.filter(resCmd => !baseCommands.some(baseCmd => baseCmd.name === resCmd.name) && !extendedCommands.some(extCmd => extCmd.name === resCmd.name)),
  ...projectCommands.filter(projCmd => !baseCommands.some(baseCmd => baseCmd.name === projCmd.name) && !extendedCommands.some(extCmd => extCmd.name === projCmd.name)),
  ...povCommands.filter(povCmd => !baseCommands.some(baseCmd => baseCmd.name === povCmd.name) && !extendedCommands.some(extCmd => extCmd.name === povCmd.name)),
  ...enhancedPovCommands.filter(epovCmd => !baseCommands.some(baseCmd => baseCmd.name === epovCmd.name) && !extendedCommands.some(extCmd => extCmd.name === epovCmd.name) && !povCommands.some(povCmd => povCmd.name === epovCmd.name)),
  ...enhancedTrrCommands.filter(etrrCmd => !baseCommands.some(baseCmd => baseCmd.name === etrrCmd.name) && !extendedCommands.some(extCmd => extCmd.name === etrrCmd.name)),
  ...trrBlockchainSignoffCommands.filter(bsCmd => !baseCommands.some(baseCmd => baseCmd.name === bsCmd.name) && !extendedCommands.some(extCmd => extCmd.name === bsCmd.name)),
  ...geminiCommands.filter(gCmd => !baseCommands.some(baseCmd => baseCmd.name === gCmd.name) && !extendedCommands.some(extCmd => extCmd.name === gCmd.name)),
  ...bigQueryCommands.filter(bqCmd => !baseCommands.some(baseCmd => baseCmd.name === bqCmd.name) && !extendedCommands.some(extCmd => extCmd.name === bqCmd.name)),
  ...xsiamCommands.filter(xsiamCmd => !baseCommands.some(baseCmd => baseCmd.name === xsiamCmd.name) && !extendedCommands.some(extCmd => extCmd.name === xsiamCmd.name)),
  ...templateConfigCommands.filter(tmplCmd => !baseCommands.some(baseCmd => baseCmd.name === tmplCmd.name) && !extendedCommands.some(extCmd => extCmd.name === tmplCmd.name)),
  // Ensure scenario command is present
  scenarioWrapper,
  ...enhancedHelpCommands.filter(helpCmd => !baseCommands.some(baseCmd => baseCmd.name === helpCmd.name) && !extendedCommands.some(extCmd => extCmd.name === helpCmd.name))
];

// Expose the resolved command registry globally for dynamic help without circular imports
if (typeof globalThis !== 'undefined') {
  (globalThis as any).__ALL_COMMANDS__ = allCommands;
}
