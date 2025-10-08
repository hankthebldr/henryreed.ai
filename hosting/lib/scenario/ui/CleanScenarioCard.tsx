'use client';

import React from 'react';
import { EnhancedScenarioConfig, PANWProduct, BusinessValueTag } from '../registry';

interface CleanScenarioCardProps {
  scenario: EnhancedScenarioConfig;
  variant?: 'compact' | 'detailed' | 'minimal';
  onClick?: (scenario: EnhancedScenarioConfig) => void;
  showActions?: boolean;
}

export function CleanScenarioCard({ 
  scenario, 
  variant = 'compact', 
  onClick, 
  showActions = false 
}: CleanScenarioCardProps) {
  
  const getBusinessValueColor = (impact: number): string => {
    if (impact >= 4) return 'text-emerald-400 bg-emerald-500/10';
    if (impact >= 3) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-blue-400 bg-blue-500/10';
  };

  const getComplexityColor = (complexity: string): string => {
    switch (complexity) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-orange-400';
      case 'expert': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (variant === 'minimal') {
    return (
      <div 
        className={`group p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-all cursor-pointer ${onClick ? 'hover:scale-[1.01]' : ''}`}
        onClick={() => onClick?.(scenario)}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-white truncate group-hover:text-blue-300 transition-colors">
              {scenario.name}
            </h3>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
              {scenario.description}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getBusinessValueColor(scenario.businessValue.businessImpact)}`}>
              {scenario.businessValue.businessImpact}/5
            </span>
            <span className={`text-xs ${getComplexityColor(scenario.complexity)}`}>
              {scenario.complexity}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div 
        className={`group p-4 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/50 hover:border-blue-500/30 transition-all cursor-pointer ${onClick ? 'hover:scale-[1.02]' : ''}`}
        onClick={() => onClick?.(scenario)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors">
                {scenario.name}
              </h3>
              <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">
                v{scenario.version}
              </span>
            </div>
            <p className="text-sm text-gray-300 line-clamp-2">
              {scenario.description}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getBusinessValueColor(scenario.businessValue.businessImpact)}`}>
              Impact {scenario.businessValue.businessImpact}/5
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <span className="text-gray-400">
              <span className="text-blue-400">{scenario.panwProducts.length}</span> products
            </span>
            <span className="text-gray-400">
              <span className="text-purple-400">{scenario.mitreTechniques.length}</span> techniques
            </span>
            <span className={`${getComplexityColor(scenario.complexity)} font-medium`}>
              {scenario.complexity}
            </span>
          </div>
          <div className="text-gray-500">
            {scenario.estimatedDuration.setup + scenario.estimatedDuration.execution}m
          </div>
        </div>

        {showActions && (
          <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between">
            <div className="flex space-x-2">
              {scenario.providers.slice(0, 3).map(provider => (
                <span key={provider} className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">
                  {provider}
                </span>
              ))}
            </div>
            <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              Deploy →
            </button>
          </div>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className="group p-6 rounded-xl bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/50 hover:border-blue-500/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
              {scenario.name}
            </h3>
            <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
              v{scenario.version}
            </span>
            <span className={`text-xs px-2 py-1 rounded font-medium ${getBusinessValueColor(scenario.businessValue.businessImpact)}`}>
              Impact {scenario.businessValue.businessImpact}/5
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            {scenario.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <h4 className="text-sm font-semibold text-blue-300 mb-2">Business Value</h4>
          <div className="space-y-1">
            <div className="text-sm text-green-400 font-medium">
              {scenario.businessValue.primaryValue.replace('-', ' ')}
            </div>
            <div className="text-xs text-gray-400">
              ROI: {scenario.businessValue.roiTimeframe}
            </div>
            <div className="text-xs text-gray-500">
              {scenario.businessValue.quantifiableMetrics.slice(0, 1).map((metric, i) => (
                <div key={i}>• {metric}</div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-purple-300 mb-2">PANW Products</h4>
          <div className="space-y-1">
            {scenario.panwProducts.slice(0, 3).map((product, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-gray-300">{product.product}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  product.role === 'primary' ? 'bg-green-600/20 text-green-400' :
                  product.role === 'secondary' ? 'bg-blue-600/20 text-blue-400' :
                  'bg-gray-600/20 text-gray-400'
                }`}>
                  {product.role}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-red-300 mb-2">MITRE Techniques</h4>
          <div className="space-y-1">
            {scenario.mitreTechniques.slice(0, 3).map((technique, i) => (
              <div key={i} className="text-xs">
                <div className="text-yellow-400 font-mono">{technique.id}</div>
                <div className="text-gray-300 truncate">{technique.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">
            <span className={`${getComplexityColor(scenario.complexity)} font-medium`}>{scenario.complexity}</span> complexity
          </span>
          <span className="text-gray-400">
            <span className="text-blue-400">{scenario.estimatedDuration.setup + scenario.estimatedDuration.execution}</span> minutes
          </span>
          <span className="text-gray-400">
            <span className="text-green-400">{scenario.providers.length}</span> providers
          </span>
        </div>
        <div className="text-gray-500">
          Updated {new Date(scenario.lastUpdated).toLocaleDateString()}
        </div>
      </div>

      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-700/30 flex items-center justify-between">
          <div className="flex space-x-2">
            {scenario.providers.map(provider => (
              <span key={provider} className="px-3 py-1 bg-gray-700/30 text-gray-300 text-xs rounded-full">
                {provider}
              </span>
            ))}
          </div>
          <div className="flex space-x-3">
            <button className="px-3 py-1 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-400/50 rounded transition-colors">
              View Details
            </button>
            <button className="px-3 py-1 text-xs text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 rounded transition-colors">
              Deploy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ScenarioGridProps {
  scenarios: EnhancedScenarioConfig[];
  variant?: 'compact' | 'detailed' | 'minimal';
  onScenarioClick?: (scenario: EnhancedScenarioConfig) => void;
  showActions?: boolean;
  emptyState?: React.ReactNode;
}

export function ScenarioGrid({ 
  scenarios, 
  variant = 'compact', 
  onScenarioClick, 
  showActions = false,
  emptyState
}: ScenarioGridProps) {
  if (scenarios.length === 0) {
    return emptyState || (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">No scenarios found</div>
        <div className="text-gray-500 text-sm">Try adjusting your filters or search criteria</div>
      </div>
    );
  }

  const getGridClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3';
      case 'compact':
        return 'grid grid-cols-1 lg:grid-cols-2 gap-4';
      case 'detailed':
        return 'space-y-6';
      default:
        return 'grid grid-cols-1 lg:grid-cols-2 gap-4';
    }
  };

  return (
    <div className={getGridClasses()}>
      {scenarios.map((scenario) => (
        <CleanScenarioCard
          key={scenario.id}
          scenario={scenario}
          variant={variant}
          onClick={onScenarioClick}
          showActions={showActions}
        />
      ))}
    </div>
  );
}