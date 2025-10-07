import { Router } from 'express';
import * as admin from 'firebase-admin';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import crypto from 'crypto';

export const trrRouter = Router();

interface TRRExportPayload {
  format?: 'pdf' | 'docx';
  trrId?: string;
  data?: Record<string, any>;
  filename?: string;
}

// POST /api/trr/export
trrRouter.post('/export', async (req, res): Promise<void> => {
  const { format = 'pdf', trrId, data, filename } = (req.body || {}) as TRRExportPayload;
  const content = data || { trrId, exportedAt: new Date().toISOString() };

  try {
    const bucket = admin.storage().bucket();
    const baseName = filename || (trrId ? `trr-${trrId}` : `trr-${Date.now()}`);

    if (format === 'docx') {
      // Build a simple DOCX
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'TRR Export', bold: true, size: 28 })],
            }),
            new Paragraph('\n'),
            new Paragraph({ children: [ new TextRun({ text: JSON.stringify(content, null, 2) }) ] }),
          ],
        }],
      });
      const buffer = await Packer.toBuffer(doc);
      const path = `exports/trr/${baseName}.docx`;
      const file = bucket.file(path);
      await file.save(buffer, { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

      let signedUrl: string | undefined;
      try {
        const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 15 * 60 * 1000 });
        signedUrl = url;
      } catch {}

      await admin.firestore().collection('trr_exports').add({ trrId, format, path, timestamp: admin.firestore.FieldValue.serverTimestamp() });
      res.json({ success: true, format, downloadUrl: signedUrl, storagePath: path });
      return;
    }

    // Default: PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const title = 'TRR Export';
    page.drawText(title, { x: 50, y: 740, size: 18, font, color: rgb(0, 0.5, 0.2) });
    const body = JSON.stringify(content, null, 2);

    const lines = body.split('\n');
    let y = 710;
    const lineHeight = 14;
    for (const line of lines) {
      page.drawText(line.slice(0, 110), { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
      if (y < 50) break; // Simple pagination avoidance for now
    }

    const pdfBytes = await pdfDoc.save();
    const path = `exports/trr/${baseName}.pdf`;
    const file = bucket.file(path);
    await file.save(pdfBytes, { contentType: 'application/pdf' });

    let signedUrl: string | undefined;
    try {
      const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 15 * 60 * 1000 });
      signedUrl = url;
    } catch {}

    await admin.firestore().collection('trr_exports').add({ trrId, format: 'pdf', path, timestamp: admin.firestore.FieldValue.serverTimestamp() });
    res.json({ success: true, format: 'pdf', downloadUrl: signedUrl, storagePath: path });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'TRR export failed' });
    return;
  }
});

interface TRRSignoffPayload {
  trrId: string;
  signerId: string;
  data: Record<string, any>;
}

// POST /api/trr/signoff
trrRouter.post('/signoff', async (req, res): Promise<void> => {
  const { trrId, signerId, data } = (req.body || {}) as TRRSignoffPayload;
  if (!trrId || !signerId || !data) {
    res.status(400).json({ success: false, error: 'trrId, signerId, and data are required' });
    return;
  }

  try {
    const payload = JSON.stringify({ trrId, signerId, data });
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    await admin.firestore().collection('trr_signoffs').add({
      trrId,
      signerId,
      hash,
      data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, hash });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'TRR signoff failed' });
    return;
  }
});