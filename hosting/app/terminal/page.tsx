'use client';

import ImprovedTerminal from '../../components/ImprovedTerminal';
// Phase 12 Recovery: Unified terminal architecture - using canonical ImprovedTerminal
// Previous: UnifiedTerminal (deprecated, see docs/archive/terminal/DEPRECATED.md)
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { Loading } from '../../components/ui';

export default function TerminalPage() {
  const isAuthenticated = useAuthGuard();

  if (isAuthenticated === null) {
    return <Loading size="lg" text="Initializing Cortex DC Portal..." fullscreen />;
  }

  if (isAuthenticated) {
    return <ImprovedTerminal />;
  }

  return null;
}
