/**
 * React Hook for Firebase AI Logic
 * Provides easy access to AI features in React components
 */

'use client';

import { useState, useCallback } from 'react';
import {
  generateContent,
  generateContentStream,
  ChatSession,
  generatePOVRecommendations,
  generateDetectionScenario,
  enhanceKnowledgeBaseContent,
  generateCommandSuggestions,
  healthCheck
} from '../lib/aiLogicService';

export interface UseAILogicResult {
  // State
  isLoading: boolean;
  error: string | null;
  response: string | null;

  // Actions
  generate: (prompt: string, modelName?: string) => Promise<void>;
  streamGenerate: (prompt: string, modelName?: string) => Promise<void>;
  generatePOV: (scenario: string, industry?: string, challenges?: string[]) => Promise<void>;
  generateScenario: (attackTechnique: string, cloudProvider: string) => Promise<void>;
  enhanceContent: (content: string, targetAudience?: string) => Promise<any>;
  suggestCommands: (context: string, previousCommands: string[]) => Promise<string[]>;
  checkHealth: () => Promise<any>;
  reset: () => void;
}

/**
 * Main hook for AI Logic features
 */
export function useAILogic(): UseAILogicResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, modelName?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateContent(prompt, modelName);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const streamGenerate = useCallback(async (prompt: string, modelName?: string) => {
    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const stream = generateContentStream(prompt, modelName);

      for await (const chunk of stream) {
        setResponse(prev => (prev || '') + chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generatePOV = useCallback(async (
    scenario: string,
    industry?: string,
    challenges?: string[]
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generatePOVRecommendations(scenario, industry, challenges);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateScenario = useCallback(async (
    attackTechnique: string,
    cloudProvider: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateDetectionScenario(attackTechnique, cloudProvider);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enhanceContent = useCallback(async (
    content: string,
    targetAudience?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await enhanceKnowledgeBaseContent(content, targetAudience);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const suggestCommands = useCallback(async (
    context: string,
    previousCommands: string[]
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateCommandSuggestions(context, previousCommands);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await healthCheck();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResponse(null);
  }, []);

  return {
    isLoading,
    error,
    response,
    generate,
    streamGenerate,
    generatePOV,
    generateScenario,
    enhanceContent,
    suggestCommands,
    checkHealth,
    reset
  };
}

/**
 * Hook for chat sessions
 */
export function useAIChat(modelName?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSession] = useState(() => new ChatSession(modelName));
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([]);

  const sendMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    setError(null);

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', text: message }]);

    try {
      const response = await chatSession.sendMessage(message);

      // Add AI response
      setMessages(prev => [...prev, { role: 'model', text: response }]);

      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [chatSession]);

  const clearChat = useCallback(() => {
    chatSession.clearHistory();
    setMessages([]);
    setError(null);
  }, [chatSession]);

  return {
    isLoading,
    error,
    messages,
    sendMessage,
    clearChat
  };
}

export default useAILogic;
