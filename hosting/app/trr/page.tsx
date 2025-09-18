'use client';

import dynamic from 'next/dynamic';
import { useAuthGuard } from '../../hooks/useAuthGuard';

const TRRManagement = dynamic(() => import('../../components/TRRManagement').then(mod => ({ default: mod.TRRManagement })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-cortex-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="cortex-spinner mx-auto mb-4"></div>
        <div className="text-cortex-text-primary font-mono">Loading TRR Management...</div>
      </div>
    </div>
  ),
});

export default function TRRPage() {
  const isAuthenticated = useAuthGuard();

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-cortex-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="cortex-spinner mx-auto mb-4"></div>
          <div className="text-cortex-text-primary font-mono">Initializing TRR System...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-cortex-bg-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-cortex-text-primary mb-2">
              Technical Requirements Review
            </h1>
            <p className="text-cortex-text-secondary">
              Manage and track technical requirements across all projects and engagements.
            </p>
          </div>
          <TRRManagement />
        </div>
      </div>
    );
  }

  return null;
}