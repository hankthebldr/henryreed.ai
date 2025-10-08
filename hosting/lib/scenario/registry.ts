/**
 * Enhanced Scenario Registry with PANW Product Mapping
 * Standardized categorization for portable indexing and business value alignment
 */

export type PANWProduct = 
  | 'cortex-xsiam' 
  | 'cortex-xsoar' 
  | 'cortex-xdr'
  | 'prisma-cloud'
  | 'prisma-access'
  | 'prisma-sase'
  | 'next-gen-firewall'
  | 'wildfire'
  | 'globalprotect'
  | 'panorama'
  | 'cortex-data-lake'
  | 'unit42-threat-intel';

export type BusinessValueTag = 
  | 'cost-reduction'
  | 'risk-mitigation' 
  | 'compliance-automation'
  | 'operational-efficiency'
  | 'threat-prevention'
  | 'incident-response'
  | 'visibility-enhancement'
  | 'automation-orchestration'
  | 'zero-trust-enablement'
  | 'cloud-security-posture'
  | 'data-protection'
  | 'insider-threat-detection';

export type UseCase = 
  | 'security-validation'
  | 'red-team-exercise'
  | 'blue-team-training'
  | 'compliance-testing'
  | 'product-demo'
  | 'pov-technical-validation'
  | 'customer-onboarding'
  | 'threat-hunting'
  | 'incident-simulation'
  | 'detection-tuning'
  | 'security-awareness'
  | 'executive-briefing';

export type ComplexityRating = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type BusinessImpactScore = 1 | 2 | 3 | 4 | 5; // 1=low, 5=critical

export interface MITRETechnique {
  id: string; // e.g. "T1566.002"
  name: string; // e.g. "Spearphishing Link"
  tactic: string; // e.g. "Initial Access"
  description: string;
}

export interface PANWProductIntegration {
  product: PANWProduct;
  role: 'primary' | 'secondary' | 'optional';
  capabilities: string[]; // e.g. ["detection", "prevention", "response"]
  configurationRequired: boolean;
  notes?: string;
}

export interface BusinessValueMapping {
  primaryValue: BusinessValueTag;
  secondaryValues: BusinessValueTag[];
  businessImpact: BusinessImpactScore;
  roiTimeframe: '1-3 months' | '3-6 months' | '6-12 months' | '12+ months';
  quantifiableMetrics: string[]; // e.g. ["MTTR reduction: 50%", "False positive reduction: 30%"]
}

export interface EnhancedScenarioConfig {
  // Core identification
  id: string;
  name: string;
  description: string;
  version: string;
  
  // Categorization
  category: 'cloud-security' | 'endpoint-security' | 'network-security' | 'data-security' | 'identity-security' | 'application-security';
  subcategory: string;
  complexity: ComplexityRating;
  
  // Business alignment
  businessValue: BusinessValueMapping;
  useCases: UseCase[];
  targetAudience: ('technical' | 'executive' | 'security-team' | 'it-admin')[];
  
  // PANW product integration
  panwProducts: PANWProductIntegration[];
  
  // Technical details
  mitreTechniques: MITRETechnique[];
  estimatedDuration: {
    setup: number; // minutes
    execution: number; // minutes
    analysis: number; // minutes
  };
  
  // Deployment options
  providers: ('gcp' | 'aws' | 'azure' | 'k8s' | 'local')[];
  prerequisites: string[];
  
  // Execution metadata
  automationLevel: 'manual' | 'semi-automated' | 'fully-automated';
  scalability: 'single-user' | 'team' | 'enterprise';
  
  // Content and resources
  resources: {
    documentation: string[];
    scripts: string[];
    datasets: string[];
    templates: string[];
  };
  
  // Success criteria
  successMetrics: {
    technical: string[];
    business: string[];
  };
  
  // Metadata
  tags: string[];
  lastUpdated: string;
  createdBy: string;
  validated: boolean;
  customerFeedback?: {
    rating: number;
    comments: string[];
  };
}

/**
 * Enhanced scenario registry with PANW product mapping
 */
export class ScenarioRegistry {
  private scenarios: Map<string, EnhancedScenarioConfig> = new Map();
  private categoryIndex: Map<string, string[]> = new Map();
  private productIndex: Map<PANWProduct, string[]> = new Map();
  private businessValueIndex: Map<BusinessValueTag, string[]> = new Map();
  private mitreIndex: Map<string, string[]> = new Map();

  constructor() {
    this.initializeScenarios();
    this.buildIndexes();
  }

  /**
   * Register a new scenario
   */
  register(scenario: EnhancedScenarioConfig): void {
    this.scenarios.set(scenario.id, scenario);
    this.updateIndexes(scenario);
  }

  /**
   * Get scenarios by category
   */
  getByCategory(category: string): EnhancedScenarioConfig[] {
    const scenarioIds = this.categoryIndex.get(category) || [];
    return scenarioIds.map(id => this.scenarios.get(id)).filter(Boolean) as EnhancedScenarioConfig[];
  }

  /**
   * Get scenarios by PANW product
   */
  getByProduct(product: PANWProduct): EnhancedScenarioConfig[] {
    const scenarioIds = this.productIndex.get(product) || [];
    return scenarioIds.map(id => this.scenarios.get(id)).filter(Boolean) as EnhancedScenarioConfig[];
  }

  /**
   * Get scenarios by business value
   */
  getByBusinessValue(value: BusinessValueTag): EnhancedScenarioConfig[] {
    const scenarioIds = this.businessValueIndex.get(value) || [];
    return scenarioIds.map(id => this.scenarios.get(id)).filter(Boolean) as EnhancedScenarioConfig[];
  }

  /**
   * Get scenarios by MITRE technique
   */
  getByMitreTechnique(techniqueId: string): EnhancedScenarioConfig[] {
    const scenarioIds = this.mitreIndex.get(techniqueId) || [];
    return scenarioIds.map(id => this.scenarios.get(id)).filter(Boolean) as EnhancedScenarioConfig[];
  }

  /**
   * Advanced filtering
   */
  filter(filters: {
    category?: string;
    complexity?: ComplexityRating;
    products?: PANWProduct[];
    businessValue?: BusinessValueTag[];
    useCases?: UseCase[];
    businessImpact?: BusinessImpactScore;
    provider?: string;
  }): EnhancedScenarioConfig[] {
    let results = Array.from(this.scenarios.values());

    if (filters.category) {
      results = results.filter(s => s.category === filters.category);
    }
    
    if (filters.complexity) {
      results = results.filter(s => s.complexity === filters.complexity);
    }

    if (filters.products && filters.products.length > 0) {
      results = results.filter(s => 
        s.panwProducts.some(p => filters.products!.includes(p.product))
      );
    }

    if (filters.businessValue && filters.businessValue.length > 0) {
      results = results.filter(s => 
        filters.businessValue!.includes(s.businessValue.primaryValue) ||
        s.businessValue.secondaryValues.some(v => filters.businessValue!.includes(v))
      );
    }

    if (filters.useCases && filters.useCases.length > 0) {
      results = results.filter(s => 
        s.useCases.some(uc => filters.useCases!.includes(uc))
      );
    }

    if (filters.businessImpact) {
      results = results.filter(s => s.businessValue.businessImpact >= filters.businessImpact!);
    }

    if (filters.provider) {
      results = results.filter(s => s.providers.includes(filters.provider as any));
    }

    return results;
  }

  /**
   * Get all scenarios
   */
  getAll(): EnhancedScenarioConfig[] {
    return Array.from(this.scenarios.values());
  }

  /**
   * Get scenario by ID
   */
  getById(id: string): EnhancedScenarioConfig | undefined {
    return this.scenarios.get(id);
  }

  /**
   * Check if provider is supported for scenario
   */
  supportsProvider(scenarioId: string, provider: string): boolean {
    const scenario = this.scenarios.get(scenarioId);
    return scenario ? scenario.providers.includes(provider as any) : false;
  }

  /**
   * Get business impact summary
   */
  getBusinessImpactSummary(): {
    highImpact: number;
    mediumImpact: number;
    lowImpact: number;
    byValue: Record<BusinessValueTag, number>;
  } {
    const scenarios = this.getAll();
    const summary = {
      highImpact: 0,
      mediumImpact: 0,
      lowImpact: 0,
      byValue: {} as Record<BusinessValueTag, number>
    };

    scenarios.forEach(scenario => {
      const impact = scenario.businessValue.businessImpact;
      if (impact >= 4) summary.highImpact++;
      else if (impact >= 2) summary.mediumImpact++;
      else summary.lowImpact++;

      // Count by business value
      const value = scenario.businessValue.primaryValue;
      summary.byValue[value] = (summary.byValue[value] || 0) + 1;
    });

    return summary;
  }

  private initializeScenarios(): void {
    // Initialize with enhanced scenario definitions
    const scenarios: EnhancedScenarioConfig[] = [
      {
        id: 'cloud-posture-misconfigured-s3',
        name: 'Cloud Security Posture - Misconfigured Storage',
        description: 'Validate CSPM detection of misconfigured cloud storage with real-world attack scenarios',
        version: '2.1.0',
        category: 'cloud-security',
        subcategory: 'storage-security',
        complexity: 'intermediate',
        businessValue: {
          primaryValue: 'risk-mitigation',
          secondaryValues: ['compliance-automation', 'cloud-security-posture'],
          businessImpact: 4,
          roiTimeframe: '1-3 months',
          quantifiableMetrics: [
            'Data breach risk reduction: 85%',
            'Compliance violation prevention: 90%',
            'Security posture score improvement: +40 points'
          ]
        },
        useCases: ['security-validation', 'compliance-testing', 'pov-technical-validation'],
        targetAudience: ['technical', 'security-team'],
        panwProducts: [
          {
            product: 'prisma-cloud',
            role: 'primary',
            capabilities: ['detection', 'prevention', 'compliance-monitoring'],
            configurationRequired: true,
            notes: 'Requires CSPM module activation'
          },
          {
            product: 'cortex-xsiam',
            role: 'secondary',
            capabilities: ['alert-correlation', 'incident-response'],
            configurationRequired: false
          }
        ],
        mitreTechniques: [
          {
            id: 'T1580',
            name: 'Cloud Infrastructure Discovery',
            tactic: 'Discovery',
            description: 'Adversaries may attempt to discover infrastructure and resources available within cloud environments'
          },
          {
            id: 'T1526',
            name: 'Cloud Service Discovery',
            tactic: 'Discovery', 
            description: 'Adversaries may attempt to enumerate the cloud services running on a system'
          }
        ],
        estimatedDuration: {
          setup: 15,
          execution: 30,
          analysis: 20
        },
        providers: ['gcp', 'aws', 'azure'],
        prerequisites: [
          'Cloud provider access',
          'Prisma Cloud tenant',
          'Basic understanding of cloud storage'
        ],
        automationLevel: 'semi-automated',
        scalability: 'enterprise',
        resources: {
          documentation: ['cloud-storage-security-guide.md', 'prisma-cloud-setup.md'],
          scripts: ['deploy-misconfigured-storage.sh', 'generate-test-data.py'],
          datasets: ['sample-sensitive-data.json'],
          templates: ['terraform-vulnerable-storage.tf']
        },
        successMetrics: {
          technical: [
            'Detection alerts generated within 5 minutes',
            'Zero false positives on legitimate configurations',
            'Complete remediation guidance provided'
          ],
          business: [
            'Security team confidence in cloud detection capabilities',
            'Compliance readiness demonstrated',
            'Executive stakeholder approval for deployment'
          ]
        },
        tags: ['cloud', 'storage', 'misconfiguration', 'cspm', 'compliance'],
        lastUpdated: '2024-01-15T10:00:00Z',
        createdBy: 'security-engineering-team',
        validated: true,
        customerFeedback: {
          rating: 4.7,
          comments: [
            'Excellent demonstration of Prisma Cloud capabilities',
            'Very realistic scenario that resonated with our security team'
          ]
        }
      }
      // Additional scenarios would be defined here...
    ];

    scenarios.forEach(scenario => this.register(scenario));
  }

  private updateIndexes(scenario: EnhancedScenarioConfig): void {
    // Update category index
    const categoryScenarios = this.categoryIndex.get(scenario.category) || [];
    categoryScenarios.push(scenario.id);
    this.categoryIndex.set(scenario.category, categoryScenarios);

    // Update product index
    scenario.panwProducts.forEach(integration => {
      const productScenarios = this.productIndex.get(integration.product) || [];
      productScenarios.push(scenario.id);
      this.productIndex.set(integration.product, productScenarios);
    });

    // Update business value index
    const primaryValueScenarios = this.businessValueIndex.get(scenario.businessValue.primaryValue) || [];
    primaryValueScenarios.push(scenario.id);
    this.businessValueIndex.set(scenario.businessValue.primaryValue, primaryValueScenarios);

    scenario.businessValue.secondaryValues.forEach(value => {
      const valueScenarios = this.businessValueIndex.get(value) || [];
      valueScenarios.push(scenario.id);
      this.businessValueIndex.set(value, valueScenarios);
    });

    // Update MITRE index
    scenario.mitreTechniques.forEach(technique => {
      const techniqueScenarios = this.mitreIndex.get(technique.id) || [];
      techniqueScenarios.push(scenario.id);
      this.mitreIndex.set(technique.id, techniqueScenarios);
    });
  }

  private buildIndexes(): void {
    // Indexes are built incrementally via updateIndexes
  }
}

// Global registry instance
export const scenarioRegistry = new ScenarioRegistry();

// Export utility functions
export function getScenariosByProduct(product: PANWProduct) {
  return scenarioRegistry.getByProduct(product);
}

export function getScenariosByBusinessValue(value: BusinessValueTag) {
  return scenarioRegistry.getByBusinessValue(value);
}

export function filterScenarios(filters: Parameters<typeof scenarioRegistry.filter>[0]) {
  return scenarioRegistry.filter(filters);
}