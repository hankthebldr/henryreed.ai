'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Maximize2, Minimize2, Terminal } from 'lucide-react';

interface CleanTerminalPopoutProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  title?: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

export function CleanTerminalPopout({
  isOpen,
  onClose,
  onMinimize,
  title = 'Terminal',
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 800, height: 600 }
}: CleanTerminalPopoutProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === headerRef.current || headerRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isMaximized) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle window controls
  const handleMinimize = () => {
    setIsMinimized(true);
    onMinimize?.();
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    onClose();
  };

  // Restore from minimized state
  const handleRestore = () => {
    setIsMinimized(false);
  };

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  // Minimized state - show only a small bar
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-4 left-4 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl cursor-pointer hover:shadow-blue-500/10 transition-shadow"
        onClick={handleRestore}
      >
        <div className="flex items-center space-x-2 px-3 py-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-white font-medium">{title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const containerStyle = isMaximized
    ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 50
      }
    : {
        position: 'fixed' as const,
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: 50
      };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div
        ref={headerRef}
        className={`flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 select-none ${
          !isMaximized ? 'cursor-move' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-white font-medium">{title}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Minimize button */}
          <button
            onClick={handleMinimize}
            className="w-6 h-6 rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 flex items-center justify-center transition-colors group"
            title="Minimize"
          >
            <Minus className="w-3 h-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          {/* Maximize/Restore button */}
          <button
            onClick={handleMaximize}
            className="w-6 h-6 rounded-full bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center transition-colors group"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? (
              <Minimize2 className="w-3 h-3 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            ) : (
              <Maximize2 className="w-3 h-3 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors group"
            title="Close"
          >
            <X className="w-3 h-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-black/95">
        {children}
      </div>

      {/* Resize handle */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        >
          <div className="w-full h-full bg-gray-600 rounded-tl-lg" />
        </div>
      )}
    </div>
  );
}

// Hook for managing terminal popout state
export function useTerminalPopout(initialOpen: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);

  const open = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const close = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const minimize = () => {
    setIsMinimized(true);
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  return {
    isOpen,
    isMinimized,
    open,
    close,
    minimize,
    toggle
  };
}