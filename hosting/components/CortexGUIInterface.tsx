'use client';

import React, { useState, useEffect } from 'react';
import EnhancedManualCreationGUI from './EnhancedManualCreationGUI';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { userManagementService } from '../lib/user-management';
import { XSIAMHealthMonitor } from './XSIAMHealthMonitor';
import { EnhancedAIAssistant } from './EnhancedAIAssistant';
import { BigQueryExplorer } from './BigQueryExplorer';
import { POVProjectManagement } from './POVProjectManagement';
import { ProductionTRRManagement } from './ProductionTRRManagement';
import { ManagementDashboard } from './ManagementDashboard';
import ScenarioEngine from './ScenarioEngine';

interface GUITab {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType;
  description: string;
}

interface QuickAction {
  name: string;
  icon: string;
  description: string;
  onClick: () => void;
  className: string;
}

const POVDashboard = () => {
  // Helper to create a Blueprint PDF from GUI
  const createGuiBlueprintPdf = async () => {
    try {
      const customer = window.prompt('Enter customer name for the Blueprint PDF:', 'Customer') || 'Customer';
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const lines = [
        'POV Badass Blueprint (GUI)',
        `Customer: ${customer}`,
        `Timeframe: 90d`,
        'Engagements: 12',
        'Scenarios Executed: 34',
        'Detections Validated: 78',
        'TRR Win Rate: 82%',
        'Average Cycle: 41 days',
        '',
        'Transformation Journey:',
        '- Current State:',
        '   • Fragmented tooling',
        '   • Manual incident triage',
        '   • Limited detection coverage',
        '- Transition:',
        '   • Unified telemetry to XSIAM',
        '   • Automated playbooks',
        '   • MITRE-aligned detections',
        '- Target State:',
        '   • Proactive threat hunting',
        '   • Continuous validation',
        '   • Business-aligned KPIs'
      ];
      let y = 10;
      doc.setFontSize(14);
      lines.forEach((l, idx) => {
        if (idx === 0) doc.setFont(undefined, 'bold'); else doc.setFont(undefined, 'normal');
        doc.text(l, 10, y);
        y += 8;
        if (y > 280) { doc.addPage(); y = 10; }
      });
      doc.save(`POV_Blueprint_${customer}.pdf`);
    } catch (e) {
      alert('Failed to generate PDF.');
    }
  };

  // Functional dashboard actions with proper routing
  const quickActions: QuickAction[] = [
    {
      name: 'New POV',
      icon: '🎯',
      description: 'Initialize a new Proof of Value project',
      onClick: () => {
        // Switch to project management tab and trigger new POV creation
        if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
          // If in iframe, post message to parent
          window.parent.postMessage({ action: 'navigate', tab: 'projects' }, '*');
        } else {
          // Direct navigation within the app
          const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'projects', action: 'create-pov' } });
          window.dispatchEvent(event);
        }
      },
      className: 'bg-green-900 bg-opacity-20 border-green-500 border-opacity-30 hover:bg-green-900 hover:bg-opacity-40 text-green-400'
    },
    {
      name: 'Upload CSV',
      icon: '📄',
      description: 'Import TRR data from CSV file',
      onClick: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            // Navigate to TRR tab with import mode
            const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'trr', action: 'import-csv', file: file.name } });
            window.dispatchEvent(event);
          }
        };
        input.click();
      },
      className: 'bg-blue-900 bg-opacity-20 border-blue-500 border-opacity-30 hover:bg-blue-900 hover:bg-opacity-40 text-blue-400'
    },
    {
      name: 'Generate Report',
      icon: '📝',
      description: 'Create executive or technical report',
      onClick: () => {
        // Navigate to data explorer with report generation mode
        const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'data', action: 'generate-report' } });
        window.dispatchEvent(event);
      },
      className: 'bg-purple-900 bg-opacity-20 border-purple-500 border-opacity-30 hover:bg-purple-900 hover:bg-opacity-40 text-purple-400'
    },
    {
      name: 'AI Analysis',
      icon: '🤖',
      description: 'Run Gemini AI analysis on current data',
      onClick: () => {
        // Navigate to AI assistant tab
        const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'ai', action: 'start-analysis' } });
        window.dispatchEvent(event);
      },
      className: 'bg-cyan-900 bg-opacity-20 border-cyan-500 border-opacity-30 hover:bg-cyan-900 hover:bg-opacity-40 text-cyan-400'
    },
    {
      name: 'Detection Engine',
      icon: '🔧',
      description: 'Access detection scripts and automation tools',
      onClick: () => {
        // Open detection engine (formerly template creator) with competitive focus
        const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'creator', action: 'detection-engine' } });
        window.dispatchEvent(event);
      },
      className: 'bg-orange-900 bg-opacity-20 border-orange-500 border-opacity-30 hover:bg-orange-900 hover:bg-opacity-40 text-orange-400'
    },
    {
      name: 'Badass Blueprint',
      icon: '🧭',
      description: 'Create transformation blueprint and download PDF',
      onClick: createGuiBlueprintPdf,
      className: 'bg-pink-900 bg-opacity-20 border-pink-500 border-opacity-30 hover:bg-pink-900 hover:bg-opacity-40 text-pink-400'
    }
  ];

  const activityData = [
    { action: 'POV Completed', target: 'Enterprise Banking Corp (vs Splunk)', time: '2 hours ago', status: 'success' },
    { action: 'Detection Deployed', target: 'Lateral Movement vs CrowdStrike', time: '4 hours ago', status: 'info' },
    { action: 'SOAR Playbook', target: 'Automated Triage vs Phantom', time: '6 hours ago', status: 'warning' },
    { action: 'TRR-SDW Linked', target: 'Multi-Cloud Security Design', time: '8 hours ago', status: 'success' },
    { action: 'Analytics Query', target: '10x Faster than Splunk SPL', time: '1 day ago', status: 'info' },
    { action: 'Cost Analysis', target: '60% Savings vs Sentinel', time: '1 day ago', status: 'success' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-gradient-to-r from-green-900 from-opacity-20 to-blue-900 to-opacity-20 p-6 rounded-lg border border-green-500 border-opacity-30">
        <h2 className="text-2xl font-bold text-green-400 mb-4">🎯 POV Management Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-green-500 border-opacity-20">
            <h3 className="text-lg font-bold text-green-300 mb-2">Active POVs</h3>
            <div className="text-3xl font-mono text-green-400">12</div>
            <div className="text-sm text-gray-400 mt-2">3 in progress, 9 completed</div>
            <div className="text-xs text-red-300 mt-1">vs Splunk's complex setup</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-blue-500 border-opacity-20">
            <h3 className="text-lg font-bold text-blue-300 mb-2">Detection Scripts</h3>
            <div className="text-3xl font-mono text-blue-400">47</div>
            <div className="text-sm text-gray-400 mt-2">Production-ready detections</div>
            <div className="text-xs text-red-300 mt-1">vs CrowdStrike IOA limits</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-purple-500 border-opacity-20">
            <h3 className="text-lg font-bold text-purple-300 mb-2">TRR-SDW Pairs</h3>
            <div className="text-3xl font-mono text-purple-400">23</div>
            <div className="text-sm text-gray-400 mt-2">Linked design workbooks</div>
            <div className="text-xs text-red-300 mt-1">vs manual documentation</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-orange-500 border-opacity-20">
            <h3 className="text-lg font-bold text-orange-300 mb-2">Cost Savings</h3>
            <div className="text-3xl font-mono text-orange-400">54%</div>
            <div className="text-sm text-gray-400 mt-2">Avg vs competitors</div>
            <div className="text-xs text-red-300 mt-1">Splunk/CrowdStrike/Sentinel</div>
          </div>
        </div>
      </div>
      
      {/* Activity and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded border border-gray-700">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">📊 Recent Activity</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-800 bg-opacity-30 rounded hover:bg-gray-700 bg-opacity-30 transition-colors">
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
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded border border-gray-700">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`p-4 rounded border transition-all duration-200 text-center hover:scale-105 hover:shadow-lg ${action.className}`}
                title={action.description}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="text-sm font-mono">{action.name}</div>
              </button>
            ))}
          </div>
          
          {/* Additional Actions */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <h4 className="text-sm font-bold text-gray-300 mb-2">Advanced Actions</h4>
            <div className="space-y-2">
              <button 
                onClick={() => {
                  const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'xsiam', action: 'sync-tenant' } });
                  window.dispatchEvent(event);
                }}
                className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white"
              >
                🔄 Sync with XSIAM tenant
              </button>
              <button 
                onClick={() => {
                  const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'data', action: 'export-dashboard' } });
                  window.dispatchEvent(event);
                }}
                className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white"
              >
                📋 Export current dashboard
              </button>
              <button 
                onClick={() => {
                  const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'analytics', action: 'system-metrics' } });
                  window.dispatchEvent(event);
                }}
                className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white"
              >
                📊 View system metrics
              </button>
              <button 
                onClick={() => {
                  const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'trr', action: 'create-sdw' } });
                  window.dispatchEvent(event);
                }}
                className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-yellow-400 hover:text-yellow-300 border-t border-gray-600 mt-2 pt-2"
              >
                📝 Create Solution Design Workbook (SDW)
              </button>
              <button 
                onClick={() => {
                  window.open('/terminal', '_blank');
                }}
                className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-green-400 hover:text-green-300"
              >
                ⌨️ Open Terminal Interface
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



const guiTabs: GUITab[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '📊',
    component: POVDashboard,
    description: 'Overview of POVs, metrics, and activity'
  },
  {
    id: 'pov',
    name: 'POV Management',
    icon: '🎯',
    component: POVProjectManagement,
    description: 'Complete POV lifecycle management and planning'
  },
  {
    id: 'trr',
    name: 'TRR Management',
    icon: '📋',
    component: ProductionTRRManagement,
    description: 'Production-quality Technical Requirements Review system with full workflow automation'
  },
  {
    id: 'xsiam',
    name: 'XSIAM Health',
    icon: '🏥',
    component: XSIAMHealthMonitor,
    description: 'Real-time XSIAM system health monitoring and alerting'
  },
  {
    id: 'ai',
    name: 'AI Assistant',
    icon: '🤖',
    component: EnhancedAIAssistant,
    description: 'Enhanced AI assistant with workflow integration'
  },
  {
    id: 'data',
    name: 'Data Explorer',
    icon: '📈',
    component: BigQueryExplorer,
    description: 'BigQuery data export and analytics platform'
  },
  {
    id: 'creator',
    name: 'Detection Engine',
    icon: '🔧',
    component: EnhancedManualCreationGUI,
    description: 'Detection scripts, automation tools, and security scenarios (vs Splunk/CrowdStrike)'
  },
  {
    id: 'scenarios',
    name: 'Scenario Engine',
    icon: '🚀',
    component: ScenarioEngine,
    description: 'Comprehensive AI-driven scenario orchestration with real-time execution monitoring and adaptive learning'
  },
  {
    id: 'admin',
    name: 'Management',
    icon: '⚙️',
    component: ManagementDashboard,
    description: 'Administrative dashboard for user management and system oversight'
  }
];

export default function CortexGUIInterface() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [isManagementMode, setIsManagementMode] = useState(false);
  const [userPermissions, setUserPermissions] = useState({});
  const [currentDateTime, setCurrentDateTime] = useState('');
  
  const { trackFeatureUsage, trackPageView } = useActivityTracking();
  
  useEffect(() => {
    // Initialize user context and permissions
    const users = userManagementService.getAllUsers();
    if (users.length > 0) {
      const user = users[0]; // Use first demo user
      setCurrentUser(user);
      
      // Determine management mode based on role
      const isManager = ['admin', 'manager'].includes(user?.role || '');
      setIsManagementMode(isManager);
      
      // Set role-based permissions
      const permissions = {
        canViewUserData: true,
        canViewAggregatedData: ['admin', 'manager'].includes(user?.role || ''),
        canManageUsers: user?.role === 'admin',
        canAccessAllProjects: ['admin', 'manager'].includes(user?.role || ''),
        canModifySystemSettings: user?.role === 'admin',
        canViewAnalytics: ['admin', 'manager', 'senior_dc'].includes(user?.role || ''),
        canAccessAdmin: user?.role === 'admin',
        canDeployScenarios: ['admin', 'manager', 'senior_dc', 'dc'].includes(user?.role || ''),
        canCreateTRR: ['admin', 'manager', 'senior_dc', 'dc'].includes(user?.role || ''),
        canAccessScenarioEngine: ['admin', 'manager', 'senior_dc', 'dc'].includes(user?.role || ''),
        canViewReports: true
      };
      setUserPermissions(permissions);
    }
    
    // Track GUI initialization
    trackFeatureUsage('gui', 'interface_loaded');
    trackPageView('/gui');
  }, [trackFeatureUsage, trackPageView]);
  
  // Update current date/time
  useEffect(() => {
    const updateDateTime = () => {
      setCurrentDateTime(new Date().toLocaleString());
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);
  
  const handleTabChange = (tabId: string, action?: string, metadata?: any) => {
    const previousTab = activeTab;
    setActiveTab(tabId);
    
    // Track tab navigation with action context
    trackFeatureUsage('navigation', 'tab_change', {
      component: `${previousTab}_to_${tabId}`,
      success: true
    });
    
    trackPageView(`/gui/${tabId}`);
    
    // Handle specific actions when navigating to tabs
    if (action) {
      setTimeout(() => {
        const event = new CustomEvent(`tab-${tabId}-action`, {
          detail: { action, metadata }
        });
        window.dispatchEvent(event);
      }, 100); // Allow tab to render first
    }
  };
  
  // Listen for custom navigation events from dashboard buttons
  useEffect(() => {
    const handleNavigationEvent = (event: CustomEvent) => {
      const { tabId, action, ...metadata } = event.detail;
      handleTabChange(tabId, action, metadata);
    };
    
    window.addEventListener('navigate-to-tab', handleNavigationEvent as EventListener);
    
    return () => {
      window.removeEventListener('navigate-to-tab', handleNavigationEvent as EventListener);
    };
  }, []);
  
  // Filter tabs based on user role
  const getVisibleTabs = () => {
    if (!currentUser) return guiTabs;
    
    return guiTabs.filter(tab => {
      switch (tab.id) {
        case 'admin':
          return currentUser.role === 'admin';
        case 'data':
          return ['admin', 'manager', 'senior_dc'].includes(currentUser.role);
        case 'scenarios':
          return ['admin', 'manager', 'senior_dc', 'dc'].includes(currentUser.role);
        default:
          return true;
      }
    });
  };
  
  const visibleTabs = getVisibleTabs();
  const ActiveComponent = visibleTabs.find(tab => tab.id === activeTab)?.component || POVDashboard;

  return (
    <div className="bg-black text-white min-h-screen">
      {/* User Context Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-cyan-400">🏢 Cortex Domain Consultant Platform</h1>
            {currentUser && (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-300">
                  Welcome, <span className="text-cyan-400">{currentUser.firstName} {currentUser.lastName}</span>
                  <span className="text-gray-500 ml-2">• {currentUser.role}</span>
                </div>
                {isManagementMode && (
                  <div className="text-xs text-orange-400 bg-orange-900/20 px-2 py-1 rounded border border-orange-500/30">
                    📈 MANAGEMENT MODE
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  Data View: {isManagementMode ? 'Aggregated' : 'Personal'}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-400" data-testid="timestamp">
              {currentDateTime || new Date().toLocaleString()}
            </div>
            {activeTab === 'admin' && !(userPermissions as any).canAccessAdmin && (
              <div className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded">
                🔒 Limited Access
              </div>
            )}
            {isManagementMode && (
              <div className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-500/30">
                ⚙️ Admin View
              </div>
            )}
          </div>
        </div>
        
        {/* Data Segregation Notice */}
        {currentUser && (
          <div className="mt-2 text-xs text-gray-400 border-t border-gray-700 pt-2">
            <div className="flex justify-between items-center">
              <span>
                Current User: <span className="text-cyan-400">{currentUser.email}</span> | 
                Role: <span className="text-yellow-400">{currentUser.role}</span> | 
                Session: <span className="text-green-400">{currentUser.id}</span>
              </span>
              <span>
                Access Level: {isManagementMode ? 
                  <span className="text-orange-400">Management (All Data)</span> : 
                  <span className="text-blue-400">User (Personal Data Only)</span>
                }
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex space-x-1 overflow-x-auto">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              data-feature="navigation"
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
        <div className="flex items-center space-x-3 text-sm">
          <span className="text-cyan-400">
            {visibleTabs.find(tab => tab.id === activeTab)?.icon} {visibleTabs.find(tab => tab.id === activeTab)?.name}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">{visibleTabs.find(tab => tab.id === activeTab)?.description}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <ActiveComponent />
      </div>
    </div>
  );
}
