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
  aliases?: string[];
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
    setCommands([{
      input: '',
      output: (
        <div className="text-green-400 mb-4">
          <div className="text-xl font-bold">Cloud Security Terminal</div>
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
      description: 'List available security scenario categories',
      usage: 'ls scenarios',
      handler: (args) => {
        if (args.includes('scenarios')) {
          return (
            <div className="text-blue-300">
              <div className="font-bold mb-3">🧪 Security Scenario Categories</div>
              <div className="space-y-1 text-sm">
                <div className="text-green-400">cloud-posture – misconfigured cloud resources</div>
                <div className="text-blue-400">container-vuln – vulnerable container images</div>
                <div className="text-purple-400">code-vuln – application code flaws</div>
                <div className="text-yellow-400">insider-threat – simulated insider attacks</div>
                <div className="text-red-400">ransomware – encryption behavior simulation</div>
                <div className="text-cyan-400">waas-exploit – web application exploits</div>
                <div className="text-orange-400">pipeline-breach – CI/CD pipeline attacks</div>
              </div>
            </div>
          );
        }
        return <div className="text-gray-400">Usage: ls scenarios</div>;
      }
    },
    {
      name: 'owasp',
      description: 'List the OWASP Top 10 application security risks',
      usage: 'owasp',
      handler: () => (
        <div className="text-blue-300">
          <div className="font-bold mb-3">OWASP Top 10 (2021)</div>
          <ol className="list-decimal ml-5 space-y-1 text-sm">
            <li>Broken Access Control</li>
            <li>Cryptographic Failures</li>
            <li>Injection</li>
            <li>Insecure Design</li>
            <li>Security Misconfiguration</li>
            <li>Vulnerable and Outdated Components</li>
            <li>Identification and Authentication Failures</li>
            <li>Software and Data Integrity Failures</li>
            <li>Security Logging and Monitoring Failures</li>
            <li>Server-Side Request Forgery (SSRF)</li>
          </ol>
        </div>
      )
    }
  ];

  const executeCommand = (inputStr: string) => {
    const trimmed = inputStr.trim();
    if (!trimmed) return;

    const parts = trimmed.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    const config = commandConfigs.find(c => c.name === command);

    let output: React.ReactNode;
    if (config) {
      output = config.handler(args);
    } else {
      output = <div className="text-red-400">Command '{command}' not found</div>;
    }

    setCommands(prev => [...prev, { input: trimmed, output, timestamp: new Date() }]);
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
