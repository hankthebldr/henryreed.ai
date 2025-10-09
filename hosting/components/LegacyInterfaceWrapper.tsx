'use client';

import React from 'react';
import { useAppState } from '../contexts/AppStateContext';
import EnhancedManualCreationGUI from './EnhancedManualCreationGUI';
import { TRRManagement } from './TRRManagement';
import CortexButton from './CortexButton';

interface LegacyInterfaceWrapperProps {
  mode: string;
  onBack: () => void;
}

const LegacyInterfaceWrapper: React.FC<LegacyInterfaceWrapperProps> = ({ mode, onBack }) => {
  const { state, actions } = useAppState();

  const renderLegacyComponent = () => {
    switch (mode) {
      case 'dashboard':
        return <EnhancedPOVDashboard />;
      case 'trr':
        return <TRRManagement />;
      case 'ai':
        return <EnhancedAIInsights />;
      default:
        return (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔧</div>
            <div className="text-lg text-gray-300">Legacy Mode</div>
            <div className="text-sm text-cortex-text-secondary mt-2">Mode: {mode}</div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Legacy Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">
                Legacy Interface - {mode.toUpperCase()}
              </h1>
              <p className="text-cortex-text-secondary mt-1">
                Classic interface for backwards compatibility
              </p>
            </div>
            
            <CortexButton
              variant="outline"
              icon="←"
              onClick={onBack}
              ariaLabel="Return to enhanced interface"
            >
              Enhanced Interface
            </CortexButton>
          </div>
        </div>
      </header>

      {/* Legacy Content */}
      <main className="flex-1 overflow-auto p-6">
        {renderLegacyComponent()}
      </main>
    </div>
  );
};

// Define the legacy components for backwards compatibility
const EnhancedPOVDashboard = () => (
  <div className="text-center py-12">
    <div className="text-4xl mb-4">📊</div>
    <div className="text-lg text-gray-300">Legacy POV Dashboard</div>
    <div className="text-sm text-cortex-text-secondary mt-2">Classic dashboard interface</div>
  </div>
);

const EnhancedAIInsights = () => (
  <div className="text-center py-12">
    <div className="text-4xl mb-4">🤖</div>
    <div className="text-lg text-gray-300">Legacy AI Insights</div>
    <div className="text-sm text-cortex-text-secondary mt-2">Classic AI interface</div>
  </div>
);

export default LegacyInterfaceWrapper;