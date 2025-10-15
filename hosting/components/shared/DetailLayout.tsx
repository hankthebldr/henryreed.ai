'use client';

import React from 'react';
import { StatusBadge } from './StatusBadge';
import CortexButton from '../CortexButton';

export interface DetailLayoutAction {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'info' | 'warning' | 'ghost' | 'elevated';
}

export interface DetailLayoutTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface DetailLayoutProps {
  // Header
  title: string;
  id: string;
  status: string;
  priority?: string;
  phase?: string;

  // Actions
  actions?: DetailLayoutAction[];
  onBack?: () => void;

  // Tabs
  tabs: DetailLayoutTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;

  // Additional header content
  headerContent?: React.ReactNode;

  className?: string;
}

export const DetailLayout: React.FC<DetailLayoutProps> = ({
  title,
  id,
  status,
  priority,
  phase,
  actions = [],
  onBack,
  tabs,
  activeTab,
  onTabChange,
  headerContent,
  className = '',
}) => {
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className={`cortex-card ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-cortex-border/40">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-cortex-text-secondary hover:text-cortex-text-primary transition-colors"
                  aria-label="Go back"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </button>
              )}
              <h2 className="text-2xl font-bold text-cortex-text-primary">{title}</h2>
            </div>

            <div className="flex items-center space-x-4 ml-10">
              <span className="text-sm text-cortex-text-secondary">ID: {id}</span>
              <StatusBadge status={status} variant="status" />
              {priority && <StatusBadge status={priority} variant="priority" />}
              {phase && (
                <span className="text-sm text-cortex-text-secondary">
                  Phase: <span className="text-cortex-text-primary font-medium">{phase}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            {actions.map((action, index) => (
              <CortexButton
                key={index}
                onClick={action.onClick}
                variant={action.variant || 'outline'}
                size="sm"
                icon={action.icon}
              >
                {action.label}
              </CortexButton>
            ))}
          </div>
        </div>

        {/* Additional Header Content */}
        {headerContent}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-cortex-bg-secondary rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-cortex-green text-black shadow-lg'
                  : 'text-cortex-text-secondary hover:text-cortex-text-primary hover:bg-cortex-bg-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {currentTab?.content || (
          <div className="text-center py-8 text-cortex-text-secondary">
            Tab content not found
          </div>
        )}
      </div>
    </div>
  );
};
