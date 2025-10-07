# BigQuery Event Schema (User-Centric, Accumulative)

Objective
- A single canonical event schema that accumulates all user-centric interactions across modules (Terminal, POV, TRR, Scenario, Content, XSIAM) into partitioned BigQuery tables.

Canonical Row
```
record BigQueryRow {
  timestamp: TIMESTAMP,           // event time
  id: STRING,                     // unique id for idempotency
  user_id: STRING,                // Firebase uid (or anonymous)
  session_id: STRING,             // client session id
  event_type: STRING,             // enum: command_execution|pov_action|trr_update|scenario_deployment|gui_interaction|content_action|xsiam_action
  component: STRING,              // optional UI/feature name
  action: STRING,                 // verb (e.g., create, update, export)
  event_data: JSON,               // structured payload (sanitized)
  metadata: JSON,                 // client_info, performance_metrics
  result: STRING,                 // short summary or status
  execution_time_ms: INTEGER,     // optional for commands
  error_message: STRING,          // if any
  region: STRING,                 // cloud region
  theatre: STRING,                // optional business partitioning
  user_agent: STRING,             // from client
  ip_address: STRING,             // if captured server-side
  created_at: TIMESTAMP           // insertion time
}
```

Table Strategy
- Dataset per env: {project}.{dataset} where dataset in {events_dev, events_stage, events_prod} or single dataset with separate tables
- Tables
  - events_all (canonical, partitioned by DATE(timestamp), clustered by user_id, event_type)
  - Optional domain tables (views or materialized views): trr_events, scenario_events, content_events for faster domain analytics

Insertion Rules
- All inserts supply id; the function checks for duplicates to avoid re-insertion (or use BigQuery DML MERGE when batching)
- Sanitize event_data to remove PII unless includePII flag is explicitly set and authorized

Exporter Function (HTTP)
- Input: { projectId, dataset, table, records[], metadata? }
- Validates schema; creates table if missing; inserts rows; returns jobId and counts
- Health endpoint: GET /api/v1/bq/health

Client/Event Producers
- Leverage packages/shared types to construct BigQueryRow consistently
- Existing hosting/lib/bigquery-service.ts already matches most of this; extend event_type for content/xsiam

Sample Query Snippets
```sql path=null start=null
-- User activity by type per day
SELECT DATE(timestamp) as d, event_type, COUNT(*) cnt
FROM `{{PROJECT}}.{{DATASET}}.events_all`
WHERE user_id = @uid AND timestamp >= @start
GROUP BY d, event_type
ORDER BY d;
```

```sql path=null start=null
-- TRR funnel (created→validated→signed-off)
SELECT user_id, COUNTIF(action='create') created,
       COUNTIF(action='validate') validated,
       COUNTIF(action='signoff') signed_off
FROM `{{PROJECT}}.{{DATASET}}.events_all`
WHERE event_type='trr_update' AND timestamp >= @start
GROUP BY user_id;
```
