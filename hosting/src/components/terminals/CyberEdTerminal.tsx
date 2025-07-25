import React, { useState, useRef, useEffect } from 'react';

interface OutputEntry {
  type: 'command' | 'output';
  content: string;
  path?: string;
}

// NOTE: CyberEdTerminal styles can be added globally or using CSS modules when needed.

const CyberEdTerminal: React.FC = () => {
  const terminalBodyRef = useRef<HTMLDivElement | null>(null);
  const commandInputRef = useRef<HTMLInputElement | null>(null);

  // State using React hooks
  const [history, setHistory] = useState<OutputEntry[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [currentPath, setCurrentPath] = useState<string>('~');
  const [inputValue, setInputValue] = useState<string>('');

  const fileSystem: any = {
    '~': {
      type: 'dir',
      children: {
        'README.md': {
          type: 'file',
          content: `## Welcome to henryreed.ai Terminal!

AI-Driven Security & Automation Platform

This terminal interface showcases cybersecurity tools and automation capabilities.
Type 'help' to see available commands.

Explore the file system with 'ls' and 'cd'.
Read files with 'cat' to learn about security tools and methodologies.`
        }
      }
    }
  };

  const resolvePath = (path: string) => {
    const parts = path.replace(/^~\//, '').split('/').filter(p => p);
    let currentNode = fileSystem['~'];
    if (path === '~') return currentNode;
    for (const part of parts) {
      if (currentNode && currentNode.type === 'dir' && currentNode.children[part]) {
        currentNode = currentNode.children[part];
      } else {
        return null;
      }
    }
    return currentNode;
  };

  const addToHistory = (entry: OutputEntry) => {
    setHistory(prev => [...prev, entry]);
  };

  const scrollToBottom = () => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  };

  const commands: { [key: string]: (args: string[]) => void } = {
    help: () => {
      addToHistory({
        type: 'output',
        content: 'Available commands: help, clear, ls, cd, cat'
      });
    },
    clear: () => setHistory([]),
  };

  const executeCommand = (commandStr: string) => {
    const [command, ...args] = commandStr.split(/\s+/);
    addToHistory({ type: 'command', content: commandStr, path: currentPath });
    if (commands[command]) commands[command](args);
    else addToHistory({ type: 'output', content: `command not found: ${command}` });
  };

  useEffect(() => scrollToBottom(), [history]);

  return (
    <div className="h-full flex flex-col font-mono text-sm text-terminal-green">
      <div ref={terminalBodyRef} className="flex-1 overflow-y-auto p-2 bg-hack-background border border-terminal-green rounded-t">
        {history.map((entry, idx) => (
          <div key={idx} className="whitespace-pre-wrap break-all">
            {entry.type === 'command' ? (
              <span className="text-terminal-cyan">
                {entry.path}$ {entry.content}
              </span>
            ) : (
              <span dangerouslySetInnerHTML={{ __html: entry.content }} />
            )}
          </div>
        ))}
      </div>
      <div className="flex border border-terminal-green border-t-0 rounded-b">
        <span className="px-2 py-1 bg-terminal-green text-hack-background">{currentPath}$</span>
        <input
          ref={commandInputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              executeCommand(inputValue.trim());
              setInputValue('');
            }
          }}
          className="flex-1 px-2 py-1 bg-transparent outline-none text-terminal-green"
        />
      </div>
    </div>
  );
};

export default CyberEdTerminal;

