import React from 'react';
import { TerminalOutput } from '../components/TerminalOutput';
import { 
  resolvePath, 
  getNode, 
  listDir, 
  ensureDir, 
  createFile, 
  readFile, 
  writeFile, 
  remove, 
  copy, 
  move, 
  getStats 
} from './vfs';

// Command handler context interface (imported from terminal)
interface CommandHandlerCtx {
  rawInput: string;
  cwd: string;
  setCwd: (p: string) => void;
  vfs: any;
  user?: { email?: string } | null;
  history: string[];
  bootTimeMs: number;
  prevCwd: string | null;
  setPrevCwd: (p: string | null) => void;
  persistData: () => void;
}

interface CommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  handler: (args: string[], ctx?: CommandHandlerCtx) => React.ReactNode | Promise<React.ReactNode>;
}

// Utility to parse flags from arguments
function parseFlags(args: string[]) {
  const flags: Set<string> = new Set();
  const nonFlags: string[] = [];
  
  for (const arg of args) {
    if (arg.startsWith('-') && arg.length > 1) {
      // Handle combined flags like -la
      if (arg.startsWith('--')) {
        flags.add(arg.slice(2));
      } else {
        for (let i = 1; i < arg.length; i++) {
          flags.add(arg[i]);
        }
      }
    } else {
      nonFlags.push(arg);
    }
  }
  
  return { flags, args: nonFlags };
}

// Format uptime duration
function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const h = hours % 24;
  const m = minutes % 60;
  const s = seconds % 60;
  
  if (days > 0) {
    return `up ${days} day${days !== 1 ? 's' : ''}, ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  } else {
    return `up ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}

export function buildLinuxCommands(): CommandConfig[] {
  return [
    // Navigation commands
    {
      name: 'cd',
      description: 'Change directory',
      usage: 'cd [path]',
      aliases: [],
      handler: (args, ctx) => {
        if (!ctx) return <TerminalOutput type="error">Context not available</TerminalOutput>;
        
        let targetPath = args[0] || '/home/guest';
        
        // Handle cd - (previous directory)
        if (targetPath === '-') {
          if (!ctx.prevCwd) {
            return (
              <TerminalOutput type="error">
                cd: OLDPWD not set
              </TerminalOutput>
            );
          }
          targetPath = ctx.prevCwd;
        }
        
        try {
          const resolvedPath = resolvePath(ctx.cwd, targetPath);
          const { node } = getNode(ctx.vfs, resolvedPath);
          
          if (!node) {
            return (
              <TerminalOutput type="error">
                cd: {targetPath}: No such file or directory
              </TerminalOutput>
            );
          }
          
          if (node.type !== 'dir') {
            return (
              <TerminalOutput type="error">
                cd: {targetPath}: Not a directory
              </TerminalOutput>
            );
          }
          
          // Success - update directories
          ctx.setPrevCwd(ctx.cwd);
          ctx.setCwd(resolvedPath);
          ctx.persistData();
          
          return null; // No output for successful cd
        } catch (error) {
          return (
            <TerminalOutput type="error">
              cd: {error instanceof Error ? error.message : 'Unknown error'}
            </TerminalOutput>
          );
        }
      }
    },
    
    {
      name: 'pwd',
      description: 'Print working directory',
      usage: 'pwd',
      aliases: [],
      handler: (args, ctx) => {
        if (!ctx) return <TerminalOutput type="error">Context not available</TerminalOutput>;
        
        return (
          <TerminalOutput type="default">
            {ctx.cwd}
          </TerminalOutput>
        );
      }
    },
    
    {
      name: 'ls',
      description: 'List directory contents',
      usage: 'ls [path] [-l] [-a]',
      aliases: ['ll'],
      handler: (args, ctx) => {
        if (!ctx) return <TerminalOutput type="error">Context not available</TerminalOutput>;
        
        const { flags, args: paths } = parseFlags(args);
        const targetPath = paths[0] || ctx.cwd;
        const longFormat = flags.has('l') || flags.has('long');
        const showAll = flags.has('a') || flags.has('all');
        
        try {
          const resolvedPath = resolvePath(ctx.cwd, targetPath);
          const items = listDir(ctx.vfs, resolvedPath);
          
          // Filter hidden files unless -a is specified
          const filteredItems = showAll 
            ? items 
            : items.filter(item => !item.name.startsWith('.'));
          
          if (filteredItems.length === 0) {
            return <TerminalOutput type="default"></TerminalOutput>;
          }
          
          if (longFormat) {
            // Long format listing
            const itemDetails = filteredItems.map(item => {
              const { node } = getNode(ctx.vfs, resolvedPath + '/' + item.name);
              const stats = node ? getStats(node) : { size: 0, type: item.type };
              
              return {
                ...item,
                size: stats.size,
                permissions: item.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--'
              };
            });
            
            return (
              <TerminalOutput type="default">
                <div className="font-mono text-sm">
                  {itemDetails.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <span className="text-gray-400">{item.permissions}</span>
                        <span className="w-12 text-right text-gray-400">{item.size}</span>
                        <span className={item.type === 'dir' ? 'text-blue-400 font-bold' : 'text-gray-200'}>
                          {item.name}{item.type === 'dir' ? '/' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </TerminalOutput>
            );
          } else {
            // Simple format listing
            return (
              <TerminalOutput type="default">
                <div className="font-mono text-sm">
                  <div className="grid grid-cols-4 gap-2">
                    {filteredItems.map((item, idx) => (
                      <span 
                        key={idx}
                        className={item.type === 'dir' ? 'text-blue-400 font-bold' : 'text-gray-200'}
                      >
                        {item.name}{item.type === 'dir' ? '/' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </TerminalOutput>
            );
          }
        } catch (error) {
          return (
            <TerminalOutput type="error">
              ls: {error instanceof Error ? error.message : 'Unknown error'}
            </TerminalOutput>
          );
        }
      }
    },
    
    // File content commands
    {
      name: 'cat',
      description: 'Display file contents',
      usage: 'cat [file...]',
      aliases: [],
      handler: (args, ctx) => {
        if (!ctx) return <TerminalOutput type="error">Context not available</TerminalOutput>;
        
        if (args.length === 0) {
          return (
            <TerminalOutput type="error">
              cat: missing file operand
            </TerminalOutput>
          );
        }
        
        try {
          const contents = args.map(filePath => {
            const resolvedPath = resolvePath(ctx.cwd, filePath);
            return readFile(ctx.vfs, resolvedPath);
          });
          
          return (
            <TerminalOutput type="default">
              <pre className="whitespace-pre-wrap break-words">{contents.join('')}</pre>
            </TerminalOutput>
          );
        } catch (error) {
          return (
            <TerminalOutput type="error">
              cat: {error instanceof Error ? error.message : 'Unknown error'}
            </TerminalOutput>
          );
        }
      }
    },
    
    {
      name: 'echo',
      description: 'Display text',
      usage: 'echo [text]',
      aliases: [],
      handler: (args, ctx) => {
        if (!ctx) return <TerminalOutput type="error">Context not available</TerminalOutput>;
        
        // Use rawInput to preserve spaces and newlines
        const echoIndex = ctx.rawInput.toLowerCase().indexOf('echo');
        if (echoIndex === -1) {
          return <TerminalOutput type="default"></TerminalOutput>;
        }
        
        const afterEcho = ctx.rawInput.slice(echoIndex + 4).trimStart();
        const { flags, args: textArgs } = parseFlags(args);
        const suppressNewline = flags.has('n');
        
        // If we have flags, use the parsed args; otherwise use the raw text
        let text = '';
        if (flags.size > 0) {
          text = textArgs.join(' ');
        } else {
          text = afterEcho;
        }
        
        return (
          <TerminalOutput type="default">
            <pre className="whitespace-pre-wrap break-words">
              {text}{suppressNewline ? '' : '\n'}
            </pre>
          </TerminalOutput>
        );
      }
    },
    
    {
      name: 'touch',
      description: 'Create empty files',
      usage: 'touch [file...]',
      aliases: [],
      handler: (args, ctx) => {
        if (!ctx) return <TerminalOutput type="error">Context not available</TerminalOutput>;
        
        if (args.length === 0) {
          return (
            <TerminalOutput type="error">
              touch: missing file operand
            </TerminalOutput>
          );
        }
        
        try {
          for (const filePath of args) {
            const resolvedPath = resolvePath(ctx.cwd, filePath);
            const { node } = getNode(ctx.vfs, resolvedPath);
            
            if (!node) {
              // Create new file
              createFile(ctx.vfs, resolvedPath, '');
            }
            // If file exists, we don't modify it (touch behavior)
          }
          
          ctx.persistData();
          return null; // No output for successful touch
        } catch (error) {
          return (
            <TerminalOutput type="error">
              touch: {error instanceof Error ? error.message : 'Unknown error'}
            </TerminalOutput>
          );
        }
      }
    },
    
    {
      name: 'mkdir',
      description: 'Create directories',
      usage: 'mkdir [-p] [directory...]',
      aliases: [],
      handler: (args, ctx) => {
        if (!ctx) return <TerminalOutput type="error">Context not available</TerminalOutput>;
        
        const { flags, args: dirPaths } = parseFlags(args);
        const createParents = flags.has('p') || flags.has('parents');
        
        if (dirPaths.length === 0) {
          return (
            <TerminalOutput type="error">
              mkdir: missing operand
            </TerminalOutput>
          );
        }
        
        try {
          for (const dirPath of dirPaths) {
            const resolvedPath = resolvePath(ctx.cwd, dirPath);
            ensureDir(ctx.vfs, resolvedPath, { p: createParents });
          }
          
          ctx.persistData();
          return null; // No output for successful mkdir
        } catch (error) {
          return (
            <TerminalOutput type="error">
              mkdir: {error instanceof Error ? error.message : 'Unknown error'}
            </TerminalOutput>
          );
        }
      }
    },
    
    {
      name: 'rm',
      description: 'Remove files and directories',
      usage: 'rm [-r] [-f] [path...]',
      aliases: [],
      handler: (args, ctx) => {
        if (!ctx) return <TerminalOutput type="error">Context not available</TerminalOutput>;
        
        const { flags, args: paths } = parseFlags(args);
        const recursive = flags.has('r') || flags.has('recursive');
        const force = flags.has('f') || flags.has('force');
        
        if (paths.length === 0) {
          return (
            <TerminalOutput type="error">
              rm: missing operand
            </TerminalOutput>
          );
        }
        
        try {
          for (const path of paths) {
            const resolvedPath = resolvePath(ctx.cwd, path);
            
            // Protect root and current directory
            if (resolvedPath === '/' || resolvedPath === ctx.cwd) {
              return (
                <TerminalOutput type="error">
                  rm: cannot remove '{path}': Operation not permitted
                </TerminalOutput>
              );
            }
            
            remove(ctx.vfs, resolvedPath, { r: recursive, f: force });
          }
          
          ctx.persistData();
          return null; // No output for successful rm
        } catch (error) {
          return (
            <TerminalOutput type="error">
              rm: {error instanceof Error ? error.message : 'Unknown error'}
            </TerminalOutput>
          );
        }
      }
    },
    
    {
      name: 'cp',
      description: 'Copy files and directories',
      usage: 'cp [-r] <source> <destination>',
      aliases: [],
      handler: (args, ctx) => {
        if (!ctx) return <TerminalOutput type="error">Context not available</TerminalOutput>;
        
        const { flags, args: paths } = parseFlags(args);
        const recursive = flags.has('r') || flags.has('recursive');
        
        if (paths.length < 2) {
          return (
            <TerminalOutput type="error">
              cp: missing destination operand
            </TerminalOutput>
          );
        }
        
        try {
          const sourcePath = resolvePath(ctx.cwd, paths[0]);
          const destPath = resolvePath(ctx.cwd, paths[1]);
          
          copy(ctx.vfs, sourcePath, destPath, { r: recursive });
          ctx.persistData();
          
          return null; // No output for successful cp
        } catch (error) {
          return (
            <TerminalOutput type="error">
              cp: {error instanceof Error ? error.message : 'Unknown error'}
            </TerminalOutput>
          );
        }
      }
    },
    
    {
      name: 'mv',
      description: 'Move/rename files and directories',
      usage: 'mv <source> <destination>',
      aliases: [],
      handler: (args, ctx) => {
        if (!ctx) return <TerminalOutput type="error">Context not available</TerminalOutput>;
        
        if (args.length < 2) {
          return (
            <TerminalOutput type="error">
              mv: missing destination operand
            </TerminalOutput>
          );
        }
        
        try {
          const sourcePath = resolvePath(ctx.cwd, args[0]);
          const destPath = resolvePath(ctx.cwd, args[1]);
          
          move(ctx.vfs, sourcePath, destPath);
          ctx.persistData();
          
          return null; // No output for successful mv
        } catch (error) {
          return (
            <TerminalOutput type="error">
              mv: {error instanceof Error ? error.message : 'Unknown error'}
            </TerminalOutput>
          );
        }
      }
    },
    
    // Search and system commands
    {
      name: 'grep',
      description: 'Search for patterns in files',
      usage: 'grep [-i] [-n] <pattern> [file...]',
      aliases: [],
      handler: (args, ctx) => {
        if (!ctx) return <TerminalOutput type="error">Context not available</TerminalOutput>;
        
        const { flags, args: nonFlagArgs } = parseFlags(args);
        const caseInsensitive = flags.has('i') || flags.has('ignore-case');
        const showLineNumbers = flags.has('n') || flags.has('line-number');
        
        if (nonFlagArgs.length === 0) {
          return (
            <TerminalOutput type="error">
              grep: missing pattern
            </TerminalOutput>
          );
        }
        
        const pattern = nonFlagArgs[0];
        const files = nonFlagArgs.slice(1);
        
        if (files.length === 0) {
          return (
            <TerminalOutput type="error">
              grep: no files specified
            </TerminalOutput>
          );
        }
        
        try {
          const results: string[] = [];
          
          for (const filePath of files) {
            const resolvedPath = resolvePath(ctx.cwd, filePath);
            const content = readFile(ctx.vfs, resolvedPath);
            const lines = content.split('\n');
            
            lines.forEach((line, idx) => {
              const searchLine = caseInsensitive ? line.toLowerCase() : line;
              const searchPattern = caseInsensitive ? pattern.toLowerCase() : pattern;
              
              if (searchLine.includes(searchPattern)) {
                let result = '';
                if (files.length > 1) {
                  result += `${filePath}:`;
                }
                if (showLineNumbers) {
                  result += `${idx + 1}:`;
                }
                result += line;
                results.push(result);
              }
            });
          }
          
          if (results.length === 0) {
            return <TerminalOutput type="default"></TerminalOutput>;
          }
          
          return (
            <TerminalOutput type="default">
              <pre className="whitespace-pre-wrap">{results.join('\n')}</pre>
            </TerminalOutput>
          );
        } catch (error) {
          return (
            <TerminalOutput type="error">
              grep: {error instanceof Error ? error.message : 'Unknown error'}
            </TerminalOutput>
          );
        }
      }
    },
    
    {
      name: 'date',
      description: 'Display current date and time',
      usage: 'date',
      aliases: [],
      handler: () => {
        return (
          <TerminalOutput type="default">
            {new Date().toString()}
          </TerminalOutput>
        );
      }
    },
    
    {
      name: 'uptime',
      description: 'Show system uptime',
      usage: 'uptime',
      aliases: [],
      handler: (args, ctx) => {
        if (!ctx) return <TerminalOutput type="error">Context not available</TerminalOutput>;
        
        const uptimeMs = Date.now() - ctx.bootTimeMs;
        const formatted = formatUptime(uptimeMs);
        
        return (
          <TerminalOutput type="default">
            {formatted}
          </TerminalOutput>
        );
      }
    },
    
    {
      name: 'history',
      description: 'Show command history',
      usage: 'history [-c]',
      aliases: [],
      handler: (args, ctx) => {
        if (!ctx) return <TerminalOutput type="error">Context not available</TerminalOutput>;
        
        const { flags } = parseFlags(args);
        const clear = flags.has('c') || flags.has('clear');
        
        if (clear) {
          // Note: We can't directly clear history from here since we don't have setHistory
          // This would need to be handled in the terminal component
          return (
            <TerminalOutput type="info">
              history: clear functionality requires terminal integration
            </TerminalOutput>
          );
        }
        
        if (ctx.history.length === 0) {
          return <TerminalOutput type="default"></TerminalOutput>;
        }
        
        return (
          <TerminalOutput type="default">
            <div className="font-mono text-sm">
              {ctx.history.map((cmd, idx) => (
                <div key={idx}>
                  <span className="text-gray-400 mr-3">{String(idx + 1).padStart(4, ' ')}</span>
                  <span className="text-gray-200">{cmd}</span>
                </div>
              ))}
            </div>
          </TerminalOutput>
        );
      }
    }
  ];
}
