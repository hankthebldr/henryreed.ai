import * as functions from 'firebase-functions/v1';
export interface AuthContext {
    uid: string;
    email?: string;
    organizationId?: string;
    role?: string;
    permissions?: string[];
}
export declare const validateAuth: (context: functions.https.CallableContext) => Promise<AuthContext>;
export declare const getUserOrganizations: (userId: string) => Promise<Record<string, any>>;
export declare const validateOrganizationAccess: (userId: string, organizationId: string, requiredPermission?: string) => Promise<{
    role: string;
    permissions: string[];
}>;
export declare const checkRateLimit: (userId: string, action: string, maxRequests?: number, windowMinutes?: number) => void;
export declare const validateAuthAndOrganization: (context: functions.https.CallableContext, organizationId: string, requiredPermission?: string) => Promise<AuthContext>;
export declare const logActivity: (organizationId: string, userId: string, action: string, entityType: string, entityId: string, details?: Record<string, any>, ipAddress?: string) => Promise<void>;
export declare const cleanupRateLimit: () => void;
