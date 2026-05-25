import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { getLastNMonths } from '../../../utils/formatDate';
import { formatCurrency } from '../../../utils/formatCurrency';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-elevated px-3 py-2 text-sm">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      <p className="font-bold text-brand-purple-light">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

const MonthTrend = ({ expenses, selectedMonth }) => {
  const months = getLastNMonths(6);

  const trendData = useMemo(() => {
    return months.slice().reverse().map((m) => {
      const [year, month] = m.value.split('-').map(Number);
      const start = startOfMonth(new Date(year, month - 1));
      const end = endOfMonth(new Date(year, month - 1));
      const total = expenses
        .filter((e) => {
          try {
            const d = e.date ? parseISO(e.date) : parseISO(e.createdAt);
            return isWithinInterval(d, { start, end });
          } catch { return false; }
        })
        .reduce((sum, e) => sum + Number(e.amount), 0);

      return {
        month: m.label.split(' ')[0],
        fullLabel: m.label,
        amount: total,
        isSelected: m.value === selectedMonth,
      };
    });
  }, [expenses, selectedMonth]);

  // Compute trend vs prev month
  const currentIdx = trendData.findIndex((d) => {
    const m = months.find((mo) => mo.value === selectedMonth);
    return m && d.fullLabel === m.label;
  });

  const current = trendData[currentIdx];
  const prev = currentIdx > 0 ? trendData[currentIdx - 1] : null;
  let trendPct = null;
  let trendDir = 'flat';
  if (current && prev && prev.amount > 0) {
    trendPct = Math.round(((current.amount - prev.amount) / prev.amount) * 100);
    trendDir = trendPct > 0 ? 'up' : trendPct < 0 ? 'down' : 'flat';
  }

  const avgSpend = trendData.filter((d) => d.amount > 0).reduce((s, d, _, arr) => s + d.amount / arr.length, 0);

  return (
    <motion.div
      id="month-trend"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card mt-4 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-primary font-semibold">6-Month Trend</h3>
        {trendPct !== null && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            trendDir === 'up'
              ? 'bg-expense-red/10 text-expense-red border-expense-red/20'
              : trendDir === 'down'
              ? 'bg-income-green/10 text-income-green border-income-green/20'
              : 'bg-bg-elevated text-text-muted border-border-subtle'
          }`}>
            {trendDir === 'up' ? <TrendingUp size={11} /> : trendDir === 'down' ? <TrendingDown size={11} /> : <Minus size={11} />}
            {trendDir === 'up' ? '+' : ''}{trendPct}% vs last month
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={trendData} margin={{ top: 5, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
          <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          {avgSpend > 0 && (
            <ReferenceLine
              y={avgSpend}
              stroke="#475569"
              strokeDasharray="4 4"
              label={{ value: 'avg', position: 'right', fill: '#475569', fontSize: 9 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="amount"
            stroke="url(#trendGrad)"
            strokeWidth={2.5}
            dot={(props) => {
              const isSelected = trendData[props.index]?.isSelected;
              return (
                <circle
                  key={props.index}
                  cx={props.cx}
                  cy={props.cy}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? '#7C3AED' : '#3B82F6'}
                  stroke={isSelected ? '#fff' : '#0A0A0F'}
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{ r: 6, fill: '#9D5CF6', stroke: '#0A0A0F', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Mini month cards */}
      <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
        {trendData.map((d) => (
          <div
            key={d.fullLabel}
            className={`flex-shrink-0 text-center px-3 py-2 rounded-xl border transition-all ${
              d.isSelected
                ? 'bg-brand-purple/10 border-brand-purple/30'
                : 'bg-bg-elevated border-border-subtle'
            }`}
          >
            <p className={`text-xs font-semibold tabular-nums ${d.isSelected ? 'text-brand-purple-light' : 'text-text-muted'}`}>
              {d.amount > 0 ? formatCurrency(d.amount, true) : '—'}
            </p>
            <p className="text-text-disabled text-2xs mt-0.5">{d.month}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default MonthTrend;
