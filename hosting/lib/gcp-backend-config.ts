// GCP Backend Configuration Schema for Henry Reed AI Platform
// This file defines the complete backend architecture for download services

export interface GCPBackendConfig {
  project: {
    id: string;
    name: string;
    region: string;
    zone: string;
  };
  services: {
    cloudStorage: {
      buckets: GCPStorageBucket[];
      defaultRegion: string;
      lifecycle: StorageLifecycleRule[];
    };
    cloudFunctions: {
      functions: CloudFunction[];
      runtime: string;
      memory: string;
      timeout: number;
    };
    cloudRun: {
      services: CloudRunService[];
      minInstances: number;
      maxInstances: number;
      cpuLimit: string;
      memoryLimit: string;
    };
    firestore: {
      collections: FirestoreCollection[];
      mode: 'native' | 'datastore';
    };
    pubSub: {
      topics: PubSubTopic[];
      subscriptions: PubSubSubscription[];
    };
  };
  authentication: {
    serviceAccounts: ServiceAccount[];
    iam: IAMPolicy[];
  };
  monitoring: {
    logging: LoggingConfig;
    metrics: MetricsConfig;
    alerting: AlertingConfig;
  };
}

export interface GCPStorageBucket {
  name: string;
  location: string;
  storageClass: 'STANDARD' | 'NEARLINE' | 'COLDLINE' | 'ARCHIVE';
  versioning: boolean;
  cors: CORSRule[];
  permissions: BucketPermission[];
}

export interface CORSRule {
  origin: string[];
  method: string[];
  responseHeader: string[];
  maxAgeSeconds: number;
}

export interface BucketPermission {
  role: string;
  members: string[];
}

export interface StorageLifecycleRule {
  condition: {
    age?: number;
    createdBefore?: string;
    matchesStorageClass?: string[];
  };
  action: {
    type: 'Delete' | 'SetStorageClass';
    storageClass?: string;
  };
}

export interface CloudFunction {
  name: string;
  trigger: {
    type: 'http' | 'storage' | 'pubsub' | 'firestore';
    resource?: string;
    eventType?: string;
  };
  entryPoint: string;
  sourceArchiveUrl?: string;
  environmentVariables: Record<string, string>;
  serviceAccountEmail: string;
}

export interface CloudRunService {
  name: string;
  image: string;
  port: number;
  environmentVariables: Record<string, string>;
  serviceAccountEmail: string;
  allowUnauthenticated: boolean;
}

export interface FirestoreCollection {
  name: string;
  indexes: FirestoreIndex[];
  security: FirestoreSecurityRule[];
}

export interface FirestoreIndex {
  fields: { fieldPath: string; order: 'ASCENDING' | 'DESCENDING' }[];
  queryScope: 'COLLECTION' | 'COLLECTION_GROUP';
}

export interface FirestoreSecurityRule {
  path: string;
  allow: string[];
  condition: string;
}

export interface PubSubTopic {
  name: string;
  messageRetentionDuration: string;
}

export interface PubSubSubscription {
  name: string;
  topic: string;
  pushConfig?: {
    pushEndpoint: string;
    attributes: Record<string, string>;
  };
  ackDeadlineSeconds: number;
}

export interface ServiceAccount {
  accountId: string;
  displayName: string;
  description: string;
  roles: string[];
}

export interface IAMPolicy {
  resource: string;
  bindings: {
    role: string;
    members: string[];
    condition?: {
      title: string;
      description: string;
      expression: string;
    };
  }[];
}

export interface LoggingConfig {
  logSinks: {
    name: string;
    destination: string;
    filter: string;
  }[];
  retention: {
    days: number;
  };
}

export interface MetricsConfig {
  customMetrics: {
    name: string;
    description: string;
    unit: string;
    type: 'GAUGE' | 'DELTA' | 'CUMULATIVE';
  }[];
}

export interface AlertingConfig {
  policies: {
    displayName: string;
    conditions: {
      displayName: string;
      conditionThreshold: {
        filter: string;
        comparison: string;
        thresholdValue: number;
        duration: string;
      };
    }[];
    notificationChannels: string[];
  }[];
}

// Production configuration for Henry Reed AI Platform
export const henryReedAIGCPConfig: GCPBackendConfig = {
  project: {
    id: 'henryreed-ai-platform',
    name: 'Henry Reed AI Platform',
    region: 'us-central1',
    zone: 'us-central1-a'
  },
  services: {
    cloudStorage: {
      buckets: [
        {
          name: 'henryreed-ai-downloads',
          location: 'US',
          storageClass: 'STANDARD',
          versioning: true,
          cors: [
            {
              origin: ['https://henryreed.ai', 'https://*.henryreed.ai'],
              method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
              responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With'],
              maxAgeSeconds: 3600
            }
          ],
          permissions: [
            {
              role: 'roles/storage.objectViewer',
              members: ['allUsers']
            },
            {
              role: 'roles/storage.objectAdmin',
              members: ['serviceAccount:download-service@henryreed-ai-platform.iam.gserviceaccount.com']
            }
          ]
        },
        {
          name: 'henryreed-ai-terraform-downloads',
          location: 'US',
          storageClass: 'STANDARD',
          versioning: true,
          cors: [
            {
              origin: ['https://henryreed.ai'],
              method: ['GET', 'OPTIONS'],
              responseHeader: ['Content-Type'],
              maxAgeSeconds: 3600
            }
          ],
          permissions: [
            {
              role: 'roles/storage.objectViewer',
              members: ['allUsers']
            }
          ]
        },
        {
          name: 'henryreed-ai-security-downloads',
          location: 'US',
          storageClass: 'STANDARD',
          versioning: true,
          cors: [
            {
              origin: ['https://henryreed.ai'],
              method: ['GET', 'OPTIONS'],
              responseHeader: ['Content-Type'],
              maxAgeSeconds: 3600
            }
          ],
          permissions: [
            {
              role: 'roles/storage.objectViewer',
              members: ['allUsers']
            }
          ]
        },
        {
          name: 'henryreed-ai-cdr-downloads',
          location: 'US',
          storageClass: 'STANDARD',
          versioning: true,
          cors: [
            {
              origin: ['https://henryreed.ai'],
              method: ['GET', 'OPTIONS'],
              responseHeader: ['Content-Type'],
              maxAgeSeconds: 3600
            }
          ],
          permissions: [
            {
              role: 'roles/storage.objectViewer',
              members: ['allUsers']
            }
          ]
        }
      ],
      defaultRegion: 'us-central1',
      lifecycle: [
        {
          condition: {
            age: 365
          },
          action: {
            type: 'SetStorageClass',
            storageClass: 'NEARLINE'
          }
        },
        {
          condition: {
            age: 1095
          },
          action: {
            type: 'Delete'
          }
        }
      ]
    },
    cloudFunctions: {
      functions: [
        {
          name: 'download-handler',
          trigger: {
            type: 'http'
          },
          entryPoint: 'handleDownload',
          environmentVariables: {
            BUCKET_NAME: 'henryreed-ai-downloads',
            LOG_LEVEL: 'INFO'
          },
          serviceAccountEmail: 'download-service@henryreed-ai-platform.iam.gserviceaccount.com'
        },
        {
          name: 'terraform-generator',
          trigger: {
            type: 'http'
          },
          entryPoint: 'generateTerraform',
          environmentVariables: {
            TERRAFORM_BUCKET: 'henryreed-ai-terraform-downloads',
            TEMPLATE_PATH: '/terraform-templates'
          },
          serviceAccountEmail: 'download-service@henryreed-ai-platform.iam.gserviceaccount.com'
        },
        {
          name: 'detection-scripts-generator',
          trigger: {
            type: 'http'
          },
          entryPoint: 'generateDetectionScripts',
          environmentVariables: {
            SECURITY_BUCKET: 'henryreed-ai-security-downloads',
            SCRIPTS_PATH: '/detection-scripts'
          },
          serviceAccountEmail: 'download-service@henryreed-ai-platform.iam.gserviceaccount.com'
        },
        {
          name: 'cdr-package-generator',
          trigger: {
            type: 'http'
          },
          entryPoint: 'generateCDRPackage',
          environmentVariables: {
            CDR_BUCKET: 'henryreed-ai-cdr-downloads',
            CDR_CONFIG_URL: 'https://raw.githubusercontent.com/hankthebldr/CDR/refs/heads/master/cdr.yml'
          },
          serviceAccountEmail: 'download-service@henryreed-ai-platform.iam.gserviceaccount.com'
        },
        {
          name: 'analytics-tracker',
          trigger: {
            type: 'pubsub',
            resource: 'projects/henryreed-ai-platform/topics/download-events'
          },
          entryPoint: 'trackDownload',
          environmentVariables: {
            FIRESTORE_COLLECTION: 'download_analytics'
          },
          serviceAccountEmail: 'analytics-service@henryreed-ai-platform.iam.gserviceaccount.com'
        }
      ],
      runtime: 'nodejs18',
      memory: '512MB',
      timeout: 300
    },
    cloudRun: {
      services: [
        {
          name: 'download-api',
          image: 'gcr.io/henryreed-ai-platform/download-api:latest',
          port: 8080,
          environmentVariables: {
            PROJECT_ID: 'henryreed-ai-platform',
            CORS_ORIGINS: 'https://henryreed.ai,https://*.henryreed.ai'
          },
          serviceAccountEmail: 'download-service@henryreed-ai-platform.iam.gserviceaccount.com',
          allowUnauthenticated: true
        }
      ],
      minInstances: 0,
      maxInstances: 10,
      cpuLimit: '1000m',
      memoryLimit: '512Mi'
    },
    firestore: {
      collections: [
        {
          name: 'download_sessions',
          indexes: [
            {
              fields: [
                { fieldPath: 'timestamp', order: 'DESCENDING' },
                { fieldPath: 'module', order: 'ASCENDING' }
              ],
              queryScope: 'COLLECTION'
            }
          ],
          security: [
            {
              path: '/download_sessions/{sessionId}',
              allow: ['read', 'create'],
              condition: 'request.auth != null'
            }
          ]
        },
        {
          name: 'download_analytics',
          indexes: [
            {
              fields: [
                { fieldPath: 'date', order: 'DESCENDING' },
                { fieldPath: 'module', order: 'ASCENDING' }
              ],
              queryScope: 'COLLECTION'
            }
          ],
          security: [
            {
              path: '/download_analytics/{docId}',
              allow: ['read', 'write'],
              condition: 'request.auth != null && request.auth.token.email.matches(".*@henryreed\\\\.ai$")'
            }
          ]
        }
      ],
      mode: 'native'
    },
    pubSub: {
      topics: [
        {
          name: 'download-events',
          messageRetentionDuration: '604800s' // 7 days
        },
        {
          name: 'user-interactions',
          messageRetentionDuration: '259200s' // 3 days
        }
      ],
      subscriptions: [
        {
          name: 'analytics-processor',
          topic: 'download-events',
          ackDeadlineSeconds: 60
        },
        {
          name: 'interaction-tracker',
          topic: 'user-interactions',
          ackDeadlineSeconds: 30
        }
      ]
    }
  },
  authentication: {
    serviceAccounts: [
      {
        accountId: 'download-service',
        displayName: 'Download Service Account',
        description: 'Service account for handling download requests and file generation',
        roles: [
          'roles/storage.objectAdmin',
          'roles/cloudsql.client',
          'roles/pubsub.publisher',
          'roles/datastore.user'
        ]
      },
      {
        accountId: 'analytics-service',
        displayName: 'Analytics Service Account',
        description: 'Service account for processing analytics and metrics',
        roles: [
          'roles/datastore.user',
          'roles/pubsub.subscriber',
          'roles/monitoring.metricWriter'
        ]
      }
    ],
    iam: [
      {
        resource: 'projects/henryreed-ai-platform',
        bindings: [
          {
            role: 'roles/cloudfunctions.invoker',
            members: ['allUsers']
          },
          {
            role: 'roles/run.invoker',
            members: ['allUsers']
          }
        ]
      }
    ]
  },
  monitoring: {
    logging: {
      logSinks: [
        {
          name: 'download-logs',
          destination: 'storage.googleapis.com/henryreed-ai-logs',
          filter: 'resource.type="cloud_function" AND resource.labels.function_name=~"download-.*"'
        }
      ],
      retention: {
        days: 30
      }
    },
    metrics: {
      customMetrics: [
        {
          name: 'download/requests_total',
          description: 'Total number of download requests',
          unit: '1',
          type: 'CUMULATIVE'
        },
        {
          name: 'download/active_sessions',
          description: 'Number of active download sessions',
          unit: '1',
          type: 'GAUGE'
        },
        {
          name: 'download/bandwidth_usage',
          description: 'Bandwidth usage for downloads',
          unit: 'By',
          type: 'CUMULATIVE'
        }
      ]
    },
    alerting: {
      policies: [
        {
          displayName: 'High Download Volume Alert',
          conditions: [
            {
              displayName: 'Download requests exceed threshold',
              conditionThreshold: {
                filter: 'resource.type="cloud_function" AND metric.type="custom.googleapis.com/download/requests_total"',
                comparison: 'COMPARISON_GREATER_THAN',
                thresholdValue: 1000,
                duration: '300s'
              }
            }
          ],
          notificationChannels: ['projects/henryreed-ai-platform/notificationChannels/email-alerts']
        },
        {
          displayName: 'Storage Quota Alert',
          conditions: [
            {
              displayName: 'Storage usage exceeds 80%',
              conditionThreshold: {
                filter: 'resource.type="gcs_bucket" AND metric.type="storage.googleapis.com/storage/total_bytes"',
                comparison: 'COMPARISON_GREATER_THAN',
                thresholdValue: 85899345920, // 80GB in bytes
                duration: '300s'
              }
            }
          ],
          notificationChannels: ['projects/henryreed-ai-platform/notificationChannels/email-alerts']
        }
      ]
    }
  }
};

// Development/Testing configuration
export const henryReedAIGCPDevConfig: Partial<GCPBackendConfig> = {
  project: {
    id: 'henryreed-ai-dev',
    name: 'Henry Reed AI Development',
    region: 'us-central1',
    zone: 'us-central1-a'
  },
  services: {
    cloudStorage: {
      buckets: [
        {
          name: 'henryreed-ai-dev-downloads',
          location: 'US',
          storageClass: 'STANDARD',
          versioning: false,
          cors: [
            {
              origin: ['http://localhost:3000', 'https://localhost:3000'],
              method: ['GET', 'POST', 'OPTIONS'],
              responseHeader: ['Content-Type', 'Authorization'],
              maxAgeSeconds: 300
            }
          ],
          permissions: [
            {
              role: 'roles/storage.objectViewer',
              members: ['allUsers']
            }
          ]
        }
      ],
      defaultRegion: 'us-central1',
      lifecycle: [
        {
          condition: {
            age: 7 // Delete after 7 days in dev
          },
          action: {
            type: 'Delete'
          }
        }
      ]
    },
    cloudFunctions: {
      functions: [],
      runtime: 'nodejs18',
      memory: '256MB',
      timeout: 60
    },
    cloudRun: {
      services: [],
      minInstances: 0,
      maxInstances: 1,
      cpuLimit: '1',
      memoryLimit: '512Mi'
    },
    firestore: {
      collections: [],
      mode: 'native'
    },
    pubSub: {
      topics: [],
      subscriptions: []
    }
  }
};

export default henryReedAIGCPConfig;
