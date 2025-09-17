'use client';

import React from 'react';
import CommandAlignmentGuide from '../../components/CommandAlignmentGuide';

export default function AlignmentGuidePage() {
  return (
    <div className="min-h-screen">
      <div className="bg-cortex-bg-secondary border-b border-cortex-border-secondary p-4 mb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cortex-green">🔄 Terminal ↔ GUI Command Alignment</h1>
            <p className="text-sm text-cortex-text-secondary mt-1">
              Understanding the consistent experience between terminal and graphical interfaces
            </p>
          </div>
          <div className="flex space-x-2">
            <a 
              href="/gui"
              className="px-4 py-2 bg-cortex-green hover:bg-cortex-green-dark text-white rounded transition-colors text-sm"
            >
              ← Back to GUI
            </a>
            <a 
              href="/terminal"
              className="px-4 py-2 bg-cortex-info hover:bg-cortex-info-dark text-white rounded transition-colors text-sm"
            >
              Terminal
            </a>
          </div>
        </div>
      </div>
      
      <CommandAlignmentGuide />
    </div>
  );
}