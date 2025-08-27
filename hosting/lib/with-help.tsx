import React from 'react';
import { EnhancedCommandConfig, HelpContext } from './types';
import { renderCommandHelp } from './help-renderer';

/**
 * Higher-order function that wraps a command handler to intercept --help and -h flags
 * and render detailed help instead of executing the command.
 * 
 * This provides consistent --help behavior across all commands without modifying
 * each individual command handler.
 */
export function withHelp(
  command: EnhancedCommandConfig,
  helpContext?: HelpContext
) {
  return async (args: string[]): Promise<React.ReactNode> => {
    // Check for help flags
    if (args.includes('-h') || args.includes('--help')) {
      return renderCommandHelp(command, helpContext);
    }
    
    // Otherwise, execute the original command
    try {
      const result = await command.handler(args);
      return result;
    } catch (error) {
      // If the original handler fails, we can still show help as a fallback
      if (error instanceof Error && error.message.includes('usage') || 
          error instanceof Error && error.message.includes('help')) {
        return (
          <div className="text-red-400">
            <div className="font-bold mb-2">❌ Command Error</div>
            <div className="text-sm mb-4">{error.message}</div>
            <div className="text-sm text-gray-300">
              Use <span className="font-mono text-green-400">{command.name} --help</span> for detailed usage information.
            </div>
          </div>
        );
      }
      throw error; // Re-throw if it's not a usage-related error
    }
  };
}

/**
 * Batch wrapper that applies help interception to multiple commands
 */
export function withHelpBatch(
  commands: EnhancedCommandConfig[],
  helpContext?: HelpContext
): EnhancedCommandConfig[] {
  return commands.map(cmd => ({
    ...cmd,
    handler: withHelp(cmd, helpContext)
  }));
}

/**
 * Check if arguments contain help flags
 */
export function hasHelpFlag(args: string[]): boolean {
  return args.includes('-h') || args.includes('--help');
}

/**
 * Extract non-help arguments from an argument list
 */
export function stripHelpFlags(args: string[]): string[] {
  return args.filter(arg => arg !== '-h' && arg !== '--help');
}

/**
 * Smart help detection that also handles common help patterns
 */
export function shouldShowHelp(args: string[]): boolean {
  // Standard help flags
  if (hasHelpFlag(args)) return true;
  
  // Common help patterns
  const helpPatterns = [
    'help',
    '?',
    'usage'
  ];
  
  return args.some(arg => 
    helpPatterns.some(pattern => 
      arg.toLowerCase() === pattern
    )
  );
}

/**
 * Enhanced wrapper that handles multiple help patterns
 */
export function withAdvancedHelp(
  command: EnhancedCommandConfig,
  helpContext?: HelpContext
) {
  return async (args: string[]): Promise<React.ReactNode> => {
    // Check for any help patterns
    if (shouldShowHelp(args)) {
      return renderCommandHelp(command, helpContext);
    }
    
    // Special case: if no args provided and command expects some, show help
    if (args.length === 0 && command.help?.options?.some(opt => opt.required)) {
      return (
        <div className="text-yellow-400">
          <div className="font-bold mb-2">⚠️ Missing Required Arguments</div>
          <div className="text-sm text-gray-300 mb-4">
            This command requires arguments to function properly.
          </div>
          {renderCommandHelp(command, helpContext)}
        </div>
      );
    }
    
    return await command.handler(args);
  };
}
