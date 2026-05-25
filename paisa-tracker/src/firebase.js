// Firebase SDK imports
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration — loaded from environment variables
// Never hardcode credentials in source code
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ── Startup config check ─────────────────────────────────────────────────────
// Verify all required env vars are present
const requiredVars = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingVars = requiredVars.filter((key) => !firebaseConfig[key]);
if (missingVars.length > 0) {
  console.error('[Firebase] ❌ Missing config values:', missingVars);
  console.error('[Firebase] Check that .env file exists with VITE_FIREBASE_* variables');
} else {
  console.log('[Firebase] ✅ Config loaded for project:', firebaseConfig.projectId);
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('[Firebase] ✅ Auth and Firestore initialized');

export default app;