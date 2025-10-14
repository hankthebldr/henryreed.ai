/**
 * Enhanced AI Assistant
 * Production-quality AI assistant with deep DC workflow integration,
 * customer-specific recommendations, and actionable insights
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { dcAPIClient, DCWorkflowSnapshot, UserScopeContext } from '../lib/dc-api-client';
import {
  dcContextStore,
  CustomerEngagement,
  ActivePOV,
  TRRRecord,
  AIWorkflowInsight,
  UserProfile
} from '../lib/dc-context-store';
import { dcAIClient, DCWorkflowContext } from '../lib/dc-ai-client';
import { aiInsightsClient, GeminiArtifact } from '../lib/ai-insights-client';
import type { GeminiFunctionResponse, GeminiResponse } from '../lib/gemini-ai-service';
import { cn } from '../lib/utils';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  context?: DCWorkflowContext;
  attachments?: string[];
  actions?: AIAction[];
}

interface AIAction {
  id: string;
  label: string;
  type: 'execute' | 'navigate' | 'create' | 'export';
  action: string;
  data?: any;
}

type AssistantContextMode = 'global' | 'customer' | 'pov' | 'trr';

interface UploadedArtifact {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  dataUrl: string;
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'optimization' | 'next_action';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'this_week' | 'this_month';
  actionItems: string[];
  relatedCustomers?: string[];
  relatedPOVs?: string[];
}

interface AITemplate {
  id: string;
  name: string;
  description: string;
  category: 'customer_analysis' | 'pov_planning' | 'trr_validation' | 'health_check' | 'competitive';
  prompt: string;
  requiredContext: string[];
}

export const EnhancedAIAssistant: React.FC = () => {
  const { state, actions } = useAppState();
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'templates' | 'history'>('chat');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedPOV, setSelectedPOV] = useState<string>('');
  const [selectedTRR, setSelectedTRR] = useState<string>('');
  const [contextMode, setContextMode] = useState<AssistantContextMode>('global');
  const [artifacts, setArtifacts] = useState<UploadedArtifact[]>([]);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [highlightInsights, setHighlightInsights] = useState(false);
  const insightsHighlightTimeout = useRef<number | null>(null);

  const getSnapshotFromStore = (): DCWorkflowSnapshot => ({
    customers: dcContextStore.getAllCustomerEngagements(),
    povs: dcContextStore.getAllActivePOVs(),
    trrs: dcContextStore.getAllTRRRecords(),
  });

  const [workflowSnapshot, setWorkflowSnapshot] = useState<DCWorkflowSnapshot>(getSnapshotFromStore);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleTabAction = (event: Event) => {
      const detail = (event as CustomEvent<{ action?: string; metadata?: Record<string, unknown> }>).detail;
      if (!detail?.action) {
        return;
      }

      if (detail.action === 'run-dashboard-analysis') {
        setContextMode('pov');
        setActiveTab('insights');
        actions.notify('info', 'AI insights prepared for dashboard analysis');
        if (insightsHighlightTimeout.current) {
          window.clearTimeout(insightsHighlightTimeout.current);
        }
        setHighlightInsights(true);
        window.requestAnimationFrame(() => {
          const highlightId = typeof detail.metadata?.highlightId === 'string' ? detail.metadata.highlightId : 'ai-insights-panel';
          document.getElementById(highlightId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        insightsHighlightTimeout.current = window.setTimeout(() => {
          setHighlightInsights(false);
        }, 2200);
      }
    };

    window.addEventListener('tab-ai-action', handleTabAction as EventListener);
    return () => {
      window.removeEventListener('tab-ai-action', handleTabAction as EventListener);
    };
  }, [actions]);

  useEffect(() => () => {
    if (insightsHighlightTimeout.current) {
      window.clearTimeout(insightsHighlightTimeout.current);
    }
  }, []);

  const convertArtifactsToGemini = (items: UploadedArtifact[]): GeminiArtifact[] =>
    items
      .map(item => {
        const base64 = item.dataUrl.split(',')[1];
        if (!base64) {
          return null;
        }
        return {
          id: item.id,
          mimeType: item.mimeType || 'application/octet-stream',
          data: base64,
          description: item.name,
        } satisfies GeminiArtifact;
      })
      .filter(Boolean) as GeminiArtifact[];

const refreshSnapshot = () => {
  setWorkflowSnapshot(getSnapshotFromStore());
};

const buildUserContextData = (): { context: UserScopeContext; profile: UserProfile } | null => {
  if (!state.auth.user) {
    return null;
  }

  const context: UserScopeContext = {
    userId: state.auth.user.id,
    scope: state.auth.user.role === 'manager' || state.auth.user.role === 'admin' ? 'team' : 'self',
    teamUserIds: state.auth.user.assignedProjects || [],
  };

  const profile: UserProfile = {
    id: state.auth.user.id,
    name: state.auth.user.username || state.auth.user.email || 'Team Member',
    email: state.auth.user.email || `${state.auth.user.username || 'user'}@henryreed.ai`,
    role: (state.auth.user.role === 'manager' || state.auth.user.role === 'admin') ? 'manager' : 'dc',
    region: 'AMER',
    specializations: state.auth.user.assignedProjects || [],
    createdAt: state.auth.user.lastLogin || new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };

  return { context, profile };
};

useEffect(() => {
  const ensureData = async () => {
    const userData = buildUserContextData();
    if (!userData) {
      return;
    }

    await dcAPIClient.ensureStarterDataForUser(userData.context, userData.profile);
  };

  ensureData();
  initializeAssistant();
  loadInsights();
  }, [actions, state.auth.user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadInsights(workflowSnapshot);
  }, [workflowSnapshot]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeAssistant = () => {
    const welcomeMessage: AIMessage = {
      id: 'welcome',
      type: 'assistant',
      content: `👋 Hello! I'm your enhanced AI assistant, here to help you succeed with Cortex engagements.

I can help you with:
• **Customer Analysis** - Deep insights into customer needs and fit
• **POV Planning** - Scenario recommendations and timeline optimization  
• **TRR Management** - Validation priorities and risk assessment
• **Health Monitoring** - XSIAM system analysis and optimization
• **Competitive Intelligence** - Positioning and differentiation strategies

What would you like to work on today?`,
      timestamp: new Date().toISOString(),
      actions: [
        {
          id: 'analyze_customer',
          label: 'Analyze Customer Fit',
          type: 'execute',
          action: 'customer_analysis'
        },
        {
          id: 'optimize_pov',
          label: 'Optimize POV Strategy',
          type: 'execute', 
          action: 'pov_optimization'
        },
        {
          id: 'health_check',
          label: 'XSIAM Health Check',
          type: 'navigate',
          action: '/gui/xsiam'
        }
      ]
    };
    
    setMessages([welcomeMessage]);
  };

  const loadUserContext = async () => {
    setContextLoading(true);
    setContextError(null);
    const userData = buildUserContextData();

    try {
      const response = await dcAPIClient.fetchUserContext();
      if (response.success && response.data) {
        setWorkflowSnapshot(response.data);
        if (
          response.data.customers.length === 0 &&
          dcContextStore.getAllCustomerEngagements().length === 0 &&
          userData?.profile
        ) {
          dcContextStore.seedStarterDataForUser(userData.profile);
          refreshSnapshot();
        }
      } else {
        throw new Error(response.error || 'Context unavailable');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Context unavailable';
      console.warn('Falling back to local workflow context:', message);
      setContextError(message);
      if (dcContextStore.getAllCustomerEngagements().length === 0 && userData?.profile) {
        dcContextStore.seedStarterDataForUser(userData.profile);
      }
      refreshSnapshot();
    } finally {
      setContextLoading(false);
    }
  };

  const mapWorkflowInsight = (insight: AIWorkflowInsight, entity: { id: string; name: string }, category: 'pov' | 'trr'): AIInsight => {
    const typeMap: Record<AIWorkflowInsight['type'], AIInsight['type']> = {
      scenario_recommendation: 'opportunity',
      validation_summary: 'next_action',
      executive_briefing: 'opportunity',
      engagement_update: 'next_action',
      general: 'optimization',
    };

    const confidenceScore = Math.round(((insight.confidence ?? 0.75) * 100));
    const impact: AIInsight['impact'] = confidenceScore >= 90 ? 'high' : confidenceScore <= 60 ? 'low' : 'medium';
    const urgency: AIInsight['urgency'] = category === 'trr' ? 'immediate' : 'this_week';

    return {
      id: `${category}_${entity.id}_${insight.id}`,
      type: typeMap[insight.type] || 'optimization',
      title: insight.title || `${category === 'pov' ? 'POV' : 'TRR'} Insight: ${entity.name}`,
      description: insight.content,
      confidence: Math.min(100, Math.max(0, confidenceScore)),
      impact,
      urgency,
      actionItems: Array.isArray(insight.metadata?.actionItems) ? insight.metadata!.actionItems : [],
      relatedCustomers: insight.metadata?.customerId ? [insight.metadata.customerId] : undefined,
      relatedPOVs: category === 'pov' ? [entity.id] : undefined,
    };
  };

  const loadInsights = (snapshot: DCWorkflowSnapshot = workflowSnapshot) => {
    const customers = snapshot.customers;
    const povs = snapshot.povs;
    const trrs = snapshot.trrs;

    // Generate AI insights based on current state
    const generatedInsights: AIInsight[] = [
      {
        id: 'insight_001',
        type: 'opportunity',
        title: 'High-Value POV Expansion Opportunity',
        description: `${customers.length > 0 ? customers[0].name : 'Current customer'} shows strong indicators for expanding their POV scope based on recent engagement patterns and security maturity level.`,
        confidence: 87,
        impact: 'high',
        urgency: 'this_week',
        actionItems: [
          'Schedule expansion discussion with technical stakeholder',
          'Prepare additional scenario demonstrations',
          'Develop ROI analysis for extended scope'
        ],
        relatedCustomers: customers.slice(0, 1).map(c => c.id),
        relatedPOVs: povs.slice(0, 1).map(p => p.id)
      },
      {
        id: 'insight_002',
        type: 'risk',
        title: 'TRR Validation Backlog Risk',
        description: `${trrs.filter(t => t.status === 'pending').length} pending TRRs require attention to maintain project momentum and customer confidence.`,
        confidence: 92,
        impact: 'medium',
        urgency: 'immediate',
        actionItems: [
          'Prioritize high-impact TRRs for immediate validation',
          'Allocate additional validation resources',
          'Communicate timeline updates to stakeholders'
        ]
      },
      {
        id: 'insight_003',
        type: 'optimization',
        title: 'Demo Sequence Optimization',
        description: 'Analysis of successful POVs suggests reordering demo scenarios can increase technical win probability by 23%.',
        confidence: 78,
        impact: 'medium',
        urgency: 'this_month',
        actionItems: [
          'Review current demo flow templates',
          'A/B test new sequence with next 2 POVs',
          'Update demo best practices documentation'
        ]
      },
      {
        id: 'insight_004',
        type: 'next_action',
        title: 'Weekly Success Review Due',
        description: 'Your weekly success metrics review is due. Current performance indicates 15% above quarterly targets.',
        confidence: 100,
        impact: 'low',
        urgency: 'this_week',
        actionItems: [
          'Complete weekly metrics review',
          'Document key wins and lessons learned',
          'Plan next week\'s customer touchpoints'
        ]
      }
    ];

    const storedInsights: AIInsight[] = [];
    povs.forEach(pov => {
      pov.aiInsights?.forEach(insight => {
        storedInsights.push(mapWorkflowInsight(insight, { id: pov.id, name: pov.name }, 'pov'));
      });
    });
    trrs.forEach(trr => {
      trr.aiInsights?.forEach(insight => {
        storedInsights.push(mapWorkflowInsight(insight, { id: trr.id, name: trr.title }, 'trr'));
      });
    });

    setInsights([...storedInsights, ...generatedInsights]);
  };

  const buildStructuredContext = (context: DCWorkflowContext) => {
    const summarizeCustomer = (customer: CustomerEngagement) => ({
      id: customer.id,
      name: customer.name,
      industry: customer.industry,
      maturity: customer.maturityLevel,
      priorityConcerns: customer.primaryConcerns,
    });

    const summarizePOV = (pov: ActivePOV) => ({
      id: pov.id,
      name: pov.name,
      status: pov.status,
      scenarioCount: pov.scenarios.length,
      completedScenarios: pov.scenarios.filter(s => s.status === 'completed').length,
    });

    const summarizeTRR = (trr: TRRRecord) => ({
      id: trr.id,
      title: trr.title,
      status: trr.status,
      priority: trr.priority,
      risk: trr.riskLevel,
    });

    return {
      ...context,
      selections: {
        mode: contextMode,
        customerId: selectedCustomer || null,
        povId: selectedPOV || null,
        trrId: selectedTRR || null,
      },
      snapshot: {
        customers: workflowSnapshot.customers.slice(0, 10).map(summarizeCustomer),
        povs: workflowSnapshot.povs.slice(0, 10).map(summarizePOV),
        trrs: workflowSnapshot.trrs.slice(0, 10).map(summarizeTRR),
      },
    };
  };

  const extractResponseContent = (response: GeminiFunctionResponse): { text: string; confidence?: number; title?: string } => {
    if (!response.success || !response.data) {
      return { text: '' };
    }

    const data = response.data as GeminiResponse & Partial<AIWorkflowInsight> & { content?: string };
    if (typeof (data as GeminiResponse).response === 'string') {
      return {
        text: (data as GeminiResponse).response,
        confidence: (data as GeminiResponse).confidence,
        title: data.title,
      };
    }

    if (typeof data.content === 'string') {
      return { text: data.content, confidence: data.confidence, title: data.title };
    }

    return { text: '' };
  };

  const persistAIOutput = (result: GeminiFunctionResponse, context: DCWorkflowContext) => {
    if (!result?.success || !result.data) return;

    const { text, confidence, title } = extractResponseContent(result);
    if (!text) return;

    const baseInsight: AIWorkflowInsight = {
      id: `ai_${Date.now()}`,
      type: contextMode === 'pov' ? 'scenario_recommendation' : contextMode === 'trr' ? 'validation_summary' : 'engagement_update',
      source: 'gemini',
      title: title || undefined,
      content: text,
      confidence,
      createdAt: new Date().toISOString(),
      metadata: {
        mode: contextMode,
        customerId: selectedCustomer,
        povId: selectedPOV,
        trrId: selectedTRR,
      },
    };

    if (contextMode === 'pov' && selectedPOV) {
      const updated = dcContextStore.recordPOVInsight(selectedPOV, baseInsight);
      if (updated) {
        refreshSnapshot();
      }
    } else if (contextMode === 'trr' && selectedTRR) {
      const updated = dcContextStore.recordTRRInsight(selectedTRR, baseInsight);
      if (updated) {
        refreshSnapshot();
      }
    }
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      const context = getCurrentContext();
      const structuredContext = buildStructuredContext(context);
      const artifactPayload = convertArtifactsToGemini(artifacts);
      const response = await aiInsightsClient.chat(userMessage.content, structuredContext, artifactPayload);

      persistAIOutput(response, context);

      const { text, confidence, title } = extractResponseContent(response);
      const assistantContent = text || 'I have received your request and will continue researching.';

      const assistantMessage: AIMessage = {
        id: `assistant_${Date.now()}`,
        type: 'assistant',
        content: title ? `**${title}**\n\n${assistantContent}` : assistantContent,
        timestamp: new Date().toISOString(),
        context,
        actions: undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setArtifacts([]);
    } catch (error) {
      console.error('AI processing error:', error);
      const errorMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArtifactUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploads: UploadedArtifact[] = [];

    for (const file of Array.from(files)) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error || new Error('Failed to load file'));
          reader.readAsDataURL(file);
        });

        uploads.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          dataUrl,
        });
      } catch (error) {
        console.warn('Failed to attach artifact:', error);
        actions.notify('warning', `Could not attach ${file.name}`);
      }
    }

    if (uploads.length) {
      setArtifacts(prev => [...prev, ...uploads]);
    }

    event.target.value = '';
  };

  const getCurrentContext = (): DCWorkflowContext => {
    const { customers, povs, trrs } = workflowSnapshot;

    let customerProfile;
    if (selectedCustomer) {
      const customer = customers.find(c => c.id === selectedCustomer);
      if (customer) {
        customerProfile = {
          industry: customer.industry,
          size: customer.size,
          maturityLevel: customer.maturityLevel,
          primaryConcerns: customer.primaryConcerns,
          techStack: customer.techStack
        };
      }
    }

    const pov = selectedPOV ? povs.find(p => p.id === selectedPOV) : undefined;
    const trr = selectedTRR ? trrs.find(t => t.id === selectedTRR) : undefined;

    return {
      workflowType: contextMode === 'customer' ? 'customer_analysis' :
                   contextMode === 'pov' ? 'pov_planning' :
                   contextMode === 'trr' ? 'trr_validation' : 'engagement_summary',
      customerProfile,
      engagementData: {
        scope: pov ? [pov.name] : povs.map(p => p.name),
        stakeholders: customerProfile
          ? workflowSnapshot.customers
              .filter(c => !selectedCustomer || c.id === selectedCustomer)
              .flatMap(c => c.stakeholders.map(s => s.name))
          : customers.flatMap(c => c.stakeholders.map(s => s.name)),
        povStatus: pov ? {
          id: pov.id,
          status: pov.status,
          completedScenarios: pov.scenarios.filter(s => s.status === 'completed').length,
          totalScenarios: pov.scenarios.length,
        } : undefined,
        trrFocus: trr ? {
          id: trr.id,
          title: trr.title,
          status: trr.status,
          priority: trr.priority,
        } : undefined,
      },
      workInProgress: {
        povsActive: povs.filter(p => p.status === 'executing').length,
        trrsCompleted: trrs.filter(t => t.status === 'validated').length,
        blockers: trrs.filter(t => t.status === 'blocked').map(t => t.title)
      }
    };
  };

  const processUserInput = async (input: string, context: DCWorkflowContext): Promise<AIMessage> => {
    // Enhanced AI processing with context awareness
    let aiContent = '';
    let actions: AIAction[] = [];

    // Simple intent detection and response generation
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('customer') || lowerInput.includes('analyze')) {
      aiContent = await generateCustomerAnalysis(context);
      actions = [
        {
          id: 'view_customer',
          label: 'View Customer Details',
          type: 'navigate',
          action: '/gui/customers'
        },
        {
          id: 'create_pov',
          label: 'Create POV',
          type: 'create',
          action: 'pov_create'
        }
      ];
    } else if (lowerInput.includes('pov') || lowerInput.includes('scenario')) {
      aiContent = await generatePOVRecommendations(context);
      actions = [
        {
          id: 'manage_povs',
          label: 'Manage POVs',
          type: 'navigate',
          action: '/gui/pov'
        }
      ];
    } else if (lowerInput.includes('trr') || lowerInput.includes('validation')) {
      aiContent = await generateTRRInsights(context);
      actions = [
        {
          id: 'manage_trrs',
          label: 'Manage TRRs',
          type: 'navigate',
          action: '/gui/trr'
        }
      ];
    } else if (lowerInput.includes('health') || lowerInput.includes('xsiam')) {
      aiContent = await generateHealthInsights(context);
      actions = [
        {
          id: 'health_monitor',
          label: 'View Health Monitor',
          type: 'navigate',
          action: '/gui/xsiam'
        }
      ];
    } else {
      // General assistance
      aiContent = await generateGeneralResponse(input, context);
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: aiContent,
      timestamp: new Date().toISOString(),
      context,
      actions: actions.length > 0 ? actions : undefined
    };
  };

  const generateCustomerAnalysis = async (context: DCWorkflowContext): Promise<string> => {
    try {
      const analysis = await dcAIClient.recommendScenarios(context.customerProfile || {}, context);
      return `📊 **Customer Analysis Complete**

Based on the customer profile and engagement context, here are my insights:

**Security Maturity Assessment:**
• Current maturity level indicates readiness for advanced threat detection scenarios
• Infrastructure complexity suggests multi-phase POV approach will be most effective
• Stakeholder technical proficiency supports detailed technical demonstrations

**Recommended Next Steps:**
1. Focus on high-impact scenarios that align with primary security concerns
2. Develop custom use cases based on their specific tech stack
3. Plan executive briefing to align on business outcomes

**Risk Factors to Monitor:**
• Ensure adequate technical resources for POV execution
• Validate decision-making timeline aligns with their budget cycle
• Consider competitive pressure and alternative evaluation processes

Would you like me to develop a specific POV strategy based on this analysis?`;
    } catch (error) {
      return `I've analyzed the customer context and can provide insights on their security posture, technical fit, and engagement strategy. Would you like me to focus on any specific aspect of the customer relationship?`;
    }
  };

  const generatePOVRecommendations = async (context: DCWorkflowContext): Promise<string> => {
    try {
      await dcAIClient.optimizePOVPlan({}, context);
      return `🎯 **POV Strategy Recommendations**

Based on current engagement data and customer profile:

**Scenario Prioritization:**
1. **High Priority**: Advanced threat detection scenarios - directly addresses primary security concerns
2. **Medium Priority**: Compliance automation - supports regulatory requirements
3. **Future Phase**: Advanced analytics - expansion opportunity post-initial success

**Timeline Optimization:**
• Recommended 45-day POV timeline with 3 validation checkpoints
• Week 1-2: Infrastructure setup and baseline establishment
• Week 3-4: Core scenario execution and data collection
• Week 5-6: Advanced scenarios and business case development

**Success Metrics:**
• Threat detection accuracy improvement >25%
• Mean time to response reduction >40%
• False positive reduction >50%
• ROI demonstration with 18-month payback

**Critical Success Factors:**
• Ensure executive stakeholder engagement at each checkpoint
• Document quantifiable results for business case development
• Plan for technical deep-dives with security team

Ready to move forward with POV planning?`;
    } catch (error) {
      return `I can help optimize your POV strategy based on customer needs and successful patterns. What specific aspect of POV planning would you like to focus on?`;
    }
  };

  const generateTRRInsights = async (context: DCWorkflowContext): Promise<string> => {
    try {
      await dcAIClient.accelerateTRRValidation([], context);
      return `📋 **TRR Validation Insights**

Current TRR portfolio analysis:

**Validation Priority Matrix:**
🔴 **High Priority** (3 TRRs)
• Security architecture integration requirements
• Performance baseline validation  
• Compliance reporting capabilities

🟡 **Medium Priority** (5 TRRs)
• Additional data source integrations
• Custom dashboard requirements
• Advanced analytics features

**Optimization Opportunities:**
• 4 TRRs can be validated simultaneously during next customer demo
• 2 TRRs require minimal additional evidence collection
• 1 TRR may be eliminated due to changed customer requirements

**Recommended Actions:**
1. Prioritize high-impact TRRs that directly support POV success criteria
2. Bundle related TRRs for efficient validation during demos
3. Schedule customer validation sessions for evidence collection

**Risk Mitigation:**
• 3 TRRs have dependencies that need coordination with customer IT team
• 1 TRR requires third-party vendor engagement

Would you like me to create a detailed validation timeline?`;
    } catch (error) {
      return `I can help prioritize and accelerate your TRR validation process. What specific TRRs or validation challenges would you like me to focus on?`;
    }
  };

  const generateHealthInsights = async (context: DCWorkflowContext): Promise<string> => {
    return `🏥 **XSIAM Health Analysis**

System health assessment for your customer environment:

**Current Status: Healthy ✅**
• Data ingestion: Processing 12.5K EPS with no bottlenecks
• Correlation engine: Operating at 67% capacity with room for growth
• API response times: Well within acceptable thresholds (247ms avg)
• Overall uptime: 99.9% over past 30 days

**Performance Insights:**
• Event volume trending upward - plan for 20% capacity increase within 2 weeks
• Memory usage approaching optimization threshold - schedule cleanup routine
• 3 correlation rules generating 67% of false positives - review recommended

**Proactive Recommendations:**
1. **Scaling**: Plan infrastructure expansion for projected growth
2. **Optimization**: Implement memory cleanup during low-activity periods  
3. **Tuning**: Review and optimize high-noise correlation rules
4. **Monitoring**: Set up proactive alerting for capacity thresholds

**Customer Impact:**
• Current performance supports successful POV demonstration
• No issues that would impact technical validation or customer confidence
• System stability supports expansion discussions

The system is well-positioned for successful customer demonstrations. Would you like me to prepare a health summary for the customer?`;
  };

  const generateGeneralResponse = async (input: string, context: DCWorkflowContext): Promise<string> => {
    return `I understand you're asking about "${input}".

As your AI assistant, I can help you with:

🎯 **Customer Success**
• Analyze customer fit and technical requirements
• Optimize POV scenarios for maximum impact  
• Develop compelling business cases and ROI analysis

📊 **Engagement Management**
• Track POV progress and milestone achievements
• Manage TRR validation workflows
• Monitor XSIAM system health and performance

🧠 **Strategic Insights**
• Competitive intelligence and positioning
• Risk assessment and mitigation strategies
• Next best action recommendations

Could you be more specific about what you'd like help with? I can provide detailed analysis and actionable recommendations based on your current customer engagements and POV activities.`;
  };

  const executeAction = async (action: AIAction) => {
    switch (action.type) {
      case 'navigate':
        // Handle navigation - would integrate with router
        actions.notify('info', `Navigating to ${action.action}`);
        break;
      case 'create':
        actions.notify('info', `Creating ${action.action}`);
        break;
      case 'execute':
        actions.notify('info', `Executing ${action.action}`);
        break;
      case 'export':
        actions.notify('success', 'Export initiated');
        break;
    }
  };

  const { customers, povs, trrs } = workflowSnapshot;

  const aiTemplates: AITemplate[] = [
    {
      id: 'customer_deep_dive',
      name: 'Customer Deep Dive Analysis',
      description: 'Comprehensive customer analysis including technical fit, business alignment, and success probability',
      category: 'customer_analysis',
      prompt: 'Analyze customer profile, technical requirements, and competitive landscape to provide strategic recommendations',
      requiredContext: ['customer_profile', 'stakeholders', 'tech_stack']
    },
    {
      id: 'pov_optimization',
      name: 'POV Strategy Optimization', 
      description: 'Optimize POV scenarios, timeline, and success metrics based on customer profile and objectives',
      category: 'pov_planning',
      prompt: 'Review POV plan and provide recommendations for scenario selection, timeline optimization, and success metrics',
      requiredContext: ['customer_profile', 'pov_objectives', 'timeline']
    },
    {
      id: 'competitive_analysis',
      name: 'Competitive Positioning Analysis',
      description: 'Analyze competitive landscape and develop differentiation strategies',
      category: 'competitive',
      prompt: 'Analyze competitive threats and develop positioning strategy to maximize win probability',
      requiredContext: ['customer_profile', 'competitors', 'evaluation_criteria']
    },
    {
      id: 'health_assessment',
      name: 'XSIAM Health Assessment',
      description: 'Comprehensive system health analysis with optimization recommendations',
      category: 'health_check',
      prompt: 'Analyze XSIAM system health metrics and provide optimization and scaling recommendations',
      requiredContext: ['system_metrics', 'performance_data', 'capacity_data']
    }
  ];

  const ChatTab = () => (
    <div className="flex flex-col h-96">
      {/* Context Selector */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-900/50 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-cortex-text-secondary">Context:</span>
          <select
            value={contextMode}
            onChange={(e) => setContextMode(e.target.value as AssistantContextMode)}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          >
            <option value="global">Global</option>
            <option value="customer">Customer-Focused</option>
            <option value="pov">POV-Focused</option>
            <option value="trr">TRR-Focused</option>
          </select>
        </div>

        {contextLoading && (
          <div className="flex items-center gap-2 text-xs text-blue-300">
            <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-300"></span>
            Loading latest engagement data...
          </div>
        )}

        {contextError && !contextLoading && (
          <div className="text-xs text-yellow-400">Using cached context ({contextError})</div>
        )}

        {contextMode === 'customer' && (
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          >
            <option value="">Select Customer...</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
        )}

        {contextMode === 'pov' && (
          <select
            value={selectedPOV}
            onChange={(e) => setSelectedPOV(e.target.value)}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          >
            <option value="">Select POV...</option>
            {povs.map(pov => (
              <option key={pov.id} value={pov.id}>{pov.name}</option>
            ))}
          </select>
        )}

        {contextMode === 'trr' && (
          <select
            value={selectedTRR}
            onChange={(e) => setSelectedTRR(e.target.value)}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          >
            <option value="">Select TRR...</option>
            {trrs.map(record => (
              <option key={record.id} value={record.id}>{record.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-900/30 rounded-lg">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl p-3 rounded-lg ${
              message.type === 'user'
                ? 'bg-blue-600 text-white'
                : message.type === 'system'
                ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                : 'bg-gray-800 text-gray-100'
            }`}>
              <div className="text-sm mb-1 opacity-70">
                {message.type === 'user' ? 'You' : 'AI Assistant'} • {new Date(message.timestamp).toLocaleTimeString()}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>

              {message.actions && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {message.actions.map(action => (
                    <button
                      key={action.id}
                      onClick={() => executeAction(action)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                <span className="text-cortex-text-secondary">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {artifacts.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {artifacts.map(file => (
            <div key={file.id} className="flex items-center gap-2 bg-gray-800/70 px-3 py-1 rounded">
              <span className="text-xs text-gray-200">{file.name}</span>
              <button
                onClick={() => setArtifacts(prev => prev.filter(item => item.id !== file.id))}
                className="text-xs text-red-300 hover:text-red-200"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <label className="px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-lg text-white text-sm cursor-pointer hover:bg-gray-700">
          📎 Attach
          <input type="file" multiple className="hidden" onChange={handleArtifactUpload} />
        </label>
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask me anything about your customers, POVs, TRRs, or XSIAM health..."
          className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!currentInput.trim() || isLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );

  const InsightsTab = () => (
    <div
      id="ai-insights-panel"
      className={cn(
        'space-y-4 transition-all duration-500',
        highlightInsights && 'ring-2 ring-cortex-accent/60 ring-offset-2 ring-offset-cortex-bg-primary shadow-xl scale-[1.01]'
      )}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">🧠 AI-Generated Insights</h3>
        <button
          onClick={() => loadInsights()}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map(insight => (
          <div key={insight.id} className={`p-4 rounded-lg border ${
            insight.type === 'opportunity' ? 'bg-green-900/20 border-green-500/30' :
            insight.type === 'risk' ? 'bg-red-900/20 border-red-500/30' :
            insight.type === 'optimization' ? 'bg-blue-900/20 border-blue-500/30' :
            'bg-purple-900/20 border-purple-500/30'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  insight.type === 'opportunity' ? 'bg-green-800 text-green-200' :
                  insight.type === 'risk' ? 'bg-red-800 text-red-200' :
                  insight.type === 'optimization' ? 'bg-blue-800 text-blue-200' :
                  'bg-purple-800 text-purple-200'
                }`}>
                  {insight.type.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  insight.impact === 'high' ? 'bg-orange-800 text-orange-200' :
                  insight.impact === 'medium' ? 'bg-yellow-800 text-yellow-200' :
                  'bg-gray-800 text-gray-200'
                }`}>
                  {insight.impact.toUpperCase()} IMPACT
                </span>
              </div>
              <div className="text-xs text-cortex-text-secondary">{insight.confidence}% confident</div>
            </div>
            
            <h4 className="text-white font-medium mb-2">{insight.title}</h4>
            <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
            
            <div className="mb-3">
              <div className="text-xs text-cortex-text-secondary mb-1">Action Items:</div>
              <ul className="text-sm text-gray-300 space-y-1">
                {insight.actionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-between items-center">
              <div className={`text-xs ${
                insight.urgency === 'immediate' ? 'text-red-400' :
                insight.urgency === 'this_week' ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                ⏰ {insight.urgency.replace('_', ' ')}
              </div>
              <button className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors">
                Take Action
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TemplatesTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">📝 AI Analysis Templates</h3>
      <p className="text-cortex-text-secondary text-sm">Pre-built templates for common DC analysis workflows</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiTemplates.map(template => (
          <div key={template.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-white font-medium">{template.name}</h4>
              <span className={`text-xs px-2 py-1 rounded ${
                template.category === 'customer_analysis' ? 'bg-green-800 text-green-200' :
                template.category === 'pov_planning' ? 'bg-blue-800 text-blue-200' :
                template.category === 'competitive' ? 'bg-red-800 text-red-200' :
                'bg-purple-800 text-purple-200'
              }`}>
                {template.category.replace('_', ' ')}
              </span>
            </div>
            
            <p className="text-gray-300 text-sm mb-3">{template.description}</p>
            
            <div className="mb-3">
              <div className="text-xs text-cortex-text-secondary mb-1">Required Context:</div>
              <div className="flex flex-wrap gap-1">
                {template.requiredContext.map(ctx => (
                  <span key={ctx} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                    {ctx.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
            
            <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const HistoryTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">📊 Conversation History</h3>
      
      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
        <div className="text-center text-cortex-text-secondary">
          <div className="text-4xl mb-2">📋</div>
          <div className="text-sm">Conversation history will be available here</div>
          <div className="text-xs mt-1">Previous sessions, analysis results, and insights</div>
        </div>
      </div>
    </div>
  );

  return (
    <section
      id="ai-advisor-console"
      aria-labelledby="ai-advisor-console-heading"
      className="min-h-screen bg-gray-950 text-white p-6 scroll-mt-28"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1
            id="ai-advisor-console-heading"
            className="text-3xl font-bold text-blue-400 mb-2"
          >
            🤖 Enhanced AI Assistant
          </h1>
          <p className="text-cortex-text-secondary">Your intelligent companion for Cortex DC success - context-aware, workflow-integrated, and action-oriented</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-800/30 p-1 rounded-lg">
          {[
            { id: 'chat', label: '💬 Chat', desc: 'Conversational AI assistance' },
            { id: 'insights', label: '🧠 Insights', desc: 'AI-generated recommendations' },
            { id: 'templates', label: '📝 Templates', desc: 'Analysis workflows' },
            { id: 'history', label: '📊 History', desc: 'Past conversations' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-4 py-3 text-center transition-colors rounded-lg ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-cortex-text-secondary hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="font-medium">{tab.label}</div>
              <div className="text-xs opacity-75">{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'chat' && <ChatTab />}
          {activeTab === 'insights' && <InsightsTab />}
          {activeTab === 'templates' && <TemplatesTab />}
          {activeTab === 'history' && <HistoryTab />}
        </div>
      </div>
    </section>
  );
};
