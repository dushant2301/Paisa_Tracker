// AuthContext.jsx — Firebase Auth + Firestore for user profile & balance
// Uses signInWithRedirect for Google (more reliable than popup on deployed sites)
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/firebase';

const AuthContext = createContext(null);

// ─── Firestore helpers ────────────────────────────────────────────────────────
const getUserDoc   = (uid) => doc(db, 'users', uid, 'profile', 'data');

const readProfile  = async (uid) => {
  const snap = await getDoc(getUserDoc(uid));
  return snap.exists() ? snap.data() : null;
};

const writeProfile = async (uid, data) => {
  await setDoc(getUserDoc(uid), data, { merge: true });
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Handle Firebase user → load profile ──────────────────────────────────
  const hydrateUser = async (firebaseUser) => {
    try {
      const profile = await readProfile(firebaseUser.uid);
      const name    = profile?.name || firebaseUser.displayName || 'User';
      setUser({
        uid:    firebaseUser.uid,
        name,
        email:  firebaseUser.email,
        avatar: name[0]?.toUpperCase() || 'U',
      });
      setBalance(profile?.balance ?? 0);
    } catch (err) {
      console.error('Error reading profile:', err);
      const name = firebaseUser.displayName || 'User';
      setUser({ uid: firebaseUser.uid, name, email: firebaseUser.email, avatar: name[0]?.toUpperCase() || 'U' });
    }
  };

  // ── Listen to auth state + catch redirect result on page load ─────────────
  useEffect(() => {
    // Check if user just came back from Google redirect
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          // New Google sign-in — create profile if needed
          const profile = await readProfile(result.user.uid);
          if (!profile) {
            await writeProfile(result.user.uid, {
              name:      result.user.displayName || 'User',
              email:     result.user.email,
              balance:   0,
              createdAt: serverTimestamp(),
            });
          }
        }
      })
      .catch((err) => {
        if (err.code !== 'auth/popup-closed-by-user') {
          console.error('Redirect result error:', err);
          setError(firebaseErrorMessage(err.code));
        }
      });

    // Standard auth state listener
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await hydrateUser(firebaseUser);
      } else {
        setUser(null);
        setBalance(0);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  // ── Email/Password Login ──────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      const msg = firebaseErrorMessage(err.code);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  // ── Email/Password Signup ─────────────────────────────────────────────────
  const signup = useCallback(async ({ name, email, password, initialBalance }) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      await writeProfile(cred.user.uid, {
        name:      name.trim(),
        email:     email.trim().toLowerCase(),
        balance:   Number(initialBalance) || 0,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      const msg = firebaseErrorMessage(err.code);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  // ── Google Sign-In (redirect — works on all browsers & deployed sites) ────
  const googleSignIn = useCallback(async () => {
    setError(null);
    try {
      // This redirects the page to Google, then back to your app
      await signInWithRedirect(auth, googleProvider);
      // Code after this line won't run — page redirects
    } catch (err) {
      const msg = firebaseErrorMessage(err.code);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setBalance(0);
  }, []);

  // ── Update Balance ────────────────────────────────────────────────────────
  const updateBalance = useCallback(async (amount) => {
    if (!user?.uid) return;
    setBalance(amount);
    try {
      await updateDoc(getUserDoc(user.uid), { balance: amount });
    } catch (err) {
      console.error('Failed to save balance:', err);
    }
  }, [user]);

  // ── Update User Profile ───────────────────────────────────────────────────
  const updateUser = useCallback(async (updates) => {
    if (!user?.uid) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      await updateDoc(getUserDoc(user.uid), updates);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        balance,
        loading,
        error,
        login,
        signup,
        googleSignIn,
        logout,
        updateBalance,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ─── Firebase error → friendly messages ──────────────────────────────────────
function firebaseErrorMessage(code) {
  const map = {
    'auth/invalid-credential':        'Invalid email or password.',
    'auth/user-not-found':            'No account found with this email.',
    'auth/wrong-password':            'Incorrect password.',
    'auth/email-already-in-use':      'An account already exists with this email.',
    'auth/weak-password':             'Password must be at least 6 characters.',
    'auth/invalid-email':             'Please enter a valid email address.',
    'auth/too-many-requests':         'Too many attempts. Please try again later.',
    'auth/network-request-failed':    'Network error. Check your internet connection.',
    'auth/unauthorized-domain':       'This domain is not authorized. Add it in Firebase Console → Auth → Authorized Domains.',
    'auth/popup-blocked':             'Popup was blocked. Please allow popups for this site.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}
