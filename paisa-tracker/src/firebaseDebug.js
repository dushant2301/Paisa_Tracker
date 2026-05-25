/**
 * firebaseDebug.js
 * Startup diagnostics — runs once when the app initializes.
 * Logs Firebase config status, auth state, and Firestore connectivity.
 * Remove or disable in production by setting VITE_FIREBASE_DEBUG=false.
 */

import { auth, db } from './firebase';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const TAG = '[FirebaseDebug]';

/**
 * Verify environment variables are loaded correctly.
 */
export const checkEnvVars = () => {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missing = required.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    console.error(`${TAG} ❌ Missing environment variables:`, missing);
    console.error(`${TAG} Make sure .env file exists in the paisa-tracker/ directory with VITE_ prefixed keys.`);
    return false;
  }

  console.log(`${TAG} ✅ Environment variables loaded:`, {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 15) + '...',
  });
  return true;
};

/**
 * Test Firestore write + read + delete for a given uid.
 * This confirms Firestore rules allow the authenticated user to write.
 */
export const testFirestoreWrite = async (uid) => {
  if (!uid) {
    console.warn(`${TAG} ⚠️ testFirestoreWrite called without uid — user not authenticated`);
    return false;
  }

  const testDocRef = doc(db, 'users', uid, 'expenses', '__test_write__');
  try {
    // Write test doc
    await setDoc(testDocRef, {
      test: true,
      timestamp: serverTimestamp(),
    });
    console.log(`${TAG} ✅ Firestore WRITE succeeded for uid: ${uid}`);

    // Read it back
    const snap = await getDoc(testDocRef);
    if (snap.exists()) {
      console.log(`${TAG} ✅ Firestore READ succeeded:`, snap.data());
    }

    // Clean up test doc
    await deleteDoc(testDocRef);
    console.log(`${TAG} ✅ Firestore DELETE succeeded`);

    return true;
  } catch (err) {
    console.error(`${TAG} ❌ Firestore test FAILED:`, {
      code: err.code,
      message: err.message,
    });

    if (err.code === 'permission-denied') {
      console.error(`${TAG} 🔒 PERMISSION DENIED — Fix required:`);
      console.error(`   1. Go to Firebase Console → Firestore Database → Rules`);
      console.error(`   2. Make sure rules allow: request.auth.uid == "${uid}"`);
      console.error(`   3. Publish the rules from firestore.rules file`);
    } else if (err.code === 'unavailable') {
      console.error(`${TAG} 🌐 Firestore UNAVAILABLE — Check internet connection`);
    } else if (err.code === 'unauthenticated') {
      console.error(`${TAG} 🔑 User not authenticated when writing — Auth state not ready`);
    }

    return false;
  }
};

/**
 * Log current auth state.
 */
export const logAuthState = () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    console.log(`${TAG} ✅ Auth state: SIGNED IN`, {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      provider: currentUser.providerData?.[0]?.providerId,
    });
  } else {
    console.log(`${TAG} ⚠️ Auth state: NOT SIGNED IN`);
  }
  return currentUser;
};

/**
 * Run all diagnostics. Call this from firebase.js or main.jsx.
 */
export const runDiagnostics = () => {
  console.group(`${TAG} 🔍 Running Firebase diagnostics...`);
  checkEnvVars();
  logAuthState();
  console.groupEnd();
};
