import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUser, setUser, removeUser, getBalance, setBalance } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [balance, setBalanceState] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load persisted session
    const savedUser = getUser();
    const savedBalance = getBalance();
    if (savedUser) {
      setUserState(savedUser);
      setBalanceState(savedBalance);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const savedUser = getUser();
    if (!savedUser) throw new Error('No account found. Please sign up first.');
    if (savedUser.email !== email) throw new Error('Invalid email or password.');
    if (savedUser.password !== password) throw new Error('Invalid email or password.');
    setUserState(savedUser);
    setBalanceState(getBalance());
    return savedUser;
  }, []);

  const signup = useCallback(async ({ name, email, password, initialBalance }) => {
    const existing = getUser();
    if (existing && existing.email === email) throw new Error('Account already exists with this email.');
    const newUser = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      avatar: name.trim()[0].toUpperCase(),
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setBalance(Number(initialBalance) || 0);
    setUserState(newUser);
    setBalanceState(Number(initialBalance) || 0);
    return newUser;
  }, []);

  const googleSignIn = useCallback(async (name) => {
    if (!name || !name.trim()) throw new Error('Name is required');
    // Simulate Google sign-in with a local profile
    const savedUser = getUser();
    if (savedUser) {
      setUserState(savedUser);
      setBalanceState(getBalance());
      return savedUser;
    }
    const newUser = {
      id: `user_google_${Date.now()}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      password: null,
      avatar: name[0].toUpperCase(),
      provider: 'google',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setBalance(0);
    setUserState(newUser);
    setBalanceState(0);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    removeUser();
    setUserState(null);
    setBalanceState(0);
  }, []);

  const updateBalance = useCallback((amount) => {
    setBalance(amount);
    setBalanceState(amount);
  }, []);

  const updateUser = useCallback((updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    setUserState(updated);
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
