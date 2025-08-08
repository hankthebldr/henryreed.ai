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
  }
];

export const allCommands: CommandConfig[] = [...baseCommands, ...extendedCommands.filter(extCmd => !baseCommands.some(baseCmd => baseCmd.name === extCmd.name))];
