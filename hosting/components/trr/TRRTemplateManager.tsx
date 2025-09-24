'use client';

import React, { useState, useMemo } from 'react';
import { TRR, TestCase, DORCriteria, SDWStep } from '../../types/trr';
import { CortexButton } from '../CortexButton';

interface TRRTemplate {
  id: string;
  name: string;
  description: string;
  category: 'requirement' | 'test-case' | 'dor-checklist' | 'sdw-workflow' | 'full-trr';
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  isPublic: boolean;
  template: {
    // For requirement templates
    requirements?: Array<{
      title: string;
      description: string;
      acceptanceCriteria: string[];
      priority: 'low' | 'medium' | 'high' | 'critical';
      tags?: string[];
    }>;
    
    // For test case templates
    testCases?: TestCase[];
    
    // For DOR checklist templates
    dorCriteria?: DORCriteria[];
    
    // For SDW workflow templates
    sdwSteps?: SDWStep[];
    
    // For full TRR templates
    trrStructure?: {
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      estimatedHours?: number;
      tags?: string[];
      requirements?: any[];
      testCases?: TestCase[];
      dorCriteria?: DORCriteria[];
      sdwSteps?: SDWStep[];
    };
  };
}

interface TRRTemplateManagerProps {
  templates?: TRRTemplate[];
  onTemplateCreate?: (template: Omit<TRRTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => Promise<TRRTemplate>;
  onTemplateUpdate?: (template: TRRTemplate) => Promise<void>;
  onTemplateDelete?: (templateId: string) => Promise<void>;
  onTemplateApply?: (template: TRRTemplate, targetId: string) => Promise<void>;
  currentUser?: string;
}

export const TRRTemplateManager: React.FC<TRRTemplateManagerProps> = ({
  templates = [],
  onTemplateCreate,
  onTemplateUpdate,
  onTemplateDelete,
  onTemplateApply,
  currentUser = 'Anonymous',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TRRTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');

  // Create template state
  const [newTemplate, setNewTemplate] = useState<Partial<TRRTemplate>>({
    name: '',
    description: '',
    category: 'requirement',
    tags: [],
    isPublic: false,
    template: {},
  });

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query)) ||
        t.createdBy.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => b.usageCount - a.usageCount);
  }, [templates, selectedCategory, searchQuery]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts = templates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      all: templates.length,
      ...counts,
    };
  }, [templates]);

  const handleCreateTemplate = async () => {
    if (!onTemplateCreate || !newTemplate.name || !newTemplate.category) return;

    try {
      const templateToCreate = {
        ...newTemplate as Omit<TRRTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>,
        createdBy: currentUser,
        usageCount: 0,
      };

      await onTemplateCreate(templateToCreate);
      setNewTemplate({
        name: '',
        description: '',
        category: 'requirement',
        tags: [],
        isPublic: false,
        template: {},
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleDeleteTemplate = async (template: TRRTemplate) => {
    if (!onTemplateDelete) return;
    
    if (window.confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      try {
        await onTemplateDelete(template.id);
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'requirement': return '📋';
      case 'test-case': return '🧪';
      case 'dor-checklist': return '✅';
      case 'sdw-workflow': return '🔄';
      case 'full-trr': return '📄';
      default: return '📁';
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'requirement': return 'bg-cortex-info/20 text-cortex-info';
      case 'test-case': return 'bg-cortex-warning/20 text-cortex-warning';
      case 'dor-checklist': return 'bg-cortex-success/20 text-cortex-success';
      case 'sdw-workflow': return 'bg-cortex-purple/20 text-cortex-purple';
      case 'full-trr': return 'bg-cortex-error/20 text-cortex-error';
      default: return 'bg-cortex-text-muted/20 text-cortex-text-muted';
    }
  };

  const renderTemplatePreview = (template: TRRTemplate) => {
    const { category, template: tmpl } = template;
    
    switch (category) {
      case 'requirement':
        return (
          <div className="space-y-2">
            <p className="text-sm text-cortex-text-muted">
              {tmpl.requirements?.length || 0} requirements
            </p>
            {tmpl.requirements?.slice(0, 3).map((req, index) => (
              <div key={index} className="text-sm p-2 bg-cortex-bg-secondary rounded">
                {req.title}
              </div>
            ))}
          </div>
        );
      
      case 'test-case':
        return (
          <div className="space-y-2">
            <p className="text-sm text-cortex-text-muted">
              {tmpl.testCases?.length || 0} test cases
            </p>
            {tmpl.testCases?.slice(0, 3).map((test, index) => (
              <div key={index} className="text-sm p-2 bg-cortex-bg-secondary rounded">
                {test.name}
              </div>
            ))}
          </div>
        );
      
      case 'dor-checklist':
        return (
          <div className="space-y-2">
            <p className="text-sm text-cortex-text-muted">
              {tmpl.dorCriteria?.length || 0} criteria
            </p>
            {tmpl.dorCriteria?.slice(0, 3).map((criteria, index) => (
              <div key={index} className="text-sm p-2 bg-cortex-bg-secondary rounded">
                {criteria.criterion}
              </div>
            ))}
          </div>
        );
      
      case 'sdw-workflow':
        return (
          <div className="space-y-2">
            <p className="text-sm text-cortex-text-muted">
              {tmpl.sdwSteps?.length || 0} workflow steps
            </p>
            {tmpl.sdwSteps?.slice(0, 3).map((step, index) => (
              <div key={index} className="text-sm p-2 bg-cortex-bg-secondary rounded">
                {step.name}
              </div>
            ))}
          </div>
        );
      
      case 'full-trr':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-cortex-text-muted">Requirements:</span>
                <span className="ml-2 font-medium">{tmpl.trrStructure?.requirements?.length || 0}</span>
              </div>
              <div>
                <span className="text-cortex-text-muted">Test Cases:</span>
                <span className="ml-2 font-medium">{tmpl.trrStructure?.testCases?.length || 0}</span>
              </div>
              <div>
                <span className="text-cortex-text-muted">DOR Items:</span>
                <span className="ml-2 font-medium">{tmpl.trrStructure?.dorCriteria?.length || 0}</span>
              </div>
              <div>
                <span className="text-cortex-text-muted">SDW Steps:</span>
                <span className="ml-2 font-medium">{tmpl.trrStructure?.sdwSteps?.length || 0}</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return <p className="text-sm text-cortex-text-muted">No preview available</p>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cortex-text-primary">TRR Templates</h2>
          <p className="text-cortex-text-secondary">
            Manage reusable templates for requirements, test cases, and workflows
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-cortex-bg-secondary rounded p-1">
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'gallery' 
                  ? 'bg-cortex-green text-white' 
                  : 'text-cortex-text-muted hover:text-cortex-text-primary'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'list' 
                  ? 'bg-cortex-green text-white' 
                  : 'text-cortex-text-muted hover:text-cortex-text-primary'
              }`}
            >
              List
            </button>
          </div>

          <CortexButton
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            icon="+"
          >
            Create Template
          </CortexButton>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by name, description, or tags..."
            className="w-full pl-10 pr-4 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
          />
          <div className="absolute left-3 top-2.5 text-cortex-text-muted">🔍</div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          {[
            { key: 'all', label: 'All', icon: '📁' },
            { key: 'requirement', label: 'Requirements', icon: '📋' },
            { key: 'test-case', label: 'Test Cases', icon: '🧪' },
            { key: 'dor-checklist', label: 'DOR', icon: '✅' },
            { key: 'sdw-workflow', label: 'SDW', icon: '🔄' },
            { key: 'full-trr', label: 'Full TRR', icon: '📄' },
          ].map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === category.key
                  ? 'bg-cortex-green text-white'
                  : 'bg-cortex-bg-secondary text-cortex-text-muted hover:bg-cortex-bg-hover hover:text-cortex-text-primary'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
              <span className="ml-1 px-2 py-0.5 bg-black/20 rounded-full text-xs">
                {categoryCounts[category.key] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid/List */}
      {viewMode === 'gallery' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="cortex-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getCategoryIcon(template.category)}</div>
                  <div>
                    <h3 className="font-semibold text-cortex-text-primary">{template.name}</h3>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {template.isPublic && (
                    <span className="text-cortex-success text-sm" title="Public template">🌐</span>
                  )}
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="text-cortex-text-muted hover:text-cortex-text-primary"
                  >
                    ⚙️
                  </button>
                </div>
              </div>

              <p className="text-cortex-text-secondary text-sm mb-4 line-clamp-3">
                {template.description}
              </p>

              {/* Template Preview */}
              <div className="mb-4">
                {renderTemplatePreview(template)}
              </div>

              {/* Tags */}
              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-cortex-info/20 text-cortex-info rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="text-xs text-cortex-text-muted">
                      +{template.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-cortex-border-secondary">
                <div className="text-sm text-cortex-text-muted">
                  <div>By {template.createdBy}</div>
                  <div>Used {template.usageCount} times</div>
                </div>

                <div className="flex items-center space-x-2">
                  {onTemplateApply && (
                    <CortexButton
                      onClick={() => onTemplateApply(template, 'current')}
                      variant="outline"
                      size="sm"
                    >
                      Apply
                    </CortexButton>
                  )}
                  
                  {template.createdBy === currentUser && (
                    <button
                      onClick={() => handleDeleteTemplate(template)}
                      className="text-cortex-error hover:text-cortex-error-dark text-sm"
                      title="Delete template"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="cortex-card">
          <div className="divide-y divide-cortex-border-secondary">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="p-6 hover:bg-cortex-bg-hover">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-xl">{getCategoryIcon(template.category)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-cortex-text-primary truncate">
                          {template.name}
                        </h3>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(template.category)}`}>
                          {template.category}
                        </div>
                        {template.isPublic && (
                          <span className="text-cortex-success text-sm" title="Public template">🌐</span>
                        )}
                      </div>
                      <p className="text-cortex-text-secondary text-sm mt-1 truncate">
                        {template.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-cortex-text-muted mt-2">
                        <span>By {template.createdBy}</span>
                        <span>Used {template.usageCount} times</span>
                        <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {onTemplateApply && (
                      <CortexButton
                        onClick={() => onTemplateApply(template, 'current')}
                        variant="outline"
                        size="sm"
                      >
                        Apply
                      </CortexButton>
                    )}
                    
                    <button
                      onClick={() => setSelectedTemplate(template)}
                      className="text-cortex-text-muted hover:text-cortex-text-primary"
                      title="Template details"
                    >
                      ⚙️
                    </button>
                    
                    {template.createdBy === currentUser && (
                      <button
                        onClick={() => handleDeleteTemplate(template)}
                        className="text-cortex-error hover:text-cortex-error-dark"
                        title="Delete template"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-2">No templates found</h3>
          <p className="text-cortex-text-secondary mb-6">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your filters or search query'
              : 'Create your first template to get started'
            }
          </p>
          {(!searchQuery && selectedCategory === 'all') && (
            <CortexButton
              onClick={() => setShowCreateModal(true)}
              variant="primary"
            >
              Create Your First Template
            </CortexButton>
          )}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-cortex-bg-primary rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-cortex-border-secondary">
              <h3 className="text-lg font-semibold text-cortex-text-primary">Create New Template</h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cortex-text-primary mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name || ''}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
                    placeholder="Enter template name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cortex-text-primary mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTemplate.description || ''}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50 resize-none"
                    placeholder="Describe what this template is for..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cortex-text-primary mb-2">
                    Category
                  </label>
                  <select
                    value={newTemplate.category || 'requirement'}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
                  >
                    <option value="requirement">Requirements Template</option>
                    <option value="test-case">Test Cases Template</option>
                    <option value="dor-checklist">DOR Checklist Template</option>
                    <option value="sdw-workflow">SDW Workflow Template</option>
                    <option value="full-trr">Full TRR Template</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cortex-text-primary mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newTemplate.tags?.join(', ') || ''}
                    onChange={(e) => setNewTemplate({ 
                      ...newTemplate, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
                    placeholder="api, integration, security..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newTemplate.isPublic || false}
                    onChange={(e) => setNewTemplate({ ...newTemplate, isPublic: e.target.checked })}
                    className="rounded border-cortex-border-secondary"
                  />
                  <label htmlFor="isPublic" className="text-sm text-cortex-text-primary">
                    Make this template public (visible to all team members)
                  </label>
                </div>
              </div>

              {/* Template Content Placeholder */}
              <div className="p-4 bg-cortex-info/10 border border-cortex-info/20 rounded">
                <p className="text-sm text-cortex-info">
                  📝 <strong>Template Content:</strong> After creating the template, you'll be able to add the specific content 
                  (requirements, test cases, checklists, etc.) based on the category you selected.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-cortex-border-secondary flex justify-end space-x-3">
              <CortexButton
                onClick={() => setShowCreateModal(false)}
                variant="outline"
              >
                Cancel
              </CortexButton>
              <CortexButton
                onClick={handleCreateTemplate}
                variant="primary"
                disabled={!newTemplate.name || !newTemplate.category}
              >
                Create Template
              </CortexButton>
            </div>
          </div>
        </div>
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-cortex-bg-primary rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-cortex-border-secondary">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getCategoryIcon(selectedTemplate.category)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-cortex-text-primary">
                      {selectedTemplate.name}
                    </h3>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(selectedTemplate.category)}`}>
                      {selectedTemplate.category}
                    </div>
                  </div>
                </div>
                
                <CortexButton
                  onClick={() => setSelectedTemplate(null)}
                  variant="outline"
                  size="sm"
                  icon="✕"
                />
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Template Info */}
                <div className="lg:col-span-1 space-y-4">
                  <div>
                    <h4 className="font-medium text-cortex-text-primary mb-2">Description</h4>
                    <p className="text-cortex-text-secondary text-sm">{selectedTemplate.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-cortex-text-primary mb-2">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-cortex-text-muted">Created by:</span>
                        <span className="text-cortex-text-primary">{selectedTemplate.createdBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cortex-text-muted">Usage count:</span>
                        <span className="text-cortex-text-primary">{selectedTemplate.usageCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cortex-text-muted">Visibility:</span>
                        <span className="text-cortex-text-primary">
                          {selectedTemplate.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cortex-text-muted">Updated:</span>
                        <span className="text-cortex-text-primary">
                          {new Date(selectedTemplate.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedTemplate.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-cortex-text-primary mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-cortex-info/20 text-cortex-info rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Template Content */}
                <div className="lg:col-span-2">
                  <h4 className="font-medium text-cortex-text-primary mb-4">Template Content</h4>
                  <div className="bg-cortex-bg-secondary rounded-lg p-4">
                    {renderTemplatePreview(selectedTemplate)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-cortex-border-secondary flex justify-between">
              <div>
                {selectedTemplate.createdBy === currentUser && (
                  <div className="flex items-center space-x-2">
                    <CortexButton
                      onClick={() => {/* TODO: Edit template */}}
                      variant="outline"
                      size="sm"
                    >
                      Edit Template
                    </CortexButton>
                    <button
                      onClick={() => {
                        setSelectedTemplate(null);
                        handleDeleteTemplate(selectedTemplate);
                      }}
                      className="text-cortex-error hover:text-cortex-error-dark text-sm"
                    >
                      Delete Template
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {onTemplateApply && (
                  <CortexButton
                    onClick={() => {
                      onTemplateApply(selectedTemplate, 'current');
                      setSelectedTemplate(null);
                    }}
                    variant="primary"
                  >
                    Apply Template
                  </CortexButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TRRTemplateManager;