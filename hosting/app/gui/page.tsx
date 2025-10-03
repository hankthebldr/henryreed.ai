'use client';

import dynamic from 'next/dynamic';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { ActivityProvider } from '../../hooks/useActivityTracking';
import { userManagementService } from '../../lib/user-management';

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
  const isAuthenticated = useAuthGuard();

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-cyan-400 font-mono">Initializing Cortex DC Portal...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Get demo user for activity tracking
    const demoUser = userManagementService.getAllUsers()[0];
    const userId = demoUser?.id || 'demo_user';
    const sessionId = `session_${Date.now()}`;
    
    return (
      <ActivityProvider userId={userId} sessionId={sessionId}>
        <CortexGUIInterface />
      </ActivityProvider>
    );
  }

  return null;
}

