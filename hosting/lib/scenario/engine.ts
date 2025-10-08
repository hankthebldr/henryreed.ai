/**
 * Scenario Engine - Core orchestration service
 * Manages complete scenario lifecycle with provider adapters and state management
 */

import { scenarioRegistry, EnhancedScenarioConfig, PANWProduct } from './registry';

export type DeploymentState = 
  | 'initializing'
  | 'deploying'
  | 'active'
  | 'validating'
  | 'exporting'
  | 'destroying'
  | 'completed'
  | 'failed'
  | 'archived';

export type Provider = 'gcp' | 'aws' | 'azure' | 'k8s' | 'local';

export interface ScenarioDeployment {
  id: string;
  scenarioId: string;
  scenario: EnhancedScenarioConfig;
  provider: Provider;
  state: DeploymentState;
  startTime: Date;
  endTime?: Date;
  region?: string;
  resources: DeployedResource[];
  configuration: Record<string, any>;
  validationResults?: ValidationResult[];
  exportData?: ExportData;
  costs?: CostData;
  metadata: {
    deployedBy: string;
    purpose: string;
    customerContext?: string;
    povId?: string;
  };
}

export interface DeployedResource {
  type: string;
  id: string;
  name: string;
  provider: Provider;
  region?: string;
  status: 'creating' | 'active' | 'failed' | 'destroying' | 'destroyed';
  properties: Record<string, any>;
  createdAt: Date;
  cost?: number;
}

export interface ValidationResult {
  testId: string;
  name: string;
  category: 'detection' | 'prevention' | 'response' | 'compliance';
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  panwProduct?: PANWProduct;
  mitreTechnique?: string;
}

export interface ExportData {
  format: 'pdf' | 'json' | 'csv' | 'markdown';
  content: any;
  metadata: {
    generatedAt: Date;
    deploymentId: string;
    scenario: string;
    version: string;
  };
}

export interface CostData {
  totalCost: number;
  currency: 'USD';
  breakdown: {
    compute: number;
    storage: number;
    network: number;
    other: number;
  };
  estimatedDaily: number;
  lastUpdated: Date;
}

export abstract class ProviderAdapter {
  abstract provider: Provider;
  
  abstract deploy(scenario: EnhancedScenarioConfig, config: Record<string, any>): Promise<DeployedResource[]>;
  abstract validate(deployment: ScenarioDeployment): Promise<ValidationResult[]>;
  abstract destroy(deployment: ScenarioDeployment): Promise<void>;
  abstract getCosts(deployment: ScenarioDeployment): Promise<CostData>;
  abstract export(deployment: ScenarioDeployment, format: string): Promise<ExportData>;
}

/**
 * Mock Provider Adapter for testing and demonstrations
 */
class MockProviderAdapter extends ProviderAdapter {
  provider: Provider = 'local';

  async deploy(scenario: EnhancedScenarioConfig, config: Record<string, any>): Promise<DeployedResource[]> {
    // Simulate deployment delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const resources: DeployedResource[] = [
      {
        type: 'compute-instance',
        id: `mock-vm-${Date.now()}`,
        name: `${scenario.id}-test-vm`,
        provider: 'local',
        status: 'active',
        properties: {
          os: 'Ubuntu 22.04',
          cpus: 2,
          memory: '4GB',
          disk: '20GB'
        },
        createdAt: new Date(),
        cost: 0.05
      },
      {
        type: 'storage-bucket',
        id: `mock-bucket-${Date.now()}`,
        name: `${scenario.id}-test-storage`,
        provider: 'local',
        status: 'active',
        properties: {
          size: '1GB',
          encryption: false,
          publicRead: true // Intentional misconfiguration for testing
        },
        createdAt: new Date(),
        cost: 0.01
      }
    ];

    return resources;
  }

  async validate(deployment: ScenarioDeployment): Promise<ValidationResult[]> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results: ValidationResult[] = [];
    
    // Generate validation results based on scenario
    deployment.scenario.mitreTechniques.forEach(technique => {
      results.push({
        testId: `test-${technique.id.toLowerCase()}`,
        name: `Detection Test: ${technique.name}`,
        category: 'detection',
        status: 'passed',
        message: `Successfully detected ${technique.name} technique`,
        details: {
          techniqueId: technique.id,
          tactic: technique.tactic,
          alertsGenerated: Math.floor(Math.random() * 5) + 1,
          falsePositives: 0
        },
        timestamp: new Date(),
        mitreTechnique: technique.id
      });
    });

    // Add product-specific validation
    deployment.scenario.panwProducts.forEach(product => {
      if (product.role === 'primary') {
        results.push({
          testId: `product-${product.product}`,
          name: `${product.product} Integration Test`,
          category: 'prevention',
          status: 'passed',
          message: `${product.product} successfully integrated and configured`,
          details: {
            capabilities: product.capabilities,
            configurationRequired: product.configurationRequired
          },
          timestamp: new Date(),
          panwProduct: product.product
        });
      }
    });

    // Add compliance validation if applicable
    if (deployment.scenario.businessValue.primaryValue === 'compliance-automation') {
      results.push({
        testId: 'compliance-check',
        name: 'Compliance Framework Validation',
        category: 'compliance',
        status: 'passed',
        message: 'All compliance requirements validated successfully',
        details: {
          frameworks: ['SOC 2', 'PCI DSS', 'GDPR'],
          controlsValidated: 15,
          controlsPassed: 15
        },
        timestamp: new Date()
      });
    }

    return results;
  }

  async destroy(deployment: ScenarioDeployment): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mark all resources as destroyed
    deployment.resources.forEach(resource => {
      resource.status = 'destroyed';
    });
  }

  async getCosts(deployment: ScenarioDeployment): Promise<CostData> {
    const totalCost = deployment.resources.reduce((sum, resource) => sum + (resource.cost || 0), 0);
    
    return {
      totalCost,
      currency: 'USD',
      breakdown: {
        compute: totalCost * 0.7,
        storage: totalCost * 0.2,
        network: totalCost * 0.05,
        other: totalCost * 0.05
      },
      estimatedDaily: totalCost * 24,
      lastUpdated: new Date()
    };
  }

  async export(deployment: ScenarioDeployment, format: string): Promise<ExportData> {
    const reportData = {
      deployment: {
        id: deployment.id,
        scenario: deployment.scenario.name,
        provider: deployment.provider,
        startTime: deployment.startTime,
        endTime: deployment.endTime,
        state: deployment.state
      },
      scenario: {
        name: deployment.scenario.name,
        description: deployment.scenario.description,
        category: deployment.scenario.category,
        complexity: deployment.scenario.complexity,
        businessValue: deployment.scenario.businessValue,
        mitreTechniques: deployment.scenario.mitreTechniques,
        panwProducts: deployment.scenario.panwProducts
      },
      results: deployment.validationResults || [],
      resources: deployment.resources,
      costs: deployment.costs,
      summary: {
        totalTests: deployment.validationResults?.length || 0,
        passedTests: deployment.validationResults?.filter(r => r.status === 'passed').length || 0,
        failedTests: deployment.validationResults?.filter(r => r.status === 'failed').length || 0,
        totalCost: deployment.costs?.totalCost || 0,
        duration: deployment.endTime && deployment.startTime ? 
          Math.round((deployment.endTime.getTime() - deployment.startTime.getTime()) / 1000 / 60) : 0
      }
    };

    return {
      format: format as any,
      content: reportData,
      metadata: {
        generatedAt: new Date(),
        deploymentId: deployment.id,
        scenario: deployment.scenario.name,
        version: deployment.scenario.version
      }
    };
  }
}

/**
 * Core Scenario Engine orchestrating deployment lifecycle
 */
export class ScenarioEngine {
  private deployments: Map<string, ScenarioDeployment> = new Map();
  private providers: Map<Provider, ProviderAdapter> = new Map();
  
  constructor() {
    // Register default mock provider
    this.registerProvider(new MockProviderAdapter());
  }

  /**
   * Register a provider adapter
   */
  registerProvider(adapter: ProviderAdapter): void {
    this.providers.set(adapter.provider, adapter);
  }

  /**
   * Deploy a scenario
   */
  async deployScenario(
    scenarioId: string,
    provider: Provider,
    config: {
      region?: string;
      deployedBy: string;
      purpose: string;
      customerContext?: string;
      povId?: string;
      configuration?: Record<string, any>;
    }
  ): Promise<ScenarioDeployment> {
    const scenario = scenarioRegistry.getById(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }

    const adapter = this.providers.get(provider);
    if (!adapter) {
      throw new Error(`Provider not supported: ${provider}`);
    }

    if (!scenario.providers.includes(provider)) {
      throw new Error(`Scenario ${scenarioId} does not support provider ${provider}`);
    }

    const deploymentId = `deploy-${scenarioId}-${Date.now()}`;
    const deployment: ScenarioDeployment = {
      id: deploymentId,
      scenarioId,
      scenario,
      provider,
      state: 'initializing',
      startTime: new Date(),
      region: config.region,
      resources: [],
      configuration: config.configuration || {},
      metadata: {
        deployedBy: config.deployedBy,
        purpose: config.purpose,
        customerContext: config.customerContext,
        povId: config.povId
      }
    };

    this.deployments.set(deploymentId, deployment);

    try {
      // Update state to deploying
      deployment.state = 'deploying';
      
      // Deploy resources
      const resources = await adapter.deploy(scenario, deployment.configuration);
      deployment.resources = resources;
      deployment.state = 'active';

      // Get initial cost data
      deployment.costs = await adapter.getCosts(deployment);

      return deployment;
    } catch (error) {
      deployment.state = 'failed';
      throw error;
    }
  }

  /**
   * Validate a deployment
   */
  async validateDeployment(deploymentId: string): Promise<ValidationResult[]> {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment not found: ${deploymentId}`);
    }

    const adapter = this.providers.get(deployment.provider);
    if (!adapter) {
      throw new Error(`Provider not found: ${deployment.provider}`);
    }

    try {
      deployment.state = 'validating';
      const results = await adapter.validate(deployment);
      deployment.validationResults = results;
      deployment.state = 'active';
      return results;
    } catch (error) {
      deployment.state = 'failed';
      throw error;
    }
  }

  /**
   * Export deployment data
   */
  async exportDeployment(deploymentId: string, format: 'pdf' | 'json' | 'csv' | 'markdown'): Promise<ExportData> {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment not found: ${deploymentId}`);
    }

    const adapter = this.providers.get(deployment.provider);
    if (!adapter) {
      throw new Error(`Provider not found: ${deployment.provider}`);
    }

    try {
      deployment.state = 'exporting';
      const exportData = await adapter.export(deployment, format);
      deployment.exportData = exportData;
      deployment.state = 'active';
      return exportData;
    } catch (error) {
      deployment.state = 'failed';
      throw error;
    }
  }

  /**
   * Destroy a deployment
   */
  async destroyDeployment(deploymentId: string): Promise<void> {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment not found: ${deploymentId}`);
    }

    const adapter = this.providers.get(deployment.provider);
    if (!adapter) {
      throw new Error(`Provider not found: ${deployment.provider}`);
    }

    try {
      deployment.state = 'destroying';
      await adapter.destroy(deployment);
      deployment.state = 'completed';
      deployment.endTime = new Date();
    } catch (error) {
      deployment.state = 'failed';
      throw error;
    }
  }

  /**
   * Get deployment status
   */
  getDeployment(deploymentId: string): ScenarioDeployment | undefined {
    return this.deployments.get(deploymentId);
  }

  /**
   * Get all deployments
   */
  getAllDeployments(): ScenarioDeployment[] {
    return Array.from(this.deployments.values());
  }

  /**
   * Get active deployments
   */
  getActiveDeployments(): ScenarioDeployment[] {
    return Array.from(this.deployments.values())
      .filter(d => d.state === 'active' || d.state === 'validating' || d.state === 'exporting');
  }

  /**
   * Get deployments by scenario
   */
  getDeploymentsByScenario(scenarioId: string): ScenarioDeployment[] {
    return Array.from(this.deployments.values())
      .filter(d => d.scenarioId === scenarioId);
  }

  /**
   * Get deployment summary statistics
   */
  getDeploymentStats(): {
    total: number;
    byState: Record<DeploymentState, number>;
    byProvider: Record<Provider, number>;
    totalCosts: number;
    averageDuration: number;
  } {
    const deployments = this.getAllDeployments();
    const stats = {
      total: deployments.length,
      byState: {} as Record<DeploymentState, number>,
      byProvider: {} as Record<Provider, number>,
      totalCosts: 0,
      averageDuration: 0
    };

    let totalDuration = 0;
    let completedDeployments = 0;

    deployments.forEach(deployment => {
      // Count by state
      stats.byState[deployment.state] = (stats.byState[deployment.state] || 0) + 1;
      
      // Count by provider
      stats.byProvider[deployment.provider] = (stats.byProvider[deployment.provider] || 0) + 1;
      
      // Sum costs
      if (deployment.costs) {
        stats.totalCosts += deployment.costs.totalCost;
      }

      // Calculate duration for completed deployments
      if (deployment.endTime) {
        const duration = deployment.endTime.getTime() - deployment.startTime.getTime();
        totalDuration += duration;
        completedDeployments++;
      }
    });

    if (completedDeployments > 0) {
      stats.averageDuration = Math.round(totalDuration / completedDeployments / 1000 / 60); // minutes
    }

    return stats;
  }

  /**
   * Update deployment costs
   */
  async updateDeploymentCosts(deploymentId: string): Promise<CostData> {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment not found: ${deploymentId}`);
    }

    const adapter = this.providers.get(deployment.provider);
    if (!adapter) {
      throw new Error(`Provider not found: ${deployment.provider}`);
    }

    const costs = await adapter.getCosts(deployment);
    deployment.costs = costs;
    return costs;
  }
}

// Global engine instance
export const scenarioEngine = new ScenarioEngine();

// Export convenience functions
export function deployScenario(scenarioId: string, provider: Provider, config: any) {
  return scenarioEngine.deployScenario(scenarioId, provider, config);
}

export function getDeployment(deploymentId: string) {
  return scenarioEngine.getDeployment(deploymentId);
}

export function getActiveDeployments() {
  return scenarioEngine.getActiveDeployments();
}

export function validateDeployment(deploymentId: string) {
  return scenarioEngine.validateDeployment(deploymentId);
}

export function exportDeployment(deploymentId: string, format: 'pdf' | 'json' | 'csv' | 'markdown') {
  return scenarioEngine.exportDeployment(deploymentId, format);
}

export function destroyDeployment(deploymentId: string) {
  return scenarioEngine.destroyDeployment(deploymentId);
}