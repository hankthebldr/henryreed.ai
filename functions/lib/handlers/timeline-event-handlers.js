"use strict";
/**
 * Timeline Event Handlers
 *
 * Cloud Functions that normalize domain changes (TRR, Training, KB) into timeline events.
 * These functions trigger on Firestore writes and emit normalized events to user timelines.
 */
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
exports.onEventCreated = exports.trrsOnWrite = exports.knowledgebaseOnWrite = exports.trainingOnWrite = exports.trrOnWrite = void 0;
const functions = __importStar(require("firebase-functions/v2/firestore"));
const firestore_1 = require("firebase-admin/firestore");
const logger_1 = require("../utils/logger");
const timeline_helpers_1 = require("../utils/timeline-helpers");
const db = (0, firestore_1.getFirestore)();
/**
 * Generic handler for domain object writes (TRR, Training, KB)
 */
async function handleDomainWrite(event, // Using any to handle both DocumentSnapshot and QueryDocumentSnapshot
collectionName) {
    try {
        const before = event.data?.before?.data() || null;
        const after = event.data?.after?.data() || null;
        const docId = event.params.docId;
        // Skip if no meaningful changes
        if (!(0, timeline_helpers_1.shouldCreateEvent)(before, after)) {
            logger_1.logger.info(`Skipping timeline event for ${collectionName}/${docId} - no meaningful changes`);
            return;
        }
        // Extract owner/user ID
        const ownerUid = (0, timeline_helpers_1.extractOwnerId)(after || before);
        if (!ownerUid) {
            logger_1.logger.warn(`No owner found for ${collectionName}/${docId} - skipping timeline event creation`);
            return;
        }
        // Get source and object name
        const source = (0, timeline_helpers_1.getSourceFromCollection)(collectionName);
        const objectName = (0, timeline_helpers_1.extractObjectName)(after || before, docId);
        // Determine object type
        let objectType;
        if (source === 'trr')
            objectType = 'trr';
        else if (source === 'training')
            objectType = 'training';
        else
            objectType = 'knowledgebase';
        // Create event parameters
        const params = {
            userId: ownerUid,
            source,
            action: 'updated', // Will be determined by helper
            objectId: docId,
            objectType,
            objectName,
            before,
            after,
            context: {
                povId: (after?.povId || before?.povId),
                tvStage: (after?.tvStage || before?.tvStage),
                scenarioId: (after?.scenarioId || before?.scenarioId),
                labels: (after?.labels || before?.labels || []),
            },
            correlationId: (after?.correlationId || before?.correlationId),
        };
        // Create timeline event
        const timelineEvent = (0, timeline_helpers_1.createTimelineEvent)(params);
        const eventForFirestore = (0, timeline_helpers_1.prepareEventForFirestore)(timelineEvent);
        // Write event to user timeline
        const eventRef = db
            .collection('users')
            .doc(ownerUid)
            .collection('events')
            .doc(timelineEvent.eventId);
        await eventRef.set(eventForFirestore);
        logger_1.logger.info(`Timeline event created: ${timelineEvent.eventId} for ${source}/${docId} by user ${ownerUid}`);
        // Update lightweight user stats
        await updateUserStats(ownerUid, source, timelineEvent.action);
    }
    catch (error) {
        logger_1.logger.error(`Error handling ${collectionName} write for timeline event:`, error);
        // Don't throw - let the original operation succeed even if event logging fails
    }
}
/**
 * Updates lightweight counters in user stats
 */
async function updateUserStats(userId, source, action) {
    try {
        const statsRef = db.collection('users').doc(userId).collection('meta').doc('stats');
        await statsRef.set({
            lastActivityAt: firestore_1.FieldValue.serverTimestamp(),
            [`countsByType.${source}`]: firestore_1.FieldValue.increment(1),
            [`countsByAction.${action}`]: firestore_1.FieldValue.increment(1),
        }, { merge: true });
    }
    catch (error) {
        logger_1.logger.error(`Error updating user stats for ${userId}:`, error);
        // Non-fatal - continue
    }
}
// ============================================================================
// Cloud Functions: Firestore Triggers
// ============================================================================
/**
 * TRR document write handler
 * Triggers: onCreate, onUpdate, onDelete for /trr/{docId}
 */
exports.trrOnWrite = functions.onDocumentWritten({
    document: 'trr/{docId}',
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
}, async (event) => {
    await handleDomainWrite(event, 'trr');
});
/**
 * Training record write handler
 * Triggers: onCreate, onUpdate, onDelete for /training/{docId}
 */
exports.trainingOnWrite = functions.onDocumentWritten({
    document: 'training/{docId}',
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
}, async (event) => {
    await handleDomainWrite(event, 'training');
});
/**
 * Knowledge Base document write handler
 * Triggers: onCreate, onUpdate, onDelete for /knowledgebase/{docId}
 */
exports.knowledgebaseOnWrite = functions.onDocumentWritten({
    document: 'knowledgebase/{docId}',
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
}, async (event) => {
    await handleDomainWrite(event, 'knowledgebase');
});
/**
 * Alternative TRR collection name handler (trrs)
 * Some collections may use plural naming
 */
exports.trrsOnWrite = functions.onDocumentWritten({
    document: 'trrs/{docId}',
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
}, async (event) => {
    await handleDomainWrite(event, 'trrs');
});
// ============================================================================
// Event Aggregation Trigger (on event creation)
// ============================================================================
/**
 * Triggered when a new event is created in user timeline
 * Performs lightweight aggregation and velocity calculations
 */
exports.onEventCreated = functions.onDocumentCreated({
    document: 'users/{userId}/events/{eventId}',
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
}, async (event) => {
    try {
        const userId = event.params.userId;
        const eventData = event.data?.data();
        if (!eventData) {
            logger_1.logger.warn('Event created with no data');
            return;
        }
        // Calculate velocity metrics (7-day and 30-day rolling windows)
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const eventsRef = db.collection('users').doc(userId).collection('events');
        // Count events in last 7 days
        const events7d = await eventsRef
            .where('ts', '>=', sevenDaysAgo)
            .select('eventId')
            .get();
        // Count events in last 30 days
        const events30d = await eventsRef
            .where('ts', '>=', thirtyDaysAgo)
            .select('eventId')
            .get();
        const velocity7d = events7d.size / 7;
        const velocity30d = events30d.size / 30;
        // Update user stats with velocity metrics
        const statsRef = db.collection('users').doc(userId).collection('meta').doc('stats');
        await statsRef.set({
            velocity7d,
            velocity30d,
        }, { merge: true });
        logger_1.logger.info(`Velocity updated for user ${userId}: 7d=${velocity7d}, 30d=${velocity30d}`);
    }
    catch (error) {
        logger_1.logger.error('Error in onEventCreated handler:', error);
    }
});
//# sourceMappingURL=timeline-event-handlers.js.map