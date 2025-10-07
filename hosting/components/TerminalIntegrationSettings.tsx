'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '../contexts/AppStateContext';

export interface CloudEnvironmentConfig {
  provider: 'aws' | 'gcp' | 'azure';
  connectionType: 'ssh' | 'api' | 'websocket';
  credentials: {
    accessKey?: string;
    secretKey?: string;
    region?: string;
    projectId?: string;
    subscriptionId?: string;
    keyFilePath?: string;
  };
  endpoints: {
    terminalProxy: string;
    commandExecutor: string;
    fileSystem: string;
  };
  enabled: boolean;
}

interface IntegrationSettings {
  contentHubIntegration: boolean;
  detectionEngineIntegration: boolean;
  cloudExecution: boolean;
  realTimeUpdates: boolean;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export const TerminalIntegrationSettings: React.FC = () => {
  const { state, actions } = useAppState();
  const [cloudConfig, setCloudConfig] = useState<CloudEnvironmentConfig>({
    provider: 'aws',
    connectionType: 'websocket',
    credentials: {
      region: 'us-east-1'
    },
    endpoints: {
      terminalProxy: '',
      commandExecutor: '',
      fileSystem: ''
    },
    enabled: false
  });
  
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    contentHubIntegration: true,
    detectionEngineIntegration: true,
    cloudExecution: false,
    realTimeUpdates: true
  });
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [testResults, setTestResults] = useState<string>('');
  const [showCredentials, setShowCredentials] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('terminal_cloud_config');
    const savedSettings = localStorage.getItem('terminal_integration_settings');
    
    if (savedConfig) {
      try {
        setCloudConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to load cloud config:', error);
      }
    }
    
    if (savedSettings) {
      try {
        setIntegrationSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load integration settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('terminal_cloud_config', JSON.stringify(cloudConfig));
  }, [cloudConfig]);

  useEffect(() => {
    localStorage.setItem('terminal_integration_settings', JSON.stringify(integrationSettings));
  }, [integrationSettings]);

  const handleProviderChange = (provider: 'aws' | 'gcp' | 'azure') => {
    setCloudConfig(prev => ({
      ...prev,
      provider,
      credentials: {
        // Reset credentials when provider changes
        ...(provider === 'aws' && { region: 'us-east-1' }),
        ...(provider === 'gcp' && { projectId: '' }),
        ...(provider === 'azure' && { subscriptionId: '' })
      }
    }));
  };

  const handleCredentialChange = (field: string, value: string) => {
    setCloudConfig(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [field]: value
      }
    }));
  };

  const handleEndpointChange = (field: string, value: string) => {
    setCloudConfig(prev => ({
      ...prev,
      endpoints: {
        ...prev.endpoints,
        [field]: value
      }
    }));
  };

  const handleIntegrationToggle = (setting: keyof IntegrationSettings, value: boolean) => {
    setIntegrationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const testConnection = async () => {
    setConnectionStatus('connecting');
    setTestResults('Testing connection...');
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock connection test logic
      const isValid = cloudConfig.credentials.accessKey && 
                     cloudConfig.endpoints.terminalProxy;
      
      if (isValid) {
        setConnectionStatus('connected');
        setTestResults(`✅ Successfully connected to ${cloudConfig.provider.toUpperCase()}\n` +
                      `📡 Terminal proxy: ${cloudConfig.endpoints.terminalProxy}\n` +
                      `🔧 Command executor: Ready\n` +
                      `📁 File system: Accessible`);
        actions.notify('success', 'Cloud environment connected successfully');
      } else {
        throw new Error('Invalid credentials or missing endpoints');
      }
    } catch (error) {
      setConnectionStatus('error');
      setTestResults(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
                    `Please check your credentials and endpoints.`);
      actions.notify('error', 'Failed to connect to cloud environment');
    }
  };

  const saveSettings = () => {
    // Update app state with terminal integration settings
    actions.updateTerminalSettings({
      cloudConfig,
      integrationSettings,
      connectionStatus: connectionStatus === 'connected'
    });
    
    actions.notify('success', 'Terminal integration settings saved');
  };

  const resetSettings = () => {
    setCloudConfig({
      provider: 'aws',
      connectionType: 'websocket',
      credentials: { region: 'us-east-1' },
      endpoints: { terminalProxy: '', commandExecutor: '', fileSystem: '' },
      enabled: false
    });
    
    setIntegrationSettings({
      contentHubIntegration: true,
      detectionEngineIntegration: true,
      cloudExecution: false,
      realTimeUpdates: true
    });
    
    setConnectionStatus('disconnected');
    setTestResults('');
    
    actions.notify('info', 'Settings reset to defaults');
  };

  return (
    <div className="terminal-integration-settings bg-gray-950 text-white p-6 rounded-lg border border-gray-700 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-orange-400 mb-2">⚡ Terminal Integration Settings</h2>
        <p className="text-gray-400">Configure real-time terminal integration with cloud environments</p>
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg">
        <p className="text-sm text-gray-300 mb-4">
          🔧 Terminal integration is currently in development. This UI allows you to configure 
          cloud environment connections for future real-time terminal execution.
        </p>
        
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🚀</div>
          <div className="text-xl text-white mb-2">Coming Soon</div>
          <div className="text-gray-400">Advanced terminal integration with cloud environments</div>
        </div>
      </div>
    </div>
  );
};

export default TerminalIntegrationSettings;
