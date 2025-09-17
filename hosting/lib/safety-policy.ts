// Safety Policy System for CDR Lab
// Implements safety guardrails, execution modes, and resource constraints

export interface SafetyPolicy {
  version: string;
  mode: 'safe' | 'unsafe';
  
  // Resource Constraints
  limits: {
    maxScenarios: number;
    maxTTLHours: number;
    maxCloudResources: number;
    maxK8sNamespaces: number;
    maxStorageGB: number;
  };
  
  // Target Guards
  guards: {
    kubernetes: KubernetesGuards;
    cloud: CloudGuards;
    xsiam: XsiamGuards;
  };
  
  // Execution Controls
  execution: {
    requireApproval: boolean;
    lockTimeout: number; // minutes
    dryRunDefault: boolean;
    confirmationRequired: boolean;
  };
  
  // Cleanup Policies
  cleanup: {
    defaultTTL: number; // hours
    orphanSweepInterval: number; // hours
    retentionDays: number;
    forceCleanupAfter: number; // hours
  };
}

export interface KubernetesGuards {
  allowedNamespaces: string[];
  namespacePrefixes: string[];
  requiredLabels: Record<string, string>;
  forbiddenResources: string[];
  clusterScopeAllowed: boolean;
  maxPodsPerNamespace: number;
}

export interface CloudGuards {
  aws: {
    allowedAccounts: string[];
    allowedRegions: string[];
    requiredTags: Record<string, string>;
    forbiddenServices: string[];
    maxInstances: number;
  };
  gcp: {
    allowedProjects: string[];
    allowedRegions: string[];
    requiredLabels: Record<string, string>;
    forbiddenAPIs: string[];
    maxInstances: number;
  };
  azure: {
    allowedSubscriptions: string[];
    allowedResourceGroups: string[];
    requiredTags: Record<string, string>;
    forbiddenServices: string[];
    maxInstances: number;
  };
}

export interface XsiamGuards {
  allowedTenants: string[];
  contentPackPrefixes: string[];
  maxRules: number;
  maxParsers: number;
  forbiddenAPIs: string[];
}

export interface ExecutionLock {
  scenarioId: string;
  lockId: string;
  lockedBy: string;
  lockedAt: Date;
  operation: 'deploy' | 'destroy' | 'validate';
  ttl: Date;
  metadata: Record<string, any>;
}

export interface PolicyViolation {
  type: 'resource_limit' | 'guard_violation' | 'lock_conflict' | 'approval_required';
  severity: 'error' | 'warning';
  message: string;
  resource?: string;
  constraint?: string;
  suggestions?: string[];
}

export class SafetyPolicyManager {
  private policy: SafetyPolicy;
  private locks: Map<string, ExecutionLock> = new Map();

  constructor(policy?: SafetyPolicy) {
    this.policy = policy || SafetyPolicyManager.getDefaultPolicy();
  }

  /**
   * Load policy from configuration file or environment
   */
  static async loadPolicy(configPath?: string): Promise<SafetyPolicyManager> {
    // In a real implementation, this would read from .cdrlab/policy.yaml
    const mockPolicy = SafetyPolicyManager.getDefaultPolicy();
    return new SafetyPolicyManager(mockPolicy);
  }

  /**
   * Validate a scenario deployment against the safety policy
   */
  validateDeployment(request: DeploymentRequest): PolicyValidationResult {
    const violations: PolicyViolation[] = [];

    // Check execution mode
    if (request.unsafe && this.policy.mode === 'safe') {
      violations.push({
        type: 'approval_required',
        severity: 'error',
        message: 'Unsafe mode requires explicit policy override',
        suggestions: ['Set CDRLAB_UNSAFE=1 environment variable', 'Use --force flag with confirmation']
      });
    }

    // Check resource limits
    if (request.estimatedResources?.cloudInstances && 
        request.estimatedResources.cloudInstances > this.policy.limits.maxCloudResources) {
      violations.push({
        type: 'resource_limit',
        severity: 'error',
        message: `Requested ${request.estimatedResources.cloudInstances} cloud instances exceeds limit of ${this.policy.limits.maxCloudResources}`,
        constraint: 'maxCloudResources'
      });
    }

    // Check TTL
    if (request.ttlHours && request.ttlHours > this.policy.limits.maxTTLHours) {
      violations.push({
        type: 'resource_limit',
        severity: 'error',
        message: `TTL of ${request.ttlHours}h exceeds maximum of ${this.policy.limits.maxTTLHours}h`,
        constraint: 'maxTTLHours'
      });
    }

    // Check Kubernetes guards
    if (request.kubernetesResources) {
      const k8sViolations = this.validateK8sResources(request.kubernetesResources);
      violations.push(...k8sViolations);
    }

    // Check cloud guards
    if (request.cloudResources) {
      const cloudViolations = this.validateCloudResources(request.cloudResources);
      violations.push(...cloudViolations);
    }

    // Check for execution locks
    const lockViolation = this.checkExecutionLocks(request.scenarioId);
    if (lockViolation) {
      violations.push(lockViolation);
    }

    return {
      valid: violations.filter(v => v.severity === 'error').length === 0,
      violations,
      requiresApproval: this.policy.execution.requireApproval || request.unsafe,
      dryRunRecommended: this.policy.execution.dryRunDefault
    };
  }

  /**
   * Acquire execution lock for a scenario
   */
  acquireExecutionLock(scenarioId: string, operation: ExecutionLock['operation'], userId: string): string {
    const lockId = `${scenarioId}-${operation}-${Date.now()}`;
    const ttl = new Date(Date.now() + this.policy.execution.lockTimeout * 60 * 1000);
    
    const existingLock = Array.from(this.locks.values())
      .find(lock => lock.scenarioId === scenarioId && lock.ttl > new Date());
    
    if (existingLock) {
      throw new Error(`Scenario ${scenarioId} is locked by ${existingLock.lockedBy} for ${existingLock.operation}`);
    }

    const lock: ExecutionLock = {
      scenarioId,
      lockId,
      lockedBy: userId,
      lockedAt: new Date(),
      operation,
      ttl,
      metadata: {}
    };

    this.locks.set(lockId, lock);
    return lockId;
  }

  /**
   * Release execution lock
   */
  releaseExecutionLock(lockId: string): boolean {
    return this.locks.delete(lockId);
  }

  /**
   * Clean up expired locks
   */
  cleanupExpiredLocks(): number {
    const now = new Date();
    const expiredLocks = Array.from(this.locks.entries())
      .filter(([_, lock]) => lock.ttl < now);
    
    expiredLocks.forEach(([lockId, _]) => {
      this.locks.delete(lockId);
    });

    return expiredLocks.length;
  }

  private validateK8sResources(resources: KubernetesDeploymentRequest): PolicyViolation[] {
    const violations: PolicyViolation[] = [];
    const guards = this.policy.guards.kubernetes;

    // Check namespace allowlist
    if (resources.namespaces) {
      const invalidNamespaces = resources.namespaces.filter(ns => {
        return !guards.allowedNamespaces.includes(ns) && 
               !guards.namespacePrefixes.some(prefix => ns.startsWith(prefix));
      });

      if (invalidNamespaces.length > 0) {
        violations.push({
          type: 'guard_violation',
          severity: 'error',
          message: `Namespaces not allowed: ${invalidNamespaces.join(', ')}`,
          resource: 'kubernetes.namespace',
          suggestions: [`Use namespaces matching prefixes: ${guards.namespacePrefixes.join(', ')}`]
        });
      }
    }

    // Check forbidden resources
    if (resources.resourceTypes) {
      const forbiddenFound = resources.resourceTypes.filter(type => 
        guards.forbiddenResources.includes(type)
      );

      if (forbiddenFound.length > 0) {
        violations.push({
          type: 'guard_violation',
          severity: 'error',
          message: `Forbidden resource types: ${forbiddenFound.join(', ')}`,
          resource: 'kubernetes.resources'
        });
      }
    }

    return violations;
  }

  private validateCloudResources(resources: CloudDeploymentRequest): PolicyViolation[] {
    const violations: PolicyViolation[] = [];

    // Validate AWS resources
    if (resources.aws) {
      const awsGuards = this.policy.guards.cloud.aws;
      
      if (resources.aws.region && !awsGuards.allowedRegions.includes(resources.aws.region)) {
        violations.push({
          type: 'guard_violation',
          severity: 'error',
          message: `AWS region ${resources.aws.region} not in allowlist`,
          resource: 'aws.region'
        });
      }

      if (resources.aws.instanceCount > awsGuards.maxInstances) {
        violations.push({
          type: 'resource_limit',
          severity: 'error',
          message: `AWS instance count ${resources.aws.instanceCount} exceeds limit of ${awsGuards.maxInstances}`,
          constraint: 'aws.maxInstances'
        });
      }
    }

    // Similar validation for GCP and Azure...

    return violations;
  }

  private checkExecutionLocks(scenarioId: string): PolicyViolation | null {
    const activeLock = Array.from(this.locks.values())
      .find(lock => lock.scenarioId === scenarioId && lock.ttl > new Date());

    if (activeLock) {
      return {
        type: 'lock_conflict',
        severity: 'error',
        message: `Scenario ${scenarioId} is locked by ${activeLock.lockedBy} for ${activeLock.operation}`,
        suggestions: ['Wait for current operation to complete', 'Force unlock if operation is stuck']
      };
    }

    return null;
  }

  private static getDefaultPolicy(): SafetyPolicy {
    return {
      version: '1.0',
      mode: 'safe',
      limits: {
        maxScenarios: 10,
        maxTTLHours: 24,
        maxCloudResources: 20,
        maxK8sNamespaces: 5,
        maxStorageGB: 100
      },
      guards: {
        kubernetes: {
          allowedNamespaces: ['cdrlab-*', 'default', 'kube-system'],
          namespacePrefixes: ['cdrlab-', 'test-', 'demo-'],
          requiredLabels: {
            'managed-by': 'cdrlab'
          },
          forbiddenResources: ['ClusterRole', 'ClusterRoleBinding'],
          clusterScopeAllowed: false,
          maxPodsPerNamespace: 50
        },
        cloud: {
          aws: {
            allowedAccounts: [],
            allowedRegions: ['us-west-2', 'us-east-1'],
            requiredTags: {
              'managed-by': 'cdrlab',
              'environment': 'lab'
            },
            forbiddenServices: ['iam', 'organizations'],
            maxInstances: 10
          },
          gcp: {
            allowedProjects: [],
            allowedRegions: ['us-central1', 'us-west1'],
            requiredLabels: {
              'managed-by': 'cdrlab',
              'environment': 'lab'
            },
            forbiddenAPIs: ['iam.googleapis.com'],
            maxInstances: 10
          },
          azure: {
            allowedSubscriptions: [],
            allowedResourceGroups: ['rg-cdrlab-*'],
            requiredTags: {
              'managed-by': 'cdrlab',
              'environment': 'lab'
            },
            forbiddenServices: ['Microsoft.Authorization'],
            maxInstances: 10
          }
        },
        xsiam: {
          allowedTenants: [],
          contentPackPrefixes: ['cdrlab-', 'test-'],
          maxRules: 100,
          maxParsers: 50,
          forbiddenAPIs: ['/public_api/v1/audits']
        }
      },
      execution: {
        requireApproval: false,
        lockTimeout: 30,
        dryRunDefault: true,
        confirmationRequired: true
      },
      cleanup: {
        defaultTTL: 8,
        orphanSweepInterval: 24,
        retentionDays: 30,
        forceCleanupAfter: 72
      }
    };
  }
}

// Supporting interfaces
export interface DeploymentRequest {
  scenarioId: string;
  unsafe?: boolean;
  ttlHours?: number;
  estimatedResources?: {
    cloudInstances?: number;
    storageGB?: number;
    k8sNamespaces?: number;
  };
  kubernetesResources?: KubernetesDeploymentRequest;
  cloudResources?: CloudDeploymentRequest;
}

export interface KubernetesDeploymentRequest {
  namespaces?: string[];
  resourceTypes?: string[];
  clusterScoped?: boolean;
}

export interface CloudDeploymentRequest {
  aws?: {
    region: string;
    instanceCount: number;
    services: string[];
  };
  gcp?: {
    project: string;
    region: string;
    instanceCount: number;
  };
  azure?: {
    subscription: string;
    resourceGroup: string;
    instanceCount: number;
  };
}

export interface PolicyValidationResult {
  valid: boolean;
  violations: PolicyViolation[];
  requiresApproval: boolean;
  dryRunRecommended: boolean;
}
