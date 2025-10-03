/**
 * Domain Consultant Knowledge Base System
 * Indexes and manages all research, capabilities, workflows, and documentation
 */

import { KnowledgeBaseEntry } from './dc-api-client';

export interface SearchFilters {
  category?: string;
  tags?: string[];
  author?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  contentType?: 'text' | 'command' | 'workflow' | 'research';
}

export interface SearchResult {
  entry: KnowledgeBaseEntry;
  score: number;
  matchedFields: string[];
  highlights: string[];
}

/**
 * Knowledge Base Manager
 */
export class KnowledgeBase {
  private entries: Map<string, KnowledgeBaseEntry> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map(); // word -> entry IDs
  private tagIndex: Map<string, Set<string>> = new Map(); // tag -> entry IDs
  private categoryIndex: Map<string, Set<string>> = new Map(); // category -> entry IDs

  constructor() {
    this.initializeDefaultEntries();
  }

  /**
   * Add or update a knowledge base entry
   */
  addEntry(entry: KnowledgeBaseEntry): void {
    this.entries.set(entry.id, entry);
    this.updateIndices(entry);
  }

  /**
   * Remove an entry
   */
  removeEntry(id: string): boolean {
    const entry = this.entries.get(id);
    if (!entry) return false;

    this.entries.delete(id);
    this.removeFromIndices(entry);
    return true;
  }

  /**
   * Search the knowledge base
   */
  search(query: string, filters?: SearchFilters): SearchResult[] {
    const searchTerms = this.tokenize(query.toLowerCase());
    const results = new Map<string, SearchResult>();

    // Find matching entries
    for (const term of searchTerms) {
      const matchingIds = this.searchIndex.get(term) || new Set();
      
      for (const id of matchingIds) {
        const entry = this.entries.get(id);
        if (!entry || !this.matchesFilters(entry, filters)) continue;

        if (!results.has(id)) {
          results.set(id, {
            entry,
            score: 0,
            matchedFields: [],
            highlights: []
          });
        }

        const result = results.get(id)!;
        this.updateSearchScore(result, term, query);
      }
    }

    // Convert to array and sort by score
    return Array.from(results.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 50); // Limit results
  }

  /**
   * Get entries by category
   */
  getByCategory(category: string): KnowledgeBaseEntry[] {
    const ids = this.categoryIndex.get(category) || new Set();
    return Array.from(ids)
      .map(id => this.entries.get(id))
      .filter(Boolean) as KnowledgeBaseEntry[];
  }

  /**
   * Get entries by tag
   */
  getByTag(tag: string): KnowledgeBaseEntry[] {
    const ids = this.tagIndex.get(tag) || new Set();
    return Array.from(ids)
      .map(id => this.entries.get(id))
      .filter(Boolean) as KnowledgeBaseEntry[];
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    return Array.from(this.categoryIndex.keys());
  }

  /**
   * Get all tags
   */
  getTags(): string[] {
    return Array.from(this.tagIndex.keys());
  }

  /**
   * Get entry by ID
   */
  getEntry(id: string): KnowledgeBaseEntry | undefined {
    return this.entries.get(id);
  }

  /**
   * Get all entries
   */
  getAllEntries(): KnowledgeBaseEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Update search indices for an entry
   */
  private updateIndices(entry: KnowledgeBaseEntry): void {
    // Remove from existing indices first
    this.removeFromIndices(entry);

    // Add to search index
    const searchText = `${entry.title} ${entry.content} ${entry.tags.join(' ')}`;
    const tokens = this.tokenize(searchText.toLowerCase());
    
    for (const token of tokens) {
      if (!this.searchIndex.has(token)) {
        this.searchIndex.set(token, new Set());
      }
      this.searchIndex.get(token)!.add(entry.id);
    }

    // Add to tag index
    for (const tag of entry.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(entry.id);
    }

    // Add to category index
    if (!this.categoryIndex.has(entry.category)) {
      this.categoryIndex.set(entry.category, new Set());
    }
    this.categoryIndex.get(entry.category)!.add(entry.id);
  }

  /**
   * Remove entry from all indices
   */
  private removeFromIndices(entry: KnowledgeBaseEntry): void {
    // Remove from search index
    for (const [term, ids] of this.searchIndex.entries()) {
      ids.delete(entry.id);
      if (ids.size === 0) {
        this.searchIndex.delete(term);
      }
    }

    // Remove from tag index
    for (const tag of entry.tags) {
      const ids = this.tagIndex.get(tag);
      if (ids) {
        ids.delete(entry.id);
        if (ids.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }

    // Remove from category index
    const categoryIds = this.categoryIndex.get(entry.category);
    if (categoryIds) {
      categoryIds.delete(entry.id);
      if (categoryIds.size === 0) {
        this.categoryIndex.delete(entry.category);
      }
    }
  }

  /**
   * Tokenize text for search
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2)
      .map(token => token.trim());
  }

  /**
   * Check if entry matches filters
   */
  private matchesFilters(entry: KnowledgeBaseEntry, filters?: SearchFilters): boolean {
    if (!filters) return true;

    if (filters.category && entry.category !== filters.category) return false;
    
    if (filters.tags && !filters.tags.some(tag => entry.tags.includes(tag))) return false;
    
    if (filters.author && entry.author !== filters.author) return false;
    
    if (filters.dateRange) {
      const entryDate = new Date(entry.createdAt);
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      if (entryDate < start || entryDate > end) return false;
    }

    return true;
  }

  /**
   * Update search score for a result
   */
  private updateSearchScore(result: SearchResult, term: string, originalQuery: string): void {
    const entry = result.entry;
    let score = 0;
    
    // Title matches get higher score
    if (entry.title.toLowerCase().includes(term)) {
      score += 10;
      if (!result.matchedFields.includes('title')) {
        result.matchedFields.push('title');
      }
    }

    // Content matches get medium score
    if (entry.content.toLowerCase().includes(term)) {
      score += 5;
      if (!result.matchedFields.includes('content')) {
        result.matchedFields.push('content');
      }
    }

    // Tag matches get high score
    if (entry.tags.some(tag => tag.toLowerCase().includes(term))) {
      score += 8;
      if (!result.matchedFields.includes('tags')) {
        result.matchedFields.push('tags');
      }
    }

    // Exact phrase matches get bonus
    if (entry.title.toLowerCase().includes(originalQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(originalQuery.toLowerCase())) {
      score += 15;
    }

    result.score += score;

    // Add highlights
    const highlight = this.createHighlight(entry, term);
    if (highlight && !result.highlights.includes(highlight)) {
      result.highlights.push(highlight);
    }
  }

  /**
   * Create highlight snippet
   */
  private createHighlight(entry: KnowledgeBaseEntry, term: string): string | null {
    const content = entry.content.toLowerCase();
    const termIndex = content.indexOf(term);
    
    if (termIndex === -1) return null;

    const start = Math.max(0, termIndex - 50);
    const end = Math.min(content.length, termIndex + term.length + 50);
    
    let snippet = entry.content.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  }

  /**
   * Initialize default knowledge base entries
   */
  private initializeDefaultEntries(): void {
    const defaultEntries: KnowledgeBaseEntry[] = [
      {
        id: 'kb_dc_001',
        title: 'Domain Consultant Workflow Overview',
        content: `The Domain Consultant (DC) workflow encompasses the full customer engagement lifecycle:

1. **Customer Discovery & Profiling**
   - Industry analysis and security maturity assessment
   - Primary concern identification and prioritization
   - Technology stack evaluation and compatibility analysis
   - Stakeholder mapping and engagement strategy

2. **POV (Proof of Value) Planning & Execution**
   - Scenario selection based on customer profile
   - Timeline development and milestone definition
   - Resource allocation and technical requirements
   - Success criteria establishment and measurement

3. **Technical Risk Review (TRR) Management**
   - Risk identification and categorization
   - Validation evidence collection and analysis
   - Cross-functional review and approval workflows
   - Mitigation strategy development and implementation

4. **XSIAM Health Monitoring & Optimization**
   - Real-time system health assessment
   - Performance metric tracking and alerting
   - Proactive issue identification and resolution
   - Customer environment optimization recommendations

5. **AI-Powered Decision Support**
   - Context-aware recommendation generation
   - Predictive analysis for engagement success
   - Automated workflow optimization suggestions
   - Data-driven insight generation and reporting`,
        category: 'workflow',
        tags: ['dc', 'workflow', 'overview', 'process', 'methodology'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'DC Platform Team',
        searchable: true
      },
      {
        id: 'kb_trr_001',
        title: 'TRR Validation Best Practices',
        content: `Technical Risk Review (TRR) validation is critical for ensuring POV success and customer confidence:

**Pre-Validation Checklist:**
- Verify all technical requirements are documented
- Confirm customer environment compatibility
- Validate security policies and compliance requirements
- Review integration dependencies and prerequisites

**Validation Process:**
1. **Evidence Collection**
   - Screenshot documentation of successful configurations
   - Log file analysis and error resolution documentation
   - Performance benchmark results and comparisons
   - Integration test results and validation reports

2. **Cross-Functional Review**
   - Technical architecture review by solution engineers
   - Security compliance verification by security team
   - Customer success team engagement validation
   - Product team feature compatibility confirmation

3. **Documentation Standards**
   - Standardized evidence format and naming conventions
   - Version control for all validation artifacts
   - Traceability matrix linking requirements to evidence
   - Customer-facing summary reports and technical details

**Common Validation Failures:**
- Incomplete evidence documentation
- Missing integration test coverage
- Inadequate performance validation under load
- Insufficient security policy compliance verification

**Acceleration Techniques:**
- Template-based evidence collection for common scenarios
- Automated testing harnesses for standard configurations
- Pre-built validation scripts for typical customer environments
- AI-powered anomaly detection in validation results`,
        category: 'best-practice',
        tags: ['trr', 'validation', 'best-practices', 'evidence', 'documentation'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'DC Platform Team',
        searchable: true
      },
      {
        id: 'kb_pov_001',
        title: 'POV Scenario Planning Framework',
        content: `Effective POV scenario planning requires systematic approach to customer-specific value demonstration:

**Customer Profile Analysis:**
- Industry vertical and specific use cases
- Current security tool stack and integration points
- Organizational maturity level and change capacity
- Primary pain points and success criteria definition

**Scenario Selection Criteria:**
1. **Business Impact Alignment**
   - Direct mapping to customer's primary concerns
   - Quantifiable value proposition and ROI demonstration
   - Timeline compatibility with customer decision process
   - Resource requirements within customer capacity

2. **Technical Feasibility Assessment**
   - Customer environment compatibility verification
   - Integration complexity and dependency analysis
   - Performance requirements and scalability considerations
   - Security and compliance requirement alignment

3. **Success Measurement Framework**
   - Baseline metric establishment and documentation
   - Success criteria definition with measurable outcomes
   - Progress tracking methodology and reporting cadence
   - Customer feedback collection and incorporation process

**Common Scenario Categories:**
- **Incident Response Automation:** SOAR workflow automation, playbook execution, alert enrichment
- **Threat Hunting & Detection:** Advanced analytics, ML-powered detection, threat intelligence integration
- **Compliance Reporting:** Automated compliance validation, audit trail generation, policy enforcement
- **Cloud Security Posture:** Multi-cloud visibility, misconfiguration detection, automated remediation
- **Identity & Access Management:** Zero-trust implementation, privileged access management, behavioral analytics

**Optimization Strategies:**
- Leverage customer's existing tool investments
- Demonstrate incremental value with phased approach
- Provide clear migration path from current solutions
- Include customer team training and knowledge transfer`,
        category: 'workflow',
        tags: ['pov', 'scenarios', 'planning', 'framework', 'customer-success'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'DC Platform Team',
        searchable: true
      },
      {
        id: 'kb_xsiam_001',
        title: 'XSIAM Health Check Procedures',
        content: `Comprehensive XSIAM health monitoring ensures optimal performance and customer satisfaction:

**Core Health Metrics:**
1. **Data Ingestion Performance**
   - Events per second (EPS) throughput monitoring
   - Ingestion lag and backlog tracking
   - Data source connectivity and availability
   - Parsing success rates and error analysis

2. **Correlation Engine Efficiency**
   - Rule processing performance and latency
   - Memory and CPU utilization monitoring
   - Alert generation rates and accuracy metrics
   - False positive/negative analysis and tuning

3. **API Gateway Responsiveness**
   - Request/response time monitoring
   - API rate limiting and quota management
   - Authentication and authorization success rates
   - Error rate analysis and trend identification

4. **Data Lake Performance**
   - Query response times and optimization
   - Storage utilization and growth trending
   - Data retention policy compliance
   - Backup and recovery validation

**Automated Health Checks:**
- Synthetic transaction monitoring for critical workflows
- Proactive alert thresholds with escalation procedures
- Performance baseline establishment and drift detection
- Automated remediation for common issues

**Customer-Specific Optimizations:**
- Environment-specific tuning recommendations
- Integration point health monitoring
- Custom alert rule effectiveness analysis
- User adoption and engagement metrics tracking

**Troubleshooting Playbooks:**
- Common issue identification and resolution procedures
- Escalation matrix for different problem severity levels
- Customer communication templates for incident updates
- Root cause analysis methodology and documentation`,
        category: 'troubleshooting',
        tags: ['xsiam', 'health-check', 'monitoring', 'performance', 'optimization'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'DC Platform Team',
        searchable: true
      },
      {
        id: 'kb_ai_001',
        title: 'AI Assistant Integration Guide',
        content: `The AI Assistant provides context-aware recommendations and insights throughout the DC workflow:

**Core AI Capabilities:**
1. **Customer Profile Analysis**
   - Industry-specific risk assessment and prioritization
   - Technology stack compatibility analysis
   - Organizational maturity evaluation and recommendations
   - Stakeholder engagement strategy optimization

2. **POV Optimization**
   - Scenario selection based on customer profile and history
   - Timeline optimization with resource constraint consideration
   - Success probability modeling with confidence intervals
   - Risk mitigation strategy generation and prioritization

3. **TRR Acceleration**
   - Validation requirement prediction based on scenario type
   - Evidence collection automation and quality assessment
   - Cross-reference validation with similar customer deployments
   - Anomaly detection in validation results and recommendations

4. **Predictive Analytics**
   - Engagement success probability with contributing factors
   - Timeline risk assessment and mitigation recommendations
   - Customer satisfaction prediction with improvement suggestions
   - Technical win probability with optimization strategies

**AI Context Integration:**
- Real-time customer data integration and analysis
- Historical engagement pattern recognition and application
- Industry benchmarking and best practice recommendations
- Continuous learning from engagement outcomes and feedback

**Prompt Engineering Best Practices:**
- Include specific customer context and requirements
- Specify desired output format and level of detail
- Provide relevant historical data and success patterns
- Request confidence levels and alternative recommendations

**AI Quality Assurance:**
- Human review workflows for critical recommendations
- Feedback loop integration for continuous improvement
- Bias detection and mitigation procedures
- Recommendation accuracy tracking and optimization`,
        category: 'capability',
        tags: ['ai', 'assistant', 'recommendations', 'automation', 'optimization'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'DC Platform Team',
        searchable: true
      },
      {
        id: 'kb_cortex_001',
        title: 'Cortex Product Technical Win Strategies',
        content: `Strategic approaches for achieving technical wins with Cortex products in DC engagements:

**Cortex XSOAR Technical Wins:**
1. **Automation Value Demonstration**
   - Incident response time reduction metrics
   - MTTR (Mean Time to Resolution) improvement tracking
   - Analyst productivity gains through automation
   - Cost savings through manual task elimination

2. **Integration Showcase**
   - Existing tool integration without replacement
   - Centralized orchestration of security operations
   - Custom playbook development for customer workflows
   - Third-party API integration and workflow enhancement

**Cortex XSIAM Technical Wins:**
1. **Advanced Analytics Demonstration**
   - ML-powered threat detection with reduced false positives
   - Behavioral analytics for insider threat detection
   - Advanced hunting capabilities with custom queries
   - Threat intelligence integration and enrichment

2. **Scalability and Performance**
   - High-volume data ingestion and processing
   - Real-time analysis and alerting capabilities
   - Cloud-native architecture benefits and cost optimization
   - Multi-tenant deployment flexibility and security

**Cortex XDR Technical Wins:**
1. **Endpoint Protection Excellence**
   - Advanced malware detection with behavioral analysis
   - Fileless attack detection and prevention
   - Memory protection and exploit prevention
   - Ransomware protection and recovery capabilities

2. **Investigation and Response**
   - Timeline-based incident reconstruction
   - Automated containment and remediation actions
   - Forensic evidence collection and analysis
   - Cross-platform visibility and correlation

**Customer Value Positioning:**
- Business impact quantification with ROI calculations
- Risk reduction measurement and compliance benefits
- Operational efficiency improvements and cost savings
- Strategic security posture enhancement and future readiness

**Competitive Differentiation:**
- Unique Palo Alto Networks integration advantages
- AI/ML capabilities superior to point solutions
- Cloud-native architecture benefits over legacy solutions
- Comprehensive security platform vs. fragmented toolsets`,
        category: 'capability',
        tags: ['cortex', 'technical-wins', 'xsoar', 'xsiam', 'xdr', 'strategy'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'DC Platform Team',
        searchable: true
      },
      {
        id: 'kb_export_001',
        title: 'Data Export and Analytics Guide',
        content: `Comprehensive guide for data export capabilities and customer analytics:

**Export Scope Options:**
1. **Complete Data Dump**
   - All customer engagement data with full history
   - All POV records with scenario details and outcomes
   - Complete TRR validation records with evidence
   - Full workflow history with AI recommendations

2. **Customer-Specific Exports**
   - Single customer engagement data with related POVs and TRRs
   - Customer journey analytics with timeline and milestones
   - Success metrics and ROI calculations
   - Customer-specific AI insights and recommendations

3. **Time-Based Exports**
   - Date range filtered data with configurable periods
   - Monthly/quarterly engagement summaries
   - Performance trending data and analytics
   - Seasonal analysis and pattern recognition

4. **Data Type Filtered Exports**
   - POV-only data with scenario success rates
   - TRR validation data with evidence quality metrics
   - AI recommendation data with accuracy tracking
   - Customer profile data with industry benchmarking

**Export Formats:**
- **JSON:** Complete structured data with full metadata
- **CSV:** Tabular data suitable for spreadsheet analysis
- **Excel:** Formatted reports with charts and summaries
- **BigQuery:** Direct integration for advanced analytics

**BigQuery Integration Benefits:**
- Real-time data synchronization and updates
- Advanced SQL-based analytics and reporting
- Integration with Google Cloud analytics tools
- Scalable data warehouse capabilities for large datasets

**Analytics Use Cases:**
- Customer success pattern identification
- POV scenario effectiveness analysis
- TRR validation bottleneck identification
- AI recommendation accuracy improvement
- Industry-specific trend analysis and benchmarking

**Data Privacy and Security:**
- Customer data anonymization options
- Export access control and audit logging
- Temporary download links with expiration
- GDPR and compliance-ready export formats`,
        category: 'capability',
        tags: ['export', 'analytics', 'bigquery', 'data', 'reporting'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'DC Platform Team',
        searchable: true
      }
    ];

    for (const entry of defaultEntries) {
      this.addEntry(entry);
    }
  }
}

// Export singleton instance
export const knowledgeBase = new KnowledgeBase();

// Utility functions for common knowledge base operations
export const KBUtils = {
  /**
   * Add terminal command documentation
   */
  addCommandDoc(command: string, description: string, usage: string, examples: string[]): void {
    const entry: KnowledgeBaseEntry = {
      id: `cmd_${command.replace(/\s+/g, '_')}_${Date.now()}`,
      title: `Terminal Command: ${command}`,
      content: `${description}\n\nUsage: ${usage}\n\nExamples:\n${examples.map(ex => `- ${ex}`).join('\n')}`,
      category: 'capability',
      tags: ['terminal', 'command', command, 'cli'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'System',
      searchable: true
    };
    
    knowledgeBase.addEntry(entry);
  },

  /**
   * Add workflow documentation
   */
  addWorkflowDoc(name: string, description: string, steps: string[], tips: string[]): void {
    const entry: KnowledgeBaseEntry = {
      id: `workflow_${name.replace(/\s+/g, '_')}_${Date.now()}`,
      title: `Workflow: ${name}`,
      content: `${description}\n\nSteps:\n${steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\nTips:\n${tips.map(tip => `- ${tip}`).join('\n')}`,
      category: 'workflow',
      tags: ['workflow', 'process', 'gui', name.toLowerCase().replace(/\s+/g, '-')],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'System',
      searchable: true
    };
    
    knowledgeBase.addEntry(entry);
  },

  /**
   * Add research findings
   */
  addResearch(title: string, findings: string, methodology: string, conclusions: string[]): void {
    const entry: KnowledgeBaseEntry = {
      id: `research_${title.replace(/\s+/g, '_')}_${Date.now()}`,
      title: `Research: ${title}`,
      content: `${findings}\n\nMethodology:\n${methodology}\n\nConclusions:\n${conclusions.map(c => `- ${c}`).join('\n')}`,
      category: 'research',
      tags: ['research', 'findings', 'analysis'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Research Team',
      searchable: true
    };
    
    knowledgeBase.addEntry(entry);
  }
};