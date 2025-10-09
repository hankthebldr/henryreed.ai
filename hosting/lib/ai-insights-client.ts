// Lightweight AI Insights client for GUI
// - Uses Firebase/Cloud Functions if configured via NEXT_PUBLIC_FUNCTIONS_BASE_URL
// - Falls back to local GeminiAIService simulation when not configured

import type {
  AIInsight,
  GeminiArtifact,
  GeminiFunctionRequest,
  GeminiFunctionResponse,
  GeminiResponse
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

const LOCAL_MODEL_ID = 'gemini-simulator';

const createUsage = () => ({
  tokensUsed: 128,
  cost: 0
});

const buildActionItems = () => [
  'Review the recommendation with engagement stakeholders',
  'Align next steps to the current POV milestone plan',
  'Document the decisions in the Cortex DC portal'
];

const buildInsight = (
  type: AIInsight['type'],
  title: string,
  content: string,
  relatedData?: any
): AIInsight => ({
  type,
  title,
  content,
  confidence: 0.72,
  actionItems: buildActionItems(),
  relatedData
});

const buildChatResponse = (
  message: string,
  context?: any,
  sessionId?: string,
  artifacts?: GeminiArtifact[]
): GeminiFunctionResponse => {
  const contextSummary = context ? 'conversation context has been applied' : 'no additional context supplied';
  const artifactSummary = artifacts?.length
    ? ` ${artifacts.length} artifact${artifacts.length > 1 ? 's' : ''} referenced.`
    : '';
  const responseBody: GeminiResponse = {
    response: `Simulated Gemini response for "${message}". The ${contextSummary}.${artifactSummary}`,
    confidence: 0.7,
    tokensUsed: 128,
    model: LOCAL_MODEL_ID,
    timestamp: new Date().toISOString(),
    sessionId,
  };

  return {
    success: true,
    data: responseBody,
    usage: createUsage()
  };
};

const buildInsightResponse = (insight: AIInsight): GeminiFunctionResponse => ({
  success: true,
  data: insight,
  usage: createUsage()
});

export const aiInsightsClient = {
  async chat(message: string, context?: any, artifacts?: GeminiArtifact[]) {
    const base = getBaseUrl();
    const userId = 'dc-user';
    const sessionId = `sess_${Date.now()}`;

    if (base) {
      return callCloudFunction({ action: 'chat', data: { message, context, artifacts }, userId, sessionId });
    }

    return buildChatResponse(message, context, sessionId, artifacts);
  },

  async analyzePOV(pov: any, artifacts?: GeminiArtifact[]) {
    const base = getBaseUrl();
    const userId = 'dc-user';
    if (base) {
      return callCloudFunction({ action: 'analyze_pov', data: { ...pov, artifacts }, userId });
    }
    const insight = buildInsight(
      'recommendation',
      `POV Insights: ${pov?.name || 'Customer POV'}`,
      `Based on the supplied engagement data, focus on reinforcing executive sponsorship, validating priority scenarios, and highlighting quantified business outcomes for ${pov?.customer || 'the customer'}.`,
      pov
    );
    return buildInsightResponse(insight);
  },

  async analyzeTRR(trr: any, artifacts?: GeminiArtifact[]) {
    const base = getBaseUrl();
    const userId = 'dc-user';
    if (base) {
      return callCloudFunction({ action: 'analyze_trr', data: { ...trr, artifacts }, userId });
    }
    const insight = buildInsight(
      'trr_analysis',
      `Validation Guidance: ${trr?.title || trr?.id || 'TRR'}`,
      `Validate the requirement using customer telemetry samples, capture screenshots or log snippets as evidence, and align remediation steps with the documented risk level (${trr?.riskLevel || 'medium'}).`,
      trr
    );
    return buildInsightResponse(insight);
  },

  async generateDetection(scenario: any, artifacts?: GeminiArtifact[]) {
    const base = getBaseUrl();
    const userId = 'dc-user';
    if (base) {
      return callCloudFunction({ action: 'generate_detection', data: { ...scenario, artifacts }, userId });
    }
    const insight = buildInsight(
      'detection_rule',
      `Detection Blueprint: ${scenario?.name || 'Scenario'}`,
      `Create a high-fidelity detection aligned to MITRE techniques ${scenario?.mitreMapping?.join(', ') || 'TTPs'}, include enrichment for affected assets, and stage an automation playbook for containment.`,
      scenario
    );
    return buildInsightResponse(insight);
  },
};

export type { GeminiArtifact };
