# External Integration Architecture Documentation

This document provides comprehensive documentation of all external system integrations for the Henry Reed AI platform, including schemas, APIs, deployment processes, storage patterns, and authentication mechanisms.

## Table of Contents

1. [GCP Backend Schema](#gcp-backend-schema)
2. [WebCLISchema Interface](#webcli-schema-interface)
3. [Cloud Functions API](#cloud-functions-api)
4. [Firebase Integration](#firebase-integration)
5. [Storage Patterns](#storage-patterns)
6. [Authentication Patterns](#authentication-patterns)
7. [Integration Flow Diagrams](#integration-flow-diagrams)

---

## GCP Backend Schema

### Core Interface Definition

The `GCPBackendSchema` interface defines the structure for all Google Cloud Platform backend interactions:

```typescript
export interface GCPBackendSchema {
  service: string;                    // Service name identifier
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'; // HTTP method
  endpoint: string;                   // API endpoint path
  parameters?: Record<string, any>;   // Optional request parameters
  authentication: {
    type: 'service_account' | 'oauth2' | 'api_key';
    credentials: string;              // Credential placeholder
  };
  storage: {
    bucket: string;                   // Target GCS bucket
    path: string;                     // Storage path within bucket
  };
  metadata?: Record<string, any>;     // Additional metadata
}
```

### Implementation Examples

#### Terraform Downloads
```typescript
const terraformBackendSchema: GCPBackendSchema = {
  service: 'terraform-templates',
  method: 'GET',
  endpoint: '/api/v1/terraform/templates',
  parameters: {
    providers: ['aws', 'gcp', 'azure'],
    includeKubernetes: true
  },
  authentication: {
    type: 'service_account',
    credentials: '{{GCP_SERVICE_ACCOUNT_KEY}}'
  },
  storage: {
    bucket: 'henryreed-ai-downloads',
    path: 'terraform-templates'
  },
  metadata: {
    category: 'infrastructure',
    type: 'terraform',
    version: '1.0.0'
  }
}
```

#### Detection Scripts
```typescript
const detectionBackendSchema: GCPBackendSchema = {
  service: 'security-detection',
  method: 'GET',
  endpoint: '/api/v1/detection/scripts',
  parameters: {
    modules: ['malware', 'network', 'anomaly', 'compliance']
  },
  authentication: {
    type: 'service_account',
    credentials: '{{GCP_SERVICE_ACCOUNT_KEY}}'
  },
  storage: {
    bucket: 'henryreed-ai-security-downloads',
    path: 'detection-scripts'
  },
  metadata: {
    category: 'security',
    type: 'detection-scripts',
    version: '2.1.0'
  }
}
```

---

## WebCLI Schema Interface

### Core Interface Definition

The `WebCLISchema` interface manages web-based CLI interactions:

```typescript
export interface WebCLISchema {
  command: string;           // Executed command
  module: string;            // Target module (terraform, detection, cdr)
  flags: string[];          // Command flags array
  backend: {
    service: string;         // Backend service identifier
    endpoint: string;        // API endpoint URL
    method: string;          // HTTP method
    authentication: {
      type: string;          // Authentication type
      token?: string;        // Optional auth token placeholder
    };
  };
  gcp: {
    project_id: string;      // GCP project ID
    region: string;          // Target GCP region
    service_account: string; // Service account email
    apis: string[];          // Required GCP APIs
  };
  storage: {
    bucket: string;          // Target storage bucket
    object: string;          // Object path/name
    permissions: string[];   // Required permissions
  };
  metadata: {
    user_session: string;    // Session identifier
    timestamp: string;       // Request timestamp
    user_agent: string;      // Client user agent
    ip_address: string;      // Client IP (placeholder)
  };
}
```

### Schema Generation Function

```typescript
export const generateCLISchema = (
  command: string, 
  module: string, 
  flags: string[]
): WebCLISchema => {
  return {
    command,
    module,
    flags,
    backend: {
      service: 'henryreed-ai-api',
      endpoint: `/api/v1/downloads/${module}`,
      method: 'GET',
      authentication: {
        type: 'bearer_token',
        token: '{{API_TOKEN}}'
      }
    },
    gcp: {
      project_id: 'henryreed-ai-platform',
      region: 'us-central1',
      service_account: 'download-service@henryreed-ai-platform.iam.gserviceaccount.com',
      apis: [
        'storage.googleapis.com',
        'compute.googleapis.com',
        'container.googleapis.com',
        'logging.googleapis.com'
      ]
    },
    storage: {
      bucket: `henryreed-ai-${module}-downloads`,
      object: `${module}-${Date.now()}.tar.gz`,
      permissions: ['storage.objects.get', 'storage.objects.list']
    },
    metadata: {
      user_session: Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString(),
      user_agent: 'POV-CLI/1.0.0',
      ip_address: '{{CLIENT_IP}}'
    }
  };
};
```

---

## Cloud Functions API

### CloudFunctionsAPI Class

The `CloudFunctionsAPI` class provides comprehensive integration with Google Cloud Functions:

```typescript
export class CloudFunctionsAPI {
  private readonly baseUrl: string;
  private readonly projectId: string;

  constructor(projectId: string = 'henryreedai') {
    this.projectId = projectId;
    this.baseUrl = `https://us-central1-${projectId}.cloudfunctions.net`;
  }
}
```

### Core Methods

#### 1. Scenario Deployment
```typescript
async deployScenario(command: ScenarioCommand): Promise<{
  success: boolean;
  deploymentId?: string;
  message: string;
  estimatedCompletion?: string;
}> {
  const response = await fetch(`${this.baseUrl}/scenario-deploy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  return await response.json();
}
```

#### 2. Deployment Status Monitoring
```typescript
async getDeploymentStatus(deploymentId: string): Promise<{
  success: boolean;
  deployment?: ScenarioDeployment;
  message: string;
}> {
  const response = await fetch(`${this.baseUrl}/scenario-status/${deploymentId}`);
  return await response.json();
}
```

#### 3. Deployment Management
```typescript
// List all deployments
async listDeployments(): Promise<{
  success: boolean;
  deployments?: ScenarioDeployment[];
  message: string;
}>

// Validate scenario
async validateScenario(deploymentId: string): Promise<{
  success: boolean;
  results?: any;
  message: string;
}>

// Destroy scenario
async destroyScenario(deploymentId: string): Promise<{
  success: boolean;
  message: string;
}>

// Export scenario data
async exportScenarioData(deploymentId: string, format: 'json' | 'csv' | 'pdf'): Promise<{
  success: boolean;
  downloadUrl?: string;
  message: string;
}>
```

### Function Endpoints

The platform utilizes several Cloud Functions:

1. **scenario-deploy** - Deploy new scenarios
2. **scenario-status** - Check deployment status
3. **scenario-list** - List active deployments
4. **scenario-validate** - Run validation tests
5. **scenario-destroy** - Clean up resources
6. **scenario-export** - Export scenario data

---

## Firebase Integration

### Project Configuration

- **Project ID**: `henryreedai`
- **Region**: `us-central1`
- **Hosting URL**: `https://henryreedai.web.app`

### Hosting Configuration

```json
{
  "hosting": {
    "public": "hosting/out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(html|json)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600, s-maxage=3600"
          }
        ]
      }
    ]
  }
}
```

### Deployment Process

#### Automated Deployment Script
```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

# Navigate to hosting directory
cd hosting

echo "📦 Building Next.js application..."
npm run build

# Navigate back to root for Firebase deployment
cd ..

echo "🔥 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌐 Your site is available at: https://henryreedai.web.app"
```

#### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "deploy": "npm run build && firebase deploy --only hosting",
    "deploy:preview": "npm run build && firebase hosting:channel:deploy preview",
    "firebase:serve": "firebase serve",
    "firebase:emulators": "firebase emulators:start --only hosting"
  }
}
```

#### Next.js Configuration
```typescript
const nextConfig = {
  output: 'export',           // Static export mode
  trailingSlash: true,        // Required for Firebase Hosting
  skipTrailingSlashRedirect: true,
  distDir: 'out',            // Output directory
  images: {
    unoptimized: true        // Required for static hosting
  }
};
```

---

## Storage Patterns

### Bucket Architecture

The platform uses a structured bucket system for different content types:

#### 1. Primary Downloads Bucket
```typescript
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
  ]
}
```

#### 2. Terraform-Specific Bucket
```typescript
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
  ]
}
```

#### 3. Security Downloads Bucket
```typescript
{
  name: 'henryreed-ai-security-downloads',
  location: 'US',
  storageClass: 'STANDARD',
  versioning: true
}
```

#### 4. CDR Platform Bucket
```typescript
{
  name: 'henryreed-ai-cdr-downloads',
  location: 'US',
  storageClass: 'STANDARD',
  versioning: true
}
```

### Download URL Generation

The platform generates download URLs using the following pattern:

```typescript
const initiateDownload = async (
  module: string, 
  flags: string[], 
  backendSchema: GCPBackendSchema
) => {
  const timestamp = new Date().toISOString();
  const sessionId = Math.random().toString(36).substring(2, 15);
  
  return {
    downloadUrl: `${backendSchema.storage.bucket}/${backendSchema.storage.path}/${module}`,
    sessionId,
    timestamp,
    metadata: backendSchema.metadata
  };
};
```

### Lifecycle Management

```typescript
{
  lifecycle: [
    {
      condition: { age: 365 },
      action: { type: 'SetStorageClass', storageClass: 'NEARLINE' }
    },
    {
      condition: { age: 1095 },
      action: { type: 'Delete' }
    }
  ]
}
```

---

## Authentication Patterns

### Service Account Configuration

#### Primary Download Service Account
```typescript
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
}
```

#### Analytics Service Account
```typescript
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
```

### IAM Policies

```typescript
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
```

### Authentication Types

The platform supports multiple authentication methods:

1. **Service Account Authentication**
   ```typescript
   {
     type: 'service_account',
     credentials: '{{GCP_SERVICE_ACCOUNT_KEY}}'
   }
   ```

2. **OAuth2 Authentication**
   ```typescript
   {
     type: 'oauth2',
     credentials: '{{OAUTH2_TOKEN}}'
   }
   ```

3. **API Key Authentication**
   ```typescript
   {
     type: 'api_key',
     credentials: '{{API_KEY}}'
   }
   ```

4. **Bearer Token Authentication**
   ```typescript
   {
     type: 'bearer_token',
     token: '{{API_TOKEN}}'
   }
   ```

### Bucket Permissions

#### Public Read Access
```typescript
{
  role: 'roles/storage.objectViewer',
  members: ['allUsers']
}
```

#### Service Account Admin Access
```typescript
{
  role: 'roles/storage.objectAdmin',
  members: ['serviceAccount:download-service@henryreed-ai-platform.iam.gserviceaccount.com']
}
```

---

## Integration Flow Diagrams

### Download Request Flow

```
User CLI Input
      ↓
WebCLISchema Generation
      ↓
GCPBackendSchema Creation
      ↓
Cloud Function Invocation
      ↓
Authentication Validation
      ↓
Storage Access
      ↓
URL Generation
      ↓
Response to User
```

### Scenario Deployment Flow

```
Scenario Command
      ↓
CloudFunctionsAPI.deployScenario()
      ↓
HTTP POST to /scenario-deploy
      ↓
GCP Resource Provisioning
      ↓
Status Monitoring
      ↓
Validation Execution
      ↓
Results Generation
```

### Firebase Hosting Deployment Flow

```
Local Development
      ↓
npm run build (Next.js Static Export)
      ↓
Output to /out directory
      ↓
firebase deploy --only hosting
      ↓
File Upload to Firebase Hosting
      ↓
CDN Distribution
      ↓
Live Website at henryreedai.web.app
```

---

## Environment Variables

### Required Configuration

```bash
# GCP Configuration
GCP_PROJECT_ID=henryreed-ai-platform
GCP_REGION=us-central1
GCP_SERVICE_ACCOUNT_KEY={{path_to_key}}

# API Configuration
API_TOKEN={{api_token}}
CLIENT_IP={{client_ip}}

# Storage Configuration
BUCKET_NAME=henryreed-ai-downloads
TERRAFORM_BUCKET=henryreed-ai-terraform-downloads
SECURITY_BUCKET=henryreed-ai-security-downloads
CDR_BUCKET=henryreed-ai-cdr-downloads

# Firebase Configuration
FIREBASE_PROJECT_ID=henryreedai
```

---

## Monitoring and Logging

### Custom Metrics

```typescript
{
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
}
```

### Alerting Policies

```typescript
{
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
      ]
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
      ]
    }
  ]
}
```

---

## Security Considerations

### CORS Configuration
- Restricted to henryreed.ai domain and subdomains
- Limited HTTP methods per bucket type
- Appropriate cache control headers

### Access Control
- Service accounts with minimal required permissions
- Public read access only where necessary
- Admin access restricted to service accounts

### Data Lifecycle
- Automatic transition to cheaper storage classes after 1 year
- Automatic deletion after 3 years
- Version control enabled for critical buckets

---

## Conclusion

This external integration architecture provides a comprehensive, secure, and scalable foundation for the Henry Reed AI platform. The modular design allows for easy extension and modification while maintaining security best practices and optimal performance.

The integration patterns documented here support:
- Scalable download management
- Secure authentication and authorization
- Efficient storage utilization
- Comprehensive monitoring and alerting
- Seamless Firebase hosting deployment
- Robust Cloud Functions integration

All components are designed to work together seamlessly while maintaining clear separation of concerns and following cloud-native best practices.
