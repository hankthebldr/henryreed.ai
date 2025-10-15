'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  NICCEE_PLAYBOOKS,
  NICCEE_DATA_SOURCES,
  NICCEE_BUSINESS_VALUE_FRAMEWORK,
  getDataSourcesByCategory,
  NIIntegrationPlaybook,
  NIDataSource
} from '../lib/niccee-framework';

/**
 * NICCEEFramework Component
 *
 * Interactive visualization of XSIAM Data Implementation Framework
 * Network, Identity, Cloud, Container, Endpoint, Email
 */

export const NICCEEFramework: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<NIDataSource | null>(null);
  const [view, setView] = useState<'overview' | 'playbook' | 'business-value'>('overview');

  const activePlaybook = useMemo(() => {
    if (!activeCategory) return null;
    return NICCEE_PLAYBOOKS.find(p => p.category === activeCategory);
  }, [activeCategory]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/40';
      default:
        return 'bg-cortex-info/20 text-cortex-info border-cortex-info/40';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      network: 'from-blue-500/20 to-blue-600/20 border-blue-500/40 text-blue-300',
      identity: 'from-purple-500/20 to-purple-600/20 border-purple-500/40 text-purple-300',
      cloud: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/40 text-cyan-300',
      container: 'from-green-500/20 to-green-600/20 border-green-500/40 text-green-300',
      endpoint: 'from-orange-500/20 to-orange-600/20 border-orange-500/40 text-orange-300',
      email: 'from-pink-500/20 to-pink-600/20 border-pink-500/40 text-pink-300',
    };
    return colors[category as keyof typeof colors] || 'from-cortex-primary/20 to-cortex-accent/20 border-cortex-primary/40 text-cortex-primary';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cortex-card p-8 bg-gradient-to-br from-cortex-primary/10 to-cortex-accent/10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cortex-text-primary mb-3 flex items-center">
              <span className="text-4xl mr-4">🎯</span>
              NICCEE Framework
            </h1>
            <p className="text-cortex-text-secondary mb-4 max-w-3xl">
              Comprehensive XSIAM Data Implementation Framework mapping data sources to business value outcomes.
              <br />
              <span className="text-cortex-text-muted text-sm">Network • Identity • Cloud • Container • Endpoint • Email</span>
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setView('overview')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  view === 'overview'
                    ? 'bg-cortex-primary text-black'
                    : 'bg-cortex-bg-tertiary text-cortex-text-muted hover:text-cortex-text-primary'
                )}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setView('playbook')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  view === 'playbook'
                    ? 'bg-cortex-primary text-black'
                    : 'bg-cortex-bg-tertiary text-cortex-text-muted hover:text-cortex-text-primary'
                )}
              >
                📖 Playbooks
              </button>
              <button
                onClick={() => setView('business-value')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  view === 'business-value'
                    ? 'bg-cortex-primary text-black'
                    : 'bg-cortex-bg-tertiary text-cortex-text-muted hover:text-cortex-text-primary'
                )}
              >
                💰 Business Value
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overview View */}
      {view === 'overview' && (
        <>
          {/* NICCEE Hexagon Diagram */}
          <div className="cortex-card p-8">
            <h2 className="text-2xl font-bold text-cortex-text-primary mb-6">Framework Architecture</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {NICCEE_PLAYBOOKS.map((playbook) => (
                <button
                  key={playbook.category}
                  onClick={() => {
                    setActiveCategory(playbook.category);
                    setView('playbook');
                  }}
                  className={cn(
                    'cortex-card p-6 text-left hover:scale-105 transition-all duration-200 border-2',
                    `bg-gradient-to-br ${getCategoryColor(playbook.category)}`
                  )}
                >
                  <div className="text-5xl mb-4">{playbook.icon}</div>
                  <h3 className="text-xl font-bold text-cortex-text-primary mb-2">
                    {playbook.title}
                  </h3>
                  <p className="text-sm text-cortex-text-secondary mb-4">
                    {playbook.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cortex-text-muted">
                      {playbook.dataSources.length} Data Sources
                    </span>
                    <span className="text-cortex-primary">View Playbook →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="cortex-card p-6 text-center">
              <div className="text-4xl font-bold text-cortex-primary mb-2">
                {NICCEE_DATA_SOURCES.length}
              </div>
              <div className="text-sm text-cortex-text-muted">Total Data Sources</div>
            </div>
            <div className="cortex-card p-6 text-center">
              <div className="text-4xl font-bold text-cortex-accent mb-2">
                {NICCEE_DATA_SOURCES.filter(ds => ds.riskImpact === 'critical').length}
              </div>
              <div className="text-sm text-cortex-text-muted">Critical Priority</div>
            </div>
            <div className="cortex-card p-6 text-center">
              <div className="text-4xl font-bold text-cortex-success mb-2">
                {NICCEE_DATA_SOURCES.filter(ds => ds.deploymentComplexity === 'low').length}
              </div>
              <div className="text-sm text-cortex-text-muted">Low Complexity</div>
            </div>
            <div className="cortex-card p-6 text-center">
              <div className="text-4xl font-bold text-cortex-info mb-2">
                6
              </div>
              <div className="text-sm text-cortex-text-muted">Categories</div>
            </div>
          </div>
        </>
      )}

      {/* Playbook View */}
      {view === 'playbook' && (
        <div className="space-y-6">
          {/* Category Selection */}
          {!activeCategory && (
            <div className="cortex-card p-6">
              <h2 className="text-xl font-bold text-cortex-text-primary mb-4">Select a Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {NICCEE_PLAYBOOKS.map((playbook) => (
                  <button
                    key={playbook.category}
                    onClick={() => setActiveCategory(playbook.category)}
                    className={cn(
                      'cortex-card p-4 text-left hover:bg-cortex-bg-hover transition-all',
                      `border-l-4 ${getCategoryColor(playbook.category).split(' ')[2]}`
                    )}
                  >
                    <div className="text-3xl mb-2">{playbook.icon}</div>
                    <div className="text-sm font-bold text-cortex-text-primary">
                      {playbook.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Playbook */}
          {activePlaybook && (
            <>
              <div className="cortex-card p-6">
                <button
                  onClick={() => setActiveCategory(null)}
                  className="text-sm text-cortex-primary hover:text-cortex-primary-light mb-4"
                >
                  ← Back to Categories
                </button>

                <div className="flex items-start space-x-6 mb-6">
                  <div className="text-6xl">{activePlaybook.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-cortex-text-primary mb-2">
                      {activePlaybook.title}
                    </h2>
                    <p className="text-cortex-text-secondary mb-4">{activePlaybook.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-cortex-bg-secondary p-3 rounded-lg">
                        <div className="text-2xl font-bold text-cortex-success mb-1">
                          {activePlaybook.businessValueProps.riskReduction.split('%')[0]}%
                        </div>
                        <div className="text-xs text-cortex-text-muted">Risk Reduction</div>
                      </div>
                      <div className="bg-cortex-bg-secondary p-3 rounded-lg">
                        <div className="text-2xl font-bold text-cortex-info mb-1">
                          {activePlaybook.businessValueProps.efficiencyGain.split('%')[0]}%
                        </div>
                        <div className="text-xs text-cortex-text-muted">Efficiency Gain</div>
                      </div>
                      <div className="bg-cortex-bg-secondary p-3 rounded-lg">
                        <div className="text-2xl font-bold text-cortex-accent mb-1">
                          {activePlaybook.businessValueProps.costSavings.match(/\$[\d.]+[KM]/)?.[0] || 'N/A'}
                        </div>
                        <div className="text-xs text-cortex-text-muted">Cost Savings</div>
                      </div>
                      <div className="bg-cortex-bg-secondary p-3 rounded-lg">
                        <div className="text-2xl font-bold text-cortex-primary mb-1">
                          {activePlaybook.dataSources.length}
                        </div>
                        <div className="text-xs text-cortex-text-muted">Data Sources</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Sources */}
              <div className="cortex-card p-6">
                <h3 className="text-xl font-bold text-cortex-text-primary mb-4">Data Sources</h3>
                <div className="space-y-4">
                  {activePlaybook.dataSources.map((dataSource) => (
                    <button
                      key={dataSource.id}
                      onClick={() => setSelectedDataSource(dataSource)}
                      className="w-full cortex-card p-4 text-left hover:bg-cortex-bg-hover transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-bold text-cortex-text-primary">
                              {dataSource.name}
                            </h4>
                            <span className={cn('px-2 py-1 text-xs rounded border', getRiskColor(dataSource.riskImpact))}>
                              {dataSource.riskImpact.toUpperCase()}
                            </span>
                            <span className="px-2 py-1 text-xs bg-cortex-bg-tertiary text-cortex-text-secondary rounded">
                              {dataSource.timeToValue}
                            </span>
                          </div>
                          <p className="text-sm text-cortex-text-secondary mb-3">
                            {dataSource.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-cortex-text-muted">
                            <span>📊 {dataSource.dataTypes.length} Data Types</span>
                            <span>🎯 {dataSource.mitreAttackCoverage.length} MITRE Techniques</span>
                            <span>⚡ {dataSource.deploymentComplexity} complexity</span>
                          </div>
                        </div>
                        <span className="text-cortex-primary ml-4">▶</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Deployment Steps */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="cortex-card p-6">
                  <h3 className="text-lg font-bold text-cortex-text-primary mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    Deployment Steps
                  </h3>
                  <ol className="space-y-3">
                    {activePlaybook.deploymentSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cortex-primary/20 text-cortex-primary text-sm font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-cortex-text-secondary">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="cortex-card p-6">
                  <h3 className="text-lg font-bold text-cortex-text-primary mb-4 flex items-center">
                    <span className="mr-2">✅</span>
                    Validation Checklist
                  </h3>
                  <ul className="space-y-3">
                    {activePlaybook.validationChecklist.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          className="mt-1"
                          id={`validation-${idx}`}
                        />
                        <label
                          htmlFor={`validation-${idx}`}
                          className="text-sm text-cortex-text-secondary cursor-pointer"
                        >
                          {item}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key Benefits */}
              <div className="cortex-card p-6">
                <h3 className="text-lg font-bold text-cortex-text-primary mb-4">Key Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activePlaybook.keyBenefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <span className="text-cortex-success">✓</span>
                      <span className="text-sm text-cortex-text-secondary">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Business Value View */}
      {view === 'business-value' && (
        <div className="space-y-6">
          {Object.entries(NICCEE_BUSINESS_VALUE_FRAMEWORK).map(([key, framework]) => (
            <div key={key} className="cortex-card p-6">
              <h3 className="text-2xl font-bold text-cortex-text-primary mb-4">
                {framework.title}
              </h3>

              {/* Metrics */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-cortex-text-secondary mb-3">Key Metrics:</h4>
                <div className="flex flex-wrap gap-2">
                  {framework.metrics.map((metric, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs bg-cortex-bg-tertiary text-cortex-text-primary rounded border border-cortex-border/30"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>

              {/* NICCEE Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(framework.nicceeImpact).map(([category, impact]) => {
                  const playbook = NICCEE_PLAYBOOKS.find(p => p.category === category);
                  return (
                    <div
                      key={category}
                      className={cn(
                        'p-4 rounded-lg border-2',
                        `bg-gradient-to-br ${getCategoryColor(category)}`
                      )}
                    >
                      <div className="text-2xl mb-2">{playbook?.icon}</div>
                      <div className="text-sm font-bold text-cortex-text-primary mb-2 uppercase">
                        {category}
                      </div>
                      <p className="text-xs text-cortex-text-secondary leading-relaxed">
                        {impact}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Data Source Detail Modal */}
      {selectedDataSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="cortex-card p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-cortex-text-primary mb-2">
                  {selectedDataSource.name}
                </h2>
                <p className="text-sm text-cortex-text-secondary">{selectedDataSource.description}</p>
              </div>
              <button
                onClick={() => setSelectedDataSource(null)}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-cortex-error/20 text-cortex-error border border-cortex-error/40 hover:bg-cortex-error/30 transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-cortex-bg-secondary p-3 rounded-lg">
                <div className={cn('text-xl font-bold mb-1', getRiskColor(selectedDataSource.riskImpact).split(' ')[1])}>
                  {selectedDataSource.riskImpact.toUpperCase()}
                </div>
                <div className="text-xs text-cortex-text-muted">Risk Impact</div>
              </div>
              <div className="bg-cortex-bg-secondary p-3 rounded-lg">
                <div className="text-xl font-bold text-cortex-primary mb-1">
                  {selectedDataSource.timeToValue}
                </div>
                <div className="text-xs text-cortex-text-muted">Time to Value</div>
              </div>
              <div className="bg-cortex-bg-secondary p-3 rounded-lg">
                <div className="text-xl font-bold text-cortex-info mb-1">
                  {selectedDataSource.deploymentComplexity}
                </div>
                <div className="text-xs text-cortex-text-muted">Complexity</div>
              </div>
              <div className="bg-cortex-bg-secondary p-3 rounded-lg">
                <div className="text-xl font-bold text-cortex-accent mb-1">
                  {selectedDataSource.mitreAttackCoverage.length}
                </div>
                <div className="text-xs text-cortex-text-muted">MITRE Techniques</div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Use Case */}
              <div>
                <h4 className="font-bold text-cortex-text-primary mb-2">Use Case</h4>
                <p className="text-sm text-cortex-text-secondary">{selectedDataSource.useCase}</p>
              </div>

              {/* Business Value */}
              <div>
                <h4 className="font-bold text-cortex-text-primary mb-2">Business Value</h4>
                <ul className="space-y-2">
                  {selectedDataSource.businessValue.map((value, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-cortex-success">✓</span>
                      <span className="text-sm text-cortex-text-secondary">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Test Cases */}
              <div>
                <h4 className="font-bold text-cortex-text-primary mb-2">Test Cases</h4>
                <div className="space-y-2">
                  {selectedDataSource.testCases.map((testCase, idx) => (
                    <div key={idx} className="bg-cortex-bg-secondary p-3 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <span className="text-cortex-primary">#{idx + 1}</span>
                        <span className="text-sm text-cortex-text-secondary">{testCase}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-cortex-text-primary mb-2">Data Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDataSource.dataTypes.map((type, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-cortex-primary/10 text-cortex-primary rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-cortex-text-primary mb-2">Vendors</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDataSource.vendors.map((vendor, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-cortex-accent/10 text-cortex-accent rounded">
                        {vendor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* MITRE ATT&CK Coverage */}
              <div>
                <h4 className="font-bold text-cortex-text-primary mb-2">MITRE ATT&CK Coverage</h4>
                <div className="space-y-1">
                  {selectedDataSource.mitreAttackCoverage.map((technique, idx) => (
                    <div key={idx} className="text-sm text-cortex-text-secondary font-mono">
                      {technique}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NICCEEFramework;
