'use client';

import dynamic from 'next/dynamic';
import { useAuthGuard } from '../../../hooks/useAuthGuard';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TRR } from '../../../components/TRRManagement';

// Mock TRR database - in real app, this would come from an API
import { trrDatabase } from '../../../components/TRRManagement';

const TRRDetailView = dynamic(() => import('../../../components/TRRDetailView'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-cortex-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="cortex-spinner mx-auto mb-4"></div>
        <div className="text-cortex-text-primary font-mono">Loading TRR Details...</div>
      </div>
    </div>
  ),
});

export default function TRRDetailPage() {
  const isAuthenticated = useAuthGuard();
  const params = useParams();
  const router = useRouter();
  const [trr, setTRR] = useState<TRR | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      // Find TRR by ID
      const foundTRR = trrDatabase.find(t => t.id === params.id);
      setTRR(foundTRR || null);
      setLoading(false);
    }
  }, [params?.id]);

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-cortex-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="cortex-spinner mx-auto mb-4"></div>
          <div className="text-cortex-text-primary font-mono">Loading TRR Details...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!trr) {
    return (
      <div className="min-h-screen bg-cortex-bg-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-cortex-text-primary mb-4">TRR Not Found</h1>
            <p className="text-cortex-text-secondary mb-6">
              The requested TRR (ID: {params?.id}) could not be found.
            </p>
            <button
              onClick={() => router.push('/trr')}
              className="btn-cortex-primary"
            >
              ← Back to TRR List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cortex-bg-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header with navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <button
                  onClick={() => router.push('/trr')}
                  className="text-cortex-text-accent hover:text-cortex-green transition-colors flex items-center space-x-2"
                >
                  <span>←</span>
                  <span>Back to TRR List</span>
                </button>
                <span className="text-cortex-text-muted">|</span>
                <span className="font-mono text-sm text-cortex-text-accent">{trr.id}</span>
              </div>
              <h1 className="text-3xl font-bold text-cortex-text-primary mb-2">
                {trr.title}
              </h1>
              <p className="text-cortex-text-secondary">
                Technical Requirements Review - Detailed View
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                trr.status === 'completed' || trr.status === 'validated' ? 'bg-cortex-success/10 text-cortex-success' :
                trr.status === 'in-progress' ? 'bg-cortex-warning/10 text-cortex-warning' :
                trr.status === 'draft' || trr.status === 'pending' ? 'bg-cortex-info/10 text-cortex-info' :
                'bg-cortex-error/10 text-cortex-error'
              }`}>
                {trr.status.replace('-', ' ').toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                trr.priority === 'critical' ? 'bg-cortex-error/10 text-cortex-error' :
                trr.priority === 'high' ? 'bg-cortex-warning/10 text-cortex-warning' :
                trr.priority === 'medium' ? 'bg-cortex-info/10 text-cortex-info' :
                'bg-cortex-success/10 text-cortex-success'
              }`}>
                {trr.priority.toUpperCase()} PRIORITY
              </span>
            </div>
          </div>
        </div>

        {/* TRR Detail Component */}
        <TRRDetailView trr={trr} />
      </div>
    </div>
  );
}