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
  initialPosition,
  initialSize = { width: 800, height: 600 }
}: CleanTerminalPopoutProps) {
  // Calculate centered position if not provided
  const getInitialPosition = () => {
    if (initialPosition) return initialPosition;

    if (typeof window === 'undefined') {
      return { x: 50, y: 50 };
    }

    const centerX = (window.innerWidth - initialSize.width) / 2;
    const centerY = (window.innerHeight - initialSize.height) / 2;
    
    return {
      x: Math.max(50, centerX),
      y: Math.max(50, centerY)
    };
  };
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState(() => getInitialPosition());
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
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

  // Constrain position to viewport bounds
  const constrainToViewport = (pos: { x: number; y: number }, size: { width: number; height: number }) => {
    const padding = 20;
    const maxX = window.innerWidth - size.width - padding;
    const maxY = window.innerHeight - size.height - padding;
    
    return {
      x: Math.max(padding, Math.min(maxX, pos.x)),
      y: Math.max(padding, Math.min(maxY, pos.y))
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isMaximized) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      
      // Constrain to viewport bounds
      const constrainedPosition = constrainToViewport(newPosition, size);
      setPosition(constrainedPosition);
    }
    
    if (isResizing && !isMaximized) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(400, resizeStart.width + deltaX);
      const newHeight = Math.max(300, resizeStart.height + deltaY);
      
      // Ensure the new size doesn't exceed viewport bounds
      const maxWidth = window.innerWidth - position.x - 20;
      const maxHeight = window.innerHeight - position.y - 20;
      
      setSize({
        width: Math.min(newWidth, maxWidth),
        height: Math.min(newHeight, maxHeight)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
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

  // Handle window resize to ensure terminal stays in bounds
  useEffect(() => {
    const handleWindowResize = () => {
      if (!isMaximized) {
        const constrainedPosition = constrainToViewport(position, size);
        if (constrainedPosition.x !== position.x || constrainedPosition.y !== position.y) {
          setPosition(constrainedPosition);
        }
        
        // Also constrain size if it exceeds new viewport
        const maxWidth = window.innerWidth - position.x - 20;
        const maxHeight = window.innerHeight - position.y - 20;
        
        if (size.width > maxWidth || size.height > maxHeight) {
          setSize({
            width: Math.min(size.width, maxWidth),
            height: Math.min(size.height, maxHeight)
          });
        }
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [position, size, isMaximized]);

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

  // Mouse event listeners for dragging and resizing
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDragging ? 'move' : (isResizing ? 'se-resize' : 'default');
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, size, position]);

  if (!isOpen) return null;

  // Add backdrop blur overlay when terminal is open
  const backdropElement = (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
      onClick={handleClose}
      style={{ zIndex: 49 }}
    />
  );

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
            className="text-cortex-text-secondary hover:text-red-400 transition-colors"
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
    <>
      {/* Backdrop */}
      {backdropElement}
      
      {/* Terminal Window */}
      <div
        ref={containerRef}
        style={containerStyle}
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out transform animate-scale-in"
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
            setResizeStart({
              x: e.clientX,
              y: e.clientY,
              width: size.width,
              height: size.height
            });
          }}
        >
          <div className="w-full h-full bg-gray-600 rounded-tl-lg" />
        </div>
      )}
      </div>
    </>
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