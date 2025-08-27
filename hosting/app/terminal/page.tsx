'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImprovedTerminal from '../../components/ImprovedTerminal';

export default function TerminalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const authenticated = sessionStorage.getItem('authenticated');
    
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      // Redirect to landing page if not authenticated
      router.push('/');
    }
  }, [router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-cyan-400 font-mono">Initializing terminal...</div>
        </div>
      </div>
    );
  }

  // Show terminal if authenticated
  if (isAuthenticated) {
    return <ImprovedTerminal />;
  }

  // This shouldn't render due to redirect, but just in case
  return null;
}
