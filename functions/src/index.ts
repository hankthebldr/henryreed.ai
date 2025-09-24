// Cloud Functions for TRR Management System
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Import handlers
import { aiTRRSuggestHandler } from './handlers/ai-trr-suggest';
import { trrExportHandler } from './handlers/trr-export';
import { trrSignoffHandler } from './handlers/trr-signoff';
import { trrAnalyticsHandler } from './handlers/trr-analytics';
import { trrNotificationHandler } from './handlers/trr-notifications';
import { trrValidationHandler } from './handlers/trr-validation';
import { scheduleHandler } from './handlers/scheduled-tasks';

// Import middleware
import { validateAuth } from './middleware/auth';
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
    const userId = req.headers['x-user-id'] as string || req.ip;
    await rateLimiter.consume(userId);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
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

/**
 * TRR Export and Report Generation
 * Generates comprehensive reports in multiple formats (PDF, DOCX, CSV)
 */
export const trrExport = functions
  .region('us-central1')
  .runWith({
    memory: '2GB',
    timeoutSeconds: 300
  })
  .https
  .onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
      }

      return await trrExportHandler(data, context);
    } catch (error) {
      logger.error('TRR Export error:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError('internal', 'Export service temporarily unavailable');
    }
  });

/**
 * Blockchain-based TRR Signoff
 * Creates immutable signoff records for TRR approvals
 */
export const trrSignoffCreate = functions
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

      return await trrSignoffHandler(data, context);
    } catch (error) {
      logger.error('TRR Signoff error:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError('internal', 'Signoff service temporarily unavailable');
    }
  });

// ============================================================================
// Data Processing Functions
// ============================================================================

/**
 * TRR Analytics Processing
 * Processes TRR data for analytics dashboards and insights
 */
export const trrAnalytics = functions
  .region('us-central1')
  .runWith({
    memory: '1GB',
    timeoutSeconds: 300
  })
  .https
  .onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
      }

      return await trrAnalyticsHandler(data, context);
    } catch (error) {
      logger.error('TRR Analytics error:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError('internal', 'Analytics service temporarily unavailable');
    }
  });

/**
 * TRR Validation Engine
 * Validates TRR data against business rules and technical requirements
 */
export const trrValidation = functions
  .region('us-central1')
  .runWith({
    memory: '512MB',
    timeoutSeconds: 120
  })
  .https
  .onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
      }

      return await trrValidationHandler(data, context);
    } catch (error) {
      logger.error('TRR Validation error:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError('internal', 'Validation service temporarily unavailable');
    }
  });

// ============================================================================
// Firestore Triggers
// ============================================================================

/**
 * TRR Status Change Trigger
 * Handles notifications and workflow automation when TRR status changes
 */
export const trrStatusChanged = functions
  .region('us-central1')
  .firestore
  .document('trrs/{trrId}')
  .onUpdate(async (change, context) => {
    try {
      const beforeData = change.before.data();
      const afterData = change.after.data();
      
      // Check if status changed
      if (beforeData.status !== afterData.status) {
        await trrNotificationHandler({
          trrId: context.params.trrId,
          previousStatus: beforeData.status,
          newStatus: afterData.status,
          trrData: afterData
        });
      }
    } catch (error) {
      logger.error('TRR status change trigger error:', error);
    }
  });

/**
 * New TRR Creation Trigger
 * Sets up initial notifications and workflow automation for new TRRs
 */
export const trrCreated = functions
  .region('us-central1')
  .firestore
  .document('trrs/{trrId}')
  .onCreate(async (snap, context) => {
    try {
      const trrData = snap.data();
      
      await trrNotificationHandler({
        trrId: context.params.trrId,
        action: 'created',
        trrData
      });
    } catch (error) {
      logger.error('TRR creation trigger error:', error);
    }
  });

// ============================================================================
// Scheduled Functions
// ============================================================================

/**
 * Daily TRR Analytics Processing
 * Processes daily analytics and generates reports
 */
export const dailyAnalyticsProcessing = functions
  .region('us-central1')
  .runWith({
    memory: '2GB',
    timeoutSeconds: 540
  })
  .pubsub
  .schedule('0 6 * * *') // Every day at 6 AM UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      await scheduleHandler.processDailyAnalytics();
      logger.info('Daily analytics processing completed');
    } catch (error) {
      logger.error('Daily analytics processing error:', error);
    }
  });

/**
 * Weekly TRR Status Report
 * Generates and sends weekly status reports
 */
export const weeklyStatusReport = functions
  .region('us-central1')
  .runWith({
    memory: '1GB',
    timeoutSeconds: 300
  })
  .pubsub
  .schedule('0 8 * * 1') // Every Monday at 8 AM UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      await scheduleHandler.generateWeeklyReport();
      logger.info('Weekly status report completed');
    } catch (error) {
      logger.error('Weekly status report error:', error);
    }
  });

/**
 * TRR Reminder Notifications
 * Sends reminder notifications for overdue TRRs
 */
export const trrReminders = functions
  .region('us-central1')
  .runWith({
    memory: '512MB',
    timeoutSeconds: 180
  })
  .pubsub
  .schedule('0 9,17 * * 1-5') // Every weekday at 9 AM and 5 PM UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      await scheduleHandler.sendTRRReminders();
      logger.info('TRR reminders sent');
    } catch (error) {
      logger.error('TRR reminders error:', error);
    }
  });

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