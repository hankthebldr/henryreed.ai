'use client';

import React from 'react';
import {
  BusinessValueFramework,
  EXECUTIVE_OBJECTIVES,
  FUNCTIONAL_OBJECTIVES,
  USE_CASE_CATEGORIES,
  BUSINESS_CHALLENGES,
  CAPABILITIES_DEMONSTRATED,
  TELEMETRY_SOURCES,
  calculateBusinessValueScore,
  formatCurrency,
  formatPercentage,
} from '../../types/business-value-framework';

export interface BusinessValueCardProps {
  bvf: BusinessValueFramework;
  compact?: boolean;
  showScore?: boolean;
}

export const BusinessValueCard: React.FC<BusinessValueCardProps> = ({
  bvf,
  compact = false,
  showScore = true,
}) => {
  const score = calculateBusinessValueScore(bvf);

  if (compact) {
    return (
      <div className="bg-cortex-bg-secondary p-4 rounded-lg border border-cortex-border/40">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-cortex-text-primary">Business Value</h4>
          {showScore && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-cortex-text-secondary">Score:</span>
              <div className="px-2 py-1 bg-cortex-primary/20 text-cortex-primary rounded text-sm font-bold">
                {score}/100
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          {bvf.executiveObjective.length > 0 && (
            <div>
              <span className="text-cortex-text-muted">Objectives: </span>
              <span className="text-cortex-text-primary">
                {bvf.executiveObjective.length} executive, {bvf.functionalObjective.length} functional
              </span>
            </div>
          )}

          {bvf.operationalMetrics.mttr && (
            <div>
              <span className="text-cortex-text-muted">MTTR: </span>
              <span className="text-status-success font-medium">{bvf.operationalMetrics.mttr}m</span>
            </div>
          )}

          {bvf.financialMetrics.estimatedCostSavings && (
            <div>
              <span className="text-cortex-text-muted">Est. Savings: </span>
              <span className="text-status-success font-medium">
                {formatCurrency(bvf.financialMetrics.estimatedCostSavings)}/year
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score Header */}
      {showScore && (
        <div className="bg-gradient-to-r from-cortex-primary/10 to-cortex-primary/5 border border-cortex-primary/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-cortex-text-primary mb-1">
                Business Value Score
              </h3>
              <p className="text-sm text-cortex-text-secondary">
                Quantified impact based on objectives, capabilities, and metrics
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cortex-primary">{score}</div>
              <div className="text-xs text-cortex-text-muted">out of 100</div>
            </div>
          </div>
        </div>
      )}

      {/* Executive & Functional Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-cortex-bg-secondary p-4 rounded-lg">
          <h4 className="font-semibold text-cortex-text-primary mb-3 flex items-center space-x-2">
            <span>🎯</span>
            <span>Executive Objectives</span>
          </h4>
          <div className="space-y-2">
            {bvf.executiveObjective.map((obj, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <span className="text-cortex-primary mt-0.5">•</span>
                <span className="text-cortex-text-primary">{EXECUTIVE_OBJECTIVES[obj]}</span>
              </div>
            ))}
            {bvf.executiveObjective.length === 0 && (
              <p className="text-sm text-cortex-text-muted italic">No objectives defined</p>
            )}
          </div>
        </div>

        <div className="bg-cortex-bg-secondary p-4 rounded-lg">
          <h4 className="font-semibold text-cortex-text-primary mb-3 flex items-center space-x-2">
            <span>⚙️</span>
            <span>Functional Objectives</span>
          </h4>
          <div className="space-y-2">
            {bvf.functionalObjective.map((obj, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <span className="text-cortex-info mt-0.5">•</span>
                <span className="text-cortex-text-primary">{FUNCTIONAL_OBJECTIVES[obj]}</span>
              </div>
            ))}
            {bvf.functionalObjective.length === 0 && (
              <p className="text-sm text-cortex-text-muted italic">No objectives defined</p>
            )}
          </div>
        </div>
      </div>

      {/* Use Cases & Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-cortex-bg-secondary p-4 rounded-lg">
          <h4 className="font-semibold text-cortex-text-primary mb-3 flex items-center space-x-2">
            <span>🔬</span>
            <span>Use Case Categories</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {bvf.useCaseCategories.map((category, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-cortex-bg-tertiary text-cortex-text-primary rounded border border-cortex-border/40"
              >
                {USE_CASE_CATEGORIES[category]}
              </span>
            ))}
            {bvf.useCaseCategories.length === 0 && (
              <p className="text-sm text-cortex-text-muted italic">No categories defined</p>
            )}
          </div>
        </div>

        <div className="bg-cortex-bg-secondary p-4 rounded-lg">
          <h4 className="font-semibold text-cortex-text-primary mb-3 flex items-center space-x-2">
            <span>⚠️</span>
            <span>Business Challenges</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {bvf.challenges.map((challenge, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-status-warning/10 text-status-warning rounded border border-status-warning/30"
              >
                {BUSINESS_CHALLENGES[challenge]}
              </span>
            ))}
            {bvf.challenges.length === 0 && (
              <p className="text-sm text-cortex-text-muted italic">No challenges defined</p>
            )}
          </div>
        </div>
      </div>

      {/* Capabilities & Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-cortex-bg-secondary p-4 rounded-lg">
          <h4 className="font-semibold text-cortex-text-primary mb-3 flex items-center space-x-2">
            <span>✨</span>
            <span>Capabilities Demonstrated</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {bvf.capabilitiesDemonstrated.map((capability, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-cortex-primary/10 text-cortex-primary rounded border border-cortex-primary/30"
              >
                {CAPABILITIES_DEMONSTRATED[capability]}
              </span>
            ))}
            {bvf.capabilitiesDemonstrated.length === 0 && (
              <p className="text-sm text-cortex-text-muted italic">No capabilities defined</p>
            )}
          </div>
        </div>

        <div className="bg-cortex-bg-secondary p-4 rounded-lg">
          <h4 className="font-semibold text-cortex-text-primary mb-3 flex items-center space-x-2">
            <span>📡</span>
            <span>Telemetry Sources</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {bvf.telemetrySources.map((source, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-cortex-bg-tertiary text-cortex-text-primary rounded border border-cortex-border/40"
              >
                {TELEMETRY_SOURCES[source]}
              </span>
            ))}
            {bvf.telemetrySources.length === 0 && (
              <p className="text-sm text-cortex-text-muted italic">No sources defined</p>
            )}
          </div>
        </div>
      </div>

      {/* Operational Metrics */}
      {Object.keys(bvf.operationalMetrics).length > 0 && (
        <div className="bg-cortex-bg-secondary p-4 rounded-lg">
          <h4 className="font-semibold text-cortex-text-primary mb-3 flex items-center space-x-2">
            <span>📊</span>
            <span>Operational Metrics</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bvf.operationalMetrics.mttr !== undefined && (
              <div className="text-center p-3 bg-cortex-bg-tertiary rounded">
                <div className="text-xl font-bold text-status-success">
                  {bvf.operationalMetrics.mttr}m
                </div>
                <div className="text-xs text-cortex-text-muted">MTTR</div>
              </div>
            )}
            {bvf.operationalMetrics.mttd !== undefined && (
              <div className="text-center p-3 bg-cortex-bg-tertiary rounded">
                <div className="text-xl font-bold text-status-success">
                  {bvf.operationalMetrics.mttd}m
                </div>
                <div className="text-xs text-cortex-text-muted">MTTD</div>
              </div>
            )}
            {bvf.operationalMetrics.alertReduction !== undefined && (
              <div className="text-center p-3 bg-cortex-bg-tertiary rounded">
                <div className="text-xl font-bold text-status-success">
                  {formatPercentage(bvf.operationalMetrics.alertReduction)}
                </div>
                <div className="text-xs text-cortex-text-muted">Alert Reduction</div>
              </div>
            )}
            {bvf.operationalMetrics.automationRate !== undefined && (
              <div className="text-center p-3 bg-cortex-bg-tertiary rounded">
                <div className="text-xl font-bold text-cortex-primary">
                  {formatPercentage(bvf.operationalMetrics.automationRate)}
                </div>
                <div className="text-xs text-cortex-text-muted">Automation Rate</div>
              </div>
            )}
            {bvf.operationalMetrics.coverageImprovement !== undefined && (
              <div className="text-center p-3 bg-cortex-bg-tertiary rounded">
                <div className="text-xl font-bold text-cortex-info">
                  {formatPercentage(bvf.operationalMetrics.coverageImprovement)}
                </div>
                <div className="text-xs text-cortex-text-muted">Coverage +</div>
              </div>
            )}
            {bvf.operationalMetrics.threatDetectionAccuracy !== undefined && (
              <div className="text-center p-3 bg-cortex-bg-tertiary rounded">
                <div className="text-xl font-bold text-cortex-primary">
                  {formatPercentage(bvf.operationalMetrics.threatDetectionAccuracy)}
                </div>
                <div className="text-xs text-cortex-text-muted">Detection Accuracy</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Financial Metrics */}
      {Object.keys(bvf.financialMetrics).length > 0 && (
        <div className="bg-cortex-bg-secondary p-4 rounded-lg">
          <h4 className="font-semibold text-cortex-text-primary mb-3 flex items-center space-x-2">
            <span>💰</span>
            <span>Financial Metrics</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {bvf.financialMetrics.estimatedCostSavings !== undefined && (
              <div className="text-center p-3 bg-cortex-bg-tertiary rounded">
                <div className="text-xl font-bold text-status-success">
                  {formatCurrency(bvf.financialMetrics.estimatedCostSavings)}
                </div>
                <div className="text-xs text-cortex-text-muted">Annual Savings</div>
              </div>
            )}
            {bvf.financialMetrics.roiPercentage !== undefined && (
              <div className="text-center p-3 bg-cortex-bg-tertiary rounded">
                <div className="text-xl font-bold text-status-success">
                  {formatPercentage(bvf.financialMetrics.roiPercentage)}
                </div>
                <div className="text-xs text-cortex-text-muted">ROI</div>
              </div>
            )}
            {bvf.financialMetrics.efficiencyGains !== undefined && (
              <div className="text-center p-3 bg-cortex-bg-tertiary rounded">
                <div className="text-xl font-bold text-cortex-info">
                  {bvf.financialMetrics.efficiencyGains}h
                </div>
                <div className="text-xs text-cortex-text-muted">Hours Saved/Week</div>
              </div>
            )}
            {bvf.financialMetrics.resourceOptimization !== undefined && (
              <div className="text-center p-3 bg-cortex-bg-tertiary rounded">
                <div className="text-xl font-bold text-cortex-primary">
                  {bvf.financialMetrics.resourceOptimization} FTE
                </div>
                <div className="text-xs text-cortex-text-muted">Resource Optimization</div>
              </div>
            )}
            {bvf.financialMetrics.toolConsolidation !== undefined && (
              <div className="text-center p-3 bg-cortex-bg-tertiary rounded">
                <div className="text-xl font-bold text-cortex-warning">
                  {bvf.financialMetrics.toolConsolidation}
                </div>
                <div className="text-xs text-cortex-text-muted">Tools Consolidated</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Business Outcomes */}
      {bvf.businessOutcomes.length > 0 && (
        <div className="bg-cortex-bg-secondary p-4 rounded-lg">
          <h4 className="font-semibold text-cortex-text-primary mb-3 flex items-center space-x-2">
            <span>🎉</span>
            <span>Business Outcomes</span>
          </h4>
          <ul className="space-y-2">
            {bvf.businessOutcomes.map((outcome, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <span className="text-status-success mt-0.5">✓</span>
                <span className="text-cortex-text-primary">{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Engagement Metadata */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-cortex-bg-secondary p-3 rounded-lg text-center">
          <div className="text-sm font-medium text-cortex-text-secondary mb-1">CVP Quantification</div>
          <div className={`text-lg font-bold ${bvf.quantificationInCVP ? 'text-status-success' : 'text-cortex-text-muted'}`}>
            {bvf.quantificationInCVP ? 'Yes' : 'No'}
          </div>
        </div>
        <div className="bg-cortex-bg-secondary p-3 rounded-lg text-center">
          <div className="text-sm font-medium text-cortex-text-secondary mb-1">Include in Discovery</div>
          <div className={`text-lg font-bold ${bvf.includeInDiscovery ? 'text-cortex-primary' : 'text-cortex-text-muted'}`}>
            {bvf.includeInDiscovery ? 'Yes' : 'No'}
          </div>
        </div>
        <div className="bg-cortex-bg-secondary p-3 rounded-lg text-center">
          <div className="text-sm font-medium text-cortex-text-secondary mb-1">Custom Tags</div>
          <div className="text-lg font-bold text-cortex-text-primary">
            {bvf.customTags?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
};
