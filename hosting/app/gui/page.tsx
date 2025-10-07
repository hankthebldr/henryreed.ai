'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const CortexGUIInterface = dynamic(() => import('../../components/CortexGUIInterface'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <div className="text-cyan-400 font-mono">Loading Cortex DC Portal...</div>
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-cyan-400 font-mono">Initializing Cortex DC Portal...</div>
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

