import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Only initialize Firebase if we're in the browser and have valid config
function getFirebaseApp() {
  if (typeof window === 'undefined') {
    // Server-side rendering - return null
    return null;
  }
  
  // Check if we have the required config
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('Firebase configuration is missing. Authentication features will be disabled.');
    return null;
  }
  
  // Initialize Firebase app if not already initialized
  const apps = getApps();
  const app = apps.length === 0 ? initializeApp(firebaseConfig) : getApp();
  return app;
}

let _auth: ReturnType<typeof getAuth> | null = null;
let _db: ReturnType<typeof getFirestore> | null = null;
let _app: ReturnType<typeof getFirebaseApp> | null = null;

export const auth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(target, prop) {
    if (!_auth) {
      const app = getFirebaseApp();
      if (!app) {
        throw new Error('Firebase is not properly configured. Please check your environment variables.');
      }
      _auth = getAuth(app);
    }
    return (_auth as any)[prop];
  }
});

export const db = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(target, prop) {
    if (!_db) {
      const app = getFirebaseApp();
      if (!app) {
        throw new Error('Firebase is not properly configured. Please check your environment variables.');
      }
      _db = getFirestore(app);
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
