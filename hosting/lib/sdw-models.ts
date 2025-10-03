/**
 * Solution Design Workbook (SDW) Data Models
 * Comprehensive data structures for solution design and sizing calculations
 */

export interface CustomerEnvironment {
  // Basic Information
  customerName: string;
  industry: string;
  region: string;
  timezone: string;
  
  // Organization Structure
  totalEmployees: number;
  itStaff: number;
  securityTeamSize: number;
  
  // Infrastructure Overview
  onPremiseServers: number;
  cloudProviders: ('AWS' | 'Azure' | 'GCP' | 'Multi-Cloud')[];
  networkSegments: number;
  remoteWorkers: number;
  
  // Compliance Requirements
  complianceFrameworks: string[];
  dataResidencyRequirements: string[];
  retentionPolicies: {
    logs: string;
    incidents: string;
    forensics: string;
  };
}

export interface DataSourceConfiguration {
  id: string;
  name: string;
  type: 'siem' | 'edr' | 'network' | 'cloud' | 'identity' | 'email' | 'web' | 'database' | 'application' | 'other';
  vendor: string;
  version?: string;
  
  // Volume and Performance
  dailyVolume: {
    events: number;
    size: string; // e.g., "10 GB", "500 MB"
    unit: 'GB' | 'MB' | 'TB';
  };
  
  peakVolume: {
    events: number;
    multiplier: number; // Peak vs average
  };
  
  // Integration Details
  integrationMethod: 'api' | 'syslog' | 'file' | 'database' | 'agent' | 'webhook';
  protocol: string;
  port?: number;
  authentication: 'api-key' | 'oauth' | 'certificate' | 'username-password' | 'none';
  
  // Data Classification
  dataTypes: string[];
  sensitivityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  
  // Processing Requirements
  realTimeRequired: boolean;
  batchProcessing: boolean;
  transformationNeeded: boolean;
  enrichmentRequired: boolean;
  
  // Status and Notes
  status: 'planned' | 'configured' | 'testing' | 'active' | 'issues';
  notes: string;
}

export interface SizingCalculations {
  // Data Ingestion
  totalDailyIngestion: {
    events: number;
    sizeGB: number;
  };
  
  totalMonthlyIngestion: {
    events: number;
    sizeGB: number;
  };
  
  peakIngestionRate: {
    eventsPerSecond: number;
    mbPerSecond: number;
  };
  
  // Storage Requirements
  hotStorage: {
    period: string; // e.g., "30 days"
    sizeGB: number;
  };
  
  warmStorage: {
    period: string; // e.g., "1 year"
    sizeGB: number;
  };
  
  coldStorage: {
    period: string; // e.g., "7 years"
    sizeGB: number;
  };
  
  totalStorageGB: number;
  
  // Performance Requirements
  searchPerformance: {
    averageQueryTime: string;
    concurrentUsers: number;
    dashboardRefreshRate: string;
  };
  
  // Capacity Planning
  growthProjection: {
    yearOverYearGrowth: number; // percentage
    projectedSize3Years: number;
  };
  
  // Resource Allocation
  recommendedConfiguration: {
    tier: 'starter' | 'professional' | 'enterprise' | 'custom';
    specifications: string[];
    estimatedCost: {
      monthly: number;
      annual: number;
      currency: string;
    };
  };
}

export interface TechnicalSpecifications {
  // Architecture Overview
  deploymentModel: 'cloud' | 'hybrid' | 'on-premise';
  architecture: 'single-tenant' | 'multi-tenant' | 'distributed';
  
  // Network Requirements
  networkRequirements: {
    bandwidth: string;
    latency: string;
    ports: number[];
    firewallRules: string[];
  };
  
  // Security Configuration
  securitySettings: {
    encryption: {
      inTransit: boolean;
      atRest: boolean;
      keyManagement: string;
    };
    
    accessControl: {
      sso: boolean;
      mfa: boolean;
      rbac: boolean;
      customRoles: string[];
    };
    
    monitoring: {
      auditLogging: boolean;
      alerting: boolean;
      dashboards: string[];
    };
  };
  
  // Integration Points
  integrations: {
    existingSystems: string[];
    apiEndpoints: string[];
    webhooks: string[];
    customConnectors: string[];
  };
  
  // Performance Tuning
  performanceOptimization: {
    indexingStrategy: string;
    queryOptimization: string[];
    cachingStrategy: string;
    loadBalancing: string;
  };
  
  // Backup and Recovery
  backupStrategy: {
    frequency: string;
    retentionPeriod: string;
    recoveryTime: string;
    recoveryPoint: string;
  };
  
  // Maintenance
  maintenanceWindows: {
    preferred: string;
    blackoutPeriods: string[];
    updateStrategy: 'automatic' | 'manual' | 'scheduled';
  };
}

export interface ImplementationPlan {
  // Project Timeline
  phases: {
    id: string;
    name: string;
    description: string;
    duration: number; // days
    startDate?: string;
    endDate?: string;
    dependencies: string[];
    deliverables: string[];
    resources: string[];
    status: 'planned' | 'in-progress' | 'completed' | 'blocked';
  }[];
  
  // Resource Requirements
  resourcePlan: {
    roles: {
      role: string;
      hours: number;
      skillLevel: 'junior' | 'mid' | 'senior' | 'expert';
    }[];
    
    timeline: {
      phase: string;
      weeks: number;
      effort: string;
    }[];
  };
  
  // Risk Assessment
  risks: {
    id: string;
    description: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
    owner: string;
  }[];
  
  // Success Criteria
  successCriteria: {
    technical: string[];
    business: string[];
    performance: string[];
    security: string[];
  };
  
  // Testing Strategy
  testingPlan: {
    unitTesting: string[];
    integrationTesting: string[];
    performanceTesting: string[];
    securityTesting: string[];
    userAcceptanceTesting: string[];
  };
}

export interface SDWValidationRules {
  required: string[];
  dataVolumeLimits: {
    minEventsPerDay: number;
    maxEventsPerDay: number;
    maxStorageGB: number;
  };
  performanceThresholds: {
    maxQueryTime: number;
    minConcurrentUsers: number;
  };
  securityRequirements: string[];
}

export interface SDWExportConfiguration {
  includeCharts: boolean;
  includeRawData: boolean;
  format: 'pdf' | 'excel' | 'word' | 'json';
  sections: string[];
  customization: {
    logo?: string;
    headerText?: string;
    footerText?: string;
    colorScheme?: string;
  };
}

export interface SolutionDesignWorkbook {
  // Metadata
  id: string;
  trrId: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
  
  // Status and Workflow
  status: 'draft' | 'in-review' | 'approved' | 'rejected' | 'implemented';
  approvalWorkflow: {
    step: string;
    approver: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    timestamp?: string;
  }[];
  
  // Core SDW Content
  customerEnvironment: CustomerEnvironment;
  dataSources: DataSourceConfiguration[];
  sizingCalculations: SizingCalculations;
  technicalSpecifications: TechnicalSpecifications;
  implementationPlan: ImplementationPlan;
  
  // Validation and Quality
  validationResults: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    lastValidated: string;
  };
  
  // Documentation and Notes
  executiveSummary: string;
  technicalNotes: string[];
  assumptions: string[];
  constraints: string[];
  dependencies: string[];
  
  // Attachments and References
  attachments: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }[];
  
  references: {
    type: 'document' | 'url' | 'specification';
    title: string;
    location: string;
  }[];
}

// Utility Types
export type SDWSection = 'customer' | 'dataSources' | 'sizing' | 'technical' | 'implementation' | 'review';

export interface SDWTemplate {
  id: string;
  name: string;
  description: string;
  industry?: string;
  useCase?: string;
  template: Partial<SolutionDesignWorkbook>;
  isActive: boolean;
  createdAt: string;
}

export interface SDWCalculator {
  calculateTotalIngestion(dataSources: DataSourceConfiguration[]): {
    dailyEvents: number;
    dailyGB: number;
    monthlyGB: number;
  };
  
  calculateStorageRequirements(ingestion: any, retentionPolicies: any): {
    hotGB: number;
    warmGB: number;
    coldGB: number;
    totalGB: number;
  };
  
  calculatePerformanceRequirements(totalEvents: number, users: number): {
    recommendedTier: string;
    specifications: string[];
  };
  
  validateConfiguration(sdw: SolutionDesignWorkbook): SDWValidationRules;
  
  generateRecommendations(sdw: SolutionDesignWorkbook): string[];
}

// Export default calculator implementation
export const sdwCalculator: SDWCalculator = {
  calculateTotalIngestion(dataSources: DataSourceConfiguration[]) {
    const dailyEvents = dataSources.reduce((sum, ds) => sum + ds.dailyVolume.events, 0);
    const dailyGB = dataSources.reduce((sum, ds) => {
      const sizeInGB = ds.dailyVolume.unit === 'GB' ? parseFloat(ds.dailyVolume.size) :
                       ds.dailyVolume.unit === 'MB' ? parseFloat(ds.dailyVolume.size) / 1024 :
                       ds.dailyVolume.unit === 'TB' ? parseFloat(ds.dailyVolume.size) * 1024 : 0;
      return sum + sizeInGB;
    }, 0);
    
    return {
      dailyEvents,
      dailyGB: Math.round(dailyGB * 100) / 100,
      monthlyGB: Math.round(dailyGB * 30 * 100) / 100
    };
  },
  
  calculateStorageRequirements(ingestion: any, retentionPolicies: any) {
    // Simplified calculation - in production, this would be more sophisticated
    const monthlyGB = ingestion.monthlyGB;
    
    return {
      hotGB: monthlyGB, // 30 days hot
      warmGB: monthlyGB * 11, // 11 months warm (1 year total - 30 days hot)
      coldGB: monthlyGB * 72, // 6 years cold (7 years total - 1 year hot+warm)
      totalGB: monthlyGB * 84 // Total for 7 years
    };
  },
  
  calculatePerformanceRequirements(totalEvents: number, users: number) {
    if (totalEvents < 100000 && users < 10) {
      return {
        recommendedTier: 'starter',
        specifications: ['2 CPU cores', '8GB RAM', '100GB SSD']
      };
    } else if (totalEvents < 1000000 && users < 50) {
      return {
        recommendedTier: 'professional',
        specifications: ['4 CPU cores', '16GB RAM', '500GB SSD']
      };
    } else {
      return {
        recommendedTier: 'enterprise',
        specifications: ['8+ CPU cores', '32GB+ RAM', '1TB+ SSD', 'Load balancing']
      };
    }
  },
  
  validateConfiguration(sdw: SolutionDesignWorkbook) {
    return {
      required: ['customerEnvironment', 'dataSources', 'sizingCalculations'],
      dataVolumeLimits: {
        minEventsPerDay: 1000,
        maxEventsPerDay: 10000000,
        maxStorageGB: 100000
      },
      performanceThresholds: {
        maxQueryTime: 30,
        minConcurrentUsers: 1
      },
      securityRequirements: ['encryption', 'authentication', 'audit-logging']
    };
  },
  
  generateRecommendations(sdw: SolutionDesignWorkbook) {
    const recommendations: string[] = [];
    
    // Data volume recommendations
    if (sdw.sizingCalculations.totalDailyIngestion.sizeGB > 100) {
      recommendations.push('Consider implementing data compression and archiving strategies');
    }
    
    // Performance recommendations
    if (sdw.sizingCalculations.peakIngestionRate.eventsPerSecond > 10000) {
      recommendations.push('Implement load balancing and horizontal scaling');
    }
    
    // Security recommendations
    if (!sdw.technicalSpecifications.securitySettings.encryption.atRest) {
      recommendations.push('Enable encryption at rest for sensitive data');
    }
    
    return recommendations;
  }
};