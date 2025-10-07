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
exports.app = exports.api = exports.cleanupOldExecutions = exports.monitorExecutionStatusChanges = exports.processScenarioExecution = exports.generateDetectionQueriesFunction = exports.controlScenarioExecutionFunction = exports.executeScenarioFunction = exports.generateThreatActorScenarioFunction = exports.aiTrrSuggest = void 0;
// Cloud Functions for TRR Management System
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
// Import handlers
const ai_trr_suggest_1 = require("./handlers/ai-trr-suggest");
const scenario_orchestration_1 = require("./handlers/scenario-orchestration");
const scenario_executor_1 = require("./handlers/scenario-executor");
Object.defineProperty(exports, "processScenarioExecution", { enumerable: true, get: function () { return scenario_executor_1.processScenarioExecution; } });
Object.defineProperty(exports, "monitorExecutionStatusChanges", { enumerable: true, get: function () { return scenario_executor_1.monitorExecutionStatusChanges; } });
Object.defineProperty(exports, "cleanupOldExecutions", { enumerable: true, get: function () { return scenario_executor_1.cleanupOldExecutions; } });
// Import utils
const logger_1 = require("./utils/logger");
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
}
// Rate limiting configuration
const rateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
    keyPrefix: 'trr_functions',
    points: 100, // Number of requests
    duration: 60, // Per 60 seconds
});
// Express app for HTTP functions
const app = (0, express_1.default)();
exports.app = app;
// Middleware setup
app.use((0, helmet_1.default)());
// CORS: allow specific origins if provided, otherwise allow all (dev-friendly)
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
    : [];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.length === 0)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Auth middleware (best-effort)
app.use(async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring('Bearer '.length);
            const decoded = await admin.auth().verifyIdToken(token);
            req.user = { uid: decoded.uid, token: decoded };
        }
    }
    catch (e) {
        // Non-fatal: continue without user
    }
    next();
});
// Rate limiting middleware
app.use(async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'] || req.ip || 'anonymous';
        await rateLimiter.consume(userId);
        next();
    }
    catch (rejRes) {
        const secs = Math.round(((rejRes === null || rejRes === void 0 ? void 0 : rejRes.msBeforeNext) || 0) / 1000) || 1;
        res.set('Retry-After', String(secs));
        res.status(429).json({
            error: 'Too many requests',
            retryAfter: secs
        });
    }
});
// Global error handler
app.use((error, req, res, next) => {
    logger_1.logger.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.FUNCTIONS_VERSION || '1.0.0'
    });
});
// Extended health check: verify Firestore and Storage connectivity
app.get('/health/full', async (_req, res) => {
    const serviceStatus = { firestore: false, storage: false };
    try {
        await admin.firestore().collection('_health').doc('ping').set({ ts: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        serviceStatus.firestore = true;
    }
    catch (e) {
        serviceStatus.firestore = { error: (e === null || e === void 0 ? void 0 : e.message) || String(e) };
    }
    try {
        await admin.storage().bucket().getMetadata();
        serviceStatus.storage = true;
    }
    catch (e) {
        serviceStatus.storage = { error: (e === null || e === void 0 ? void 0 : e.message) || String(e) };
    }
    res.json({ status: 'healthy', services: serviceStatus, timestamp: new Date().toISOString() });
});
// Mount Gemini AI HTTP endpoint under Express API
const gemini_1 = require("./gemini");
app.post('/gemini', (req, res) => (0, gemini_1.geminiHttpHandler)(req, res));
// Simple auth gate for protected routes
const allowUnauth = process.env.ALLOW_UNAUTH === 'true';
function requireAuth(req, res, next) {
    var _a;
    if (((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.uid) || allowUnauth)
        return next();
    return res.status(401).json({ error: 'unauthenticated' });
}
// AI routes (Genkit/Vertex flows)
const ai_1 = require("./routes/ai");
app.use('/ai', requireAuth, ai_1.aiRouter);
// Export routes (BigQuery)
const bigquery_1 = require("./routes/bigquery");
app.use('/export', requireAuth, bigquery_1.exportRouter);
// TRR routes (export/signoff)
const trr_1 = require("./routes/trr");
app.use('/trr', requireAuth, trr_1.trrRouter);
// Scenario HTTP endpoints to align with frontend CloudFunctionsAPI
const scenario_orchestration_2 = require("./handlers/scenario-orchestration");
// Deploy scenario (expects { blueprintId, options, context? })
app.post('/scenario-deploy', async (req, res) => {
    var _a;
    try {
        const { blueprintId, options, context } = req.body || {};
        if (!blueprintId) {
            return res.status(400).json({ success: false, message: 'Missing blueprintId' });
        }
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid) || (context === null || context === void 0 ? void 0 : context.userId) || 'demo';
        const organizationId = (context === null || context === void 0 ? void 0 : context.organizationId) || 'default-org';
        const result = await (0, scenario_orchestration_2.executeScenario)({ blueprintId, options: options || {}, context: { organizationId, userId } }, { auth: userId ? { uid: userId } : undefined });
        return res.json({ success: true, ...result });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: (error === null || error === void 0 ? void 0 : error.message) || 'Deployment failed' });
    }
});
// Scenario status
app.get('/scenario-status/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const db = admin.firestore();
        const doc = await db.collection('scenarioExecutions').doc(id).get();
        if (!doc.exists)
            return res.status(404).json({ success: false, message: 'Not found' });
        return res.json({ success: true, deployment: doc.data(), message: 'Status retrieved successfully' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: (error === null || error === void 0 ? void 0 : error.message) || 'Status retrieval failed' });
    }
});
// Scenario list
app.get('/scenario-list', async (_req, res) => {
    try {
        const db = admin.firestore();
        const snapshot = await db.collection('scenarioExecutions').orderBy('startTime', 'desc').limit(25).get();
        const deployments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        return res.json({ success: true, deployments, message: 'Deployments retrieved successfully' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: (error === null || error === void 0 ? void 0 : error.message) || 'List failed' });
    }
});
// Scenario validate (placeholder)
app.post('/scenario-validate', async (req, res) => {
    try {
        const { deploymentId } = req.body || {};
        if (!deploymentId)
            return res.status(400).json({ success: false, message: 'Missing deploymentId' });
        const db = admin.firestore();
        await db.collection('scenarioExecutions').doc(deploymentId).update({
            status: 'validating',
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
        return res.json({ success: true, results: { queued: true }, message: 'Validation queued' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: (error === null || error === void 0 ? void 0 : error.message) || 'Validation failed' });
    }
});
// Scenario destroy (placeholder)
app.post('/scenario-destroy', async (req, res) => {
    try {
        const { deploymentId } = req.body || {};
        if (!deploymentId)
            return res.status(400).json({ success: false, message: 'Missing deploymentId' });
        const db = admin.firestore();
        await db.collection('scenarioExecutions').doc(deploymentId).update({
            status: 'cancelled',
            endTime: admin.firestore.FieldValue.serverTimestamp(),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
        return res.json({ success: true, message: 'Destroy completed' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: (error === null || error === void 0 ? void 0 : error.message) || 'Destroy failed' });
    }
});
// Scenario export (placeholder download URL)
app.post('/scenario-export', async (req, res) => {
    try {
        const { deploymentId, format } = req.body || {};
        if (!deploymentId)
            return res.status(400).json({ success: false, message: 'Missing deploymentId' });
        const bucket = process.env.FIREBASE_STORAGE_BUCKET || admin.storage().bucket().name;
        const path = `exports/${deploymentId}.${(format || 'json')}`;
        const downloadUrl = `https://storage.googleapis.com/${bucket}/${path}`;
        return res.json({ success: true, downloadUrl, message: 'Export generated successfully' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: (error === null || error === void 0 ? void 0 : error.message) || 'Export failed' });
    }
});
// ============================================================================
// AI-Enhanced TRR Functions
// ============================================================================
/**
 * AI-powered TRR suggestion and enhancement
 * Provides intelligent suggestions for TRR fields, risk assessment, and validation
 */
exports.aiTrrSuggest = functions
    .region('us-central1')
    .runWith({
    memory: '1GB',
    timeoutSeconds: 540,
    secrets: ['OPENAI_API_KEY']
})
    .https
    .onCall(async (data, context) => {
    try {
        // Validate authentication
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
        }
        return await (0, ai_trr_suggest_1.aiTRRSuggestHandler)(data, context);
    }
    catch (error) {
        logger_1.logger.error('AI TRR Suggest error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'AI service temporarily unavailable');
    }
});
// ============================================================================
// Scenario Orchestration Functions
// ============================================================================
/**
 * AI-powered threat actor scenario generation
 * Generates comprehensive attack scenarios based on threat actor profiles
 */
exports.generateThreatActorScenarioFunction = functions
    .region('us-central1')
    .runWith({
    memory: '2GB',
    timeoutSeconds: 540,
    secrets: ['OPENAI_API_KEY']
})
    .https
    .onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
        }
        return await (0, scenario_orchestration_1.generateThreatActorScenario)(data, context);
    }
    catch (error) {
        logger_1.logger.error('Generate threat actor scenario error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Scenario generation service temporarily unavailable');
    }
});
/**
 * Scenario execution management
 * Starts execution of a scenario blueprint
 */
exports.executeScenarioFunction = functions
    .region('us-central1')
    .runWith({
    memory: '1GB',
    timeoutSeconds: 120
})
    .https
    .onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
        }
        return await (0, scenario_orchestration_1.executeScenario)(data, context);
    }
    catch (error) {
        logger_1.logger.error('Execute scenario error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Scenario execution service temporarily unavailable');
    }
});
/**
 * Scenario execution control
 * Controls running scenario executions (pause, resume, cancel, restart)
 */
exports.controlScenarioExecutionFunction = functions
    .region('us-central1')
    .runWith({
    memory: '512MB',
    timeoutSeconds: 60
})
    .https
    .onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
        }
        return await (0, scenario_orchestration_1.controlScenarioExecution)(data, context);
    }
    catch (error) {
        logger_1.logger.error('Control scenario execution error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Scenario control service temporarily unavailable');
    }
});
/**
 * AI-powered detection query generation
 * Generates optimized detection queries for threat vectors
 */
exports.generateDetectionQueriesFunction = functions
    .region('us-central1')
    .runWith({
    memory: '1GB',
    timeoutSeconds: 300,
    secrets: ['OPENAI_API_KEY']
})
    .https
    .onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
        }
        return await (0, scenario_orchestration_1.generateDetectionQueries)(data, context);
    }
    catch (error) {
        logger_1.logger.error('Generate detection queries error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Detection query generation service temporarily unavailable');
    }
});
// TRR Export handler - TODO: Implement
// export const trrExport = functions...
// TRR Signoff handler - TODO: Implement
// export const trrSignoffCreate = functions...
// ============================================================================
// Data Processing Functions - TODO: Implement handlers
// ============================================================================
// Analytics and validation handlers commented out until implemented
// export const trrAnalytics = functions...
// export const trrValidation = functions...
// ============================================================================
// Firestore Triggers - TODO: Implement notification handlers
// ============================================================================
// Triggers commented out until notification handlers are implemented
// export const trrStatusChanged = functions...
// export const trrCreated = functions...
// ============================================================================
// Scheduled Functions - TODO: Implement schedule handlers
// ============================================================================
// Scheduled functions commented out until handlers are implemented
// export const dailyAnalyticsProcessing = functions...
// export const weeklyStatusReport = functions...
// export const trrReminders = functions...
// ============================================================================
// HTTP Endpoints (Express Routes)
// ============================================================================
// Mount express app as HTTP function
exports.api = functions
    .region('us-central1')
    .runWith({
    memory: '1GB',
    timeoutSeconds: 60
})
    .https
    .onRequest(app);
// Log successful initialization
logger_1.logger.info('TRR Management Cloud Functions initialized successfully');
//# sourceMappingURL=index.js.map