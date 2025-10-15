/**
 * Client-side Timeline & Event Types
 *
 * Mirrors the server-side types for use in the Next.js application
 */

import { Timestamp } from 'firebase/firestore';

export type EventSource = 'trr' | 'training' | 'knowledgebase' | 'ui' | 'system';

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

export type EventSeverity = 'info' | 'notice' | 'warn' | 'error';

export interface EventActor {
  uid: string;
  email?: string;
  role?: 'admin' | 'dc_admin' | 'manager' | 'user';
  displayName?: string;
}

export interface EventObject {
  type: 'trr' | 'training' | 'knowledgebase';
  id: string;
  name: string;
  version?: number;
  status_before?: string | null;
  status_after?: string | null;
}

export interface EventDelta {
  fields: string[];
  diff?: Record<string, [any, any]>;
}

export interface EventContext {
  povId?: string | null;
  tvStage?: 'TechValidation' | 'POV' | null;
  scenarioId?: string | null;
  labels?: string[];
}

export interface TimelineEvent {
  eventId: string;
  userId: string;
  actor: EventActor;
  ts: Timestamp;
  source: EventSource;
  action: EventAction;
  object: EventObject;
  delta: EventDelta;
  context: EventContext;
  correlationId?: string | null;
  severity: EventSeverity;
  ttlDays: number;
}

export interface UserStats {
  lastActivityAt: Timestamp;
  countsByType: {
    trr?: number;
    training?: number;
    knowledgebase?: number;
    ui?: number;
    system?: number;
  };
  countsByAction: Record<string, number>;
  velocity7d?: number;
  velocity30d?: number;
  completionRate?: number;
  avgCompletionTime?: number;
}

export interface TimelineFilter {
  source?: EventSource;
  action?: EventAction;
  objectType?: 'trr' | 'training' | 'knowledgebase';
  povId?: string;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

export interface DailyRollup {
  date: string;
  eventsBySource: Record<EventSource, number>;
  eventsByAction: Record<EventAction, number>;
  activeUsers: number;
  topUsers: Array<{ uid: string; email?: string; eventCount: number }>;
  statusTransitions: {
    trr?: Record<string, number>;
    training?: Record<string, number>;
    knowledgebase?: Record<string, number>;
  };
  computedAt: Timestamp;
}
