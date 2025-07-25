import { useState } from 'react';

interface Line {
  type: 'input' | 'output';
  value: string;
}

const ReactTerminalUI = () => {
  const [lines, setLines] = useState<Line[]>([
    {
      type: 'output',
      value: 'Welcome to React Terminal UI!'
    },
    {
      type: 'output', 
      value: 'Type commands below:'
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const input = currentInput.trim();
      if (input) {
        setLines(prev => [
          ...prev,
          { type: 'input', value: `$ ${input}` },
          { type: 'output', value: handleCommand(input) }
        ]);
        setCurrentInput('');
      }
    }
  };

  const handleCommand = (cmd: string): string => {
    switch (cmd.toLowerCase()) {
      case 'help':
        return 'Available commands: help, clear, date, whoami, echo <text>';
      case 'clear':
        setLines([]);
        return '';
      case 'date':
        return new Date().toLocaleString();
      case 'whoami':
        return 'henry@terminal-ui';
      default:
        if (cmd.startsWith('echo ')) {
          return cmd.substring(5);
        }
        return `Command not found: ${cmd}. Type 'help' for available commands.`;
    }
  };

  return (
    <div className="terminal-ui h-full bg-hack-background text-terminal-green font-mono">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {lines.map((line, index) => (
            <div key={index} className={`terminal-line ${
              line.type === 'input' ? 'text-terminal-cyan' : 'text-terminal-green'
            }`}>
              {line.value}
            </div>
          ))}
        </div>
        <div className="border-t border-terminal-green p-4">
          <div className="flex items-center">
            <span className="text-terminal-green mr-2">$</span>
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent text-terminal-green outline-none border-none"
              placeholder="Type a command..."
              autoFocus
            />
            <span className="terminal-cursor"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactTerminalUI;
