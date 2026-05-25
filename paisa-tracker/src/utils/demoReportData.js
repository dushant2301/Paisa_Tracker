/**
 * demoReportData.js
 * Seed demo data for the Monthly Report feature demonstration.
 * Generates deterministic, realistic data across current + 5 previous months.
 */

import { format, subMonths } from 'date-fns';

const makeId = (prefix, i) => `${prefix}_demo_${i}_${Date.now()}`;

// Fixed expense templates per category (deterministic amounts)
const EXPENSE_TEMPLATES = [
  { category: 'food',          notes: 'Zomato dinner order',         amount: 350 },
  { category: 'food',          notes: 'Morning breakfast café',       amount: 120 },
  { category: 'food',          notes: 'Swiggy lunch delivery',        amount: 280 },
  { category: 'food',          notes: 'Weekly grocery shopping',      amount: 650 },
  { category: 'food',          notes: "Domino's Pizza Friday night",  amount: 420 },
  { category: 'food',          notes: 'Evening chai & snacks',        amount: 60  },
  { category: 'travel',        notes: 'Ola cab to office',            amount: 180 },
  { category: 'travel',        notes: 'Metro card recharge',          amount: 200 },
  { category: 'travel',        notes: 'Petrol fill-up BPCL',         amount: 850 },
  { category: 'travel',        notes: 'Rapido bike to mall',          amount: 75  },
  { category: 'shopping',      notes: 'Myntra new t-shirts (2)',      amount: 799 },
  { category: 'shopping',      notes: 'Amazon — USB-C cables',        amount: 349 },
  { category: 'shopping',      notes: 'Sports shoes Nike',            amount: 1200},
  { category: 'education',     notes: 'Udemy React course',           amount: 499 },
  { category: 'education',     notes: 'Study books NCERT',            amount: 320 },
  { category: 'entertainment', notes: 'Netflix subscription',         amount: 249 },
  { category: 'entertainment', notes: 'Movie tickets — 2 seats PVR',  amount: 460 },
  { category: 'entertainment', notes: 'Spotify Premium monthly',      amount: 119 },
  { category: 'bills',         notes: 'MSEDCL electricity bill',      amount: 1100},
  { category: 'bills',         notes: 'JioFiber internet recharge',   amount: 599 },
  { category: 'bills',         notes: 'Jio mobile prepaid recharge',  amount: 299 },
  { category: 'health',        notes: 'Gold Gym monthly membership',  amount: 800 },
  { category: 'health',        notes: 'Apollo Pharmacy medicine',     amount: 340 },
  { category: 'health',        notes: 'Dr. Sharma consultation fee',  amount: 500 },
  { category: 'others',        notes: 'Temple donation',              amount: 100 },
  { category: 'others',        notes: 'Haircut + beard trim',         amount: 150 },
];

// Day offsets for current month (deterministic spread)
const DAY_OFFSETS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];

// Amount variance per month (to show different spending each month)
const MONTH_VARIANCE = [0, -200, 350, -500, 150, -100]; // current to 5 months ago

export const injectDemoData = () => {
  const now = new Date();
  const expenses = [];
  let expIdx = 0;

  // Generate for current month + 5 previous months
  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const targetDate = subMonths(now, monthOffset);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // How many transactions for this month (more recent = more)
    const txCount = monthOffset === 0 ? 26 : Math.max(16, 22 - monthOffset * 2);
    const variance = MONTH_VARIANCE[monthOffset] || 0;

    for (let i = 0; i < txCount; i++) {
      const template = EXPENSE_TEMPLATES[i % EXPENSE_TEMPLATES.length];
      // Deterministic day: spread across month
      const dayOffset = DAY_OFFSETS[i % DAY_OFFSETS.length];
      const day = Math.min(dayOffset + 1, daysInMonth);
      // Don't go past today for current month
      const cappedDay = monthOffset === 0 ? Math.min(day, now.getDate()) : day;
      const txDate = new Date(year, month, cappedDay);

      const amount = Math.max(30, template.amount + Math.round(variance * (i % 3 === 0 ? 0.3 : 0.1)));

      expenses.push({
        id: makeId('exp', expIdx++),
        category: template.category,
        notes: template.notes,
        amount,
        date: format(txDate, 'yyyy-MM-dd'),
        createdAt: txDate.toISOString(),
      });
    }
  }

  // ── Shop Expenses ──────────────────────────────────────────────────────
  const shopExpenses = [
    {
      id: makeId('shop', 1),
      shopName: 'Sharma Kirana Store',
      amount: 450,
      status: 'pending',
      notes: 'Monthly grocery credit',
      createdAt: subMonths(now, 0).toISOString(),
    },
    {
      id: makeId('shop', 2),
      shopName: 'Ravi Electronics',
      amount: 1200,
      status: 'pending',
      notes: 'Headphones on udhar',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12).toISOString(),
    },
    {
      id: makeId('shop', 3),
      shopName: 'Gupta Medical Store',
      amount: 280,
      status: 'pending',
      notes: 'Medicine credit balance',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3).toISOString(),
    },
    {
      id: makeId('shop', 4),
      shopName: 'City Bakery',
      amount: 150,
      status: 'received',
      notes: 'Bread, biscuits, cakes',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 20).toISOString(),
      receivedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15).toISOString(),
    },
    {
      id: makeId('shop', 5),
      shopName: 'Fresh Vegetables Mandi',
      amount: 900,
      status: 'received',
      notes: 'Weekly vegetable supply',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 25).toISOString(),
      receivedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 18).toISOString(),
    },
    {
      id: makeId('shop', 6),
      shopName: 'Patel Stationery',
      amount: 320,
      status: 'pending',
      notes: 'Notebooks, pens, highlighters',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8).toISOString(),
    },
  ];

  // ── Friend Transactions ────────────────────────────────────────────────
  const friendTransactions = [
    {
      id: makeId('friend', 1),
      name: 'Rohit Sharma',
      amount: 500,
      status: 'pending',
      notes: 'Lent for movie night outing',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10).toISOString(),
    },
    {
      id: makeId('friend', 2),
      name: 'Aman Gupta',
      amount: 350,
      status: 'pending',
      notes: 'Borrowed for Goa trip travel',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString(),
    },
    {
      id: makeId('friend', 3),
      name: 'Priya Patel',
      amount: 800,
      status: 'pending',
      notes: 'Emergency medical expense',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15).toISOString(),
    },
    {
      id: makeId('friend', 4),
      name: 'Vikas Kumar',
      amount: 250,
      status: 'received',
      notes: 'Old pending debt cleared',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).toISOString(),
      receivedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5).toISOString(),
    },
    {
      id: makeId('friend', 5),
      name: 'Neha Singh',
      amount: 600,
      status: 'received',
      notes: 'Shared grocery bill payment',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 22).toISOString(),
      receivedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14).toISOString(),
    },
    {
      id: makeId('friend', 6),
      name: 'Rahul Mehta',
      amount: 200,
      status: 'pending',
      notes: 'Petrol money on the way',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4).toISOString(),
    },
    {
      id: makeId('friend', 7),
      name: 'Aman Gupta',
      amount: 150,
      status: 'received',
      notes: 'Snacks split at Blinkit',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 18).toISOString(),
      receivedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12).toISOString(),
    },
  ];

  // Save to localStorage
  localStorage.setItem('paisa_expenses', JSON.stringify(expenses));
  localStorage.setItem('paisa_shop', JSON.stringify(shopExpenses));
  localStorage.setItem('paisa_friends', JSON.stringify(friendTransactions));

  console.log(`[Demo] Injected ${expenses.length} expenses across 6 months`);
  return { expenses, shopExpenses, friendTransactions };
};

export const clearDemoData = () => {
  localStorage.removeItem('paisa_expenses');
  localStorage.removeItem('paisa_shop');
  localStorage.removeItem('paisa_friends');
  localStorage.removeItem('paisa_report_history');
};
