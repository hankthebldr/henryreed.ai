'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UIVersionGate } from '../providers';

import { Loading } from '../../components/ui';

// V1 Legacy Component
const CortexGUIInterface = dynamic(() => import('../../components/CortexGUIInterface'), {
  ssr: false,
  loading: () => <Loading size="lg" text="Loading Cortex DC Portal..." fullscreen />
});

// V2 Modern Component
const DashboardV2 = dynamic(() => import('../../components/DashboardV2').then(mod => ({ default: mod.DashboardV2 })), {
  ssr: false,
  loading: () => <Loading size="lg" text="Loading Modern Dashboard..." fullscreen />
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
    return <Loading size="lg" text="Verifying your credentials..." fullscreen />;
  }

  // Show GUI if authenticated
  if (user) {
    return (
      <UIVersionGate
        v1Component={
          /* V1_LEGACY: Original CortexGUIInterface component */
          <CortexGUIInterface />
        }
        v2Component={
          /* V2_MODERN: New DashboardV2 with Tremor analytics and Chakra UI */
          <DashboardV2 />
        }
      />
    );
  }

  // This should not render if useEffect redirects properly
  return null;
}

