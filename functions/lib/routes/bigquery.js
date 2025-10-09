"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportRouter = void 0;
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
exports.exportRouter = (0, express_1.Router)();
exports.exportRouter.post('/bigquery', async (req, res) => {
    const payload = req.body;
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
        let signedUrl;
        try {
            const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 15 * 60 * 1000 });
            signedUrl = url;
        }
        catch { }
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
        }
        catch { }
        res.json({ success: true, recordsExported: Array.isArray(payload.rows) ? payload.rows.length : 0, downloadUrl: signedUrl, storagePath: path });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, error: error?.message || 'Export failed' });
        return;
    }
});
//# sourceMappingURL=bigquery.js.map