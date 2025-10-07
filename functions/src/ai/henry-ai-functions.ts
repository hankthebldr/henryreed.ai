// Integrated from henryreedai/src/ai-functions.ts
// Comprehensive AI callable functions using Genkit and Vertex AI

import { genkit, z } from "genkit";
import { vertexAI, gemini20Flash, gemini15Pro } from "@genkit-ai/vertexai";
import { onCallGenkit, hasClaim } from "firebase-functions/https";
import { defineSecret } from "firebase-functions/params";
import { enableFirebaseTelemetry } from "@genkit-ai/firebase";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

enableFirebaseTelemetry();

const googleGenAIApiKey = defineSecret("GOOGLE_GENAI_API_KEY");

const ai = genkit({
  plugins: [vertexAI({ location: "us-central1" })],
});

// Schemas
const POVInputSchema = z.object({
  name: z.string(),
  customer: z.string(),
  industry: z.string().optional(),
  useCase: z.string(),
  timeline: z.string(),
  challenges: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  budget: z.string().optional(),
  stakeholders: z.array(z.string()).optional(),
});

const TRRInputSchema = z.object({
  title: z.string(),
  category: z.string(),
  description: z.string(),
  technicalRequirements: z.array(z.string()),
  businessRequirements: z.array(z.string()),
  constraints: z.array(z.string()).optional(),
  timeline: z.string(),
  stakeholders: z.array(z.string()),
});

const DetectionInputSchema = z.object({
  scenarioType: z.string(),
  platform: z.enum(["xsiam", "cortex-xdr", "panorama", "generic"]),
  techniques: z.array(z.string()),
  description: z.string(),
  environment: z.string(),
  priority: z.enum(["low", "medium", "high", "critical"]),
});

// POV Analysis
const povAnalysisFlow = ai.defineFlow({
  name: "povAnalysisFlow",
  inputSchema: POVInputSchema,
  outputSchema: z.any(),
  streamSchema: z.string(),
}, async (povData, { sendChunk }: { sendChunk: (chunk: string) => void }) => {
  const prompt = `As an expert Palo Alto Networks Domain Consultant, analyze this Proof of Value (POV) opportunity and provide comprehensive strategic insights: ${JSON.stringify(povData)}`;
  const { stream } = ai.generateStream({ model: gemini20Flash, prompt, config: { temperature: 0.3, maxOutputTokens: 2048 } });
  for await (const chunk of stream) { if (chunk.text) sendChunk(chunk.text); }
  return { ok: true };
});

// TRR Recommendations
const trrRecommendationsFlow = ai.defineFlow({
  name: "trrRecommendationsFlow",
  inputSchema: TRRInputSchema,
  outputSchema: z.any(),
  streamSchema: z.string(),
}, async (trrData, { sendChunk }: { sendChunk: (chunk: string) => void }) => {
  const prompt = `Provide TRR recommendations: ${JSON.stringify(trrData)}`;
  const { stream } = ai.generateStream({ model: gemini15Pro, prompt, config: { temperature: 0.2, maxOutputTokens: 2048 } });
  for await (const chunk of stream) { if (chunk.text) sendChunk(chunk.text); }
  return { ok: true };
});

// Detection Generation
const detectionGenerationFlow = ai.defineFlow({
  name: "detectionGenerationFlow",
  inputSchema: DetectionInputSchema,
  outputSchema: z.any(),
  streamSchema: z.string(),
}, async (data, { sendChunk }: { sendChunk: (chunk: string) => void }) => {
  const prompt = `Generate detection content for: ${JSON.stringify(data)}`;
  const { stream } = ai.generateStream({ model: gemini20Flash, prompt, config: { temperature: 0.1, maxOutputTokens: 2048 } });
  for await (const chunk of stream) { if (chunk.text) sendChunk(chunk.text); }
  return { ok: true };
});

// Optional: Scenario Optimization, Chat Assistant, Competitive Analysis, Risk Assessment
const scenarioOptimizationFlow = ai.defineFlow({
  name: "scenarioOptimizationFlow",
  inputSchema: z.object({
    scenarioName: z.string(),
    currentConfiguration: z.string(),
    performanceMetrics: z.object({ detectionRate: z.number(), falsePositiveRate: z.number(), responseTime: z.number() }),
    feedback: z.array(z.string()).optional(),
    environment: z.string(),
  }),
  outputSchema: z.any(),
  streamSchema: z.string(),
}, async (data, { sendChunk }: { sendChunk: (chunk: string) => void }) => {
  const prompt = `Optimize this security scenario configuration: ${JSON.stringify(data)}`;
  const { stream } = ai.generateStream({ model: gemini15Pro, prompt, config: { temperature: 0.3, maxOutputTokens: 1500 } });
  for await (const chunk of stream) { if (chunk.text) sendChunk(chunk.text); }
  return { ok: true };
});

const chatAssistantFlow = ai.defineFlow({
  name: "chatAssistantFlow",
  inputSchema: z.object({ message: z.string(), context: z.any().optional(), conversationHistory: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional() }),
  outputSchema: z.any(),
  streamSchema: z.string(),
}, async (data, { sendChunk }: { sendChunk: (chunk: string) => void }) => {
  const messages = [
    { role: "system", content: "You are an expert PAN DC." },
    ...(data.conversationHistory || []),
    { role: "user", content: `Context: ${JSON.stringify(data.context)}\n\nQuestion: ${data.message}` },
  ];
  const { response, stream } = ai.generateStream({ model: gemini20Flash, prompt: messages.map(m => `${m.role}: ${m.content}`).join("\n\n"), config: { temperature: 0.7, maxOutputTokens: 1000 } });
  for await (const chunk of stream) { if (chunk.text) sendChunk(chunk.text); }
  return { response: (await response).text };
});

const competitiveAnalysisFlow = ai.defineFlow({
  name: "competitiveAnalysisFlow",
  inputSchema: z.object({ competitor: z.string(), useCase: z.string(), customerEnvironment: z.string(), keyRequirements: z.array(z.string()) }),
  outputSchema: z.any(),
  streamSchema: z.string(),
}, async (data, { sendChunk }: { sendChunk: (chunk: string) => void }) => {
  const prompt = `Provide competitive analysis: ${JSON.stringify(data)}`;
  const { stream } = ai.generateStream({ model: gemini15Pro, prompt, config: { temperature: 0.4, maxOutputTokens: 1500 } });
  for await (const chunk of stream) { if (chunk.text) sendChunk(chunk.text); }
  return { ok: true };
});

const riskAssessmentFlow = ai.defineFlow({
  name: "riskAssessmentFlow",
  inputSchema: z.object({ projectType: z.string(), projectDetails: z.string(), timeline: z.string(), resources: z.array(z.string()), constraints: z.array(z.string()).optional(), stakeholders: z.array(z.string()) }),
  outputSchema: z.any(),
  streamSchema: z.string(),
}, async (data, { sendChunk }: { sendChunk: (chunk: string) => void }) => {
  const prompt = `Conduct a risk assessment: ${JSON.stringify(data)}`;
  const { stream } = ai.generateStream({ model: gemini15Pro, prompt, config: { temperature: 0.2, maxOutputTokens: 1500 } });
  for await (const chunk of stream) { if (chunk.text) sendChunk(chunk.text); }
  return { ok: true };
});

// Export as callable Genkit functions
export const aiPovAnalysis = onCallGenkit({ enforceAppCheck: false, secrets: [googleGenAIApiKey], authPolicy: hasClaim("email_verified") }, povAnalysisFlow);
export const aiTrrRecommendations = onCallGenkit({ enforceAppCheck: false, secrets: [googleGenAIApiKey], authPolicy: hasClaim("email_verified") }, trrRecommendationsFlow);
export const aiDetectionGeneration = onCallGenkit({ enforceAppCheck: false, secrets: [googleGenAIApiKey], authPolicy: hasClaim("email_verified") }, detectionGenerationFlow);
export const aiScenarioOptimization = onCallGenkit({ enforceAppCheck: false, secrets: [googleGenAIApiKey], authPolicy: hasClaim("email_verified") }, scenarioOptimizationFlow);
export const aiChatAssistant = onCallGenkit({ enforceAppCheck: false, secrets: [googleGenAIApiKey], authPolicy: hasClaim("email_verified") }, chatAssistantFlow);
export const aiCompetitiveAnalysis = onCallGenkit({ enforceAppCheck: false, secrets: [googleGenAIApiKey], authPolicy: hasClaim("email_verified") }, competitiveAnalysisFlow);
export const aiRiskAssessment = onCallGenkit({ enforceAppCheck: false, secrets: [googleGenAIApiKey], authPolicy: hasClaim("email_verified") }, riskAssessmentFlow);