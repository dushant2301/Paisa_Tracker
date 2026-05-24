// Storage keys
const KEYS = {
  USER: 'paisa_user',
  EXPENSES: 'paisa_expenses',
  SHOP: 'paisa_shop',
  FRIENDS: 'paisa_friends',
  BALANCE: 'paisa_balance',
};

// Generic storage helpers
const get = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const set = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const remove = (key) => localStorage.removeItem(key);

// User
export const getUser = () => get(KEYS.USER);
export const setUser = (user) => set(KEYS.USER, user);
export const removeUser = () => remove(KEYS.USER);

// Balance
export const getBalance = () => get(KEYS.BALANCE, 0);
export const setBalance = (amount) => set(KEYS.BALANCE, amount);

// Expenses
export const getExpenses = () => get(KEYS.EXPENSES, []);
export const setExpenses = (expenses) => set(KEYS.EXPENSES, expenses);

export const addExpense = (expense) => {
  const expenses = getExpenses();
  const newExpense = {
    ...expense,
    id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  expenses.unshift(newExpense);
  setExpenses(expenses);
  return newExpense;
};

export const updateExpense = (id, updates) => {
  const expenses = getExpenses();
  const idx = expenses.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  expenses[idx] = { ...expenses[idx], ...updates, updatedAt: new Date().toISOString() };
  setExpenses(expenses);
  return expenses[idx];
};

export const deleteExpense = (id) => {
  const expenses = getExpenses().filter((e) => e.id !== id);
  setExpenses(expenses);
};

// Shop Expenses
export const getShopExpenses = () => get(KEYS.SHOP, []);
export const setShopExpenses = (items) => set(KEYS.SHOP, items);

export const addShopExpense = (item) => {
  const items = getShopExpenses();
  const newItem = {
    ...item,
    id: `shop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  setShopExpenses(items);
  return newItem;
};

export const updateShopExpense = (id, updates) => {
  const items = getShopExpenses();
  const idx = items.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates };
  setShopExpenses(items);
  return items[idx];
};

export const deleteShopExpense = (id) => {
  const items = getShopExpenses().filter((e) => e.id !== id);
  setShopExpenses(items);
};

export const markShopReceived = (id) => {
  return updateShopExpense(id, { status: 'received', receivedAt: new Date().toISOString() });
};

// Friend Transactions
export const getFriendTransactions = () => get(KEYS.FRIENDS, []);
export const setFriendTransactions = (items) => set(KEYS.FRIENDS, items);

export const addFriendTransaction = (item) => {
  const items = getFriendTransactions();
  const newItem = {
    ...item,
    id: `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  setFriendTransactions(items);
  return newItem;
};

export const updateFriendTransaction = (id, updates) => {
  const items = getFriendTransactions();
  const idx = items.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates };
  setFriendTransactions(items);
  return items[idx];
};

export const deleteFriendTransaction = (id) => {
  const items = getFriendTransactions().filter((e) => e.id !== id);
  setFriendTransactions(items);
};

export const markFriendReceived = (id) => {
  return updateFriendTransaction(id, { status: 'received', receivedAt: new Date().toISOString() });
};

// Clear all data
export const clearAllData = () => {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
};
