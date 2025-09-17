'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import EnhancedManualCreationGUI from './EnhancedManualCreationGUI';
import BreadcrumbNavigation from './BreadcrumbNavigation';
import CortexButton from './CortexButton';
import CortexCommandButton from './CortexCommandButton';

interface GUITab {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType;
  description: string;
  breadcrumb: string;
}

interface QuickAction {
  name: string;
  icon: string;
  description: string;
  command?: string; // Terminal command to execute
  action?: string; // GUI action to trigger
  data?: any;
  className: string;
}

// Enhanced POV Dashboard with command integration
const EnhancedPOVDashboard = () => {
  const { state, actions } = useAppState();
  
  useEffect(() => {
    // Update breadcrumbs for dashboard
    actions.updateBreadcrumbs([
      { label: 'Home', path: '/gui' },
      { label: 'Dashboard', path: '/gui/dashboard' },
    ]);
  }, [actions]);

  // Handle command execution from GUI
  const executeCommand = async (command: string) => {
    actions.executeCommandFromGUI(command);
    actions.setLoading('command_execution', true);
    
    // Simulate command execution
    setTimeout(() => {
      actions.setLoading('command_execution', false);
      actions.notify('success', `Command "${command}" executed successfully`);
    }, 1000);
  };

  // Enhanced quick actions with PANW Cortex color scheme - ALIGNED WITH TERMINAL
  const quickActions: QuickAction[] = [
    {
      name: 'New POV',
      icon: '🎯',
      description: 'Initialize a new Proof of Value project',
      command: 'pov create --interactive',
      className: 'cortex-card hover:border-cortex-green text-cortex-green hover:shadow-lg border border-cortex-green/30 hover:cortex-glow-green'
    },
    {
      name: 'List Scenarios',
      icon: '📋',
      description: 'Browse available security scenarios',
      command: 'scenario list',
      className: 'cortex-card hover:border-cortex-info text-cortex-info hover:shadow-lg border border-cortex-info/30'
    },
    {
      name: 'Deploy Scenario',
      icon: '🚀',
      description: 'Deploy a security scenario',
      command: 'scenario generate --scenario-type cloud-posture',
      className: 'cortex-card hover:border-cortex-green text-cortex-green hover:shadow-lg border border-cortex-green/30 hover:cortex-glow-green'
    },
    {
      name: 'Generate Report',
      icon: '📝',
      description: 'Create executive or technical report',
      command: 'pov report --current --executive',
      className: 'cortex-card hover:border-cortex-warning text-cortex-warning hover:shadow-lg border border-cortex-warning/30'
    },
    {
      name: 'AI Analysis',
      icon: '🤖',
      description: 'Run Gemini AI analysis on current data',
      command: 'gemini analyze --context dashboard',
      className: 'cortex-card hover:border-cortex-text-accent text-cortex-text-accent hover:shadow-lg border border-cortex-text-accent/30'
    },
    {
      name: 'Badass Blueprint',
      icon: '🧭',
      description: 'Create transformation blueprint and download PDF',
      command: 'pov --badass-blueprint',
      className: 'cortex-card hover:border-cortex-green-light text-cortex-green-light hover:shadow-lg border border-cortex-green-light/30'
    }
  ];

  const handleQuickAction = (action: QuickAction) => {
    if (action.command) {
      executeCommand(action.command);
    } else if (action.action) {
      actions.triggerGUIAction(action.action, action.data);
    }
  };

  const activityData = [
    { action: 'POV Completed', target: 'Enterprise Banking Corp', time: '2 hours ago', status: 'success', command: 'pov status --id EBC-001' },
    { action: 'Template Deployed', target: 'Ransomware Chain v2.1', time: '4 hours ago', status: 'info', command: 'scenario status --name ransomware-v2.1' },
    { action: 'Detection Generated', target: 'T1078 Account Access', time: '6 hours ago', status: 'warning', command: 'detect --technique T1078' },
    { action: 'TRR Validated', target: 'Multi-Cloud Security', time: '1 day ago', status: 'success', command: 'trr show --id TRR-2024-001' }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Overview with PANW Cortex branding */}
      <div className="bg-gradient-to-r from-cortex-success-bg to-cortex-info-bg p-6 rounded-lg border border-cortex-green/30 cortex-card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-cortex-green">🎯 POV Management Dashboard</h2>
          <div className="flex space-x-2">
            <CortexCommandButton 
              command="status --analytics"
              variant="secondary"
              size="sm"
              icon="🔄"
              tooltip="Refresh dashboard analytics data"
            >
              Refresh Data
            </CortexCommandButton>
            <CortexButton 
              onClick={() => actions.setActiveGUITab('ai')}
              variant="outline"
              size="sm"
              icon="🤖"
              ariaLabel="Switch to AI Insights tab"
              tooltip="View AI-powered insights and analysis"
            >
              AI Insights
            </CortexButton>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="cortex-card p-4 border border-cortex-green/30 cursor-pointer hover:border-cortex-green hover:cortex-glow-green transition-all"
               onClick={() => executeCommand('pov list --active')}>
            <h3 className="text-lg font-bold text-cortex-green mb-2">Active POVs</h3>
            <div className="text-3xl font-mono text-cortex-green-light">
              {state.data.povs?.length || 12}
            </div>
            <div className="text-sm text-cortex-text-muted mt-2">3 in progress, 9 completed</div>
          </div>
          <div className="cortex-card p-4 border border-cortex-info/30 cursor-pointer hover:border-cortex-info hover:shadow-lg transition-all"
               onClick={() => executeCommand('scenario list --deployed')}>
            <h3 className="text-lg font-bold text-cortex-info mb-2">Templates Used</h3>
            <div className="text-3xl font-mono text-cortex-info-light">
              {state.data.scenarios?.length || 27}
            </div>
            <div className="text-sm text-cortex-text-muted mt-2">Across 8 scenarios</div>
          </div>
          <div className="cortex-card p-4 border border-cortex-green/30 cursor-pointer hover:border-cortex-green hover:cortex-glow-green transition-all"
               onClick={() => executeCommand('project list --active')}>
            <h3 className="text-lg font-bold text-cortex-green mb-2">Customer Engagements</h3>
            <div className="text-3xl font-mono text-cortex-green-light">
              {state.data.projects?.length || 8}
            </div>
            <div className="text-sm text-cortex-text-muted mt-2">5 enterprise, 3 mid-market</div>
          </div>
          <div className="cortex-card p-4 border border-cortex-text-accent/30 cursor-pointer hover:border-cortex-text-accent hover:shadow-lg transition-all"
               onClick={() => executeCommand('detect list --recent')}>
            <h3 className="text-lg font-bold text-cortex-text-accent mb-2">Detections</h3>
            <div className="text-3xl font-mono text-cortex-text-accent">
              {state.data.detections?.length || 156}
            </div>
            <div className="text-sm text-cortex-text-muted mt-2">78 validated</div>
          </div>
        </div>
      </div>
      
      {/* Activity and Actions with Command Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity with clickable commands */}
        <div className="cortex-card p-6">
          <div className="flex justify-between items-center mb-4">
<h3 className="text-xl font-bold text-cortex-green">📊 Recent Activity</h3>
            <button 
              onClick={() => executeCommand('activity --recent --limit 10')}
className="text-xs text-cortex-green hover:text-cortex-green-light underline"
            >
              View More
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto terminal-scrollbar">
            {activityData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-cortex-bg-quaternary rounded hover:bg-cortex-bg-quaternary/80 border border-cortex-border-muted hover:border-cortex-primary/30 transition-colors cursor-pointer"
                   onClick={() => executeCommand(item.command)}>
                <div className="flex-1">
                  <div className="font-mono text-cortex-text-primary text-sm">{item.action}</div>
                  <div className="text-cortex-text-muted text-xs">{item.target}</div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-xs font-mono ${
                    item.status === 'success' ? 'text-cortex-success' : 
                    item.status === 'warning' ? 'text-cortex-warning' : 'text-cortex-info'
                  }`}>
                    {item.time}
                  </div>
                  <div className="text-xs text-cortex-text-disabled mt-1">Click for details</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Enhanced Quick Actions */}
        <div className="cortex-card p-6">
          <h3 className="text-xl font-bold text-cortex-green mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action)}
                disabled={state.ui.loadingStates.command_execution}
                className={`p-4 rounded transition-all duration-200 text-center hover:scale-105 hover:shadow-lg ${action.className} disabled:opacity-50 disabled:cursor-not-allowed`}
                title={action.description}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="text-sm font-mono">{action.name}</div>
                {action.command && (
                  <div className="text-xs text-cortex-text-muted mt-1 truncate" title={action.command}>
                    {action.command}
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Command Terminal Integration */}
          <div className="mt-4 pt-4 border-t border-cortex-border-secondary">
            <h4 className="text-sm font-bold text-cortex-text-primary mb-2">Terminal Integration</h4>
            <div className="space-y-2">
              <CortexButton
                onClick={() => {
                  // Navigate to terminal page
                  window.location.href = '/terminal';
                }}
                variant="secondary"
                size="sm"
                icon="🔄"
                className="w-full justify-start"
                ariaLabel="Switch to terminal interface"
                tooltip="Navigate to the command-line terminal interface"
              >
                Switch to Terminal Mode
              </CortexButton>
              <CortexCommandButton
                command="help"
                variant="secondary"
                size="sm"
                icon="📋"
                className="w-full justify-start"
                tooltip="Display all available commands"
              >
                View All Commands
              </CortexCommandButton>
              <CortexCommandButton
                command="getting-started"
                variant="secondary"
                size="sm"
                icon="🚀"
                className="w-full justify-start"
                tooltip="Show the getting started guide"
              >
                Getting Started Guide
              </CortexCommandButton>
              <CortexCommandButton
                command="scenario list"
                variant="secondary"
                size="sm"
                icon="🎯"
                className="w-full justify-start"
                tooltip="Browse available security scenarios"
              >
                Browse Security Scenarios
              </CortexCommandButton>
              <CortexButton
                onClick={() => window.open('/alignment-guide', '_blank')}
                variant="secondary"
                size="sm"
                icon="🔄"
                className="w-full justify-start border-cortex-text-accent text-cortex-text-accent hover:bg-cortex-text-accent hover:text-white"
                ariaLabel="View command alignment guide"
                tooltip="View the mapping between terminal commands and GUI actions"
              >
                Command Alignment Guide
              </CortexButton>
<div className="text-xs text-cortex-text-disabled mt-2">
                Last command: <span className="font-mono text-cortex-green">{state.commandBridge.lastExecutedCommand || 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Command Execution Status */}
      {state.ui.loadingStates.command_execution && (
        <div className="fixed bottom-4 right-4 cortex-card-elevated px-4 py-2 border border-cortex-green cortex-glow-green">
          <div className="flex items-center space-x-2">
            <div className="cortex-spinner"></div>
            <span className="text-sm text-cortex-green">Executing command...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced TRR Management with full user flow
const EnhancedTRRManagement = () => {
  const { state, actions } = useAppState();
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'upload' | 'validate'>('dashboard');
  const [selectedTRR, setSelectedTRR] = useState<string | null>(null);
  
  useEffect(() => {
    actions.updateBreadcrumbs([
      { label: 'Home', path: '/gui' },
      { label: 'TRR Management', path: '/gui/trr' },
    ]);
  }, [actions]);

  // Execute command from GUI
  const executeCommand = async (command: string) => {
    actions.executeCommandFromGUI(command);
    actions.setLoading('command_execution', true);
    
    setTimeout(() => {
      actions.setLoading('command_execution', false);
      actions.notify('success', `TRR command "${command}" executed successfully`);
    }, 1500);
  };

  // Mock TRR data
  const mockTRRs = [
    { id: 'TRR-001', title: 'SIEM Integration Validation', status: 'in-progress', priority: 'critical', assignee: 'john.doe', dueDate: '2024-01-25' },
    { id: 'TRR-002', title: 'Network Connectivity Check', status: 'validated', priority: 'high', assignee: 'sarah.engineer', dueDate: '2024-01-20' },
    { id: 'TRR-003', title: 'Performance Baseline Test', status: 'pending', priority: 'medium', assignee: 'alex.consultant', dueDate: '2024-01-30' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'in-progress': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'failed': return 'text-red-400 bg-red-900/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const TRRDashboard = () => (
    <div className="space-y-6">
      {/* TRR Stats Overview */}
      <div className="bg-gradient-to-r from-cortex-success-bg to-cortex-info-bg p-6 rounded-lg border border-cortex-green/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-cortex-green mb-4">📋 TRR Management Dashboard</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => executeCommand('trr list')}
              className="btn-cortex-secondary text-sm"
            >
              📋 List TRRs
            </button>
            <button 
              onClick={() => setActiveView('create')}
              className="px-4 py-2 bg-cortex-green hover:bg-cortex-green-dark text-white rounded transition-colors"
            >
              ➕ Create New TRR
            </button>
            <button 
              onClick={() => setActiveView('upload')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              📤 Import CSV
            </button>
            <button 
              onClick={() => setActiveView('validate')}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
            >
              ✅ Validate
            </button>
            <button 
              onClick={() => executeCommand('trr export --format csv')}
              className="px-3 py-2 bg-cortex-info hover:bg-cortex-info-dark text-white rounded text-sm transition-colors"
            >
              📤 Export
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="cortex-card p-4 border border-cortex-green/20 cursor-pointer hover:border-cortex-green/50 transition-all"
               onClick={() => executeCommand('trr list --status pending')}>
            <h3 className="text-lg font-bold text-cortex-green mb-2">Pending TRRs</h3>
            <div className="text-3xl font-mono text-cortex-green-light">
              {mockTRRs.filter(t => t.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-400 mt-2">Awaiting validation</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded border border-yellow-500/20 cursor-pointer hover:bg-opacity-70 transition-all"
               onClick={() => executeCommand('trr list --status in-progress')}>
            <h3 className="text-lg font-bold text-yellow-300 mb-2">In Progress</h3>
            <div className="text-3xl font-mono text-yellow-400">
              {mockTRRs.filter(t => t.status === 'in-progress').length}
            </div>
            <div className="text-sm text-gray-400 mt-2">Active validations</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded border border-green-500/20 cursor-pointer hover:bg-opacity-70 transition-all"
               onClick={() => executeCommand('trr list --status validated')}>
            <h3 className="text-lg font-bold text-green-300 mb-2">Validated</h3>
            <div className="text-3xl font-mono text-green-400">
              {mockTRRs.filter(t => t.status === 'validated').length}
            </div>
            <div className="text-sm text-gray-400 mt-2">Completed TRRs</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded border border-purple-500/20 cursor-pointer hover:bg-opacity-70 transition-all"
               onClick={() => executeCommand('trr-signoff list --blockchain')}>
            <h3 className="text-lg font-bold text-purple-300 mb-2">Blockchain</h3>
            <div className="text-3xl font-mono text-purple-400">2</div>
            <div className="text-sm text-gray-400 mt-2">Signed validations</div>
          </div>
        </div>
      </div>

      {/* TRR List */}
      <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-cyan-400">📋 Active TRR Validations</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => executeCommand('trr export --format csv')}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline"
            >
              📥 Export CSV
            </button>
            <button 
              onClick={() => setActiveView('validate')}
              className="text-xs text-green-400 hover:text-green-300 underline"
            >
              ✅ Bulk Validate
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {mockTRRs.map((trr) => (
            <div key={trr.id} className="flex justify-between items-center p-4 bg-gray-800/30 rounded hover:bg-gray-700/30 transition-colors cursor-pointer"
                 onClick={() => {
                   setSelectedTRR(trr.id);
                   executeCommand(`trr show --id ${trr.id}`);
                 }}>
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="font-mono text-white text-sm">{trr.id}</div>
                  <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(trr.status)}`}>
                    {trr.status}
                  </div>
                  <div className={`text-xs ${getPriorityColor(trr.priority)}`}>●</div>
                </div>
                <div className="text-gray-300 text-sm mt-1">{trr.title}</div>
                <div className="text-gray-500 text-xs mt-1">
                  Assigned: {trr.assignee} • Due: {trr.dueDate}
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    executeCommand(`trr validate --id ${trr.id}`);
                  }}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                >
                  Validate
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    executeCommand(`trr edit --id ${trr.id}`);
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TRRCreateForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-green-400">➕ Create New TRR Validation</h2>
          <p className="text-gray-400 text-sm mt-1">Define a new Technical Requirements Review validation</p>
        </div>
        <button 
          onClick={() => setActiveView('dashboard')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Requirement Title *</label>
              <input type="text" placeholder="e.g., SIEM Integration Validation" 
                     className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white">
                <option>security</option>
                <option>performance</option>
                <option>compliance</option>
                <option>integration</option>
                <option>usability</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
              <select className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white">
                <option>critical</option>
                <option>high</option>
                <option>medium</option>
                <option>low</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Assigned To</label>
              <input type="text" placeholder="consultant.name" 
                     className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Customer</label>
              <input type="text" placeholder="customer-name" 
                     className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
              <input type="date" 
                     className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white" />
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea placeholder="Detailed description of the validation requirement..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white h-24" />
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button 
            onClick={() => setActiveView('dashboard')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              executeCommand('trr create --interactive');
              setActiveView('dashboard');
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            Create TRR
          </button>
        </div>
      </div>
    </div>
  );

  const TRRUpload = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-400">📤 Upload TRR CSV</h2>
          <p className="text-gray-400 text-sm mt-1">Bulk import TRR validations from CSV file</p>
        </div>
        <button 
          onClick={() => setActiveView('dashboard')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
          <div className="text-4xl mb-4">📁</div>
          <div className="text-lg text-gray-300 mb-2">Drop CSV file here or click to browse</div>
          <div className="text-sm text-gray-500 mb-4">Supports CSV files with TRR validation data</div>
          <button 
            onClick={() => executeCommand('trr import --file sample.csv')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Browse Files
          </button>
        </div>
        
        <div className="mt-6 bg-gray-800/50 p-4 rounded">
          <h4 className="font-bold text-gray-300 mb-2">CSV Format Requirements:</h4>
          <div className="text-sm text-gray-400 space-y-1">
            <div>• Required columns: id, requirement, description, category, priority, status</div>
            <div>• Optional: assignedTo, customer, dueDate, validationMethod, comments</div>
            <div>• Status values: pending, in-progress, validated, failed, not-applicable</div>
            <div>• Priority values: critical, high, medium, low</div>
          </div>
        </div>
      </div>
    </div>
  );

  const TRRValidate = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-purple-400">✅ Bulk TRR Validation</h2>
          <p className="text-gray-400 text-sm mt-1">Validate multiple TRRs and blockchain signoff</p>
        </div>
        <button 
          onClick={() => setActiveView('dashboard')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-purple-300">Validation Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => executeCommand('trr validate --all --status pending')}
                className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-left"
              >
                ✅ Validate All Pending TRRs
              </button>
              <button 
                onClick={() => executeCommand('trr-signoff create --batch')}
                className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-left"
              >
                🔐 Blockchain Batch Signoff
              </button>
              <button 
                onClick={() => executeCommand('trr export --validated --format pdf')}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-left"
              >
                📄 Generate Validation Report
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-yellow-300">Quality Checks</h3>
            <div className="space-y-3">
              <button 
                onClick={() => executeCommand('trr audit --completeness')}
                className="w-full p-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors text-left"
              >
                📋 Completeness Check
              </button>
              <button 
                onClick={() => executeCommand('trr audit --dependencies')}
                className="w-full p-3 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors text-left"
              >
                🔗 Dependency Validation
              </button>
              <button 
                onClick={() => executeCommand('trr audit --compliance')}
                className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-left"
              >
                ⚖️ Compliance Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render based on active view
  switch (activeView) {
    case 'create': return <TRRCreateForm />;
    case 'upload': return <TRRUpload />;
    case 'validate': return <TRRValidate />;
    default: return <TRRDashboard />;
  }
};

// Enhanced AI Insights with comprehensive user flows
const EnhancedAIInsights = () => {
  const { state, actions } = useAppState();
  const [activeView, setActiveView] = useState<'dashboard' | 'chat' | 'analysis' | 'recommendations'>('dashboard');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; content: string; timestamp: string }[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  
  useEffect(() => {
    actions.updateBreadcrumbs([
      { label: 'Home', path: '/gui' },
      { label: 'AI Insights', path: '/gui/ai' },
    ]);
  }, [actions]);

  // Execute command from GUI
  const executeCommand = async (command: string) => {
    actions.executeCommandFromGUI(command);
    actions.setLoading('command_execution', true);
    
    setTimeout(() => {
      actions.setLoading('command_execution', false);
      actions.notify('success', `AI command "${command}" executed successfully`);
    }, 2000);
  };

  const sendChatMessage = (message: string) => {
    if (!message.trim()) return;
    
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentQuery('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        role: 'ai' as const,
        content: `Based on your query "${message}", here are my insights:\n\n• Analysis of current POV trends shows 85% success rate\n• Recommendation: Focus on cloud-native security scenarios\n• Consider implementing automated validation workflows\n• Next steps: Review TRR completion metrics`,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const AIDashboard = () => (
    <div className="space-y-6">
      {/* AI Overview */}
      <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 p-6 rounded-lg border border-indigo-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-indigo-400">🤖 AI Insights Dashboard</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => executeCommand('ai "help with POV optimization"')}
              className="btn-cortex-secondary text-sm"
            >
              💬 Quick AI Query
            </button>
            <button 
              onClick={() => setActiveView('chat')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
            >
              💬 Start Chat
            </button>
            <button 
              onClick={() => executeCommand('gemini analyze --context dashboard')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
            >
              📈 Run Analysis
            </button>
            <button 
              onClick={() => setActiveView('recommendations')}
              className="px-3 py-2 bg-cortex-green hover:bg-cortex-green-dark text-white rounded text-sm transition-colors"
            >
              💡 Recommendations
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 p-4 rounded border border-indigo-500/20 cursor-pointer hover:bg-opacity-70 transition-all"
               onClick={() => executeCommand('gemini analyze --context pov')}>
            <h3 className="text-lg font-bold text-indigo-300 mb-2">POV Insights</h3>
            <div className="text-3xl font-mono text-indigo-400">87%</div>
            <div className="text-sm text-gray-400 mt-2">Success prediction</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded border border-purple-500/20 cursor-pointer hover:bg-opacity-70 transition-all"
               onClick={() => executeCommand('gemini analyze --context scenarios')}>
            <h3 className="text-lg font-bold text-purple-300 mb-2">Scenario Optimization</h3>
            <div className="text-3xl font-mono text-purple-400">23</div>
            <div className="text-sm text-gray-400 mt-2">Recommendations</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded border border-cyan-500/20 cursor-pointer hover:bg-opacity-70 transition-all"
               onClick={() => executeCommand('gemini analyze --context trr')}>
            <h3 className="text-lg font-bold text-cyan-300 mb-2">TRR Analysis</h3>
            <div className="text-3xl font-mono text-cyan-400">94%</div>
            <div className="text-sm text-gray-400 mt-2">Completion rate</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded border border-green-500/20 cursor-pointer hover:bg-opacity-70 transition-all"
               onClick={() => executeCommand('gemini predict --engagement-success')}>
            <h3 className="text-lg font-bold text-green-300 mb-2">Engagement Health</h3>
            <div className="text-3xl font-mono text-green-400">A+</div>
            <div className="text-sm text-gray-400 mt-2">Overall score</div>
          </div>
        </div>
      </div>

      {/* Quick AI Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-cyan-400">⚡ Quick AI Actions</h3>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => executeCommand('gemini analyze --current-pov --recommendations')}
              className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors text-left"
            >
              🎯 Analyze Current POV Performance
            </button>
            <button 
              onClick={() => executeCommand('gemini optimize --scenarios --customer-fit')}
              className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-left"
            >
              🔧 Optimize Scenario Selection
            </button>
            <button 
              onClick={() => executeCommand('gemini predict --timeline --risks')}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-left"
            >
              🔮 Predict Timeline & Risks
            </button>
            <button 
              onClick={() => executeCommand('gemini generate --executive-summary')}
              className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-left"
            >
              📄 Generate Executive Summary
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-yellow-400">💡 AI Recommendations</h3>
            <button 
              onClick={() => setActiveView('recommendations')}
              className="text-xs text-yellow-400 hover:text-yellow-300 underline"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-gray-800/30 rounded">
              <div className="text-sm text-white font-medium">Scenario Recommendation</div>
              <div className="text-xs text-gray-400 mt-1">
                Consider adding "Cloud Misconfig Detection" scenario to current POV based on customer environment
              </div>
              <button 
                onClick={() => executeCommand('scenario add --type cloud-misconfig --pov current')}
                className="mt-2 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
              >
                Apply
              </button>
            </div>
            
            <div className="p-3 bg-gray-800/30 rounded">
              <div className="text-sm text-white font-medium">Timeline Optimization</div>
              <div className="text-xs text-gray-400 mt-1">
                Adjust TRR validation schedule to reduce critical path by 3 days
              </div>
              <button 
                onClick={() => executeCommand('trr reschedule --optimize-timeline')}
                className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
              >
                Optimize
              </button>
            </div>
            
            <div className="p-3 bg-gray-800/30 rounded">
              <div className="text-sm text-white font-medium">Risk Mitigation</div>
              <div className="text-xs text-gray-400 mt-1">
                High priority: Validate network connectivity before scenario deployment
              </div>
              <button 
                onClick={() => executeCommand('trr create --type network-validation --priority critical')}
                className="mt-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
              >
                Create TRR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AIChat = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-indigo-400">💬 AI Chat Assistant</h2>
          <p className="text-gray-400 text-sm mt-1">Interactive AI consultation for POV optimization</p>
        </div>
        <button 
          onClick={() => setActiveView('dashboard')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="bg-gray-900/50 rounded border border-gray-700 h-96 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-4xl mb-4">🤖</div>
              <div>Start a conversation with the AI assistant</div>
              <div className="text-sm mt-2">Ask about POV optimization, scenario recommendations, or TRR insights</div>
            </div>
          ) : (
            chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-700 text-gray-100'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div className="text-xs opacity-75 mt-1">{msg.timestamp}</div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <div className="flex space-x-2">
            <input 
              type="text"
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage(currentQuery)}
              placeholder="Ask AI about POV optimization, scenarios, or insights..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400"
            />
            <button 
              onClick={() => sendChatMessage(currentQuery)}
              disabled={!currentQuery.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              Send
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              'Optimize my current POV',
              'What scenarios should I add?',
              'Analyze TRR completion rate',
              'Predict engagement success'
            ].map((suggestion, idx) => (
              <button 
                key={idx}
                onClick={() => sendChatMessage(suggestion)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AIAnalysis = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-purple-400">📈 Deep AI Analysis</h2>
          <p className="text-gray-400 text-sm mt-1">Comprehensive analysis and insights</p>
        </div>
        <button 
          onClick={() => setActiveView('dashboard')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-purple-300">Analysis Types</h3>
          <div className="space-y-3">
            <button 
              onClick={() => executeCommand('gemini deep-analysis --pov --performance')}
              className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-left"
            >
              📈 POV Performance Deep Dive
            </button>
            <button 
              onClick={() => executeCommand('gemini deep-analysis --customer --fit')}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-left"
            >
              🎯 Customer-Scenario Fit Analysis
            </button>
            <button 
              onClick={() => executeCommand('gemini deep-analysis --risk --assessment')}
              className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-left"
            >
              ⚠️ Risk Assessment & Mitigation
            </button>
            <button 
              onClick={() => executeCommand('gemini deep-analysis --competitive --positioning')}
              className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-left"
            >
              🏆 Competitive Positioning
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-cyan-300">Predictive Insights</h3>
          <div className="space-y-3">
            <button 
              onClick={() => executeCommand('gemini predict --success-probability')}
              className="w-full p-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors text-left"
            >
              🔮 Success Probability Modeling
            </button>
            <button 
              onClick={() => executeCommand('gemini predict --timeline-optimization')}
              className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors text-left"
            >
              ⏱️ Timeline Optimization
            </button>
            <button 
              onClick={() => executeCommand('gemini predict --resource-allocation')}
              className="w-full p-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors text-left"
            >
              💼 Resource Allocation
            </button>
            <button 
              onClick={() => executeCommand('gemini predict --escalation-paths')}
              className="w-full p-3 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors text-left"
            >
              🚨 Escalation Path Planning
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const AIRecommendations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-green-400">💡 AI Recommendations</h2>
          <p className="text-gray-400 text-sm mt-1">Actionable insights and next steps</p>
        </div>
        <button 
          onClick={() => setActiveView('dashboard')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="space-y-4">
        {/* High Priority Recommendations */}
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-red-400">🚨 High Priority</h3>
            <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">URGENT</span>
          </div>
          <div className="space-y-3">
            <div className="border-l-4 border-red-500 pl-4">
              <div className="font-medium text-white">Network Validation Required</div>
              <div className="text-sm text-gray-300 mt-1">
                AI detected potential network connectivity issues that could impact scenario deployment. Recommend creating TRR validation before proceeding.
              </div>
              <div className="mt-2 space-x-2">
                <button 
                  onClick={() => executeCommand('trr create --type network --priority critical')}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Create TRR
                </button>
                <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Medium Priority Recommendations */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-yellow-400">⚠️ Medium Priority</h3>
            <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">RECOMMENDED</span>
          </div>
          <div className="space-y-3">
            <div className="border-l-4 border-yellow-500 pl-4">
              <div className="font-medium text-white">Scenario Optimization</div>
              <div className="text-sm text-gray-300 mt-1">
                Based on customer profile analysis, consider adding "Container Security" and "Cloud Compliance" scenarios to increase POV value.
              </div>
              <div className="mt-2 space-x-2">
                <button 
                  onClick={() => executeCommand('scenario add --type container-security --pov current')}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
                >
                  Add Scenarios
                </button>
                <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">
                  Review Later
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Low Priority Recommendations */}
        <div className="bg-green-900/20 border border-green-500/30 p-4 rounded">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-green-400">📊 Optimization</h3>
            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">ENHANCEMENT</span>
          </div>
          <div className="space-y-3">
            <div className="border-l-4 border-green-500 pl-4">
              <div className="font-medium text-white">Timeline Optimization</div>
              <div className="text-sm text-gray-300 mt-1">
                AI suggests reordering TRR validations to reduce critical path by 2-3 days. This optimization maintains quality while accelerating delivery.
              </div>
              <div className="mt-2 space-x-2">
                <button 
                  onClick={() => executeCommand('trr optimize --timeline --critical-path')}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                >
                  Optimize Timeline
                </button>
                <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">
                  Keep Current
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render based on active view
  switch (activeView) {
    case 'chat': return <AIChat />;
    case 'analysis': return <AIAnalysis />;
    case 'recommendations': return <AIRecommendations />;
    default: return <AIDashboard />;
  }
};

// Enhanced Content Creator with comprehensive user stories and green branding
const EnhancedContentCreator = () => {
  const { actions } = useAppState();
  const [activeCreator, setActiveCreator] = useState<'overview' | 'pov' | 'template' | 'scenario' | 'analytics' | 'library'>('overview');
  const [recentItems, setRecentItems] = useState([
    { id: 1, name: 'Enterprise Banking POV', type: 'pov', status: 'active', created: '2024-01-15', customer: 'First National Bank' },
    { id: 2, name: 'Ransomware Detection Template', type: 'template', status: 'completed', created: '2024-01-12', scenarios: 8 },
    { id: 3, name: 'Insider Threat Scenario', type: 'scenario', status: 'draft', created: '2024-01-10', mitre: 'T1078' },
  ]);
  
  useEffect(() => {
    actions.updateBreadcrumbs([
      { label: 'Home', path: '/gui' },
      { label: 'Content Creator', path: '/gui/creator' },
    ]);
  }, [actions]);

  // Execute command integration
  const executeCommand = async (command: string) => {
    actions.executeCommandFromGUI(command);
    actions.setLoading('content_creation', true);
    
    setTimeout(() => {
      actions.setLoading('content_creation', false);
      actions.notify('success', `Command "${command}" executed successfully`);
    }, 1500);
  };

  const CreatorOverview = () => (
    <div className="space-y-6">
      {/* Header Section with Cortex Green Branding */}
      <div className="bg-gradient-to-r from-cortex-success-bg to-cortex-info-bg p-6 rounded-lg border border-cortex-green/30 cortex-card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-cortex-green mb-2">🛠️ Content Creator Hub</h2>
            <p className="text-cortex-text-secondary">Professional POV, template, and scenario creation platform for domain consultants</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveCreator('analytics')}
              className="btn-cortex-secondary text-sm"
            >
              📊 Analytics
            </button>
            <button 
              onClick={() => setActiveCreator('library')}
              className="btn-cortex-outline text-sm"
            >
              📚 Library
            </button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-green">24</div>
            <div className="text-sm text-cortex-text-muted">Active POVs</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-green-light">18</div>
            <div className="text-sm text-cortex-text-muted">Templates</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-info">56</div>
            <div className="text-sm text-cortex-text-muted">Scenarios</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-success">94%</div>
            <div className="text-sm text-cortex-text-muted">Success Rate</div>
          </div>
        </div>

        {/* Primary Creation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => setActiveCreator('pov')}
            className="group cursor-pointer p-6 cortex-card hover:border-cortex-green hover:cortex-glow-green transition-all duration-300 text-left"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
            <h3 className="text-xl font-bold text-cortex-green mb-3">Create POV</h3>
            <p className="text-sm text-cortex-text-secondary leading-relaxed mb-4">
              Build comprehensive Proof of Value projects with customer profiling, scenario selection, and success metrics
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-cortex-text-muted">Interactive Form Builder</span>
              <div className="flex items-center text-cortex-green text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Start</span>
                <span className="ml-1">→</span>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setActiveCreator('template')}
            className="group cursor-pointer p-6 cortex-card hover:border-cortex-green-light hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📋</div>
            <h3 className="text-xl font-bold text-cortex-green-light mb-3">Create Template</h3>
            <p className="text-sm text-cortex-text-secondary leading-relaxed mb-4">
              Design reusable scenario templates with validation criteria, risk assessments, and deployment guidelines
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-cortex-text-muted">Block-based Editor</span>
              <div className="flex items-center text-cortex-green-light text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Build</span>
                <span className="ml-1">→</span>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setActiveCreator('scenario')}
            className="group cursor-pointer p-6 cortex-card hover:border-cortex-info hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔬</div>
            <h3 className="text-xl font-bold text-cortex-info mb-3">Create Scenario</h3>
            <p className="text-sm text-cortex-text-secondary leading-relaxed mb-4">
              Build detection scenarios with MITRE ATT&CK mapping, attack vectors, and response playbooks
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-cortex-text-muted">MITRE Integration</span>
              <div className="flex items-center text-cortex-info text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Design</span>
                <span className="ml-1">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Items and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Items */}
        <div className="cortex-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-cortex-green">📋 Recent Items</h3>
            <button 
              onClick={() => executeCommand('content list --recent --limit 20')}
              className="text-xs text-cortex-green hover:text-cortex-green-light underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentItems.map((item) => (
              <div key={item.id} className="p-3 bg-cortex-bg-quaternary rounded border border-cortex-border-muted hover:border-cortex-green/30 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {item.type === 'pov' ? '🎯' : item.type === 'template' ? '📋' : '🔬'}
                    </span>
                    <div>
                      <div className="font-medium text-cortex-text-primary text-sm">{item.name}</div>
                      <div className="text-xs text-cortex-text-muted">
                        {item.type === 'pov' && `Customer: ${item.customer}`}
                        {item.type === 'template' && `${item.scenarios} scenarios`}
                        {item.type === 'scenario' && `MITRE: ${item.mitre}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'active' ? 'bg-cortex-success-bg text-cortex-success' :
                      item.status === 'completed' ? 'bg-cortex-info-bg text-cortex-info' :
                      'bg-cortex-warning-bg text-cortex-warning'
                    }`}>
                      {item.status}
                    </div>
                    <div className="text-xs text-cortex-text-muted mt-1">{item.created}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Actions and Tools */}
        <div className="cortex-card p-6">
          <h3 className="text-xl font-bold text-cortex-green mb-4">⚡ Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => executeCommand('pov init --template executive-overview --interactive')}
              className="w-full p-3 text-left rounded bg-cortex-green hover:bg-cortex-green-dark text-black font-medium transition-colors flex items-center space-x-3"
            >
              <span>🎯</span>
              <div>
                <div>Quick POV Setup</div>
                <div className="text-xs opacity-80">Executive overview template</div>
              </div>
            </button>
            
            <button 
              onClick={() => executeCommand('template clone --base ransomware-detection --interactive')}
              className="w-full p-3 text-left rounded bg-cortex-green-light hover:bg-cortex-green text-black font-medium transition-colors flex items-center space-x-3"
            >
              <span>📋</span>
              <div>
                <div>Clone Template</div>
                <div className="text-xs opacity-80">From existing templates</div>
              </div>
            </button>
            
            <button 
              onClick={() => executeCommand('scenario generate --type cloud-posture --mitre-guided')}
              className="w-full p-3 text-left rounded bg-cortex-info hover:bg-cortex-info-dark text-white font-medium transition-colors flex items-center space-x-3"
            >
              <span>🔬</span>
              <div>
                <div>MITRE-Guided Scenario</div>
                <div className="text-xs opacity-80">Cloud posture assessment</div>
              </div>
            </button>
            
            <div className="border-t border-cortex-border-secondary pt-3 mt-4">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => executeCommand('content import --source csv')}
                  className="p-2 text-center rounded bg-cortex-bg-hover hover:bg-cortex-bg-quaternary text-cortex-text-secondary hover:text-cortex-green transition-colors text-sm"
                >
                  📎 Import CSV
                </button>
                <button 
                  onClick={() => executeCommand('content export --format json --all')}
                  className="p-2 text-center rounded bg-cortex-bg-hover hover:bg-cortex-bg-quaternary text-cortex-text-secondary hover:text-cortex-green transition-colors text-sm"
                >
                  📁 Export All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cortex-card p-6">
          <h4 className="font-bold text-cortex-green mb-3 flex items-center space-x-2">
            <span>🎨</span>
            <span>Visual Editor</span>
          </h4>
          <ul className="space-y-2 text-sm text-cortex-text-secondary">
            <li className="flex items-start space-x-2">
              <span className="text-cortex-green mt-0.5">•</span>
              <span>Block-based content creation</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cortex-green mt-0.5">•</span>
              <span>Drag-and-drop organization</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cortex-green mt-0.5">•</span>
              <span>Real-time collaboration</span>
            </li>
          </ul>
        </div>
        
        <div className="cortex-card p-6">
          <h4 className="font-bold text-cortex-green mb-3 flex items-center space-x-2">
            <span>🔗</span>
            <span>Integrations</span>
          </h4>
          <ul className="space-y-2 text-sm text-cortex-text-secondary">
            <li className="flex items-start space-x-2">
              <span className="text-cortex-green mt-0.5">•</span>
              <span>XSIAM tenant connection</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cortex-green mt-0.5">•</span>
              <span>MITRE ATT&CK framework</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cortex-green mt-0.5">•</span>
              <span>Cloud provider APIs</span>
            </li>
          </ul>
        </div>
        
        <div className="cortex-card p-6">
          <h4 className="font-bold text-cortex-green mb-3 flex items-center space-x-2">
            <span>📈</span>
            <span>Analytics</span>
          </h4>
          <ul className="space-y-2 text-sm text-cortex-text-secondary">
            <li className="flex items-start space-x-2">
              <span className="text-cortex-green mt-0.5">•</span>
              <span>Success rate tracking</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cortex-green mt-0.5">•</span>
              <span>Usage pattern analysis</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cortex-green mt-0.5">•</span>
              <span>Performance optimization</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const AnalyticsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-cortex-green">📊 Content Analytics</h2>
        <button 
          onClick={() => setActiveCreator('overview')}
          className="btn-cortex-secondary"
        >
          ← Back to Overview
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="cortex-card p-6 text-center">
          <div className="text-3xl font-bold text-cortex-success mb-2">87%</div>
          <div className="text-sm text-cortex-text-muted">POV Success Rate</div>
          <div className="text-xs text-cortex-text-disabled mt-1">↑ 12% this month</div>
        </div>
        <div className="cortex-card p-6 text-center">
          <div className="text-3xl font-bold text-cortex-info mb-2">2.3h</div>
          <div className="text-sm text-cortex-text-muted">Avg Creation Time</div>
          <div className="text-xs text-cortex-text-disabled mt-1">↓ 0.5h faster</div>
        </div>
        <div className="cortex-card p-6 text-center">
          <div className="text-3xl font-bold text-cortex-warning mb-2">156</div>
          <div className="text-sm text-cortex-text-muted">Templates Used</div>
          <div className="text-xs text-cortex-text-disabled mt-1">↑ 23% usage</div>
        </div>
        <div className="cortex-card p-6 text-center">
          <div className="text-3xl font-bold text-cortex-green mb-2">42</div>
          <div className="text-sm text-cortex-text-muted">Active Users</div>
          <div className="text-xs text-cortex-text-disabled mt-1">Domain consultants</div>
        </div>
      </div>
      
      <div className="cortex-card p-6">
        <h3 className="text-lg font-bold text-cortex-green mb-4">Usage Trends</h3>
        <div className="h-64 bg-cortex-bg-primary rounded flex items-center justify-center">
          <div className="text-center text-cortex-text-muted">
            <div className="text-4xl mb-4">📈</div>
            <div>Analytics Dashboard</div>
            <div className="text-sm">Interactive charts and metrics</div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const LibraryView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-cortex-green">📚 Content Library</h2>
        <button 
          onClick={() => setActiveCreator('overview')}
          className="btn-cortex-secondary"
        >
          ← Back to Overview
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="cortex-card p-6">
          <h3 className="text-lg font-bold text-cortex-green mb-4">🎯 POV Templates</h3>
          <div className="space-y-3">
            {[
              { name: 'Executive Overview', type: 'C-Suite Demo', usage: 156 },
              { name: 'Technical Deep Dive', type: 'SOC Team', usage: 89 },
              { name: 'Compliance Focus', type: 'Risk Team', usage: 67 }
            ].map((template, idx) => (
              <div key={idx} className="p-3 bg-cortex-bg-quaternary rounded border border-cortex-border-muted">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-cortex-text-primary text-sm">{template.name}</div>
                    <div className="text-xs text-cortex-text-muted">{template.type}</div>
                  </div>
                  <div className="text-xs text-cortex-green">{template.usage} uses</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="cortex-card p-6">
          <h3 className="text-lg font-bold text-cortex-green mb-4">📋 Scenario Templates</h3>
          <div className="space-y-3">
            {[
              { name: 'Ransomware Chain', type: 'Attack Simulation', mitre: 'T1486' },
              { name: 'Insider Threat', type: 'UEBA Demo', mitre: 'T1078' },
              { name: 'Cloud Posture', type: 'CSPM Demo', mitre: 'T1538' }
            ].map((scenario, idx) => (
              <div key={idx} className="p-3 bg-cortex-bg-quaternary rounded border border-cortex-border-muted">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-cortex-text-primary text-sm">{scenario.name}</div>
                    <div className="text-xs text-cortex-text-muted">{scenario.type}</div>
                  </div>
                  <div className="text-xs text-cortex-info">{scenario.mitre}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="cortex-card p-6">
          <h3 className="text-lg font-bold text-cortex-green mb-4">🔬 Detection Rules</h3>
          <div className="space-y-3">
            {[
              { name: 'Lateral Movement', category: 'Network', severity: 'High' },
              { name: 'Data Exfiltration', category: 'DLP', severity: 'Critical' },
              { name: 'Privilege Escalation', category: 'IAM', severity: 'High' }
            ].map((rule, idx) => (
              <div key={idx} className="p-3 bg-cortex-bg-quaternary rounded border border-cortex-border-muted">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-cortex-text-primary text-sm">{rule.name}</div>
                    <div className="text-xs text-cortex-text-muted">{rule.category}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    rule.severity === 'Critical' ? 'bg-cortex-error-bg text-cortex-error' :
                    rule.severity === 'High' ? 'bg-cortex-warning-bg text-cortex-warning' :
                    'bg-cortex-info-bg text-cortex-info'
                  }`}>
                    {rule.severity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  switch (activeCreator) {
    case 'analytics':
      return <AnalyticsView />;
    case 'library':
      return <LibraryView />;
    case 'pov':
    case 'template':
    case 'scenario':
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-cortex-green">Creating {activeCreator.toUpperCase()}</h2>
            <button 
              onClick={() => setActiveCreator('overview')}
              className="btn-cortex-secondary"
            >
              ← Back to Overview
            </button>
          </div>
          <EnhancedManualCreationGUI />
        </div>
      );
    default:
      return <CreatorOverview />;
  }
};

// Import required components
const XSIAMIntegrationPanel = React.lazy(() => import('./XSIAMIntegrationPanel'));
const BigQueryExportPanel = React.lazy(() => import('./BigQueryExportPanel'));

const guiTabs: GUITab[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '📊',
    component: EnhancedPOVDashboard,
    description: 'Enhanced POV dashboard with command integration',
    breadcrumb: 'Dashboard'
  },
  {
    id: 'trr',
    name: 'TRR Management',
    icon: '📋',
    component: EnhancedTRRManagement,
    description: 'Advanced TRR management with blockchain validation',
    breadcrumb: 'TRR Management'
  },
  {
    id: 'ai',
    name: 'AI Insights',
    icon: '🤖',
    component: EnhancedAIInsights,
    description: 'Real-time AI analysis and recommendations',
    breadcrumb: 'AI Insights'
  },
  {
    id: 'creator',
    name: 'Content Creator',
    icon: '🛠️',
    component: EnhancedContentCreator,
    description: 'Visual creation tools for POVs and scenarios',
    breadcrumb: 'Content Creator'
  },
  {
    id: 'xsiam',
    name: 'XSIAM Integration',
    icon: '🔗',
    component: () => (
      <React.Suspense fallback={<div className="text-cyan-400">Loading XSIAM Integration...</div>}>
        <XSIAMIntegrationPanel />
      </React.Suspense>
    ),
    description: 'Connect to XSIAM tenant for real-time security data',
    breadcrumb: 'XSIAM Integration'
  },
  {
    id: 'analytics',
    name: 'BigQuery Export',
    icon: '📊',
    component: () => (
      <React.Suspense fallback={<div className="text-teal-400">Loading BigQuery Export...</div>}>
        <BigQueryExportPanel />
      </React.Suspense>
    ),
    description: 'Export analytics data to Google BigQuery',
    breadcrumb: 'BigQuery Export'
  }
];

export default function EnhancedGUIInterface() {
  const { state, actions } = useAppState();
  const activeTab = state.navigation.activeGUITab;
  
  const ActiveComponent = guiTabs.find(tab => tab.id === activeTab)?.component || EnhancedPOVDashboard;

  useEffect(() => {
    // Handle pending GUI actions from terminal commands
    if (state.commandBridge.pendingGUIAction) {
      const action = state.commandBridge.pendingGUIAction;
      const data = state.commandBridge.crossInterfaceData;
      
      // Process the GUI action
      switch (action) {
        case 'switch_to_trr':
          actions.setActiveGUITab('trr');
          break;
        case 'switch_to_ai':
          actions.setActiveGUITab('ai');
          break;
        case 'open_creator':
          actions.setActiveGUITab('creator');
          break;
        default:
          actions.notify('info', `GUI action triggered: ${action}`);
      }
      
      // Clear the pending action
      actions.triggerGUIAction('', null);
    }
  }, [state.commandBridge.pendingGUIAction, actions]);

  const handleTabChange = (tabId: string) => {
    actions.setActiveGUITab(tabId);
    const tab = guiTabs.find(t => t.id === tabId);
    if (tab) {
      actions.updateBreadcrumbs([
        { label: 'Home', path: '/gui' },
        { label: tab.breadcrumb, path: `/gui/${tabId}` },
      ]);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* GUI Tab Navigation */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex space-x-1 overflow-x-auto">
          {guiTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors whitespace-nowrap flex items-center space-x-2 ${
                activeTab === tab.id 
                  ? 'text-cortex-green border-cortex-green bg-gray-800/50' 
                  : 'text-gray-400 border-gray-600 hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Description */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <span className="text-cortex-green">
              {guiTabs.find(tab => tab.id === activeTab)?.icon} {guiTabs.find(tab => tab.id === activeTab)?.name}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">{guiTabs.find(tab => tab.id === activeTab)?.description}</span>
          </div>
          <div className="text-gray-500 text-xs">
            Interactive • Command-enabled • Real-time
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <ActiveComponent />
      </div>
    </div>
  );
}