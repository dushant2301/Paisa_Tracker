/**
 * reportHistory.js
 * CRUD functions for report history stored in localStorage.
 */

const HISTORY_KEY = 'paisa_report_history';

const get = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const set = (data) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(data));
  } catch {
    console.error('Failed to save report history');
  }
};

export const getReportHistory = () => {
  return get().sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
};

export const saveReportToHistory = (meta) => {
  const history = get();
  // Avoid duplicate for same month — update if exists
  const existingIdx = history.findIndex((h) => h.yearMonth === meta.yearMonth);
  const entry = {
    id: `report_${meta.yearMonth}_${Date.now()}`,
    ...meta,
    generatedAt: new Date().toISOString(),
  };
  if (existingIdx >= 0) {
    history[existingIdx] = entry;
  } else {
    history.unshift(entry);
  }
  set(history);
  return entry;
};

export const deleteReportFromHistory = (id) => {
  const history = get().filter((h) => h.id !== id);
  set(history);
};

export const clearReportHistory = () => set([]);
