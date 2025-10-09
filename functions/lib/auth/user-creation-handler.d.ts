import * as admin from 'firebase-admin';
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
export declare const beforeUserCreation: import("firebase-functions/v1").BlockingFunction;
/**
 * Before User Sign In Hook
 * Additional validation and logging on each sign-in
 */
export declare const beforeUserSignIn: import("firebase-functions/v1").BlockingFunction;
/**
 * Firestore Trigger: New User Document Created
 * Triggered when a user document is created in Firestore
 */
export declare const onUserDocumentCreated: import("firebase-functions/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    userId: string;
}>>;
/**
 * Callable Function: Create User Profile
 * Manually trigger user profile creation with additional data
 */
export declare const createUserProfile: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    profile: UserProfileData;
}>, unknown>;
/**
 * Callable Function: Update User Profile
 */
export declare const updateUserProfile: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
}>, unknown>;
export {};
