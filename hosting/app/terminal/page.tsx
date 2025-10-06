'use client';

import UnifiedTerminal from '../../components/UnifiedTerminal';
// ActivityProvider will be added when the context is implemented
import { useAuthGuard } from '../../hooks/useAuthGuard';

export default function TerminalPage() {
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
    return <UnifiedTerminal />;
  }

  return null;
}
