import React, { useState, useEffect } from 'react';
import { CommandConfig } from './commands';
import { TerminalOutput } from '../components/TerminalOutput';
import GeminiAIService, { AIInsight, GeminiResponse } from './gemini-ai-service';

// Gemini AI Chat Component
const GeminiChatInterface: React.FC<{
  initialMessage?: string;
  context?: string;
}> = ({ initialMessage, context }) => {
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [input, setInput] = useState(initialMessage || '');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);

  const gemini = GeminiAIService.getInstance();

  useEffect(() => {
    if (initialMessage) {
      handleSendMessage();
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { type: 'user' as const, content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await gemini.chatWithGemini(input, context, sessionId);
      const assistantMessage = {
        type: 'assistant' as const,
        content: response.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'assistant' as const,
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-purple-500 max-h-96">
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">🤖</div>
        <div>
          <h3 className="text-lg font-bold text-purple-400">Gemini AI Assistant</h3>
          <p className="text-sm text-gray-300">Powered by Google Gemini - Your Cortex/XSIAM Expert</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-cortex-text-secondary py-8">
            <div className="text-4xl mb-2">💬</div>
            <p>Ask me anything about POV management, TRR validation, or Cloud Detection and Response scenarios!</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.type === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-100'
            }`}>
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin text-purple-400">⟳</div>
                <span className="text-sm">Gemini is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask Gemini about POVs, TRRs, scenarios..."
          className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded text-white text-sm transition-colors"
        >
          {isLoading ? '⟳' : 'Send'}
        </button>
      </div>
    </div>
  );
};

// AI Insight Display Component
const AIInsightDisplay: React.FC<{ insight: AIInsight }> = ({ insight }) => {
  const getTypeIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'risk_analysis': return '⚠️';
      case 'recommendation': return '💡';
      case 'detection_rule': return '🔍';
      case 'scenario_optimization': return '⚡';
      case 'trr_analysis': return '📋';
      default: return '🤖';
    }
  };

  const getTypeColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'risk_analysis': return 'text-red-400';
      case 'recommendation': return 'text-green-400';
      case 'detection_rule': return 'text-blue-400';
      case 'scenario_optimization': return 'text-yellow-400';
      case 'trr_analysis': return 'text-purple-400';
      default: return 'text-cortex-text-secondary';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">{getTypeIcon(insight.type)}</div>
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${getTypeColor(insight.type)}`}>{insight.title}</h3>
          <div className="flex items-center space-x-3 text-sm text-cortex-text-secondary">
            <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
            <span>•</span>
            <span>Type: {insight.type.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`px-3 py-1 rounded text-sm font-bold ${
            insight.confidence > 0.8 ? 'bg-green-800 text-green-200' :
            insight.confidence > 0.6 ? 'bg-yellow-800 text-yellow-200' :
            'bg-red-800 text-red-200'
          }`}>
            {insight.confidence > 0.8 ? 'HIGH' : insight.confidence > 0.6 ? 'MEDIUM' : 'LOW'} CONFIDENCE
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-gray-300 whitespace-pre-wrap">{insight.content}</div>
      </div>

      {insight.actionItems.length > 0 && (
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <div className="font-bold text-cyan-400 mb-2">🎯 Action Items</div>
          <ul className="space-y-1">
            {insight.actionItems.map((item, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const geminiCommands: CommandConfig[] = [
  {
    name: 'gemini',
    description: 'Interact with Gemini AI for POV analysis, TRR insights, and scenario optimization',
    usage: 'gemini [chat|analyze-pov|analyze-trr|generate-rule|optimize] [options]',
    aliases: ['ai', 'gai', 'assistant'],
    handler: (args) => {
      const subcommand = args[0] || 'chat';
      const gemini = GeminiAIService.getInstance();

      if (subcommand === 'chat') {
        const message = args.slice(1).join(' ');
        return (
          <TerminalOutput type="info">
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-4">🤖</div>
                <div>
                  <div className="font-bold text-2xl text-purple-400">Gemini AI Chat</div>
                  <div className="text-sm text-gray-300">Interactive conversation with your AI assistant</div>
                </div>
              </div>
              <GeminiChatInterface initialMessage={message} />
            </div>
          </TerminalOutput>
        );
      }

      if (subcommand === 'analyze-pov') {
        const povId = args[1];
        if (!povId) {
          return (
            <TerminalOutput type="error">
              <div>Please specify a POV ID. Usage: gemini analyze-pov POV-2024-001</div>
            </TerminalOutput>
          );
        }

        // Mock POV data - in production this would come from your data store
        const mockPOV = {
          id: povId,
          name: 'ACME Corp XSIAM Implementation',
          customer: 'acme-corp',
          priority: 'high',
          progress: 65,
          team: [
            { name: 'John Doe', role: 'lead' },
            { name: 'Sarah Smith', role: 'consultant' },
            { name: 'Mike Johnson', role: 'engineer' }
          ],
          milestones: [
            { name: 'Environment Setup', status: 'completed' },
            { name: 'Data Ingestion', status: 'completed' },
            { name: 'Use Case Demonstrations', status: 'in-progress' },
            { name: 'Final Presentation', status: 'pending' }
          ],
          budget: 150000
        };

        const AnalysisComponent = () => {
          const [insight, setInsight] = useState<AIInsight | null>(null);
          const [isLoading, setIsLoading] = useState(false);

          useEffect(() => {
            const analyzeProject = async () => {
              setIsLoading(true);
              try {
                const analysis = await gemini.analyzePOV(mockPOV);
                setInsight(analysis);
              } catch (error) {
                console.error('Analysis failed:', error);
              } finally {
                setIsLoading(false);
              }
            };
            analyzeProject();
          }, []);

          if (isLoading) {
            return (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔄</div>
                <div className="text-purple-400 font-semibold">Analyzing POV with Gemini AI...</div>
                <div className="text-sm text-cortex-text-secondary mt-2">This may take a few moments</div>
              </div>
            );
          }

          if (!insight) {
            return (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">❌</div>
                <div className="text-red-400">Analysis failed</div>
              </div>
            );
          }

          return <AIInsightDisplay insight={insight} />;
        };

        return (
          <TerminalOutput type="info">
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-4">🎯</div>
                <div>
                  <div className="font-bold text-2xl text-green-400">POV Analysis</div>
                  <div className="text-sm text-gray-300">AI-powered strategic analysis for {povId}</div>
                </div>
              </div>
              <AnalysisComponent />
            </div>
          </TerminalOutput>
        );
      }

      if (subcommand === 'analyze-trr') {
        const trrId = args[1];
        if (!trrId) {
          return (
            <TerminalOutput type="error">
              <div>Please specify a TRR ID. Usage: gemini analyze-trr TRR-001</div>
            </TerminalOutput>
          );
        }

        // Mock TRR data
        const mockTRR = {
          id: trrId,
          requirement: 'SIEM Integration Validation',
          status: 'in-progress',
          priority: 'critical',
          riskLevel: 'medium',
          validationMethod: 'Live integration test with customer SIEM',
          expectedOutcome: 'Successful bi-directional data flow and alert correlation',
          businessImpact: 'Critical for customer security operations workflow'
        };

        const TRRAnalysisComponent = () => {
          const [insight, setInsight] = useState<AIInsight | null>(null);
          const [isLoading, setIsLoading] = useState(false);

          useEffect(() => {
            const analyzeTRR = async () => {
              setIsLoading(true);
              try {
                const analysis = await gemini.analyzeTRR(mockTRR);
                setInsight(analysis);
              } catch (error) {
                console.error('TRR analysis failed:', error);
              } finally {
                setIsLoading(false);
              }
            };
            analyzeTRR();
          }, []);

          if (isLoading) {
            return (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔄</div>
                <div className="text-purple-400 font-semibold">Analyzing TRR with Gemini AI...</div>
              </div>
            );
          }

          return insight ? <AIInsightDisplay insight={insight} /> : (
            <div className="text-center py-8">
              <div className="text-red-400">TRR analysis failed</div>
            </div>
          );
        };

        return (
          <TerminalOutput type="info">
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-4">📋</div>
                <div>
                  <div className="font-bold text-2xl text-orange-400">TRR Analysis</div>
                  <div className="text-sm text-gray-300">AI validation insights for {trrId}</div>
                </div>
              </div>
              <TRRAnalysisComponent />
            </div>
          </TerminalOutput>
        );
      }

      if (subcommand === 'generate-rule') {
        const scenarioName = args.slice(1).join(' ');
        if (!scenarioName) {
          return (
            <TerminalOutput type="error">
              <div>Please specify a scenario. Usage: gemini generate-rule ransomware attack</div>
            </TerminalOutput>
          );
        }

        // Mock scenario data
        const mockScenario = {
          name: scenarioName,
          type: 'ransomware',
          severity: 'critical',
          attackVectors: ['phishing email', 'lateral movement', 'file encryption'],
          mitreMapping: ['T1566', 'T1486', 'T1083']
        };

        const RuleGenerationComponent = () => {
          const [insight, setInsight] = useState<AIInsight | null>(null);
          const [isLoading, setIsLoading] = useState(false);

          useEffect(() => {
            const generateRule = async () => {
              setIsLoading(true);
              try {
                const rule = await gemini.generateDetectionRule(mockScenario);
                setInsight(rule);
              } catch (error) {
                console.error('Rule generation failed:', error);
              } finally {
                setIsLoading(false);
              }
            };
            generateRule();
          }, []);

          if (isLoading) {
            return (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔄</div>
                <div className="text-purple-400 font-semibold">Generating detection rule with Gemini AI...</div>
              </div>
            );
          }

          return insight ? <AIInsightDisplay insight={insight} /> : (
            <div className="text-center py-8">
              <div className="text-red-400">Rule generation failed</div>
            </div>
          );
        };

        return (
          <TerminalOutput type="info">
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-4">🔍</div>
                <div>
                  <div className="font-bold text-2xl text-blue-400">Detection Rule Generation</div>
                  <div className="text-sm text-gray-300">AI-generated XQL for: {scenarioName}</div>
                </div>
              </div>
              <RuleGenerationComponent />
            </div>
          </TerminalOutput>
        );
      }

      // Dashboard view (default)
      return (
        <TerminalOutput type="info">
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="text-3xl mr-4">🤖</div>
              <div>
                <div className="font-bold text-2xl text-purple-400">Gemini AI Assistant</div>
                <div className="text-sm text-gray-300">Powered by Google Gemini for Firebase/GCP</div>
              </div>
            </div>
            
            {/* AI Capabilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-purple-500/30">
                <div className="font-bold text-lg mb-4 text-purple-400">🎯 POV Intelligence</div>
                <div className="space-y-2 text-sm">
                  <div>• Strategic risk analysis</div>
                  <div>• Timeline optimization</div>
                  <div>• Resource allocation insights</div>
                  <div>• Success factor identification</div>
                </div>
                <div className="mt-4 font-mono text-xs text-cortex-text-secondary">
                  gemini analyze-pov POV-2024-001
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-blue-500/30">
                <div className="font-bold text-lg mb-4 text-blue-400">📋 TRR Validation</div>
                <div className="space-y-2 text-sm">
                  <div>• Validation approach assessment</div>
                  <div>• Risk identification</div>
                  <div>• Success metrics definition</div>
                  <div>• Testing recommendations</div>
                </div>
                <div className="mt-4 font-mono text-xs text-cortex-text-secondary">
                  gemini analyze-trr TRR-001
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-green-500/30">
                <div className="font-bold text-lg mb-4 text-green-400">🔍 Detection Engineering</div>
                <div className="space-y-2 text-sm">
                  <div>• XQL query generation</div>
                  <div>• Rule optimization</div>
                  <div>• MITRE ATT&CK mapping</div>
                  <div>• Tuning recommendations</div>
                </div>
                <div className="mt-4 font-mono text-xs text-cortex-text-secondary">
                  gemini generate-rule ransomware
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-yellow-500/30">
                <div className="font-bold text-lg mb-4 text-yellow-400">💬 Interactive Chat</div>
                <div className="space-y-2 text-sm">
                  <div>• Conversational assistance</div>
                  <div>• Context-aware responses</div>
                  <div>• Best practice guidance</div>
                  <div>• Real-time Q&A</div>
                </div>
                <div className="mt-4 font-mono text-xs text-cortex-text-secondary">
                  gemini chat
                </div>
              </div>
            </div>

            {/* Available Commands */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
              <div className="font-bold text-lg mb-4 text-purple-400">🤖 Gemini AI Commands</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-purple-400 font-mono mb-2">gemini chat [message]</div>
                  <div className="text-sm text-gray-300 ml-4">Interactive AI conversation</div>
                  
                  <div className="text-green-400 font-mono mb-2 mt-3">gemini analyze-pov [pov-id]</div>
                  <div className="text-sm text-gray-300 ml-4">POV strategic analysis</div>
                  
                  <div className="text-blue-400 font-mono mb-2 mt-3">gemini analyze-trr [trr-id]</div>
                  <div className="text-sm text-gray-300 ml-4">TRR validation insights</div>
                </div>
                <div>
                  <div className="text-yellow-400 font-mono mb-2">gemini generate-rule [scenario]</div>
                  <div className="text-sm text-gray-300 ml-4">Detection rule generation</div>
                  
                  <div className="text-cyan-400 font-mono mb-2 mt-3">ai [message]</div>
                  <div className="text-sm text-gray-300 ml-4">Quick AI chat (alias)</div>
                  
                  <div className="text-orange-400 font-mono mb-2 mt-3">gai optimize scenario-name</div>
                  <div className="text-sm text-gray-300 ml-4">Scenario optimization</div>
                </div>
              </div>
            </div>

            {/* Firebase/GCP Integration Info */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-6 rounded-lg border border-purple-500/30">
              <div className="font-bold text-lg mb-4 text-purple-400">🔥 Firebase/GCP Integration</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-white mb-2">Cloud Functions</div>
                  <div className="text-gray-300">Server-side AI processing</div>
                </div>
                <div>
                  <div className="font-semibold text-white mb-2">Firestore</div>
                  <div className="text-gray-300">Insight storage & history</div>
                </div>
                <div>
                  <div className="font-semibold text-white mb-2">Vertex AI</div>
                  <div className="text-gray-300">Gemini model hosting</div>
                </div>
              </div>
            </div>
          </div>
        </TerminalOutput>
      );
    }
  }
];
