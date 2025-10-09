'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { TRR, CreateTRRFormData, UpdateTRRFormData, TRRFilters, TRRStatus, TRRPriority, TRRCategory, RiskLevel, ValidationMethod } from '../types/trr';
import CortexButton from './CortexButton';

// Re-export types for other components
export type { TRR, CreateTRRFormData, UpdateTRRFormData, TRRFilters, TRRStatus, TRRPriority, TRRCategory, RiskLevel, ValidationMethod };

// Mock data store
export let trrDatabase: TRR[] = [
  {
    id: 'TRR-2024-001',
    title: 'SIEM Integration Validation',
    description: 'Validate integration with customer existing SIEM solution and ensure bi-directional data flow',
    category: 'integration',
    priority: 'critical',
    status: 'in-progress',
    assignedTo: 'John Smith',
    assignedToEmail: 'john.smith@company.com',
    customer: 'Acme Corp',
    customerContact: 'jane.doe@acmecorp.com',
    project: 'ACME-XSIAM-2024',
    scenario: 'siem-integration-demo',
    validationMethod: 'manual',
    expectedOutcome: 'Successful bi-directional data flow and alert correlation',
    acceptanceCriteria: [
      'Data flows from SIEM to XSIAM within 60 seconds',
      'Alerts are properly correlated and deduplicated',
      'Custom dashboards display integrated data correctly'
    ],
    evidence: [],
    attachments: [],
    comments: [],
    createdDate: '2024-01-15T10:00:00Z',
    updatedDate: '2024-01-18T14:30:00Z',
    dueDate: '2024-01-25T17:00:00Z',
    estimatedHours: 16,
    actualHours: 12,
    complexity: 'complex',
    dependencies: [],
    blockedBy: [],
    relatedTRRs: ['TRR-2024-002'],
    riskLevel: 'high',
    businessImpact: 'Critical for customer security operations workflow',
    technicalRisk: 'API compatibility issues may cause integration failures',
    complianceFrameworks: ['SOC2', 'ISO27001'],
    regulatoryRequirements: ['GDPR'],
    validationResults: [],
    testCases: [],
    signoffs: [],
    approvals: [],
    tags: ['integration', 'siem', 'high-priority'],
    customFields: {},
    archived: false,
    version: 1,
    workflowStage: 'validation',
    nextActionRequired: 'Complete network connectivity tests'
  },
  {
    id: 'TRR-2024-002',
    title: 'Network Connectivity Validation',
    description: 'Verify network connectivity between XSIAM and customer endpoints with proper latency requirements',
    category: 'integration',
    priority: 'high',
    status: 'completed',
    assignedTo: 'Sarah Johnson',
    assignedToEmail: 'sarah.johnson@company.com',
    customer: 'Acme Corp',
    project: 'ACME-XSIAM-2024',
    validationMethod: 'automated',
    expectedOutcome: 'All required ports accessible with latency under 100ms',
    actualOutcome: 'All connections successful, average latency 45ms',
    acceptanceCriteria: [
      'All required ports (443, 8443, 9443) are accessible',
      'Network latency is under 100ms',
      'Bandwidth meets minimum 10Mbps requirement'
    ],
    evidence: [],
    attachments: [],
    comments: [],
    createdDate: '2024-01-10T09:00:00Z',
    updatedDate: '2024-01-16T11:45:00Z',
    completedDate: '2024-01-16T11:45:00Z',
    estimatedHours: 8,
    actualHours: 6,
    complexity: 'simple',
    dependencies: [],
    blockedBy: [],
    relatedTRRs: ['TRR-2024-001'],
    riskLevel: 'low',
    businessImpact: 'Essential for platform functionality',
    technicalRisk: 'Firewall rules may block required ports',
    complianceFrameworks: [],
    regulatoryRequirements: [],
    validationResults: [],
    testCases: [],
    signoffs: [],
    approvals: [],
    tags: ['network', 'connectivity', 'completed'],
    customFields: {},
    archived: false,
    version: 1,
    workflowStage: 'completed'
  }
];

const statusValues: TRRStatus[] = ['draft', 'pending', 'in-progress', 'validated', 'failed', 'not-applicable', 'completed'];
const priorityValues: TRRPriority[] = ['critical', 'high', 'medium', 'low'];
const categoryValues: TRRCategory[] = ['security', 'performance', 'compliance', 'integration', 'usability', 'scalability', 'reliability'];
const riskValues: RiskLevel[] = ['low', 'medium', 'high', 'critical'];
const validationValues: ValidationMethod[] = ['manual', 'automated', 'hybrid', 'peer-review', 'compliance-check'];

const normalizeString = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
};

const parseEnumValue = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
  aliases: Record<string, T> = {},
): T => {
  const normalized = normalizeString(value).toLowerCase();
  if (!normalized) {
    return fallback;
  }

  const canonical = normalized.replace(/[_\s]+/g, '-');
  if (aliases[canonical]) {
    return aliases[canonical];
  }

  return (allowed.find(item => item === canonical) ?? fallback) as T;
};

const parseListValue = (value: unknown): string[] => {
  if (!value && value !== 0) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map(item => normalizeString(item)).filter(Boolean);
  }

  const stringValue = normalizeString(value);
  if (!stringValue) {
    return [];
  }

  return stringValue
    .split(/[,;\n|]/)
    .map(item => item.trim())
    .filter(Boolean);
};

const parseNumberValue = (value: unknown): number | undefined => {
  const stringValue = normalizeString(value);
  if (!stringValue) {
    return undefined;
  }

  const parsed = Number(stringValue);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseDateValue = (value: unknown): string | undefined => {
  const stringValue = normalizeString(value);
  if (!stringValue) {
    return undefined;
  }

  const parsed = Date.parse(stringValue);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }

  const usMatch = stringValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    const normalizedYear = year.length === 2 ? `20${year}` : year;
    return new Date(Number(normalizedYear), Number(month) - 1, Number(day)).toISOString();
  }

  return stringValue;
};

const parseComplexity = (value: unknown): 'simple' | 'moderate' | 'complex' | 'very-complex' => {
  const stringValue = normalizeString(value).toLowerCase();
  if (!stringValue) {
    return 'moderate';
  }

  const normalized = stringValue.replace(/[_\s]+/g, '-');
  if (['simple', 'moderate', 'complex', 'very-complex'].includes(normalized)) {
    return normalized as 'simple' | 'moderate' | 'complex' | 'very-complex';
  }

  if (normalized === 'verycomplex' || normalized === 'very-complex') {
    return 'very-complex';
  }

  return 'moderate';
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

const ensureUniqueId = (preferredId: string | undefined, existingIds: Set<string>): string => {
  const fallback = preferredId && preferredId.trim() ? preferredId.trim() : generateTRRId();
  const base = fallback.replace(/\s+/g, '-');
  let candidate = base || generateTRRId();
  let suffix = 1;

  while (existingIds.has(candidate.toLowerCase())) {
    candidate = `${base || generateTRRId()}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};

type ImportFeedback = {
  type: 'success' | 'error';
  message: string;
  details?: string[];
};

const buildTRRFromInput = (input: Record<string, any>, existingIds: Set<string>): TRR => {
  const normalized: Record<string, any> = { ...input };

  Object.keys(input).forEach(key => {
    if (typeof key === 'string') {
      const lower = key.toLowerCase();
      const compact = lower.replace(/[_\s-]+/g, '');
      normalized[lower] = input[key];
      normalized[compact] = input[key];
    }
  });

  const getValue = (...keys: string[]): any => {
    for (const key of keys) {
      if (normalized[key] !== undefined) {
        return normalized[key];
      }
      const lower = key.toLowerCase();
      if (normalized[lower] !== undefined) {
        return normalized[lower];
      }
      const compact = lower.replace(/[_\s-]+/g, '');
      if (normalized[compact] !== undefined) {
        return normalized[compact];
      }
    }
    return undefined;
  };

  const now = new Date().toISOString();
  const title = normalizeString(getValue('title', 'trr title', 'name')) || 'Imported TRR';
  const description = normalizeString(getValue('description', 'summary', 'details')) || 'Imported via bulk upload';
  const preferredId = normalizeString(getValue('id', 'trrId', 'trr_id', 'reference'));
  const id = ensureUniqueId(preferredId, existingIds);
  existingIds.add(id.toLowerCase());

  const status = parseEnumValue(
    getValue('status', 'state', 'trr status'),
    statusValues,
    'draft',
    {
      'in-progress': 'in-progress',
      'inprogress': 'in-progress',
      'in_progress': 'in-progress',
      'not-applicable': 'not-applicable',
      'notapplicable': 'not-applicable',
    },
  );

  const priority = parseEnumValue(getValue('priority', 'severity', 'impact'), priorityValues, 'medium');
  const category = parseEnumValue(getValue('category', 'type', 'trr category'), categoryValues, 'integration');
  const riskLevel = parseEnumValue(getValue('riskLevel', 'risk level'), riskValues, 'low');
  const validationMethod = parseEnumValue(
    getValue('validationMethod', 'validation method', 'method'),
    validationValues,
    'manual',
    {
      'peer-review': 'peer-review',
      'peerreview': 'peer-review',
      'compliance-check': 'compliance-check',
      'compliancecheck': 'compliance-check',
    },
  );

  const acceptance = parseListValue(getValue('acceptanceCriteria', 'acceptance criteria'));
  const dependencies = parseListValue(getValue('dependencies'));
  const blockedBy = parseListValue(getValue('blockedBy', 'blocked by'));
  const relatedTRRs = parseListValue(getValue('relatedTRRs', 'related trrs'));
  const complianceFrameworks = parseListValue(getValue('complianceFrameworks', 'compliance frameworks'));
  const regulatoryRequirements = parseListValue(getValue('regulatoryRequirements', 'regulatory requirements'));
  const tags = parseListValue(getValue('tags', 'labels'));

  const createdDate = parseDateValue(getValue('createdDate', 'created date')) ?? now;
  const updatedDate = parseDateValue(getValue('updatedDate', 'updated date')) ?? createdDate;
  const dueDate = parseDateValue(getValue('dueDate', 'due date'));
  const startDate = parseDateValue(getValue('startDate', 'start date'));
  const completedDate = parseDateValue(getValue('completedDate', 'completed date'));
  const escalationDate = parseDateValue(getValue('escalationDate', 'escalation date'));

  const estimatedHours = parseNumberValue(getValue('estimatedHours', 'estimated hours'));
  const actualHours = parseNumberValue(getValue('actualHours', 'actual hours'));
  const versionNumber = parseNumberValue(getValue('version'));

  const evidenceValue = getValue('evidence');
  const attachmentsValue = getValue('attachments');
  const commentsValue = getValue('comments');
  const validationResultsValue = getValue('validationResults');
  const testCasesValue = getValue('testCases');
  const signoffsValue = getValue('signoffs');
  const approvalsValue = getValue('approvals');
  const customFieldsValue = getValue('customFields');
  const externalIdsValue = getValue('externalIds');

  const archivedValue = getValue('archived');
  const archived = typeof archivedValue === 'boolean'
    ? archivedValue
    : normalizeString(archivedValue).toLowerCase() === 'true';

  const acceptanceCriteria = acceptance.length ? acceptance : [''];

  return {
    id,
    title,
    description,
    category,
    priority,
    status,
    assignedTo: normalizeString(getValue('assignedTo', 'assignee', 'owner')) || 'Unassigned',
    assignedToEmail: normalizeString(getValue('assignedToEmail', 'assigneeEmail', 'ownerEmail')),
    customer: normalizeString(getValue('customer', 'account', 'account name')) || 'Unknown Customer',
    customerContact: normalizeString(getValue('customerContact', 'contact', 'contact email')) || undefined,
    project: normalizeString(getValue('project', 'project name')) || undefined,
    scenario: normalizeString(getValue('scenario')) || undefined,
    validationMethod,
    expectedOutcome: normalizeString(getValue('expectedOutcome', 'expected outcome')),
    actualOutcome: normalizeString(getValue('actualOutcome', 'actual outcome')) || undefined,
    acceptanceCriteria,
    evidence: Array.isArray(evidenceValue) ? (evidenceValue as TRR['evidence']) : [],
    attachments: Array.isArray(attachmentsValue) ? (attachmentsValue as TRR['attachments']) : [],
    comments: Array.isArray(commentsValue) ? (commentsValue as TRR['comments']) : [],
    createdDate,
    updatedDate,
    dueDate,
    startDate,
    completedDate,
    estimatedHours,
    actualHours,
    complexity: parseComplexity(getValue('complexity')),
    dependencies,
    blockedBy,
    relatedTRRs,
    riskLevel,
    businessImpact: normalizeString(getValue('businessImpact', 'business impact')),
    technicalRisk: normalizeString(getValue('technicalRisk', 'technical risk')),
    mitigationPlan: normalizeString(getValue('mitigationPlan', 'mitigation plan')) || undefined,
    complianceFrameworks,
    regulatoryRequirements,
    validationResults: Array.isArray(validationResultsValue)
      ? (validationResultsValue as TRR['validationResults'])
      : [],
    testCases: Array.isArray(testCasesValue) ? (testCasesValue as TRR['testCases']) : [],
    signoffs: Array.isArray(signoffsValue) ? (signoffsValue as TRR['signoffs']) : [],
    approvals: Array.isArray(approvalsValue) ? (approvalsValue as TRR['approvals']) : [],
    tags,
    customFields: isPlainObject(customFieldsValue)
      ? (customFieldsValue as Record<string, any>)
      : {},
    archived,
    version: versionNumber && versionNumber > 0 ? Math.round(versionNumber) : 1,
    externalIds: isPlainObject(externalIdsValue)
      ? (externalIdsValue as Record<string, string>)
      : undefined,
    workflowStage: normalizeString(getValue('workflowStage', 'workflow stage', 'stage')) || status,
    nextActionRequired: normalizeString(getValue('nextActionRequired', 'next action required')) || undefined,
    escalationDate,
  };
};

// Utility functions
const generateTRRId = (): string => {
  const year = new Date().getFullYear();
  const sequence = trrDatabase.length + 1;
  return `TRR-${year}-${sequence.toString().padStart(3, '0')}`;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString();
};

const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleString();
};

// TRR Creation Form Component
const TRRCreationForm: React.FC<{
  initialData?: Partial<CreateTRRFormData>;
  onSubmit: (data: CreateTRRFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}> = ({ initialData, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState<CreateTRRFormData>({
    title: '',
    description: '',
    category: 'integration',
    priority: 'medium',
    assignedTo: '',
    assignedToEmail: '',
    customer: '',
    customerContact: '',
    project: '',
    scenario: '',
    validationMethod: 'manual',
    expectedOutcome: '',
    acceptanceCriteria: [''],
    dueDate: '',
    estimatedHours: undefined,
    complexity: 'moderate',
    riskLevel: 'low',
    businessImpact: '',
    technicalRisk: '',
    complianceFrameworks: [],
    tags: [],
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.assignedTo.trim()) newErrors.assignedTo = 'Assigned person is required';
    if (!formData.assignedToEmail.trim()) newErrors.assignedToEmail = 'Assigned person email is required';
    if (!formData.customer.trim()) newErrors.customer = 'Customer is required';
    if (!formData.expectedOutcome.trim()) newErrors.expectedOutcome = 'Expected outcome is required';
    if (!formData.businessImpact.trim()) newErrors.businessImpact = 'Business impact is required';
    if (!formData.technicalRisk.trim()) newErrors.technicalRisk = 'Technical risk is required';
    
    if (formData.assignedToEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.assignedToEmail)) {
      newErrors.assignedToEmail = 'Invalid email format';
    }
    
    if (formData.customerContact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerContact)) {
      newErrors.customerContact = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const updateAcceptanceCriteria = (index: number, value: string) => {
    const newCriteria = [...formData.acceptanceCriteria];
    newCriteria[index] = value;
    setFormData({ ...formData, acceptanceCriteria: newCriteria });
  };

  const addAcceptanceCriteria = () => {
    setFormData({ ...formData, acceptanceCriteria: [...formData.acceptanceCriteria, ''] });
  };

  const removeAcceptanceCriteria = (index: number) => {
    const newCriteria = formData.acceptanceCriteria.filter((_, i) => i !== index);
    setFormData({ ...formData, acceptanceCriteria: newCriteria });
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({ ...formData, tags: newTags });
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
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50 ${
                errors.title ? 'border-status-error' : 'border-cortex-border/40'
              }`}
              placeholder="Enter TRR title"
            />
            {errors.title && <p className="text-status-error text-sm mt-1">{errors.title}</p>}
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50 resize-none ${
                errors.description ? 'border-status-error' : 'border-cortex-border/40'
              }`}
              placeholder="Detailed description of the technical requirement"
            />
            {errors.description && <p className="text-status-error text-sm mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Categorization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as TRRCategory })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
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
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
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
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
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
              className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50 ${
                errors.assignedTo ? 'border-status-error' : 'border-cortex-border/40'
              }`}
              placeholder="Full name"
            />
            {errors.assignedTo && <p className="text-status-error text-sm mt-1">{errors.assignedTo}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.assignedToEmail}
              onChange={(e) => setFormData({ ...formData, assignedToEmail: e.target.value })}
              className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50 ${
                errors.assignedToEmail ? 'border-status-error' : 'border-cortex-border/40'
              }`}
              placeholder="email@company.com"
            />
            {errors.assignedToEmail && <p className="text-status-error text-sm mt-1">{errors.assignedToEmail}</p>}
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
              className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50 ${
                errors.customer ? 'border-status-error' : 'border-cortex-border/40'
              }`}
              placeholder="Customer name"
            />
            {errors.customer && <p className="text-status-error text-sm mt-1">{errors.customer}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Customer Contact
            </label>
            <input
              type="email"
              value={formData.customerContact}
              onChange={(e) => setFormData({ ...formData, customerContact: e.target.value })}
              className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50 ${
                errors.customerContact ? 'border-status-error' : 'border-cortex-border/40'
              }`}
              placeholder="contact@customer.com"
            />
            {errors.customerContact && <p className="text-status-error text-sm mt-1">{errors.customerContact}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Project
            </label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
              placeholder="Project code/name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Scenario
            </label>
            <input
              type="text"
              value={formData.scenario}
              onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
              placeholder="Related scenario"
            />
          </div>
        </div>

        {/* Validation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Validation Method
            </label>
            <select
              value={formData.validationMethod}
              onChange={(e) => setFormData({ ...formData, validationMethod: e.target.value as ValidationMethod })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
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
              onChange={(e) => setFormData({ ...formData, complexity: e.target.value as CreateTRRFormData['complexity'] })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
            >
              <option value="simple">Simple</option>
              <option value="moderate">Moderate</option>
              <option value="complex">Complex</option>
              <option value="very-complex">Very Complex</option>
            </select>
          </div>
        </div>

        {/* Timeline and Effort */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Estimated Hours
            </label>
            <input
              type="number"
              value={formData.estimatedHours || ''}
              onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
              placeholder="Hours"
              min="0"
            />
          </div>
        </div>

        {/* Outcomes and Risks */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Expected Outcome *
            </label>
            <textarea
              value={formData.expectedOutcome}
              onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
              rows={3}
              className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50 resize-none ${
                errors.expectedOutcome ? 'border-status-error' : 'border-cortex-border/40'
              }`}
              placeholder="Describe what success looks like"
            />
            {errors.expectedOutcome && <p className="text-status-error text-sm mt-1">{errors.expectedOutcome}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Business Impact *
            </label>
            <textarea
              value={formData.businessImpact}
              onChange={(e) => setFormData({ ...formData, businessImpact: e.target.value })}
              rows={3}
              className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50 resize-none ${
                errors.businessImpact ? 'border-status-error' : 'border-cortex-border/40'
              }`}
              placeholder="Explain the business impact and importance"
            />
            {errors.businessImpact && <p className="text-status-error text-sm mt-1">{errors.businessImpact}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Technical Risk *
            </label>
            <textarea
              value={formData.technicalRisk}
              onChange={(e) => setFormData({ ...formData, technicalRisk: e.target.value })}
              rows={3}
              className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50 resize-none ${
                errors.technicalRisk ? 'border-status-error' : 'border-cortex-border/40'
              }`}
              placeholder="Identify potential technical risks and challenges"
            />
            {errors.technicalRisk && <p className="text-status-error text-sm mt-1">{errors.technicalRisk}</p>}
          </div>
        </div>

        {/* Acceptance Criteria */}
        <div>
          <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
            Acceptance Criteria
          </label>
          <div className="space-y-2">
            {formData.acceptanceCriteria.map((criteria, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-cortex-text-muted">•</span>
                <input
                  type="text"
                  value={criteria}
                  onChange={(e) => updateAcceptanceCriteria(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
                  placeholder={`Acceptance criteria ${index + 1}`}
                />
                {formData.acceptanceCriteria.length > 1 && (
                  <CortexButton
                    onClick={() => removeAcceptanceCriteria(index)}
                    variant="outline"
                    size="sm"
                    ariaLabel={`Remove criteria ${index + 1}`}
                  >
                    ✕
                  </CortexButton>
                )}
              </div>
            ))}
            <CortexButton
              onClick={addAcceptanceCriteria}
              variant="outline"
              size="sm"
              icon="+"
            >
              Add Criteria
            </CortexButton>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cortex-bg-hover text-cortex-text-primary border border-cortex-border/40"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-2 text-cortex-text-muted hover:text-cortex-text-primary"
                  aria-label={`Remove tag ${tag}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add tag and press Enter"
            className="w-full px-4 py-2 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (value) {
                  addTag(value);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-cortex-border/40">
          <CortexButton onClick={onCancel} variant="outline">
            Cancel
          </CortexButton>
          <CortexButton type="submit" variant="primary" icon={isEditing ? '✏️' : '📝'}>
            {isEditing ? 'Update TRR' : 'Create TRR'}
          </CortexButton>
        </div>
      </form>
    </div>
  );
};

// TRR List Component
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
      'pending': 'text-status-warning bg-status-warning/10',
      'in-progress': 'text-status-info bg-status-info/10',
      'validated': 'text-cortex-primary bg-cortex-primary/10',
      'failed': 'text-status-error bg-status-error/10',
      'not-applicable': 'text-cortex-text-muted bg-cortex-bg-hover',
      'completed': 'text-cortex-primary bg-cortex-primary/10'
    };
    return colors[status] || 'text-cortex-text-muted bg-cortex-bg-hover';
  };

  const getPriorityColor = (priority: TRRPriority): string => {
    const colors = {
      'low': 'text-cortex-text-muted bg-cortex-bg-hover',
      'medium': 'text-status-info bg-status-info/10',
      'high': 'text-status-warning bg-status-warning/10',
      'critical': 'text-status-error bg-status-error/10'
    };
    return colors[priority] || 'text-cortex-text-muted bg-cortex-bg-hover';
  };

  return (
    <div className="cortex-card">
      {/* Header */}
      <div className="p-6 border-b border-cortex-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedTRRs.length === trrs.length && trrs.length > 0}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="rounded border-cortex-border/40 focus:ring-cortex-primary"
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
              <CortexButton variant="outline" size="sm" icon="📤">
                Bulk Export
              </CortexButton>
              <CortexButton variant="outline" size="sm" icon="🔄">
                Bulk Update
              </CortexButton>
            </div>
          )}
        </div>
      </div>

      {/* TRR List */}
      <div className="divide-y divide-cortex-border/40">
        {trrs.map((trr) => (
          <div key={trr.id} className="p-6 hover:bg-cortex-bg-hover/50 transition-colors">
            <div className="flex items-start space-x-4">
              <input
                type="checkbox"
                checked={selectedTRRs.includes(trr.id)}
                onChange={(e) => onSelectTRR(trr.id, e.target.checked)}
                className="mt-1 rounded border-cortex-border/40 focus:ring-cortex-primary"
              />
              
              <div className="flex-1 min-w-0">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-semibold text-cortex-text-primary cursor-pointer hover:text-cortex-primary" onClick={() => onView(trr)}>
                      {trr.title}
                    </h4>
                    <span className="font-mono text-sm text-cortex-accent">
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

                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-cortex-text-muted">
                  <div>
                    <span className="font-medium">Assigned:</span> {trr.assignedTo}
                  </div>
                  <div>
                    <span className="font-medium">Customer:</span> {trr.customer}
                  </div>
                  <div>
                    <span className="font-medium">Due:</span> {formatDate(trr.dueDate)}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {formatDate(trr.updatedDate)}
                  </div>
                </div>

                {/* Tags */}
                {trr.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {trr.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-cortex-bg-tertiary text-cortex-text-muted rounded border border-cortex-border/40"
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
                    <CortexButton
                      variant="outline"
                      size="sm"
                      icon="⛓️"
                      onClick={() => {
                        console.log(`trr-signoff create ${trr.id}`);
                      }}
                    >
                      Sign
                    </CortexButton>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {trr.riskLevel !== 'low' && (
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        trr.riskLevel === 'critical' ? 'bg-status-error/10 text-status-error' :
                        trr.riskLevel === 'high' ? 'bg-status-warning/10 text-status-warning' :
                        'bg-status-info/10 text-status-info'
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
                      className="text-status-error hover:text-status-error"
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

// Main TRR Management Component
export const TRRManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'detail'>('list');
  const [currentTRR, setCurrentTRR] = useState<TRR | null>(null);
  const [trrs, setTRRs] = useState<TRR[]>(trrDatabase);
  const [selectedTRRs, setSelectedTRRs] = useState<string[]>([]);
  const [filters, setFilters] = useState<TRRFilters>({});
  const [importFeedback, setImportFeedback] = useState<ImportFeedback | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const feedbackDetails: string[] = [];
    const imported: TRR[] = [];
    const existingIds = new Set(trrDatabase.map(trr => trr.id.toLowerCase()));

    try {
      if (file.name.toLowerCase().endsWith('.json')) {
        const text = await file.text();
        let parsed: unknown;

        try {
          parsed = JSON.parse(text);
        } catch (error) {
          throw new Error('Invalid JSON file. Please ensure the file contains valid JSON.');
        }

        const entries = Array.isArray(parsed) ? parsed : [parsed];

        entries.forEach((entry, index) => {
          if (!isPlainObject(entry)) {
            feedbackDetails.push(`Entry ${index + 1}: Skipped because it was not an object.`);
            return;
          }

          const hasContent = Object.values(entry).some(value => normalizeString(value).length > 0);
          if (!hasContent) {
            feedbackDetails.push(`Entry ${index + 1}: No data detected. Skipped.`);
            return;
          }

          const trr = buildTRRFromInput(entry as Record<string, any>, existingIds);
          if (trr.title === 'Imported TRR') {
            feedbackDetails.push(`Entry ${index + 1}: Title missing. Default applied.`);
          }
          imported.push(trr);
        });
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        const text = await file.text();
        const { data, errors } = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true,
        });

        errors.forEach(error => {
          feedbackDetails.push(`Row ${typeof error.row === 'number' ? error.row + 1 : 'unknown'}: ${error.message}`);
        });

        data.forEach((row, index) => {
          const normalizedRow: Record<string, any> = {};
          Object.entries(row).forEach(([key, value]) => {
            normalizedRow[key] = value;
          });

          const hasContent = Object.values(normalizedRow).some(value => normalizeString(value).length > 0);
          if (!hasContent) {
            feedbackDetails.push(`Row ${index + 2}: No data detected. Skipped.`);
            return;
          }

          const trr = buildTRRFromInput(normalizedRow, existingIds);
          if (trr.title === 'Imported TRR') {
            feedbackDetails.push(`Row ${index + 2}: Title missing. Default applied.`);
          }
          imported.push(trr);
        });
      } else {
        throw new Error('Unsupported file type. Please select a CSV or JSON file.');
      }

      if (imported.length > 0) {
        setTRRs(prev => [...prev, ...imported]);
        trrDatabase = [...trrDatabase, ...imported];
        setImportFeedback({
          type: 'success',
          message: `Imported ${imported.length} TRR${imported.length === 1 ? '' : 's'} from ${file.name}.`,
          details: feedbackDetails.length ? feedbackDetails : undefined,
        });
      } else {
        setImportFeedback({
          type: 'error',
          message: `No TRRs were imported from ${file.name}.`,
          details: feedbackDetails.length ? feedbackDetails : undefined,
        });
      }
    } catch (error) {
      console.error('Failed to import TRRs:', error);
      setImportFeedback({
        type: 'error',
        message: (error as Error).message || 'Failed to import TRRs.',
      });
    } finally {
      event.target.value = '';
    }
  };


  const handleCreateTRR = (formData: CreateTRRFormData) => {
    const newTRR: TRR = {
      id: generateTRRId(),
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
      workflowStage: 'draft'
    };
    
    setTRRs([...trrs, newTRR]);
    trrDatabase.push(newTRR);
    setView('list');
  };

  const handleEditTRR = (formData: CreateTRRFormData) => {
    if (!currentTRR) return;

    const updatedTRR: TRR = {
      ...currentTRR,
      ...formData,
      updatedDate: new Date().toISOString(),
      version: currentTRR.version + 1
    };

    setTRRs(trrs.map(trr => trr.id === currentTRR.id ? updatedTRR : trr));
    const index = trrDatabase.findIndex(trr => trr.id === currentTRR.id);
    if (index !== -1) trrDatabase[index] = updatedTRR;
    
    setCurrentTRR(null);
    setView('list');
  };

  const handleDeleteTRR = (trrId: string) => {
    if (confirm('Are you sure you want to delete this TRR? This action cannot be undone.')) {
      setTRRs(trrs.filter(trr => trr.id !== trrId));
      trrDatabase = trrDatabase.filter(trr => trr.id !== trrId);
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
      setSelectedTRRs(trrs.map(trr => trr.id));
    } else {
      setSelectedTRRs([]);
    }
  };

  const renderDashboard = () => {
    const stats = {
      total: trrs.length,
      draft: trrs.filter(trr => trr.status === 'draft').length,
      inProgress: trrs.filter(trr => trr.status === 'in-progress').length,
      validated: trrs.filter(trr => trr.status === 'validated').length,
      completed: trrs.filter(trr => trr.status === 'completed').length,
      overdue: trrs.filter(trr => trr.dueDate && new Date(trr.dueDate) < new Date()).length,
      critical: trrs.filter(trr => trr.priority === 'critical').length
    };

    return (
      <div className="space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json,application/json,text/csv"
          className="hidden"
          onChange={handleFileImport}
        />
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-cortex-text-primary">TRR Management</h1>
          <div className="flex items-center space-x-3">
            <CortexButton
              variant="outline"
              icon="📤"
              onClick={handleImportClick}
            >
              Import CSV/JSON
            </CortexButton>
            <CortexButton
              variant="outline"
              icon="📥"
              onClick={() => {
                console.log("trr export");
              }}
            >
              Export CSV
            </CortexButton>
            <CortexButton
              onClick={() => setView('create')}
              variant="primary"
              icon="📝"
            >
              Create TRR
            </CortexButton>
          </div>
        </div>

        {importFeedback && (
          <div
            className={`cortex-card border p-4 ${
              importFeedback.type === 'success'
                ? 'border-status-success/40 bg-status-success/5'
                : 'border-status-error/40 bg-status-error/5'
            }`}
          >
            <p className="text-sm font-semibold text-cortex-text-primary">
              {importFeedback.message}
            </p>
            {importFeedback.details && importFeedback.details.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-cortex-text-secondary">
                {importFeedback.details.map((detail, index) => (
                  <li key={`${detail}-${index}`}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-text-primary">{stats.total}</div>
            <div className="text-sm text-cortex-text-secondary">Total TRRs</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-text-muted">{stats.draft}</div>
            <div className="text-sm text-cortex-text-secondary">Draft</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-status-info">{stats.inProgress}</div>
            <div className="text-sm text-cortex-text-secondary">In Progress</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-primary">{stats.validated}</div>
            <div className="text-sm text-cortex-text-secondary">Validated</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-primary">{stats.completed}</div>
            <div className="text-sm text-cortex-text-secondary">Completed</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-status-warning">{stats.overdue}</div>
            <div className="text-sm text-cortex-text-secondary">Overdue</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-status-error">{stats.critical}</div>
            <div className="text-sm text-cortex-text-secondary">Critical</div>
          </div>
        </div>

        {/* TRR List */}
        <TRRList
          trrs={trrs}
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
      // TODO: Implement detailed TRR view
      return (
        <div className="cortex-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-cortex-text-primary">TRR Details</h2>
            <CortexButton onClick={() => setView('list')} variant="outline">
              Back to List
            </CortexButton>
          </div>
          <p className="text-cortex-text-secondary">Detailed view implementation coming soon...</p>
        </div>
      );
    
    default:
      return renderDashboard();
  }
};