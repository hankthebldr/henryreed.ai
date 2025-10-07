"use strict";
// Integrated from henryreedai/src/ai-functions.ts
// Comprehensive AI callable functions using Genkit and Vertex AI
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRiskAssessment = exports.aiCompetitiveAnalysis = exports.aiChatAssistant = exports.aiScenarioOptimization = exports.aiDetectionGeneration = exports.aiTrrRecommendations = exports.aiPovAnalysis = void 0;
const genkit_1 = require("genkit");
const vertexai_1 = require("@genkit-ai/vertexai");
const https_1 = require("firebase-functions/https");
const params_1 = require("firebase-functions/params");
const firebase_1 = require("@genkit-ai/firebase");
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp();
}
(0, firebase_1.enableFirebaseTelemetry)();
const googleGenAIApiKey = (0, params_1.defineSecret)("GOOGLE_GENAI_API_KEY");
const ai = (0, genkit_1.genkit)({
    plugins: [(0, vertexai_1.vertexAI)({ location: "us-central1" })],
});
// Schemas
const POVInputSchema = genkit_1.z.object({
    name: genkit_1.z.string(),
    customer: genkit_1.z.string(),
    industry: genkit_1.z.string().optional(),
    useCase: genkit_1.z.string(),
    timeline: genkit_1.z.string(),
    challenges: genkit_1.z.array(genkit_1.z.string()).optional(),
    requirements: genkit_1.z.array(genkit_1.z.string()).optional(),
    budget: genkit_1.z.string().optional(),
    stakeholders: genkit_1.z.array(genkit_1.z.string()).optional(),
});
const TRRInputSchema = genkit_1.z.object({
    title: genkit_1.z.string(),
    category: genkit_1.z.string(),
    description: genkit_1.z.string(),
    technicalRequirements: genkit_1.z.array(genkit_1.z.string()),
    businessRequirements: genkit_1.z.array(genkit_1.z.string()),
    constraints: genkit_1.z.array(genkit_1.z.string()).optional(),
    timeline: genkit_1.z.string(),
    stakeholders: genkit_1.z.array(genkit_1.z.string()),
});
const DetectionInputSchema = genkit_1.z.object({
    scenarioType: genkit_1.z.string(),
    platform: genkit_1.z.enum(["xsiam", "cortex-xdr", "panorama", "generic"]),
    techniques: genkit_1.z.array(genkit_1.z.string()),
    description: genkit_1.z.string(),
    environment: genkit_1.z.string(),
    priority: genkit_1.z.enum(["low", "medium", "high", "critical"]),
});
// POV Analysis
const povAnalysisFlow = ai.defineFlow({
    name: "povAnalysisFlow",
    inputSchema: POVInputSchema,
    outputSchema: genkit_1.z.any(),
    streamSchema: genkit_1.z.string(),
}, async (povData, { sendChunk }) => {
    const prompt = `As an expert Palo Alto Networks Domain Consultant, analyze this Proof of Value (POV) opportunity and provide comprehensive strategic insights: ${JSON.stringify(povData)}`;
    const { stream } = ai.generateStream({ model: vertexai_1.gemini20Flash, prompt, config: { temperature: 0.3, maxOutputTokens: 2048 } });
    for await (const chunk of stream) {
        if (chunk.text)
            sendChunk(chunk.text);
    }
    return { ok: true };
});
// TRR Recommendations
const trrRecommendationsFlow = ai.defineFlow({
    name: "trrRecommendationsFlow",
    inputSchema: TRRInputSchema,
    outputSchema: genkit_1.z.any(),
    streamSchema: genkit_1.z.string(),
}, async (trrData, { sendChunk }) => {
    const prompt = `Provide TRR recommendations: ${JSON.stringify(trrData)}`;
    const { stream } = ai.generateStream({ model: vertexai_1.gemini15Pro, prompt, config: { temperature: 0.2, maxOutputTokens: 2048 } });
    for await (const chunk of stream) {
        if (chunk.text)
            sendChunk(chunk.text);
    }
    return { ok: true };
});
// Detection Generation
const detectionGenerationFlow = ai.defineFlow({
    name: "detectionGenerationFlow",
    inputSchema: DetectionInputSchema,
    outputSchema: genkit_1.z.any(),
    streamSchema: genkit_1.z.string(),
}, async (data, { sendChunk }) => {
    const prompt = `Generate detection content for: ${JSON.stringify(data)}`;
    const { stream } = ai.generateStream({ model: vertexai_1.gemini20Flash, prompt, config: { temperature: 0.1, maxOutputTokens: 2048 } });
    for await (const chunk of stream) {
        if (chunk.text)
            sendChunk(chunk.text);
    }
    return { ok: true };
});
// Optional: Scenario Optimization, Chat Assistant, Competitive Analysis, Risk Assessment
const scenarioOptimizationFlow = ai.defineFlow({
    name: "scenarioOptimizationFlow",
    inputSchema: genkit_1.z.object({
        scenarioName: genkit_1.z.string(),
        currentConfiguration: genkit_1.z.string(),
        performanceMetrics: genkit_1.z.object({ detectionRate: genkit_1.z.number(), falsePositiveRate: genkit_1.z.number(), responseTime: genkit_1.z.number() }),
        feedback: genkit_1.z.array(genkit_1.z.string()).optional(),
        environment: genkit_1.z.string(),
    }),
    outputSchema: genkit_1.z.any(),
    streamSchema: genkit_1.z.string(),
}, async (data, { sendChunk }) => {
    const prompt = `Optimize this security scenario configuration: ${JSON.stringify(data)}`;
    const { stream } = ai.generateStream({ model: vertexai_1.gemini15Pro, prompt, config: { temperature: 0.3, maxOutputTokens: 1500 } });
    for await (const chunk of stream) {
        if (chunk.text)
            sendChunk(chunk.text);
    }
    return { ok: true };
});
const chatAssistantFlow = ai.defineFlow({
    name: "chatAssistantFlow",
    inputSchema: genkit_1.z.object({ message: genkit_1.z.string(), context: genkit_1.z.any().optional(), conversationHistory: genkit_1.z.array(genkit_1.z.object({ role: genkit_1.z.enum(["user", "assistant"]), content: genkit_1.z.string() })).optional() }),
    outputSchema: genkit_1.z.any(),
    streamSchema: genkit_1.z.string(),
}, async (data, { sendChunk }) => {
    const messages = [
        { role: "system", content: "You are an expert PAN DC." },
        ...(data.conversationHistory || []),
        { role: "user", content: `Context: ${JSON.stringify(data.context)}\n\nQuestion: ${data.message}` },
    ];
    const { response, stream } = ai.generateStream({ model: vertexai_1.gemini20Flash, prompt: messages.map(m => `${m.role}: ${m.content}`).join("\n\n"), config: { temperature: 0.7, maxOutputTokens: 1000 } });
    for await (const chunk of stream) {
        if (chunk.text)
            sendChunk(chunk.text);
    }
    return { response: (await response).text };
});
const competitiveAnalysisFlow = ai.defineFlow({
    name: "competitiveAnalysisFlow",
    inputSchema: genkit_1.z.object({ competitor: genkit_1.z.string(), useCase: genkit_1.z.string(), customerEnvironment: genkit_1.z.string(), keyRequirements: genkit_1.z.array(genkit_1.z.string()) }),
    outputSchema: genkit_1.z.any(),
    streamSchema: genkit_1.z.string(),
}, async (data, { sendChunk }) => {
    const prompt = `Provide competitive analysis: ${JSON.stringify(data)}`;
    const { stream } = ai.generateStream({ model: vertexai_1.gemini15Pro, prompt, config: { temperature: 0.4, maxOutputTokens: 1500 } });
    for await (const chunk of stream) {
        if (chunk.text)
            sendChunk(chunk.text);
    }
    return { ok: true };
});
const riskAssessmentFlow = ai.defineFlow({
    name: "riskAssessmentFlow",
    inputSchema: genkit_1.z.object({ projectType: genkit_1.z.string(), projectDetails: genkit_1.z.string(), timeline: genkit_1.z.string(), resources: genkit_1.z.array(genkit_1.z.string()), constraints: genkit_1.z.array(genkit_1.z.string()).optional(), stakeholders: genkit_1.z.array(genkit_1.z.string()) }),
    outputSchema: genkit_1.z.any(),
    streamSchema: genkit_1.z.string(),
}, async (data, { sendChunk }) => {
    const prompt = `Conduct a risk assessment: ${JSON.stringify(data)}`;
    const { stream } = ai.generateStream({ model: vertexai_1.gemini15Pro, prompt, config: { temperature: 0.2, maxOutputTokens: 1500 } });
    for await (const chunk of stream) {
        if (chunk.text)
            sendChunk(chunk.text);
    }
    return { ok: true };
});
// Export as callable Genkit functions
exports.aiPovAnalysis = (0, https_1.onCallGenkit)({ enforceAppCheck: false, secrets: [googleGenAIApiKey], authPolicy: (0, https_1.hasClaim)("email_verified") }, povAnalysisFlow);
exports.aiTrrRecommendations = (0, https_1.onCallGenkit)({ enforceAppCheck: false, secrets: [googleGenAIApiKey], authPolicy: (0, https_1.hasClaim)("email_verified") }, trrRecommendationsFlow);
exports.aiDetectionGeneration = (0, https_1.onCallGenkit)({ enforceAppCheck: false, secrets: [googleGenAIApiKey], authPolicy: (0, https_1.hasClaim)("email_verified") }, detectionGenerationFlow);
exports.aiScenarioOptimization = (0, https_1.onCallGenkit)({ enforceAppCheck: false, secrets: [googleGenAIApiKey], authPolicy: (0, https_1.hasClaim)("email_verified") }, scenarioOptimizationFlow);
exports.aiChatAssistant = (0, https_1.onCallGenkit)({ enforceAppCheck: false, secrets: [googleGenAIApiKey], authPolicy: (0, https_1.hasClaim)("email_verified") }, chatAssistantFlow);
exports.aiCompetitiveAnalysis = (0, https_1.onCallGenkit)({ enforceAppCheck: false, secrets: [googleGenAIApiKey], authPolicy: (0, https_1.hasClaim)("email_verified") }, competitiveAnalysisFlow);
exports.aiRiskAssessment = (0, https_1.onCallGenkit)({ enforceAppCheck: false, secrets: [googleGenAIApiKey], authPolicy: (0, https_1.hasClaim)("email_verified") }, riskAssessmentFlow);
//# sourceMappingURL=henry-ai-functions.js.map