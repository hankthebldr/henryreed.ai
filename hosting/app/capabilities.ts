export interface WorkspaceConfigEntry {
  tab: string;
  title: string;
  description: string;
  defaultAnchor?: string;
}

const WORKSPACE_CONFIG = {
  dashboard: {
    tab: 'dashboard',
    title: 'Engagement Dashboard',
    description: 'At-a-glance POV outcomes, activity feeds, and blueprint automation shortcuts.',
    defaultAnchor: 'dashboard-blueprints'
  },
  'domain-consultant': {
    tab: 'dashboard',
    title: 'Domain Consultant Workspace',
    description: 'Shortcut alias for the engagement dashboard workspace experience.',
    defaultAnchor: 'dashboard-blueprints'
  },
  pov: {
    tab: 'pov',
    title: 'POV Planning Hub',
    description: 'Lifecycle orchestration, scenario planning, and AI-assisted milestone tracking.',
    defaultAnchor: 'pov-planning-hub'
  },
  trr: {
    tab: 'trr',
    title: 'TRR Notes Workbench',
    description: 'Central location for requirement notes, evidence management, and approvals.',
    defaultAnchor: 'notes-workbench'
  },
  analytics: {
    tab: 'data',
    title: 'Data Analytics Panel',
    description: 'Customer analytics, export builders, and engagement dashboards.',
    defaultAnchor: 'data-analytics-panel'
  },
  ai: {
    tab: 'ai',
    title: 'AI Advisor Console',
    description: 'Guided playbooks, contextual insights, and executive-ready narratives.',
    defaultAnchor: 'ai-advisor-console'
  },
  platform: {
    tab: 'xsiam',
    title: 'Platform Health Monitor',
    description: 'Visibility into XSIAM environment health, alerts, and troubleshooting flows.',
    defaultAnchor: 'platform-health-monitor'
  },
  creator: {
    tab: 'creator',
    title: 'Demo Blueprint Studio',
    description: 'Rapid demo authoring, workbook templates, and solution storytelling kits.',
    defaultAnchor: 'demo-blueprint-studio'
  },
  content: {
    tab: 'scenarios',
    title: 'Content Intelligence Library',
    description: 'Searchable content collections, battlecards, and POV-ready scenario bundles.',
    defaultAnchor: 'content-intelligence-library'
  },
  management: {
    tab: 'admin',
    title: 'Management Control Center',
    description: 'Team oversight, performance analytics, and feature rollout coordination.',
    defaultAnchor: 'management-control-center'
  }
} satisfies Record<string, WorkspaceConfigEntry>;

export type WorkspaceSlug = keyof typeof WORKSPACE_CONFIG;

export const workspaceConfig: Record<WorkspaceSlug, WorkspaceConfigEntry> = WORKSPACE_CONFIG;

export const workspaceSlugs: WorkspaceSlug[] = Object.keys(WORKSPACE_CONFIG) as WorkspaceSlug[];

export interface WorkspaceCapabilityLink {
  id: string;
  title: string;
  description: string;
  href: string;
  anchor: string;
  workspace: WorkspaceSlug;
  type: 'capability' | 'resource' | 'action';
}

export const workspaceCapabilityLinks: WorkspaceCapabilityLink[] = [
  {
    id: 'blueprint-automation',
    title: 'Blueprint Automation',
    description: 'Generate executive-ready transformation blueprints directly from the dashboard.',
    href: '/workspaces/dashboard#dashboard-blueprints',
    anchor: 'dashboard-blueprints',
    workspace: 'dashboard',
    type: 'capability'
  },
  {
    id: 'pov-planning',
    title: 'POV Planning Hub',
    description: 'Coordinate scenarios, timelines, and stakeholder objectives inside the POV workspace.',
    href: '/workspaces/pov#pov-planning-hub',
    anchor: 'pov-planning-hub',
    workspace: 'pov',
    type: 'capability'
  },
  {
    id: 'trr-notes',
    title: 'TRR Notes Workbench',
    description: 'Capture validation notes, link SDWs, and manage approvals in one workspace.',
    href: '/workspaces/trr#notes-workbench',
    anchor: 'notes-workbench',
    workspace: 'trr',
    type: 'capability'
  },
  {
    id: 'analytics-insights',
    title: 'Data Analytics Panel',
    description: 'Build exports, review job history, and visualize engagement metrics.',
    href: '/workspaces/analytics#data-analytics-panel',
    anchor: 'data-analytics-panel',
    workspace: 'analytics',
    type: 'capability'
  },
  {
    id: 'ai-advisor',
    title: 'AI Advisor Console',
    description: 'Tap into contextual insights, recommendations, and reusable response templates.',
    href: '/workspaces/ai#ai-advisor-console',
    anchor: 'ai-advisor-console',
    workspace: 'ai',
    type: 'capability'
  },
  {
    id: 'platform-monitoring',
    title: 'Platform Health Monitor',
    description: 'Track XSIAM system health, live alerts, and guided troubleshooting steps.',
    href: '/workspaces/platform#platform-health-monitor',
    anchor: 'platform-health-monitor',
    workspace: 'platform',
    type: 'capability'
  },
  {
    id: 'demo-studio',
    title: 'Demo Blueprint Studio',
    description: 'Author custom demos, content templates, and solution walkthroughs.',
    href: '/workspaces/creator#demo-blueprint-studio',
    anchor: 'demo-blueprint-studio',
    workspace: 'creator',
    type: 'capability'
  },
  {
    id: 'content-library',
    title: 'Content Intelligence Library',
    description: 'Browse curated battlecards and ready-to-deploy scenarios for customer engagements.',
    href: '/workspaces/content#content-intelligence-library',
    anchor: 'content-intelligence-library',
    workspace: 'content',
    type: 'resource'
  },
  {
    id: 'management-center',
    title: 'Management Control Center',
    description: 'Oversee consultant activity, feature adoption, and team-level performance.',
    href: '/workspaces/management#management-control-center',
    anchor: 'management-control-center',
    workspace: 'management',
    type: 'capability'
  }
];

export const resolveWorkspaceSlug = (slug: string): WorkspaceSlug => {
  if ((slug as WorkspaceSlug) in WORKSPACE_CONFIG) {
    return slug as WorkspaceSlug;
  }

  return 'dashboard';
};

