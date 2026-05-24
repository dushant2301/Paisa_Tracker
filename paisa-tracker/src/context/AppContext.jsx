import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getExpenses, addExpense as storeAddExpense,
  updateExpense as storeUpdateExpense, deleteExpense as storeDeleteExpense,
  getShopExpenses, addShopExpense as storeAddShop, updateShopExpense as storeUpdateShop,
  deleteShopExpense as storeDeleteShop, markShopReceived as storeMarkShopReceived,
  getFriendTransactions, addFriendTransaction as storeAddFriend,
  updateFriendTransaction as storeUpdateFriend, deleteFriendTransaction as storeDeleteFriend,
  markFriendReceived as storeMarkFriendReceived,
} from '../utils/storage';
import { isCurrentMonth } from '../utils/formatDate';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [shopExpenses, setShopExpenses] = useState([]);
  const [friendTransactions, setFriendTransactions] = useState([]);
  const initialized = useRef(false);

  // Load all data on mount
  useEffect(() => {
    if (!initialized.current) {
      setExpenses(getExpenses());
      setShopExpenses(getShopExpenses());
      setFriendTransactions(getFriendTransactions());
      initialized.current = true;
    }
  }, []);

  // ─── EXPENSES ─────────────────────────────────────────────
  const addExpense = useCallback((data) => {
    const newItem = storeAddExpense(data);
    setExpenses(getExpenses());
    return newItem;
  }, []);

  const updateExpense = useCallback((id, updates) => {
    storeUpdateExpense(id, updates);
    setExpenses(getExpenses());
  }, []);

  const deleteExpense = useCallback((id) => {
    storeDeleteExpense(id);
    setExpenses(getExpenses());
  }, []);

  // ─── SHOP EXPENSES ────────────────────────────────────────
  const addShopExpense = useCallback((data) => {
    const newItem = storeAddShop(data);
    setShopExpenses(getShopExpenses());
    return newItem;
  }, []);

  const updateShopExpense = useCallback((id, updates) => {
    storeUpdateShop(id, updates);
    setShopExpenses(getShopExpenses());
  }, []);

  const deleteShopExpense = useCallback((id) => {
    storeDeleteShop(id);
    setShopExpenses(getShopExpenses());
  }, []);

  const markShopReceived = useCallback((id) => {
    storeMarkShopReceived(id);
    setShopExpenses(getShopExpenses());
  }, []);

  // ─── FRIEND TRANSACTIONS ──────────────────────────────────
  const addFriendTransaction = useCallback((data) => {
    const newItem = storeAddFriend(data);
    setFriendTransactions(getFriendTransactions());
    return newItem;
  }, []);

  const updateFriendTransaction = useCallback((id, updates) => {
    storeUpdateFriend(id, updates);
    setFriendTransactions(getFriendTransactions());
  }, []);

  const deleteFriendTransaction = useCallback((id) => {
    storeDeleteFriend(id);
    setFriendTransactions(getFriendTransactions());
  }, []);

  const markFriendReceived = useCallback((id) => {
    storeMarkFriendReceived(id);
    setFriendTransactions(getFriendTransactions());
  }, []);

  // ─── DERIVED ANALYTICS ───────────────────────────────────
  const currentMonthExpenses = expenses.filter((e) => isCurrentMonth(e.date || e.createdAt));
  const totalMonthlySpend = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

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
