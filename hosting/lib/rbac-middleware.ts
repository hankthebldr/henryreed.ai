// User interface will be defined where needed

export interface DataScope {
  canViewAllUsers: boolean;
  canViewAllPOVs: boolean;
  canViewAllTRRs: boolean;
  canModifySystemSettings: boolean;
  allowedCustomers: string[] | 'all';
  allowedProjects: string[] | 'all';
}

export interface Permission {
  resource: string;
  actions: string[];
}

// Role-based data filtering configuration
export const ROLE_PERMISSIONS: Record<string, DataScope> = {
  admin: {
    canViewAllUsers: true,
    canViewAllPOVs: true,
    canViewAllTRRs: true,
    canModifySystemSettings: true,
    allowedCustomers: 'all',
    allowedProjects: 'all'
  },
  manager: {
    canViewAllUsers: false, // Only their team
    canViewAllPOVs: true,
    canViewAllTRRs: true,
    canModifySystemSettings: false,
    allowedCustomers: 'all',
    allowedProjects: 'all'
  },
  senior_dc: {
    canViewAllUsers: false,
    canViewAllPOVs: false, // Only assigned POVs
    canViewAllTRRs: false, // Only their TRRs
    canModifySystemSettings: false,
    allowedCustomers: ['assigned'],
    allowedProjects: ['assigned']
  },
  dc: {
    canViewAllUsers: false,
    canViewAllPOVs: false,
    canViewAllTRRs: false,
    canModifySystemSettings: false,
    allowedCustomers: ['assigned'],
    allowedProjects: ['assigned']
  },
  analyst: {
    canViewAllUsers: false,
    canViewAllPOVs: false,
    canViewAllTRRs: false,
    canModifySystemSettings: false,
    allowedCustomers: ['assigned'],
    allowedProjects: ['assigned']
  }
};

export interface QueryFilter {
  where?: any;
  include?: any;
  select?: any;
}

export interface RBACContext {
  userId: string;
  userRole: string;
  userTeam?: string;
  assignedProjects?: string[];
  assignedCustomers?: string[];
}

export interface RBACEvent {
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  allowed: boolean;
  reason?: string;
}

export class RBACMiddleware {
  /**
   * Apply role-based filtering to database queries
   */
  static filterQuery(context: RBACContext, baseQuery: QueryFilter = {}): QueryFilter {
    const permissions = ROLE_PERMISSIONS[context.userRole];
    
    if (!permissions) {
      throw new Error(`Unknown role: ${context.userRole}`);
    }
    
    // Admin and managers with full access can see all data
    if (permissions.canViewAllPOVs && permissions.canViewAllTRRs) {
      return baseQuery;
    }
    
    // Apply user-specific filtering for limited roles
    const userFilter = {
      OR: [
        { assignedUserId: context.userId },
        { createdBy: context.userId },
        { ownerId: context.userId },
        // Include team assignments if user is part of a team
        ...(context.userTeam ? [{ teamId: context.userTeam }] : []),
        // Include project assignments
        ...(context.assignedProjects?.length ? [
          { projectId: { in: context.assignedProjects } }
        ] : []),
        // Include customer assignments  
        ...(context.assignedCustomers?.length ? [
          { customerId: { in: context.assignedCustomers } }
        ] : [])
      ]
    };
    
    return {
      ...baseQuery,
      where: {
        ...baseQuery.where,
        AND: [
          baseQuery.where || {},
          userFilter
        ]
      }
    };
  }
  
  /**
   * Check if user has permission to perform an action on a resource
   */
  static canAccessResource(
    userRole: string, 
    resource: string, 
    action: string,
    context?: { ownerId?: string; userId?: string }
  ): boolean {
    const permissions = ROLE_PERMISSIONS[userRole];
    
    if (!permissions) {
      return false;
    }
    
    // Define resource-action mappings
    const resourcePermissions = {
      users: {
        read: permissions.canViewAllUsers,
        create: userRole === 'admin',
        update: userRole === 'admin',
        delete: userRole === 'admin'
      },
      povs: {
        read: permissions.canViewAllPOVs || this.isOwnerOrAssigned(context),
        create: ['admin', 'manager', 'senior_dc', 'dc'].includes(userRole),
        update: permissions.canViewAllPOVs || this.isOwnerOrAssigned(context),
        delete: ['admin', 'manager'].includes(userRole)
      },
      trrs: {
        read: permissions.canViewAllTRRs || this.isOwnerOrAssigned(context),
        create: ['admin', 'manager', 'senior_dc', 'dc'].includes(userRole),
        update: permissions.canViewAllTRRs || this.isOwnerOrAssigned(context),
        delete: ['admin', 'manager'].includes(userRole)
      },
      scenarios: {
        read: ['admin', 'manager', 'senior_dc', 'dc'].includes(userRole),
        create: ['admin', 'manager', 'senior_dc', 'dc'].includes(userRole),
        update: ['admin', 'manager', 'senior_dc', 'dc'].includes(userRole),
        delete: ['admin', 'manager'].includes(userRole)
      },
      system_settings: {
        read: permissions.canModifySystemSettings,
        create: permissions.canModifySystemSettings,
        update: permissions.canModifySystemSettings,
        delete: permissions.canModifySystemSettings
      }
    };
    
    const resourcePerms = resourcePermissions[resource as keyof typeof resourcePermissions];
    
    if (!resourcePerms) {
      return false;
    }
    
    return resourcePerms[action as keyof typeof resourcePerms] || false;
  }
  
  /**
   * Filter data based on user's role and assignments
   */
  static filterData<T extends { id: string; assignedUserId?: string; createdBy?: string; ownerId?: string }>(
    data: T[], 
    context: RBACContext
  ): T[] {
    const permissions = ROLE_PERMISSIONS[context.userRole];
    
    // Admin and managers see all data
    if (permissions.canViewAllPOVs && permissions.canViewAllTRRs) {
      return data;
    }
    
    // Filter data for limited roles
    return data.filter(item => {
      return (
        item.assignedUserId === context.userId ||
        item.createdBy === context.userId ||
        item.ownerId === context.userId ||
        // Add additional filtering logic as needed
        this.isUserAssignedToItem(item, context)
      );
    });
  }
  
  /**
   * Apply RBAC filtering to command execution
   */
  static filterCommand(command: string, userRole: string, userId: string): string {
    const permissions = ROLE_PERMISSIONS[userRole];
    
    if (!permissions) {
      throw new Error(`Unknown role: ${userRole}`);
    }
    
    // Add user filtering to data commands for limited roles
    if (!permissions.canViewAllPOVs) {
      if (command.includes('pov list')) {
        command += ` --user-filter ${userId}`;
      }
      if (command.includes('pov report')) {
        command += ` --assigned-only`;
      }
    }
    
    if (!permissions.canViewAllTRRs) {
      if (command.includes('trr list')) {
        command += ` --user-scope ${userId}`;
      }
      if (command.includes('trr export')) {
        command += ` --user-data-only`;
      }
    }
    
    // Block dangerous commands for non-admin users
    if (userRole !== 'admin') {
      const blockedCommands = ['system delete', 'user delete', 'admin'];
      for (const blocked of blockedCommands) {
        if (command.toLowerCase().includes(blocked)) {
          throw new Error(`Command '${blocked}' not allowed for role '${userRole}'`);
        }
      }
    }
    
    return command;
  }
  
  /**
   * Get user's effective permissions summary
   */
  static getUserPermissions(userRole: string): {
    canView: string[];
    canCreate: string[];
    canUpdate: string[];
    canDelete: string[];
  } {
    const permissions = ROLE_PERMISSIONS[userRole];
    
    if (!permissions) {
      return { canView: [], canCreate: [], canUpdate: [], canDelete: [] };
    }
    
    const resources = ['povs', 'trrs', 'scenarios', 'users', 'system_settings'];
    
    return {
      canView: resources.filter(resource => 
        this.canAccessResource(userRole, resource, 'read')
      ),
      canCreate: resources.filter(resource => 
        this.canAccessResource(userRole, resource, 'create')
      ),
      canUpdate: resources.filter(resource => 
        this.canAccessResource(userRole, resource, 'update')
      ),
      canDelete: resources.filter(resource => 
        this.canAccessResource(userRole, resource, 'delete')
      )
    };
  }
  
  /**
   * Audit log for RBAC events
   */
  static logRBACEvent(event: {
    userId: string;
    userRole: string;
    action: string;
    resource: string;
    allowed: boolean;
    reason?: string;
  }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...event
    };
    
    // In production, this would go to your logging service
    console.log('[RBAC Audit]', logEntry);
    
    // Store in localStorage for demo purposes
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('rbac_audit_log') || '[]');
      existing.push(logEntry);
      // Keep only last 1000 entries
      const trimmed = existing.slice(-1000);
      localStorage.setItem('rbac_audit_log', JSON.stringify(trimmed));
    }
  }
  
  private static isOwnerOrAssigned(context?: { ownerId?: string; userId?: string }): boolean {
    if (!context || !context.userId) return false;
    return context.ownerId === context.userId;
  }
  
  private static isUserAssignedToItem(item: any, context: RBACContext): boolean {
    // Check if user is assigned to the project or customer of this item
    if (context.assignedProjects?.includes(item.projectId)) {
      return true;
    }
    
    if (context.assignedCustomers?.includes(item.customerId)) {
      return true;
    }
    
    return false;
  }
}

export default RBACMiddleware;