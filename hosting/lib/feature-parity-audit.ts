/**
 * Terminal vs GUI Feature Parity Audit System
 * Maps all terminal commands to GUI equivalents and identifies gaps
 */

import { CommandConfig } from './commands';
import { allCommands } from './commands-ext';
import { knowledgeBase, KBUtils } from './knowledge-base';

export interface TerminalFeature {
  command: string;
  description: string;
  category: string;
  aliases: string[];
  args: string[];
  usage: string;
  examples: string[];
}

export interface GUIComponent {
  name: string;
  path: string;
  description: string;
  features: string[];
  status: 'complete' | 'partial' | 'missing';
}

export interface FeatureMapping {
  terminal: TerminalFeature;
  gui: GUIComponent | null;
  parity: 'complete' | 'partial' | 'missing';
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
}

/**
 * Feature Parity Audit System
 */
export class FeatureParityAuditor {
  private terminalFeatures: TerminalFeature[] = [];
  private guiComponents: GUIComponent[] = [];
  private mappings: FeatureMapping[] = [];

  constructor() {
    this.extractTerminalFeatures();
    this.defineGUIComponents();
    this.createMappings();
    this.indexInKnowledgeBase();
  }

  /**
   * Extract all terminal features from command registry
   */
  private extractTerminalFeatures(): void {
    this.terminalFeatures = allCommands.map(cmd => ({
      command: cmd.name,
      description: cmd.description,
      category: cmd.category || 'general',
      aliases: cmd.aliases || [],
      args: this.extractArgs(cmd.usage),
      usage: cmd.usage,
      examples: cmd.examples || []
    }));
  }

  /**
   * Define all GUI components and their capabilities
   */
  private defineGUIComponents(): void {
    this.guiComponents = [
      {
        name: 'AI Insights Dashboard',
        path: '/gui/ai',
        description: 'Comprehensive AI-powered insights and recommendations',
        features: [
          'Real-time DC workload overview',
          'Customer context analysis', 
          'POV scenario completion tracking',
          'TRR validation analytics',
          'Engagement health monitoring',
          'Recent activity timeline',
          'Upcoming milestones tracking',
          'AI-powered recommendations',
          'Workflow optimization suggestions',
          'Risk mitigation analysis'
        ],
        status: 'complete'
      },
      {
        name: 'TRR Management System',
        path: '/gui/trr',
        description: 'Complete Technical Risk Review workflow management',
        features: [
          'TRR dashboard with real-time statistics',
          'Smart TRR generation with customer context',
          'AI-accelerated validation workflows',
          'Evidence collection and management',
          'Reviewer assignment and tracking',
          'Dependency management',
          'Progress tracking and reporting',
          'Customer and POV linkage',
          'Priority and overdue management',
          'Bulk operations and export'
        ],
        status: 'complete'
      },
      {
        name: 'POV Management Hub',
        path: '/gui/pov',
        description: 'End-to-end Proof of Value lifecycle management',
        features: [
          'POV creation and configuration',
          'Scenario planning and selection',
          'Timeline and milestone management',
          'Resource allocation tracking',
          'Progress monitoring and reporting',
          'Customer alignment verification',
          'Success criteria definition',
          'Outcome tracking and analysis',
          'Integration with TRR workflows'
        ],
        status: 'partial'
      },
      {
        name: 'Customer Management Portal',
        path: '/gui/customers',
        description: 'Comprehensive customer engagement lifecycle management',
        features: [
          'Customer profile creation and management',
          'Industry and maturity assessment',
          'Stakeholder mapping',
          'Engagement timeline tracking',
          'Communication history',
          'Decision process monitoring',
          'Success metrics tracking',
          'Relationship management'
        ],
        status: 'partial'
      },
      {
        name: 'XSIAM Health Monitor',
        path: '/gui/xsiam',
        description: 'Real-time XSIAM system health and performance monitoring',
        features: [
          'System health dashboard',
          'Component status monitoring',
          'Performance metrics tracking',
          'Automated health checks',
          'Alert management',
          'Troubleshooting workflows',
          'Optimization recommendations',
          'Customer environment monitoring'
        ],
        status: 'missing'
      },
      {
        name: 'AI Chat Assistant',
        path: '/gui/ai/chat',
        description: 'Interactive AI assistant with full DC workflow integration',
        features: [
          'Context-aware conversations',
          'Customer-specific recommendations',
          'POV optimization guidance',
          'TRR validation assistance',
          'Technical troubleshooting',
          'Best practice guidance',
          'Knowledge base integration',
          'Workflow automation suggestions'
        ],
        status: 'partial'
      },
      {
        name: 'BigQuery Data Explorer',
        path: '/gui/bigquery',
        description: 'Comprehensive data export and analytics platform',
        features: [
          'Full data dump exports',
          'Scoped export configurations',
          'Multiple export formats',
          'Real-time data synchronization',
          'Advanced analytics queries',
          'Visualization capabilities',
          'Scheduled exports',
          'Data privacy controls'
        ],
        status: 'missing'
      },
      {
        name: 'Content Creator Studio',
        path: '/gui/content',
        description: 'Content generation and management for DC workflows',
        features: [
          'POV documentation generation',
          'TRR report templates',
          'Customer presentation builders',
          'Technical documentation',
          'Best practice guides',
          'Customizable templates',
          'Version control',
          'Collaborative editing'
        ],
        status: 'missing'
      },
      {
        name: 'Scenario Management System',
        path: '/gui/scenarios',
        description: 'Security scenario deployment and management',
        features: [
          'Scenario catalog and browsing',
          'Deployment automation',
          'Status monitoring',
          'Validation workflows',
          'Results analysis',
          'Export capabilities',
          'MITRE ATT&CK mapping',
          'Customer environment integration'
        ],
        status: 'missing'
      },
      {
        name: 'Knowledge Base Portal',
        path: '/gui/knowledge',
        description: 'Searchable knowledge base and documentation system',
        features: [
          'Advanced search capabilities',
          'Category and tag filtering',
          'Content creation and editing',
          'Version history',
          'Collaborative contributions',
          'Integration with workflows',
          'Personalized recommendations',
          'Usage analytics'
        ],
        status: 'missing'
      }
    ];
  }

  /**
   * Create mappings between terminal features and GUI components
   */
  private createMappings(): void {
    this.mappings = this.terminalFeatures.map(terminal => {
      const gui = this.findGUIEquivalent(terminal);
      const parity = this.assessParity(terminal, gui);
      const recommendations = this.generateRecommendations(terminal, gui, parity);
      const priority = this.determinePriority(terminal, parity);

      return {
        terminal,
        gui,
        parity,
        recommendations,
        priority
      };
    });
  }

  /**
   * Find GUI equivalent for a terminal feature
   */
  private findGUIEquivalent(terminal: TerminalFeature): GUIComponent | null {
    const mappings: Record<string, string[]> = {
      'AI Insights Dashboard': [
        'gemini', 'ai', 'ask', 'chat', 'cortex-questions', 'genai',
        'ai-insights', 'recommendations', 'insights'
      ],
      'TRR Management System': [
        'trr', 'trr-*', 'validate', 'validation', 'evidence', 'review',
        'technical-risk', 'risk-review', 'blockchain-signoff'
      ],
      'POV Management Hub': [
        'pov', 'pov-*', 'proof-of-value', 'scenarios', 'objectives',
        'timeline', 'milestones', 'outcomes'
      ],
      'Customer Management Portal': [
        'customer', 'engagement', 'profile', 'stakeholder', 'contact',
        'relationship', 'crm'
      ],
      'XSIAM Health Monitor': [
        'xsiam', 'health', 'monitor', 'status', 'performance',
        'alerts', 'troubleshoot', 'system-health'
      ],
      'BigQuery Data Explorer': [
        'bq', 'bigquery', 'export', 'data', 'analytics', 'query',
        'reporting', 'dashboard'
      ],
      'Content Creator Studio': [
        'create-gui', 'gui', 'manual-create', 'template', 'documentation',
        'report', 'presentation'
      ],
      'Scenario Management System': [
        'scenario', 'scenarios', 'sec-scenario', 'deploy', 'security',
        'mitre', 'detection'
      ],
      'Knowledge Base Portal': [
        'search', 'find', 'lookup', 'help', 'docs', 'knowledge',
        'documentation', 'guide'
      ]
    };

    for (const [componentName, keywords] of Object.entries(mappings)) {
      const component = this.guiComponents.find(c => c.name === componentName);
      if (!component) continue;

      // Check if terminal command matches any keywords
      const matches = keywords.some(keyword => {
        if (keyword.endsWith('*')) {
          return terminal.command.startsWith(keyword.slice(0, -1)) ||
                 terminal.aliases.some(alias => alias.startsWith(keyword.slice(0, -1)));
        }
        return terminal.command === keyword ||
               terminal.aliases.includes(keyword) ||
               terminal.command.includes(keyword) ||
               terminal.description.toLowerCase().includes(keyword);
      });

      if (matches) return component;
    }

    return null;
  }

  /**
   * Assess parity between terminal and GUI features
   */
  private assessParity(terminal: TerminalFeature, gui: GUIComponent | null): 'complete' | 'partial' | 'missing' {
    if (!gui) return 'missing';
    if (gui.status === 'missing') return 'missing';
    if (gui.status === 'partial') return 'partial';
    
    // Additional logic to assess functional completeness
    const complexCommands = ['pov', 'trr', 'scenario', 'xsiam', 'gemini', 'bigquery'];
    if (complexCommands.some(cmd => terminal.command.startsWith(cmd))) {
      return gui.status === 'complete' ? 'complete' : 'partial';
    }

    return 'complete';
  }

  /**
   * Generate recommendations for improving parity
   */
  private generateRecommendations(terminal: TerminalFeature, gui: GUIComponent | null, parity: string): string[] {
    const recommendations: string[] = [];

    if (parity === 'missing') {
      if (!gui) {
        recommendations.push(`Create GUI component for ${terminal.command} functionality`);
        recommendations.push(`Design user interface for ${terminal.description.toLowerCase()}`);
        recommendations.push(`Implement data models and API integration`);
      } else {
        recommendations.push(`Implement missing GUI component: ${gui.name}`);
        recommendations.push(`Add ${terminal.command} functionality to existing GUI`);
      }
    }

    if (parity === 'partial') {
      recommendations.push(`Complete implementation of ${gui?.name || terminal.command}`);
      recommendations.push(`Add missing features from terminal command capabilities`);
      recommendations.push(`Ensure full functional equivalence with terminal interface`);
    }

    if (terminal.category === 'reporting' || terminal.command.includes('analytics')) {
      recommendations.push('Add data visualization and reporting capabilities');
      recommendations.push('Implement export and sharing functionality');
    }

    if (terminal.aliases.length > 0) {
      recommendations.push('Support multiple access patterns and shortcuts in GUI');
    }

    return recommendations;
  }

  /**
   * Determine implementation priority
   */
  private determinePriority(terminal: TerminalFeature, parity: string): 'high' | 'medium' | 'low' {
    const highPriorityCommands = [
      'pov', 'trr', 'xsiam', 'scenario', 'gemini', 'ai', 'bigquery', 'customer'
    ];
    const mediumPriorityCommands = [
      'search', 'help', 'status', 'export', 'create-gui', 'template'
    ];

    const isHighPriority = highPriorityCommands.some(cmd => 
      terminal.command.startsWith(cmd) || terminal.command === cmd
    );
    const isMediumPriority = mediumPriorityCommands.some(cmd => 
      terminal.command.startsWith(cmd) || terminal.command === cmd
    );

    if (isHighPriority && parity === 'missing') return 'high';
    if (isHighPriority) return 'medium';
    if (isMediumPriority && parity === 'missing') return 'medium';
    
    return 'low';
  }

  /**
   * Extract command arguments from usage string
   */
  private extractArgs(usage: string): string[] {
    const args: string[] = [];
    const argRegex = /\[([^\]]+)\]|\<([^>]+)\>/g;
    let match;
    
    while ((match = argRegex.exec(usage)) !== null) {
      args.push(match[1] || match[2]);
    }
    
    return args;
  }

  /**
   * Index audit results in knowledge base
   */
  private indexInKnowledgeBase(): void {
    // Add mapping documentation for each feature
    this.mappings.forEach(mapping => {
      const terminal = mapping.terminal;
      const gui = mapping.gui;
      
      KBUtils.addCommandDoc(
        terminal.command,
        terminal.description,
        terminal.usage,
        terminal.examples.length > 0 ? terminal.examples : [`${terminal.command} ${terminal.args.join(' ')}`]
      );

      if (gui) {
        KBUtils.addWorkflowDoc(
          `GUI: ${gui.name}`,
          `GUI equivalent for ${terminal.command} command: ${gui.description}`,
          [
            `Navigate to ${gui.path}`,
            'Use the interactive interface to perform operations',
            'Access all features through visual controls',
            'Export results and share with stakeholders'
          ],
          mapping.recommendations
        );
      }
    });

    // Add overall audit summary
    knowledgeBase.addEntry({
      id: 'audit_feature_parity',
      title: 'Terminal vs GUI Feature Parity Audit',
      content: this.generateAuditReport(),
      category: 'research',
      tags: ['audit', 'parity', 'terminal', 'gui', 'analysis'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Feature Audit System',
      searchable: true
    });
  }

  /**
   * Generate comprehensive audit report
   */
  private generateAuditReport(): string {
    const stats = {
      total: this.mappings.length,
      complete: this.mappings.filter(m => m.parity === 'complete').length,
      partial: this.mappings.filter(m => m.parity === 'partial').length,
      missing: this.mappings.filter(m => m.parity === 'missing').length,
      highPriority: this.mappings.filter(m => m.priority === 'high').length
    };

    const categories = this.groupBy(this.mappings, m => m.terminal.category);
    const priorities = this.groupBy(this.mappings, m => m.priority);

    return `# Terminal vs GUI Feature Parity Audit Report

## Executive Summary
- **Total Terminal Features**: ${stats.total}
- **Complete GUI Parity**: ${stats.complete} (${Math.round(stats.complete/stats.total*100)}%)
- **Partial GUI Parity**: ${stats.partial} (${Math.round(stats.partial/stats.total*100)}%)
- **Missing GUI Features**: ${stats.missing} (${Math.round(stats.missing/stats.total*100)}%)
- **High Priority Gaps**: ${stats.highPriority}

## Parity Status by Category
${Object.entries(categories).map(([category, mappings]) => `
### ${category.charAt(0).toUpperCase() + category.slice(1)}
- Complete: ${mappings.filter(m => m.parity === 'complete').length}
- Partial: ${mappings.filter(m => m.parity === 'partial').length}
- Missing: ${mappings.filter(m => m.parity === 'missing').length}
`).join('')}

## Priority Gap Analysis
${Object.entries(priorities).map(([priority, mappings]) => `
### ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
${mappings.filter(m => m.parity !== 'complete').map(m => 
  `- **${m.terminal.command}**: ${m.parity} (${m.gui?.name || 'No GUI equivalent'})`
).join('\n')}
`).join('')}

## Key Recommendations
1. **Immediate Action Required**: Implement missing high-priority GUI components
2. **Complete Partial Features**: Finish implementation of partially complete components
3. **Enhance User Experience**: Add GUI-specific improvements beyond terminal parity
4. **Maintain Feature Sync**: Establish process to keep terminal and GUI features aligned

## Missing GUI Components Requiring Implementation
${this.guiComponents.filter(c => c.status === 'missing').map(c => 
  `- **${c.name}**: ${c.description}`
).join('\n')}

## Terminal Commands Without GUI Equivalent
${this.mappings.filter(m => !m.gui).map(m => 
  `- **${m.terminal.command}**: ${m.terminal.description}`
).join('\n')}
`;
  }

  /**
   * Group items by key function
   */
  private groupBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {} as Record<K, T[]>);
  }

  /**
   * Get audit results
   */
  public getAuditResults() {
    return {
      terminalFeatures: this.terminalFeatures,
      guiComponents: this.guiComponents,
      mappings: this.mappings,
      summary: {
        totalTerminalFeatures: this.terminalFeatures.length,
        totalGUIComponents: this.guiComponents.length,
        completeComponents: this.guiComponents.filter(c => c.status === 'complete').length,
        partialComponents: this.guiComponents.filter(c => c.status === 'partial').length,
        missingComponents: this.guiComponents.filter(c => c.status === 'missing').length,
        completeParity: this.mappings.filter(m => m.parity === 'complete').length,
        partialParity: this.mappings.filter(m => m.parity === 'partial').length,
        missingParity: this.mappings.filter(m => m.parity === 'missing').length,
        highPriorityGaps: this.mappings.filter(m => m.priority === 'high' && m.parity !== 'complete').length
      }
    };
  }

  /**
   * Get recommendations for specific priority level
   */
  public getRecommendationsByPriority(priority: 'high' | 'medium' | 'low'): FeatureMapping[] {
    return this.mappings.filter(m => m.priority === priority && m.parity !== 'complete');
  }

  /**
   * Get missing GUI components
   */
  public getMissingGUIComponents(): GUIComponent[] {
    return this.guiComponents.filter(c => c.status === 'missing');
  }

  /**
   * Get terminal commands without GUI equivalent
   */
  public getOrphanedTerminalCommands(): TerminalFeature[] {
    return this.mappings.filter(m => !m.gui).map(m => m.terminal);
  }
}

// Export singleton instance
export const featureAuditor = new FeatureParityAuditor();