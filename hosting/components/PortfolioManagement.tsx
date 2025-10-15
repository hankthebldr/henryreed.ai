'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import {
  Portfolio,
  CreatePortfolioFormData,
  UpdatePortfolioFormData,
  PortfolioStatus,
} from '../types/portfolio';
import CortexButton from './CortexButton';

const STATUS_COLORS: Record<PortfolioStatus, string> = {
  'active': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'planning': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'on-hold': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'completed': 'bg-green-500/20 text-green-400 border-green-500/30',
  'archived': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

// Portfolio Card Component
const PortfolioCard: React.FC<{
  portfolio: Portfolio;
  onView: (portfolio: Portfolio) => void;
  onEdit: (portfolio: Portfolio) => void;
  onDelete: (portfolioId: string) => void;
}> = ({ portfolio, onView, onEdit, onDelete }) => {
  const budgetUtilization = portfolio.budget
    ? (portfolio.budget.spent / portfolio.budget.allocated) * 100
    : 0;

  return (
    <div
      className="cortex-card p-6 hover:bg-cortex-bg-hover/50 transition-colors cursor-pointer"
      onClick={() => onView(portfolio)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-cortex-text-primary mb-2">{portfolio.name}</h3>
          <p className="text-sm text-cortex-text-secondary line-clamp-2">{portfolio.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs border ${STATUS_COLORS[portfolio.status]}`}>
          {portfolio.status.replace('-', ' ').toUpperCase()}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-cortex-green">{portfolio.projectCount || 0}</div>
          <div className="text-xs text-cortex-text-muted">Projects</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cortex-info">{portfolio.trrCount || 0}</div>
          <div className="text-xs text-cortex-text-muted">TRRs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cortex-primary">{portfolio.completionRate || 0}%</div>
          <div className="text-xs text-cortex-text-muted">Complete</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cortex-warning">{Math.round(budgetUtilization)}%</div>
          <div className="text-xs text-cortex-text-muted">Budget Used</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-cortex-text-muted mb-1">
          <span>Overall Progress</span>
          <span>{portfolio.completionRate || 0}%</span>
        </div>
        <div className="w-full bg-cortex-bg-tertiary rounded-full h-2">
          <div
            className="bg-cortex-green h-2 rounded-full transition-all duration-300"
            style={{ width: `${portfolio.completionRate || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Tags */}
      {portfolio.tags && portfolio.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {portfolio.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-cortex-bg-tertiary text-cortex-text-muted rounded border border-cortex-border/40"
            >
              {tag}
            </span>
          ))}
          {portfolio.tags.length > 3 && (
            <span className="px-2 py-1 text-xs text-cortex-text-muted">
              +{portfolio.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end space-x-2 pt-4 border-t border-cortex-border/40">
        <CortexButton
          onClick={() => onView(portfolio)}
          variant="outline"
          size="sm"
          icon="👁️"
        >
          View
        </CortexButton>
        <CortexButton
          onClick={() => onEdit(portfolio)}
          variant="outline"
          size="sm"
          icon="✏️"
        >
          Edit
        </CortexButton>
        <CortexButton
          onClick={() => {
            if (confirm(`Are you sure you want to delete portfolio "${portfolio.name}"?`)) {
              onDelete(portfolio.id);
            }
          }}
          variant="outline"
          size="sm"
          icon="🗑️"
          className="text-status-error hover:text-status-error"
        >
          Delete
        </CortexButton>
      </div>
    </div>
  );
};

// Portfolio Form Component
const PortfolioForm: React.FC<{
  initialData?: Portfolio;
  onSubmit: (data: CreatePortfolioFormData | UpdatePortfolioFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}> = ({ initialData, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState<CreatePortfolioFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    status: initialData?.status || 'planning',
    tags: initialData?.tags || [],
    budget: initialData?.budget ? {
      allocated: initialData.budget.allocated,
      currency: initialData.budget.currency,
      fiscalYear: initialData.budget.fiscalYear,
    } : undefined,
    kpis: initialData?.kpis?.map(kpi => ({
      name: kpi.name,
      target: kpi.target,
      unit: kpi.unit,
    })) || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Portfolio name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.budget && formData.budget.allocated <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
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

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="cortex-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cortex-text-primary">
          {isEditing ? '✏️ Edit Portfolio' : '📁 Create New Portfolio'}
        </h2>
        <CortexButton onClick={onCancel} variant="outline" size="sm">
          Cancel
        </CortexButton>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Portfolio Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50 ${
                errors.name ? 'border-status-error' : 'border-cortex-border/40'
              }`}
              placeholder="e.g., Enterprise Security Initiatives"
            />
            {errors.name && <p className="text-status-error text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
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
              placeholder="Describe the purpose and scope of this portfolio"
            />
            {errors.description && <p className="text-status-error text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as PortfolioStatus })}
              className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Budget (Optional) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-cortex-text-primary">Budget (Optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                Allocated Budget
              </label>
              <input
                type="number"
                value={formData.budget?.allocated || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  budget: {
                    allocated: parseFloat(e.target.value) || 0,
                    currency: formData.budget?.currency || 'USD',
                    fiscalYear: formData.budget?.fiscalYear,
                  }
                })}
                className={`w-full px-4 py-3 bg-cortex-bg-tertiary border rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50 ${
                  errors.budget ? 'border-status-error' : 'border-cortex-border/40'
                }`}
                placeholder="0"
                min="0"
              />
              {errors.budget && <p className="text-status-error text-sm mt-1">{errors.budget}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
                Currency
              </label>
              <select
                value={formData.budget?.currency || 'USD'}
                onChange={(e) => formData.budget && setFormData({
                  ...formData,
                  budget: {
                    ...formData.budget,
                    currency: e.target.value,
                  }
                })}
                className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-cortex-text-secondary mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags?.map((tag, index) => (
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
          <div className="flex space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tag and press Enter"
              className="flex-1 px-4 py-2 bg-cortex-bg-tertiary border border-cortex-border/40 rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-primary/50"
            />
            <CortexButton
              onClick={addTag}
              variant="outline"
              size="sm"
              type="button"
            >
              Add Tag
            </CortexButton>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-cortex-border/40">
          <CortexButton onClick={onCancel} variant="outline">
            Cancel
          </CortexButton>
          <CortexButton type="submit" variant="primary" icon={isEditing ? '✏️' : '📁'}>
            {isEditing ? 'Update Portfolio' : 'Create Portfolio'}
          </CortexButton>
        </div>
      </form>
    </div>
  );
};

// Main Portfolio Management Component
export const PortfolioManagement: React.FC = () => {
  const { portfolioState, portfolioActions } = usePortfolio();
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [currentPortfolio, setCurrentPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    portfolioActions.listPortfolios();
  }, []);

  const handleCreate = async (data: CreatePortfolioFormData) => {
    try {
      await portfolioActions.createPortfolio(data);
      setView('list');
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      alert('Failed to create portfolio. Please try again.');
    }
  };

  const handleUpdate = async (data: UpdatePortfolioFormData) => {
    if (!currentPortfolio) return;
    try {
      await portfolioActions.updatePortfolio(currentPortfolio.id, data);
      setCurrentPortfolio(null);
      setView('list');
    } catch (error) {
      console.error('Failed to update portfolio:', error);
      alert('Failed to update portfolio. Please try again.');
    }
  };

  const handleDelete = async (portfolioId: string) => {
    try {
      await portfolioActions.deletePortfolio(portfolioId);
    } catch (error) {
      console.error('Failed to delete portfolio:', error);
      alert('Failed to delete portfolio. Please try again.');
    }
  };

  const handleView = (portfolio: Portfolio) => {
    portfolioActions.selectPortfolio(portfolio);
    // TODO: Navigate to portfolio detail view with projects
    console.log('View portfolio:', portfolio);
  };

  const handleEdit = (portfolio: Portfolio) => {
    setCurrentPortfolio(portfolio);
    setView('edit');
  };

  // Render based on current view
  if (view === 'create') {
    return (
      <PortfolioForm
        onSubmit={handleCreate}
        onCancel={() => setView('list')}
      />
    );
  }

  if (view === 'edit' && currentPortfolio) {
    return (
      <PortfolioForm
        initialData={currentPortfolio}
        onSubmit={handleUpdate}
        onCancel={() => {
          setCurrentPortfolio(null);
          setView('list');
        }}
        isEditing
      />
    );
  }

  // Default list view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cortex-text-primary">📁 Portfolio Management</h1>
          <p className="text-cortex-text-secondary mt-2">
            Organize projects into strategic portfolios for better visibility and control
          </p>
        </div>
        <CortexButton
          onClick={() => setView('create')}
          variant="primary"
          icon="📁"
        >
          Create Portfolio
        </CortexButton>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="cortex-card p-4 text-center">
          <div className="text-2xl font-bold text-cortex-text-primary">
            {portfolioState.portfolios.length}
          </div>
          <div className="text-sm text-cortex-text-secondary">Total Portfolios</div>
        </div>
        <div className="cortex-card p-4 text-center">
          <div className="text-2xl font-bold text-cortex-green">
            {portfolioState.portfolios.filter(p => p.status === 'active').length}
          </div>
          <div className="text-sm text-cortex-text-secondary">Active</div>
        </div>
        <div className="cortex-card p-4 text-center">
          <div className="text-2xl font-bold text-cortex-info">
            {portfolioState.portfolios.reduce((sum, p) => sum + (p.projectCount || 0), 0)}
          </div>
          <div className="text-sm text-cortex-text-secondary">Total Projects</div>
        </div>
        <div className="cortex-card p-4 text-center">
          <div className="text-2xl font-bold text-cortex-primary">
            {portfolioState.portfolios.reduce((sum, p) => sum + (p.trrCount || 0), 0)}
          </div>
          <div className="text-sm text-cortex-text-secondary">Total TRRs</div>
        </div>
      </div>

      {/* Portfolio Grid */}
      {portfolioState.isLoading ? (
        <div className="text-center py-12">
          <div className="text-cortex-text-muted">Loading portfolios...</div>
        </div>
      ) : portfolioState.portfolios.length === 0 ? (
        <div className="cortex-card p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-bold text-cortex-text-primary mb-2">No Portfolios Yet</h3>
          <p className="text-cortex-text-secondary mb-6">
            Create your first portfolio to start organizing your projects and TRRs
          </p>
          <CortexButton
            onClick={() => setView('create')}
            variant="primary"
            icon="📁"
          >
            Create First Portfolio
          </CortexButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {portfolioState.portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
