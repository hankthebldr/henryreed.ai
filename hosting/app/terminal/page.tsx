'use client';

import ImprovedTerminal from '../../components/ImprovedTerminal';
// Phase 12 Recovery: Unified terminal architecture - using canonical ImprovedTerminal
// Previous: UnifiedTerminal (deprecated, see docs/archive/terminal/DEPRECATED.md)
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
    return <ImprovedTerminal />;
  }

  return null;
}
