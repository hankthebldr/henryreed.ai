'use client'

import React, { useRef, useEffect } from 'react';
import { useAppState } from '../../contexts/AppStateContext';
import ImprovedTerminal, { ImprovedTerminalRef } from '../ImprovedTerminal';

export interface TerminalHostRef {
  focus: () => void;
  executeCommand: (command: string) => void;
  isVisible: () => boolean;
  show: () => void;
  hide: () => void;
}

export default function TerminalHost() {
  const { state, actions } = useAppState();
  const terminalRef = useRef<ImprovedTerminalRef>(null);
  const isOverlayHost = state.terminal.hostType !== 'sidebar';

  // Register terminal ref with AppState - simplified approach
  useEffect(() => {
    if (!isOverlayHost) {
      return;
    }

    // Directly pass the terminal ref to AppState
    actions.setTerminalRef(terminalRef);

    // Cleanup function to clear ref when component unmounts
    return () => {
      actions.setTerminalRef({ current: null });
    };
  }, [actions, isOverlayHost]); // Remove terminalRef from dependencies to prevent infinite re-renders

  // Handle command execution from GUI
  useEffect(() => {
    if (!isOverlayHost) {
      return;
    }

    const bridge = state.commandBridge;
    if (bridge.pendingExecution && bridge.lastExecutedCommand && terminalRef.current) {
      // Actually execute the command in the terminal
      terminalRef.current.executeCommand(bridge.lastExecutedCommand)
        .then(() => {
          actions.notify('success', `Command executed: ${bridge.lastExecutedCommand}`);
        })
        .catch((error) => {
          actions.notify('error', `Command failed: ${error.message}`);
        })
        .finally(() => {
          // Clear pending execution flag
          actions.clearPendingExecution();
        });
    }
  }, [state.commandBridge.pendingExecution, state.commandBridge.lastExecutedCommand, actions, isOverlayHost]);

  if (!isOverlayHost || !state.terminal.isVisible) {
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
            className="text-cortex-text-secondary hover:text-white transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="h-full">
          <ImprovedTerminal ref={terminalRef} />
        </div>
      </div>
    </div>
  );
}