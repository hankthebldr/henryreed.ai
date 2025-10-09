export type PlatformEnvironment = 'production' | 'staging' | 'qa' | 'development';
export type ReleaseChannel = 'stable' | 'beta' | 'canary';

export interface FeatureFlagDefinition {
  key: string;
  name: string;
  description: string;
  category: 'experience' | 'analytics' | 'integrations' | 'productivity' | 'mobile';
  defaultEnabled: boolean;
}

export interface FeatureFlagState extends FeatureFlagDefinition {
  enabled: boolean;
  lastModified: string;
  modifiedBy: string;
}

export interface EnvironmentConfig {
  environment: PlatformEnvironment;
  apiBaseUrl: string;
  analyticsDataset: string;
  releaseChannel: ReleaseChannel;
  maintenanceMode: boolean;
  region: string;
}

export interface PlatformSettingsAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  message: string;
  metadata?: Record<string, string>;
}

export interface PlatformSettingsDocument {
  featureFlags: FeatureFlagState[];
  environment: EnvironmentConfig;
  updatedAt: string;
  updatedBy: string;
  auditLog: PlatformSettingsAuditEntry[];
}

interface FeatureFlagUpdateResult {
  flag: FeatureFlagState;
  settings: PlatformSettingsDocument;
}

interface EnvironmentUpdateResult {
  settings: PlatformSettingsDocument;
}

const MAX_AUDIT_ENTRIES = 50;

const generateId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (error) {
    console.warn('crypto.randomUUID unavailable, falling back to pseudo-random id generation', error);
  }

  return `ps_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
};

class PlatformSettingsService {
  private readonly storageKey = 'platform_settings_document_v1';
  private cachedSettings: PlatformSettingsDocument;
  private readonly defaultFlags: FeatureFlagDefinition[] = [
    {
      key: 'beta_features',
      name: 'Beta Features',
      description: 'Enable beta features for early adopters',
      category: 'experience',
      defaultEnabled: false,
    },
    {
      key: 'advanced_analytics',
      name: 'Advanced Analytics',
      description: 'Unlock predictive and cohort analytics dashboards',
      category: 'analytics',
      defaultEnabled: false,
    },
    {
      key: 'ai_recommendations',
      name: 'AI Recommendations',
      description: 'Enable AI-driven recommendations inside workflows',
      category: 'productivity',
      defaultEnabled: true,
    },
    {
      key: 'export_to_pdf',
      name: 'PDF Export',
      description: 'Allow exporting reports and dashboards to PDF',
      category: 'productivity',
      defaultEnabled: true,
    },
    {
      key: 'team_collaboration',
      name: 'Team Collaboration',
      description: 'Enable live collaboration and shared annotations',
      category: 'experience',
      defaultEnabled: true,
    },
    {
      key: 'mobile_app',
      name: 'Mobile App Access',
      description: 'Allow users to sign in using the mobile companion app',
      category: 'mobile',
      defaultEnabled: false,
    },
  ];

  constructor() {
    this.cachedSettings = this.loadFromStorage() ?? this.createDefaultSettings();
    this.persist(this.cachedSettings);
  }

  async getSettings(): Promise<PlatformSettingsDocument> {
    const stored = this.loadFromStorage();
    if (stored) {
      this.cachedSettings = stored;
    }
    return this.clone(this.cachedSettings);
  }

  getSnapshot(): PlatformSettingsDocument {
    return this.clone(this.cachedSettings);
  }

  getDefaultEnvironment(): EnvironmentConfig {
    return this.clone(this.createDefaultEnvironment());
  }

  getFeatureFlagDefinitions(): FeatureFlagDefinition[] {
    return this.defaultFlags.map((flag) => ({ ...flag }));
  }

  async updateFeatureFlag(
    key: string,
    enabled: boolean,
    actor: { id: string; name: string }
  ): Promise<FeatureFlagUpdateResult> {
    const settings = await this.getSettings();
    const flagIndex = settings.featureFlags.findIndex((flag) => flag.key === key);

    if (flagIndex === -1) {
      throw new Error(`Feature flag "${key}" not found`);
    }

    const timestamp = new Date().toISOString();
    const updatedFlag: FeatureFlagState = {
      ...settings.featureFlags[flagIndex],
      enabled,
      lastModified: timestamp,
      modifiedBy: actor.name,
    };

    const updatedSettings: PlatformSettingsDocument = {
      ...settings,
      featureFlags: settings.featureFlags.map((flag) =>
        flag.key === key ? updatedFlag : flag
      ),
      updatedAt: timestamp,
      updatedBy: actor.name,
      auditLog: this.addAuditEntry(settings.auditLog, {
        id: generateId(),
        timestamp,
        actor: actor.name,
        action: 'feature_flag:update',
        message: `${actor.name} ${enabled ? 'enabled' : 'disabled'} ${updatedFlag.name}`,
        metadata: {
          flagKey: key,
          enabled: String(enabled),
          actorId: actor.id,
        },
      }),
    };

    this.persist(updatedSettings);

    return {
      flag: this.clone(updatedFlag),
      settings: this.clone(updatedSettings),
    };
  }

  async updateEnvironmentConfig(
    config: EnvironmentConfig,
    actor: { id: string; name: string }
  ): Promise<EnvironmentUpdateResult> {
    const validationErrors = this.validateEnvironmentConfig(config);
    if (Object.keys(validationErrors).length > 0) {
      const error = new Error('Environment configuration validation failed');
      (error as Error & { validationErrors: Record<string, string> }).validationErrors = validationErrors;
      throw error;
    }

    const settings = await this.getSettings();
    const timestamp = new Date().toISOString();
    const updatedSettings: PlatformSettingsDocument = {
      ...settings,
      environment: { ...config },
      updatedAt: timestamp,
      updatedBy: actor.name,
      auditLog: this.addAuditEntry(settings.auditLog, {
        id: generateId(),
        timestamp,
        actor: actor.name,
        action: 'environment:update',
        message: `${actor.name} updated environment configuration (${config.environment.toUpperCase()})`,
        metadata: {
          actorId: actor.id,
          releaseChannel: config.releaseChannel,
          maintenanceMode: String(config.maintenanceMode),
        },
      }),
    };

    this.persist(updatedSettings);

    return {
      settings: this.clone(updatedSettings),
    };
  }

  validateEnvironmentConfig(config: EnvironmentConfig): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!config.environment) {
      errors.environment = 'Environment selection is required.';
    }

    if (!config.apiBaseUrl) {
      errors.apiBaseUrl = 'API base URL is required.';
    } else if (!/^https?:\/\//.test(config.apiBaseUrl)) {
      errors.apiBaseUrl = 'API base URL must start with http:// or https://';
    }

    if (!config.analyticsDataset) {
      errors.analyticsDataset = 'Analytics dataset is required.';
    }

    if (!config.releaseChannel) {
      errors.releaseChannel = 'Release channel must be selected.';
    }

    if (!config.region) {
      errors.region = 'Primary deployment region is required.';
    }

    return errors;
  }

  private addAuditEntry(
    log: PlatformSettingsAuditEntry[],
    entry: PlatformSettingsAuditEntry
  ): PlatformSettingsAuditEntry[] {
    const updated = [entry, ...log];
    return updated.slice(0, MAX_AUDIT_ENTRIES);
  }

  private loadFromStorage(): PlatformSettingsDocument | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(this.storageKey);
        if (stored) {
          return JSON.parse(stored) as PlatformSettingsDocument;
        }
        return null;
      }

      const globalStore = (globalThis as typeof globalThis & {
        __PLATFORM_SETTINGS__?: PlatformSettingsDocument;
      });
      return globalStore.__PLATFORM_SETTINGS__ ?? null;
    } catch (error) {
      console.warn('Failed to load platform settings from storage:', error);
      return null;
    }
  }

  private persist(settings: PlatformSettingsDocument): void {
    this.cachedSettings = settings;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.storageKey, JSON.stringify(settings));
      } else {
        const globalStore = globalThis as typeof globalThis & {
          __PLATFORM_SETTINGS__?: PlatformSettingsDocument;
        };
        globalStore.__PLATFORM_SETTINGS__ = settings;
      }
    } catch (error) {
      console.warn('Failed to persist platform settings to storage:', error);
    }
  }

  private createDefaultSettings(): PlatformSettingsDocument {
    const timestamp = new Date().toISOString();
    const environment = this.createDefaultEnvironment();
    const featureFlags = this.defaultFlags.map((flag) => ({
      ...flag,
      enabled: flag.defaultEnabled,
      lastModified: timestamp,
      modifiedBy: 'system',
    }));

    return {
      featureFlags,
      environment,
      updatedAt: timestamp,
      updatedBy: 'system',
      auditLog: [
        {
          id: generateId(),
          timestamp,
          actor: 'system',
          action: 'bootstrap',
          message: 'Platform settings initialized with default configuration',
        },
      ],
    };
  }

  private createDefaultEnvironment(): EnvironmentConfig {
    return {
      environment: 'production',
      apiBaseUrl: 'https://api.henryreed.ai',
      analyticsDataset: 'prod_cortex_events',
      releaseChannel: 'stable',
      maintenanceMode: false,
      region: 'us-central1',
    };
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }
}

export const platformSettingsService = new PlatformSettingsService();

