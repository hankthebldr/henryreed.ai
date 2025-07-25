import { useState } from 'react';

interface Command {
  name: string;
  description: string;
  handler: (args: string[]) => string;
}

interface HistoryItem {
  type: 'command' | 'output';
  content: string;
}

const ReactTerminalEmulator = () => {
  const [history, setHistory] = useState<HistoryItem[]>([
    { type: 'output', content: 'Welcome to React Terminal Emulator! Type "help" for commands.' }
  ]);
  const [currentInput, setCurrentInput] = useState('');

  const commands: Command[] = [
    {
      name: 'help',
      description: 'Show available commands',
      handler: () => {
        return commands
          .map(cmd => `${cmd.name} - ${cmd.description}`)
          .join('\n');
      }
    },
    {
      name: 'whoami',
      description: 'Display current user',
      handler: () => 'henry@terminal:~$'
    },
    {
      name: 'date',
      description: 'Show current date and time',
      handler: () => new Date().toLocaleString()
    },
    {
      name: 'clear',
      description: 'Clear the terminal',
      handler: () => {
        setHistory([{ type: 'output', content: 'Terminal cleared.' }]);
        return '';
      }
    },
    {
      name: 'echo',
      description: 'Echo back the input',
      handler: (args: string[]) => args.join(' ') || 'Nothing to echo'
    }
  ];

  const handleCommand = (command: string): string => {
    const [cmd, ...args] = command.trim().split(' ');
    const foundCommand = commands.find(c => c.name === cmd.toLowerCase());
    
    if (foundCommand) {
      return foundCommand.handler(args);
    }
    
    return `Command not found: ${cmd}. Type 'help' for available commands.`;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const input = currentInput.trim();
      if (input) {
        const output = handleCommand(input);
        setHistory(prev => [
          ...prev,
          { type: 'command', content: `henry@terminal:~$ ${input}` },
          ...(output ? [{ type: 'output', content: output }] : [])
        ]);
        setCurrentInput('');
      }
    }
  };

  return (
    <div className="w-full h-full bg-hack-background border border-terminal-green rounded-lg p-4 font-mono">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4">
          {history.map((item, index) => (
            <div 
              key={index} 
              className={`mb-1 ${item.type === 'command' ? 'text-terminal-cyan' : 'text-terminal-green'}`}
            >
              {item.content.split('\n').map((line, lineIndex) => (
                <div key={lineIndex}>{line}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center border-t border-terminal-green pt-2">
          <span className="text-terminal-green mr-2">henry@terminal:~$</span>
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
  );
};

export default ReactTerminalEmulator;
