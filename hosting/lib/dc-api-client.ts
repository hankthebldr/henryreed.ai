/**
 * Domain Consultant API Client
 * Comprehensive API layer for all DC workflows and operations
 */

import { dcContextStore, CustomerEngagement, ActivePOV as POVRecord, TRRRecord, WorkflowHistory as WorkflowHistoryEntry } from './dc-context-store';
import { dcAIClient, DCWorkflowContext } from './dc-ai-client';
import { SolutionDesignWorkbook, SDWExportConfiguration } from './sdw-models';

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

export interface DCMetrics {
  customers: {
    active: number;
    total: number;
    byIndustry: Record<string, number>;
    byMaturity: Record<string, number>;
  };
  povs: {
    active: number;
    completed: number;
    successRate: number;
    avgDuration: number;
  };
  trrs: {
    total: number;
    validated: number;
    pending: number;
    completionRate: number;
  };
  performance: {
    weeklyVelocity: number;
    monthlyClosures: number;
    avgTimeToClose: number;
  };
}

export interface XSIAMHealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    dataIngestion: 'healthy' | 'warning' | 'critical';
    correlationEngine: 'healthy' | 'warning' | 'critical';
    apiGateway: 'healthy' | 'warning' | 'critical';
    dataLake: 'healthy' | 'warning' | 'critical';
  };
  metrics: {
    eventsPerSecond: number;
    alertsGenerated: number;
    responseTime: number;
    uptime: number;
  };
  recommendations: string[];
  lastChecked: string;
}

export interface DataExportConfig {
  scope: 'all' | 'customer' | 'timeframe' | 'type';
  filters: {
    customerId?: string;
    startDate?: string;
    endDate?: string;
    dataTypes?: string[];
  };
  format: 'json' | 'csv' | 'excel' | 'bigquery';
  includeMetadata: boolean;
}

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  category: 'research' | 'capability' | 'workflow' | 'troubleshooting' | 'best-practice';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
  searchable: boolean;
}

/**
 * Main DC API Client
 */
export class DCAPIClient {
  private baseUrl: string;
  private apiKey?: string;
  private sdwStorage: Record<string, SolutionDesignWorkbook> = {};
  
  constructor(baseUrl: string = '/api/dc', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.error || 'Request failed',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    }
  }

  // Customer Management
  async getCustomers(): Promise<APIResponse<CustomerEngagement[]>> {
    // For now, use local store with API-like response structure
    return {
      success: true,
      data: dcContextStore.getAllCustomerEngagements(),
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  async createCustomer(customer: Omit<CustomerEngagement, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<CustomerEngagement>> {
    const newCustomer: CustomerEngagement = {
      ...customer,
      id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dcContextStore.addCustomerEngagement(newCustomer);
    
    return {
      success: true,
      data: newCustomer,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  async updateCustomer(id: string, updates: Partial<CustomerEngagement>): Promise<APIResponse<CustomerEngagement>> {
    dcContextStore.updateCustomerEngagement(id, updates);
    const updated = dcContextStore.getCustomerEngagement(id);
    
    return {
      success: !!updated,
      data: updated,
      error: updated ? undefined : 'Customer not found',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  // POV Management
  async getPOVs(customerId?: string): Promise<APIResponse<POVRecord[]>> {
    const povs = customerId 
      ? dcContextStore.getAllActivePOVs().filter(p => p.customerId === customerId)
      : dcContextStore.getAllActivePOVs();

    return {
      success: true,
      data: povs,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  async createPOV(pov: Omit<POVRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<POVRecord>> {
    const newPOV: POVRecord = {
      ...pov,
      id: `pov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dcContextStore.addActivePOV(newPOV);
    
    return {
      success: true,
      data: newPOV,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  async updatePOV(id: string, updates: Partial<POVRecord>): Promise<APIResponse<POVRecord>> {
    dcContextStore.updateActivePOV(id, updates);
    const updated = dcContextStore.getActivePOV(id);
    
    return {
      success: !!updated,
      data: updated,
      error: updated ? undefined : 'POV not found',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  // TRR Management
  async getTRRs(filters?: { customerId?: string; povId?: string; status?: string }): Promise<APIResponse<TRRRecord[]>> {
    let trrs = dcContextStore.getAllTRRRecords();
    
    if (filters) {
      if (filters.customerId) trrs = trrs.filter(t => t.customerId === filters.customerId);
      if (filters.povId) trrs = trrs.filter(t => t.povId === filters.povId);
      if (filters.status) trrs = trrs.filter(t => t.status === filters.status);
    }

    return {
      success: true,
      data: trrs,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  async createTRR(trr: Omit<TRRRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<TRRRecord>> {
    const newTRR: TRRRecord = {
      ...trr,
      id: `trr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dcContextStore.addTRRRecord(newTRR);
    
    return {
      success: true,
      data: newTRR,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  async updateTRR(id: string, updates: Partial<TRRRecord>): Promise<APIResponse<TRRRecord>> {
    dcContextStore.updateTRRRecord(id, updates);
    const updated = dcContextStore.getTRRRecord(id);
    
    return {
      success: !!updated,
      data: updated,
      error: updated ? undefined : 'TRR not found',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  async validateTRR(id: string, evidence?: string[]): Promise<APIResponse<TRRRecord>> {
    const trr = dcContextStore.getTRRRecord(id);
    if (!trr) {
      return {
        success: false,
        error: 'TRR not found',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_local`
      };
    }

    const updates: Partial<TRRRecord> = {
      status: 'validated',
      timeline: {
        ...trr.timeline,
        actualValidation: new Date().toISOString()
      },
      validationEvidence: evidence || trr.validationEvidence
    };

    dcContextStore.updateTRRRecord(id, updates);
    const updated = dcContextStore.getTRRRecord(id);
    
    return {
      success: true,
      data: updated!,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  // Metrics and Analytics
  async getMetrics(): Promise<APIResponse<DCMetrics>> {
    const customers = dcContextStore.getAllCustomerEngagements();
    const povs = dcContextStore.getAllActivePOVs();
    const trrs = dcContextStore.getAllTRRRecords();

    const metrics: DCMetrics = {
      customers: {
        active: customers.length,
        total: customers.length,
        byIndustry: customers.reduce((acc, c) => {
          acc[c.industry] = (acc[c.industry] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byMaturity: customers.reduce((acc, c) => {
          acc[c.maturityLevel] = (acc[c.maturityLevel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      povs: {
        active: povs.filter(p => p.status === 'executing').length,
        completed: povs.filter(p => p.status === 'completed').length,
        successRate: povs.length > 0 ? (povs.filter(p => p.status === 'completed' && p.outcomes.technicalWins.length > 0).length / povs.length) * 100 : 0,
        avgDuration: 30 // Mock calculation
      },
      trrs: {
        total: trrs.length,
        validated: trrs.filter(t => t.status === 'validated').length,
        pending: trrs.filter(t => t.status === 'pending').length,
        completionRate: trrs.length > 0 ? (trrs.filter(t => t.status === 'validated').length / trrs.length) * 100 : 0
      },
      performance: {
        weeklyVelocity: Math.round(trrs.filter(t => t.status === 'validated').length / 4), // Mock calculation
        monthlyClosures: povs.filter(p => p.status === 'completed').length,
        avgTimeToClose: 45 // Mock calculation
      }
    };

    return {
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  // XSIAM Health Checks
  async getXSIAMHealth(customerId?: string): Promise<APIResponse<XSIAMHealthStatus>> {
    // Mock XSIAM health data - in production, this would connect to real XSIAM APIs
    const healthStatus: XSIAMHealthStatus = {
      overall: 'healthy',
      components: {
        dataIngestion: 'healthy',
        correlationEngine: 'warning',
        apiGateway: 'healthy',
        dataLake: 'healthy'
      },
      metrics: {
        eventsPerSecond: 12500,
        alertsGenerated: 45,
        responseTime: 250,
        uptime: 99.9
      },
      recommendations: [
        'Consider increasing correlation engine resources',
        'Review alert tuning for reduced false positives',
        'Optimize data retention policies'
      ],
      lastChecked: new Date().toISOString()
    };

    return {
      success: true,
      data: healthStatus,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  // Data Export
  async exportData(config: DataExportConfig): Promise<APIResponse<{ downloadUrl: string; expiresAt: string }>> {
    // Mock export generation - in production, this would generate real exports
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      data: {
        downloadUrl: `/api/exports/${exportId}/download`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      },
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  // Knowledge Base
  async searchKnowledgeBase(query: string, category?: string): Promise<APIResponse<KnowledgeBaseEntry[]>> {
    // Mock knowledge base search - in production, this would use a real search engine
    const mockEntries: KnowledgeBaseEntry[] = [
      {
        id: 'kb_001',
        title: 'TRR Validation Best Practices',
        content: 'Comprehensive guide to technical risk review validation processes...',
        category: 'best-practice',
        tags: ['trr', 'validation', 'best-practices'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'DC Team',
        searchable: true
      },
      {
        id: 'kb_002',
        title: 'POV Scenario Planning Framework',
        content: 'Step-by-step framework for effective POV scenario planning...',
        category: 'workflow',
        tags: ['pov', 'scenarios', 'planning'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'DC Team',
        searchable: true
      }
    ];

    const filtered = category 
      ? mockEntries.filter(e => e.category === category)
      : mockEntries;

    return {
      success: true,
      data: filtered,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  // AI Integration
  async getAIRecommendations(context: DCWorkflowContext): Promise<APIResponse<string[]>> {
    try {
      const recommendations = await dcAIClient.getWorkflowGuidance('Generate recommendations', context);
      return {
        success: true,
        data: recommendations,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_local`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI recommendation failed',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_local`
      };
    }
  }

  // Workflow History
  async getWorkflowHistory(filters?: { customerId?: string; workflowType?: string }): Promise<APIResponse<WorkflowHistoryEntry[]>> {
    let history = dcContextStore.getWorkflowHistory();
    
    if (filters) {
      if (filters.customerId) {
        history = history.filter(h => h.context.includes(filters.customerId!));
      }
      if (filters.workflowType) {
        history = history.filter(h => h.action.toLowerCase().includes(filters.workflowType!.toLowerCase()));
      }
    }

    return {
      success: true,
      data: history,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  // Solution Design Workbook Management
  async getSDWs(trrId?: string): Promise<APIResponse<SolutionDesignWorkbook[]>> {
    const sdws = Object.values(this.sdwStorage);
    const filtered = trrId ? sdws.filter(sdw => sdw.trrId === trrId) : sdws;
    
    return {
      success: true,
      data: filtered,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  async getSDW(id: string): Promise<APIResponse<SolutionDesignWorkbook>> {
    const sdw = this.sdwStorage[id];
    
    return {
      success: !!sdw,
      data: sdw,
      error: sdw ? undefined : 'SDW not found',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  async createSDW(sdw: Omit<SolutionDesignWorkbook, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<SolutionDesignWorkbook>> {
    const newSDW: SolutionDesignWorkbook = {
      ...sdw,
      id: `sdw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.sdwStorage[newSDW.id] = newSDW;
    
    return {
      success: true,
      data: newSDW,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  async updateSDW(id: string, updates: Partial<SolutionDesignWorkbook>): Promise<APIResponse<SolutionDesignWorkbook>> {
    const existingSDW = this.sdwStorage[id];
    if (!existingSDW) {
      return {
        success: false,
        error: 'SDW not found',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_local`
      };
    }

    const updatedSDW: SolutionDesignWorkbook = {
      ...existingSDW,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.sdwStorage[id] = updatedSDW;
    
    return {
      success: true,
      data: updatedSDW,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  async validateSDW(id: string): Promise<APIResponse<{ isValid: boolean; errors: string[]; warnings: string[] }>> {
    const sdw = this.sdwStorage[id];
    if (!sdw) {
      return {
        success: false,
        error: 'SDW not found',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_local`
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation rules
    if (!sdw.customerEnvironment?.customerName) errors.push('Customer name is required');
    if (!sdw.customerEnvironment?.industry) errors.push('Industry is required');
    if (!sdw.dataSources?.length) errors.push('At least one data source is required');
    if (!sdw.technicalSpecifications?.deploymentModel) errors.push('Deployment model is required');

    // Volume validation
    if (sdw.dataSources?.length) {
      const totalDailyEvents = sdw.dataSources.reduce((sum, ds) => sum + ds.dailyVolume.events, 0);
      if (totalDailyEvents > 10000000) warnings.push('Very high event volume may require additional infrastructure planning');
      if (totalDailyEvents < 1000) warnings.push('Low event volume - consider starter tier for cost optimization');
    }

    // Security warnings
    if (!sdw.technicalSpecifications?.securitySettings?.encryption?.atRest) {
      warnings.push('Encryption at rest is recommended for sensitive data');
    }
    if (!sdw.technicalSpecifications?.securitySettings?.accessControl?.mfa) {
      warnings.push('Multi-factor authentication is recommended');
    }

    const isValid = errors.length === 0;

    // Update SDW validation results
    await this.updateSDW(id, {
      validationResults: {
        isValid,
        errors,
        warnings,
        lastValidated: new Date().toISOString()
      }
    });

    return {
      success: true,
      data: { isValid, errors, warnings },
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  async exportSDW(id: string, config: SDWExportConfiguration): Promise<APIResponse<{ downloadUrl: string; filename: string }>> {
    const sdw = this.sdwStorage[id];
    if (!sdw) {
      return {
        success: false,
        error: 'SDW not found',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_local`
      };
    }

    // In a real implementation, this would generate actual files
    const filename = `SDW_${sdw.customerEnvironment?.customerName?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${config.format}`;
    
    return {
      success: true,
      data: {
        downloadUrl: `/api/exports/sdw/${id}/${config.format}`,
        filename
      },
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  async approveSDW(id: string, approverComments?: string): Promise<APIResponse<SolutionDesignWorkbook>> {
    const sdw = this.sdwStorage[id];
    if (!sdw) {
      return {
        success: false,
        error: 'SDW not found',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_local`
      };
    }

    const updates: Partial<SolutionDesignWorkbook> = {
      status: 'approved',
      approvalWorkflow: [
        ...sdw.approvalWorkflow,
        {
          step: 'Final Approval',
          approver: 'Technical Lead',
          status: 'approved',
          comments: approverComments,
          timestamp: new Date().toISOString()
        }
      ]
    };

    return this.updateSDW(id, updates);
  }
}

// Export singleton instance
export const dcAPIClient = new DCAPIClient();

// Utility functions for common operations
export const DCOperations = {
  async initializeCustomerPOV(customerData: Omit<CustomerEngagement, 'id' | 'createdAt' | 'updatedAt'>) {
    const customerResponse = await dcAPIClient.createCustomer(customerData);
    if (!customerResponse.success || !customerResponse.data) {
      throw new Error(customerResponse.error || 'Failed to create customer');
    }

    const povData: Omit<POVRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      customerId: customerResponse.data.id,
      name: `${customerData.name} Security POV`,
      status: 'planning',
      objectives: customerData.primaryConcerns.map(concern => `Address ${concern} requirements`),
      scenarios: [],
      timeline: {
        planned: new Date().toISOString(),
        actual: undefined,
        milestones: []
      },
      successMetrics: [],
      resources: {
        dcHours: 40,
        seHours: 20,
        infrastructure: []
      },
      outcomes: {
        technicalWins: [],
        businessImpact: [],
        lessonsLearned: []
      },
      nextSteps: []
    };

    const povResponse = await dcAPIClient.createPOV(povData);
    if (!povResponse.success) {
      throw new Error(povResponse.error || 'Failed to create POV');
    }

    return {
      customer: customerResponse.data,
      pov: povResponse.data!
    };
  },

  async generateTRRSet(customerId: string, povId: string, scenarios: string[]) {
    const trrPromises = scenarios.map(async (scenario, index) => {
      const trrData: Omit<TRRRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        customerId,
        povId,
        title: `${scenario} Validation`,
        category: 'Technical Validation',
        priority: index === 0 ? 'high' : 'medium',
        status: 'pending',
        description: `Technical requirements validation for ${scenario}`,
        acceptanceCriteria: [`Validate ${scenario}`, 'Document findings', 'Obtain stakeholder approval'],
        validationMethod: 'Technical review and testing',
        validationEvidence: [],
        assignedTo: 'Domain Consultant',
        reviewers: ['Technical Lead'],
        timeline: {
          created: new Date().toISOString(),
          targetValidation: new Date(Date.now() + (7 + index * 3) * 24 * 60 * 60 * 1000).toISOString(),
          actualValidation: undefined
        },
        dependencies: [],
        riskLevel: 'low',
        businessImpact: 'Validates technical capability',
        customerStakeholder: 'Technical Team',
        notes: []
      };

      return dcAPIClient.createTRR(trrData);
    });

    const results = await Promise.all(trrPromises);
    return results.map(r => r.data).filter(Boolean);
  }
};