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
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const authenticated = sessionStorage.getItem('dc_authenticated');
    const userInfo = sessionStorage.getItem('dc_user');
    
    if (authenticated === 'true') {
      setIsAuthenticated(true);
      if (userInfo) {
        try {
          const parsedUser = JSON.parse(userInfo);
          setUser({
            id: parsedUser.id || 'demo',
            name: parsedUser.username || parsedUser.name || 'Demo User',
            email: parsedUser.email || 'demo@example.com'
          });
        } catch (e) {
          console.warn('Failed to parse user info:', e);
          setUser({ id: 'demo', name: 'Demo User', email: 'demo@example.com' });
        }
      } else {
        setUser({ id: 'demo', name: 'Demo User', email: 'demo@example.com' });
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      // Add delay to prevent redirect loops
      const timer = setTimeout(() => {
        router.push('/');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [router]);

  return { isAuthenticated, user };
}
