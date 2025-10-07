'use client';

import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { userManagementService } from '../lib/user-management';

// Lazy load heavy components for better performance
const EnhancedManualCreationGUI = lazy(() => import('./EnhancedManualCreationGUI'));
const XSIAMHealthMonitor = lazy(() => import('./XSIAMHealthMonitor').then(m => ({ default: m.XSIAMHealthMonitor })));
const EnhancedAIAssistant = lazy(() => import('./EnhancedAIAssistant').then(m => ({ default: m.EnhancedAIAssistant })));
const BigQueryExplorer = lazy(() => import('./BigQueryExplorer').then(m => ({ default: m.BigQueryExplorer })));
const POVProjectManagement = lazy(() => import('./POVProjectManagement').then(m => ({ default: m.POVProjectManagement })));
const ProductionTRRManagement = lazy(() => import('./ProductionTRRManagement').then(m => ({ default: m.ProductionTRRManagement })));
const ManagementDashboard = lazy(() => import('./ManagementDashboard').then(m => ({ default: m.ManagementDashboard })));
const UnifiedContentCreator = lazy(() => import('./UnifiedContentCreator'));

// Loading component with Cortex styling
const ComponentLoader = React.memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-cortex-border-muted border-t-cortex-orange mx-auto mb-4"></div>
      <div className="text-cortex-text-muted text-sm">Loading component...</div>
    </div>
  </div>
));
ComponentLoader.displayName = 'ComponentLoader';

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

const POVDashboard = React.memo(() => {
  // Optimized Blueprint PDF creation with better error handling
  const createGuiBlueprintPdf = useCallback(async () => {
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
      console.error('PDF generation failed:', e);
      alert('Failed to generate PDF. Please try again.');
    }
  }, []);

  // Memoized functional dashboard actions with proper routing
  const quickActions: QuickAction[] = useMemo(() => [
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
  ], [createGuiBlueprintPdf]);

  // Memoized activity data for performance
  const activityData = useMemo(() => [
    { action: 'POV Completed', target: 'Enterprise Banking Corp (vs Splunk)', time: '2 hours ago', status: 'success' },
    { action: 'Detection Deployed', target: 'Lateral Movement vs CrowdStrike', time: '4 hours ago', status: 'info' },
    { action: 'SOAR Playbook', target: 'Automated Triage vs Phantom', time: '6 hours ago', status: 'warning' },
    { action: 'TRR-SDW Linked', target: 'Multi-Cloud Security Design', time: '8 hours ago', status: 'success' },
    { action: 'Analytics Query', target: '10x Faster than Splunk SPL', time: '1 day ago', status: 'info' },
    { action: 'Cost Analysis', target: '60% Savings vs Sentinel', time: '1 day ago', status: 'success' }
  ], []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cortex-bg-primary via-cortex-bg-secondary to-cortex-bg-primary p-6 space-y-8">
      {/* Modern Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cortex-orange/10 via-cortex-green/5 to-cortex-info/10 rounded-3xl" />
        <div className="relative bg-cortex-bg-tertiary/40 backdrop-blur-xl border border-cortex-border-secondary/30 rounded-3xl p-8 shadow-2xl shadow-cortex-orange/10">
          <div className="flex flex-col lg:flex-row items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-cortex-text-primary mb-2 flex items-center">
                <span className="text-cortex-orange mr-3">🎯</span>
                Cortex DC Portal
              </h1>
              <p className="text-cortex-text-muted text-lg">Domain Consultant Engagement Platform</p>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cortex-success rounded-full animate-pulse"></div>
                  <span className="text-cortex-text-secondary text-sm">Live Platform</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cortex-info rounded-full"></div>
                  <span className="text-cortex-text-secondary text-sm">12 Active POVs</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-light text-cortex-text-primary">98.7%</div>
              <div className="text-cortex-text-muted text-sm">Success Rate</div>
            </div>
          </div>

          {/* Modern Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cortex-success/20 to-cortex-success/5 p-6 hover:from-cortex-success/30 hover:to-cortex-success/10 transition-all duration-300 transform hover:scale-105 border border-cortex-success/20">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">📈</div>
                <div className="text-xs bg-cortex-success/20 text-cortex-success px-2 py-1 rounded-full">+15%</div>
              </div>
              <div className="text-2xl font-bold text-cortex-text-primary mb-1">12</div>
              <div className="text-cortex-text-secondary text-sm mb-2">Active POVs</div>
              <div className="text-xs text-cortex-text-muted">3 in progress • 9 completed</div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cortex-info/20 to-cortex-info/5 p-6 hover:from-cortex-info/30 hover:to-cortex-info/10 transition-all duration-300 transform hover:scale-105 border border-cortex-info/20">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">🛡️</div>
                <div className="text-xs bg-cortex-info/20 text-cortex-info px-2 py-1 rounded-full">New</div>
              </div>
              <div className="text-2xl font-bold text-cortex-text-primary mb-1">47</div>
              <div className="text-cortex-text-secondary text-sm mb-2">Detection Scripts</div>
              <div className="text-xs text-cortex-text-muted">Production-ready detections</div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cortex-warning/20 to-cortex-warning/5 p-6 hover:from-cortex-warning/30 hover:to-cortex-warning/10 transition-all duration-300 transform hover:scale-105 border border-cortex-warning/20">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">📋</div>
                <div className="text-xs bg-cortex-warning/20 text-cortex-warning px-2 py-1 rounded-full">23</div>
              </div>
              <div className="text-2xl font-bold text-cortex-text-primary mb-1">89%</div>
              <div className="text-cortex-text-secondary text-sm mb-2">TRR Success</div>
              <div className="text-xs text-cortex-text-muted">Linked design workbooks</div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cortex-orange/20 to-cortex-orange/5 p-6 hover:from-cortex-orange/30 hover:to-cortex-orange/10 transition-all duration-300 transform hover:scale-105 border border-cortex-orange/20">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">💰</div>
                <div className="text-xs bg-cortex-orange/20 text-cortex-orange px-2 py-1 rounded-full">ROI</div>
              </div>
              <div className="text-2xl font-bold text-cortex-text-primary mb-1">54%</div>
              <div className="text-cortex-text-secondary text-sm mb-2">Cost Savings</div>
              <div className="text-xs text-cortex-text-muted">vs Splunk/CrowdStrike/Sentinel</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modern Activity and Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cortex-info/5 to-cortex-success/5 rounded-2xl" />
          <div className="relative bg-cortex-bg-tertiary/40 backdrop-blur-xl border border-cortex-border-secondary/30 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-cortex-text-primary flex items-center">
                <span className="text-cortex-info mr-2">📊</span>
                Recent Activity
              </h3>
              <div className="text-xs bg-cortex-info/10 text-cortex-info px-3 py-1 rounded-full border border-cortex-info/20">
                Live Updates
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-cortex-border-secondary scrollbar-track-transparent">
              {activityData.map((item, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-xl bg-cortex-bg-secondary/30 hover:bg-cortex-bg-secondary/50 p-4 transition-all duration-200 border border-cortex-border-muted/20 hover:border-cortex-border-secondary/40">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-cortex-text-primary text-sm mb-1">{item.action}</div>
                      <div className="text-cortex-text-muted text-xs leading-relaxed">{item.target}</div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'success' ? 'bg-cortex-success' : 
                        item.status === 'warning' ? 'bg-cortex-warning' : 'bg-cortex-info'
                      } animate-pulse`}></div>
                      <div className="text-xs text-cortex-text-muted font-mono">
                        {item.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-cortex-border-muted/20">
              <button className="w-full text-center py-2 text-sm text-cortex-text-muted hover:text-cortex-info transition-colors">
                View All Activity →
              </button>
            </div>
          </div>
        </div>
        
        {/* Quick Actions Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cortex-orange/5 to-cortex-warning/5 rounded-2xl" />
          <div className="relative bg-cortex-bg-tertiary/40 backdrop-blur-xl border border-cortex-border-secondary/30 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-cortex-text-primary flex items-center">
                <span className="text-cortex-orange mr-2">⚡</span>
                Quick Actions
              </h3>
              <div className="text-xs bg-cortex-orange/10 text-cortex-orange px-3 py-1 rounded-full border border-cortex-orange/20">
                6 Available
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className="group relative overflow-hidden rounded-xl p-4 text-center transition-all duration-300 transform hover:scale-105 border border-cortex-border-muted/30 hover:border-cortex-orange/40 bg-cortex-bg-secondary/20 hover:bg-cortex-orange/10"
                  title={action.description}
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
                  <div className="text-xs font-medium text-cortex-text-secondary group-hover:text-cortex-text-primary transition-colors">
                    {action.name}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Advanced Actions */}
            <div className="border-t border-cortex-border-muted/20 pt-4">
              <h4 className="text-sm font-medium text-cortex-text-secondary mb-3">Advanced Actions</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'xsiam', action: 'sync-platform' } });
                    window.dispatchEvent(event);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-cortex-bg-secondary/30 transition-colors text-sm text-cortex-text-muted hover:text-cortex-text-primary flex items-center space-x-3 border border-transparent hover:border-cortex-border-secondary/20"
                >
                  <span>🔄</span>
                  <span>Sync demo environment</span>
                </button>
                <button 
                  onClick={() => {
                    const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'data', action: 'export-dashboard' } });
                    window.dispatchEvent(event);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-cortex-bg-secondary/30 transition-colors text-sm text-cortex-text-muted hover:text-cortex-text-primary flex items-center space-x-3 border border-transparent hover:border-cortex-border-secondary/20"
                >
                  <span>📋</span>
                  <span>Export current dashboard</span>
                </button>
                <button 
                  onClick={() => {
                    const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'data', action: 'engagement-metrics' } });
                    window.dispatchEvent(event);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-cortex-bg-secondary/30 transition-colors text-sm text-cortex-text-muted hover:text-cortex-text-primary flex items-center space-x-3 border border-transparent hover:border-cortex-border-secondary/20"
                >
                  <span>📊</span>
                  <span>View engagement metrics</span>
                </button>
                <button 
                  onClick={() => {
                    const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'trr', action: 'create-sdw' } });
                    window.dispatchEvent(event);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-cortex-warning/10 transition-colors text-sm text-cortex-warning hover:text-cortex-warning border border-cortex-warning/20 hover:border-cortex-warning/40 mt-3"
                >
                  <div className="flex items-center space-x-3">
                    <span>📝</span>
                    <span>Create Solution Design Workbook</span>
                  </div>
                </button>
                <button 
                  onClick={() => {
                    window.open('/terminal', '_blank');
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-cortex-success/10 transition-colors text-sm text-cortex-success hover:text-cortex-success border border-cortex-success/20 hover:border-cortex-success/40"
                >
                  <div className="flex items-center space-x-3">
                    <span>⌨️</span>
                    <span>Open Terminal Interface</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
POVDashboard.displayName = 'POVDashboard';



const guiTabs: GUITab[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '📊',
    component: POVDashboard,
    description: 'DC engagement overview, metrics, and activity tracking'
  },
  {
    id: 'pov',
    name: 'POV Management',
    icon: '🎯',
    component: POVProjectManagement,
    description: 'Complete POV lifecycle management and customer engagement planning'
  },
  {
    id: 'trr',
    name: 'TRR & Requirements',
    icon: '📋',
    component: ProductionTRRManagement,
    description: 'Technical Requirements Review and customer requirement documentation'
  },
  {
    id: 'xsiam',
    name: 'Platform Health',
    icon: '🔍',
    component: XSIAMHealthMonitor,
    description: 'Cortex platform monitoring, demo environment health, and system status'
  },
  {
    id: 'ai',
    name: 'AI Assistant',
    icon: '🤖',
    component: EnhancedAIAssistant,
    description: 'AI-powered customer engagement and POV optimization assistant'
  },
  {
    id: 'data',
    name: 'Customer Analytics',
    icon: '📈',
    component: BigQueryExplorer,
    description: 'Customer data analysis and engagement metrics platform'
  },
  {
    id: 'creator',
    name: 'Demo Builder',
    icon: '🔧',
    component: EnhancedManualCreationGUI,
    description: 'Custom demo scenarios and competitive positioning content creation'
  },
  {
    id: 'scenarios',
    name: 'Content Library',
    icon: '🚀',
    component: () => <UnifiedContentCreator mode="unified" onModeChange={() => {}} />,
    description: 'Pre-built demo scenarios, competitive battlecards, and engagement content'
  },
  {
    id: 'admin',
    name: 'DC Management',
    icon: '⚙️',
    component: ManagementDashboard,
    description: 'Domain consultant team management and engagement oversight'
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
  
  const handleTabChange = useCallback((tabId: string, action?: string, metadata?: any) => {
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
  }, [activeTab, trackFeatureUsage, trackPageView]);
  
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
  }, [handleTabChange]);
  
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
    <div className="bg-gradient-to-br from-cortex-bg-primary to-cortex-bg-secondary text-cortex-text-primary min-h-screen">
      {/* Modern Header */}
      <div className="bg-cortex-bg-tertiary/60 backdrop-blur-xl border-b border-cortex-border-secondary/30 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-cortex-text-primary flex items-center">
              <span className="text-cortex-orange mr-3">🏢</span>
              Cortex DC Portal
            </h1>
            {currentUser && (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-cortex-text-secondary">
                  Welcome, <span className="text-cortex-orange font-medium">{currentUser.firstName} {currentUser.lastName}</span>
                  <span className="text-cortex-text-muted ml-2">• {currentUser.role}</span>
                </div>
                {isManagementMode && (
                  <div className="text-xs text-cortex-orange bg-cortex-orange/10 px-3 py-1 rounded-full border border-cortex-orange/20">
                    📈 MANAGEMENT MODE
                  </div>
                )}
                <div className="text-xs text-cortex-text-muted bg-cortex-bg-secondary/30 px-2 py-1 rounded">
                  {isManagementMode ? 'Aggregated View' : 'Personal View'}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-xs text-cortex-text-muted font-mono" data-testid="timestamp">
              {currentDateTime || new Date().toLocaleString()}
            </div>
            {activeTab === 'admin' && !(userPermissions as any).canAccessAdmin && (
              <div className="text-xs text-cortex-warning bg-cortex-warning/10 px-2 py-1 rounded border border-cortex-warning/20">
                🔒 Limited Access
              </div>
            )}
            {isManagementMode && (
              <div className="text-xs text-cortex-success bg-cortex-success/10 px-2 py-1 rounded border border-cortex-success/20">
                ⚙️ Admin View
              </div>
            )}
          </div>
        </div>
        
        {/* User Context Details */}
        {currentUser && (
          <div className="mt-3 text-xs text-cortex-text-muted border-t border-cortex-border-muted/20 pt-3">
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-4">
                <span>User: <span className="text-cortex-orange">{currentUser.email}</span></span>
                <span>Role: <span className="text-cortex-warning">{currentUser.role}</span></span>
                <span>Session: <span className="text-cortex-success">{currentUser.id}</span></span>
              </span>
              <span>
                Access Level: {isManagementMode ? 
                  <span className="text-cortex-orange">Management (All Data)</span> : 
                  <span className="text-cortex-info">User (Personal Data Only)</span>
                }
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Modern Tab Navigation */}
      <div className="bg-cortex-bg-secondary/40 backdrop-blur-sm border-b border-cortex-border-secondary/20 p-6">
        <div className="flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-cortex-border-secondary scrollbar-track-transparent">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              data-feature="navigation"
              className={`group relative px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap flex items-center space-x-3 min-w-fit ${
                activeTab === tab.id 
                  ? 'text-cortex-text-primary bg-cortex-orange/20 border-2 border-cortex-orange/40 shadow-lg shadow-cortex-orange/10' 
                  : 'text-cortex-text-muted bg-cortex-bg-tertiary/30 border-2 border-cortex-border-muted/20 hover:text-cortex-text-primary hover:bg-cortex-bg-tertiary/50 hover:border-cortex-border-secondary/30'
              }`}
            >
              <span className={`text-lg transition-transform group-hover:scale-110 ${
                activeTab === tab.id ? 'text-cortex-orange' : 'text-cortex-text-muted'
              }`}>{tab.icon}</span>
              <span>{tab.name}</span>
              {activeTab === tab.id && (
                <div className="absolute inset-0 rounded-xl bg-cortex-orange/5 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Description */}
      <div className="bg-cortex-bg-secondary/20 border-b border-cortex-border-muted/10 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-cortex-orange text-lg">
                {visibleTabs.find(tab => tab.id === activeTab)?.icon}
              </span>
              <span className="text-cortex-text-primary font-medium">
                {visibleTabs.find(tab => tab.id === activeTab)?.name}
              </span>
            </div>
            <span className="text-cortex-text-muted">•</span>
            <span className="text-cortex-text-muted">
              {visibleTabs.find(tab => tab.id === activeTab)?.description}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-cortex-text-muted">
            <div className="w-2 h-2 bg-cortex-success rounded-full animate-pulse"></div>
            <span>Live Platform</span>
          </div>
        </div>
      </div>

      {/* Content with Modern Wrapper */}
      <div className="min-h-screen">
        <Suspense fallback={<ComponentLoader />}>
          <ActiveComponent />
        </Suspense>
      </div>
    </div>
  );
}
