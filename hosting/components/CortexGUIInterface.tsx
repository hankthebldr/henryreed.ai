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

  const quickActions: QuickAction[] = [
    {
      name: 'New POV',
      icon: '🎯',
      description: 'Initialize a new Proof of Value project',
      onClick: () => alert('New POV creation initiated'),
      className: 'bg-green-900 bg-opacity-20 border-green-500 border-opacity-30 hover:bg-green-900 hover:bg-opacity-40 text-green-400'
    },
    {
      name: 'Upload CSV',
      icon: '📊',
      description: 'Import TRR data from CSV file',
      onClick: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = () => alert('CSV upload functionality would be implemented here');
        input.click();
      },
      className: 'bg-blue-900 bg-opacity-20 border-blue-500 border-opacity-30 hover:bg-blue-900 hover:bg-opacity-40 text-blue-400'
    },
    {
      name: 'Generate Report',
      icon: '📝',
      description: 'Create executive or technical report',
      onClick: () => alert('Report generation started'),
      className: 'bg-purple-900 bg-opacity-20 border-purple-500 border-opacity-30 hover:bg-purple-900 hover:bg-opacity-40 text-purple-400'
    },
    {
      name: 'AI Analysis',
      icon: '🤖',
      description: 'Run Gemini AI analysis on current data',
      onClick: () => alert('AI analysis initiated'),
      className: 'bg-cyan-900 bg-opacity-20 border-cyan-500 border-opacity-30 hover:bg-cyan-900 hover:bg-opacity-40 text-cyan-400'
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
    { action: 'POV Completed', target: 'Enterprise Banking Corp', time: '2 hours ago', status: 'success' },
    { action: 'Template Deployed', target: 'Ransomware Chain v2.1', time: '4 hours ago', status: 'info' },
    { action: 'Detection Generated', target: 'T1078 Account Access', time: '6 hours ago', status: 'warning' },
    { action: 'TRR Validated', target: 'Multi-Cloud Security', time: '1 day ago', status: 'success' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-gradient-to-r from-green-900 from-opacity-20 to-blue-900 to-opacity-20 p-6 rounded-lg border border-green-500 border-opacity-30">
        <h2 className="text-2xl font-bold text-green-400 mb-4">🎯 POV Management Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-green-500 border-opacity-20">
            <h3 className="text-lg font-bold text-green-300 mb-2">Active POVs</h3>
            <div className="text-3xl font-mono text-green-400">12</div>
            <div className="text-sm text-gray-400 mt-2">3 in progress, 9 completed</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-blue-500 border-opacity-20">
            <h3 className="text-lg font-bold text-blue-300 mb-2">Templates Used</h3>
            <div className="text-3xl font-mono text-blue-400">27</div>
            <div className="text-sm text-gray-400 mt-2">Across 8 scenarios</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-purple-500 border-opacity-20">
            <h3 className="text-lg font-bold text-purple-300 mb-2">Customer Engagements</h3>
            <div className="text-3xl font-mono text-purple-400">8</div>
            <div className="text-sm text-gray-400 mt-2">5 enterprise, 3 mid-market</div>
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
              <button className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white">
                🔄 Sync with XSIAM tenant
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white">
                📋 Export current dashboard
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-gray-800 hover:bg-opacity-50 transition-colors text-sm text-gray-400 hover:text-white">
                ⚙️ Configure notifications
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
    name: 'Content Creator',
    icon: '🛠️',
    component: EnhancedManualCreationGUI,
    description: 'Create POVs, templates, and scenarios visually'
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
  
  const { trackFeatureUsage, trackPageView } = useActivityTracking();
  
  useEffect(() => {
    // Initialize user context
    const users = userManagementService.getAllUsers();
    if (users.length > 0) {
      setCurrentUser(users[0]); // Use first demo user
    }
    
    // Track GUI initialization
    trackFeatureUsage('gui', 'interface_loaded');
    trackPageView('/gui');
  }, [trackFeatureUsage, trackPageView]);
  
  const handleTabChange = (tabId: string) => {
    const previousTab = activeTab;
    setActiveTab(tabId);
    
    // Track tab navigation
    trackFeatureUsage('navigation', 'tab_change', {
      component: `${previousTab}_to_${tabId}`,
      success: true
    });
    
    trackPageView(`/gui/${tabId}`);
  };
  
  // Filter tabs based on user role
  const getVisibleTabs = () => {
    if (!currentUser) return guiTabs;
    
    return guiTabs.filter(tab => {
      switch (tab.id) {
        case 'admin':
          return currentUser.role === 'admin';
        case 'data':
          return ['admin', 'manager', 'senior_dc'].includes(currentUser.role);
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
              <div className="text-sm text-gray-300">
                Welcome, <span className="text-cyan-400">{currentUser.firstName} {currentUser.lastName}</span>
                <span className="text-gray-500 ml-2">• {currentUser.role}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-400">
              {new Date().toLocaleString()}
            </div>
            {activeTab === 'admin' && currentUser?.role !== 'admin' && (
              <div className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded">
                🔒 Limited Access
              </div>
            )}
          </div>
        </div>
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
