'use client';

import React, { useState, useEffect } from 'react';

interface InterfaceToggleProps {
  onModeChange: (mode: 'terminal' | 'gui') => void;
  currentMode: 'terminal' | 'gui';
}

export default function InterfaceToggle({ onModeChange, currentMode }: InterfaceToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = (mode: 'terminal' | 'gui') => {
    if (mode === currentMode || isAnimating) return;
    
    setIsAnimating(true);
    onModeChange(mode);
    
    // Reset animation state after transition
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="flex items-center space-x-3 bg-gray-800/50 rounded-lg p-1 border border-gray-600">
      <div className="text-sm text-gray-400 font-mono">Interface:</div>
      
      {/* Terminal Mode Button */}
      <button
        onClick={() => handleToggle('terminal')}
        disabled={isAnimating}
        className={`
          relative px-4 py-2 rounded-md text-xs font-mono transition-all duration-300 ease-in-out
          flex items-center space-x-2 min-w-[100px] justify-center
          ${currentMode === 'terminal' 
            ? 'bg-green-600 text-white shadow-lg transform scale-105' 
            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
          }
          ${isAnimating ? 'pointer-events-none' : ''}
        `}
      >
        <span className="text-sm">💻</span>
        <span>Terminal</span>
        {currentMode === 'terminal' && (
          <div className="absolute inset-0 bg-green-400/20 rounded-md animate-pulse"></div>
        )}
      </button>

      {/* GUI Mode Button */}
      <button
        onClick={() => handleToggle('gui')}
        disabled={isAnimating}
        className={`
          relative px-4 py-2 rounded-md text-xs font-mono transition-all duration-300 ease-in-out
          flex items-center space-x-2 min-w-[100px] justify-center
          ${currentMode === 'gui' 
            ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
          }
          ${isAnimating ? 'pointer-events-none' : ''}
        `}
      >
        <span className="text-sm">🎨</span>
        <span>GUI</span>
        {currentMode === 'gui' && (
          <div className="absolute inset-0 bg-blue-400/20 rounded-md animate-pulse"></div>
        )}
      </button>
    </div>
  );
}
