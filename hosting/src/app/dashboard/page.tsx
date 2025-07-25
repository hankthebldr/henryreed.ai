'use client';

import { Suspense } from 'react';
import ArwesDashboard from '@/components/terminals/ArwesDashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-hack-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-terminal-purple glitch-text mb-2">
            ARWES DASHBOARD
          </h1>
          <p className="text-terminal-green">
            Sci-fi styled dashboard with Arwes animated UI
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
              href="/console" 
              className="btn btn-ghost text-terminal-amber border-terminal-amber hover:bg-terminal-amber hover:text-hack-background"
            >
              Console
            </a>
          </div>
        </header>

        <main className="h-[calc(100vh-200px)]">
          <div className="bg-hack-surface border border-terminal-purple rounded-lg p-4 h-full">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-terminal-purple">
                  Loading Arwes dashboard...
                </div>
              </div>
            }>
              <ArwesDashboard />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

