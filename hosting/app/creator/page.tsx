'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useAuthGuard } from '../../hooks/useAuthGuard';

const ContentCreatorManager = dynamic(() => import('../../components/ContentCreatorManager'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-cortex-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="cortex-spinner mb-4"></div>
        <div className="text-cortex-text-secondary">Loading Content Creator...</div>
      </div>
    </div>
  ),
});

const CreatorPage: React.FC = () => {
  const { isAuthenticated, user } = useAuthGuard();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cortex-bg-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cortex-text-primary mb-4">Authentication Required</h1>
          <p className="text-cortex-text-secondary">Please log in to access the Content Creator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cortex-bg-primary">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="cortex-spinner mb-4"></div>
              <div className="text-cortex-text-secondary">Initializing Creator...</div>
            </div>
          </div>
        }>
          <ContentCreatorManager />
        </Suspense>
      </div>
    </div>
  );
};

export default CreatorPage;
