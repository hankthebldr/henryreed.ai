import * as functions from 'firebase-functions';
declare const app: import("express-serve-static-core").Express;
/**
 * AI-powered TRR suggestion and enhancement
 * Provides intelligent suggestions for TRR fields, risk assessment, and validation
 */
export declare const aiTrrSuggest: functions.HttpsFunction & functions.Runnable<any>;
export declare const api: functions.HttpsFunction;
export { app };
