import React from 'react';
import { TerminalOutput } from './TerminalOutput';

// Common standardized terminal output components for consistent formatting

// Empty/Silent output for successful commands that don't need output
export const SilentSuccess = () => null;

// Simple text output
export const TextOutput = ({ children }: { children: React.ReactNode }) => (
  <TerminalOutput type="default">
    {children}
  </TerminalOutput>
);

// Pre-formatted text (preserves whitespace)
export const PreformattedOutput = ({ children }: { children: React.ReactNode }) => (
  <TerminalOutput type="default">
    <pre className="whitespace-pre-wrap break-words font-mono">{children}</pre>
  </TerminalOutput>
);

// Standard error message
export const ErrorOutput = ({ 
  command, 
  message, 
  icon = "❌" 
}: { 
  command?: string; 
  message: string; 
  icon?: string; 
}) => (
  <TerminalOutput type="error">
    <div className="flex items-center">
      <div className="mr-3 text-xl">{icon}</div>
      <div>
        <div className="font-bold">{command ? `${command}: ${message}` : message}</div>
      </div>
    </div>
  </TerminalOutput>
);

// Success message with icon
export const SuccessOutput = ({ 
  message, 
  details, 
  icon = "✅" 
}: { 
  message: string; 
  details?: string; 
  icon?: string; 
}) => (
  <TerminalOutput type="success">
    <div className="flex items-center">
      <div className="mr-3 text-xl">{icon}</div>
      <div>
        <div className="font-bold">{message}</div>
        {details && <div className="text-sm text-gray-300 mt-1">{details}</div>}
      </div>
    </div>
  </TerminalOutput>
);

// Info message with icon
export const InfoOutput = ({ 
  title, 
  children, 
  icon = "ℹ️" 
}: { 
  title?: string; 
  children: React.ReactNode; 
  icon?: string; 
}) => (
  <TerminalOutput type="info">
    <div className="space-y-2">
      {title && (
        <div className="flex items-center">
          <div className="mr-3 text-xl">{icon}</div>
          <div className="font-bold text-lg">{title}</div>
        </div>
      )}
      <div className={title ? 'ml-10' : ''}>{children}</div>
    </div>
  </TerminalOutput>
);

// Warning message
export const WarningOutput = ({ 
  message, 
  details, 
  icon = "⚠️" 
}: { 
  message: string; 
  details?: string; 
  icon?: string; 
}) => (
  <TerminalOutput type="warning">
    <div className="flex items-center">
      <div className="mr-3 text-xl">{icon}</div>
      <div>
        <div className="font-bold">{message}</div>
        {details && <div className="text-sm text-gray-300 mt-1">{details}</div>}
      </div>
    </div>
  </TerminalOutput>
);

// Loading indicator
export const LoadingOutput = ({ 
  message = "Processing command..." 
}: { 
  message?: string; 
}) => (
  <TerminalOutput type="info">
    <div className="flex items-center">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-3"></div>
      <span>{message}</span>
    </div>
  </TerminalOutput>
);

// Command help section
export const HelpSection = ({ 
  title, 
  commands, 
  color = "blue-300" 
}: { 
  title: string; 
  commands: Array<{ name: string; description: string; aliases?: string[] }>; 
  color?: string; 
}) => (
  <div className="space-y-3">
    <div className={`font-bold text-lg text-${color}`}>{title}</div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {commands.map(cmd => (
        <div key={cmd.name} className="border border-gray-600 p-3 rounded bg-gray-800/50">
          <div className="text-green-400 font-bold">{cmd.name}</div>
          <div className="text-sm text-gray-300 mt-1">{cmd.description}</div>
          {cmd.aliases && (
            <div className="text-xs text-cortex-text-muted mt-1">
              Aliases: {cmd.aliases.join(', ')}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// File/directory listing
export const ListingOutput = ({ 
  items, 
  longFormat = false 
}: { 
  items: Array<{ 
    name: string; 
    type: 'file' | 'dir'; 
    size?: number; 
    permissions?: string; 
  }>; 
  longFormat?: boolean; 
}) => {
  if (items.length === 0) {
    return <TerminalOutput type="default"> </TerminalOutput>;
  }

  if (longFormat) {
    return (
      <TerminalOutput type="default">
        <div className="font-mono text-sm">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div className="flex space-x-2">
                <span className="text-cortex-text-secondary">{item.permissions || (item.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--')}</span>
                <span className="w-12 text-right text-cortex-text-secondary">{item.size || 0}</span>
                <span className={item.type === 'dir' ? 'text-blue-400 font-bold' : 'text-gray-200'}>
                  {item.name}{item.type === 'dir' ? '/' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </TerminalOutput>
    );
  }

  return (
    <TerminalOutput type="default">
      <div className="font-mono text-sm">
        <div className="grid grid-cols-4 gap-2">
          {items.map((item, idx) => (
            <span 
              key={idx}
              className={item.type === 'dir' ? 'text-blue-400 font-bold' : 'text-gray-200'}
            >
              {item.name}{item.type === 'dir' ? '/' : ''}
            </span>
          ))}
        </div>
      </div>
    </TerminalOutput>
  );
};

// Action status display (deployment, progress, etc.)
export const StatusDisplay = ({ 
  title, 
  steps, 
  additionalInfo 
}: { 
  title: string; 
  steps: Array<{ status: 'complete' | 'current' | 'pending'; text: string }>; 
  additionalInfo?: string; 
}) => (
  <div className="space-y-4">
    <div className="font-bold text-lg text-green-300">{title}</div>
    
    <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
      <div className="text-green-400 font-bold mb-3">Progress:</div>
      <div className="text-sm space-y-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center">
            {step.status === 'complete' && <span className="text-green-400 mr-2">✓</span>}
            {step.status === 'current' && <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400 mr-2"></span>}
            {step.status === 'pending' && <span className="text-cortex-text-secondary mr-2">○</span>}
            <span>{step.text}</span>
          </div>
        ))}
      </div>
    </div>
    
    {additionalInfo && (
      <div className="text-sm text-gray-300">{additionalInfo}</div>
    )}
  </div>
);

// Metric/stat display
export const MetricsDisplay = ({ 
  title, 
  metrics, 
  bgColor = "gray-800/50" 
}: { 
  title: string; 
  metrics: Array<{ label: string; value: string; color?: string }>; 
  bgColor?: string; 
}) => (
  <div className={`bg-${bgColor} p-4 rounded border border-gray-600`}>
    <div className="text-green-400 font-bold mb-3">{title}</div>
    <div className="space-y-2">
      {metrics.map((metric, idx) => (
        <div key={idx} className="flex justify-between">
          <span className="text-gray-300">{metric.label}:</span>
          <span className={metric.color ? `text-${metric.color}` : 'text-white'}>{metric.value}</span>
        </div>
      ))}
    </div>
  </div>
);

// Pro tip or help box
export const TipBox = ({ 
  title = "💡 Pro Tips", 
  tips, 
  bgColor = "blue-900/20", 
  borderColor = "blue-500/30" 
}: { 
  title?: string; 
  tips: string[]; 
  bgColor?: string; 
  borderColor?: string; 
}) => (
  <div className={`bg-${bgColor} p-4 rounded border border-${borderColor}`}>
    <div className="text-blue-400 font-bold mb-3">{title}</div>
    <div className="text-sm space-y-2">
      {tips.map((tip, idx) => (
        <div key={idx}>• {tip}</div>
      ))}
    </div>
  </div>
);
