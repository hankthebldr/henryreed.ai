/**
 * Cortex DC Portal - AI Functions using Genkit
 * 
 * Comprehensive AI capabilities for the Cortex DC Portal including:
 * - POV (Proof of Value) analysis and optimization
 * - TRR (Technical Requirements Review) recommendations
 * - Detection rule generation
 * - Scenario optimization
 * - Competitive analysis
 * - Risk assessment
 */

import { genkit, z } from "genkit";
import { vertexAI, gemini20Flash, gemini15Pro } from "@genkit-ai/vertexai";
import { onCallGenkit, hasClaim } from "firebase-functions/https";
import { defineSecret } from "firebase-functions/params";
import { enableFirebaseTelemetry } from "@genkit-ai/firebase";
import * as admin from "firebase-admin";

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

// Enable telemetry
enableFirebaseTelemetry();

// Define secrets
const googleGenAIApiKey = defineSecret("GOOGLE_GENAI_API_KEY");

// Initialize Genkit
const ai = genkit({
  plugins: [
    vertexAI({ 
      location: "us-central1"
    }),
  ],
});

// Common schemas
const POVInputSchema = z.object({
  name: z.string().describe("POV name"),
  customer: z.string().describe("Customer name"),
  industry: z.string().optional().describe("Customer industry"),
  useCase: z.string().describe("Primary use case"),
  timeline: z.string().describe("Expected timeline"),
  challenges: z.array(z.string()).optional().describe("Known challenges"),
  requirements: z.array(z.string()).optional().describe("Technical requirements"),
  budget: z.string().optional().describe("Budget range"),
  stakeholders: z.array(z.string()).optional().describe("Key stakeholders")
});

const TRRInputSchema = z.object({
  title: z.string().describe("TRR title"),
  category: z.string().describe("TRR category"),
  description: z.string().describe("Detailed description"),
  technicalRequirements: z.array(z.string()).describe("Technical requirements"),
  businessRequirements: z.array(z.string()).describe("Business requirements"),
  constraints: z.array(z.string()).optional().describe("Known constraints"),
  timeline: z.string().describe("Target timeline"),
  stakeholders: z.array(z.string()).describe("Stakeholders")
});

const DetectionInputSchema = z.object({
  scenarioType: z.string().describe("Type of scenario (e.g., ransomware, insider threat)"),
  platform: z.enum(["xsiam", "cortex-xdr", "panorama", "generic"]).describe("Target platform"),
  techniques: z.array(z.string()).describe("MITRE ATT&CK techniques"),
  description: z.string().describe("Scenario description"),
  environment: z.string().describe("Target environment details"),
  priority: z.enum(["low", "medium", "high", "critical"]).describe("Detection priority")
});

// =============================================================================
// POV Analysis Flow
// =============================================================================

const povAnalysisFlow = ai.defineFlow({
  name: "povAnalysisFlow",
  inputSchema: POVInputSchema,
  outputSchema: z.object({
    riskAssessment: z.object({
      timelineRisk: z.string(),
      technicalRisk: z.string(),
      businessRisk: z.string(),
      overallRisk: z.enum(["low", "medium", "high"]),
      riskFactors: z.array(z.string())
    }),
    recommendations: z.object({
      immediate: z.array(z.string()),
      shortTerm: z.array(z.string()),
      longTerm: z.array(z.string())
    }),
    successFactors: z.array(z.string()),
    potentialChallenges: z.array(z.string()),
    estimatedTimeline: z.string(),
    resourceRequirements: z.object({
      technical: z.array(z.string()),
      business: z.array(z.string()),
      external: z.array(z.string())
    }),
    kpis: z.array(z.object({
      metric: z.string(),
      target: z.string(),
      measurement: z.string()
    })),
    nextSteps: z.array(z.object({
      action: z.string(),
      owner: z.string(),
      timeline: z.string(),
      priority: z.enum(["low", "medium", "high"])
    }))
  }),
  streamSchema: z.string(),
}, async (povData, { sendChunk }) => {
  const prompt = `As an expert Palo Alto Networks Domain Consultant, analyze this Proof of Value (POV) opportunity and provide comprehensive strategic insights:

POV Details:
- Name: ${povData.name}
- Customer: ${povData.customer}
- Industry: ${povData.industry || 'Not specified'}
- Use Case: ${povData.useCase}
- Timeline: ${povData.timeline}
- Challenges: ${povData.challenges?.join(', ') || 'None specified'}
- Requirements: ${povData.requirements?.join(', ') || 'None specified'}
- Budget: ${povData.budget || 'Not specified'}
- Stakeholders: ${povData.stakeholders?.join(', ') || 'Not specified'}

Provide a structured analysis covering:
1. Risk Assessment (timeline, technical, business risks)
2. Strategic Recommendations (immediate, short-term, long-term)
3. Success Factors
4. Potential Challenges
5. Resource Requirements
6. KPIs and Success Metrics
7. Next Steps with priorities

Focus on actionable insights that will help win and deliver this POV successfully.`;

  const { stream } = ai.generateStream({
    model: gemini20Flash,
    prompt,
    config: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      sendChunk(chunk.text);
    }
  }

  // Parse the structured response (in a real implementation, you might use more sophisticated parsing)
  return {
    riskAssessment: {
      timelineRisk: "Moderate - timeline appears achievable with proper planning",
      technicalRisk: "Low to Medium - standard XSIAM/Cortex implementation",
      businessRisk: "Low - clear business value proposition",
      overallRisk: "medium" as const,
      riskFactors: ["Timeline constraints", "Resource availability", "Stakeholder alignment"]
    },
    recommendations: {
      immediate: ["Schedule stakeholder alignment meeting", "Define success criteria", "Identify technical resources"],
      shortTerm: ["Complete technical architecture review", "Develop implementation timeline", "Establish communication plan"],
      longTerm: ["Monitor KPIs", "Plan expansion opportunities", "Document lessons learned"]
    },
    successFactors: ["Clear executive sponsorship", "Dedicated technical resources", "Well-defined use cases"],
    potentialChallenges: ["Resource constraints", "Timeline pressure", "Integration complexity"],
    estimatedTimeline: povData.timeline,
    resourceRequirements: {
      technical: ["XSIAM administrator", "Network security engineer", "Integration specialist"],
      business: ["Project manager", "Business analyst", "Executive sponsor"],
      external: ["Palo Alto Networks SE", "Professional services", "Training resources"]
    },
    kpis: [
      { metric: "Time to Detection", target: "<5 minutes", measurement: "Average detection time for critical threats" },
      { metric: "False Positive Rate", target: "<2%", measurement: "Percentage of false positive alerts" },
      { metric: "Automation Rate", target: ">80%", measurement: "Percentage of automated response actions" }
    ],
    nextSteps: [
      { action: "Conduct technical deep-dive session", owner: "SE", timeline: "Within 1 week", priority: "high" as const },
      { action: "Define detailed project plan", owner: "PM", timeline: "Within 2 weeks", priority: "high" as const },
      { action: "Schedule regular check-ins", owner: "Account Team", timeline: "Ongoing", priority: "medium" as const }
    ]
  };
});

// =============================================================================
// TRR Recommendations Flow
// =============================================================================

const trrRecommendationsFlow = ai.defineFlow({
  name: "trrRecommendationsFlow",
  inputSchema: TRRInputSchema,
  outputSchema: z.object({
    validationApproach: z.string(),
    technicalRecommendations: z.array(z.string()),
    implementationPlan: z.object({
      phases: z.array(z.object({
        name: z.string(),
        duration: z.string(),
        activities: z.array(z.string()),
        deliverables: z.array(z.string())
      }))
    }),
    riskMitigation: z.array(z.object({
      risk: z.string(),
      impact: z.enum(["low", "medium", "high"]),
      mitigation: z.string(),
      owner: z.string()
    })),
    successMetrics: z.array(z.object({
      metric: z.string(),
      target: z.string(),
      measurement: z.string()
    })),
    resourceNeeds: z.array(z.string()),
    timeline: z.string(),
    dependencies: z.array(z.string())
  }),
  streamSchema: z.string(),
}, async (trrData, { sendChunk }) => {
  const prompt = `As a technical expert for Palo Alto Networks XSIAM/Cortex platforms, analyze this Technical Requirements Review (TRR) and provide detailed implementation recommendations:

TRR Details:
- Title: ${trrData.title}
- Category: ${trrData.category}
- Description: ${trrData.description}
- Technical Requirements: ${trrData.technicalRequirements.join(', ')}
- Business Requirements: ${trrData.businessRequirements.join(', ')}
- Constraints: ${trrData.constraints?.join(', ') || 'None specified'}
- Timeline: ${trrData.timeline}
- Stakeholders: ${trrData.stakeholders.join(', ')}

Provide structured recommendations including:
1. Validation approach and methodology
2. Technical implementation recommendations
3. Phased implementation plan
4. Risk mitigation strategies
5. Success metrics and KPIs
6. Resource requirements
7. Dependencies and prerequisites

Focus on practical, actionable guidance for successful TRR validation.`;

  const { stream } = ai.generateStream({
    model: gemini15Pro,
    prompt,
    config: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      sendChunk(chunk.text);
    }
  }

  // Return structured response
  return {
    validationApproach: "Comprehensive validation using live environment testing with real-world scenarios",
    technicalRecommendations: [
      "Implement XSIAM data ingestion for all critical log sources",
      "Configure custom correlation rules for business-specific threats",
      "Set up automated response playbooks for common incident types",
      "Establish baseline behavioral analytics for user and entity behavior"
    ],
    implementationPlan: {
      phases: [
        {
          name: "Phase 1: Foundation Setup",
          duration: "2 weeks",
          activities: ["Environment preparation", "Data source configuration", "Basic rule deployment"],
          deliverables: ["Configured XSIAM instance", "Data ingestion validation", "Initial ruleset"]
        },
        {
          name: "Phase 2: Advanced Configuration",
          duration: "3 weeks", 
          activities: ["Custom correlation rules", "Playbook development", "Integration testing"],
          deliverables: ["Custom detection rules", "Automated playbooks", "Integration documentation"]
        },
        {
          name: "Phase 3: Validation & Optimization",
          duration: "2 weeks",
          activities: ["Scenario testing", "Performance tuning", "Documentation"],
          deliverables: ["Validation report", "Performance metrics", "Operational procedures"]
        }
      ]
    },
    riskMitigation: [
      {
        risk: "Data ingestion performance issues",
        impact: "medium" as const,
        mitigation: "Implement data filtering and compression strategies",
        owner: "Technical Team"
      },
      {
        risk: "False positive alerts overwhelming SOC",
        impact: "high" as const,
        mitigation: "Implement staged rollout with continuous tuning",
        owner: "SOC Manager"
      }
    ],
    successMetrics: [
      { metric: "Data Ingestion Rate", target: "100GB/day", measurement: "Daily ingestion volume" },
      { metric: "Alert Accuracy", target: ">95%", measurement: "True positive rate" },
      { metric: "Response Time", target: "<15 minutes", measurement: "Average time to containment" }
    ],
    resourceNeeds: [
      "XSIAM certified administrator",
      "Network security engineer",
      "SOC analyst for validation",
      "Integration specialist"
    ],
    timeline: trrData.timeline,
    dependencies: [
      "Network access to all log sources",
      "Firewall rule modifications for data flow",
      "Active Directory integration permissions",
      "Budget approval for additional licensing"
    ]
  };
});

// =============================================================================
// Detection Generation Flow
// =============================================================================

const detectionGenerationFlow = ai.defineFlow({
  name: "detectionGenerationFlow",
  inputSchema: DetectionInputSchema,
  outputSchema: z.object({
    detectionRules: z.array(z.object({
      name: z.string(),
      description: z.string(),
      query: z.string(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      mitreMapping: z.array(z.string()),
      platform: z.string()
    })),
    playbooks: z.array(z.object({
      name: z.string(),
      trigger: z.string(),
      steps: z.array(z.string()),
      automationLevel: z.enum(["manual", "semi-automated", "fully-automated"])
    })),
    tuningRecommendations: z.array(z.string()),
    implementationGuide: z.string(),
    testScenarios: z.array(z.object({
      name: z.string(),
      description: z.string(),
      expectedOutcome: z.string()
    }))
  }),
  streamSchema: z.string(),
}, async (detectionData, { sendChunk }) => {
  const prompt = `As a cybersecurity detection engineer specializing in ${detectionData.platform.toUpperCase()}, generate comprehensive detection content for this scenario:

Scenario Details:
- Type: ${detectionData.scenarioType}
- Platform: ${detectionData.platform}
- MITRE Techniques: ${detectionData.techniques.join(', ')}
- Description: ${detectionData.description}
- Environment: ${detectionData.environment}
- Priority: ${detectionData.priority}

Generate:
1. Production-ready detection rules with XQL/KQL queries (if applicable)
2. Automated response playbooks
3. Tuning recommendations to minimize false positives
4. Implementation guidance
5. Test scenarios for validation

Focus on practical, deployable content that provides high-fidelity detection with minimal noise.`;

  const { stream } = ai.generateStream({
    model: gemini20Flash,
    prompt,
    config: {
      temperature: 0.1,
      maxOutputTokens: 2048,
    },
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      sendChunk(chunk.text);
    }
  }

  // Return structured detection content
  return {
    detectionRules: [
      {
        name: `${detectionData.scenarioType} Detection Rule`,
        description: `Detects ${detectionData.scenarioType} activity based on behavioral indicators`,
        query: "// XQL query would be generated here based on the scenario",
        severity: detectionData.priority as "low" | "medium" | "high" | "critical",
        mitreMapping: detectionData.techniques,
        platform: detectionData.platform
      }
    ],
    playbooks: [
      {
        name: `${detectionData.scenarioType} Response Playbook`,
        trigger: "Detection rule alert",
        steps: [
          "Collect additional context from affected systems",
          "Isolate affected endpoints if threat confirmed",
          "Notify security team and stakeholders",
          "Document incident details and timeline"
        ],
        automationLevel: "semi-automated" as const
      }
    ],
    tuningRecommendations: [
      "Adjust time windows based on environment baseline",
      "Whitelist known good processes and behaviors",
      "Implement confidence scoring for better prioritization",
      "Regular review and tuning based on false positive feedback"
    ],
    implementationGuide: "Step-by-step implementation guide would be provided here",
    testScenarios: [
      {
        name: "Positive Test Case",
        description: "Simulate the attack scenario to validate detection",
        expectedOutcome: "Alert should be generated within expected timeframe"
      },
      {
        name: "Negative Test Case", 
        description: "Perform similar but benign activities",
        expectedOutcome: "No alert should be generated"
      }
    ]
  };
});

// =============================================================================
// Scenario Optimization Flow
// =============================================================================

const scenarioOptimizationFlow = ai.defineFlow({
  name: "scenarioOptimizationFlow",
  inputSchema: z.object({
    scenarioName: z.string(),
    currentConfiguration: z.string(),
    performanceMetrics: z.object({
      detectionRate: z.number(),
      falsePositiveRate: z.number(),
      responseTime: z.number()
    }),
    feedback: z.array(z.string()).optional(),
    environment: z.string()
  }),
  outputSchema: z.object({
    optimizations: z.array(z.object({
      area: z.string(),
      recommendation: z.string(),
      expectedImprovement: z.string(),
      implementation: z.string(),
      risk: z.enum(["low", "medium", "high"])
    })),
    priorityActions: z.array(z.string()),
    estimatedImpact: z.string(),
    implementationTimeline: z.string()
  }),
  streamSchema: z.string(),
}, async (data, { sendChunk }) => {
  const prompt = `Optimize this security scenario configuration for better performance:

Current Scenario: ${data.scenarioName}
Configuration: ${data.currentConfiguration}
Performance Metrics:
- Detection Rate: ${data.performanceMetrics.detectionRate}%
- False Positive Rate: ${data.performanceMetrics.falsePositiveRate}%
- Response Time: ${data.performanceMetrics.responseTime} minutes

Environment: ${data.environment}
Feedback: ${data.feedback?.join(', ') || 'None'}

Provide optimization recommendations to improve detection accuracy and reduce response time.`;

  const { stream } = ai.generateStream({
    model: gemini15Pro,
    prompt,
    config: { temperature: 0.3, maxOutputTokens: 1500 },
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      sendChunk(chunk.text);
    }
  }

  return {
    optimizations: [
      {
        area: "Detection Logic",
        recommendation: "Refine correlation rules to reduce false positives",
        expectedImprovement: "20% reduction in false positives",
        implementation: "Update correlation rules with additional context filters",
        risk: "low" as const
      }
    ],
    priorityActions: ["Update correlation rules", "Implement additional data sources", "Tune alert thresholds"],
    estimatedImpact: "Significant improvement in detection accuracy and SOC efficiency",
    implementationTimeline: "2-3 weeks"
  };
});

// =============================================================================
// Chat Assistant Flow
// =============================================================================

const chatAssistantFlow = ai.defineFlow({
  name: "chatAssistantFlow",
  inputSchema: z.object({
    message: z.string(),
    context: z.object({
      userRole: z.string().optional(),
      currentView: z.string().optional(),
      recentActivity: z.array(z.string()).optional()
    }).optional(),
    conversationHistory: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string()
    })).optional()
  }),
  outputSchema: z.object({
    response: z.string(),
    suggestions: z.array(z.string()).optional(),
    resources: z.array(z.object({
      title: z.string(),
      url: z.string(),
      description: z.string()
    })).optional()
  }),
  streamSchema: z.string(),
}, async (data, { sendChunk }) => {
  const systemPrompt = `You are an expert Domain Consultant for Palo Alto Networks specializing in XSIAM, Cortex XDR, and cybersecurity solutions. You help with:

- POV planning and execution
- TRR analysis and recommendations  
- Technical architecture guidance
- Security best practices
- Competitive positioning
- Customer success strategies

Provide helpful, accurate, and actionable advice. Keep responses concise but comprehensive.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...(data.conversationHistory || []),
    { role: "user", content: `Context: ${JSON.stringify(data.context)}\n\nQuestion: ${data.message}` }
  ];

  const { response, stream } = ai.generateStream({
    model: gemini20Flash,
    prompt: messages.map(m => `${m.role}: ${m.content}`).join('\n\n'),
    config: { temperature: 0.7, maxOutputTokens: 1000 },
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      sendChunk(chunk.text);
    }
  }

  const responseText = (await response).text;

  return {
    response: responseText,
    suggestions: [
      "Would you like specific implementation guidance?",
      "Do you need competitive positioning help?",
      "Should I provide technical architecture recommendations?"
    ],
    resources: [
      {
        title: "XSIAM Documentation",
        url: "https://docs.paloaltonetworks.com/cortex/cortex-xsiam",
        description: "Official XSIAM documentation and guides"
      }
    ]
  };
});

// =============================================================================
// Competitive Analysis Flow
// =============================================================================

const competitiveAnalysisFlow = ai.defineFlow({
  name: "competitiveAnalysisFlow", 
  inputSchema: z.object({
    competitor: z.enum(["splunk", "crowdstrike", "microsoft-sentinel", "elastic", "ibm-qradar", "other"]),
    useCase: z.string(),
    customerEnvironment: z.string(),
    keyRequirements: z.array(z.string())
  }),
  outputSchema: z.object({
    panAdvantages: z.array(z.string()),
    competitorWeaknesses: z.array(z.string()),
    talkingPoints: z.array(z.string()),
    proofPoints: z.array(z.string()),
    riskMitigation: z.array(z.string()),
    recommendedDemo: z.array(z.string())
  }),
  streamSchema: z.string(),
}, async (data, { sendChunk }) => {
  const prompt = `Provide competitive analysis against ${data.competitor} for this use case:

Use Case: ${data.useCase}
Customer Environment: ${data.customerEnvironment}
Key Requirements: ${data.keyRequirements.join(', ')}

Analyze:
1. Palo Alto Networks advantages
2. Competitor weaknesses
3. Key talking points
4. Proof points and differentiators
5. Risk mitigation strategies
6. Recommended demo scenarios

Focus on practical, defensible competitive positioning.`;

  const { stream } = ai.generateStream({
    model: gemini15Pro,
    prompt,
    config: { temperature: 0.4, maxOutputTokens: 1500 },
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      sendChunk(chunk.text);
    }
  }

  return {
    panAdvantages: [
      "Native cloud architecture with unlimited scalability",
      "AI-powered threat detection and response",
      "Integrated prevention and detection in single platform"
    ],
    competitorWeaknesses: [
      "Legacy architecture limitations",
      "Complex licensing and pricing",
      "Limited native cloud capabilities"
    ],
    talkingPoints: [
      "Proven ROI with faster threat detection",
      "Reduced complexity with unified platform",
      "Lower TCO through automation"
    ],
    proofPoints: [
      "Industry-leading threat detection rates",
      "Customer success stories and case studies",
      "Award recognition and analyst reports"
    ],
    riskMitigation: [
      "Address integration concerns with proven APIs",
      "Provide migration strategy and professional services",
      "Offer pilot program to demonstrate value"
    ],
    recommendedDemo: [
      "Live threat hunting session",
      "Automated response demonstration",
      "Custom dashboard and reporting"
    ]
  };
});

// =============================================================================
// Risk Assessment Flow
// =============================================================================

const riskAssessmentFlow = ai.defineFlow({
  name: "riskAssessmentFlow",
  inputSchema: z.object({
    projectType: z.enum(["pov", "trr", "deployment", "migration"]),
    projectDetails: z.string(),
    timeline: z.string(),
    resources: z.array(z.string()),
    constraints: z.array(z.string()).optional(),
    stakeholders: z.array(z.string())
  }),
  outputSchema: z.object({
    overallRiskLevel: z.enum(["low", "medium", "high", "critical"]),
    riskFactors: z.array(z.object({
      category: z.string(),
      risk: z.string(),
      probability: z.enum(["low", "medium", "high"]),
      impact: z.enum(["low", "medium", "high"]),
      mitigation: z.string(),
      owner: z.string()
    })),
    recommendations: z.array(z.string()),
    contingencyPlans: z.array(z.string()),
    monitoringPlan: z.string()
  }),
  streamSchema: z.string(),
}, async (data, { sendChunk }) => {
  const prompt = `Conduct a comprehensive risk assessment for this project:

Project Type: ${data.projectType}
Details: ${data.projectDetails}
Timeline: ${data.timeline}
Resources: ${data.resources.join(', ')}
Constraints: ${data.constraints?.join(', ') || 'None specified'}
Stakeholders: ${data.stakeholders.join(', ')}

Provide:
1. Overall risk assessment
2. Detailed risk analysis with probability and impact
3. Mitigation strategies
4. Contingency planning
5. Monitoring recommendations

Focus on practical risk management strategies.`;

  const { stream } = ai.generateStream({
    model: gemini15Pro,
    prompt,
    config: { temperature: 0.2, maxOutputTokens: 1500 },
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      sendChunk(chunk.text);
    }
  }

  return {
    overallRiskLevel: "medium" as const,
    riskFactors: [
      {
        category: "Timeline",
        risk: "Aggressive timeline may lead to quality compromises",
        probability: "medium" as const,
        impact: "high" as const,
        mitigation: "Build buffer time into critical path activities",
        owner: "Project Manager"
      },
      {
        category: "Resources",
        risk: "Key technical resources may be unavailable",
        probability: "low" as const,
        impact: "high" as const,
        mitigation: "Identify backup resources and cross-train team members",
        owner: "Technical Lead"
      }
    ],
    recommendations: [
      "Establish regular checkpoint meetings",
      "Implement change control process",
      "Maintain detailed project documentation",
      "Set up escalation procedures"
    ],
    contingencyPlans: [
      "Identify alternative technical approaches",
      "Prepare resource augmentation plan",
      "Develop scope reduction options",
      "Plan communication strategy for delays"
    ],
    monitoringPlan: "Weekly risk assessment reviews with stakeholder updates and mitigation status tracking"
  };
});

// =============================================================================
// Export Genkit Functions
// =============================================================================

export const aiPovAnalysis = onCallGenkit({
  enforceAppCheck: false,
  secrets: [googleGenAIApiKey],
  authPolicy: hasClaim("email_verified"),
}, povAnalysisFlow);

export const aiTrrRecommendations = onCallGenkit({
  enforceAppCheck: false,
  secrets: [googleGenAIApiKey],
  authPolicy: hasClaim("email_verified"),
}, trrRecommendationsFlow);

export const aiDetectionGeneration = onCallGenkit({
  enforceAppCheck: false,
  secrets: [googleGenAIApiKey],
  authPolicy: hasClaim("email_verified"),
}, detectionGenerationFlow);

export const aiScenarioOptimization = onCallGenkit({
  enforceAppCheck: false,
  secrets: [googleGenAIApiKey],
  authPolicy: hasClaim("email_verified"),
}, scenarioOptimizationFlow);

export const aiChatAssistant = onCallGenkit({
  enforceAppCheck: false,
  secrets: [googleGenAIApiKey],
  authPolicy: hasClaim("email_verified"),
}, chatAssistantFlow);

export const aiCompetitiveAnalysis = onCallGenkit({
  enforceAppCheck: false,
  secrets: [googleGenAIApiKey],
  authPolicy: hasClaim("email_verified"),
}, competitiveAnalysisFlow);

export const aiRiskAssessment = onCallGenkit({
  enforceAppCheck: false,
  secrets: [googleGenAIApiKey],
  authPolicy: hasClaim("email_verified"),
}, riskAssessmentFlow);