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
  compact: 'w-96',
  standard: 'w-[32rem]',
  expanded: 'w-[48rem]'
};

const EnhancedTerminalSidebar: React.FC<TerminalSidebarProps> = ({
  className = '',
  defaultExpanded = false,
  onToggle
}) => {
  const { state, actions } = useAppState();
  const [sidebarSize, setSidebarSize] = useState<SidebarSize>(defaultExpanded ? 'standard' : 'minimized');
  const [lastActiveSize, setLastActiveSize] = useState<SidebarSize>('standard');
  const [isResizing, setIsResizing] = useState(false);
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [quickCommands] = useState([
    { name: 'POV Status', command: 'pov status --current', icon: '📊', color: 'text-cortex-primary' },
    { name: 'List Scenarios', command: 'scenario list', icon: '📋', color: 'text-status-info' },
    { name: 'Deploy Latest', command: 'scenario deploy --latest', icon: '🚀', color: 'text-status-warning' },
    { name: 'Generate Report', command: 'pov report --executive', icon: '📄', color: 'text-cortex-accent' }
  ]);
  
  const terminalRef = useRef<ImprovedTerminalRef>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Handle resizing functionality
  const clearInlineWidth = useCallback(() => {
    if (sidebarRef.current) {
      sidebarRef.current.style.removeProperty('width');
    }
  }, []);

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
      setCustomWidth(newWidth);
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

  useEffect(() => {
    actions.setTerminalHostType('sidebar');
    actions.setTerminalRef(terminalRef);

    return () => {
      actions.setTerminalRef({ current: null });
      actions.setTerminalHostType('overlay');
    };
  }, [actions]);

  useEffect(() => {
    if (sidebarSize !== 'minimized') {
      setLastActiveSize(sidebarSize);
    }
  }, [sidebarSize]);

  useEffect(() => {
    if (state.terminal.isVisible) {
      setSidebarSize((currentSize) => (currentSize === 'minimized' ? lastActiveSize : currentSize));
    } else {
      setSidebarSize('minimized');
    }
  }, [state.terminal.isVisible, lastActiveSize]);

  useEffect(() => {
    const bridge = state.commandBridge;
    if (!bridge.pendingExecution || !bridge.lastExecutedCommand || !terminalRef.current) {
      return;
    }

    const execute = async () => {
      try {
        actions.openTerminal();
        setSidebarSize((currentSize) => (currentSize === 'minimized' ? lastActiveSize : currentSize));
        await terminalRef.current?.executeCommand(bridge.lastExecutedCommand);
        actions.notify('success', `Command executed: ${bridge.lastExecutedCommand}`);
        setTimeout(() => {
          terminalRef.current?.focus();
        }, 50);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        actions.notify('error', `Command failed: ${err.message}`);
      } finally {
        actions.clearPendingExecution();
      }
    };

    execute();
  }, [state.commandBridge.pendingExecution, state.commandBridge.lastExecutedCommand, actions, lastActiveSize]);

  const toggleSidebar = () => {
    const newSize = sidebarSize === 'minimized' ? lastActiveSize : 'minimized';
    setSidebarSize(newSize);
    if (newSize === 'minimized') {
      clearInlineWidth();
    }
    onToggle?.(newSize !== 'minimized');
  };

  const setSizeMode = (size: SidebarSize) => {
    setSidebarSize(size);
    if (size === 'minimized') {
      clearInlineWidth();
    } else {
      setCustomWidth(null);
      clearInlineWidth();
    }
    onToggle?.(size !== 'minimized');
  };

  const executeQuickCommand = async (command: string) => {
    if (sidebarSize === 'minimized') {
      setSidebarSize('standard');
      onToggle?.(true);
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

  useEffect(() => {
    if (!sidebarRef.current) {
      return;
    }

    if (!isVisible) {
      clearInlineWidth();
      return;
    }

    if (customWidth === null) {
      clearInlineWidth();
      return;
    }

    sidebarRef.current.style.width = `${customWidth}px`;
  }, [customWidth, isVisible, clearInlineWidth]);

  return (
    <div
      ref={sidebarRef}
      className={cn(
        'fixed right-0 top-0 h-full bg-gradient-to-b from-cortex-bg-secondary via-cortex-bg-tertiary to-cortex-bg-secondary border-l border-cortex-border/60 shadow-cortex-xl transition-all duration-300 ease-in-out z-40 backdrop-blur-xl',
        SIDEBAR_WIDTHS[sidebarSize],
        'flex flex-col',
        className
      )}
    >
      {/* Resize Handle */}
      {sidebarSize !== 'minimized' && (
        <div
          ref={resizeHandleRef}
          className="absolute left-0 top-0 w-1 h-full cursor-col-resize bg-cortex-border-muted hover:bg-cortex-primary transition-colors opacity-0 hover:opacity-100"
          onMouseDown={startResize}
        />
      )}

      {/* Header Bar */}
      <div
        className={cn(
          'p-3 border-b border-cortex-border/50 bg-cortex-bg-tertiary/60',
          sidebarSize === 'minimized'
            ? 'flex flex-col items-center justify-center space-y-2'
            : 'flex items-center justify-between'
        )}
      >
        {sidebarSize === 'minimized' ? (
          <>
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 flex items-center justify-center text-cortex-text-secondary hover:text-cortex-primary transition-colors rounded-md hover:bg-cortex-bg-hover/80"
              title="Open Terminal"
              aria-label="Expand terminal sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
              </svg>
            </button>
            <button
              onClick={() => {
                clearInlineWidth();
                actions.closeTerminal();
                onToggle?.(false);
              }}
              className="w-8 h-8 flex items-center justify-center text-cortex-text-secondary hover:text-status-error transition-colors rounded-md hover:bg-cortex-bg-hover/80"
              title="Close Terminal"
              aria-label="Close terminal sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-status-error rounded-full"></div>
                <div className="w-2 h-2 bg-status-warning rounded-full"></div>
                <div className="w-2 h-2 bg-status-success rounded-full"></div>
              </div>
              <span className="text-sm font-medium text-cortex-text-secondary">Terminal</span>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Size Controls */}
              <div className="flex items-center space-x-1 mr-2">
                <button
                  onClick={() => setSizeMode('compact')}
                  className={cn(
                    'w-5 h-5 flex items-center justify-center rounded text-xs transition-colors',
                    sidebarSize === 'compact' ? 'bg-cortex-primary text-cortex-dark' : 'text-cortex-text-secondary hover:text-cortex-primary hover:bg-cortex-bg-hover/80'
                  )}
                  title="Compact view"
                >
                  S
                </button>
                <button
                  onClick={() => setSizeMode('standard')}
                  className={cn(
                    'w-5 h-5 flex items-center justify-center rounded text-xs transition-colors',
                    sidebarSize === 'standard' ? 'bg-cortex-primary text-cortex-dark' : 'text-cortex-text-secondary hover:text-cortex-primary hover:bg-cortex-bg-hover/80'
                  )}
                  title="Standard view"
                >
                  M
                </button>
                <button
                  onClick={() => setSizeMode('expanded')}
                  className={cn(
                    'w-5 h-5 flex items-center justify-center rounded text-xs transition-colors',
                    sidebarSize === 'expanded' ? 'bg-cortex-primary text-cortex-dark' : 'text-cortex-text-secondary hover:text-cortex-primary hover:bg-cortex-bg-hover/80'
                  )}
                  title="Expanded view"
                >
                  L
                </button>
              </div>
              
              {/* Minimize Button */}
              <button
                onClick={toggleSidebar}
                className="w-7 h-7 flex items-center justify-center text-cortex-text-secondary hover:text-status-warning transition-colors rounded-md hover:bg-cortex-bg-hover/80"
                title="Minimize Terminal"
                aria-label="Minimize terminal sidebar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setSidebarSize('minimized');
                  clearInlineWidth();
                  actions.closeTerminal();
                }}
                className="w-7 h-7 flex items-center justify-center text-cortex-text-secondary hover:text-status-error transition-colors rounded-md hover:bg-cortex-bg-hover/80"
                title="Close Terminal"
                aria-label="Close terminal sidebar"
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
        <div className="flex-shrink-0 p-3 border-b border-cortex-border/40 bg-cortex-bg-tertiary/40">
          <div className="text-xs text-cortex-text-secondary mb-2 font-medium">Quick Commands</div>
          <div className="grid grid-cols-2 gap-2">
            {quickCommands.map((cmd, index) => (
              <button
                key={index}
                onClick={() => executeQuickCommand(cmd.command)}
                className={cn(
                  'flex items-center space-x-2 p-2 rounded-lg border border-cortex-border/60 hover:border-cortex-border transition-all duration-200 hover:shadow-cortex-sm text-left',
                  'bg-cortex-bg-tertiary/60 hover:bg-cortex-bg-hover/50'
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
            <div className="h-full rounded-lg border border-cortex-border/60 bg-cortex-bg-secondary/60 overflow-hidden">
              <ImprovedTerminal ref={terminalRef} />
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      {isVisible && (
        <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-t border-cortex-border/40 bg-cortex-bg-tertiary/40 text-xs text-cortex-text-secondary">
          <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-status-success rounded-full animate-pulse"></div>
              <span>Online</span>
            </div>
            {state.data.currentPovId && (
              <div className="flex items-center space-x-1">
                <span className="text-cortex-primary">POV:</span>
                <span className="font-mono">{state.data.currentPovId}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className="text-cortex-text-secondary hover:text-status-info transition-colors"
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