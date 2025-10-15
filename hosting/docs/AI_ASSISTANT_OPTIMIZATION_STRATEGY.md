# AI Assistant Optimization Strategy

## Executive Summary

The current AI Assistant (EnhancedAIAssistant.tsx) requires comprehensive redesign to transform it from a basic chat interface into a guided, workflow-driven AI companion that propagates context-aware prompts behind user selections.

## Current Issues Identified

### 1. **User Experience Problems**
- **Bland Interface**: Gray-scale design doesn't align with Cortex brand (green/accent colors)
- **No Visual Hierarchy**: All elements have similar weight, making it hard to navigate
- **Limited Guidance**: Users must know what to ask rather than being guided through workflows
- **Poor Mobile Responsiveness**: Fixed heights (`h-96`) break on smaller screens

### 2. **Functional Limitations**
- **Manual Context Selection**: Users must manually select context mode/entities
- **No Workflow Automation**: No predefined workflows for common tasks
- **Generic Prompts**: No structured prompt templates based on platform records
- **Missing Integration**: Limited connection to actual platform data (POV, TRR, Customers)

### 3. **Technical Debt**
- **Hardcoded Insights**: Fake/static data instead of real analysis
- **No Prompt Engineering**: Basic string concatenation instead of structured prompts
- **Limited Error Handling**: Generic error messages
- **No Accessibility**: Missing ARIA labels, keyboard navigation

## Optimization Strategy

### Phase 1: Guided Workflow System (PRIORITY)

#### 1.1 Workflow Cards Interface
Replace free-form chat with guided workflow cards:

```typescript
interface GuidedWorkflow {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'customer' | 'pov' | 'trr' | 'health' | 'competitive';
  requiredData: string[];  // What platform records are needed
  steps: WorkflowStep[];
  promptTemplate: string;
  outputFormat: 'analysis' | 'report' | 'recommendations' | 'action_plan';
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  inputType: 'select' | 'multiselect' | 'text' | 'date' | 'number';
  dataSource?: 'customers' | 'povs' | 'trrs' | 'scenarios';
  required: boolean;
  prompt: string;  // Sub-prompt for this step
}
```

**Example Workflows:**
1. **POV Kickoff Assistant**
   - Step 1: Select customer
   - Step 2: Select POV objectives (multiselect)
   - Step 3: Define timeline
   - Step 4: AI generates comprehensive POV plan

2. **TRR Validation Accelerator**
   - Step 1: Select TRR records (multiselect)
   - Step 2: Upload evidence documents
   - Step 3: AI generates validation checklist + risk assessment

3. **Customer Fit Analysis**
   - Step 1: Select customer
   - Step 2: Specify competitive threats
   - Step 3: AI generates fit score + win strategy

4. **Weekly Success Review**
   - Step 1: Select date range
   - Step 2: AI analyzes all POVs/TRRs
   - Step 3: Generate executive summary + next actions

#### 1.2 Context-Aware Prompt Propagation

**Prompt Template Engine:**
```typescript
class PromptBuilder {
  private basePrompt: string;
  private context: Map<string, any>;

  constructor(workflow: GuidedWorkflow) {
    this.basePrompt = workflow.promptTemplate;
    this.context = new Map();
  }

  addContext(key: string, value: any): this {
    this.context.set(key, value);
    return this;
  }

  build(): string {
    let prompt = this.basePrompt;

    // Inject platform records
    if (this.context.has('customer')) {
      const customer = this.context.get('customer');
      prompt += `\n\nCUSTOMER PROFILE:\n`;
      prompt += `- Name: ${customer.name}\n`;
      prompt += `- Industry: ${customer.industry}\n`;
      prompt += `- Maturity: ${customer.maturityLevel}\n`;
      prompt += `- Primary Concerns: ${customer.primaryConcerns.join(', ')}\n`;
      prompt += `- Tech Stack: ${customer.techStack.join(', ')}\n`;
    }

    if (this.context.has('pov')) {
      const pov = this.context.get('pov');
      prompt += `\n\nPOV CONTEXT:\n`;
      prompt += `- Name: ${pov.name}\n`;
      prompt += `- Status: ${pov.status}\n`;
      prompt += `- Scenarios: ${pov.scenarios.length} total, ${pov.scenarios.filter(s => s.status === 'completed').length} completed\n`;
      prompt += `- Timeline: ${pov.estimatedDays} days\n`;
    }

    // Add step-specific context
    workflow.steps.forEach(step => {
      if (this.context.has(step.id)) {
        prompt += `\n\n${step.prompt}: ${this.context.get(step.id)}\n`;
      }
    });

    return prompt;
  }
}
```

**Example Propagated Prompt:**
```
USER SELECTION: POV Kickoff Assistant > Acme Corp > Container Security

GENERATED PROMPT (sent to Gemini):
---
You are an expert Palo Alto Networks Domain Consultant AI assistant. Generate a comprehensive POV plan.

CUSTOMER PROFILE:
- Name: Acme Corp
- Industry: Financial Services
- Maturity: Advanced (Level 4)
- Primary Concerns: Container security, Cloud workload protection, Compliance (PCI-DSS)
- Tech Stack: Kubernetes, AWS EKS, Docker, Jenkins, Terraform

POV CONTEXT:
- Objective: Container Security POV
- Timeline: 45 days
- Key Stakeholders: CISO, Cloud Security Team, DevOps Lead
- Success Criteria:
  * Demonstrate container runtime protection
  * Show vulnerability scanning integration
  * Prove compliance reporting capabilities

REQUIREMENTS:
1. Recommend 5-7 high-impact scenarios that align with Financial Services compliance
2. Provide week-by-week execution plan
3. Define quantifiable success metrics
4. Identify potential risks and mitigation strategies
5. Generate executive briefing template

FORMAT:
Provide response in structured markdown with:
- Executive Summary (3-5 sentences)
- Recommended Scenarios (with MITRE ATT&CK mapping)
- Weekly Execution Plan
- Success Metrics Dashboard
- Risk Assessment Matrix
- Next Steps Checklist
---
```

### Phase 2: Modern UI/UX Redesign

#### 2.1 Visual Design Updates

**Color Palette:**
- Primary: Cortex Green (`#00CC66`)
- Secondary: Cortex Accent (`#3B82F6`)
- Backgrounds: Layered cards with backdrop blur
- Status Indicators: Color-coded by workflow type

**Component Structure:**
```
┌─────────────────────────────────────────────────────┐
│  🤖 AI Assistant                    [Context: POV]  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  │
│  │ POV    │  │ TRR    │  │Customer│  │ Health │  │
│  │Kickoff │  │Validate│  │AnalysIS│  │ Check  │  │
│  └────────┘  └────────┘  └────────┘  └────────┘  │
│                                                      │
│  Active Workflow: POV Kickoff Assistant             │
│  ┌──────────────────────────────────────────────┐  │
│  │ Step 1 of 4: Select Customer                  │  │
│  │                                                 │  │
│  │ [Dropdown: Acme Corp                       ▼]  │  │
│  │                                                 │  │
│  │         [Continue →]                           │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  Recent Results                                     │
│  • POV Plan: Acme Corp (2 days ago)                │
│  • TRR Validation: 5 records (1 week ago)          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

#### 2.2 Responsive Layout
- Mobile-first design
- Stack workflow cards vertically on small screens
- Collapsible sections for better space management
- Touch-friendly button sizes (min 44x44px)

### Phase 3: Standardization & Web Compliance

#### 3.1 Accessibility (WCAG 2.1 AA)
- ✅ All interactive elements have ARIA labels
- ✅ Keyboard navigation support (Tab, Enter, Escape)
- ✅ Focus visible indicators
- ✅ Color contrast ratio ≥ 4.5:1
- ✅ Screen reader announcements for dynamic content
- ✅ Skip links for main content

#### 3.2 Semantic HTML
```tsx
<article aria-labelledby="workflow-title" role="region">
  <header>
    <h2 id="workflow-title">POV Kickoff Assistant</h2>
  </header>
  <form aria-label="POV planning workflow">
    <fieldset>
      <legend>Step 1: Customer Selection</legend>
      <select
        aria-describedby="customer-hint"
        aria-required="true"
      >
        ...
      </select>
      <span id="customer-hint" className="sr-only">
        Select the customer for this POV engagement
      </span>
    </fieldset>
  </form>
</article>
```

#### 3.3 Performance Optimization
- Lazy load workflow definitions
- Memoize expensive computations
- Debounce user input
- Virtual scrolling for large lists
- Code splitting for workflow modules

#### 3.4 Progressive Enhancement
- Core functionality works without JS
- Graceful degradation for older browsers
- Offline support with Service Workers (future)

### Phase 4: Advanced Features

#### 4.1 Workflow Templates Library
Pre-built templates for common scenarios:

1. **POV Management**
   - POV Kickoff
   - Mid-POV Health Check
   - POV Wrap-up & Business Case
   - POV Extension Planning

2. **TRR Workflows**
   - Bulk TRR Validation
   - Risk Assessment
   - Requirements Gap Analysis
   - Evidence Collection Checklist

3. **Customer Analysis**
   - Technical Fit Assessment
   - Competitive Positioning
   - Stakeholder Mapping
   - Success Probability Score

4. **Operational**
   - Weekly Success Review
   - Monthly Portfolio Analysis
   - Quarterly Business Review Prep
   - Resource Utilization Optimization

#### 4.2 AI Output Actions
Every AI response includes actionable buttons:
```tsx
<AIResponseCard>
  <h3>POV Plan Generated</h3>
  <p>5-scenario plan with 45-day timeline...</p>

  <ActionButtons>
    <Button onClick={createPOVFromPlan}>
      Create POV in System
    </Button>
    <Button onClick={exportPDF}>
      Export as PDF
    </Button>
    <Button onClick={shareWithTeam}>
      Share with Team
    </Button>
    <Button onClick={scheduleReview}>
      Schedule Review Meeting
    </Button>
  </ActionButtons>
</AIResponseCard>
```

#### 4.3 Context Auto-Detection
```typescript
// Automatically detect context from URL/state
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const povId = params.get('povId');
  const customerId = params.get('customerId');

  if (povId) {
    setContextMode('pov');
    setSelectedPOV(povId);
    // Suggest relevant workflows
    suggestWorkflows(['pov_health_check', 'pov_acceleration']);
  }

  if (customerId) {
    setContextMode('customer');
    setSelectedCustomer(customerId);
    suggestWorkflows(['customer_fit', 'pov_planning']);
  }
}, []);
```

#### 4.4 Conversation History with Search
- Full-text search across past conversations
- Filter by workflow type, date, customer
- Export conversation transcripts
- Bookmark important insights

### Phase 5: Integration & Automation

#### 5.1 Platform Integration
- **Firestore**: Persist workflow results, conversation history
- **Cloud Functions**: Heavy AI processing (long-running analysis)
- **BigQuery**: Analytics on AI usage patterns
- **Calendar**: Schedule follow-up actions

#### 5.2 Notification System
- Email summaries of AI-generated reports
- Slack/Teams integration for sharing insights
- In-app notifications for workflow completion

#### 5.3 Collaboration Features
- Share workflows with team members
- Collaborative editing of prompts
- Team-wide prompt templates
- Usage analytics dashboard

## Implementation Roadmap

### Week 1: Foundation (HIGH PRIORITY)
- [ ] Create GuidedWorkflow type system
- [ ] Build PromptBuilder class
- [ ] Implement workflow card UI
- [ ] Add 3 core workflows (POV Kickoff, TRR Validation, Customer Fit)

### Week 2: UI/UX Overhaul
- [ ] Redesign with Cortex color palette
- [ ] Implement responsive layout
- [ ] Add loading states and animations
- [ ] Improve error handling

### Week 3: Accessibility & Standards
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement keyboard navigation
- [ ] Test with screen readers
- [ ] Validate HTML semantics

### Week 4: Advanced Features
- [ ] Add 10 more workflow templates
- [ ] Implement action buttons on AI responses
- [ ] Add conversation history
- [ ] Context auto-detection

### Week 5: Integration
- [ ] Firestore persistence
- [ ] PDF export functionality
- [ ] Email notifications
- [ ] Analytics tracking

## Success Metrics

1. **User Engagement**
   - Target: 70% of users use AI Assistant weekly
   - Target: Average 3+ workflows executed per user per week

2. **Efficiency Gains**
   - Target: 50% reduction in POV planning time
   - Target: 40% faster TRR validation

3. **Satisfaction**
   - Target: 4.5+ star rating on usefulness
   - Target: 80%+ report "saves significant time"

4. **Adoption**
   - Target: 90% of users try at least one workflow in first week
   - Target: 60% become repeat users

## Technical Specifications

### Browser Support
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile: iOS Safari 14+, Chrome Mobile 90+

### Performance Targets
- Initial load: < 2s
- Workflow initiation: < 500ms
- AI response: < 10s (with loading indicators)
- Lighthouse Score: 90+ (Performance, Accessibility, Best Practices)

### Security Requirements
- Input sanitization for all user inputs
- Rate limiting on AI API calls
- Data encryption for sensitive customer info
- Audit logging for all AI interactions

## File Structure

```
hosting/
├── components/
│   ├── ai-assistant/
│   │   ├── EnhancedAIAssistant.tsx      (main component)
│   │   ├── WorkflowCard.tsx              (workflow selector)
│   │   ├── WorkflowExecutor.tsx          (step-by-step executor)
│   │   ├── AIResponseCard.tsx            (formatted AI output)
│   │   ├── ContextSelector.tsx           (auto context detection)
│   │   └── ConversationHistory.tsx       (past interactions)
├── lib/
│   ├── ai-workflows/
│   │   ├── workflow-types.ts             (TypeScript interfaces)
│   │   ├── workflow-library.ts           (template definitions)
│   │   ├── prompt-builder.ts             (prompt engineering)
│   │   └── workflow-executor.ts          (execution logic)
└── docs/
    └── AI_ASSISTANT_USER_GUIDE.md        (end-user documentation)
```

## Next Steps

1. **Review & Approve Strategy** - Stakeholder sign-off
2. **Create Workflow Templates** - Define 15 core workflows
3. **Design Mockups** - Visual design system
4. **Development Sprint 1** - Implement Phase 1
5. **User Testing** - Beta test with 5 DCs
6. **Iteration** - Refine based on feedback
7. **Full Rollout** - Production deployment

---

**Document Version:** 1.0
**Last Updated:** 2025-10-15
**Status:** Proposed
**Owner:** Engineering Team
