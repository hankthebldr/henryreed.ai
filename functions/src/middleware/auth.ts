// Authentication and authorization middleware
import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

export interface AuthContext {
  uid: string;
  email?: string;
  organizationId?: string;
  role?: string;
  permissions?: string[];
}

// Validate Firebase Auth token and extract user context
export const validateAuth = async (context: functions.https.CallableContext): Promise<AuthContext> => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { uid, token } = context.auth;
  const email = token.email;

  logger.debug('Validating auth', { uid, email });

  return {
    uid,
    email,
  };
};

// Get user's organization memberships and permissions
export const getUserOrganizations = async (userId: string): Promise<Record<string, any>> => {
  try {
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      // Create user profile if it doesn't exist
      const userData = {
        id: userId,
        organizations: {},
        preferences: {
          theme: 'system',
          notifications: {
            email: { enabled: true, frequency: 'daily', types: [] },
            app: { enabled: true, types: [] },
          },
          dashboard: {
            defaultView: 'list',
            defaultFilters: {},
            visibleColumns: [],
            chartsConfig: {},
          },
          timezone: 'UTC',
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      await db.collection('users').doc(userId).set(userData);
      return {};
    }

    const userData = userDoc.data();
    return userData?.organizations || {};
  } catch (error) {
    logger.error('Failed to get user organizations:', error, { userId });
    return {};
  }
};

// Validate user has access to organization
export const validateOrganizationAccess = async (
  userId: string, 
  organizationId: string,
  requiredPermission?: string
): Promise<{ role: string; permissions: string[] }> => {
  const organizations = await getUserOrganizations(userId);
  const orgMembership = organizations[organizationId];

  if (!orgMembership || !orgMembership.isActive) {
    throw new functions.https.HttpsError(
      'permission-denied', 
      'Access denied to organization'
    );
  }

  const { role, permissions = [] } = orgMembership;

  // Check specific permission if required
  if (requiredPermission && !permissions.includes(requiredPermission)) {
    // Check if role implies permission (admin/owner have all permissions)
    if (!['admin', 'owner'].includes(role)) {
      throw new functions.https.HttpsError(
        'permission-denied', 
        `Missing required permission: ${requiredPermission}`
      );
    }
  }

  return { role, permissions };
};

// Rate limiting check
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (
  userId: string, 
  action: string, 
  maxRequests: number = 100, 
  windowMinutes: number = 60
): void => {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return;
  }
  
  if (current.count >= maxRequests) {
    const resetIn = Math.ceil((current.resetTime - now) / 60000);
    throw new functions.https.HttpsError(
      'resource-exhausted', 
      `Rate limit exceeded. Try again in ${resetIn} minutes.`
    );
  }
  
  current.count++;
};

// Combined auth validation with organization access
export const validateAuthAndOrganization = async (
  context: functions.https.CallableContext,
  organizationId: string,
  requiredPermission?: string
): Promise<AuthContext> => {
  const authContext = await validateAuth(context);
  const { role, permissions } = await validateOrganizationAccess(
    authContext.uid, 
    organizationId, 
    requiredPermission
  );

  return {
    ...authContext,
    organizationId,
    role,
    permissions,
  };
};

// Log user activity
export const logActivity = async (
  organizationId: string,
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, any> = {},
  ipAddress?: string
): Promise<void> => {
  try {
    const db = admin.firestore();
    await db.collection('activityLogs').add({
      organizationId,
      userId,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    logger.warn('Failed to log activity:', error, {
      organizationId,
      userId,
      action,
      entityType,
      entityId,
    });
  }
};

// Cleanup rate limit cache (run periodically)
export const cleanupRateLimit = (): void => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
};

// Setup periodic cleanup (every 30 minutes)
setInterval(cleanupRateLimit, 30 * 60 * 1000);