'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '../../../contexts/AuthContext';
import { Loading } from '../../../components/ui';
import { workspaceConfig, WorkspaceSlug } from '../../capabilities';

const CortexGUIInterface = dynamic(() => import('../../../components/CortexGUIInterface'), {
  ssr: false,
  loading: () => <Loading size="lg" text="Loading workspace experience..." fullscreen />
});

interface WorkspacePageClientProps {
  workspaceKey: WorkspaceSlug;
}


export default function WorkspacePageClient({ workspaceKey }: WorkspacePageClientProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const config = workspaceConfig[workspaceKey];

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (config?.defaultAnchor && !window.location.hash) {
      window.location.hash = config.defaultAnchor;
    }
  }, [config?.defaultAnchor, workspaceKey]);

  if (loading) {
    return <Loading size="lg" text="Verifying workspace access..." fullscreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cortex-bg-primary">
      <div className="border-b border-cortex-border-secondary/40 bg-cortex-bg-secondary/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-2">
          <p className="text-xs uppercase tracking-widest text-cortex-text-muted">Workspace</p>
          <h1 className="text-2xl font-semibold text-cortex-text-primary">{config.title}</h1>
          <p className="text-sm text-cortex-text-secondary max-w-3xl">{config.description}</p>
        </div>
      </div>

      <CortexGUIInterface initialTab={config.tab} />
    </div>
  );
}
