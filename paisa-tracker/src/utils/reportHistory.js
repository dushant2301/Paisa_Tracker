/**
 * reportHistory.js
 * Async Firestore-backed report history functions.
 * These functions require a userId (uid) — call them from authenticated contexts.
 *
 * These are wrapper helpers used by MonthlyReports.jsx and ReportHistory.jsx.
 * The actual Firestore operations are in services/firestoreService.js.
 */

import {
  saveReportHistory as fsSaveReportHistory,
  getReportHistory as fsGetReportHistory,
  subscribeToReportHistory as fsSubscribeToReportHistory,
  deleteReportHistory as fsDeleteReportHistory,
} from '../services/firestoreService';

/**
 * Save a report to history in Firestore.
 * @param {string} uid - Firebase user UID
 * @param {object} meta - { yearMonth, monthLabel, summary: { totalSpent, txCount } }
 * @returns {Promise<string>} Document ID
 */
export const saveReportToHistory = async (uid, meta) => {
  return await fsSaveReportHistory(uid, meta);
};

/**
 * Fetch all report history entries once.
 * @param {string} uid - Firebase user UID
 * @returns {Promise<Array>} Sorted array of report history entries
 */
export const getReportHistory = async (uid) => {
  return await fsGetReportHistory(uid);
};

/**
 * Subscribe to report history in real-time.
 * @param {string} uid
 * @param {function} callback
 * @returns {function} Unsubscribe function
 */
export const subscribeToReportHistory = (uid, callback) => {
  return fsSubscribeToReportHistory(uid, callback);
};

/**
 * Delete a report history entry.
 * @param {string} uid
 * @param {string} id - Report document ID
 */
export const deleteReportFromHistory = async (uid, id) => {
  return await fsDeleteReportHistory(uid, id);
};
