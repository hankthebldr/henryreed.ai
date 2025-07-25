'use client';

import { Suspense } from 'react';
import ReactTerminalEmulator from '@/components/terminals/ReactTerminalEmulator';

export default function CLIPage() {
  return (
    <div className="min-h-screen bg-hack-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-terminal-cyan glitch-text mb-2">
            REACT TERMINAL EMULATOR
          </h1>
          <p className="text-terminal-green">
            Interactive CLI components with React Terminal Emulator
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
              href="/console" 
              className="btn btn-ghost text-terminal-amber border-terminal-amber hover:bg-terminal-amber hover:text-hack-background"
            >
              Console
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
            <div className="bg-hack-surface border border-terminal-cyan rounded-lg p-4 h-full">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-terminal-cyan">
                <h2 className="text-terminal-cyan font-mono">CLI Interface</h2>
                <div className="text-terminal-green text-sm font-mono">
                  React Terminal Emulator v4.1.1
                </div>
              </div>
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-terminal-cyan">Loading CLI interface...</div>
                </div>
              }>
                <ReactTerminalEmulator />
              </Suspense>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-hack-surface border border-terminal-cyan rounded-lg p-4">
              <h3 className="text-terminal-cyan font-mono mb-3">Available Commands</h3>
              <div className="space-y-3 text-sm font-mono">
                <div className="border-l-2 border-terminal-green pl-3">
                  <code className="text-terminal-green">help</code>
                  <p className="text-terminal-cyan text-xs mt-1">Show all available commands</p>
                </div>
                <div className="border-l-2 border-terminal-green pl-3">
                  <code className="text-terminal-green">whoami</code>
                  <p className="text-terminal-cyan text-xs mt-1">Display current user info</p>
                </div>
                <div className="border-l-2 border-terminal-green pl-3">
                  <code className="text-terminal-green">date</code>
                  <p className="text-terminal-cyan text-xs mt-1">Show current date and time</p>
                </div>
                <div className="border-l-2 border-terminal-green pl-3">
                  <code className="text-terminal-green">clear</code>
                  <p className="text-terminal-cyan text-xs mt-1">Clear terminal history</p>
                </div>
                <div className="border-l-2 border-terminal-green pl-3">
                  <code className="text-terminal-green">echo &lt;text&gt;</code>
                  <p className="text-terminal-cyan text-xs mt-1">Echo back the input text</p>
                </div>
              </div>
            </div>

            <div className="bg-hack-surface border border-terminal-cyan rounded-lg p-4">
              <h3 className="text-terminal-cyan font-mono mb-3">Session Info</h3>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-terminal-green">Framework:</span>
                  <span className="text-terminal-cyan">React Terminal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-green">Type:</span>
                  <span className="text-terminal-cyan">Interactive CLI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-green">Mode:</span>
                  <span className="text-terminal-cyan">Command Line</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-green">Status:</span>
                  <span className="text-terminal-cyan animate-pulse">Ready</span>
                </div>
              </div>
            </div>

            <div className="bg-hack-surface border border-terminal-cyan rounded-lg p-4">
              <h3 className="text-terminal-cyan font-mono mb-3">Tips</h3>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-hack-background rounded border border-terminal-green">
                  <p className="text-terminal-green">💡 Type commands and press Enter to execute</p>
                </div>
                <div className="p-2 bg-hack-background rounded border border-terminal-green">
                  <p className="text-terminal-green">💡 Use 'help' to see all available commands</p>
                </div>
                <div className="p-2 bg-hack-background rounded border border-terminal-green">
                  <p className="text-terminal-green">💡 Commands are case-insensitive</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
