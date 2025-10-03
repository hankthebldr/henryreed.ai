'use client';

import React, { useState, useMemo } from 'react';
import { Portfolio, Project } from '../../types/trr';
import CortexButton from '../CortexButton';

interface PortfolioSidebarProps {
  portfolios: Portfolio[];
  projects: Project[];
  selectedPortfolioId: string | null;
  selectedProjectId: string | null;
  onSelectPortfolio: (portfolioId: string | null) => void;
  onSelectProject: (projectId: string | null) => void;
  trrCounts: Record<string, number>; // Project/Portfolio ID -> TRR count
  onCreatePortfolio?: () => void;
  onCreateProject?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  compact?: boolean;
}

export const PortfolioSidebar: React.FC<PortfolioSidebarProps> = ({
  portfolios,
  projects,
  selectedPortfolioId,
  selectedProjectId,
  onSelectPortfolio,
  onSelectProject,
  trrCounts,
  onCreatePortfolio,
  onCreateProject,
  searchQuery = '',
  onSearchChange,
  compact = false,
}) => {
  const [expandedPortfolios, setExpandedPortfolios] = useState<Set<string>>(
    new Set(selectedPortfolioId ? [selectedPortfolioId] : [])
  );

  // Filter portfolios and projects based on search
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) {
      return { portfolios, projects };
    }

    const filteredPortfolios = portfolios.filter(portfolio =>
      portfolio.name.toLowerCase().includes(query) ||
      portfolio.description?.toLowerCase().includes(query)
    );

    const filteredProjects = projects.filter(project =>
      project.name.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query)
    );

    return {
      portfolios: filteredPortfolios,
      projects: filteredProjects
    };
  }, [portfolios, projects, searchQuery]);

  // Group projects by portfolio
  const projectsByPortfolio = useMemo(() => {
    const grouped: Record<string, Project[]> = {};
    filteredData.projects.forEach(project => {
      if (!grouped[project.portfolioId]) {
        grouped[project.portfolioId] = [];
      }
      grouped[project.portfolioId].push(project);
    });
    return grouped;
  }, [filteredData.projects]);

  // Calculate portfolio TRR counts
  const portfolioTrrCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.portfolios.forEach(portfolio => {
      const portfolioProjects = projectsByPortfolio[portfolio.id] || [];
      counts[portfolio.id] = portfolioProjects.reduce((sum, project) => {
        return sum + (trrCounts[project.id] || 0);
      }, 0);
    });
    return counts;
  }, [filteredData.portfolios, projectsByPortfolio, trrCounts]);

  const togglePortfolioExpansion = (portfolioId: string) => {
    setExpandedPortfolios(prev => {
      const newSet = new Set(prev);
      if (newSet.has(portfolioId)) {
        newSet.delete(portfolioId);
      } else {
        newSet.add(portfolioId);
      }
      return newSet;
    });
  };

  const handlePortfolioSelect = (portfolio: Portfolio) => {
    // Toggle expansion when selecting
    togglePortfolioExpansion(portfolio.id);
    
    // Select portfolio
    if (selectedPortfolioId === portfolio.id) {
      onSelectPortfolio(null); // Deselect if already selected
      onSelectProject(null);
    } else {
      onSelectPortfolio(portfolio.id);
      onSelectProject(null); // Clear project selection
    }
  };

  const handleProjectSelect = (project: Project) => {
    onSelectProject(selectedProjectId === project.id ? null : project.id);
    if (selectedPortfolioId !== project.portfolioId) {
      onSelectPortfolio(project.portfolioId); // Ensure parent portfolio is selected
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-cortex-green/10 text-cortex-green';
      case 'planning': return 'bg-cortex-info/10 text-cortex-info';
      case 'completed': return 'bg-cortex-text-muted/10 text-cortex-text-muted';
      case 'on-hold': return 'bg-cortex-warning/10 text-cortex-warning';
      default: return 'bg-cortex-bg-tertiary text-cortex-text-muted';
    }
  };

  return (
    <div className={`flex flex-col h-full ${compact ? 'w-64' : 'w-80'}`}>
      {/* Header */}
      <div className="p-4 border-b border-cortex-border-secondary">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-cortex-text-primary">
            {compact ? 'Navigation' : 'Portfolios & Projects'}
          </h3>
          {!compact && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-cortex-text-muted">
                {filteredData.portfolios.length}P / {filteredData.projects.length}J
              </span>
            </div>
          )}
        </div>

        {/* Search */}
        {onSearchChange && (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search portfolios & projects..."
              className="w-full px-3 py-2 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-sm text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
            />
            <div className="absolute right-2 top-2 text-cortex-text-muted">
              🔍
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Tree */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* All Projects View */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
            !selectedPortfolioId && !selectedProjectId 
              ? 'bg-cortex-green/10 text-cortex-green border border-cortex-green/20' 
              : 'hover:bg-cortex-bg-hover'
          }`}
          onClick={() => {
            onSelectPortfolio(null);
            onSelectProject(null);
          }}
        >
          <div className="flex items-center space-x-3">
            <span className="text-lg">🏠</span>
            <span className="font-medium">All Projects</span>
          </div>
          <span className="text-xs px-2 py-1 bg-cortex-bg-tertiary rounded-full text-cortex-text-muted">
            {Object.values(trrCounts).reduce((sum, count) => sum + count, 0)}
          </span>
        </div>

        {/* Portfolio List */}
        {filteredData.portfolios.map(portfolio => {
          const portfolioProjects = projectsByPortfolio[portfolio.id] || [];
          const isExpanded = expandedPortfolios.has(portfolio.id);
          const isSelected = selectedPortfolioId === portfolio.id;
          
          return (
            <div key={portfolio.id} className="space-y-1">
              {/* Portfolio Item */}
              <div
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected && !selectedProjectId
                    ? 'bg-cortex-green/10 text-cortex-green border border-cortex-green/20'
                    : 'hover:bg-cortex-bg-hover'
                }`}
                onClick={() => handlePortfolioSelect(portfolio)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    {portfolioProjects.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePortfolioExpansion(portfolio.id);
                        }}
                        className="text-cortex-text-muted hover:text-cortex-text-secondary p-1"
                      >
                        {isExpanded ? '📂' : '📁'}
                      </button>
                    )}
                    {portfolioProjects.length === 0 && (
                      <span className="text-lg w-6 text-center">💼</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-cortex-text-primary truncate">
                      {portfolio.name}
                    </div>
                    {!compact && portfolio.description && (
                      <div className="text-xs text-cortex-text-muted truncate">
                        {portfolio.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 bg-cortex-bg-tertiary rounded-full text-cortex-text-muted">
                    {portfolioProjects.length}
                  </span>
                  {!compact && (
                    <span className="text-xs px-2 py-1 bg-cortex-info/10 text-cortex-info rounded-full">
                      {portfolioTrrCounts[portfolio.id] || 0} TRR
                    </span>
                  )}
                </div>
              </div>

              {/* Projects List */}
              {isExpanded && portfolioProjects.length > 0 && (
                <div className="ml-6 space-y-1">
                  {portfolioProjects.map(project => (
                    <div
                      key={project.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedProjectId === project.id
                          ? 'bg-cortex-green/10 text-cortex-green border border-cortex-green/20'
                          : 'hover:bg-cortex-bg-hover'
                      }`}
                      onClick={() => handleProjectSelect(project)}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <span className="text-sm">🔖</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-cortex-text-primary truncate text-sm">
                            {project.name}
                          </div>
                          {!compact && project.description && (
                            <div className="text-xs text-cortex-text-muted truncate">
                              {project.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getProjectStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        {!compact && (
                          <span className="text-xs px-2 py-0.5 bg-cortex-bg-tertiary rounded-full text-cortex-text-muted">
                            {trrCounts[project.id] || 0}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty State */}
        {filteredData.portfolios.length === 0 && (
          <div className="text-center py-8 text-cortex-text-muted">
            {searchQuery ? (
              <div>
                <div className="text-2xl mb-2">🔍</div>
                <div>No portfolios found matching "{searchQuery}"</div>
              </div>
            ) : (
              <div>
                <div className="text-2xl mb-2">💼</div>
                <div>No portfolios available</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!compact && (onCreatePortfolio || onCreateProject) && (
        <div className="p-4 border-t border-cortex-border-secondary space-y-2">
          {onCreatePortfolio && (
            <CortexButton
              onClick={onCreatePortfolio}
              variant="outline"
              size="sm"
              icon="➕"
              className="w-full justify-start"
            >
              New Portfolio
            </CortexButton>
          )}
          {onCreateProject && selectedPortfolioId && (
            <CortexButton
              onClick={onCreateProject}
              variant="outline"
              size="sm"
              icon="🔖"
              className="w-full justify-start"
            >
              New Project
            </CortexButton>
          )}
        </div>
      )}
    </div>
  );
};

export default PortfolioSidebar;