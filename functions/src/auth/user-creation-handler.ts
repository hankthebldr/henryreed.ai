// User Creation Event Handler for Firebase Authentication
import { onCall } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { beforeUserCreated, beforeUserSignedIn } from 'firebase-functions/v2/identity';
import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

// ============================================================================
// USER CREATION EVENT HANDLER
// ============================================================================

interface UserProfileData {
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
    createdAt: admin.firestore.FieldValue;
    lastActive: admin.firestore.FieldValue;
    loginCount: number;
    emailVerified: boolean;
    providerData: any[];
  };
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}

/**
 * Before User Creation Hook
 * Validates and enriches user data before account creation
 */
export const beforeUserCreation = beforeUserCreated({
  region: 'us-central1',
  timeoutSeconds: 60
}, async (event) => {
  const user = event.data;
  const email = user?.email;
  const uid = user?.uid;
  
  logger.info('User creation initiated', { uid, email });

  // Domain validation for organization users
  const allowedDomains = ['henryreed.ai', 'paloaltonetworks.com'];
  const emailDomain = email?.split('@')[1];
  
  if (email && emailDomain && !allowedDomains.includes(emailDomain)) {
    logger.warn('User creation blocked - unauthorized domain', { email, domain: emailDomain });
    // Allow creation but mark for approval
  }

  // Set custom claims during creation
  return {
    customClaims: {
      role: 'user',
      organizationId: getOrganizationFromEmail(email),
      createdAt: Date.now(),
      emailDomain: emailDomain
    }
  };
});

/**
 * Before User Sign In Hook
 * Additional validation and logging on each sign-in
 */
export const beforeUserSignIn = beforeUserSignedIn({
  region: 'us-central1',
  timeoutSeconds: 30
}, async (event) => {
  const user = event.data;
  const uid = user?.uid;
  const email = user?.email;
  
  logger.info('User sign-in attempt', { uid, email });
  
  // Check if user is suspended
  if (uid) {
    try {
      const userDoc = await admin.firestore().collection('users').doc(uid).get();
      if (userDoc.exists && userDoc.data()?.status === 'suspended') {
        logger.warn('Sign-in blocked - user suspended', { uid, email });
        throw new Error('Account suspended. Please contact administrator.');
      }
    } catch (error) {
      logger.error('Error checking user status during sign-in', error);
    }

    // Update last active timestamp
    await updateUserLastActive(uid);
  }
  
  return {};
});

/**
 * Firestore Trigger: New User Document Created
 * Triggered when a user document is created in Firestore
 */
export const onUserDocumentCreated = onDocumentCreated({
  document: 'users/{userId}',
  region: 'us-central1'
}, async (event) => {
  const userId = event.params!.userId;
  const userData = event.data!.data() as UserProfileData;
  
  logger.info('New user document created', { userId, email: userData.email });

  // Create activity log entry
  await createActivityLog({
    userId,
    action: 'user_created',
    entityType: 'user',
    entityId: userId,
    details: {
      email: userData.email,
      displayName: userData.displayName,
      organizationId: userData.organizationId
    }
  });

  // Initialize user preferences and settings
  await initializeUserSettings(userId);

  // Send welcome notification (if email verified)
  if (userData.metadata.emailVerified) {
    await sendWelcomeNotification(userData);
  }

  // Add to organization if applicable
  if (userData.organizationId) {
    await addUserToOrganization(userId, userData.organizationId);
  }
});

/**
 * Callable Function: Create User Profile
 * Manually trigger user profile creation with additional data
 */
export const createUserProfile = onCall({
  region: 'us-central1',
  memory: '512MiB',
  timeoutSeconds: 60
}, async (request) => {
  if (!request.auth) {
    throw new Error('Authentication required');
  }

  const { uid } = request.auth;
  const userData = request.data;
  const email = userData.email || request.auth.token?.email;

  logger.info('Creating user profile', { uid, email });

  try {
    const profileData: UserProfileData = {
      uid,
      email: email || 'N/A',
      displayName: userData.displayName || request.auth.token?.name || 'Anonymous User',
      photoURL: userData.photoURL || request.auth.token?.picture || null,
      role: userData.role || 'user',
      organizationId: userData.organizationId || getOrganizationFromEmail(email),
      department: userData.department || null,
      permissions: getDefaultPermissions(userData.role || 'user'),
      preferences: {
        theme: userData.theme || 'light',
        notifications: userData.notifications !== false,
        language: userData.language || 'en'
      },
      metadata: {
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActive: admin.firestore.FieldValue.serverTimestamp(),
        loginCount: 1,
        emailVerified: request.auth.token?.email_verified || false,
        providerData: Array.isArray(request.auth.token?.firebase?.identities) ? 
          request.auth.token.firebase.identities : []
      },
      status: 'active'
    };

    // Create user document
    await admin.firestore().collection('users').doc(uid).set(profileData);

    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, {
      role: profileData.role,
      organizationId: profileData.organizationId,
      permissions: profileData.permissions
    });

    logger.info('User profile created successfully', { uid });
    return { success: true, profile: profileData };

  } catch (error) {
    logger.error('Error creating user profile', error);
    throw new Error('Failed to create user profile');
  }
});

/**
 * Callable Function: Update User Profile
 */
export const updateUserProfile = onCall({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 30
}, async (request) => {
  if (!request.auth) {
    throw new Error('Authentication required');
  }

  const { uid } = request.auth;
  const updates = request.data;

  logger.info('Updating user profile', { uid });

  try {
    // Validate updates
    const allowedFields = ['displayName', 'photoURL', 'department', 'preferences'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // Add metadata
    filteredUpdates['metadata.lastModified'] = admin.firestore.FieldValue.serverTimestamp();

    await admin.firestore().collection('users').doc(uid).update(filteredUpdates);

    // Log activity
    await createActivityLog({
      userId: uid,
      action: 'profile_updated',
      entityType: 'user',
      entityId: uid,
      details: { updatedFields: Object.keys(filteredUpdates) }
    });

    logger.info('User profile updated successfully', { uid });
    return { success: true };

  } catch (error) {
    logger.error('Error updating user profile', error);
    throw new Error('Failed to update user profile');
  }
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getOrganizationFromEmail(email?: string): string | null {
  if (!email) return null;
  
  const domain = email.split('@')[1];
  const organizationMap: Record<string, string> = {
    'henryreed.ai': 'henryreed',
    'paloaltonetworks.com': 'paloalto'
  };
  
  return organizationMap[domain] || null;
}

function getDefaultPermissions(role: string): string[] {
  const permissionMap: Record<string, string[]> = {
    user: ['read:own_profile', 'update:own_profile'],
    analyst: ['read:scenarios', 'create:scenarios', 'read:trrs', 'create:trrs'],
    manager: ['read:all', 'create:all', 'update:team_data'],
    admin: ['read:all', 'create:all', 'update:all', 'delete:all', 'manage:users']
  };
  
  return permissionMap[role] || permissionMap.user;
}

async function updateUserLastActive(uid: string): Promise<void> {
  try {
    await admin.firestore().collection('users').doc(uid).update({
      'metadata.lastActive': admin.firestore.FieldValue.serverTimestamp(),
      'metadata.loginCount': admin.firestore.FieldValue.increment(1)
    });
  } catch (error) {
    logger.error('Error updating user last active', error);
  }
}

async function createActivityLog(data: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: any;
}): Promise<void> {
  try {
    await admin.firestore().collection('activityLogs').add({
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    logger.error('Error creating activity log', error);
  }
}

async function initializeUserSettings(userId: string): Promise<void> {
  try {
    const settingsData = {
      userId,
      dashboard: {
        layout: 'default',
        widgets: ['overview', 'recent-activity', 'quick-actions']
      },
      notifications: {
        email: true,
        browser: true,
        mobile: false,
        frequency: 'daily'
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 3600000 // 1 hour
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await admin.firestore().collection('userSettings').doc(userId).set(settingsData);
    logger.info('User settings initialized', { userId });
  } catch (error) {
    logger.error('Error initializing user settings', error);
  }
}

async function sendWelcomeNotification(userData: UserProfileData): Promise<void> {
  try {
    // Create welcome notification document
    await admin.firestore().collection('notifications').add({
      userId: userData.uid,
      type: 'welcome',
      title: 'Welcome to Cortex DC Portal',
      message: `Welcome ${userData.displayName}! Your account has been created successfully.`,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    logger.info('Welcome notification created', { userId: userData.uid });
  } catch (error) {
    logger.error('Error sending welcome notification', error);
  }
}

async function addUserToOrganization(userId: string, organizationId: string): Promise<void> {
  try {
    // Add user to organization members
    await admin.firestore().collection('organizations').doc(organizationId).update({
      members: admin.firestore.FieldValue.arrayUnion(userId),
      memberCount: admin.firestore.FieldValue.increment(1),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    logger.info('User added to organization', { userId, organizationId });
  } catch (error) {
    logger.error('Error adding user to organization', error);
  }
}