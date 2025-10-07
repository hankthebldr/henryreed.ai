import { Router } from 'express';
import * as admin from 'firebase-admin';

export const exportRouter = Router();

interface ExportPayload {
  dataset: string;
  table: string;
  rows: any[];
  metadata?: Record<string, any>;
}

exportRouter.post('/bigquery', async (req, res): Promise<void> => {
  const payload = req.body as ExportPayload;
  if (!payload?.dataset || !payload?.table || !Array.isArray(payload?.rows)) {
    res.status(400).json({ success: false, error: 'dataset, table, and rows are required' });
    return;
  }

  try {
    // Fallback export: write to Cloud Storage as JSON for downstream ingestion
    const bucket = admin.storage().bucket();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const path = `exports/${payload.dataset}/${payload.table}/${timestamp}.json`;
    const file = bucket.file(path);

    const content = JSON.stringify({
      dataset: payload.dataset,
      table: payload.table,
      rows: payload.rows,
      metadata: payload.metadata || {},
      exportedAt: new Date().toISOString(),
    });

    await file.save(content, { contentType: 'application/json' });

    // Generate a signed URL for download (15 minutes)
    let signedUrl: string | undefined;
    try {
      const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 15 * 60 * 1000 });
      signedUrl = url;
    } catch {}

    // Log export
    try {
      await admin.firestore().collection('exports').add({
        dataset: payload.dataset,
        table: payload.table,
        rowCount: Array.isArray(payload.rows) ? payload.rows.length : 0,
        storagePath: path,
        downloadUrl: signedUrl,
        metadata: payload.metadata || {},
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch {}

    res.json({ success: true, recordsExported: Array.isArray(payload.rows) ? payload.rows.length : 0, downloadUrl: signedUrl, storagePath: path });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Export failed' });
    return;
  }
});