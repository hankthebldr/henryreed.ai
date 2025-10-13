# RBAC Testing Guide - Cortex DC Portal

## Overview

This guide provides comprehensive instructions for testing Role-Based Access Control (RBAC) in the Cortex DC Portal. The system supports 6 distinct roles with different permission levels and tab visibility.

## Test User Accounts

All test accounts are defined in `/hosting/lib/rbac-testing-utils.ts`. The system supports both Firebase authentication and mock authentication mode.

### Available Test Users

| Role | Username | Password | Display Name | Description |
|------|----------|----------|--------------|-------------|
| **admin** | cortex | xsiam | Cortex System Admin | Full system access, user management, all features |
| **manager** | manager | manager | Team Manager | Team oversight, approve TRRs/SDWs, team analytics |
| **senior_dc** | senior | senior | Senior Domain Consultant | Advanced features, team visibility, no approval rights |
| **dc** | demo | demo | Demo User - Domain Consultant | Standard DC access, create/edit own content |
| **se** | user1 | paloalto1 | User One - Domain Consultant | Systems Engineer with DC-level access |
| **viewer** | viewer | viewer | Read-Only Viewer | Read-only access, no creation or editing |

## Quick Start Testing

### Step 1: Login

1. Navigate to the login page at `/login`
2. Enter credentials from the table above
3. Click "Sign In"
4. You should be redirected to the GUI interface at `/gui`

### Step 2: Verify Tab Visibility

Each role has specific tabs visible:

**Admin Role** (cortex/xsiam) - **10 tabs**:
- Dashboard
- POV Management
- TRR & Requirements
- Demo Hub
- Platform Health
- AI Assistant
- Data Integration Hub (admin only)
- Asset Creator
- Content Library
- DC Management (admin only)

**Manager Role** (manager/manager) - **9 tabs**:
- Dashboard
- POV Management
- TRR & Requirements
- Demo Hub
- Platform Health
- AI Assistant
- Data Integration Hub
- Asset Creator
- Content Library

**Senior DC Role** (senior/senior) - **9 tabs**:
- Dashboard
- POV Management
- TRR & Requirements
- Demo Hub
- Platform Health
- AI Assistant
- Data Integration Hub
- Asset Creator
- Content Library

**DC Role** (demo/demo or user1/paloalto1) - **8 tabs**:
- Dashboard
- POV Management
- TRR & Requirements
- Demo Hub
- Platform Health
- AI Assistant
- Asset Creator
- Content Library

**Viewer Role** (viewer/viewer) - **6-8 tabs**:
- Dashboard
- POV Management
- TRR & Requirements
- Demo Hub
- Platform Health
- AI Assistant

### Step 3: Verify Permissions

Check the following for each role:

1. **User Management**
   - Admin: Can access DC Management tab
   - Others: Tab not visible

2. **Data Integration Hub**
   - Admin, Manager, Senior DC: Can access
   - DC, SE, Viewer: Tab not visible

3. **Content Creation**
   - Admin, Manager, Senior DC, DC, SE: Can create POVs, TRRs, Demos
   - Viewer: Read-only access

4. **Approval Rights**
   - Admin, Manager: Can approve TRRs and POVs
   - Others: Cannot approve

### Step 4: Test Role Switching

1. Login with one account (e.g., cortex/xsiam)
2. Note the visible tabs and permissions
3. Click the **Logout** button in the header (red button with 🚪 icon)
4. You will be redirected to the login page
5. Login with a different account (e.g., demo/demo)
6. Verify that tabs and permissions have changed

## Detailed Test Scenarios

### Scenario 1: Admin Access Test

**Login**: cortex/xsiam

**Expected Behavior**:
1. ✅ All 10 navigation tabs are visible
2. ✅ "DC Management" tab is accessible
3. ✅ Can view system-wide analytics in header (Total Users, Active, Uptime)
4. ✅ Header shows "MANAGEMENT MODE" badge
5. ✅ Header shows "Aggregated View" label
6. ✅ Can access Data Integration Hub
7. ✅ Can create, edit, delete, and approve all content

**Test Steps**:
1. Login as cortex/xsiam
2. Count navigation tabs (should be 10)
3. Click "DC Management" tab (should load ManagementDashboard component)
4. Verify system metrics in header
5. Verify management mode badge is present
6. Try creating a POV (should succeed)
7. Try accessing Data Integration Hub (should succeed)

### Scenario 2: Manager Access Test

**Login**: manager/manager

**Expected Behavior**:
1. ✅ 9 navigation tabs visible (no DC Management)
2. ✅ Can access Data Integration Hub
3. ✅ Header shows "MANAGEMENT MODE" badge
4. ✅ Header shows "Aggregated View" label
5. ✅ Can view team-level analytics
6. ✅ Can approve TRRs and POVs
7. ✅ Cannot access DC Management tab

**Test Steps**:
1. Login as manager/manager
2. Count navigation tabs (should be 9)
3. Verify DC Management tab is not present
4. Verify management mode badge is present
5. Access Data Integration Hub (should succeed)
6. Try to approve a TRR (should succeed)
7. Verify team-level data visibility

### Scenario 3: DC Standard Access Test

**Login**: demo/demo

**Expected Behavior**:
1. ✅ 8 navigation tabs visible (no DC Management, no Data Integration Hub)
2. ✅ Header shows "Personal View" label
3. ✅ No management mode badge
4. ✅ Can create POVs, TRRs, and Demos
5. ✅ Can only view own content
6. ✅ Cannot approve TRRs
7. ✅ Can access Demo Hub with DC tooling

**Test Steps**:
1. Login as demo/demo
2. Count navigation tabs (should be 8)
3. Verify "Personal View" label in header
4. Create a new POV (should succeed)
5. Try to view another user's POV (should not see it or see limited info)
6. Access Demo Hub (should succeed)
7. Try to approve a TRR (approval button should not be visible)

### Scenario 4: Viewer Restrictions Test

**Login**: viewer/viewer

**Expected Behavior**:
1. ✅ 6-8 navigation tabs visible (limited access)
2. ✅ Read-only mode throughout the application
3. ✅ Cannot create POVs, TRRs, or Demos
4. ✅ No edit or delete buttons visible
5. ✅ Can view reports and dashboards
6. ✅ Limited scenario access

**Test Steps**:
1. Login as viewer/viewer
2. Count navigation tabs
3. Try to create a new POV (button should not be visible or disabled)
4. View existing content (should be able to read)
5. Look for edit/delete buttons (should not be present)
6. Try to access Demo Hub (should be read-only or limited)

### Scenario 5: Role Switching Test

**Purpose**: Verify that logging out and logging in as a different role correctly updates permissions

**Test Steps**:
1. Login as admin (cortex/xsiam)
2. Note available tabs (should be 10)
3. Note system metrics in header
4. Click the **Logout** button (🚪 icon in header)
5. Verify redirect to login page
6. Login as dc (demo/demo)
7. Verify only 8 tabs are visible
8. Verify management mode badge is NOT present
9. Verify "Personal View" label
10. Attempt to access features that were available as admin (should fail)
11. Logout again
12. Login as viewer (viewer/viewer)
13. Verify read-only restrictions

### Scenario 6: Logout Functionality Test

**Test Steps**:
1. Login with any test account
2. Locate the **Logout** button in the header (red button with 🚪 icon, next to user info)
3. Click the Logout button
4. Verify:
   - User session is cleared
   - Redirected to `/login` page
   - Cannot access `/gui` without logging in again
   - localStorage/sessionStorage is cleared
5. Try to navigate back to `/gui` (should redirect to login)
6. Login again with the same credentials (should work)

## Permission Matrix

The complete permission matrix is defined in `/hosting/lib/rbac-testing-utils.ts`:

```typescript
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
    visibility: 'all'
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
    visibility: 'team'
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
    visibility: 'team'
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
    visibility: 'own'
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
    visibility: 'own'
  }
};
```

## Tab Visibility Matrix

```typescript
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
```

## Using Testing Utilities

### Console Testing

The RBAC testing utilities can be accessed via the browser console:

```javascript
// Import testing utilities (in browser console after page load)
import {
  TEST_USERS,
  ROLE_PERMISSIONS,
  hasPermission,
  canAccessTab,
  getVisibleTabs,
  generateRBACReport,
  printTestingGuide
} from '/hosting/lib/rbac-testing-utils';

// Print complete testing guide
printTestingGuide();

// Check if a role has a specific permission
hasPermission('admin', 'canManageUsers'); // true
hasPermission('dc', 'canManageUsers'); // false

// Check if a role can access a tab
canAccessTab('admin', 'admin'); // true
canAccessTab('dc', 'admin'); // false

// Get all visible tabs for a role
getVisibleTabs('manager'); // ['dashboard', 'pov', 'trr', ...]

// Generate complete report for a role
const report = generateRBACReport('senior_dc');
console.log(report);
/*
{
  role: 'senior_dc',
  permissions: { canViewUserData: true, ... },
  visibleTabs: ['dashboard', 'pov', ...],
  testUser: { username: 'senior', password: 'senior', ... }
}
*/
```

### Automated Testing Helper

```javascript
// Quick test all roles
const roles = ['admin', 'manager', 'senior_dc', 'dc', 'viewer'];
roles.forEach(role => {
  console.group(`Testing ${role} role`);
  const report = generateRBACReport(role);
  console.log('Visible tabs:', report.visibleTabs);
  console.log('Can manage users:', report.permissions.canManageUsers);
  console.log('Can approve:', report.permissions.canApprove);
  console.log('Visibility:', report.permissions.visibility);
  console.groupEnd();
});
```

## Common Issues and Troubleshooting

### Issue 1: Logout button not visible

**Symptom**: Cannot see the logout button in the header

**Solution**:
- Ensure you are logged in (button only shows when `currentUser` is set)
- Check browser console for errors
- Verify `/hosting/components/CortexGUIInterface.tsx` has the logout button code

### Issue 2: Tabs not filtering by role

**Symptom**: All tabs visible regardless of role

**Solution**:
- Check `getVisibleTabs()` function in `/hosting/components/CortexGUIInterface.tsx:1008-1022`
- Verify `currentUser.role` is set correctly
- Check console for role value

### Issue 3: Permissions not working

**Symptom**: User can access features they shouldn't have access to

**Solution**:
- Check `derivePermissionsFromRole()` function at `/hosting/components/CortexGUIInterface.tsx:38-52`
- Verify permissions are being applied in component logic
- Check that components are using the `userPermissions` state

### Issue 4: Login fails for test accounts

**Symptom**: Cannot login with test credentials

**Solution**:
- Verify mock auth mode is enabled (check `/hosting/lib/firebase-config.ts`)
- Check AuthContext.tsx has the correct test credentials
- Ensure credentials match those in `RBAC_TESTING_GUIDE.md`

## Testing Checklist

Use this checklist to ensure comprehensive RBAC testing:

- [ ] All 6 test accounts can login successfully
- [ ] Admin role sees all 10 tabs
- [ ] Manager role sees 9 tabs (no DC Management)
- [ ] Senior DC role sees 9 tabs (no DC Management)
- [ ] DC role sees 8 tabs (no Admin, no Data Hub)
- [ ] Viewer role has read-only access
- [ ] Logout button is visible when logged in
- [ ] Logout successfully clears session
- [ ] Cannot access restricted tabs by URL manipulation
- [ ] Permissions correctly control feature visibility
- [ ] Role switching works correctly
- [ ] Management mode badge shows for admin/manager
- [ ] Personal view shows for dc/se/viewer
- [ ] System metrics visible to admin/manager only

## Files Modified for RBAC Testing

1. **`/hosting/lib/rbac-testing-utils.ts`** (Created)
   - Test user credentials
   - Permission matrix
   - Tab visibility rules
   - Testing utilities

2. **`/hosting/components/CortexGUIInterface.tsx`** (Modified)
   - Added logout button to header (line 1059-1067)
   - Imported `useAuth` hook (line 9)
   - Added `handleLogout` function (line 736-745)

3. **`/hosting/contexts/AuthContext.tsx`** (Existing)
   - Mock authentication support
   - Logout functionality
   - Test account support (demo/demo, user1/paloalto1, cortex/xsiam)

4. **`/hosting/lib/user-management.ts`** (Existing)
   - User profile management
   - Role-based permission derivation
   - System metrics

## Summary

The Cortex DC Portal RBAC system provides comprehensive role-based access control with 6 distinct roles. The system is designed for easy testing with mock authentication mode and provides utilities for automated testing. All test accounts are documented and ready to use for RBAC validation.

**Key Features**:
- 6 roles with distinct permissions
- Tab visibility filtering
- Permission-based feature access
- Easy role switching via logout
- Comprehensive testing utilities
- Mock authentication for development

For additional support, refer to:
- `/hosting/lib/rbac-testing-utils.ts` - Testing utilities
- `/hosting/contexts/AuthContext.tsx` - Authentication logic
- `/hosting/lib/user-management.ts` - User and permission management
