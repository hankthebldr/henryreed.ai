/**
 * Workshop & Training Types
 * For DC enablement, certification, and continuous learning
 */

export type WorkshopStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type CohortType = 'in-person' | 'virtual' | 'hybrid';
export type CertificationStatus = 'not-started' | 'in-progress' | 'certified' | 'expired';

export interface WorkshopCohort {
  id: string;
  name: string;
  date: string;
  location: string;
  type: CohortType;
  capacity: number;
  enrolled: number;
  instructors: string[];
  facilitators: string[];
  status: WorkshopStatus;
}

export interface WorkshopModule {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  type: 'theory' | 'lab' | 'demo' | 'assessment';
  prerequisites?: string[]; // Module IDs
  deliverables: string[];
  tools: string[];
  knowledgeTopics: string[];
}

export interface WorkshopDay {
  day: number;
  title: string;
  goal: string;
  modules: WorkshopModule[];
}

export interface DCWorkshopProgress {
  dcId: string;
  dcName: string;
  dcEmail: string;
  workshopId: string;
  cohortId: string;
  enrollmentDate: string;
  status: WorkshopStatus;

  // Pre-Workshop
  preWorkCompleted: boolean;
  lmsAccessVerified: boolean;
  systemAccessVerified: boolean;

  // Day Progress
  currentDay: number;
  completedModules: string[]; // Module IDs

  // Deliverables
  deliverables: {
    moduleId: string;
    deliverableName: string;
    submitted: boolean;
    submittedDate?: string;
    asanaLink?: string;
    feedback?: string;
  }[];

  // Certification
  certificationStatus: CertificationStatus;
  certificationDate?: string;
  certificationExpiry?: string;
  assessmentScore?: number;

  // Post-Workshop
  officeHoursAttended: number;
  povsExecutedWithPlaybook: number;

  // Feedback
  npsScore?: number;
  feedback?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface Workshop {
  id: string;
  name: string;
  version: string;
  description: string;
  goal: string;

  // Metadata
  createdBy: string;
  createdOn: string;
  maintainedBy: string;
  lastUpdatedOn: string;

  // Target Audience
  targetRole: 'DC' | 'SE' | 'CSM' | 'All';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  secOpsFocused: boolean;

  // Structure
  duration: number; // days
  days: WorkshopDay[];

  // Cohorts
  cohorts: WorkshopCohort[];

  // Resources
  preWorkResources: {
    lmsModules: string[];
    sharedDriveLinks: string[];
    requiredReading: string[];
  };

  tools: {
    name: string;
    category: 'execution' | 'reporting' | 'enablement';
    description: string;
    accessRequired: boolean;
  }[];

  // KPIs
  kpis: {
    name: string;
    category: 'effectiveness' | 'efficiency' | 'impact';
    target: number;
    unit: string;
    description: string;
  }[];

  // Certification
  certificationName: string;
  certificationValidityDays: number;
  passingScore: number;

  // Supporting Documents
  syllabusUrl?: string;
  templateLinks: {
    name: string;
    url: string;
    type: string;
  }[];

  // Next Steps
  milestones: {
    name: string;
    dueDate?: string;
    owner: string;
    status: 'pending' | 'in-progress' | 'completed';
  }[];
}

export const XSIAM_PLAYBOOK_WORKSHOP: Workshop = {
  id: 'WORKSHOP-FY26-001',
  name: 'FY26 Playbook Workshop: Advanced Technical Win',
  version: '1.0',
  description: 'Simulate a complete, end-to-end Proof of Value (POV) engagement. Master the process, tools, and narrative required to secure the technical win.',
  goal: 'To simulate a complete, end-to-end POV engagement, focusing exclusively on mastering the process, tools, and narrative required to secure the technical win.',

  createdBy: 'Henry Reed',
  createdOn: '2025-08-18',
  maintainedBy: 'Henry Reed',
  lastUpdatedOn: '2025-09-01',

  targetRole: 'DC',
  experienceLevel: 'advanced',
  secOpsFocused: true,

  duration: 2,

  days: [
    {
      day: 1,
      title: 'POV Kickoff & Value Demonstration',
      goal: 'Plan the engagement, automate technical setup, and practice demonstrating foundational value',
      modules: [
        {
          id: 'D1M1',
          name: 'Mock POV Kickoff & Strategic Planning',
          description: 'Detailed review of playbook critical planning stages. Focus on scoping, success criteria, and Business Value Hypothesis.',
          duration: 240,
          type: 'theory',
          deliverables: [
            'POV Proposal Deck',
            'POV Test Plan',
            'Asana Project Board',
            'POV Huddle Summary'
          ],
          tools: ['POV Companion', 'Asana'],
          knowledgeTopics: [
            'Business Value Hypothesis framework',
            'Strategic risk assessment',
            'Success criteria definition',
            'POV scoping best practices'
          ]
        },
        {
          id: 'D1M2',
          name: 'Automated Execution & Demo Practice',
          description: 'Leverage playbook automation to accelerate time-to-value. Deploy SOC Framework and execute high-impact scenarios.',
          duration: 240,
          type: 'lab',
          prerequisites: ['D1M1'],
          deliverables: [
            'Configured XSIAM Tenant with SOC Framework',
            'Validated third-party syslog data ingestion',
            '10-minute demo presentation'
          ],
          tools: ['BYOS Sandbox', 'XSIAM Tenant', 'BVM Syslog Generator'],
          knowledgeTopics: [
            'SOC Framework deployment',
            'Gambit scenario execution',
            'XQL validation queries',
            'Demo presentation skills'
          ]
        }
      ]
    },
    {
      day: 2,
      title: 'Advanced Scenarios & Securing the Win',
      goal: 'Prove advanced capabilities against sophisticated threats and master the final readout to close the deal',
      modules: [
        {
          id: 'D2M1',
          name: 'Advanced Threat Emulation & Demo Practice',
          description: 'Execute MITRE ATT&CK-aligned scenarios to build credibility. Practice narrating the entire attack chain.',
          duration: 240,
          type: 'lab',
          prerequisites: ['D1M2'],
          deliverables: [
            'High-fidelity Turla incident',
            'Screenshot library with causality chain',
            '15-minute advanced demo script'
          ],
          tools: ['BYOS Sandbox', 'XSIAM Tenant', 'Turla MITRE Scenario'],
          knowledgeTopics: [
            'MITRE ATT&CK Framework',
            'Advanced incident investigation',
            'Attack narrative creation',
            'Causality chain analysis'
          ]
        },
        {
          id: 'D2M2',
          name: 'The Readout, The Blueprint, & The Win',
          description: 'Translate technical results into compelling win narrative. Ensure smooth post-sales handoff.',
          duration: 240,
          type: 'demo',
          prerequisites: ['D2M1'],
          deliverables: [
            'POV Readout Deck',
            'Badass Blueprint document',
            'Updated Salesforce opportunity',
            'Final 15-minute readout presentation'
          ],
          tools: ['POV Readout Template', 'Badass Blueprint Template', 'Salesforce'],
          knowledgeTopics: [
            'Technical-to-business translation',
            'Post-sales handoff practices',
            'Win narrative creation',
            'Salesforce opportunity management'
          ]
        }
      ]
    }
  ],

  cohorts: [
    {
      id: 'COHORT-NAM-001',
      name: 'Cohort 1 - NAM',
      date: '2025-11-10',
      location: 'Plano, TX (Iron Islands)',
      type: 'in-person',
      capacity: 20,
      enrolled: 18,
      instructors: ['Sean Ennis', 'Ben Sookying', 'Scott Brumley'],
      facilitators: ['Kevin Flanagan', 'Brad Cochran', 'Sharjeel Yost'],
      status: 'scheduled'
    },
    {
      id: 'COHORT-EMEA-001',
      name: 'Cohort 2 - EMEA',
      date: '2025-11-16',
      location: 'TBD',
      type: 'hybrid',
      capacity: 20,
      enrolled: 12,
      instructors: ['Sean Ennis', 'Ben Sookying'],
      facilitators: ['TBD'],
      status: 'scheduled'
    }
  ],

  preWorkResources: {
    lmsModules: [
      'Business Value Hypothesis Framework',
      'BYOS Scenario Guides: Gambit & Turla',
      'Asana POV Template Overview'
    ],
    sharedDriveLinks: [
      'https://drive.google.com/drive/fy26-playbook-resources',
      'https://drive.google.com/drive/pov-templates'
    ],
    requiredReading: [
      'XSIAM POV Best Practices Guide',
      'SOC Framework Documentation',
      'Badass Blueprint Examples'
    ]
  },

  tools: [
    {
      name: 'POV Companion',
      category: 'execution',
      description: 'Custom automation engine for generating proposals, test plans, and triggering XSIAM/SOC Framework configuration',
      accessRequired: true
    },
    {
      name: 'Asana',
      category: 'execution',
      description: 'Project management backbone for tracking POV tasks, milestones, and deliverables',
      accessRequired: true
    },
    {
      name: 'BYOS (Build Your Own Sandbox)',
      category: 'execution',
      description: 'Hands-on lab environment for executing standardized test scenarios like Gambit and Turla',
      accessRequired: true
    },
    {
      name: 'XSIAM Platform',
      category: 'execution',
      description: 'Deep platform knowledge including XQL, incident investigation, and dashboard customization',
      accessRequired: true
    },
    {
      name: 'Salesforce',
      category: 'reporting',
      description: 'System of record for logging POV summaries and documenting technical wins',
      accessRequired: true
    },
    {
      name: 'LMS (Learning Management System)',
      category: 'enablement',
      description: 'Platform for pre-workshop training, continuous learning, and certification assessment',
      accessRequired: true
    },
    {
      name: 'Slack/Teams',
      category: 'enablement',
      description: 'Real-time communication hub for questions, collaboration, and ongoing support',
      accessRequired: true
    }
  ],

  kpis: [
    {
      name: 'Certification Rate',
      category: 'effectiveness',
      target: 90,
      unit: '%',
      description: 'Percentage of attendees achieving XSIAM Playbook Certified status within 30 days'
    },
    {
      name: 'Attendee NPS',
      category: 'effectiveness',
      target: 8.5,
      unit: 'score',
      description: 'Net Promoter Score measuring perceived value of training'
    },
    {
      name: 'Playbook Adoption Rate',
      category: 'efficiency',
      target: 85,
      unit: '%',
      description: 'Percentage of new POVs using Asana template and POV Companion'
    },
    {
      name: 'POV Cycle Time',
      category: 'efficiency',
      target: 14,
      unit: 'days',
      description: 'Average time from POV kickoff to readout (target: decrease over time)'
    },
    {
      name: 'Time to First Value',
      category: 'efficiency',
      target: 2,
      unit: 'days',
      description: 'Average time from tenant deployment to first successful scenario demo'
    },
    {
      name: 'Technical Win Rate',
      category: 'impact',
      target: 75,
      unit: '%',
      description: 'Percentage of POVs resulting in formal technical win'
    },
    {
      name: 'POV-to-Close Conversion',
      category: 'impact',
      target: 65,
      unit: '%',
      description: 'Percentage of technical wins converting to closed-won deals'
    }
  ],

  certificationName: 'XSIAM Playbook Certified',
  certificationValidityDays: 365,
  passingScore: 85,

  syllabusUrl: 'https://docs.company.com/fy26-playbook-syllabus',

  templateLinks: [
    {
      name: 'POV Proposal Deck Template',
      url: 'https://drive.google.com/templates/pov-proposal',
      type: 'Google Slides'
    },
    {
      name: 'POV Readout Template',
      url: 'https://drive.google.com/templates/pov-readout',
      type: 'Google Slides'
    },
    {
      name: 'Badass Blueprint Template',
      url: 'https://drive.google.com/templates/badass-blueprint',
      type: 'Google Docs'
    },
    {
      name: 'Asana POV Project Template',
      url: 'https://app.asana.com/templates/pov-project',
      type: 'Asana'
    }
  ],

  milestones: [
    {
      name: 'Day 1 / Day 2 Schedule Finalized',
      owner: 'Brad Cochran',
      status: 'in-progress'
    },
    {
      name: 'Plano Venue & Catering Confirmed',
      owner: 'Sharjeel Yost',
      status: 'pending'
    },
    {
      name: 'AV Recording Setup Complete',
      owner: 'Kevin Flanagan',
      status: 'pending'
    },
    {
      name: 'LMS Videos Published',
      dueDate: '2025-10-15',
      owner: 'Sharjeel Yost',
      status: 'pending'
    }
  ]
};

// Helper function to calculate workshop completion percentage
export function calculateWorkshopCompletion(progress: DCWorkshopProgress, workshop: Workshop): number {
  const totalModules = workshop.days.reduce((sum, day) => sum + day.modules.length, 0);
  const completedModules = progress.completedModules.length;
  return Math.round((completedModules / totalModules) * 100);
}

// Helper function to get next required module
export function getNextModule(progress: DCWorkshopProgress, workshop: Workshop): WorkshopModule | null {
  for (const day of workshop.days) {
    for (const module of day.modules) {
      if (!progress.completedModules.includes(module.id)) {
        // Check if prerequisites are met
        if (module.prerequisites) {
          const prerequisitesMet = module.prerequisites.every(prereq =>
            progress.completedModules.includes(prereq)
          );
          if (!prerequisitesMet) continue;
        }
        return module;
      }
    }
  }
  return null;
}

// Helper function to check if DC is ready for certification
export function isReadyForCertification(progress: DCWorkshopProgress, workshop: Workshop): boolean {
  const totalModules = workshop.days.reduce((sum, day) => sum + day.modules.length, 0);
  const completedModules = progress.completedModules.length;

  return (
    progress.preWorkCompleted &&
    progress.lmsAccessVerified &&
    progress.systemAccessVerified &&
    completedModules === totalModules &&
    progress.status === 'completed'
  );
}
