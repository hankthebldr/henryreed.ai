/**
 * useTimeline Hook
 *
 * React hook for fetching and managing user timeline events
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  onSnapshot,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase-config';
import { TimelineEvent, TimelineFilter, UserStats } from '../types/timeline';

export interface UseTimelineOptions {
  userId: string;
  filters?: TimelineFilter;
  pageSize?: number;
  realtime?: boolean;
}

export interface UseTimelineResult {
  events: TimelineEvent[];
  stats: UserStats | null;
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTimeline(options: UseTimelineOptions): UseTimelineResult {
  const { userId, filters = {}, pageSize = 50, realtime = false } = options;

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  /**
   * Builds Firestore query constraints from filters
   */
  const buildQueryConstraints = useCallback((): QueryConstraint[] => {
    const constraints: QueryConstraint[] = [];

    // Always filter by userId (implicit in collection path)
    // constraints.push(where('userId', '==', userId));

    // Filter by source
    if (filters.source) {
      constraints.push(where('source', '==', filters.source));
    }

    // Filter by action
    if (filters.action) {
      constraints.push(where('action', '==', filters.action));
    }

    // Filter by object type
    if (filters.objectType) {
      constraints.push(where('object.type', '==', filters.objectType));
    }

    // Filter by POV ID
    if (filters.povId) {
      constraints.push(where('context.povId', '==', filters.povId));
    }

    // Date range filters
    if (filters.startDate) {
      constraints.push(where('ts', '>=', Timestamp.fromDate(filters.startDate)));
    }
    if (filters.endDate) {
      constraints.push(where('ts', '<=', Timestamp.fromDate(filters.endDate)));
    }

    // Always order by timestamp descending
    constraints.push(orderBy('ts', 'desc'));

    // Limit results
    constraints.push(limit(pageSize));

    return constraints;
  }, [userId, filters, pageSize]);

  /**
   * Fetches timeline events
   */
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const eventsRef = collection(db, 'users', userId, 'events');
      const constraints = buildQueryConstraints();
      const q = query(eventsRef, ...constraints);

      const snapshot = await getDocs(q);

      const fetchedEvents = snapshot.docs.map((doc) => ({
        ...doc.data(),
        eventId: doc.id,
      })) as TimelineEvent[];

      setEvents(fetchedEvents);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (err) {
      console.error('Error fetching timeline events:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, buildQueryConstraints, pageSize]);

  /**
   * Fetches user stats
   */
  const fetchStats = useCallback(async () => {
    try {
      const statsRef = collection(db, 'users', userId, 'meta');
      const statsQuery = query(statsRef);
      const snapshot = await getDocs(statsQuery);

      if (!snapshot.empty) {
        const statsDoc = snapshot.docs.find((doc) => doc.id === 'stats');
        if (statsDoc) {
          setStats(statsDoc.data() as UserStats);
        }
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  }, [userId]);

  /**
   * Sets up realtime listener
   */
  useEffect(() => {
    if (!realtime) {
      fetchEvents();
      fetchStats();
      return;
    }

    const eventsRef = collection(db, 'users', userId, 'events');
    const constraints = buildQueryConstraints();
    const q = query(eventsRef, ...constraints);

    const unsubscribeEvents = onSnapshot(
      q,
      (snapshot) => {
        const fetchedEvents = snapshot.docs.map((doc) => ({
          ...doc.data(),
          eventId: doc.id,
        })) as TimelineEvent[];

        setEvents(fetchedEvents);
        setHasMore(snapshot.docs.length === pageSize);
        setLoading(false);
      },
      (err) => {
        console.error('Timeline realtime error:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // Also listen to stats updates
    const statsRef = collection(db, 'users', userId, 'meta');
    const unsubscribeStats = onSnapshot(
      statsRef,
      (snapshot) => {
        const statsDoc = snapshot.docs.find((doc) => doc.id === 'stats');
        if (statsDoc) {
          setStats(statsDoc.data() as UserStats);
        }
      },
      (err) => {
        console.error('Stats realtime error:', err);
      }
    );

    return () => {
      unsubscribeEvents();
      unsubscribeStats();
    };
  }, [userId, realtime, buildQueryConstraints, pageSize, fetchEvents, fetchStats]);

  /**
   * Load more events (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);

      const lastEvent = events[events.length - 1];
      if (!lastEvent) return;

      const eventsRef = collection(db, 'users', userId, 'events');
      const constraints = [
        ...buildQueryConstraints().filter((c) => c.type !== 'limit'),
        where('ts', '<', lastEvent.ts),
        limit(pageSize),
      ];
      const q = query(eventsRef, ...constraints);

      const snapshot = await getDocs(q);
      const moreEvents = snapshot.docs.map((doc) => ({
        ...doc.data(),
        eventId: doc.id,
      })) as TimelineEvent[];

      setEvents((prev) => [...prev, ...moreEvents]);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (err) {
      console.error('Error loading more events:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, events, hasMore, loading, buildQueryConstraints, pageSize]);

  /**
   * Refresh timeline data
   */
  const refresh = useCallback(async () => {
    await Promise.all([fetchEvents(), fetchStats()]);
  }, [fetchEvents, fetchStats]);

  return {
    events,
    stats,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
