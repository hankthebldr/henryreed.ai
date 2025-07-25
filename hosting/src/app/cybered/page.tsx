'use client';

import { Suspense } from 'react';
import CyberEdTerminal from '@/components/terminals/CyberEdTerminal';

export default function CyberEdPage() {
  return (
    <div className="min-h-screen bg-hack-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-terminal-green glitch-text mb-2">
            CYBERED SECURITY TERMINAL
          </h1>
          <p className="text-terminal-cyan">
            Advanced cybersecurity education terminal with interactive learning modules
          </p>
          <div className="flex space-x-4 mt-4">
            <a 
              href="/" 
              className="btn btn-ghost text-terminal-green border-terminal-green hover:bg-terminal-green hover:text-hack-background"
            >
              &larr; Home
            </a>
            <a 
              href="/cli" 
              className="btn btn-ghost text-terminal-cyan border-terminal-cyan hover:bg-terminal-cyan hover:text-hack-background"
            >
              CLI Interface
            </a>
            <a 
              href="/console" 
              className="btn btn-ghost text-terminal-amber border-terminal-amber hover:bg-terminal-amber hover:text-hack-background"
            >
              Console
            </a>
            <a 
              href="/terminal" 
              className="btn btn-ghost text-terminal-purple border-terminal-purple hover:bg-terminal-purple hover:text-hack-background"
            >
              Terminal
            </a>
            <a 
              href="/dashboard" 
              className="btn btn-ghost text-terminal-red border-terminal-red hover:bg-terminal-red hover:text-hack-background"
            >
              Dashboard
            </a>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          <div className="lg:col-span-3">
            <div className="bg-hack-surface border border-terminal-green rounded-lg p-4 h-full">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-terminal-green">
                <h2 className="text-terminal-green font-mono">CyberEd Terminal Session</h2>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-terminal-green rounded-full"></div>
                </div>
              </div>
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-terminal-green">Loading CyberEd terminal...</div>
                </div>
              }>
                <CyberEdTerminal />
              </Suspense>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-hack-surface border border-terminal-green rounded-lg p-4">
              <h3 className="text-terminal-green font-mono mb-3">Learning Modules</h3>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-terminal-cyan">Current:</span>
                  <span className="text-terminal-green">Network Security</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-cyan">Progress:</span>
                  <span className="text-terminal-green">75%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-cyan">Level:</span>
                  <span className="text-terminal-green">Intermediate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-cyan">Status:</span>
                  <span className="text-terminal-green">Active</span>
                </div>
              </div>
            </div>

            <div className="bg-hack-surface border border-terminal-green rounded-lg p-4">
              <h3 className="text-terminal-green font-mono mb-3">Security Commands</h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 bg-hack-background rounded border border-terminal-green">
                  <code className="text-terminal-cyan">nmap -sn 192.168.1.0/24</code>
                  <p className="text-terminal-green text-xs mt-1">Network discovery scan</p>
                </div>
                <div className="p-2 bg-hack-background rounded border border-terminal-green">
                  <code className="text-terminal-cyan">netstat -tulpn</code>
                  <p className="text-terminal-green text-xs mt-1">Show listening ports</p>
                </div>
                <div className="p-2 bg-hack-background rounded border border-terminal-green">
                  <code className="text-terminal-cyan">tcpdump -i eth0</code>
                  <p className="text-terminal-green text-xs mt-1">Capture network traffic</p>
                </div>
              </div>
            </div>

            <div className="bg-hack-surface border border-terminal-green rounded-lg p-4">
              <h3 className="text-terminal-green font-mono mb-3">Lab Environment</h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-terminal-cyan">VM Status:</span>
                  <span className="text-terminal-green">Running</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-cyan">Network:</span>
                  <span className="text-terminal-green">Isolated</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-cyan">Tools:</span>
                  <span className="text-terminal-green">Loaded</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
