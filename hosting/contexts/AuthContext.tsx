'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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
    try {
      if (typeof window !== 'undefined' && auth) {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          setLoading(false);
          setFirebaseAvailable(true);
        });
        return () => unsubscribe();
      }
    } catch (error) {
      console.warn('Firebase authentication is not available:', error);
      setFirebaseAvailable(false);
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isMockAuthMode) {
        // Mock authentication - check for cortex/xsiam credentials
        const devUsername = process.env.NEXT_PUBLIC_DEV_USERNAME || 'cortex';
        const devPassword = process.env.NEXT_PUBLIC_DEV_PASSWORD || 'xsiam';
        
        if (email === devUsername && password === devPassword) {
          const mockUser: MockUser = {
            uid: 'mock-user-id',
            email: 'cortex@paloaltonetworks.com',
            displayName: 'Cortex Domain Consultant',
            photoURL: null
          };
          setUser(mockUser);
          localStorage.setItem('mockUser', JSON.stringify(mockUser));
          console.info('Mock authentication successful');
        } else {
          throw new Error('Invalid credentials. Use cortex/xsiam for development.');
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isMockAuthMode) {
        throw new Error('Sign up is not available in mock mode. Use cortex/xsiam to login.');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      if (isMockAuthMode) {
        throw new Error('Google sign-in is not available in mock mode. Use cortex/xsiam to login.');
      } else {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
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
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    isMockMode: isMockAuthMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
