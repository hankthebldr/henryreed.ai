/**
 * Timeline Analytics Rollup Functions
 *
 * Scheduled functions for aggregating event data into daily rollups and computing
 * global analytics across all users.
 */
/**
 * Daily rollup job - runs at 2 AM UTC daily
 * Aggregates events from the previous day into analytics/daily_rollups/{YYYY-MM-DD}
 */
export declare const dailyEventRollup: import("firebase-functions/v2/scheduler").ScheduleFunction;
/**
 * Weekly stats computation - runs every Monday at 3 AM UTC
 * Computes weekly metrics and trends
 */
export declare const weeklyStatsComputation: import("firebase-functions/v2/scheduler").ScheduleFunction;
/**
 * Cleanup old events (optional data retention enforcement)
 * Runs daily at 4 AM UTC, deletes events older than their ttlDays
 */
export declare const cleanupExpiredEvents: import("firebase-functions/v2/scheduler").ScheduleFunction;
