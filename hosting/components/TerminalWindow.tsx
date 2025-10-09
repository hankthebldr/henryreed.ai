'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TerminalWindowProps {
  title?: string;
  commands?: string[];
  initialOutput?: React.ReactNode;
  height?: string;
  className?: string;
  showPrompt?: boolean;
  promptText?: string;
  onCommand?: (command: string) => void;
  readOnly?: boolean;
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({
  title = 'Terminal',
  commands = [],
  initialOutput,
  height = 'h-64',
  className = '',
  showPrompt = true,
  promptText = 'user@xsiam:~$',
  onCommand,
  readOnly = false
}) => {
  const [input, setInput] = useState('');
  const [terminalContent, setTerminalContent] = useState<React.ReactNode[]>([]);
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialOutput) {
      setTerminalContent([initialOutput]);
    }
  }, [initialOutput]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [terminalContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || readOnly) return;

    const newContent = [
      ...terminalContent,
      <div key={`prompt-${Date.now()}`} className="flex text-green-400">
        <span className="mr-2">{promptText}</span>
        <span className="text-white">{input}</span>
      </div>
    ];

    // If there are predefined commands, show the output
    if (commands.length > 0 && currentCommandIndex < commands.length) {
      const command = commands[currentCommandIndex];
      newContent.push(
        <div key={`output-${Date.now()}`} className="text-gray-300 mb-2 ml-4">
          {command.startsWith('#') ? (
            <span className="text-cortex-text-muted italic">{command}</span>
          ) : (
            <span className="font-mono">{command}</span>
          )}
        </div>
      );
      setCurrentCommandIndex(prev => prev + 1);
    }

    setTerminalContent(newContent);
    setInput('');
    
    if (onCommand) {
      onCommand(input);
    }
  };

  const executeDemo = () => {
    if (commands.length === 0) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index >= commands.length) {
        clearInterval(interval);
        return;
      }

      const command = commands[index];
      setTerminalContent(prev => [
        ...prev,
        <div key={`demo-prompt-${index}`} className="flex text-green-400">
          <span className="mr-2">{promptText}</span>
          <span className="text-white">{command}</span>
        </div>,
        <div key={`demo-output-${index}`} className="text-gray-300 mb-2 ml-4">
          {command.startsWith('#') ? (
            <span className="text-cortex-text-muted italic">Comment: {command.substring(1).trim()}</span>
          ) : (
            <span className="text-blue-400">Executing: {command}</span>
          )}
        </div>
      ]);
      
      index++;
    }, 1500);
  };

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Terminal Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-gray-300 text-sm font-medium ml-2">{title}</span>
        </div>
        
        {commands.length > 0 && !readOnly && (
          <button
            onClick={executeDemo}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
          >
            Run Demo
          </button>
        )}
      </div>

      {/* Terminal Content */}
      <div 
        ref={contentRef}
        className={`bg-black p-4 font-mono text-sm overflow-y-auto ${height}`}
      >
        {terminalContent.length === 0 && !initialOutput && (
          <div className="text-cortex-text-muted">
            {readOnly ? 'Terminal output will appear here...' : 'Type commands to interact with the terminal...'}
          </div>
        )}
        
        {terminalContent}

        {/* Input Line */}
        {showPrompt && !readOnly && (
          <form onSubmit={handleSubmit} className="flex items-center mt-2">
            <span className="text-green-400 mr-2">{promptText}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent text-white outline-none"
              placeholder="Enter command..."
              autoFocus
            />
          </form>
        )}
      </div>
    </div>
  );
};

export default TerminalWindow;