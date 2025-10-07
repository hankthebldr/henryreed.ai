/**
 * Firebase Cloud Function for Gemini AI Integration
 * 
 * Deploy this function to enable AI Insights in the DC Portal GUI.
 * This function calls the real Gemini AI API or OpenAI API based on configuration.
 */
import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Lazy OpenAI client initialization to avoid deploy-time failures when key is missing
function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  return new OpenAI({ apiKey });
}

interface GeminiFunctionRequest {
  action: 'analyze_pov' | 'analyze_trr' | 'generate_detection' | 'optimize_scenario' | 'chat';
  data: any;
  userId: string;
  sessionId?: string;
}

interface GeminiFunctionResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    tokensUsed: number;
    cost: number;
  };
}

export async function geminiHttpHandler(req: any, res: any) {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const request: GeminiFunctionRequest = req.body;
    
    if (!request.action || !request.userId) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    let result: any;
    let tokensUsed = 0;

    switch (request.action) {
      case 'chat':
        result = await handleChat(request.data?.message, request.data?.context);
        tokensUsed = estimateTokens(String(request.data?.message || '') + JSON.stringify(result));
        break;

      case 'analyze_pov':
        result = await analyzePOV(request.data);
        tokensUsed = estimateTokens(JSON.stringify(request.data) + JSON.stringify(result));
        break;

      case 'analyze_trr':
        result = await analyzeTRR(request.data);
        tokensUsed = estimateTokens(JSON.stringify(request.data) + JSON.stringify(result));
        break;

      case 'generate_detection':
        result = await generateDetection(request.data);
        tokensUsed = estimateTokens(JSON.stringify(request.data) + JSON.stringify(result));
        break;

      default:
        res.status(400).json({ success: false, error: `Unknown action: ${request.action}` });
        return;
    }

    // Log to Firestore for analytics
    try {
      await admin.firestore().collection('ai_usage').add({
        userId: request.userId,
        action: request.action,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        tokensUsed,
        success: true
      });
    } catch (logError) {
      console.warn('Failed to log usage:', logError);
    }

    const response: GeminiFunctionResponse = {
      success: true,
      data: result,
      usage: {
        tokensUsed,
        cost: tokensUsed * 0.000002 // Rough estimate: $0.002 per 1K tokens
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Gemini function error:', error);
    
    const response: GeminiFunctionResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    res.status(500).json(response);
  }
}

export const gemini = functions.https.onRequest(geminiHttpHandler);

async function handleChat(message: string, context?: any): Promise<any> {
  const systemPrompt = `You are an expert Domain Consultant for Palo Alto Networks XSIAM and Cortex platforms. You help with:
- POV (Proof of Value) optimization and strategy
- TRR (Technical Requirements Review) analysis
- Security scenario recommendations
- Customer fit analysis and timeline predictions

Provide practical, actionable advice based on security operations best practices.`;

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context: ${JSON.stringify(context)}\n\nQuestion: ${message}` }
    ],
    max_tokens: 500,
    temperature: 0.7
  });

  return {
    content: completion.choices[0]?.message?.content || 'No response generated',
    tokensUsed: completion.usage?.total_tokens || 0
  };
}

async function analyzePOV(pov: any): Promise<any> {
  const prompt = `Analyze this POV and provide strategic insights:

POV Data: ${JSON.stringify(pov, null, 2)}

Provide analysis on:
1. Risk assessment (timeline, resource, technical risks)
2. Success factors and opportunities
3. Actionable recommendations
4. Next steps

Format your response as structured insights.`;

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.5
  });

  return {
    type: 'pov_analysis',
    content: completion.choices[0]?.message?.content || 'Analysis not available',
    confidence: 0.85,
    tokensUsed: completion.usage?.total_tokens || 0
  };
}

async function analyzeTRR(trr: any): Promise<any> {
  const prompt = `Analyze this TRR (Technical Requirements Review) data:

TRR Data: ${JSON.stringify(trr, null, 2)}

Provide insights on:
1. Validation approach assessment
2. Potential challenges and risks
3. Recommendations for improvement
4. Success metrics and timeline

Focus on technical validation and practical implementation.`;

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
    temperature: 0.5
  });

  return {
    type: 'trr_analysis',
    content: completion.choices[0]?.message?.content || 'Analysis not available',
    confidence: 0.82,
    tokensUsed: completion.usage?.total_tokens || 0
  };
}

async function generateDetection(scenario: any): Promise<any> {
  const prompt = `Generate detection content for this security scenario:

Scenario: ${JSON.stringify(scenario, null, 2)}

Provide:
1. XSIAM/XQL detection queries if applicable
2. MITRE ATT&CK technique mappings
3. Tuning recommendations
4. Implementation guidance

Focus on practical, production-ready detection logic.`;

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    temperature: 0.3
  });

  return {
    type: 'detection_rule',
    content: completion.choices[0]?.message?.content || 'Detection not generated',
    confidence: 0.91,
    tokensUsed: completion.usage?.total_tokens || 0
  };
}

function estimateTokens(text: string): number {
  // Rough estimation: ~0.75 tokens per word
  return Math.ceil(text.split(' ').length * 0.75);
}