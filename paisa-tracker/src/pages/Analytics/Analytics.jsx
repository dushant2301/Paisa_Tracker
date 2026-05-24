import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Legend,
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths, eachDayOfInterval, isSameDay } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { getLastNMonths } from '../../utils/formatDate';
import { CATEGORIES, CHART_COLORS, getCategoryById } from '../../constants/categories';
import PageWrapper from '../../components/layout/PageWrapper';
import TopBar from '../../components/layout/TopBar';
import EmptyState from '../../components/ui/EmptyState';
import clsx from 'clsx';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-elevated px-3 py-2 text-sm">
      {label && <p className="text-text-muted text-xs mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-semibold">
          {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

const Analytics = () => {
  const { expenses } = useApp();
  const months = getLastNMonths(6);
  const [selectedMonth, setSelectedMonth] = useState(months[0].value);

  // Filter expenses for selected month
  const monthExpenses = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));
    return expenses.filter((e) => {
      try {
        const d = e.date ? parseISO(e.date) : parseISO(e.createdAt);
        return isWithinInterval(d, { start, end });
      } catch { return false; }
    });
  }, [expenses, selectedMonth]);

  const totalSpend = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const avgDaily = monthExpenses.length > 0 ? totalSpend / 30 : 0;

  // Category pie data
  const pieData = useMemo(() => {
    const catMap = {};
    monthExpenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(catMap)
      .map(([id, value]) => ({ id, name: getCategoryById(id).label, value, emoji: getCategoryById(id).emoji }))
      .sort((a, b) => b.value - a.value);
  }, [monthExpenses]);

  // Daily bar data
  const dailyData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));
    const days = eachDayOfInterval({ start, end });
    return days.map((day) => ({
      day: format(day, 'd'),
      amount: monthExpenses
        .filter((e) => {
          try { return isSameDay(e.date ? parseISO(e.date) : parseISO(e.createdAt), day); }
          catch { return false; }
        })
        .reduce((sum, e) => sum + Number(e.amount), 0),
    })).filter((d, i) => i < 31);
  }, [monthExpenses, selectedMonth]);

  // 6-month trend
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
      return { month: m.label.split(' ')[0], amount: total };
    });
  }, [expenses, months]);

  const topCategory = pieData[0];

  return (
    <PageWrapper>
      <div className="page-container">
        <TopBar title="Analytics" subtitle="Financial overview" />

        {/* Month selector */}
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {months.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMonth(m.value)}
              className={clsx(
                'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200',
                selectedMonth === m.value
                  ? 'bg-brand-purple/15 border-brand-purple text-brand-purple-light'
                  : 'bg-bg-elevated border-border-subtle text-text-muted hover:border-border-bright'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Summary stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 mt-4"
        >
          {[
            { label: 'Total Spent', value: formatCurrency(totalSpend, true), color: 'text-expense-red' },
            { label: 'Avg/Day', value: formatCurrency(avgDaily, true), color: 'text-brand-purple-light' },
            { label: 'Transactions', value: monthExpenses.length, color: 'text-income-green' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-3 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-text-disabled text-2xs uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {monthExpenses.length === 0 ? (
          <EmptyState
            emoji="📊"
            title="No data for this month"
            description="Add expenses to see analytics"
          />
        ) : (
          <>
            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card mt-4 p-4"
            >
              <h3 className="text-text-primary font-semibold mb-4">Spending by Category</h3>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={entry.id} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 w-full sm:w-auto">
                  {pieData.slice(0, 5).map((entry, idx) => (
                    <div key={entry.id} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      <span className="text-text-muted text-xs flex-1">{entry.emoji} {entry.name}</span>
                      <span className="text-text-primary text-xs font-semibold">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {topCategory && (
                <div className="mt-3 px-3 py-2 rounded-xl bg-brand-purple/8 border border-brand-purple/15">
                  <p className="text-text-muted text-xs">🔥 Top category: <span className="text-brand-purple-light font-semibold">{topCategory.emoji} {topCategory.name}</span> — {formatCurrency(topCategory.value)}</p>
                </div>
              )}
            </motion.div>

            {/* Daily Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card mt-4 p-4"
            >
              <h3 className="text-text-primary font-semibold mb-4">Daily Spending</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
                  <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 10 }} interval={4} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* 6-month trend */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card mt-4 p-4"
            >
              <h3 className="text-text-primary font-semibold mb-4">6-Month Trend</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
                  <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    dot={{ fill: '#7C3AED', r: 4, strokeWidth: 2, stroke: '#0A0A0F' }}
                    activeDot={{ r: 6, fill: '#9D5CF6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}

        <div className="h-4" />
      </div>
    </PageWrapper>
  );
};

export default Analytics;
