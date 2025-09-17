'use client';

import React from 'react';
import { useAppState } from '../contexts/AppStateContext';
import CortexButton from './CortexButton';

interface CortexCommandButtonProps {
  command: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'info' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  tooltip?: string;
  className?: string;
  loadingKey?: string; // Key to check for loading state
  onExecute?: () => void; // Additional callback after command execution
  children: React.ReactNode;
}

const CortexCommandButton: React.FC<CortexCommandButtonProps> = ({
  command,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  tooltip,
  className = '',
  loadingKey = 'command_execution',
  onExecute,
  children
}) => {
  const { state, actions } = useAppState();
  
  const isLoading = state.ui.loadingStates[loadingKey] || false;
  
  const handleClick = async () => {
    // Execute command through app state
    actions.executeCommandFromGUI(command);
    actions.setLoading(loadingKey, true);
    
    try {
      // Simulate command execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success notification
      actions.notify('success', `Command "${command}" executed successfully`);
      
      // Execute additional callback if provided
      if (onExecute) {
        onExecute();
      }
    } catch (error) {
      // Show error notification
      actions.notify('error', `Command "${command}" failed: ${error}`);
    } finally {
      actions.setLoading(loadingKey, false);
    }
  };
  
  return (
    <CortexButton
      variant={variant}
      size={size}
      disabled={isLoading}
      loading={isLoading}
      icon={icon}
      iconPosition={iconPosition}
      onClick={handleClick}
      ariaLabel={`Execute command: ${command}`}
      tooltip={tooltip || `Execute: ${command}`}
      className={className}
    >
      {children}
    </CortexButton>
  );
};

export default CortexCommandButton;