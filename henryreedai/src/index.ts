/**
 * Cortex DC Portal - Genkit AI Functions
 * 
 * Enhanced AI capabilities for POV analysis, TRR recommendations,
 * detection generation, and intelligent insights using Google's Genkit.
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Import Genkit functions
import { menuSuggestion } from './genkit-sample';
import {
  aiPovAnalysis,
  aiTrrRecommendations,
  aiDetectionGeneration,
  aiScenarioOptimization,
  aiChatAssistant,
  aiCompetitiveAnalysis,
  aiRiskAssessment
} from './ai-functions';

// Configure global options for cost control
setGlobalOptions({ maxInstances: 10, region: 'us-central1' });

// Health check endpoint
export const healthCheck = onRequest({ cors: true }, (req, res) => {
  res.json({
    status: 'healthy',
    service: 'henryreedai-genkit',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Export all AI functions
export {
  menuSuggestion,
  aiPovAnalysis,
  aiTrrRecommendations,
  aiDetectionGeneration,
  aiScenarioOptimization,
  aiChatAssistant,
  aiCompetitiveAnalysis,
  aiRiskAssessment
};

logger.info('Cortex DC Portal Genkit AI Functions initialized successfully');
