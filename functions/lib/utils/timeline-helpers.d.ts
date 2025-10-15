/**
 * Timeline Event Helper Utilities
 *
 * Pure functions for creating and manipulating timeline events.
 */
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { TimelineEvent, CreateEventParams, EventDelta, EventAction, EventSource, EventSeverity } from '../types/timeline-events';
/**
 * Generates a unique event ID
 */
export declare function generateEventId(): string;
/**
 * Computes the delta (differences) between two document snapshots
 */
export declare function computeDelta(before: FirebaseFirestore.DocumentData | null | undefined, after: FirebaseFirestore.DocumentData | null | undefined): EventDelta;
/**
 * Determines the appropriate event action based on document state changes
 */
export declare function determineAction(before: FirebaseFirestore.DocumentData | null | undefined, after: FirebaseFirestore.DocumentData | null | undefined): EventAction;
/**
 * Extracts the object name from document data
 */
export declare function extractObjectName(data: FirebaseFirestore.DocumentData | null | undefined, objectId: string): string;
/**
 * Creates a normalized timeline event from domain change parameters
 */
export declare function createTimelineEvent(params: CreateEventParams): TimelineEvent;
/**
 * Validates that a timeline event has all required fields
 */
export declare function validateEvent(event: Partial<TimelineEvent>): event is TimelineEvent;
/**
 * Converts a Firestore server timestamp placeholder to the event object
 */
export declare function prepareEventForFirestore(event: TimelineEvent): Omit<TimelineEvent, 'ts'> & {
    ts: typeof FieldValue.serverTimestamp;
};
/**
 * Gets the source from a collection name
 */
export declare function getSourceFromCollection(collectionName: string): EventSource;
/**
 * Determines event severity based on action and source
 */
export declare function inferSeverity(action: EventAction, source: EventSource): EventSeverity;
/**
 * Formats an event timestamp for display
 */
export declare function formatEventTimestamp(ts: Timestamp): string;
/**
 * Gets a human-readable label for an event action
 */
export declare function getActionLabel(action: EventAction): string;
/**
 * Gets a human-readable label for an event source
 */
export declare function getSourceLabel(source: EventSource): string;
/**
 * Extracts owner/user ID from document data
 */
export declare function extractOwnerId(data: FirebaseFirestore.DocumentData | null | undefined): string | null;
/**
 * Checks if an event should be created (filters out no-op updates)
 */
export declare function shouldCreateEvent(before: FirebaseFirestore.DocumentData | null | undefined, after: FirebaseFirestore.DocumentData | null | undefined): boolean;
