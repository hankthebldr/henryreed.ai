'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

import { Loading } from '../../components/ui';

const CortexGUIInterface = dynamic(() => import('../../components/CortexGUIInterface'), {
  ssr: false,
  loading: () => <Loading size="lg" text="Loading Cortex DC Portal..." fullscreen />
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
    return <CortexGUIInterface />;
  }

  // This should not render if useEffect redirects properly
  return null;
}

