'use client'

import React, { useRef, useEffect } from 'react';
import { useAppState } from '../../contexts/AppStateContext';
import ImprovedTerminal from '../ImprovedTerminal';

export interface TerminalHostRef {
  focus: () => void;
  executeCommand: (command: string) => void;
  isVisible: () => boolean;
  show: () => void;
  hide: () => void;
}

export default function TerminalHost() {
  const { state, actions } = useAppState();
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  // Register terminal ref with AppState
  useEffect(() => {
    const hostRef = {
      current: {
        focus: () => {
          // Focus the terminal container since we can't directly focus the ImprovedTerminal
          if (terminalContainerRef.current) {
            const inputElement = terminalContainerRef.current.querySelector('textarea');
            if (inputElement) {
              inputElement.focus();
            }
          }
        },
        executeCommand: (command: string) => {
          // For now, we can't programmatically execute commands in ImprovedTerminal
          // This would require modifying ImprovedTerminal to accept external command injection
          console.log('Would execute command:', command);
        },
        isVisible: () => state.terminal.isVisible,
        show: () => actions.openTerminal(),
        hide: () => actions.closeTerminal()
      }
    };
    
    actions.setTerminalRef(hostRef);
  }, [actions, state.terminal.isVisible]);

  // Handle command execution from GUI
  useEffect(() => {
    const bridge = state.commandBridge;
    if (bridge.pendingExecution && bridge.lastExecutedCommand) {
      // For now, just show a notification that the command should be executed
      // In a full implementation, we'd modify ImprovedTerminal to accept external commands
      actions.notify('info', `Please execute: ${bridge.lastExecutedCommand}`);
      
      // Clear pending execution flag
      actions.clearPendingExecution();
    }
  }, [state.commandBridge.pendingExecution, state.commandBridge.lastExecutedCommand, actions]);

  if (!state.terminal.isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-5/6 bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="ml-4 text-sm text-gray-300 font-medium">Terminal</span>
          </div>
          <button
            onClick={actions.closeTerminal}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="h-full" ref={terminalContainerRef}>
          <ImprovedTerminal />
        </div>
      </div>
    </div>
  );
}