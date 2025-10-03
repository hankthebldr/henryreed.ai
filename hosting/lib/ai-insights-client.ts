// Lightweight AI Insights client for GUI
// - Uses Firebase/Cloud Functions if configured via NEXT_PUBLIC_FUNCTIONS_BASE_URL
// - Falls back to local GeminiAIService simulation when not configured

import GeminiAIService, { GeminiFunctionRequest, GeminiFunctionResponse } from './gemini-ai-service';

export type AIInsightsAction = GeminiFunctionRequest['action'];

const getBaseUrl = () => {
  if (typeof window === 'undefined') return null;
  const fromEnv = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
  return fromEnv && fromEnv.trim().length > 0 ? fromEnv.trim().replace(/\/$/, '') : null;
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
  async chat(message: string, context?: any) {
    const base = getBaseUrl();
    const userId = 'dc-user';
    const sessionId = `sess_${Date.now()}`;

    if (base) {
      return callCloudFunction({ action: 'chat', data: { message, context }, userId, sessionId });
    }

    // Fallback to local simulation
    const gemini = GeminiAIService.getInstance();
    const data = await gemini.chatWithGemini(message, context, sessionId);
    return { success: true, data, usage: { tokensUsed: 'tokensUsed' in data ? (data as any).tokensUsed : 0, cost: 0 } } satisfies GeminiFunctionResponse;
  },

  async analyzePOV(pov: any) {
    const base = getBaseUrl();
    const userId = 'dc-user';
    if (base) {
      return callCloudFunction({ action: 'analyze_pov', data: pov, userId });
    }
    const gemini = GeminiAIService.getInstance();
    const data = await gemini.analyzePOV(pov);
    return { success: true, data, usage: { tokensUsed: 'tokensUsed' in data ? (data as any).tokensUsed : 0, cost: 0 } } satisfies GeminiFunctionResponse;
  },

  async analyzeTRR(trr: any) {
    const base = getBaseUrl();
    const userId = 'dc-user';
    if (base) {
      return callCloudFunction({ action: 'analyze_trr', data: trr, userId });
    }
    const gemini = GeminiAIService.getInstance();
    const data = await gemini.analyzeTRR(trr);
    return { success: true, data, usage: { tokensUsed: 'tokensUsed' in data ? (data as any).tokensUsed : 0, cost: 0 } } satisfies GeminiFunctionResponse;
  },

  async generateDetection(scenario: any) {
    const base = getBaseUrl();
    const userId = 'dc-user';
    if (base) {
      return callCloudFunction({ action: 'generate_detection', data: scenario, userId });
    }
    const gemini = GeminiAIService.getInstance();
    const data = await gemini.generateDetectionRule(scenario);
    return { success: true, data, usage: { tokensUsed: 'tokensUsed' in data ? (data as any).tokensUsed : 0, cost: 0 } } satisfies GeminiFunctionResponse;
  },
};
