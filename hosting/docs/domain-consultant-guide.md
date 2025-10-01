# Domain Consultant User Guide
## Complete TRR Management & Technical Sales Workflow

This guide provides a comprehensive overview of the Cortex DC Portal's domain consultant workspace, designed to streamline technical sales workflows from initial customer engagement through deal closure.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Customer Engagement Management](#customer-engagement-management)
3. [TRR Management & Validation](#trr-management--validation)
4. [Sales Process Workflows](#sales-process-workflows)
5. [Note-Taking & Knowledge Management](#note-taking--knowledge-management)
6. [Template Management](#template-management)
7. [Integration with Existing Systems](#integration-with-existing-systems)
8. [Best Practices](#best-practices)

---

## Getting Started

### Accessing the Domain Consultant Workspace

The Domain Consultant Workspace is the central hub for managing all customer engagements, technical requirements reviews (TRRs), and sales processes.

**Access Methods:**
- GUI Mode: Navigate to the GUI interface and select the Domain Consultant Workspace tab
- Terminal Mode: Use the command `workspace dc` to switch to consultant mode
- Direct URL: Access `/workspace/domain-consultant` for dedicated workspace view

### Dashboard Overview

The dashboard provides a comprehensive view of your current activities:

**Key Metrics:**
- **Active Engagements**: Number of ongoing customer engagements
- **Completed TRRs**: Successfully validated technical requirements
- **Total TRRs**: All technical requirements across all engagements
- **Upcoming Milestones**: Pending deliverables and meetings
- **Active Risks**: Risk factors requiring attention
- **Win Probability**: AI-calculated probability for current deals

**Quick Actions Panel:**
- Add Meeting Notes
- Create New TRR
- Start Sales Process Guide
- Schedule Demo
- Generate Executive Report

---

## Customer Engagement Management

### Creating a New Engagement

1. **Initial Setup**
   ```bash
   customer profile create "Customer Name" --industry finance --size enterprise
   ```

2. **Stakeholder Mapping**
   - Identify decision makers, influencers, and technical contacts
   - Map influence vs. interest levels
   - Document preferred communication methods

3. **Requirements Capture**
   ```bash
   customer requirements capture --compliance "PCI,SOX" --priorities "cost,performance"
   ```

### Engagement Lifecycle

**Discovery Phase (2-3 weeks)**
- Initial requirements gathering
- Stakeholder interviews
- Technical environment assessment
- Pain point identification

**Presentation Phase (1-2 weeks)**
- Capability demonstrations
- Technical deep dives
- Executive presentations
- Business case development

**Pilot Phase (2-6 weeks)**
- Proof of concept setup
- Technical validation
- Success metrics tracking
- Stakeholder training

**Evaluation Phase (2-4 weeks)**
- Results analysis
- Business case refinement
- Proposal development
- Objection handling

**Closing Phase (1-2 weeks)**
- Contract negotiation
- Implementation planning
- Success criteria definition
- Kickoff preparation

### Stakeholder Management

**Influence Levels:**
- **High**: Decision makers, budget holders, project sponsors
- **Medium**: Technical leads, department managers
- **Low**: End users, technical staff

**Interest Levels:**
- **High**: Actively engaged, asking questions, providing feedback
- **Medium**: Interested but not driving decisions
- **Low**: Passive participants, minimal engagement

**Best Practices:**
- Schedule regular check-ins with high-influence stakeholders
- Provide tailored content based on role and interest
- Document all communications and decisions
- Track engagement levels over time

---

## TRR Management & Validation

### Understanding TRRs

Technical Requirements Reviews (TRRs) are formal validations of customer requirements against our platform capabilities. Each TRR represents a specific technical challenge or requirement that must be validated to move forward in the sales process.

### TRR Lifecycle

1. **Requirement Identification**
   - Discovered during customer meetings
   - Documented in engagement notes
   - Prioritized based on business impact

2. **TRR Creation**
   ```bash
   trr create --customer "Customer Name" --requirement "SIEM Integration" --priority critical
   ```

3. **Technical Validation**
   - Environment setup
   - Testing and validation
   - Evidence collection
   - Results documentation

4. **Customer Review**
   - Presentation of results
   - Stakeholder approval
   - Sign-off collection
   - Next steps planning

### TRR Categories

**Security TRRs:**
- Identity and access management
- Threat detection and response
- Compliance and governance
- Data protection

**Integration TRRs:**
- SIEM/SOAR integration
- API connectivity
- Data source onboarding
- Third-party tool compatibility

**Performance TRRs:**
- Scalability validation
- Throughput testing
- Latency measurement
- Resource utilization

**Compliance TRRs:**
- Regulatory requirement validation
- Audit trail verification
- Policy enforcement testing
- Reporting capabilities

### AI-Assisted TRR Creation

The system provides AI assistance for:
- **Smart Categorization**: Automatic classification based on requirements
- **Acceptance Criteria Generation**: AI-generated test criteria
- **Risk Assessment**: Automated risk analysis and mitigation suggestions
- **Timeline Prediction**: AI-powered completion estimates
- **Test Case Generation**: Automatic test case creation from requirements

### TRR Validation Methods

**Manual Validation:**
- Consultant-led testing
- Step-by-step verification
- Manual evidence collection
- Personal oversight

**Automated Validation:**
- Script-based testing
- Continuous monitoring
- Automatic result collection
- Scheduled validation runs

**Hybrid Validation:**
- Combination of manual and automated
- Best for complex scenarios
- Provides comprehensive coverage
- Balances efficiency and thoroughness

### Blockchain Signoff

Validated TRRs can be cryptographically signed using blockchain technology:

```bash
trr-signoff create TRR-2024-001 --type technical --signer "John Doe"
```

**Benefits:**
- Immutable validation records
- Tamper-proof evidence
- Customer confidence
- Audit trail compliance

---

## Sales Process Workflows

### Guided Sales Process

The system provides step-by-step guides for each sales stage:

### Discovery Process Guide

**Pre-Meeting Preparation Checklist:**
- [ ] Research customer industry and compliance requirements
- [ ] Review customer public security incidents or news
- [ ] Identify current security tools from job postings or press releases
- [ ] Prepare industry-specific use cases and demos
- [ ] Create stakeholder mapping template

**Discovery Meeting Execution:**
- Focus on pain points, not features
- Ask open-ended questions about current challenges
- Take detailed notes for TRR creation
- Identify all stakeholders in security decisions

**Post-Discovery Actions:**
- Create initial TRRs for identified requirements
- Send follow-up email with next steps
- Schedule demonstration or technical deep-dive
- Update stakeholder map with new contacts

### Demo Process Guide

**Demo Preparation:**
```bash
demo environment create --customer "acme" --use-case siem-migration --ttl 7d
```

**SIEM Migration Demo Script:**
1. Current SIEM pain points discussion (10 min)
2. XSIAM architecture overview (15 min)
3. Live demo: Data ingestion and correlation (20 min)
4. Automation and playbook demonstration (15 min)
5. Integration capabilities showcase (10 min)
6. Q&A and next steps (10 min)

**Key Messages:**
- Unified XDR platform reduces tool sprawl
- AI-powered correlation reduces false positives by 80%
- Automated playbooks reduce MTTR from hours to minutes
- Cloud-native architecture scales with your business

**Discovery Questions:**
- What is your biggest challenge with current SIEM?
- How many security tools does your team currently manage?
- What is your average time to resolve security incidents?
- How do you currently handle false positives?

### Pilot Planning Guide

**Pilot Scope Definition:**
- Define success metrics and KPIs
- Identify data sources for integration
- Set timeline and milestones
- Assign technical resources

**Technical Requirements:**
- Network access and firewall rules
- Data source configurations
- User account setup
- Training schedule

---

## Note-Taking & Knowledge Management

### Meeting Notes System

The integrated note-taking system captures all customer interactions:

**Note Types:**
- **🔍 Observation**: Factual information and customer insights
- **⚠️ Concern**: Potential risks or objections
- **🎯 Opportunity**: Sales opportunities and upsell potential
- **✅ Action Item**: Tasks requiring follow-up
- **📋 Decision**: Important decisions made during meetings

**Note Management:**
- Link notes to specific TRRs
- Mark confidential information
- Tag notes with keywords
- Search across all engagement notes

### Best Practices for Note-Taking

**During Meetings:**
- Use the quick note feature for real-time capture
- Focus on decisions, concerns, and next steps
- Note stakeholder reactions to demonstrations
- Document technical requirements precisely

**Post-Meeting:**
- Expand abbreviated notes within 24 hours
- Create action items for follow-up
- Link relevant TRRs to meeting outcomes
- Share appropriate notes with team members

### Knowledge Base Integration

**Customer Intelligence:**
- Competitive landscape analysis
- Industry-specific challenges
- Regulatory requirements
- Technical architecture insights

**Solution Knowledge:**
- Product capabilities and limitations
- Integration patterns and best practices
- Common objections and responses
- Success stories and references

---

## Template Management

### Available Templates

The system includes industry-tested templates for common scenarios:

**Discovery Templates:**
- Financial services security assessment
- Healthcare compliance evaluation
- Manufacturing operational security
- Government security requirements

**Demo Templates:**
- SIEM migration demonstration
- Cloud security assessment
- Threat hunting capabilities
- Compliance reporting showcase

**Pilot Templates:**
- 30-day proof of concept
- Integration validation pilot
- Performance benchmark testing
- Compliance verification project

### Using Templates

1. **Select Appropriate Template**
   - Filter by industry, use case, or customer size
   - Review template content and customize as needed
   - Check associated TRRs and requirements

2. **Customize for Customer**
   - Replace generic content with customer-specific information
   - Adjust timeline and milestones
   - Modify success criteria and KPIs

3. **Execute Template**
   - Follow guided steps and checklists
   - Track progress against template milestones
   - Document deviations and lessons learned

### Template Performance Tracking

**Success Metrics:**
- Win rate by template
- Average sales cycle length
- Customer satisfaction scores
- Time to first value

**Template Optimization:**
- Regular review and updates
- Incorporation of feedback
- A/B testing of variations
- Best practice documentation

---

## Integration with Existing Systems

### CRM Integration

**Salesforce Sync:**
```bash
crm sync --system salesforce --engagement-id eng-acme-2024
```

**HubSpot Integration:**
- Automatic contact updates
- Activity logging
- Pipeline stage synchronization
- Custom field mapping

### Communication Tools

**Slack Integration:**
- Real-time notifications
- TRR status updates
- Meeting reminders
- Team collaboration

**Email Integration:**
- Automatic follow-up emails
- Meeting summary distribution
- Document sharing
- Calendar integration

### Technical Systems

**XSIAM Integration:**
```bash
xsiam demo prepare --customer "Acme Corp" --use-case threat-hunting
```

**Lab Environment:**
- Automated environment provisioning
- Customer-specific data sets
- Demo scenario deployment
- Performance monitoring

---

## Best Practices

### Engagement Management

**Planning:**
- Always start with discovery before proposing solutions
- Map stakeholders early and update regularly
- Set clear expectations for each meeting
- Document everything in real-time

**Execution:**
- Focus on customer outcomes, not product features
- Use TRRs to validate technical feasibility
- Provide regular updates to all stakeholders
- Address concerns proactively

**Follow-up:**
- Send meeting summaries within 24 hours
- Include clear next steps and owners
- Set specific dates for follow-up actions
- Track completion of commitments

### TRR Best Practices

**Creation:**
- Be specific and measurable in requirements
- Include acceptance criteria upfront
- Assign realistic timelines
- Involve customer technical teams

**Validation:**
- Test in customer-like environments
- Collect comprehensive evidence
- Document any limitations or assumptions
- Present results professionally

**Documentation:**
- Use clear, non-technical language for business stakeholders
- Include screenshots and demonstration videos
- Provide detailed technical appendices
- Offer multiple formats (executive summary, technical details)

### Common Pitfalls to Avoid

**Discovery Phase:**
- Don't pitch solutions during discovery
- Avoid assuming requirements without validation
- Don't skip stakeholder mapping
- Never underestimate competitive threats

**Demo Phase:**
- Don't show features without business context
- Avoid technical jargon with business audiences
- Don't ignore customer questions or concerns
- Never wing it without preparation

**Pilot Phase:**
- Don't set unrealistic expectations
- Avoid scope creep without adjustment
- Don't ignore early warning signs
- Never let pilot results speak for themselves

---

## Advanced Features

### AI-Powered Insights

**Engagement Scoring:**
- Automatic win probability calculation
- Risk factor identification
- Competitive positioning analysis
- Timeline prediction

**Recommendation Engine:**
- Next best actions suggestions
- Content recommendations
- Stakeholder outreach timing
- Risk mitigation strategies

### Analytics and Reporting

**Personal Dashboard:**
- Win rate tracking
- Pipeline health metrics
- Activity summaries
- Goal progress

**Team Analytics:**
- Best practice sharing
- Performance benchmarking
- Success pattern identification
- Resource optimization

### Mobile Access

**Mobile Features:**
- Meeting note capture
- TRR status updates
- Quick actions
- Offline access

---

## Support and Training

### Getting Help

**In-System Help:**
- Contextual help tooltips
- Interactive tutorials
- Video walkthroughs
- Best practice guides

**Community Support:**
- Internal forums
- Expert office hours
- Peer mentoring
- Success story sharing

### Continuous Learning

**Skills Development:**
- Regular training modules
- Certification programs
- Competitive intelligence updates
- Industry trend analysis

**Performance Improvement:**
- Regular coaching sessions
- Deal retrospectives
- Win/loss analysis
- Best practice documentation

---

## Conclusion

The Domain Consultant Workspace provides a comprehensive platform for managing the entire technical sales lifecycle. By integrating customer engagement management, TRR validation, sales process workflows, and knowledge management, it enables domain consultants to be more effective, efficient, and successful in their customer engagements.

Key benefits include:
- Streamlined workflows and reduced administrative overhead
- Improved customer experience through better preparation and follow-through
- Higher win rates through systematic process execution
- Enhanced collaboration and knowledge sharing
- Data-driven insights for continuous improvement

For additional support or training resources, contact the Domain Consultant Success team or visit the internal knowledge base.