import React from 'react';
import { CommandConfig } from './commands';

// Guide Data Models
interface Guide {
  id: string;
  title: string;
  description: string;
  category: 'pov' | 'technical' | 'customer' | 'demo' | 'competitive';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  steps: GuideStep[];
  tips: string[];
  resources: GuideResource[];
}

interface GuideStep {
  id: string;
  title: string;
  description: string;
  details: string[];
  commands?: string[];
  warnings?: string[];
  checkpoints?: string[];
  tips?: string[];
}

interface GuideResource {
  title: string;
  type: 'document' | 'template' | 'video' | 'tool';
  url: string;
  description: string;
}

// Mock guide data
const guides: Guide[] = [
  {
    id: 'pov-kickoff',
    title: 'POV Kickoff & Planning',
    description: 'Complete guide for initiating a successful proof-of-value engagement',
    category: 'pov',
    duration: '2-3 hours',
    difficulty: 'intermediate',
    prerequisites: ['Customer discovery completed', 'Stakeholder mapping done'],
    steps: [
      {
        id: 'step1',
        title: 'Pre-Kickoff Preparation',
        description: 'Prepare all necessary materials and information before the kickoff meeting',
        details: [
          'Review customer discovery notes and requirements',
          'Prepare stakeholder matrix with roles and influence levels',
          'Create preliminary timeline with key milestones',
          'Gather technical requirements and environment details',
          'Prepare success criteria template'
        ],
        commands: [
          'customer profile review --detailed',
          'pov template select --industry finance --use-case siem-migration',
          'resources stakeholder-matrix download'
        ],
        checkpoints: [
          'All stakeholders identified and mapped',
          'Technical requirements documented',
          'Success criteria template ready'
        ]
      },
      {
        id: 'step2',
        title: 'Kickoff Meeting Execution',
        description: 'Lead an effective POV kickoff meeting with all stakeholders',
        details: [
          'Open with clear agenda and objectives',
          'Review and validate understanding of requirements',
          'Present proposed timeline and milestones',
          'Define success criteria collaboratively',
          'Establish communication protocols',
          'Schedule next steps and regular check-ins'
        ],
        tips: [
          'Keep technical details high-level for executives',
          'Get explicit agreement on success criteria',
          'Document all decisions and next steps'
        ],
        checkpoints: [
          'Success criteria agreed upon',
          'Timeline accepted by all stakeholders',
          'Communication plan established'
        ]
      },
      {
        id: 'step3',
        title: 'Post-Kickoff Actions',
        description: 'Follow up with documentation and next step preparation',
        details: [
          'Send meeting summary within 24 hours',
          'Update POV tracking system with details',
          'Schedule technical deep-dive sessions',
          'Prepare demo environment requirements',
          'Set up regular progress check-ins'
        ],
        commands: [
          'pov create --from-kickoff-notes',
          'customer meeting schedule --next-steps',
          'demo environment prepare --requirements'
        ]
      }
    ],
    tips: [
      'Always confirm understanding before moving forward',
      'Get explicit commitment on timeline and resources',
      'Document everything - memory fades, documentation endures',
      'Focus on business outcomes, not just technical features'
    ],
    resources: [
      {
        title: 'POV Kickoff Presentation Template',
        type: 'template',
        url: '/resources/pov-kickoff-template.pptx',
        description: 'Customizable presentation template for POV kickoffs'
      },
      {
        title: 'Success Criteria Worksheet',
        type: 'document',
        url: '/resources/success-criteria-worksheet.pdf',
        description: 'Framework for defining measurable success criteria'
      }
    ]
  },
  {
    id: 'technical-demo-prep',
    title: 'Technical Demo Preparation',
    description: 'Master the art of preparing and delivering compelling technical demonstrations',
    category: 'demo',
    duration: '3-4 hours',
    difficulty: 'intermediate',
    prerequisites: ['XSIAM platform familiarity', 'Customer requirements understood'],
    steps: [
      {
        id: 'step1',
        title: 'Audience Analysis & Scenario Selection',
        description: 'Understand your audience and select the most impactful demo scenarios',
        details: [
          'Identify technical vs. executive audience members',
          'Map audience priorities to XSIAM capabilities',
          'Select 2-3 high-impact scenarios relevant to customer pain points',
          'Consider time constraints and attention spans',
          'Plan for interactive elements and Q&A'
        ],
        commands: [
          'customer stakeholder review --technical-audience',
          'xsiam scenarios list --relevant-to-customer',
          'demo scenario select --audience technical --use-case siem-migration'
        ]
      },
      {
        id: 'step2',
        title: 'Environment Setup & Testing',
        description: 'Prepare and validate your demonstration environment',
        details: [
          'Create customer-specific demo environment',
          'Load relevant sample data that mirrors customer environment',
          'Test all demo scenarios end-to-end',
          'Prepare backup scenarios for technical issues',
          'Set up screen sharing and presentation tools',
          'Prepare handout materials and follow-up resources'
        ],
        commands: [
          'demo environment create --customer acme --use-case siem-migration',
          'demo data generate --scenario insider-threat --realistic',
          'demo scenario test --full-walkthrough'
        ],
        warnings: [
          'Always test your demo scenarios before the meeting',
          'Have backup plans for technical difficulties',
          'Ensure all required data is properly anonymized'
        ]
      },
      {
        id: 'step3',
        title: 'Presentation Flow & Story Development',
        description: 'Create a compelling narrative that resonates with your audience',
        details: [
          'Start with the problem statement customer faces',
          'Show current state challenges and pain points',
          'Demonstrate XSIAM solution addressing each challenge',
          'Highlight unique differentiators and value props',
          'End with clear next steps and call to action'
        ],
        tips: [
          'Tell a story, don\'t just show features',
          'Use customer-relevant data and scenarios',
          'Keep technical depth appropriate for audience',
          'Build excitement and engagement throughout'
        ]
      }
    ],
    tips: [
      'Practice your demo multiple times before the customer presentation',
      'Always have a backup plan for technical issues',
      'Focus on business value, not just technical features',
      'Encourage questions and interaction throughout'
    ],
    resources: [
      {
        title: 'Demo Scenario Library',
        type: 'tool',
        url: '/resources/demo-scenarios',
        description: 'Collection of pre-built demo scenarios by use case'
      },
      {
        title: 'Technical Demo Best Practices',
        type: 'document',
        url: '/resources/demo-best-practices.pdf',
        description: 'Comprehensive guide to delivering effective technical demos'
      }
    ]
  },
  {
    id: 'objection-handling',
    title: 'Handling Common Objections',
    description: 'Professional techniques for addressing customer concerns and objections',
    category: 'competitive',
    duration: '1-2 hours',
    difficulty: 'advanced',
    prerequisites: ['XSIAM competitive positioning knowledge', 'Active listening skills'],
    steps: [
      {
        id: 'step1',
        title: 'Common Cost & Budget Objections',
        description: 'Address pricing concerns with value-focused responses',
        details: [
          '"Your solution is too expensive compared to our current tools"',
          'Response: Focus on TCO and operational efficiency gains',
          'Present ROI calculator with customer-specific metrics',
          'Highlight reduced staffing and infrastructure costs',
          'Show consolidation savings from replacing multiple tools'
        ],
        commands: [
          'resources roi-calculator --customer-size enterprise',
          'resources competitive-analysis --vs splunk --cost-comparison',
          'resources case-study --similar-customer --cost-savings'
        ]
      },
      {
        id: 'step2',
        title: 'Technical Capability Objections',
        description: 'Address concerns about technical features and capabilities',
        details: [
          '"We\'ve already invested heavily in [competitor solution]"',
          'Response: Acknowledge investment while highlighting incremental value',
          'Show integration capabilities and migration path',
          'Demonstrate unique capabilities not available elsewhere',
          'Present phased approach to minimize disruption'
        ],
        commands: [
          'xsiam integration show --with existing-tools',
          'resources migration-guide --from splunk --to xsiam',
          'demo scenario customize --show-integration'
        ]
      }
    ],
    tips: [
      'Listen actively and acknowledge concerns before responding',
      'Use questions to understand the root cause of objections',
      'Provide specific examples and proof points',
      'Stay professional and consultative, never argumentative'
    ],
    resources: [
      {
        title: 'Objection Handling Playbook',
        type: 'document',
        url: '/resources/objection-handling-playbook.pdf',
        description: 'Complete guide to handling common customer objections'
      },
      {
        title: 'Competitive Battle Cards',
        type: 'document',
        url: '/resources/competitive-battle-cards.pdf',
        description: 'Quick reference for competitive positioning'
      }
    ]
  },
  {
    id: 'xsiam-architecture-deepdive',
    title: 'XSIAM Architecture Deep Dive',
    description: 'Technical explanation of XSIAM architecture for technical audiences',
    category: 'technical',
    duration: '45-60 minutes',
    difficulty: 'advanced',
    prerequisites: ['Security architecture knowledge', 'Cloud platform familiarity'],
    steps: [
      {
        id: 'step1',
        title: 'Data Lake Architecture',
        description: 'Explain the foundational data lake and ingestion capabilities',
        details: [
          'Petabyte-scale data lake architecture',
          'Real-time and batch data ingestion methods',
          'Data normalization and enrichment pipeline',
          'Storage optimization and compression techniques',
          'Query performance and indexing strategies'
        ],
        commands: [
          'xsiam architecture explain --component data-lake',
          'xsiam capabilities show --data-ingestion --performance-metrics'
        ]
      },
      {
        id: 'step2',
        title: 'AI/ML Engine Components',
        description: 'Detail the artificial intelligence and machine learning capabilities',
        details: [
          'Behavioral analytics engine architecture',
          'Machine learning model training and deployment',
          'Threat intelligence correlation mechanisms',
          'Anomaly detection algorithms and tuning',
          'Continuous learning and model improvement'
        ],
        commands: [
          'xsiam architecture explain --component ai-ml-engine',
          'xsiam analytics demonstrate --behavioral-analysis'
        ]
      }
    ],
    tips: [
      'Use diagrams and visual aids to explain complex concepts',
      'Relate technical capabilities to business outcomes',
      'Allow time for detailed technical questions',
      'Prepare for deep technical discussions'
    ],
    resources: [
      {
        title: 'XSIAM Architecture Diagrams',
        type: 'document',
        url: '/resources/xsiam-architecture-diagrams.pdf',
        description: 'Detailed technical architecture diagrams'
      }
    ]
  }
];

const guideCategories = [
  { id: 'pov', name: 'POV Management', icon: '🎯', description: 'Proof-of-value planning and execution' },
  { id: 'technical', name: 'Technical', icon: '🔧', description: 'Technical knowledge and explanations' },
  { id: 'demo', name: 'Demonstrations', icon: '🎬', description: 'Demo preparation and delivery' },
  { id: 'customer', name: 'Customer Engagement', icon: '🏢', description: 'Customer interaction and relationship management' },
  { id: 'competitive', name: 'Competitive', icon: '⚔️', description: 'Competitive positioning and objection handling' }
];

export const guideCommands: CommandConfig[] = [
  {
    name: 'guide',
    description: 'Interactive how-to guides for domain consultant tasks',
    usage: 'guide [list|<guide-id>] [options]',
    aliases: ['howto', 'tutorial'],
    handler: (args) => {
      if (args.length === 0) {
        return (
          <div className="text-blue-300">
            <div className="font-bold mb-4 text-xl">📚 Domain Consultant How-To Guides</div>
            <div className="text-gray-300 mb-4">
              Interactive guides for mastering domain consultant tasks and improving customer engagement.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {guideCategories.map(category => (
                <div key={category.id} className="border border-gray-600 p-4 rounded">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{category.icon}</span>
                    <div className="text-green-400 font-bold text-lg">{category.name}</div>
                  </div>
                  <div className="text-sm text-gray-300 mb-3">{category.description}</div>
                  <div className="text-xs text-blue-400 font-mono">
                    guide list --category {category.id}
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-yellow-600 p-4 rounded">
              <div className="text-yellow-400 font-bold mb-2">🌟 Featured Guides</div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-mono text-green-400">guide pov-kickoff</span>
                  <span className="text-gray-400"> - Master POV planning and kickoff meetings</span>
                </div>
                <div>
                  <span className="font-mono text-blue-400">guide technical-demo-prep</span>
                  <span className="text-gray-400"> - Deliver compelling technical demonstrations</span>
                </div>
                <div>
                  <span className="font-mono text-purple-400">guide objection-handling</span>
                  <span className="text-gray-400"> - Handle customer objections professionally</span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      const subcommand = args[0];

      if (subcommand === 'list') {
        return handleGuideList(args.slice(1));
      }

      // Look for specific guide by ID
      const guide = guides.find(g => g.id === subcommand);
      if (guide) {
        return handleGuideShow(guide, args.slice(1));
      }

      return (
        <div className="text-red-400">
          Guide '{subcommand}' not found.
          <div className="mt-2 text-gray-300 text-sm">
            Run <span className="font-mono">guide list</span> to see available guides.
          </div>
        </div>
      );
    }
  }
];

const handleGuideList = (args: string[]) => {
  const categoryFilter = args.includes('--category') ? 
    args[args.indexOf('--category') + 1] : null;

  const filteredGuides = categoryFilter ? 
    guides.filter(g => g.category === categoryFilter) : guides;

  if (categoryFilter) {
    const category = guideCategories.find(c => c.id === categoryFilter);
    if (!category) {
      return <div className="text-red-400">Unknown category: {categoryFilter}</div>;
    }
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">
        📚 {categoryFilter ? 
          guideCategories.find(c => c.id === categoryFilter)?.name + ' ' : ''
        }Guides ({filteredGuides.length})
      </div>
      
      <div className="space-y-4">
        {filteredGuides.map(guide => (
          <div key={guide.id} className="border border-gray-600 p-4 rounded">
            <div className="flex justify-between items-start mb-2">
              <div className="font-bold text-green-400">{guide.title}</div>
              <div className="flex gap-2">
                <div className={`px-2 py-1 rounded text-xs ${
                  guide.difficulty === 'beginner' ? 'bg-green-800 text-green-200' :
                  guide.difficulty === 'intermediate' ? 'bg-yellow-800 text-yellow-200' :
                  'bg-red-800 text-red-200'
                }`}>
                  {guide.difficulty}
                </div>
                <div className="px-2 py-1 rounded text-xs bg-blue-800 text-blue-200">
                  {guide.duration}
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-300 mb-3">{guide.description}</div>
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {guide.steps.length} steps • {guide.category}
              </div>
              <div className="text-green-400 font-mono text-sm">
                guide {guide.id}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const handleGuideShow = (guide: Guide, args: string[]) => {
  const stepIndex = args.includes('--step') ? 
    parseInt(args[args.indexOf('--step') + 1]) - 1 : null;

  if (stepIndex !== null) {
    if (stepIndex < 0 || stepIndex >= guide.steps.length) {
      return <div className="text-red-400">Invalid step number. Guide has {guide.steps.length} steps.</div>;
    }
    return handleGuideStep(guide, guide.steps[stepIndex], stepIndex + 1);
  }

  return (
    <div className="text-blue-300">
      <div className="font-bold mb-4 text-xl">📖 {guide.title}</div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <div className="text-gray-300 mb-4">{guide.description}</div>
          
          {guide.prerequisites.length > 0 && (
            <div className="mb-4">
              <div className="text-yellow-400 font-bold mb-2">📋 Prerequisites</div>
              <ul className="text-sm space-y-1">
                {guide.prerequisites.map((prereq, idx) => (
                  <li key={idx} className="text-gray-300">• {prereq}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="border border-gray-600 p-3 rounded">
            <div className="text-purple-400 font-bold mb-1">⏱️ Duration</div>
            <div className="text-sm">{guide.duration}</div>
          </div>
          <div className="border border-gray-600 p-3 rounded">
            <div className="text-blue-400 font-bold mb-1">📊 Difficulty</div>
            <div className={`text-sm capitalize ${
              guide.difficulty === 'beginner' ? 'text-green-400' :
              guide.difficulty === 'intermediate' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {guide.difficulty}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-green-400 font-bold mb-3">📝 Guide Steps</div>
        <div className="space-y-3">
          {guide.steps.map((step, index) => (
            <div key={step.id} className="border border-gray-600 p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold text-white">
                  Step {index + 1}: {step.title}
                </div>
                <div className="text-blue-400 font-mono text-sm">
                  guide {guide.id} --step {index + 1}
                </div>
              </div>
              <div className="text-sm text-gray-300">{step.description}</div>
            </div>
          ))}
        </div>
      </div>

      {guide.tips.length > 0 && (
        <div className="mb-6">
          <div className="text-cyan-400 font-bold mb-2">💡 Pro Tips</div>
          <div className="bg-cyan-900/20 border border-cyan-600 p-3 rounded">
            <ul className="text-sm space-y-1">
              {guide.tips.map((tip, idx) => (
                <li key={idx} className="text-gray-300">• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {guide.resources.length > 0 && (
        <div className="mb-6">
          <div className="text-orange-400 font-bold mb-2">📎 Related Resources</div>
          <div className="space-y-2">
            {guide.resources.map((resource, idx) => (
              <div key={idx} className="border border-gray-600 p-2 rounded flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm">{resource.title}</div>
                  <div className="text-xs text-gray-400">{resource.description}</div>
                </div>
                <div className="text-xs bg-orange-800 text-orange-200 px-2 py-1 rounded">
                  {resource.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 bg-gray-800 rounded border border-green-600">
        <div className="text-green-400 font-bold mb-1">🚀 Quick Start</div>
        <div className="text-sm text-gray-300">
          Begin with Step 1: <span className="font-mono text-blue-400">guide {guide.id} --step 1</span>
        </div>
      </div>
    </div>
  );
};

const handleGuideStep = (guide: Guide, step: GuideStep, stepNumber: number) => {
  return (
    <div className="text-blue-300">
      <div className="font-bold mb-2 text-lg">
        📖 {guide.title} - Step {stepNumber}
      </div>
      <div className="font-bold mb-4 text-xl text-green-400">{step.title}</div>
      
      <div className="text-gray-300 mb-4">{step.description}</div>

      <div className="mb-6">
        <div className="text-cyan-400 font-bold mb-2">📋 Action Items</div>
        <div className="space-y-2">
          {step.details.map((detail, idx) => (
            <div key={idx} className="flex items-start">
              <span className="text-green-400 mr-2 mt-1">•</span>
              <span className="text-sm">{detail}</span>
            </div>
          ))}
        </div>
      </div>

      {step.commands && step.commands.length > 0 && (
        <div className="mb-6">
          <div className="text-yellow-400 font-bold mb-2">⚡ Helpful Commands</div>
          <div className="bg-black p-3 rounded">
            {step.commands.map((command, idx) => (
              <div key={idx} className="font-mono text-green-400 text-sm mb-1">
                {command}
              </div>
            ))}
          </div>
        </div>
      )}

      {step.warnings && step.warnings.length > 0 && (
        <div className="mb-6">
          <div className="text-red-400 font-bold mb-2">⚠️ Important Warnings</div>
          <div className="bg-red-900/20 border border-red-600 p-3 rounded">
            <ul className="text-sm space-y-1">
              {step.warnings.map((warning, idx) => (
                <li key={idx} className="text-red-300">• {warning}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {step.checkpoints && step.checkpoints.length > 0 && (
        <div className="mb-6">
          <div className="text-purple-400 font-bold mb-2">✅ Success Checkpoints</div>
          <div className="space-y-2">
            {step.checkpoints.map((checkpoint, idx) => (
              <div key={idx} className="flex items-center">
                <span className="text-purple-400 mr-2">☐</span>
                <span className="text-sm">{checkpoint}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
        <div>
          {stepNumber > 1 && (
            <span className="text-blue-400 font-mono text-sm mr-4">
              guide {guide.id} --step {stepNumber - 1}
            </span>
          )}
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400">
            Step {stepNumber} of {guide.steps.length}
          </div>
        </div>
        <div>
          {stepNumber < guide.steps.length && (
            <span className="text-green-400 font-mono text-sm">
              guide {guide.id} --step {stepNumber + 1}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
