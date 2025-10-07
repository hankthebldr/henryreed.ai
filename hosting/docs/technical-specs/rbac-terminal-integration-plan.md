# RBAC & Integrated Terminal Implementation Plan

## Overview
This document outlines the implementation of Role-Based Access Control (RBAC) and integrated terminal functionality with cloud environment execution, ensuring feature parity between GUI and Terminal experiences based on assumed roles.

---

## 1. RBAC Implementation Strategy

### 1.1 Role Definitions & Data Access Patterns

```typescript
interface UserRole {
  role: 'admin' | 'manager' | 'senior_dc' | 'dc' | 'analyst';
  permissions: Permission[];
  dataScope: DataScope;
}

interface DataScope {
  canViewAllUsers: boolean;
  canViewAllPOVs: boolean;
  canViewAllTRRs: boolean;
  canModifySystemSettings: boolean;
  allowedCustomers: string[] | 'all';
  allowedProjects: string[] | 'all';
}

// Role-based data filtering
const ROLE_PERMISSIONS = {
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
```

### 1.2 RBAC Middleware Implementation

```typescript
// Data filtering middleware for APIs
export class RBACMiddleware {
  static filterQuery(userId: string, role: string, baseQuery: any): any {
    const permissions = ROLE_PERMISSIONS[role];
    
    if (permissions.canViewAllPOVs) {
      return baseQuery; // Admin/Manager see all
    }
    
    // Filter to user's assigned data only
    return {
      ...baseQuery,
      where: {
        ...baseQuery.where,
        OR: [
          { assignedUserId: userId },
          { createdBy: userId },
          { teamMembers: { some: { userId } }}
        ]
      }
    };
  }
  
  static canAccessResource(userRole: string, resource: string, action: string): boolean {
    const roleConfig = ROLE_PERMISSIONS[userRole];
    // Implementation of permission checking logic
    return this.checkPermission(roleConfig, resource, action);
  }
}
```

---

## 2. Integrated Terminal Architecture

### 2.1 Terminal Integration Points

```typescript
// Terminal integration throughout the app
interface TerminalIntegration {
  // 1. Content Hub Integration
  contentHub: {
    quickCommands: string[];
    contextualHelp: boolean;
    templateGeneration: boolean;
  };
  
  // 2. Detection Engine Integration  
  detectionEngine: {
    scenarioDeployment: boolean;
    ruleValidation: boolean;
    mitreMapping: boolean;
  };
  
  // 3. Data Management
  dataManagement: {
    csvImport: boolean;
    dataExport: boolean;
    queryExecution: boolean;
  };
}
```

### 2.2 Cloud Environment Connection Settings

```typescript
interface CloudEnvironmentConfig {
  provider: 'aws' | 'gcp' | 'azure';
  connectionType: 'ssh' | 'api' | 'websocket';
  credentials: {
    accessKey?: string;
    secretKey?: string;
    region?: string;
    projectId?: string;
    subscriptionId?: string;
  };
  endpoints: {
    terminalProxy: string;
    commandExecutor: string;
    fileSystem: string;
  };
}
```

---

## 3. Settings Feature for Real-Time Terminal Integration

### 3.1 Settings UI Component

```tsx
// Settings panel for terminal integration
export const TerminalIntegrationSettings: React.FC = () => {
  const [cloudConfig, setCloudConfig] = useState<CloudEnvironmentConfig>();
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  return (
    <div className="terminal-integration-settings">
      <div className="settings-section">
        <h3>🌩️ Cloud Environment Connection</h3>
        
        {/* Cloud Provider Selection */}
        <div className="provider-selection">
          <label>Cloud Provider</label>
          <select value={cloudConfig?.provider} onChange={handleProviderChange}>
            <option value="aws">Amazon Web Services</option>
            <option value="gcp">Google Cloud Platform</option>
            <option value="azure">Microsoft Azure</option>
          </select>
        </div>
        
        {/* Connection Configuration */}
        <div className="connection-config">
          {cloudConfig?.provider === 'aws' && <AWSConnectionForm />}
          {cloudConfig?.provider === 'gcp' && <GCPConnectionForm />}
          {cloudConfig?.provider === 'azure' && <AzureConnectionForm />}
        </div>
        
        {/* Connection Testing */}
        <div className="connection-test">
          <button onClick={testConnection} disabled={connectionStatus === 'connecting'}>
            {connectionStatus === 'connecting' ? 'Testing...' : 'Test Connection'}
          </button>
          <ConnectionStatusIndicator status={connectionStatus} />
        </div>
      </div>
      
      <div className="settings-section">
        <h3>⌨️ Terminal Integration Options</h3>
        
        {/* Integration Toggles */}
        <div className="integration-toggles">
          <ToggleOption 
            label="Enable Terminal in Content Hub"
            description="Show terminal commands alongside GUI actions"
            enabled={settings.contentHubIntegration}
            onChange={handleContentHubToggle}
          />
          
          <ToggleOption 
            label="Enable Terminal in Detection Engine"
            description="Execute scenario deployments via terminal"
            enabled={settings.detectionEngineIntegration}
            onChange={handleDetectionEngineToggle}
          />
          
          <ToggleOption 
            label="Enable Cloud Command Execution"
            description="Execute terminal commands in connected cloud environment"
            enabled={settings.cloudExecution}
            onChange={handleCloudExecutionToggle}
          />
        </div>
      </div>
    </div>
  );
};
```

### 3.2 Cloud Command Execution Service

```typescript
export class CloudCommandExecutor {
  private wsConnection: WebSocket;
  private cloudConfig: CloudEnvironmentConfig;
  
  constructor(config: CloudEnvironmentConfig) {
    this.cloudConfig = config;
    this.initializeConnection();
  }
  
  async executeCommand(command: string, context: CommandContext): Promise<CommandResult> {
    // Apply RBAC filtering to command
    const filteredCommand = await this.applyRBACFiltering(command, context.userRole);
    
    // Execute in cloud environment
    return new Promise((resolve, reject) => {
      const executionId = this.generateExecutionId();
      
      // Send command to cloud proxy
      this.wsConnection.send(JSON.stringify({
        type: 'execute_command',
        id: executionId,
        command: filteredCommand,
        environment: this.cloudConfig.provider,
        userId: context.userId,
        role: context.userRole
      }));
      
      // Handle response
      this.onCommandResponse(executionId, resolve, reject);
    });
  }
  
  private async applyRBACFiltering(command: string, userRole: string): Promise<string> {
    // Apply data scope filtering to commands
    if (!ROLE_PERMISSIONS[userRole].canViewAllPOVs) {
      // Add user filtering to data commands
      if (command.includes('pov list')) {
        command += ' --user-filter';
      }
      if (command.includes('trr list')) {
        command += ' --user-scope';
      }
    }
    
    return command;
  }
}
```

---

## 4. GUI-Terminal Feature Parity Implementation

### 4.1 Unified Command Registry

```typescript
interface UnifiedCommand {
  id: string;
  name: string;
  description: string;
  terminalCommand: string;
  guiAction: string;
  requiredRole: string[];
  parameters: CommandParameter[];
}

// Unified command definitions ensuring parity
export const UNIFIED_COMMANDS: UnifiedCommand[] = [
  {
    id: 'pov_create',
    name: 'Create POV',
    description: 'Initialize a new Proof of Value project',
    terminalCommand: 'pov create --interactive',
    guiAction: 'dashboard.newPOV',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    parameters: [
      { name: 'customer', type: 'string', required: true },
      { name: 'template', type: 'select', options: ['standard', 'enterprise'] }
    ]
  },
  {
    id: 'trr_validate',
    name: 'Validate TRR',
    description: 'Validate Technical Requirements Review',
    terminalCommand: 'trr validate --all --status pending',
    guiAction: 'trr.validate',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    parameters: [
      { name: 'status', type: 'select', options: ['pending', 'all'] }
    ]
  }
  // ... more commands
];
```

### 4.2 Role-Based Command Filtering

```typescript
export class UnifiedCommandService {
  static getAvailableCommands(userRole: string): UnifiedCommand[] {
    return UNIFIED_COMMANDS.filter(cmd => 
      cmd.requiredRole.includes(userRole)
    );
  }
  
  static executeCommand(commandId: string, parameters: any, context: ExecutionContext): Promise<any> {
    const command = UNIFIED_COMMANDS.find(cmd => cmd.id === commandId);
    
    if (!this.hasPermission(context.userRole, command)) {
      throw new Error('Insufficient permissions');
    }
    
    // Execute via appropriate interface
    if (context.interface === 'terminal') {
      return this.executeTerminalCommand(command, parameters, context);
    } else {
      return this.executeGUIAction(command, parameters, context);
    }
  }
  
  private static async executeTerminalCommand(
    command: UnifiedCommand, 
    parameters: any, 
    context: ExecutionContext
  ): Promise<any> {
    const cloudExecutor = new CloudCommandExecutor(context.cloudConfig);
    
    // Build command with parameters and RBAC filtering
    const fullCommand = this.buildCommand(command.terminalCommand, parameters, context.userRole);
    
    return await cloudExecutor.executeCommand(fullCommand, context);
  }
}
```

---

## 5. Implementation Phases

### Phase 1: RBAC Foundation (Weeks 1-2)
```typescript
// Tasks for Phase 1
const phase1Tasks = [
  'Implement RBAC middleware for API endpoints',
  'Add user role-based data filtering',
  'Update database queries with user scope',
  'Create permission checking utilities',
  'Add RBAC tests and validation'
];
```

### Phase 2: Terminal Integration Settings (Weeks 3-4)
```typescript
// Tasks for Phase 2  
const phase2Tasks = [
  'Build cloud environment connection UI',
  'Implement WebSocket proxy for cloud commands',
  'Create cloud provider authentication flows',
  'Add connection testing and status monitoring',
  'Build terminal integration toggles'
];
```

### Phase 3: Unified Command System (Weeks 5-6)
```typescript
// Tasks for Phase 3
const phase3Tasks = [
  'Create unified command registry',
  'Implement command execution routing',
  'Add GUI-terminal command mapping',
  'Build role-based command filtering',
  'Add command execution auditing'
];
```

### Phase 4: Feature Parity & Testing (Weeks 7-8)
```typescript
// Tasks for Phase 4
const phase4Tasks = [
  'Validate GUI-terminal feature parity',
  'Add comprehensive RBAC testing',
  'Performance test cloud command execution',
  'Security audit of cloud connections',
  'User acceptance testing across roles'
];
```

---

## 6. Security Considerations

### 6.1 Cloud Connection Security
```typescript
interface SecurityMeasures {
  encryption: {
    inTransit: 'TLS 1.3';
    atRest: 'AES-256';
  };
  authentication: {
    cloudProvider: 'IAM roles';
    userAuth: 'JWT tokens';
    commandAuth: 'RBAC + signature';
  };
  auditing: {
    commandLogs: boolean;
    accessLogs: boolean;
    errorLogs: boolean;
  };
}
```

### 6.2 Command Sanitization
```typescript
export class CommandSanitizer {
  static sanitize(command: string, userRole: string): string {
    // Remove dangerous commands for non-admin users
    if (userRole !== 'admin') {
      const blockedCommands = ['rm', 'delete', 'drop', 'truncate'];
      for (const blocked of blockedCommands) {
        if (command.includes(blocked)) {
          throw new Error(`Command '${blocked}' not allowed for role '${userRole}'`);
        }
      }
    }
    
    return command;
  }
}
```

---

## 7. Monitoring & Analytics

### 7.1 Command Execution Metrics
```typescript
interface CommandMetrics {
  executionTime: number;
  success: boolean;
  userRole: string;
  interface: 'gui' | 'terminal';
  cloudProvider: string;
  errorDetails?: string;
}
```

### 7.2 RBAC Audit Logging
```typescript
interface RBACEvent {
  timestamp: Date;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  allowed: boolean;
  reason?: string;
}
```

---

## Success Criteria

1. **RBAC Implementation**
   - ✅ Users see only their data by default
   - ✅ Admins have access to all data
   - ✅ Role transitions update data visibility immediately
   - ✅ API endpoints enforce role-based filtering

2. **Terminal Integration**
   - ✅ Settings panel allows cloud environment configuration
   - ✅ Real-time command execution in cloud environment
   - ✅ Terminal available in Content Hub and Detection Engine
   - ✅ Cloud connection status monitoring

3. **GUI-Terminal Parity**
   - ✅ Same capabilities available in both interfaces based on role
   - ✅ Unified command execution regardless of interface
   - ✅ Consistent data access patterns
   - ✅ Role-based feature availability

4. **Security & Performance**
   - ✅ Secure cloud connections with proper authentication
   - ✅ Command sanitization and RBAC enforcement
   - ✅ Comprehensive audit logging
   - ✅ Sub-second command execution response times

This implementation ensures that the Cortex DC Portal provides a unified, secure, and role-appropriate experience across both GUI and Terminal interfaces with seamless cloud environment integration.