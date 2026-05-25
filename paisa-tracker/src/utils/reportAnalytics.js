/**
 * reportAnalytics.js
 * Pure functions that compute all monthly report data from raw data arrays.
 * No side effects — safe to use in useMemo hooks.
 */

import {
  parseISO, startOfMonth, endOfMonth, isWithinInterval,
  format, isSameDay, getDay, eachDayOfInterval, eachWeekOfInterval,
  startOfWeek, endOfWeek, getDaysInMonth, differenceInCalendarDays,
} from 'date-fns';
import { getCategoryById, CHART_COLORS } from '../constants/categories';

// ─── Helpers ────────────────────────────────────────────────────────────────

const safeParseDate = (item) => {
  try {
    const s = item.date || item.createdAt;
    return s ? parseISO(s) : null;
  } catch {
    return null;
  }
};

const getMonthRange = (yearMonth) => {
  const [year, month] = yearMonth.split('-').map(Number);
  const base = new Date(year, month - 1, 1);
  return { start: startOfMonth(base), end: endOfMonth(base) };
};

// ─── 1. Filter expenses for a given month ───────────────────────────────────

export const getMonthExpenses = (expenses, yearMonth) => {
  const { start, end } = getMonthRange(yearMonth);
  return expenses.filter((e) => {
    const d = safeParseDate(e);
    return d && isWithinInterval(d, { start, end });
  });
};

// ─── 2. Financial Summary ────────────────────────────────────────────────────

export const computeSummary = (monthExpenses, shopExpenses, friendTxs, yearMonth) => {
  const { start, end } = getMonthRange(yearMonth);

  const totalSpent = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const txCount = monthExpenses.length;

  // Shop pending (all-time pending, not month-filtered — as per doc)
  const pendingShop = shopExpenses
    .filter((s) => s.status === 'pending')
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const receivedShop = shopExpenses
    .filter((s) => s.status === 'received')
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const pendingFriend = friendTxs
    .filter((f) => f.status === 'pending')
    .reduce((sum, f) => sum + Number(f.amount), 0);

  const receivedFriend = friendTxs
    .filter((f) => f.status === 'received')
    .reduce((sum, f) => sum + Number(f.amount), 0);

  const totalPending = pendingShop + pendingFriend;
  const totalReceived = receivedShop + receivedFriend;

  return {
    totalSpent,
    txCount,
    pendingShop,
    pendingFriend,
    totalPending,
    totalReceived,
    receivedShop,
    receivedFriend,
  };
};

// ─── 3. Category Breakdown ───────────────────────────────────────────────────

export const computeCategoryBreakdown = (monthExpenses) => {
  const catMap = {};
  monthExpenses.forEach((e) => {
    catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
  });

  const total = Object.values(catMap).reduce((s, v) => s + v, 0);

  const breakdown = Object.entries(catMap)
    .map(([id, amount], idx) => {
      const cat = getCategoryById(id);
      return {
        id,
        label: cat.label,
        emoji: cat.emoji,
        color: cat.color,
        chartColor: CHART_COLORS[idx % CHART_COLORS.length],
        amount,
        pct: total > 0 ? Math.round((amount / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return breakdown;
};

// ─── 4. Daily Analysis ───────────────────────────────────────────────────────

export const computeDailyAnalysis = (monthExpenses, yearMonth) => {
  const { start, end } = getMonthRange(yearMonth);
  const days = eachDayOfInterval({ start, end });

  const dailyData = days.map((day) => {
    const dayExpenses = monthExpenses.filter((e) => {
      const d = safeParseDate(e);
      return d && isSameDay(d, day);
    });
    const amount = dayExpenses.reduce((s, e) => s + Number(e.amount), 0);
    const dayOfWeek = getDay(day); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return {
      day: format(day, 'd'),
      dayLabel: format(day, 'EEE, d MMM'),
      fullDate: day,
      amount,
      isWeekend,
      txCount: dayExpenses.length,
    };
  });

  const nonZeroDays = dailyData.filter((d) => d.amount > 0);
  const highestDay = nonZeroDays.reduce(
    (max, d) => (d.amount > (max?.amount || 0) ? d : max),
    null
  );

  const totalDays = getDaysInMonth(start);
  const avgDaily = monthExpenses.length > 0
    ? monthExpenses.reduce((s, e) => s + Number(e.amount), 0) / totalDays
    : 0;

  const noSpendDays = dailyData.filter((d) => d.amount === 0).length;

  // Weekly totals
  const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }); // Mon start
  const weeklyTotals = weeks.map((weekStart, idx) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekExpenses = monthExpenses.filter((e) => {
      const d = safeParseDate(e);
      return d && isWithinInterval(d, {
        start: weekStart < start ? start : weekStart,
        end: weekEnd > end ? end : weekEnd,
      });
    });
    return {
      week: `Week ${idx + 1}`,
      amount: weekExpenses.reduce((s, e) => s + Number(e.amount), 0),
    };
  });

  // Weekend vs weekday spending
  const weekendSpend = dailyData
    .filter((d) => d.isWeekend)
    .reduce((s, d) => s + d.amount, 0);
  const weekdaySpend = dailyData
    .filter((d) => !d.isWeekend)
    .reduce((s, d) => s + d.amount, 0);

  return {
    dailyData,
    highestDay,
    avgDaily,
    noSpendDays,
    weeklyTotals,
    weekendSpend,
    weekdaySpend,
    totalDays,
  };
};

// ─── 5. Pending Analysis ─────────────────────────────────────────────────────

export const computePendingAnalysis = (shopExpenses, friendTxs) => {
  // Shop pending entries
  const shopPending = shopExpenses.filter((s) => s.status === 'pending');
  const shopReceived = shopExpenses.filter((s) => s.status === 'received');
  const shopPendingTotal = shopPending.reduce((s, e) => s + Number(e.amount), 0);
  const shopReceivedTotal = shopReceived.reduce((s, e) => s + Number(e.amount), 0);

  // Friend-wise breakdown
  const friendMap = {};
  friendTxs.forEach((f) => {
    if (!friendMap[f.name]) {
      friendMap[f.name] = { name: f.name, pending: 0, received: 0, txs: [] };
    }
    if (f.status === 'pending') {
      friendMap[f.name].pending += Number(f.amount);
    } else {
      friendMap[f.name].received += Number(f.amount);
    }
    friendMap[f.name].txs.push(f);
  });

  const friendBreakdown = Object.values(friendMap).sort((a, b) => b.pending - a.pending);
  const friendPendingTotal = friendBreakdown.reduce((s, f) => s + f.pending, 0);
  const friendReceivedTotal = friendBreakdown.reduce((s, f) => s + f.received, 0);

  const friendRecoveryRate =
    friendPendingTotal + friendReceivedTotal > 0
      ? Math.round((friendReceivedTotal / (friendPendingTotal + friendReceivedTotal)) * 100)
      : 0;

  return {
    shopPending,
    shopReceived,
    shopPendingTotal,
    shopReceivedTotal,
    friendBreakdown,
    friendPendingTotal,
    friendReceivedTotal,
    friendRecoveryRate,
  };
};

// ─── 6. Smart Insights ───────────────────────────────────────────────────────

export const generateInsights = (summary, categoryBreakdown, dailyAnalysis, pendingAnalysis, prevSummary) => {
  const insights = [];
  const { totalSpent, txCount } = summary;
  const { highestDay, avgDaily, noSpendDays, weekendSpend, weekdaySpend } = dailyAnalysis;
  const { friendRecoveryRate, friendPendingTotal, shopPendingTotal } = pendingAnalysis;

  // 1. Month-over-month comparison
  if (prevSummary && prevSummary.totalSpent > 0) {
    const diff = totalSpent - prevSummary.totalSpent;
    const pct = Math.abs(Math.round((diff / prevSummary.totalSpent) * 100));
    if (diff > 0) {
      insights.push({
        type: 'warning',
        icon: '📈',
        text: `Your total spending is up ${pct}% compared to last month.`,
        detail: `This month: ₹${totalSpent.toLocaleString('en-IN')} vs last month: ₹${prevSummary.totalSpent.toLocaleString('en-IN')}`,
      });
    } else if (diff < 0) {
      insights.push({
        type: 'positive',
        icon: '📉',
        text: `Great job! You spent ${pct}% less compared to last month.`,
        detail: `Saved ₹${Math.abs(diff).toLocaleString('en-IN')} vs last month`,
      });
    }
  }

  // 2. Top category insight
  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    if (top.pct >= 40) {
      insights.push({
        type: 'warning',
        icon: top.emoji,
        text: `${top.label} consumed ${top.pct}% of your total spending — your biggest expense category.`,
        detail: `₹${top.amount.toLocaleString('en-IN')} spent on ${top.label}`,
      });
    } else {
      insights.push({
        type: 'info',
        icon: top.emoji,
        text: `${top.label} was your top spending category at ${top.pct}% of total expenses.`,
        detail: `₹${top.amount.toLocaleString('en-IN')} on ${top.label}`,
      });
    }
  }

  // 3. Weekend vs weekday
  if (weekendSpend + weekdaySpend > 0) {
    const weekendPct = Math.round((weekendSpend / (weekendSpend + weekdaySpend)) * 100);
    if (weekendPct > 50) {
      insights.push({
        type: 'info',
        icon: '🎉',
        text: `Most of your spending (${weekendPct}%) happened during weekends.`,
        detail: `Weekend: ₹${weekendSpend.toLocaleString('en-IN')} | Weekday: ₹${weekdaySpend.toLocaleString('en-IN')}`,
      });
    } else {
      insights.push({
        type: 'info',
        icon: '💼',
        text: `You spent more on weekdays (${100 - weekendPct}%) than weekends this month.`,
        detail: `Weekday: ₹${weekdaySpend.toLocaleString('en-IN')} | Weekend: ₹${weekendSpend.toLocaleString('en-IN')}`,
      });
    }
  }

  // 4. No-spend days
  if (noSpendDays > 0) {
    insights.push({
      type: 'positive',
      icon: '🧘',
      text: `You had ${noSpendDays} no-spend day${noSpendDays > 1 ? 's' : ''} this month — excellent discipline!`,
      detail: `${noSpendDays} out of ${dailyAnalysis.totalDays} days with zero spending`,
    });
  }

  // 5. Highest spend day
  if (highestDay) {
    insights.push({
      type: 'info',
      icon: '🔥',
      text: `Your highest spending day was ${highestDay.dayLabel} with ₹${highestDay.amount.toLocaleString('en-IN')}.`,
      detail: `${highestDay.txCount} transaction${highestDay.txCount > 1 ? 's' : ''} on that day`,
    });
  }

  // 6. Friend recovery rate
  if (friendPendingTotal + pendingAnalysis.friendReceivedTotal > 0) {
    if (friendRecoveryRate < 40) {
      insights.push({
        type: 'warning',
        icon: '👥',
        text: `You've only recovered ${friendRecoveryRate}% of money lent to friends — follow up soon!`,
        detail: `Still pending: ₹${friendPendingTotal.toLocaleString('en-IN')}`,
      });
    } else if (friendRecoveryRate >= 80) {
      insights.push({
        type: 'positive',
        icon: '✅',
        text: `You've recovered ${friendRecoveryRate}% of money lent to friends — great recovery rate!`,
        detail: `Still pending: ₹${friendPendingTotal.toLocaleString('en-IN')}`,
      });
    } else {
      insights.push({
        type: 'info',
        icon: '👥',
        text: `Friend money recovery rate is ${friendRecoveryRate}%. ₹${friendPendingTotal.toLocaleString('en-IN')} still pending.`,
        detail: '',
      });
    }
  }

  // 7. Shop pending
  if (shopPendingTotal > 0) {
    insights.push({
      type: 'warning',
      icon: '🏪',
      text: `You have ₹${shopPendingTotal.toLocaleString('en-IN')} in pending shop expenses to clear.`,
      detail: `${pendingAnalysis.shopPending.length} shop entries still unpaid`,
    });
  }

  // 8. Transaction frequency
  if (txCount > 0) {
    const perDay = (txCount / dailyAnalysis.totalDays).toFixed(1);
    insights.push({
      type: 'info',
      icon: '📊',
      text: `You made ${txCount} transactions this month — averaging ${perDay} per day.`,
      detail: `Daily avg spend: ₹${avgDaily.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
    });
  }

  // 9. Category diversity
  if (categoryBreakdown.length >= 5) {
    insights.push({
      type: 'positive',
      icon: '🌈',
      text: `Your spending was spread across ${categoryBreakdown.length} categories — good financial diversity.`,
      detail: '',
    });
  }

  return insights;
};
