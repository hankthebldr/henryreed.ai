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
exports.updateUserProfile = exports.createUserProfile = exports.onUserDocumentCreated = exports.beforeUserSignIn = exports.beforeUserCreation = void 0;
// User Creation Event Handler for Firebase Authentication
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const identity_1 = require("firebase-functions/v2/identity");
const admin = __importStar(require("firebase-admin"));
const logger_1 = require("../utils/logger");
/**
 * Before User Creation Hook
 * Validates and enriches user data before account creation
 */
exports.beforeUserCreation = (0, identity_1.beforeUserCreated)({
    region: 'us-central1',
    timeoutSeconds: 60
}, async (event) => {
    const user = event.data;
    const email = user?.email;
    const uid = user?.uid;
    logger_1.logger.info('User creation initiated', { uid, email });
    // Domain validation for organization users
    const allowedDomains = ['henryreed.ai', 'paloaltonetworks.com'];
    const emailDomain = email?.split('@')[1];
    if (email && emailDomain && !allowedDomains.includes(emailDomain)) {
        logger_1.logger.warn('User creation blocked - unauthorized domain', { email, domain: emailDomain });
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
exports.beforeUserSignIn = (0, identity_1.beforeUserSignedIn)({
    region: 'us-central1',
    timeoutSeconds: 30
}, async (event) => {
    const user = event.data;
    const uid = user?.uid;
    const email = user?.email;
    logger_1.logger.info('User sign-in attempt', { uid, email });
    // Check if user is suspended
    if (uid) {
        try {
            const userDoc = await admin.firestore().collection('users').doc(uid).get();
            if (userDoc.exists && userDoc.data()?.status === 'suspended') {
                logger_1.logger.warn('Sign-in blocked - user suspended', { uid, email });
                throw new Error('Account suspended. Please contact administrator.');
            }
        }
        catch (error) {
            logger_1.logger.error('Error checking user status during sign-in', error);
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
exports.onUserDocumentCreated = (0, firestore_1.onDocumentCreated)({
    document: 'users/{userId}',
    region: 'us-central1'
}, async (event) => {
    const userId = event.params.userId;
    const userData = event.data.data();
    logger_1.logger.info('New user document created', { userId, email: userData.email });
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
exports.createUserProfile = (0, https_1.onCall)({
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
    logger_1.logger.info('Creating user profile', { uid, email });
    try {
        const profileData = {
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
        logger_1.logger.info('User profile created successfully', { uid });
        return { success: true, profile: profileData };
    }
    catch (error) {
        logger_1.logger.error('Error creating user profile', error);
        throw new Error('Failed to create user profile');
    }
});
/**
 * Callable Function: Update User Profile
 */
exports.updateUserProfile = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30
}, async (request) => {
    if (!request.auth) {
        throw new Error('Authentication required');
    }
    const { uid } = request.auth;
    const updates = request.data;
    logger_1.logger.info('Updating user profile', { uid });
    try {
        // Validate updates
        const allowedFields = ['displayName', 'photoURL', 'department', 'preferences'];
        const filteredUpdates = Object.keys(updates)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
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
        logger_1.logger.info('User profile updated successfully', { uid });
        return { success: true };
    }
    catch (error) {
        logger_1.logger.error('Error updating user profile', error);
        throw new Error('Failed to update user profile');
    }
});
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function getOrganizationFromEmail(email) {
    if (!email)
        return null;
    const domain = email.split('@')[1];
    const organizationMap = {
        'henryreed.ai': 'henryreed',
        'paloaltonetworks.com': 'paloalto'
    };
    return organizationMap[domain] || null;
}
function getDefaultPermissions(role) {
    const permissionMap = {
        user: ['read:own_profile', 'update:own_profile'],
        analyst: ['read:scenarios', 'create:scenarios', 'read:trrs', 'create:trrs'],
        manager: ['read:all', 'create:all', 'update:team_data'],
        admin: ['read:all', 'create:all', 'update:all', 'delete:all', 'manage:users']
    };
    return permissionMap[role] || permissionMap.user;
}
async function updateUserLastActive(uid) {
    try {
        await admin.firestore().collection('users').doc(uid).update({
            'metadata.lastActive': admin.firestore.FieldValue.serverTimestamp(),
            'metadata.loginCount': admin.firestore.FieldValue.increment(1)
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating user last active', error);
    }
}
async function createActivityLog(data) {
    try {
        await admin.firestore().collection('activityLogs').add({
            ...data,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating activity log', error);
    }
}
async function initializeUserSettings(userId) {
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
        logger_1.logger.info('User settings initialized', { userId });
    }
    catch (error) {
        logger_1.logger.error('Error initializing user settings', error);
    }
}
async function sendWelcomeNotification(userData) {
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
        logger_1.logger.info('Welcome notification created', { userId: userData.uid });
    }
    catch (error) {
        logger_1.logger.error('Error sending welcome notification', error);
    }
}
async function addUserToOrganization(userId, organizationId) {
    try {
        // Add user to organization members
        await admin.firestore().collection('organizations').doc(organizationId).update({
            members: admin.firestore.FieldValue.arrayUnion(userId),
            memberCount: admin.firestore.FieldValue.increment(1),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        logger_1.logger.info('User added to organization', { userId, organizationId });
    }
    catch (error) {
        logger_1.logger.error('Error adding user to organization', error);
    }
}
//# sourceMappingURL=user-creation-handler.js.map