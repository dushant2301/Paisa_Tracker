/**
 * authService.js
 * All Firebase Authentication operations.
 * Components should import from here — never call Firebase SDK directly.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign up a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @returns {Promise<UserCredential>}
 */
export const signUpWithEmail = async (email, password, displayName) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  // Set display name on Firebase Auth profile
  await updateProfile(credential.user, { displayName });
  return credential;
};

/**
 * Sign in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const signInWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

/**
 * Sign in with Google OAuth popup.
 * @returns {Promise<UserCredential>}
 */
export const signInWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

/**
 * Sign out the current user.
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  return await signOut(auth);
};

/**
 * Subscribe to auth state changes.
 * @param {function} callback - Called with Firebase User or null
 * @returns {function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Map Firebase auth error codes to user-friendly messages.
 * @param {Error} error - Firebase Auth error
 * @returns {string} Human-readable error message
 */
export const getAuthErrorMessage = (error) => {
  const code = error?.code || '';
  const messages = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/account-exists-with-different-credential':
      'An account already exists with the same email but different sign-in method.',
  };
  return messages[code] || error?.message || 'Authentication failed. Please try again.';
};
