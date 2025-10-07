"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupRateLimit = exports.logActivity = exports.validateAuthAndOrganization = exports.checkRateLimit = exports.validateOrganizationAccess = exports.getUserOrganizations = exports.validateAuth = void 0;
// Authentication and authorization middleware
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const logger_1 = require("../utils/logger");
// Validate Firebase Auth token and extract user context
const validateAuth = async (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    const { uid, token } = context.auth;
    const email = token.email;
    logger_1.logger.debug('Validating auth', { uid, email });
    return {
        uid,
        email,
    };
};
exports.validateAuth = validateAuth;
// Get user's organization memberships and permissions
const getUserOrganizations = async (userId) => {
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
        return (userData === null || userData === void 0 ? void 0 : userData.organizations) || {};
    }
    catch (error) {
        logger_1.logger.error('Failed to get user organizations:', error, { userId });
        return {};
    }
};
exports.getUserOrganizations = getUserOrganizations;
// Validate user has access to organization
const validateOrganizationAccess = async (userId, organizationId, requiredPermission) => {
    const organizations = await (0, exports.getUserOrganizations)(userId);
    const orgMembership = organizations[organizationId];
    if (!orgMembership || !orgMembership.isActive) {
        throw new functions.https.HttpsError('permission-denied', 'Access denied to organization');
    }
    const { role, permissions = [] } = orgMembership;
    // Check specific permission if required
    if (requiredPermission && !permissions.includes(requiredPermission)) {
        // Check if role implies permission (admin/owner have all permissions)
        if (!['admin', 'owner'].includes(role)) {
            throw new functions.https.HttpsError('permission-denied', `Missing required permission: ${requiredPermission}`);
        }
    }
    return { role, permissions };
};
exports.validateOrganizationAccess = validateOrganizationAccess;
// Rate limiting check
const rateLimitMap = new Map();
const checkRateLimit = (userId, action, maxRequests = 100, windowMinutes = 60) => {
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
        throw new functions.https.HttpsError('resource-exhausted', `Rate limit exceeded. Try again in ${resetIn} minutes.`);
    }
    current.count++;
};
exports.checkRateLimit = checkRateLimit;
// Combined auth validation with organization access
const validateAuthAndOrganization = async (context, organizationId, requiredPermission) => {
    const authContext = await (0, exports.validateAuth)(context);
    const { role, permissions } = await (0, exports.validateOrganizationAccess)(authContext.uid, organizationId, requiredPermission);
    return {
        ...authContext,
        organizationId,
        role,
        permissions,
    };
};
exports.validateAuthAndOrganization = validateAuthAndOrganization;
// Log user activity
const logActivity = async (organizationId, userId, action, entityType, entityId, details = {}, ipAddress) => {
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
    }
    catch (error) {
        logger_1.logger.warn('Failed to log activity:', error, {
            organizationId,
            userId,
            action,
            entityType,
            entityId,
        });
    }
};
exports.logActivity = logActivity;
// Cleanup rate limit cache (run periodically)
const cleanupRateLimit = () => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetTime) {
            rateLimitMap.delete(key);
        }
    }
};
exports.cleanupRateLimit = cleanupRateLimit;
// Setup periodic cleanup (every 30 minutes)
setInterval(exports.cleanupRateLimit, 30 * 60 * 1000);
//# sourceMappingURL=auth.js.map