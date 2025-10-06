"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiTRRSuggestHandler = void 0;
// AI-powered TRR suggestion handler
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const openai_1 = __importDefault(require("openai"));
const logger_1 = require("../utils/logger");
// Request/Response schemas
const AITRRSuggestRequest = zod_1.z.object({
    trrId: zod_1.z.string().optional(),
    formData: zod_1.z.object({
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        priority: zod_1.z.string().optional(),
        technicalApproach: zod_1.z.string().optional(),
    }),
    suggestionType: zod_1.z.enum([
        'title',
        'description',
        'category',
        'priority',
        'acceptance_criteria',
        'test_cases',
        'risk_assessment',
        'timeline_prediction',
        'validation_method',
        'complete_fields'
    ]),
    context: zod_1.z.object({
        organizationId: zod_1.z.string(),
        projectId: zod_1.z.string(),
        portfolioId: zod_1.z.string().optional(),
        userRole: zod_1.z.string().optional(),
    }),
});
const AITRRSuggestResponse = zod_1.z.object({
    suggestions: zod_1.z.record(zod_1.z.any()),
    confidence: zod_1.z.number().min(0).max(1),
    rationale: zod_1.z.string(),
    modelUsed: zod_1.z.string(),
    tokens: zod_1.z.object({
        prompt: zod_1.z.number(),
        completion: zod_1.z.number(),
        total: zod_1.z.number(),
    }).optional(),
});
// OpenAI client initialization
let openai = null;
const initializeOpenAI = () => {
    if (!openai) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new functions.https.HttpsError('failed-precondition', 'OpenAI API key not configured');
        }
        openai = new openai_1.default({ apiKey });
    }
    return openai;
};
// Prompt templates for different suggestion types
const PROMPTS = {
    title: `You are an expert technical requirements analyst. Based on the following TRR information, suggest 3 clear, specific, and actionable titles. Each title should be 5-12 words and clearly indicate what technical requirement is being reviewed.

Input: {input}

Return JSON format:
{
  "suggestions": ["title1", "title2", "title3"],
  "confidence": 0.85,
  "rationale": "Brief explanation of suggestions"
}`,
    description: `You are an expert technical requirements analyst. Based on the current TRR information, expand and improve the description to be comprehensive, clear, and actionable. Include technical context, business justification, and acceptance criteria outline.

Current TRR: {input}

Return JSON format:
{
  "suggestions": {"description": "expanded description"},
  "confidence": 0.80,
  "rationale": "Brief explanation of improvements"
}`,
    category: `You are an expert technical requirements analyst. Based on the TRR information, suggest the most appropriate category. Consider technical complexity, business impact, and type of work.

TRR: {input}

Available categories: architecture, security, performance, integration, ui-ux, infrastructure, data, compliance, testing, documentation

Return JSON format:
{
  "suggestions": {
    "category": "suggested_category",
    "alternativeCategories": ["alt1", "alt2"]
  },
  "confidence": 0.90,
  "rationale": "Brief explanation of categorization"
}`,
    priority: `You are an expert technical requirements analyst. Based on the TRR information, suggest the most appropriate priority level. Consider business impact, urgency, technical complexity, and dependencies.

TRR: {input}

Priority levels: low (nice to have, can be delayed), medium (important but not urgent), high (important and time-sensitive), critical (blocking or high-risk)

Return JSON format:
{
  "suggestions": {
    "priority": "low|medium|high|critical",
    "businessImpact": "low|medium|high|critical",
    "urgency": "low|medium|high|critical"
  },
  "confidence": 0.85,
  "rationale": "Brief explanation of priority assessment"
}`,
    acceptance_criteria: `You are an expert technical requirements analyst. Based on the TRR information, generate 3-7 specific, measurable, and testable acceptance criteria. Each criterion should be clear, actionable, and verifiable.

TRR: {input}

Return JSON format:
{
  "suggestions": {
    "acceptanceCriteria": [
      "Given X, when Y, then Z",
      "The system must...",
      "Users should be able to..."
    ]
  },
  "confidence": 0.85,
  "rationale": "Brief explanation of criteria selection"
}`,
    test_cases: `You are an expert QA analyst. Based on the TRR and acceptance criteria, generate comprehensive test cases covering happy path, edge cases, and error scenarios.

TRR: {input}

Return JSON format:
{
  "suggestions": {
    "testCases": [
      {
        "title": "Test case title",
        "steps": ["Step 1", "Step 2", "Step 3"],
        "expectedResult": "Expected outcome",
        "automated": false
      }
    ]
  },
  "confidence": 0.80,
  "rationale": "Brief explanation of test coverage"
}`,
    risk_assessment: `You are an expert risk analyst. Based on the TRR information, assess technical and business risks. Consider complexity, dependencies, timeline, and potential impact.

TRR: {input}

Return JSON format:
{
  "suggestions": {
    "riskAssessment": {
      "likelihood": "low|medium|high|critical",
      "impact": "low|medium|high|critical",
      "score": 4.5,
      "rationale": "Detailed risk analysis and mitigation suggestions"
    }
  },
  "confidence": 0.75,
  "rationale": "Brief explanation of risk evaluation methodology"
}`,
    timeline_prediction: `You are an expert project analyst. Based on the TRR information, predict realistic timeline estimates considering complexity, dependencies, and typical development cycles.

TRR: {input}

Return JSON format:
{
  "suggestions": {
    "aiPrediction": {
      "predictedCompletionDate": "2024-03-15T10:00:00Z",
      "confidence": 0.70,
      "rationale": "Explanation of timeline factors and assumptions",
      "estimatedHours": 40,
      "riskFactors": ["dependency on external API", "unclear requirements"]
    }
  },
  "confidence": 0.65,
  "rationale": "Brief explanation of prediction methodology"
}`,
    validation_method: `You are an expert validation specialist. Based on the TRR information, suggest the most appropriate validation methods and strategies.

TRR: {input}

Return JSON format:
{
  "suggestions": {
    "validationMethod": "testing|review|prototype|simulation|analysis",
    "validationApproach": "Detailed validation strategy and steps",
    "requiredResources": ["resource1", "resource2"]
  },
  "confidence": 0.80,
  "rationale": "Brief explanation of validation approach selection"
}`,
    complete_fields: `You are an expert technical requirements analyst. Based on the partial TRR information provided, suggest improvements and fill in missing fields to create a comprehensive TRR.

Current TRR: {input}

Return JSON format with all suggested improvements:
{
  "suggestions": {
    "title": "improved title if needed",
    "description": "improved description if needed",
    "category": "suggested category",
    "priority": "suggested priority",
    "businessImpact": "suggested impact",
    "acceptanceCriteria": ["criterion1", "criterion2"],
    "technicalApproach": "suggested technical approach",
    "riskAssessment": {
      "likelihood": "medium",
      "impact": "high", 
      "score": 6.0,
      "rationale": "risk analysis"
    }
  },
  "confidence": 0.75,
  "rationale": "Overall analysis and recommendations"
}`
};
// Helper functions
const formatPrompt = (template, input) => {
    return template.replace('{input}', JSON.stringify(input, null, 2));
};
const validateAndParseAIResponse = (response, suggestionType) => {
    try {
        const parsed = JSON.parse(response);
        // Validate required fields
        if (!parsed.suggestions || !parsed.confidence || !parsed.rationale) {
            throw new Error('Missing required fields in AI response');
        }
        // Validate confidence score
        if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
            parsed.confidence = 0.5; // Default fallback
        }
        return parsed;
    }
    catch (error) {
        logger_1.logger.error('Failed to parse AI response:', error, { response, suggestionType });
        throw new functions.https.HttpsError('internal', 'Invalid AI response format');
    }
};
const logAIPrediction = async (organizationId, trrId, suggestionType, prediction, confidence) => {
    try {
        if (!trrId)
            return;
        const db = admin.firestore();
        await db.collection('aiPredictions').add({
            organizationId,
            trrId,
            type: suggestionType,
            prediction,
            confidence,
            modelUsed: 'gpt-4-turbo',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });
    }
    catch (error) {
        logger_1.logger.warn('Failed to log AI prediction:', error);
    }
};
// Main handler function
const aiTRRSuggestHandler = async (data, context) => {
    var _a, _b, _c, _d, _e, _f, _g;
    // Validate input
    const request = AITRRSuggestRequest.parse(data);
    const userId = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!userId) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    logger_1.logger.info('AI TRR Suggest request', {
        userId,
        trrId: request.trrId,
        suggestionType: request.suggestionType,
        organizationId: request.context.organizationId,
    });
    try {
        // Initialize OpenAI
        const client = initializeOpenAI();
        // Get appropriate prompt template
        const promptTemplate = PROMPTS[request.suggestionType];
        if (!promptTemplate) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid suggestion type');
        }
        // Format prompt with TRR data
        const prompt = formatPrompt(promptTemplate, {
            ...request.formData,
            context: request.context,
        });
        // Call OpenAI API
        const completion = await client.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that specializes in technical requirements analysis and always returns valid JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: 'json_object' }
        });
        const aiResponse = (_c = (_b = completion.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
        if (!aiResponse) {
            throw new functions.https.HttpsError('internal', 'No response from AI service');
        }
        // Parse and validate AI response
        const parsedResponse = validateAndParseAIResponse(aiResponse, request.suggestionType);
        // Log prediction for analytics
        await logAIPrediction(request.context.organizationId, request.trrId, request.suggestionType, parsedResponse.suggestions, parsedResponse.confidence);
        // Log activity
        if (request.trrId) {
            const db = admin.firestore();
            await db.collection('activityLogs').add({
                organizationId: request.context.organizationId,
                userId,
                action: 'ai_suggest',
                entityType: 'trr',
                entityId: request.trrId,
                details: {
                    suggestionType: request.suggestionType,
                    confidence: parsedResponse.confidence,
                },
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        // Add token usage information
        const response = {
            ...parsedResponse,
            modelUsed: 'gpt-4-turbo-preview',
            tokens: {
                prompt: ((_d = completion.usage) === null || _d === void 0 ? void 0 : _d.prompt_tokens) || 0,
                completion: ((_e = completion.usage) === null || _e === void 0 ? void 0 : _e.completion_tokens) || 0,
                total: ((_f = completion.usage) === null || _f === void 0 ? void 0 : _f.total_tokens) || 0,
            },
        };
        logger_1.logger.info('AI TRR Suggest completed', {
            userId,
            trrId: request.trrId,
            suggestionType: request.suggestionType,
            confidence: response.confidence,
            tokens: (_g = response.tokens) === null || _g === void 0 ? void 0 : _g.total,
        });
        return AITRRSuggestResponse.parse(response);
    }
    catch (error) {
        logger_1.logger.error('AI TRR Suggest error:', error, {
            userId,
            trrId: request.trrId,
            suggestionType: request.suggestionType,
        });
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        // Handle OpenAI specific errors
        if (error instanceof openai_1.default.APIError) {
            if (error.status === 429) {
                throw new functions.https.HttpsError('resource-exhausted', 'AI service rate limit exceeded');
            }
            else if (error.status >= 500) {
                throw new functions.https.HttpsError('unavailable', 'AI service temporarily unavailable');
            }
        }
        throw new functions.https.HttpsError('internal', 'AI suggestion service failed');
    }
};
exports.aiTRRSuggestHandler = aiTRRSuggestHandler;
//# sourceMappingURL=ai-trr-suggest.js.map