'use client';

import React, { useState, useEffect } from 'react';
import CortexButton from './CortexButton';

// Content types and interfaces
export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'pov' | 'scenario' | 'template' | 'report' | 'assessment';
  type: 'block-based' | 'form-based' | 'hybrid';
  fields: ContentField[];
  defaultValues: Record<string, any>;
  validationRules: ValidationRule[];
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdDate: string;
  updatedDate: string;
  usageCount: number;
  version: number;
}

export interface ContentField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'number' | 'boolean' | 'file' | 'list' | 'tags' | 'rich-text';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
  conditional?: {
    field: string;
    value: any;
    operator: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than';
  };
  defaultValue?: any;
  order: number;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'email' | 'url' | 'min-length' | 'max-length' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface ContentInstance {
  id: string;
  templateId: string;
  templateName: string;
  name: string;
  description: string;
  category: ContentTemplate['category'];
  data: Record<string, any>;
  status: 'draft' | 'in-progress' | 'review' | 'completed' | 'published' | 'archived';
  createdBy: string;
  createdDate: string;
  updatedDate: string;
  assignedTo?: string;
  dueDate?: string;
  tags: string[];
  version: number;
  comments: ContentComment[];
  attachments: ContentAttachment[];
}

export interface ContentComment {
  id: string;
  content: string;
  author: string;
  createdDate: string;
  type: 'note' | 'feedback' | 'approval' | 'rejection';
}

export interface ContentAttachment {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedDate: string;
}

// Mock data stores
const contentTemplates: ContentTemplate[] = [
  {
    id: 'tpl-pov-001',
    name: 'Enterprise POV Template',
    description: 'Comprehensive template for enterprise proof of value projects',
    category: 'pov',
    type: 'form-based',
    fields: [
      {
        id: 'project-name',
        name: 'projectName',
        label: 'Project Name',
        type: 'text',
        required: true,
        placeholder: 'Enter project name',
        helpText: 'Clear, descriptive name for the POV project',
        order: 1
      },
      {
        id: 'customer-org',
        name: 'customerOrg',
        label: 'Customer Organization',
        type: 'text',
        required: true,
        placeholder: 'Customer company name',
        order: 2
      },
      {
        id: 'objectives',
        name: 'objectives',
        label: 'Project Objectives',
        type: 'list',
        required: true,
        helpText: 'List the key objectives for this POV',
        defaultValue: [''],
        order: 3
      },
      {
        id: 'timeline',
        name: 'timeline',
        label: 'Timeline',
        type: 'select',
        required: true,
        options: ['30 days', '60 days', '90 days', '120 days', 'Custom'],
        defaultValue: '90 days',
        order: 4
      },
      {
        id: 'success-criteria',
        name: 'successCriteria',
        label: 'Success Criteria',
        type: 'list',
        required: true,
        helpText: 'Define measurable success criteria',
        defaultValue: [''],
        order: 5
      }
    ],
    defaultValues: {
      timeline: '90 days'
    },
    validationRules: [
      {
        field: 'projectName',
        rule: 'required',
        message: 'Project name is required'
      },
      {
        field: 'customerOrg',
        rule: 'required',
        message: 'Customer organization is required'
      }
    ],
    tags: ['pov', 'enterprise', 'template'],
    isPublic: true,
    createdBy: 'system',
    createdDate: '2024-01-01T00:00:00Z',
    updatedDate: '2024-01-01T00:00:00Z',
    usageCount: 15,
    version: 1
  },
  {
    id: 'tpl-scenario-001',
    name: 'Security Scenario Template',
    description: 'Template for creating security testing scenarios',
    category: 'scenario',
    type: 'block-based',
    fields: [
      {
        id: 'scenario-name',
        name: 'scenarioName',
        label: 'Scenario Name',
        type: 'text',
        required: true,
        placeholder: 'Enter scenario name',
        order: 1
      },
      {
        id: 'threat-type',
        name: 'threatType',
        label: 'Threat Type',
        type: 'select',
        required: true,
        options: ['Ransomware', 'APT', 'Insider Threat', 'Data Exfiltration', 'Supply Chain', 'Cloud Attack'],
        order: 2
      },
      {
        id: 'attack-vectors',
        name: 'attackVectors',
        label: 'Attack Vectors',
        type: 'list',
        required: true,
        helpText: 'List the attack vectors to simulate',
        defaultValue: [''],
        order: 3
      },
      {
        id: 'mitre-mapping',
        name: 'mitreMapping',
        label: 'MITRE ATT&CK Mapping',
        type: 'tags',
        required: false,
        helpText: 'Tag relevant MITRE ATT&CK techniques (e.g., T1078)',
        order: 4
      }
    ],
    defaultValues: {},
    validationRules: [
      {
        field: 'scenarioName',
        rule: 'required',
        message: 'Scenario name is required'
      }
    ],
    tags: ['scenario', 'security', 'testing'],
    isPublic: true,
    createdBy: 'system',
    createdDate: '2024-01-01T00:00:00Z',
    updatedDate: '2024-01-01T00:00:00Z',
    usageCount: 23,
    version: 1
  }
];

const contentInstances: ContentInstance[] = [
  {
    id: 'content-001',
    templateId: 'tpl-pov-001',
    templateName: 'Enterprise POV Template',
    name: 'Acme Corp Security Assessment POV',
    description: 'POV project for Acme Corporation security platform evaluation',
    category: 'pov',
    data: {
      projectName: 'Acme Corp Security Assessment POV',
      customerOrg: 'Acme Corporation',
      objectives: ['Evaluate XSIAM capabilities', 'Test integration with existing tools', 'Assess ROI potential'],
      timeline: '90 days',
      successCriteria: ['Successful SIEM integration', '99% uptime during testing', 'Positive stakeholder feedback']
    },
    status: 'in-progress',
    createdBy: 'john.smith@company.com',
    createdDate: '2024-01-15T10:00:00Z',
    updatedDate: '2024-01-20T14:30:00Z',
    assignedTo: 'sarah.johnson@company.com',
    dueDate: '2024-04-15T17:00:00Z',
    tags: ['acme', 'security', 'enterprise'],
    version: 2,
    comments: [],
    attachments: []
  }
];

// Template Builder Component
const TemplateBuilder: React.FC<{
  template?: ContentTemplate;
  onSave: (template: Omit<ContentTemplate, 'id' | 'createdDate' | 'updatedDate' | 'usageCount'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}> = ({ template, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: ContentTemplate['category'];
    type: ContentTemplate['type'];
    fields: ContentField[];
    defaultValues: Record<string, any>;
    validationRules: ValidationRule[];
    tags: string[];
    isPublic: boolean;
  }>({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'pov',
    type: template?.type || 'form-based',
    fields: template?.fields || [],
    defaultValues: template?.defaultValues || {},
    validationRules: template?.validationRules || [],
    tags: template?.tags || [],
    isPublic: template?.isPublic ?? true
  });

  const [newField, setNewField] = useState<Partial<ContentField>>({
    type: 'text',
    required: false,
    order: (formData.fields.length + 1)
  });

  const addField = () => {
    if (!newField.name || !newField.label) return;
    
    const field: ContentField = {
      id: `field-${Date.now()}`,
      name: newField.name,
      label: newField.label,
      type: newField.type || 'text',
      required: newField.required || false,
      placeholder: newField.placeholder,
      helpText: newField.helpText,
      options: newField.options,
      order: formData.fields.length + 1
    };

    setFormData({
      ...formData,
      fields: [...formData.fields, field]
    });

    setNewField({
      type: 'text',
      required: false,
      order: formData.fields.length + 2
    });
  };

  const removeField = (index: number) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      fields: newFields.map((field, i) => ({ ...field, order: i + 1 }))
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      createdBy: 'current-user@company.com',
      version: (template?.version || 0) + 1
    });
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="cortex-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cortex-text-primary">
          {isEditing ? '✏️ Edit Template' : '📋 Create Template'}
        </h2>
        <CortexButton onClick={onCancel} variant="outline" size="sm">
          Cancel
        </CortexButton>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
              placeholder="Enter template name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ContentTemplate['category'] })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            >
              <option value="pov">POV</option>
              <option value="scenario">Scenario</option>
              <option value="template">Template</option>
              <option value="report">Report</option>
              <option value="assessment">Assessment</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            placeholder="Describe the template's purpose and usage"
          />
        </div>

        {/* Template Type */}
        <div>
          <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
            Template Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="form-based"
                checked={formData.type === 'form-based'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ContentTemplate['type'] })}
                className="mr-2"
              />
              <span className="text-cortex-text-primary">Form-Based</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="block-based"
                checked={formData.type === 'block-based'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ContentTemplate['type'] })}
                className="mr-2"
              />
              <span className="text-cortex-text-primary">Block-Based</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="hybrid"
                checked={formData.type === 'hybrid'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ContentTemplate['type'] })}
                className="mr-2"
              />
              <span className="text-cortex-text-primary">Hybrid</span>
            </label>
          </div>
        </div>

        {/* Fields */}
        <div>
          <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
            Template Fields
          </label>
          
          {/* Existing Fields */}
          <div className="space-y-3 mb-4">
            {formData.fields.map((field, index) => (
              <div key={field.id} className="flex items-center justify-between p-3 bg-cortex-bg-tertiary rounded-lg border border-cortex-border-secondary">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-cortex-text-primary">{field.label}</span>
                    <span className="text-sm text-cortex-text-muted">({field.type})</span>
                    {field.required && <span className="text-cortex-error text-sm">*</span>}
                  </div>
                  <div className="text-sm text-cortex-text-secondary">{field.name}</div>
                </div>
                <CortexButton
                  onClick={() => removeField(index)}
                  variant="outline"
                  size="sm"
                  icon="🛠️"
                  ariaLabel={`Remove field ${field.label}`}
                >
                  Remove
                </CortexButton>
              </div>
            ))}
          </div>

          {/* Add New Field */}
          <div className="border border-cortex-border-secondary rounded-lg p-4">
            <h4 className="text-sm font-medium text-cortex-text-primary mb-3">Add New Field</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Field name (camelCase)"
                value={newField.name || ''}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                className="px-3 py-2 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
              />
              <input
                type="text"
                placeholder="Field label"
                value={newField.label || ''}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                className="px-3 py-2 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
              />
              <select
                value={newField.type || 'text'}
                onChange={(e) => setNewField({ ...newField, type: e.target.value as ContentField['type'] })}
                className="px-3 py-2 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
              >
                <option value="text">Text</option>
                <option value="textarea">Text Area</option>
                <option value="select">Select</option>
                <option value="multiselect">Multi-Select</option>
                <option value="date">Date</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="list">List</option>
                <option value="tags">Tags</option>
              </select>
              <div className="flex space-x-2">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={newField.required || false}
                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    className="mr-1"
                  />
                  <span className="text-cortex-text-primary">Required</span>
                </label>
                <CortexButton
                  onClick={addField}
                  variant="outline"
                  size="sm"
                  icon="+"
                  type="button"
                >
                  Add
                </CortexButton>
              </div>
            </div>
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
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cortex-bg-hover text-cortex-text-primary border border-cortex-border-secondary"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-2 text-cortex-text-muted hover:text-cortex-text-primary"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add tag and press Enter"
            className="w-full px-4 py-2 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
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

        {/* Visibility */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked as boolean })}
              className="mr-2"
            />
            <span className="text-cortex-text-primary">Make template public (visible to all users)</span>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-cortex-border-secondary">
          <CortexButton onClick={onCancel} variant="outline">
            Cancel
          </CortexButton>
          <CortexButton type="submit" variant="primary" icon={isEditing ? '✏️' : '📋'}>
            {isEditing ? 'Update Template' : 'Create Template'}
          </CortexButton>
        </div>
      </form>
    </div>
  );
};

// Content Creator using Template
const ContentCreator: React.FC<{
  template: ContentTemplate;
  instance?: ContentInstance;
  onSave: (data: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
}> = ({ template, instance, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState(instance?.data || {});
  const [metadata, setMetadata] = useState({
    name: instance?.name || '',
    description: instance?.description || '',
    assignedTo: instance?.assignedTo || '',
    dueDate: instance?.dueDate || '',
    tags: instance?.tags || []
  });

  const renderField = (field: ContentField) => {
    const value = formData[field.name];

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: parseInt(e.target.value) })}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            required={field.required}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
              className="mr-3 rounded focus:ring-cortex-green"
            />
            <span className="text-cortex-text-primary">{field.label}</span>
          </label>
        );

      case 'list':
        const listValue = Array.isArray(value) ? value : [''];
        return (
          <div className="space-y-2">
            {listValue.map((item: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-cortex-text-muted">•</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newList = [...listValue];
                    newList[index] = e.target.value;
                    setFormData({ ...formData, [field.name]: newList });
                  }}
                  className="flex-1 px-4 py-2 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
                  placeholder={`Item ${index + 1}`}
                />
                {listValue.length > 1 && (
                  <CortexButton
                    onClick={() => {
                      const newList = listValue.filter((_, i) => i !== index);
                      setFormData({ ...formData, [field.name]: newList });
                    }}
                    variant="outline"
                    size="sm"
                    type="button"
                  >
                    ✕
                  </CortexButton>
                )}
              </div>
            ))}
            <CortexButton
              onClick={() => {
                const newList = [...listValue, ''];
                setFormData({ ...formData, [field.name]: newList });
              }}
              variant="outline"
              size="sm"
              icon="+"
              type="button"
            >
              Add Item
            </CortexButton>
          </div>
        );

      case 'tags':
        const tagValue = Array.isArray(value) ? value : [];
        return (
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tagValue.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cortex-bg-hover text-cortex-text-primary border border-cortex-border-secondary"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = tagValue.filter((_: any, i: number) => i !== index);
                      setFormData({ ...formData, [field.name]: newTags });
                    }}
                    className="ml-2 text-cortex-text-muted hover:text-cortex-text-primary"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder={field.placeholder || 'Add tag and press Enter'}
              className="w-full px-4 py-2 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  const newTag = e.currentTarget.value.trim();
                  if (newTag && !tagValue.includes(newTag)) {
                    const newTags = [...tagValue, newTag];
                    setFormData({ ...formData, [field.name]: newTags });
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
          </div>
        );

      default:
        return (
          <div className="text-cortex-text-muted">
            Field type "{field.type}" not implemented yet
          </div>
        );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      metadata,
      data: formData
    });
  };

  return (
    <div className="cortex-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-cortex-text-primary">
            {isEditing ? '✏️ Edit Content' : '📝 Create Content'}
          </h2>
          <p className="text-cortex-text-secondary mt-1">
            Using template: <span className="font-medium">{template.name}</span>
          </p>
        </div>
        <CortexButton onClick={onCancel} variant="outline" size="sm">
          Cancel
        </CortexButton>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Metadata */}
        <div className="bg-cortex-bg-hover rounded-lg p-4 border border-cortex-border-secondary">
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Content Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                Content Name *
              </label>
              <input
                type="text"
                value={metadata.name}
                onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
                placeholder="Enter content name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                Assigned To
              </label>
              <input
                type="email"
                value={metadata.assignedTo}
                onChange={(e) => setMetadata({ ...metadata, assignedTo: e.target.value })}
                className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
                placeholder="user@company.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                Description
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
                placeholder="Brief description of this content"
              />
            </div>
          </div>
        </div>

        {/* Template Fields */}
        <div className="space-y-6">
          {template.fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                {field.label}
                {field.required && <span className="text-cortex-error ml-1">*</span>}
              </label>
              {field.helpText && (
                <p className="text-sm text-cortex-text-muted mb-2">{field.helpText}</p>
              )}
              {renderField(field)}
            </div>
          ))}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-cortex-border-secondary">
          <CortexButton onClick={onCancel} variant="outline">
            Cancel
          </CortexButton>
          <CortexButton type="submit" variant="primary" icon={isEditing ? '✏️' : '📝'}>
            {isEditing ? 'Update Content' : 'Create Content'}
          </CortexButton>
        </div>
      </form>
    </div>
  );
};

// Content List Component
const ContentList: React.FC<{
  instances: ContentInstance[];
  onEdit: (instance: ContentInstance) => void;
  onView: (instance: ContentInstance) => void;
  onDelete: (instanceId: string) => void;
}> = ({ instances, onEdit, onView, onDelete }) => {
  const getStatusColor = (status: ContentInstance['status']): string => {
    const colors = {
      'draft': 'text-cortex-text-muted bg-cortex-bg-hover',
      'in-progress': 'text-cortex-info bg-cortex-info/10',
      'review': 'text-cortex-warning bg-cortex-warning/10',
      'completed': 'text-cortex-green bg-cortex-green/10',
      'published': 'text-cortex-green bg-cortex-green/20',
      'archived': 'text-cortex-text-muted bg-cortex-bg-hover'
    };
    return colors[status] || 'text-cortex-text-muted bg-cortex-bg-hover';
  };

  return (
    <div className="cortex-card">
      <div className="p-6 border-b border-cortex-border-secondary">
        <h3 className="text-lg font-bold text-cortex-text-primary">
          Content Library ({instances.length})
        </h3>
      </div>

      <div className="divide-y divide-cortex-border-secondary">
        {instances.map((instance) => (
          <div key={instance.id} className="p-6 hover:bg-cortex-bg-hover/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-lg font-semibold text-cortex-text-primary cursor-pointer hover:text-cortex-green" onClick={() => onView(instance)}>
                  {instance.name}
                </h4>
                <p className="text-sm text-cortex-text-muted">{instance.templateName}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                  {instance.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-cortex-bg-tertiary text-cortex-text-muted">
                  {instance.category.toUpperCase()}
                </span>
              </div>
            </div>

            {instance.description && (
              <p className="text-cortex-text-secondary mb-3 line-clamp-2">
                {instance.description}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-cortex-text-muted mb-4">
              <div>
                <span className="font-medium">Created:</span> {new Date(instance.createdDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {new Date(instance.updatedDate).toLocaleDateString()}
              </div>
              {instance.assignedTo && (
                <div>
                  <span className="font-medium">Assigned:</span> {instance.assignedTo}
                </div>
              )}
              {instance.dueDate && (
                <div>
                  <span className="font-medium">Due:</span> {new Date(instance.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>

            {instance.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {instance.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-cortex-bg-tertiary text-cortex-text-muted rounded border border-cortex-border-secondary"
                  >
                    {tag}
                  </span>
                ))}
                {instance.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs text-cortex-text-muted">
                    +{instance.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CortexButton
                  onClick={() => onView(instance)}
                  variant="outline"
                  size="sm"
                  icon="👁️"
                >
                  View
                </CortexButton>
                <CortexButton
                  onClick={() => onEdit(instance)}
                  variant="outline"
                  size="sm"
                  icon="✏️"
                >
                  Edit
                </CortexButton>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-cortex-text-muted">v{instance.version}</span>
                <CortexButton
                  onClick={() => onDelete(instance.id)}
                  variant="outline"
                  size="sm"
                  icon="🛠️"
                  ariaLabel={`Delete ${instance.name}`}
                  className="text-cortex-error hover:text-cortex-error"
                >
                  Delete
                </CortexButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      {instances.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-2">No Content Found</h3>
          <p className="text-cortex-text-secondary">Create your first piece of content to get started.</p>
        </div>
      )}
    </div>
  );
};

// Main Enhanced Content Creator Component
export const EnhancedContentCreator: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'templates' | 'create-template' | 'edit-template' | 'create-content' | 'edit-content' | 'content-list'>('dashboard');
  const [templates, setTemplates] = useState<ContentTemplate[]>(contentTemplates);
  const [instances, setInstances] = useState<ContentInstance[]>(contentInstances);
  const [currentTemplate, setCurrentTemplate] = useState<ContentTemplate | null>(null);
  const [currentInstance, setCurrentInstance] = useState<ContentInstance | null>(null);

  const handleCreateTemplate = (templateData: Omit<ContentTemplate, 'id' | 'createdDate' | 'updatedDate' | 'usageCount'>) => {
    const newTemplate: ContentTemplate = {
      ...templateData,
      id: `tpl-${Date.now()}`,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      usageCount: 0
    };
    
    setTemplates([...templates, newTemplate]);
    contentTemplates.push(newTemplate);
    setView('templates');
  };

  const handleCreateContent = (data: { metadata: any; data: any }) => {
    if (!currentTemplate) return;

    const newInstance: ContentInstance = {
      id: `content-${Date.now()}`,
      templateId: currentTemplate.id,
      templateName: currentTemplate.name,
      name: data.metadata.name,
      description: data.metadata.description,
      category: currentTemplate.category,
      data: data.data,
      status: 'draft',
      createdBy: 'current-user@company.com',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      assignedTo: data.metadata.assignedTo,
      dueDate: data.metadata.dueDate,
      tags: data.metadata.tags || [],
      version: 1,
      comments: [],
      attachments: []
    };

    setInstances([...instances, newInstance]);
    contentInstances.push(newInstance);
    
    // Update template usage count
    const updatedTemplates = templates.map(t => 
      t.id === currentTemplate.id 
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    );
    setTemplates(updatedTemplates);
    
    setCurrentTemplate(null);
    setView('content-list');
  };

  const handleDeleteInstance = (instanceId: string) => {
    if (confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      setInstances(instances.filter(i => i.id !== instanceId));
    }
  };

  const renderDashboard = () => {
    const stats = {
      totalTemplates: templates.length,
      totalInstances: instances.length,
      drafts: instances.filter(i => i.status === 'draft').length,
      inProgress: instances.filter(i => i.status === 'in-progress').length,
      completed: instances.filter(i => i.status === 'completed').length
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-cortex-text-primary">Enhanced Content Creator</h1>
          <div className="flex items-center space-x-3">
            <CortexButton
              onClick={() => setView('create-template')}
              variant="outline"
              icon="📋"
            >
              Create Template
            </CortexButton>
            <CortexButton
              onClick={() => setView('templates')}
              variant="primary"
              icon="📝"
            >
              Create Content
            </CortexButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-text-primary">{stats.totalTemplates}</div>
            <div className="text-sm text-cortex-text-secondary">Templates</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-text-primary">{stats.totalInstances}</div>
            <div className="text-sm text-cortex-text-secondary">Content Items</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-text-muted">{stats.drafts}</div>
            <div className="text-sm text-cortex-text-secondary">Drafts</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-info">{stats.inProgress}</div>
            <div className="text-sm text-cortex-text-secondary">In Progress</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-green">{stats.completed}</div>
            <div className="text-sm text-cortex-text-secondary">Completed</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="cortex-card p-6">
            <h3 className="text-lg font-bold text-cortex-text-primary mb-4">Template Management</h3>
            <div className="space-y-3">
              <CortexButton
                onClick={() => setView('templates')}
                variant="outline"
                className="w-full justify-start"
                icon="📋"
              >
                Browse Templates ({templates.length})
              </CortexButton>
              <CortexButton
                onClick={() => setView('create-template')}
                variant="outline"
                className="w-full justify-start"
                icon="➕"
              >
                Create New Template
              </CortexButton>
              <CortexButton
                variant="outline"
                className="w-full justify-start"
                icon="📋"
                onClick={() => {
                  console.log("template clone --base enterprise");
                }}
              >
                Clone Template
              </CortexButton>
            </div>
          </div>

          <div className="cortex-card p-6">
            <h3 className="text-lg font-bold text-cortex-text-primary mb-4">Content Management</h3>
            <div className="space-y-3">
              <CortexButton
                onClick={() => setView('content-list')}
                variant="outline"
                className="w-full justify-start"
                icon="📝"
              >
                Content Library ({instances.length})
              </CortexButton>
              <CortexButton
                onClick={() => setView('templates')}
                variant="outline"
                className="w-full justify-start"
                icon="➕"
              >
                Create New Content
              </CortexButton>
              <CortexButton
                variant="outline"
                className="w-full justify-start"
                icon="📤"
                onClick={() => {
                  console.log("content import --source csv");
                }}
              >
                Import Content
              </CortexButton>
            </div>
          </div>
        </div>

        {/* Recent Content */}
        <div className="cortex-card p-6">
          <h3 className="text-lg font-bold text-cortex-text-primary mb-4">Recent Content</h3>
          <div className="space-y-3">
            {instances.slice(0, 3).map((instance) => (
              <div key={instance.id} className="flex items-center justify-between p-3 bg-cortex-bg-hover rounded-lg">
                <div>
                  <div className="font-medium text-cortex-text-primary">{instance.name}</div>
                  <div className="text-sm text-cortex-text-secondary">{instance.templateName} • {instance.status}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <CortexButton
                    onClick={() => {
                      setCurrentInstance(instance);
                      setView('edit-content');
                    }}
                    variant="outline"
                    size="sm"
                    icon="✏️"
                  >
                    Edit
                  </CortexButton>
                </div>
              </div>
            ))}
            {instances.length === 0 && (
              <p className="text-cortex-text-muted text-center py-4">No content created yet</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTemplateSelector = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-cortex-text-primary">Select Template</h1>
        <CortexButton onClick={() => setView('dashboard')} variant="outline">
          Back to Dashboard
        </CortexButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="cortex-card p-6 cursor-pointer hover:border-cortex-green transition-colors"
            onClick={() => {
              setCurrentTemplate(template);
              setView('create-content');
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-cortex-text-primary">{template.name}</h3>
              <span className="px-2 py-1 text-xs font-medium bg-cortex-bg-tertiary text-cortex-text-muted rounded">
                {template.category.toUpperCase()}
              </span>
            </div>
            
            <p className="text-cortex-text-secondary text-sm mb-4 line-clamp-3">
              {template.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-cortex-text-muted">
              <span>{template.fields.length} fields</span>
              <span>Used {template.usageCount} times</span>
            </div>

            {template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4">
                {template.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-cortex-bg-tertiary text-cortex-text-muted rounded border border-cortex-border-secondary"
                  >
                    {tag}
                  </span>
                ))}
                {template.tags.length > 2 && (
                  <span className="px-2 py-1 text-xs text-cortex-text-muted">
                    +{template.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-2">No Templates Found</h3>
          <p className="text-cortex-text-secondary mb-4">Create your first template to get started.</p>
          <CortexButton
            onClick={() => setView('create-template')}
            variant="primary"
            icon="📋"
          >
            Create Template
          </CortexButton>
        </div>
      )}
    </div>
  );

  // Render based on current view
  switch (view) {
    case 'templates':
      return renderTemplateSelector();

    case 'create-template':
      return (
        <TemplateBuilder
          onSave={handleCreateTemplate}
          onCancel={() => setView('dashboard')}
        />
      );

    case 'edit-template':
      return currentTemplate ? (
        <TemplateBuilder
          template={currentTemplate}
          onSave={(templateData) => {
            const updatedTemplate = {
              ...currentTemplate,
              ...templateData,
              updatedDate: new Date().toISOString(),
              version: currentTemplate.version + 1
            };
            setTemplates(templates.map(t => t.id === currentTemplate.id ? updatedTemplate : t));
            setCurrentTemplate(null);
            setView('dashboard');
          }}
          onCancel={() => {
            setCurrentTemplate(null);
            setView('dashboard');
          }}
          isEditing
        />
      ) : null;

    case 'create-content':
      return currentTemplate ? (
        <ContentCreator
          template={currentTemplate}
          onSave={handleCreateContent}
          onCancel={() => {
            setCurrentTemplate(null);
            setView('templates');
          }}
        />
      ) : null;

    case 'edit-content':
      return (currentInstance && currentTemplate) ? (
        <ContentCreator
          template={currentTemplate}
          instance={currentInstance}
          onSave={(data) => {
            const updatedInstance = {
              ...currentInstance,
              ...data.metadata,
              data: data.data,
              updatedDate: new Date().toISOString(),
              version: currentInstance.version + 1
            };
            setInstances(instances.map(i => i.id === currentInstance.id ? updatedInstance : i));
            setCurrentInstance(null);
            setCurrentTemplate(null);
            setView('content-list');
          }}
          onCancel={() => {
            setCurrentInstance(null);
            setCurrentTemplate(null);
            setView('content-list');
          }}
          isEditing
        />
      ) : null;

    case 'content-list':
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-cortex-text-primary">Content Library</h1>
            <div className="flex items-center space-x-3">
              <CortexButton onClick={() => setView('dashboard')} variant="outline">
                Back to Dashboard
              </CortexButton>
              <CortexButton
                onClick={() => setView('templates')}
                variant="primary"
                icon="📝"
              >
                Create Content
              </CortexButton>
            </div>
          </div>

          <ContentList
            instances={instances}
            onEdit={(instance) => {
              const template = templates.find(t => t.id === instance.templateId);
              if (template) {
                setCurrentInstance(instance);
                setCurrentTemplate(template);
                setView('edit-content');
              }
            }}
            onView={(instance) => {
              // TODO: Implement content detail view
              alert('Content detail view not implemented yet');
            }}
            onDelete={handleDeleteInstance}
          />
        </div>
      );

    default:
      return renderDashboard();
  }
};