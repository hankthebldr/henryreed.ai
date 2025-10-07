import { Request, Response } from 'express';
import { BigQuery } from '@google-cloud/bigquery';
import { ok, err, withRequestMeta } from '../../common/response';

// Initialize client once per instance
const defaultBQ = new BigQuery();

// GET /api/v1/bq/health
export async function health(req: Request, res: Response) {
  const meta = withRequestMeta(req);
  return res.json(ok(meta, {
    status: 'healthy',
    service: 'bigquery-export',
    timestamp: new Date().toISOString()
  }));
}

// POST /api/v1/bq/export
// Body: { projectId?, dataset?, table?, records: any[], metadata? }
export async function exportToBigQuery(req: Request, res: Response) {
  const meta = withRequestMeta(req);
  try {
    const body = req.body || {};
    const projectId: string | undefined = body.projectId || process.env.BIGQUERY_PROJECT_ID || process.env.GCLOUD_PROJECT;
    const dataset: string = body.dataset || process.env.BIGQUERY_DATASET || 'cortex_dc_analytics';
    const table: string = body.table || process.env.BIGQUERY_TABLE || 'user_interactions';
    const records: any[] = Array.isArray(body.records) ? body.records : [];
    const extraMeta: Record<string, any> = body.metadata || {};

    if (!records.length) {
      return res.status(400).json(err(meta, 'invalid-argument', 'records[] is required and must not be empty'));
    }

    // Use project-specific client if provided, else default client
    const bigquery = projectId ? new BigQuery({ projectId }) : defaultBQ;
    const datasetRef = bigquery.dataset(dataset);
    const tableRef = datasetRef.table(table);

    // Ensure table exists with schema
    const [exists] = await tableRef.exists();
    if (!exists) {
      // Schema based on current exporter + canonical additions
      const schema = [
        { name: 'id', type: 'STRING', mode: 'REQUIRED' },
        { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
        { name: 'event_type', type: 'STRING', mode: 'REQUIRED' },
        { name: 'component', type: 'STRING', mode: 'NULLABLE' },
        { name: 'action', type: 'STRING', mode: 'NULLABLE' },
        { name: 'user_id', type: 'STRING', mode: 'NULLABLE' },
        { name: 'session_id', type: 'STRING', mode: 'NULLABLE' },
        { name: 'pov_id', type: 'STRING', mode: 'NULLABLE' },
        { name: 'trr_id', type: 'STRING', mode: 'NULLABLE' },
        { name: 'scenario_id', type: 'STRING', mode: 'NULLABLE' },
        { name: 'command', type: 'STRING', mode: 'NULLABLE' },
        { name: 'args', type: 'STRING', mode: 'NULLABLE' },
        { name: 'result', type: 'STRING', mode: 'NULLABLE' },
        { name: 'execution_time_ms', type: 'INTEGER', mode: 'NULLABLE' },
        { name: 'error_message', type: 'STRING', mode: 'NULLABLE' },
        { name: 'metadata', type: 'JSON', mode: 'NULLABLE' },
        { name: 'region', type: 'STRING', mode: 'NULLABLE' },
        { name: 'theatre', type: 'STRING', mode: 'NULLABLE' },
        { name: 'user_agent', type: 'STRING', mode: 'NULLABLE' },
        { name: 'ip_address', type: 'STRING', mode: 'NULLABLE' },
        { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' }
      ];
      await tableRef.create({ schema });
    }

    const processed = records.map((record: any, idx: number) => {
      const out: Record<string, any> = { ...record };
      if (!out.id) out.id = `${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 8)}`;
      if (!out.timestamp) out.timestamp = new Date().toISOString();
      out.created_at = new Date().toISOString();

      // Normalize fields
      if (out.args && Array.isArray(out.args)) {
        out.args = JSON.stringify(out.args);
      }
      if (out.metadata && typeof out.metadata === 'object') {
        // BigQuery JSON supports object; for compatibility, keep as object
        // If your table expects string, use: out.metadata = JSON.stringify(out.metadata);
      }
      return out;
    });

    // Insert rows
    await tableRef.insert(processed, {
      skipInvalidRows: false,
      ignoreUnknownValues: true
    });

    const jobId = `export_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return res.json(ok(meta, {
      success: true,
      recordsExported: processed.length,
      recordsWithErrors: 0,
      bigqueryJobId: jobId,
      metadata: { dataset, table, projectId, ...extraMeta }
    }));
  } catch (e: any) {
    const message = e?.message || 'BigQuery export error';
    return res.status(500).json(err(meta, 'bq-insert-failed', message));
  }
}
