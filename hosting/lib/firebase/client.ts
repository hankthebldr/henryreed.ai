// Firebase client configuration for browser environment
// Static export safe - client-side SDK only, no admin SDK
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { 
  getStorage, 
  FirebaseStorage, 
  connectStorageEmulator 
} from 'firebase/storage';
import { 
  getFunctions, 
  Functions, 
  connectFunctionsEmulator,
  httpsCallable
} from 'firebase/functions';

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';

// Firebase configuration from environment variables
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required configuration
const validateConfig = (config: FirebaseConfig): void => {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = required.filter(key => !config[key as keyof FirebaseConfig]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required Firebase configuration: ${missing.join(', ')}`);
  }
};

// Initialize Firebase app
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;
let functions: Functions;

export const initializeFirebase = (): {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
  functions: Functions;
} => {
  try {
    validateConfig(firebaseConfig);
    
    // Initialize Firebase app (singleton pattern)
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    // Initialize services
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);

    // Connect to emulators in development
    if (isEmulator && isDevelopment) {
      try {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
        connectFunctionsEmulator(functions, 'localhost', 5001);
        console.log('Connected to Firebase emulators');
      } catch (error) {
        console.warn('Firebase emulator connection failed:', error);
      }
    }

    return { app, auth, firestore, storage, functions };
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw error;
  }
};

// Export initialized services
export const getFirebaseServices = () => {
  if (!app || !auth || !firestore || !storage || !functions) {
    return initializeFirebase();
  }
  return { app, auth, firestore, storage, functions };
};

// Auth utilities
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const { auth } = getFirebaseServices();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const createAccount = async (email: string, password: string): Promise<User> => {
  const { auth } = getFirebaseServices();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOut = async (): Promise<void> => {
  const { auth } = getFirebaseServices();
  await firebaseSignOut(auth);
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const { auth } = getFirebaseServices();
  return onAuthStateChanged(auth, callback);
};

// Network utilities for offline support
export const enableFirestoreNetwork = async (): Promise<void> => {
  const { firestore } = getFirebaseServices();
  await enableNetwork(firestore);
};

export const disableFirestoreNetwork = async (): Promise<void> => {
  const { firestore } = getFirebaseServices();
  await disableNetwork(firestore);
};

// Cloud Functions utilities
export const createCallableFunction = <T = any, R = any>(functionName: string) => {
  const { functions } = getFirebaseServices();
  return httpsCallable<T, R>(functions, functionName);
};

export const getFirestoreClient = (): Firestore => getFirebaseServices().firestore;

// Common Cloud Functions
export const callTRRAIFunction = createCallableFunction('aiTrrSuggest');
export const callTRRExportFunction = createCallableFunction('trr-export');
export const callTRRSignoffFunction = createCallableFunction('trr-signoff-create');

// Firebase utilities for error handling
export const getFirebaseErrorMessage = (error: any): string => {
  if (error?.code) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'firestore/permission-denied':
        return 'You do not have permission to access this data.';
      case 'firestore/unavailable':
        return 'Service temporarily unavailable. Please try again.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  return error?.message || 'An unexpected error occurred.';
};

// Initialize Firebase on module load (client-side only)
if (typeof window !== 'undefined') {
  initializeFirebase();
}

export default getFirebaseServices;
