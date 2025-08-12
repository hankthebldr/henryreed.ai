'use client';

import { useState } from 'react';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections: Section[] = [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-green-400 mb-4">POV-CLI Documentation</h1>
          <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Welcome to Henry Reed AI Terminal</h2>
            <p className="text-gray-300 mb-4">
              The POV-CLI (Point of View Command Line Interface) is an interactive terminal experience 
              designed to showcase AI consulting services, technical expertise, and facilitate 
              engagement with potential clients and collaborators.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-800/50 p-4 rounded border border-green-500/30">
                <h3 className="text-lg font-bold text-green-400 mb-2">🎯 Purpose</h3>
                <p className="text-sm text-gray-300">
                  Interactive showcase of AI services, technical capabilities, and professional experience
                  through a familiar command-line interface.
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded border border-blue-500/30">
                <h3 className="text-lg font-bold text-blue-400 mb-2">🚀 Features</h3>
                <p className="text-sm text-gray-300">
                  Command history, tab completion, authentication, responsive design, 
                  and comprehensive service exploration.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'commands',
      title: 'Commands Reference',
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-green-400 mb-4">Commands Reference</h1>
          
          <div className="space-y-8">
            <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Basic Commands</h2>
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-green-400 font-mono font-bold">help [command]</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Show available commands or detailed help for a specific command
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Aliases: ?, man</div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-sm text-gray-300 mt-1">
                    Display information about Henry Reed. Use --detailed for comprehensive profile
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Aliases: me, info</div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-green-400 font-mono font-bold">clear</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Clear the terminal screen
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Aliases: cls</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Authentication</h2>
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-green-400 font-mono font-bold">login</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Open login form to access premium features
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Aliases: auth, signin</div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-green-400 font-mono font-bold">logout</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Sign out of your account
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Aliases: signout</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Navigation & Information</h2>
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-green-400 font-mono font-bold">docs [section]</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Open documentation page (this page) in a new tab
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Aliases: documentation, guide</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Features',
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-green-400 mb-4">Features</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900/40 border border-green-500/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-green-400 mb-4">🎯 Uniform Output Formatting</h2>
              <p className="text-gray-300 mb-4">
                All terminal output is consistently formatted using standardized text boxes with:
              </p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• <span className="text-green-400">Success messages</span> - green borders and backgrounds</li>
                <li>• <span className="text-red-400">Error messages</span> - red borders and backgrounds</li>
                <li>• <span className="text-yellow-400">Warning messages</span> - yellow borders and backgrounds</li>
                <li>• <span className="text-blue-400">Info messages</span> - blue borders and backgrounds</li>
                <li>• <span className="text-gray-400">Default content</span> - gray borders and backgrounds</li>
              </ul>
            </div>
            
            <div className="bg-gray-900/40 border border-blue-500/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-400 mb-4">🔐 Firebase Authentication</h2>
              <p className="text-gray-300 mb-4">
                Secure authentication system with multiple sign-in options:
              </p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Email/password authentication</li>
                <li>• Google OAuth integration</li>
                <li>• Account creation and management</li>
                <li>• Session persistence across visits</li>
                <li>• User profile integration in terminal</li>
              </ul>
            </div>
            
            <div className="bg-gray-900/40 border border-purple-500/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-purple-400 mb-4">⌨️ Enhanced Terminal Experience</h2>
              <p className="text-gray-300 mb-4">
                Full-featured terminal interface with modern conveniences:
              </p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Command history navigation (↑/↓ arrows)</li>
                <li>• Tab completion for commands</li>
                <li>• Consistent font sizing (14px monospace)</li>
                <li>• Real-time feedback and loading states</li>
                <li>• Responsive design for all screen sizes</li>
              </ul>
            </div>
            
            <div className="bg-gray-900/40 border border-yellow-500/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">📖 Integrated Documentation</h2>
              <p className="text-gray-300 mb-4">
                Comprehensive documentation system accessible from terminal:
              </p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• In-terminal help system with <code className="text-green-400">help</code> command</li>
                <li>• Dedicated documentation page (this page)</li>
                <li>• Section-specific navigation</li>
                <li>• Command reference with examples</li>
                <li>• Feature explanations and tutorials</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'examples',
      title: 'Usage Examples',
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-green-400 mb-4">Usage Examples</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Getting Started</h2>
              <div className="bg-black p-4 rounded font-mono text-sm">
                <div className="text-blue-400">henry@ai:~$ <span className="text-white">help</span></div>
                <div className="text-gray-300 mt-2">Shows all available commands with descriptions</div>
                <div className="text-gray-300 mt-2">Basic information about Henry Reed</div>
                <div className="text-gray-300 mt-2">Comprehensive profile and expertise overview</div>
              </div>
            </div>
            
            <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Authentication Workflow</h2>
              <div className="bg-black p-4 rounded font-mono text-sm">
                <div className="text-blue-400">henry@ai:~$ <span className="text-white">login</span></div>
                <div className="text-gray-300 mt-2">Opens login form with email/password and Google options</div>
                <div className="text-gray-300 mt-2">Now shows "✓ Signed in as user@example.com"</div>
                <div className="text-blue-400 mt-4">henry@ai:~$ <span className="text-white">logout</span></div>
                <div className="text-gray-300 mt-2">Signs out and shows confirmation message</div>
              </div>
            </div>
            
            <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Navigation Tips</h2>
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-green-400 font-bold mb-2">Keyboard Shortcuts</div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>• <span className="text-blue-400">↑/↓ arrows</span> - Navigate command history</div>
                    <div>• <span className="text-blue-400">Tab</span> - Auto-complete command names</div>
                    <div>• <span className="text-blue-400">Enter</span> - Execute command</div>
                    <div>• <span className="text-blue-400">Ctrl+C</span> - Cancel current input</div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded">
                  <div className="text-green-400 font-bold mb-2">Command Aliases</div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>• <span className="text-blue-400">help</span> = <span className="text-gray-400">? man</span></div>
                    <div>• <span className="text-blue-400">clear</span> = <span className="text-gray-400">cls</span></div>
                    <div>• <span className="text-blue-400">login</span> = <span className="text-gray-400">auth signin</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api',
      title: 'API Reference',
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-green-400 mb-4">API Reference</h1>
          
          <div className="bg-gray-900/40 border border-gray-600/30 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-blue-400 mb-4">Terminal Component Architecture</h2>
            <div className="space-y-4">
              <div className="bg-gray-800/50 p-4 rounded">
                <h3 className="text-lg font-bold text-green-400 mb-2">Core Components</h3>
                <div className="text-sm text-gray-300 space-y-2 font-mono">
                  <div><span className="text-blue-400">ImprovedTerminal</span> - Main terminal interface</div>
                  <div><span className="text-blue-400">TerminalOutput</span> - Uniform output formatting component</div>
                  <div><span className="text-blue-400">LoginForm</span> - Authentication modal</div>
                  <div><span className="text-blue-400">AuthProvider</span> - Firebase authentication context</div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded">
                <h3 className="text-lg font-bold text-green-400 mb-2">Command Configuration</h3>
                <pre className="text-xs text-gray-300 overflow-x-auto">
{`interface CommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  handler: (args: string[]) => React.ReactNode | Promise<React.ReactNode>;
}`}
                </pre>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded">
                <h3 className="text-lg font-bold text-green-400 mb-2">Output Types</h3>
                <pre className="text-xs text-gray-300 overflow-x-auto">
{`type OutputType = 'success' | 'error' | 'warning' | 'info' | 'default';

// Usage:
<TerminalOutput type="success">
  Operation completed successfully!
</TerminalOutput>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">POV-CLI Documentation</h1>
            <p className="text-sm text-gray-400">Henry Reed AI Terminal - Complete Guide</p>
          </div>
          <a 
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            ← Back to Terminal
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-700 min-h-screen p-4">
          <nav className="sticky top-4">
            <h2 className="text-lg font-bold text-green-400 mb-4">Contents</h2>
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {sections.find(section => section.id === activeSection)?.content}
        </main>
      </div>
    </div>
  );
}
