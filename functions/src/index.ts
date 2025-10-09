// Cloud Functions for TRR Management System
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Import handlers
import { aiTRRSuggestHandler } from './handlers/ai-trr-suggest';
import { 
  generateThreatActorScenario, 
  executeScenario, 
  controlScenarioExecution, 
  generateDetectionQueries 
} from './handlers/scenario-orchestration';
import {
  processScenarioExecution,
  monitorExecutionStatusChanges,
  cleanupOldExecutions
} from './handlers/scenario-executor';

// Import utils
import { logger } from './utils/logger';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

// Rate limiting configuration
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'trr_functions',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Express app for HTTP functions
const app = express();

// Middleware setup
app.use(helmet());
// CORS: allow specific origins if provided, otherwise allow all (dev-friendly)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Auth middleware (best-effort)
app.use(async (req: any, _res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring('Bearer '.length);
      const decoded = await admin.auth().verifyIdToken(token);
      req.user = { uid: decoded.uid, token: decoded };
    }
  } catch (e) {
    // Non-fatal: continue without user
  }
  next();
});

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.ip || 'anonymous';
    await rateLimiter.consume(userId);
    next();
  } catch (rejRes: any) {
    const secs = Math.round((rejRes?.msBeforeNext || 0) / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: secs
    });
  }
});

// Global error handler
app.use((error: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error:', error);
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
  const serviceStatus: Record<string, any> = { firestore: false, storage: false };
  try {
    await admin.firestore().collection('_health').doc('ping').set({ ts: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    serviceStatus.firestore = true;
  } catch (e: any) {
    serviceStatus.firestore = { error: e?.message || String(e) };
  }
  try {
    await admin.storage().bucket().getMetadata();
    serviceStatus.storage = true;
  } catch (e: any) {
    serviceStatus.storage = { error: e?.message || String(e) };
  }
  res.json({ status: 'healthy', services: serviceStatus, timestamp: new Date().toISOString() });
});

// Mount Gemini AI HTTP endpoint under Express API
import { geminiHttpHandler } from './gemini';
app.post('/gemini', (req, res) => geminiHttpHandler(req, res));

// Simple auth gate for protected routes
const allowUnauth = process.env.ALLOW_UNAUTH === 'true';
function requireAuth(req: any, res: any, next: any) {
  if (req?.user?.uid || allowUnauth) return next();
  return res.status(401).json({ error: 'unauthenticated' });
}

// AI routes (Genkit/Vertex flows)
import { aiRouter } from './routes/ai';
app.use('/ai', requireAuth, aiRouter);

// Export routes (BigQuery)
import { exportRouter } from './routes/bigquery';
app.use('/export', requireAuth, exportRouter);

// TRR routes (export/signoff)
import { trrRouter } from './routes/trr';
app.use('/trr', requireAuth, trrRouter);

// Scenario HTTP endpoints to align with frontend CloudFunctionsAPI
import { executeScenario as executeScenarioCallable } from './handlers/scenario-orchestration';

// Deploy scenario (expects { blueprintId, options, context? })
app.post('/scenario-deploy', async (req: any, res) => {
  try {
    const { blueprintId, options, context } = req.body || {};
    if (!blueprintId) {
      return res.status(400).json({ success: false, message: 'Missing blueprintId' });
    }
    const userId = req.user?.uid || context?.userId || 'demo';
    const organizationId = context?.organizationId || 'default-org';

    const result = await executeScenarioCallable(
      { blueprintId, options: options || {}, context: { organizationId, userId } },
      { auth: userId ? { uid: userId } : undefined } as any
    );

    return res.json({ success: true, ...result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Deployment failed' });
  }
});

// Scenario status
app.get('/scenario-status/:id', async (req: any, res) => {
  try {
    const id = req.params.id;
    const db = admin.firestore();
    const doc = await db.collection('scenarioExecutions').doc(id).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, deployment: doc.data(), message: 'Status retrieved successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Status retrieval failed' });
  }
});

// Scenario list
app.get('/scenario-list', async (_req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('scenarioExecutions').orderBy('startTime', 'desc').limit(25).get();
    const deployments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json({ success: true, deployments, message: 'Deployments retrieved successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'List failed' });
  }
});

// Scenario validate (placeholder)
app.post('/scenario-validate', async (req: any, res) => {
  try {
    const { deploymentId } = req.body || {};
    if (!deploymentId) return res.status(400).json({ success: false, message: 'Missing deploymentId' });
    const db = admin.firestore();
    await db.collection('scenarioExecutions').doc(deploymentId).update({
      status: 'validating',
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.json({ success: true, results: { queued: true }, message: 'Validation queued' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Validation failed' });
  }
});

// Scenario destroy (placeholder)
app.post('/scenario-destroy', async (req: any, res) => {
  try {
    const { deploymentId } = req.body || {};
    if (!deploymentId) return res.status(400).json({ success: false, message: 'Missing deploymentId' });
    const db = admin.firestore();
    await db.collection('scenarioExecutions').doc(deploymentId).update({
      status: 'cancelled',
      endTime: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.json({ success: true, message: 'Destroy completed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Destroy failed' });
  }
});

// Scenario export (placeholder download URL)
app.post('/scenario-export', async (req: any, res) => {
  try {
    const { deploymentId, format } = req.body || {};
    if (!deploymentId) return res.status(400).json({ success: false, message: 'Missing deploymentId' });
    const bucket = process.env.FIREBASE_STORAGE_BUCKET || admin.storage().bucket().name;
    const path = `exports/${deploymentId}.${(format || 'json')}`;
    const downloadUrl = `https://storage.googleapis.com/${bucket}/${path}`;
    return res.json({ success: true, downloadUrl, message: 'Export generated successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Export failed' });
  }
});

// ============================================================================
// AI-Enhanced TRR Functions
// ============================================================================

/**
 * AI-powered TRR suggestion and enhancement
 * Provides intelligent suggestions for TRR fields, risk assessment, and validation
 */
export const aiTrrSuggest = onCall(
  {
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 540,
    secrets: ['OPENAI_API_KEY']
  },
  async (request) => {
    try {
      // Validate authentication
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Authentication required');
      }

      return await aiTRRSuggestHandler(request.data, request);
    } catch (error) {
      logger.error('AI TRR Suggest error:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'AI service temporarily unavailable');
    }
  }
);

// ============================================================================
// Scenario Orchestration Functions
// ============================================================================

/**
 * AI-powered threat actor scenario generation
 * Generates comprehensive attack scenarios based on threat actor profiles
 */
export const generateThreatActorScenarioFunction = onCall(
  {
    region: 'us-central1',
    memory: '2GiB',
    timeoutSeconds: 540,
    secrets: ['OPENAI_API_KEY']
  },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Authentication required');
      }

      return await generateThreatActorScenario(request.data, request);
    } catch (error) {
      logger.error('Generate threat actor scenario error:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Scenario generation service temporarily unavailable');
    }
  }
);

/**
 * Scenario execution management
 * Starts execution of a scenario blueprint
 */
export const executeScenarioFunction = onCall(
  {
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 120
  },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Authentication required');
      }

      return await executeScenario(request.data, request);
    } catch (error) {
      logger.error('Execute scenario error:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Scenario execution service temporarily unavailable');
    }
  }
);

/**
 * Scenario execution control
 * Controls running scenario executions (pause, resume, cancel, restart)
 */
export const controlScenarioExecutionFunction = onCall(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60
  },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Authentication required');
      }

      return await controlScenarioExecution(request.data, request);
    } catch (error) {
      logger.error('Control scenario execution error:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Scenario control service temporarily unavailable');
    }
  }
);

/**
 * AI-powered detection query generation
 * Generates optimized detection queries for threat vectors
 */
export const generateDetectionQueriesFunction = onCall(
  {
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 300,
    secrets: ['OPENAI_API_KEY']
  },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Authentication required');
      }

      return await generateDetectionQueries(request.data, request);
    } catch (error) {
      logger.error('Generate detection queries error:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Detection query generation service temporarily unavailable');
    }
  }
);

// ============================================================================
// Background Scenario Execution Functions
// ============================================================================

/**
 * Background scenario execution processor
 * Triggered by Pub/Sub messages to execute scenarios in the background
 */
export { processScenarioExecution };

/**
 * Monitors scenario execution status changes
 * Triggered by Firestore updates to handle execution state transitions
 */
export { monitorExecutionStatusChanges };

/**
 * Scheduled cleanup of old executions and logs
 * Runs daily to clean up expired data
 */
export { cleanupOldExecutions };

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
export const api = onRequest(
  {
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 60
  },
  app
);

// ============================================================================
// USER AUTHENTICATION AND PROFILE MANAGEMENT
// ============================================================================

// Import user creation event handlers
export {
  beforeUserCreation,
  beforeUserSignIn,
  onUserDocumentCreated,
  createUserProfile,
  updateUserProfile
} from './auth/user-creation-handler';

// Note: AI functions are handled by the separate genkit codebase
// to avoid duplication and maintain clean separation of concerns

// Export the express app for testing
export { app };

// Log successful initialization
logger.info('TRR Management Cloud Functions initialized successfully');
