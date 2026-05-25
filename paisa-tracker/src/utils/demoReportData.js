/**
 * demoReportData.js
 * Seed demo data for the Monthly Report feature demonstration.
 * Generates deterministic, realistic data across current + 5 previous months.
 * Now writes to Firestore instead of localStorage.
 */

import { format, subMonths } from 'date-fns';
import {
  addExpense,
  addShopExpense,
  addFriendTransaction,
  subscribeToExpenses,
  subscribeToShopExpenses,
  subscribeToFriendTransactions,
  deleteExpense,
  deleteShopExpense,
  deleteFriendTransaction,
} from '../services/firestoreService';

// Fixed expense templates per category (deterministic amounts)
const EXPENSE_TEMPLATES = [
  { category: 'food',          note: 'Zomato dinner order',         amount: 350 },
  { category: 'food',          note: 'Morning breakfast café',       amount: 120 },
  { category: 'food',          note: 'Swiggy lunch delivery',        amount: 280 },
  { category: 'food',          note: 'Weekly grocery shopping',      amount: 650 },
  { category: 'food',          note: "Domino's Pizza Friday night",  amount: 420 },
  { category: 'food',          note: 'Evening chai & snacks',        amount: 60  },
  { category: 'travel',        note: 'Ola cab to office',            amount: 180 },
  { category: 'travel',        note: 'Metro card recharge',          amount: 200 },
  { category: 'travel',        note: 'Petrol fill-up BPCL',         amount: 850 },
  { category: 'travel',        note: 'Rapido bike to mall',          amount: 75  },
  { category: 'shopping',      note: 'Myntra new t-shirts (2)',      amount: 799 },
  { category: 'shopping',      note: 'Amazon — USB-C cables',        amount: 349 },
  { category: 'shopping',      note: 'Sports shoes Nike',            amount: 1200},
  { category: 'education',     note: 'Udemy React course',           amount: 499 },
  { category: 'education',     note: 'Study books NCERT',            amount: 320 },
  { category: 'entertainment', note: 'Netflix subscription',         amount: 249 },
  { category: 'entertainment', note: 'Movie tickets — 2 seats PVR',  amount: 460 },
  { category: 'entertainment', note: 'Spotify Premium monthly',      amount: 119 },
  { category: 'bills',         note: 'MSEDCL electricity bill',      amount: 1100},
  { category: 'bills',         note: 'JioFiber internet recharge',   amount: 599 },
  { category: 'bills',         note: 'Jio mobile prepaid recharge',  amount: 299 },
  { category: 'health',        note: 'Gold Gym monthly membership',  amount: 800 },
  { category: 'health',        note: 'Apollo Pharmacy medicine',     amount: 340 },
  { category: 'health',        note: 'Dr. Sharma consultation fee',  amount: 500 },
  { category: 'others',        note: 'Temple donation',              amount: 100 },
  { category: 'others',        note: 'Haircut + beard trim',         amount: 150 },
];

// Day offsets for current month (deterministic spread)
const DAY_OFFSETS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];

// Amount variance per month (to show different spending each month)
const MONTH_VARIANCE = [0, -200, 350, -500, 150, -100]; // current to 5 months ago

/**
 * Inject demo data into Firestore for the given user.
 * @param {string} uid - Firebase user UID
 * @param {function} onComplete - Called when injection is done
 */
export const injectDemoData = async (uid) => {
  if (!uid) {
    console.error('[Demo] No uid provided');
    return;
  }

  const now = new Date();
  const expensePromises = [];

  // Generate expenses for current month + 5 previous months
  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const targetDate = subMonths(now, monthOffset);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const txCount = monthOffset === 0 ? 26 : Math.max(16, 22 - monthOffset * 2);
    const variance = MONTH_VARIANCE[monthOffset] || 0;

    for (let i = 0; i < txCount; i++) {
      const template = EXPENSE_TEMPLATES[i % EXPENSE_TEMPLATES.length];
      const dayOffset = DAY_OFFSETS[i % DAY_OFFSETS.length];
      const day = Math.min(dayOffset + 1, daysInMonth);
      const cappedDay = monthOffset === 0 ? Math.min(day, now.getDate()) : day;
      const txDate = new Date(year, month, cappedDay);
      const amount = Math.max(30, template.amount + Math.round(variance * (i % 3 === 0 ? 0.3 : 0.1)));

      expensePromises.push(
        addExpense(uid, {
          category: template.category,
          note: template.note,
          amount,
          date: format(txDate, 'yyyy-MM-dd'),
        })
      );
    }
  }

  // Shop expenses
  const shopData = [
    { amount: 450, itemDescription: 'Monthly grocery credit — Sharma Kirana Store', date: format(now, 'yyyy-MM-dd') },
    { amount: 1200, itemDescription: 'Headphones on udhar — Ravi Electronics', date: format(subMonths(now, 0), 'yyyy-MM-dd') },
    { amount: 280, itemDescription: 'Medicine credit balance — Gupta Medical Store', date: format(now, 'yyyy-MM-dd') },
    { amount: 320, itemDescription: 'Notebooks, pens — Patel Stationery', date: format(now, 'yyyy-MM-dd') },
  ];
  const shopPromises = shopData.map((s) => addShopExpense(uid, s));

  // Friend transactions
  const friendData = [
    { friendName: 'Rohit Sharma', amount: 500, description: 'Lent for movie night outing', date: format(now, 'yyyy-MM-dd') },
    { friendName: 'Aman Gupta', amount: 350, description: 'Borrowed for Goa trip travel', date: format(now, 'yyyy-MM-dd') },
    { friendName: 'Priya Patel', amount: 800, description: 'Emergency medical expense', date: format(now, 'yyyy-MM-dd') },
    { friendName: 'Rahul Mehta', amount: 200, description: 'Petrol money on the way', date: format(now, 'yyyy-MM-dd') },
  ];
  const friendPromises = friendData.map((f) => addFriendTransaction(uid, f));

  // Fire all writes concurrently
  await Promise.all([...expensePromises, ...shopPromises, ...friendPromises]);

  console.log('[Demo] Injected demo data to Firestore successfully');
};

/**
 * Clear ALL user data from Firestore (used to reset demo data).
 * WARNING: This deletes all expenses, shop expenses, and friend transactions for the user.
 * @param {string} uid - Firebase user UID
 */
export const clearDemoData = (uid, currentExpenses, currentShop, currentFriends) => {
  if (!uid) return;
  // Delete all current user data
  const deletePromises = [
    ...currentExpenses.map((e) => deleteExpense(uid, e.id)),
    ...currentShop.map((s) => deleteShopExpense(uid, s.id)),
    ...currentFriends.map((f) => deleteFriendTransaction(uid, f.id)),
  ];
  return Promise.all(deletePromises);
};
