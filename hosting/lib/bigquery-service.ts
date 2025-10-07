/**
 * BigQuery Data Export Service
 * Handles data collection, formatting, and export to GCP BigQuery via Cloud Functions
 */

import { apiService } from './api-service';

export interface BigQueryExportConfig {
  dataset: string;
  table: string;
  projectId: string;
  cloudFunctionUrl: string;
  includePII: boolean;
  timeRange?: {
    start: string;
    end: string;
  };
}

export interface BigQueryRow {
  timestamp: string;
  session_id: string;
  user_id: string;
  event_type: 'command_execution' | 'pov_action' | 'trr_update' | 'scenario_deployment' | 'gui_interaction';
  event_data: Record<string, any>;
  metadata: {
    interface_type: 'gui' | 'terminal';
    client_info: Record<string, any>;
    performance_metrics?: Record<string, any>;
  };
}

export interface ExportResult {
  success: boolean;
  recordsExported: number;
  bigqueryJobId?: string;
  error?: string;
  timestamp: string;
}

class BigQueryService {
  private config: BigQueryExportConfig;
  private exportQueue: BigQueryRow[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.config = {
      dataset: 'cortex_dc_analytics',
      table: 'user_interactions',
      projectId: process.env.NEXT_PUBLIC_GCP_PROJECT_ID || 'cortex-dc-project',
      cloudFunctionUrl: process.env.NEXT_PUBLIC_BIGQUERY_FUNCTION_URL || '/api/export/bigquery',
      includePII: false, // Default to false for privacy
      timeRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
        end: new Date().toISOString()
      }
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private getCurrentUser(): string {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('dc_user') || 'anonymous';
    }
    return 'server';
  }

  private sanitizeData(data: any, includePII: boolean = false): any {
    if (!includePII) {
      // Remove sensitive information
      const sanitized = { ...data };
      const sensitiveKeys = ['password', 'token', 'api_key', 'secret', 'email', 'phone'];
      
      const recursiveSanitize = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;
        
        const cleaned = Array.isArray(obj) ? [] : {};
        for (const [key, value] of Object.entries(obj)) {
          const lowercaseKey = key.toLowerCase();
          if (sensitiveKeys.some(sensitive => lowercaseKey.includes(sensitive))) {
            (cleaned as any)[key] = '[REDACTED]';
          } else if (typeof value === 'object') {
            (cleaned as any)[key] = recursiveSanitize(value);
          } else {
            (cleaned as any)[key] = value;
          }
        }
        return cleaned;
      };
      
      return recursiveSanitize(sanitized);
    }
    return data;
  }

  /**
   * Track a command execution event
   */
  trackCommandExecution(command: string, args: string[], output: any, executionTime: number): void {
    const row: BigQueryRow = {
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: this.getCurrentUser(),
      event_type: 'command_execution',
      event_data: this.sanitizeData({
        command,
        args,
        output_summary: typeof output === 'string' ? output.substring(0, 500) : 'non-string-output',
        execution_time_ms: executionTime,
        success: true
      }),
      metadata: {
        interface_type: 'terminal',
        client_info: {
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
          timestamp: Date.now(),
          url: typeof window !== 'undefined' ? window.location.href : 'server'
        },
        performance_metrics: {
          execution_time_ms: executionTime,
          memory_usage: typeof window !== 'undefined' && (window as any).performance?.memory 
            ? (window as any).performance.memory.usedJSHeapSize 
            : null
        }
      }
    };

    this.exportQueue.push(row);
  }

  /**
   * Track a GUI interaction event
   */
  trackGUIInteraction(actionType: string, component: string, data: any): void {
    const row: BigQueryRow = {
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: this.getCurrentUser(),
      event_type: 'gui_interaction',
      event_data: this.sanitizeData({
        action_type: actionType,
        component,
        interaction_data: data,
        page: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
      }),
      metadata: {
        interface_type: 'gui',
        client_info: {
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
          timestamp: Date.now(),
          url: typeof window !== 'undefined' ? window.location.href : 'server',
          viewport: typeof window !== 'undefined' 
            ? { width: window.innerWidth, height: window.innerHeight } 
            : null
        }
      }
    };

    this.exportQueue.push(row);
  }

  /**
   * Track POV-related actions
   */
  trackPOVAction(action: string, povId: string, data: any): void {
    const row: BigQueryRow = {
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: this.getCurrentUser(),
      event_type: 'pov_action',
      event_data: this.sanitizeData({
        action,
        pov_id: povId,
        pov_data: data
      }),
      metadata: {
        interface_type: typeof window !== 'undefined' && window.location.pathname.includes('gui') ? 'gui' : 'terminal',
        client_info: {
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
          timestamp: Date.now()
        }
      }
    };

    this.exportQueue.push(row);
  }

  /**
   * Collect comprehensive analytics data from the application
   */
  async collectAnalyticsData(): Promise<BigQueryRow[]> {
    const rows: BigQueryRow[] = [...this.exportQueue];

    try {
      // Collect POV data
      const povResponse = await apiService.getPOVs({ page: 1, limit: 100 });
      if (povResponse.success && povResponse.data) {
        rows.push({
          timestamp: new Date().toISOString(),
          session_id: this.sessionId,
          user_id: this.getCurrentUser(),
          event_type: 'pov_action',
          event_data: this.sanitizeData({
            action: 'bulk_export',
            total_povs: povResponse.data.length,
            povs_summary: povResponse.data.map(pov => ({
              id: pov.id,
              status: pov.status,
              customer: pov.customer,
              created_at: pov.createdAt,
              scenario_count: pov.scenarios.length
            }))
          }),
          metadata: {
            interface_type: 'gui',
            client_info: {
              export_type: 'analytics_collection',
              timestamp: Date.now()
            }
          }
        });
      }

      // Collect TRR data
      const trrResponse = await apiService.getTRRs({ page: 1, limit: 100 });
      if (trrResponse.success && trrResponse.data) {
        rows.push({
          timestamp: new Date().toISOString(),
          session_id: this.sessionId,
          user_id: this.getCurrentUser(),
          event_type: 'trr_update',
          event_data: this.sanitizeData({
            action: 'bulk_export',
            total_trrs: trrResponse.data.length,
            trrs_summary: trrResponse.data.map(trr => ({
              id: trr.id,
              status: trr.status,
              priority: trr.priority,
              created_at: trr.createdAt,
              has_blockchain_hash: !!trr.blockchain_hash
            }))
          }),
          metadata: {
            interface_type: 'gui',
            client_info: {
              export_type: 'analytics_collection',
              timestamp: Date.now()
            }
          }
        });
      }

      // Collect Scenario data
      const scenarioResponse = await apiService.getScenarios({ page: 1, limit: 100 });
      if (scenarioResponse.success && scenarioResponse.data) {
        rows.push({
          timestamp: new Date().toISOString(),
          session_id: this.sessionId,
          user_id: this.getCurrentUser(),
          event_type: 'scenario_deployment',
          event_data: this.sanitizeData({
            action: 'bulk_export',
            total_scenarios: scenarioResponse.data.length,
            scenarios_summary: scenarioResponse.data.map(scenario => ({
              id: scenario.id,
              type: scenario.type,
              status: scenario.status,
              mitre_techniques: scenario.mitre_techniques,
              cloud_providers: scenario.cloud_providers
            }))
          }),
          metadata: {
            interface_type: 'gui',
            client_info: {
              export_type: 'analytics_collection',
              timestamp: Date.now()
            }
          }
        });
      }

    } catch (error) {
      console.error('Error collecting analytics data:', error);
      // Add error event to export
      rows.push({
        timestamp: new Date().toISOString(),
        session_id: this.sessionId,
        user_id: this.getCurrentUser(),
        event_type: 'gui_interaction',
        event_data: {
          action: 'data_collection_error',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        metadata: {
          interface_type: 'gui',
          client_info: {
            timestamp: Date.now(),
            error_context: 'analytics_collection'
          }
        }
      });
    }

    return rows;
  }

  /**
   * Export data to BigQuery via Cloud Function
   */
  async exportToBigQuery(options: {
    includeQueuedData?: boolean;
    collectFreshData?: boolean;
    customConfig?: Partial<BigQueryExportConfig>;
  } = {}): Promise<ExportResult> {
    const { includeQueuedData = true, collectFreshData = true, customConfig = {} } = options;
    
    const config = { ...this.config, ...customConfig };
    const dataToExport: BigQueryRow[] = [];

    try {
      // Include queued data
      if (includeQueuedData) {
        dataToExport.push(...this.exportQueue);
      }

      // Collect fresh analytics data
      if (collectFreshData) {
        const freshData = await this.collectAnalyticsData();
        dataToExport.push(...freshData);
      }

      if (dataToExport.length === 0) {
        return {
          success: false,
          recordsExported: 0,
          error: 'No data to export',
          timestamp: new Date().toISOString()
        };
      }

      // Prepare payload for Cloud Function
      const payload = {
        dataset: config.dataset,
        table: config.table,
        rows: dataToExport,
        metadata: {
          export_timestamp: new Date().toISOString(),
          session_id: this.sessionId,
          user_id: this.getCurrentUser(),
          total_records: dataToExport.length,
          time_range: config.timeRange
        }
      };

      // Call Cloud Function
      const response = await fetch(config.cloudFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getIdToken()}` // For authentication
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Clear exported data from queue
        if (includeQueuedData) {
          this.exportQueue = [];
        }

        return {
          success: true,
          recordsExported: dataToExport.length,
          bigqueryJobId: result.jobId,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error('BigQuery export error:', error);
      return {
        success: false,
        recordsExported: 0,
        error: error instanceof Error ? error.message : 'Unknown export error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get ID token for authentication (implement based on your auth system)
   */
  private async getIdToken(): Promise<string> {
    // This should integrate with your Firebase Auth or other authentication system
    // For now, return a placeholder
    if (typeof window !== 'undefined') {
      // Try to get Firebase ID token if available
      try {
        const { getAuth, getIdToken } = await import('firebase/auth');
        const auth = getAuth();
        if (auth.currentUser) {
          return await getIdToken(auth.currentUser);
        }
      } catch (error) {
        console.warn('Firebase auth not available for ID token');
      }
    }
    
    // Fallback: return session token or API key
    return sessionStorage.getItem('dc_auth_token') || 'anonymous-token';
  }

  /**
   * Get current export queue status
   */
  getQueueStatus(): { queueSize: number; oldestItem?: string; newestItem?: string } {
    const queue = this.exportQueue;
    return {
      queueSize: queue.length,
      oldestItem: queue.length > 0 ? queue[0].timestamp : undefined,
      newestItem: queue.length > 0 ? queue[queue.length - 1].timestamp : undefined
    };
  }

  /**
   * Clear the export queue
   */
  clearQueue(): void {
    this.exportQueue = [];
  }

  /**
   * Update export configuration
   */
  updateConfig(newConfig: Partial<BigQueryExportConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): BigQueryExportConfig {
    return { ...this.config };
  }
}

// Singleton instance
export const bigQueryService = new BigQueryService();

// Export tracking helpers for easy integration
export const trackCommand = (command: string, args: string[], output: any, executionTime: number) => 
  bigQueryService.trackCommandExecution(command, args, output, executionTime);

export const trackGUIAction = (actionType: string, component: string, data: any) => 
  bigQueryService.trackGUIInteraction(actionType, component, data);

export const trackPOV = (action: string, povId: string, data: any) => 
  bigQueryService.trackPOVAction(action, povId, data);

export default bigQueryService;