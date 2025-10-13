// Demo Record Types for DC Platform

export interface DemoRecord {
  id: string;
  title: string;
  customer: string;
  type: DemoType;
  status: DemoStatus;
  createdAt: string;
  lastModified: string;
  createdBy: string;
  description: string;
  tags: string[];
  artifacts: DemoArtifact[];
  toolingConfig?: DCToolingConfig;
  metrics?: DemoMetrics;
}

export type DemoType =
  | 'pov'
  | 'technical-demo'
  | 'executive-demo'
  | 'workshop'
  | 'poc'
  | 'competitive'
  | 'scenario';

export type DemoStatus =
  | 'draft'
  | 'in-progress'
  | 'completed'
  | 'archived';

export interface DemoArtifact {
  id: string;
  name: string;
  type: 'markdown' | 'json' | 'csv' | 'pdf' | 'video' | 'script';
  url?: string;
  size?: number;
  uploadedAt: string;
}

export interface DCToolingConfig {
  syslogGenerator?: SyslogGeneratorConfig;
  cortexXDR?: CortexXDRConfig;
  xsiam?: XSIAMConfig;
}

export interface SyslogGeneratorConfig {
  brokerVM: string;
  brokerIP: string;
  brokerPort: number;
  protocol: 'UDP' | 'TCP' | 'TLS';
  vendor: string;
  product: string;
  scenario?: string;
  ratePerSecond?: number;
  duration?: number;
  xsiamEndpoint?: string;
  xsiamApiKey?: string;
  enabled: boolean;
}

export interface CortexXDRConfig {
  tenantId: string;
  apiKey: string;
  apiKeyId: string;
  enabled: boolean;
}

export interface XSIAMConfig {
  tenantId: string;
  httpEndpoint: string;
  apiKey: string;
  enabled: boolean;
}

export interface DemoMetrics {
  views: number;
  lastViewed?: string;
  duration?: number; // in minutes
  successRate?: number; // percentage
  logsGenerated?: number;
  eventsProcessed?: number;
}

export interface DemoFilter {
  type?: DemoType[];
  status?: DemoStatus[];
  customer?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}
