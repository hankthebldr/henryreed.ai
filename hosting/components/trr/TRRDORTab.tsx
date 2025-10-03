'use client';

import React, { useState } from 'react';
import { TRR, DORStatus } from '../../types/trr';
import CortexButton from '../CortexButton';

interface TRRDORTabProps {
  trr: TRR;
  onUpdateDOR?: (dorStatus: DORStatus) => void;
  onRunAIVerification?: () => void;
}

// Definition of Ready criteria categories
const DOR_CRITERIA = {
  'requirements': {
    title: 'Requirements',
    icon: '📋',
    items: [
      'Clear and specific requirement statement',
      'Acceptance criteria defined',
      'Business value articulated',
      'Customer validation obtained',
      'Dependencies identified'
    ]
  },
  'technical': {
    title: 'Technical',
    icon: '⚙️',
    items: [
      'Technical approach defined',
      'Architecture decisions made',
      'Integration points identified',
      'Performance criteria specified',
      'Security requirements addressed'
    ]
  },
  'testing': {
    title: 'Testing',
    icon: '🧪',
    items: [
      'Test strategy defined',
      'Test cases outlined',
      'Test environment requirements specified',
      'Validation methods identified',
      'Quality gates established'
    ]
  },
  'resources': {
    title: 'Resources',
    icon: '👥',
    items: [
      'Team members assigned',
      'Required skills available',
      'Time estimates provided',
      'Budget considerations addressed',
      'External dependencies managed'
    ]
  },
  'compliance': {
    title: 'Compliance',
    icon: '⚖️',
    items: [
      'Regulatory requirements identified',
      'Security compliance verified',
      'Privacy considerations addressed',
      'Audit trail requirements met',
      'Documentation standards followed'
    ]
  }
};

export const TRRDORTab: React.FC<TRRDORTabProps> = ({
  trr,
  onUpdateDOR,
  onRunAIVerification,
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['requirements']);

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionKey)
        ? prev.filter(key => key !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  const getComplianceColor = (score: number): string => {
    if (score >= 90) return 'text-cortex-success bg-cortex-success/10 border-cortex-success';
    if (score >= 70) return 'text-cortex-warning bg-cortex-warning/10 border-cortex-warning';
    if (score >= 50) return 'text-cortex-info bg-cortex-info/10 border-cortex-info';
    return 'text-cortex-error bg-cortex-error/10 border-cortex-error';
  };

  const getComplianceIcon = (isReady: boolean, score: number): string => {
    if (isReady) return '✅';
    if (score >= 70) return '⚠️';
    return '❌';
  };

  const calculateCategoryScore = (categoryKey: string): number => {
    const category = DOR_CRITERIA[categoryKey as keyof typeof DOR_CRITERIA];
    const unmetInCategory = trr.dorStatus?.unmetCriteria.filter(criterion => 
      category.items.some(item => item.toLowerCase().includes(criterion.toLowerCase()))
    ).length || 0;
    
    return Math.round(((category.items.length - unmetInCategory) / category.items.length) * 100);
  };

  const isCriteriaMet = (criterion: string): boolean => {
    return !trr.dorStatus?.unmetCriteria.includes(criterion);
  };

  const getOverallRecommendation = (): { message: string; action: string; color: string } => {
    if (!trr.dorStatus) {
      return {
        message: 'DOR assessment not yet completed',
        action: 'Run AI verification to assess readiness',
        color: 'text-cortex-text-muted'
      };
    }

    const { isReady, score } = trr.dorStatus;
    
    if (isReady) {
      return {
        message: 'Ready to proceed with development',
        action: 'TRR meets all Definition of Ready criteria',
        color: 'text-cortex-success'
      };
    }

    if (score >= 80) {
      return {
        message: 'Nearly ready - minor items to address',
        action: 'Address remaining criteria to proceed',
        color: 'text-cortex-warning'
      };
    }

    if (score >= 60) {
      return {
        message: 'Partially ready - several items need attention',
        action: 'Focus on high-impact unmet criteria first',
        color: 'text-cortex-info'
      };
    }

    return {
      message: 'Not ready - significant work required',
      action: 'Address fundamental requirements before proceeding',
      color: 'text-cortex-error'
    };
  };

  const recommendation = getOverallRecommendation();

  return (
    <div className="space-y-6">
      {/* DOR Status Overview */}
      <div className="cortex-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-cortex-text-primary">
            Definition of Ready Status
          </h3>
          
          <div className="flex items-center space-x-3">
            {onRunAIVerification && (
              <CortexButton
                variant="outline"
                icon="🤖"
                onClick={() => {
                  // TODO: Integrate with terminal command system
                  console.log(`trr dor verify ${trr.id}`);
                }}
              >
                AI Verification
              </CortexButton>
            )}
            
            <CortexButton
              onClick={onRunAIVerification}
              variant="primary"
              icon="🔄"
              disabled={!onRunAIVerification}
            >
              Refresh DOR
            </CortexButton>
          </div>
        </div>

        {/* Status Badge and Score */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 ${
              trr.dorStatus ? getComplianceColor(trr.dorStatus.score) : 'text-cortex-text-muted bg-cortex-bg-hover border-cortex-border-secondary'
            }`}>
              <span className="text-2xl">
                {trr.dorStatus ? getComplianceIcon(trr.dorStatus.isReady, trr.dorStatus.score) : '❓'}
              </span>
              <div>
                <h4 className="font-semibold text-lg">
                  {trr.dorStatus?.isReady ? 'READY' : trr.dorStatus ? 'NOT READY' : 'UNKNOWN'}
                </h4>
                <p className="text-sm opacity-80">
                  {trr.dorStatus ? `${trr.dorStatus.score}% compliant` : 'Assessment needed'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Ring */}
          {trr.dorStatus && (
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-cortex-border-secondary"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - trr.dorStatus.score / 100)}`}
                  className={
                    trr.dorStatus.score >= 90 ? 'text-cortex-success' :
                    trr.dorStatus.score >= 70 ? 'text-cortex-warning' :
                    trr.dorStatus.score >= 50 ? 'text-cortex-info' : 'text-cortex-error'
                  }
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-cortex-text-primary">
                  {trr.dorStatus.score}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Recommendation */}
        <div className={`p-4 rounded-lg border-l-4 ${
          trr.dorStatus?.isReady ? 'bg-cortex-success/5 border-cortex-success' :
          trr.dorStatus?.score >= 70 ? 'bg-cortex-warning/5 border-cortex-warning' :
          'bg-cortex-info/5 border-cortex-info'
        }`}>
          <h5 className={`font-semibold mb-1 ${recommendation.color}`}>
            {recommendation.message}
          </h5>
          <p className="text-sm text-cortex-text-secondary">
            {recommendation.action}
          </p>
        </div>
      </div>

      {/* DOR Criteria Categories */}
      <div className="space-y-4">
        {Object.entries(DOR_CRITERIA).map(([categoryKey, category]) => {
          const isExpanded = expandedSections.includes(categoryKey);
          const categoryScore = calculateCategoryScore(categoryKey);
          const metCount = category.items.filter(item => isCriteriaMet(item)).length;
          
          return (
            <div key={categoryKey} className="cortex-card overflow-hidden">
              {/* Category Header */}
              <div 
                className="p-4 cursor-pointer hover:bg-cortex-bg-hover transition-colors"
                onClick={() => toggleSection(categoryKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <h4 className="font-semibold text-cortex-text-primary">
                        {category.title}
                      </h4>
                      <p className="text-sm text-cortex-text-muted">
                        {metCount} of {category.items.length} criteria met
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Category Score */}
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      categoryScore >= 90 ? 'bg-cortex-success/10 text-cortex-success' :
                      categoryScore >= 70 ? 'bg-cortex-warning/10 text-cortex-warning' :
                      categoryScore >= 50 ? 'bg-cortex-info/10 text-cortex-info' :
                      'bg-cortex-error/10 text-cortex-error'
                    }`}>
                      {categoryScore}%
                    </div>
                    
                    {/* Expand Icon */}
                    <span className={`text-cortex-text-muted transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}>
                      ▼
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-cortex-bg-tertiary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        categoryScore >= 90 ? 'bg-cortex-success' :
                        categoryScore >= 70 ? 'bg-cortex-warning' :
                        categoryScore >= 50 ? 'bg-cortex-info' : 'bg-cortex-error'
                      }`}
                      style={{ width: `${categoryScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Category Criteria */}
              {isExpanded && (
                <div className="border-t border-cortex-border-secondary">
                  <div className="p-4 space-y-3">
                    {category.items.map((criterion, index) => {
                      const isMet = isCriteriaMet(criterion);
                      
                      return (
                        <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                          isMet ? 'bg-cortex-success/5' : 'bg-cortex-error/5'
                        }`}>
                          <span className="text-lg flex-shrink-0 mt-0.5">
                            {isMet ? '✅' : '❌'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${
                              isMet ? 'text-cortex-text-primary' : 'text-cortex-text-secondary'
                            }`}>
                              {criterion}
                            </p>
                            {!isMet && (
                              <p className="text-xs text-cortex-error mt-1">
                                This criterion needs to be addressed
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unmet Criteria Summary */}
      {trr.dorStatus?.unmetCriteria && trr.dorStatus.unmetCriteria.length > 0 && (
        <div className="cortex-card p-6">
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">
            Priority Action Items
          </h3>
          
          <div className="space-y-3">
            {trr.dorStatus.unmetCriteria.map((criterion, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-cortex-error/5 rounded-lg border-l-4 border-cortex-error">
                <span className="text-cortex-error text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="text-cortex-text-primary font-medium">
                    {criterion}
                  </p>
                  <p className="text-sm text-cortex-text-muted mt-1">
                    High priority - required for DOR compliance
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-cortex-info/5 rounded-lg border border-cortex-info">
            <div className="flex items-start space-x-3">
              <span className="text-cortex-info text-lg">💡</span>
              <div>
                <h5 className="font-semibold text-cortex-info">Recommendation</h5>
                <p className="text-sm text-cortex-text-secondary mt-1">
                  Address these {trr.dorStatus.unmetCriteria.length} items before moving the TRR to "in-progress" status. 
                  Consider running AI verification again after making updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {trr.dorStatus && (
        <div className="cortex-card p-6">
          <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">
            AI Insights & Recommendations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="font-medium text-cortex-text-primary">Strengths</h5>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-cortex-success">✓</span>
                  <span className="text-sm text-cortex-text-secondary">
                    Clear business requirements defined
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cortex-success">✓</span>
                  <span className="text-sm text-cortex-text-secondary">
                    Technical approach is well-documented
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cortex-success">✓</span>
                  <span className="text-sm text-cortex-text-secondary">
                    Team resources properly allocated
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h5 className="font-medium text-cortex-text-primary">Areas to Improve</h5>
              <ul className="space-y-2">
                {trr.dorStatus.unmetCriteria.slice(0, 3).map((criterion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-cortex-warning">!</span>
                    <span className="text-sm text-cortex-text-secondary">
                      {criterion}
                    </span>
                  </li>
                ))}
              </ul>
              
              {trr.dorStatus.unmetCriteria.length > 3 && (
                <p className="text-sm text-cortex-text-muted">
                  ...and {trr.dorStatus.unmetCriteria.length - 3} more items
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TRRDORTab;