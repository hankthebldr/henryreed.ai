# Event-Based User Management Portal

## Overview

The Event-Based User Management Portal provides comprehensive user lifecycle management for the Cortex DC Portal. It automatically captures user information during registration, manages user profiles, tracks activity, and provides administrative oversight through an elegant web interface.

## Architecture Overview

```mermaid
graph TD
    Auth[Firebase Authentication] -->|User Creation Event| CreateFn[createUserProfile Function]
    Auth -->|User Sign In| SignInFn[beforeUserSignIn Function]
    
    CreateFn -->|Creates Document| UserDoc[users/{uid}]
    UserDoc -->|Triggers Event| DocTrigger[onUserDocumentCreated]
    
    DocTrigger -->|Creates| Settings[User Settings]
    DocTrigger -->|Creates| Activity[Activity Log]
    DocTrigger -->|Creates| Notification[Welcome Notification]
    DocTrigger -->|Updates| Organization[Organization Membership]
    
    Portal[User Management Portal] -->|Calls| Functions[Cloud Functions]
    Portal -->|Reads/Writes| Firestore[Firestore Collections]
    
    Functions --> UserDoc
    Functions --> Settings
    Functions --> Activity
    Functions --> Notification
```

## Features

### 🔄 Automatic User Processing
- **Event-Driven Creation**: Automatically captures user information when accounts are created
- **Profile Initialization**: Creates comprehensive user profiles with metadata
- **Organization Assignment**: Auto-assigns users to organizations based on email domain
- **Welcome Workflow**: Sends welcome notifications and initializes settings

### 👥 User Management
- **Profile Management**: Create, read, update user profiles
- **Role-Based Access**: Support for user, analyst, manager, and admin roles
- **Status Management**: Active, inactive, pending, suspended status tracking
- **Bulk Operations**: Update multiple users simultaneously

### 📊 Activity Tracking
- **Real-Time Monitoring**: Track all user actions and system events
- **Audit Trail**: Comprehensive logging for compliance and debugging
- **Analytics**: User statistics and usage patterns

### 🏢 Organization Support
- **Multi-Tenant**: Support for multiple organizations
- **Domain-Based Assignment**: Auto-assign based on email domain
- **Member Management**: Add/remove users from organizations

### 🔔 Notifications System
- **Welcome Messages**: Automated welcome notifications
- **Status Updates**: Notifications for profile changes
- **Admin Alerts**: Critical events and user actions

## Firebase Functions

### Authentication Event Handlers

#### `createUserProfile`
**Type**: Callable Function  
**Purpose**: Manually create user profiles with additional data

```typescript
// Usage
const result = await firebase.functions().httpsCallable('createUserProfile')({
  email: 'user@henryreed.ai',
  displayName: 'John Doe',
  role: 'analyst',
  department: 'Security',
  organizationId: 'henryreed'
});
```

#### `updateUserProfile`
**Type**: Callable Function  
**Purpose**: Update existing user profiles

```typescript
// Usage
const result = await firebase.functions().httpsCallable('updateUserProfile')({
  displayName: 'John Smith',
  department: 'Engineering',
  role: 'manager',
  status: 'active'
});
```

#### `onUserDocumentCreated`
**Type**: Firestore Trigger  
**Purpose**: Automatically triggered when user documents are created
- Creates activity log entries
- Initializes user settings
- Sends welcome notifications
- Adds users to organizations

#### `beforeUserCreation` (Optional - Requires GCIP)
**Type**: Auth Blocking Function  
**Purpose**: Validates and enriches user data before account creation
- Domain validation
- Custom claims assignment
- Organization mapping

#### `beforeUserSignIn` (Optional - Requires GCIP)
**Type**: Auth Blocking Function  
**Purpose**: Additional validation and logging on each sign-in
- Account suspension checks
- Activity tracking
- Custom claims updates

## Data Models

### User Profile
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'user' | 'admin' | 'analyst' | 'manager';
  organizationId: string | null;
  department: string | null;
  permissions: string[];
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  metadata: {
    createdAt: Timestamp;
    lastActive: Timestamp;
    loginCount: number;
    emailVerified: boolean;
    providerData: any[];
  };
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}
```

### User Settings
```typescript
interface UserSettings {
  userId: string;
  dashboard: {
    layout: string;
    widgets: string[];
  };
  notifications: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
    frequency: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
  };
  createdAt: Timestamp;
}
```

### Activity Log
```typescript
interface ActivityLog {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: any;
  timestamp: Timestamp;
}
```

## Firestore Collections

### `users/{uid}`
- User profile documents
- Indexed by: `metadata.createdAt`, `role`, `status`, `organizationId`

### `userSettings/{uid}`
- User-specific settings and preferences
- Automatically created for new users

### `activityLogs/{logId}`
- User activity and system events
- Indexed by: `timestamp`, `userId`, `action`

### `notifications/{notificationId}`
- User notifications and messages
- Indexed by: `userId`, `createdAt`, `read`

### `organizations/{orgId}`
- Organization metadata and member lists
- Updated automatically when users join/leave

## User Management Portal Component

### Features
- **Dashboard**: Overview statistics and recent activity
- **User Table**: Searchable, filterable list of all users
- **Role Management**: Easy role assignment and permission management
- **Status Controls**: Activate, deactivate, suspend users
- **Bulk Operations**: Update multiple users at once
- **Activity Monitoring**: Real-time user activity tracking

### Usage in Next.js

```tsx
import UserManagementPortal from '../components/UserManagementPortal';

export default function AdminPage() {
  return (
    <div className="p-6">
      <UserManagementPortal />
    </div>
  );
}
```

### Required Permissions
The portal requires admin-level permissions to:
- View all users
- Update user profiles
- Change user roles and status
- View activity logs

## Security Considerations

### Role-Based Access Control
```typescript
const permissions = {
  user: ['read:own_profile', 'update:own_profile'],
  analyst: ['read:scenarios', 'create:scenarios', 'read:trrs', 'create:trrs'],
  manager: ['read:all', 'create:all', 'update:team_data'],
  admin: ['read:all', 'create:all', 'update:all', 'delete:all', 'manage:users']
};
```

### Domain Validation
- Automatic organization assignment based on email domain
- Support for `henryreed.ai` and `paloaltonetworks.com` domains
- Configurable domain allowlist

### Data Protection
- Personal information encryption at rest
- Audit trails for all user data modifications
- Automatic cleanup of old logs and inactive accounts

## API Service Integration

The `UserManagementService` provides a comprehensive API for frontend integration:

```typescript
import { userManagementService } from '../lib/user-management-service';

// Create user
const result = await userManagementService.createUser({
  email: 'user@example.com',
  displayName: 'John Doe',
  role: 'user'
});

// Get users with filters
const users = await userManagementService.getUsers({
  role: 'analyst',
  status: 'active',
  limit: 50
});

// Subscribe to real-time updates
const unsubscribe = userManagementService.subscribeToUsers(
  (users) => console.log('Users updated:', users),
  { status: 'active' }
);
```

## Deployment and Configuration

### Prerequisites
- Firebase project with Authentication enabled
- Firestore database configured
- Cloud Functions deployed
- Identity and Access Management (IAM) roles configured

### Environment Variables
```bash
# Firebase Functions configuration
ALLOWED_ORIGINS=https://henryreedai.web.app,http://localhost:3000
ALLOW_UNAUTH=false
NODE_ENV=production
```

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admins can read/write all user profiles
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // User settings are private
    match /userSettings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Activity logs are admin-only
    match /activityLogs/{logId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'];
      allow write: if false; // Only server-side writes
    }
  }
}
```

### Firebase Indexes
The following Firestore indexes are required:
- `users` collection: `(role, ASC), (status, ASC), (metadata.createdAt, DESC)`
- `activityLogs` collection: `(userId, ASC), (timestamp, DESC)`
- `notifications` collection: `(userId, ASC), (createdAt, DESC)`

## Monitoring and Analytics

### Key Metrics
- User creation rate
- Active vs inactive users
- Role distribution
- Organization membership
- Activity patterns

### Logging
All user management operations are logged with:
- Timestamp
- User ID
- Action performed
- IP address (where applicable)
- Success/failure status

### Alerts
Configure alerts for:
- Suspicious login patterns
- Bulk user modifications
- Failed authentication attempts
- System errors

## Testing

### Unit Tests
```bash
# Test Firebase Functions
cd functions
npm test

# Test React Components
cd hosting
npm test
```

### Integration Tests
```bash
# Test with Firebase Emulators
firebase emulators:start
npm run test:integration
```

### Manual Testing Checklist
- [ ] User registration creates profile automatically
- [ ] Welcome notification is sent
- [ ] User settings are initialized
- [ ] Organization assignment works correctly
- [ ] Role-based permissions are enforced
- [ ] Activity logging functions properly
- [ ] Portal UI updates in real-time
- [ ] Bulk operations work correctly

## Troubleshooting

### Common Issues

**Functions not triggering**
- Check Firestore security rules
- Verify function deployment status
- Review function logs for errors

**Portal not loading users**
- Verify Firebase configuration
- Check authentication status
- Review browser console for errors

**Activity logs not appearing**
- Confirm Firestore indexes are deployed
- Check function execution logs
- Verify collection names match

### Debug Commands
```bash
# Check function status
firebase functions:list

# View function logs
firebase functions:log --only createUserProfile

# Test locally
firebase emulators:start
```

## Future Enhancements

### Planned Features
- [ ] SAML SSO integration
- [ ] Advanced role hierarchy
- [ ] User import/export
- [ ] Advanced analytics dashboard
- [ ] Mobile app support
- [ ] API rate limiting
- [ ] Custom user fields

### Integration Opportunities
- [ ] Slack notifications for admin actions
- [ ] Email templates for user communications
- [ ] LDAP/Active Directory sync
- [ ] Audit log export to external systems

This event-based user management portal provides a solid foundation for user lifecycle management while supporting the continuous improvement and deployment capabilities required for modern applications.