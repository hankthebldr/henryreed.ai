'use client';

import React, { useState, useEffect } from 'react';
import CortexButton from './CortexButton';
import CortexCommandButton from './CortexCommandButton';
import TerminalWindow from './TerminalWindow';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  category: 'setup' | 'basics' | 'advanced' | 'best-practices';
  estimatedTime: number; // in minutes
  required: boolean;
  completed: boolean;
  interactive: boolean;
  content: {
    overview: string;
    objectives: string[];
    steps: {
      title: string;
      description: string;
      action?: string;
      command?: string;
      tips?: string[];
      warning?: string;
    }[];
    resources?: {
      title: string;
      url?: string;
      type: 'guide' | 'video' | 'documentation' | 'template';
    }[];
    validation?: {
      description: string;
      criteria: string[];
    };
  };
}

interface OnboardingProgress {
  totalSteps: number;
  completedSteps: number;
  currentCategory: string;
  timeSpent: number;
  lastActive: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'setup-workspace',
    title: 'Set Up Your Workspace',
    description: 'Configure your domain consultant environment and preferences',
    category: 'setup',
    estimatedTime: 15,
    required: true,
    completed: false,
    interactive: true,
    content: {
      overview: 'Get your Cortex DC Portal workspace configured for optimal productivity. This includes setting up your profile, preferences, and connecting to necessary systems.',
      objectives: [
        'Configure your consultant profile',
        'Set up notification preferences',
        'Connect to CRM and communication tools',
        'Customize your dashboard view'
      ],
      steps: [
        {
          title: 'Access the Workspace',
          description: 'Navigate to the Domain Consultant Workspace from the main portal',
          action: 'Click on the "Domain Consultant Workspace" tab or use the command below',
          command: 'workspace dc',
          tips: [
            'You can bookmark this page for quick access',
            'The workspace remembers your last active engagement'
          ]
        },
        {
          title: 'Complete Your Profile',
          description: 'Fill out your consultant profile with specializations and contact information',
          action: 'Click on your profile icon and select "Edit Profile"',
          tips: [
            'Include your industry specializations',
            'Add your preferred contact methods',
            'Upload a professional photo'
          ]
        },
        {
          title: 'Configure Notifications',
          description: 'Set up alerts for TRR updates, meeting reminders, and task deadlines',
          action: 'Go to Settings > Notifications',
          tips: [
            'Enable mobile notifications for urgent items',
            'Set quiet hours to avoid interruptions',
            'Choose different notification channels for different types of alerts'
          ]
        },
        {
          title: 'Connect External Systems',
          description: 'Link your CRM, calendar, and communication tools',
          command: 'crm connect --system salesforce',
          tips: [
            'OAuth connections are more secure than API keys',
            'Test the connection after setup',
            'You can connect multiple CRM systems if needed'
          ]
        }
      ],
      resources: [
        {
          title: 'Workspace Configuration Guide',
          type: 'guide'
        },
        {
          title: 'Integration Setup Video',
          type: 'video'
        }
      ],
      validation: {
        description: 'Verify your workspace is properly configured',
        criteria: [
          'Profile is complete with photo and specializations',
          'Notifications are configured and tested',
          'At least one external system is connected',
          'Dashboard shows current engagement data'
        ]
      }
    }
  },
  {
    id: 'first-engagement',
    title: 'Create Your First Engagement',
    description: 'Learn to set up and manage a customer engagement from start to finish',
    category: 'basics',
    estimatedTime: 30,
    required: true,
    completed: false,
    interactive: true,
    content: {
      overview: 'Master the fundamentals of engagement management by creating a practice engagement. You\'ll learn stakeholder mapping, requirement gathering, and timeline management.',
      objectives: [
        'Create a new customer engagement',
        'Map stakeholders with influence/interest matrix',
        'Document initial requirements',
        'Set up engagement timeline and milestones',
        'Add meeting notes and observations'
      ],
      steps: [
        {
          title: 'Create Practice Engagement',
          description: 'Create a sample engagement for learning purposes',
          command: 'customer profile create "Practice Corp" --industry technology --size mid-market',
          tips: [
            'Use realistic but fictional company information',
            'This practice engagement won\'t affect real data'
          ]
        },
        {
          title: 'Map Stakeholders',
          description: 'Add key stakeholders and map their influence and interest levels',
          action: 'Navigate to the Engagement Details and click "Add Stakeholder"',
          tips: [
            'Start with decision makers and budget holders',
            'Include both technical and business stakeholders',
            'Update influence/interest levels as you learn more'
          ]
        },
        {
          title: 'Capture Requirements',
          description: 'Document initial customer requirements and pain points',
          action: 'Use the Requirements section to add customer needs',
          tips: [
            'Focus on business outcomes, not technical features',
            'Prioritize requirements as must-have, should-have, or nice-to-have',
            'Link requirements to specific stakeholders when possible'
          ]
        },
        {
          title: 'Set Up Timeline',
          description: 'Create engagement phases and milestones',
          action: 'Configure the engagement timeline with discovery, demo, and pilot phases',
          tips: [
            'Be realistic with timeframes',
            'Include buffer time for unexpected delays',
            'Set clear deliverables for each milestone'
          ]
        },
        {
          title: 'Add Sample Notes',
          description: 'Practice the note-taking system with different note types',
          action: 'Add various types of notes to practice the system',
          tips: [
            'Try each note type: observation, concern, opportunity, action item, decision',
            'Practice linking notes to specific stakeholders or requirements',
            'Use the confidential flag for sensitive information'
          ]
        }
      ],
      resources: [
        {
          title: 'Engagement Management Best Practices',
          type: 'guide'
        },
        {
          title: 'Stakeholder Mapping Template',
          type: 'template'
        }
      ],
      validation: {
        description: 'Complete engagement setup validation',
        criteria: [
          'Practice engagement created with complete profile',
          'At least 3 stakeholders mapped with influence/interest levels',
          '3-5 requirements documented with priorities',
          'Timeline with 3 phases and 5+ milestones',
          'Sample notes of each type added'
        ]
      }
    }
  },
  {
    id: 'first-trr',
    title: 'Create and Manage TRRs',
    description: 'Master the TRR lifecycle from creation to blockchain signoff',
    category: 'basics',
    estimatedTime: 45,
    required: true,
    completed: false,
    interactive: true,
    content: {
      overview: 'Learn to create, validate, and manage Technical Requirements Reviews (TRRs). This includes using AI assistance, validation methods, and blockchain signoff.',
      objectives: [
        'Create a TRR from a customer requirement',
        'Use AI assistance for TRR enhancement',
        'Understand different validation methods',
        'Complete the TRR validation process',
        'Execute blockchain signoff'
      ],
      steps: [
        {
          title: 'Create Your First TRR',
          description: 'Convert a customer requirement into a formal TRR',
          command: 'trr create --customer "Practice Corp" --requirement "SIEM Integration" --priority high',
          tips: [
            'Be specific about the technical requirement',
            'Choose the appropriate priority level',
            'Include the customer context'
          ]
        },
        {
          title: 'Use AI Enhancement',
          description: 'Leverage AI to improve your TRR content',
          action: 'Click the AI assistance buttons to generate acceptance criteria and test cases',
          tips: [
            'Review AI suggestions carefully before accepting',
            'Customize generated content for your specific use case',
            'AI works better with detailed requirement descriptions'
          ]
        },
        {
          title: 'Add Acceptance Criteria',
          description: 'Define clear, measurable success criteria',
          action: 'Add 3-5 specific acceptance criteria that define successful completion',
          tips: [
            'Make criteria measurable and testable',
            'Include both functional and non-functional requirements',
            'Consider performance, security, and usability aspects'
          ]
        },
        {
          title: 'Plan Validation Method',
          description: 'Choose between manual, automated, or hybrid validation',
          action: 'Select the most appropriate validation method for your TRR',
          tips: [
            'Manual: Best for complex, one-time validations',
            'Automated: Ideal for repeatable, technical tests',
            'Hybrid: Combines human oversight with automated efficiency'
          ],
          warning: 'Consider customer preferences and technical constraints when choosing validation method'
        },
        {
          title: 'Complete Validation',
          description: 'Execute the validation process and collect evidence',
          action: 'Work through the validation steps and document results',
          tips: [
            'Take screenshots and record demonstrations',
            'Document any limitations or assumptions',
            'Include customer feedback in the results'
          ]
        },
        {
          title: 'Execute Blockchain Signoff',
          description: 'Create an immutable record of TRR completion',
          command: 'trr-signoff create [TRR-ID] --type technical --signer "Your Name"',
          tips: [
            'Only sign off when validation is truly complete',
            'Include relevant stakeholders in the signoff process',
            'The blockchain record cannot be modified'
          ]
        }
      ],
      resources: [
        {
          title: 'TRR Creation Guide',
          type: 'guide'
        },
        {
          title: 'Validation Methods Comparison',
          type: 'documentation'
        },
        {
          title: 'Blockchain Signoff Process',
          type: 'video'
        }
      ],
      validation: {
        description: 'TRR management proficiency check',
        criteria: [
          'TRR created with complete details and context',
          'AI assistance used to generate acceptance criteria',
          '5+ acceptance criteria defined and reviewed',
          'Validation method selected and justified',
          'Sample validation completed with evidence',
          'Blockchain signoff executed successfully'
        ]
      }
    }
  },
  {
    id: 'sales-process',
    title: 'Master Sales Process Guides',
    description: 'Learn to use guided workflows for consistent sales execution',
    category: 'basics',
    estimatedTime: 25,
    required: true,
    completed: false,
    interactive: true,
    content: {
      overview: 'Understand how to leverage sales process guides for consistent, effective customer engagements. Learn to customize guides for different scenarios.',
      objectives: [
        'Navigate the sales process guide library',
        'Execute a complete discovery process',
        'Customize guides for specific situations',
        'Track progress and outcomes',
        'Share learnings with the team'
      ],
      steps: [
        {
          title: 'Explore Guide Library',
          description: 'Browse available sales process guides',
          action: 'Navigate to the Sales Guides section and review available guides',
          tips: [
            'Guides are organized by sales stage',
            'Each guide includes estimated duration and outcomes',
            'Prerequisites are clearly marked'
          ]
        },
        {
          title: 'Start Discovery Guide',
          description: 'Execute the Customer Discovery Process guide',
          action: 'Click "Start Guide" on the Customer Discovery Process',
          tips: [
            'Follow each step carefully',
            'Use the checklist to ensure nothing is missed',
            'Take notes during the process'
          ]
        },
        {
          title: 'Complete Pre-Meeting Prep',
          description: 'Work through the preparation checklist',
          action: 'Complete all items in the pre-meeting preparation checklist',
          tips: [
            'Research is crucial for effective discovery',
            'Use multiple sources for customer information',
            'Prepare industry-specific questions'
          ]
        },
        {
          title: 'Practice Discovery Questions',
          description: 'Review and practice the recommended discovery questions',
          action: 'Study the guide\'s question framework and practice delivery',
          tips: [
            'Focus on open-ended questions',
            'Practice active listening techniques',
            'Prepare follow-up questions'
          ]
        },
        {
          title: 'Track Outcomes',
          description: 'Document what you learned and accomplished',
          action: 'Record outcomes and learnings from the guide execution',
          tips: [
            'Note what worked well and what could be improved',
            'Document any customizations you made',
            'Share insights with your team'
          ]
        }
      ],
      resources: [
        {
          title: 'Complete Sales Process Guide Library',
          type: 'guide'
        },
        {
          title: 'Customizing Guides for Your Industry',
          type: 'documentation'
        }
      ],
      validation: {
        description: 'Sales process guide proficiency',
        criteria: [
          'Explored guide library and understand organization',
          'Started and progressed through discovery guide',
          'Completed pre-meeting preparation checklist',
          'Reviewed and practiced discovery questions',
          'Documented outcomes and shared learnings'
        ]
      }
    }
  },
  {
    id: 'templates-usage',
    title: 'Leverage Templates Effectively',
    description: 'Master the use of sales and technical templates for efficiency',
    category: 'advanced',
    estimatedTime: 20,
    required: false,
    completed: false,
    interactive: true,
    content: {
      overview: 'Learn to effectively use and customize technical sales templates to accelerate your sales process and ensure consistency.',
      objectives: [
        'Understand template categories and use cases',
        'Customize templates for specific customers',
        'Track template performance and success rates',
        'Create your own templates',
        'Share successful templates with the team'
      ],
      steps: [
        {
          title: 'Explore Template Library',
          description: 'Browse available templates by category and industry',
          action: 'Navigate to Templates section and explore different categories',
          tips: [
            'Templates are organized by sales stage and use case',
            'Success rates help you choose the most effective templates',
            'Filter by industry or customer size for relevant options'
          ]
        },
        {
          title: 'Use a Demo Template',
          description: 'Select and customize a demo script template',
          action: 'Choose a demo template that matches your typical customer profile',
          tips: [
            'Customize the agenda for your customer\'s specific needs',
            'Modify key messages to address their pain points',
            'Update demo script with relevant use cases'
          ]
        },
        {
          title: 'Track Template Performance',
          description: 'Monitor how templates perform in real engagements',
          action: 'Review template success rates and your usage statistics',
          tips: [
            'Track win rates for different templates',
            'Note which customizations work best',
            'Document lessons learned for future use'
          ]
        },
        {
          title: 'Create Custom Template',
          description: 'Build a template based on your successful engagements',
          action: 'Create a new template from a successful engagement pattern',
          tips: [
            'Start with a proven successful approach',
            'Include specific talk tracks and questions',
            'Add tips and warnings based on experience'
          ]
        }
      ],
      resources: [
        {
          title: 'Template Creation Guide',
          type: 'guide'
        },
        {
          title: 'Template Best Practices',
          type: 'documentation'
        }
      ],
      validation: {
        description: 'Template usage mastery',
        criteria: [
          'Explored template library and understand categories',
          'Customized at least one demo template',
          'Reviewed template performance metrics',
          'Created or contributed to a custom template'
        ]
      }
    }
  },
  {
    id: 'analytics-insights',
    title: 'Use Analytics and Insights',
    description: 'Leverage data and AI insights to improve your sales performance',
    category: 'advanced',
    estimatedTime: 30,
    required: false,
    completed: false,
    interactive: true,
    content: {
      overview: 'Learn to use the analytics and AI insights features to improve your sales performance, identify trends, and make data-driven decisions.',
      objectives: [
        'Navigate the analytics dashboard',
        'Understand key performance metrics',
        'Use AI insights for deal strategy',
        'Track progress against goals',
        'Identify areas for improvement'
      ],
      steps: [
        {
          title: 'Explore Analytics Dashboard',
          description: 'Familiarize yourself with available metrics and reports',
          action: 'Navigate to the Analytics section and explore different views',
          tips: [
            'Personal dashboard shows your individual metrics',
            'Team analytics help with benchmarking',
            'Use filters to analyze specific time periods or industries'
          ]
        },
        {
          title: 'Review Win Rate Analysis',
          description: 'Understand your win rates by different dimensions',
          action: 'Analyze your win rates by industry, deal size, and sales stage',
          tips: [
            'Look for patterns in successful deals',
            'Identify industries or deal sizes where you excel',
            'Note which sales stages have the highest drop-off rates'
          ]
        },
        {
          title: 'Use AI Deal Scoring',
          description: 'Learn how AI calculates deal probability and risk factors',
          action: 'Review AI scores for your current deals',
          tips: [
            'Understand factors that contribute to high/low scores',
            'Use insights to focus effort on most promising deals',
            'Address identified risk factors proactively'
          ]
        },
        {
          title: 'Set Performance Goals',
          description: 'Use analytics to set realistic, data-driven goals',
          action: 'Set quarterly goals based on your historical performance',
          tips: [
            'Base goals on historical trends and improvement potential',
            'Set both activity and outcome goals',
            'Review progress weekly and adjust tactics as needed'
          ]
        }
      ],
      resources: [
        {
          title: 'Analytics Guide for Domain Consultants',
          type: 'guide'
        },
        {
          title: 'Understanding AI Deal Scoring',
          type: 'documentation'
        }
      ],
      validation: {
        description: 'Analytics proficiency validation',
        criteria: [
          'Navigated analytics dashboard and understand available metrics',
          'Analyzed personal win rate trends and patterns',
          'Reviewed AI deal scores and understand contributing factors',
          'Set data-driven performance goals'
        ]
      }
    }
  },
  {
    id: 'best-practices',
    title: 'Domain Consultant Best Practices',
    description: 'Learn proven strategies and avoid common pitfalls',
    category: 'best-practices',
    estimatedTime: 35,
    required: false,
    completed: false,
    interactive: false,
    content: {
      overview: 'Master the art of domain consulting with proven best practices, common pitfall avoidance, and advanced strategies for complex deals.',
      objectives: [
        'Understand proven engagement strategies',
        'Learn to avoid common pitfalls',
        'Master complex deal navigation',
        'Develop executive presence and communication',
        'Build long-term customer relationships'
      ],
      steps: [
        {
          title: 'Discovery Best Practices',
          description: 'Master the art of effective customer discovery',
          tips: [
            'Always start with business outcomes, not technical features',
            'Use the 70/20/10 rule: 70% listening, 20% asking questions, 10% talking',
            'Map the complete stakeholder ecosystem early',
            'Understand both explicit and implicit requirements'
          ],
          warning: 'Never pitch solutions during discovery - focus purely on understanding'
        },
        {
          title: 'Demo Excellence',
          description: 'Create compelling, customer-focused demonstrations',
          tips: [
            'Start every demo by restating the customer\'s key challenges',
            'Show don\'t tell - use real scenarios, not generic examples',
            'Make it interactive - get the customer to drive when possible',
            'End with clear next steps and value proposition summary'
          ]
        },
        {
          title: 'TRR Strategy',
          description: 'Strategically use TRRs to advance deals',
          tips: [
            'Create TRRs for every significant technical concern or requirement',
            'Use TRRs to demonstrate commitment to customer success',
            'Involve customer technical teams in TRR validation',
            'Use blockchain signoffs to build trust and credibility'
          ]
        },
        {
          title: 'Executive Engagement',
          description: 'Effectively communicate with C-level stakeholders',
          tips: [
            'Focus on business outcomes and ROI, not technical details',
            'Prepare one-page executive summaries for all meetings',
            'Use industry benchmarks and peer references',
            'Be prepared to address budget and competitive concerns'
          ]
        },
        {
          title: 'Deal Risk Management',
          description: 'Identify and mitigate deal risks proactively',
          tips: [
            'Regularly assess and update deal risk factors',
            'Develop specific mitigation plans for high-impact risks',
            'Use multiple stakeholders to reduce single points of failure',
            'Maintain momentum with regular check-ins and updates'
          ]
        }
      ],
      resources: [
        {
          title: 'Complete Best Practices Playbook',
          type: 'guide'
        },
        {
          title: 'Executive Communication Templates',
          type: 'template'
        },
        {
          title: 'Deal Risk Assessment Framework',
          type: 'documentation'
        }
      ],
      validation: {
        description: 'Best practices knowledge check',
        criteria: [
          'Understands discovery best practices and can apply them',
          'Can create compelling, customer-focused demonstrations',
          'Knows how to strategically use TRRs in deals',
          'Comfortable with executive-level communication',
          'Can identify and mitigate common deal risks'
        ]
      }
    }
  }
];

interface OnboardingGuideProps {
  onComplete?: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [progress, setProgress] = useState<OnboardingProgress>({
    totalSteps: onboardingSteps.length,
    completedSteps: 0,
    currentCategory: 'setup',
    timeSpent: 0,
    lastActive: new Date().toISOString()
  });
  const [showStepDetail, setShowStepDetail] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'setup', name: 'Initial Setup', icon: '⚙️', description: 'Configure your workspace and profile' },
    { id: 'basics', name: 'Basics', icon: '📚', description: 'Learn core functionality and workflows' },
    { id: 'advanced', name: 'Advanced', icon: '🎯', description: 'Master advanced features and techniques' },
    { id: 'best-practices', name: 'Best Practices', icon: '🏆', description: 'Proven strategies and tips' }
  ];

  const getStepsByCategory = (categoryId: string) => 
    onboardingSteps.filter(step => step.category === categoryId);

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    setProgress(prev => ({
      ...prev,
      completedSteps: prev.completedSteps + 1,
      lastActive: new Date().toISOString()
    }));
  };

  const startStep = (step: OnboardingStep) => {
    setCurrentStep(step);
    setShowStepDetail(true);
  };

  const renderStepDetail = () => {
    if (!currentStep) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-cortex-bg-primary rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-cortex-border-secondary">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-cortex-text-primary">{currentStep.title}</h2>
                <p className="text-cortex-text-secondary mt-1">{currentStep.description}</p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-cortex-text-muted">
                  <span>⏱️ {currentStep.estimatedTime} minutes</span>
                  <span className={`px-2 py-1 rounded ${
                    currentStep.category === 'setup' ? 'bg-cortex-info/10 text-cortex-info' :
                    currentStep.category === 'basics' ? 'bg-cortex-green/10 text-cortex-green' :
                    currentStep.category === 'advanced' ? 'bg-cortex-warning/10 text-cortex-warning' :
                    'bg-cortex-error/10 text-cortex-error'
                  }`}>
                    {categories.find(c => c.id === currentStep.category)?.name}
                  </span>
                  {currentStep.required && (
                    <span className="px-2 py-1 bg-cortex-error/10 text-cortex-error rounded">Required</span>
                  )}
                  {currentStep.interactive && (
                    <span className="px-2 py-1 bg-cortex-green/10 text-cortex-green rounded">Interactive</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowStepDetail(false)}
                className="text-cortex-text-muted hover:text-cortex-text-secondary"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Overview */}
            <div>
              <h3 className="text-lg font-semibold text-cortex-text-primary mb-2">Overview</h3>
              <p className="text-cortex-text-secondary">{currentStep.content.overview}</p>
            </div>

            {/* Objectives */}
            <div>
              <h3 className="text-lg font-semibold text-cortex-text-primary mb-2">Learning Objectives</h3>
              <ul className="list-disc list-inside text-cortex-text-secondary space-y-1">
                {currentStep.content.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <h3 className="text-lg font-semibold text-cortex-text-primary mb-3">Steps</h3>
              <div className="space-y-4">
                {currentStep.content.steps.map((step, index) => (
                  <div key={index} className="border border-cortex-border-secondary rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-cortex-green rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-cortex-text-primary mb-1">{step.title}</h4>
                        <p className="text-cortex-text-secondary mb-2">{step.description}</p>
                        
                        {step.action && (
                          <div className="bg-cortex-bg-tertiary p-3 rounded mb-2">
                            <div className="font-medium text-cortex-text-primary text-sm mb-1">Action Required:</div>
                            <div className="text-cortex-text-secondary text-sm">{step.action}</div>
                          </div>
                        )}

                        {step.command && (
                          <div className="space-y-3 mb-3">
                            <TerminalWindow
                              title={`Step ${index + 1} - ${step.title}`}
                              height="h-32"
                              readOnly
                              showPrompt={false}
                              initialOutput={
                                <div className="text-cyan-400">
                                  <div className="text-sm font-bold mb-1">📋 Command Example</div>
                                  <div className="font-mono text-green-400 text-sm mb-2">{step.command}</div>
                                  <div className="text-xs text-gray-400">Use the CLI guidance below to execute this command</div>
                                </div>
                              }
                            />
                            <div className="bg-cortex-bg-secondary p-3 rounded">
                              <div className="font-medium text-cortex-text-primary text-sm mb-1">CLI Guidance - Copy and execute:</div>
                              <div className="flex items-center justify-between">
                                <code className="text-cortex-green text-sm">{step.command}</code>
                                <CortexCommandButton
                                  command={step.command}
                                  variant="outline"
                                  size="sm"
                                >
                                  Execute
                                </CortexCommandButton>
                              </div>
                            </div>
                          </div>
                        )}

                        {step.warning && (
                          <div className="bg-cortex-warning/10 border-l-4 border-cortex-warning p-3 mb-2">
                            <div className="text-cortex-warning text-sm">⚠️ {step.warning}</div>
                          </div>
                        )}

                        {step.tips && step.tips.length > 0 && (
                          <div className="bg-cortex-info/10 p-3 rounded">
                            <div className="font-medium text-cortex-info text-sm mb-1">💡 Tips:</div>
                            <ul className="list-disc list-inside text-cortex-text-secondary text-sm space-y-1">
                              {step.tips.map((tip, tipIndex) => (
                                <li key={tipIndex}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            {currentStep.content.resources && currentStep.content.resources.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-cortex-text-primary mb-3">Additional Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentStep.content.resources.map((resource, index) => (
                    <div key={index} className="border border-cortex-border-secondary rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {resource.type === 'guide' ? '📖' :
                           resource.type === 'video' ? '🎥' :
                           resource.type === 'documentation' ? '📋' : '📄'}
                        </span>
                        <div>
                          <div className="text-cortex-text-primary text-sm font-medium">{resource.title}</div>
                          <div className="text-cortex-text-muted text-xs">{resource.type}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation */}
            {currentStep.content.validation && (
              <div>
                <h3 className="text-lg font-semibold text-cortex-text-primary mb-3">Validation Checklist</h3>
                <div className="bg-cortex-bg-tertiary p-4 rounded-lg">
                  <p className="text-cortex-text-secondary mb-3">{currentStep.content.validation.description}</p>
                  <div className="space-y-2">
                    {currentStep.content.validation.criteria.map((criterion, index) => (
                      <label key={index} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          className="mt-1 rounded border-cortex-border-secondary focus:ring-cortex-green"
                        />
                        <span className="text-cortex-text-secondary text-sm">{criterion}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-cortex-border-secondary">
            <div className="flex justify-between items-center">
              <CortexButton
                onClick={() => setShowStepDetail(false)}
                variant="outline"
              >
                Close
              </CortexButton>
              <CortexButton
                onClick={() => {
                  markStepComplete(currentStep.id);
                  setShowStepDetail(false);
                }}
                variant="primary"
                icon="✅"
                disabled={completedSteps.has(currentStep.id)}
              >
                {completedSteps.has(currentStep.id) ? 'Completed' : 'Mark Complete'}
              </CortexButton>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCategorySection = (category: typeof categories[0]) => {
    const steps = getStepsByCategory(category.id);
    const completedInCategory = steps.filter(step => completedSteps.has(step.id)).length;
    
    return (
      <div key={category.id} className="cortex-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{category.icon}</span>
            <div>
              <h3 className="text-xl font-semibold text-cortex-text-primary">{category.name}</h3>
              <p className="text-cortex-text-secondary text-sm">{category.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-cortex-text-muted">Progress</div>
            <div className="text-lg font-bold text-cortex-text-primary">
              {completedInCategory}/{steps.length}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                completedSteps.has(step.id)
                  ? 'border-cortex-green bg-cortex-green/5'
                  : 'border-cortex-border-secondary hover:border-cortex-green/50'
              }`}
              onClick={() => startStep(step)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                      completedSteps.has(step.id)
                        ? 'bg-cortex-green text-white'
                        : 'border border-cortex-border-secondary'
                    }`}>
                      {completedSteps.has(step.id) ? '✓' : ''}
                    </div>
                    <div>
                      <h4 className="font-medium text-cortex-text-primary">{step.title}</h4>
                      <p className="text-cortex-text-secondary text-sm">{step.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-cortex-text-muted">
                  <span>⏱️ {step.estimatedTime}m</span>
                  {step.required && <span className="text-cortex-error">Required</span>}
                  {step.interactive && <span className="text-cortex-green">Interactive</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-cortex-text-primary mb-2">Domain Consultant Onboarding</h1>
        <p className="text-cortex-text-secondary">
          Complete these guided steps to master the Cortex DC Portal and accelerate your success
        </p>
      </div>

      {/* Progress Overview */}
      <div className="cortex-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-cortex-text-primary">Your Progress</h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-cortex-green">
              {Math.round((completedSteps.size / progress.totalSteps) * 100)}%
            </div>
            <div className="text-sm text-cortex-text-secondary">Complete</div>
          </div>
        </div>
        
        <div className="w-full bg-cortex-bg-secondary rounded-full h-3 mb-4">
          <div
            className="bg-cortex-green h-3 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.size / progress.totalSteps) * 100}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {categories.map(category => {
            const steps = getStepsByCategory(category.id);
            const completed = steps.filter(step => completedSteps.has(step.id)).length;
            
            return (
              <div key={category.id}>
                <div className="text-lg font-semibold text-cortex-text-primary">
                  {completed}/{steps.length}
                </div>
                <div className="text-sm text-cortex-text-secondary">{category.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Sections */}
      <div className="space-y-6">
        {categories.map(category => renderCategorySection(category))}
      </div>

      {/* Completion */}
      {completedSteps.size === progress.totalSteps && (
        <div className="cortex-card p-6 text-center bg-cortex-green/5 border-cortex-green">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-cortex-text-primary mb-2">
            Congratulations! You've completed the onboarding.
          </h2>
          <p className="text-cortex-text-secondary mb-4">
            You're now ready to effectively use the Cortex DC Portal for your customer engagements.
          </p>
          {onComplete && (
            <CortexButton onClick={onComplete} variant="primary" icon="🚀">
              Start Using the Platform
            </CortexButton>
          )}
        </div>
      )}

      {/* Step Detail Modal */}
      {showStepDetail && renderStepDetail()}
    </div>
  );
};

export default OnboardingGuide;