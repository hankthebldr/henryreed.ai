'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CortexButton } from './CortexButton';
import { CortexCommandButton } from './CortexCommandButton';
import TRRDetailView from './TRRDetailView';

// Enhanced types for domain consultant workflow
interface CustomerEngagement {
  id: string;
  customerName: string;
  customerType: 'enterprise' | 'mid-market' | 'smb';
  industry: string;
  status: 'discovery' | 'presentation' | 'pilot' | 'evaluation' | 'negotiation' | 'closed-won' | 'closed-lost';
  stakeholders: {
    name: string;
    role: string;
    influence: 'high' | 'medium' | 'low';
    interest: 'high' | 'medium' | 'low';
    email: string;
    phone?: string;
    preferredContact: 'email' | 'phone' | 'slack';
  }[];
  requirements: {
    id: string;
    requirement: string;
    priority: 'must-have' | 'should-have' | 'nice-to-have';
    status: 'identified' | 'documented' | 'validated' | 'addressed';
    trrId?: string;
  }[];
  meetings: {
    id: string;
    type: 'discovery' | 'demo' | 'technical' | 'executive' | 'closing';
    date: string;
    attendees: string[];
    outcome: string;
    followUpActions: string[];
    nextSteps: string[];
  }[];
  notes: {
    id: string;
    content: string;
    type: 'observation' | 'concern' | 'opportunity' | 'action-item' | 'decision';
    createdAt: string;
    relatedTRRs: string[];
    confidential: boolean;
  }[];
  documents: {
    id: string;
    name: string;
    type: 'proposal' | 'technical-spec' | 'demo-script' | 'presentation' | 'contract' | 'datasheet';
    url?: string;
    sharedWith: string[];
    lastUpdated: string;
  }[];
  timeline: {
    phase: string;
    startDate: string;
    endDate?: string;
    milestones: {
      name: string;
      dueDate: string;
      completed: boolean;
      description: string;
    }[];
  }[];
  riskFactors: {
    id: string;
    factor: string;
    impact: 'high' | 'medium' | 'low';
    probability: 'high' | 'medium' | 'low';
    mitigation: string;
    status: 'identified' | 'mitigating' | 'resolved';
  }[];
  competitivePosition: {
    competitors: string[];
    advantages: string[];
    challenges: string[];
    winStrategy: string;
  };
  forecastData: {
    probability: number;
    expectedValue: number;
    expectedCloseDate: string;
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
  };
  createdAt: string;
  updatedAt: string;
  consultantId: string;
}

interface GuideStep {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'action' | 'checklist' | 'form' | 'documentation';
  required: boolean;
  completed: boolean;
  content?: {
    checklist?: string[];
    forms?: any;
    links?: { title: string; url: string }[];
    tips?: string[];
    warnings?: string[];
  };
}

interface SalesProcessGuide {
  id: string;
  name: string;
  description: string;
  stage: 'discovery' | 'presentation' | 'pilot' | 'evaluation' | 'negotiation' | 'closing';
  steps: GuideStep[];
  estimatedDuration: string;
  prerequisites?: string[];
  outcomes: string[];
}

interface TechnicalSalesTemplate {
  id: string;
  name: string;
  category: 'discovery' | 'demo' | 'pilot' | 'assessment' | 'proposal' | 'objection-handling';
  industry?: string;
  customerSize?: 'enterprise' | 'mid-market' | 'smb';
  useCase?: string;
  content: {
    overview: string;
    agenda: string[];
    keyMessages: string[];
    demoScript?: string;
    questions: string[];
    objectionResponses?: { objection: string; response: string }[];
    followUpActions: string[];
    materials: string[];
  };
  associatedTRRs: string[];
  createdAt: string;
  lastUsed?: string;
  successRate?: number;
}

// Mock data for domain consultant workspace
const sampleEngagement: CustomerEngagement = {
  id: 'eng-acme-2024',
  customerName: 'Acme Corporation',
  customerType: 'enterprise',
  industry: 'Financial Services',
  status: 'pilot',
  stakeholders: [
    {
      name: 'John Smith',
      role: 'CISO',
      influence: 'high',
      interest: 'high',
      email: 'john.smith@acme.com',
      phone: '+1-555-0123',
      preferredContact: 'email'
    },
    {
      name: 'Sarah Johnson',
      role: 'SOC Manager',
      influence: 'medium',
      interest: 'high',
      email: 'sarah.johnson@acme.com',
      preferredContact: 'email'
    },
    {
      name: 'Mike Davis',
      role: 'IT Director',
      influence: 'high',
      interest: 'medium',
      email: 'mike.davis@acme.com',
      preferredContact: 'phone'
    }
  ],
  requirements: [
    {
      id: 'req-1',
      requirement: 'SIEM integration with existing Splunk infrastructure',
      priority: 'must-have',
      status: 'validated',
      trrId: 'TRR-2024-001'
    },
    {
      id: 'req-2',
      requirement: 'Automated threat hunting capabilities',
      priority: 'must-have',
      status: 'documented',
      trrId: 'TRR-2024-002'
    },
    {
      id: 'req-3',
      requirement: 'Compliance reporting for SOX and PCI DSS',
      priority: 'should-have',
      status: 'identified'
    }
  ],
  meetings: [
    {
      id: 'meeting-1',
      type: 'discovery',
      date: '2024-01-15',
      attendees: ['John Smith', 'Sarah Johnson'],
      outcome: 'Identified key requirements and pain points with current SIEM',
      followUpActions: ['Create technical assessment TRR', 'Schedule demo session'],
      nextSteps: ['Present XSIAM capabilities demo', 'Provide integration architecture']
    },
    {
      id: 'meeting-2',
      type: 'demo',
      date: '2024-01-22',
      attendees: ['John Smith', 'Sarah Johnson', 'Mike Davis'],
      outcome: 'Strong positive reaction to automation capabilities',
      followUpActions: ['Develop pilot plan', 'Prepare technical integration TRRs'],
      nextSteps: ['Start 30-day pilot program', 'Define success metrics']
    }
  ],
  notes: [
    {
      id: 'note-1',
      content: 'Customer is very concerned about alert fatigue with current solution. XSIAM auto-correlation feature will be key selling point.',
      type: 'opportunity',
      createdAt: '2024-01-15T14:30:00Z',
      relatedTRRs: ['TRR-2024-001'],
      confidential: false
    },
    {
      id: 'note-2',
      content: 'Mike expressed budget concerns for Q1. May need to structure deal for Q2 implementation.',
      type: 'concern',
      createdAt: '2024-01-22T16:45:00Z',
      relatedTRRs: [],
      confidential: true
    }
  ],
  documents: [
    {
      id: 'doc-1',
      name: 'XSIAM Technical Architecture',
      type: 'technical-spec',
      sharedWith: ['john.smith@acme.com', 'mike.davis@acme.com'],
      lastUpdated: '2024-01-20T10:00:00Z'
    },
    {
      id: 'doc-2',
      name: 'Pilot Implementation Plan',
      type: 'proposal',
      sharedWith: ['john.smith@acme.com'],
      lastUpdated: '2024-01-24T15:30:00Z'
    }
  ],
  timeline: [
    {
      phase: 'Discovery',
      startDate: '2024-01-10',
      endDate: '2024-01-20',
      milestones: [
        {
          name: 'Initial requirements gathering',
          dueDate: '2024-01-15',
          completed: true,
          description: 'Understand current pain points and requirements'
        },
        {
          name: 'Stakeholder mapping',
          dueDate: '2024-01-18',
          completed: true,
          description: 'Identify all decision makers and influences'
        }
      ]
    },
    {
      phase: 'Demonstration',
      startDate: '2024-01-20',
      endDate: '2024-01-31',
      milestones: [
        {
          name: 'Technical demo',
          dueDate: '2024-01-22',
          completed: true,
          description: 'Demonstrate XSIAM capabilities'
        },
        {
          name: 'Executive presentation',
          dueDate: '2024-01-29',
          completed: false,
          description: 'Present business value to executive team'
        }
      ]
    }
  ],
  riskFactors: [
    {
      id: 'risk-1',
      factor: 'Budget constraints for Q1',
      impact: 'high',
      probability: 'medium',
      mitigation: 'Propose Q2 implementation with pilot in Q1',
      status: 'mitigating'
    },
    {
      id: 'risk-2',
      factor: 'Integration complexity with legacy systems',
      impact: 'medium',
      probability: 'low',
      mitigation: 'Comprehensive TRR validation and proof of integration',
      status: 'identified'
    }
  ],
  competitivePosition: {
    competitors: ['Splunk', 'QRadar'],
    advantages: ['Unified XDR platform', 'Advanced automation', 'Cloud-native architecture'],
    challenges: ['Higher upfront cost', 'Migration complexity'],
    winStrategy: 'Focus on total cost of ownership and operational efficiency gains'
  },
  forecastData: {
    probability: 75,
    expectedValue: 450000,
    expectedCloseDate: '2024-03-31',
    confidence: 'high',
    reasoning: 'Strong technical fit, engaged stakeholders, clear business case'
  },
  createdAt: '2024-01-10T09:00:00Z',
  updatedAt: '2024-01-24T16:00:00Z',
  consultantId: 'consultant-1'
};

const salesProcessGuides: SalesProcessGuide[] = [
  {
    id: 'guide-discovery',
    name: 'Customer Discovery Process',
    description: 'Comprehensive guide for initial customer discovery and requirements gathering',
    stage: 'discovery',
    estimatedDuration: '2-3 weeks',
    steps: [
      {
        id: 'step-1',
        title: 'Pre-meeting preparation',
        description: 'Research customer, industry, and current security posture',
        type: 'checklist',
        required: true,
        completed: false,
        content: {
          checklist: [
            'Research customer industry and compliance requirements',
            'Review customer public security incidents or news',
            'Identify current security tools from job postings or press releases',
            'Prepare industry-specific use cases and demos',
            'Create stakeholder mapping template'
          ],
          tips: [
            'Use LinkedIn to identify key security professionals',
            'Check Glassdoor for insights about company culture',
            'Review recent earnings calls for security investments mentioned'
          ]
        }
      },
      {
        id: 'step-2',
        title: 'Discovery meeting execution',
        description: 'Execute structured discovery meeting with key stakeholders',
        type: 'action',
        required: true,
        completed: false,
        content: {
          tips: [
            'Focus on pain points, not features',
            'Ask open-ended questions about current challenges',
            'Take detailed notes for TRR creation',
            'Identify all stakeholders in security decisions'
          ],
          warnings: [
            'Avoid pitching solutions during discovery',
            'Don\'t assume technical requirements without validation'
          ]
        }
      }
    ],
    outcomes: ['Complete requirements list', 'Stakeholder map', 'Initial TRRs created', 'Next meeting scheduled']
  }
];

const technicalSalesTemplates: TechnicalSalesTemplate[] = [
  {
    id: 'template-siem-demo',
    name: 'SIEM Migration Demo Script',
    category: 'demo',
    industry: 'Financial Services',
    customerSize: 'enterprise',
    useCase: 'SIEM Migration',
    content: {
      overview: 'Comprehensive demo showing XSIAM advantages over legacy SIEM solutions',
      agenda: [
        'Current SIEM pain points discussion (10 min)',
        'XSIAM architecture overview (15 min)',
        'Live demo: Data ingestion and correlation (20 min)',
        'Automation and playbook demonstration (15 min)',
        'Integration capabilities showcase (10 min)',
        'Q&A and next steps (10 min)'
      ],
      keyMessages: [
        'Unified XDR platform reduces tool sprawl',
        'AI-powered correlation reduces false positives by 80%',
        'Automated playbooks reduce MTTR from hours to minutes',
        'Cloud-native architecture scales with your business'
      ],
      demoScript: 'Start with simulated security incident -> Show detection -> Demonstrate investigation -> Execute automated response',
      questions: [
        'What is your biggest challenge with current SIEM?',
        'How many security tools does your team currently manage?',
        'What is your average time to resolve security incidents?',
        'How do you currently handle false positives?'
      ],
      followUpActions: [
        'Create technical integration TRRs',
        'Schedule pilot planning session',
        'Provide reference architecture document',
        'Connect with technical support team'
      ],
      materials: [
        'XSIAM architecture diagram',
        'SIEM comparison matrix',
        'Customer reference contacts',
        'Pilot implementation checklist'
      ]
    },
    associatedTRRs: ['TRR-2024-001', 'TRR-2024-002'],
    createdAt: '2024-01-01T00:00:00Z',
    lastUsed: '2024-01-22T14:00:00Z',
    successRate: 85
  }
];

interface DomainConsultantWorkspaceProps {
  selectedEngagement?: string;
  selectedTRR?: string;
}

export const DomainConsultantWorkspace: React.FC<DomainConsultantWorkspaceProps> = ({
  selectedEngagement,
  selectedTRR
}) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'engagement' | 'trr' | 'templates' | 'guides' | 'notes'>('dashboard');
  const [selectedEngagementId, setSelectedEngagementId] = useState<string>(selectedEngagement || sampleEngagement.id);
  const [selectedTRRId, setSelectedTRRId] = useState<string | null>(selectedTRR || null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeGuide, setActiveGuide] = useState<SalesProcessGuide | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<'observation' | 'concern' | 'opportunity' | 'action-item' | 'decision'>('observation');

  // Mock engagements - in production this would come from API
  const [engagements] = useState<CustomerEngagement[]>([sampleEngagement]);
  
  const currentEngagement = useMemo(() => 
    engagements.find(eng => eng.id === selectedEngagementId) || sampleEngagement, 
    [engagements, selectedEngagementId]
  );

  const engagementStats = useMemo(() => ({
    totalEngagements: engagements.length,
    activeEngagements: engagements.filter(e => !['closed-won', 'closed-lost'].includes(e.status)).length,
    totalTRRs: currentEngagement.requirements.length,
    completedTRRs: currentEngagement.requirements.filter(r => r.status === 'addressed').length,
    upcomingMeetings: currentEngagement.timeline.flatMap(t => t.milestones).filter(m => !m.completed).length,
    riskCount: currentEngagement.riskFactors.filter(r => r.status !== 'resolved').length
  }), [engagements, currentEngagement]);

  // Add new note functionality
  const addNote = useCallback(() => {
    if (!noteContent.trim()) return;
    
    const newNote = {
      id: `note-${Date.now()}`,
      content: noteContent,
      type: noteType,
      createdAt: new Date().toISOString(),
      relatedTRRs: selectedTRRId ? [selectedTRRId] : [],
      confidential: false
    };

    // In production, this would be an API call
    console.log('Adding note:', newNote);
    setNoteContent('');
  }, [noteContent, noteType, selectedTRRId]);

  const startGuide = (guide: SalesProcessGuide) => {
    setActiveGuide(guide);
    setShowGuideModal(true);
  };

  const renderDashboard = () => (
    <div className=\"space-y-6\">
      {/* Header */}
      <div className=\"flex items-center justify-between\">
        <div>
          <h1 className=\"text-3xl font-bold text-cortex-text-primary\">Domain Consultant Workspace</h1>
          <p className=\"text-cortex-text-secondary mt-1\">
            Manage customer engagements, TRRs, and technical sales workflows
          </p>
        </div>
        <div className=\"flex items-center space-x-3\">
          <CortexButton
            onClick={() => setActiveView('guides')}
            variant=\"outline\"
            icon=\"📚\"
          >
            Sales Guides
          </CortexButton>
          <CortexButton
            onClick={() => setActiveView('templates')}
            variant=\"outline\"
            icon=\"📄\"
          >
            Templates
          </CortexButton>
          <CortexCommandButton
            command=\"pov create --interactive\"
            variant=\"primary\"
            icon=\"🎯\"
          >
            New POV
          </CortexCommandButton>
        </div>
      </div>

      {/* Stats Overview */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4\">
        <div className=\"cortex-card p-4 text-center cursor-pointer hover:bg-cortex-bg-hover/50 transition-colors\"
             onClick={() => setActiveView('engagement')}>
          <div className=\"text-2xl font-bold text-cortex-info\">{engagementStats.activeEngagements}</div>
          <div className=\"text-sm text-cortex-text-secondary\">Active Engagements</div>
        </div>
        <div className=\"cortex-card p-4 text-center cursor-pointer hover:bg-cortex-bg-hover/50 transition-colors\"
             onClick={() => setActiveView('trr')}>
          <div className=\"text-2xl font-bold text-cortex-green\">{engagementStats.completedTRRs}</div>
          <div className=\"text-sm text-cortex-text-secondary\">Completed TRRs</div>
        </div>
        <div className=\"cortex-card p-4 text-center cursor-pointer hover:bg-cortex-bg-hover/50 transition-colors\">
          <div className=\"text-2xl font-bold text-cortex-warning\">{engagementStats.totalTRRs}</div>
          <div className=\"text-sm text-cortex-text-secondary\">Total TRRs</div>
        </div>
        <div className=\"cortex-card p-4 text-center cursor-pointer hover:bg-cortex-bg-hover/50 transition-colors\">
          <div className=\"text-2xl font-bold text-cortex-text-accent\">{engagementStats.upcomingMeetings}</div>
          <div className=\"text-sm text-cortex-text-secondary\">Upcoming Milestones</div>
        </div>
        <div className=\"cortex-card p-4 text-center cursor-pointer hover:bg-cortex-bg-hover/50 transition-colors\">
          <div className=\"text-2xl font-bold text-cortex-error\">{engagementStats.riskCount}</div>
          <div className=\"text-sm text-cortex-text-secondary\">Active Risks</div>
        </div>
        <div className=\"cortex-card p-4 text-center cursor-pointer hover:bg-cortex-bg-hover/50 transition-colors\">
          <div className=\"text-2xl font-bold text-cortex-green\">{Math.round(currentEngagement.forecastData.probability)}%</div>
          <div className=\"text-sm text-cortex-text-secondary\">Win Probability</div>
        </div>
      </div>

      {/* Current Engagement Overview */}
      <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">
        {/* Engagement Summary */}
        <div className=\"lg:col-span-2 cortex-card p-6\">
          <h3 className=\"text-xl font-semibold text-cortex-text-primary mb-4\">
            Current Engagement: {currentEngagement.customerName}
          </h3>
          <div className=\"space-y-4\">
            <div className=\"flex items-center justify-between\">
              <div className=\"flex items-center space-x-3\">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${\n                  currentEngagement.status === 'pilot' ? 'bg-cortex-info/10 text-cortex-info' :\n                  currentEngagement.status === 'discovery' ? 'bg-cortex-warning/10 text-cortex-warning' :\n                  currentEngagement.status === 'closed-won' ? 'bg-cortex-green/10 text-cortex-green' :\n                  'bg-cortex-text-muted/10 text-cortex-text-muted'\n                }`}>\n                  {currentEngagement.status.replace('-', ' ').toUpperCase()}\n                </span>\n                <span className=\"text-cortex-text-secondary\">{currentEngagement.industry}</span>\n              </div>\n              <div className=\"text-right\">\n                <div className=\"text-lg font-semibold text-cortex-text-primary\">\n                  ${currentEngagement.forecastData.expectedValue.toLocaleString()}\n                </div>\n                <div className=\"text-sm text-cortex-text-secondary\">\n                  Expected Close: {new Date(currentEngagement.forecastData.expectedCloseDate).toLocaleDateString()}\n                </div>\n              </div>\n            </div>\n            \n            <div className=\"border-t border-cortex-border-secondary pt-4\">\n              <h4 className=\"font-medium text-cortex-text-primary mb-2\">Key Stakeholders</h4>\n              <div className=\"flex flex-wrap gap-2\">\n                {currentEngagement.stakeholders.slice(0, 3).map(stakeholder => (\n                  <div key={stakeholder.email} className=\"flex items-center space-x-2 bg-cortex-bg-tertiary px-3 py-1 rounded\">\n                    <span className={`w-2 h-2 rounded-full ${\n                      stakeholder.influence === 'high' ? 'bg-cortex-error' :\n                      stakeholder.influence === 'medium' ? 'bg-cortex-warning' : 'bg-cortex-green'\n                    }`}></span>\n                    <span className=\"text-sm text-cortex-text-secondary\">{stakeholder.name}</span>\n                    <span className=\"text-xs text-cortex-text-muted\">({stakeholder.role})</span>\n                  </div>\n                ))}\n                {currentEngagement.stakeholders.length > 3 && (\n                  <span className=\"text-sm text-cortex-text-muted\">+{currentEngagement.stakeholders.length - 3} more</span>\n                )}\n              </div>\n            </div>\n\n            <div className=\"border-t border-cortex-border-secondary pt-4\">\n              <h4 className=\"font-medium text-cortex-text-primary mb-2\">Recent Activity</h4>\n              <div className=\"space-y-2\">\n                {currentEngagement.meetings.slice(0, 2).map(meeting => (\n                  <div key={meeting.id} className=\"flex items-start space-x-3\">\n                    <div className=\"w-2 h-2 rounded-full bg-cortex-green mt-2\"></div>\n                    <div className=\"flex-1 min-w-0\">\n                      <div className=\"text-sm text-cortex-text-primary\">\n                        {meeting.type.replace('-', ' ')} meeting - {new Date(meeting.date).toLocaleDateString()}\n                      </div>\n                      <div className=\"text-xs text-cortex-text-muted line-clamp-1\">{meeting.outcome}</div>\n                    </div>\n                  </div>\n                ))}\n              </div>\n            </div>\n          </div>\n        </div>\n\n        {/* Quick Actions */}\n        <div className=\"cortex-card p-6\">\n          <h3 className=\"text-lg font-semibold text-cortex-text-primary mb-4\">Quick Actions</h3>\n          <div className=\"space-y-3\">\n            <CortexButton\n              onClick={() => setActiveView('notes')}\n              variant=\"outline\"\n              icon=\"📝\"\n              className=\"w-full justify-start\"\n            >\n              Add Meeting Notes\n            </CortexButton>\n            <CortexCommandButton\n              command={`trr create --customer \"${currentEngagement.customerName}\" --interactive`}\n              variant=\"outline\"\n              icon=\"📋\"\n              className=\"w-full justify-start\"\n            >\n              Create New TRR\n            </CortexCommandButton>\n            <CortexButton\n              onClick={() => startGuide(salesProcessGuides[0])}\n              variant=\"outline\"\n              icon=\"🎯\"\n              className=\"w-full justify-start\"\n            >\n              Start Sales Process\n            </CortexButton>\n            <CortexCommandButton\n              command={`customer meeting schedule --customer \"${currentEngagement.customerName}\" --type technical-demo`}\n              variant=\"outline\"\n              icon=\"📅\"\n              className=\"w-full justify-start\"\n            >\n              Schedule Demo\n            </CortexCommandButton>\n            <CortexCommandButton\n              command={`pov report generate --customer \"${currentEngagement.customerName}\" --template executive-summary`}\n              variant=\"outline\"\n              icon=\"📊\"\n              className=\"w-full justify-start\"\n            >\n              Generate Report\n            </CortexCommandButton>\n          </div>\n\n          <div className=\"border-t border-cortex-border-secondary mt-6 pt-6\">\n            <h4 className=\"font-medium text-cortex-text-primary mb-3\">Recent Templates Used</h4>\n            <div className=\"space-y-2\">\n              {technicalSalesTemplates.slice(0, 2).map(template => (\n                <button\n                  key={template.id}\n                  onClick={() => setActiveView('templates')}\n                  className=\"w-full text-left p-2 rounded hover:bg-cortex-bg-hover/50 transition-colors\"\n                >\n                  <div className=\"text-sm text-cortex-text-primary\">{template.name}</div>\n                  <div className=\"text-xs text-cortex-text-muted\">\n                    Last used: {template.lastUsed ? new Date(template.lastUsed).toLocaleDateString() : 'Never'}\n                  </div>\n                </button>\n              ))}\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n\n  const renderNotes = () => (\n    <div className=\"space-y-6\">\n      <div className=\"flex items-center justify-between\">\n        <h2 className=\"text-2xl font-bold text-cortex-text-primary\">Meeting Notes & Observations</h2>\n        <CortexButton onClick={() => setActiveView('dashboard')} variant=\"outline\">\n          Back to Dashboard\n        </CortexButton>\n      </div>\n\n      {/* Add New Note */}\n      <div className=\"cortex-card p-6\">\n        <h3 className=\"text-lg font-semibold text-cortex-text-primary mb-4\">Add New Note</h3>\n        <div className=\"space-y-4\">\n          <div className=\"flex items-center space-x-4\">\n            <label className=\"text-sm font-medium text-cortex-text-secondary\">Type:</label>\n            <select\n              value={noteType}\n              onChange={(e) => setNoteType(e.target.value as any)}\n              className=\"px-3 py-1 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded text-cortex-text-primary\"\n            >\n              <option value=\"observation\">💡 Observation</option>\n              <option value=\"concern\">⚠️ Concern</option>\n              <option value=\"opportunity\">🎯 Opportunity</option>\n              <option value=\"action-item\">✅ Action Item</option>\n              <option value=\"decision\">🎯 Decision</option>\n            </select>\n          </div>\n          <textarea\n            value={noteContent}\n            onChange={(e) => setNoteContent(e.target.value)}\n            placeholder=\"Enter your note here...\"\n            rows={4}\n            className=\"w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50\"\n          />\n          <div className=\"flex justify-end\">\n            <CortexButton onClick={addNote} variant=\"primary\" icon=\"💾\">\n              Save Note\n            </CortexButton>\n          </div>\n        </div>\n      </div>\n\n      {/* Existing Notes */}\n      <div className=\"cortex-card p-6\">\n        <h3 className=\"text-lg font-semibold text-cortex-text-primary mb-4\">Recent Notes</h3>\n        <div className=\"space-y-4\">\n          {currentEngagement.notes.map(note => (\n            <div key={note.id} className=\"border-l-4 border-cortex-green pl-4 py-2\">\n              <div className=\"flex items-start justify-between\">\n                <div className=\"flex-1\">\n                  <div className=\"flex items-center space-x-2 mb-1\">\n                    <span className={`px-2 py-1 rounded text-xs ${\n                      note.type === 'opportunity' ? 'bg-cortex-green/10 text-cortex-green' :\n                      note.type === 'concern' ? 'bg-cortex-warning/10 text-cortex-warning' :\n                      note.type === 'action-item' ? 'bg-cortex-info/10 text-cortex-info' :\n                      'bg-cortex-text-muted/10 text-cortex-text-muted'\n                    }`}>\n                      {note.type.replace('-', ' ')}\n                    </span>\n                    {note.confidential && (\n                      <span className=\"px-2 py-1 bg-cortex-error/10 text-cortex-error rounded text-xs\">🔒 Confidential</span>\n                    )}\n                  </div>\n                  <p className=\"text-cortex-text-primary\">{note.content}</p>\n                  <div className=\"text-xs text-cortex-text-muted mt-1\">\n                    {new Date(note.createdAt).toLocaleString()}\n                    {note.relatedTRRs.length > 0 && (\n                      <span className=\"ml-2\">• Related TRRs: {note.relatedTRRs.join(', ')}</span>\n                    )}\n                  </div>\n                </div>\n              </div>\n            </div>\n          ))}\n        </div>\n      </div>\n    </div>\n  );\n\n  // Render based on active view\n  switch (activeView) {\n    case 'notes':\n      return renderNotes();\n    case 'engagement':\n      // In production, this would render detailed engagement management\n      return (\n        <div className=\"space-y-6\">\n          <div className=\"flex items-center justify-between\">\n            <h2 className=\"text-2xl font-bold text-cortex-text-primary\">Engagement Details</h2>\n            <CortexButton onClick={() => setActiveView('dashboard')} variant=\"outline\">\n              Back to Dashboard\n            </CortexButton>\n          </div>\n          <div className=\"cortex-card p-6\">\n            <p className=\"text-cortex-text-secondary\">Detailed engagement management view would be implemented here, including stakeholder management, requirements tracking, and timeline management.</p>\n          </div>\n        </div>\n      );\n    case 'trr':\n      // Integration with existing TRR management components\n      return (\n        <div className=\"space-y-6\">\n          <div className=\"flex items-center justify-between\">\n            <h2 className=\"text-2xl font-bold text-cortex-text-primary\">Technical Requirements Review</h2>\n            <CortexButton onClick={() => setActiveView('dashboard')} variant=\"outline\">\n              Back to Dashboard\n            </CortexButton>\n          </div>\n          <div className=\"cortex-card p-6\">\n            <p className=\"text-cortex-text-secondary\">This would integrate with the existing EnhancedTRRManagement component, filtered for the current engagement.</p>\n          </div>\n        </div>\n      );\n    case 'templates':\n      return (\n        <div className=\"space-y-6\">\n          <div className=\"flex items-center justify-between\">\n            <h2 className=\"text-2xl font-bold text-cortex-text-primary\">Technical Sales Templates</h2>\n            <CortexButton onClick={() => setActiveView('dashboard')} variant=\"outline\">\n              Back to Dashboard\n            </CortexButton>\n          </div>\n          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">\n            {technicalSalesTemplates.map(template => (\n              <div key={template.id} className=\"cortex-card p-6 hover:bg-cortex-bg-hover/50 transition-colors cursor-pointer\">\n                <div className=\"flex items-start justify-between mb-3\">\n                  <h3 className=\"text-lg font-semibold text-cortex-text-primary\">{template.name}</h3>\n                  <span className={`px-2 py-1 rounded text-xs ${\n                    template.category === 'demo' ? 'bg-cortex-info/10 text-cortex-info' :\n                    template.category === 'discovery' ? 'bg-cortex-warning/10 text-cortex-warning' :\n                    'bg-cortex-green/10 text-cortex-green'\n                  }`}>\n                    {template.category}\n                  </span>\n                </div>\n                <p className=\"text-cortex-text-secondary text-sm mb-3\">{template.content.overview}</p>\n                <div className=\"text-xs text-cortex-text-muted mb-3\">\n                  <span>{template.industry || 'All Industries'}</span> • \n                  <span>{template.customerSize || 'All Sizes'}</span>\n                </div>\n                {template.successRate && (\n                  <div className=\"flex items-center justify-between\">\n                    <span className=\"text-sm text-cortex-text-secondary\">Success Rate</span>\n                    <span className=\"text-sm font-semibold text-cortex-green\">{template.successRate}%</span>\n                  </div>\n                )}\n                <div className=\"mt-4 flex justify-between items-center\">\n                  <span className=\"text-xs text-cortex-text-muted\">\n                    {template.lastUsed ? `Last used: ${new Date(template.lastUsed).toLocaleDateString()}` : 'Never used'}\n                  </span>\n                  <CortexButton variant=\"outline\" size=\"sm\">\n                    Use Template\n                  </CortexButton>\n                </div>\n              </div>\n            ))}\n          </div>\n        </div>\n      );\n    case 'guides':\n      return (\n        <div className=\"space-y-6\">\n          <div className=\"flex items-center justify-between\">\n            <h2 className=\"text-2xl font-bold text-cortex-text-primary\">Sales Process Guides</h2>\n            <CortexButton onClick={() => setActiveView('dashboard')} variant=\"outline\">\n              Back to Dashboard\n            </CortexButton>\n          </div>\n          <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">\n            {salesProcessGuides.map(guide => (\n              <div key={guide.id} className=\"cortex-card p-6\">\n                <div className=\"flex items-start justify-between mb-3\">\n                  <h3 className=\"text-lg font-semibold text-cortex-text-primary\">{guide.name}</h3>\n                  <span className={`px-2 py-1 rounded text-xs ${\n                    guide.stage === 'discovery' ? 'bg-cortex-warning/10 text-cortex-warning' :\n                    guide.stage === 'presentation' ? 'bg-cortex-info/10 text-cortex-info' :\n                    'bg-cortex-green/10 text-cortex-green'\n                  }`}>\n                    {guide.stage}\n                  </span>\n                </div>\n                <p className=\"text-cortex-text-secondary text-sm mb-3\">{guide.description}</p>\n                <div className=\"text-xs text-cortex-text-muted mb-4\">\n                  <span>Duration: {guide.estimatedDuration}</span> • \n                  <span>{guide.steps.length} steps</span>\n                </div>\n                <div className=\"space-y-2 mb-4\">\n                  <h4 className=\"font-medium text-cortex-text-primary text-sm\">Expected Outcomes:</h4>\n                  <ul className=\"list-disc list-inside text-xs text-cortex-text-muted space-y-1\">\n                    {guide.outcomes.map((outcome, index) => (\n                      <li key={index}>{outcome}</li>\n                    ))}\n                  </ul>\n                </div>\n                <CortexButton \n                  onClick={() => startGuide(guide)}\n                  variant=\"primary\"\n                  size=\"sm\"\n                  icon=\"🚀\"\n                  className=\"w-full\"\n                >\n                  Start Guide\n                </CortexButton>\n              </div>\n            ))}\n          </div>\n        </div>\n      );\n    default:\n      return renderDashboard();\n  }\n};\n\nexport default DomainConsultantWorkspace;