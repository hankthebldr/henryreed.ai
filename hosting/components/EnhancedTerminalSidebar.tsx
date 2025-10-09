'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import ImprovedTerminal, { ImprovedTerminalRef } from './ImprovedTerminal';
import { cn } from '../lib/utils';

interface TerminalSidebarProps {
  className?: string;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

type SidebarSize = 'minimized' | 'compact' | 'standard' | 'expanded';

const SIDEBAR_WIDTHS = {
  minimized: 'w-12',
  compact: 'w-80',
  standard: 'w-96', 
  expanded: 'w-1/2'
};

const EnhancedTerminalSidebar: React.FC<TerminalSidebarProps> = ({
  className = '',
  defaultExpanded = false,
  onToggle
}) => {
  const { state, actions } = useAppState();
  const [sidebarSize, setSidebarSize] = useState<SidebarSize>(defaultExpanded ? 'standard' : 'minimized');
  const [isResizing, setIsResizing] = useState(false);
  const [quickCommands] = useState([
    { name: 'POV Status', command: 'pov status --current', icon: '📊', color: 'text-cortex-green' },
    { name: 'List Scenarios', command: 'scenario list', icon: '📋', color: 'text-cortex-info' },
    { name: 'Deploy Latest', command: 'scenario deploy --latest', icon: '🚀', color: 'text-cortex-warning' },
    { name: 'Generate Report', command: 'pov report --executive', icon: '📄', color: 'text-cortex-text-accent' }
  ]);
  
  const terminalRef = useRef<ImprovedTerminalRef>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Handle resizing functionality
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing || !sidebarRef.current) return;
    
    const newWidth = window.innerWidth - e.clientX;
    const minWidth = 200;
    const maxWidth = window.innerWidth * 0.6;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      sidebarRef.current.style.width = `${newWidth}px`;
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);
      return () => {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
      };
    }
  }, [isResizing, resize, stopResize]);

  const toggleSidebar = () => {
    const newSize = sidebarSize === 'minimized' ? 'standard' : 'minimized';
    setSidebarSize(newSize);
    onToggle?.(newSize !== 'minimized');
  };

  const setSizeMode = (size: SidebarSize) => {
    setSidebarSize(size);
    onToggle?.(size !== 'minimized');
  };

  const executeQuickCommand = async (command: string) => {
    if (sidebarSize === 'minimized') {
      setSidebarSize('standard');
    }
    
    // Focus terminal and execute command
    if (terminalRef.current) {
      await terminalRef.current.executeCommand(command);
      terminalRef.current.focus();
    }
    
    // Track activity
    actions.executeCommandFromGUI(command);
  };

  const isVisible = sidebarSize !== 'minimized';

  return (
    <div
      ref={sidebarRef}
      className={cn(
        'fixed right-0 top-0 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-l border-gray-700 shadow-2xl transition-all duration-300 ease-in-out z-40',
        SIDEBAR_WIDTHS[sidebarSize],
        'flex flex-col',
        className
      )}
    >
      {/* Resize Handle */}
      {sidebarSize !== 'minimized' && (
        <div
          ref={resizeHandleRef}
          className="absolute left-0 top-0 w-1 h-full cursor-col-resize bg-gray-600 hover:bg-cortex-green transition-colors opacity-0 hover:opacity-100"
          onMouseDown={startResize}
        />
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800/50">
        {sidebarSize === 'minimized' ? (
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center text-cortex-text-secondary hover:text-cortex-green transition-colors rounded-md hover:bg-gray-700"
            title="Open Terminal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
            </svg>
          </button>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <span className="text-sm font-medium text-gray-300">Terminal</span>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Size Controls */}
              <div className="flex items-center space-x-1 mr-2">
                <button
                  onClick={() => setSizeMode('compact')}
                  className={cn(
                    'w-5 h-5 flex items-center justify-center rounded text-xs transition-colors',
                    sidebarSize === 'compact' ? 'bg-cortex-green text-gray-900' : 'text-cortex-text-secondary hover:text-cortex-green hover:bg-gray-700'
                  )}
                  title="Compact view"
                >
                  S
                </button>
                <button
                  onClick={() => setSizeMode('standard')}
                  className={cn(
                    'w-5 h-5 flex items-center justify-center rounded text-xs transition-colors',
                    sidebarSize === 'standard' ? 'bg-cortex-green text-gray-900' : 'text-cortex-text-secondary hover:text-cortex-green hover:bg-gray-700'
                  )}
                  title="Standard view"
                >
                  M
                </button>
                <button
                  onClick={() => setSizeMode('expanded')}
                  className={cn(
                    'w-5 h-5 flex items-center justify-center rounded text-xs transition-colors',
                    sidebarSize === 'expanded' ? 'bg-cortex-green text-gray-900' : 'text-cortex-text-secondary hover:text-cortex-green hover:bg-gray-700'
                  )}
                  title="Expanded view"
                >
                  L
                </button>
              </div>
              
              {/* Minimize Button */}
              <button
                onClick={toggleSidebar}
                className="w-7 h-7 flex items-center justify-center text-cortex-text-secondary hover:text-cortex-warning transition-colors rounded-md hover:bg-gray-700"
                title="Minimize Terminal"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setSidebarSize('minimized');
                  actions.closeTerminal();
                }}
                className="w-7 h-7 flex items-center justify-center text-cortex-text-secondary hover:text-red-400 transition-colors rounded-md hover:bg-gray-700"
                title="Close Terminal"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Quick Commands Bar */}
      {isVisible && (
        <div className="flex-shrink-0 p-3 border-b border-gray-700 bg-gray-800/30">
          <div className="text-xs text-cortex-text-secondary mb-2 font-medium">Quick Commands</div>
          <div className="grid grid-cols-2 gap-2">
            {quickCommands.map((cmd, index) => (
              <button
                key={index}
                onClick={() => executeQuickCommand(cmd.command)}
                className={cn(
                  'flex items-center space-x-2 p-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-200 hover:shadow-md text-left',
                  'bg-gray-800/50 hover:bg-gray-700/50'
                )}
                title={cmd.command}
              >
                <span className="text-sm">{cmd.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={cn('text-xs font-medium truncate', cmd.color)}>
                    {cmd.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Terminal Content */}
      {isVisible && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full p-2">
            <div className="h-full rounded-lg border border-gray-600 bg-gray-900/50 overflow-hidden">
              <ImprovedTerminal ref={terminalRef} />
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      {isVisible && (
        <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-t border-gray-700 bg-gray-800/50 text-xs text-cortex-text-secondary">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span>Online</span>
            </div>
            {state.data.currentPovId && (
              <div className="flex items-center space-x-1">
                <span className="text-cortex-green">POV:</span>
                <span className="font-mono">{state.data.currentPovId}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className="text-cortex-text-secondary hover:text-cortex-info transition-colors"
              title="Terminal Help"
              onClick={() => executeQuickCommand('help')}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTerminalSidebar;