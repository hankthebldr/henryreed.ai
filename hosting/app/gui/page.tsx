'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const CortexGUIInterface = dynamic(() => import('../../components/CortexGUIInterface'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-cortex-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cortex-border-muted border-t-cortex-orange mx-auto mb-6"></div>
        <div className="text-cortex-text-primary font-semibold mb-2">Loading Dashboard</div>
        <div className="text-cortex-text-muted text-sm">Initializing Cortex DC Portal...</div>
        <div className="mt-4 w-64 bg-cortex-bg-tertiary rounded-full h-2 mx-auto">
          <div className="bg-cortex-orange h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
        </div>
      </div>
    </div>
  ),
});

export default function GUIPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-cortex-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cortex-border-muted border-t-cortex-orange mx-auto mb-6"></div>
          <div className="text-cortex-text-primary font-semibold mb-2">Authenticating</div>
          <div className="text-cortex-text-muted text-sm">Verifying your credentials...</div>
        </div>
      </div>
    );
  }

  // Show GUI if authenticated
  if (user) {
    return <CortexGUIInterface />;
  }

  // This should not render if useEffect redirects properly
  return null;
}

