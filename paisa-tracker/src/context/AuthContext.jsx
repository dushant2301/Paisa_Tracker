import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  onAuthChange,
  getAuthErrorMessage,
} from '../services/authService';
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from '../services/firestoreService';
import { testFirestoreWrite } from '../firebaseDebug';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);         // Firebase Auth user + profile merged
  const [balance, setBalanceState] = useState(0);
  const [loading, setLoading] = useState(true);   // true until onAuthStateChanged fires

  // ── Listen to Firebase auth state (persists across page refreshes) ──────────
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in — load their Firestore profile
        try {
          let profile = await getUserProfile(firebaseUser.uid);

          // First login via Google might not have a profile yet — create one
          if (!profile) {
            const newProfile = {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              avatar: (firebaseUser.displayName || 'U')[0].toUpperCase(),
              balance: 0,
              provider: firebaseUser.providerData[0]?.providerId || 'email',
            };
            await createUserProfile(firebaseUser.uid, newProfile);
            profile = { id: firebaseUser.uid, ...newProfile };
          }

          setUser({
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            name: profile.name || firebaseUser.displayName || 'User',
            email: profile.email || firebaseUser.email,
            avatar: profile.avatar || (profile.name || 'U')[0].toUpperCase(),
            provider: profile.provider || 'email',
            createdAt: profile.createdAt,
          });
          setBalanceState(Number(profile.balance) || 0);

          // Run Firestore connectivity test in dev mode
          if (import.meta.env.DEV) {
            testFirestoreWrite(firebaseUser.uid);
          }
        } catch (err) {
          console.error('Error loading user profile:', err);
          // Still set basic user from Firebase Auth even if Firestore fails
          setUser({
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            avatar: (firebaseUser.displayName || 'U')[0].toUpperCase(),
          });
        }
      } else {
        // Signed out
        setUser(null);
        setBalanceState(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Signup with email/password ───────────────────────────────────────────────
  const signup = useCallback(async ({ name, email, password, initialBalance }) => {
    try {
      const credential = await signUpWithEmail(email, password, name.trim());
      const uid = credential.user.uid;

      // Create Firestore profile
      const profile = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar: name.trim()[0].toUpperCase(),
        balance: Number(initialBalance) || 0,
        provider: 'email',
      };
      await createUserProfile(uid, profile);

      // onAuthChange will fire and set user state automatically
      return credential.user;
    } catch (err) {
      throw new Error(getAuthErrorMessage(err));
    }
  }, []);

  // ── Login with email/password ────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    try {
      const credential = await signInWithEmail(email, password);
      // onAuthChange will fire and load profile automatically
      return credential.user;
    } catch (err) {
      throw new Error(getAuthErrorMessage(err));
    }
  }, []);

  // ── Google Sign-In ────────────────────────────────────────────────────────────
  const googleSignIn = useCallback(async () => {
    try {
      const credential = await signInWithGoogle();
      const firebaseUser = credential.user;

      // Check if profile exists; if not, create one
      const existing = await getUserProfile(firebaseUser.uid);
      if (!existing) {
        await createUserProfile(firebaseUser.uid, {
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
          avatar: (firebaseUser.displayName || 'U')[0].toUpperCase(),
          balance: 0,
          provider: 'google',
        });
      }

      // onAuthChange will fire and set user state automatically
      return firebaseUser;
    } catch (err) {
      throw new Error(getAuthErrorMessage(err));
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await signOutUser();
      // onAuthChange will fire and clear user state automatically
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  // ── Update balance (saves to Firestore) ──────────────────────────────────────
  const updateBalance = useCallback(async (amount) => {
    if (!user?.uid) return;
    try {
      await updateUserProfile(user.uid, { balance: Number(amount) });
      setBalanceState(Number(amount));
    } catch (err) {
      console.error('Error updating balance:', err);
    }
  }, [user]);

  // ── Update user profile info ──────────────────────────────────────────────────
  const updateUser = useCallback(async (updates) => {
    if (!user?.uid) return;
    try {
      await updateUserProfile(user.uid, updates);
      setUser((prev) => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('Error updating user:', err);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        balance,
        loading,
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
