/**
 * Domain Consultant API Client
 * Comprehensive API layer for all DC workflows and operations
 */

import {
  dcContextStore,
  CustomerEngagement,
  ActivePOV as POVRecord,
  TRRRecord,
  WorkflowHistory as WorkflowHistoryEntry
} from './dc-context-store';
import { dcAIClient, DCWorkflowContext } from './dc-ai-client';
import { SolutionDesignWorkbook, SDWExportConfiguration } from './sdw-models';
import getFirebaseServices from './firebase/client';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  setDoc
} from 'firebase/firestore';
import type { QueryConstraint } from 'firebase/firestore';

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

export interface UserScopeContext {
  userId: string;
  scope?: 'self' | 'team';
  teamUserIds?: string[];
  targetUserId?: string;
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

  private getFirestore() {
    try {
      const { firestore } = getFirebaseServices();
      return firestore;
    } catch (error) {
      console.warn('Firestore unavailable, using context store fallback:', error);
      return null;
    }
  }

  private resolveUserIds(context: UserScopeContext): string[] {
    const ids = new Set<string>();
    if (context.userId) {
      ids.add(context.userId);
    }
    if (context.scope === 'team' && context.teamUserIds) {
      context.teamUserIds.filter(Boolean).forEach(id => ids.add(id));
    }
    return Array.from(ids);
  }

  private ensureTeamScope(context: UserScopeContext, targetUserId: string) {
    if (targetUserId && targetUserId !== context.userId) {
      if (context.scope !== 'team') {
        throw new Error('Insufficient permissions to modify team member records');
      }
      const allowed = this.resolveUserIds(context);
      if (!allowed.includes(targetUserId)) {
        throw new Error('Target user not within team scope');
      }
    }
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
  async getPOVs(context: UserScopeContext, filters?: { customerId?: string; status?: string }): Promise<APIResponse<POVRecord[]>> {
    const firestore = this.getFirestore();
    try {
      const povs: POVRecord[] = [];
      const userIds = this.resolveUserIds(context);

      if (firestore) {
        for (const userId of userIds) {
          let povQuery: any = collection(firestore, 'users', userId, 'povs');
          const constraints: QueryConstraint[] = [];

          if (filters?.customerId) {
            constraints.push(where('customerId', '==', filters.customerId));
          }
          if (filters?.status) {
            constraints.push(where('status', '==', filters.status));
          }

          if (constraints.length > 0) {
            povQuery = query(povQuery, ...constraints);
          }

          const snapshot = await getDocs(povQuery);
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as POVRecord;
            povs.push({ ...data, id: docSnap.id, ownerId: data.ownerId || userId });
            dcContextStore.addActivePOV({ ...data, id: docSnap.id, ownerId: data.ownerId || userId });
          });
        }
      } else {
        const stored = dcContextStore.getAllActivePOVs();
        const allowedIds = new Set(userIds);
        stored
          .filter(pov => !pov.ownerId || allowedIds.has(pov.ownerId))
          .filter(pov => {
            if (filters?.customerId && pov.customerId !== filters.customerId) return false;
            if (filters?.status && pov.status !== filters.status) return false;
            return true;
          })
          .forEach(pov => povs.push(pov));
      }

      povs.sort((a, b) => new Date(b.updatedAt || b.createdAt || '').getTime() - new Date(a.updatedAt || a.createdAt || '').getTime());

      return {
        success: true,
        data: povs,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_povs`
      };
    } catch (error: any) {
      console.error('Failed to fetch POVs:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch POVs',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_povs_error`
      };
    }
  }

  async createPOV(context: UserScopeContext, pov: Omit<POVRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<POVRecord>> {
    try {
      const ownerId = context.targetUserId || context.userId;
      this.ensureTeamScope(context, ownerId);

      const timestamp = new Date().toISOString();
      const newPOV: POVRecord = {
        ...pov,
        ownerId,
        id: '',
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const firestore = this.getFirestore();
      if (firestore) {
        const docRef = await addDoc(collection(firestore, 'users', ownerId, 'povs'), {
          ...newPOV,
          id: undefined
        });
        newPOV.id = docRef.id;
      } else {
        newPOV.id = `pov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      dcContextStore.addActivePOV(newPOV);

      if (firestore && newPOV.id) {
        await updateDoc(doc(firestore, 'users', ownerId, 'povs', newPOV.id), {
          id: newPOV.id
        });
      }

      return {
        success: true,
        data: newPOV,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_pov_create`
      };
    } catch (error: any) {
      console.error('Failed to create POV:', error);
      return {
        success: false,
        error: error.message || 'Failed to create POV',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_pov_create_error`
      };
    }
  }

  async updatePOV(context: UserScopeContext, id: string, updates: Partial<POVRecord>, ownerId?: string): Promise<APIResponse<POVRecord>> {
    try {
      const targetOwnerId = ownerId || context.targetUserId || context.userId;
      this.ensureTeamScope(context, targetOwnerId);

      const firestore = this.getFirestore();
      let updated: POVRecord | undefined;

      if (firestore) {
        const docRef = doc(firestore, 'users', targetOwnerId, 'povs', id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          updated = { ...(snapshot.data() as POVRecord), id: snapshot.id, ownerId: targetOwnerId };
          dcContextStore.updateActivePOV(id, updated);
        }
      } else {
        dcContextStore.updateActivePOV(id, { ...updates, ownerId: targetOwnerId });
        updated = dcContextStore.getActivePOV(id);
      }

      return {
        success: !!updated,
        data: updated,
        error: updated ? undefined : 'POV not found',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_pov_update`
      };
    } catch (error: any) {
      console.error('Failed to update POV:', error);
      return {
        success: false,
        error: error.message || 'Failed to update POV',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_pov_update_error`
      };
    }
  }

  // TRR Management
  async getTRRs(context: UserScopeContext, filters?: { customerId?: string; povId?: string; status?: string }): Promise<APIResponse<TRRRecord[]>> {
    const firestore = this.getFirestore();
    try {
      const trrs: TRRRecord[] = [];
      const userIds = this.resolveUserIds(context);

      if (firestore) {
        for (const userId of userIds) {
          let trrQuery: any = collection(firestore, 'users', userId, 'trrs');
          const constraints: QueryConstraint[] = [];

          if (filters?.customerId) constraints.push(where('customerId', '==', filters.customerId));
          if (filters?.povId) constraints.push(where('povId', '==', filters.povId));
          if (filters?.status) constraints.push(where('status', '==', filters.status));

          if (constraints.length > 0) {
            trrQuery = query(trrQuery, ...constraints);
          }

          const snapshot = await getDocs(trrQuery);
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as TRRRecord;
            const record = { ...data, id: docSnap.id, ownerId: data.ownerId || userId };
            trrs.push(record);
            dcContextStore.addTRRRecord(record);
          });
        }
      } else {
        const stored = dcContextStore.getAllTRRRecords();
        const allowed = new Set(userIds);
        stored
          .filter(trr => !trr.ownerId || allowed.has(trr.ownerId))
          .filter(trr => {
            if (filters?.customerId && trr.customerId !== filters.customerId) return false;
            if (filters?.povId && trr.povId !== filters.povId) return false;
            if (filters?.status && trr.status !== filters.status) return false;
            return true;
          })
          .forEach(trr => trrs.push(trr));
      }

      trrs.sort((a, b) => new Date(b.updatedAt || b.createdAt || '').getTime() - new Date(a.updatedAt || a.createdAt || '').getTime());

      return {
        success: true,
        data: trrs,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trrs`
      };
    } catch (error: any) {
      console.error('Failed to fetch TRRs:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch TRRs',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trrs_error`
      };
    }
  }

  async createTRR(trr: Omit<TRRRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<TRRRecord>> {
    const newTRR: TRRRecord = {
      ...trr,
      id: `trr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiInsights: trr.aiInsights || []
    };

    dcContextStore.addTRRRecord(newTRR);

    return {
      success: true,
      data: newTRR,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  async createTRR(context: UserScopeContext, trr: Omit<TRRRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<TRRRecord>> {
    try {
      const ownerId = context.targetUserId || context.userId;
      this.ensureTeamScope(context, ownerId);
      const timestamp = new Date().toISOString();

      const newTRR: TRRRecord = {
        ...trr,
        ownerId,
        id: '',
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const firestore = this.getFirestore();
      if (firestore) {
        const docRef = await addDoc(collection(firestore, 'users', ownerId, 'trrs'), {
          ...newTRR,
          id: undefined
        });
        newTRR.id = docRef.id;
      } else {
        newTRR.id = `trr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      dcContextStore.addTRRRecord(newTRR);

      if (firestore && newTRR.id) {
        await updateDoc(doc(firestore, 'users', ownerId, 'trrs', newTRR.id), {
          id: newTRR.id
        });
      }

      return {
        success: true,
        data: newTRR,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trr_create`
      };
    } catch (error: any) {
      console.error('Failed to create TRR:', error);
      return {
        success: false,
        error: error.message || 'Failed to create TRR',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trr_create_error`
      };
    }
  }

  async updateTRR(context: UserScopeContext, id: string, updates: Partial<TRRRecord>, ownerId?: string): Promise<APIResponse<TRRRecord>> {
    try {
      const targetOwnerId = ownerId || context.targetUserId || context.userId;
      this.ensureTeamScope(context, targetOwnerId);
      const firestore = this.getFirestore();
      let updated: TRRRecord | undefined;

      if (firestore) {
        const docRef = doc(firestore, 'users', targetOwnerId, 'trrs', id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          updated = { ...(snapshot.data() as TRRRecord), id: snapshot.id, ownerId: targetOwnerId };
          dcContextStore.updateTRRRecord(id, updated);
        }
      } else {
        dcContextStore.updateTRRRecord(id, { ...updates, ownerId: targetOwnerId });
        updated = dcContextStore.getTRRRecord(id);
      }

      return {
        success: !!updated,
        data: updated,
        error: updated ? undefined : 'TRR not found',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trr_update`
      };
    } catch (error: any) {
      console.error('Failed to update TRR:', error);
      return {
        success: false,
        error: error.message || 'Failed to update TRR',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trr_update_error`
      };
    }
  }

  async validateTRR(context: UserScopeContext, id: string, evidence?: string[], ownerId?: string): Promise<APIResponse<TRRRecord>> {
    try {
      const targetOwnerId = ownerId || context.targetUserId || context.userId;
      this.ensureTeamScope(context, targetOwnerId);
      const firestore = this.getFirestore();

      let trr = dcContextStore.getTRRRecord(id);
      if (!trr && firestore) {
        const docRef = doc(firestore, 'users', targetOwnerId, 'trrs', id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          trr = { ...(snapshot.data() as TRRRecord), id: snapshot.id, ownerId: targetOwnerId };
          dcContextStore.addTRRRecord(trr);
        }
      }

      if (!trr) {
        return {
          success: false,
          error: 'TRR not found',
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_trr_validate_missing`
        };
      }

      const updates: Partial<TRRRecord> = {
        status: 'validated',
        timeline: {
          ...trr.timeline,
          actualValidation: new Date().toISOString()
        },
        validationEvidence: evidence || trr.validationEvidence,
        updatedAt: new Date().toISOString()
      };

      const updateResult = await this.updateTRR(context, id, updates, trr.ownerId || targetOwnerId);

      if (!updateResult.success || !updateResult.data) {
        return updateResult;
      }

      return {
        success: true,
        data: updateResult.data,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trr_validate`
      };
    } catch (error: any) {
      console.error('Failed to validate TRR:', error);
      return {
        success: false,
        error: error.message || 'Failed to validate TRR',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trr_validate_error`
      };
    }
  }

  async ensureStarterDataForUser(context: UserScopeContext, user: UserProfile): Promise<{ seeded: boolean; error?: string }> {
    try {
      const firestore = this.getFirestore();

      if (!firestore) {
        const seeded = dcContextStore.seedStarterDataForUser(user);
        return { seeded: !!seeded.seeded };
      }

      const povSnapshot = await getDocs(collection(firestore, 'users', user.id, 'povs'));
      const trrSnapshot = await getDocs(collection(firestore, 'users', user.id, 'trrs'));

      if (!povSnapshot.empty || !trrSnapshot.empty) {
        return { seeded: false };
      }

      const seedResult = dcContextStore.seedStarterDataForUser(user);
      if (!seedResult.seeded) {
        return { seeded: false };
      }

      await setDoc(doc(firestore, 'users', user.id, 'povs', seedResult.pov.id), seedResult.pov);
      await Promise.all(
        seedResult.trrs.map(trr => setDoc(doc(firestore, 'users', user.id, 'trrs', trr.id), trr))
      );

      return { seeded: true };
    } catch (error: any) {
      console.error('Failed to seed starter data:', error);
      return { seeded: false, error: error.message || 'Failed to seed starter data' };
    }
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

  async fetchUserContext(): Promise<APIResponse<DCWorkflowSnapshot>> {
    const timestamp = new Date().toISOString();
    const requestId = `req_${Date.now()}_context`;

    try {
      const response = await fetch(`${this.baseUrl}/context`, {
        method: 'GET',
        headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : undefined,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const payload = await response.json();
      const snapshot: DCWorkflowSnapshot = {
        customers: payload.customers || [],
        povs: payload.povs || [],
        trrs: payload.trrs || [],
      };

      this.syncContextSnapshot(snapshot);

      return {
        success: true,
        data: snapshot,
        timestamp,
        requestId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch workflow context',
        timestamp,
        requestId,
      };
    }
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
  async initializeCustomerPOV(context: UserScopeContext, customerData: Omit<CustomerEngagement, 'id' | 'createdAt' | 'updatedAt'>) {
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

    const povResponse = await dcAPIClient.createPOV(context, povData);
    if (!povResponse.success) {
      throw new Error(povResponse.error || 'Failed to create POV');
    }

    return {
      customer: customerResponse.data,
      pov: povResponse.data!
    };
  },

  async generateTRRSet(context: UserScopeContext, customerId: string, povId: string, scenarios: string[]) {
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

      return dcAPIClient.createTRR(context, trrData);
    });

    const results = await Promise.all(trrPromises);
    return results.map(r => r.data).filter(Boolean);
  }
};