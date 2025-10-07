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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trrRouter = void 0;
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
const pdf_lib_1 = require("pdf-lib");
const docx_1 = require("docx");
const crypto_1 = __importDefault(require("crypto"));
exports.trrRouter = (0, express_1.Router)();
// POST /api/trr/export
exports.trrRouter.post('/export', async (req, res) => {
    const { format = 'pdf', trrId, data, filename } = (req.body || {});
    const content = data || { trrId, exportedAt: new Date().toISOString() };
    try {
        const bucket = admin.storage().bucket();
        const baseName = filename || (trrId ? `trr-${trrId}` : `trr-${Date.now()}`);
        if (format === 'docx') {
            // Build a simple DOCX
            const doc = new docx_1.Document({
                sections: [{
                        properties: {},
                        children: [
                            new docx_1.Paragraph({
                                children: [new docx_1.TextRun({ text: 'TRR Export', bold: true, size: 28 })],
                            }),
                            new docx_1.Paragraph('\n'),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: JSON.stringify(content, null, 2) })] }),
                        ],
                    }],
            });
            const buffer = await docx_1.Packer.toBuffer(doc);
            const path = `exports/trr/${baseName}.docx`;
            const file = bucket.file(path);
            await file.save(buffer, { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            let signedUrl;
            try {
                const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 15 * 60 * 1000 });
                signedUrl = url;
            }
            catch (_a) { }
            await admin.firestore().collection('trr_exports').add({ trrId, format, path, timestamp: admin.firestore.FieldValue.serverTimestamp() });
            res.json({ success: true, format, downloadUrl: signedUrl, storagePath: path });
            return;
        }
        // Default: PDF
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
        const page = pdfDoc.addPage([612, 792]); // Letter size
        const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        const title = 'TRR Export';
        page.drawText(title, { x: 50, y: 740, size: 18, font, color: (0, pdf_lib_1.rgb)(0, 0.5, 0.2) });
        const body = JSON.stringify(content, null, 2);
        const lines = body.split('\n');
        let y = 710;
        const lineHeight = 14;
        for (const line of lines) {
            page.drawText(line.slice(0, 110), { x: 50, y, size: 10, font, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            y -= lineHeight;
            if (y < 50)
                break; // Simple pagination avoidance for now
        }
        const pdfBytes = await pdfDoc.save();
        const path = `exports/trr/${baseName}.pdf`;
        const file = bucket.file(path);
        await file.save(pdfBytes, { contentType: 'application/pdf' });
        let signedUrl;
        try {
            const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 15 * 60 * 1000 });
            signedUrl = url;
        }
        catch (_b) { }
        await admin.firestore().collection('trr_exports').add({ trrId, format: 'pdf', path, timestamp: admin.firestore.FieldValue.serverTimestamp() });
        res.json({ success: true, format: 'pdf', downloadUrl: signedUrl, storagePath: path });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, error: (error === null || error === void 0 ? void 0 : error.message) || 'TRR export failed' });
        return;
    }
});
// POST /api/trr/signoff
exports.trrRouter.post('/signoff', async (req, res) => {
    const { trrId, signerId, data } = (req.body || {});
    if (!trrId || !signerId || !data) {
        res.status(400).json({ success: false, error: 'trrId, signerId, and data are required' });
        return;
    }
    try {
        const payload = JSON.stringify({ trrId, signerId, data });
        const hash = crypto_1.default.createHash('sha256').update(payload).digest('hex');
        await admin.firestore().collection('trr_signoffs').add({
            trrId,
            signerId,
            hash,
            data,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.json({ success: true, hash });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, error: (error === null || error === void 0 ? void 0 : error.message) || 'TRR signoff failed' });
        return;
    }
});
//# sourceMappingURL=trr.js.map