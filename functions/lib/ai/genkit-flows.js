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
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectionGenerationFlow = exports.trrRecommendationsFlow = exports.povAnalysisFlow = exports.DetectionInputSchema = exports.TRRInputSchema = exports.POVInputSchema = void 0;
exports.runPovAnalysis = runPovAnalysis;
exports.runTrrRecommendations = runTrrRecommendations;
exports.runDetectionGeneration = runDetectionGeneration;
const genkit_1 = require("genkit");
const vertexai_1 = require("@genkit-ai/vertexai");
const firebase_1 = require("@genkit-ai/firebase");
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp();
}
// Enable telemetry for better observability
(0, firebase_1.enableFirebaseTelemetry)();
// Initialize Genkit with Vertex AI plugin
const ai = (0, genkit_1.genkit)({
    plugins: [
        (0, vertexai_1.vertexAI)({ location: 'us-central1' }),
    ],
});
// Schemas
exports.POVInputSchema = genkit_1.z.object({
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
exports.TRRInputSchema = genkit_1.z.object({
    title: genkit_1.z.string(),
    category: genkit_1.z.string(),
    description: genkit_1.z.string(),
    technicalRequirements: genkit_1.z.array(genkit_1.z.string()),
    businessRequirements: genkit_1.z.array(genkit_1.z.string()),
    constraints: genkit_1.z.array(genkit_1.z.string()).optional(),
    timeline: genkit_1.z.string(),
    stakeholders: genkit_1.z.array(genkit_1.z.string()),
});
exports.DetectionInputSchema = genkit_1.z.object({
    scenarioType: genkit_1.z.string(),
    platform: genkit_1.z.enum(['xsiam', 'cortex-xdr', 'panorama', 'generic']),
    techniques: genkit_1.z.array(genkit_1.z.string()),
    description: genkit_1.z.string(),
    environment: genkit_1.z.string(),
    priority: genkit_1.z.enum(['low', 'medium', 'high', 'critical']),
});
// Flows
exports.povAnalysisFlow = ai.defineFlow({
    name: 'povAnalysisFlow',
    inputSchema: exports.POVInputSchema,
    outputSchema: genkit_1.z.any(),
    streamSchema: genkit_1.z.string(),
}, async (povData, { sendChunk }) => {
    const prompt = `As an expert Palo Alto Networks Domain Consultant, analyze this Proof of Value (POV) and provide comprehensive insights. Data: ${JSON.stringify(povData)}`;
    const { stream } = ai.generateStream({ model: vertexai_1.gemini20Flash, prompt, config: { temperature: 0.3, maxOutputTokens: 2048 } });
    for await (const chunk of stream) {
        if (chunk.text)
            sendChunk(chunk.text);
    }
    return { ok: true };
});
exports.trrRecommendationsFlow = ai.defineFlow({
    name: 'trrRecommendationsFlow',
    inputSchema: exports.TRRInputSchema,
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
exports.detectionGenerationFlow = ai.defineFlow({
    name: 'detectionGenerationFlow',
    inputSchema: exports.DetectionInputSchema,
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
async function runPovAnalysis(input) {
    const parsed = exports.POVInputSchema.parse(input);
    const result = await exports.povAnalysisFlow.run(parsed);
    return result;
}
async function runTrrRecommendations(input) {
    const parsed = exports.TRRInputSchema.parse(input);
    const result = await exports.trrRecommendationsFlow.run(parsed);
    return result;
}
async function runDetectionGeneration(input) {
    const parsed = exports.DetectionInputSchema.parse(input);
    const result = await exports.detectionGenerationFlow.run(parsed);
    return result;
}
//# sourceMappingURL=genkit-flows.js.map