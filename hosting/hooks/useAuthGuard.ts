'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthGuardReturn {
  isAuthenticated: boolean | null;
  user: AuthUser | null;
}

export function useAuthGuard(): AuthGuardReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const authenticated = typeof window !== 'undefined' ? sessionStorage.getItem('dc_authenticated') : null;
    const userInfo = typeof window !== 'undefined' ? sessionStorage.getItem('dc_user') : null;
    
    if (authenticated === 'true') {
      setIsAuthenticated(true);
      if (userInfo) {
        try {
          setUser(JSON.parse(userInfo));
        } catch (e) {
          setUser({ id: 'demo', name: 'Demo User', email: 'demo@example.com' });
        }
      } else {
        setUser({ id: 'demo', name: 'Demo User', email: 'demo@example.com' });
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      router.push('/');
    }
  }, [router]);

  return { isAuthenticated, user };
}
