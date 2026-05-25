import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  addExpense as fsAddExpense,
  updateExpense as fsUpdateExpense,
  deleteExpense as fsDeleteExpense,
  subscribeToExpenses,
  addShopExpense as fsAddShop,
  updateShopExpense as fsUpdateShop,
  deleteShopExpense as fsDeleteShop,
  markShopReceived as fsMarkShopReceived,
  subscribeToShopExpenses,
  addFriendTransaction as fsAddFriend,
  updateFriendTransaction as fsUpdateFriend,
  deleteFriendTransaction as fsDeleteFriend,
  markFriendReceived as fsMarkFriendReceived,
  subscribeToFriendTransactions,
} from '../services/firestoreService';
import { isCurrentMonth } from '../utils/formatDate';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const uid = user?.uid;

  const [expenses, setExpenses] = useState([]);
  const [shopExpenses, setShopExpenses] = useState([]);
  const [friendTransactions, setFriendTransactions] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState(null);

  // Track unsubscribe functions for real-time listeners
  const unsubscribeRefs = useRef([]);
  const loadedRef = useRef({ expenses: false, shop: false, friends: false });

  // ── Set up / tear down Firestore real-time listeners on auth change ──────────
  useEffect(() => {
    // Clean up any previous listeners first
    unsubscribeRefs.current.forEach((unsub) => unsub?.());
    unsubscribeRefs.current = [];
    loadedRef.current = { expenses: false, shop: false, friends: false };

    if (!uid) {
      // User signed out — clear all data
      setExpenses([]);
      setShopExpenses([]);
      setFriendTransactions([]);
      setDataLoading(false);
      setFirestoreError(null);
      return;
    }

    console.log('[AppContext] Setting up Firestore listeners for uid:', uid);
    setDataLoading(true);
    setFirestoreError(null);

    const checkAllLoaded = () => {
      const { expenses, shop, friends } = loadedRef.current;
      if (expenses && shop && friends) {
        console.log('[AppContext] All Firestore listeners ready');
        setDataLoading(false);
      }
    };

    const handleError = (err) => {
      console.error('[AppContext] Firestore listener error:', err?.code, err?.message);
      setFirestoreError(err?.message || 'Firestore connection error');
      // Still mark as loaded so UI doesn't hang
      loadedRef.current = { expenses: true, shop: true, friends: true };
      setDataLoading(false);
    };

    // Subscribe to expenses
    const unsubExpenses = subscribeToExpenses(
      uid,
      (data) => {
        setExpenses(data);
        loadedRef.current.expenses = true;
        checkAllLoaded();
      },
      handleError
    );

    // Subscribe to shop expenses
    const unsubShop = subscribeToShopExpenses(
      uid,
      (data) => {
        setShopExpenses(data);
        loadedRef.current.shop = true;
        checkAllLoaded();
      },
      handleError
    );

    // Subscribe to friend transactions
    const unsubFriends = subscribeToFriendTransactions(
      uid,
      (data) => {
        setFriendTransactions(data);
        loadedRef.current.friends = true;
        checkAllLoaded();
      },
      handleError
    );

    unsubscribeRefs.current = [unsubExpenses, unsubShop, unsubFriends];

    return () => {
      console.log('[AppContext] Cleaning up Firestore listeners');
      unsubscribeRefs.current.forEach((unsub) => unsub?.());
      unsubscribeRefs.current = [];
    };
  }, [uid]);

  // ─── EXPENSES ─────────────────────────────────────────────────────────────────
  const addExpense = useCallback(async (data) => {
    if (!uid) throw new Error('Not authenticated');
    return await fsAddExpense(uid, data);
    // UI updates automatically via onSnapshot listener
  }, [uid]);

  const updateExpense = useCallback(async (id, updates) => {
    if (!uid) throw new Error('Not authenticated');
    await fsUpdateExpense(uid, id, updates);
  }, [uid]);

  const deleteExpense = useCallback(async (id) => {
    if (!uid) throw new Error('Not authenticated');
    await fsDeleteExpense(uid, id);
  }, [uid]);

  // ─── SHOP EXPENSES ────────────────────────────────────────────────────────────
  const addShopExpense = useCallback(async (data) => {
    if (!uid) throw new Error('Not authenticated');
    return await fsAddShop(uid, data);
  }, [uid]);

  const updateShopExpense = useCallback(async (id, updates) => {
    if (!uid) throw new Error('Not authenticated');
    await fsUpdateShop(uid, id, updates);
  }, [uid]);

  const deleteShopExpense = useCallback(async (id) => {
    if (!uid) throw new Error('Not authenticated');
    await fsDeleteShop(uid, id);
  }, [uid]);

  const markShopReceived = useCallback(async (id) => {
    if (!uid) throw new Error('Not authenticated');
    await fsMarkShopReceived(uid, id);
  }, [uid]);

  // ─── FRIEND TRANSACTIONS ──────────────────────────────────────────────────────
  const addFriendTransaction = useCallback(async (data) => {
    if (!uid) throw new Error('Not authenticated');
    return await fsAddFriend(uid, data);
  }, [uid]);

  const updateFriendTransaction = useCallback(async (id, updates) => {
    if (!uid) throw new Error('Not authenticated');
    await fsUpdateFriend(uid, id, updates);
  }, [uid]);

  const deleteFriendTransaction = useCallback(async (id) => {
    if (!uid) throw new Error('Not authenticated');
    await fsDeleteFriend(uid, id);
  }, [uid]);

  const markFriendReceived = useCallback(async (id) => {
    if (!uid) throw new Error('Not authenticated');
    await fsMarkFriendReceived(uid, id);
  }, [uid]);

  // ─── DERIVED ANALYTICS ───────────────────────────────────────────────────────
  const currentMonthExpenses = expenses.filter((e) =>
    isCurrentMonth(e.date || e.createdAt)
  );
  const totalMonthlySpend = currentMonthExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  const pendingShopTotal = shopExpenses
    .filter((s) => s.status === 'pending')
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const pendingFriendTotal = friendTransactions
    .filter((f) => f.status === 'pending')
    .reduce((sum, f) => sum + Number(f.amount), 0);

  const totalPending = pendingShopTotal + pendingFriendTotal;

  return (
    <AppContext.Provider
      value={{
        // Data
        expenses,
        shopExpenses,
        friendTransactions,
        dataLoading,
        firestoreError,
        // Expense actions
        addExpense,
        updateExpense,
        deleteExpense,
        // Shop actions
        addShopExpense,
        updateShopExpense,
        deleteShopExpense,
        markShopReceived,
        // Friend actions
        addFriendTransaction,
        updateFriendTransaction,
        deleteFriendTransaction,
        markFriendReceived,
        // Analytics
        currentMonthExpenses,
        totalMonthlySpend,
        pendingShopTotal,
        pendingFriendTotal,
        totalPending,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
