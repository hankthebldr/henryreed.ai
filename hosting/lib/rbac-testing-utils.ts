// RBAC Testing Utilities
// Comprehensive testing tools for Role-Based Access Control

import { UserRole } from './user-management';

export interface TestCredentials {
  username: string;
  password: string;
  role: UserRole;
  displayName: string;
  email: string;
  description: string;
}

/**
 * Test user accounts for RBAC testing
 * All passwords match the username for easy testing
 */
export const TEST_USERS: Record<string, TestCredentials> = {
  // Admin role - Full access
  admin: {
    username: 'cortex',
    password: 'xsiam',
    role: 'admin',
    displayName: 'Cortex System Admin',
    email: 'cortex@paloaltonetworks.com',
    description: 'Full system access, user management, all features'
  },

  // Manager role - Team oversight
  manager: {
    username: 'manager',
    password: 'manager',
    role: 'manager',
    displayName: 'Team Manager',
    email: 'manager@paloaltonetworks.com',
    description: 'Team oversight, approve TRRs/SDWs, team analytics'
  },

  // Senior DC role - Advanced user
  senior_dc: {
    username: 'senior',
    password: 'senior',
    role: 'senior_dc',
    displayName: 'Senior Domain Consultant',
    email: 'senior.dc@paloaltonetworks.com',
    description: 'Advanced features, team visibility, no approval rights'
  },

  // DC role - Standard user
  dc: {
    username: 'demo',
    password: 'demo',
    role: 'dc',
    displayName: 'Demo User - Domain Consultant',
    email: 'demo@paloaltonetworks.com',
    description: 'Standard DC access, create/edit own content'
  },

  // SE role - Standard user (alternative)
  se: {
    username: 'user1',
    password: 'paloalto1',
    role: 'dc', // Mapped to DC role in practice
    displayName: 'User One - Domain Consultant',
    email: 'user1@paloaltonetworks.com',
    description: 'Systems Engineer with DC-level access'
  },

  // Viewer role - Read-only
  viewer: {
    username: 'viewer',
    password: 'viewer',
    role: 'viewer',
    displayName: 'Read-Only Viewer',
    email: 'viewer@paloaltonetworks.com',
    description: 'Read-only access, no creation or editing'
  }
};

/**
 * Permission matrix for each role
 */
export const ROLE_PERMISSIONS = {
  admin: {
    canViewUserData: true,
    canViewAggregatedData: true,
    canManageUsers: true,
    canAccessAllProjects: true,
    canModifySystemSettings: true,
    canViewAnalytics: true,
    canAccessAdmin: true,
    canDeployScenarios: true,
    canCreateTRR: true,
    canAccessScenarioEngine: true,
    canViewReports: true,
    canApprove: true,
    canDelete: true,
    visibility: 'all' as const
  },
  manager: {
    canViewUserData: true,
    canViewAggregatedData: true,
    canManageUsers: false,
    canAccessAllProjects: false,
    canModifySystemSettings: false,
    canViewAnalytics: true,
    canAccessAdmin: false,
    canDeployScenarios: true,
    canCreateTRR: true,
    canAccessScenarioEngine: true,
    canViewReports: true,
    canApprove: true,
    canDelete: false,
    visibility: 'team' as const
  },
  senior_dc: {
    canViewUserData: true,
    canViewAggregatedData: false,
    canManageUsers: false,
    canAccessAllProjects: false,
    canModifySystemSettings: false,
    canViewAnalytics: true,
    canAccessAdmin: false,
    canDeployScenarios: true,
    canCreateTRR: true,
    canAccessScenarioEngine: true,
    canViewReports: true,
    canApprove: false,
    canDelete: false,
    visibility: 'team' as const
  },
  dc: {
    canViewUserData: true,
    canViewAggregatedData: false,
    canManageUsers: false,
    canAccessAllProjects: false,
    canModifySystemSettings: false,
    canViewAnalytics: false,
    canAccessAdmin: false,
    canDeployScenarios: true,
    canCreateTRR: true,
    canAccessScenarioEngine: true,
    canViewReports: true,
    canApprove: false,
    canDelete: false,
    visibility: 'own' as const
  },
  se: {
    canViewUserData: true,
    canViewAggregatedData: false,
    canManageUsers: false,
    canAccessAllProjects: false,
    canModifySystemSettings: false,
    canViewAnalytics: false,
    canAccessAdmin: false,
    canDeployScenarios: true,
    canCreateTRR: true,
    canAccessScenarioEngine: true,
    canViewReports: true,
    canApprove: false,
    canDelete: false,
    visibility: 'own' as const
  },
  viewer: {
    canViewUserData: true,
    canViewAggregatedData: false,
    canManageUsers: false,
    canAccessAllProjects: false,
    canModifySystemSettings: false,
    canViewAnalytics: false,
    canAccessAdmin: false,
    canDeployScenarios: false,
    canCreateTRR: false,
    canAccessScenarioEngine: false,
    canViewReports: true,
    canApprove: false,
    canDelete: false,
    visibility: 'own' as const
  }
};

/**
 * Tab visibility by role
 */
export const TAB_VISIBILITY = {
  dashboard: ['admin', 'manager', 'senior_dc', 'dc', 'se', 'viewer'],
  pov: ['admin', 'manager', 'senior_dc', 'dc', 'se', 'viewer'],
  trr: ['admin', 'manager', 'senior_dc', 'dc', 'se', 'viewer'],
  demos: ['admin', 'manager', 'senior_dc', 'dc', 'se', 'viewer'],
  xsiam: ['admin', 'manager', 'senior_dc', 'dc', 'se', 'viewer'],
  ai: ['admin', 'manager', 'senior_dc', 'dc', 'se', 'viewer'],
  data: ['admin', 'manager', 'senior_dc'], // Limited to senior roles
  creator: ['admin', 'manager', 'senior_dc', 'dc', 'se'],
  scenarios: ['admin', 'manager', 'senior_dc', 'dc', 'se'],
  admin: ['admin'] // Admin only
};

/**
 * Get all test users
 */
export function getAllTestUsers(): TestCredentials[] {
  return Object.values(TEST_USERS);
}

/**
 * Get test user by role
 */
export function getTestUserByRole(role: UserRole): TestCredentials | null {
  return Object.values(TEST_USERS).find(user => user.role === role) || null;
}

/**
 * Get test user by username
 */
export function getTestUserByUsername(username: string): TestCredentials | null {
  return Object.values(TEST_USERS).find(user => user.username === username) || null;
}

/**
 * Check if role has permission
 */
export function hasPermission(role: UserRole, permission: keyof typeof ROLE_PERMISSIONS.admin): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions[permission] || false : false;
}

/**
 * Check if role can access tab
 */
export function canAccessTab(role: UserRole, tabId: string): boolean {
  const allowedRoles = TAB_VISIBILITY[tabId as keyof typeof TAB_VISIBILITY];
  return allowedRoles ? allowedRoles.includes(role) : false;
}

/**
 * Get visible tabs for role
 */
export function getVisibleTabs(role: UserRole): string[] {
  return Object.entries(TAB_VISIBILITY)
    .filter(([, roles]) => roles.includes(role))
    .map(([tabId]) => tabId);
}

/**
 * Generate RBAC test report
 */
export function generateRBACReport(role: UserRole): {
  role: UserRole;
  permissions: typeof ROLE_PERMISSIONS.admin;
  visibleTabs: string[];
  testUser: TestCredentials | null;
} {
  return {
    role,
    permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer,
    visibleTabs: getVisibleTabs(role),
    testUser: getTestUserByRole(role)
  };
}

/**
 * Quick reference guide for testing
 */
export const TESTING_GUIDE = {
  quickStart: {
    admin: 'Login: cortex / xsiam - Full access to all features',
    manager: 'Login: manager / manager - Team oversight and approvals',
    senior_dc: 'Login: senior / senior - Advanced features, no approvals',
    dc: 'Login: demo / demo - Standard user, own content only',
    viewer: 'Login: viewer / viewer - Read-only access'
  },

  testScenarios: [
    {
      name: 'Admin Access Test',
      steps: [
        'Login as cortex/xsiam',
        'Verify all 10 tabs are visible',
        'Access DC Management tab',
        'Verify user management features',
        'Check system metrics visibility'
      ]
    },
    {
      name: 'Manager Access Test',
      steps: [
        'Login as manager/manager',
        'Verify 9 tabs visible (no Admin)',
        'Access Data Integration Hub',
        'Verify team-level analytics',
        'Test POV approval features'
      ]
    },
    {
      name: 'DC Standard Access Test',
      steps: [
        'Login as demo/demo',
        'Verify 8 tabs visible (no Admin, no Data Hub)',
        'Access Demo Hub',
        'Create demo with DC tooling',
        'Verify own content visibility only'
      ]
    },
    {
      name: 'Viewer Restrictions Test',
      steps: [
        'Login as viewer/viewer',
        'Verify read-only mode',
        'Attempt to create POV (should fail)',
        'Verify no edit/delete buttons',
        'Check limited scenario access'
      ]
    },
    {
      name: 'Role Switching Test',
      steps: [
        'Login as admin (cortex/xsiam)',
        'Note available features',
        'Logout',
        'Login as dc (demo/demo)',
        'Verify reduced features',
        'Compare tab visibility'
      ]
    }
  ],

  expectedBehavior: {
    admin: [
      'See all 10 navigation tabs',
      'Access DC Management tab',
      'View system-wide analytics',
      'Manage all users',
      'Approve any TRR/POV',
      'Access all demos and content'
    ],
    manager: [
      'See 9 navigation tabs (no Admin)',
      'Access Data Integration Hub',
      'View team analytics',
      'Approve team TRRs/POVs',
      'Cannot manage users',
      'View team demos'
    ],
    senior_dc: [
      'See 9 navigation tabs (no Admin)',
      'Access Data Integration Hub',
      'View team data (no approval)',
      'Advanced AI features',
      'Cannot approve TRRs',
      'Export capabilities'
    ],
    dc: [
      'See 8 navigation tabs',
      'No Admin or Data Hub access',
      'Own content only',
      'Create POVs/TRRs/Demos',
      'Cannot approve',
      'Basic AI features'
    ],
    viewer: [
      'See 6-8 navigation tabs',
      'Read-only everywhere',
      'Cannot create content',
      'View reports only',
      'No editing capability',
      'Limited scenario access'
    ]
  }
};

/**
 * Console helper for RBAC testing
 */
export function printTestingGuide() {
  console.group('🔐 RBAC Testing Guide');

  console.group('📋 Quick Start Credentials:');
  Object.entries(TESTING_GUIDE.quickStart).forEach(([role, info]) => {
    console.log(`${role}: ${info}`);
  });
  console.groupEnd();

  console.group('🧪 Test Scenarios:');
  TESTING_GUIDE.testScenarios.forEach(scenario => {
    console.group(`${scenario.name}:`);
    scenario.steps.forEach((step, i) => {
      console.log(`${i + 1}. ${step}`);
    });
    console.groupEnd();
  });
  console.groupEnd();

  console.group('✅ Expected Behavior:');
  Object.entries(TESTING_GUIDE.expectedBehavior).forEach(([role, behaviors]) => {
    console.group(`${role}:`);
    behaviors.forEach(behavior => console.log(`• ${behavior}`));
    console.groupEnd();
  });
  console.groupEnd();

  console.groupEnd();
}

// Auto-print guide in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('💡 Type printTestingGuide() in console for RBAC testing instructions');
}

export default {
  TEST_USERS,
  ROLE_PERMISSIONS,
  TAB_VISIBILITY,
  getAllTestUsers,
  getTestUserByRole,
  getTestUserByUsername,
  hasPermission,
  canAccessTab,
  getVisibleTabs,
  generateRBACReport,
  TESTING_GUIDE,
  printTestingGuide
};
