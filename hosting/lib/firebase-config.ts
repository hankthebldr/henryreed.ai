import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Check if we're in mock auth mode
export const isMockAuthMode = process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true';
export const useEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';

// Only initialize Firebase if we're in the browser and have valid config
function getFirebaseApp() {
  if (typeof window === 'undefined') {
    // Server-side rendering - return null
    return null;
  }
  
  // In mock mode, still initialize Firebase for structure but use emulators
  if (isMockAuthMode || !firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.info('Running in mock auth mode or Firebase config missing. Using development auth.');
    
    // Use a default config for mock mode
    const mockConfig = {
      apiKey: 'mock-api-key',
      authDomain: 'cortex-dc-portal.firebaseapp.com',
      projectId: 'cortex-dc-portal',
      storageBucket: 'cortex-dc-portal.appspot.com',
      messagingSenderId: '123456789012',
      appId: '1:123456789012:web:mock-app-id'
    };
    
    const apps = getApps();
    const app = apps.length === 0 ? initializeApp(mockConfig) : getApp();
    return app;
  }
  
  // Initialize Firebase app if not already initialized
  const apps = getApps();
  const app = apps.length === 0 ? initializeApp(firebaseConfig) : getApp();
  return app;
}

let _auth: ReturnType<typeof getAuth> | null = null;
let _db: ReturnType<typeof getFirestore> | null = null;
let _app: ReturnType<typeof getFirebaseApp> | null = null;
let _emulatorsConnected = false;

// Initialize emulators if needed
function connectEmulators() {
  if (_emulatorsConnected || typeof window === 'undefined') return;
  
  if (useEmulator || isMockAuthMode) {
    try {
      if (_auth && process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        connectAuthEmulator(_auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`, { disableWarnings: true });
      }
      if (_db && process.env.FIRESTORE_EMULATOR_HOST) {
        connectFirestoreEmulator(_db, 'localhost', 8080);
      }
      _emulatorsConnected = true;
      console.info('Connected to Firebase emulators');
    } catch (error) {
      console.warn('Failed to connect to emulators:', error);
    }
  }
}

export const auth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(target, prop) {
    if (!_auth) {
      const app = getFirebaseApp();
      if (!app) {
        console.warn('Firebase app not available, using mock auth');
        return null;
      }
      _auth = getAuth(app);
      connectEmulators();
    }
    return (_auth as any)[prop];
  }
});

export const db = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(target, prop) {
    if (!_db) {
      const app = getFirebaseApp();
      if (!app) {
        console.warn('Firebase app not available, using mock db');
        return null;
      }
      _db = getFirestore(app);
      connectEmulators();
    }
    return (_db as any)[prop];
  }
});

export const firebaseApp = new Proxy({} as ReturnType<typeof getFirebaseApp>, {
  get(target, prop) {
    if (!_app) {
      _app = getFirebaseApp();
      if (!_app) {
        throw new Error('Firebase is not properly configured. Please check your environment variables.');
      }
    }
    return (_app as any)[prop];
  }
});
