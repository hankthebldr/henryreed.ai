import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App (singleton pattern)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';

// Emulator support in development
if (useEmulators && isDevelopment) {
  try {
    // Connect to Auth emulator (safe connection - Firebase handles reconnection gracefully)
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    
    // Connect to Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);
    
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
    
    // Connect to Functions emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);
    
    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    // Emulators may already be connected or not available
    // This is expected behavior in many cases, so we only warn
    console.warn('⚠️ Firebase emulator connection warning:', error);
  }
}

// Configuration validation (client-side only)
if (typeof window !== 'undefined') {
  const requiredConfig = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  const missingConfig = requiredConfig.filter(key => !process.env[key]);
  
  if (missingConfig.length > 0) {
    console.warn(
      '🔥 Firebase configuration incomplete. Missing:', 
      missingConfig.join(', '),
      '\nSome features may not work properly.'
    );
  } else {
    console.log('✅ Firebase initialized successfully');
  }
}

export default { app, auth, storage, db, functions };