import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { formatCurrency } from '../../../utils/formatCurrency';
import { subscribeToReportHistory, deleteReportFromHistory } from '../../../utils/reportHistory';
import { useAuth } from '../../../context/AuthContext';
import { FileText, Download, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const ReportHistory = ({ onRedownload, refreshTrigger }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real-time subscription to Firestore report history
  useEffect(() => {
    if (!user?.uid) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToReportHistory(user.uid, (data) => {
      setHistory(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!user?.uid) return;
    setDeletingId(id);
    try {
      await deleteReportFromHistory(user.uid, id);
      toast.success('Report removed from history');
    } catch (err) {
      console.error('Error deleting report:', err);
      toast.error('Failed to delete report');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="glass-card mt-4 p-6 flex items-center justify-center gap-2">
        <div className="w-4 h-4 rounded-full border-2 border-brand-purple border-t-transparent animate-spin" />
        <p className="text-text-muted text-sm">Loading history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card mt-4 p-6 text-center"
      >
        <div className="w-14 h-14 bg-bg-elevated rounded-2xl flex items-center justify-center mx-auto mb-3">
          <FileText size={24} className="text-text-disabled" />
        </div>
        <p className="text-text-secondary font-medium mb-1">No Reports Generated Yet</p>
        <p className="text-text-disabled text-sm">
          Generate your first monthly report to see it here
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      id="report-history"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card mt-4 p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-brand-purple-light" />
        <h3 className="text-text-primary font-semibold">Report History</h3>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-bg-elevated text-text-muted border border-border-subtle">
          {history.length} report{history.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {history.map((report) => {
            let genDate = '';
            try { genDate = format(new Date(report.generatedAt), 'dd MMM yyyy, hh:mm a'); } catch {}

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                  deletingId === report.id
                    ? 'opacity-0 border-border-subtle'
                    : 'bg-bg-elevated border-border-subtle hover:border-border-bright'
                }`}
              >
                {/* Report icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.15))' }}>
                  <FileText size={18} className="text-brand-purple-light" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-semibold">
                    {report.monthLabel} Report
                  </p>
                  <p className="text-text-disabled text-xs">{genDate}</p>
                  {report.summary && (
                    <p className="text-text-muted text-xs mt-0.5">
                      {report.summary.txCount} transactions ·{' '}
                      <span className="text-expense-red">{formatCurrency(report.summary.totalSpent)}</span>
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    id={`redownload-${report.id}`}
                    onClick={() => onRedownload(report)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-purple/10 text-brand-purple-light text-xs font-medium hover:bg-brand-purple/20 transition-colors border border-brand-purple/20"
                  >
                    <Download size={11} />
                    PDF
                  </button>
                  <button
                    id={`delete-report-${report.id}`}
                    onClick={() => handleDelete(report.id)}
                    disabled={deletingId === report.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-text-disabled hover:text-expense-red hover:bg-expense-red-bg transition-all duration-200 disabled:opacity-40"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ReportHistory;
