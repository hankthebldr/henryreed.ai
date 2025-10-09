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
  aiInsights?: AIWorkflowInsight[];
  createdAt: string;
  updatedAt: string;
}

export interface TRRRecord {
  id: string;
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
  aiInsights?: AIWorkflowInsight[];
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

export interface AIWorkflowInsight {
  id: string;
  type: 'scenario_recommendation' | 'validation_summary' | 'executive_briefing' | 'engagement_update' | 'general';
  source: 'gemini' | 'manual' | 'system';
  title?: string;
  content: string;
  confidence?: number;
  createdAt: string;
  metadata?: Record<string, any>;
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

  replaceCustomerEngagements(engagements: CustomerEngagement[]) {
    this.data.customerEngagements = new Map(engagements.map(eng => [eng.id, eng]));
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

  replaceActivePOVs(povs: ActivePOV[]) {
    this.data.activePOVs = new Map(povs.map(pov => [pov.id, pov]));
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

  recordPOVInsight(id: string, insight: AIWorkflowInsight): ActivePOV | undefined {
    const existing = this.data.activePOVs.get(id);
    if (!existing) return undefined;

    const updated: ActivePOV = {
      ...existing,
      aiInsights: [...(existing.aiInsights || []), insight],
      updatedAt: new Date().toISOString(),
    };

    this.data.activePOVs.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  // TRR Management
  addTRRRecord(trr: TRRRecord) {
    this.data.trrRecords.set(trr.id, trr);
    this.saveToStorage();
  }

  replaceTRRRecords(trrs: TRRRecord[]) {
    this.data.trrRecords = new Map(trrs.map(trr => [trr.id, trr]));
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

  recordTRRInsight(id: string, insight: AIWorkflowInsight): TRRRecord | undefined {
    const existing = this.data.trrRecords.get(id);
    if (!existing) return undefined;

    const updated: TRRRecord = {
      ...existing,
      aiInsights: [...(existing.aiInsights || []), insight],
      updatedAt: new Date().toISOString(),
    };

    this.data.trrRecords.set(id, updated);
    this.saveToStorage();
    return updated;
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

  // Initialize sample data for development/demo
  initializeSampleData() {
    // Sample user
    const sampleUser: UserProfile = {
      id: 'dc_user_001',
      name: 'Demo User',
      email: 'demo@henryreed.ai',
      role: 'dc',
      region: 'AMER',
      specializations: ['Cloud Security', 'XSIAM', 'POV Management'],
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    this.setCurrentUser(sampleUser);

    // Sample customer engagement
    const sampleCustomer: CustomerEngagement = {
      id: 'cust_001',
      name: 'TechCorp Industries',
      industry: 'Technology',
      size: 'enterprise',
      maturityLevel: 'intermediate',
      primaryConcerns: ['Cloud Security', 'Insider Threats', 'Compliance'],
      techStack: ['AWS', 'Kubernetes', 'Splunk', 'ServiceNow'],
      stakeholders: [
        { name: 'John Smith', role: 'CISO', influence: 'high', technical: true },
        { name: 'Sarah Johnson', role: 'Security Manager', influence: 'medium', technical: true },
        { name: 'Mike Davis', role: 'IT Director', influence: 'medium', technical: false }
      ],
      timeline: {
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        targetDecision: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        keyMilestones: [
          { name: 'Initial Assessment', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), status: 'complete' },
          { name: 'POV Kickoff', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'complete' },
          { name: 'Executive Briefing', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' }
        ]
      },
      budget: {
        range: '$500K-$1M',
        decisionMaker: 'John Smith (CISO)',
        approvalProcess: 'Executive Committee Review'
      },
      competition: ['CrowdStrike', 'Microsoft Sentinel'],
      notes: [
        'Strong technical team, looking for advanced automation',
        'Previous bad experience with legacy SIEM',
        'High interest in cloud-native solutions'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.addCustomerEngagement(sampleCustomer);

    // Sample POV
    const samplePOV: ActivePOV = {
      id: 'pov_001',
      customerId: 'cust_001',
      name: 'TechCorp XSIAM POV',
      status: 'executing',
      scenarios: [
        { id: 'sc_001', name: 'Cloud Posture Assessment', type: 'cloud-posture', status: 'completed', results: 'Identified 15 misconfigurations', customerFeedback: 'Very impressed with visibility' },
        { id: 'sc_002', name: 'Insider Threat Detection', type: 'insider-threat', status: 'deployed', results: 'Currently monitoring 500 users' },
        { id: 'sc_003', name: 'Ransomware Simulation', type: 'ransomware', status: 'planned' }
      ],
      objectives: [
        'Demonstrate superior detection capabilities',
        'Show integration with existing AWS infrastructure',
        'Prove ROI through automation savings'
      ],
      successMetrics: [
        'Detect 90%+ of simulated attacks',
        'Reduce MTTD by 50%',
        'Automate 80% of tier-1 responses'
      ],
      timeline: {
        planned: '6 weeks',
        actual: '4 weeks completed',
        milestones: [
          { name: 'Environment Setup', planned: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), actual: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
          { name: 'Scenario Execution', planned: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
          { name: 'Results Presentation', planned: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() }
        ]
      },
      resources: {
        dcHours: 40,
        seHours: 20,
        infrastructure: ['AWS Test Environment', 'XSIAM Tenant', 'Sample Data Sets']
      },
      outcomes: {
        technicalWins: ['Faster detection than current solution', 'Better integration capabilities'],
        businessImpact: ['Projected 60% reduction in analyst time', '$200K annual savings'],
        lessonsLearned: ['Customer values automation over alerts', 'Integration complexity is key concern']
      },
      nextSteps: ['Complete ransomware scenario', 'Prepare executive presentation', 'Draft technical proposal'],
      aiInsights: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.addActivePOV(samplePOV);

    // Sample TRRs
    const sampleTRRs: TRRRecord[] = [
      {
        id: 'trr_001',
        customerId: 'cust_001',
        povId: 'pov_001',
        title: 'AWS CloudTrail Integration',
        category: 'integration',
        priority: 'high',
        status: 'validated',
        description: 'Validate XSIAM can ingest and parse AWS CloudTrail logs',
        acceptanceCriteria: ['Logs ingested within 5 minutes', 'All standard fields parsed correctly', 'Custom queries work'],
        validationMethod: 'Live demonstration with customer data',
        validationEvidence: ['Screenshots of parsed logs', 'Query results', 'Performance metrics'],
        assignedTo: 'Demo User',
        reviewers: ['John Smith', 'Sarah Johnson'],
        timeline: {
          created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          targetValidation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          actualValidation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        dependencies: ['AWS test account', 'CloudTrail configuration'],
        riskLevel: 'medium',
        businessImpact: 'Critical for cloud visibility requirements',
        customerStakeholder: 'Mike Davis',
        notes: ['Customer very satisfied with ingestion speed', 'Requested additional custom fields'],
        aiInsights: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'trr_002',
        customerId: 'cust_001',
        povId: 'pov_001',
        title: 'ServiceNow Integration',
        category: 'integration',
        priority: 'medium',
        status: 'in-review',
        description: 'Validate bi-directional integration with ServiceNow for incident management',
        acceptanceCriteria: ['Incidents created automatically', 'Status updates sync back', 'Custom fields mapped'],
        validationMethod: 'End-to-end workflow testing',
        assignedTo: 'Demo User',
        reviewers: ['Sarah Johnson'],
        timeline: {
          created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          targetValidation: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        dependencies: ['ServiceNow dev instance', 'API credentials'],
        riskLevel: 'low',
        businessImpact: 'Important for operational workflow',
        customerStakeholder: 'Sarah Johnson',
        notes: ['Waiting for dev instance access', 'Customer excited about automation potential'],
        aiInsights: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    sampleTRRs.forEach(trr => this.addTRRRecord(trr));
  }
}

export const dcContextStore = DCContextStore.getInstance();