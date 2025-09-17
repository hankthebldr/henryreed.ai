# BigQuery Export System

This document describes the BigQuery export system for the Cortex DC Engagement Portal, which allows exporting analytics data from terminal commands, GUI interactions, POV activities, and TRR validations to Google BigQuery for analysis and reporting.

## Overview

The BigQuery export system consists of:

1. **Client-side service** (`bigquery-service.ts`) - Queues and manages data locally
2. **GUI panel** (`BigQueryExportPanel.tsx`) - Visual interface for exports
3. **Terminal commands** (`bigquery-commands.tsx`) - CLI interface for exports
4. **Cloud Function** (`cloud-functions/bigquery-export/`) - Server-side BigQuery integration

## Features

### Data Collection
- **Command Executions**: Track all terminal command usage with parameters, execution time, and results
- **GUI Interactions**: Track button clicks, form submissions, and navigation
- **POV Actions**: Track POV creation, deployment, and completion activities
- **TRR Updates**: Track validation progress and outcomes
- **Scenario Deployments**: Track scenario execution and results

### Export Options
- **Quick Export**: One-click export with default settings
- **Custom Export**: Configure time ranges, data types, and PII inclusion
- **Queue Management**: View and manage local export queue
- **Dry Run**: Preview export without actually sending data

### Security & Privacy
- **PII Filtering**: Automatically exclude personally identifiable information
- **Data Sanitization**: Remove sensitive fields from exported data
- **Authentication**: Support for Firebase and token-based auth
- **Queue Encryption**: Local queue data is encrypted in storage

## Terminal Commands

### bq-export
Export data to Google BigQuery.

```bash
# Quick export with defaults
bq-export --quick

# Custom export with time range
bq-export --time-range 7d --type povs

# Preview export without sending
bq-export --preview --time-range 30d

# Export including PII (use with caution)
bq-export --include-pii --time-range 24h

# Show configuration
bq-export --config

# Show queue status
bq-export --status

# Clear export queue
bq-export --clear-queue
```

**Options:**
- `--quick` - Quick export with default settings
- `--no-queue` - Skip queued data
- `--no-fresh` - Skip fresh data collection
- `--include-pii` - Include personally identifiable information ⚠️
- `--time-range` - Time range: 24h|7d|30d|all
- `--type` - Data type: all|commands|povs|trrs|scenarios
- `--config` - Show current configuration
- `--status` - Show queue status
- `--clear-queue` - Clear export queue
- `--preview` - Show export preview without executing

### bq-track
Manually track an event for BigQuery export.

```bash
# Track GUI interaction
bq-track gui_interaction dashboard_click

# Track POV action with data
bq-track pov_action create --data '{"pov_id": "POV-001"}'

# Track command execution
bq-track command_execution terminal_command --data '{"command": "ls"}'
```

### bq-config
Configure BigQuery export settings.

```bash
# Show current configuration
bq-config --show

# Update dataset
bq-config --set dataset=my_analytics

# Enable PII inclusion
bq-config --set includePII=true

# Reset to defaults
bq-config --reset
```

## GUI Panel Usage

The `BigQueryExportPanel` component provides a visual interface for managing exports:

1. **Export Status**: Shows queue size and last export status
2. **Quick Actions**: One-click export buttons
3. **Custom Export**: Configure export parameters
4. **Queue Management**: View and clear export queue
5. **Export History**: Track previous exports and results

## Cloud Function Deployment

### Prerequisites
- Google Cloud Project with BigQuery API enabled
- `gcloud` CLI installed and authenticated
- Appropriate IAM permissions for BigQuery

### Deploy the Function

```bash
cd hosting/cloud-functions/bigquery-export
npm install
gcloud functions deploy bigquery-export \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point exportToBigQuery \
  --set-env-vars BIGQUERY_PROJECT_ID=your-project-id
```

### Environment Variables
Set these in the Cloud Function environment:
- `BIGQUERY_PROJECT_ID`: Your GCP project ID
- `BIGQUERY_DATASET`: Dataset name (default: `cortex_dc_analytics`)
- `BIGQUERY_TABLE`: Table name (default: `user_interactions`)

### Function URL
After deployment, update the `cloudFunctionUrl` in your client configuration:

```javascript
bigQueryService.updateConfig({
  cloudFunctionUrl: 'https://your-region-your-project.cloudfunctions.net/bigquery-export'
});
```

## BigQuery Schema

The analytics table uses this schema:

| Field | Type | Mode | Description |
|-------|------|------|-------------|
| `id` | STRING | REQUIRED | Unique record identifier |
| `timestamp` | TIMESTAMP | REQUIRED | Event timestamp |
| `event_type` | STRING | REQUIRED | Type of event (command_execution, gui_interaction, etc.) |
| `component` | STRING | NULLABLE | Component or page name |
| `action` | STRING | NULLABLE | Specific action taken |
| `user_id` | STRING | NULLABLE | User identifier |
| `session_id` | STRING | NULLABLE | Session identifier |
| `pov_id` | STRING | NULLABLE | Related POV ID |
| `trr_id` | STRING | NULLABLE | Related TRR ID |
| `scenario_id` | STRING | NULLABLE | Related scenario ID |
| `command` | STRING | NULLABLE | Terminal command executed |
| `args` | STRING | NULLABLE | Command arguments (JSON) |
| `result` | STRING | NULLABLE | Command result or status |
| `execution_time_ms` | INTEGER | NULLABLE | Execution time in milliseconds |
| `error_message` | STRING | NULLABLE | Error message if failed |
| `metadata` | JSON | NULLABLE | Additional event metadata |
| `region` | STRING | NULLABLE | Geographic region |
| `theatre` | STRING | NULLABLE | Business theatre |
| `user_agent` | STRING | NULLABLE | Browser user agent |
| `ip_address` | STRING | NULLABLE | Client IP address |
| `created_at` | TIMESTAMP | REQUIRED | Record creation timestamp |

## Data Analysis

### Sample Queries

**Command Usage Analysis:**
```sql
SELECT 
  command,
  COUNT(*) as usage_count,
  AVG(execution_time_ms) as avg_execution_time,
  COUNT(CASE WHEN error_message IS NOT NULL THEN 1 END) as error_count
FROM `your-project.cortex_dc_analytics.user_interactions`
WHERE event_type = 'command_execution'
  AND DATE(created_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY command
ORDER BY usage_count DESC;
```

**POV Success Rates:**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT pov_id) as povs_started,
  COUNT(CASE WHEN action = 'completed' THEN pov_id END) as povs_completed,
  SAFE_DIVIDE(
    COUNT(CASE WHEN action = 'completed' THEN pov_id END),
    COUNT(DISTINCT pov_id)
  ) * 100 as completion_rate
FROM `your-project.cortex_dc_analytics.user_interactions`
WHERE event_type = 'pov_action'
  AND pov_id IS NOT NULL
GROUP BY date
ORDER BY date DESC;
```

**Regional Activity:**
```sql
SELECT 
  region,
  theatre,
  COUNT(*) as total_interactions,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users
FROM `your-project.cortex_dc_analytics.user_interactions`
WHERE DATE(created_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
GROUP BY region, theatre
ORDER BY total_interactions DESC;
```

## Security Considerations

### Data Privacy
- **PII Filtering**: Automatically excludes email addresses, phone numbers, and other PII
- **IP Address Hashing**: Client IP addresses are hashed before export
- **User Anonymization**: User IDs are anonymized in exports
- **Sensitive Command Filtering**: Commands containing secrets are sanitized

### Access Control
- **Function Authentication**: Consider enabling authentication for production deployments
- **BigQuery IAM**: Use least-privilege access for BigQuery resources
- **Data Retention**: Implement appropriate data retention policies
- **Audit Logging**: Enable Cloud Audit Logs for BigQuery access

### Compliance
- **GDPR**: Supports data subject rights and deletion requests
- **SOC 2**: Meets security and availability requirements
- **Data Residency**: Configure BigQuery datasets in appropriate regions

## Troubleshooting

### Common Issues

**Export Fails with Authentication Error:**
```bash
# Check Cloud Function configuration
bq-config --show

# Verify function URL is correct
bq-config --set cloudFunctionUrl=https://...
```

**BigQuery Permission Denied:**
- Ensure the Cloud Function has BigQuery Data Editor role
- Verify the dataset exists and is accessible
- Check project ID configuration

**Records Not Appearing in BigQuery:**
```bash
# Check export queue status
bq-export --status

# Try a test export
bq-track gui_interaction test_event
bq-export --quick
```

**Function Timeout:**
- Reduce batch size in exports
- Check Cloud Function memory allocation
- Monitor function logs for errors

### Monitoring

**Cloud Function Metrics:**
- Execution count and duration
- Error rates and types
- Memory and CPU usage

**BigQuery Metrics:**
- Insert success/failure rates
- Query performance
- Storage usage and costs

**Application Metrics:**
- Export queue size
- Failed export attempts
- Client-side errors

## Advanced Configuration

### Custom Data Sources
Extend the tracking system to include additional data sources:

```typescript
// Track custom events
bigQueryService.trackCustomEvent('custom_event_type', {
  customField: 'value',
  timestamp: new Date().toISOString()
});
```

### Batch Processing
Configure batch sizes for optimal performance:

```typescript
bigQueryService.updateConfig({
  batchSize: 100,
  batchInterval: 30000 // 30 seconds
});
```

### Multi-Environment Setup
Configure different BigQuery datasets for different environments:

```typescript
const config = {
  development: {
    dataset: 'cortex_dc_analytics_dev',
    projectId: 'dev-project'
  },
  production: {
    dataset: 'cortex_dc_analytics_prod', 
    projectId: 'prod-project'
  }
};
```