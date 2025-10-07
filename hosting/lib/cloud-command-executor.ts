import { RBACMiddleware, RBACContext } from './rbac-middleware';
import { CloudEnvironmentConfig } from '../components/TerminalIntegrationSettings';

export interface CommandContext {
  userId: string;
  userRole: string;
  interface: 'gui' | 'terminal';
  cloudConfig: CloudEnvironmentConfig;
  sessionId?: string;
}

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  metadata?: {
    provider: string;
    executionId: string;
    timestamp: string;
  };
}

export interface CommandExecutionEvent {
  type: 'started' | 'progress' | 'completed' | 'error';
  executionId: string;
  data?: any;
}

export class CloudCommandExecutor {
  private wsConnection: WebSocket | null = null;
  private cloudConfig: CloudEnvironmentConfig;
  private pendingCommands = new Map<string, {
    resolve: (result: CommandResult) => void;
    reject: (error: Error) => void;
    startTime: number;
  }>();
  private eventListeners = new Map<string, (event: CommandExecutionEvent) => void>();
  
  constructor(config: CloudEnvironmentConfig) {
    this.cloudConfig = config;
  }
  
  /**
   * Initialize connection to cloud environment
   */
  async initializeConnection(): Promise<void> {
    if (!this.cloudConfig.enabled || !this.cloudConfig.endpoints.terminalProxy) {
      throw new Error('Cloud configuration not enabled or missing terminal proxy endpoint');
    }
    
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.buildWebSocketUrl();
        this.wsConnection = new WebSocket(wsUrl);
        
        this.wsConnection.onopen = () => {
          console.log('Connected to cloud terminal proxy');
          this.authenticateConnection();
          resolve();
        };
        
        this.wsConnection.onmessage = this.handleWebSocketMessage.bind(this);
        
        this.wsConnection.onerror = (error) => {
          console.error('WebSocket connection error:', error);
          reject(new Error('Failed to connect to cloud environment'));
        };
        
        this.wsConnection.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          this.handleConnectionClose();
        };
        
        // Connection timeout
        setTimeout(() => {
          if (this.wsConnection?.readyState !== WebSocket.OPEN) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Execute a command in the cloud environment
   */
  async executeCommand(command: string, context: CommandContext): Promise<CommandResult> {
    if (!this.wsConnection || this.wsConnection.readyState !== WebSocket.OPEN) {
      await this.initializeConnection();
    }
    
    try {
      // Apply RBAC filtering to command
      const filteredCommand = await this.applyRBACFiltering(command, context);
      
      // Generate execution ID
      const executionId = this.generateExecutionId();
      
      // Log RBAC event
      RBACMiddleware.logRBACEvent({
        userId: context.userId,
        userRole: context.userRole,
        action: 'execute_command',
        resource: 'terminal',
        allowed: true
      });
      
      // Execute command
      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        // Store promise handlers
        this.pendingCommands.set(executionId, {
          resolve,
          reject,
          startTime
        });
        
        // Send command to cloud proxy
        const payload = {
          type: 'execute_command',
          id: executionId,
          command: filteredCommand,
          context: {
            userId: context.userId,
            userRole: context.userRole,
            interface: context.interface,
            sessionId: context.sessionId
          },
          environment: {
            provider: this.cloudConfig.provider,
            region: this.cloudConfig.credentials.region,
            connectionType: this.cloudConfig.connectionType
          },
          timestamp: new Date().toISOString()
        };
        
        this.wsConnection!.send(JSON.stringify(payload));
        
        // Set command timeout
        setTimeout(() => {
          if (this.pendingCommands.has(executionId)) {
            this.pendingCommands.delete(executionId);
            reject(new Error('Command execution timeout'));
          }
        }, 30000); // 30 second timeout
      });
      
    } catch (error) {
      // Log failed RBAC event
      RBACMiddleware.logRBACEvent({
        userId: context.userId,
        userRole: context.userRole,
        action: 'execute_command',
        resource: 'terminal',
        allowed: false,
        reason: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }
  
  /**
   * Apply RBAC filtering to commands
   */
  private async applyRBACFiltering(command: string, context: CommandContext): Promise<string> {
    try {
      // Use RBAC middleware to filter command
      const filteredCommand = RBACMiddleware.filterCommand(
        command, 
        context.userRole, 
        context.userId
      );
      
      return filteredCommand;
    } catch (error) {
      throw new Error(`Command not allowed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Subscribe to command execution events
   */
  addEventListener(executionId: string, listener: (event: CommandExecutionEvent) => void): void {
    this.eventListeners.set(executionId, listener);
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(executionId: string): void {
    this.eventListeners.delete(executionId);
  }
  
  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'command_result':
          this.handleCommandResult(message);
          break;
          
        case 'command_progress':
          this.handleCommandProgress(message);
          break;
          
        case 'authentication_result':
          this.handleAuthenticationResult(message);
          break;
          
        case 'error':
          this.handleError(message);
          break;
          
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }
  
  /**
   * Handle command execution results
   */
  private handleCommandResult(message: any): void {
    const { id, success, output, error, metadata } = message;
    const pendingCommand = this.pendingCommands.get(id);
    
    if (!pendingCommand) {
      console.warn('Received result for unknown command:', id);
      return;
    }
    
    const executionTime = Date.now() - pendingCommand.startTime;
    const result: CommandResult = {
      success,
      output,
      error,
      executionTime,
      metadata: {
        provider: this.cloudConfig.provider,
        executionId: id,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };
    
    // Clean up
    this.pendingCommands.delete(id);
    
    // Notify event listeners
    const listener = this.eventListeners.get(id);
    if (listener) {
      listener({
        type: 'completed',
        executionId: id,
        data: result
      });
    }
    
    // Resolve promise
    if (success) {
      pendingCommand.resolve(result);
    } else {
      pendingCommand.reject(new Error(error || 'Command execution failed'));
    }
  }
  
  /**
   * Handle command progress updates
   */
  private handleCommandProgress(message: any): void {
    const { id, progress } = message;
    const listener = this.eventListeners.get(id);
    
    if (listener) {
      listener({
        type: 'progress',
        executionId: id,
        data: progress
      });
    }
  }
  
  /**
   * Handle authentication results
   */
  private handleAuthenticationResult(message: any): void {
    const { success, error } = message;
    
    if (success) {
      console.log('Successfully authenticated with cloud environment');
    } else {
      console.error('Authentication failed:', error);
      this.wsConnection?.close();
    }
  }
  
  /**
   * Handle errors
   */
  private handleError(message: any): void {
    const { id, error } = message;
    
    if (id) {
      // Command-specific error
      const pendingCommand = this.pendingCommands.get(id);
      if (pendingCommand) {
        this.pendingCommands.delete(id);
        pendingCommand.reject(new Error(error));
      }
    } else {
      // General error
      console.error('Cloud executor error:', error);
    }
  }
  
  /**
   * Handle connection close
   */
  private handleConnectionClose(): void {
    // Reject all pending commands
    for (const [id, { reject }] of this.pendingCommands) {
      reject(new Error('Connection closed'));
    }
    this.pendingCommands.clear();
    
    // Clean up event listeners
    this.eventListeners.clear();
  }
  
  /**
   * Authenticate with cloud environment
   */
  private authenticateConnection(): void {
    if (!this.wsConnection) return;
    
    const authPayload = {
      type: 'authenticate',
      credentials: this.buildAuthCredentials(),
      provider: this.cloudConfig.provider,
      timestamp: new Date().toISOString()
    };
    
    this.wsConnection.send(JSON.stringify(authPayload));
  }
  
  /**
   * Build WebSocket URL
   */
  private buildWebSocketUrl(): string {
    const baseUrl = this.cloudConfig.endpoints.terminalProxy;
    const wsUrl = baseUrl.replace(/^http/, 'ws');
    
    // Add query parameters
    const params = new URLSearchParams({
      provider: this.cloudConfig.provider,
      connectionType: this.cloudConfig.connectionType
    });
    
    return `${wsUrl}?${params.toString()}`;
  }
  
  /**
   * Build authentication credentials
   */
  private buildAuthCredentials(): any {
    const { credentials } = this.cloudConfig;
    
    switch (this.cloudConfig.provider) {
      case 'aws':
        return {
          accessKey: credentials.accessKey,
          secretKey: credentials.secretKey,
          region: credentials.region
        };
        
      case 'gcp':
        return {
          projectId: credentials.projectId,
          keyFilePath: credentials.keyFilePath
        };
        
      case 'azure':
        return {
          subscriptionId: credentials.subscriptionId
        };
        
      default:
        throw new Error(`Unsupported provider: ${this.cloudConfig.provider}`);
    }
  }
  
  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Close connection
   */
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }
  
  /**
   * Get connection status
   */
  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    if (!this.wsConnection) return 'disconnected';
    
    switch (this.wsConnection.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'error';
    }
  }
}

/**
 * Command sanitizer for security
 */
export class CommandSanitizer {
  private static readonly BLOCKED_COMMANDS = [
    'rm -rf /',
    'sudo rm',
    'format',
    'mkfs',
    'dd if=',
    '> /dev/sda',
    'chmod 777 /',
    'chown root:root /',
    ':(){ :|:& };:'  // Fork bomb
  ];
  
  private static readonly ADMIN_ONLY_COMMANDS = [
    'userdel',
    'usermod',
    'passwd',
    'visudo',
    'systemctl',
    'service',
    'mount',
    'umount',
    'fdisk',
    'parted'
  ];
  
  static sanitize(command: string, userRole: string): string {
    const lowerCommand = command.toLowerCase().trim();
    
    // Check for absolutely blocked commands
    for (const blocked of this.BLOCKED_COMMANDS) {
      if (lowerCommand.includes(blocked.toLowerCase())) {
        throw new Error(`Dangerous command blocked: ${blocked}`);
      }
    }
    
    // Check for admin-only commands
    if (userRole !== 'admin') {
      for (const adminCommand of this.ADMIN_ONLY_COMMANDS) {
        if (lowerCommand.includes(adminCommand.toLowerCase())) {
          throw new Error(`Admin-only command: ${adminCommand}`);
        }
      }
    }
    
    // Remove potentially dangerous characters
    const sanitized = command
      .replace(/[;&|`$()]/g, '') // Remove command separators and substitution
      .replace(/\.\.\//g, '')    // Remove directory traversal
      .trim();
    
    return sanitized;
  }
  
  static validateCommand(command: string): boolean {
    try {
      // Basic validation
      if (!command || command.length === 0) {
        return false;
      }
      
      // Check for suspiciously long commands
      if (command.length > 1000) {
        return false;
      }
      
      // Check for binary data
      if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(command)) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }
}

export default CloudCommandExecutor;