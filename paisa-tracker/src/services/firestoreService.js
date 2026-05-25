/**
 * firestoreService.js
 * All Firestore CRUD operations + real-time listeners.
 * Components should import from here — never call Firestore SDK directly.
 *
 * Database Structure:
 * users/{userId}                          ← User profile doc
 *   /expenses/{expenseId}                 ← Personal expenses
 *   /shopExpenses/{id}                    ← Shop tracker entries
 *   /friendTransactions/{id}              ← Friends money tracker
 *   /reportHistory/{id}                   ← Generated report history
 */

import {
  doc,
  collection,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

// ─── Path helpers ─────────────────────────────────────────────────────────────

const userDoc = (uid) => doc(db, 'users', uid);
const expensesCol = (uid) => collection(db, 'users', uid, 'expenses');
const expenseDoc = (uid, id) => doc(db, 'users', uid, 'expenses', id);
const shopCol = (uid) => collection(db, 'users', uid, 'shopExpenses');
const shopDoc = (uid, id) => doc(db, 'users', uid, 'shopExpenses', id);
const friendsCol = (uid) => collection(db, 'users', uid, 'friendTransactions');
const friendDoc = (uid, id) => doc(db, 'users', uid, 'friendTransactions', id);
const reportHistoryCol = (uid) => collection(db, 'users', uid, 'reportHistory');
const reportHistoryDoc = (uid, id) => doc(db, 'users', uid, 'reportHistory', id);

// ─── Debug helper ─────────────────────────────────────────────────────────────

const logError = (operation, error) => {
  console.error(`[Firestore] ${operation} failed:`, {
    code: error?.code,
    message: error?.message,
    details: error,
  });
};

// ─── User Profile ─────────────────────────────────────────────────────────────

/**
 * Create or overwrite a user profile document in Firestore.
 * Called after signup.
 */
export const createUserProfile = async (uid, data) => {
  try {
    await setDoc(userDoc(uid), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('[Firestore] User profile created for uid:', uid);
  } catch (err) {
    logError('createUserProfile', err);
    throw err;
  }
};

/**
 * Fetch a user profile document once.
 * @returns {object|null} User profile data or null
 */
export const getUserProfile = async (uid) => {
  try {
    const snap = await getDoc(userDoc(uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    logError('getUserProfile', err);
    throw err;
  }
};

/**
 * Update specific fields on a user profile.
 */
export const updateUserProfile = async (uid, updates) => {
  try {
    await updateDoc(userDoc(uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    logError('updateUserProfile', err);
    throw err;
  }
};

// ─── Expenses ─────────────────────────────────────────────────────────────────

/**
 * Add a new expense to Firestore.
 * @returns {string} New document ID
 */
export const addExpense = async (uid, data) => {
  try {
    const payload = {
      ...data,
      amount: Number(data.amount),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    console.log('[Firestore] Adding expense for uid:', uid, payload);
    const docRef = await addDoc(expensesCol(uid), payload);
    console.log('[Firestore] Expense added with id:', docRef.id);
    return docRef.id;
  } catch (err) {
    logError('addExpense', err);
    throw err;
  }
};

/**
 * Update an existing expense.
 */
export const updateExpense = async (uid, id, updates) => {
  try {
    await updateDoc(expenseDoc(uid, id), {
      ...updates,
      amount: Number(updates.amount),
      updatedAt: serverTimestamp(),
    });
    console.log('[Firestore] Expense updated:', id);
  } catch (err) {
    logError('updateExpense', err);
    throw err;
  }
};

/**
 * Delete an expense document.
 */
export const deleteExpense = async (uid, id) => {
  try {
    await deleteDoc(expenseDoc(uid, id));
    console.log('[Firestore] Expense deleted:', id);
  } catch (err) {
    logError('deleteExpense', err);
    throw err;
  }
};

/**
 * Subscribe to all expenses in real-time, ordered by createdAt descending.
 * @param {string} uid
 * @param {function} callback - Called with array of expense objects
 * @returns {function} Unsubscribe function
 */
export const subscribeToExpenses = (uid, callback, onError) => {
  const q = query(expensesCol(uid), orderBy('createdAt', 'desc'));
  console.log('[Firestore] Subscribing to expenses for uid:', uid);
  return onSnapshot(
    q,
    (snap) => {
      const expenses = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        // Normalize Firestore Timestamps to ISO strings for compatibility
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt,
        updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() ?? d.data().updatedAt,
      }));
      console.log('[Firestore] Expenses snapshot received:', expenses.length, 'docs');
      callback(expenses);
    },
    (err) => {
      logError('subscribeToExpenses', err);
      if (onError) onError(err);
      else callback([]); // Fail gracefully
    }
  );
};

// ─── Shop Expenses ────────────────────────────────────────────────────────────

/**
 * Add a new shop expense.
 * @returns {string} New document ID
 */
export const addShopExpense = async (uid, data) => {
  try {
    const payload = {
      ...data,
      amount: Number(data.amount),
      status: 'pending',
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(shopCol(uid), payload);
    console.log('[Firestore] Shop expense added:', docRef.id);
    return docRef.id;
  } catch (err) {
    logError('addShopExpense', err);
    throw err;
  }
};

/**
 * Update a shop expense entry.
 */
export const updateShopExpense = async (uid, id, updates) => {
  try {
    await updateDoc(shopDoc(uid, id), {
      ...updates,
      ...(updates.amount !== undefined && { amount: Number(updates.amount) }),
      updatedAt: serverTimestamp(),
    });
    console.log('[Firestore] Shop expense updated:', id);
  } catch (err) {
    logError('updateShopExpense', err);
    throw err;
  }
};

/**
 * Delete a shop expense.
 */
export const deleteShopExpense = async (uid, id) => {
  try {
    await deleteDoc(shopDoc(uid, id));
    console.log('[Firestore] Shop expense deleted:', id);
  } catch (err) {
    logError('deleteShopExpense', err);
    throw err;
  }
};

/**
 * Mark a shop expense as received.
 */
export const markShopReceived = async (uid, id) => {
  try {
    await updateDoc(shopDoc(uid, id), {
      status: 'received',
      receivedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('[Firestore] Shop expense marked received:', id);
  } catch (err) {
    logError('markShopReceived', err);
    throw err;
  }
};

/**
 * Subscribe to all shop expenses in real-time.
 * @returns {function} Unsubscribe function
 */
export const subscribeToShopExpenses = (uid, callback, onError) => {
  const q = query(shopCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt,
        receivedAt: d.data().receivedAt?.toDate?.()?.toISOString() ?? d.data().receivedAt,
      }));
      console.log('[Firestore] ShopExpenses snapshot:', items.length, 'docs');
      callback(items);
    },
    (err) => {
      logError('subscribeToShopExpenses', err);
      if (onError) onError(err);
      else callback([]);
    }
  );
};

// ─── Friend Transactions ──────────────────────────────────────────────────────

/**
 * Add a new friend transaction.
 * @returns {string} New document ID
 */
export const addFriendTransaction = async (uid, data) => {
  try {
    const payload = {
      ...data,
      amount: Number(data.amount),
      status: 'pending',
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(friendsCol(uid), payload);
    console.log('[Firestore] Friend transaction added:', docRef.id);
    return docRef.id;
  } catch (err) {
    logError('addFriendTransaction', err);
    throw err;
  }
};

/**
 * Update a friend transaction.
 */
export const updateFriendTransaction = async (uid, id, updates) => {
  try {
    await updateDoc(friendDoc(uid, id), {
      ...updates,
      ...(updates.amount !== undefined && { amount: Number(updates.amount) }),
      updatedAt: serverTimestamp(),
    });
    console.log('[Firestore] Friend transaction updated:', id);
  } catch (err) {
    logError('updateFriendTransaction', err);
    throw err;
  }
};

/**
 * Delete a friend transaction.
 */
export const deleteFriendTransaction = async (uid, id) => {
  try {
    await deleteDoc(friendDoc(uid, id));
    console.log('[Firestore] Friend transaction deleted:', id);
  } catch (err) {
    logError('deleteFriendTransaction', err);
    throw err;
  }
};

/**
 * Mark a friend transaction as received.
 */
export const markFriendReceived = async (uid, id) => {
  try {
    await updateDoc(friendDoc(uid, id), {
      status: 'received',
      receivedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('[Firestore] Friend transaction marked received:', id);
  } catch (err) {
    logError('markFriendReceived', err);
    throw err;
  }
};

/**
 * Subscribe to all friend transactions in real-time.
 * @returns {function} Unsubscribe function
 */
export const subscribeToFriendTransactions = (uid, callback, onError) => {
  const q = query(friendsCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt,
        receivedAt: d.data().receivedAt?.toDate?.()?.toISOString() ?? d.data().receivedAt,
      }));
      console.log('[Firestore] FriendTransactions snapshot:', items.length, 'docs');
      callback(items);
    },
    (err) => {
      logError('subscribeToFriendTransactions', err);
      if (onError) onError(err);
      else callback([]);
    }
  );
};

// ─── Report History ───────────────────────────────────────────────────────────

/**
 * Save or update a report entry in history.
 * Uses yearMonth as the document ID to avoid duplicates.
 */
export const saveReportHistory = async (uid, meta) => {
  try {
    const id = `report_${meta.yearMonth}`;
    await setDoc(reportHistoryDoc(uid, id), {
      ...meta,
      id,
      generatedAt: serverTimestamp(),
    });
    console.log('[Firestore] Report history saved:', id);
    return id;
  } catch (err) {
    logError('saveReportHistory', err);
    throw err;
  }
};

/**
 * Fetch all report history entries once (not real-time).
 * @returns {Promise<Array>}
 */
export const getReportHistory = async (uid) => {
  const q = query(reportHistoryCol(uid), orderBy('generatedAt', 'desc'));
  return new Promise((resolve, reject) => {
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          generatedAt:
            d.data().generatedAt?.toDate?.()?.toISOString() ?? d.data().generatedAt,
        }));
        resolve(items);
        unsub(); // one-time fetch
      },
      (err) => {
        logError('getReportHistory', err);
        reject(err);
      }
    );
  });
};

/**
 * Subscribe to report history in real-time.
 * @returns {function} Unsubscribe function
 */
export const subscribeToReportHistory = (uid, callback, onError) => {
  const q = query(reportHistoryCol(uid), orderBy('generatedAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        generatedAt:
          d.data().generatedAt?.toDate?.()?.toISOString() ?? d.data().generatedAt,
      }));
      callback(items);
    },
    (err) => {
      logError('subscribeToReportHistory', err);
      if (onError) onError(err);
      else callback([]);
    }
  );
};

/**
 * Delete a report history entry.
 */
export const deleteReportHistory = async (uid, id) => {
  try {
    await deleteDoc(reportHistoryDoc(uid, id));
    console.log('[Firestore] Report history deleted:', id);
  } catch (err) {
    logError('deleteReportHistory', err);
    throw err;
  }
};
