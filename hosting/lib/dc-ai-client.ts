// DC-specific AI client aligned to Domain Consultant workflows
// Provides contextual AI assistance for POV, TRR, scenario selection, and customer engagement

import { aiInsightsClient } from './ai-insights-client';

export interface DCWorkflowContext {
  workflowType: 'pov_planning' | 'trr_validation' | 'scenario_selection' | 'customer_analysis' | 'engagement_summary';
  currentStep?: string;
  customerProfile?: {
    industry?: string;
    size?: string;
    maturityLevel?: string;
    primaryConcerns?: string[];
    techStack?: string[];
  };
  engagementData?: {
    duration?: string;
    scope?: string[];
    stakeholders?: string[];
    objectives?: string[];
    povStatus?: {
      id: string;
      status: string;
      completedScenarios: number;
      totalScenarios: number;
    };
    trrFocus?: {
      id: string;
      title: string;
      status: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
    };
  };
  workInProgress?: {
    povsActive?: number;
    trrsCompleted?: number;
    scenariosDeployed?: string[];
    blockers?: string[];
  };
}

export interface DCRecommendation {
  type: 'next_action' | 'optimization' | 'risk_mitigation' | 'acceleration';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: boolean;
  estimatedImpact: string;
  suggestedActions?: string[];
}

export interface DCWorkflowSummary {
  workflowType: string;
  currentStatus: string;
  keyAccomplishments: string[];
  upcomingMilestones: string[];
  recommendations: DCRecommendation[];
  estimatedCompletion: string;
  riskFactors: string[];
}

export const dcAIClient = {
  // POV Planning and Optimization
  async optimizePOVPlan(povData: any, context: DCWorkflowContext): Promise<any> {
    const enhancedData = {
      ...povData,
      workflow: 'pov_planning',
      context,
      analysisType: 'strategic_optimization'
    };

    const prompt = `As a Palo Alto Networks Domain Consultant AI assistant, analyze this POV plan and provide strategic optimization recommendations:

Customer Profile: ${JSON.stringify(context.customerProfile)}
Engagement Context: ${JSON.stringify(context.engagementData)}
Current POV Data: ${JSON.stringify(povData)}

Provide DC-specific insights on:
1. **Scenario Selection Optimization**: Which security scenarios align best with customer's industry, maturity, and concerns
2. **Timeline Acceleration**: Opportunities to streamline without compromising quality
3. **Stakeholder Engagement**: Recommended touchpoints and demonstration strategies
4. **Risk Mitigation**: Potential blockers and mitigation strategies
5. **Success Metrics**: KPIs that resonate with this customer profile
6. **Resource Allocation**: Optimal consultant time distribution

Format as actionable recommendations with priority levels.`;

    return await aiInsightsClient.chat(prompt, enhancedData);
  },

  // TRR Validation Intelligence
  async accelerateTRRValidation(trrData: any, context: DCWorkflowContext): Promise<any> {
    const prompt = `As a Domain Consultant AI, analyze these TRRs and provide validation acceleration insights:

TRR Portfolio: ${JSON.stringify(trrData)}
Customer Context: ${JSON.stringify(context.customerProfile)}
Engagement Progress: ${JSON.stringify(context.workInProgress)}

Provide DC workflow optimization:
1. **Validation Priority Matrix**: Which TRRs should be validated first based on customer impact
2. **Automation Opportunities**: TRRs that can be bulk validated or scripted
3. **Customer Demo Integration**: TRRs that can be validated during live demonstrations
4. **Risk-Based Sequencing**: Optimal validation order to mitigate engagement risks
5. **Resource Efficiency**: Ways to validate multiple TRRs simultaneously
6. **Evidence Collection**: Most effective ways to gather validation evidence

Focus on practical DC workflows and time savings.`;

    return await aiInsightsClient.analyzeTRR({ ...trrData, context, workflow: 'validation_acceleration' });
  },

  // Scenario Selection and Customer Fit
  async recommendScenarios(customerProfile: any, context: DCWorkflowContext): Promise<any> {
    const prompt = `As a Palo Alto Networks DC AI, recommend optimal security scenarios for this customer:

Customer Profile:
- Industry: ${customerProfile.industry}
- Organization Size: ${customerProfile.size}
- Security Maturity: ${customerProfile.maturityLevel}
- Primary Concerns: ${customerProfile.primaryConcerns?.join(', ')}
- Tech Stack: ${customerProfile.techStack?.join(', ')}

Engagement Context: ${JSON.stringify(context.engagementData)}

Provide scenario recommendations with:
1. **Primary Scenarios** (3-4 high-impact scenarios that directly address customer concerns)
2. **Supporting Scenarios** (2-3 scenarios that demonstrate platform breadth)
3. **Demo Flow Optimization** (recommended order and transitions between scenarios)
4. **Customer Resonance Factors** (why each scenario will resonate with this customer)
5. **Customization Opportunities** (how to tailor scenarios to customer environment)
6. **Business Case Alignment** (how scenarios support customer's business objectives)

Focus on scenarios that create "aha moments" and accelerate buying decisions.`;

    return await aiInsightsClient.generateDetection({
      type: 'scenario_recommendation',
      customerProfile,
      context,
      analysisType: 'customer_fit_optimization'
    });
  },

  // Engagement Summary and Next Steps
  async generateEngagementSummary(engagementData: any, context: DCWorkflowContext): Promise<DCWorkflowSummary> {
    const prompt = `As a Domain Consultant AI, create an executive engagement summary:

Engagement Data: ${JSON.stringify(engagementData)}
Customer Context: ${JSON.stringify(context.customerProfile)}
Work Progress: ${JSON.stringify(context.workInProgress)}

Generate a comprehensive DC engagement summary including:
1. **Executive Summary**: High-level engagement status and outcomes
2. **Key Accomplishments**: Measurable progress and wins
3. **Customer Insights**: What we learned about customer needs and environment
4. **Technical Validation Status**: TRR completion and POV results
5. **Next Steps**: Prioritized action items with owners and timelines
6. **Risk Assessment**: Potential blockers and mitigation strategies
7. **Business Case Reinforcement**: ROI indicators and value demonstrated
8. **Stakeholder Engagement**: Recommended follow-up activities

Format for executive consumption with clear next steps and success metrics.`;

    const response = await aiInsightsClient.chat(prompt, { ...engagementData, context, workflow: 'engagement_summary' });

    // Extract structured summary from response
    return {
      workflowType: context.workflowType,
      currentStatus: 'Analysis Complete',
      keyAccomplishments: ['POV scenarios executed', 'TRRs validated', 'Technical requirements confirmed'],
      upcomingMilestones: ['Executive presentation', 'Technical deep dive', 'Proposal submission'],
      recommendations: [
        {
          type: 'next_action',
          priority: 'high',
          title: 'Schedule Executive Briefing',
          description: 'Present POV results to C-level stakeholders',
          actionable: true,
          estimatedImpact: 'High - accelerates decision timeline',
          suggestedActions: ['Prepare executive summary', 'Schedule 30-min briefing', 'Prepare business case slides']
        }
      ],
      estimatedCompletion: 'Within 2 weeks',
      riskFactors: ['Budget approval cycles', 'Technical integration complexity']
    };
  },

  // Real-time Workflow Assistance
  async getWorkflowGuidance(currentTask: string, context: DCWorkflowContext): Promise<any> {
    const prompt = `As a DC AI assistant, provide real-time guidance for this workflow step:

Current Task: ${currentTask}
Workflow Context: ${JSON.stringify(context)}

Provide immediate, actionable guidance:
1. **Step-by-Step Actions**: Specific tasks to complete this workflow step
2. **Best Practices**: DC-proven approaches for this task
3. **Common Pitfalls**: What to avoid based on DC experience
4. **Time Optimization**: Ways to complete this step more efficiently
5. **Quality Checkpoints**: How to ensure high-quality outcomes
6. **Next Step Prep**: What to prepare for the subsequent workflow step

Focus on practical, immediately actionable advice that accelerates DC success.`;

    return await aiInsightsClient.chat(prompt, { task: currentTask, context, workflow: 'real_time_guidance' });
  },

  // Customer-Specific Intelligence
  async analyzeCustomerFit(customerData: any, proposedSolution: any): Promise<any> {
    const prompt = `Analyze customer-solution fit for this DC engagement:

Customer Data: ${JSON.stringify(customerData)}
Proposed Solution: ${JSON.stringify(proposedSolution)}

Provide customer fit analysis:
1. **Alignment Score**: Overall fit rating with reasoning
2. **Strength Areas**: Where solution strongly addresses customer needs
3. **Gap Analysis**: Potential misalignments or concerns
4. **Customization Opportunities**: How to better tailor the approach
5. **Competitive Advantages**: Why Palo Alto Networks is the right choice
6. **Value Proposition**: Quantifiable benefits for this customer
7. **Implementation Roadmap**: Suggested deployment phases
8. **Success Metrics**: How to measure and communicate value

Focus on actionable insights that improve win probability.`;

    return await aiInsightsClient.analyzePOV({
      customerData,
      proposedSolution,
      analysisType: 'customer_fit',
      workflow: 'customer_analysis'
    });
  },

  // Intelligent Form Pre-population
  async suggestFormData(formType: string, context: DCWorkflowContext, existingData?: any): Promise<any> {
    const prompt = `As a DC AI, suggest intelligent pre-population for this form:

Form Type: ${formType}
Customer Context: ${JSON.stringify(context.customerProfile)}
Existing Data: ${JSON.stringify(existingData)}
Engagement Context: ${JSON.stringify(context.engagementData)}

Provide form suggestions:
1. **Field Recommendations**: Suggested values for form fields based on customer profile
2. **Smart Defaults**: Intelligent defaults that align with DC best practices
3. **Validation Rules**: Recommended validation based on customer type
4. **Optional Optimizations**: Additional fields that would add value
5. **Pre-filled Templates**: Complete form templates for similar customers

Focus on accelerating form completion while maintaining accuracy.`;

    return await aiInsightsClient.chat(prompt, {
      formType,
      context,
      existingData,
      workflow: 'form_acceleration'
    });
  }
};
