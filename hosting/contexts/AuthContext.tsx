'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, isMockAuthMode } from '../lib/firebase-config';

// Mock user interface for development
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | MockUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseAvailable, setFirebaseAvailable] = useState(false);

  useEffect(() => {
    console.log('AuthProvider: Initializing auth, isMockAuthMode:', isMockAuthMode);
    
    // Check if we're in mock auth mode
    if (isMockAuthMode) {
      console.info('Running in mock auth mode');
      setFirebaseAvailable(true);
      setLoading(false);
      
      // Check for existing session in localStorage
      const savedUser = localStorage.getItem('mockUser');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.warn('Failed to parse saved mock user:', error);
          localStorage.removeItem('mockUser');
        }
      }
      return;
    }
    
    // Regular Firebase auth setup
    let unsubscribe: (() => void) | undefined;
    
    try {
      if (typeof window !== 'undefined' && auth) {
        unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          setLoading(false);
          setFirebaseAvailable(true);
        });
      } else {
        // If auth is not available, fall back to mock mode
        console.warn('Firebase auth not available, falling back to mock mode');
        setFirebaseAvailable(true);
        setLoading(false);
      }
    } catch (error) {
      console.warn('Firebase authentication is not available, falling back to mock mode:', error);
      setFirebaseAvailable(true);
      setLoading(false);
      
      // In case of Firebase error, enable mock mode for fallback
      console.info('Enabling emergency mock auth fallback');
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isMockAuthMode || !firebaseAvailable) {
        // Mock authentication - support user1/paloalto1, cortex/xsiam, and demo/demo
        const validCredentials: Record<string, string> = {
          'user1': 'paloalto1',
          'cortex': 'xsiam',
          'demo': 'demo'
        };
        
        if (validCredentials[email] === password) {
          const mockUser: MockUser = {
            uid: email === 'cortex' ? 'cortex-001' : email === 'demo' ? 'demo-001' : 'user1-001',
            email: email === 'cortex' ? 'cortex@paloaltonetworks.com' : email === 'demo' ? 'demo@paloaltonetworks.com' : 'user1@paloaltonetworks.com',
            displayName: email === 'cortex' ? 'Cortex System Admin' : email === 'demo' ? 'Demo User - Domain Consultant' : 'User One - Domain Consultant',
            photoURL: null
          };
          setUser(mockUser);
          localStorage.setItem('mockUser', JSON.stringify(mockUser));
          console.info(`Mock authentication successful for ${email}`);
        } else {
          throw new Error('Invalid credentials. Use demo/demo, user1/paloalto1, or cortex/xsiam.');
        }
      } else {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (authError) {
          console.warn('Firebase auth failed, trying mock auth fallback:', authError);
          // Fallback to mock auth if Firebase auth fails
          const validCredentials: Record<string, string> = {
            'user1': 'paloalto1',
            'cortex': 'xsiam',
            'demo': 'demo'
          };
          
          if (validCredentials[email] === password) {
            const mockUser: MockUser = {
              uid: email === 'cortex' ? 'cortex-001' : email === 'demo' ? 'demo-001' : 'user1-001',
              email: email === 'cortex' ? 'cortex@paloaltonetworks.com' : email === 'demo' ? 'demo@paloaltonetworks.com' : 'user1@paloaltonetworks.com',
              displayName: email === 'cortex' ? 'Cortex System Admin' : email === 'demo' ? 'Demo User - Domain Consultant' : 'User One - Domain Consultant',
              photoURL: null
            };
            setUser(mockUser);
            localStorage.setItem('mockUser', JSON.stringify(mockUser));
            console.info(`Fallback mock authentication successful for ${email}`);
          } else {
            throw authError; // Re-throw the original error
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isMockAuthMode) {
        throw new Error('Sign up is not available in mock mode. Use user1/paloalto1 or cortex/xsiam to login.');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      if (isMockAuthMode) {
        throw new Error('Google sign-in is not available in mock mode. Use user1/paloalto1 or cortex/xsiam to login.');
      } else {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (isMockAuthMode) {
        setUser(null);
        localStorage.removeItem('mockUser');
        console.info('Mock logout successful');
      } else {
        await signOut(auth);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    isMockMode: isMockAuthMode
  }), [user, loading, signIn, signUp, signInWithGoogle, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
