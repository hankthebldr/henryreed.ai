// Virtual File System (VFS) for terminal file operations

export type VNode = {
  type: 'file' | 'dir';
  name: string;
  content?: string;
  children?: Record<string, VNode>;
};

export type VFS = {
  root: VNode;
};

// Initialize VFS with default structure
export function initVFS(initial?: VNode): VFS {
  if (initial) {
    return { root: initial };
  }

  const root: VNode = {
    type: 'dir',
    name: '',
    children: {
      home: {
        type: 'dir',
        name: 'home',
        children: {
          guest: {
            type: 'dir',
            name: 'guest',
            children: {
              'readme.txt': {
                type: 'file',
                name: 'readme.txt',
                content: `Welcome to Henry Reed AI Terminal!

This is a simulated Unix-like environment with Linux primitive commands.

Available commands include:
- Navigation: cd, pwd, ls
- Files: cat, echo, touch, mkdir, rm, cp, mv
- System: whoami, date, uptime, history
- Search: grep
- AI Tools: help, pov, template, detect

Try these examples:
  ls -la          # List files with details
  mkdir projects  # Create directory
  cd projects     # Change directory
  touch file.txt  # Create empty file
  echo "Hello" > file.txt  # Write to file (coming soon)
  cat file.txt    # Read file contents

For multiline input, use Shift+Enter to add new lines.
Press Enter to execute commands.

Happy exploring!
`
              }
            }
          }
        }
      },
      tmp: {
        type: 'dir',
        name: 'tmp',
        children: {}
      }
    }
  };

  return { root };
}

// Resolve a path relative to cwd, supporting /, ., .., ~, and relative paths
export function resolvePath(cwd: string, input: string, userHome: string = '/home/guest'): string {
  if (!input) return cwd;
  
  let path = input;
  
  // Handle ~ (home directory)
  if (path.startsWith('~/')) {
    path = userHome + path.slice(1);
  } else if (path === '~') {
    path = userHome;
  }
  
  // Handle absolute paths
  if (path.startsWith('/')) {
    return normalizePath(path);
  }
  
  // Handle relative paths
  const parts = (cwd + '/' + path).split('/').filter(p => p.length > 0);
  const resolved: string[] = [];
  
  for (const part of parts) {
    if (part === '.') {
      continue; // Current directory
    } else if (part === '..') {
      resolved.pop(); // Parent directory
    } else {
      resolved.push(part);
    }
  }
  
  return '/' + resolved.join('/');
}

// Normalize path by removing redundant parts
function normalizePath(path: string): string {
  const parts = path.split('/').filter(p => p.length > 0);
  const resolved: string[] = [];
  
  for (const part of parts) {
    if (part === '.') {
      continue;
    } else if (part === '..') {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }
  
  return '/' + resolved.join('/');
}

// Get node at absolute path, along with parent and name
export function getNode(vfs: VFS, absPath: string): { node?: VNode; parent?: VNode; name: string } {
  const cleanPath = normalizePath(absPath);
  const parts = cleanPath.split('/').filter(p => p.length > 0);
  
  if (parts.length === 0) {
    return { node: vfs.root, parent: undefined, name: '' };
  }
  
  let current = vfs.root;
  let parent = undefined;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (!current.children || current.type !== 'dir') {
      return { node: undefined, parent, name: part };
    }
    
    parent = current;
    current = current.children[part];
    
    if (!current) {
      return { node: undefined, parent, name: part };
    }
  }
  
  return { node: current, parent, name: parts[parts.length - 1] };
}

// List directory contents
export function listDir(vfs: VFS, absPath: string): { name: string; type: 'file' | 'dir' }[] {
  const { node } = getNode(vfs, absPath);
  
  if (!node || node.type !== 'dir' || !node.children) {
    throw new Error(`${absPath}: Not a directory`);
  }
  
  return Object.entries(node.children).map(([name, child]) => ({
    name,
    type: child.type
  }));
}

// Ensure directory exists, creating parents if needed
export function ensureDir(vfs: VFS, absPath: string, opts: { p?: boolean } = {}): void {
  const cleanPath = normalizePath(absPath);
  const parts = cleanPath.split('/').filter(p => p.length > 0);
  
  let current = vfs.root;
  
  for (const part of parts) {
    if (!current.children) {
      current.children = {};
    }
    
    if (!current.children[part]) {
      if (!opts.p && current !== vfs.root) {
        throw new Error(`${absPath}: No such file or directory`);
      }
      current.children[part] = {
        type: 'dir',
        name: part,
        children: {}
      };
    } else if (current.children[part].type !== 'dir') {
      throw new Error(`${part}: File exists`);
    }
    
    current = current.children[part];
  }
}

// Create file
export function createFile(vfs: VFS, absPath: string, content: string = ''): void {
  const { parent, name } = getNode(vfs, absPath);
  
  if (!parent || parent.type !== 'dir') {
    throw new Error(`${absPath}: No such file or directory`);
  }
  
  if (!parent.children) {
    parent.children = {};
  }
  
  parent.children[name] = {
    type: 'file',
    name,
    content
  };
}

// Read file contents
export function readFile(vfs: VFS, absPath: string): string {
  const { node } = getNode(vfs, absPath);
  
  if (!node) {
    throw new Error(`${absPath}: No such file or directory`);
  }
  
  if (node.type !== 'file') {
    throw new Error(`${absPath}: Is a directory`);
  }
  
  return node.content || '';
}

// Write file contents
export function writeFile(vfs: VFS, absPath: string, content: string, opts: { append?: boolean } = {}): void {
  const { node, parent, name } = getNode(vfs, absPath);
  
  if (node && node.type !== 'file') {
    throw new Error(`${absPath}: Is a directory`);
  }
  
  if (!node) {
    // Create new file
    if (!parent || parent.type !== 'dir') {
      throw new Error(`${absPath}: No such file or directory`);
    }
    
    if (!parent.children) {
      parent.children = {};
    }
    
    parent.children[name] = {
      type: 'file',
      name,
      content
    };
  } else {
    // Update existing file
    if (opts.append) {
      node.content = (node.content || '') + content;
    } else {
      node.content = content;
    }
  }
}

// Remove file or directory
export function remove(vfs: VFS, absPath: string, opts: { r?: boolean; f?: boolean } = {}): void {
  if (absPath === '/' || absPath === '') {
    throw new Error('Cannot remove root directory');
  }
  
  const { node, parent, name } = getNode(vfs, absPath);
  
  if (!node) {
    if (!opts.f) {
      throw new Error(`${absPath}: No such file or directory`);
    }
    return;
  }
  
  if (node.type === 'dir' && !opts.r) {
    throw new Error(`${absPath}: Is a directory`);
  }
  
  if (!parent || !parent.children) {
    throw new Error(`Cannot remove ${absPath}`);
  }
  
  delete parent.children[name];
}

// Copy file or directory
export function copy(vfs: VFS, srcAbs: string, dstAbs: string, opts: { r?: boolean } = {}): void {
  const { node: srcNode } = getNode(vfs, srcAbs);
  
  if (!srcNode) {
    throw new Error(`${srcAbs}: No such file or directory`);
  }
  
  if (srcNode.type === 'dir' && !opts.r) {
    throw new Error(`${srcAbs}: Is a directory`);
  }
  
  const { node: dstNode } = getNode(vfs, dstAbs);
  let finalDst = dstAbs;
  
  if (dstNode && dstNode.type === 'dir') {
    // Copy into directory
    finalDst = dstAbs + '/' + srcNode.name;
  }
  
  if (srcNode.type === 'file') {
    writeFile(vfs, finalDst, srcNode.content || '');
  } else if (srcNode.type === 'dir' && opts.r) {
    ensureDir(vfs, finalDst);
    if (srcNode.children) {
      for (const [name, child] of Object.entries(srcNode.children)) {
        copy(vfs, srcAbs + '/' + name, finalDst + '/' + name, opts);
      }
    }
  }
}

// Move file or directory
export function move(vfs: VFS, srcAbs: string, dstAbs: string): void {
  const { node: srcNode } = getNode(vfs, srcAbs);
  
  if (!srcNode) {
    throw new Error(`${srcAbs}: No such file or directory`);
  }
  
  const { node: dstNode } = getNode(vfs, dstAbs);
  let finalDst = dstAbs;
  
  if (dstNode && dstNode.type === 'dir') {
    // Move into directory
    finalDst = dstAbs + '/' + srcNode.name;
  }
  
  // Copy then remove
  copy(vfs, srcAbs, finalDst, { r: true });
  remove(vfs, srcAbs, { r: true });
}

// Serialize VFS to JSON string for persistence
export function serializeVFS(vfs: VFS): string {
  return JSON.stringify(vfs, null, 2);
}

// Deserialize VFS from JSON string
export function deserializeVFS(json: string): VFS {
  try {
    const parsed = JSON.parse(json);
    return { root: parsed.root };
  } catch (error) {
    throw new Error('Invalid VFS data');
  }
}

// Get file/dir stats (for ls -l)
export function getStats(node: VNode): { size: number; type: string } {
  if (node.type === 'file') {
    return {
      size: node.content?.length || 0,
      type: 'file'
    };
  } else {
    return {
      size: Object.keys(node.children || {}).length,
      type: 'dir'
    };
  }
}
