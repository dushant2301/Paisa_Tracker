import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, AreaChart, Area,
} from 'recharts';
import { formatCurrency } from '../../../utils/formatCurrency';
import { TrendingUp, Calendar, Zap, Moon } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-elevated px-3 py-2 text-sm">
      <p className="text-text-muted text-xs mb-1">Day {label}</p>
      <p className="font-bold text-brand-purple-light">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

const WeeklyTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-elevated px-3 py-2 text-sm">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      <p className="font-bold text-income-green">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

const DailyAnalysis = ({ dailyAnalysis }) => {
  const { dailyData, highestDay, avgDaily, noSpendDays, weeklyTotals, weekendSpend, weekdaySpend } = dailyAnalysis;

  const totalSpend = weekendSpend + weekdaySpend;
  const weekendPct = totalSpend > 0 ? Math.round((weekendSpend / totalSpend) * 100) : 0;
  const weekdayPct = 100 - weekendPct;

  const statCards = [
    {
      label: 'Avg Daily Spend',
      value: formatCurrency(avgDaily),
      icon: TrendingUp,
      color: 'text-brand-blue-light',
      bg: 'bg-brand-blue/10',
      id: 'avg-daily',
    },
    {
      label: 'No-Spend Days',
      value: noSpendDays,
      icon: Moon,
      color: 'text-income-green',
      bg: 'bg-income-green/10',
      id: 'no-spend-days',
    },
    {
      label: 'Highest Day',
      value: highestDay ? formatCurrency(highestDay.amount) : '₹0',
      sub: highestDay?.dayLabel || '',
      icon: Zap,
      color: 'text-pending-yellow',
      bg: 'bg-pending-yellow/10',
      id: 'highest-day',
    },
    {
      label: 'Weekend Spend',
      value: formatCurrency(weekendSpend),
      sub: `${weekendPct}% of total`,
      icon: Calendar,
      color: 'text-expense-red',
      bg: 'bg-expense-red/10',
      id: 'weekend-spend',
    },
  ];

  return (
    <motion.div
      id="daily-analysis"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card mt-4 p-4"
    >
      <h3 className="text-text-primary font-semibold mb-4">Daily Spending Analysis</h3>

      {/* Stat mini cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} id={card.id} className="bg-bg-elevated rounded-xl p-3 border border-border-subtle">
              <div className={`w-7 h-7 ${card.bg} rounded-lg flex items-center justify-center mb-2`}>
                <Icon size={14} className={card.color} />
              </div>
              <p className={`font-bold text-base tabular-nums ${card.color}`}>{card.value}</p>
              <p className="text-text-disabled text-2xs uppercase tracking-wide mt-0.5">{card.label}</p>
              {card.sub && <p className="text-text-disabled text-2xs mt-0.5">{card.sub}</p>}
            </div>
          );
        })}
      </div>

      {/* Daily bar chart */}
      <p className="text-text-disabled text-xs uppercase tracking-wider mb-2">Daily Spending</p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={dailyData} margin={{ top: 2, right: 0, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
          <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 9 }} interval={4} />
          <YAxis tick={{ fill: '#94A3B8', fontSize: 9 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="amount" radius={[3, 3, 0, 0]} maxBarSize={12}>
            {dailyData.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.isWeekend ? '#3B82F6' : 'url(#dayGrad)'}
                fillOpacity={entry.amount > 0 ? 1 : 0.2}
              />
            ))}
          </Bar>
          <defs>
            <linearGradient id="dayGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.6} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#7C3AED' }} />
          <span className="text-text-disabled text-xs">Weekday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-brand-blue" />
          <span className="text-text-disabled text-xs">Weekend</span>
        </div>
      </div>

      {/* Weekly totals */}
      <p className="text-text-disabled text-xs uppercase tracking-wider mt-4 mb-2">Weekly Totals</p>
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={weeklyTotals} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
          <XAxis dataKey="week" tick={{ fill: '#94A3B8', fontSize: 10 }} />
          <YAxis tick={{ fill: '#94A3B8', fontSize: 9 }} />
          <Tooltip content={<WeeklyTooltip />} />
          <defs>
            <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#weekGrad)"
            dot={{ fill: '#10B981', r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Weekend vs Weekday split */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-text-muted text-xs">Weekday vs Weekend Split</span>
        </div>
        <div className="h-2 bg-bg-elevated rounded-full overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weekdayPct}%` }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="h-full rounded-l-full"
            style={{ background: 'linear-gradient(90deg, #7C3AED, #3B82F6)' }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weekendPct}%` }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="h-full rounded-r-full"
            style={{ background: '#3B82F6' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-text-disabled text-2xs">Weekday {weekdayPct}%</span>
          <span className="text-text-disabled text-2xs">Weekend {weekendPct}%</span>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyAnalysis;
