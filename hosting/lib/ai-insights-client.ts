// Lightweight AI Insights client for GUI
// - Uses Firebase/Cloud Functions if configured via NEXT_PUBLIC_FUNCTIONS_BASE_URL
// - Falls back to local GeminiAIService simulation when not configured

import GeminiAIService, {
  GeminiArtifact,
  GeminiFunctionRequest,
  GeminiFunctionResponse
} from './gemini-ai-service';

export type AIInsightsAction = GeminiFunctionRequest['action'];

const getBaseUrl = () => {
  const fromEnv = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
  const sanitized = fromEnv && fromEnv.trim().length > 0 ? fromEnv.trim().replace(/\/$/, '') : '';
  // Default to /api so Firebase Hosting rewrite hits the Express API
  return sanitized || '/api';
};

async function callCloudFunction(payload: GeminiFunctionRequest): Promise<GeminiFunctionResponse> {
  const base = getBaseUrl();
  if (!base) {
    throw new Error('Cloud Functions base URL not configured');
  }

  const res = await fetch(`${base}/gemini`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gemini function error: ${res.status} ${text}`);
  }

  return (await res.json()) as GeminiFunctionResponse;
}

export const aiInsightsClient = {
  async chat(message: string, context?: any, artifacts?: GeminiArtifact[]) {
    const base = getBaseUrl();
    const userId = 'dc-user';
    const sessionId = `sess_${Date.now()}`;

    if (base) {
      return callCloudFunction({ action: 'chat', data: { message, context, artifacts }, userId, sessionId });
    }

    // Fallback to local simulation
    const gemini = GeminiAIService.getInstance();
    const data = await gemini.chatWithGemini(message, JSON.stringify(context), sessionId, artifacts);
    return { success: true, data, usage: { tokensUsed: 'tokensUsed' in data ? (data as any).tokensUsed : 0, cost: 0 } } satisfies GeminiFunctionResponse;
  },

  async analyzePOV(pov: any, artifacts?: GeminiArtifact[]) {
    const base = getBaseUrl();
    const userId = 'dc-user';
    if (base) {
      return callCloudFunction({ action: 'analyze_pov', data: { pov, artifacts }, userId });
    }
    const gemini = GeminiAIService.getInstance();
    const data = await gemini.analyzePOV({ ...pov, artifacts });
    return { success: true, data, usage: { tokensUsed: 'tokensUsed' in data ? (data as any).tokensUsed : 0, cost: 0 } } satisfies GeminiFunctionResponse;
  },

  async analyzeTRR(trr: any, artifacts?: GeminiArtifact[]) {
    const base = getBaseUrl();
    const userId = 'dc-user';
    if (base) {
      return callCloudFunction({ action: 'analyze_trr', data: { trr, artifacts }, userId });
    }
    const gemini = GeminiAIService.getInstance();
    const data = await gemini.analyzeTRR({ ...trr, artifacts });
    return { success: true, data, usage: { tokensUsed: 'tokensUsed' in data ? (data as any).tokensUsed : 0, cost: 0 } } satisfies GeminiFunctionResponse;
  },

  async generateDetection(scenario: any, artifacts?: GeminiArtifact[]) {
    const base = getBaseUrl();
    const userId = 'dc-user';
    if (base) {
      return callCloudFunction({ action: 'generate_detection', data: { scenario, artifacts }, userId });
    }
    const gemini = GeminiAIService.getInstance();
    const data = await gemini.generateDetectionRule({ ...scenario, artifacts });
    return { success: true, data, usage: { tokensUsed: 'tokensUsed' in data ? (data as any).tokensUsed : 0, cost: 0 } } satisfies GeminiFunctionResponse;
  },
};

export type { GeminiArtifact };
