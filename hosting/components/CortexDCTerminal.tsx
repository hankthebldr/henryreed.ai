'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TerminalOutput } from './TerminalOutput';
import { allCommands } from '../lib/commands-ext';
import CortexGUIInterface from './CortexGUIInterface';

interface Command {
  input: string;
  output: React.ReactNode;
  timestamp: Date;
  cwd?: string;
  showPrompt?: boolean;
}

type DCMode = 'pov' | 'template' | 'customer' | 'scenarios' | 'trr' | 'help';

const DC_MODES = {
  pov: {
    name: 'POV Management',
    icon: '🎯',
    description: 'Proof-of-Value lifecycle management',
    color: 'text-cortex-primary'
  },
  template: {
    name: 'Templates',
    icon: '📋',
    description: 'Scenario template management',
    color: 'text-cortex-info'
  },
  customer: {
    name: 'Customers',
    icon: '🏢',
    description: 'Customer environment setup',
    color: 'text-cortex-green'
  },
  scenarios: {
    name: 'Scenarios',
    icon: '🔬',
    description: 'Security scenario execution',
    color: 'text-cortex-light'
  },
  trr: {
    name: 'TRR Management',
    icon: '📊',
    description: 'Technical Requirements Review tracking',
    color: 'text-cortex-warning'
  },
  help: {
    name: 'Help & Guides',
    icon: '❓',
    description: 'Documentation and guides',
    color: 'text-cortex-warning-light'
  }
};

// DEPRECATED: Replaced by ImprovedTerminal.tsx in Phase 12 recovery
// Original path: hosting/components/CortexDCTerminal.tsx
// Migration: DC-specific commands available in ImprovedTerminal
// Rollback: Uncomment this line to restore DC-focused terminal
// export default function CortexDCTerminal() {
function CortexDCTerminal() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentMode, setCurrentMode] = useState<DCMode>('help');
  // Interface mode is controlled by global header routing now
  const [cwd, setCwd] = useState<string>('/home/consultant');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Helper for formatting the prompt with current directory
  const formatPrompt = (p: string) => `cortex@dc:${p}$`;

  // Auto-resize textarea based on content
  const adjustHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  useEffect(() => {
    if (inputRef.current) {
      adjustHeight(inputRef.current);
    }
  }, [input]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  // Initialize with welcome message
  useEffect(() => {
    setCommands([{
      input: '',
      output: (
        <TerminalOutput type="info">
          <pre className="text-lg font-bold text-cortex-green mb-2">
{`
 ██████╗ ██████╗ ██████╗ ████████╗███████╗██╗  ██╗    ██████╗  ██████╗
██╔════╝██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝╚██╗██╔╝    ██╔══██╗██╔════╝
██║     ██║   ██║██████╔╝   ██║   █████╗   ╚███╔╝     ██║  ██║██║     
██║     ██║   ██║██╔══██╗   ██║   ██╔══╝   ██╔██╗     ██║  ██║██║     
╚██████╗╚██████╔╝██║  ██║   ██║   ███████╗██╔╝ ██╗    ██████╔╝╚██████╗
 ╚═════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝    ╚═════╝  ╚═════╝
`}
          </pre>
          <div className="text-sm">
            <div className="mb-2 text-cortex-text-primary">🛡️ <strong>Cortex Domain Consultant Portal</strong></div>
            <div className="text-sm text-cortex-text-muted mb-4">
              Palo Alto Networks Security Operations Platform
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-cortex-success-bg p-3 rounded border border-cortex-green/30">
                <div className="text-cortex-green font-bold mb-2">🚀 Quick Start</div>
                <div className="text-sm space-y-1 text-cortex-text-secondary">
                  <div>• Use the <strong>navigation tabs</strong> above to switch between DC functions</div>
                  <div>• Try <span className="font-mono text-cortex-green">pov init customer-name</span> to start a POV</div>
                  <div>• Run <span className="font-mono text-cortex-info">help</span> for complete command reference</div>
                </div>
              </div>
              
              <div className="bg-cortex-info-bg p-3 rounded border border-cortex-info/30">
                <div className="text-cortex-info font-bold mb-2">💡 Navigation</div>
                <div className="text-sm space-y-1 text-cortex-text-secondary">
                  <div>• <strong>POV Management:</strong> End-to-end engagement orchestration</div>
                  <div>• <strong>Templates:</strong> Customizable scenario templates</div>
                  <div>• <strong>Customers:</strong> Environment setup and configuration</div>
                  <div>• <strong>Scenarios:</strong> Security demonstration scenarios</div>
                  <div>• <strong>TRR Management:</strong> Technical Requirements Review</div>
                </div>
              </div>
            </div>
          </div>
        </TerminalOutput>
      ),
      timestamp: new Date(),
      showPrompt: false
    }]);
  }, []);

  const executeCommand = async (inputStr: string) => {
    const trimmed = inputStr.trim();
    if (!trimmed) {
      const newCommand: Command = {
        input: '',
        output: null,
        timestamp: new Date(),
        cwd
      };
      setCommands(prev => [...prev, newCommand]);
      setHistoryIndex(-1);
      return;
    }

    // Parse command
    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Find command config from our integrated commands
    const config = allCommands.find(c => c.name === command || c.aliases?.includes(command));

    let output: React.ReactNode = null;

    if (config) {
      if (command === 'clear' || config.name === 'clear') {
        setCommands([]);
        return;
      }
      
      if (command === 'exit' || command === 'logout') {
        // Clear session and redirect
        sessionStorage.removeItem('dc_authenticated');
        sessionStorage.removeItem('dc_user');
        
        const newCommand: Command = {
          input: trimmed,
          output: (
            <TerminalOutput type="success">
              <div className="flex items-center">
                <div className="mr-3 text-2xl">👋</div>
                <div>
                  <div className="font-bold">Session ended</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Thank you for using Cortex DC Portal! Redirecting to login...
                  </div>
                </div>
              </div>
            </TerminalOutput>
          ),
          timestamp: new Date(),
          cwd
        };
        
        setCommands(prev => [...prev, newCommand]);
        setHistory(prev => [...prev, trimmed]);
        setHistoryIndex(-1);
        
        // Redirect after showing message
        setTimeout(() => {
          router.push('/');
        }, 2000);
        
        return;
      }

      try {
        const result = config.handler(args);
        if (result && typeof result === 'object' && 'then' in result) {
          // Handle async commands
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
            cwd
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
                output: asyncOutput || null,
                timestamp: new Date(),
                cwd: newCommands[newCommands.length - 1].cwd
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
                        <div className="font-bold">Command Error</div>
                        <div className="text-sm mt-1">
                          {asyncError instanceof Error ? asyncError.message : 'Unknown error'}
                        </div>
                      </div>
                    </div>
                  </TerminalOutput>
                ),
                timestamp: new Date(),
                cwd: newCommands[newCommands.length - 1].cwd
              };
              return newCommands;
            });
          }
          return;
        } else {
          output = result;
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
      timestamp: new Date(),
      cwd
    };

    setCommands(prev => [...prev, newCommand]);
    setHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        handleSubmit(e);
        return;
      }
    }
    
    if (e.key === 'ArrowUp') {
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
      // Tab completion logic could go here
    }
  };

  const switchMode = (mode: DCMode) => {
    setCurrentMode(mode);
    // Execute a contextual help command based on the mode
    const modeCommands = {
      pov: 'pov',
      template: 'template',
      customer: 'customer',
      scenarios: 'cdrlab',
      trr: 'trr',
      help: 'help'
    };
    
    executeCommand(modeCommands[mode]);
  };

  // Handle interface mode change

  // If GUI mode is selected, render the GUI interface (handled by /gui route now)

  return (
    <div className="bg-black text-green-400 font-mono h-screen flex flex-col">
      {/* Mode Tabs (moved below global header) */}
      <div className="bg-gray-900 border-b border-gray-700 p-3">
        <div className="flex space-x-1 overflow-x-auto">
          {Object.entries(DC_MODES).map(([key, mode]) => (
            <button
              key={key}
              onClick={() => switchMode(key as DCMode)}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors whitespace-nowrap flex items-center space-x-2 ${
                currentMode === key 
                  ? `${mode.color} border-current bg-gray-800/50` 
                  : 'text-gray-400 border-gray-600 hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              <span>{mode.icon}</span>
              <span>{mode.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Mode Indicator */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center space-x-3 text-sm">
          <span className={DC_MODES[currentMode].color}>
            {DC_MODES[currentMode].icon} {DC_MODES[currentMode].name}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">{DC_MODES[currentMode].description}</span>
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
            {cmd.showPrompt !== false && (
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
            placeholder="Enter = run • Shift+Enter = newline • ↑/↓ history • Use navigation tabs to switch modes"
            autoFocus
            style={{ fontSize: '14px', lineHeight: '1.5' }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Current Mode: <span className={DC_MODES[currentMode].color}>{DC_MODES[currentMode].name}</span>
          {' • Try: '}
          <span className="font-mono text-green-400">help</span>
          {', '}
          <span className="font-mono text-blue-400">pov init customer-name</span>
          {', '}
          <span className="font-mono text-cortex-green-light">template list</span>
        </div>
      </form>
    </div>
  );
}
