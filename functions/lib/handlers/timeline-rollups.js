"use strict";
/**
 * Timeline Analytics Rollup Functions
 *
 * Scheduled functions for aggregating event data into daily rollups and computing
 * global analytics across all users.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredEvents = exports.weeklyStatsComputation = exports.dailyEventRollup = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
const logger_1 = require("../utils/logger");
const db = (0, firestore_1.getFirestore)();
/**
 * Daily rollup job - runs at 2 AM UTC daily
 * Aggregates events from the previous day into analytics/daily_rollups/{YYYY-MM-DD}
 */
exports.dailyEventRollup = (0, scheduler_1.onSchedule)({
    schedule: '0 2 * * *', // 2 AM UTC daily
    timeZone: 'UTC',
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 540, // 9 minutes
}, async () => {
    try {
        logger_1.logger.info('Starting daily event rollup');
        // Get yesterday's date (we rollup the previous day)
        const yesterday = new Date();
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        yesterday.setUTCHours(0, 0, 0, 0);
        const today = new Date(yesterday);
        today.setUTCDate(today.getUTCDate() + 1);
        const dateKey = formatDateKey(yesterday);
        logger_1.logger.info(`Rolling up events for date: ${dateKey}`);
        // Query all events from yesterday across all users
        // Using collectionGroup to query all user events
        const eventsSnapshot = await db
            .collectionGroup('events')
            .where('ts', '>=', firestore_1.Timestamp.fromDate(yesterday))
            .where('ts', '<', firestore_1.Timestamp.fromDate(today))
            .get();
        logger_1.logger.info(`Found ${eventsSnapshot.size} events for ${dateKey}`);
        if (eventsSnapshot.empty) {
            logger_1.logger.info('No events to rollup for this date');
            return;
        }
        // Aggregate statistics
        const eventsBySource = {};
        const eventsByAction = {};
        const activeUsersSet = new Set();
        const userEventCounts = {};
        const statusTransitions = {
            trr: {},
            training: {},
            knowledgebase: {},
        };
        // Process each event
        eventsSnapshot.docs.forEach((doc) => {
            const event = doc.data();
            // Count by source
            eventsBySource[event.source] = (eventsBySource[event.source] || 0) + 1;
            // Count by action
            eventsByAction[event.action] = (eventsByAction[event.action] || 0) + 1;
            // Track active users
            if (event.userId) {
                activeUsersSet.add(event.userId);
                userEventCounts[event.userId] = (userEventCounts[event.userId] || 0) + 1;
            }
            // Track status transitions
            if (event.action === 'status_changed' && event.object?.status_after) {
                const objectType = event.object.type;
                const status = event.object.status_after;
                if (objectType in statusTransitions) {
                    if (!statusTransitions[objectType]) {
                        statusTransitions[objectType] = {};
                    }
                    statusTransitions[objectType][status] =
                        (statusTransitions[objectType][status] || 0) + 1;
                }
            }
        });
        // Get top 10 users by activity
        const topUsers = Object.entries(userEventCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([uid, eventCount]) => ({ uid, eventCount }));
        // Enrich top users with email (if available)
        const enrichedTopUsers = await Promise.all(topUsers.map(async (user) => {
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                const userData = userDoc.data();
                return {
                    ...user,
                    email: userData?.email || undefined,
                };
            }
            catch (error) {
                logger_1.logger.warn(`Could not fetch user data for ${user.uid}`);
                return user;
            }
        }));
        // Create rollup document
        const rollup = {
            date: dateKey,
            eventsBySource: eventsBySource,
            eventsByAction: eventsByAction,
            activeUsers: activeUsersSet.size,
            topUsers: enrichedTopUsers,
            statusTransitions,
            computedAt: firestore_1.Timestamp.now(),
        };
        // Write rollup to Firestore
        await db.collection('analytics').doc('daily_rollups').collection('dates').doc(dateKey).set(rollup);
        logger_1.logger.info(`Daily rollup completed for ${dateKey}`);
        logger_1.logger.info(`Summary: ${eventsSnapshot.size} events, ${activeUsersSet.size} active users, sources: ${JSON.stringify(eventsBySource)}`);
    }
    catch (error) {
        logger_1.logger.error('Error in daily event rollup:', error);
        throw error; // Re-throw to mark the scheduled job as failed
    }
});
/**
 * Weekly stats computation - runs every Monday at 3 AM UTC
 * Computes weekly metrics and trends
 */
exports.weeklyStatsComputation = (0, scheduler_1.onSchedule)({
    schedule: '0 3 * * 1', // Every Monday at 3 AM UTC
    timeZone: 'UTC',
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 540,
}, async () => {
    try {
        logger_1.logger.info('Starting weekly stats computation');
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        // Get all daily rollups from the past week
        const weekKey = formatWeekKey(now);
        const rollups = await db
            .collection('analytics')
            .doc('daily_rollups')
            .collection('dates')
            .where('computedAt', '>=', firestore_1.Timestamp.fromDate(oneWeekAgo))
            .orderBy('computedAt', 'desc')
            .limit(7)
            .get();
        if (rollups.empty) {
            logger_1.logger.info('No rollups found for the past week');
            return;
        }
        // Aggregate weekly metrics
        let totalEvents = 0;
        const activeUsersSet = new Set();
        const eventsBySource = {};
        const eventsByAction = {};
        rollups.docs.forEach((doc) => {
            const rollup = doc.data();
            // Sum events by source
            Object.entries(rollup.eventsBySource).forEach(([source, count]) => {
                eventsBySource[source] = (eventsBySource[source] || 0) + count;
                totalEvents += count;
            });
            // Sum events by action
            Object.entries(rollup.eventsByAction).forEach(([action, count]) => {
                eventsByAction[action] = (eventsByAction[action] || 0) + count;
            });
            // Track unique active users (approximation)
            rollup.topUsers.forEach((user) => activeUsersSet.add(user.uid));
        });
        const weeklyStats = {
            week: weekKey,
            totalEvents,
            activeUsers: activeUsersSet.size,
            eventsBySource,
            eventsByAction,
            avgEventsPerDay: totalEvents / 7,
            avgActiveUsersPerDay: activeUsersSet.size / 7,
            computedAt: firestore_1.Timestamp.now(),
        };
        // Write weekly stats
        await db
            .collection('analytics')
            .doc('weekly_rollups')
            .collection('weeks')
            .doc(weekKey)
            .set(weeklyStats);
        logger_1.logger.info(`Weekly stats computed for ${weekKey}`);
        logger_1.logger.info(`Summary: ${totalEvents} events, ${activeUsersSet.size} active users`);
    }
    catch (error) {
        logger_1.logger.error('Error in weekly stats computation:', error);
        throw error;
    }
});
/**
 * Cleanup old events (optional data retention enforcement)
 * Runs daily at 4 AM UTC, deletes events older than their ttlDays
 */
exports.cleanupExpiredEvents = (0, scheduler_1.onSchedule)({
    schedule: '0 4 * * *', // 4 AM UTC daily
    timeZone: 'UTC',
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 540,
}, async () => {
    try {
        logger_1.logger.info('Starting expired events cleanup');
        const now = new Date();
        // Query events with ttlDays < 365 that have expired
        // For simplicity, we'll delete events older than 365 days by default
        const expiryDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        const expiredEvents = await db
            .collectionGroup('events')
            .where('ts', '<', firestore_1.Timestamp.fromDate(expiryDate))
            .limit(500) // Process in batches
            .get();
        if (expiredEvents.empty) {
            logger_1.logger.info('No expired events to clean up');
            return;
        }
        logger_1.logger.info(`Found ${expiredEvents.size} expired events to delete`);
        // Delete in batches
        const batch = db.batch();
        expiredEvents.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        logger_1.logger.info(`Deleted ${expiredEvents.size} expired events`);
    }
    catch (error) {
        logger_1.logger.error('Error in expired events cleanup:', error);
        throw error;
    }
});
// ============================================================================
// Helper Functions
// ============================================================================
/**
 * Formats a date as YYYY-MM-DD
 */
function formatDateKey(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
/**
 * Formats a date as YYYY-WW (ISO week number)
 */
function formatWeekKey(date) {
    const year = date.getUTCFullYear();
    const weekNum = getISOWeekNumber(date);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
}
/**
 * Gets the ISO week number for a date
 */
function getISOWeekNumber(date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setUTCMonth(0, 1);
    if (target.getUTCDay() !== 4) {
        target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}
//# sourceMappingURL=timeline-rollups.js.map