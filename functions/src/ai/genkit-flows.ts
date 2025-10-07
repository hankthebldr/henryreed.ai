import { genkit, z } from 'genkit';
import { vertexAI, gemini20Flash, gemini15Pro } from '@genkit-ai/vertexai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

// Enable telemetry for better observability
enableFirebaseTelemetry();

// Initialize Genkit with Vertex AI plugin
const ai = genkit({
  plugins: [
    vertexAI({ location: 'us-central1' }),
  ],
});

// Schemas
export const POVInputSchema = z.object({
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

export const TRRInputSchema = z.object({
  title: z.string(),
  category: z.string(),
  description: z.string(),
  technicalRequirements: z.array(z.string()),
  businessRequirements: z.array(z.string()),
  constraints: z.array(z.string()).optional(),
  timeline: z.string(),
  stakeholders: z.array(z.string()),
});

export const DetectionInputSchema = z.object({
  scenarioType: z.string(),
  platform: z.enum(['xsiam', 'cortex-xdr', 'panorama', 'generic']),
  techniques: z.array(z.string()),
  description: z.string(),
  environment: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

// Flows
export const povAnalysisFlow = ai.defineFlow({
  name: 'povAnalysisFlow',
  inputSchema: POVInputSchema,
  outputSchema: z.any(),
  streamSchema: z.string(),
}, async (povData, { sendChunk }) => {
  const prompt = `As an expert Palo Alto Networks Domain Consultant, analyze this Proof of Value (POV) and provide comprehensive insights. Data: ${JSON.stringify(povData)}`;
  const { stream } = ai.generateStream({ model: gemini20Flash, prompt, config: { temperature: 0.3, maxOutputTokens: 2048 } });
  for await (const chunk of stream) { if (chunk.text) sendChunk(chunk.text); }
  return { ok: true };
});

export const trrRecommendationsFlow = ai.defineFlow({
  name: 'trrRecommendationsFlow',
  inputSchema: TRRInputSchema,
  outputSchema: z.any(),
  streamSchema: z.string(),
}, async (trrData, { sendChunk }) => {
  const prompt = `Provide TRR recommendations: ${JSON.stringify(trrData)}`;
  const { stream } = ai.generateStream({ model: gemini15Pro, prompt, config: { temperature: 0.2, maxOutputTokens: 2048 } });
  for await (const chunk of stream) { if (chunk.text) sendChunk(chunk.text); }
  return { ok: true };
});

export const detectionGenerationFlow = ai.defineFlow({
  name: 'detectionGenerationFlow',
  inputSchema: DetectionInputSchema,
  outputSchema: z.any(),
  streamSchema: z.string(),
}, async (data, { sendChunk }) => {
  const prompt = `Generate detection content for: ${JSON.stringify(data)}`;
  const { stream } = ai.generateStream({ model: gemini20Flash, prompt, config: { temperature: 0.1, maxOutputTokens: 2048 } });
  for await (const chunk of stream) { if (chunk.text) sendChunk(chunk.text); }
  return { ok: true };
});

export async function runPovAnalysis(input: unknown) {
  const parsed = POVInputSchema.parse(input);
  const result = await povAnalysisFlow.run(parsed);
  return result;
}

export async function runTrrRecommendations(input: unknown) {
  const parsed = TRRInputSchema.parse(input);
  const result = await trrRecommendationsFlow.run(parsed);
  return result;
}

export async function runDetectionGeneration(input: unknown) {
  const parsed = DetectionInputSchema.parse(input);
  const result = await detectionGenerationFlow.run(parsed);
  return result;
}