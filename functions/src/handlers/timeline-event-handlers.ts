/**
 * Timeline Event Handlers
 *
 * Cloud Functions that normalize domain changes (TRR, Training, KB) into timeline events.
 * These functions trigger on Firestore writes and emit normalized events to user timelines.
 */

import * as functions from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from '../utils/logger';
import {
  createTimelineEvent,
  extractObjectName,
  extractOwnerId,
  getSourceFromCollection,
  shouldCreateEvent,
  prepareEventForFirestore,
} from '../utils/timeline-helpers';
import { CreateEventParams, EventSource } from '../types/timeline-events';

const db = getFirestore();

/**
 * Generic handler for domain object writes (TRR, Training, KB)
 */
async function handleDomainWrite(
  event: any, // Using any to handle both DocumentSnapshot and QueryDocumentSnapshot
  collectionName: string
): Promise<void> {
  try {
    const before = event.data?.before?.data() || null;
    const after = event.data?.after?.data() || null;
    const docId = event.params.docId as string;

    // Skip if no meaningful changes
    if (!shouldCreateEvent(before, after)) {
      logger.info(`Skipping timeline event for ${collectionName}/${docId} - no meaningful changes`);
      return;
    }

    // Extract owner/user ID
    const ownerUid = extractOwnerId(after || before);
    if (!ownerUid) {
      logger.warn(
        `No owner found for ${collectionName}/${docId} - skipping timeline event creation`
      );
      return;
    }

    // Get source and object name
    const source = getSourceFromCollection(collectionName) as EventSource;
    const objectName = extractObjectName(after || before, docId);

    // Determine object type
    let objectType: 'trr' | 'training' | 'knowledgebase';
    if (source === 'trr') objectType = 'trr';
    else if (source === 'training') objectType = 'training';
    else objectType = 'knowledgebase';

    // Create event parameters
    const params: CreateEventParams = {
      userId: ownerUid,
      source,
      action: 'updated', // Will be determined by helper
      objectId: docId,
      objectType,
      objectName,
      before,
      after,
      context: {
        povId: (after?.povId || before?.povId) as string | undefined,
        tvStage: (after?.tvStage || before?.tvStage) as 'TechValidation' | 'POV' | undefined,
        scenarioId: (after?.scenarioId || before?.scenarioId) as string | undefined,
        labels: (after?.labels || before?.labels || []) as string[],
      },
      correlationId: (after?.correlationId || before?.correlationId) as string | undefined,
    };

    // Create timeline event
    const timelineEvent = createTimelineEvent(params);
    const eventForFirestore = prepareEventForFirestore(timelineEvent);

    // Write event to user timeline
    const eventRef = db
      .collection('users')
      .doc(ownerUid)
      .collection('events')
      .doc(timelineEvent.eventId);

    await eventRef.set(eventForFirestore);

    logger.info(
      `Timeline event created: ${timelineEvent.eventId} for ${source}/${docId} by user ${ownerUid}`
    );

    // Update lightweight user stats
    await updateUserStats(ownerUid, source, timelineEvent.action);
  } catch (error) {
    logger.error(`Error handling ${collectionName} write for timeline event:`, error);
    // Don't throw - let the original operation succeed even if event logging fails
  }
}

/**
 * Updates lightweight counters in user stats
 */
async function updateUserStats(
  userId: string,
  source: EventSource,
  action: string
): Promise<void> {
  try {
    const statsRef = db.collection('users').doc(userId).collection('meta').doc('stats');

    await statsRef.set(
      {
        lastActivityAt: FieldValue.serverTimestamp(),
        [`countsByType.${source}`]: FieldValue.increment(1),
        [`countsByAction.${action}`]: FieldValue.increment(1),
      },
      { merge: true }
    );
  } catch (error) {
    logger.error(`Error updating user stats for ${userId}:`, error);
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
export const trrOnWrite = functions.onDocumentWritten(
  {
    document: 'trr/{docId}',
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    await handleDomainWrite(event, 'trr');
  }
);

/**
 * Training record write handler
 * Triggers: onCreate, onUpdate, onDelete for /training/{docId}
 */
export const trainingOnWrite = functions.onDocumentWritten(
  {
    document: 'training/{docId}',
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    await handleDomainWrite(event, 'training');
  }
);

/**
 * Knowledge Base document write handler
 * Triggers: onCreate, onUpdate, onDelete for /knowledgebase/{docId}
 */
export const knowledgebaseOnWrite = functions.onDocumentWritten(
  {
    document: 'knowledgebase/{docId}',
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    await handleDomainWrite(event, 'knowledgebase');
  }
);

/**
 * Alternative TRR collection name handler (trrs)
 * Some collections may use plural naming
 */
export const trrsOnWrite = functions.onDocumentWritten(
  {
    document: 'trrs/{docId}',
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    await handleDomainWrite(event, 'trrs');
  }
);

// ============================================================================
// Event Aggregation Trigger (on event creation)
// ============================================================================

/**
 * Triggered when a new event is created in user timeline
 * Performs lightweight aggregation and velocity calculations
 */
export const onEventCreated = functions.onDocumentCreated(
  {
    document: 'users/{userId}/events/{eventId}',
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (event) => {
    try {
      const userId = event.params.userId as string;
      const eventData = event.data?.data();

      if (!eventData) {
        logger.warn('Event created with no data');
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
      await statsRef.set(
        {
          velocity7d,
          velocity30d,
        },
        { merge: true }
      );

      logger.info(`Velocity updated for user ${userId}: 7d=${velocity7d}, 30d=${velocity30d}`);
    } catch (error) {
      logger.error('Error in onEventCreated handler:', error);
    }
  }
);
