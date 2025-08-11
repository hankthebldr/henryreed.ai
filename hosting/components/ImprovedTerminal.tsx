'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
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

interface TerminalOutputProps {
  children: React.ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info' | 'default';
}

function TerminalOutput({ children, type = 'default' }: TerminalOutputProps) {
  const baseClasses = "p-4 rounded-lg border font-mono text-sm leading-relaxed";
  const typeClasses = {
    success: "bg-green-900/20 border-green-500/30 text-green-200",
    error: "bg-red-900/20 border-red-500/30 text-red-200", 
    warning: "bg-yellow-900/20 border-yellow-500/30 text-yellow-200",
    info: "bg-blue-900/20 border-blue-500/30 text-blue-200",
    default: "bg-gray-900/40 border-gray-600/30 text-gray-200"
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      {children}
    </div>
  );
}

export default function ImprovedTerminal() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showLogin, setShowLogin] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

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
          <div className="text-base">
            <div className="mb-2">🤖 <strong>Henry Reed AI Terminal</strong></div>
            <div className="text-sm text-gray-400">
              Professional AI consulting and development services
            </div>
            <div className="mt-3 text-sm">
              <div>• Type <span className="text-green-400 font-bold">help</span> for available commands</div>
              <div>• Press <span className="text-blue-400 font-bold">↑/↓</span> for command history</div>
              <div>• Try <span className="text-purple-400 font-bold">ls ctx --all-products</span> to explore services</div>
            </div>
          </div>
        </TerminalOutput>
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
            <div className="font-bold mb-4 text-xl text-blue-300">📚 Available Commands</div>
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
            <div className="mt-6 p-4 bg-gray-800 rounded border border-gray-600">
              <div className="text-yellow-400 font-bold mb-2">💡 Pro Tips</div>
              <div className="text-sm space-y-1">
                <div>• Use <span className="text-blue-400">help [command]</span> for detailed usage</div>
                <div>• Press <span className="text-green-400">↑/↓</span> arrows to navigate command history</div>
                <div>• Use <span className="text-purple-400">Tab</span> for command completion</div>
                <div>• Try <span className="text-cyan-400">ls ctx --all-products</span> to explore services</div>
              </div>
            </div>
          </TerminalOutput>
        );
      }
    },
    {
      name: 'login',
      description: 'Sign in to access premium features',
      usage: 'login',
      aliases: ['auth', 'signin'],
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
      aliases: ['signout'],
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
      aliases: ['documentation', 'guide'],
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
      description: 'Display information about Henry Reed',
      usage: 'whoami [--detailed]',
      aliases: ['me', 'info'],
      handler: (args) => {
        const detailed = args.includes('--detailed');
        const isLoggedIn = !!user;
        
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
                  Use <span className="text-cyan-400 font-mono">whoami --detailed</span> for more info
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
              <TerminalOutput type="info">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-3"></div>
                  <span>Processing command...</span>
                </div>
              </TerminalOutput>
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
          setInput(matchingCommands[0] + ' ');
        }
      }
    }
  };

  return (
    <div className="bg-black text-green-400 font-mono h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-lg font-bold text-cyan-400">POV-CLI Terminal</div>
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
              <div className="flex items-center mb-2">
                <span className="text-blue-400 mr-2 select-none">henry@ai:~$</span>
                <span className="text-white font-mono">{cmd.input}</span>
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
        <div className="flex items-center">
          <span className="text-blue-400 mr-2 select-none">henry@ai:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white font-mono text-sm"
            placeholder="Type a command and press Enter..."
            autoFocus
            style={{ fontSize: '14px' }}
          />
        </div>
      </form>

      {/* Login Modal */}
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
    </div>
  );
}
