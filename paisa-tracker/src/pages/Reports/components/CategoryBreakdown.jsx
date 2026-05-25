import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../../../utils/formatCurrency';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="glass-card-elevated px-3 py-2 text-sm">
      <p className="text-text-muted text-xs mb-1">{d.payload?.label || d.name}</p>
      <p className="font-bold" style={{ color: d.payload?.chartColor || d.fill }}>
        {formatCurrency(d.value)}
      </p>
      {d.payload?.pct !== undefined && (
        <p className="text-text-disabled text-xs">{d.payload.pct}% of total</p>
      )}
    </div>
  );
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, pct }) => {
  if (pct < 8) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>
      {pct}%
    </text>
  );
};

const CategoryBreakdown = ({ categoryBreakdown }) => {
  if (!categoryBreakdown || categoryBreakdown.length === 0) {
    return (
      <div className="glass-card mt-4 p-4 text-center">
        <p className="text-text-disabled text-sm">No category data for this month</p>
      </div>
    );
  }


  return (
    <motion.div
      id="category-breakdown"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card mt-4 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-semibold">Category Breakdown</h3>
        <span className="text-text-disabled text-xs">{categoryBreakdown.length} categories</span>
      </div>

      {/* Donut Pie + Legend */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <div className="w-full sm:w-auto flex-shrink-0">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="amount"
                labelLine={false}
                label={renderCustomLabel}
              >
                {categoryBreakdown.map((entry) => (
                  <Cell key={entry.id} fill={entry.chartColor} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-2 w-full">
          {categoryBreakdown.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: cat.chartColor }}
              />
              <span className="text-text-muted text-xs flex-1 truncate">
                {cat.emoji} {cat.label}
              </span>
              <span className="text-text-primary text-xs font-semibold tabular-nums">
                {formatCurrency(cat.amount)}
              </span>
              <span className="text-text-disabled text-xs w-10 text-right">{cat.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Horizontal bar chart */}
      <div className="mt-2">
        <p className="text-text-disabled text-xs uppercase tracking-wider mb-3">Amount by Category</p>
        <ResponsiveContainer width="100%" height={Math.max(categoryBreakdown.length * 36, 120)}>
          <BarChart
            data={categoryBreakdown}
            layout="vertical"
            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {categoryBreakdown.map((entry) => (
                <Cell key={entry.id} fill={entry.chartColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Progress bars table */}
      <div className="mt-4 space-y-2.5">
        {categoryBreakdown.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-text-secondary text-xs font-medium">
                {cat.emoji} {cat.label}
              </span>
              <span className="text-text-muted text-xs">{formatCurrency(cat.amount)}</span>
            </div>
            <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cat.pct}%` }}
                transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: cat.chartColor }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CategoryBreakdown;
