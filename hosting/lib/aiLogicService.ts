/**
 * Firebase AI Logic Service
 * Integrates Google's Gemini AI models through Firebase AI Logic
 * Based on Firebase documentation: https://firebase.google.com/docs/ai-logic/get-started?platform=web
 */

import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { app } from '../src/lib/firebase';

// Environment configuration
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const DEFAULT_MODEL = 'gemini-2.5-flash'; // Fast, efficient model for most use cases

/**
 * Initialize Firebase AI Logic with Gemini backend
 */
export function initializeAI() {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not configured. AI features will be disabled.');
    return null;
  }

  try {
    // Initialize AI with Google AI backend
    const ai = getAI(app, {
      backend: new GoogleAIBackend()
    });

    console.log('✅ Firebase AI Logic initialized successfully');
    return ai;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase AI Logic:', error);
    return null;
  }
}

/**
 * Get a generative model instance
 */
export function getModel(modelName: string = DEFAULT_MODEL) {
  const ai = initializeAI();
  if (!ai) {
    throw new Error('AI Logic not initialized. Check GEMINI_API_KEY configuration.');
  }

  return getGenerativeModel(ai, { model: modelName });
}

/**
 * Generate content from a text prompt
 */
export async function generateContent(
  prompt: string,
  modelName?: string
): Promise<string> {
  try {
    const model = getModel(modelName);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error(`Failed to generate content: ${error}`);
  }
}

/**
 * Generate streaming content (for real-time responses)
 */
export async function* generateContentStream(
  prompt: string,
  modelName?: string
): AsyncGenerator<string, void, unknown> {
  try {
    const model = getModel(modelName);
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield chunkText;
    }
  } catch (error) {
    console.error('Error generating streaming content:', error);
    throw new Error(`Failed to generate streaming content: ${error}`);
  }
}

/**
 * Chat session for multi-turn conversations
 */
export class ChatSession {
  private model: any;
  private history: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  constructor(modelName?: string) {
    this.model = getModel(modelName);
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const chat = this.model.startChat({
        history: this.history
      });

      const result = await chat.sendMessage(message);
      const response = result.response;
      const text = response.text();

      // Update history
      this.history.push(
        { role: 'user', parts: [{ text: message }] },
        { role: 'model', parts: [{ text }] }
      );

      return text;
    } catch (error) {
      console.error('Error in chat session:', error);
      throw new Error(`Chat error: ${error}`);
    }
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
  }
}

/**
 * Specialized AI functions for Cortex Domain Consultant
 */

/**
 * Generate POV recommendations based on customer scenario
 */
export async function generatePOVRecommendations(
  customerScenario: string,
  industry?: string,
  challenges?: string[]
): Promise<string> {
  const prompt = `
You are a Palo Alto Networks Cortex Cloud Detection and Response expert.

Customer Scenario: ${customerScenario}
${industry ? `Industry: ${industry}` : ''}
${challenges?.length ? `Key Challenges: ${challenges.join(', ')}` : ''}

Generate a comprehensive POV (Proof of Value) recommendation including:
1. Recommended detection scenarios
2. Cloud security use cases
3. MITRE ATT&CK mappings
4. Success metrics
5. Timeline and milestones

Format the response in markdown with clear sections.
`;

  return generateContent(prompt);
}

/**
 * Generate detection scenario templates
 */
export async function generateDetectionScenario(
  attackTechnique: string,
  cloudProvider: string
): Promise<string> {
  const prompt = `
Generate a Cloud Detection and Response scenario for:

Attack Technique: ${attackTechnique}
Cloud Provider: ${cloudProvider}

Include:
1. Scenario description
2. Detection logic
3. Response playbook
4. Required data sources
5. MITRE ATT&CK mapping
6. Alert configuration

Format in structured markdown.
`;

  return generateContent(prompt);
}

/**
 * Analyze and enhance knowledge base content
 */
export async function enhanceKnowledgeBaseContent(
  content: string,
  targetAudience: string = 'security engineers'
): Promise<{
  summary: string;
  keywords: string[];
  suggestedTags: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  relatedTopics: string[];
}> {
  const prompt = `
Analyze this technical content and provide structured metadata:

Content: ${content}

Target Audience: ${targetAudience}

Provide a JSON response with:
- summary: Brief 2-3 sentence summary
- keywords: Array of 5-10 relevant keywords
- suggestedTags: Array of 3-5 tags for categorization
- complexity: One of [beginner, intermediate, advanced, expert]
- relatedTopics: Array of 3-5 related topics

Return ONLY valid JSON, no additional text.
`;

  const response = await generateContent(prompt);

  try {
    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error('Invalid AI response format');
  }
}

/**
 * Generate terminal command suggestions
 */
export async function generateCommandSuggestions(
  context: string,
  previousCommands: string[]
): Promise<string[]> {
  const prompt = `
Given this context and command history, suggest 5 relevant commands:

Context: ${context}
Previous Commands: ${previousCommands.slice(-5).join(', ')}

Respond with ONLY a JSON array of command strings, no explanation.
Example: ["command1", "command2", "command3", "command4", "command5"]
`;

  const response = await generateContent(prompt);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No array found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse command suggestions:', error);
    return [];
  }
}

/**
 * Health check for AI Logic service
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unavailable';
  message: string;
}> {
  try {
    if (!GEMINI_API_KEY) {
      return {
        status: 'unavailable',
        message: 'GEMINI_API_KEY not configured'
      };
    }

    const testResponse = await generateContent('Respond with "OK" if you can process this message.');

    if (testResponse) {
      return {
        status: 'healthy',
        message: 'AI Logic service is operational'
      };
    } else {
      return {
        status: 'degraded',
        message: 'AI Logic responded but with unexpected output'
      };
    }
  } catch (error) {
    return {
      status: 'unavailable',
      message: `AI Logic service error: ${error}`
    };
  }
}

export default {
  generateContent,
  generateContentStream,
  ChatSession,
  generatePOVRecommendations,
  generateDetectionScenario,
  enhanceKnowledgeBaseContent,
  generateCommandSuggestions,
  healthCheck
};
