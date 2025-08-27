import React from 'react';

interface TerminalOutputProps {
  children: React.ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info' | 'default';
}

export function TerminalOutput({ children, type = 'default' }: TerminalOutputProps) {
  const baseClasses = "p-4 rounded-lg border font-mono text-sm leading-relaxed";
  const typeClasses = {
    success: "bg-green-900/20 border-green-500/30 text-green-200",
    error: "bg-red-900/20 border-red-500/30 text-red-200", 
    warning: "bg-yellow-900/20 border-yellow-500/30 text-yellow-200",
    info: "bg-blue-900/20 border-blue-500/30 text-blue-200",
    default: "bg-gray-900/40 border-gray-600/30 text-gray-200"
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      {children}
    </div>
  );
}
