// DC Context Store - Manages user-specific workflow data and state
// Integrates with existing GUI components and persists workflow context

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'dc' | 'se' | 'manager';
  region: 'AMER' | 'EMEA' | 'APJ';
  specializations: string[];
  createdAt: string;
  lastActive: string;
}

export interface CustomerEngagement {
  id: string;
  ownerId?: string;
  name: string;
  industry: string;
  size: 'startup' | 'smb' | 'mid-market' | 'enterprise';
  maturityLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
  primaryConcerns: string[];
  techStack: string[];
  stakeholders: {
    name: string;
    role: string;
    influence: 'high' | 'medium' | 'low';
    technical: boolean;
  }[];
  timeline: {
    startDate: string;
    targetDecision: string;
    keyMilestones: { name: string; date: string; status: 'pending' | 'complete' | 'at-risk' }[];
  };
  budget: {
    range: string;
    decisionMaker: string;
    approvalProcess: string;
  };
  competition: string[];
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivePOV {
  id: string;
  ownerId?: string;
  customerId: string;
  name: string;
  status: 'planning' | 'executing' | 'completed' | 'on-hold';
  scenarios: {
    id: string;
    name: string;
    type: string;
    status: 'planned' | 'deployed' | 'validated' | 'completed';
    results?: string;
    customerFeedback?: string;
  }[];
  objectives: string[];
  successMetrics: string[];
  timeline: {
    planned: string;
    actual?: string;
    milestones: { name: string; planned: string; actual?: string; }[];
  };
  resources: {
    dcHours: number;
    seHours: number;
    infrastructure: string[];
  };
  outcomes: {
    technicalWins: string[];
    businessImpact: string[];
    lessonsLearned: string[];
  };
  nextSteps: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TRRRecord {
  id: string;
  ownerId?: string;
  customerId: string;
  povId?: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'pending' | 'in-review' | 'validated' | 'failed' | 'blocked';
  description: string;
  acceptanceCriteria: string[];
  validationMethod: string;
  validationEvidence?: string[];
  assignedTo: string;
  reviewers: string[];
  timeline: {
    created: string;
    targetValidation: string;
    actualValidation?: string;
  };
  dependencies: string[];
  riskLevel: 'low' | 'medium' | 'high';
  businessImpact: string;
  customerStakeholder: string;
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowHistory {
  id: string;
  userId: string;
  workflowType: string;
  action: string;
  context: any;
  aiRecommendations?: any;
  outcome: string;
  duration: number;
  timestamp: string;
}

class DCContextStore {
  private static instance: DCContextStore;
  private data: {
    currentUser: UserProfile | null;
    customerEngagements: Map<string, CustomerEngagement>;
    activePOVs: Map<string, ActivePOV>;
    trrRecords: Map<string, TRRRecord>;
    workflowHistory: WorkflowHistory[];
  } = {
    currentUser: null,
    customerEngagements: new Map(),
    activePOVs: new Map(),
    trrRecords: new Map(),
    workflowHistory: []
  };

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): DCContextStore {
    if (!DCContextStore.instance) {
      DCContextStore.instance = new DCContextStore();
    }
    return DCContextStore.instance;
  }

  // Load data from localStorage/sessionStorage
  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('dc_context_store');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.data.currentUser = parsed.currentUser;
        this.data.customerEngagements = new Map(parsed.customerEngagements || []);
        this.data.activePOVs = new Map(parsed.activePOVs || []);
        this.data.trrRecords = new Map(parsed.trrRecords || []);
        this.data.workflowHistory = parsed.workflowHistory || [];
      }
    } catch (error) {
      console.warn('Failed to load DC context from storage:', error);
    }
  }

  // Save data to localStorage
  private saveToStorage() {
    if (typeof window === 'undefined') return;

    try {
      const toSave = {
        currentUser: this.data.currentUser,
        customerEngagements: Array.from(this.data.customerEngagements.entries()),
        activePOVs: Array.from(this.data.activePOVs.entries()),
        trrRecords: Array.from(this.data.trrRecords.entries()),
        workflowHistory: this.data.workflowHistory.slice(-100) // Keep last 100 entries
      };
      localStorage.setItem('dc_context_store', JSON.stringify(toSave));
    } catch (error) {
      console.warn('Failed to save DC context to storage:', error);
    }
  }

  // User Management
  setCurrentUser(user: UserProfile) {
    this.data.currentUser = user;
    this.saveToStorage();
  }

  getCurrentUser(): UserProfile | null {
    return this.data.currentUser;
  }

  // Customer Engagement Management
  addCustomerEngagement(engagement: CustomerEngagement) {
    this.data.customerEngagements.set(engagement.id, engagement);
    this.saveToStorage();
  }

  getCustomerEngagement(id: string): CustomerEngagement | undefined {
    return this.data.customerEngagements.get(id);
  }

  getAllCustomerEngagements(): CustomerEngagement[] {
    return Array.from(this.data.customerEngagements.values());
  }

  updateCustomerEngagement(id: string, updates: Partial<CustomerEngagement>) {
    const existing = this.data.customerEngagements.get(id);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      this.data.customerEngagements.set(id, updated);
      this.saveToStorage();
    }
  }

  // POV Management
  addActivePOV(pov: ActivePOV) {
    this.data.activePOVs.set(pov.id, pov);
    this.saveToStorage();
  }

  getActivePOV(id: string): ActivePOV | undefined {
    return this.data.activePOVs.get(id);
  }

  getAllActivePOVs(): ActivePOV[] {
    return Array.from(this.data.activePOVs.values());
  }

  updateActivePOV(id: string, updates: Partial<ActivePOV>) {
    const existing = this.data.activePOVs.get(id);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      this.data.activePOVs.set(id, updated);
      this.saveToStorage();
    }
  }

  // TRR Management
  addTRRRecord(trr: TRRRecord) {
    this.data.trrRecords.set(trr.id, trr);
    this.saveToStorage();
  }

  getTRRRecord(id: string): TRRRecord | undefined {
    return this.data.trrRecords.get(id);
  }

  getAllTRRRecords(): TRRRecord[] {
    return Array.from(this.data.trrRecords.values());
  }

  getTRRsByCustomer(customerId: string): TRRRecord[] {
    return this.getAllTRRRecords().filter(trr => trr.customerId === customerId);
  }

  getTRRsByPOV(povId: string): TRRRecord[] {
    return this.getAllTRRRecords().filter(trr => trr.povId === povId);
  }

  updateTRRRecord(id: string, updates: Partial<TRRRecord>) {
    const existing = this.data.trrRecords.get(id);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      this.data.trrRecords.set(id, updated);
      this.saveToStorage();
    }
  }

  // Workflow History
  addWorkflowHistory(entry: Omit<WorkflowHistory, 'id' | 'timestamp'>) {
    const historyEntry: WorkflowHistory = {
      ...entry,
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    this.data.workflowHistory.push(historyEntry);
    this.saveToStorage();
  }

  getWorkflowHistory(userId?: string, workflowType?: string): WorkflowHistory[] {
    let history = [...this.data.workflowHistory];
    
    if (userId) {
      history = history.filter(h => h.userId === userId);
    }
    
    if (workflowType) {
      history = history.filter(h => h.workflowType === workflowType);
    }
    
    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Context Analysis
  getCurrentWorkflowContext(): {
    activeCustomers: number;
    activePOVs: number;
    pendingTRRs: number;
    recentActivity: WorkflowHistory[];
    upcomingMilestones: { name: string; date: string; type: string; }[];
  } {
    const activeCustomers = this.getAllCustomerEngagements().filter(c => 
      this.getAllActivePOVs().some(p => p.customerId === c.id && p.status !== 'completed')
    ).length;
    
    const activePOVs = this.getAllActivePOVs().filter(p => 
      p.status === 'executing' || p.status === 'planning'
    ).length;
    
    const pendingTRRs = this.getAllTRRRecords().filter(t => 
      t.status === 'pending' || t.status === 'in-review'
    ).length;
    
    const recentActivity = this.getWorkflowHistory().slice(0, 10);
    
    const upcomingMilestones: { name: string; date: string; type: string; }[] = [];
    
    // Collect POV milestones
    this.getAllActivePOVs().forEach(pov => {
      pov.timeline.milestones.forEach(milestone => {
        if (!milestone.actual && new Date(milestone.planned) > new Date()) {
          upcomingMilestones.push({
            name: `${pov.name}: ${milestone.name}`,
            date: milestone.planned,
            type: 'pov_milestone'
          });
        }
      });
    });
    
    // Collect TRR deadlines
    this.getAllTRRRecords().forEach(trr => {
      if (trr.status !== 'validated' && new Date(trr.timeline.targetValidation) > new Date()) {
        upcomingMilestones.push({
          name: `TRR: ${trr.title}`,
          date: trr.timeline.targetValidation,
          type: 'trr_deadline'
        });
      }
    });
    
    // Sort by date
    upcomingMilestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return {
      activeCustomers,
      activePOVs,
      pendingTRRs,
      recentActivity,
      upcomingMilestones: upcomingMilestones.slice(0, 10)
    };
  }

  }

  // Onboarding starter data generation scoped to authenticated user
  seedStarterDataForUser(user: UserProfile) {
    if (!user?.id) {
      throw new Error('Valid user profile required to seed starter data');
    }

    const existingRecords = Array.from(this.data.trrRecords.values()).some(record => record.ownerId === user.id);
    if (existingRecords) {
      return { seeded: false };
    }

    const customerId = `cust_${user.id}_starter`;
    const povId = `pov_${user.id}_starter`;

    const sampleCustomer: CustomerEngagement = {
      id: customerId,
      ownerId: user.id,
      name: 'Starter Engagement',
      industry: 'Technology',
      size: 'enterprise',
      maturityLevel: 'intermediate',
      primaryConcerns: ['Cloud Security', 'Insider Threats', 'Compliance'],
      techStack: ['AWS', 'Kubernetes', 'Splunk', 'ServiceNow'],
      stakeholders: [
        { name: 'Executive Sponsor', role: 'CISO', influence: 'high', technical: true },
        { name: 'Security Manager', role: 'Security Manager', influence: 'medium', technical: true }
      ],
      timeline: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        targetDecision: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        keyMilestones: [
          { name: 'Initial Assessment', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'complete' },
          { name: 'POV Kickoff', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'complete' },
          { name: 'Executive Briefing', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' }
        ]
      },
      budget: {
        range: '$250K-$500K',
        decisionMaker: 'Executive Sponsor',
        approvalProcess: 'Executive Steering Committee'
      },
      competition: ['CrowdStrike', 'Microsoft Sentinel'],
      notes: [
        'Starter engagement generated for onboarding',
        'Customize this record with real customer information'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const samplePOV: ActivePOV = {
      id: povId,
      ownerId: user.id,
      customerId,
      name: 'Starter XSIAM POV',
      status: 'planning',
      scenarios: [
        { id: `sc_${user.id}_001`, name: 'Cloud Posture Assessment', type: 'cloud-posture', status: 'planned' },
        { id: `sc_${user.id}_002`, name: 'Insider Threat Detection', type: 'insider-threat', status: 'planned' }
      ],
      objectives: [
        'Demonstrate detection and response capabilities',
        'Integrate with existing cloud infrastructure'
      ],
      successMetrics: [
        'Detect 90% of simulated attacks',
        'Automate 70% of tier-1 responses'
      ],
      timeline: {
        planned: new Date().toISOString(),
        actual: undefined,
        milestones: [
          { name: 'Environment Setup', planned: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
          { name: 'Scenario Execution', planned: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() }
        ]
      },
      resources: {
        dcHours: 32,
        seHours: 16,
        infrastructure: ['XSIAM Tenant', 'Sample Data Sets']
      },
      outcomes: {
        technicalWins: [],
        businessImpact: [],
        lessonsLearned: []
      },
      nextSteps: ['Add customer-specific milestones', 'Document technical requirements'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const sampleTRRs: TRRRecord[] = [
      {
        id: `trr_${user.id}_001`,
        ownerId: user.id,
        customerId,
        povId,
        title: 'CloudTrail Integration Validation',
        category: 'integration',
        priority: 'high',
        status: 'draft',
        description: 'Validate ingestion and parsing of AWS CloudTrail logs into XSIAM.',
        acceptanceCriteria: [
          'Logs ingested within 5 minutes',
          'Standard fields parsed correctly',
          'Custom queries execute successfully'
        ],
        validationMethod: 'Demonstration with sample datasets',
        validationEvidence: [],
        assignedTo: user.name,
        reviewers: ['Security Manager'],
        timeline: {
          created: new Date().toISOString(),
          targetValidation: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          actualValidation: undefined
        },
        dependencies: ['AWS account access', 'CloudTrail configuration'],
        riskLevel: 'medium',
        businessImpact: 'Critical for establishing cloud visibility',
        customerStakeholder: 'Executive Sponsor',
        notes: ['Starter TRR created for onboarding'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.setCurrentUser(user);
    this.addCustomerEngagement(sampleCustomer);
    this.addActivePOV(samplePOV);
    sampleTRRs.forEach(trr => this.addTRRRecord(trr));

    return {
      seeded: true,
      customer: sampleCustomer,
      pov: samplePOV,
      trrs: sampleTRRs
    };
  }
}

export const dcContextStore = DCContextStore.getInstance();