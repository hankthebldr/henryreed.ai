'use client';

import React, { useState, useEffect, useMemo } from 'react';
import CortexButton from './CortexButton';
import userActivityService from '../lib/user-activity-service';

// Unified content item interface that consolidates all form types
export interface ContentItem {
  id: string;
  type: 'pov' | 'scenario' | 'template' | 'meeting' | 'note' | 'action-item' | 'customer-profile' | 'assessment';
  title: string;
  description: string;
  content: Record<string, any>;
  metadata: {
    tags: string[];
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'draft' | 'active' | 'completed' | 'archived';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    version: number;
    usageCount: number;
    favorited: boolean;
    shared: boolean;
  };
  relationships: {
    relatedItems: string[];
    dependencies: string[];
    parent?: string;
    children: string[];
  };
  template?: {
    isTemplate: boolean;
    templateId?: string;
    customFields: ContentField[];
  };
}

export interface ContentField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'number' | 'boolean' | 'file' | 'list' | 'tags' | 'rich-text' | 'json';
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
    custom?: (value: any) => string | null;
  };
  defaultValue?: any;
  order: number;
  visible: boolean;
  editable: boolean;
}

interface ConsolidatedContentLibraryProps {
  className?: string;
  initialView?: 'grid' | 'list' | 'kanban';
  showCreateButton?: boolean;
  allowedTypes?: ContentItem['type'][];
  enableTemplates?: boolean;
}

// Sample content templates
const CONTENT_TEMPLATES: Record<ContentItem['type'], ContentField[]> = {
  pov: [
    { id: 'name', name: 'name', label: '🎯 Project Name', type: 'text', required: true, placeholder: 'Enter POV project name', order: 1, visible: true, editable: true },
    { id: 'customer', name: 'customer', label: '🏢 Customer', type: 'text', required: true, placeholder: 'Customer organization name', order: 2, visible: true, editable: true },
    { id: 'description', name: 'description', label: '📝 Description', type: 'textarea', required: true, placeholder: 'Describe the POV objectives and scope', order: 3, visible: true, editable: true },
    { id: 'objectives', name: 'objectives', label: '🎯 Objectives', type: 'list', required: true, order: 4, visible: true, editable: true },
    { id: 'timeline', name: 'timeline', label: '⏱️ Timeline', type: 'select', required: true, options: ['30 days', '60 days', '90 days', '120 days', 'Custom'], order: 5, visible: true, editable: true },
    { id: 'budget', name: 'budget', label: '💰 Budget', type: 'number', required: false, placeholder: '150000', order: 6, visible: true, editable: true },
    { id: 'team_lead', name: 'teamLead', label: '👤 Team Lead', type: 'text', required: false, placeholder: 'john.doe@company.com', order: 7, visible: true, editable: true },
    { id: 'success_criteria', name: 'successCriteria', label: '✅ Success Criteria', type: 'list', required: true, order: 8, visible: true, editable: true }
  ],
  scenario: [
    { id: 'name', name: 'name', label: '🔬 Scenario Name', type: 'text', required: true, placeholder: 'Enter scenario name', order: 1, visible: true, editable: true },
    { id: 'threat_type', name: 'threatType', label: '🎭 Threat Type', type: 'select', required: true, options: ['Ransomware', 'APT', 'Insider Threat', 'Data Exfiltration', 'Supply Chain', 'Cloud Attack'], order: 2, visible: true, editable: true },
    { id: 'description', name: 'description', label: '📝 Description', type: 'textarea', required: true, placeholder: 'Describe the scenario details', order: 3, visible: true, editable: true },
    { id: 'attack_vectors', name: 'attackVectors', label: '🎯 Attack Vectors', type: 'list', required: true, order: 4, visible: true, editable: true },
    { id: 'mitre_mapping', name: 'mitreMapping', label: '🛡️ MITRE Mapping', type: 'tags', required: false, placeholder: 'T1078, T1059, etc.', order: 5, visible: true, editable: true },
    { id: 'detection_rules', name: 'detectionRules', label: '🔍 Detection Rules', type: 'list', required: false, order: 6, visible: true, editable: true },
    { id: 'response_actions', name: 'responseActions', label: '⚡ Response Actions', type: 'list', required: false, order: 7, visible: true, editable: true },
    { id: 'severity', name: 'severity', label: '⚠️ Severity', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Critical'], order: 8, visible: true, editable: true }
  ],
  template: [
    { id: 'name', name: 'name', label: '📋 Template Name', type: 'text', required: true, placeholder: 'Enter template name', order: 1, visible: true, editable: true },
    { id: 'category', name: 'category', label: '📂 Category', type: 'select', required: true, options: ['Security', 'Compliance', 'Performance', 'Integration', 'Usability'], order: 2, visible: true, editable: true },
    { id: 'description', name: 'description', label: '📝 Description', type: 'textarea', required: true, placeholder: 'Template purpose and use cases', order: 3, visible: true, editable: true },
    { id: 'requirements', name: 'requirements', label: '📋 Requirements', type: 'list', required: true, order: 4, visible: true, editable: true },
    { id: 'validation_steps', name: 'validationSteps', label: '✔️ Validation Steps', type: 'list', required: false, order: 5, visible: true, editable: true },
    { id: 'expected_outcomes', name: 'expectedOutcomes', label: '🎯 Expected Outcomes', type: 'list', required: false, order: 6, visible: true, editable: true }
  ],
  meeting: [
    { id: 'title', name: 'title', label: '🏷️ Meeting Title', type: 'text', required: true, placeholder: 'Meeting title', order: 1, visible: true, editable: true },
    { id: 'type', name: 'type', label: '🎭 Meeting Type', type: 'select', required: true, options: ['Demo', 'Follow-up', 'Planning', 'Review', 'Customer', 'Internal'], order: 2, visible: true, editable: true },
    { id: 'scheduled_at', name: 'scheduledAt', label: '📅 Scheduled Time', type: 'date', required: true, order: 3, visible: true, editable: true },
    { id: 'participants', name: 'participants', label: '👥 Participants', type: 'list', required: true, order: 4, visible: true, editable: true },
    { id: 'agenda', name: 'agenda', label: '📋 Agenda', type: 'list', required: false, order: 5, visible: true, editable: true },
    { id: 'notes', name: 'notes', label: '📝 Notes', type: 'textarea', required: false, placeholder: 'Meeting notes', order: 6, visible: true, editable: true }
  ],
  note: [
    { id: 'title', name: 'title', label: '🏷️ Note Title', type: 'text', required: true, placeholder: 'Note title', order: 1, visible: true, editable: true },
    { id: 'content', name: 'content', label: '📝 Content', type: 'textarea', required: true, placeholder: 'Note content', order: 2, visible: true, editable: true },
    { id: 'note_type', name: 'noteType', label: '📂 Note Type', type: 'select', required: true, options: ['General', 'Meeting', 'POV', 'Scenario', 'Customer'], order: 3, visible: true, editable: true }
  ],
  'action-item': [
    { id: 'description', name: 'description', label: '📝 Description', type: 'text', required: true, placeholder: 'Action item description', order: 1, visible: true, editable: true },
    { id: 'assignee', name: 'assignee', label: '👤 Assignee', type: 'text', required: true, placeholder: 'john.doe@company.com', order: 2, visible: true, editable: true },
    { id: 'due_date', name: 'dueDate', label: '📅 Due Date', type: 'date', required: false, order: 3, visible: true, editable: true },
    { id: 'priority', name: 'priority', label: '⚡ Priority', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Urgent'], order: 4, visible: true, editable: true },
    { id: 'status', name: 'status', label: '📊 Status', type: 'select', required: true, options: ['Todo', 'In Progress', 'Done', 'Blocked'], order: 5, visible: true, editable: true }
  ],
  'customer-profile': [
    { id: 'company_name', name: 'companyName', label: '🏢 Company Name', type: 'text', required: true, placeholder: 'Company name', order: 1, visible: true, editable: true },
    { id: 'industry', name: 'industry', label: '🏭 Industry', type: 'select', required: true, options: ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Government', 'Education', 'Other'], order: 2, visible: true, editable: true },
    { id: 'size', name: 'size', label: '👥 Company Size', type: 'select', required: true, options: ['Startup (<50)', 'Small (50-200)', 'Medium (200-1000)', 'Large (1000-5000)', 'Enterprise (5000+)'], order: 3, visible: true, editable: true },
    { id: 'contacts', name: 'contacts', label: '📞 Key Contacts', type: 'list', required: false, order: 4, visible: true, editable: true },
    { id: 'current_solutions', name: 'currentSolutions', label: '🔧 Current Solutions', type: 'list', required: false, order: 5, visible: true, editable: true },
    { id: 'pain_points', name: 'painPoints', label: '⚠️ Pain Points', type: 'list', required: false, order: 6, visible: true, editable: true }
  ],
  assessment: [
    { id: 'title', name: 'title', label: '🏷️ Assessment Title', type: 'text', required: true, placeholder: 'Assessment title', order: 1, visible: true, editable: true },
    { id: 'type', name: 'type', label: '📂 Assessment Type', type: 'select', required: true, options: ['Security', 'Compliance', 'Performance', 'Readiness', 'Risk'], order: 2, visible: true, editable: true },
    { id: 'scope', name: 'scope', label: '🎯 Scope', type: 'textarea', required: true, placeholder: 'Assessment scope and objectives', order: 3, visible: true, editable: true },
    { id: 'criteria', name: 'criteria', label: '✅ Criteria', type: 'list', required: true, order: 4, visible: true, editable: true },
    { id: 'findings', name: 'findings', label: '🔍 Key Findings', type: 'list', required: false, order: 5, visible: true, editable: true },
    { id: 'recommendations', name: 'recommendations', label: '💡 Recommendations', type: 'list', required: false, order: 6, visible: true, editable: true }
  ]
};

// Sample initial data
const SAMPLE_CONTENT: ContentItem[] = [
  {
    id: 'pov-001',
    type: 'pov',
    title: 'Acme Corp XSIAM Assessment',
    description: 'Comprehensive POV for Acme Corporation\'s security assessment and XSIAM implementation',
    content: {
      customer: 'Acme Corporation',
      objectives: ['Evaluate XSIAM capabilities', 'Test integration with existing tools', 'Assess ROI potential'],
      timeline: '90 days',
      budget: 150000,
      teamLead: 'john.smith@company.com',
      successCriteria: ['Successful SIEM integration', '99% uptime during testing', 'Positive stakeholder feedback']
    },
    metadata: {
      tags: ['acme', 'enterprise', 'assessment'],
      category: 'enterprise',
      priority: 'high',
      status: 'active',
      createdBy: 'john.smith@company.com',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      version: 1,
      usageCount: 5,
      favorited: true,
      shared: false
    },
    relationships: {
      relatedItems: ['scenario-001', 'meeting-001'],
      dependencies: [],
      children: []
    }
  },
  {
    id: 'scenario-001',
    type: 'scenario',
    title: 'Advanced Ransomware Detection',
    description: 'Detection scenario for advanced ransomware attacks using behavioral analytics',
    content: {
      threatType: 'Ransomware',
      attackVectors: ['Email phishing', 'Drive-by downloads', 'RDP exploitation'],
      mitreMapping: ['T1486', 'T1083', 'T1027'],
      detectionRules: ['File encryption patterns', 'Suspicious process behavior', 'Network anomalies'],
      responseActions: ['Isolate affected systems', 'Block malicious IPs', 'Restore from backups'],
      severity: 'Critical'
    },
    metadata: {
      tags: ['ransomware', 'detection', 'behavioral'],
      category: 'security',
      priority: 'high',
      status: 'active',
      createdBy: 'security.team@company.com',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-18T16:00:00Z',
      version: 2,
      usageCount: 12,
      favorited: false,
      shared: true
    },
    relationships: {
      relatedItems: ['pov-001'],
      dependencies: [],
      children: []
    }
  }
];

const ConsolidatedContentLibrary: React.FC<ConsolidatedContentLibraryProps> = ({
  className = '',
  initialView = 'grid',
  showCreateButton = true,
  allowedTypes,
  enableTemplates = true
}) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>(SAMPLE_CONTENT);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>(SAMPLE_CONTENT);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>(initialView);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'usage'>('updated');

  // Filter and search logic
  useEffect(() => {
    let filtered = [...contentItems];

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Apply allowed types filter
    if (allowedTypes) {
      filtered = filtered.filter(item => allowedTypes.includes(item.type));
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.metadata.category === selectedCategory);
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.metadata.status === selectedStatus);
    }

    // Apply favorites filter
    if (showOnlyFavorites) {
      filtered = filtered.filter(item => item.metadata.favorited);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.metadata.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime();
        case 'updated':
          return new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime();
        case 'usage':
          return b.metadata.usageCount - a.metadata.usageCount;
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  }, [contentItems, selectedType, selectedCategory, selectedStatus, showOnlyFavorites, searchTerm, sortBy, allowedTypes]);

  // Get unique categories and tags
  const availableCategories = useMemo(() => {
    const categories = new Set(contentItems.map(item => item.metadata.category));
    return Array.from(categories);
  }, [contentItems]);

  const availableTags = useMemo(() => {
    const tags = new Set(contentItems.flatMap(item => item.metadata.tags));
    return Array.from(tags);
  }, [contentItems]);

  // Create new content item
  const createNewItem = async (type: ContentItem['type']) => {
    const newItem: ContentItem = {
      id: `${type}-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      description: `New ${type} created on ${new Date().toLocaleDateString()}`,
      content: {},
      metadata: {
        tags: [],
        category: 'general',
        priority: 'medium',
        status: 'draft',
        createdBy: 'current-user@company.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        usageCount: 0,
        favorited: false,
        shared: false
      },
      relationships: {
        relatedItems: [],
        dependencies: [],
        children: []
      },
      template: {
        isTemplate: false,
        customFields: CONTENT_TEMPLATES[type] || []
      }
    };

    setContentItems(prev => [newItem, ...prev]);
    setSelectedItem(newItem);
    setIsEditing(true);

    // Track activity
    userActivityService.trackActivity('content-created', 'content-library', {
      type,
      id: newItem.id,
      title: newItem.title
    });
  };

  // Toggle favorite status
  const toggleFavorite = (item: ContentItem) => {
    const updated = {
      ...item,
      metadata: {
        ...item.metadata,
        favorited: !item.metadata.favorited,
        updatedAt: new Date().toISOString()
      }
    };

    setContentItems(prev => prev.map(i => i.id === item.id ? updated : i));
    
    if (selectedItem?.id === item.id) {
      setSelectedItem(updated);
    }
  };

  // Get type icon
  const getTypeIcon = (type: ContentItem['type']): string => {
    const icons = {
      'pov': '🎯',
      'scenario': '🔬',
      'template': '📋',
      'meeting': '👥',
      'note': '📝',
      'action-item': '✅',
      'customer-profile': '🏢',
      'assessment': '📊'
    };
    return icons[type] || '📄';
  };

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    const colors = {
      urgent: 'border-red-500 bg-red-500/10',
      high: 'border-orange-500 bg-orange-500/10',
      medium: 'border-yellow-500 bg-yellow-500/10',
      low: 'border-blue-500 bg-blue-500/10'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">📚</div>
            <div>
              <h2 className="text-2xl font-bold text-white">Content Library</h2>
              <p className="text-gray-400">Unified content management and creation</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {showCreateButton && (
              <div className="flex items-center space-x-1">
                <CortexButton
                  variant="ghost"
                  size="sm"
                  icon="🎯"
                  onClick={() => createNewItem('pov')}
                  tooltip="Create POV"
                >
                  POV
                </CortexButton>
                <CortexButton
                  variant="ghost"
                  size="sm"
                  icon="🔬"
                  onClick={() => createNewItem('scenario')}
                  tooltip="Create Scenario"
                >
                  Scenario
                </CortexButton>
                <CortexButton
                  variant="ghost"
                  size="sm"
                  icon="📝"
                  onClick={() => createNewItem('note')}
                  tooltip="Create Note"
                >
                  Note
                </CortexButton>
              </div>
            )}
            
            {/* View mode toggles */}
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                ⊞ Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                ☰ List
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white"
            >
              <option value="all">All Types</option>
              <option value="pov">POVs</option>
              <option value="scenario">Scenarios</option>
              <option value="template">Templates</option>
              <option value="meeting">Meetings</option>
              <option value="note">Notes</option>
              <option value="action-item">Action Items</option>
              <option value="customer-profile">Customer Profiles</option>
              <option value="assessment">Assessments</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Created Date</option>
              <option value="name">Name</option>
              <option value="usage">Usage Count</option>
            </select>

            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                showOnlyFavorites ? 'bg-yellow-600 text-white' : 'bg-gray-800 border border-gray-600 text-gray-300 hover:text-white'
              }`}
            >
              ⭐ Favorites
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search content library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No content found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || selectedType !== 'all' || selectedCategory !== 'all' 
                ? 'Try adjusting your filters or search terms.'
                : 'Start by creating your first content item.'
              }
            </p>
            {showCreateButton && (
              <div className="flex justify-center space-x-3">
                <CortexButton
                  variant="primary"
                  icon="🎯"
                  onClick={() => createNewItem('pov')}
                >
                  Create POV
                </CortexButton>
                <CortexButton
                  variant="outline"
                  icon="🔬"
                  onClick={() => createNewItem('scenario')}
                >
                  Create Scenario
                </CortexButton>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{filteredItems.length}</div>
                <div className="text-xs text-gray-400">Total Items</div>
              </div>
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {filteredItems.filter(i => i.metadata.status === 'active').length}
                </div>
                <div className="text-xs text-gray-400">Active</div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {filteredItems.filter(i => i.metadata.favorited).length}
                </div>
                <div className="text-xs text-gray-400">Favorites</div>
              </div>
              <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round(filteredItems.reduce((sum, item) => sum + item.metadata.usageCount, 0) / filteredItems.length) || 0}
                </div>
                <div className="text-xs text-gray-400">Avg Usage</div>
              </div>
              <div className="bg-cyan-900/20 border border-cyan-600/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {new Set(filteredItems.map(i => i.type)).size}
                </div>
                <div className="text-xs text-gray-400">Types</div>
              </div>
            </div>

            {/* Content grid/list */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className={`bg-gray-800 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer ${getPriorityColor(item.metadata.priority)} ${
                    viewMode === 'list' ? 'p-4' : 'p-6'
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl">{getTypeIcon(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm truncate">{item.title}</h3>
                        <p className="text-xs text-gray-400 capitalize">{item.type.replace('-', ' ')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item);
                        }}
                        className={`text-lg hover:scale-110 transition-transform ${
                          item.metadata.favorited ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'
                        }`}
                      >
                        ⭐
                      </button>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        item.metadata.priority === 'urgent' ? 'bg-red-600 text-white' :
                        item.metadata.priority === 'high' ? 'bg-orange-600 text-white' :
                        item.metadata.priority === 'medium' ? 'bg-yellow-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {item.metadata.priority}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{item.description}</p>

                  {/* Tags */}
                  {item.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.metadata.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {item.metadata.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                          +{item.metadata.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        item.metadata.status === 'active' ? 'bg-green-400' :
                        item.metadata.status === 'completed' ? 'bg-blue-400' :
                        item.metadata.status === 'archived' ? 'bg-gray-400' :
                        'bg-yellow-400'
                      }`}></span>
                      <span className="capitalize">{item.metadata.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📊 {item.metadata.usageCount}</span>
                      <span>{new Date(item.metadata.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Selected item modal/sidebar - This would be implemented based on design needs */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg border border-gray-600 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getTypeIcon(selectedItem.type)}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedItem.title}</h2>
                    <p className="text-gray-400 capitalize">{selectedItem.type.replace('-', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CortexButton
                    variant="outline"
                    size="sm"
                    icon="📝"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'View' : 'Edit'}
                  </CortexButton>
                  <CortexButton
                    variant="ghost"
                    size="sm"
                    icon="✕"
                    onClick={() => {
                      setSelectedItem(null);
                      setIsEditing(false);
                    }}
                  >
                    Close
                  </CortexButton>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-300 mb-6">{selectedItem.description}</p>
              
              {/* This would contain a dynamic form builder for editing the selected item */}
              {isEditing ? (
                <div className="space-y-4">
                  <p className="text-yellow-400">Edit mode - Form builder would go here</p>
                  {/* Dynamic form would be rendered based on selectedItem.template.customFields */}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-blue-400">View mode - Content display would go here</p>
                  {/* Content would be rendered based on selectedItem.content */}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsolidatedContentLibrary;