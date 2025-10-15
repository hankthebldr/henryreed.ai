'use client';
// legacy-orange: replaced by green per Cortex rebrand (2025-10-08)


import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense, useRef } from 'react';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { useCommandExecutor } from '../hooks/useCommandExecutor';
import { useAppState } from '../contexts/AppStateContext';
import { useAuth } from '../contexts/AuthContext';
import { userManagementService, UserProfile, SystemMetrics } from '../lib/user-management';
import { dcContextStore, WorkflowHistory } from '../lib/dc-context-store';
import EnhancedTerminalSidebar from './EnhancedTerminalSidebar';
import { cn } from '../lib/utils';

// Lazy load heavy components for better performance
const DemoHub = lazy(() => import('./DemoHub').then(m => ({ default: m.DemoHub })));
const XSIAMHealthMonitor = lazy(() => import('./XSIAMHealthMonitor').then(m => ({ default: m.XSIAMHealthMonitor })));
const EnhancedAIAssistant = lazy(() => import('./EnhancedAIAssistant').then(m => ({ default: m.EnhancedAIAssistant })));
const BigQueryExplorer = lazy(() => import('./BigQueryExplorer').then(m => ({ default: m.BigQueryExplorer })));
const POVProjectManagement = lazy(() => import('./POVProjectManagement').then(m => ({ default: m.POVProjectManagement })));
const ProductionTRRManagement = lazy(() => import('./ProductionTRRManagement').then(m => ({ default: m.ProductionTRRManagement })));
const ManagementDashboard = lazy(() => import('./ManagementDashboard').then(m => ({ default: m.ManagementDashboard })));
const UnifiedContentCreator = lazy(() => import('./UnifiedContentCreator'));

// New separated components
const AssetUploader = lazy(() => import('./AssetUploader').then(m => ({ default: m.AssetUploader })));
const KnowledgeBaseLibrary = lazy(() => import('./KnowledgeBaseLibrary').then(m => ({ default: m.KnowledgeBaseLibrary })));
const DataIntegrationHub = lazy(() => import('./DataIntegrationHub').then(m => ({ default: m.DataIntegrationHub })));
const WorkshopManagement = lazy(() => import('./WorkshopManagement').then(m => ({ default: m.WorkshopManagement })));
const POVBestPractices = lazy(() => import('./POVBestPractices').then(m => ({ default: m.POVBestPractices })));

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

const derivePermissionsFromRole = (role?: string) => {
  const normalizedRole = role || '';
  return {
    canViewUserData: true,
    canViewAggregatedData: ['admin', 'manager'].includes(normalizedRole),
    canManageUsers: normalizedRole === 'admin',
    canAccessAllProjects: ['admin', 'manager'].includes(normalizedRole),
    canModifySystemSettings: normalizedRole === 'admin',
    canViewAnalytics: ['admin', 'manager', 'senior_dc'].includes(normalizedRole),
    canAccessAdmin: normalizedRole === 'admin',
    canDeployScenarios: ['admin', 'manager', 'senior_dc', 'dc'].includes(normalizedRole),
    canCreateTRR: ['admin', 'manager', 'senior_dc', 'dc'].includes(normalizedRole),
    canAccessScenarioEngine: ['admin', 'manager', 'senior_dc', 'dc'].includes(normalizedRole),
    canViewReports: true,
  };
};

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
  onClick: () => void | Promise<void>;
  className: string;
  requiresTerminal?: boolean;
}

interface DashboardStatCard {
  id: string;
  icon: string;
  badgeClass: string;
  badgeText: string;
  value: number;
  suffix?: string;
  label: string;
  footer: string;
}

const DEFAULT_TAB_ID = 'dashboard';
const ANCHOR_TAB_MAP: Record<string, string> = {
  'dashboard-blueprints': 'dashboard',
  'pov-planning-hub': 'pov',
  'notes-workbench': 'trr',
  'demo-hub-library': 'demos',
  'platform-health-monitor': 'xsiam',
  'ai-advisor-console': 'ai',
  'data-analytics-panel': 'data',
  'asset-uploader': 'upload',
  'knowledge-base-library': 'knowledge',
  'data-integration-hub': 'integration',
  'content-intelligence-library': 'scenarios',
  'management-control-center': 'admin'
};

const POVDashboard = React.memo(({
  terminalExpanded,
  setTerminalExpanded,
  statCards,
  successRate,
  lastUpdatedLabel,
  activity,
  getActivityStatus,
  formatRelativeTime,
  onNavigate,
}: {
  terminalExpanded: boolean;
  setTerminalExpanded: (expanded: boolean) => void;
  statCards: DashboardStatCard[];
  successRate: number;
  lastUpdatedLabel: string;
  activity: WorkflowHistory[];
  getActivityStatus: (entry: WorkflowHistory) => 'success' | 'warning' | 'error' | 'info';
  formatRelativeTime: (timestamp: string) => string;
  onNavigate: (tabId: string, action?: string, metadata?: Record<string, unknown>) => void;
}) => {
  const { actions } = useAppState();
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
  actions.notify && actions.notify('error', 'PDF generation failed. Please try again.');
  alert('Failed to generate PDF. Please try again.');
    }
  }, [actions]);

  // Enhanced quick actions with direct navigation into feature workspaces
  const quickActions: QuickAction[] = useMemo(() => [
    {
      name: 'New POV',
      icon: '🎯',
      description: 'Initialize a new Proof of Value project',
      onClick: () => {
        onNavigate('pov', 'create-pov', {
          source: 'dashboard-quick-actions',
          quickAction: 'new-pov',
          highlightId: 'pov-create-section'
        });
      },
      className: 'border border-green-500/40 bg-green-500/10 hover:bg-green-500/20 text-green-200 shadow-lg transition-transform'
    },
    {
      name: 'Demo Hub',
      icon: '🎬',
      description: 'Access demo library with DC tooling',
      onClick: () => {
        onNavigate('demos', undefined, {
          source: 'dashboard-quick-actions',
          quickAction: 'demo-hub'
        });
      },
      className: 'border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 shadow-lg transition-transform'
    },
    {
      name: 'Upload CSV',
      icon: '📄',
      description: 'Import TRR data from CSV file',
      onClick: () => {
        onNavigate('trr', 'import-csv', {
          source: 'dashboard-quick-actions',
          quickAction: 'upload-csv',
          highlightId: 'trr-csv-import'
        });
      },
      className: 'border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-200 shadow-lg transition-transform'
    },
    {
      name: 'Generate Report',
      icon: '📝',
      description: 'Create executive or technical report',
      onClick: () => {
        onNavigate('data', 'generate-report', {
          source: 'dashboard-quick-actions',
          quickAction: 'generate-report',
          highlightId: 'data-analytics-panel'
        });
      },
      className: 'border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 shadow-lg transition-transform'
    },
    {
      name: 'AI Analysis',
      icon: '🤖',
      description: 'Run Gemini AI analysis on current data',
      onClick: () => {
        onNavigate('ai', 'run-dashboard-analysis', {
          source: 'dashboard-quick-actions',
          quickAction: 'ai-analysis',
          highlightId: 'ai-insights-panel'
        });
      },
      className: 'border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 shadow-lg transition-transform'
    },
    {
      name: 'Detection Engine',
      icon: '🔧',
      description: 'Access detection scripts and automation tools',
      onClick: () => {
        if (isRunning) {
          actions.notify('warning', 'Please wait for the current terminal command to finish.');
          return;
        }

        setTerminalExpanded(true);
        void executeCommand('scenario studio open --workspace detection --alerts cloud-watch --publish', {
          trackActivity: {
            event: 'quick-action-detection-engine',
            source: 'dashboard-quick-actions',
          },
        });

        window.requestAnimationFrame(() => {
          onNavigate('creator', 'detection-engine', {
            source: 'dashboard-quick-actions',
            quickAction: 'detection-engine',
            highlightId: 'creator-scenario-quick-action'
          });
        });
      },
      className: 'border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-200 shadow-lg transition-transform',
      requiresTerminal: true
    },
    {
      name: 'Documentation',
      icon: '📖',
      description: 'Access comprehensive UI guide and workflow documentation',
      onClick: () => {
        window.open('/docs', '_blank', 'noopener,noreferrer');
      },
      className: 'border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-200 shadow-lg transition-transform'
    },
    {
      name: 'Badass Blueprint',
      icon: '🧭',
      description: 'Create transformation blueprint and download PDF',
      onClick: createGuiBlueprintPdf,
      className: 'border border-pink-500/40 bg-pink-500/10 hover:bg-pink-500/20 text-pink-200 shadow-lg transition-transform'
    }
  ], [actions, createGuiBlueprintPdf, executeCommand, isRunning, onNavigate, setTerminalExpanded]);

  // Memoized activity data for performance
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
                  <span className="text-cortex-text-secondary text-sm">{statCards[0]?.value ?? 0} executing POVs</span>
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-3xl font-light text-cortex-text-primary">{successRate}%</div>
              <div className="text-cortex-text-muted text-sm">TRR Success Rate</div>
              <div className="text-xs text-cortex-text-muted">Updated {lastUpdatedLabel}</div>
            </div>
          </div>

          {/* Modern Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map(card => (
              <div key={card.id} className="cortex-card-elevated p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">{card.icon}</div>
                  <div className={card.badgeClass}>{card.badgeText}</div>
                </div>
                <div className="text-2xl font-bold text-cortex-text-primary mb-1">
                  {card.value}{card.suffix ?? ""}
                </div>
                <div className="text-cortex-text-secondary text-sm mb-2">{card.label}</div>
                <div className="text-xs text-cortex-text-muted">{card.footer}</div>
              </div>
            ))}
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
              {activity.length === 0 ? (
                <div className="cortex-card p-4 text-sm text-cortex-text-muted">
                  No recent activity yet. Execute a workflow or import data to populate this feed.
                </div>
              ) : (
                activity.slice(0, 12).map((entry, idx) => {
                  const status = getActivityStatus(entry);
                  const indicatorClass =
                    status === 'success'
                      ? 'bg-cortex-success'
                      : status === 'warning'
                        ? 'bg-cortex-warning'
                        : status === 'error'
                          ? 'bg-cortex-error'
                          : 'bg-cortex-info';
                  const contextSummary =
                    entry.context && typeof entry.context === 'object'
                      ? entry.context.customerName ||
                        entry.context.customer?.name ||
                        entry.context.povName ||
                        entry.context.trrTitle ||
                        entry.context.title ||
                        entry.context.name ||
                        ''
                      : '';

                  return (
                    <div key={`${entry.id}-${idx}`} className="cortex-card p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-cortex-text-primary text-sm mb-1">
                            {entry.action || entry.workflowType.replace(/_/g, ' ')}
                          </div>
                          <div className="text-cortex-text-muted text-xs leading-relaxed">
                            {(entry.outcome || 'In progress')} • {entry.workflowType.replace(/_/g, ' ')}
                          </div>
                          {contextSummary && (
                            <div className="text-cortex-text-secondary text-xs mt-1">
                              {contextSummary}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <div className={`w-2 h-2 rounded-full ${indicatorClass} animate-pulse`}></div>
                          <div className="text-xs text-cortex-text-muted font-mono">
                            {formatRelativeTime(entry.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
              {quickActions.length} Available
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                id={`quick-action-${action.name.toLowerCase().replace(/\s+/g, '-')}`}
                data-quick-action={action.name.toLowerCase().replace(/\s+/g, '-')}
                onClick={() => action.onClick()}
                disabled={action.requiresTerminal && isRunning}
                aria-disabled={action.requiresTerminal && isRunning}
                className={cn(
                  'btn-modern button-hover-lift cortex-card p-4 text-left flex flex-col items-start space-y-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cortex-accent/60',
                  action.className,
                  action.requiresTerminal && isRunning && 'opacity-60 cursor-wait'
                )}
                title={action.description}
                aria-label={action.description}
              >
                <div className="text-2xl group-hover:scale-110 transition-transform" aria-hidden="true">{action.icon}</div>
                <div className="text-sm font-medium text-cortex-text-primary">
                  {action.name}
                </div>
                <p className="text-xs text-cortex-text-muted leading-snug line-clamp-3">
                  {action.description}
                </p>
              </button>
            ))}
          </div>

          {/* Advanced Actions */}
          <div className="border-t border-cortex-border-muted/20 pt-4">
            <h4 className="text-sm font-medium text-cortex-text-secondary mb-3">Advanced Actions</h4>
            <div className="space-y-2">
              <button
                id="advanced-action-sync-demo"
                data-advanced-action="sync-demo"
                onClick={() => {
                  const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'xsiam', action: 'sync-platform' } });
                  window.dispatchEvent(event);
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-cortex-bg-secondary/30 transition-colors text-sm text-cortex-text-muted hover:text-cortex-text-primary flex items-center space-x-3 cortex-interactive"
                aria-label="Sync demo environment"
              >
                <span aria-hidden="true">🔄</span>
                <span>Sync demo environment</span>
              </button>
              <button
                id="advanced-action-export-dashboard"
                data-advanced-action="export-dashboard"
                onClick={() => {
                  const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'data', action: 'export-dashboard' } });
                  window.dispatchEvent(event);
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-cortex-bg-secondary/30 transition-colors text-sm text-cortex-text-muted hover:text-cortex-text-primary flex items-center space-x-3 cortex-interactive"
                aria-label="Export current dashboard"
              >
                <span aria-hidden="true">📋</span>
                <span>Export current dashboard</span>
              </button>
              <button
                id="advanced-action-engagement-metrics"
                data-advanced-action="engagement-metrics"
                onClick={() => {
                  const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'data', action: 'engagement-metrics' } });
                  window.dispatchEvent(event);
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-cortex-bg-secondary/30 transition-colors text-sm text-cortex-text-muted hover:text-cortex-text-primary flex items-center space-x-3 cortex-interactive"
                aria-label="View engagement metrics"
              >
                <span aria-hidden="true">📊</span>
                <span>View engagement metrics</span>
              </button>
              <button
                id="advanced-action-create-sdw"
                data-advanced-action="create-sdw"
                onClick={() => {
                  const event = new CustomEvent('navigate-to-tab', { detail: { tabId: 'trr', action: 'create-sdw' } });
                  window.dispatchEvent(event);
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-cortex-warning/10 transition-colors text-sm text-cortex-warning hover:text-cortex-warning border border-cortex-warning/20 hover:border-cortex-warning/40 mt-3 cortex-interactive"
                aria-label="Create Solution Design Workbook"
              >
                <div className="flex items-center space-x-3">
                  <span aria-hidden="true">📝</span>
                  <span>Create Solution Design Workbook</span>
                </div>
              </button>
              <button
                id="advanced-action-toggle-terminal"
                data-advanced-action="toggle-terminal"
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
                aria-label={terminalExpanded ? 'Hide Terminal Sidebar' : 'Show Terminal Sidebar'}
              >
                <div className="flex items-center space-x-3">
                  <span aria-hidden="true">⌨️</span>
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
    id: 'demos',
    name: 'Demo Hub',
    icon: '🎬',
    component: DemoHub,
    description: 'Demo library with DC tooling integration for cortex-syslog-generator'
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
    name: 'Data Analytics',
    icon: '📈',
    component: BigQueryExplorer,
    description: 'Customer data analysis and engagement metrics platform'
  },
  {
    id: 'upload',
    name: 'Asset Upload',
    icon: '📤',
    component: AssetUploader,
    description: 'Upload demo assets, documentation, and files'
  },
  {
    id: 'knowledge',
    name: 'Knowledge Vault',
    icon: '📚',
    component: KnowledgeBaseLibrary,
    description: 'Obsidian-inspired knowledge base for DC platform content'
  },
  {
    id: 'integration',
    name: 'Data Integration',
    icon: '🔗',
    component: DataIntegrationHub,
    description: 'Export, import, and integrate data across platforms'
  },
  {
    id: 'scenarios',
    name: 'Content Library',
    icon: '🚀',
    component: () => <UnifiedContentCreator mode="unified" onModeChange={() => {}} />,
    description: 'Pre-built scenarios, competitive battlecards, and engagement content'
  },
  {
    id: 'workshops',
    name: 'Workshops',
    icon: '🎓',
    component: WorkshopManagement,
    description: 'DC workshop management, certification tracking, and enablement programs'
  },
  {
    id: 'best-practices',
    name: 'Best Practices',
    icon: '📖',
    component: POVBestPractices,
    description: 'XSIAM PoV best practices guide with phase-based guidance and XQL examples'
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
  const { state, actions } = useAppState();
  const [currentUser, setCurrentUser] = useState(null);
  const [isManagementMode, setIsManagementMode] = useState(false);
  const [userPermissions, setUserPermissions] = useState(() => derivePermissionsFromRole());
  const [aggregateMetrics, setAggregateMetrics] = useState<SystemMetrics | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [terminalExpanded, setTerminalExpanded] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalPOVs: 0,
    executingPOVs: 0,
    planningPOVs: 0,
    completedPOVs: 0,
    totalTRRs: 0,
    pendingTRRs: 0,
    inReviewTRRs: 0,
    validatedTRRs: 0,
    blockedTRRs: 0,
    successRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<WorkflowHistory[]>([]);
  const [lastOperationalRefresh, setLastOperationalRefresh] = useState<string>('');
  const formatRelativeTime = useCallback((timestamp: string) => {
    if (!timestamp) return 'Just now';
    const time = new Date(timestamp);
    if (Number.isNaN(time.getTime())) {
      return 'Just now';
    }
    const diffMs = Date.now() - time.getTime();
    if (diffMs < 0) return 'Just now';
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return time.toLocaleDateString();
  }, []);

  const getActivityStatus = useCallback((entry: WorkflowHistory) => {
    const outcome = (entry.outcome || '').toLowerCase();
    if (outcome.includes('success') || outcome.includes('validated') || outcome.includes('completed')) {
      return 'success';
    }
    if (outcome.includes('fail') || outcome.includes('error')) {
      return 'error';
    }
    if (outcome.includes('block') || outcome.includes('risk') || outcome.includes('warning')) {
      return 'warning';
    }
    return 'info';
  }, []);

  const refreshOperationalData = useCallback(() => {
    try {
      const customers = dcContextStore.getAllCustomerEngagements();
      const povs = dcContextStore.getAllActivePOVs();
      const trrs = dcContextStore.getAllTRRRecords();
      const workflowContext = dcContextStore.getCurrentWorkflowContext();

      const executingPOVs = povs.filter(p => p.status === 'executing').length;
      const planningPOVs = povs.filter(p => p.status === 'planning').length;
      const completedPOVs = povs.filter(p => p.status === 'completed').length;

      const pendingTRRs = trrs.filter(t => t.status === 'pending' || t.status === 'draft').length;
      const inReviewTRRs = trrs.filter(t => t.status === 'in-review').length;
      const validatedTRRs = trrs.filter(t => t.status === 'validated').length;
      const blockedTRRs = trrs.filter(t => t.status === 'blocked').length;
      const totalTRRs = trrs.length;
      const successRate = totalTRRs > 0 ? Math.round((validatedTRRs / totalTRRs) * 100) : 0;

      setDashboardStats({
        totalCustomers: customers.length,
        activeCustomers: workflowContext?.activeCustomers ?? 0,
        totalPOVs: povs.length,
        executingPOVs,
        planningPOVs,
        completedPOVs,
        totalTRRs,
        pendingTRRs,
        inReviewTRRs,
        validatedTRRs,
        blockedTRRs,
        successRate,
      });

      setRecentActivity(workflowContext?.recentActivity ?? []);
      setLastOperationalRefresh(new Date().toISOString());
    } catch (error) {
  actions.notify && actions.notify('warning', 'Failed to refresh dashboard data');
    }
  }, []);
  
  const { trackFeatureUsage, trackPageView } = useActivityTracking();
  const { run: executeCommand, isRunning } = useCommandExecutor();
  const { logout } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      actions.notify && actions.notify('error', 'Failed to logout. Please try again.');
    }
  }, [logout, actions]);

  useEffect(() => {
    let isMounted = true;

    const loadUserContext = async () => {
      const authUser = state.auth.user;

      if (!authUser) {
        setCurrentUser(null);
        setIsManagementMode(false);
        setUserPermissions(derivePermissionsFromRole());
        setAggregateMetrics(null);
        actions.updateData('analytics', null);
        return;
      }

      try {
        const profile = await userManagementService.getUserById(authUser.id, { force: true });
        if (!isMounted) return;

        if (!profile) {
          setCurrentUser(null);
          setIsManagementMode(false);
          setUserPermissions(derivePermissionsFromRole());
          setAggregateMetrics(null);
          actions.updateData('analytics', null);
          return;
        }

        userManagementService.setActiveUser(profile.id);
        setCurrentUser(profile);

        const managementMode = ['admin', 'manager'].includes(profile.role);
        setIsManagementMode(managementMode);
        setUserPermissions(derivePermissionsFromRole(profile.role));

        const scope = profile.role === 'admin' ? 'all' : profile.role === 'manager' ? 'team' : 'self';
        const scopedUsers = await userManagementService.getUsers({
          scope,
          managerId: scope === 'team' ? profile.id : undefined,
          userId: profile.id,
          includeInactive: true,
          force: true,
        });
        if (!isMounted) return;

        const userIds = scope === 'self' ? [profile.id] : scopedUsers.map((user) => user.id);
        const metrics = await userManagementService.generateSystemMetrics(userIds, { period: 'daily', force: true });
        if (!isMounted) return;

        setAggregateMetrics(metrics);
        actions.updateData('analytics', metrics);
      } catch (error) {
  actions.notify && actions.notify('error', 'Failed to load user context');
        if (isMounted) {
          setCurrentUser(null);
          setIsManagementMode(false);
          setUserPermissions(derivePermissionsFromRole());
          setAggregateMetrics(null);
          actions.updateData('analytics', null);
        }
      }
    };

    loadUserContext();
    trackFeatureUsage('gui', 'interface_loaded');
    trackPageView('/gui');

    return () => {
      isMounted = false;
    };
  }, [state.auth.user, actions, trackFeatureUsage, trackPageView]);
  
  // Update current date/time
  useEffect(() => {
    const updateDateTime = () => {
      setCurrentDateTime(new Date().toLocaleString());
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refreshOperationalData();
    const interval = setInterval(refreshOperationalData, 15000);
    return () => clearInterval(interval);
  }, [refreshOperationalData, aggregateMetrics]);

  const lastUpdatedLabel = useMemo(() => formatRelativeTime(lastOperationalRefresh), [lastOperationalRefresh, formatRelativeTime]);

  const statCards = useMemo<DashboardStatCard[]>(() => {
    const uptime = aggregateMetrics?.uptime ?? 0;
    const engagementGap = Math.max(dashboardStats.totalCustomers - dashboardStats.activeCustomers, 0);
    const successRateValue = dashboardStats.successRate;
    return [
      {
        id: 'povs',
        icon: '🎯',
        badgeClass: 'text-xs font-medium bg-cortex-success/20 text-cortex-success px-2 py-1 rounded-full',
        badgeText: `${dashboardStats.totalPOVs} total`,
        value: dashboardStats.executingPOVs,
        suffix: '',
        label: 'Active POVs',
        footer: `${dashboardStats.planningPOVs} planning • ${dashboardStats.completedPOVs} completed`,
      },
      {
        id: 'customers',
        icon: '🤝',
        badgeClass: 'text-xs font-medium bg-cortex-info/20 text-cortex-info px-2 py-1 rounded-full',
        badgeText: `${dashboardStats.activeCustomers} engaged`,
        value: dashboardStats.totalCustomers,
        suffix: '',
        label: 'Customers',
        footer: engagementGap > 0 ? `${engagementGap} ready for outreach` : 'All customers engaged',
      },
      {
        id: 'trrs',
        icon: '📋',
        badgeClass: 'text-xs font-medium bg-cortex-warning/20 text-cortex-warning px-2 py-1 rounded-full',
        badgeText: `${dashboardStats.pendingTRRs} pending`,
        value: dashboardStats.validatedTRRs,
        suffix: '',
        label: 'Validated TRRs',
        footer: `${dashboardStats.inReviewTRRs} in review • ${dashboardStats.blockedTRRs} blocked`,
      },
      {
        id: 'uptime',
        icon: '⚡',
        badgeClass: 'text-xs font-medium bg-cortex-accent/20 text-cortex-accent px-2 py-1 rounded-full',
        badgeText: `${successRateValue}% success`,
        value: uptime,
        suffix: '%',
        label: 'Platform Uptime',
        footer: `${successRateValue}% TRR success rate`,
      },
    ];
  }, [aggregateMetrics, dashboardStats]);
  
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
      return (
        <POVDashboard
          terminalExpanded={terminalExpanded}
          setTerminalExpanded={setTerminalExpanded}
          statCards={statCards}
          successRate={dashboardStats.successRate}
          lastUpdatedLabel={lastUpdatedLabel}
          activity={recentActivity}
          getActivityStatus={getActivityStatus}
          formatRelativeTime={formatRelativeTime}
          onNavigate={handleTabChange}
        />
      );
    }
    const Component = ActiveComponentClass as React.ComponentType<any>;
    return <Component />;
  };

  // Tabs where sidebar should be shown (terminal-heavy pages)
  const tabsWithSidebar = ['dashboard', 'pov', 'trr', 'demos', 'xsiam'];
  const shouldShowSidebar = tabsWithSidebar.includes(activeTab);

  return (
    <div className="h-screen flex bg-gradient-to-br from-cortex-bg-primary to-cortex-bg-secondary text-cortex-text-primary">
      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          shouldShowSidebar ? (terminalExpanded ? 'mr-[32rem]' : 'mr-12') : 'mr-0'
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
                  {isManagementMode ? 'Team View' : 'Personal View'}
                </div>
                {aggregateMetrics && (
                  <div className="hidden lg:flex items-center space-x-3 text-xs text-cortex-text-muted">
                    {isManagementMode ? (
                      <>
                        <span>Team Members: <span className="text-cortex-text-primary font-medium">{aggregateMetrics.totalUsers}</span></span>
                        <span>Active: <span className="text-cortex-success font-medium">{aggregateMetrics.activeUsers}</span></span>
                      </>
                    ) : (
                      <>
                        <span>Your POVs: <span className="text-cortex-text-primary font-medium">{dashboardStats.totalPOVs}</span></span>
                        <span>TRRs: <span className="text-cortex-success font-medium">{dashboardStats.totalTRRs}</span></span>
                      </>
                    )}
                    <span>Uptime: <span className="text-cortex-success font-medium">{aggregateMetrics.uptime}%</span></span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-cortex-error/20 border border-cortex-error/30 text-cortex-error hover:bg-cortex-error/30 hover:border-cortex-error/50"
                  title="Logout and switch user for RBAC testing"
                  aria-label="Logout"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Terminal Toggle - Only show on terminal-enabled pages */}
            {shouldShowSidebar && (
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
            )}
            
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
                Data Scope: {isManagementMode ?
                  <span className="text-cortex-accent">Team/Aggregated View</span> :
                  <span className="text-cortex-info">Personal/User-Level Only</span>
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
    
    {/* Enhanced Terminal Sidebar - Only show on terminal-enabled pages */}
    {shouldShowSidebar && (
      <EnhancedTerminalSidebar
        defaultExpanded={terminalExpanded}
        onToggle={setTerminalExpanded}
      />
    )}
  </div>
  );
}
