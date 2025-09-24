// AI assistance adapter for TRR suggestions and enhancements
// Proxy layer to Cloud Functions with caching and error handling

import { callTRRAIFunction } from '../firebase/client';
import {
  TechnicalRequirementReview,
  CreateTRRFormData,
  RiskAssessment,
  DORStatus,
  SDWStatus,
  AIPrediction,
  TRRTestCase,
} from '../../types/trr-extended';

// AI suggestion types
export type AISuggestionType = 
  | 'title'
  | 'description'
  | 'category'
  | 'priority'
  | 'acceptance_criteria'
  | 'test_cases'
  | 'risk_assessment'
  | 'timeline_prediction'
  | 'validation_method'
  | 'complete_fields';

// Request/Response interfaces
export interface AISuggestionRequest {
  trrId?: string;
  formData: Partial<CreateTRRFormData>;
  suggestionType: AISuggestionType;
  context: {
    organizationId: string;
    projectId: string;
    portfolioId?: string;
    userRole?: string;
  };
}

export interface AISuggestionResponse {
  suggestions: Record<string, any>;
  confidence: number;
  rationale: string;
  modelUsed: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface AIFieldSuggestions {
  title?: string[];
  description?: string;
  category?: string;
  priority?: string;
  businessImpact?: string;
  acceptanceCriteria?: string[];
  technicalApproach?: string;
  validationMethod?: string;
  riskAssessment?: RiskAssessment;
}

export interface AIArtifacts {
  acceptanceCriteria: string[];
  testCases: TRRTestCase[];
}

// Error handling
export class AIAssistError extends Error {
  constructor(
    message: string,
    public code: string,
    public suggestion?: string
  ) {
    super(message);
    this.name = 'AIAssistError';
  }
}

// Cache management for AI responses
class AICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly defaultTTL = 15 * 60 * 1000; // 15 minutes

  private generateKey(request: AISuggestionRequest): string {
    const keyData = {
      type: request.suggestionType,
      data: request.formData,
      context: request.context,
    };
    return btoa(JSON.stringify(keyData));
  }

  get(request: AISuggestionRequest): AISuggestionResponse | null {
    const key = this.generateKey(request);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  set(request: AISuggestionRequest, response: AISuggestionResponse, ttl?: number): void {
    const key = this.generateKey(request);
    this.cache.set(key, {
      data: response,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.timestamp + cached.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

const aiCache = new AICache();

// Cleanup cache every 5 minutes
setInterval(() => aiCache.cleanup(), 5 * 60 * 1000);

// Rate limiting for AI calls
class RateLimiter {
  private calls = new Map<string, number[]>();
  private readonly maxCalls = 50; // Per hour
  private readonly windowMs = 60 * 60 * 1000; // 1 hour

  canMakeCall(organizationId: string): boolean {
    const now = Date.now();
    const calls = this.calls.get(organizationId) || [];
    
    // Remove old calls outside the window
    const recentCalls = calls.filter(timestamp => now - timestamp < this.windowMs);
    this.calls.set(organizationId, recentCalls);
    
    return recentCalls.length < this.maxCalls;
  }

  recordCall(organizationId: string): void {
    const now = Date.now();
    const calls = this.calls.get(organizationId) || [];
    calls.push(now);
    this.calls.set(organizationId, calls);
  }

  getRemainingCalls(organizationId: string): number {
    const now = Date.now();
    const calls = this.calls.get(organizationId) || [];
    const recentCalls = calls.filter(timestamp => now - timestamp < this.windowMs);
    return Math.max(0, this.maxCalls - recentCalls.length);
  }
}

const rateLimiter = new RateLimiter();

// Utility functions
const validateSuggestionRequest = (request: AISuggestionRequest): void => {
  if (!request.suggestionType) {
    throw new AIAssistError('Suggestion type is required', 'invalid-request');
  }
  
  if (!request.context?.organizationId) {
    throw new AIAssistError('Organization context is required', 'invalid-request');
  }
  
  if (!request.formData || Object.keys(request.formData).length === 0) {
    throw new AIAssistError('Form data is required', 'invalid-request');
  }
};

const handleAIError = (error: any): never => {
  console.error('AI Assist Error:', error);
  
  if (error.code === 'functions/unauthenticated') {
    throw new AIAssistError('Authentication required', 'auth-required');
  }
  
  if (error.code === 'functions/permission-denied') {
    throw new AIAssistError('Insufficient permissions', 'permission-denied');
  }
  
  if (error.code === 'functions/resource-exhausted') {
    throw new AIAssistError(
      'AI service rate limit exceeded',
      'rate-limited',
      'Please wait a few minutes before trying again'
    );
  }
  
  if (error.code === 'functions/unavailable') {
    throw new AIAssistError(
      'AI service temporarily unavailable',
      'service-unavailable',
      'Please try again in a few moments'
    );
  }
  
  throw new AIAssistError(
    'AI assistance temporarily unavailable',
    'service-error',
    'Please try again later'
  );
};

// ============================================================================
// Core AI Assistance Functions
// ============================================================================

export const suggestFields = async (
  data: Partial<CreateTRRFormData>,
  context: AISuggestionRequest['context']
): Promise<AIFieldSuggestions> => {
  const request: AISuggestionRequest = {
    formData: data,
    suggestionType: 'complete_fields',
    context,
  };
  
  try {
    validateSuggestionRequest(request);
    
    // Check cache first
    const cached = aiCache.get(request);
    if (cached) {
      return cached.suggestions as AIFieldSuggestions;
    }
    
    // Check rate limits
    if (!rateLimiter.canMakeCall(context.organizationId)) {
      throw new AIAssistError(
        'Rate limit exceeded',
        'rate-limited',
        `You have ${rateLimiter.getRemainingCalls(context.organizationId)} AI calls remaining this hour`
      );
    }
    
    const response = await callTRRAIFunction(request);
    rateLimiter.recordCall(context.organizationId);
    
    // Cache successful response
    aiCache.set(request, response, 10 * 60 * 1000); // 10 minutes for field suggestions
    
    return response.suggestions as AIFieldSuggestions;
  } catch (error) {
    return handleAIError(error);
  }
};

export const generateArtifacts = async (
  trrId: string,
  trrData: Partial<TechnicalRequirementReview>,
  context: AISuggestionRequest['context']
): Promise<AIArtifacts> => {
  const request: AISuggestionRequest = {
    trrId,
    formData: trrData,
    suggestionType: 'test_cases',
    context,
  };
  
  try {
    validateSuggestionRequest(request);
    
    // Check cache
    const cached = aiCache.get(request);
    if (cached) {
      return cached.suggestions as AIArtifacts;
    }
    
    // Check rate limits
    if (!rateLimiter.canMakeCall(context.organizationId)) {
      throw new AIAssistError('Rate limit exceeded', 'rate-limited');
    }
    
    // Generate acceptance criteria first
    const criteriaRequest = { ...request, suggestionType: 'acceptance_criteria' as AISuggestionType };
    const criteriaResponse = await callTRRAIFunction(criteriaRequest);
    
    // Then generate test cases based on criteria
    const testRequest = { 
      ...request, 
      formData: { ...request.formData, acceptanceCriteria: criteriaResponse.suggestions.acceptanceCriteria }
    };
    const testResponse = await callTRRAIFunction(testRequest);
    
    rateLimiter.recordCall(context.organizationId);
    rateLimiter.recordCall(context.organizationId); // Two calls made
    
    const artifacts: AIArtifacts = {
      acceptanceCriteria: criteriaResponse.suggestions.acceptanceCriteria || [],
      testCases: testResponse.suggestions.testCases || [],
    };
    
    // Cache the combined result
    const combinedResponse: AISuggestionResponse = {
      suggestions: artifacts,
      confidence: Math.min(criteriaResponse.confidence, testResponse.confidence),
      rationale: `Generated criteria (${criteriaResponse.confidence * 100}% confidence) and test cases (${testResponse.confidence * 100}% confidence)`,
      modelUsed: criteriaResponse.modelUsed,
      tokens: {
        prompt: (criteriaResponse.tokens?.prompt || 0) + (testResponse.tokens?.prompt || 0),
        completion: (criteriaResponse.tokens?.completion || 0) + (testResponse.tokens?.completion || 0),
        total: (criteriaResponse.tokens?.total || 0) + (testResponse.tokens?.total || 0),
      },
    };
    
    aiCache.set(request, combinedResponse, 30 * 60 * 1000); // 30 minutes for artifacts
    
    return artifacts;
  } catch (error) {
    return handleAIError(error);
  }
};

export const analyzeRisk = async (
  trrId: string,
  trrData: Partial<TechnicalRequirementReview>,
  context: AISuggestionRequest['context']
): Promise<RiskAssessment> => {
  const request: AISuggestionRequest = {
    trrId,
    formData: trrData,
    suggestionType: 'risk_assessment',
    context,
  };
  
  try {
    validateSuggestionRequest(request);
    
    const cached = aiCache.get(request);
    if (cached) {
      return cached.suggestions.riskAssessment;
    }
    
    if (!rateLimiter.canMakeCall(context.organizationId)) {
      throw new AIAssistError('Rate limit exceeded', 'rate-limited');
    }
    
    const response = await callTRRAIFunction(request);
    rateLimiter.recordCall(context.organizationId);
    
    aiCache.set(request, response, 20 * 60 * 1000); // 20 minutes for risk analysis
    
    return response.suggestions.riskAssessment;
  } catch (error) {
    return handleAIError(error);
  }
};

export const predictTimeline = async (
  trrId: string,
  trrData: Partial<TechnicalRequirementReview>,
  context: AISuggestionRequest['context']
): Promise<AIPrediction> => {
  const request: AISuggestionRequest = {
    trrId,
    formData: trrData,
    suggestionType: 'timeline_prediction',
    context,
  };
  
  try {
    validateSuggestionRequest(request);
    
    const cached = aiCache.get(request);
    if (cached) {
      return cached.suggestions.aiPrediction;
    }
    
    if (!rateLimiter.canMakeCall(context.organizationId)) {
      throw new AIAssistError('Rate limit exceeded', 'rate-limited');
    }
    
    const response = await callTRRAIFunction(request);
    rateLimiter.recordCall(context.organizationId);
    
    aiCache.set(request, response, 5 * 60 * 1000); // 5 minutes for timeline predictions
    
    return response.suggestions.aiPrediction;
  } catch (error) {
    return handleAIError(error);
  }
};

export const computeDOR = async (
  trrId: string,
  trrData: Partial<TechnicalRequirementReview>,
  context: AISuggestionRequest['context']
): Promise<DORStatus> => {
  try {
    // DOR computation is rule-based, not AI-based
    const unmetCriteria: string[] = [];
    
    if (!trrData.title?.trim()) {
      unmetCriteria.push('Title is required');
    }
    
    if (!trrData.description?.trim() || trrData.description.length < 50) {
      unmetCriteria.push('Description must be at least 50 characters');
    }
    
    if (!trrData.acceptanceCriteria?.length) {
      unmetCriteria.push('At least one acceptance criterion is required');
    }
    
    if (!trrData.category) {
      unmetCriteria.push('Category must be selected');
    }
    
    if (!trrData.priority) {
      unmetCriteria.push('Priority must be set');
    }
    
    if (!trrData.assignedTo) {
      unmetCriteria.push('Must be assigned to someone');
    }
    
    if (!trrData.riskAssessment) {
      unmetCriteria.push('Risk assessment is required');
    }
    
    const isReady = unmetCriteria.length === 0;
    const score = Math.max(0, (7 - unmetCriteria.length) / 7 * 100);
    
    return {
      isReady,
      unmetCriteria,
      score,
    };
  } catch (error) {
    console.error('Error computing DOR:', error);
    return {
      isReady: false,
      unmetCriteria: ['Unable to compute DOR status'],
      score: 0,
    };
  }
};

export const computeSDW = async (
  trrId: string,
  trrData: Partial<TechnicalRequirementReview>,
  context: AISuggestionRequest['context']
): Promise<SDWStatus> => {
  try {
    // SDW computation is based on TRR status and approval workflow
    const status = trrData.status || 'draft';
    
    let stage = 'requirements';
    const approvals: SDWStatus['approvals'] = [];
    
    switch (status) {
      case 'draft':
        stage = 'requirements';
        break;
      case 'in-review':
        stage = 'review';
        approvals.push({
          role: 'technical-lead',
          status: 'pending',
        });
        break;
      case 'validated':
        stage = 'validation';
        approvals.push(
          {
            role: 'technical-lead',
            status: 'approved',
            timestamp: new Date().toISOString(),
          },
          {
            role: 'product-manager',
            status: 'pending',
          }
        );
        break;
      case 'approved':
        stage = 'approved';
        approvals.push(
          {
            role: 'technical-lead',
            status: 'approved',
            timestamp: new Date().toISOString(),
          },
          {
            role: 'product-manager',
            status: 'approved',
            timestamp: new Date().toISOString(),
          }
        );
        break;
    }
    
    return {
      stage,
      approvals,
    };
  } catch (error) {
    console.error('Error computing SDW:', error);
    return {
      stage: 'requirements',
      approvals: [],
    };
  }
};

// ============================================================================
// Specialized AI Suggestions
// ============================================================================

export const suggestTitle = async (
  data: Partial<CreateTRRFormData>,
  context: AISuggestionRequest['context']
): Promise<string[]> => {
  const request: AISuggestionRequest = {
    formData: data,
    suggestionType: 'title',
    context,
  };
  
  try {
    validateSuggestionRequest(request);
    
    const cached = aiCache.get(request);
    if (cached) {
      return cached.suggestions as string[];
    }
    
    if (!rateLimiter.canMakeCall(context.organizationId)) {
      throw new AIAssistError('Rate limit exceeded', 'rate-limited');
    }
    
    const response = await callTRRAIFunction(request);
    rateLimiter.recordCall(context.organizationId);
    
    aiCache.set(request, response, 10 * 60 * 1000);
    
    return response.suggestions as string[];
  } catch (error) {
    return handleAIError(error);
  }
};

export const expandDescription = async (
  data: Partial<CreateTRRFormData>,
  context: AISuggestionRequest['context']
): Promise<string> => {
  const request: AISuggestionRequest = {
    formData: data,
    suggestionType: 'description',
    context,
  };
  
  try {
    validateSuggestionRequest(request);
    
    const cached = aiCache.get(request);
    if (cached) {
      return cached.suggestions.description;
    }
    
    if (!rateLimiter.canMakeCall(context.organizationId)) {
      throw new AIAssistError('Rate limit exceeded', 'rate-limited');
    }
    
    const response = await callTRRAIFunction(request);
    rateLimiter.recordCall(context.organizationId);
    
    aiCache.set(request, response, 15 * 60 * 1000);
    
    return response.suggestions.description;
  } catch (error) {
    return handleAIError(error);
  }
};

export const categorizeTRR = async (
  data: Partial<CreateTRRFormData>,
  context: AISuggestionRequest['context']
): Promise<{ category: string; priority: string; businessImpact: string }> => {
  const request: AISuggestionRequest = {
    formData: data,
    suggestionType: 'category',
    context,
  };
  
  try {
    validateSuggestionRequest(request);
    
    const cached = aiCache.get(request);
    if (cached) {
      return cached.suggestions as { category: string; priority: string; businessImpact: string };
    }
    
    if (!rateLimiter.canMakeCall(context.organizationId)) {
      throw new AIAssistError('Rate limit exceeded', 'rate-limited');
    }
    
    const response = await callTRRAIFunction(request);
    rateLimiter.recordCall(context.organizationId);
    
    aiCache.set(request, response, 20 * 60 * 1000);
    
    return {
      category: response.suggestions.category,
      priority: response.suggestions.priority,
      businessImpact: response.suggestions.businessImpact,
    };
  } catch (error) {
    return handleAIError(error);
  }
};

export const recommendValidationMethod = async (
  data: Partial<CreateTRRFormData>,
  context: AISuggestionRequest['context']
): Promise<{ validationMethod: string; validationApproach: string; requiredResources: string[] }> => {
  const request: AISuggestionRequest = {
    formData: data,
    suggestionType: 'validation_method',
    context,
  };
  
  try {
    validateSuggestionRequest(request);
    
    const cached = aiCache.get(request);
    if (cached) {
      return cached.suggestions as { validationMethod: string; validationApproach: string; requiredResources: string[] };
    }
    
    if (!rateLimiter.canMakeCall(context.organizationId)) {
      throw new AIAssistError('Rate limit exceeded', 'rate-limited');
    }
    
    const response = await callTRRAIFunction(request);
    rateLimiter.recordCall(context.organizationId);
    
    aiCache.set(request, response, 25 * 60 * 1000);
    
    return {
      validationMethod: response.suggestions.validationMethod,
      validationApproach: response.suggestions.validationApproach,
      requiredResources: response.suggestions.requiredResources,
    };
  } catch (error) {
    return handleAIError(error);
  }
};

// ============================================================================
// Cache and Rate Limiting Management
// ============================================================================

export const clearAICache = (): void => {
  aiCache.clear();
};

export const getRemainingAICalls = (organizationId: string): number => {
  return rateLimiter.getRemainingCalls(organizationId);
};

export const getAICacheStats = () => {
  return {
    size: (aiCache as any).cache.size,
    maxSize: 100, // Estimated
  };
};

// Export everything
export default {
  suggestFields,
  generateArtifacts,
  analyzeRisk,
  predictTimeline,
  computeDOR,
  computeSDW,
  suggestTitle,
  expandDescription,
  categorizeTRR,
  recommendValidationMethod,
  clearAICache,
  getRemainingAICalls,
  getAICacheStats,
  AIAssistError,
};