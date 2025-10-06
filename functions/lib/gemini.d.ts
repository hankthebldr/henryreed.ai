/**
 * Firebase Cloud Function for Gemini AI Integration
 *
 * Deploy this function to enable AI Insights in the DC Portal GUI.
 * This function calls the real Gemini AI API or OpenAI API based on configuration.
 */
import * as functions from 'firebase-functions';
export declare const gemini: functions.HttpsFunction;
