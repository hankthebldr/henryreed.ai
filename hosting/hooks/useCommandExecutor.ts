import { useState, useCallback } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import userActivityService from '../lib/user-activity-service';

interface CommandExecutorOptions {
  openTerminal?: boolean;
  focus?: boolean;
  trackActivity?: {
    event: string;
    source: string;
    payload?: any;
  };
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for executing terminal commands from GUI components
 * 
 * This hook provides a unified interface between GUI components and the terminal system,
 * ensuring consistent command execution, loading states, error handling, and telemetry.
 * 
 * Key Features:
 * - Single point of command execution for all GUI components
 * - Automatic loading state management with isRunning flag
 * - Built-in error handling with user-friendly notifications
 * - Integrated telemetry tracking via userActivityService
 * - Terminal focus management and UX polish
 * - Success notifications with "View in Terminal" links
 * 
 * Usage Example:
 * ```typescript
 * const { run: executeCommand, isRunning } = useCommandExecutor();
 * 
 * const handleDeploy = () => {
 *   executeCommand('scenario generate --type ransomware', {
 *     trackActivity: {
 *       event: 'scenario-deploy-click',
 *       source: 'unified-creator',
 *       payload: { scenarioType: 'ransomware', provider: 'aws' }
 *     }
 *   });
 * };
 * ```
 * 
 * @returns Object with run function, loading state, and error handling
 */
export function useCommandExecutor() {
  const { actions } = useAppState();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(async (
    command: string, 
    options: CommandExecutorOptions = {}
  ) => {
    const {
      openTerminal = true,
      focus = true,
      trackActivity,
      onStart,
      onSuccess,
      onError
    } = options;

    if (isRunning) return;

    try {
      setIsRunning(true);
      setError(null);
      
      // Optional callback when command starts (e.g., for additional loading states)
      if (onStart) onStart();

      // Track telemetry for GUI-initiated commands
      // This provides analytics on user behavior and feature usage
      if (trackActivity) {
        userActivityService.trackActivity(
          trackActivity.event,      // Standardized event name (e.g., 'scenario-deploy-click')
          trackActivity.source,     // Component source (e.g., 'unified-creator')
          {
            command,                // The actual command executed
            timestamp: new Date().toISOString(),
            ...trackActivity.payload // Additional context (scenario, provider, etc.)
          }
        );
      }

      // Execute command through the unified terminal system
      // This ensures all GUI commands appear in the same terminal instance
      await actions.executeCommandFromGUI(command, { 
        open: openTerminal,   // Whether to open/show the terminal panel
        focus,               // Whether to focus the terminal input after execution
      });

      // Show success notification with enhanced UX
      // NotificationSystem will add "View in Terminal" link for success messages
      const successMessage = `Command "${command}" executed successfully`;
      actions.notify('success', successMessage);
      
      // Optional success callback for component-specific logic
      if (onSuccess) onSuccess();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // Log error for debugging
      console.error('Command execution error:', error);
      
      // Show error notification
      actions.notify('error', `Command failed: ${error.message}`);
      
      // Optional error callback
      if (onError) onError(error);
    } finally {
      setIsRunning(false);
    }
  }, [actions, isRunning]);

  return {
    run,
    isRunning,
    error,
    clearError: () => setError(null)
  };
}

export default useCommandExecutor;