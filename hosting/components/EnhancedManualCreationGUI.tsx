'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CortexCloudFrame } from './CortexCloudFrame';

type CreationMode = 'pov' | 'template' | 'scenario' | 'none';
type BlockType = 'text' | 'heading' | 'list' | 'checkbox' | 'date' | 'select' | 'number' | 'multiline' | 'tags';

interface Block {
  id: string;
  type: BlockType;
  content: any;
  placeholder?: string;
  label?: string;
  required?: boolean;
  options?: string[];
}

interface FormSchema {
  title: string;
  description: string;
  icon: string;
  color: string;
  blocks: Block[];
}

// Notion-inspired block-based schemas
const POV_SCHEMA: FormSchema = {
  title: 'Create New POV',
  description: 'Proof of Value Project Setup',
  icon: '🎯',
  color: 'blue',
  blocks: [
    {
      id: 'name',
      type: 'heading',
      content: '',
      placeholder: 'POV Project Name',
      label: 'Project Name',
      required: true
    },
    {
      id: 'customer',
      type: 'text',
      content: '',
      placeholder: 'Customer organization name',
      label: '🏢 Customer',
      required: true
    },
    {
      id: 'description',
      type: 'multiline',
      content: '',
      placeholder: 'Describe the POV objectives, scope, and expected outcomes...',
      label: '📝 Description'
    },
    {
      id: 'priority',
      type: 'select',
      content: 'medium',
      label: '⚡ Priority',
      options: ['low', 'medium', 'high', 'critical']
    },
    {
      id: 'startDate',
      type: 'date',
      content: '',
      label: '📅 Start Date'
    },
    {
      id: 'endDate',
      type: 'date',
      content: '',
      label: '🏁 End Date'
    },
    {
      id: 'budget',
      type: 'number',
      content: 0,
      label: '💰 Budget ($)',
      placeholder: '150000'
    },
    {
      id: 'teamLead',
      type: 'text',
      content: '',
      placeholder: 'john.doe@company.com',
      label: '👤 Team Lead'
    },
    {
      id: 'objectives',
      type: 'list',
      content: [''],
      label: '🎯 Project Objectives'
    },
    {
      id: 'successCriteria',
      type: 'list',
      content: [''],
      label: '✅ Success Criteria'
    },
    {
      id: 'scenarios',
      type: 'tags',
      content: [],
      label: '🔬 Related Scenarios',
      placeholder: 'Add scenario tags'
    }
  ]
};

const TEMPLATE_SCHEMA: FormSchema = {
  title: 'Create New Template',
  description: 'Reusable Scenario Template',
  icon: '📋',
  color: 'green',
  blocks: [
    {
      id: 'name',
      type: 'heading',
      content: '',
      placeholder: 'Template Name',
      label: 'Template Name',
      required: true
    },
    {
      id: 'category',
      type: 'select',
      content: 'security',
      label: '📂 Category',
      options: ['security', 'compliance', 'performance', 'integration', 'usability']
    },
    {
      id: 'description',
      type: 'multiline',
      content: '',
      placeholder: 'Describe the template purpose, use cases, and scope...',
      label: '📝 Description'
    },
    {
      id: 'riskLevel',
      type: 'select',
      content: 'medium',
      label: '⚠️ Risk Level',
      options: ['low', 'medium', 'high', 'critical']
    },
    {
      id: 'estimatedHours',
      type: 'number',
      content: 0,
      label: '⏱️ Estimated Hours',
      placeholder: '16'
    },
    {
      id: 'requirements',
      type: 'list',
      content: [''],
      label: '📋 Requirements'
    },
    {
      id: 'validationSteps',
      type: 'list',
      content: [''],
      label: '✔️ Validation Steps'
    },
    {
      id: 'expectedOutcomes',
      type: 'list',
      content: [''],
      label: '🎯 Expected Outcomes'
    },
    {
      id: 'tags',
      type: 'tags',
      content: [],
      label: '🏷️ Tags',
      placeholder: 'Add relevant tags'
    }
  ]
};

const SCENARIO_SCHEMA: FormSchema = {
  title: 'Create Detection Scenario',
  description: 'Cloud Detection and Response Scenario',
  icon: '🔬',
  color: 'purple',
  blocks: [
    {
      id: 'name',
      type: 'heading',
      content: '',
      placeholder: 'Detection Scenario Name',
      label: 'Scenario Name',
      required: true
    },
    {
      id: 'type',
      type: 'select',
      content: 'ransomware',
      label: '🎭 Scenario Type',
      options: ['ransomware', 'insider-threat', 'advanced-persistent-threat', 'data-exfiltration', 'cloud-attack', 'supply-chain']
    },
    {
      id: 'description',
      type: 'multiline',
      content: '',
      placeholder: 'Describe the attack scenario, objectives, and expected detection outcomes...',
      label: '📝 Description'
    },
    {
      id: 'severity',
      type: 'select',
      content: 'medium',
      label: '🚨 Severity',
      options: ['low', 'medium', 'high', 'critical']
    },
    {
      id: 'duration',
      type: 'number',
      content: 2,
      label: '⏱️ Duration (hours)',
      placeholder: '2'
    },
    {
      id: 'attackVectors',
      type: 'list',
      content: [''],
      label: '⚔️ Attack Vectors'
    },
    {
      id: 'mitreMapping',
      type: 'list',
      content: [''],
      label: '🗺️ MITRE ATT&CK Mapping',
      placeholder: 'e.g., T1566 - Phishing'
    },
    {
      id: 'detectionRules',
      type: 'list',
      content: [''],
      label: '🔍 Detection Rules'
    },
    {
      id: 'responseActions',
      type: 'list',
      content: [''],
      label: '🚨 Response Actions'
    },
    {
      id: 'prerequisites',
      type: 'list',
      content: [''],
      label: '📋 Prerequisites'
    },
    {
      id: 'tags',
      type: 'tags',
      content: [],
      label: '🏷️ Tags',
      placeholder: 'Add scenario tags'
    }
  ]
};

// Notion-inspired Block Components
const BlockRenderer: React.FC<{
  block: Block;
  value: any;
  onChange: (value: any) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}> = ({ block, value, onChange, onKeyDown }) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const getBlockIcon = (type: BlockType) => {
    switch (type) {
      case 'heading': return '📝';
      case 'text': return '✏️';
      case 'multiline': return '📄';
      case 'list': return '📝';
      case 'checkbox': return '☐';
      case 'date': return '📅';
      case 'select': return '📋';
      case 'number': return '🔢';
      case 'tags': return '🏷️';
      default: return '💭';
    }
  };

  const renderContent = () => {
    switch (block.type) {
      case 'heading':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={block.placeholder}
            className={`w-full bg-transparent border-none outline-none text-2xl font-bold text-white placeholder-gray-500 ${
              focused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
          />
        );

      case 'text':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={block.placeholder}
            className={`w-full bg-transparent border-none outline-none text-white placeholder-gray-500 py-2 ${
              focused ? 'ring-2 ring-blue-500 ring-opacity-50 rounded' : ''
            }`}
          />
        );

      case 'multiline':
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={block.placeholder}
            rows={4}
            className={`w-full bg-transparent border-none outline-none text-white placeholder-gray-500 py-2 resize-none ${
              focused ? 'ring-2 ring-blue-500 ring-opacity-50 rounded' : ''
            }`}
          />
        );

      case 'select':
        return (
          <select
            value={value || block.options?.[0] || ''}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white ${
              focused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
          >
            {block.options?.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white ${
              focused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || 0}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={block.placeholder}
            className={`w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white ${
              focused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
          />
        );

      case 'list':
        return (
          <div className="space-y-2">
            {(value || ['']).map((item: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-400">•</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newList = [...(value || [''])];
                    newList[index] = e.target.value;
                    onChange(newList);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const newList = [...(value || [''])];
                      newList.splice(index + 1, 0, '');
                      onChange(newList);
                    } else if (e.key === 'Backspace' && !item && (value || ['']).length > 1) {
                      e.preventDefault();
                      const newList = [...(value || [''])];
                      newList.splice(index, 1);
                      onChange(newList);
                    }
                  }}
                  placeholder={`Item ${index + 1}`}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 py-1 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:rounded"
                />
                {(value || ['']).length > 1 && (
                  <button
                    onClick={() => {
                      const newList = [...(value || [''])];
                      newList.splice(index, 1);
                      onChange(newList);
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => onChange([...(value || ['']), ''])}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
            >
              <span>+</span>
              <span>Add item</span>
            </button>
          </div>
        );

      case 'tags':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {(value || []).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => {
                      const newTags = [...(value || [])];
                      newTags.splice(index, 1);
                      onChange(newTags);
                    }}
                    className="text-blue-200 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder={block.placeholder || 'Add tag...'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  const newTag = (e.target as HTMLInputElement).value.trim();
                  if (newTag && !(value || []).includes(newTag)) {
                    onChange([...(value || []), newTag]);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`cortex-card p-4 cortex-interactive ${focused ? 'bg-cortex-bg-hover' : 'hover:bg-cortex-bg-secondary'}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">
            {getBlockIcon(block.type)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          {block.label && (
            <div className="text-sm font-medium text-cortex-text-secondary mb-1 flex items-center space-x-1">
              <span>{block.label}</span>
              {block.required && <span className="text-cortex-error">*</span>}
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Main Enhanced GUI Component
export const EnhancedManualCreationGUI: React.FC = () => {
  const [activeMode, setActiveMode] = useState<CreationMode>('none');
  const [showDocs, setShowDocs] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getSchema = (mode: CreationMode): FormSchema | null => {
    switch (mode) {
      case 'pov': return POV_SCHEMA;
      case 'template': return TEMPLATE_SCHEMA;
      case 'scenario': return SCENARIO_SCHEMA;
      default: return null;
    }
  };

  const initializeFormData = (schema: FormSchema) => {
    const initialData: Record<string, any> = {};
    schema.blocks.forEach(block => {
      initialData[block.id] = block.content;
    });
    setFormData(initialData);
  };

  const handleModeChange = (mode: CreationMode) => {
    setActiveMode(mode);
    const schema = getSchema(mode);
    if (schema) {
      initializeFormData(schema);
    }
  };

  const handleBlockChange = (blockId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [blockId]: value
    }));
  };

  const handleSubmit = async () => {
    const schema = getSchema(activeMode);
    if (!schema) return;

    // Validate required fields
    const requiredBlocks = schema.blocks.filter(block => block.required);
    const missingFields = requiredBlocks.filter(block => !formData[block.id] || formData[block.id] === '');
    
    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`Creating ${activeMode}:`, formData);
      alert(`${schema.title} created successfully!`);
      setActiveMode('none');
      setFormData({});
    } catch (error) {
      alert('Failed to create. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const schema = getSchema(activeMode);

  if (activeMode !== 'none' && schema) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className={`glass-card p-6 border-t-4 border-${schema.color}-500`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{schema.icon}</div>
              <div>
                <h1 className={`text-3xl font-bold text-${schema.color}-400`}>{schema.title}</h1>
                <p className="text-gray-300 mt-1">{schema.description}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveMode('none')}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Blocks */}
        <div className="cortex-card p-6 space-y-4">
          <div className="p-6 space-y-1">
            {schema.blocks.map(block => (
              <BlockRenderer
                key={block.id}
                block={block}
                value={formData[block.id]}
                onChange={(value) => handleBlockChange(block.id, value)}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="border-t border-cortex-border-secondary p-6 flex justify-between items-center">
            <div className="text-sm text-cortex-text-muted">
              {schema.blocks.filter(b => b.required).length} required fields
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveMode('none')}
                disabled={isSubmitting}
                className="btn-modern button-hover-lift cortex-interactive px-6 py-2 bg-cortex-bg-secondary hover:bg-cortex-bg-hover rounded text-cortex-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`btn-modern button-hover-lift cortex-interactive px-6 py-2 bg-${schema.color}-600 hover:bg-${schema.color}-700 rounded text-white transition-colors flex items-center space-x-2`}
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{isSubmitting ? 'Creating...' : `Create ${schema.title.split(' ')[2] || 'Item'}`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🛠️</div>
            <div>
              <h1 className="text-3xl font-bold text-cortex-text-primary">Enhanced Creation Studio</h1>
              <p className="text-cortex-text-muted mt-2">Notion-inspired interface for creating POVs, templates, and scenarios</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowDocs(!showDocs)}
            className="btn-modern button-hover-lift cortex-interactive px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors flex items-center space-x-2"
          >
            <span>📚</span>
            <span>{showDocs ? 'Hide' : 'Show'} Documentation</span>
          </button>
        </div>

        {/* Creation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => handleModeChange('pov')}
            className="cortex-card-elevated p-8 cortex-interactive button-hover-lift"
          >
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-blue-400 mb-3">Proof of Value</h3>
            <p className="text-cortex-text-muted text-sm leading-relaxed">
              Create comprehensive POV projects with advanced planning, team management, and success tracking capabilities.
            </p>
            <div className="mt-4 flex items-center text-blue-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Click to start</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div
            onClick={() => handleModeChange('template')}
            className="cortex-card-elevated p-8 cortex-interactive button-hover-lift"
          >
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-green-400 mb-3">Scenario Template</h3>
            <p className="text-cortex-text-muted text-sm leading-relaxed">
              Design reusable templates for validation scenarios with structured requirements and testing protocols.
            </p>
            <div className="mt-4 flex items-center text-green-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Click to start</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div
            onClick={() => handleModeChange('scenario')}
            className="cortex-card-elevated p-8 cortex-interactive button-hover-lift"
          >
            <div className="text-5xl mb-4">🔬</div>
            <h3 className="text-xl font-bold text-purple-400 mb-3">Detection Scenario</h3>
            <p className="text-cortex-text-muted text-sm leading-relaxed">
              Build Cloud Detection and Response scenarios with MITRE mapping, attack vectors, and detection rules.
            </p>
            <div className="mt-4 flex items-center text-purple-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Click to start</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 pt-8 border-t border-cortex-border-muted/20">
          <div className="grid grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400">24</div>
              <div className="text-sm text-cortex-text-muted">Active POVs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">12</div>
              <div className="text-sm text-cortex-text-muted">Templates</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">48</div>
              <div className="text-sm text-cortex-text-muted">Scenarios</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">96%</div>
              <div className="text-sm text-cortex-text-muted">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Frame */}
      {showDocs && (
        <CortexCloudFrame
          title="Cortex Cloud Detection and Response Documentation"
          height="600px"
          className="border-2 border-blue-500 shadow-2xl glass-card"
        />
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-cortex-text-primary mb-4 flex items-center space-x-2">
            <span>🎨</span>
            <span>Notion-Inspired Features</span>
          </h3>
          <ul className="space-y-2 text-sm text-cortex-text-muted">
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Block-based editing with intuitive interactions</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Dynamic list management with keyboard shortcuts</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Tag system with smart suggestions</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-yellow-400 mt-0.5">•</span>
              <span>Real-time validation and form state management</span>
            </li>
          </ul>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-cortex-text-primary mb-4 flex items-center space-x-2">
            <span>⚡</span>
            <span>Enhanced UX</span>
          </h3>
          <ul className="space-y-2 text-sm text-cortex-text-muted">
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Hover effects and smooth animations</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Focus indicators and accessibility features</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Progressive disclosure of form complexity</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-yellow-400 mt-0.5">•</span>
              <span>Context-aware placeholders and hints</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnhancedManualCreationGUI;
