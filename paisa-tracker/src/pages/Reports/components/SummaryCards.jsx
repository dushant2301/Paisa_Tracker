import { motion } from 'framer-motion';
import { formatCurrency } from '../../../utils/formatCurrency';
import { TrendingDown, TrendingUp, Clock, RefreshCw } from 'lucide-react';

const SummaryCards = ({ summary }) => {
  const cards = [
    {
      label: 'Total Spent',
      value: formatCurrency(summary.totalSpent),
      icon: TrendingDown,
      gradient: 'from-red-900/40 to-red-950/20',
      border: 'border-expense-red/20',
      iconBg: 'bg-expense-red/10',
      iconColor: 'text-expense-red',
      valueColor: 'text-expense-red',
      id: 'card-total-spent',
    },
    {
      label: 'Transactions',
      value: summary.txCount,
      icon: RefreshCw,
      gradient: 'from-blue-900/30 to-blue-950/20',
      border: 'border-brand-blue/20',
      iconBg: 'bg-brand-blue/10',
      iconColor: 'text-brand-blue-light',
      valueColor: 'text-brand-blue-light',
      id: 'card-tx-count',
    },
    {
      label: 'Shop Pending',
      value: formatCurrency(summary.pendingShop),
      icon: Clock,
      gradient: 'from-yellow-900/30 to-yellow-950/20',
      border: 'border-pending-yellow/20',
      iconBg: 'bg-pending-yellow/10',
      iconColor: 'text-pending-yellow',
      valueColor: 'text-pending-yellow',
      id: 'card-shop-pending',
    },
    {
      label: 'Friend Pending',
      value: formatCurrency(summary.pendingFriend),
      icon: TrendingUp,
      gradient: 'from-purple-900/30 to-purple-950/20',
      border: 'border-brand-purple/20',
      iconBg: 'bg-brand-purple/10',
      iconColor: 'text-brand-purple-light',
      valueColor: 'text-brand-purple-light',
      id: 'card-friend-pending',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mt-4" id="summary-cards">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            id={card.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            className={`glass-card p-4 bg-gradient-to-br ${card.gradient} border ${card.border} relative overflow-hidden`}
          >
            {/* Background glow */}
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-xl"
              style={{ background: card.valueColor.replace('text-', '') }} />

            <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={card.iconColor} />
            </div>
            <p className="text-text-disabled text-xs uppercase tracking-wider font-medium mb-1">
              {card.label}
            </p>
            <p className={`text-xl font-bold tabular-nums ${card.valueColor}`}>
              {card.value}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
