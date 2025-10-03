'use client';

import React from 'react';
import CortexButton from './CortexButton';

interface DomainConsultantWorkspaceProps {
  selectedEngagement?: string;
  selectedTRR?: string;
}

export const DomainConsultantWorkspace: React.FC<DomainConsultantWorkspaceProps> = ({
  selectedEngagement,
  selectedTRR
}) => {
  return (
    <div className="space-y-6">
      <div className="cortex-card p-6">
        <h1 className="text-3xl font-bold text-cortex-text-primary mb-4">
          Domain Consultant Workspace
        </h1>
        <p className="text-cortex-text-secondary mb-6">
          This component is temporarily simplified. The original component had formatting issues 
          that need to be resolved in a future update.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-info mb-2">5</div>
            <div className="text-sm text-cortex-text-secondary">Active Engagements</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-green mb-2">12</div>
            <div className="text-sm text-cortex-text-secondary">Completed TRRs</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-warning mb-2">8</div>
            <div className="text-sm text-cortex-text-secondary">Pending TRRs</div>
          </div>
          <div className="cortex-card p-4 text-center">
            <div className="text-2xl font-bold text-cortex-error mb-2">3</div>
            <div className="text-sm text-cortex-text-secondary">High Risk</div>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-cortex-text-primary">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <CortexButton 
              variant="primary" 
              icon="📝"
              onClick={() => console.log('Create TRR')}
            >
              Create TRR
            </CortexButton>
            <CortexButton 
              variant="outline" 
              icon="📊"
              onClick={() => console.log('View Reports')}
            >
              View Reports
            </CortexButton>
            <CortexButton 
              variant="outline" 
              icon="🎯"
              onClick={() => console.log('New POV')}
            >
              New POV
            </CortexButton>
            <CortexButton 
              variant="outline" 
              icon="📅"
              onClick={() => console.log('Schedule Demo')}
            >
              Schedule Demo
            </CortexButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainConsultantWorkspace;