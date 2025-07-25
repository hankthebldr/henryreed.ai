import React, { useState, useRef, useEffect } from 'react';
import './CyberEdTerminal.css';

interface OutputEntry {
  type: 'command' | 'output';
  content: string;
  path?: string;
}

const CyberEdTerminal: React.FC = () => {
  const terminalBodyRef = useRef<HTMLDivElement | null>(null);
  const commandInputRef = useRef<HTMLInputElement | null>(null);

  // State using React hooks
  const [history, setHistory] = useState<OutputEntry[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [currentPath, setCurrentPath] = useState<string>('~');
  const [inputValue, setInputValue] = useState<string>('');

  const fileSystem = {
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
        },
        'security': {
          type: 'dir',
          children: {
            'cdr_overview.txt': {
              type: 'file',
              content: `### Cloud Detection and Response (CDR)

CDR provides real-time threat detection and automated response across cloud infrastructure.

**Key Capabilities:**
- **Real-time Monitoring:** Continuous threat detection in cloud environments
- **Automated Response:** AI-driven incident response and containment
- **Risk Prioritization:** MITRE ATT&CK aligned detection rules
- **Cloud-Native:** Purpose-built for hybrid and multicloud environments

**Integration with XSIAM:**
- Cloud telemetry integration
- Automated playbook execution
- Centralized threat intelligence`
            },
            'cortex_xsoar.txt': {
              type: 'file',
              content: `### Security Orchestration, Automation and Response (SOAR)

XSOAR enables automated workflows for threat triage and response.

**Automation Features:**
- Python-based custom integrations
- Automated ticketing and notifications
- AI-driven anomaly detection
- Threat hunting workflows

**Benefits:**
- Reduced Mean Time to Respond (MTTR)
- Freed analyst time from repetitive tasks
- Enhanced SOC efficiency
- Consistent incident response procedures`
            },
            'kubernetes_security.txt': {
              type: 'file',
              content: `### Kubernetes Security Best Practices

Securing containerized workloads in Kubernetes environments.

**Security Controls:**
- Pod Security Standards implementation
- Network policies and micro-segmentation
- RBAC and service account management
- Container image scanning
- Runtime security monitoring

**DevSecOps Integration:**
- CI/CD pipeline security gates
- Infrastructure as Code scanning
- Automated compliance checks
- Continuous vulnerability assessment`
            }
          }
        },
        'about.txt': {
          type: 'file',
          content: `henryreed.ai Terminal v2.0 - AI-Driven Security Platform

Specializing in:
- Cloud Detection and Response (CDR)
- Cortex XSIAM/XSOAR Implementation
- Kubernetes Security
- Python Security Automation
- AI/ML Integration for Threat Detection
- DevSecOps and CI/CD Pipeline Security`
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

  const executeCommand = (commandStr: string) => {
    const [command, ...args] = commandStr.split(/\s+/);
    
    // Add command to history
    addToHistory({
      type: 'command',
      content: commandStr,
      path: currentPath
    });
    
    // Execute command
    if (commands[command]) {
      commands[command](args);
    } else {
      addToHistory({
        type: 'output',
        content: `<span class="text-red">command not found: ${command}</span>`
      });
    }
  };

  const commands: { [key: string]: (args: string[]) => void } = {
    help: () => {
      addToHistory({
        type: 'output',
        content: `<span class="text-yellow">Available Commands:</span>
        <span class="text-cyan">help</span> - Shows this help message.
        <span class="text-cyan">clear</span> - Clears the terminal screen.
        <span class="text-cyan">ls [path]</span> - Lists files and directories.
        <span class="text-cyan">cd [path]</span> - Changes the current directory.
        <span class="text-cyan">cat [file]</span> - Displays the content of a file.
        <span class="text-cyan">whoami</span> - Displays the current user.
        <span class="text-cyan">date</span> - Displays the current date and time.
        <span class="text-cyan">nmap_scan</span> - Simulates a basic Nmap scan for educational purposes.
        <span class="text-cyan">welcome</span> - Displays the welcome message.`
      });
    },
    clear: () => {
      setHistory([]);
    },
    welcome: () => {
      addToHistory({
        type: 'output',
        content: `
        <pre class="text-green">
        ██╗  ██╗███████╗███╗   ██╗██████╗ ██╗   ██╗██████╗ ███████╗███████╗██████╗        █████╗ ██╗
        ██║  ██║██╔════╝████╗  ██║██╔══██╗╚██╗ ██╔╝██╔══██╗██╔════╝██╔════╝██╔══██╗      ██╔══██╗██║
        ███████║█████╗  ██╔██╗ ██║██████╔╝ ╚████╔╝ ██████╔╝█████╗  █████╗  ██║  ██║      ███████║██║
        ██╔══██║██╔══╝  ██║╚██╗██║██╔══██╗  ╚██╔╝  ██╔══██╗██╔══╝  ██╔══╝  ██║  ██║      ██╔══██║██║
        ██║  ██║███████╗██║ ╚████║██║  ██║   ██║   ██║  ██║███████╗███████╗██████╔╝  ██╗ ██║  ██║██║
        ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝╚═════╝   ╚═╝ ╚═╝  ╚═╝╚═╝
        </pre>
        Welcome to henryreed.ai Terminal - AI-Driven Security & Automation Platform.
        Type <span class="text-cyan">'help'</span> for available commands.`
      });
    },
    ls: (args) => {
      const path = args[0] || currentPath;
      const node = resolvePath(path);
      if (node && node.type === 'dir') {
        const content = Object.keys(node.children).map(key => {
          const child = node.children[key];
          return child.type === 'dir' ? `<span class="text-blue">${key}/</span>` : key;
        }).join('&nbsp;&nbsp;');
        addToHistory({
          type: 'output',
          content: content || 'Directory is empty.'
        });
      } else {
        addToHistory({
          type: 'output',
          content: `<span class="text-red">ls: cannot access '${path}': No such file or directory</span>`
        });
      }
    },
    cat: (args) => {
      if (!args[0]) {
        addToHistory({
          type: 'output',
          content: `<span class="text-red">cat: missing operand</span>`
        });
        return;
      }
      const path = currentPath === '~' ? `~/${args[0]}` : `${currentPath}/${args[0]}`;
      const node = resolvePath(path);
      if (node && node.type === 'file') {
        addToHistory({
          type: 'output',
          content: `<pre>${node.content}</pre>`
        });
      } else {
        addToHistory({
          type: 'output',
          content: `<span class="text-red">cat: ${args[0]}: No such file or directory</span>`
        });
      }
    },
    whoami: () => {
      addToHistory({
        type: 'output',
        content: 'henryreed'
      });
    },
    date: () => {
      addToHistory({
        type: 'output',
        content: new Date().toString()
      });
    },
    nmap_scan: (args) => {
      if (!args[0]) {
        addToHistory({
          type: 'output',
          content: `<span class="text-red">nmap_scan: please specify a target (e.g., nmap_scan example.com)</span>`
        });
        return;
      }
      const target = args[0];
      addToHistory({
        type: 'output',
        content: `<span class="text-yellow">Simulating Nmap scan on ${target}...</span>`
      });
      setTimeout(() => {
        addToHistory({
          type: 'output',
          content: `<pre>Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toUTCString()}
Nmap scan report for ${target} (127.0.0.1)
Host is up (0.00021s latency).
Not shown: 996 closed tcp ports (reset)
PORT     STATE SERVICE
80/tcp   open  http
443/tcp  open  https

<span class="text-green">This is a simulation for educational purposes.
No real network scan was performed.
This demonstrates typical Nmap output for web services.</span></pre>`
        });
        scrollToBottom();
      }, 1000);
    },
    cd: (args) => {
      if (!args[0] || args[0] === '~') {
        setCurrentPath('~');
      } else {
        const newPath = args[0] === '..'
          ? currentPath.substring(0, currentPath.lastIndexOf('/')) || '~'
          : (currentPath === '~' ? `~/${args[0]}` : `${currentPath}/${args[0]}`);
        const node = resolvePath(newPath);
        if (node && node.type === 'dir') {
          setCurrentPath(newPath);
        } else {
          addToHistory({
            type: 'output',
            content: `<span class="text-red">cd: ${args[0]}: No such directory</span>`
          });
        }
      }
    }
  };

  // React event handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const commandStr = inputValue.trim();
      if (commandStr) {
        executeCommand(commandStr);
        setCommandHistory([commandStr, ...commandHistory]);
        setHistoryIndex(-1);
        setInputValue('');
      }
      setTimeout(scrollToBottom, 10);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInputValue('');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleTerminalClick = () => {
    if (commandInputRef.current) {
      commandInputRef.current.focus();
    }
  };

  useEffect(() => {
    commands.welcome();
    if (commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, []);

  return (
    <div id="terminal-container">
      <div id="terminal-header">
        <div className="traffic-lights">
          <div className="traffic-light close"></div>
          <div className="traffic-light minimize"></div>
          <div className="traffic-light maximize"></div>
        </div>
        <div id="terminal-title">henryreed@henryreed.ai: {currentPath}</div>
      </div>
      <div id="terminal-body" ref={terminalBodyRef} onClick={handleTerminalClick}>
        <div id="output">
          {history.map((entry, index) => (
            <div key={index}>
              {entry.type === 'command' ? (
                <div className="command-line-history">
                  <span className="prompt">$&nbsp;</span>
                  <span className="path">{entry.path}</span>
                  &nbsp;{entry.content}
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: entry.content }} />
              )}
            </div>
          ))}
        </div>
        <div className="command-line">
          <span className="prompt">$&nbsp;</span>
          <span className="path">{currentPath}</span>
          <div className="input-area">
            <input
              type="text"
              id="command-input"
              ref={commandInputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <span className="cursor"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberEdTerminal;

