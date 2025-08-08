
'use client';

import { useEffect, useRef, useState } from 'react';
import './OldTerminal.css';

export default function OldTerminal() {
  const outputDiv = useRef<HTMLDivElement>(null);
  const commandInput = useRef<HTMLInputElement>(null);
  const pathSpan = useRef<HTMLSpanElement>(null);
  const terminalBody = useRef<HTMLDivElement>(null);

  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState('~');

  const fileSystem = {
    '~': {
      type: 'dir',
      children: {
        'README.md': {
          type: 'file',
          content: `
## Welcome to the CortexEd Terminal!

This is a simulated terminal environment designed for learning basic cybersecurity concepts.
Type 'help' to see a list of available commands.

Explore the file system with 'ls' and 'cd'.
Read files with 'cat'.
`,
        },
        tools: {
          type: 'dir',
          children: {
            'nmap_basics.txt': {
              type: 'file',
              content: `
### Nmap (Network Mapper) Basics

Nmap is a powerful open-source tool for network discovery and security auditing.

**Common Uses:**
- **Host Discovery:** Identifying hosts on a network.
- **Port Scanning:** Enumerating open ports on target hosts.
- **Version Detection:** Determining service and version information on open ports.
- **OS Detection:** Determining the operating system of the target.

**Example Educational Command:**
nmap_scan example.com
`,
            },
            'wireshark_info.txt': {
              type: 'file',
              content: `
### Wireshark Basics

Wireshark is the world's foremost and widely-used network protocol analyzer. It lets you see what's happening on your network at a microscopic level.

**Key Features:**
- Deep inspection of hundreds of protocols.
- Live capture and offline analysis.
- Rich VoIP analysis.
- Runs on Windows, Linux, macOS, and more.

This terminal can't run Wireshark, but it's a critical tool for any security professional to learn.
`,
            },
          },
        },
        'about.txt': {
          type: 'file',
          content: 'CortexEd Terminal v1.0 - A safe place to learn.',
        },
      },
    },
  };

  function resolvePath(path: string) {
    const parts = path.replace(/^~\//, '').split('/').filter(p => p);
    let currentNode: any = fileSystem['~'];
    if (path === '~') return currentNode;

    for (const part of parts) {
      if (currentNode && currentNode.type === 'dir' && currentNode.children[part]) {
        currentNode = currentNode.children[part];
      } else {
        return null;
      }
    }
    return currentNode;
  }

  function appendOutput(text: string) {
    if (outputDiv.current) {
      const p = document.createElement('p');
      p.innerHTML = text;
      outputDiv.current.appendChild(p);
    }
  }

  function scrollToBottom() {
    if (terminalBody.current) {
      terminalBody.current.scrollTop = terminalBody.current.scrollHeight;
    }
  }

  function showNewPrompt(command: string) {
    if (outputDiv.current) {
      const commandLine = document.createElement('div');
      commandLine.innerHTML = `<span class="prompt">$ </span><span class="path">${currentPath}</span> <span>${command}</span>`;
      outputDiv.current.appendChild(commandLine);
    }
  }

  const commands: { [key: string]: (args?: any) => void } = {
    help: () => {
      appendOutput(`
<span class="text-yellow">Available Commands:</span>
<span class="text-cyan">help</span> - Shows this help message.
<span class="text-cyan">clear</span> - Clears the terminal screen.
<span class="text-cyan">ls [path]</span> - Lists files and directories.
<span class="text-cyan">cd [path]</span> - Changes the current directory.
<span class="text-cyan">cat [file]</span> - Displays the content of a file.
<span class="text-cyan">whoami</span> - Displays the current user.
<span class="text-cyan">date</span> - Displays the current date and time.
<span class="text-cyan">nmap_scan</span> - Simulates a basic Nmap scan for educational purposes.
<span class="text-cyan">welcome</span> - Displays the welcome message.
`);
    },
    clear: () => {
      if (outputDiv.current) {
        outputDiv.current.innerHTML = '';
      }
    },
    welcome: () => {
      appendOutput(`
<pre class="text-green">
______ __ ______ ____
/ ____/____ _ ____/ /___ ______/ ____/___/ / /__\
/ / / __ \\`/ __ / __ \\`/ ___/ __/ / __ / / _ \\\\\
/ /___/ /_/ / /_/ / /_/ / / / /___/ /_/ / / __/
\\____/\\__,_/\\__,_/\\____/_/ \\\\____/\\__,_/_/\\___/
</pre>
Welcome to the CortexEd Terminal. Type <span class="text-cyan">'help'</span> for a list of commands.
`);
    },
    ls: (args) => {
      const path = args[0] || currentPath;
      const node = resolvePath(path);
      if (node && node.type === 'dir') {
        const content = Object.keys(node.children).map(key => {
          const child = node.children[key];
          return child.type === 'dir' ? `<span class="text-blue">${key}/</span>` : key;
        }).join('&nbsp;&nbsp;');
        appendOutput(content || 'Directory is empty.');
      } else {
        appendOutput(`<span class="text-red">ls: cannot access '${path}': No such file or directory</span>`);
      }
    },
    cat: (args) => {
      if (!args[0]) {
        appendOutput(`<span class="text-red">cat: missing operand</span>`);
        return;
      }
      const path = currentPath === '~' ? `~/${args[0]}` : `${currentPath}/${args[0]}`;
      const node = resolvePath(path);
      if (node && node.type === 'file') {
        if (outputDiv.current) {
          const pre = document.createElement('pre');
          pre.textContent = node.content;
          outputDiv.current.appendChild(pre);
        }
      } else {
        appendOutput(`<span class="text-red">cat: ${args[0]}: No such file or directory</span>`);
      }
    },
    whoami: () => {
      appendOutput('user');
    },
    date: () => {
      appendOutput(new Date().toString());
    },
    nmap_scan: (args) => {
      if (!args[0]) {
        appendOutput(`<span class="text-red">nmap_scan: please specify a target (e.g., nmap_scan example.com)</span>`);
        return;
      }
      const target = args[0];
      appendOutput(`<span class="text-yellow">Simulating Nmap scan on ${target}...</span>`);
      setTimeout(() => {
        appendOutput(`
Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toUTCString()}
Nmap scan report for ${target} (127.0.0.1)
Host is up (0.00021s latency).
Not shown: 996 closed tcp ports (reset)
PORT STATE SERVICE
80/tcp open http
443/tcp open https
<span class="text-green">
This is a simulation. No real network scan was performed.
This demonstrates how Nmap might show open web ports.
</span>
`);
        scrollToBottom();
      }, 1000);
    },
    cd: (args) => {
      let newPath;
      if (!args[0] || args[0] === '~') {
        newPath = '~';
      } else {
        newPath = args[0] === '..'
          ? currentPath.substring(0, currentPath.lastIndexOf('/')) || '~'
          : (currentPath === '~' ? `~/${args[0]}` : `${currentPath}/${args[0]}`);
      }
      const node = resolvePath(newPath);
      if (node && node.type === 'dir') {
        setCurrentPath(newPath);
      } else {
        appendOutput(`<span class="text-red">cd: ${args[0]}: No such directory</span>`);
      }
    },
  };

  useEffect(() => {
    if (pathSpan.current) {
      pathSpan.current.textContent = currentPath;
    }
  }, [currentPath]);

  useEffect(() => {
    commands.welcome();
    if (commandInput.current) {
      commandInput.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const commandStr = e.currentTarget.value.trim();
      if (commandStr) {
        const [command, ...args] = commandStr.split(/\s+/);
        showNewPrompt(commandStr);
        if (commands[command]) {
          commands[command](args);
        } else {
          appendOutput(`<span class="text-red">command not found: ${command}</span>`);
        }
        setCommandHistory([commandStr, ...commandHistory]);
        setHistoryIndex(-1);
        e.currentTarget.value = '';
      }
      scrollToBottom();
    } else if (e.key === 'ArrowUp') {
      if (historyIndex < commandHistory.length - 1) {
        const newHistoryIndex = historyIndex + 1;
        setHistoryIndex(newHistoryIndex);
        e.currentTarget.value = commandHistory[newHistoryIndex];
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > 0) {
        const newHistoryIndex = historyIndex - 1;
        setHistoryIndex(newHistoryIndex);
        e.currentTarget.value = commandHistory[newHistoryIndex];
      } else {
        setHistoryIndex(-1);
        e.currentTarget.value = '';
      }
    }
  };

  return (
    <div id="terminal-container">
      <div id="terminal-header">
        <div className="traffic-lights">
          <div className="traffic-light close"></div>
          <div className="traffic-light minimize"></div>
          <div className="traffic-light maximize"></div>
        </div>
        <div id="terminal-title">user@cortex-ed: ~</div>
      </div>
      <div id="terminal-body" ref={terminalBody} onClick={() => commandInput.current?.focus()}>
        <div id="output" ref={outputDiv}></div>
        <div className="command-line">
          <span className="prompt">$ </span>
          <span className="path" ref={pathSpan}>~</span>
          <div className="input-area">
            <input
              type="text"
              id="command-input"
              ref={commandInput}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              onKeyDown={handleKeyDown}
            />
            <span className="cursor"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

