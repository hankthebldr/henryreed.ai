/**
 * User Timeline & Event System Types
 *
 * Canonical event envelope for tracking user activity across TRR, Training, and KB domains.
 * Events are immutable, append-only, and provide a single source of truth for user actions.
 */

import { Timestamp } from 'firebase-admin/firestore';

/**
 * Domain sources that emit events
 */
export type EventSource = 'trr' | 'training' | 'knowledgebase' | 'ui' | 'system';

/**
 * Standard event actions across all domains
 */
export type EventAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'status_changed'
  | 'viewed'
  | 'note_added'
  | 'linked'
  | 'completed'
  | 'published'
  | 'archived';

/**
 * Event severity levels
 */
export type EventSeverity = 'info' | 'notice' | 'warn' | 'error';

/**
 * Actor information (who performed the action)
 */
export interface EventActor {
  uid: string;
  email?: string;
  role?: 'admin' | 'dc_admin' | 'manager' | 'user';
  displayName?: string;
}

/**
 * Object being acted upon
 */
export interface EventObject {
  type: 'trr' | 'training' | 'knowledgebase';
  id: string;
  name: string;
  version?: number;
  status_before?: string | null;
  status_after?: string | null;
}

/**
 * Delta of changes made (what changed)
 */
export interface EventDelta {
  fields: string[];
  diff?: Record<string, [any, any]>; // [before, after] for each field
}

/**
 * Context metadata for categorization and filtering
 */
export interface EventContext {
  povId?: string | null;
  tvStage?: 'TechValidation' | 'POV' | null;
  scenarioId?: string | null;
  labels?: string[]; // e.g., ['mitre:tactic:TA0003', 'vertical:finance']
}

/**
 * Canonical Event Envelope (v1)
 *
 * Immutable event record capturing user actions across all domain objects.
 */
export interface TimelineEvent {
  /** Auto-generated unique event ID */
  eventId: string;

  /** User who owns this event (events stored in users/{uid}/events) */
  userId: string;

  /** Actor who performed the action */
  actor: EventActor;

  /** Event timestamp (Firestore server timestamp) */
  ts: Timestamp;

  /** Source system/domain */
  source: EventSource;

  /** Action performed */
  action: EventAction;

  /** Object being acted upon */
  object: EventObject;

  /** What changed (field-level deltas) */
  delta: EventDelta;

  /** Additional context for filtering and categorization */
  context: EventContext;

  /** Correlation ID for tracking related events (e.g., scenario runs) */
  correlationId?: string | null;

  /** Event severity */
  severity: EventSeverity;

  /** Time-to-live in days (for data retention) */
  ttlDays: number;
}

/**
 * User statistics aggregated from events
 */
export interface UserStats {
  /** Last activity timestamp */
  lastActivityAt: Timestamp;

  /** Count of events by source type */
  countsByType: {
    trr?: number;
    training?: number;
    knowledgebase?: number;
    ui?: number;
    system?: number;
  };

  /** Count of events by action */
  countsByAction: {
    created?: number;
    updated?: number;
    deleted?: number;
    status_changed?: number;
    completed?: number;
    published?: number;
    [key: string]: number | undefined;
  };

  /** Activity velocity (events per day) over rolling windows */
  velocity7d?: number;  // Last 7 days
  velocity30d?: number; // Last 30 days

  /** Completion metrics */
  completionRate?: number; // Percentage of completed items
  avgCompletionTime?: number; // Average time to completion (hours)
}

/**
 * Daily rollup analytics (global, stored in analytics/daily_rollups/{YYYY-MM-DD})
 */
export interface DailyRollup {
  /** Date of rollup (YYYY-MM-DD) */
  date: string;

  /** Total events by source */
  eventsBySource: Record<EventSource, number>;

  /** Total events by action */
  eventsByAction: Record<EventAction, number>;

  /** Unique active users */
  activeUsers: number;

  /** Top users by activity */
  topUsers: Array<{ uid: string; email?: string; eventCount: number }>;

  /** Status transitions (for lifecycle metrics) */
  statusTransitions: {
    trr?: Record<string, number>;
    training?: Record<string, number>;
    knowledgebase?: Record<string, number>;
  };

  /** Timestamp when rollup was computed */
  computedAt: Timestamp;
}

/**
 * Parameters for creating a timeline event
 */
export interface CreateEventParams {
  userId: string;
  source: EventSource;
  action: EventAction;
  objectId: string;
  objectType: 'trr' | 'training' | 'knowledgebase';
  objectName: string;
  before?: FirebaseFirestore.DocumentData | null;
  after?: FirebaseFirestore.DocumentData | null;
  context?: Partial<EventContext>;
  correlationId?: string;
  severity?: EventSeverity;
  ttlDays?: number;
}

/**
 * Query filters for timeline events
 */
export interface TimelineQueryFilters {
  userId: string;
  source?: EventSource;
  action?: EventAction;
  objectType?: 'trr' | 'training' | 'knowledgebase';
  povId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}
