/**
 * POV Best Practices Types
 * Based on XSIAM PoV Best Practices Guide by Sean Ennis
 * Version 1.0 - Created 8/18/2025
 */

export type POVPhase =
  | 'discovery-planning'
  | 'logistics'
  | 'initial-deployment'
  | 'execution-measurement'
  | 'closure';

export interface BestPractice {
  id: string;
  title: string;
  description: string;
  phase: POVPhase;
  priority: 'critical' | 'high' | 'medium' | 'low';
  opportunityStage: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // Salesforce opportunity stages 1-8
  notes?: string;
  links?: {
    title: string;
    url: string;
    type: 'doc' | 'tool' | 'video' | 'form';
  }[];
  relatedTools?: string[];
  xqlExample?: string;
}

export interface POVBestPracticesChecklist {
  phase: POVPhase;
  phaseName: string;
  phaseDescription: string;
  practices: BestPractice[];
  completionPercentage?: number;
}

// Core Best Practices Data
export const POV_BEST_PRACTICES: POVBestPracticesChecklist[] = [
  {
    phase: 'discovery-planning',
    phaseName: 'PoV Discovery & Planning',
    phaseDescription: 'Foundation setting and scoping for successful XSIAM PoV',
    practices: [
      {
        id: 'bp-dp-001',
        title: 'Mandate core use cases & test criteria',
        description: 'Ensure differentiation and control of outcome through standardized use cases',
        phase: 'discovery-planning',
        priority: 'critical',
        opportunityStage: 3,
        notes: 'We have a set of core use cases that can be automatically deployed. Regardless of customer-provided use cases, ensure we show value through well understood, measured, and differentiated scenarios that apply to all customers.',
        relatedTools: ['POV Deployment Automation', 'SOC Framework']
      },
      {
        id: 'bp-dp-002',
        title: 'Map customer success criteria to core use cases',
        description: 'Translate customer feature lists into demonstrable end-to-end workflows',
        phase: 'discovery-planning',
        priority: 'critical',
        opportunityStage: 3,
        notes: 'Customers often have long lists of functional requirements. Use end-to-end use cases (collect → detect → respond → measure) to prove workflows and map back to individual success criteria. Think of use cases as a means to prove individual criteria.',
        relatedTools: ['POV Test Plan Generator']
      },
      {
        id: 'bp-dp-003',
        title: 'Use the PoV Test Plan Generator',
        description: 'Create consistent test plans that prove use cases and show XSIAM value',
        phase: 'discovery-planning',
        priority: 'high',
        opportunityStage: 3,
        notes: 'Consistent test plans ensure we prove use cases in a way that demonstrates XSIAM differentiation.',
        relatedTools: ['POV Test Plan Generator', 'POV Companion']
      },
      {
        id: 'bp-dp-004',
        title: 'Timebox the PoV',
        description: 'Complete all PoVs within 90 days maximum, ideally less',
        phase: 'discovery-planning',
        priority: 'high',
        opportunityStage: 3,
        notes: 'Start with a PoV end date (typically customer-driven). Set up workstreams and meeting cadences working backwards from end date, leaving time for value demonstration beyond just data onboarding.',
        relatedTools: ['Asana POV Template']
      },
      {
        id: 'bp-dp-005',
        title: 'Get SOC team commitment',
        description: 'Ensure SOC team has active seat at the table and is using the product',
        phase: 'discovery-planning',
        priority: 'critical',
        opportunityStage: 3,
        notes: 'SOC teams are the ultimate users of XSIAM. Set up DEDICATED weekly office hours focused on SOC use cases and value, separate from Engineering-led sessions. Knowledge transfer for SOC teams differs from Engineering teams.',
        relatedTools: ['Office Hours Scheduler']
      }
    ]
  },
  {
    phase: 'logistics',
    phaseName: 'PoV Logistics',
    phaseDescription: 'Operational cadence and stakeholder management',
    practices: [
      {
        id: 'bp-lg-001',
        title: 'Set standard PoV touchpoint cadence',
        description: '2-3 working sessions/week with Engineering, 1+ session/week with SOC',
        phase: 'logistics',
        priority: 'high',
        opportunityStage: 4,
        notes: 'Best practice: 2-3 working sessions per week with Engineering team (deploy & build), at least 1 session per week with SOC for knowledge transfer. Each touchpoint needs an agenda informed by current state.',
        relatedTools: ['Calendar Management', 'Asana']
      },
      {
        id: 'bp-lg-002',
        title: 'Set up dedicated office hours meetings',
        description: 'At least 1-2 office hours per week for open dialogue',
        phase: 'logistics',
        priority: 'high',
        opportunityStage: 4,
        notes: 'Office hours provide opportunity for Q&A outside typical working sessions. Ideally 2 per week: one for engineering topics, one for SOC.',
        relatedTools: ['Calendar Management']
      },
      {
        id: 'bp-lg-003',
        title: 'No meeting invites without agendas',
        description: 'Cancel meetings if not meaningful; always set agendas',
        phase: 'logistics',
        priority: 'medium',
        opportunityStage: 4,
        notes: 'If gaps exist in making progress (waiting for change requests, vacations), don\'t force meetings. Agenda setting is good meeting hygiene. Office hours cover off-the-cuff conversations.',
        relatedTools: ['Asana']
      },
      {
        id: 'bp-lg-004',
        title: 'Consider mid-PoV roadmap discussion',
        description: 'Schedule Product Council or PM roadmap session after base proficiency achieved',
        phase: 'logistics',
        priority: 'medium',
        opportunityStage: 5,
        notes: 'After users have base proficiency, roadmap presentations zoom them out to bigger picture and build excitement about development pace.',
        links: [
          {
            title: 'Executive Outreach Request (EOR) Guide',
            url: 'https://docs.google.com/presentation/d/1sPxuTvPi7o1HA5skD4kfOrYuUIZP-KILrrHvdktwqKQ/edit?slide=id.g2f3533b2975_0_486#slide=id.g2f3533b2975_0_486',
            type: 'doc'
          }
        ],
        relatedTools: ['Product Council', 'SFDC EOR']
      },
      {
        id: 'bp-lg-005',
        title: 'Audit customer login activity in tenant',
        description: 'Monitor who is using the tool and engage inactive teams',
        phase: 'logistics',
        priority: 'high',
        opportunityStage: 4,
        notes: 'Use UI or XQL against management_auditing dataset to capture user activity. Identify who isn\'t engaged and understand why.',
        xqlExample: `// User Authentication Activity (7 days)
config timeframe = 7d
| dataset = management_auditing
| filter management_auditing_type = ENUM.MANAGEMENT_AUDIT_AUTHENTICATION
    and subtype in ("Login", "SSO")
    and management_auditing_result = ENUM.MANAGEMENT_AUDIT_SUCCESS
| comp count() as total_authentications by user_name
| sort desc total_authentications

// Overall User Activity (7 days)
config timeframe = 7d
| dataset = management_auditing
| comp count() as total_audit_events by user_name
| sort desc total_audit_events`,
        relatedTools: ['XSIAM', 'XQL']
      },
      {
        id: 'bp-lg-006',
        title: 'Engage PANW Detections Team early',
        description: 'For deals >$1M with live testing or red teaming',
        phase: 'logistics',
        priority: 'medium',
        opportunityStage: 4,
        notes: 'For customers planning live testing/red teaming, engage detections team early to help analyze and tweak backend tenant tolerances.',
        links: [
          {
            title: 'Detections Team Engagement Form',
            url: 'https://docs.google.com/forms/d/e/1FAIpQLSf88Ws2VTNtXK6d_11ZEZyKPEuZai8tMkrUbe78onp7v9HOeQ/viewform',
            type: 'form'
          }
        ],
        relatedTools: ['Detections Team']
      },
      {
        id: 'bp-lg-007',
        title: 'Get added to customer CSP',
        description: 'Access tenant and open support cases on customer behalf',
        phase: 'logistics',
        priority: 'critical',
        opportunityStage: 4,
        notes: 'Customers must add you to their CSP for tenant access and TAC case management.',
        relatedTools: ['CSP Portal']
      }
    ]
  },
  {
    phase: 'initial-deployment',
    phaseName: 'PoV Initial Deployment',
    phaseDescription: 'Technical setup and initial configuration',
    practices: [
      {
        id: 'bp-id-001',
        title: 'Use the PoV Tenant Configurator',
        description: 'Automate initial tenant configuration including SOC Framework deployment',
        phase: 'initial-deployment',
        priority: 'critical',
        opportunityStage: 4,
        notes: 'Automates tenant configuration and initial use case/SOC framework deployment.',
        relatedTools: ['POV Tenant Configurator', 'SOC Framework', 'POV Companion']
      },
      {
        id: 'bp-id-002',
        title: 'Focus on end-to-end use cases',
        description: 'Demonstrate collect → detect → respond → measure workflows',
        phase: 'initial-deployment',
        priority: 'critical',
        opportunityStage: 4,
        notes: 'XSIAM shines with end-to-end workflows. Focus on 1-2 (max 3) complete use cases. Don\'t stop at detection - show analyst experience, adjust layouts, measure outcomes (e.g., MTTR reduction). Map customer success criteria to use cases to avoid feature-for-feature fights.',
        relatedTools: ['SOC Framework', 'Analytics', 'Case Management']
      },
      {
        id: 'bp-id-003',
        title: 'Start with core/high value data sources',
        description: 'Show early value with high-impact data sources and smooth onboarding',
        phase: 'initial-deployment',
        priority: 'high',
        opportunityStage: 4,
        notes: 'Deploy high-value use cases early to demonstrate ease-of-onboarding, stitching, and analytics up front.',
        links: [
          {
            title: 'Analytics Alert Reference by Data Source',
            url: 'https://docs-cortex.paloaltonetworks.com/r/Cortex-XSIAM/Cortex-XSIAM-Analytics-Alert-Reference-by-data-source/Cortex-XSIAM-Analytics-Alert-Reference',
            type: 'doc'
          }
        ],
        relatedTools: ['Data Ingestion', 'Analytics']
      },
      {
        id: 'bp-id-004',
        title: 'Deploy agents early (if in scope)',
        description: 'Start agent deployment workstream up front, use BYOS to augment',
        phase: 'initial-deployment',
        priority: 'high',
        opportunityStage: 4,
        notes: 'Agents are high-value in PoVs (analytics, response, causality). Agent deployment can be slow due to change control. Start early, even if not at scale. Use BYOS to augment.',
        relatedTools: ['XDR Agent', 'BYOS']
      },
      {
        id: 'bp-id-005',
        title: 'Choose analytics initiation method',
        description: 'Soakless vs normal based on timeline and data availability',
        phase: 'initial-deployment',
        priority: 'medium',
        opportunityStage: 4,
        notes: 'Soakless shows "art of the possible" without full data/soak periods but WILL produce false positives. Use when timeline is tight. If data volume and time aren\'t concerns, avoid soakless for higher accuracy.',
        relatedTools: ['Analytics Configuration']
      }
    ]
  },
  {
    phase: 'execution-measurement',
    phaseName: 'PoV Execution & Measurement',
    phaseDescription: 'Active testing, education, and metrics capture',
    practices: [
      {
        id: 'bp-em-001',
        title: 'BYOS - Turla Attack Simulation',
        description: 'Use controlled, repeatable attack scenarios with XDR and 3DR',
        phase: 'execution-measurement',
        priority: 'high',
        opportunityStage: 5,
        notes: 'BYOS controls narrative through repeatable, real-world attack scenarios. Negates need for customer red-teaming (inconsistent) and shows competitive advantage vs other EDR vendors.',
        relatedTools: ['BYOS', 'Turla Scenario', 'XDR Agent']
      },
      {
        id: 'bp-em-002',
        title: 'Analytics Whiteboard (customer education)',
        description: 'Educate on data processing, AI/ML techniques for enrichment and detection',
        phase: 'execution-measurement',
        priority: 'medium',
        opportunityStage: 5,
        notes: 'Differentiate during PoV. Whiteboard steps customers through core data processing mapped to AI/ML techniques for enrichment, profiling, and detection. Makes customers comfortable with our analytics methods.',
        links: [
          {
            title: 'Analytics Whiteboard Runthrough',
            url: 'https://drive.google.com/file/d/1n7RJmabq0LpNMzRWv-JatcQU5zRfoIoO/view?usp=drive_link',
            type: 'video'
          },
          {
            title: 'Analytics Whiteboard (Lucidchart)',
            url: 'https://lucid.app/lucidchart/30dbc496-c8e7-4d41-8e26-6d65fa7b3a62/edit?page=0_0&invitationId=inv_ea579c05-5f2e-4521-a2c7-5941d6b9643c#',
            type: 'doc'
          }
        ],
        relatedTools: ['Analytics', 'Lucidchart']
      },
      {
        id: 'bp-em-003',
        title: 'Open TAC cases early',
        description: 'Leverage TAC support, shelter customers during PoV',
        phase: 'execution-measurement',
        priority: 'high',
        opportunityStage: 5,
        notes: 'TAC is there to help. Be added to customer CSP to open cases on their behalf. Shelter customers from TAC cases during PoV so they can focus on learning platform value.',
        relatedTools: ['TAC', 'CSP Portal']
      },
      {
        id: 'bp-em-004',
        title: 'Track sizing and licensing requirements',
        description: 'Update DOR/SDW with production sizing learnings',
        phase: 'execution-measurement',
        priority: 'high',
        opportunityStage: 5,
        notes: 'Keep DOR/SDW updated with production sizing requirements discovered during PoV. Ask explicit questions. Critical for accurate quoting and PS scoping. Consider mid/end-PoV session to true up assumptions.',
        relatedTools: ['SFDC DOR', 'SDW Template']
      },
      {
        id: 'bp-em-005',
        title: 'Pay attention to user/identity fields',
        description: 'Special attention when creating correlation rules',
        phase: 'execution-measurement',
        priority: 'medium',
        opportunityStage: 5,
        notes: 'User and identity field mapping is critical for accurate correlation and detection logic.',
        relatedTools: ['Correlation Rules', 'XQL']
      },
      {
        id: 'bp-em-006',
        title: 'Analyze customer correlation rules',
        description: 'Show analytics coverage vs manually created rules',
        phase: 'execution-measurement',
        priority: 'medium',
        opportunityStage: 5,
        notes: 'Encourage customers to share existing correlation ruleset names/descriptions. Show analytics detections coverage vs current manual rules. Helps PS scope correlation rule creation.',
        relatedTools: ['Correlation Analysis Tool']
      },
      {
        id: 'bp-em-007',
        title: 'Capture metrics often for use cases',
        description: 'Document data volumes, automation stats, MTTR for business case',
        phase: 'execution-measurement',
        priority: 'critical',
        opportunityStage: 5,
        notes: 'Think of PoV readout: need business value metrics. Capture data volumes, automation stats (% automated, auto-closed), MTTR throughout PoV. Use dashboards including SOC Framework. Metrics by use case (e.g., phishing detection/response) enable customer comparison. Ask about current metrics.',
        relatedTools: ['SOC Framework', 'Dashboards', 'XQL']
      },
      {
        id: 'bp-em-008',
        title: 'Get ahead of CU/Cold storage discussion',
        description: 'Understand product usage that incurs CUs pre-production',
        phase: 'execution-measurement',
        priority: 'high',
        opportunityStage: 5,
        notes: 'Understand CU-incurring usage (playbooks running XQL, API XQL queries, cold storage queries). CUs difficult to estimate but critical for scoping. Set cold storage expectations (as of Aug 2025: not for frequent queries).',
        relatedTools: ['CU Calculator', 'Cold Storage']
      },
      {
        id: 'bp-em-009',
        title: 'XQL enablement (customer education)',
        description: 'Dedicate sessions to XQL training tailored to customer use cases',
        phase: 'execution-measurement',
        priority: 'high',
        opportunityStage: 5,
        notes: 'Consider 1-2 XQL enablement sessions tailored to customer use cases. Run through XQLympics. Focus on 3-5 basic use cases covering what SOC analysts/engineers need (search, filtering, data modeling). Parsing/data modeling is great time to introduce simple XQL.',
        links: [
          {
            title: 'XQLympics Training',
            url: 'https://lucid.app/lucidchart/30dbc496-c8e7-4d41-8e26-6d65fa7b3a62/edit?page=0_0&invitationId=inv_ea579c05-5f2e-4521-a2c7-5941d6b9643c#',
            type: 'doc'
          }
        ],
        relatedTools: ['XQL', 'XQLympics']
      }
    ]
  },
  {
    phase: 'closure',
    phaseName: 'PoV Closure',
    phaseDescription: 'Final readout and handoff preparation',
    practices: [
      {
        id: 'bp-cl-001',
        title: 'Use the PoV Readout Generator',
        description: 'Create consistent readouts mapped to business value',
        phase: 'closure',
        priority: 'critical',
        opportunityStage: 6,
        notes: 'Consistent PoV readouts mapped to business value and outcomes are critical.',
        relatedTools: ['POV Readout Generator', 'POV Companion']
      },
      {
        id: 'bp-cl-002',
        title: 'Tie business outcomes → use cases → success criteria',
        description: 'Map technical requirements to measured use cases and business outcomes',
        phase: 'closure',
        priority: 'critical',
        opportunityStage: 6,
        notes: 'Readout should map even basic technical requirements back to measured use cases, which map to business outcomes (aligned with business value team work).',
        relatedTools: ['Business Value Framework', 'POV Readout Generator']
      },
      {
        id: 'bp-cl-003',
        title: 'Include MITRE Dashboard Export',
        description: 'Show coverage and incident mapping that competitors can\'t',
        phase: 'closure',
        priority: 'high',
        opportunityStage: 6,
        notes: 'Simple export showing program-level output most competitors can\'t provide: MITRE ATT&CK coverage and where actual alerts/issues/cases/incidents were mapped during PoV.',
        relatedTools: ['MITRE Dashboard', 'Analytics']
      },
      {
        id: 'bp-cl-004',
        title: 'Finalize SDW',
        description: 'Ensure accurate scope for PS scoping after PoV',
        phase: 'closure',
        priority: 'critical',
        opportunityStage: 6,
        notes: 'SDWs often get stale by end of PoV. Update SDW throughout to capture accurate scope as you learn. After PoV, ensure completely accurate for PS scoping.',
        relatedTools: ['SDW Template', 'SFDC']
      }
    ]
  }
];

// Helper functions
export function getBestPracticesByPhase(phase: POVPhase): BestPractice[] {
  const checklist = POV_BEST_PRACTICES.find(c => c.phase === phase);
  return checklist?.practices || [];
}

export function getBestPracticeById(id: string): BestPractice | undefined {
  for (const checklist of POV_BEST_PRACTICES) {
    const practice = checklist.practices.find(p => p.id === id);
    if (practice) return practice;
  }
  return undefined;
}

export function getCriticalBestPractices(): BestPractice[] {
  const critical: BestPractice[] = [];
  POV_BEST_PRACTICES.forEach(checklist => {
    checklist.practices.forEach(practice => {
      if (practice.priority === 'critical') {
        critical.push(practice);
      }
    });
  });
  return critical;
}

export function searchBestPractices(query: string): BestPractice[] {
  const results: BestPractice[] = [];
  const lowerQuery = query.toLowerCase();

  POV_BEST_PRACTICES.forEach(checklist => {
    checklist.practices.forEach(practice => {
      if (
        practice.title.toLowerCase().includes(lowerQuery) ||
        practice.description.toLowerCase().includes(lowerQuery) ||
        practice.notes?.toLowerCase().includes(lowerQuery) ||
        practice.relatedTools?.some(tool => tool.toLowerCase().includes(lowerQuery))
      ) {
        results.push(practice);
      }
    });
  });

  return results;
}

// Metadata
export const POV_BEST_PRACTICES_METADATA = {
  createdBy: 'Sean Ennis',
  createdByEmail: 'sennis@paloaltonetworks.com',
  createdOn: '2025-08-18',
  version: '1.0',
  lastUpdatedOn: '2025-08-18',
  feedbackForm: 'https://form.asana.com/?k=SL3-agC7dDS3HFUGViYp8g&d=11915891072957',
  maintainedBy: 'TBD'
};
