'use client';

import React, { useState } from 'react';
import { DocumentMetadata, CustomFieldDefinition, CustomFieldValue, CustomFieldType } from '../types/knowledgeBase';

interface MetadataEditorProps {
  metadata: DocumentMetadata;
  suggestedTags?: string[];
  suggestedKeywords?: string[];
  onMetadataChange: (metadata: DocumentMetadata) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  metadata,
  suggestedTags = [],
  suggestedKeywords = [],
  onMetadataChange,
  onSave,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'custom'>('basic');
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<CustomFieldDefinition[]>([]);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldDef, setNewFieldDef] = useState<Partial<CustomFieldDefinition>>({
    type: 'text'
  });

  // Update metadata helper
  const updateMetadata = (updates: Partial<DocumentMetadata>) => {
    onMetadataChange({ ...metadata, ...updates });
  };

  // Add tag
  const addTag = (tag: string) => {
    if (tag && !metadata.tags.includes(tag)) {
      updateMetadata({ tags: [...metadata.tags, tag] });
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    updateMetadata({ tags: metadata.tags.filter(t => t !== tag) });
  };

  // Add keyword
  const addKeyword = (keyword: string) => {
    if (keyword && !metadata.keywords.includes(keyword)) {
      updateMetadata({ keywords: [...metadata.keywords, keyword] });
    }
  };

  // Remove keyword
  const removeKeyword = (keyword: string) => {
    updateMetadata({ keywords: metadata.keywords.filter(k => k !== keyword) });
  };

  // Add topic
  const addTopic = (topic: string) => {
    if (topic && !metadata.topics.includes(topic)) {
      updateMetadata({ topics: [...metadata.topics, topic] });
    }
  };

  // Remove topic
  const removeTopic = (topic: string) => {
    updateMetadata({ topics: metadata.topics.filter(t => t !== topic) });
  };

  // Add custom field definition
  const addCustomFieldDefinition = () => {
    if (!newFieldDef.label || !newFieldDef.id) {
      alert('Please provide both ID and Label for the custom field');
      return;
    }

    setCustomFieldDefinitions([...customFieldDefinitions, newFieldDef as CustomFieldDefinition]);
    setNewFieldDef({ type: 'text' });
    setShowAddField(false);
  };

  // Update custom field value
  const updateCustomField = (fieldId: string, value: any, fieldDef: CustomFieldDefinition) => {
    const customFields = { ...metadata.customFields };
    customFields[fieldId] = {
      value,
      type: fieldDef.type,
      label: fieldDef.label
    };
    updateMetadata({ customFields });
  };

  // Render custom field input based on type
  const renderCustomFieldInput = (fieldDef: CustomFieldDefinition) => {
    const currentValue = metadata.customFields[fieldDef.id]?.value;

    switch (fieldDef.type) {
      case 'text':
      case 'url':
      case 'email':
        return (
          <input
            type={fieldDef.type}
            value={currentValue || ''}
            onChange={(e) => updateCustomField(fieldDef.id, e.target.value, fieldDef)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            placeholder={`Enter ${fieldDef.label.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={currentValue || ''}
            onChange={(e) => updateCustomField(fieldDef.id, parseFloat(e.target.value), fieldDef)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            min={fieldDef.validation?.min}
            max={fieldDef.validation?.max}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={currentValue || ''}
            onChange={(e) => updateCustomField(fieldDef.id, e.target.value, fieldDef)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentValue || false}
              onChange={(e) => updateCustomField(fieldDef.id, e.target.checked, fieldDef)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-300">Yes</span>
          </label>
        );

      case 'select':
        return (
          <select
            value={currentValue || ''}
            onChange={(e) => updateCustomField(fieldDef.id, e.target.value, fieldDef)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          >
            <option value="">Select an option</option>
            {fieldDef.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {fieldDef.options?.map(option => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(currentValue || []).includes(option)}
                  onChange={(e) => {
                    const current = currentValue || [];
                    const updated = e.target.checked
                      ? [...current, option]
                      : current.filter((v: string) => v !== option);
                    updateCustomField(fieldDef.id, updated, fieldDef);
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Document Metadata</h2>
          <p className="text-gray-400 text-sm mt-1">
            Review and customize metadata for your knowledge base document
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
          >
            Save Document
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'basic'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Basic Info
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'advanced'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Advanced
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'custom'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Custom Fields
        </button>
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <input
              type="text"
              value={metadata.category || ''}
              onChange={(e) => updateMetadata({ category: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="e.g., Tutorial, Reference, Guide"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={metadata.description || ''}
              onChange={(e) => updateMetadata({ description: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white h-24"
              placeholder="Brief description of the document..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {metadata.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-blue-200 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Suggested tags */}
            {suggestedTags.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2">Suggested tags:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter(tag => !metadata.tags.includes(tag))
                    .map(tag => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full text-sm transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <input
              type="text"
              placeholder="Type a tag and press Enter..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = (e.target as HTMLInputElement).value.trim();
                  if (value) {
                    addTag(value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Author</label>
            <input
              type="text"
              value={metadata.author || ''}
              onChange={(e) => updateMetadata({ author: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="Author name"
            />
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Keywords (Auto-extracted)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {metadata.keywords.map(keyword => (
                <span
                  key={keyword}
                  className="bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{keyword}</span>
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="text-green-200 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Suggested keywords */}
            {suggestedKeywords.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2">Suggested keywords:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedKeywords
                    .filter(kw => !metadata.keywords.includes(kw))
                    .map(keyword => (
                      <button
                        key={keyword}
                        onClick={() => addKeyword(keyword)}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full text-sm transition-colors"
                      >
                        + {keyword}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <input
              type="text"
              placeholder="Add custom keyword..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = (e.target as HTMLInputElement).value.trim();
                  if (value) {
                    addKeyword(value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
            />
          </div>

          {/* Topics */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Topics</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {metadata.topics.map(topic => (
                <span
                  key={topic}
                  className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{topic}</span>
                  <button
                    onClick={() => removeTopic(topic)}
                    className="text-purple-200 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add topic and press Enter..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = (e.target as HTMLInputElement).value.trim();
                  if (value) {
                    addTopic(value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
            />
          </div>

          {/* Complexity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Complexity Level
            </label>
            <select
              value={metadata.complexity}
              onChange={(e) =>
                updateMetadata({
                  complexity: e.target.value as DocumentMetadata['complexity']
                })
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {/* Read Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estimated Read Time (minutes)
            </label>
            <input
              type="number"
              value={metadata.estimatedReadTime}
              onChange={(e) =>
                updateMetadata({ estimatedReadTime: parseInt(e.target.value) || 0 })
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              min="1"
            />
          </div>
        </div>
      )}

      {/* Custom Fields Tab */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          {customFieldDefinitions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="mb-4">No custom fields defined yet.</p>
              <button
                onClick={() => setShowAddField(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
              >
                + Add Custom Field
              </button>
            </div>
          ) : (
            <>
              {/* Existing custom fields */}
              {customFieldDefinitions.map(fieldDef => (
                <div key={fieldDef.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    {fieldDef.label}
                    {fieldDef.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {renderCustomFieldInput(fieldDef)}
                </div>
              ))}

              {/* Add field button */}
              <button
                onClick={() => setShowAddField(true)}
                className="w-full py-2 border-2 border-dashed border-gray-600 rounded text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
              >
                + Add Another Field
              </button>
            </>
          )}

          {/* Add field form */}
          {showAddField && (
            <div className="border border-blue-500 rounded p-4 space-y-4 bg-gray-800/50">
              <h3 className="font-bold text-white">Define New Custom Field</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Field ID (unique identifier)
                </label>
                <input
                  type="text"
                  value={newFieldDef.id || ''}
                  onChange={(e) =>
                    setNewFieldDef({ ...newFieldDef, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="e.g., deployment_date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Field Label
                </label>
                <input
                  type="text"
                  value={newFieldDef.label || ''}
                  onChange={(e) => setNewFieldDef({ ...newFieldDef, label: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="e.g., Deployment Date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Field Type
                </label>
                <select
                  value={newFieldDef.type}
                  onChange={(e) =>
                    setNewFieldDef({ ...newFieldDef, type: e.target.value as CustomFieldType })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="boolean">Boolean (Yes/No)</option>
                  <option value="select">Select (Dropdown)</option>
                  <option value="multiselect">Multi-Select</option>
                  <option value="url">URL</option>
                  <option value="email">Email</option>
                </select>
              </div>

              {(newFieldDef.type === 'select' || newFieldDef.type === 'multiselect') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    onChange={(e) =>
                      setNewFieldDef({
                        ...newFieldDef,
                        options: e.target.value.split(',').map(o => o.trim())
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddField(false);
                    setNewFieldDef({ type: 'text' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addCustomFieldDefinition}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                >
                  Add Field
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto-extracted Info Summary */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Auto-Extracted Information</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-800 rounded p-3">
            <div className="text-2xl font-bold text-blue-400">{metadata.keywords.length}</div>
            <div className="text-xs text-gray-400">Keywords</div>
          </div>
          <div className="bg-gray-800 rounded p-3">
            <div className="text-2xl font-bold text-green-400">{metadata.estimatedReadTime}</div>
            <div className="text-xs text-gray-400">Min Read</div>
          </div>
          <div className="bg-gray-800 rounded p-3">
            <div className="text-2xl font-bold text-purple-400">{metadata.complexity}</div>
            <div className="text-xs text-gray-400">Level</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataEditor;
