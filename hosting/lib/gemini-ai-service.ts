// Gemini AI Integration for Cortex DC Portal
// Firebase/GCP implementation with advanced AI features

interface GeminiConfig {
  apiKey?: string;
  projectId?: string;
  location: string;
  model: string;
  endpoint?: string;
  authType?: 'apiKey' | 'serviceAccount';
  serviceAccountJson?: string;
}

interface GeminiRequest {
  prompt: string;
  context?: string;
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
  artifacts?: GeminiArtifact[];
  contextParts?: GeminiContentPart[];
}

type GeminiContentPart =
  | { text: string }
  | { inlineData: { data: string; mimeType: string } };

interface GeminiContent {
  role: 'user' | 'model' | 'system';
  parts: GeminiContentPart[];
}

export interface GeminiArtifact {
  id: string;
  mimeType: string;
  data: string;
  description?: string;
}

export interface GeminiResponse {
  response: string;
  confidence: number;
  tokensUsed: number;
  model: string;
  timestamp: string;
  sessionId?: string;
  raw?: any;
}

export interface AIInsight {
  type: 'risk_analysis' | 'recommendation' | 'detection_rule' | 'scenario_optimization' | 'trr_analysis';
  title: string;
  content: string;
  confidence: number;
  actionItems: string[];
  relatedData?: any;
}

// Gemini AI Service for Firebase/GCP
export class GeminiAIService {
  private static instance: GeminiAIService;
  private config: GeminiConfig;
  private vertexClientPromise: Promise<any> | null = null;
  private sessionHistory: Map<string, any[]> = new Map();

  private constructor() {
    const defaultModel = process.env.NEXT_PUBLIC_GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-1.5-pro';
    const projectId = process.env.GEMINI_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    this.config = {
      apiKey: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      projectId: projectId || undefined,
      location: process.env.GEMINI_LOCATION || process.env.NEXT_PUBLIC_GEMINI_LOCATION || 'us-central1',
      model: defaultModel,
      endpoint: process.env.GEMINI_API_ENDPOINT || process.env.NEXT_PUBLIC_GEMINI_ENDPOINT,
      authType: (process.env.GEMINI_AUTH_TYPE as GeminiConfig['authType']) || undefined,
      serviceAccountJson: process.env.GEMINI_SERVICE_ACCOUNT || process.env.GEMINI_SERVICE_ACCOUNT_JSON,
    };
  }

  // Allow runtime configuration without mutating process.env (Next.js static env)
  configure(partial: Partial<GeminiConfig>) {
    this.config = { ...this.config, ...partial };
  }

  static getInstance(): GeminiAIService {
    if (!GeminiAIService.instance) {
      GeminiAIService.instance = new GeminiAIService();
    }
    return GeminiAIService.instance;
  }

  async generateResponse(request: GeminiRequest, sessionId?: string): Promise<GeminiResponse> {
    try {
      const contents = this.buildUserContents(request);
      const systemInstruction = request.systemInstruction
        ? { role: 'system' as const, parts: [{ text: request.systemInstruction }] }
        : undefined;

      const payload: Record<string, any> = {
        contents,
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens ?? 1024,
        },
      };

      if (systemInstruction) {
        payload.systemInstruction = systemInstruction;
      }

      const response = await this.invokeModel(payload);
      const parsed = this.extractResponseText(response);

      if (!parsed.text) {
        throw new Error('Gemini returned an empty response');
      }

      if (sessionId) {
        const history = this.sessionHistory.get(sessionId) || [];
        history.push({ request, response: parsed, timestamp: new Date().toISOString() });
        this.sessionHistory.set(sessionId, history);
      }

      return {
        response: parsed.text,
        confidence: parsed.confidence ?? 0.75,
        tokensUsed: this.estimateTokens(`${request.prompt}\n${parsed.text}`),
        model: this.config.model,
        timestamp: new Date().toISOString(),
        sessionId,
        raw: response,
      };
    } catch (error) {
      throw new Error(`Gemini AI request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async analyzePOV(povData: any): Promise<AIInsight> {
    const { artifacts, ...povDetails } = povData || {};
    const prompt = `
    Analyze this Proof of Value project and provide strategic insights:

    POV Details:
    - Name: ${povDetails.name}
    - Customer: ${povDetails.customer}
    - Priority: ${povDetails.priority}
    - Progress: ${povDetails.progress}%
    - Team Size: ${povDetails.team?.length || 0}
    - Milestones: ${povDetails.milestones?.length || 0}
    - Budget: $${povDetails.budget || 0}

    Provide analysis on risks, optimization opportunities, and success factors.
    `;

    const response = await this.generateResponse({
      prompt,
      context: JSON.stringify(povDetails),
      systemInstruction: `You are an expert security consultant specializing in XSIAM/Cortex implementations.
      Provide actionable insights for POV success, risk mitigation, and customer value demonstration.`,
      temperature: 0.7,
      artifacts,
    });

    return {
      type: 'recommendation',
      title: `POV Strategic Analysis: ${povDetails.name}`,
      content: response.response,
      confidence: response.confidence,
      actionItems: this.extractActionItems(response.response),
      relatedData: povDetails
    };
  }

  async analyzeTRR(trrData: any): Promise<AIInsight> {
    const { artifacts, ...trrDetails } = trrData || {};
    const prompt = `
    Analyze this Technical Requirements Review validation:

    TRR Details:
    - ID: ${trrDetails.id}
    - Requirement: ${trrDetails.requirement}
    - Status: ${trrDetails.status}
    - Priority: ${trrDetails.priority}
    - Risk Level: ${trrDetails.riskLevel}
    - Validation Method: ${trrDetails.validationMethod}
    - Expected Outcome: ${trrDetails.expectedOutcome}
    - Business Impact: ${trrDetails.businessImpact}

    Provide analysis on validation approach, potential risks, and recommendations for success.
    `;

    const response = await this.generateResponse({
      prompt,
      context: JSON.stringify(trrDetails),
      systemInstruction: `You are a technical validation expert with deep knowledge of security implementations.
      Focus on practical validation approaches and risk assessment.`,
      temperature: 0.6,
      artifacts,
    });

    return {
      type: 'trr_analysis',
      title: `TRR Analysis: ${trrDetails.requirement}`,
      content: response.response,
      confidence: response.confidence,
      actionItems: this.extractActionItems(response.response),
      relatedData: trrDetails
    };
  }

  async generateDetectionRule(scenarioData: any): Promise<AIInsight> {
    const { artifacts, ...scenarioDetails } = scenarioData || {};
    const prompt = `
    Generate a detection rule for this Cloud Detection and Response scenario:

    Scenario Details:
    - Name: ${scenarioDetails.name}
    - Type: ${scenarioDetails.type}
    - Severity: ${scenarioDetails.severity}
    - Attack Vectors: ${scenarioDetails.attackVectors?.join(', ')}
    - MITRE Mapping: ${scenarioDetails.mitreMapping?.join(', ')}

    Create XSIAM XQL query and detection logic for this scenario.
    `;

    const response = await this.generateResponse({
      prompt,
      context: JSON.stringify(scenarioDetails),
      systemInstruction: `You are a security detection engineer expert in XQL and XSIAM.
      Generate practical, tested detection rules with proper syntax and logic.`,
      temperature: 0.4,
      artifacts,
    });

    return {
      type: 'detection_rule',
      title: `Detection Rule: ${scenarioDetails.name}`,
      content: response.response,
      confidence: response.confidence,
      actionItems: ['Test detection rule', 'Tune thresholds', 'Validate coverage'],
      relatedData: scenarioDetails
    };
  }

  async optimizeScenario(scenarioData: any, performanceData?: any): Promise<AIInsight> {
    const { artifacts, ...scenarioDetails } = scenarioData || {};
    const prompt = `
    Optimize this Cloud Detection and Response scenario:

    Current Scenario:
    - Name: ${scenarioDetails.name}
    - Duration: ${scenarioDetails.duration} hours
    - Prerequisites: ${scenarioDetails.prerequisites?.join(', ')}
    - Detection Rules: ${scenarioDetails.detectionRules?.length || 0}

    ${performanceData ? `Performance Data: ${JSON.stringify(performanceData, null, 2)}` : ''}

    Suggest improvements for effectiveness, efficiency, and learning outcomes.
    `;

    const response = await this.generateResponse({
      prompt,
      context: JSON.stringify({ scenario: scenarioDetails, performanceData }),
      systemInstruction: `You are a cybersecurity training expert specializing in hands-on scenarios.
      Focus on educational value, realistic attack simulation, and measurable learning outcomes.`,
      temperature: 0.8,
      artifacts,
    });

    return {
      type: 'scenario_optimization',
      title: `Scenario Optimization: ${scenarioDetails.name}`,
      content: response.response,
      confidence: response.confidence,
      actionItems: this.extractActionItems(response.response),
      relatedData: { scenario: scenarioDetails, performance: performanceData }
    };
  }

  async generateRiskAssessment(projectData: any): Promise<AIInsight> {
    const { artifacts, ...projectDetails } = projectData || {};
    const prompt = `
    Perform comprehensive risk assessment for this project:

    Project Data: ${JSON.stringify(projectDetails, null, 2)}

    Analyze technical, business, and timeline risks. Provide mitigation strategies.
    `;

    const response = await this.generateResponse({
      prompt,
      context: JSON.stringify(projectDetails),
      systemInstruction: `You are a cybersecurity risk assessment specialist.
      Provide structured risk analysis with probability, impact, and actionable mitigation plans.`,
      temperature: 0.5,
      artifacts,
    });

    return {
      type: 'risk_analysis',
      title: `Risk Assessment: ${projectDetails.name || 'Project Analysis'}`,
      content: response.response,
      confidence: response.confidence,
      actionItems: this.extractActionItems(response.response),
      relatedData: projectDetails
    };
  }

  async chatWithGemini(message: string, context?: string, sessionId?: string, artifacts?: GeminiArtifact[]): Promise<GeminiResponse> {
    const conversationHistory = sessionId ? this.sessionHistory.get(sessionId) : [];
    const contextPrompt = context ? `Context: ${context}\n\n` : '';
    const historyPrompt = conversationHistory?.length ?
      `Previous conversation:\n${conversationHistory.slice(-3).map(h => `User: ${h.request.prompt}\nAssistant: ${h.response.text || ''}`).join('\n')}\n\n` : '';

    const prompt = `${contextPrompt}${historyPrompt}User: ${message}`;

    return this.generateResponse({
      prompt,
      systemInstruction: `You are an expert Cortex/XSIAM consultant helping with POV management,
      TRR validation, and Cloud Detection and Response scenarios. Provide practical, actionable advice.`,
      temperature: 0.7,
      artifacts,
    }, sessionId);
  }

  private buildUserContents(request: GeminiRequest): GeminiContent[] {
    const parts: GeminiContentPart[] = [];

    if (request.context) {
      parts.push({ text: `Context:\n${request.context}` });
    }

    if (request.contextParts?.length) {
      parts.push(...request.contextParts);
    }

    if (request.artifacts?.length) {
      for (const artifact of request.artifacts) {
        if (!artifact.data) continue;
        parts.push({
          inlineData: {
            data: artifact.data,
            mimeType: artifact.mimeType || 'application/octet-stream',
          }
        });
      }
    }

    parts.push({ text: request.prompt });

    return [
      {
        role: 'user',
        parts,
      }
    ];
  }

  private async invokeModel(payload: Record<string, any>) {
    const authMode = this.resolveAuthType();
    const { url, headers } = await this.buildRequestDetails(authMode);

    const response = await fetch(`${url}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const errorPayload = isJson ? await response.json().catch(() => undefined) : undefined;
      const errorText = !isJson ? await response.text().catch(() => '') : undefined;
      const reason = errorPayload?.error?.message || errorText || response.statusText;
      throw new Error(`Gemini API error ${response.status}: ${reason}`);
    }

    return response.json();
  }

  private resolveAuthType(): NonNullable<GeminiConfig['authType']> {
    if (this.config.authType) {
      return this.config.authType;
    }

    if (typeof window !== 'undefined') {
      return 'apiKey';
    }

    if (this.config.projectId && (this.config.serviceAccountJson || process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      return 'serviceAccount';
    }

    return 'apiKey';
  }

  private async buildRequestDetails(authMode: NonNullable<GeminiConfig['authType']>): Promise<{ url: string; headers: Record<string, string> }> {
    const { projectId, location, endpoint } = this.config;
    const modelPath = this.resolveModelPath(authMode);

    if (authMode === 'serviceAccount') {
      if (typeof window !== 'undefined') {
        throw new Error('Vertex AI service account authentication is not available in the browser');
      }

      if (!projectId) {
        throw new Error('Gemini Vertex AI calls require a projectId');
      }

      const baseUrl = `${(endpoint?.trim().replace(/\/$/, '') || `https://${location}-aiplatform.googleapis.com/v1`)}/projects/${projectId}/locations/${location}`;
      const token = await this.getAccessToken();
      return {
        url: `${baseUrl}/${modelPath}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }

    const apiKey = this.config.apiKey?.trim();
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const baseUrl = endpoint?.trim().replace(/\/$/, '') || 'https://generativelanguage.googleapis.com/v1beta';
    return {
      url: `${baseUrl}/${modelPath}`,
      headers: {
        'x-goog-api-key': apiKey,
      },
    };
  }

  private resolveModelPath(authMode: NonNullable<GeminiConfig['authType']>): string {
    const rawModel = this.config.model || 'gemini-1.5-pro';
    const model = rawModel.replace(/:generateContent$/, '');

    if (authMode === 'serviceAccount') {
      if (model.includes('/')) {
        return model.replace(/^\/+/, '');
      }
      return `publishers/google/models/${model}`;
    }

    if (model.startsWith('models/')) {
      return model;
    }

    if (model.includes('/')) {
      return model.replace(/^\/+/, '');
    }

    return `models/${model}`;
  }

  private async getAccessToken(): Promise<string> {
    if (typeof window !== 'undefined') {
      throw new Error('Access tokens cannot be generated in the browser');
    }

    if (!this.vertexClientPromise) {
      const { GoogleAuth } = await import('google-auth-library');
      if (!GoogleAuth) {
        throw new Error('google-auth-library is not available. Install the dependency to use service account authentication.');
      }

      let credentials: Record<string, any> | undefined;
      if (this.config.serviceAccountJson) {
        try {
          credentials = JSON.parse(this.config.serviceAccountJson);
        } catch (error) {
          throw new Error(`Invalid Gemini service account JSON: ${error instanceof Error ? error.message : 'Unknown parse error'}`);
        }
      }
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        credentials,
      });

      this.vertexClientPromise = auth.getClient();
    }

    const client = await this.vertexClientPromise;
    const accessTokenResponse = await client.getAccessToken();
    const token = typeof accessTokenResponse === 'string' ? accessTokenResponse : accessTokenResponse?.token;

    if (!token) {
      throw new Error('Unable to obtain Vertex AI access token');
    }

    return token;
  }

  private extractResponseText(response: any): { text: string; confidence?: number } {
    const candidate = response?.candidates?.[0];
    const text = candidate?.content?.parts?.map((part: GeminiContentPart) => 'text' in part ? part.text : '').join('\n').trim();
    const confidence = candidate?.safetyRatings?.length
      ? 1 - Math.max(...candidate.safetyRatings.map((rating: any) => rating.probability || 0))
      : undefined;

    return { text: text || '', confidence };
  }

  private extractActionItems(content: string): string[] {
    const actionPatterns = [
      /^\d+\.\s+(.+)$/gm,
      /^•\s+(.+)$/gm,
      /^-\s+(.+)$/gm,
      /^\*\s+(.+)$/gm
    ];

    const actions: string[] = [];
    for (const pattern of actionPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        actions.push(...matches.map(match => match.replace(/^\d+\.\s+|^[•\-\*]\s+/, '').trim()));
      }
    }

    return actions.slice(0, 5); // Limit to 5 action items
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~0.75 tokens per word
    return Math.ceil(text.split(' ').length * 0.75);
  }

  // Firebase integration methods
  async saveInsightToFirestore(insight: AIInsight, userId: string): Promise<string> {
    // In production, save to Firestore
    const docId = `insight_${Date.now()}`;
    console.log(`Saving insight ${docId} to Firestore for user ${userId}:`, insight);
    return docId;
  }

  async getInsightHistory(userId: string, limit: number = 10): Promise<AIInsight[]> {
    // In production, retrieve from Firestore
    console.log(`Retrieving insight history for user ${userId}, limit: ${limit}`);
    return [];
  }
}

// Firebase Cloud Functions integration
export interface GeminiFunctionRequest {
  action: 'analyze_pov' | 'analyze_trr' | 'generate_detection' | 'optimize_scenario' | 'chat';
  data: any;
  userId: string;
  sessionId?: string;
}

export interface GeminiFunctionResponse {
  success: boolean;
  data?: AIInsight | GeminiResponse;
  error?: string;
  usage?: {
    tokensUsed: number;
    cost: number;
  };
}

// Utility functions for Firebase integration
export const initializeGeminiWithFirebase = (config: {
  apiKey: string;
  projectId: string;
}) => {
  // Do not assign to process.env at runtime in Next.js; configure the service instance instead
  const instance = GeminiAIService.getInstance();
  instance.configure({ apiKey: config.apiKey, projectId: config.projectId });
  return instance;
};

export const createGeminiCloudFunction = () => {
  return async (request: GeminiFunctionRequest): Promise<GeminiFunctionResponse> => {
    try {
      const gemini = GeminiAIService.getInstance();
      let result: AIInsight | GeminiResponse;

      switch (request.action) {
        case 'analyze_pov':
          result = await gemini.analyzePOV(request.data);
          break;
        case 'analyze_trr':
          result = await gemini.analyzeTRR(request.data);
          break;
        case 'generate_detection':
          result = await gemini.generateDetectionRule(request.data);
          break;
        case 'optimize_scenario':
          result = await gemini.optimizeScenario(request.data);
          break;
        case 'chat':
          result = await gemini.chatWithGemini(
            request.data.message, 
            request.data.context, 
            request.sessionId
          );
          break;
        default:
          throw new Error(`Unknown action: ${request.action}`);
      }

      // Save insight to Firestore
      if ('type' in result) {
        await gemini.saveInsightToFirestore(result as AIInsight, request.userId);
      }

      return {
        success: true,
        data: result,
        usage: {
          tokensUsed: 'tokensUsed' in result ? result.tokensUsed : 0,
          cost: 0.001 // Approximate cost per request
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };
};

export default GeminiAIService;
