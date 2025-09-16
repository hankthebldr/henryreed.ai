// Resource Ledger System for CDR Lab
// Tracks all resources created by scenarios for safe cleanup and auditing

export interface ResourceIdentity {
  provider: 'kubernetes' | 'aws' | 'gcp' | 'azure' | 'xsiam' | 'local';
  type: string; // e.g., 'Pod', 'EC2Instance', 'GCEInstance', 'VirtualMachine'
  name: string;
  namespace?: string; // For k8s resources
  region?: string; // For cloud resources
  uid?: string; // Unique identifier from provider
  arn?: string; // For AWS resources
  resourceId?: string; // For GCP/Azure resources
}

export interface Resource {
  identity: ResourceIdentity;
  labels: Record<string, string>;
  createdAt: Date;
  createdBy: string;
  status: 'creating' | 'ready' | 'deleting' | 'deleted' | 'error';
  metadata: Record<string, any>;
  dependencies?: string[]; // References to other resources in ledger
  ttl?: Date; // Time to live
  deletionPolicy: 'delete' | 'retain' | 'orphan';
  cost?: {
    estimated: number;
    currency: 'USD';
    period: 'hour' | 'day' | 'month';
  };
}

export interface ScenarioLedger {
  scenarioId: string;
  povId?: string;
  chainId?: string;
  version: string;
  createdAt: Date;
  createdBy: string;
  status: 'deploying' | 'deployed' | 'destroying' | 'destroyed' | 'error';
  overlay: 'safe' | 'unsafe';
  accountContext: {
    kubernetesContext?: string;
    cloudProfiles?: string[];
    xsiamTenants?: string[];
  };
  resources: Resource[];
  operations: OperationLog[];
  estimatedCost?: {
    total: number;
    currency: 'USD';
    breakdown: Record<string, number>;
  };
  ttl?: Date;
}

export interface OperationLog {
  timestamp: Date;
  operation: 'create' | 'update' | 'delete' | 'validate';
  resourceId: string;
  status: 'started' | 'completed' | 'failed';
  error?: string;
  metadata: Record<string, any>;
}

export interface LedgerQuery {
  scenarioId?: string;
  povId?: string;
  status?: Resource['status'][];
  provider?: ResourceIdentity['provider'][];
  createdAfter?: Date;
  createdBefore?: Date;
  labels?: Record<string, string>;
  expiredTTL?: boolean;
}

export class ResourceLedgerManager {
  private ledgers: Map<string, ScenarioLedger> = new Map();
  private readonly ledgerPath = '.cdrlab/state';

  constructor() {
    // In production, this would persist to filesystem/database
  }

  /**
   * Create a new scenario ledger
   */
  async createScenarioLedger(
    scenarioId: string, 
    createdBy: string, 
    overlay: 'safe' | 'unsafe',
    options: {
      povId?: string;
      chainId?: string;
      ttlHours?: number;
      accountContext?: ScenarioLedger['accountContext'];
    } = {}
  ): Promise<ScenarioLedger> {
    const ledger: ScenarioLedger = {
      scenarioId,
      povId: options.povId,
      chainId: options.chainId,
      version: '1.0',
      createdAt: new Date(),
      createdBy,
      status: 'deploying',
      overlay,
      accountContext: options.accountContext || {},
      resources: [],
      operations: [],
      ttl: options.ttlHours ? new Date(Date.now() + options.ttlHours * 60 * 60 * 1000) : undefined
    };

    this.ledgers.set(scenarioId, ledger);
    await this.persistLedger(ledger);
    
    return ledger;
  }

  /**
   * Add a resource to a scenario ledger
   */
  async addResource(
    scenarioId: string,
    resource: Omit<Resource, 'createdAt' | 'status'>,
    createdBy: string
  ): Promise<void> {
    const ledger = this.ledgers.get(scenarioId);
    if (!ledger) {
      throw new Error(`Scenario ledger not found: ${scenarioId}`);
    }

    const fullResource: Resource = {
      ...resource,
      createdAt: new Date(),
      status: 'creating',
      createdBy
    };

    // Ensure required labels are present
    fullResource.labels = {
      'managed-by': 'cdrlab',
      'cdrlab.scenario': scenarioId,
      'cdrlab.overlay': ledger.overlay,
      'cdrlab.created-at': fullResource.createdAt.toISOString(),
      ...fullResource.labels
    };

    if (ledger.povId) {
      fullResource.labels['cdrlab.pov'] = ledger.povId;
    }

    if (ledger.chainId) {
      fullResource.labels['cdrlab.chain'] = ledger.chainId;
    }

    ledger.resources.push(fullResource);
    this.logOperation(ledger, 'create', this.getResourceKey(fullResource), 'started', createdBy);
    
    await this.persistLedger(ledger);
  }

  /**
   * Update resource status
   */
  async updateResourceStatus(
    scenarioId: string,
    resourceKey: string,
    status: Resource['status'],
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const ledger = this.ledgers.get(scenarioId);
    if (!ledger) {
      throw new Error(`Scenario ledger not found: ${scenarioId}`);
    }

    const resource = ledger.resources.find(r => this.getResourceKey(r) === resourceKey);
    if (!resource) {
      throw new Error(`Resource not found: ${resourceKey}`);
    }

    resource.status = status;
    resource.metadata = { ...resource.metadata, ...metadata };

    this.logOperation(ledger, 'update', resourceKey, 'completed');
    await this.persistLedger(ledger);
  }

  /**
   * Mark scenario as deployed
   */
  async markScenarioDeployed(scenarioId: string): Promise<void> {
    const ledger = this.ledgers.get(scenarioId);
    if (!ledger) {
      throw new Error(`Scenario ledger not found: ${scenarioId}`);
    }

    ledger.status = 'deployed';
    await this.persistLedger(ledger);
  }

  /**
   * Get deployment summary for a scenario
   */
  getDeploymentSummary(scenarioId: string): DeploymentSummary | null {
    const ledger = this.ledgers.get(scenarioId);
    if (!ledger) {
      return null;
    }

    const resourcesByProvider = ledger.resources.reduce((acc, resource) => {
      const provider = resource.identity.provider;
      if (!acc[provider]) {
        acc[provider] = { total: 0, ready: 0, error: 0, creating: 0 };
      }
      acc[provider].total++;
      acc[provider][resource.status]++;
      return acc;
    }, {} as Record<string, { total: number; ready: number; error: number; creating: number }>);

    const totalCost = ledger.resources.reduce((sum, resource) => {
      return sum + (resource.cost?.estimated || 0);
    }, 0);

    return {
      scenarioId,
      status: ledger.status,
      totalResources: ledger.resources.length,
      resourcesByProvider,
      estimatedCostPerHour: totalCost,
      createdAt: ledger.createdAt,
      ttl: ledger.ttl,
      isExpired: ledger.ttl ? ledger.ttl < new Date() : false
    };
  }

  /**
   * Query resources across scenarios
   */
  queryResources(query: LedgerQuery): Resource[] {
    const results: Resource[] = [];

    for (const ledger of this.ledgers.values()) {
      // Filter by scenario/pov
      if (query.scenarioId && ledger.scenarioId !== query.scenarioId) continue;
      if (query.povId && ledger.povId !== query.povId) continue;

      for (const resource of ledger.resources) {
        // Filter by status
        if (query.status && !query.status.includes(resource.status)) continue;
        
        // Filter by provider
        if (query.provider && !query.provider.includes(resource.identity.provider)) continue;
        
        // Filter by creation date
        if (query.createdAfter && resource.createdAt < query.createdAfter) continue;
        if (query.createdBefore && resource.createdAt > query.createdBefore) continue;
        
        // Filter by TTL expiration
        if (query.expiredTTL) {
          const isExpired = resource.ttl && resource.ttl < new Date();
          if (!isExpired) continue;
        }
        
        // Filter by labels
        if (query.labels) {
          const hasAllLabels = Object.entries(query.labels).every(([key, value]) => 
            resource.labels[key] === value
          );
          if (!hasAllLabels) continue;
        }

        results.push(resource);
      }
    }

    return results;
  }

  /**
   * Get cleanup plan for a scenario
   */
  async getCleanupPlan(scenarioId: string): Promise<CleanupPlan> {
    const ledger = this.ledgers.get(scenarioId);
    if (!ledger) {
      throw new Error(`Scenario ledger not found: ${scenarioId}`);
    }

    // Group resources by provider and determine deletion order
    const resourcesByProvider = this.groupResourcesByProvider(ledger.resources);
    
    // Calculate dependencies and create deletion waves
    const deletionWaves = this.calculateDeletionWaves(ledger.resources);

    // Estimate cleanup time
    const estimatedDurationMinutes = this.estimateCleanupDuration(ledger.resources);

    return {
      scenarioId,
      resourcesByProvider,
      deletionWaves,
      estimatedDurationMinutes,
      requiresConfirmation: ledger.overlay === 'unsafe' || ledger.resources.length > 10,
      warnings: this.generateCleanupWarnings(ledger)
    };
  }

  /**
   * Execute cleanup for a scenario
   */
  async executeCleanup(
    scenarioId: string,
    options: {
      dryRun?: boolean;
      force?: boolean;
      scope?: ResourceIdentity['provider'][];
    } = {}
  ): Promise<CleanupResult> {
    const ledger = this.ledgers.get(scenarioId);
    if (!ledger) {
      throw new Error(`Scenario ledger not found: ${scenarioId}`);
    }

    ledger.status = 'destroying';
    await this.persistLedger(ledger);

    const results: CleanupResult = {
      scenarioId,
      dryRun: options.dryRun || false,
      startedAt: new Date(),
      resourcesProcessed: 0,
      resourcesDeleted: 0,
      errors: [],
      warnings: []
    };

    try {
      const plan = await this.getCleanupPlan(scenarioId);
      
      // Filter resources by scope if specified
      let resourcesToCleanup = ledger.resources.filter(r => r.status !== 'deleted');
      if (options.scope) {
        resourcesToCleanup = resourcesToCleanup.filter(r => 
          options.scope!.includes(r.identity.provider)
        );
      }

      // Execute deletion in waves
      for (const wave of plan.deletionWaves) {
        const waveResources = resourcesToCleanup.filter(r => 
          wave.resourceKeys.includes(this.getResourceKey(r))
        );

        for (const resource of waveResources) {
          results.resourcesProcessed++;
          
          try {
            if (!options.dryRun) {
              await this.deleteResource(resource);
              resource.status = 'deleted';
              results.resourcesDeleted++;
            }

            this.logOperation(ledger, 'delete', this.getResourceKey(resource), 
              options.dryRun ? 'started' : 'completed');
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            results.errors.push({
              resource: this.getResourceKey(resource),
              error: errorMsg
            });
            
            this.logOperation(ledger, 'delete', this.getResourceKey(resource), 'failed', undefined, errorMsg);
          }
        }

        // Wait between waves for proper ordering
        if (!options.dryRun && plan.deletionWaves.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      // Update ledger status
      const remainingResources = ledger.resources.filter(r => r.status !== 'deleted');
      if (remainingResources.length === 0) {
        ledger.status = 'destroyed';
      }

      results.completedAt = new Date();
      await this.persistLedger(ledger);

    } catch (error) {
      ledger.status = 'error';
      results.errors.push({
        resource: 'scenario',
        error: error instanceof Error ? error.message : 'Cleanup failed'
      });
      await this.persistLedger(ledger);
    }

    return results;
  }

  /**
   * Get expired scenarios that need cleanup
   */
  getExpiredScenarios(): ScenarioLedger[] {
    const now = new Date();
    return Array.from(this.ledgers.values())
      .filter(ledger => ledger.ttl && ledger.ttl < now && ledger.status !== 'destroyed');
  }

  private getResourceKey(resource: Resource): string {
    const { identity } = resource;
    return `${identity.provider}:${identity.type}:${identity.namespace || 'default'}:${identity.name}`;
  }

  private groupResourcesByProvider(resources: Resource[]): Record<string, Resource[]> {
    return resources.reduce((acc, resource) => {
      const provider = resource.identity.provider;
      if (!acc[provider]) {
        acc[provider] = [];
      }
      acc[provider].push(resource);
      return acc;
    }, {} as Record<string, Resource[]>);
  }

  private calculateDeletionWaves(resources: Resource[]): DeletionWave[] {
    // Simplified deletion ordering - in production this would analyze dependencies
    const waves: DeletionWave[] = [];
    
    // Wave 1: Workloads and application resources
    const workloadTypes = ['Pod', 'Job', 'Deployment', 'StatefulSet', 'DaemonSet'];
    const workloads = resources.filter(r => workloadTypes.includes(r.identity.type));
    if (workloads.length > 0) {
      waves.push({
        order: 1,
        description: 'Application workloads',
        resourceKeys: workloads.map(r => this.getResourceKey(r))
      });
    }

    // Wave 2: Services and networking
    const networkTypes = ['Service', 'Ingress', 'NetworkPolicy'];
    const networking = resources.filter(r => networkTypes.includes(r.identity.type));
    if (networking.length > 0) {
      waves.push({
        order: 2,
        description: 'Services and networking',
        resourceKeys: networking.map(r => this.getResourceKey(r))
      });
    }

    // Wave 3: Cloud resources
    const cloudResources = resources.filter(r => 
      ['aws', 'gcp', 'azure'].includes(r.identity.provider)
    );
    if (cloudResources.length > 0) {
      waves.push({
        order: 3,
        description: 'Cloud infrastructure',
        resourceKeys: cloudResources.map(r => this.getResourceKey(r))
      });
    }

    // Wave 4: RBAC and cluster resources
    const rbacTypes = ['Role', 'RoleBinding', 'ClusterRole', 'ClusterRoleBinding'];
    const rbac = resources.filter(r => rbacTypes.includes(r.identity.type));
    if (rbac.length > 0) {
      waves.push({
        order: 4,
        description: 'RBAC and cluster resources',
        resourceKeys: rbac.map(r => this.getResourceKey(r))
      });
    }

    return waves.sort((a, b) => a.order - b.order);
  }

  private estimateCleanupDuration(resources: Resource[]): number {
    // Simple estimation: 30 seconds per resource + overhead
    const baseTime = resources.length * 0.5; // 30 seconds per resource
    const overhead = Math.min(resources.length * 0.1, 5); // Up to 5 minutes overhead
    return Math.ceil(baseTime + overhead);
  }

  private generateCleanupWarnings(ledger: ScenarioLedger): string[] {
    const warnings: string[] = [];
    
    if (ledger.overlay === 'unsafe') {
      warnings.push('Unsafe overlay detected - review resources carefully');
    }
    
    const clusterScopedResources = ledger.resources.filter(r => 
      r.identity.provider === 'kubernetes' && !r.identity.namespace
    );
    if (clusterScopedResources.length > 0) {
      warnings.push(`${clusterScopedResources.length} cluster-scoped resources will be deleted`);
    }

    const cloudResources = ledger.resources.filter(r => 
      ['aws', 'gcp', 'azure'].includes(r.identity.provider)
    );
    if (cloudResources.length > 0) {
      warnings.push(`${cloudResources.length} cloud resources will be deleted - charges may apply`);
    }

    return warnings;
  }

  private async deleteResource(resource: Resource): Promise<void> {
    // This is a mock implementation - in production this would call actual deletion APIs
    console.log(`Deleting ${resource.identity.provider} resource: ${this.getResourceKey(resource)}`);
    
    // Simulate deletion time based on resource type
    const deletionTime = resource.identity.provider === 'kubernetes' ? 1000 : 3000;
    await new Promise(resolve => setTimeout(resolve, deletionTime));
  }

  private logOperation(
    ledger: ScenarioLedger, 
    operation: OperationLog['operation'],
    resourceId: string,
    status: OperationLog['status'],
    user?: string,
    error?: string
  ): void {
    ledger.operations.push({
      timestamp: new Date(),
      operation,
      resourceId,
      status,
      error,
      metadata: { user }
    });
  }

  private async persistLedger(ledger: ScenarioLedger): Promise<void> {
    // In production, this would write to .cdrlab/state/{scenarioId}/ledger.json
    console.log(`Persisting ledger for scenario: ${ledger.scenarioId}`);
  }
}

// Supporting interfaces
export interface DeploymentSummary {
  scenarioId: string;
  status: ScenarioLedger['status'];
  totalResources: number;
  resourcesByProvider: Record<string, { total: number; ready: number; error: number; creating: number }>;
  estimatedCostPerHour: number;
  createdAt: Date;
  ttl?: Date;
  isExpired: boolean;
}

export interface CleanupPlan {
  scenarioId: string;
  resourcesByProvider: Record<string, Resource[]>;
  deletionWaves: DeletionWave[];
  estimatedDurationMinutes: number;
  requiresConfirmation: boolean;
  warnings: string[];
}

export interface DeletionWave {
  order: number;
  description: string;
  resourceKeys: string[];
}

export interface CleanupResult {
  scenarioId: string;
  dryRun: boolean;
  startedAt: Date;
  completedAt?: Date;
  resourcesProcessed: number;
  resourcesDeleted: number;
  errors: { resource: string; error: string }[];
  warnings: string[];
}
