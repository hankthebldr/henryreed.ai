'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CortexButton from './CortexButton';
import TRRDetailView from './TRRDetailView';
// Note: Some TRR components temporarily disabled due to missing implementations
// import { TRRTimeline } from './TRRTimeline';
// import { TRRProgressChart } from './TRRProgressChart';
// import { TRRDependencyMap } from './TRRDependencyMap';
// import { TRRKanbanBoard } from './TRRKanbanBoard';

// Types
import type {
  TRR,
  TRRPriority,
  TRRStatus,
  TRRCategory,
  RiskLevel,
  CreateTRRFormData,
  UpdateTRRFormData,
  TRRFilters,
  TRRDashboardMetrics,
  TRRState,
  TRRActions,
  TRRComment,
  TRREvidence,
  // DORStatus,
  // SDWStatus,
  // RiskAssessment,
  // AIPrediction,
  // TRRRequirement,
  TRRTestCase,
  // TRRStatusEvent,
  // Portfolio,
  // Project
} from '../types/trr';

// Temporary type definitions for missing imports
interface Portfolio {
  id: string;
  name: string;
  description: string;
  ownerUserId: string;
  tenantId: string;
  createdDate: string;
  updatedDate: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  portfolioId: string;
  tenantId: string;
  leadUserId: string;
  status: 'active' | 'planning' | 'completed' | 'on-hold';
  startDate: string;
  endDate: string;
  createdDate: string;
  updatedDate: string;
}

// Mock data for development
// This will be replaced by Firestore fetching in production
let portfolios: Portfolio[] = [
  {
    id: 'portfolio-1',
    name: 'Enterprise Security',
    description: 'Enterprise security initiatives and platform validations',
    ownerUserId: 'user-1',
    tenantId: 'tenant-1',
    createdDate: new Date(2023, 0, 15).toISOString(),
    updatedDate: new Date(2023, 6, 10).toISOString()
  },
  {
    id: 'portfolio-2',
    name: 'Cloud Compliance',
    description: 'Cloud-focused compliance and certification efforts',
    ownerUserId: 'user-2',
    tenantId: 'tenant-1',
    createdDate: new Date(2023, 2, 5).toISOString(),
    updatedDate: new Date(2023, 7, 22).toISOString()
  }
];

let projects: Project[] = [
  {
    id: 'project-1',
    name: 'SIEM Implementation',
    description: 'SIEM platform implementation and validation',
    portfolioId: 'portfolio-1',
    tenantId: 'tenant-1',
    leadUserId: 'user-1',
    status: 'active',
    startDate: new Date(2023, 3, 10).toISOString(),
    endDate: new Date(2023, 11, 30).toISOString(),
    createdDate: new Date(2023, 3, 1).toISOString(),
    updatedDate: new Date(2023, 8, 15).toISOString()
  },
  {
    id: 'project-2',
    name: 'GCP Compliance',
    description: 'GCP platform compliance validation',
    portfolioId: 'portfolio-2',
    tenantId: 'tenant-1',
    leadUserId: 'user-2',
    status: 'planning',
    startDate: new Date(2023, 5, 1).toISOString(),
    endDate: new Date(2024, 2, 31).toISOString(),
    createdDate: new Date(2023, 4, 20).toISOString(),
    updatedDate: new Date(2023, 4, 20).toISOString()
  },
  {
    id: 'project-3',
    name: 'Zero Trust Architecture',
    description: 'Zero Trust implementation and security validations',
    portfolioId: 'portfolio-1',
    tenantId: 'tenant-1',
    leadUserId: 'user-3',
    status: 'active',
    startDate: new Date(2023, 2, 15).toISOString(),
    endDate: new Date(2023, 10, 30).toISOString(),
    createdDate: new Date(2023, 2, 1).toISOString(),
    updatedDate: new Date(2023, 9, 5).toISOString()
  }
];

// Generate realistic TRR sample data
let trrDatabase: TRR[] = [
  {
    id: 'TRR-2024-001',
    title: 'SIEM Integration with Legacy Systems',
    description: 'Validate the integration capabilities of the SIEM platform with existing legacy systems including log aggregation, alert correlation, and dashboard visibility.',
    category: 'integration',
    priority: 'critical',
    status: 'in-progress',
    assignedTo: 'Sarah Johnson',
    assignedToEmail: 'sarah.johnson@company.com',
    customer: 'Acme Corporation',
    customerContact: 'john.customer@acme.com',
    project: 'SIEM Implementation',
    scenario: 'siem-integration-demo',
    validationMethod: 'hybrid',
    expectedOutcome: 'Successful bi-directional data flow and alert correlation',
    actualOutcome: 'Initial testing shows 80% success rate, working on remaining connectors',
    acceptanceCriteria: [
      'All legacy systems successfully connected',
      'Log data correctly parsed and normalized',
      'Alerts properly correlated across systems',
      'Dashboards show integrated view of security events'
    ],
    evidence: [],
    attachments: [],
    comments: [
      {
        id: 'comment-1',
        content: 'Initial connection tests completed with SOC team.',
        author: 'Sarah Johnson',
        authorEmail: 'sarah.johnson@company.com',
        createdDate: new Date(2023, 9, 15).toISOString(),
        type: 'note',
        isInternal: true,
        mentions: [],
        reactions: []
      },
      {
        id: 'comment-2',
        content: 'Network team needs to open additional ports for complete integration.',
        author: 'Mike Davis',
        authorEmail: 'mike.davis@company.com',
        createdDate: new Date(2023, 9, 18).toISOString(),
        type: 'concern',
        isInternal: true,
        mentions: ['sarah.johnson@company.com'],
        reactions: []
      }
    ],
    createdDate: new Date(2023, 9, 10).toISOString(),
    updatedDate: new Date(2023, 9, 18).toISOString(),
    dueDate: new Date(2023, 10, 30).toISOString(),
    startDate: new Date(2023, 9, 15).toISOString(),
    estimatedHours: 40,
    actualHours: 24,
    complexity: 'complex',
    dependencies: ['TRR-2024-003'],
    blockedBy: [],
    relatedTRRs: ['TRR-2024-002'],
    riskLevel: 'high',
    businessImpact: 'high',
    technicalRisk: 'Medium risk due to legacy system compatibility issues',
    mitigationPlan: 'Working with vendor on compatibility patches',
    complianceFrameworks: ['SOC2', 'ISO27001'],
    regulatoryRequirements: [],
    validationResults: [],
    testCases: [
      {
        id: 'test-1',
        name: 'Legacy System Connection Test',
        description: 'Validate connection to all legacy systems',
        preconditions: ['Network access established', 'Credentials configured'],
        steps: [
          { 
            stepNumber: 1, 
            action: 'Configure connector in SIEM', 
            expectedResult: 'Configuration saved successfully' 
          },
          { 
            stepNumber: 2, 
            action: 'Initiate connection test', 
            expectedResult: 'Connection established' 
          }
        ],
        expectedResult: 'All systems connected and data flowing',
        status: 'in-progress',
        executedBy: 'Sarah Johnson',
        executedDate: new Date(2023, 9, 16).toISOString(),
        automatable: true
      }
    ],
    signoffs: [],
    approvals: [],
    tags: ['siem', 'integration', 'legacy-systems'],
    customFields: {},
    archived: false,
    version: 2,
    workflowStage: 'validation'
    // Note: Removed statusHistory, dorStatus, sdwStatus, aiPrediction as they don't exist in the base TRR interface
  },
  {
    id: 'TRR-2024-002',
    title: 'Cloud Access Security Broker Implementation',
    description: 'Implement and validate the Cloud Access Security Broker (CASB) solution for SaaS application security.',
    category: 'security',
    priority: 'high',
    status: 'pending',
    assignedTo: 'Alex Wong',
    assignedToEmail: 'alex.wong@company.com',
    customer: 'Acme Corporation',
    customerContact: 'john.customer@acme.com',
    project: 'Zero Trust Architecture',
    scenario: 'casb-saas-protection',
    validationMethod: 'manual',
    expectedOutcome: 'CASB provides visibility and control over all SaaS applications',
    acceptanceCriteria: [
      'All approved SaaS applications registered',
      'Data classification policies enforced',
      'Shadow IT detection operational',
      'Access controls validated for each application'
    ],
    evidence: [],
    attachments: [],
    comments: [],
    createdDate: new Date(2023, 9, 12).toISOString(),
    updatedDate: new Date(2023, 9, 12).toISOString(),
    dueDate: new Date(2023, 11, 15).toISOString(),
    startDate: new Date(2023, 10, 1).toISOString(),
    estimatedHours: 30,
    complexity: 'moderate',
    dependencies: [],
    blockedBy: [],
    relatedTRRs: ['TRR-2024-001'],
    riskLevel: 'medium',
    businessImpact: 'high',
    technicalRisk: 'Integration with diverse SaaS platforms may require custom adaptations',
    mitigationPlan: 'Prioritize top 5 SaaS applications first',
    complianceFrameworks: ['SOC2', 'GDPR'],
    regulatoryRequirements: [],
    validationResults: [],
    testCases: [],
    signoffs: [],
    approvals: [],
    tags: ['casb', 'saas', 'zero-trust'],
    customFields: {},
    archived: false,
    version: 1,
    workflowStage: 'planning'
    // Note: Removed statusHistory, dorStatus, sdwStatus, aiPrediction as they don't exist in the base TRR interface
  },
  {
    id: 'TRR-2024-003',
    title: 'GCP Security Controls Validation',
    description: 'Validate that all required security controls are properly implemented in the Google Cloud Platform environment according to compliance frameworks.',
    category: 'compliance',
    priority: 'medium',
    status: 'validated',
    assignedTo: 'Lisa Wilson',
    assignedToEmail: 'lisa.wilson@company.com',
    customer: 'Global Insurance Inc.',
    customerContact: 'robert.smith@globalinsurance.com',
    project: 'GCP Compliance',
    validationMethod: 'automated',
    expectedOutcome: 'All security controls pass validation with evidence collected',
    acceptanceCriteria: [
      'Identity and access management controls validated',
      'Network security controls validated',
      'Data protection controls validated',
      'Logging and monitoring controls validated',
      'Incident response controls validated'
    ],
    evidence: [],
    attachments: [],
    comments: [
      {
        id: 'comment-3',
        content: 'All automated checks have passed. Preparing final compliance report.',
        author: 'Lisa Wilson',
        authorEmail: 'lisa.wilson@company.com',
        createdDate: new Date(2023, 9, 5).toISOString(),
        type: 'note',
        isInternal: true,
        mentions: [],
        reactions: []
      }
    ],
    createdDate: new Date(2023, 8, 15).toISOString(),
    updatedDate: new Date(2023, 9, 5).toISOString(),
    dueDate: new Date(2023, 9, 30).toISOString(),
    completedDate: new Date(2023, 9, 5).toISOString(),
    estimatedHours: 25,
    actualHours: 22,
    complexity: 'complex',
    dependencies: [],
    blockedBy: [],
    relatedTRRs: [],
    riskLevel: 'low',
    businessImpact: 'high',
    technicalRisk: 'Low risk due to mature security controls',
    complianceFrameworks: ['SOC2', 'ISO27001', 'HIPAA'],
    regulatoryRequirements: ['HIPAA 164.308'],
    validationResults: [],
    testCases: [],
    signoffs: [
      {
        id: 'signoff-1',
        trrId: 'TRR-2024-003',
        signoffType: 'technical',
        signerName: 'David Chen',
        signerEmail: 'david.chen@company.com',
        signerRole: 'Security Architect',
        signoffDate: new Date(2023, 9, 6).toISOString(),
        comments: 'All security controls successfully validated',
        verificationStatus: 'verified',
        supportingEvidence: ['security-controls-report.pdf'],
        attachments: [],
        complianceFlags: ['SOC2', 'ISO27001'],
        auditTrail: [],
        blockchainSignature: {
          hash: '0x7d4a...f2e9',
          timestamp: new Date(2023, 9, 6).toISOString(),
          blockNumber: '15732192',
          transactionId: '0x9f6e...c3b7',
          signerAddress: '0x1234...5678',
          networkId: '1',
          signatureData: '...',
          verificationKeys: []
        }
      }
    ],
    approvals: [],
    tags: ['gcp', 'compliance', 'security-controls'],
    customFields: {},
    archived: false,
    version: 3,
    workflowStage: 'completed'
    // Note: Removed statusHistory, dorStatus, sdwStatus, aiPrediction as they don't exist in the base TRR interface
  }
];

// Formatting and utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Enhanced AI-assisted TRR form component with comprehensive AI integration
const TRRCreationForm: React.FC<{
  initialData?: TRR;
  onSubmit: (data: CreateTRRFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}> = ({ initialData, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState<CreateTRRFormData>(() => {
    if (initialData) {
      return {
        title: initialData.title,
        description: initialData.description,
        category: initialData.category,
        priority: initialData.priority,
        assignedTo: initialData.assignedTo,
        assignedToEmail: initialData.assignedToEmail,
        customer: initialData.customer,
        customerContact: initialData.customerContact,
        project: initialData.project,
        scenario: initialData.scenario,
        validationMethod: initialData.validationMethod,
        expectedOutcome: initialData.expectedOutcome,
        acceptanceCriteria: initialData.acceptanceCriteria || [],
        dueDate: initialData.dueDate,
        estimatedHours: initialData.estimatedHours,
        complexity: initialData.complexity,
        riskLevel: initialData.riskLevel,
        businessImpact: initialData.businessImpact as any,
        technicalRisk: initialData.technicalRisk,
        complianceFrameworks: initialData.complianceFrameworks || [],
        tags: initialData.tags || [],
        testCases: initialData.testCases || [],
      };
    }

    return {
      title: '',
      description: '',
      category: 'security',
      priority: 'medium',
      assignedTo: '',
      assignedToEmail: '',
      customer: '',
      customerContact: '',
      project: '',
      scenario: '',
      validationMethod: 'manual',
      expectedOutcome: '',
      acceptanceCriteria: [],
      dueDate: undefined,
      estimatedHours: undefined,
      complexity: 'moderate',
      riskLevel: 'medium',
      businessImpact: 'medium',
      technicalRisk: '',
      complianceFrameworks: [],
      tags: [],
      testCases: [],
    };
  });

  // For validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Enhanced AI-generated suggestions with confidence and rationale
  const [suggestions, setSuggestions] = useState<{
    field: keyof CreateTRRFormData;
    value: any;
    confidence: number;
    rationale?: string;
    type: 'suggestion' | 'generated_artifact' | 'risk_assessment';
    timestamp: number;
  }[]>([]);

  // Enhanced AI status tracking
  const [aiStatus, setAiStatus] = useState<{
    loading: boolean;
    field?: keyof CreateTRRFormData;
    error?: string;
    operation?: 'suggest' | 'generate' | 'analyze' | 'validate';
    progress?: number;
  }>({ loading: false });

  // AI artifacts state
  const [aiArtifacts, setAiArtifacts] = useState<{
    riskAssessment?: any;
    testCases?: any[];
    timeline?: any;
    dorStatus?: any;
  }>({});

  // Auto-save functionality
  const [lastSave, setLastSave] = useState<number>(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Enhanced form submission with AI artifacts integration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setAiStatus({ loading: true, operation: 'validate' });
      
      // Enhanced validation with AI assistance
      const validationErrors = await validateFormWithAI(formData);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setAiStatus({ loading: false });
        return;
      }
      
      // Merge AI artifacts into form data
      const enhancedFormData = {
        ...formData,
        riskAssessment: aiArtifacts.riskAssessment,
        aiPrediction: aiArtifacts.timeline,
        dorStatus: aiArtifacts.dorStatus,
      };
      
      // Clear draft on successful submission
      const draftKey = `trr-draft-${initialData?.id || 'new'}`;
      localStorage.removeItem(draftKey);
      
      setAiStatus({ loading: false });
      onSubmit(enhancedFormData);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setAiStatus({ 
        loading: false, 
        error: 'Submission failed. Please try again.' 
      });
    }
  };
  
  // Enhanced form validation with AI assistance
  const validateFormWithAI = async (data: CreateTRRFormData): Promise<Record<string, string>> => {
    const errors: Record<string, string> = {};
    
    // Basic required field validation
    if (!data.title?.trim()) errors.title = 'Title is required';
    if (!data.description?.trim()) errors.description = 'Description is required';
    if (data.description && data.description.length < 20) {
      errors.description = 'Description should be more detailed (at least 20 characters)';
    }
    if (!data.assignedTo?.trim()) errors.assignedTo = 'Assigned To is required';
    if (!data.assignedToEmail?.trim()) errors.assignedToEmail = 'Email is required';
    if (!data.customer?.trim()) errors.customer = 'Customer is required';
    if (!data.expectedOutcome?.trim()) errors.expectedOutcome = 'Expected Outcome is required';
    
    // Smart validation
    if (data.acceptanceCriteria?.length === 0) {
      errors.acceptanceCriteria = 'At least one acceptance criterion is required';
    }
    
    // AI-powered validation (if available)
    try {
      const { computeDOR } = await import('../lib/ai/trr-assist');
      const context = {
        organizationId: 'org-1',
        projectId: data.project || 'default',
      };
      
      const dorStatus = await computeDOR('temp-validation', data, context);
      
      if (!dorStatus.isReady && dorStatus.unmetCriteria.length > 0) {
        errors.general = `Definition of Ready not met: ${dorStatus.unmetCriteria.join(', ')}`;
      }
    } catch (dorError) {
      console.warn('DOR validation failed:', dorError);
    }
    
    return errors;
  };

  // Enhanced AI-assisted field suggestion with real API integration
  const requestAISuggestion = async (field: keyof CreateTRRFormData) => {
    try {
      setAiStatus({ loading: true, field, operation: 'suggest' });
      
      // Import AI assistance dynamically
      const { suggestFields, suggestTitle, expandDescription, categorizeTRR, recommendValidationMethod } = 
        await import('../lib/ai/trr-assist');
      
      // Get the AI context (would come from auth/organization state in production)
      const context = {
        organizationId: 'org-1', // From user/auth context
        projectId: formData.project || 'default',
        userRole: 'admin' // From user context
      };
      
      let suggestion: any;
      let confidence = 0.8;
      let rationale = '';
      
      switch (field) {
        case 'title':
          const titleSuggestions = await suggestTitle(formData, context);
          suggestion = titleSuggestions[0] || 'AI-Generated Title';
          rationale = 'Generated based on description, category, and project context';
          break;
          
        case 'description':
          suggestion = await expandDescription(formData, context);
          rationale = 'Expanded based on title, category, and business requirements';
          break;
          
        case 'expectedOutcome':
          const fieldSuggestions = await suggestFields(formData, context);
          suggestion = fieldSuggestions.technicalApproach || 'AI-suggested expected outcome based on requirements';
          rationale = 'Derived from acceptance criteria and validation methodology';
          break;
          
        case 'acceptanceCriteria':
          const artifacts = await suggestFields(formData, context);
          suggestion = artifacts.acceptanceCriteria || [
            'All functional requirements validated',
            'Performance criteria met',
            'Security controls verified',
            'Integration tests passed'
          ];
          rationale = 'Generated based on category, complexity, and validation method';
          break;
          
        case 'category':
        case 'priority':
        case 'businessImpact':
          const categorization = await categorizeTRR(formData, context);
          suggestion = categorization[field as keyof typeof categorization];
          confidence = 0.85;
          rationale = 'Categorized based on title, description, and project context';
          break;
          
        case 'validationMethod':
          const methodRecommendation = await recommendValidationMethod(formData, context);
          suggestion = methodRecommendation.validationMethod;
          confidence = 0.9;
          rationale = methodRecommendation.validationApproach;
          break;
          
        default:
          // Fallback for other fields
          const allSuggestions = await suggestFields(formData, context);
          suggestion = (allSuggestions as any)[field];
          rationale = 'AI-generated suggestion based on form context';
      }

      if (suggestion) {
        setSuggestions(prev => [
          ...prev.filter(s => s.field !== field), // Remove existing suggestion for this field
          { 
            field, 
            value: suggestion, 
            confidence, 
            rationale,
            type: 'suggestion',
            timestamp: Date.now()
          }
        ]);
      }
      
      setAiStatus({ loading: false });
      
    } catch (error) {
      console.error('AI suggestion error:', error);
      setAiStatus({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'AI suggestion failed. Please try again.' 
      });
      
      // Fallback to basic suggestions if AI fails
      const fallbackSuggestion = getFallbackSuggestion(field, formData);
      if (fallbackSuggestion) {
        setSuggestions(prev => [
          ...prev.filter(s => s.field !== field),
          { 
            field, 
            value: fallbackSuggestion, 
            confidence: 0.3,
            rationale: 'Fallback suggestion (AI unavailable)',
            type: 'suggestion',
            timestamp: Date.now()
          }
        ]);
      }
    }
  };
  
  // Fallback suggestions when AI is unavailable
  const getFallbackSuggestion = (field: keyof CreateTRRFormData, data: CreateTRRFormData) => {
    switch (field) {
      case 'title':
        return data.category ? `${data.category.charAt(0).toUpperCase() + data.category.slice(1)} Requirements Review` : null;
      case 'description':
        return data.title ? `Technical requirements review for ${data.title}` : null;
      case 'expectedOutcome':
        return 'Successful validation of all technical requirements';
      case 'acceptanceCriteria':
        return ['Requirements documented', 'Validation criteria defined', 'Success metrics established'];
      case 'validationMethod':
        return data.complexity === 'simple' ? 'manual' : 'hybrid';
      default:
        return null;
    }
  };

  // Enhanced form change handler with auto-save
  const updateFormData = useCallback((updates: Partial<CreateTRRFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
    
    // Clear field-specific errors
    Object.keys(updates).forEach(key => {
      if (errors[key]) {
        setErrors(prev => ({ ...prev, [key]: '' }));
      }
    });
  }, [errors]);

  // Auto-save effect
  useEffect(() => {
    if (!hasUnsavedChanges || !formData.title) return;
    
    const autoSaveTimer = setTimeout(() => {
      // Auto-save logic here (localStorage or API draft save)
      const draftKey = `trr-draft-${initialData?.id || 'new'}`;
      localStorage.setItem(draftKey, JSON.stringify({
        formData,
        timestamp: Date.now(),
      }));
      setLastSave(Date.now());
      setHasUnsavedChanges(false);
    }, 3000); // Auto-save after 3 seconds of inactivity
    
    return () => clearTimeout(autoSaveTimer);
  }, [formData, hasUnsavedChanges, initialData?.id]);

  // Load draft on mount
  useEffect(() => {
    if (initialData) return; // Don't load draft when editing
    
    const draftKey = 'trr-draft-new';
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      try {
        const { formData: draftData, timestamp } = JSON.parse(savedDraft);
        const hoursSinceLastSave = (Date.now() - timestamp) / (1000 * 60 * 60);
        
        // Only restore if saved within last 24 hours
        if (hoursSinceLastSave < 24) {
          setFormData(draftData);
          setLastSave(timestamp);
        } else {
          localStorage.removeItem(draftKey);
        }
      } catch (error) {
        console.warn('Failed to load draft:', error);
      }
    }
  }, [initialData]);

  // Apply AI suggestion with smart integration
  const applyAISuggestion = (field: keyof CreateTRRFormData, value: any) => {
    updateFormData({ [field]: value });
    setSuggestions(prev => prev.filter(s => s.field !== field));
    
    // Smart cascading updates
    if (field === 'acceptanceCriteria' && Array.isArray(value)) {
      // Auto-generate test cases from acceptance criteria
      setTimeout(() => generateTestCasesFromCriteria(value), 100);
    }
    
    if (field === 'category' || field === 'priority') {
      // Suggest validation method based on category and priority
      setTimeout(() => suggestValidationMethod(), 100);
    }
  };

  // Smart helper: Generate test cases from acceptance criteria
  const generateTestCasesFromCriteria = (criteria: string[]) => {
    const basicTestCases = criteria.map((criterion, index) => ({
      id: `test-${Date.now()}-${index}`,
      name: `Verify: ${criterion}`,
      description: `Test case to validate: ${criterion}`,
      preconditions: ['System is configured', 'Test data is prepared'],
      steps: [
        { 
          stepNumber: 1, 
          action: `Set up test environment for ${criterion.toLowerCase()}`,
          expectedResult: 'Environment is ready'
        },
        {
          stepNumber: 2,
          action: `Execute validation for ${criterion.toLowerCase()}`,
          expectedResult: criterion
        }
      ],
      expectedResult: criterion,
      status: 'pending',
      automatable: false,
    }));
    
    setSuggestions(prev => [
      ...prev.filter(s => s.field !== 'testCases'),
      {
        field: 'testCases',
        value: basicTestCases,
        confidence: 0.7,
        rationale: 'Basic test cases generated from acceptance criteria',
        type: 'suggestion',
        timestamp: Date.now(),
      }
    ]);
  };

  // Smart helper: Suggest validation method
  const suggestValidationMethod = async () => {
    try {
      const { recommendValidationMethod } = await import('../lib/ai/trr-assist');
      const context = {
        organizationId: 'org-1',
        projectId: formData.project || 'default',
      };
      
      const recommendation = await recommendValidationMethod(formData, context);
      
      setSuggestions(prev => [
        ...prev.filter(s => s.field !== 'validationMethod'),
        {
          field: 'validationMethod',
          value: recommendation.validationMethod,
          confidence: 0.85,
          rationale: recommendation.validationApproach,
          type: 'suggestion',
          timestamp: Date.now(),
        }
      ]);
    } catch (error) {
      // Fallback logic
      const isComplex = ['complex', 'very-complex'].includes(formData.complexity);
      const isHighPriority = ['high', 'critical'].includes(formData.priority);
      
      let method = 'manual';
      if (isComplex && isHighPriority) method = 'hybrid';
      else if (isComplex) method = 'automated';
      
      setSuggestions(prev => [
        ...prev.filter(s => s.field !== 'validationMethod'),
        {
          field: 'validationMethod',
          value: method,
          confidence: 0.4,
          rationale: 'Basic recommendation based on complexity and priority',
          type: 'suggestion',
          timestamp: Date.now(),
        }
      ]);
    }
  };

  // Dismiss AI suggestion
  const dismissAISuggestion = (field: keyof CreateTRRFormData) => {
    setSuggestions(prev => prev.filter(s => s.field !== field));
  };
  
  // Helper function to format time since last save
  const formatTimeSince = (timestamp: number): string => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Enhanced AI artifact generation (acceptance criteria + test cases)
  const generateArtifacts = async () => {
    try {
      setAiStatus({ loading: true, operation: 'generate', progress: 0 });
      
      // Import AI assistance
      const { generateArtifacts, computeDOR } = await import('../lib/ai/trr-assist');
      
      const context = {
        organizationId: 'org-1',
        projectId: formData.project || 'default',
      };
      
      // Create a temporary TRR object for AI processing
      const tempTRR = {
        ...formData,
        id: 'temp-' + Date.now(),
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
      };
      
      setAiStatus(prev => ({ ...prev, progress: 30 }));
      
      // Generate artifacts
      const artifacts = await generateArtifacts(tempTRR.id, tempTRR, context);
      
      setAiStatus(prev => ({ ...prev, progress: 70 }));
      
      // Update AI artifacts state
      setAiArtifacts(prev => ({
        ...prev,
        testCases: artifacts.testCases,
      }));
      
      // Add suggestions for acceptance criteria and test cases
      setSuggestions(prev => [
        ...prev.filter(s => s.field !== 'acceptanceCriteria'),
        {
          field: 'acceptanceCriteria',
          value: artifacts.acceptanceCriteria,
          confidence: 0.88,
          rationale: 'Generated based on title, description, and validation requirements',
          type: 'generated_artifact',
          timestamp: Date.now(),
        }
      ]);
      
      // Also update test cases
      if (artifacts.testCases?.length) {
        setSuggestions(prev => [
          ...prev,
          {
            field: 'testCases',
            value: artifacts.testCases,
            confidence: 0.82,
            rationale: 'Generated comprehensive test cases based on acceptance criteria',
            type: 'generated_artifact',
            timestamp: Date.now(),
          }
        ]);
      }
      
      setAiStatus(prev => ({ ...prev, progress: 100 }));
      
      // Compute DOR status after generating artifacts
      setTimeout(async () => {
        try {
          const updatedFormData = {
            ...formData,
            acceptanceCriteria: artifacts.acceptanceCriteria,
            testCases: artifacts.testCases || [],
          };
          const dorStatus = await computeDOR(tempTRR.id, updatedFormData, context);
          setAiArtifacts(prev => ({ ...prev, dorStatus }));
        } catch (error) {
          console.warn('DOR computation failed:', error);
        }
      }, 500);
      
      setAiStatus({ loading: false });
      
    } catch (error) {
      console.error('Artifact generation error:', error);
      setAiStatus({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to generate artifacts'
      });
    }
  };

  // Comprehensive AI risk assessment with detailed analysis
  const generateRiskAssessment = async () => {
    try {
      setAiStatus({ loading: true, operation: 'analyze', field: 'riskLevel', progress: 0 });
      
      // Import AI assistance
      const { analyzeRisk, predictTimeline } = await import('../lib/ai/trr-assist');
      
      const context = {
        organizationId: 'org-1',
        projectId: formData.project || 'default',
      };
      
      // Create temporary TRR for analysis
      const tempTRR = {
        ...formData,
        id: 'temp-risk-' + Date.now(),
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
      };
      
      setAiStatus(prev => ({ ...prev, progress: 30 }));
      
      // Analyze risk
      const riskAssessment = await analyzeRisk(tempTRR.id, tempTRR, context);
      
      setAiStatus(prev => ({ ...prev, progress: 70 }));
      
      // Predict timeline for additional context
      const timelinePrediction = await predictTimeline(tempTRR.id, tempTRR, context);
      
      setAiStatus(prev => ({ ...prev, progress: 90 }));
      
      // Store AI artifacts
      setAiArtifacts(prev => ({
        ...prev,
        riskAssessment,
        timeline: timelinePrediction,
      }));
      
      // Add risk assessment suggestions
      setSuggestions(prev => [
        ...prev.filter(s => !['riskLevel', 'businessImpact', 'technicalRisk'].includes(s.field as string)),
        {
          field: 'riskLevel',
          value: riskAssessment.likelihood === 'critical' && riskAssessment.impact === 'critical' ? 'critical' :
                 (riskAssessment.likelihood === 'high' || riskAssessment.impact === 'high') ? 'high' :
                 (riskAssessment.likelihood === 'medium' || riskAssessment.impact === 'medium') ? 'medium' : 'low',
          confidence: 0.85,
          rationale: riskAssessment.rationale,
          type: 'risk_assessment',
          timestamp: Date.now(),
        },
        {
          field: 'businessImpact',
          value: riskAssessment.impact,
          confidence: 0.88,
          rationale: `Business impact assessed as ${riskAssessment.impact} based on scope and requirements`,
          type: 'risk_assessment',
          timestamp: Date.now(),
        },
        {
          field: 'technicalRisk',
          value: `Risk Score: ${riskAssessment.score.toFixed(1)}/10\n\nLikelihood: ${riskAssessment.likelihood}\nImpact: ${riskAssessment.impact}\n\nRationale: ${riskAssessment.rationale}`,
          confidence: 0.82,
          rationale: 'Comprehensive risk analysis based on technical complexity and business context',
          type: 'risk_assessment',
          timestamp: Date.now(),
        }
      ]);
      
      // Add timeline suggestion if available
      if (timelinePrediction.predictedCompletionDate) {
        const predictedDate = new Date(timelinePrediction.predictedCompletionDate);
        const formattedDate = predictedDate.toISOString().substring(0, 10);
        
        setSuggestions(prev => [
          ...prev,
          {
            field: 'dueDate',
            value: formattedDate,
            confidence: timelinePrediction.confidence,
            rationale: `AI-predicted completion: ${timelinePrediction.rationale}`,
            type: 'risk_assessment',
            timestamp: Date.now(),
          }
        ]);
      }
      
      setAiStatus({ loading: false, progress: 100 });
      
    } catch (error) {
      console.error('Risk assessment error:', error);
      setAiStatus({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Risk analysis failed. Please try again.'
      });
      
      // Fallback risk assessment
      const fallbackRisk = calculateBasicRisk(formData);
      setSuggestions(prev => [
        ...prev.filter(s => s.field !== 'riskLevel'),
        {
          field: 'riskLevel',
          value: fallbackRisk.level,
          confidence: 0.3,
          rationale: fallbackRisk.rationale + ' (Fallback assessment)',
          type: 'risk_assessment',
          timestamp: Date.now(),
        }
      ]);
    }
  };
  
  // Basic risk calculation fallback
  const calculateBasicRisk = (data: CreateTRRFormData) => {
    let riskScore = 0;
    let reasons = [];
    
    // Complexity factor
    switch (data.complexity) {
      case 'very-complex': riskScore += 4; reasons.push('Very complex implementation'); break;
      case 'complex': riskScore += 3; reasons.push('Complex requirements'); break;
      case 'moderate': riskScore += 2; reasons.push('Moderate complexity'); break;
      case 'simple': riskScore += 1; reasons.push('Simple implementation'); break;
    }
    
    // Time pressure factor
    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      const now = new Date();
      const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysUntilDue < 7) {
        riskScore += 3;
        reasons.push('Tight deadline');
      } else if (daysUntilDue < 30) {
        riskScore += 2;
        reasons.push('Limited timeframe');
      }
    }
    
    // Priority factor
    switch (data.priority) {
      case 'critical': riskScore += 2; reasons.push('Critical priority'); break;
      case 'high': riskScore += 1; reasons.push('High priority'); break;
    }
    
    // Determine risk level
    let level: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore >= 7) level = 'critical';
    else if (riskScore >= 5) level = 'high';
    else if (riskScore >= 3) level = 'medium';
    else level = 'low';
    
    return {
      level,
      rationale: reasons.length > 0 ? reasons.join(', ') : 'Standard risk assessment'
    };
  };

  return (
    <div className="cortex-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cortex-text-primary">
          {isEditing ? '✏️ Edit TRR' : '📝 Create New TRR'}
        </h2>
        <CortexButton onClick={onCancel} variant="outline" size="sm">
          Cancel
        </CortexButton>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General form errors */}
        {errors.general && (
          <div className="bg-cortex-error/10 border border-cortex-error/20 rounded p-3 mb-4">
            <div className="flex items-center">
              <span className="text-cortex-error mr-2">⚠️</span>
              <span className="text-cortex-error text-sm">{errors.general}</span>
            </div>
          </div>
        )}
        {/* Enhanced AI Suggestions Panel */}
        {(suggestions.length > 0 || aiStatus.loading || aiStatus.error || hasUnsavedChanges) && (
          <div className="bg-cortex-bg-accent p-4 rounded-lg border border-cortex-border-accent mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-cortex-green flex items-center">
                ✨ AI Assistant
                {aiStatus.loading && (
                  <div className="ml-2 flex items-center">
                    <svg className="animate-spin h-4 w-4 text-cortex-green" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-1 text-sm text-cortex-text-secondary">
                      {aiStatus.operation === 'suggest' ? 'Generating suggestions...' :
                       aiStatus.operation === 'generate' ? 'Creating artifacts...' :
                       aiStatus.operation === 'analyze' ? 'Analyzing risk...' :
                       aiStatus.operation === 'validate' ? 'Validating form...' :
                       'Working...'}
                    </span>
                    {aiStatus.progress !== undefined && (
                      <div className="ml-2 w-16 bg-cortex-bg-secondary rounded-full h-1.5">
                        <div 
                          className="bg-cortex-green h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${aiStatus.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}
              </h3>
              
              <div className="flex items-center space-x-2 text-xs text-cortex-text-muted">
                {lastSave > 0 && (
                  <span className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-1 ${
                      hasUnsavedChanges ? 'bg-cortex-warning' : 'bg-cortex-green'
                    }`}></span>
                    {hasUnsavedChanges ? 'Unsaved changes' : `Saved ${formatTimeSince(lastSave)}`}
                  </span>
                )}
                {suggestions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSuggestions([])}
                    className="text-cortex-text-muted hover:text-cortex-text-secondary"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
            
            {/* Error display */}
            {aiStatus.error && (
              <div className="bg-cortex-error/10 border border-cortex-error/20 rounded p-3 mb-3">
                <div className="flex items-center">
                  <span className="text-cortex-error mr-2">⚠️</span>
                  <span className="text-cortex-error text-sm">{aiStatus.error}</span>
                  <button
                    onClick={() => setAiStatus(prev => ({ ...prev, error: undefined }))}
                    className="ml-auto text-cortex-error hover:text-cortex-error-dark"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {suggestions
                  .sort((a, b) => b.timestamp - a.timestamp) // Most recent first
                  .map((suggestion, idx) => (
                  <div key={`${suggestion.field}-${suggestion.timestamp}`} 
                       className={`bg-cortex-bg-tertiary p-3 rounded border transition-all duration-200 ${
                         suggestion.type === 'risk_assessment' ? 'border-cortex-warning/30' :
                         suggestion.type === 'generated_artifact' ? 'border-cortex-green/30' :
                         'border-cortex-border-secondary'
                       }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-cortex-text-primary capitalize">
                          {suggestion.type === 'risk_assessment' ? '🎯 Risk Analysis' :
                           suggestion.type === 'generated_artifact' ? '🧠 Generated Artifact' :
                           '💡 Suggestion'} for {suggestion.field.replace(/([A-Z])/g, ' $1')}
                        </span>
                        {suggestion.rationale && (
                          <p className="text-xs text-cortex-text-muted mt-1">
                            {suggestion.rationale}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-cortex-text-muted">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                          suggestion.confidence > 0.8 
                            ? 'bg-cortex-green/10 text-cortex-green' 
                            : suggestion.confidence > 0.6 
                              ? 'bg-cortex-warning/10 text-cortex-warning'
                              : 'bg-cortex-error/10 text-cortex-error'
                        }`}>
                          {suggestion.confidence > 0.8 ? 'High' : suggestion.confidence > 0.6 ? 'Medium' : 'Low'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-cortex-bg-hover p-2 rounded text-cortex-text-secondary mb-3 text-sm max-h-32 overflow-y-auto">
                      {Array.isArray(suggestion.value) ? (
                        suggestion.field === 'testCases' ? (
                          <div className="space-y-2">
                            {suggestion.value.slice(0, 3).map((testCase: any, i: number) => (
                              <div key={i} className="text-xs p-2 bg-cortex-bg-secondary rounded">
                                <div className="font-medium">{testCase.name || `Test Case ${i + 1}`}</div>
                                <div className="text-cortex-text-muted">{testCase.description || testCase.expectedResult}</div>
                              </div>
                            ))}
                            {suggestion.value.length > 3 && (
                              <div className="text-xs text-cortex-text-muted">+{suggestion.value.length - 3} more test cases</div>
                            )}
                          </div>
                        ) : (
                          <ul className="list-disc pl-5 space-y-1">
                            {suggestion.value.map((item: any, i: number) => (
                              <li key={i}>{typeof item === 'string' ? item : item.toString()}</li>
                            ))}
                          </ul>
                        )
                      ) : (
                        <div className="whitespace-pre-wrap">{suggestion.value}</div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 justify-end">
                      <button 
                        type="button"
                        onClick={() => dismissAISuggestion(suggestion.field)}
                        className="px-3 py-1 text-xs text-cortex-text-muted hover:text-cortex-text-secondary transition-colors"
                      >
                        Dismiss
                      </button>
                      <button 
                        type="button"
                        onClick={() => applyAISuggestion(suggestion.field, suggestion.value)}
                        className="px-3 py-1 bg-cortex-green hover:bg-cortex-green-dark text-white text-xs rounded transition-colors"
                      >
                        Apply {suggestion.type === 'generated_artifact' ? 'Artifact' : 'Suggestion'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {suggestions.length === 0 && !aiStatus.loading && !aiStatus.error && (
              <div className="text-center py-4">
                <p className="text-cortex-text-muted text-sm">No AI suggestions yet. Fill out the form fields and click the ✨ buttons for AI assistance.</p>
              </div>
            )}
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2 flex items-center justify-between">
              <span>Title *</span>
              <button
                type="button"
                onClick={() => requestAISuggestion('title')}
                className="text-xs text-cortex-green hover:text-cortex-green-dark flex items-center"
                disabled={aiStatus.loading && aiStatus.field === 'title'}
              >
                {aiStatus.loading && aiStatus.field === 'title' ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-cortex-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <span>✨ Suggest title</span>
                )}
              </button>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50 ${
                errors.title ? 'border-cortex-error' : 'border-cortex-border-secondary'
              }`}
              placeholder="Enter TRR title"
            />
            {errors.title && <p className="text-cortex-error text-sm mt-1">{errors.title}</p>}
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2 flex items-center justify-between">
              <span>Description *</span>
              <button
                type="button"
                onClick={() => requestAISuggestion('description')}
                className="text-xs text-cortex-green hover:text-cortex-green-dark flex items-center"
                disabled={aiStatus.loading && aiStatus.field === 'description'}
              >
                {aiStatus.loading && aiStatus.field === 'description' ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-cortex-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <span>✨ Expand description</span>
                )}
              </button>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              rows={4}
              className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50 resize-none ${
                errors.description ? 'border-cortex-error' : 'border-cortex-border-secondary'
              }`}
              placeholder="Detailed description of the technical requirement"
            />
            {errors.description && <p className="text-cortex-error text-sm mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Categorization with Smart AI Button */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                requestAISuggestion('category');
                requestAISuggestion('priority');
                requestAISuggestion('riskLevel');
              }}
              className="px-4 py-2 bg-cortex-green-light hover:bg-cortex-green text-cortex-bg-primary rounded transition-colors text-sm flex items-center"
              disabled={aiStatus.loading}
            >
              {aiStatus.loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : <span className="mr-2">✨</span>}
              Auto-categorize
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as TRRCategory })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            >
              <option value="security">Security</option>
              <option value="performance">Performance</option>
              <option value="compliance">Compliance</option>
              <option value="integration">Integration</option>
              <option value="usability">Usability</option>
              <option value="scalability">Scalability</option>
              <option value="reliability">Reliability</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as TRRPriority })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Risk Level
            </label>
            <select
              value={formData.riskLevel}
              onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as RiskLevel })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Business Impact
            </label>
            <select
              value={formData.businessImpact}
              onChange={(e) => setFormData({ ...formData, businessImpact: e.target.value as any })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            >
              <option value="low">Low Impact</option>
              <option value="medium">Medium Impact</option>
              <option value="high">High Impact</option>
              <option value="critical">Critical Impact</option>
            </select>
          </div>
        </div>

        {/* Assignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Assigned To *
            </label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50 ${
                errors.assignedTo ? 'border-cortex-error' : 'border-cortex-border-secondary'
              }`}
              placeholder="Full name"
            />
            {errors.assignedTo && <p className="text-cortex-error text-sm mt-1">{errors.assignedTo}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.assignedToEmail}
              onChange={(e) => setFormData({ ...formData, assignedToEmail: e.target.value })}
              className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50 ${
                errors.assignedToEmail ? 'border-cortex-error' : 'border-cortex-border-secondary'
              }`}
              placeholder="email@company.com"
            />
            {errors.assignedToEmail && <p className="text-cortex-error text-sm mt-1">{errors.assignedToEmail}</p>}
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Customer *
            </label>
            <input
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50 ${
                errors.customer ? 'border-cortex-error' : 'border-cortex-border-secondary'
              }`}
              placeholder="Customer name"
            />
            {errors.customer && <p className="text-cortex-error text-sm mt-1">{errors.customer}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Customer Contact
            </label>
            <input
              type="email"
              value={formData.customerContact || ''}
              onChange={(e) => setFormData({ ...formData, customerContact: e.target.value })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
              placeholder="contact@customer.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Project
            </label>
            <select
              value={formData.project || ''}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.name}>{project.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Scenario
            </label>
            <input
              type="text"
              value={formData.scenario || ''}
              onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
              placeholder="Related scenario"
            />
          </div>
        </div>

        {/* Validation Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2 flex items-center justify-between">
              <span>Validation Method</span>
              <button
                type="button"
                onClick={() => requestAISuggestion('validationMethod')}
                className="text-xs text-cortex-green hover:text-cortex-green-dark"
              >
                ✨ Recommend
              </button>
            </label>
            <select
              value={formData.validationMethod}
              onChange={(e) => setFormData({ ...formData, validationMethod: e.target.value as any })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            >
              <option value="manual">Manual Testing</option>
              <option value="automated">Automated Testing</option>
              <option value="hybrid">Hybrid Testing</option>
              <option value="peer-review">Peer Review</option>
              <option value="compliance-check">Compliance Check</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Complexity
            </label>
            <select
              value={formData.complexity}
              onChange={(e) => setFormData({ ...formData, complexity: e.target.value as any })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            >
              <option value="simple">Simple</option>
              <option value="moderate">Moderate</option>
              <option value="complex">Complex</option>
              <option value="very-complex">Very Complex</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Estimated Hours
            </label>
            <input
              type="number"
              value={formData.estimatedHours || ''}
              onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || undefined })}
              min="1"
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
              placeholder="Estimated hours"
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate ? new Date(formData.dueDate).toISOString().substring(0, 10) : ''}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            />
          </div>

          {/* Tags field */}
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => {
                const tagArray = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                setFormData({ ...formData, tags: tagArray });
              }}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
              placeholder="Enter tags separated by commas"
            />
          </div>
        </div>

        {/* Expected Outcome */}
        <div>
          <label className="block text-sm font-medium text-cortex-text-secondary mb-2 flex items-center justify-between">
            <span>Expected Outcome *</span>
            <button
              type="button"
              onClick={() => requestAISuggestion('expectedOutcome')}
              className="text-xs text-cortex-green hover:text-cortex-green-dark"
            >
              ✨ Suggest outcome
            </button>
          </label>
          <textarea
            value={formData.expectedOutcome}
            onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
            rows={3}
            className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50 resize-none ${
              errors.expectedOutcome ? 'border-cortex-error' : 'border-cortex-border-secondary'
            }`}
            placeholder="What are the expected results of this validation?"
          />
          {errors.expectedOutcome && <p className="text-cortex-error text-sm mt-1">{errors.expectedOutcome}</p>}
        </div>

        {/* Acceptance Criteria with AI Generation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-cortex-text-secondary">
              Acceptance Criteria
            </label>
            <button
              type="button"
              onClick={generateArtifacts}
              className="px-3 py-1 bg-cortex-green-light hover:bg-cortex-green text-white text-xs rounded flex items-center"
              disabled={aiStatus.loading && aiStatus.operation === 'generate'}
            >
              {aiStatus.loading && aiStatus.operation === 'generate' ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Artifacts...
                </span>
              ) : (
                <span>✨ Generate Criteria & Tests</span>
              )}
            </button>
          </div>
          
          <div className="bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg p-4 space-y-2">
            {formData.acceptanceCriteria.length === 0 ? (
              <p className="text-cortex-text-muted text-sm italic">No criteria defined. Click the button above to generate suggested criteria.</p>
            ) : (
              formData.acceptanceCriteria.map((criterion, index) => (
                <div key={index} className="flex items-start">
                  <button
                    type="button"
                    onClick={() => {
                      updateFormData({
                        acceptanceCriteria: formData.acceptanceCriteria.filter((_, i) => i !== index)
                      });
                    }}
                    className="text-cortex-error hover:text-cortex-error-dark mt-0.5 mr-2"
                  >
                    &times;
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={criterion}
                      onChange={(e) => {
                        const newCriteria = [...formData.acceptanceCriteria];
                        newCriteria[index] = e.target.value;
                        updateFormData({ acceptanceCriteria: newCriteria });
                      }}
                      className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
                    />
                  </div>
                </div>
              ))
            )}
            
            <button
              type="button"
              onClick={() => {
                updateFormData({
                  acceptanceCriteria: [...formData.acceptanceCriteria, '']
                });
              }}
              className="w-full text-center px-3 py-2 border border-dashed border-cortex-border-secondary rounded-lg text-cortex-text-muted hover:text-cortex-text-secondary hover:border-cortex-border-primary transition-colors"
            >
              + Add Criterion
            </button>
          </div>
        </div>

        {/* Risk Assessment with AI Analysis */}
        <div className="bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-bold text-cortex-text-primary">Risk Assessment</h3>
            <button
              type="button"
              onClick={generateRiskAssessment}
              className="px-3 py-1 bg-cortex-green-light hover:bg-cortex-green text-white text-xs rounded flex items-center"
              disabled={aiStatus.loading && aiStatus.operation === 'analyze'}
            >
              {aiStatus.loading && aiStatus.operation === 'analyze' ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Risk & Timeline...
                </span>
              ) : (
                <span>✨ AI Risk Analysis</span>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-cortex-text-secondary mb-2">
                Technical Risk Description
              </label>
              <textarea
                value={formData.technicalRisk}
                onChange={(e) => setFormData({ ...formData, technicalRisk: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50 resize-none"
                placeholder="Describe technical risks and challenges"
              />
            </div>
            
            <div className="flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-cortex-text-secondary mb-2">
                    Risk Level
                  </label>
                  <div className={`px-4 py-2 rounded border ${
                    formData.riskLevel === 'critical' ? 'bg-cortex-error/10 border-cortex-error/30 text-cortex-error' :
                    formData.riskLevel === 'high' ? 'bg-cortex-warning/10 border-cortex-warning/30 text-cortex-warning' :
                    formData.riskLevel === 'medium' ? 'bg-cortex-info/10 border-cortex-info/30 text-cortex-info' :
                    'bg-cortex-success/10 border-cortex-success/30 text-cortex-success'
                  }`}>
                    {formData.riskLevel.toUpperCase()}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-cortex-text-secondary mb-2">
                    Business Impact
                  </label>
                  <div className={`px-4 py-2 rounded border ${
                    formData.businessImpact === 'critical' ? 'bg-cortex-error/10 border-cortex-error/30 text-cortex-error' :
                    formData.businessImpact === 'high' ? 'bg-cortex-warning/10 border-cortex-warning/30 text-cortex-warning' :
                    formData.businessImpact === 'medium' ? 'bg-cortex-info/10 border-cortex-info/30 text-cortex-info' :
                    'bg-cortex-success/10 border-cortex-success/30 text-cortex-success'
                  }`}>
                    {formData.businessImpact.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="mt-2">
                <label className="block text-xs font-medium text-cortex-text-secondary mb-2">
                  Risk Score
                </label>
                <div className="bg-cortex-bg-secondary px-4 py-2 rounded border border-cortex-border-secondary">
                  {/* Simple risk score calculation: Higher the numbers = higher risk */}
                  {(() => {
                    const riskValues = { low: 1, medium: 2, high: 3, critical: 4 };
                    const riskScore = (riskValues[formData.riskLevel as any] || 1) * (riskValues[formData.businessImpact as any] || 1);
                    const percentage = (riskScore / 16) * 100;
                    
                    return (
                      <div className="relative pt-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block text-cortex-text-secondary">
                              {riskScore} / 16
                            </span>
                          </div>
                          <div>
                            <span className={`text-xs font-semibold inline-block ${
                              percentage > 75 ? 'text-cortex-error' : 
                              percentage > 50 ? 'text-cortex-warning' : 
                              percentage > 25 ? 'text-cortex-info' : 
                              'text-cortex-success'
                            }`}>
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-cortex-bg-hover">
                          <div 
                            style={{ width: `${percentage}%` }} 
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                              percentage > 75 ? 'bg-cortex-error' : 
                              percentage > 50 ? 'bg-cortex-warning' : 
                              percentage > 25 ? 'bg-cortex-info' : 
                              'bg-cortex-success'
                            }`}>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Cases Section */}
        {(formData.testCases && formData.testCases.length > 0) && (
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Test Cases ({formData.testCases.length})
            </label>
            <div className="bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg p-4 space-y-3">
              {formData.testCases.map((testCase, index) => (
                <div key={testCase.id || index} className="p-3 bg-cortex-bg-secondary rounded border border-cortex-border-secondary">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-cortex-text-primary text-sm">
                      {testCase.name || `Test Case ${index + 1}`}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        testCase.status === 'passed' ? 'bg-cortex-green/10 text-cortex-green' :
                        testCase.status === 'failed' ? 'bg-cortex-error/10 text-cortex-error' :
                        testCase.status === 'in-progress' ? 'bg-cortex-info/10 text-cortex-info' :
                        'bg-cortex-text-muted/10 text-cortex-text-muted'
                      }`}>
                        {testCase.status || 'pending'}
                      </span>
                      {testCase.automatable && (
                        <span className="px-2 py-0.5 text-xs bg-cortex-info/10 text-cortex-info rounded-full">
                          Auto
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {testCase.description && (
                    <p className="text-cortex-text-secondary text-sm mb-2">{testCase.description}</p>
                  )}
                  
                  {testCase.steps && testCase.steps.length > 0 && (
                    <div className="text-xs text-cortex-text-muted">
                      <div className="font-medium mb-1">Steps:</div>
                      <ol className="list-decimal pl-4 space-y-1">
                        {testCase.steps.map((step, stepIndex) => (
                          <li key={stepIndex}>
                            {step.action} → <em>{step.expectedResult}</em>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {testCase.expectedResult && (
                    <div className="text-xs text-cortex-text-muted mt-2">
                      <span className="font-medium">Expected:</span> {testCase.expectedResult}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Frameworks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Compliance Frameworks
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg">
              {['SOC2', 'ISO27001', 'HIPAA', 'PCI-DSS', 'GDPR', 'CCPA', 'NIST', 'FedRAMP'].map(framework => (
                <label key={framework} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.complianceFrameworks.includes(framework)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          complianceFrameworks: [...formData.complianceFrameworks, framework]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          complianceFrameworks: formData.complianceFrameworks.filter(f => f !== framework)
                        });
                      }
                    }}
                    className="rounded border-cortex-border-secondary focus:ring-cortex-green text-cortex-green"
                  />
                  <span className="ml-2 text-sm text-cortex-text-secondary">{framework}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col justify-between">
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              DOR Status
            </label>
              <div className="flex-1 p-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      aiArtifacts.dorStatus ? (aiArtifacts.dorStatus.isReady ? 'bg-cortex-success' : 'bg-cortex-error') :
                      (!formData.title || !formData.description || !formData.assignedTo || !formData.expectedOutcome || !formData.acceptanceCriteria.length)
                        ? 'bg-cortex-error'
                        : 'bg-cortex-success'
                    }`}></div>
                    <span className="text-sm text-cortex-text-primary font-medium">
                      Definition of Ready
                    </span>
                    {aiArtifacts.dorStatus && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-cortex-info/10 text-cortex-info rounded-full">
                        AI: {Math.round(aiArtifacts.dorStatus.score)}%
                      </span>
                    )}
                  </div>
                  <div className="text-xl">
                    {aiArtifacts.dorStatus ? (aiArtifacts.dorStatus.isReady ? '✅' : '❌') :
                     (!formData.title || !formData.description || !formData.assignedTo || !formData.expectedOutcome || !formData.acceptanceCriteria.length
                      ? '❌'
                      : '✅'
                     )}
                  </div>
                </div>
                
                {/* Show AI DOR analysis if available */}
                {aiArtifacts.dorStatus?.unmetCriteria?.length > 0 ? (
                  <div className="text-xs text-cortex-error mt-2">
                    <div className="font-medium">AI-identified gaps:</div>
                    <ul className="list-disc pl-5">
                      {aiArtifacts.dorStatus.unmetCriteria.map((criterion, idx) => (
                        <li key={idx}>{criterion}</li>
                      ))}
                    </ul>
                  </div>
                ) : aiArtifacts.dorStatus?.isReady ? (
                  <div className="text-xs text-cortex-success mt-2">
                    ✅ All DOR criteria met (AI verified)
                  </div>
                ) : (
                  /* Fallback to basic validation */
                  (!formData.title || !formData.description || !formData.assignedTo || !formData.expectedOutcome || !formData.acceptanceCriteria.length) ? (
                    <div className="text-xs text-cortex-text-muted mt-2">
                      <div>Required fields:</div>
                      <ul className="list-disc pl-5">
                        {!formData.title && <li>Title</li>}
                        {!formData.description && <li>Description (min 20 chars)</li>}
                        {!formData.assignedTo && <li>Assignee</li>}
                        {!formData.expectedOutcome && <li>Expected Outcome</li>}
                        {!formData.acceptanceCriteria.length && <li>Acceptance Criteria</li>}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-xs text-cortex-success mt-2">
                      ✅ Basic requirements completed
                    </div>
                  )
                )}
                
                {/* AI Timeline Prediction */}
                {aiArtifacts.timeline && (
                  <div className="mt-2 pt-2 border-t border-cortex-border-secondary">
                    <div className="text-xs text-cortex-text-muted">
                      <div className="flex items-center justify-between">
                        <span>🤖 AI Predicted Completion:</span>
                        <span className="font-medium text-cortex-info">
                          {new Date(aiArtifacts.timeline.predictedCompletionDate || '').toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-cortex-text-muted mt-1">
                        Confidence: {Math.round((aiArtifacts.timeline.confidence || 0) * 100)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-cortex-border-secondary">
          <CortexButton
            onClick={onCancel}
            variant="outline"
          >
            Cancel
          </CortexButton>
          <CortexButton
            type="submit"
            variant="primary"
            icon={isEditing ? "✏️" : "📝"}
          >
            {isEditing ? "Update TRR" : "Create TRR"}
          </CortexButton>
        </div>
      </form>
    </div>
  );
};

// TRR List component
const TRRList: React.FC<{
  trrs: TRR[];
  onEdit: (trr: TRR) => void;
  onView: (trr: TRR) => void;
  onDelete: (trrId: string) => void;
  selectedTRRs: string[];
  onSelectTRR: (trrId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}> = ({ trrs, onEdit, onView, onDelete, selectedTRRs, onSelectTRR, onSelectAll }) => {
  const getStatusColor = (status: TRRStatus): string => {
    const colors = {
      'draft': 'text-cortex-text-muted bg-cortex-bg-hover',
      'pending': 'text-cortex-warning bg-cortex-warning/10',
      'in-progress': 'text-cortex-info bg-cortex-info/10',
      'validated': 'text-cortex-green bg-cortex-green/10',
      'failed': 'text-cortex-error bg-cortex-error/10',
      'not-applicable': 'text-cortex-text-muted bg-cortex-bg-hover',
      'completed': 'text-cortex-green bg-cortex-green/10'
    };
    return colors[status] || 'text-cortex-text-muted bg-cortex-bg-hover';
  };

  const getPriorityColor = (priority: TRRPriority): string => {
    const colors = {
      'low': 'text-cortex-text-muted bg-cortex-bg-hover',
      'medium': 'text-cortex-info bg-cortex-info/10',
      'high': 'text-cortex-warning bg-cortex-warning/10',
      'critical': 'text-cortex-error bg-cortex-error/10'
    };
    return colors[priority] || 'text-cortex-text-muted bg-cortex-bg-hover';
  };

  const calculateProgress = (trr: TRR): number => {
    // Calculate completion percentage based on status and test cases
    switch(trr.status) {
      case 'completed':
        return 100;
      case 'validated':
        return 95;
      case 'in-progress':
        const completedTests = trr.testCases.filter(tc => 
          tc.status === 'passed' || tc.status === 'failed' || tc.status === 'skipped'
        ).length;
        const totalTests = trr.testCases.length || 1;
        return Math.round((completedTests / totalTests) * 70) + 20; // 20% for starting, up to 90% for testing
      case 'pending':
        return 10;
      case 'draft':
        return 5;
      default:
        return 0;
    }
  };

  return (
    <div className="cortex-card">
      {/* Header */}
      <div className="p-6 border-b border-cortex-border-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedTRRs.length === trrs.length && trrs.length > 0}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="rounded border-cortex-border-secondary focus:ring-cortex-green"
            />
            <h3 className="text-lg font-bold text-cortex-text-primary">
              TRR List ({trrs.length})
            </h3>
          </div>
          {selectedTRRs.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-cortex-text-secondary">
                {selectedTRRs.length} selected
              </span>
              <CortexCommandButton
                command={`trr export --format csv --ids ${selectedTRRs.join(',')}`}
                variant="outline" 
                size="sm" 
                icon="📤"
              >
                Export
              </CortexCommandButton>
              <CortexCommandButton
                command={`trr-signoff bulk --ids ${selectedTRRs.join(',')}`}
                variant="outline"
                size="sm"
                icon="⛓️"
                tooltip="Create blockchain signoffs for selected TRRs"
              >
                Bulk Sign
              </CortexCommandButton>
              <CortexButton variant="outline" size="sm" icon="🔄">
                Bulk Update
              </CortexButton>
            </div>
          )}
        </div>
      </div>

      {/* TRR List */}
      <div className="divide-y divide-cortex-border-secondary">
        {trrs.map((trr) => (
          <div key={trr.id} className="p-6 hover:bg-cortex-bg-hover/50 transition-colors">
            <div className="flex items-start space-x-4">
              <input
                type="checkbox"
                checked={selectedTRRs.includes(trr.id)}
                onChange={(e) => onSelectTRR(trr.id, e.target.checked)}
                className="mt-1 rounded border-cortex-border-secondary focus:ring-cortex-green"
              />
              
              <div className="flex-1 min-w-0">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-semibold text-cortex-text-primary cursor-pointer hover:text-cortex-green" onClick={() => onView(trr)}>
                      {trr.title}
                    </h4>
                    <span className="font-mono text-sm text-cortex-text-accent">
                      {trr.id}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trr.status)}`}>
                      {trr.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(trr.priority)}`}>
                      {trr.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-cortex-text-secondary mb-3 line-clamp-2">
                  {trr.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center text-xs text-cortex-text-muted mb-1">
                    <span>Progress</span>
                    <span>{calculateProgress(trr)}%</span>
                  </div>
                  <div className="w-full bg-cortex-bg-tertiary rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        trr.status === 'validated' || trr.status === 'completed' ? 'bg-cortex-green' :
                        trr.status === 'in-progress' ? 'bg-cortex-info' :
                        trr.status === 'failed' ? 'bg-cortex-error' :
                        'bg-cortex-warning'
                      }`}
                      style={{ width: `${calculateProgress(trr)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-cortex-text-muted">
                  <div>
                    <span className="font-medium">Assigned:</span> {trr.assignedTo}
                  </div>
                  <div>
                    <span className="font-medium">Customer:</span> {trr.customer}
                  </div>
                  <div>
                    <span className="font-medium">Due:</span> {trr.dueDate ? formatDate(trr.dueDate) : 'Not set'}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {formatDate(trr.updatedDate)}
                  </div>
                </div>

                {/* AI Prediction */}
                {trr.aiPrediction && trr.status !== 'completed' && trr.status !== 'validated' && (
                  <div className="mt-2 text-xs">
                    <span className="text-cortex-info">🤖 AI predicts completion by {formatDate(trr.aiPrediction.predictedCompletionDate || '')}</span>
                    <span className="text-cortex-text-muted ml-2">
                      ({Math.round(trr.aiPrediction.confidence * 100)}% confidence)
                    </span>
                  </div>
                )}

                {/* Tags */}
                {trr.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {trr.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-cortex-bg-tertiary text-cortex-text-muted rounded border border-cortex-border-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                    {trr.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs text-cortex-text-muted">
                        +{trr.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-3">
                    <CortexButton
                      onClick={() => onView(trr)}
                      variant="outline"
                      size="sm"
                      icon="👁️"
                    >
                      View
                    </CortexButton>
                    <CortexButton
                      onClick={() => onEdit(trr)}
                      variant="outline"
                      size="sm"
                      icon="✏️"
                    >
                      Edit
                    </CortexButton>
                    <CortexCommandButton
                      command={`trr-signoff create ${trr.id}`}
                      variant="outline"
                      size="sm"
                      icon="⛓️"
                      tooltip="Create blockchain signoff for this TRR"
                    >
                      Sign
                    </CortexCommandButton>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {trr.riskLevel !== 'low' && (
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        trr.riskLevel === 'critical' ? 'bg-cortex-error/10 text-cortex-error' :
                        trr.riskLevel === 'high' ? 'bg-cortex-warning/10 text-cortex-warning' :
                        'bg-cortex-info/10 text-cortex-info'
                      }`}>
                        {trr.riskLevel.toUpperCase()} RISK
                      </span>
                    )}
                    {trr.estimatedHours && (
                      <span className="text-xs text-cortex-text-muted">
                        {trr.estimatedHours}h est.
                      </span>
                    )}
                    <CortexButton
                      onClick={() => onDelete(trr.id)}
                      variant="outline"
                      size="sm"
                      icon="🗑️"
                      ariaLabel={`Delete TRR ${trr.id}`}
                      className="text-cortex-error hover:text-cortex-error"
                    >
                      Delete
                    </CortexButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {trrs.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-2">No TRRs Found</h3>
          <p className="text-cortex-text-secondary">Create your first Technical Requirements Review to get started.</p>
        </div>
      )}
    </div>
  );
};

// Portfolio sidebar component
const PortfolioSidebar: React.FC<{
  portfolios: Portfolio[];
  projects: Project[];
  selectedPortfolioId: string | null;
  selectedProjectId: string | null;
  onSelectPortfolio: (portfolioId: string) => void;
  onSelectProject: (projectId: string) => void;
  trrCounts: Record<string, number>;
}> = ({
  portfolios,
  projects,
  selectedPortfolioId,
  selectedProjectId,
  onSelectPortfolio,
  onSelectProject,
  trrCounts
}) => {
  return (
    <div className="cortex-card p-4 h-full">
      <h3 className="text-lg font-bold text-cortex-text-primary mb-4">Portfolios & Projects</h3>
      
      <div className="space-y-2">
        {portfolios.map(portfolio => (
          <div key={portfolio.id}>
            <div 
              className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-cortex-bg-hover transition-colors ${
                selectedPortfolioId === portfolio.id ? 'bg-cortex-bg-hover' : ''
              }`}
              onClick={() => onSelectPortfolio(portfolio.id)}
            >
              <div className="flex items-center">
                <span className="mr-2">📂</span>
                <span className={`font-medium ${
                  selectedPortfolioId === portfolio.id ? 'text-cortex-green' : 'text-cortex-text-primary'
                }`}>
                  {portfolio.name}
                </span>
              </div>
              <span className="text-xs text-cortex-text-muted px-2 py-1 bg-cortex-bg-tertiary rounded-full">
                {projects.filter(p => p.portfolioId === portfolio.id).length}
              </span>
            </div>
            
            {selectedPortfolioId === portfolio.id && (
              <div className="ml-6 space-y-1 mt-1">
                {projects
                  .filter(project => project.portfolioId === portfolio.id)
                  .map(project => (
                    <div 
                      key={project.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-cortex-bg-hover transition-colors ${
                        selectedProjectId === project.id ? 'bg-cortex-bg-accent/20' : ''
                      }`}
                      onClick={() => onSelectProject(project.id)}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">🔖</span>
                        <span className={`text-sm ${
                          selectedProjectId === project.id ? 'text-cortex-green font-medium' : 'text-cortex-text-secondary'
                        }`}>
                          {project.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          project.status === 'active' ? 'bg-cortex-green/10 text-cortex-green' :
                          project.status === 'planning' ? 'bg-cortex-info/10 text-cortex-info' :
                          project.status === 'completed' ? 'bg-cortex-text-muted bg-cortex-bg-tertiary' :
                          'bg-cortex-warning/10 text-cortex-warning'
                        }`}>
                          {project.status}
                        </span>
                        <span className="text-xs text-cortex-text-muted bg-cortex-bg-tertiary px-2 py-0.5 rounded-full">
                          {trrCounts[project.id] || 0}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Portfolio/Project Creation Buttons */}
      <div className="mt-4 pt-4 border-t border-cortex-border-secondary space-y-2">
        <button className="w-full text-left px-3 py-2 text-sm bg-cortex-bg-tertiary hover:bg-cortex-bg-hover text-cortex-text-secondary rounded transition-colors">
          ➕ New Portfolio
        </button>
        <button className="w-full text-left px-3 py-2 text-sm bg-cortex-bg-tertiary hover:bg-cortex-bg-hover text-cortex-text-secondary rounded transition-colors">
          ➕ New Project
        </button>
      </div>
    </div>
  );
};

// Project Header with breadcrumb
const ProjectHeader: React.FC<{
  selectedPortfolio: Portfolio | null;
  selectedProject: Project | null;
  onClearSelection: () => void;
  onSelectPortfolio: (portfolioId: string) => void;
}> = ({
  selectedPortfolio,
  selectedProject,
  onClearSelection,
  onSelectPortfolio
}) => {
  return (
    <div className="bg-cortex-bg-tertiary rounded-lg px-6 py-4 mb-6">
      <div className="flex items-center text-sm">
        <button
          onClick={onClearSelection}
          className="text-cortex-text-secondary hover:text-cortex-green transition-colors"
        >
          All Portfolios
        </button>
        
        {selectedPortfolio && (
          <>
            <span className="mx-2 text-cortex-text-muted">/</span>
            <button
              onClick={() => onSelectPortfolio(selectedPortfolio.id)}
              className={`${selectedProject ? 'text-cortex-text-secondary hover:text-cortex-green' : 'text-cortex-green font-medium'} transition-colors`}
            >
              {selectedPortfolio.name}
            </button>
          </>
        )}
        
        {selectedProject && (
          <>
            <span className="mx-2 text-cortex-text-muted">/</span>
            <span className="text-cortex-green font-medium">
              {selectedProject.name}
            </span>
          </>
        )}
      </div>
      
      {selectedProject && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-cortex-text-muted">Status:</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              selectedProject.status === 'active' ? 'bg-cortex-green/10 text-cortex-green' :
              selectedProject.status === 'planning' ? 'bg-cortex-info/10 text-cortex-info' :
              selectedProject.status === 'completed' ? 'bg-cortex-text-muted bg-cortex-bg-hover' :
              'bg-cortex-warning/10 text-cortex-warning'
            }`}>
              {selectedProject.status.toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-cortex-text-muted">Timeline:</span>
            <span className="ml-2 text-cortex-text-primary">
              {formatDate(selectedProject.startDate)} — {formatDate(selectedProject.endDate)}
            </span>
          </div>
          <div>
            <span className="text-cortex-text-muted">Lead:</span>
            <span className="ml-2 text-cortex-text-primary">
              {/* This would be fetched from users collection */}
              Project Lead
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Analytics Panel
const AnalyticsPanel: React.FC<{
  trrs: TRR[];
}> = ({ trrs }) => {
  // Calculate metrics
  const totalTRRs = trrs.length;
  const completedTRRs = trrs.filter(trr => 
    trr.status === 'validated' || trr.status === 'completed'
  ).length;
  const inProgressTRRs = trrs.filter(trr => trr.status === 'in-progress').length;
  const pendingTRRs = trrs.filter(trr => 
    trr.status === 'pending' || trr.status === 'draft'
  ).length;
  const criticalRiskTRRs = trrs.filter(trr => trr.riskLevel === 'critical').length;
  const highRiskTRRs = trrs.filter(trr => trr.riskLevel === 'high').length;
  
  const completionRate = totalTRRs > 0 ? (completedTRRs / totalTRRs) * 100 : 0;
  
  // Calculate average completion time (in days) for completed TRRs
  const avgCompletionTime = useMemo(() => {
    const completedWithDates = trrs.filter(trr => 
      (trr.status === 'validated' || trr.status === 'completed') && 
      trr.completedDate && 
      trr.createdDate
    );
    
    if (completedWithDates.length === 0) return 0;
    
    const totalDays = completedWithDates.reduce((sum, trr) => {
      const created = new Date(trr.createdDate);
      const completed = new Date(trr.completedDate!);
      const days = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    
    return totalDays / completedWithDates.length;
  }, [trrs]);
  
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="cortex-card p-4 text-center">
          <div className="text-2xl font-bold text-cortex-green">{completedTRRs}</div>
          <div className="text-sm text-cortex-text-secondary">Completed</div>
        </div>
        <div className="cortex-card p-4 text-center">
          <div className="text-2xl font-bold text-cortex-info">{inProgressTRRs}</div>
          <div className="text-sm text-cortex-text-secondary">In Progress</div>
        </div>
        <div className="cortex-card p-4 text-center">
          <div className="text-2xl font-bold text-cortex-warning">{pendingTRRs}</div>
          <div className="text-sm text-cortex-text-secondary">Pending</div>
        </div>
        <div className="cortex-card p-4 text-center">
          <div className="text-2xl font-bold text-cortex-error">{criticalRiskTRRs + highRiskTRRs}</div>
          <div className="text-sm text-cortex-text-secondary">High/Critical Risks</div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="cortex-card p-4">
        <h3 className="font-bold text-cortex-text-primary mb-3">Completion Rate</h3>
        <div className="flex items-center">
          <div className="flex-1">
            <div className="w-full bg-cortex-bg-tertiary rounded-full h-4">
              <div 
                className="h-4 rounded-full bg-cortex-green"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
          <div className="ml-3 text-lg font-bold text-cortex-green">
            {completionRate.toFixed(0)}%
          </div>
        </div>
        <div className="mt-2 text-sm text-cortex-text-muted flex justify-between">
          <div>Average Time: {avgCompletionTime.toFixed(1)} days</div>
          <div>{completedTRRs} of {totalTRRs} TRRs</div>
        </div>
      </div>
      
      {/* Status Timeline */}
      <div className="cortex-card p-4">
        <h3 className="font-bold text-cortex-text-primary mb-3">Recent Status Changes</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {trrs
            .flatMap(trr => trr.statusHistory.map(event => ({
              trrId: trr.id,
              trrTitle: trr.title,
              ...event
            })))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5)
            .map((event, idx) => (
              <div key={idx} className="flex items-start space-x-3 pb-3 border-b border-cortex-border-secondary">
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                  event.status === 'completed' || event.status === 'validated' ? 'bg-cortex-green' :
                  event.status === 'in-progress' ? 'bg-cortex-info' :
                  event.status === 'failed' ? 'bg-cortex-error' :
                  'bg-cortex-warning'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <div className="text-cortex-text-primary font-medium">{event.trrTitle}</div>
                    <div className="text-xs text-cortex-text-muted">{formatDate(event.timestamp)}</div>
                  </div>
                  <div className="text-sm">
                    Status changed to <span className="font-medium">{event.status.toUpperCase()}</span>
                    {event.note && <span className="text-cortex-text-secondary"> - {event.note}</span>}
                  </div>
                </div>
              </div>
            ))}
            
            {trrs.flatMap(trr => trr.statusHistory).length === 0 && (
              <div className="text-cortex-text-muted italic text-sm">No status changes recorded</div>
            )}
        </div>
      </div>
    </div>
  );
};

// View selection options
type ViewType = 'list' | 'kanban' | 'gantt' | 'timeline' | 'dependencies' | 'analytics';

// Main TRR Management Component
export const EnhancedTRRManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'detail' | 'analytics'>('list');
  const [secondaryView, setSecondaryView] = useState<ViewType>('list');
  const [currentTRR, setCurrentTRR] = useState<TRR | null>(null);
  const [trrs, setTRRs] = useState<TRR[]>(trrDatabase);
  const [selectedTRRs, setSelectedTRRs] = useState<string[]>([]);
  const [filters, setFilters] = useState<TRRFilters>({});
  
  // Portfolio & Project selection
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedPortfolio = useMemo(() => 
    portfolios.find(p => p.id === selectedPortfolioId) || null
  , [selectedPortfolioId]);

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId) || null
  , [selectedProjectId]);

  // Filter TRRs based on selection
  const filteredTRRs = useMemo(() => {
    let result = [...trrs]; // Use trrs state instead of trrDatabase directly
    
    if (selectedProjectId) {
      result = result.filter(trr => trr.project === selectedProject?.name);
    } else if (selectedPortfolioId) {
      const projectsInPortfolio = projects
        .filter(p => p.portfolioId === selectedPortfolioId)
        .map(p => p.name);
      
      result = result.filter(trr => projectsInPortfolio.includes(trr.project || ''));
    }
    
    // Apply additional filters from the filter state
    if (filters.status && filters.status.length > 0) {
      result = result.filter(trr => filters.status!.includes(trr.status));
    }
    
    if (filters.priority && filters.priority.length > 0) {
      result = result.filter(trr => filters.priority!.includes(trr.priority));
    }
    
    if (filters.category && filters.category.length > 0) {
      result = result.filter(trr => filters.category!.includes(trr.category));
    }
    
    if (filters.assignedTo && filters.assignedTo.length > 0) {
      result = result.filter(trr => filters.assignedTo!.includes(trr.assignedTo));
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(trr => 
        trr.title.toLowerCase().includes(query) ||
        trr.description.toLowerCase().includes(query) ||
        trr.id.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [trrs, selectedProjectId, selectedPortfolioId, selectedProject, filters]);

  // Calculate TRR counts per project for sidebar based on filtered results
  const trrCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    projects.forEach(project => {
      counts[project.id] = trrs.filter(trr => trr.project === project.name).length;
    });
    
    return counts;
  }, [trrs]);

  const handleCreateTRR = (formData: CreateTRRFormData) => {
    const newTRR: TRR = {
      id: `TRR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...formData,
      status: 'draft',
      evidence: [],
      attachments: [],
      comments: [],
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      dependencies: [],
      blockedBy: [],
      relatedTRRs: [],
      regulatoryRequirements: [],
      validationResults: [],
      testCases: [],
      signoffs: [],
      approvals: [],
      customFields: {},
      archived: false,
      version: 1,
      workflowStage: 'draft',
      statusHistory: [
        {
          status: 'draft',
          timestamp: new Date().toISOString(),
          authorUserId: 'current-user', // In production, this would be the current user's ID
          note: 'Initial creation'
        }
      ],
      dorStatus: {
        isReady: true,
        unmetCriteria: [],
        score: 100
      },
      sdwStatus: {
        stage: 'planning',
        approvals: []
      }
    };
    
    const updatedTRRs = [...trrs, newTRR];
    setTRRs(updatedTRRs);
    // Update global database
    const dbIndex = trrDatabase.findIndex(trr => trr.id === newTRR.id);
    if (dbIndex === -1) {
      trrDatabase.push(newTRR);
    }
    setView('list');
  };

  const handleEditTRR = (formData: CreateTRRFormData) => {
    if (!currentTRR) return;

    const updatedTRR: TRR = {
      ...currentTRR,
      ...formData,
      updatedDate: new Date().toISOString(),
      version: currentTRR.version + 1,
      statusHistory: [
        ...currentTRR.statusHistory,
        {
          status: currentTRR.status, // Preserve current status
          timestamp: new Date().toISOString(),
          authorUserId: 'current-user', // In production, this would be the current user's ID
          note: 'TRR updated'
        }
      ]
    };

    const updatedTRRs = trrs.map(trr => trr.id === currentTRR.id ? updatedTRR : trr);
    setTRRs(updatedTRRs);
    // Update global database
    const index = trrDatabase.findIndex(trr => trr.id === currentTRR.id);
    if (index !== -1) trrDatabase[index] = updatedTRR;
    
    setCurrentTRR(null);
    setView('list');
  };

  const handleDeleteTRR = (trrId: string) => {
    if (confirm('Are you sure you want to delete this TRR? This action cannot be undone.')) {
      const updatedTRRs = trrs.filter(trr => trr.id !== trrId);
      setTRRs(updatedTRRs);
      // Update global database
      const index = trrDatabase.findIndex(trr => trr.id === trrId);
      if (index !== -1) {
        trrDatabase.splice(index, 1);
      }
      setSelectedTRRs(selectedTRRs.filter(id => id !== trrId));
    }
  };

  const handleSelectTRR = (trrId: string, selected: boolean) => {
    if (selected) {
      setSelectedTRRs([...selectedTRRs, trrId]);
    } else {
      setSelectedTRRs(selectedTRRs.filter(id => id !== trrId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTRRs(filteredTRRs.map(trr => trr.id));
    } else {
      setSelectedTRRs([]);
    }
  };

  // Clear portfolio and project selection
  const clearSelection = () => {
    setSelectedPortfolioId(null);
    setSelectedProjectId(null);
  };

  // Handle portfolio selection
  const handleSelectPortfolio = (portfolioId: string) => {
    if (selectedPortfolioId === portfolioId) {
      setSelectedPortfolioId(null);
      setSelectedProjectId(null);
    } else {
      setSelectedPortfolioId(portfolioId);
      setSelectedProjectId(null);
    }
  };

  // Handle project selection
  const handleSelectProject = (projectId: string) => {
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    } else {
      setSelectedProjectId(projectId);
    }
  };

  const renderDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Portfolio Sidebar */}
          <div className="lg:col-span-1">
            <PortfolioSidebar 
              portfolios={portfolios}
              projects={projects}
              selectedPortfolioId={selectedPortfolioId}
              selectedProjectId={selectedProjectId}
              onSelectPortfolio={handleSelectPortfolio}
              onSelectProject={handleSelectProject}
              trrCounts={trrCounts}
            />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header with breadcrumb */}
            <ProjectHeader 
              selectedPortfolio={selectedPortfolio}
              selectedProject={selectedProject}
              onClearSelection={clearSelection}
              onSelectPortfolio={handleSelectPortfolio}
            />
            
            {/* View Selection and Actions Bar */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-1 bg-cortex-bg-tertiary p-1 rounded">
                <button 
                  onClick={() => setSecondaryView('list')}
                  className={`px-3 py-1.5 rounded text-sm ${
                    secondaryView === 'list' 
                      ? 'bg-cortex-bg-primary text-cortex-text-primary'
                      : 'text-cortex-text-secondary hover:text-cortex-text-primary'
                  }`}
                >
                  List
                </button>
                <button 
                  onClick={() => setSecondaryView('kanban')}
                  className={`px-3 py-1.5 rounded text-sm ${
                    secondaryView === 'kanban' 
                      ? 'bg-cortex-bg-primary text-cortex-text-primary'
                      : 'text-cortex-text-secondary hover:text-cortex-text-primary'
                  }`}
                >
                  Kanban
                </button>
                <button 
                  onClick={() => setSecondaryView('timeline')}
                  className={`px-3 py-1.5 rounded text-sm ${
                    secondaryView === 'timeline' 
                      ? 'bg-cortex-bg-primary text-cortex-text-primary'
                      : 'text-cortex-text-secondary hover:text-cortex-text-primary'
                  }`}
                >
                  Timeline
                </button>
                <button 
                  onClick={() => setSecondaryView('gantt')}
                  className={`px-3 py-1.5 rounded text-sm ${
                    secondaryView === 'gantt' 
                      ? 'bg-cortex-bg-primary text-cortex-text-primary'
                      : 'text-cortex-text-secondary hover:text-cortex-text-primary'
                  }`}
                >
                  Gantt
                </button>
                <button 
                  onClick={() => setSecondaryView('dependencies')}
                  className={`px-3 py-1.5 rounded text-sm ${
                    secondaryView === 'dependencies' 
                      ? 'bg-cortex-bg-primary text-cortex-text-primary'
                      : 'text-cortex-text-secondary hover:text-cortex-text-primary'
                  }`}
                >
                  Dependencies
                </button>
                <button 
                  onClick={() => setSecondaryView('analytics')}
                  className={`px-3 py-1.5 rounded text-sm ${
                    secondaryView === 'analytics' 
                      ? 'bg-cortex-bg-primary text-cortex-text-primary'
                      : 'text-cortex-text-secondary hover:text-cortex-text-primary'
                  }`}
                >
                  Analytics
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <CortexCommandButton
                  command="trr upload"
                  variant="outline"
                  icon="📤"
                  tooltip="Import TRRs from CSV file"
                >
                  Import CSV
                </CortexCommandButton>
                <CortexCommandButton
                  command="trr export"
                  variant="outline"
                  icon="📥"
                  tooltip="Export TRRs to CSV file"
                >
                  Export CSV
                </CortexCommandButton>
                <CortexButton
                  onClick={() => setView('create')}
                  variant="primary"
                  icon="📝"
                >
                  Create TRR
                </CortexButton>
              </div>
            </div>
            
            {/* Filter Bar */}
            <div className="bg-cortex-bg-tertiary p-3 rounded-lg flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search TRRs..."
                  className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded focus:outline-none focus:ring-2 focus:ring-cortex-green/50 text-cortex-text-primary placeholder-cortex-text-muted"
                  value={filters.searchQuery || ''}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                />
              </div>
              
              <div>
                <select
                  className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded focus:outline-none focus:ring-2 focus:ring-cortex-green/50 text-cortex-text-primary"
                  value={filters.status?.join(',') || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters({ 
                      ...filters, 
                      status: value ? value.split(',') as TRRStatus[] : undefined 
                    });
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="validated">Validated</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <select
                  className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded focus:outline-none focus:ring-2 focus:ring-cortex-green/50 text-cortex-text-primary"
                  value={filters.priority?.join(',') || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters({ 
                      ...filters, 
                      priority: value ? value.split(',') as TRRPriority[] : undefined 
                    });
                  }}
                >
                  <option value="">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setFilters({})}
                  className="text-cortex-text-secondary hover:text-cortex-text-primary transition-colors"
                >
                  Clear Filters
                </button>
                
                {/* Filter Summary */}
                <div className="text-sm text-cortex-text-muted">
                  Showing {filteredTRRs.length} of {trrs.length} TRRs
                  {(filters.searchQuery || filters.status || filters.priority) && (
                    <span className="ml-1 text-cortex-warning">(filtered)</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Content based on selected view */}
            {secondaryView === 'list' && (
              <TRRList
                trrs={filteredTRRs}
                onEdit={(trr) => {
                  setCurrentTRR(trr);
                  setView('edit');
                }}
                onView={(trr) => {
                  setCurrentTRR(trr);
                  setView('detail');
                }}
                onDelete={handleDeleteTRR}
                selectedTRRs={selectedTRRs}
                onSelectTRR={handleSelectTRR}
                onSelectAll={handleSelectAll}
              />
            )}
            
            {secondaryView === 'kanban' && (
              <div className="cortex-card p-6">
                <h3 className="text-xl font-bold text-cortex-text-primary mb-4">Kanban Board</h3>
                <p className="text-cortex-text-secondary">
                  This would be implemented with @hello-pangea/dnd for drag-and-drop functionality.
                </p>
              </div>
            )}
            
            {secondaryView === 'timeline' && (
              <div className="cortex-card p-6">
                <h3 className="text-xl font-bold text-cortex-text-primary mb-4">Timeline Visualization</h3>
                <p className="text-cortex-text-secondary">
                  This would be implemented with react-chrono to show TRR status changes over time.
                </p>
              </div>
            )}
            
            {secondaryView === 'gantt' && (
              <div className="cortex-card p-6">
                <h3 className="text-xl font-bold text-cortex-text-primary mb-4">Gantt Chart</h3>
                <p className="text-cortex-text-secondary">
                  This would be implemented with gantt-task-react to show TRR schedules and dependencies.
                </p>
              </div>
            )}
            
            {secondaryView === 'dependencies' && (
              <div className="cortex-card p-6">
                <h3 className="text-xl font-bold text-cortex-text-primary mb-4">Dependency Map</h3>
                <p className="text-cortex-text-secondary">
                  This would be implemented with reactflow to visualize TRR dependencies and blockers.
                </p>
              </div>
            )}
            
            {secondaryView === 'analytics' && (
              <AnalyticsPanel trrs={filteredTRRs} />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render based on current view
  switch (view) {
    case 'create':
      return (
        <TRRCreationForm
          onSubmit={handleCreateTRR}
          onCancel={() => setView('list')}
        />
      );
    
    case 'edit':
      return currentTRR ? (
        <TRRCreationForm
          initialData={currentTRR}
          onSubmit={handleEditTRR}
          onCancel={() => {
            setCurrentTRR(null);
            setView('list');
          }}
          isEditing
        />
      ) : null;
    
    case 'detail':
      return currentTRR ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <CortexButton onClick={() => setView('list')} variant="outline">
              Back to List
            </CortexButton>
          </div>
          <TRRDetailView trr={currentTRR} />
        </div>
      ) : null;
    
    default:
      return renderDashboard();
  }
};