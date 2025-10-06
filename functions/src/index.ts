// Cloud Functions for TRR Management System
import * as functions from 'firebase-functions';
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
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// ============================================================================
// AI-Enhanced TRR Functions
// ============================================================================

/**
 * AI-powered TRR suggestion and enhancement
 * Provides intelligent suggestions for TRR fields, risk assessment, and validation
 */
export const aiTrrSuggest = functions
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

      return await aiTRRSuggestHandler(data, context);
    } catch (error) {
      logger.error('AI TRR Suggest error:', error);
      
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
export const generateThreatActorScenarioFunction = functions
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

      return await generateThreatActorScenario(data, context);
    } catch (error) {
      logger.error('Generate threat actor scenario error:', error);
      
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
export const executeScenarioFunction = functions
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

      return await executeScenario(data, context);
    } catch (error) {
      logger.error('Execute scenario error:', error);
      
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
export const controlScenarioExecutionFunction = functions
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

      return await controlScenarioExecution(data, context);
    } catch (error) {
      logger.error('Control scenario execution error:', error);
      
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
export const generateDetectionQueriesFunction = functions
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

      return await generateDetectionQueries(data, context);
    } catch (error) {
      logger.error('Generate detection queries error:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError('internal', 'Detection query generation service temporarily unavailable');
    }
  });

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
export const api = functions
  .region('us-central1')
  .runWith({
    memory: '1GB',
    timeoutSeconds: 60
  })
  .https
  .onRequest(app);

// Export the express app for testing
export { app };

// Log successful initialization
logger.info('TRR Management Cloud Functions initialized successfully');