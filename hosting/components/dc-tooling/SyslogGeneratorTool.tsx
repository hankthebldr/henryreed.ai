'use client';

import React, { useState } from 'react';
import { SyslogGeneratorConfig } from '../../types/demo';
import { cn } from '../../lib/utils';

interface SyslogGeneratorToolProps {
  config?: SyslogGeneratorConfig;
  onConfigChange?: (config: SyslogGeneratorConfig) => void;
  onStart?: (config: SyslogGeneratorConfig) => Promise<void>;
  onStop?: () => Promise<void>;
  readOnly?: boolean;
}

const VENDORS = [
  { name: 'CrowdStrike', products: ['Falcon EDR', 'Falcon Insight'] },
  { name: 'Microsoft', products: ['Defender for Endpoint', 'Azure AD', 'Sentinel'] },
  { name: 'Palo Alto Networks', products: ['PAN-OS', 'Prisma Cloud', 'Cortex XDR'] },
  { name: 'AWS', products: ['CloudTrail', 'VPC Flow Logs', 'GuardDuty'] },
  { name: 'Okta', products: ['Universal Directory', 'System Log'] },
  { name: 'Zscaler', products: ['ZIA', 'ZPA'] },
  { name: 'Cisco', products: ['ASA', 'Firepower', 'ISE'] }
];

const SCENARIOS = [
  { id: 'T1486-ransomware', name: 'T1486 - Ransomware Encryption', category: 'Impact' },
  { id: 'T1566-phishing', name: 'T1566 - Phishing Attack', category: 'Initial Access' },
  { id: 'T1021-lateral-movement', name: 'T1021 - SMB Lateral Movement', category: 'Lateral Movement' },
  { id: 'T1098-account-manipulation', name: 'T1098 - Account Manipulation', category: 'Persistence' },
  { id: 'insider-threat', name: 'Insider Threat - Data Exfiltration', category: 'Exfiltration' },
  { id: 'apt29-campaign', name: 'APT29 - Cloud Credential Attack', category: 'Campaign' },
  { id: 'apt28-campaign', name: 'APT28 - Enterprise Lateral Movement', category: 'Campaign' }
];

export const SyslogGeneratorTool: React.FC<SyslogGeneratorToolProps> = ({
  config: initialConfig,
  onConfigChange,
  onStart,
  onStop,
  readOnly = false
}) => {
  const [config, setConfig] = useState<SyslogGeneratorConfig>(
    initialConfig || {
      brokerVM: '',
      brokerIP: '',
      brokerPort: 514,
      protocol: 'UDP',
      vendor: 'CrowdStrike',
      product: 'Falcon EDR',
      scenario: 'T1486-ransomware',
      ratePerSecond: 50,
      duration: 30,
      enabled: false
    }
  );

  const [isRunning, setIsRunning] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleConfigUpdate = (updates: Partial<SyslogGeneratorConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleStart = async () => {
    if (!config.brokerIP || !config.brokerVM) {
      alert('Please configure Broker VM and IP address');
      return;
    }

    setIsRunning(true);
    try {
      await onStart?.(config);
    } catch (error) {
      console.error('Failed to start log generation:', error);
      alert('Failed to start log generation');
      setIsRunning(false);
    }
  };

  const handleStop = async () => {
    try {
      await onStop?.();
    } finally {
      setIsRunning(false);
    }
  };

  const selectedVendor = VENDORS.find(v => v.name === config.vendor);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-cortex-text-primary">Cortex Syslog Generator</h3>
          <p className="text-sm text-cortex-text-muted">Configure and control log generation for demo scenarios</p>
        </div>
        <div className={cn(
          'px-3 py-1 rounded-full text-xs font-medium',
          isRunning ? 'bg-status-success/20 text-status-success' : 'bg-cortex-bg-secondary text-cortex-text-muted'
        )}>
          {isRunning ? '🟢 Running' : '⚪ Stopped'}
        </div>
      </div>

      {/* Broker Configuration */}
      <div className="glass-card p-6 space-y-4">
        <h4 className="font-bold text-cortex-text-primary flex items-center space-x-2">
          <span>🖥️</span>
          <span>Broker Configuration</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Broker VM Hostname
            </label>
            <input
              type="text"
              value={config.brokerVM}
              onChange={(e) => handleConfigUpdate({ brokerVM: e.target.value })}
              placeholder="cortex-broker-01.local"
              disabled={readOnly || isRunning}
              className="w-full px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary placeholder-cortex-text-disabled focus:ring-2 focus:ring-cortex-primary focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Broker IP Address
            </label>
            <input
              type="text"
              value={config.brokerIP}
              onChange={(e) => handleConfigUpdate({ brokerIP: e.target.value })}
              placeholder="10.50.1.100"
              disabled={readOnly || isRunning}
              className="w-full px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary placeholder-cortex-text-disabled focus:ring-2 focus:ring-cortex-primary focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Port
            </label>
            <input
              type="number"
              value={config.brokerPort}
              onChange={(e) => handleConfigUpdate({ brokerPort: parseInt(e.target.value) || 514 })}
              disabled={readOnly || isRunning}
              className="w-full px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary focus:ring-2 focus:ring-cortex-primary focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Protocol
            </label>
            <select
              value={config.protocol}
              onChange={(e) => handleConfigUpdate({ protocol: e.target.value as 'UDP' | 'TCP' | 'TLS' })}
              disabled={readOnly || isRunning}
              className="w-full px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary focus:ring-2 focus:ring-cortex-primary focus:border-transparent disabled:opacity-50"
            >
              <option value="UDP">UDP</option>
              <option value="TCP">TCP</option>
              <option value="TLS">TLS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vendor & Scenario Configuration */}
      <div className="glass-card p-6 space-y-4">
        <h4 className="font-bold text-cortex-text-primary flex items-center space-x-2">
          <span>🔬</span>
          <span>Scenario Configuration</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Vendor
            </label>
            <select
              value={config.vendor}
              onChange={(e) => {
                const vendor = VENDORS.find(v => v.name === e.target.value);
                handleConfigUpdate({
                  vendor: e.target.value,
                  product: vendor?.products[0] || ''
                });
              }}
              disabled={readOnly || isRunning}
              className="w-full px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary focus:ring-2 focus:ring-cortex-primary focus:border-transparent disabled:opacity-50"
            >
              {VENDORS.map(vendor => (
                <option key={vendor.name} value={vendor.name}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Product
            </label>
            <select
              value={config.product}
              onChange={(e) => handleConfigUpdate({ product: e.target.value })}
              disabled={readOnly || isRunning}
              className="w-full px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary focus:ring-2 focus:ring-cortex-primary focus:border-transparent disabled:opacity-50"
            >
              {selectedVendor?.products.map(product => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Attack Scenario
            </label>
            <select
              value={config.scenario}
              onChange={(e) => handleConfigUpdate({ scenario: e.target.value })}
              disabled={readOnly || isRunning}
              className="w-full px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary focus:ring-2 focus:ring-cortex-primary focus:border-transparent disabled:opacity-50"
            >
              {SCENARIOS.map(scenario => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name} ({scenario.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Generation Parameters */}
      <div className="glass-card p-6 space-y-4">
        <h4 className="font-bold text-cortex-text-primary flex items-center space-x-2">
          <span>⚙️</span>
          <span>Generation Parameters</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Rate (events/second)
            </label>
            <input
              type="number"
              value={config.ratePerSecond}
              onChange={(e) => handleConfigUpdate({ ratePerSecond: parseInt(e.target.value) || 0 })}
              disabled={readOnly || isRunning}
              min="1"
              max="1000"
              className="w-full px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary focus:ring-2 focus:ring-cortex-primary focus:border-transparent disabled:opacity-50"
            />
            <p className="text-xs text-cortex-text-muted mt-1">Recommended: 10-100 for demos</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={config.duration}
              onChange={(e) => handleConfigUpdate({ duration: parseInt(e.target.value) || 0 })}
              disabled={readOnly || isRunning}
              min="1"
              max="180"
              className="w-full px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary focus:ring-2 focus:ring-cortex-primary focus:border-transparent disabled:opacity-50"
            />
            <p className="text-xs text-cortex-text-muted mt-1">Total duration for log generation</p>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-cortex-primary hover:text-cortex-accent flex items-center space-x-1"
        >
          <span>{showAdvanced ? '▼' : '▶'}</span>
          <span>Advanced Options (XSIAM HTTP)</span>
        </button>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-cortex-border">
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                XSIAM HTTP Endpoint (Optional)
              </label>
              <input
                type="text"
                value={config.xsiamEndpoint || ''}
                onChange={(e) => handleConfigUpdate({ xsiamEndpoint: e.target.value })}
                placeholder="https://api-tenant.xdr.us.paloaltonetworks.com"
                disabled={readOnly || isRunning}
                className="w-full px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary placeholder-cortex-text-disabled focus:ring-2 focus:ring-cortex-primary focus:border-transparent disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                XSIAM API Key (Optional)
              </label>
              <input
                type="password"
                value={config.xsiamApiKey || ''}
                onChange={(e) => handleConfigUpdate({ xsiamApiKey: e.target.value })}
                placeholder="Enter API key..."
                disabled={readOnly || isRunning}
                className="w-full px-4 py-2 bg-cortex-bg-primary border border-cortex-border rounded-lg text-cortex-text-primary placeholder-cortex-text-disabled focus:ring-2 focus:ring-cortex-primary focus:border-transparent disabled:opacity-50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      {!readOnly && (
        <div className="flex items-center justify-between p-4 bg-cortex-bg-secondary/50 rounded-lg">
          <div className="text-sm text-cortex-text-muted">
            {isRunning ? (
              <span>🟢 Log generation in progress...</span>
            ) : (
              <span>Ready to generate logs</span>
            )}
          </div>
          <div className="flex space-x-3">
            {isRunning ? (
              <button
                onClick={handleStop}
                className="btn-modern button-hover-lift cortex-interactive px-6 py-2 bg-status-error hover:bg-status-error/90 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>■</span>
                <span>Stop Generation</span>
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={!config.brokerIP || !config.brokerVM}
                className="btn-modern button-hover-lift cortex-interactive px-6 py-2 bg-gradient-to-r from-cortex-primary to-cortex-accent hover:from-cortex-primary/90 hover:to-cortex-accent/90 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>▶</span>
                <span>Start Generation</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="glass-card p-4 bg-cortex-info/10 border-l-4 border-cortex-info">
        <h5 className="font-bold text-cortex-text-primary mb-2 flex items-center space-x-2">
          <span>ℹ️</span>
          <span>About Cortex Syslog Generator</span>
        </h5>
        <p className="text-sm text-cortex-text-secondary leading-relaxed">
          This tool integrates with the cortex-syslog-generator application running at{' '}
          <code className="text-cortex-primary">~/Github/cortex-syslog-generator</code>. It generates realistic
          security logs from 22+ enterprise vendors with authentic log formats and MITRE ATT&CK-aligned attack scenarios.
        </p>
        <div className="mt-3 flex items-center space-x-4 text-xs text-cortex-text-muted">
          <span>✓ 22+ Vendors Supported</span>
          <span>✓ 50+ MITRE Techniques</span>
          <span>✓ 10,000+ events/minute</span>
        </div>
      </div>
    </div>
  );
};

export default SyslogGeneratorTool;
