'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthGuard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const authenticated = typeof window !== 'undefined' ? sessionStorage.getItem('dc_authenticated') : null;
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/');
    }
  }, [router]);

  return isAuthenticated;
}
