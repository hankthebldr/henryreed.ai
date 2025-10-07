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
const functions = __importStar(require("firebase-functions"));
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
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
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