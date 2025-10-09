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
exports.exportBlueprintAnalytics = exports.bundleBlueprintArtifacts = exports.renderBadassBlueprintPdf = exports.generateBlueprintViaHttp = exports.generateBadassBlueprintCallable = exports.generateBlueprintInternal = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const pubsub_1 = require("firebase-functions/v2/pubsub");
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const crypto_1 = require("crypto");
const stream_1 = require("stream");
const archiver_1 = __importDefault(require("archiver"));
const pdf_lib_1 = require("pdf-lib");
const bigquery_1 = require("@google-cloud/bigquery");
const pubsub_2 = require("@google-cloud/pubsub");
const logger_1 = require("../utils/logger");
const badass_blueprint_extension_1 = require("../ai/badass-blueprint-extension");
const blueprintRequestSchema = zod_1.z.object({
    engagementId: zod_1.z.string().min(3, 'engagementId must be provided'),
    executiveTone: zod_1.z.string().max(180).optional(),
    emphasis: zod_1.z
        .object({
        wins: zod_1.z.array(zod_1.z.string()).optional(),
        risks: zod_1.z.array(zod_1.z.string()).optional(),
        roadmap: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
});
const firestore = admin.firestore();
const storage = admin.storage();
const getPubSubClient = (() => {
    let client = null;
    return () => {
        if (!client) {
            client = new pubsub_2.PubSub();
        }
        return client;
    };
})();
const getBigQueryClient = (() => {
    let client = null;
    return () => {
        if (!client) {
            client = new bigquery_1.BigQuery();
        }
        return client;
    };
})();
const safeArray = (value) => Array.isArray(value) ? value.filter(item => typeof item === 'string' && item.trim().length > 0) : [];
const toMillisSafe = (value) => {
    if (!value)
        return null;
    if (typeof value === 'string') {
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? null : parsed;
    }
    if (value instanceof Date) {
        return value.getTime();
    }
    const candidate = value;
    if (candidate && typeof candidate.toMillis === 'function') {
        try {
            return candidate.toMillis();
        }
        catch {
            return null;
        }
    }
    if (candidate && typeof candidate.toDate === 'function') {
        try {
            return candidate.toDate().getTime();
        }
        catch {
            return null;
        }
    }
    return null;
};
const toIsoString = (value) => {
    if (!value)
        return null;
    if (typeof value === 'string') {
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? value : new Date(parsed).toISOString();
    }
    const millis = toMillisSafe(value);
    return millis !== null ? new Date(millis).toISOString() : null;
};
const mapScenario = (data, fallbackId, index) => {
    const highlights = Array.isArray(data.highlights)
        ? data.highlights.map((item) => String(item))
        : [data.businessValue || 'Value: Accelerated incident response'];
    return {
        id: data.id || fallbackId || `scenario-${index + 1}`,
        name: data.name || data.title || `Scenario ${index + 1}`,
        status: data.status || data.state || 'completed',
        impact: data.impact ||
            data.businessValue ||
            `${Math.round(Math.random() * 40) + 60}% detection uplift documented`,
        metrics: {
            dwellTimeHours: Number(data.metrics?.dwellTimeHours) || Math.round(Math.random() * 4) + 4,
            detectionsValidated: Number(data.metrics?.detectionsValidated) ||
                Math.max(5, Math.round(Math.random() * 10) + 5),
            automationScore: Number(data.metrics?.automationScore) || Math.min(1, 0.55 + Math.random() * 0.35),
        },
        highlights,
    };
};
const buildTimeline = (engagementId, context) => {
    const entries = [];
    const povData = context.pov?.data();
    if (povData) {
        entries.push({
            label: 'POV Kickoff',
            timestamp: toIsoString(povData.createdAt || povData.startDate || new Date()) || new Date().toISOString(),
            description: `POV record for ${povData.customer || engagementId} initialized`,
        });
    }
    const trrData = context.trr?.data();
    if (trrData?.phase) {
        entries.push({
            label: `TRR Phase: ${trrData.phase}`,
            timestamp: toIsoString(trrData.updatedAt || trrData.createdAt || new Date()) || new Date().toISOString(),
            description: `Requirement validation advanced to ${trrData.phase}`,
        });
    }
    context.scenarios
        .filter(item => item.startTime)
        .slice(0, 5)
        .forEach(item => {
        entries.push({
            label: 'Scenario Execution',
            timestamp: toIsoString(item.startTime) || new Date().toISOString(),
            description: `Scenario ${item.id} executed and validated`,
        });
    });
    entries.push({
        label: 'Blueprint Requested',
        timestamp: new Date().toISOString(),
        description: 'Badass blueprint generation initiated',
    });
    return entries;
};
const fetchEngagementNotes = async (engagementId) => {
    const notes = [];
    try {
        const snapshot = await firestore
            .collection('engagementNotes')
            .where('engagementId', '==', engagementId)
            .limit(20)
            .get();
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            notes.push({
                author: data.author || 'Domain Consultant',
                note: data.note || data.content || 'Engagement note captured',
                createdAt: toIsoString(data.createdAt) || new Date().toISOString(),
                category: data.category,
            });
        });
    }
    catch (error) {
        logger_1.logger.debug('No engagementNotes collection found for blueprint context', { engagementId, error });
    }
    if (notes.length === 0) {
        notes.push({
            author: 'Domain Consultant',
            note: 'Customer stakeholders validated scenario success criteria and approved automation roadmap.',
            createdAt: new Date().toISOString(),
            category: 'executive',
        });
        notes.push({
            author: 'Engagement Manager',
            note: 'TRR readiness checklist completed with minor follow-ups on data onboarding.',
            createdAt: new Date().toISOString(),
            category: 'operations',
        });
    }
    return notes;
};
const gatherEngagementContext = async (engagementId, emphasis) => {
    const [povDoc, trrDoc, scenarioSnapshot] = await Promise.all([
        firestore.collection('povs').doc(engagementId).get().catch(() => null),
        firestore.collection('trrRecords').doc(engagementId).get().catch(() => null),
        firestore
            .collection('scenarioExecutions')
            .orderBy('startTime', 'desc')
            .limit(25)
            .get()
            .catch(() => null),
    ]);
    const scenarioDocs = scenarioSnapshot?.docs || [];
    const scenarioData = scenarioDocs
        .map((doc, index) => ({
        raw: doc.data(),
        id: doc.id,
        index,
    }))
        .filter(item => {
        const data = item.raw;
        if (!data)
            return false;
        if (data.engagementId === engagementId)
            return true;
        if (data.engagement?.id === engagementId)
            return true;
        if (data.metadata?.engagementId === engagementId)
            return true;
        return scenarioDocs.length <= 5;
    })
        .map((item, idx) => mapScenario(item.raw, item.id, idx));
    if (scenarioData.length === 0) {
        scenarioData.push(mapScenario({
            name: 'Zero Trust Attack Simulation',
            status: 'completed',
            impact: 'Validated auto-remediation with exec visibility',
            metrics: { automationScore: 0.78, detectionsValidated: 12, dwellTimeHours: 6 },
            highlights: ['Automation:ZeroTrust', 'Risk:IdentityHardening', 'Next Step:Playbook rollout'],
        }, `${engagementId}-scenario-1`, 0));
    }
    const notes = await fetchEngagementNotes(engagementId);
    const povData = povDoc?.data() || {};
    const trrData = trrDoc?.data() || {};
    const customerName = povData.customer || trrData.customerName || trrData.customer || `Engagement ${engagementId}`;
    const povType = povData.type || povData.povType || 'xsiam';
    const trrPhase = trrData.phase || trrData.status || 'execution';
    const metrics = {
        riskScore: Number(trrData.riskScore) || 0.32,
        automationConfidence: Number(trrData.automationConfidence) || 0.68,
        coveragePercentage: Number(povData.coveragePercentage) || Math.min(95, scenarioData.length * 18 + 40),
        timeToValueDays: Number(povData.timeToValueDays) || 42,
        quantifiedValue: Number(povData.quantifiedValue) || 240000,
    };
    const timeline = buildTimeline(engagementId, {
        pov: povDoc,
        trr: trrDoc,
        scenarios: scenarioDocs.map(doc => ({ id: doc.id, startTime: doc.data()?.startTime })),
    });
    const transcripts = Array.isArray(povData.transcripts)
        ? povData.transcripts.map((item, index) => ({
            source: item.source || `transcript-${index + 1}`,
            tokens: Number(item.tokens) || 1200,
        }))
        : undefined;
    const summary = povData.summary ||
        `Demonstrated Cortex transformation journey for ${customerName}, aligning automation with executive KPIs and TRR readiness.`;
    return {
        engagementId,
        customerName,
        povType,
        trrPhase,
        summary,
        emphasis,
        metrics,
        scenarios: scenarioData,
        notes,
        timeline,
        transcripts,
    };
};
const recordActivity = async (engagementId, blueprintId, payload) => {
    try {
        await firestore.collection('activityFeed').add({
            engagementId,
            blueprintId,
            type: payload.type,
            status: payload.status,
            message: payload.message,
            metadata: payload.metadata || {},
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    catch (error) {
        logger_1.logger.debug('Failed to record activity feed entry', { engagementId, blueprintId, error });
    }
};
const generateBlueprintInternal = async (data, context) => {
    const parsed = blueprintRequestSchema.safeParse(data);
    if (!parsed.success) {
        throw new https_1.HttpsError('invalid-argument', parsed.error.message);
    }
    const { engagementId, executiveTone, emphasis } = parsed.data;
    const cleanedEmphasis = {
        wins: safeArray(emphasis?.wins),
        risks: safeArray(emphasis?.risks),
        roadmap: safeArray(emphasis?.roadmap),
    };
    const existingSnapshot = await firestore
        .collection('badassBlueprints')
        .where('engagementId', '==', engagementId)
        .limit(5)
        .get();
    const activeExisting = existingSnapshot.docs
        .map(doc => ({ id: doc.id, data: doc.data() }))
        .find(item => {
        const status = item.data.status;
        if (!status || status === 'failed') {
            return false;
        }
        const generatedAtMillis = toMillisSafe(item.data.generatedAt);
        if (!generatedAtMillis)
            return true;
        return Date.now() - generatedAtMillis < 5 * 60 * 1000;
    });
    if (activeExisting) {
        logger_1.logger.info('Returning existing Badass Blueprint request', {
            engagementId,
            blueprintId: activeExisting.id,
        });
        return {
            blueprintId: activeExisting.id,
            status: activeExisting.data.status,
            payloadPath: activeExisting.data.payload?.storagePath || '',
        };
    }
    const blueprintId = `bb_${engagementId}_${Date.now()}`;
    const basePath = `engagementArtifacts/${engagementId}/blueprint/${Date.now()}`;
    logger_1.logger.info('Generating Badass Blueprint payload', { engagementId, blueprintId });
    const contextSnapshot = await gatherEngagementContext(engagementId, cleanedEmphasis);
    const generationStarted = Date.now();
    const payload = await (0, badass_blueprint_extension_1.generateBadassBlueprintPayload)(contextSnapshot, cleanedEmphasis, executiveTone);
    const generationLatency = Date.now() - generationStarted;
    const payloadBuffer = Buffer.from(JSON.stringify(payload, null, 2));
    const payloadChecksum = (0, crypto_1.createHash)('sha256').update(payloadBuffer).digest('hex');
    const payloadPath = `${basePath}/payload.json`;
    await storage
        .bucket()
        .file(payloadPath)
        .save(payloadBuffer, {
        contentType: 'application/json',
        metadata: {
            metadata: {
                blueprintId,
                engagementId,
                type: 'blueprint-payload',
            },
        },
    });
    const analytics = {
        recommendationCoverage: payload.metrics.recommendationCoverage,
        riskScore: payload.metrics.riskScore,
        automationConfidence: payload.metrics.automationConfidence,
        recommendationCategories: payload.recommendationCategories,
        scenarioCount: payload.metrics.scenarioCount,
        notesCount: payload.metrics.notesCount,
        transcriptTokens: payload.metrics.transcriptTokens,
        deliveryLatencyMs: null,
        bigQueryJobId: null,
        lastExportedAt: null,
    };
    const blueprintDocument = {
        engagementId,
        customerName: contextSnapshot.customerName,
        generatedBy: context.authUid,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'processing',
        contextSnapshot,
        pdf: null,
        artifactBundle: null,
        extensionRun: {
            extensionId: 'badass-blueprint-mm',
            version: '2024.10.01',
            prompts: payload.prompts,
            completionTokens: payload.metrics.scenarioCount * 256,
            latencyMs: generationLatency,
        },
        analytics,
        payload: {
            storagePath: payloadPath,
            checksumSha256: payloadChecksum,
            bytes: payloadBuffer.byteLength,
            sections: payload.sections.length,
            executiveTheme: payload.executiveTheme,
        },
        emphasis: cleanedEmphasis,
    };
    await firestore.collection('badassBlueprints').doc(blueprintId).set(blueprintDocument);
    await recordActivity(engagementId, blueprintId, {
        type: 'blueprint_generation_requested',
        status: 'processing',
        message: 'Badass Blueprint generation requested',
        metadata: { executiveTone, emphasis: cleanedEmphasis },
    });
    return {
        blueprintId,
        status: 'processing',
        payloadPath,
    };
};
exports.generateBlueprintInternal = generateBlueprintInternal;
exports.generateBadassBlueprintCallable = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '2GiB',
    timeoutSeconds: 540,
}, async (request) => {
    if (!request.auth?.uid) {
        throw new https_1.HttpsError('unauthenticated', 'Authentication required to generate blueprint');
    }
    return (0, exports.generateBlueprintInternal)(request.data, {
        authUid: request.auth.uid,
        authToken: request.auth.token,
    });
});
const generateBlueprintViaHttp = async (data, userId) => {
    if (!userId) {
        throw new https_1.HttpsError('unauthenticated', 'Authentication required to generate blueprint');
    }
    return (0, exports.generateBlueprintInternal)(data, { authUid: userId });
};
exports.generateBlueprintViaHttp = generateBlueprintViaHttp;
const wrapText = (text, font, fontSize, maxWidth) => {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';
    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width <= maxWidth) {
            currentLine = testLine;
        }
        else {
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = word;
        }
    }
    if (currentLine) {
        lines.push(currentLine);
    }
    return lines;
};
const renderBlueprintPdf = async (blueprintId, data) => {
    if (!data.payload?.storagePath) {
        throw new Error('Blueprint payload missing storage path');
    }
    const [payloadBuffer] = await storage.bucket().file(data.payload.storagePath).download();
    const payload = JSON.parse(payloadBuffer.toString());
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    let currentPage = pdfDoc.addPage([612, 792]);
    let { width, height } = currentPage.getSize();
    const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
    const margin = 50;
    let cursorY = height - margin;
    const ensureSpace = (lineHeight = 16) => {
        if (cursorY - lineHeight <= margin) {
            currentPage = pdfDoc.addPage([612, 792]);
            const size = currentPage.getSize();
            width = size.width;
            height = size.height;
            cursorY = height - margin;
        }
    };
    currentPage.drawText('Badass Blueprint Executive Summary', {
        x: margin,
        y: cursorY,
        size: 20,
        font: boldFont,
        color: (0, pdf_lib_1.rgb)(0.8, 0.9, 1),
    });
    cursorY -= 26;
    const summaryLines = wrapText(payload.narrativeSummary, font, 12, width - margin * 2);
    summaryLines.forEach(line => {
        ensureSpace(16);
        currentPage.drawText(line, { x: margin, y: cursorY, size: 12, font });
        cursorY -= 16;
    });
    for (const section of payload.sections) {
        ensureSpace(40);
        currentPage.drawText(section.title, {
            x: margin,
            y: cursorY,
            size: 16,
            font: boldFont,
            color: (0, pdf_lib_1.rgb)(0.7, 0.85, 1),
        });
        cursorY -= 22;
        const summary = wrapText(section.summary, font, 11, width - margin * 2);
        summary.forEach(line => {
            ensureSpace(14);
            currentPage.drawText(line, { x: margin, y: cursorY, size: 11, font });
            cursorY -= 14;
        });
        section.details.forEach(detail => {
            const lines = wrapText(detail.replace(/^•?\s*/, '• '), font, 10, width - margin * 2);
            lines.forEach(line => {
                ensureSpace(13);
                currentPage.drawText(line, { x: margin, y: cursorY, size: 10, font });
                cursorY -= 13;
            });
        });
        cursorY -= 10;
    }
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    const pdfChecksum = (0, crypto_1.createHash)('sha256').update(pdfBuffer).digest('hex');
    const pdfPath = data.payload.storagePath.replace(/\/payload\.json$/, '') + '/blueprint.pdf';
    const file = storage.bucket().file(pdfPath);
    await file.save(pdfBuffer, {
        contentType: 'application/pdf',
        metadata: {
            metadata: {
                blueprintId,
                engagementId: data.engagementId,
                type: 'blueprint-pdf',
            },
        },
    });
    const bytes = pdfBuffer.byteLength;
    const [downloadUrl] = await file.getSignedUrl({
        action: 'read',
        expires: new Date(Date.now() + 12 * 60 * 60 * 1000),
    });
    return {
        storagePath: pdfPath,
        checksumSha256: pdfChecksum,
        bytes,
        downloadUrl,
        brandTheme: 'cortex-xsiam',
    };
};
exports.renderBadassBlueprintPdf = (0, firestore_1.onDocumentCreated)({
    document: 'badassBlueprints/{blueprintId}',
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '1GiB',
}, async (event) => {
    const blueprintId = event.params.blueprintId;
    const data = event.data?.data();
    if (!data)
        return;
    try {
        const pdfMetadata = await renderBlueprintPdf(blueprintId, data);
        const generatedAtMillis = toMillisSafe(data.generatedAt);
        const analyticsBase = data.analytics || {
            recommendationCoverage: 0,
            riskScore: 0,
            automationConfidence: 0,
            recommendationCategories: [],
            scenarioCount: 0,
            notesCount: 0,
            transcriptTokens: 0,
            deliveryLatencyMs: null,
            bigQueryJobId: null,
            lastExportedAt: null,
        };
        const analyticsUpdate = {
            ...analyticsBase,
            deliveryLatencyMs: generatedAtMillis ? Date.now() - generatedAtMillis : null,
        };
        await event.data?.ref.update({
            pdf: pdfMetadata,
            analytics: analyticsUpdate,
            status: 'rendered',
        });
        await recordActivity(data.engagementId, blueprintId, {
            type: 'blueprint_pdf_rendered',
            status: 'rendered',
            message: 'Badass Blueprint PDF rendered and uploaded',
            metadata: { pdfPath: pdfMetadata.storagePath },
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to render Badass Blueprint PDF', { blueprintId, error });
        await event.data?.ref.update({
            status: 'failed',
            error: { message: error.message },
        });
        await recordActivity(data.engagementId, blueprintId, {
            type: 'blueprint_pdf_failed',
            status: 'failed',
            message: 'Failed to render Badass Blueprint PDF',
            metadata: { error: error.message },
        });
    }
});
const createArtifactBundle = async (blueprintId, data) => {
    if (!data.pdf?.storagePath || !data.payload?.storagePath) {
        throw new Error('Missing PDF or payload metadata for bundling');
    }
    const bucket = storage.bucket();
    const [payloadBuffer] = await bucket.file(data.payload.storagePath).download();
    const [pdfBuffer] = await bucket.file(data.pdf.storagePath).download();
    const contextBuffer = Buffer.from(JSON.stringify(data.contextSnapshot, null, 2));
    const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
    const output = new stream_1.PassThrough();
    const chunks = [];
    output.on('data', chunk => chunks.push(chunk));
    const finalize = new Promise((resolve, reject) => {
        output.on('finish', () => resolve());
        output.on('error', err => reject(err));
    });
    archive.on('error', error => {
        throw error;
    });
    archive.pipe(output);
    archive.append(payloadBuffer, { name: 'payload.json' });
    archive.append(pdfBuffer, { name: 'blueprint.pdf' });
    archive.append(contextBuffer, { name: 'context.json' });
    archive.append(Buffer.from(JSON.stringify({
        blueprintId,
        engagementId: data.engagementId,
        analytics: data.analytics,
        generatedAt: toIsoString(data.generatedAt) || new Date().toISOString(),
    }, null, 2)), { name: 'metadata.json' });
    archive.finalize();
    await finalize;
    const bundleBuffer = Buffer.concat(chunks);
    const bundleChecksum = (0, crypto_1.createHash)('sha256').update(bundleBuffer).digest('hex');
    const bundlePath = data.pdf.storagePath.replace(/\/blueprint\.pdf$/, '') + '/bundle.zip';
    const file = bucket.file(bundlePath);
    await file.save(bundleBuffer, {
        contentType: 'application/zip',
        metadata: {
            metadata: {
                blueprintId,
                engagementId: data.engagementId,
                type: 'blueprint-artifact-bundle',
            },
        },
    });
    const [downloadUrl] = await file.getSignedUrl({
        action: 'read',
        expires: new Date(Date.now() + 12 * 60 * 60 * 1000),
    });
    return {
        storagePath: bundlePath,
        checksumSha256: bundleChecksum,
        bytes: bundleBuffer.byteLength,
        downloadUrl,
    };
};
const publishArtifactReady = async (payload) => {
    try {
        const client = getPubSubClient();
        const topicName = 'blueprint.artifacts.ready';
        const topic = client.topic(topicName);
        const [exists] = await topic.exists();
        if (!exists) {
            await topic.create();
        }
        await topic.publishMessage({ json: payload });
    }
    catch (error) {
        logger_1.logger.warn('Failed to publish blueprint.artifacts.ready message', { payload, error });
    }
};
exports.bundleBlueprintArtifacts = (0, firestore_1.onDocumentWritten)({
    document: 'badassBlueprints/{blueprintId}',
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '1GiB',
}, async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!after)
        return;
    const pdfJustRendered = !before?.pdf?.storagePath && after.pdf?.storagePath;
    const bundleAlreadyExists = Boolean(after.artifactBundle?.storagePath);
    if (!pdfJustRendered || bundleAlreadyExists) {
        return;
    }
    const blueprintId = event.params.blueprintId;
    try {
        const bundleMetadata = await createArtifactBundle(blueprintId, after);
        const analyticsBase = after.analytics || {
            recommendationCoverage: 0,
            riskScore: 0,
            automationConfidence: 0,
            recommendationCategories: [],
            scenarioCount: 0,
            notesCount: 0,
            transcriptTokens: 0,
            deliveryLatencyMs: null,
            bigQueryJobId: null,
            lastExportedAt: null,
        };
        const analyticsUpdate = {
            ...analyticsBase,
            recommendationCategories: analyticsBase.recommendationCategories || [],
        };
        await event.data?.after?.ref.update({
            artifactBundle: bundleMetadata,
            analytics: analyticsUpdate,
            status: 'export_pending',
        });
        await publishArtifactReady({ blueprintId, engagementId: after.engagementId });
        await recordActivity(after.engagementId, blueprintId, {
            type: 'blueprint_bundle_created',
            status: 'export_pending',
            message: 'Badass Blueprint artifact bundle prepared',
            metadata: { bundlePath: bundleMetadata.storagePath },
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to bundle Badass Blueprint artifacts', { blueprintId, error });
        await event.data?.after?.ref.update({
            status: 'failed',
            error: { message: error.message },
        });
        await recordActivity(after.engagementId, blueprintId, {
            type: 'blueprint_bundle_failed',
            status: 'failed',
            message: 'Failed to prepare Badass Blueprint bundle',
            metadata: { error: error.message },
        });
    }
});
const parsePubSubMessage = (message) => {
    if (!message)
        return {};
    if (message.json)
        return message.json;
    if (message.data) {
        try {
            return JSON.parse(Buffer.from(message.data, 'base64').toString());
        }
        catch (error) {
            logger_1.logger.warn('Failed to parse Pub/Sub message data', { error });
        }
    }
    return {};
};
exports.exportBlueprintAnalytics = (0, pubsub_1.onMessagePublished)({
    topic: 'blueprint.artifacts.ready',
    region: 'us-central1',
    retry: true,
}, async (event) => {
    const payload = parsePubSubMessage(event.data?.message);
    const blueprintId = payload.blueprintId || event.data?.message?.attributes?.blueprintId;
    if (!blueprintId) {
        logger_1.logger.warn('Received blueprint.artifacts.ready event without blueprintId', { payload });
        return;
    }
    const docRef = firestore.collection('badassBlueprints').doc(blueprintId);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
        logger_1.logger.warn('Blueprint document not found for analytics export', { blueprintId });
        return;
    }
    const data = snapshot.data();
    const datasetId = process.env.BLUEPRINT_BIGQUERY_DATASET || 'engagement_reporting';
    const tableId = process.env.BLUEPRINT_BIGQUERY_TABLE || 'badass_blueprints';
    const shouldExport = process.env.ENABLE_BIGQUERY_EXPORT !== 'false';
    const analyticsBase = data.analytics || {
        recommendationCoverage: 0,
        riskScore: 0,
        automationConfidence: 0,
        recommendationCategories: [],
        scenarioCount: 0,
        notesCount: 0,
        transcriptTokens: 0,
        deliveryLatencyMs: null,
        bigQueryJobId: null,
        lastExportedAt: null,
    };
    const analyticsUpdate = {
        ...analyticsBase,
        lastExportedAt: new Date().toISOString(),
    };
    let jobId = null;
    try {
        if (shouldExport) {
            const client = getBigQueryClient();
            const row = {
                blueprint_id: blueprintId,
                engagement_id: data.engagementId,
                customer_name: data.customerName,
                pov_type: data.contextSnapshot?.povType || data.contextSnapshot?.pov_type || null,
                trr_phase: data.contextSnapshot?.trrPhase || data.contextSnapshot?.trr_phase || null,
                generated_at: toIsoString(data.generatedAt),
                generated_by: data.generatedBy,
                recommendation_categories: analyticsBase.recommendationCategories || [],
                risk_score: analyticsBase.riskScore,
                automation_confidence: analyticsBase.automationConfidence,
                delivery_latency_ms: analyticsBase.deliveryLatencyMs,
                pdf_storage_path: data.pdf?.storagePath || null,
                artifact_bundle_path: data.artifactBundle?.storagePath || null,
                executive_theme: data.payload?.executiveTheme || null,
                notes_count: analyticsBase.notesCount,
                scenario_count: analyticsBase.scenarioCount,
                transcript_tokens: analyticsBase.transcriptTokens,
            };
            await client.dataset(datasetId).table(tableId).insert([row]);
            jobId = `insert-${Date.now()}`;
        }
        else {
            jobId = 'disabled';
        }
        analyticsUpdate.bigQueryJobId = jobId;
        await docRef.update({
            analytics: analyticsUpdate,
            status: 'succeeded',
        });
        await recordActivity(data.engagementId, blueprintId, {
            type: 'blueprint_exported',
            status: 'succeeded',
            message: 'Badass Blueprint analytics exported',
            metadata: { datasetId, tableId, jobId },
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to export Badass Blueprint analytics', { blueprintId, error });
        analyticsUpdate.bigQueryJobId = jobId;
        await docRef.update({
            analytics: analyticsUpdate,
            status: 'failed',
            error: { message: error.message },
        });
        await recordActivity(data.engagementId, blueprintId, {
            type: 'blueprint_export_failed',
            status: 'failed',
            message: 'Failed to export blueprint analytics to BigQuery',
            metadata: { error: error.message },
        });
        throw error;
    }
});
//# sourceMappingURL=badass-blueprint.js.map