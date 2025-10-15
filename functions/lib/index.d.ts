import { processScenarioExecution, monitorExecutionStatusChanges, cleanupOldExecutions } from './handlers/scenario-executor';
import { generateBadassBlueprintCallable, renderBadassBlueprintPdf, bundleBlueprintArtifacts, exportBlueprintAnalytics } from './handlers/badass-blueprint';
declare const app: import("express-serve-static-core").Express;
/**
 * AI-powered TRR suggestion and enhancement
 * Provides intelligent suggestions for TRR fields, risk assessment, and validation
 */
export declare const aiTrrSuggest: import("firebase-functions/v2/https").CallableFunction<any, Promise<any>, unknown>;
/**
 * AI-powered threat actor scenario generation
 * Generates comprehensive attack scenarios based on threat actor profiles
 */
export declare const generateThreatActorScenarioFunction: import("firebase-functions/v2/https").CallableFunction<any, Promise<any>, unknown>;
/**
 * Scenario execution management
 * Starts execution of a scenario blueprint
 */
export declare const executeScenarioFunction: import("firebase-functions/v2/https").CallableFunction<any, Promise<any>, unknown>;
/**
 * Scenario execution control
 * Controls running scenario executions (pause, resume, cancel, restart)
 */
export declare const controlScenarioExecutionFunction: import("firebase-functions/v2/https").CallableFunction<any, Promise<any>, unknown>;
/**
 * AI-powered detection query generation
 * Generates optimized detection queries for threat vectors
 */
export declare const generateDetectionQueriesFunction: import("firebase-functions/v2/https").CallableFunction<any, Promise<any>, unknown>;
/**
 * Background scenario execution processor
 * Triggered by Pub/Sub messages to execute scenarios in the background
 */
export { processScenarioExecution };
/**
 * Monitors scenario execution status changes
 * Triggered by Firestore updates to handle execution state transitions
 */
export { monitorExecutionStatusChanges };
/**
 * Scheduled cleanup of old executions and logs
 * Runs daily to clean up expired data
 */
export { cleanupOldExecutions };
export { generateBadassBlueprintCallable as generateBadassBlueprint, renderBadassBlueprintPdf, bundleBlueprintArtifacts, exportBlueprintAnalytics, };
export declare const api: import("firebase-functions/v2/https").HttpsFunction;
export { beforeUserCreation, beforeUserSignIn, onUserDocumentCreated, createUserProfile, updateUserProfile } from './auth/user-creation-handler';
export { trrOnWrite, trainingOnWrite, knowledgebaseOnWrite, trrsOnWrite, onEventCreated, } from './handlers/timeline-event-handlers';
export { dailyEventRollup, weeklyStatsComputation, cleanupExpiredEvents, } from './handlers/timeline-rollups';
export { app };
