'use client';

import { Suspense } from 'react';
import ReactTerminalUI from '@/components/terminals/ReactTerminalUI';

export default function ConsolePage() {
  return (
    <div className="min-h-screen bg-hack-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-terminal-amber glitch-text mb-2">
            REACT TERMINAL UI
          </h1>
          <p className="text-terminal-green">
            Styled command flows with React Terminal UI components
          </p>
          <div className="flex space-x-4 mt-4">
            <a 
              href="/" 
              className="btn btn-ghost text-terminal-green border-terminal-green hover:bg-terminal-green hover:text-hack-background"
            >
              &larr; Home
            </a>
            <a 
              href="/terminal" 
              className="btn btn-ghost text-terminal-green border-terminal-green hover:bg-terminal-green hover:text-hack-background"
            >
              XTerm Terminal
            </a>
            <a 
              href="/cli" 
              className="btn btn-ghost text-terminal-cyan border-terminal-cyan hover:bg-terminal-cyan hover:text-hack-background"
            >
              CLI Interface
            </a>
            <a 
              href="/dashboard" 
              className="btn btn-ghost text-terminal-purple border-terminal-purple hover:bg-terminal-purple hover:text-hack-background"
            >
              Dashboard
            </a>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          <div className="lg:col-span-3">
            <div className="bg-hack-surface border border-terminal-amber rounded-lg p-4 h-full">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-terminal-amber">
                <h2 className="text-terminal-amber font-mono">Console Interface</h2>
                <div className="text-terminal-green text-sm font-mono">
                  React Terminal UI v1.0.4
                </div>
              </div>
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-terminal-amber">Loading console interface...</div>
                </div>
              }>
                <ReactTerminalUI />
              </Suspense>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-hack-surface border border-terminal-amber rounded-lg p-4">
              <h3 className="text-terminal-amber font-mono mb-3">Console Features</h3>
              <div className="space-y-3 text-sm font-mono">
                <div className="border-l-2 border-terminal-green pl-3">
                  <span className="text-terminal-green">✓ Command History</span>
                  <p className="text-terminal-amber text-xs mt-1">Navigate through previous commands</p>
                </div>
                <div className="border-l-2 border-terminal-green pl-3">
                  <span className="text-terminal-green">✓ Styled Output</span>
                  <p className="text-terminal-amber text-xs mt-1">Rich text formatting and colors</p>
                </div>
                <div className="border-l-2 border-terminal-green pl-3">
                  <span className="text-terminal-green">✓ Interactive Input</span>
                  <p className="text-terminal-amber text-xs mt-1">Real-time command processing</p>
                </div>
                <div className="border-l-2 border-terminal-green pl-3">
                  <span className="text-terminal-green">✓ Auto-completion</span>
                  <p className="text-terminal-amber text-xs mt-1">Smart command suggestions</p>
                </div>
              </div>
            </div>

            <div className="bg-hack-surface border border-terminal-amber rounded-lg p-4">
              <h3 className="text-terminal-amber font-mono mb-3">Command Flow</h3>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse"></div>
                  <span className="text-terminal-green">Input Processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-terminal-cyan rounded-full"></div>
                  <span className="text-terminal-cyan">Command Parsing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-terminal-amber rounded-full"></div>
                  <span className="text-terminal-amber">Output Rendering</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-terminal-purple rounded-full"></div>
                  <span className="text-terminal-purple">History Update</span>
                </div>
              </div>
            </div>

            <div className="bg-hack-surface border border-terminal-amber rounded-lg p-4">
              <h3 className="text-terminal-amber font-mono mb-3">System Status</h3>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-terminal-green">Framework:</span>
                  <span className="text-terminal-amber">React Terminal UI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-green">Mode:</span>
                  <span className="text-terminal-amber">Console</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-green">Theme:</span>
                  <span className="text-terminal-amber">Hacker</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-green">Status:</span>
                  <span className="text-terminal-amber animate-pulse">Online</span>
                </div>
              </div>
            </div>

            <div className="bg-hack-surface border border-terminal-amber rounded-lg p-4">
              <h3 className="text-terminal-amber font-mono mb-3">Interface Guide</h3>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-hack-background rounded border border-terminal-green">
                  <p className="text-terminal-green">⚡ Enhanced terminal window styling</p>
                </div>
                <div className="p-2 bg-hack-background rounded border border-terminal-green">
                  <p className="text-terminal-green">⚡ Command line type differentiation</p>
                </div>
                <div className="p-2 bg-hack-background rounded border border-terminal-green">
                  <p className="text-terminal-green">⚡ Responsive layout and design</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
