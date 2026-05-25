import { motion } from 'framer-motion';

const typeConfig = {
  warning: {
    bg: 'bg-pending-yellow/6',
    border: 'border-pending-yellow/20',
    bar: 'bg-pending-yellow',
    badge: 'bg-pending-yellow-bg text-pending-yellow border-pending-yellow/20',
    label: '⚠️ Watch',
  },
  positive: {
    bg: 'bg-income-green/6',
    border: 'border-income-green/20',
    bar: 'bg-income-green',
    badge: 'bg-income-green-bg text-income-green border-income-green/20',
    label: '✅ Great',
  },
  info: {
    bg: 'bg-brand-blue/6',
    border: 'border-brand-blue/20',
    bar: 'bg-brand-blue',
    badge: 'bg-blue-950/50 text-brand-blue-light border-brand-blue/20',
    label: '💡 Insight',
  },
};

const SmartInsights = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="glass-card mt-4 p-4 text-center">
        <p className="text-text-disabled text-sm">No insights available yet — add more transactions!</p>
      </div>
    );
  }

  return (
    <motion.div
      id="smart-insights"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card mt-4 p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🧠</span>
        <h3 className="text-text-primary font-semibold">Smart Financial Insights</h3>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple-light border border-brand-purple/20">
          {insights.length} insights
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((ins, i) => {
          const cfg = typeConfig[ins.type] || typeConfig.info;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.06 }}
              className={`relative flex gap-3 p-3.5 rounded-xl border ${cfg.bg} ${cfg.border} overflow-hidden`}
            >
              {/* Left accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar} rounded-l-xl`} />

              <span className="text-xl flex-shrink-0 ml-2">{ins.icon}</span>

              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm font-medium leading-snug">{ins.text}</p>
                {ins.detail && (
                  <p className="text-text-disabled text-xs mt-1">{ins.detail}</p>
                )}
              </div>

              <span className={`self-start flex-shrink-0 text-2xs font-medium px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                {cfg.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SmartInsights;
