'use client';
// legacy-orange: replaced by green per Cortex rebrand (2025-10-08)


import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense, useRef } from 'react';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { useCommandExecutor } from '../hooks/useCommandExecutor';
import { userManagementService } from '../lib/user-management';
import EnhancedTerminalSidebar from './EnhancedTerminalSidebar';
import { cn } from '../lib/utils';

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
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-cortex-border-muted border-t-cortex-accent mx-auto mb-4"></div>
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

const DEFAULT_TAB_ID = 'dashboard';
const ANCHOR_TAB_MAP: Record<string, string> = {
  'dashboard-blueprints': 'dashboard',
  'pov-planning-hub': 'pov',
  'notes-workbench': 'trr',
  'platform-health-monitor': 'xsiam',
  'ai-advisor-console': 'ai',
  'data-analytics-panel': 'data',
  'demo-blueprint-studio': 'creator',
  'content-intelligence-library': 'scenarios',
  'management-control-center': 'admin'
};

const POVDashboard = React.memo(({ terminalExpanded, setTerminalExpanded }: { terminalExpanded: boolean; setTerminalExpanded: (expanded: boolean) => void }) => {
  const { run: executeCommand, isRunning } = useCommandExecutor();
  
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

  // Enhanced quick actions with proper terminal command integration
  const quickActions: QuickAction[] = useMemo(() => [
    {
      name: 'New POV',
      icon: '🎯',
      description: 'Initialize a new Proof of Value project',
      onClick: async () => {
        await executeCommand('pov init --interactive', {
          openTerminal: true,
          focus: true,
          trackActivity: {
            event: 'quick-action-execute',
            source: 'dashboard-quick-actions',
            payload: { action: 'new-pov', command: 'pov init --interactive' }
          }
        });
      },
      className: 'bg-green-900 bg-opacity-20 border-green-500 border-opacity-30 hover:bg-green-900 hover:bg-opacity-40 text-green-400'
    },
    {
      name: 'Upload CSV',
      icon: '📄',
      description: 'Import TRR data from CSV file',
      onClick: async () => {
        await executeCommand('trr import --format csv --interactive', {
          openTerminal: true,
          focus: true,
          trackActivity: {
            event: 'quick-action-execute',
            source: 'dashboard-quick-actions',
            payload: { action: 'upload-csv', command: 'trr import --format csv --interactive' }
          }
        });
      },
      className: 'bg-blue-900 bg-opacity-20 border-blue-500 border-opacity-30 hover:bg-blue-900 hover:bg-opacity-40 text-blue-400'
    },
    {
      name: 'Generate Report',
      icon: '📝',
      description: 'Create executive or technical report',
      onClick: async () => {
        await executeCommand('pov report --format executive --export pdf', {
          openTerminal: true,
          focus: true,
          trackActivity: {
            event: 'quick-action-execute',
            source: 'dashboard-quick-actions',
            payload: { action: 'generate-report', command: 'pov report --format executive --export pdf' }
          }
        });
      },
      className: 'bg-purple-900 bg-opacity-20 border-purple-500 border-opacity-30 hover:bg-purple-900 hover:bg-opacity-40 text-purple-400'
    },
    {
      name: 'AI Analysis',
      icon: '🤖',
      description: 'Run Gemini AI analysis on current data',
      onClick: async () => {
        await executeCommand('gemini analyze --context dashboard', {
          openTerminal: true,
          focus: true,
          trackActivity: {
            event: 'quick-action-execute',
            source: 'dashboard-quick-actions',
            payload: { action: 'ai-analysis', command: 'gemini analyze --context dashboard' }
          }
        });
      },
      className: 'bg-cyan-900 bg-opacity-20 border-cyan-500 border-opacity-30 hover:bg-cyan-900 hover:bg-opacity-40 text-cyan-400'
    },
    {
      name: 'Detection Engine',
      icon: '🔧',
      description: 'Access detection scripts and automation tools',
      onClick: async () => {
        await executeCommand('detect list --engine --interactive', {
          openTerminal: true,
          focus: true,
          trackActivity: {
            event: 'quick-action-execute',
            source: 'dashboard-quick-actions',
            payload: { action: 'detection-engine', command: 'detect list --engine --interactive' }
          }
        });
      },
      className: 'bg-orange-900 bg-opacity-20 border-orange-500 border-opacity-30 hover:bg-orange-900 hover:bg-orange-opacity-40 text-orange-400'
    },
    {
      name: 'Documentation',
      icon: '📖',
      description: 'Access comprehensive UI guide and workflow documentation',
      onClick: async () => {
        await executeCommand('docs open --interactive', {
          openTerminal: true,
          focus: true,
          trackActivity: {
            event: 'quick-action-execute',
            source: 'dashboard-quick-actions',
            payload: { action: 'documentation', command: 'docs open --interactive' }
          }
        });
      },
      className: 'bg-indigo-900 bg-opacity-20 border-indigo-500 border-opacity-30 hover:bg-indigo-900 hover:bg-indigo-opacity-40 text-indigo-400'
    },
    {
      name: 'Badass Blueprint',
      icon: '🧭',
      description: 'Create transformation blueprint and download PDF',
      onClick: createGuiBlueprintPdf,
      className: 'bg-pink-900 bg-opacity-20 border-pink-500 border-opacity-30 hover:bg-pink-900 hover:bg-pink-opacity-40 text-pink-400'
    }
  ], [createGuiBlueprintPdf, executeCommand]);

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
    <div className="p-8 space-y-8">
      {/* Modern Hero Section */}
      <div className="glass-card p-8">
          <div className="flex flex-col lg:flex-row items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-cortex-text-primary mb-2 flex items-center">
                <span className="text-cortex-accent mr-3">🎯</span>
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
            <div className="cortex-card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">📈</div>
                <div className="text-xs bg-cortex-success/20 text-cortex-success px-2 py-1 rounded-full">+15%</div>
              </div>
              <div className="text-2xl font-bold text-cortex-text-primary mb-1">12</div>
              <div className="text-cortex-text-secondary text-sm mb-2">Active POVs</div>
              <div className="text-xs text-cortex-text-muted">3 in progress • 9 completed</div>
            </div>

            <div className="cortex-card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">🛡️</div>
                <div className="text-xs bg-cortex-info/20 text-cortex-info px-2 py-1 rounded-full">New</div>
              </div>
              <div className="text-2xl font-bold text-cortex-text-primary mb-1">47</div>
              <div className="text-cortex-text-secondary text-sm mb-2">Detection Scripts</div>
              <div className="text-xs text-cortex-text-muted">Production-ready detections</div>
            </div>

            <div className="cortex-card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">📋</div>
                <div className="text-xs bg-cortex-warning/20 text-cortex-warning px-2 py-1 rounded-full">23</div>
              </div>
              <div className="text-2xl font-bold text-cortex-text-primary mb-1">89%</div>
              <div className="text-cortex-text-secondary text-sm mb-2">TRR Success</div>
              <div className="text-xs text-cortex-text-muted">Linked design workbooks</div>
            </div>

            <div className="cortex-card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">💰</div>
                <div className="text-xs bg-cortex-accent/20 text-cortex-accent px-2 py-1 rounded-full">ROI</div>
              </div>
              <div className="text-2xl font-bold text-cortex-text-primary mb-1">54%</div>
              <div className="text-cortex-text-secondary text-sm mb-2">Cost Savings</div>
              <div className="text-xs text-cortex-text-muted">vs Splunk/CrowdStrike/Sentinel</div>
            </div>
          </div>
        </div>
      
      {/* Modern Activity and Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Card */}
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-cortex-text-primary flex items-center">
                <span className="text-cortex-info mr-2">📊</span>
                Recent Activity
              </h3>
              <div className="text-xs bg-cortex-info/10 text-cortex-info px-3 py-1 rounded-full border border-cortex-info/20">
                Live Updates
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto terminal-scrollbar pr-2">
              {activityData.map((item, idx) => (
                <div key={idx} className="cortex-card p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-cortex-text-primary text-sm mb-1">{item.action}</div>
                      <div className="text-cortex-text-muted text-xs leading-relaxed">{item.target}</div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <div className={`w-2 h-2 rounded-full ${{
                        'success': 'bg-cortex-success',
                        'warning': 'bg-cortex-warning',
                        'info': 'bg-cortex-info'
                      }[item.status]} animate-pulse`}></div>
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
        
        {/* Quick Actions Card */}
        <section
          id="dashboard-blueprints"
          aria-labelledby="dashboard-blueprints-heading"
          className="glass-card p-6 scroll-mt-28"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h3
                id="dashboard-blueprints-heading"
                className="text-xl font-semibold text-cortex-text-primary flex items-center"
              >
                <span className="text-cortex-accent mr-2">⚡</span>
                Quick Actions
              </h3>
              <p className="text-sm text-cortex-text-muted">
                Launch blueprint automation, exports, and workspace shortcuts without leaving the dashboard.
              </p>
            </div>
            <div className="text-xs bg-cortex-accent/10 text-cortex-accent px-3 py-1 rounded-full border border-cortex-accent/20">
              7 Available
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="btn-modern button-hover-lift cortex-card p-4 text-center"
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
                className="w-full text-left p-3 rounded-lg hover:bg-cortex-bg-secondary/30 transition-colors text-sm text-cortex-text-muted hover:text-cortex-text-primary flex items-center space-x-3 cortex-interactive"
              >
                <span>🔄</span>
                <span>Sync demo environment</span>
              </button>
              <button
                onClick={() => {
                  const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'data', action: 'export-dashboard' } });
                  window.dispatchEvent(event);
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-cortex-bg-secondary/30 transition-colors text-sm text-cortex-text-muted hover:text-cortex-text-primary flex items-center space-x-3 cortex-interactive"
              >
                <span>📋</span>
                <span>Export current dashboard</span>
              </button>
              <button
                onClick={() => {
                  const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'data', action: 'engagement-metrics' } });
                  window.dispatchEvent(event);
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-cortex-bg-secondary/30 transition-colors text-sm text-cortex-text-muted hover:text-cortex-text-primary flex items-center space-x-3 cortex-interactive"
              >
                <span>📊</span>
                <span>View engagement metrics</span>
              </button>
              <button
                onClick={() => {
                  const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'trr', action: 'create-sdw' } });
                  window.dispatchEvent(event);
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-cortex-warning/10 transition-colors text-sm text-cortex-warning hover:text-cortex-warning border border-cortex-warning/20 hover:border-cortex-warning/40 mt-3 cortex-interactive"
              >
                <div className="flex items-center space-x-3">
                  <span>📝</span>
                  <span>Create Solution Design Workbook</span>
                </div>
              </button>
              <button
                onClick={async () => {
                  setTerminalExpanded(!terminalExpanded);
                  if (!terminalExpanded) {
                    await executeCommand('whoami', {
                      openTerminal: true,
                      focus: true,
                      trackActivity: {
                        event: 'terminal-sidebar-open',
                        source: 'dashboard-advanced-actions',
                        payload: { action: 'toggle-terminal', expanded: !terminalExpanded }
                      }
                    });
                  }
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-cortex-success/10 transition-colors text-sm text-cortex-success hover:text-cortex-success border border-cortex-success/20 hover:border-cortex-success/40 cortex-interactive"
              >
                <div className="flex items-center space-x-3">
                  <span>⌨️</span>
                  <span>{terminalExpanded ? 'Hide Terminal Sidebar' : 'Show Terminal Sidebar'}</span>
                </div>
              </button>
            </div>
          </div>
        </section>
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

interface CortexGUIInterfaceProps {
  initialTab?: string;
}

export default function CortexGUIInterface({ initialTab }: CortexGUIInterfaceProps) {
  const [activeTab, setActiveTab] = useState(() =>
    initialTab && guiTabs.some(tab => tab.id === initialTab) ? initialTab : DEFAULT_TAB_ID
  );
  const [currentUser, setCurrentUser] = useState(null);
  const [isManagementMode, setIsManagementMode] = useState(false);
  const [userPermissions, setUserPermissions] = useState({});
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [terminalExpanded, setTerminalExpanded] = useState(false);
  
  const { trackFeatureUsage, trackPageView } = useActivityTracking();
  const { run: executeCommand, isRunning } = useCommandExecutor();

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
  
  const handleTabChange = useCallback(
    (tabId: string, action?: string, metadata?: any) => {
      setActiveTab(previousTab => {
        if (previousTab !== tabId) {
          trackFeatureUsage('navigation', 'tab_change', {
            component: `${previousTab}_to_${tabId}`,
            success: true
          });
        }

        return tabId;
      });

      trackPageView(`/gui/${tabId}`);

      if (action) {
        setTimeout(() => {
          const event = new CustomEvent(`tab-${tabId}-action`, {
            detail: { action, metadata }
          });
          window.dispatchEvent(event);
        }, 100);
      }
    },
    [trackFeatureUsage, trackPageView]
  );

  const handleTabChangeRef = useRef(handleTabChange);

  useEffect(() => {
    handleTabChangeRef.current = handleTabChange;
  }, [handleTabChange]);

  useEffect(() => {
    const navigateToAnchor = () => {
      if (typeof window === 'undefined') {
        return;
      }

      const hash = window.location.hash.replace('#', '');
      if (!hash) {
        return;
      }

      const targetTab = ANCHOR_TAB_MAP[hash];

      if (targetTab) {
        handleTabChangeRef.current(targetTab);
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 350);
      } else {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    navigateToAnchor();

    window.addEventListener('hashchange', navigateToAnchor);
    return () => window.removeEventListener('hashchange', navigateToAnchor);
  }, []);
  
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
  const ActiveComponentClass = visibleTabs.find(tab => tab.id === activeTab)?.component || POVDashboard;

  useEffect(() => {
    if (!visibleTabs.some(tab => tab.id === activeTab)) {
      const fallbackTab = visibleTabs[0]?.id ?? DEFAULT_TAB_ID;
      if (fallbackTab && fallbackTab !== activeTab) {
        setActiveTab(fallbackTab);
      }
    }
  }, [visibleTabs, activeTab]);
  
  // Create component with props for POVDashboard
  const ActiveComponent = () => {
    if (ActiveComponentClass === POVDashboard) {
      return <POVDashboard terminalExpanded={terminalExpanded} setTerminalExpanded={setTerminalExpanded} />;
    }
    const Component = ActiveComponentClass as React.ComponentType<any>;
    return <Component />;
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-cortex-bg-primary to-cortex-bg-secondary text-cortex-text-primary">
      {/* Main Content Area */}
      <div 
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          terminalExpanded ? 'mr-96' : 'mr-12' // Adjust margin based on terminal state
        )}
      >
        {/* Modern Header */}
        <div className="bg-cortex-bg-tertiary/60 backdrop-blur-xl border-b border-cortex-border-secondary/30 px-6 py-3 sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-cortex-text-primary flex items-center">
                <span className="text-cortex-accent mr-3">🏢</span>
                Cortex DC Portal
              </h1>
            {currentUser && (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-cortex-text-secondary">
                  Welcome, <span className="text-cortex-accent font-medium">{currentUser.firstName} {currentUser.lastName}</span>
                  <span className="text-cortex-text-muted ml-2">• {currentUser.role}</span>
                </div>
                {isManagementMode && (
                  <div className="text-xs text-cortex-accent bg-cortex-accent/10 px-3 py-1 rounded-full border border-cortex-accent/20">
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
            {/* Terminal Toggle */}
            <button
              onClick={() => setTerminalExpanded(!terminalExpanded)}
              className={cn(
                'flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                terminalExpanded 
                  ? 'bg-cortex-success/20 border border-cortex-success/30 text-cortex-success'
                  : 'bg-cortex-bg-tertiary/30 border border-cortex-border-muted/20 text-cortex-text-muted hover:text-cortex-text-primary hover:border-cortex-border-secondary/30'
              )}
              title={terminalExpanded ? 'Hide Terminal' : 'Show Terminal'}
            >
              <span>⌨️</span>
              <span>{terminalExpanded ? 'Hide Terminal' : 'Terminal'}</span>
            </button>
            
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
                <span>User: <span className="text-cortex-accent">{currentUser.email}</span></span>
                <span>Role: <span className="text-cortex-warning">{currentUser.role}</span></span>
                <span>Session: <span className="text-cortex-success">{currentUser.id}</span></span>
              </span>
              <span>
                Access Level: {isManagementMode ? 
                  <span className="text-cortex-accent">Management (All Data)</span> : 
                  <span className="text-cortex-info">User (Personal Data Only)</span>
                }
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Modern Tab Navigation */}
      <div className="bg-cortex-bg-secondary/40 backdrop-blur-sm border-b border-cortex-border-secondary/20 p-3 sticky top-[70px] z-20">
        <div className="flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-cortex-border-secondary scrollbar-track-transparent">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              data-feature="navigation"
              className={`group relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex items-center space-x-2 min-w-fit cortex-interactive ${
                activeTab === tab.id 
                  ? 'text-cortex-text-primary bg-cortex-accent/20 border-cortex-accent/40 shadow-cortex-lg' 
                  : 'text-cortex-text-muted bg-cortex-bg-tertiary/30 border-cortex-border-muted/20 hover:text-cortex-text-primary hover:bg-cortex-bg-tertiary/50 hover:border-cortex-border-secondary/30'
              }`}
            >
              <span className={`text-lg transition-transform group-hover:scale-110 ${
                activeTab === tab.id ? 'text-cortex-accent' : 'text-cortex-text-muted'
              }`}>{tab.icon}</span>
              <span>{tab.name}</span>
              {activeTab === tab.id && (
                <div className="absolute inset-0 rounded-xl bg-cortex-accent/5 animate-pulse" />
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
              <span className="text-cortex-accent text-lg">
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
      <div className="flex-1 overflow-auto p-8">
        <Suspense fallback={<ComponentLoader />}>
          <ActiveComponent />
        </Suspense>
      </div>
    </div>
    
    {/* Enhanced Terminal Sidebar */}
    <EnhancedTerminalSidebar
      defaultExpanded={terminalExpanded}
      onToggle={setTerminalExpanded}
    />
  </div>
  );
}
