'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import EnhancedManualCreationGUI from './EnhancedManualCreationGUI';
import BreadcrumbNavigation from './BreadcrumbNavigation';

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

  // Enhanced quick actions with terminal command integration
  const quickActions: QuickAction[] = [
    {
      name: 'New POV',
      icon: '🎯',
      description: 'Initialize a new Proof of Value project',
      command: 'pov create --interactive',
      className: 'bg-green-900 bg-opacity-20 border-green-500 border-opacity-30 hover:bg-green-900 hover:bg-opacity-40 text-green-400'
    },
    {
      name: 'Run Analytics',
      icon: '📊',
      description: 'Execute JY2K analytics dashboard',
      command: 'jy2k --region GLOBAL --detailed',
      className: 'bg-blue-900 bg-opacity-20 border-blue-500 border-opacity-30 hover:bg-blue-900 hover:bg-opacity-40 text-blue-400'
    },
    {
      name: 'Generate Report',
      icon: '📝',
      description: 'Create executive or technical report',
      action: 'generate_report',
      className: 'bg-purple-900 bg-opacity-20 border-purple-500 border-opacity-30 hover:bg-purple-900 hover:bg-opacity-40 text-purple-400'
    },
    {
      name: 'Deploy Scenario',
      icon: '🚀',
      description: 'Deploy a security scenario',
      command: 'scenario deploy --interactive',
      className: 'bg-cyan-900 bg-opacity-20 border-cyan-500 border-opacity-30 hover:bg-cyan-900 hover:bg-opacity-40 text-cyan-400'
    },
    {
      name: 'AI Analysis',
      icon: '🤖',
      description: 'Run Gemini AI analysis on current data',
      command: 'gemini analyze --context dashboard',
      className: 'bg-indigo-900 bg-opacity-20 border-indigo-500 border-opacity-30 hover:bg-indigo-900 hover:bg-opacity-40 text-indigo-400'
    },
    {
      name: 'Badass Blueprint',
      icon: '🧭',
      description: 'Create transformation blueprint and download PDF',
      command: 'pov --badass-blueprint',
      className: 'bg-pink-900 bg-opacity-20 border-pink-500 border-opacity-30 hover:bg-pink-900 hover:bg-opacity-40 text-pink-400'
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
      {/* Enhanced Stats Overview with real-time data */}
      <div className="bg-gradient-to-r from-green-900 from-opacity-20 to-blue-900 to-opacity-20 p-6 rounded-lg border border-green-500 border-opacity-30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-green-400">🎯 POV Management Dashboard</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => executeCommand('status --analytics')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              Refresh Data
            </button>
            <button 
              onClick={() => actions.setActiveGUITab('ai')}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
            >
              AI Insights
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-green-500 border-opacity-20 cursor-pointer hover:bg-opacity-70 transition-all"
               onClick={() => executeCommand('pov list --active')}>
            <h3 className="text-lg font-bold text-green-300 mb-2">Active POVs</h3>
            <div className="text-3xl font-mono text-green-400">
              {state.data.povs?.length || 12}
            </div>
            <div className="text-sm text-gray-400 mt-2">3 in progress, 9 completed</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-blue-500 border-opacity-20 cursor-pointer hover:bg-opacity-70 transition-all"
               onClick={() => executeCommand('scenario list --deployed')}>
            <h3 className="text-lg font-bold text-blue-300 mb-2">Templates Used</h3>
            <div className="text-3xl font-mono text-blue-400">
              {state.data.scenarios?.length || 27}
            </div>
            <div className="text-sm text-gray-400 mt-2">Across 8 scenarios</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-purple-500 border-opacity-20 cursor-pointer hover:bg-opacity-70 transition-all"
               onClick={() => executeCommand('project list --active')}>
            <h3 className="text-lg font-bold text-purple-300 mb-2">Customer Engagements</h3>
            <div className="text-3xl font-mono text-purple-400">
              {state.data.projects?.length || 8}
            </div>
            <div className="text-sm text-gray-400 mt-2">5 enterprise, 3 mid-market</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-yellow-500 border-opacity-20 cursor-pointer hover:bg-opacity-70 transition-all"
               onClick={() => executeCommand('detect list --recent')}>
            <h3 className="text-lg font-bold text-yellow-300 mb-2">Detections</h3>
            <div className="text-3xl font-mono text-yellow-400">
              {state.data.detections?.length || 156}
            </div>
            <div className="text-sm text-gray-400 mt-2">78 validated</div>
          </div>
        </div>
      </div>
      
      {/* Activity and Actions with Command Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity with clickable commands */}
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-cyan-400">📊 Recent Activity</h3>
            <button 
              onClick={() => executeCommand('activity --recent --limit 10')}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline"
            >
              View More
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-800 bg-opacity-30 rounded hover:bg-gray-700 hover:bg-opacity-30 transition-colors cursor-pointer"
                   onClick={() => executeCommand(item.command)}>
                <div className="flex-1">
                  <div className="font-mono text-white text-sm">{item.action}</div>
                  <div className="text-gray-400 text-xs">{item.target}</div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-xs font-mono ${
                    item.status === 'success' ? 'text-green-400' : 
                    item.status === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                  }`}>
                    {item.time}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Click for details</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Enhanced Quick Actions */}
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded border border-gray-700">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action)}
                disabled={state.ui.loadingStates.command_execution}
                className={`p-4 rounded border transition-all duration-200 text-center hover:scale-105 hover:shadow-lg ${action.className} disabled:opacity-50 disabled:cursor-not-allowed`}
                title={action.description}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="text-sm font-mono">{action.name}</div>
                {action.command && (
                  <div className="text-xs text-gray-400 mt-1 truncate" title={action.command}>
                    {action.command}
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Command Terminal Integration */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <h4 className="text-sm font-bold text-gray-300 mb-2">Terminal Integration</h4>
            <div className="space-y-2">
              <button 
                onClick={() => actions.setMode('terminal')}
                className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white"
              >
                🔄 Switch to Terminal Mode
              </button>
              <button 
                onClick={() => executeCommand('help --category pov')}
                className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white"
              >
                📋 View POV Commands
              </button>
              <div className="text-xs text-gray-500 mt-2">
                Last command: {state.commandBridge.lastExecutedCommand || 'None'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Command Execution Status */}
      {state.ui.loadingStates.command_execution && (
        <div className="fixed bottom-4 right-4 bg-blue-900 bg-opacity-90 text-blue-400 px-4 py-2 rounded border border-blue-500">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-sm">Executing command...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced TRR Management with API integration
const EnhancedTRRManagement = () => {
  const { actions } = useAppState();
  
  useEffect(() => {
    actions.updateBreadcrumbs([
      { label: 'Home', path: '/gui' },
      { label: 'TRR Management', path: '/gui/trr' },
    ]);
  }, [actions]);

  // ... (similar enhancements as POV Dashboard)
  // This would include command integration for TRR operations
  return (
    <div className="space-y-6">
      <div className="text-orange-400 text-xl font-bold">🚧 Enhanced TRR Management Coming Soon</div>
      <div className="text-gray-400">This component will include:</div>
      <ul className="text-gray-400 list-disc list-inside space-y-1">
        <li>Command integration for TRR operations</li>
        <li>Real-time blockchain validation status</li>
        <li>Interactive TRR creation and editing</li>
        <li>Automated validation workflows</li>
      </ul>
    </div>
  );
};

// Enhanced AI Insights with real-time integration
const EnhancedAIInsights = () => {
  const { actions } = useAppState();
  
  useEffect(() => {
    actions.updateBreadcrumbs([
      { label: 'Home', path: '/gui' },
      { label: 'AI Insights', path: '/gui/ai' },
    ]);
  }, [actions]);

  return (
    <div className="space-y-6">
      <div className="text-indigo-400 text-xl font-bold">🚧 Enhanced AI Insights Coming Soon</div>
      <div className="text-gray-400">This component will include:</div>
      <ul className="text-gray-400 list-disc list-inside space-y-1">
        <li>Real-time Gemini AI integration</li>
        <li>Interactive chat interface</li>
        <li>Command-triggered analysis</li>
        <li>Contextual recommendations based on current data</li>
      </ul>
    </div>
  );
};

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
    component: EnhancedManualCreationGUI,
    description: 'Visual creation tools for POVs and scenarios',
    breadcrumb: 'Content Creator'
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
      <BreadcrumbNavigation />
      
      {/* GUI Tab Navigation */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex space-x-1 overflow-x-auto">
          {guiTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors whitespace-nowrap flex items-center space-x-2 ${
                activeTab === tab.id 
                  ? 'text-cyan-400 border-cyan-500 bg-gray-800/50' 
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
            <span className="text-cyan-400">
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