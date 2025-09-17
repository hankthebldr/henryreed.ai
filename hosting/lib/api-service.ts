/**
 * Comprehensive API Service Layer
 * Provides standardized API endpoints for both internal components and external systems
 */

import { fetchAnalytics } from './data-service';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
  version: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface POVData {
  id: string;
  name: string;
  customer: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  scenarios: string[];
  tags: string[];
  metadata: Record<string, any>;
}

export interface TRRData {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'validated' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  createdAt: string;
  updatedAt: string;
  blockchain_hash?: string;
  metadata: Record<string, any>;
}

export interface ScenarioData {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'deployed' | 'archived';
  mitre_techniques: string[];
  cloud_providers: string[];
  resources: Record<string, any>;
  metadata: Record<string, any>;
}

export interface AnalyticsData {
  region: string;
  theatre: string;
  user: string;
  engagements: number;
  povs_completed: number;
  trr_win_rate: number;
  avg_cycle_days: number;
  kpis: Record<string, number>;
  timestamp: string;
}

// Mock data for demonstration
const mockPOVs: POVData[] = [
  {
    id: 'POV-001',
    name: 'Enterprise Banking Security Assessment',
    customer: 'Global Bank Corp',
    status: 'in_progress',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    scenarios: ['ransomware-defense', 'cloud-posture'],
    tags: ['banking', 'enterprise', 'multi-cloud'],
    metadata: { priority: 'high', estimated_duration: '90d' }
  },
  {
    id: 'POV-002',
    name: 'Healthcare SIEM Integration',
    customer: 'MedTech Solutions',
    status: 'completed',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-25T16:45:00Z',
    scenarios: ['compliance-audit', 'threat-hunting'],
    tags: ['healthcare', 'compliance', 'HIPAA'],
    metadata: { priority: 'medium', estimated_duration: '60d' }
  }
];

const mockTRRs: TRRData[] = [
  {
    id: 'TRR-2024-001',
    title: 'Multi-Cloud Security Assessment',
    status: 'validated',
    priority: 'high',
    assignee: 'john.smith@company.com',
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-18T14:20:00Z',
    blockchain_hash: '0x7d4a...f2e9',
    metadata: { customer: 'Global Bank Corp', estimated_effort: '40h' }
  },
  {
    id: 'TRR-2024-002',
    title: 'Zero Trust Architecture Review',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'sarah.johnson@company.com',
    createdAt: '2024-01-15T13:00:00Z',
    updatedAt: '2024-01-20T10:15:00Z',
    metadata: { customer: 'MedTech Solutions', estimated_effort: '32h' }
  }
];

const mockScenarios: ScenarioData[] = [
  {
    id: 'SC-001',
    name: 'Ransomware Defense Chain',
    type: 'threat-simulation',
    status: 'deployed',
    mitre_techniques: ['T1486', 'T1055', 'T1021.001'],
    cloud_providers: ['AWS', 'Azure'],
    resources: { k8s_deployments: 3, cloud_functions: 7, data_stores: 2 },
    metadata: { complexity: 'advanced', duration_hours: 4 }
  },
  {
    id: 'SC-002',
    name: 'Cloud Posture Assessment',
    type: 'compliance-check',
    status: 'available',
    mitre_techniques: ['T1078', 'T1087'],
    cloud_providers: ['GCP', 'AWS'],
    resources: { compliance_checks: 45, policy_validations: 23 },
    metadata: { complexity: 'intermediate', duration_hours: 2 }
  }
];

class ApiService {
  private baseVersion = '1.0';
  
  private createResponse<T>(data: T, success: boolean = true, error?: string): ApiResponse<T> {
    return {
      success,
      data: success ? data : undefined,
      error: error || undefined,
      timestamp: Date.now(),
      version: this.baseVersion
    };
  }

  private createPaginatedResponse<T>(
    data: T[], 
    page: number = 1, 
    limit: number = 20,
    total?: number
  ): PaginatedResponse<T> {
    const actualTotal = total || data.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = data.slice(start, end);
    
    return {
      success: true,
      data: paginatedData,
      timestamp: Date.now(),
      version: this.baseVersion,
      pagination: {
        page,
        limit,
        total: actualTotal,
        hasMore: end < actualTotal
      }
    };
  }

  // POV API endpoints
  async getPOVs(options?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    customer?: string;
    tags?: string[];
  }): Promise<PaginatedResponse<POVData>> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    let filteredPOVs = [...mockPOVs];
    
    if (options?.status) {
      filteredPOVs = filteredPOVs.filter(pov => pov.status === options.status);
    }
    
    if (options?.customer) {
      filteredPOVs = filteredPOVs.filter(pov => 
        pov.customer.toLowerCase().includes(options.customer!.toLowerCase())
      );
    }
    
    if (options?.tags && options.tags.length > 0) {
      filteredPOVs = filteredPOVs.filter(pov => 
        options.tags!.some(tag => pov.tags.includes(tag))
      );
    }
    
    return this.createPaginatedResponse(
      filteredPOVs, 
      options?.page, 
      options?.limit
    );
  }

  async getPOV(id: string): Promise<ApiResponse<POVData>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const pov = mockPOVs.find(p => p.id === id);
    if (!pov) {
      return this.createResponse(null, false, `POV with ID ${id} not found`);
    }
    
    return this.createResponse(pov);
  }

  async createPOV(povData: Omit<POVData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<POVData>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPOV: POVData = {
      ...povData,
      id: `POV-${String(mockPOVs.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockPOVs.push(newPOV);
    return this.createResponse(newPOV);
  }

  async updatePOV(id: string, updates: Partial<POVData>): Promise<ApiResponse<POVData>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const povIndex = mockPOVs.findIndex(p => p.id === id);
    if (povIndex === -1) {
      return this.createResponse(null, false, `POV with ID ${id} not found`);
    }
    
    mockPOVs[povIndex] = {
      ...mockPOVs[povIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return this.createResponse(mockPOVs[povIndex]);
  }

  // TRR API endpoints
  async getTRRs(options?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    priority?: string;
    assignee?: string;
  }): Promise<PaginatedResponse<TRRData>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredTRRs = [...mockTRRs];
    
    if (options?.status) {
      filteredTRRs = filteredTRRs.filter(trr => trr.status === options.status);
    }
    
    if (options?.priority) {
      filteredTRRs = filteredTRRs.filter(trr => trr.priority === options.priority);
    }
    
    if (options?.assignee) {
      filteredTRRs = filteredTRRs.filter(trr => trr.assignee === options.assignee);
    }
    
    return this.createPaginatedResponse(
      filteredTRRs, 
      options?.page, 
      options?.limit
    );
  }

  async getTRR(id: string): Promise<ApiResponse<TRRData>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const trr = mockTRRs.find(t => t.id === id);
    if (!trr) {
      return this.createResponse(null, false, `TRR with ID ${id} not found`);
    }
    
    return this.createResponse(trr);
  }

  async createTRR(trrData: Omit<TRRData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<TRRData>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTRR: TRRData = {
      ...trrData,
      id: `TRR-2024-${String(mockTRRs.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockTRRs.push(newTRR);
    return this.createResponse(newTRR);
  }

  // Scenario API endpoints
  async getScenarios(options?: { 
    page?: number; 
    limit?: number; 
    type?: string; 
    status?: string;
    cloud_provider?: string;
  }): Promise<PaginatedResponse<ScenarioData>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredScenarios = [...mockScenarios];
    
    if (options?.type) {
      filteredScenarios = filteredScenarios.filter(sc => sc.type === options.type);
    }
    
    if (options?.status) {
      filteredScenarios = filteredScenarios.filter(sc => sc.status === options.status);
    }
    
    if (options?.cloud_provider) {
      filteredScenarios = filteredScenarios.filter(sc => 
        sc.cloud_providers.includes(options.cloud_provider!)
      );
    }
    
    return this.createPaginatedResponse(
      filteredScenarios, 
      options?.page, 
      options?.limit
    );
  }

  async deployScenario(id: string, config?: Record<string, any>): Promise<ApiResponse<{ deployment_id: string; status: string }>> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate deployment time
    
    const scenario = mockScenarios.find(s => s.id === id);
    if (!scenario) {
      return this.createResponse(null, false, `Scenario with ID ${id} not found`);
    }
    
    // Update scenario status
    scenario.status = 'deployed';
    scenario.metadata.last_deployed = new Date().toISOString();
    
    return this.createResponse({
      deployment_id: `DEP-${Date.now()}`,
      status: 'deployed',
      config: config || {}
    });
  }

  // Analytics API endpoints
  async getAnalytics(options?: {
    region?: string;
    theatre?: string;
    user?: string;
    sinceDays?: number;
  }): Promise<ApiResponse<AnalyticsData[]>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Use existing data service for analytics
    const analyticsData = await fetchAnalytics({
      region: options?.region || 'GLOBAL',
      theatre: options?.theatre || null,
      user: options?.user || null,
      sinceDays: options?.sinceDays || 90
    });
    
    // Transform the data to match our API format
    const transformedData: AnalyticsData[] = (analyticsData.records || []).map((record: any) => ({
      region: record.region || 'UNKNOWN',
      theatre: record.theatre || 'UNKNOWN',
      user: record.user || 'unknown',
      engagements: 1, // Each record represents one engagement
      povs_completed: record.completedAt ? 1 : 0,
      trr_win_rate: record.trrOutcome === 'win' ? 1 : 0,
      avg_cycle_days: record.cycleDays || 0,
      kpis: {
        customer_satisfaction: Math.random() * 0.3 + 0.7, // 0.7-1.0
        time_to_value: Math.random() * 20 + 20, // 20-40 days
        technical_depth: Math.random() * 0.4 + 0.6 // 0.6-1.0
      },
      timestamp: record.createdAt || new Date().toISOString()
    }));
    
    return this.createResponse(transformedData);
  }

  // Command execution endpoint for GUI-to-Terminal bridge
  async executeCommand(command: string, context?: Record<string, any>): Promise<ApiResponse<{
    command: string;
    output: string;
    exit_code: number;
    execution_time: number;
  }>> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); // Simulate command execution
    
    // Mock command execution
    const executionResult = {
      command,
      output: `Command "${command}" executed successfully.\nContext: ${JSON.stringify(context || {}, null, 2)}`,
      exit_code: 0,
      execution_time: Math.floor(Math.random() * 1000 + 100)
    };
    
    return this.createResponse(executionResult);
  }

  // Health check endpoint
  async healthCheck(): Promise<ApiResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, boolean>;
    uptime: number;
    version: string;
  }>> {
    return this.createResponse({
      status: 'healthy',
      services: {
        database: true,
        external_apis: true,
        command_processor: true,
        analytics_engine: true
      },
      uptime: Date.now() - 1234567890000, // Mock uptime
      version: this.baseVersion
    });
  }
}

// Singleton instance
export const apiService = new ApiService();

// Convenience functions for external consumption
export const api = {
  // POV operations
  povs: {
    list: (options?: Parameters<typeof apiService.getPOVs>[0]) => apiService.getPOVs(options),
    get: (id: string) => apiService.getPOV(id),
    create: (data: Parameters<typeof apiService.createPOV>[0]) => apiService.createPOV(data),
    update: (id: string, updates: Parameters<typeof apiService.updatePOV>[1]) => apiService.updatePOV(id, updates)
  },
  
  // TRR operations
  trrs: {
    list: (options?: Parameters<typeof apiService.getTRRs>[0]) => apiService.getTRRs(options),
    get: (id: string) => apiService.getTRR(id),
    create: (data: Parameters<typeof apiService.createTRR>[0]) => apiService.createTRR(data)
  },
  
  // Scenario operations
  scenarios: {
    list: (options?: Parameters<typeof apiService.getScenarios>[0]) => apiService.getScenarios(options),
    deploy: (id: string, config?: Record<string, any>) => apiService.deployScenario(id, config)
  },
  
  // Analytics
  analytics: {
    get: (options?: Parameters<typeof apiService.getAnalytics>[0]) => apiService.getAnalytics(options)
  },
  
  // Command execution
  commands: {
    execute: (command: string, context?: Record<string, any>) => apiService.executeCommand(command, context)
  },
  
  // System health
  health: () => apiService.healthCheck()
};

export default apiService;