import { motion } from 'framer-motion';
import { formatCurrency } from '../../../utils/formatCurrency';
import { Store, Users, CheckCircle, Clock } from 'lucide-react';

const PendingBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium ${
      status === 'pending'
        ? 'bg-pending-yellow-bg text-pending-yellow border border-pending-yellow/20'
        : 'bg-income-green-bg text-income-green border border-income-green/20'
    }`}
  >
    {status === 'pending' ? <Clock size={9} /> : <CheckCircle size={9} />}
    {status === 'pending' ? 'Pending' : 'Received'}
  </span>
);

const PendingAnalysis = ({ pendingAnalysis }) => {
  const {
    shopPending, shopReceived, shopPendingTotal, shopReceivedTotal,
    friendBreakdown, friendPendingTotal, friendReceivedTotal, friendRecoveryRate,
  } = pendingAnalysis;

  const shopTotal = shopPendingTotal + shopReceivedTotal;
  const shopRecoveryPct = shopTotal > 0 ? Math.round((shopReceivedTotal / shopTotal) * 100) : 0;

  return (
    <motion.div
      id="pending-analysis"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass-card mt-4 p-4"
    >
      <h3 className="text-text-primary font-semibold mb-4">Pending Money Analysis</h3>

      {/* ── Friends Section ──────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-brand-purple/10 rounded-lg flex items-center justify-center">
            <Users size={14} className="text-brand-purple-light" />
          </div>
          <div className="flex-1">
            <p className="text-text-secondary text-sm font-semibold">Friends Pending</p>
            <p className="text-text-disabled text-xs">Recovery rate: {friendRecoveryRate}%</p>
          </div>
          <div className="text-right">
            <p className="text-pending-yellow font-bold tabular-nums">{formatCurrency(friendPendingTotal)}</p>
            <p className="text-income-green text-xs tabular-nums">+{formatCurrency(friendReceivedTotal)} recovered</p>
          </div>
        </div>

        {/* Recovery progress bar */}
        <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${friendRecoveryRate}%` }}
            transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
            className="h-full rounded-full bg-income-green"
          />
        </div>

        {friendBreakdown.length > 0 ? (
          <div className="space-y-2">
            {friendBreakdown.map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-3 p-3 bg-bg-elevated rounded-xl border border-border-subtle"
              >
                <div className="w-8 h-8 rounded-full bg-brand-purple/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-purple-light font-bold text-sm">
                    {f.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate">{f.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {f.pending > 0 && (
                      <span className="text-pending-yellow text-xs">{formatCurrency(f.pending)} pending</span>
                    )}
                    {f.received > 0 && (
                      <span className="text-income-green text-xs">{formatCurrency(f.received)} got back</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {f.pending > 0 ? (
                    <span className="badge-pending">{formatCurrency(f.pending)}</span>
                  ) : (
                    <span className="badge-received">Cleared ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-disabled text-sm text-center py-3">No friend transactions recorded</p>
        )}
      </div>

      {/* ── Shop Section ─────────────────────────────────────── */}
      <div className="border-t border-border-subtle pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-pending-yellow/10 rounded-lg flex items-center justify-center">
            <Store size={14} className="text-pending-yellow" />
          </div>
          <div className="flex-1">
            <p className="text-text-secondary text-sm font-semibold">Shop Pending</p>
            <p className="text-text-disabled text-xs">Recovery: {shopRecoveryPct}%</p>
          </div>
          <div className="text-right">
            <p className="text-pending-yellow font-bold tabular-nums">{formatCurrency(shopPendingTotal)}</p>
            <p className="text-income-green text-xs">{shopReceived.length} cleared</p>
          </div>
        </div>

        {/* Recovery bar */}
        <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${shopRecoveryPct}%` }}
            transition={{ delay: 0.55, duration: 0.7, ease: 'easeOut' }}
            className="h-full rounded-full bg-pending-yellow"
          />
        </div>

        {shopPending.length > 0 ? (
          <div className="space-y-2">
            {shopPending.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 bg-bg-elevated rounded-xl border border-border-subtle"
              >
                <div className="w-8 h-8 rounded-full bg-pending-yellow/10 flex items-center justify-center flex-shrink-0">
                  <Store size={14} className="text-pending-yellow" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate">{s.shopName || s.name || 'Shop'}</p>
                  {s.notes && <p className="text-text-disabled text-xs truncate">{s.notes}</p>}
                </div>
                <span className="badge-pending">{formatCurrency(s.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-income-green-bg/30 rounded-xl border border-income-green/15">
            <CheckCircle size={16} className="text-income-green" />
            <p className="text-income-green text-sm">All shop dues cleared!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PendingAnalysis;
