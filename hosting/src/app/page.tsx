'use client';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-hack-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-terminal-green glitch-text mb-4">
            HENRY REED
          </h1>
          <p className="text-xl text-terminal-cyan mb-2">
            &gt; TERMINAL INTERFACE SHOWCASE
          </p>
          <p className="text-terminal-green font-mono">
            Navigate through different terminal frameworks and interfaces
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* XTerm.js Terminal */}
          <div className="bg-hack-surface border border-terminal-green rounded-lg p-6 hover:border-terminal-cyan transition-colors duration-300">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-terminal-green rounded-full mr-3"></div>
              <h2 className="text-xl font-mono text-terminal-green">XTERM EMULATOR</h2>
            </div>
            <p className="text-terminal-cyan text-sm mb-4">
              Full-featured terminal emulation with XTerm.js + React integration
            </p>
            <div className="space-y-2 text-xs font-mono mb-4">
              <div className="text-terminal-green">✓ Real terminal functionality</div>
              <div className="text-terminal-green">✓ Multi-addon support</div>
              <div className="text-terminal-green">✓ Keyboard shortcuts</div>
            </div>
            <a 
              href="/terminal"
              className="block w-full bg-transparent border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all duration-300 text-center py-2 rounded font-mono"
            >
              ACCESS TERMINAL
            </a>
          </div>

          {/* React Terminal Emulator CLI */}
          <div className="bg-hack-surface border border-terminal-cyan rounded-lg p-6 hover:border-terminal-green transition-colors duration-300">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-terminal-cyan rounded-full mr-3"></div>
              <h2 className="text-xl font-mono text-terminal-cyan">CLI INTERFACE</h2>
            </div>
            <p className="text-terminal-green text-sm mb-4">
              Interactive CLI components with React Terminal Emulator
            </p>
            <div className="space-y-2 text-xs font-mono mb-4">
              <div className="text-terminal-cyan">✓ Command handling</div>
              <div className="text-terminal-cyan">✓ Custom prompt</div>
              <div className="text-terminal-cyan">✓ Built-in commands</div>
            </div>
            <a 
              href="/cli"
              className="block w-full bg-transparent border border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan hover:text-hack-background transition-all duration-300 text-center py-2 rounded font-mono"
            >
              OPEN CLI
            </a>
          </div>

          {/* React Terminal UI Console */}
          <div className="bg-hack-surface border border-terminal-amber rounded-lg p-6 hover:border-terminal-purple transition-colors duration-300">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-terminal-amber rounded-full mr-3"></div>
              <h2 className="text-xl font-mono text-terminal-amber">CONSOLE UI</h2>
            </div>
            <p className="text-terminal-green text-sm mb-4">
              Styled command flows with React Terminal UI components
            </p>
            <div className="space-y-2 text-xs font-mono mb-4">
              <div className="text-terminal-amber">✓ Styled output</div>
              <div className="text-terminal-amber">✓ Command history</div>
              <div className="text-terminal-amber">✓ Rich formatting</div>
            </div>
            <a 
              href="/console"
              className="block w-full bg-transparent border border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-hack-background transition-all duration-300 text-center py-2 rounded font-mono"
            >
              LAUNCH CONSOLE
            </a>
          </div>

          {/* Arwes Dashboard */}
          <div className="bg-hack-surface border border-terminal-purple rounded-lg p-6 hover:border-terminal-red transition-colors duration-300">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-terminal-purple rounded-full mr-3 animate-pulse"></div>
              <h2 className="text-xl font-mono text-terminal-purple">SCI-FI DASHBOARD</h2>
            </div>
            <p className="text-terminal-green text-sm mb-4">
              Futuristic dashboard with Arwes animated UI elements
            </p>
            <div className="space-y-2 text-xs font-mono mb-4">
              <div className="text-terminal-purple">✓ Animated components</div>
              <div className="text-terminal-purple">✓ Sci-fi aesthetics</div>
              <div className="text-terminal-purple">✓ Real-time data</div>
            </div>
            <a 
              href="/dashboard"
              className="block w-full bg-transparent border border-terminal-purple text-terminal-purple hover:bg-terminal-purple hover:text-hack-background transition-all duration-300 text-center py-2 rounded font-mono"
            >
              ENTER DASHBOARD
            </a>
          </div>
        </main>

        {/* Latest Blog Posts */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-terminal-green mb-4 font-mono">
              &gt; LATEST_POSTS.LOG
            </h2>
            <p className="text-terminal-cyan font-mono">
              Recent articles and technical insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-hack-surface border border-terminal-green rounded-lg p-6 hover:border-terminal-cyan transition-colors duration-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono text-terminal-amber bg-hack-background px-2 py-1 rounded">
                  Development
                </span>
                <time className="text-xs font-mono text-terminal-green">
                  2024-01-15
                </time>
              </div>
              
              <h3 className="text-lg font-mono text-terminal-green mb-2 hover:text-terminal-cyan transition-colors">
                <a href="/blog/building-terminal-interfaces-nextjs">
                  Building Terminal Interfaces with Next.js
                </a>
              </h3>
              
              <p className="text-terminal-green text-sm mb-4">
                Exploring modern approaches to creating web-based terminal emulators.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-mono text-terminal-cyan px-2 py-1 bg-hack-background rounded">
                  #Next.js
                </span>
                <span className="text-xs font-mono text-terminal-cyan px-2 py-1 bg-hack-background rounded">
                  #Terminal
                </span>
                <span className="text-xs font-mono text-terminal-cyan px-2 py-1 bg-hack-background rounded">
                  #React
                </span>
              </div>
            </div>
            
            <div className="bg-hack-surface border border-terminal-green rounded-lg p-6 hover:border-terminal-cyan transition-colors duration-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono text-terminal-amber bg-hack-background px-2 py-1 rounded">
                  Tutorial
                </span>
                <time className="text-xs font-mono text-terminal-green">
                  2024-01-10
                </time>
              </div>
              
              <h3 className="text-lg font-mono text-terminal-green mb-2 hover:text-terminal-cyan transition-colors">
                <a href="/blog/xterm-integration-patterns">
                  XTerm.js Integration Patterns
                </a>
              </h3>
              
              <p className="text-terminal-green text-sm mb-4">
                Best practices for integrating XTerm.js in React applications.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-mono text-terminal-cyan px-2 py-1 bg-hack-background rounded">
                  #XTerm.js
                </span>
                <span className="text-xs font-mono text-terminal-cyan px-2 py-1 bg-hack-background rounded">
                  #React
                </span>
                <span className="text-xs font-mono text-terminal-cyan px-2 py-1 bg-hack-background rounded">
                  #TypeScript
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <a
              href="/blog"
              className="inline-block px-6 py-3 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all font-mono"
            >
              VIEW_ALL_POSTS &gt;&gt;
            </a>
          </div>
        </section>

        <footer className="mt-12 text-center">
          <div className="border-t border-terminal-green pt-6">
            <p className="text-terminal-green font-mono text-sm">
              Built with Next.js, TypeScript, Tailwind CSS, and hack.css
            </p>
            <div className="flex justify-center space-x-4 mt-4 text-xs font-mono">
              <span className="text-terminal-cyan">XTerm.js</span>
              <span className="text-terminal-amber">React Terminal UI</span>
              <span className="text-terminal-purple">Arwes</span>
              <span className="text-terminal-green">hack.css</span>
            </div>
          </div>
        </footer>

        {/* Matrix Rain Background Effect */}
        <div className="matrix-rain">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="matrix-character"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${20 + Math.random() * 10}s`
              }}
            >
              {String.fromCharCode(0x30A0 + Math.random() * 96)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
