/**
 * Timeline Event Helper Utilities
 *
 * Pure functions for creating and manipulating timeline events.
 */

import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import {
  TimelineEvent,
  CreateEventParams,
  EventDelta,
  EventAction,
  EventSource,
  EventSeverity,
} from '../types/timeline-events';

/**
 * Generates a unique event ID
 */
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Computes the delta (differences) between two document snapshots
 */
export function computeDelta(
  before: FirebaseFirestore.DocumentData | null | undefined,
  after: FirebaseFirestore.DocumentData | null | undefined
): EventDelta {
  const changed = new Set<string>();
  const diff: Record<string, [any, any]> = {};

  if (!before && after) {
    // Document created - all fields are new
    Object.keys(after).forEach((key) => {
      if (!key.startsWith('_') && key !== 'createdAt' && key !== 'updatedAt') {
        changed.add(key);
      }
    });
  } else if (before && after) {
    // Document updated - find changed fields
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
    allKeys.forEach((key) => {
      if (key.startsWith('_') || key === 'createdAt' || key === 'updatedAt') {
        return;
      }
      const beforeVal = JSON.stringify(before[key]);
      const afterVal = JSON.stringify(after[key]);
      if (beforeVal !== afterVal) {
        changed.add(key);
        diff[key] = [before[key], after[key]];
      }
    });
  } else if (before && !after) {
    // Document deleted - all fields removed
    Object.keys(before).forEach((key) => {
      if (!key.startsWith('_')) {
        changed.add(key);
      }
    });
  }

  return {
    fields: Array.from(changed),
    diff: Object.keys(diff).length > 0 ? diff : undefined,
  };
}

/**
 * Determines the appropriate event action based on document state changes
 */
export function determineAction(
  before: FirebaseFirestore.DocumentData | null | undefined,
  after: FirebaseFirestore.DocumentData | null | undefined
): EventAction {
  if (!before && after) {
    return 'created';
  }
  if (before && !after) {
    return 'deleted';
  }
  if (before && after) {
    // Check for status changes
    if (before.status !== after.status) {
      return 'status_changed';
    }
    // Check for completion
    if (
      !before.completedAt &&
      after.completedAt &&
      (after.status === 'completed' || after.status === 'done')
    ) {
      return 'completed';
    }
    // Check for publishing
    if (
      (!before.publishedAt && after.publishedAt) ||
      (before.status !== 'published' && after.status === 'published')
    ) {
      return 'published';
    }
    return 'updated';
  }
  return 'updated';
}

/**
 * Extracts the object name from document data
 */
export function extractObjectName(
  data: FirebaseFirestore.DocumentData | null | undefined,
  objectId: string
): string {
  if (!data) return objectId;
  return data.title || data.name || data.topic || data.description || objectId;
}

/**
 * Creates a normalized timeline event from domain change parameters
 */
export function createTimelineEvent(params: CreateEventParams): TimelineEvent {
  const {
    userId,
    source,
    action: providedAction,
    objectId,
    objectType,
    objectName,
    before,
    after,
    context = {},
    correlationId,
    severity = 'info',
    ttlDays = 365,
  } = params;

  const action = providedAction || determineAction(before, after);
  const delta = computeDelta(before, after);

  return {
    eventId: generateEventId(),
    userId,
    actor: {
      uid: userId,
      // Actor details can be enriched later if needed
    },
    ts: Timestamp.now(),
    source,
    action,
    object: {
      type: objectType,
      id: objectId,
      name: objectName,
      version: after?.version || before?.version || 1,
      status_before: before?.status || null,
      status_after: after?.status || null,
    },
    delta,
    context: {
      povId: context.povId || null,
      tvStage: context.tvStage || null,
      scenarioId: context.scenarioId || null,
      labels: context.labels || [],
    },
    correlationId: correlationId || null,
    severity,
    ttlDays,
  };
}

/**
 * Validates that a timeline event has all required fields
 */
export function validateEvent(event: Partial<TimelineEvent>): event is TimelineEvent {
  return !!(
    event.eventId &&
    event.userId &&
    event.actor &&
    event.ts &&
    event.source &&
    event.action &&
    event.object &&
    event.delta &&
    event.context !== undefined &&
    event.severity &&
    typeof event.ttlDays === 'number'
  );
}

/**
 * Converts a Firestore server timestamp placeholder to the event object
 */
export function prepareEventForFirestore(
  event: TimelineEvent
): Omit<TimelineEvent, 'ts'> & { ts: typeof FieldValue.serverTimestamp } {
  return {
    ...event,
    ts: FieldValue.serverTimestamp() as any,
  };
}

/**
 * Gets the source from a collection name
 */
export function getSourceFromCollection(collectionName: string): EventSource {
  switch (collectionName) {
    case 'trr':
    case 'trrs':
      return 'trr';
    case 'training':
      return 'training';
    case 'knowledgebase':
    case 'knowledgeBase':
      return 'knowledgebase';
    case 'ui':
      return 'ui';
    case 'system':
      return 'system';
    default:
      return 'system';
  }
}

/**
 * Determines event severity based on action and source
 */
export function inferSeverity(action: EventAction, source: EventSource): EventSeverity {
  if (action === 'deleted') return 'warn';
  if (action === 'status_changed' && source === 'trr') return 'notice';
  if (action === 'completed') return 'notice';
  return 'info';
}

/**
 * Formats an event timestamp for display
 */
export function formatEventTimestamp(ts: Timestamp): string {
  const date = ts.toDate();
  return date.toISOString();
}

/**
 * Gets a human-readable label for an event action
 */
export function getActionLabel(action: EventAction): string {
  const labels: Record<EventAction, string> = {
    created: 'Created',
    updated: 'Updated',
    deleted: 'Deleted',
    status_changed: 'Status Changed',
    viewed: 'Viewed',
    note_added: 'Note Added',
    linked: 'Linked',
    completed: 'Completed',
    published: 'Published',
    archived: 'Archived',
  };
  return labels[action] || action;
}

/**
 * Gets a human-readable label for an event source
 */
export function getSourceLabel(source: EventSource): string {
  const labels: Record<EventSource, string> = {
    trr: 'TRR',
    training: 'Training',
    knowledgebase: 'Knowledge Base',
    ui: 'UI',
    system: 'System',
  };
  return labels[source] || source;
}

/**
 * Extracts owner/user ID from document data
 */
export function extractOwnerId(
  data: FirebaseFirestore.DocumentData | null | undefined
): string | null {
  if (!data) return null;
  return data.ownerUid || data.ownerId || data.userId || data.createdBy || null;
}

/**
 * Checks if an event should be created (filters out no-op updates)
 */
export function shouldCreateEvent(
  before: FirebaseFirestore.DocumentData | null | undefined,
  after: FirebaseFirestore.DocumentData | null | undefined
): boolean {
  // Always create events for create/delete
  if (!before || !after) return true;

  // Compute delta and check if anything meaningful changed
  const delta = computeDelta(before, after);

  // Skip if only updatedAt or version changed
  const meaningfulFields = delta.fields.filter(
    (f) => f !== 'updatedAt' && f !== 'version' && f !== '_lastModified'
  );

  return meaningfulFields.length > 0;
}
