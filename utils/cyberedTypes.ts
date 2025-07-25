// Define FileNode interface
export interface FileNode {
    type: 'file';
    content: string;
}

// Define DirNode interface
export interface DirNode {
    type: 'dir';
    children: Record<string, FileNode | DirNode>;
}

// Define the CommandHandler type
export type CommandHandler = (args: string[]) => void;

// Union type for file system nodes
export type FileSystemNode = FileNode | DirNode;

// Strongly typed mock file system object
export const fileSystem: Record<string, DirNode> = {
    '~': {
        type: 'dir',
        children: {
            'README.md': {
                type: 'file',
                content: `## Welcome to the CortexEd Terminal!\n\nThis is a simulated terminal environment designed for learning basic cybersecurity concepts.\nType 'help' to see a list of available commands.\n\nExplore the file system with 'ls' and 'cd'.\nRead files with 'cat'.`
            },
            'tools': {
                type: 'dir',
                children: {
                    'nmap_basics.txt': {
                        type: 'file',
                        content: `### Nmap (Network Mapper) Basics\n\nNmap is a powerful open-source tool for network discovery and security auditing.\n\n**Common Uses:**\n- **Host Discovery:** Identifying hosts on a network.\n- **Port Scanning:** Enumerating open ports on target hosts.\n- **Version Detection:** Determining service and version information on open ports.\n- **OS Detection:** Determining the operating system of the target.\n\n**Example Educational Command:**\nnmap_scan example.com`
                    },
                    'wireshark_info.txt': {
                        type: 'file',
                        content: `### Wireshark Basics\n\nWireshark is the world's foremost and widely-used network protocol analyzer. It lets you see what's happening on your network at a microscopic level.\n\n**Key Features:**\n- Deep inspection of hundreds of protocols.\n- Live capture and offline analysis.\n- Rich VoIP analysis.\n- Runs on Windows, Linux, macOS, and more.\n\nThis terminal can't run Wireshark, but it's a critical tool for any security professional to learn.`
                    }
                }
            },
            'about.txt': {
                type: 'file',
                content: 'CortexEd Terminal v1.0 - A safe place to learn.'
            }
        }
    }
};

// Strongly typed resolvePath function
export function resolvePath(path: string): FileNode | DirNode | null {
    const parts = path.replace(/^~\//, '').split('/').filter(p => p);
    let currentNode: FileNode | DirNode | undefined = fileSystem['~'];

    if (path === '~') return currentNode;

    for (const part of parts) {
        if (currentNode && currentNode.type === 'dir' && currentNode.children[part]) {
            currentNode = currentNode.children[part];
        } else {
            return null;
        }
    }
    return currentNode || null;
}

// Command map as a strongly-typed object
export const commands: Record<string, CommandHandler> = {
    help: () => { /* Implementation */ },
    clear: () => { /* Implementation */ },
    welcome: () => { /* Implementation */ },
    ls: (args) => { /* Implementation */ },
    cat: (args) => { /* Implementation */ },
    whoami: () => { /* Implementation */ },
    date: () => { /* Implementation */ },
    nmap_scan: (args) => { /* Implementation */ },
    cd: (args) => { /* Implementation */ }
};
