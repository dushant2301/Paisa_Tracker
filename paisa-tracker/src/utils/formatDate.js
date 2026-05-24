import { format, formatDistanceToNow, isToday, isYesterday, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Format a date string for display
export const formatDate = (dateString) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'd MMM yyyy');
  } catch {
    return 'Invalid date';
  }
};

// Format with time
export const formatDateTime = (dateString) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, 'd MMM, h:mm a');
  } catch {
    return '';
  }
};

// Relative time (e.g., "2 hours ago")
export const formatRelative = (dateString) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '';
  }
};

// Format month label (e.g., "May 2026")
export const formatMonth = (dateString) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, 'MMMM yyyy');
  } catch {
    return '';
  }
};

// Short month (e.g., "May")
export const formatShortMonth = (dateString) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, 'MMM');
  } catch {
    return '';
  }
};

// Get current month range
export const getCurrentMonthRange = () => {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
};

// Check if a date is in current month
export const isCurrentMonth = (dateString) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    const { start, end } = getCurrentMonthRange();
    return isWithinInterval(date, { start, end });
  } catch {
    return false;
  }
};

// Get date string for today (for input[type=date])
export const getTodayString = () => format(new Date(), 'yyyy-MM-dd');

// Group items by date label
export const groupByDate = (items, dateKey = 'date') => {
  const groups = {};
  items.forEach((item) => {
    const label = formatDate(item[dateKey] || item.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });
  return groups;
};

// Get last N months as { label, value } for selectors
export const getLastNMonths = (n = 6) => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: format(d, 'MMM yyyy'),
      value: format(d, 'yyyy-MM'),
    });
  }
  return months;
};
