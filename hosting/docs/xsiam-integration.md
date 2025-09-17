# XSIAM Tenant API Integration

This document describes the XSIAM API integration system for the Cortex DC Engagement Portal, which provides secure button-based configuration and programmatic access to XSIAM tenant data.

## Overview

The XSIAM integration system consists of:

1. **API Service** (`xsiam-api-service.ts`) - Secure credential management and API client
2. **React Component** (`XSIAMIntegrationPanel.tsx`) - Button-based UI for configuration
3. **Terminal Commands** (`xsiam-commands.tsx`) - CLI interface for XSIAM operations
4. **Local Encryption** - Secure credential storage with data integrity validation

## Features

### Secure Credential Management
- **Encrypted Storage**: Credentials stored locally with encryption and checksums
- **Connection Testing**: Automatic validation before credential storage
- **Data Integrity**: Checksum verification to prevent credential corruption
- **Session Management**: Persistent credentials across browser sessions

### API Operations
- **Health Monitoring**: System status, uptime, and component health
- **Security Analytics**: Incident data, threat analysis, and MITRE coverage
- **Custom Queries**: Execute XQL queries directly on tenant data
- **Real-time Data**: Direct API access for current security posture

### User Interface
- **Button-based Setup**: Easy credential configuration without complex forms
- **Visual Status**: Connection status with color-coded indicators
- **Tabbed Interface**: Organized access to setup, health, analytics, and queries
- **Quick Actions**: One-click data refresh and connection testing

## Getting Started

### 1. Button-based Configuration

Click the **🔗 Connect to XSIAM** button to set up your tenant connection:

**Required Fields:**
- **API Address**: Your XSIAM tenant API URL (e.g., `https://api-tenant.xdr.paloaltonetworks.com`)
- **API ID**: Authentication identifier from your XSIAM tenant
- **API Key**: Authentication key with appropriate permissions

**Optional Fields:**
- **Tenant Name**: Friendly name for identification
- **Region**: Geographic region (US, EU, APAC, UK, CA, AU)

### 2. Security Best Practices

**API Key Permissions:**
Create a dedicated API key with minimal required permissions:
- Health check access
- Analytics read access
- Query execution (if needed)
- Avoid admin or write permissions

**Network Security:**
- Ensure API endpoints use HTTPS
- Verify SSL certificates
- Use firewall rules if applicable

### 3. Connection Testing

After entering credentials, the system automatically:
- Validates credential format
- Tests API connectivity
- Stores encrypted credentials only on successful connection
- Displays connection status with color indicators

## Terminal Commands

### xsiam-connect
Configure XSIAM tenant connection.

```bash
# Interactive setup with help
xsiam-connect --help

# Configure connection
xsiam-connect --api-address https://api-tenant.xdr.paloaltonetworks.com \
              --api-id your-api-id \
              --api-key your-api-key \
              --tenant-name "Production Tenant" \
              --region us

# Check connection status
xsiam-connect --status

# Test existing connection
xsiam-connect --test

# Disconnect and clear credentials
xsiam-connect --disconnect
```

### xsiam-health
Get tenant health status and system metrics.

```bash
# Display health dashboard
xsiam-health

# JSON output for integration
xsiam-health --json

# Refresh health data
xsiam-health --refresh
```

**Sample Output:**
```
💓 XSIAM Tenant Health

HEALTHY    99.98%     23        87.3%
System     Uptime     Users     Storage

📊 Key Metrics
Incidents Processed: 1,247
Alerts Generated:    3,891  
Data Ingestion:      2.5 GB/h

🔧 System Components
✓ Data Ingestion     (120ms)
✓ Analytics Engine   (85ms)
✓ Alert Processing   (200ms)
✓ API Gateway        (50ms)
✓ Storage            operational
```

### xsiam-analytics
Get security analytics and threat metrics.

```bash
# Last 7 days analytics (default)
xsiam-analytics

# Custom time range
xsiam-analytics --time-range 30d

# Summary view only
xsiam-analytics --summary

# JSON output
xsiam-analytics --json --time-range 7d
```

**Sample Output:**
```
📊 XSIAM Analytics (7d)

156    142    4.2h    2.1%    8
Total  Rsld   Avg     FP      Crit

🎯 Top Threats
Malicious PowerShell        [high]     (45x)
Suspicious Network Activity  [medium]   (32x)
Credential Stuffing         [high]     (28x)
Lateral Movement            [critical] (15x)
Data Exfiltration Attempt   [critical] (12x)

🛡️ MITRE Detection Coverage
T1078 - Valid Accounts           ████████▌ 85%
T1059 - Command Line Interface   █████████▌ 92%
T1055 - Process Injection        ████████  78%
T1003 - Credential Dumping       █████████▌ 95%
```

### xsiam-query
Execute custom XQL queries.

```bash
# Basic query
xsiam-query "dataset = xdr_data | filter action_local_ip != null | comp count() by action_local_ip | limit 10"

# With time range and JSON output
xsiam-query "dataset = process_data | filter process_name contains \"powershell\"" --time-range 24h --json

# Authentication events
xsiam-query "dataset = auth_data | filter event_type = \"login_failed\" | comp count() by user_name" --limit 50
```

## API Endpoints

The service connects to standard XSIAM API endpoints:

### Health Endpoints
```
GET /public_api/v1/healthcheck
GET /public_api/v1/system/health
GET /public_api/v1/tenant/info
```

### Analytics Endpoints
```
GET /public_api/v1/analytics/summary?time_range=7d
GET /public_api/v1/metrics/incidents
GET /public_api/v1/metrics/threats
```

### Query Endpoints
```
POST /public_api/v1/query
POST /public_api/v1/xql/query
```

## Data Models

### Health Data Structure
```typescript
interface XSIAMHealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastUpdate: string;
  components: {
    name: string;
    status: 'operational' | 'degraded' | 'outage';
    responseTime?: number;
  }[];
  metrics: {
    incidentsProcessed: number;
    alertsGenerated: number;
    dataIngestionRate: number;
    storageUsed: number;
    activeUsers: number;
  };
}
```

### Analytics Data Structure
```typescript
interface XSIAMAnalyticsData {
  timeRange: string;
  summary: {
    totalIncidents: number;
    resolvedIncidents: number;
    averageResolutionTime: number;
    falsePositiveRate: number;
    criticalAlerts: number;
  };
  topThreats: {
    name: string;
    count: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
  detectionCoverage: {
    technique: string;
    coverage: number;
    lastSeen: string;
  }[];
}
```

## Security Implementation

### Credential Encryption
```typescript
// Encryption with integrity checking
const encryptedData = btoa(encodeURIComponent(JSON.stringify({
  data: btoa(credentials),
  timestamp: Date.now(),
  checksum: generateChecksum(credentials)
})));

// Storage in localStorage
localStorage.setItem('xsiam_credentials', encryptedData);
```

### API Authentication
```typescript
// XSIAM API authentication headers
const headers = {
  'Content-Type': 'application/json',
  'x-xdr-auth-id': credentials.apiId,
  'Authorization': credentials.apiKey,
  'x-xdr-timestamp': Date.now().toString(),
  'x-xdr-nonce': Math.random().toString(36).substr(2, 15)
};
```

### Data Validation
- **Format Validation**: URL, ID, and key format checking
- **Connection Testing**: Live API validation before storage
- **Integrity Checks**: Checksum verification on credential retrieval
- **Error Handling**: Graceful degradation on API failures

## Integration Examples

### React Component Integration
```tsx
import { XSIAMIntegrationPanel } from '../components/XSIAMIntegrationPanel';

function MyDashboard() {
  return (
    <div>
      <h1>Security Dashboard</h1>
      <XSIAMIntegrationPanel />
    </div>
  );
}
```

### Service Integration
```typescript
import { xsiamApiService } from '../lib/xsiam-api-service';

// Check if connected
if (xsiamApiService.isConfigured()) {
  // Get health data
  const health = await xsiamApiService.getHealthData();
  
  // Get analytics
  const analytics = await xsiamApiService.getAnalyticsData('7d');
  
  // Execute custom query
  const results = await xsiamApiService.executeQuery(
    'dataset = xdr_data | comp count() by action_type'
  );
}
```

### Terminal Integration
The XSIAM commands are automatically integrated into the terminal command system and can be accessed through:
- Command completion and help
- Category-based help (`help --category integration`)
- Alias support (`xql` for `xsiam-query`)

## Troubleshooting

### Connection Issues

**API Address Format:**
```bash
✓ Correct: https://api-tenant.xdr.paloaltonetworks.com
✗ Wrong:   api-tenant.xdr.paloaltonetworks.com
✗ Wrong:   http://api-tenant.xdr.paloaltonetworks.com
```

**Authentication Failures:**
1. Verify API ID and Key are correct
2. Check API key permissions in XSIAM tenant
3. Ensure API key is not expired
4. Test connection with `xsiam-connect --test`

**Network Issues:**
- Verify HTTPS access to XSIAM tenant
- Check firewall and proxy settings
- Confirm DNS resolution

### Data Issues

**Empty or Invalid Data:**
```bash
# Clear and reconfigure
xsiam-connect --disconnect
xsiam-connect --api-address https://... --api-id ... --api-key ...

# Test specific endpoints
xsiam-health
xsiam-analytics --summary
```

**Query Failures:**
```bash
# Test basic query first
xsiam-query "dataset = xdr_data | limit 1"

# Check XQL syntax
xsiam-query --help
```

### Credential Issues

**Corrupted Credentials:**
```bash
# Check current status
xsiam-connect --status

# Clear and reconfigure if needed
xsiam-connect --clear
```

**Permission Denied:**
- Verify API key has required permissions
- Check tenant access rights
- Ensure API key is active

## Advanced Configuration

### Custom API Endpoints
The service can be configured to use different API endpoints by modifying the service configuration:

```typescript
// Update API base paths
const customEndpoints = {
  health: '/custom_api/v1/health',
  analytics: '/custom_api/v1/analytics',
  query: '/custom_api/v1/custom_query'
};
```

### Batch Operations
Execute multiple queries efficiently:

```typescript
// Batch health and analytics
const [health, analytics] = await Promise.all([
  xsiamApiService.getHealthData(),
  xsiamApiService.getAnalyticsData('7d')
]);
```

### Error Recovery
Implement automatic retry logic:

```typescript
async function robustQuery(query: string, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await xsiamApiService.executeQuery(query);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

## Best Practices

### Security
1. **Dedicated API Keys**: Create specific keys for portal access
2. **Minimal Permissions**: Grant only necessary API access rights
3. **Regular Rotation**: Rotate API keys periodically
4. **Network Security**: Use VPN/private networks when possible

### Performance
1. **Caching**: Implement client-side caching for frequently accessed data
2. **Batch Requests**: Combine multiple API calls when possible
3. **Time Ranges**: Use appropriate time ranges for analytics queries
4. **Pagination**: Implement pagination for large result sets

### Monitoring
1. **Connection Health**: Regular connection testing
2. **API Rate Limits**: Monitor and respect API rate limits
3. **Error Tracking**: Log and monitor API failures
4. **Performance Metrics**: Track query execution times

### User Experience
1. **Loading States**: Show progress during API operations
2. **Error Messages**: Provide clear, actionable error messages
3. **Offline Mode**: Graceful degradation when API unavailable
4. **Quick Actions**: Provide shortcuts for common operations

This integration provides a secure, user-friendly way to connect your Cortex DC portal with XSIAM tenant data, enabling real-time security monitoring and analytics within your engagement workflow.