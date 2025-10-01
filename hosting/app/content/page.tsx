'use client';

import dynamic from 'next/dynamic';
import { useAuthGuard } from '../../hooks/useAuthGuard';

const EnhancedContentCreator = dynamic(() => import('../../components/EnhancedContentCreator').then((mod) => ({ default: mod.EnhancedContentCreator })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-cortex-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="cortex-spinner mx-auto mb-4"></div>
        <div className="text-cortex-text-primary font-mono">Loading Content Creator...</div>
      </div>
    </div>
  ),
});

export default function ContentPage() {
  const isAuthenticated = useAuthGuard();

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-cortex-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="cortex-spinner mx-auto mb-4"></div>
          <div className="text-cortex-text-primary font-mono">Initializing Content System...</div>
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
              Content Creation Studio
            </h1>
            <p className="text-cortex-text-secondary">
              Create, manage, and organize content templates and instances for your engagements.
            </p>
          </div>
          <EnhancedContentCreator />
        </div>
      </div>
    );
  }

  return null;
}