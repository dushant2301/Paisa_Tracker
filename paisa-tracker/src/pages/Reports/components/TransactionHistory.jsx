import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getCategoryById } from '../../../constants/categories';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import clsx from 'clsx';

const CATEGORIES = ['All', 'food', 'travel', 'shopping', 'education', 'entertainment', 'bills', 'health', 'others'];

const TransactionHistory = ({ monthExpenses }) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState('desc'); // desc = newest first
  const [showAll, setShowAll] = useState(false);

  const filtered = monthExpenses
    .filter((e) => {
      const matchCat = filter === 'All' || e.category === filter;
      const matchSearch = !search ||
        (e.notes || e.description || e.note || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.category || '').toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      const da = new Date(a.date || a.createdAt);
      const db = new Date(b.date || b.createdAt);
      return sortDir === 'desc' ? db - da : da - db;
    });

  const visible = showAll ? filtered : filtered.slice(0, 10);
  const totalAmount = filtered.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <motion.div
      id="transaction-history"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-card mt-4 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-primary font-semibold">Transaction History</h3>
        <span className="text-text-disabled text-xs">{filtered.length} of {monthExpenses.length}</span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
        <input
          id="tx-search"
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-dark pl-9 py-2 text-sm"
        />
      </div>

      {/* Category filter chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3 pb-0.5">
        {CATEGORIES.map((cat) => {
          const catInfo = cat !== 'All' ? getCategoryById(cat) : null;
          const isSelected = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={clsx(
                'flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200',
                isSelected
                  ? 'bg-brand-purple/15 border-brand-purple text-brand-purple-light'
                  : 'bg-bg-elevated border-border-subtle text-text-muted hover:border-border-bright'
              )}
            >
              {catInfo ? `${catInfo.emoji} ${catInfo.label}` : 'All'}
            </button>
          );
        })}
      </div>

      {/* Sort toggle */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-text-disabled text-xs">
          Total: <span className="text-expense-red font-semibold">{formatCurrency(totalAmount)}</span>
        </p>
        <button
          onClick={() => setSortDir((d) => d === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-1 text-text-disabled text-xs hover:text-text-muted transition-colors"
        >
          {sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      {/* Transactions list */}
      {filtered.length === 0 ? (
        <p className="text-text-disabled text-sm text-center py-4">No transactions match your filters</p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {visible.map((tx, i) => {
              const cat = getCategoryById(tx.category);
              let dateStr = '-';
              try { dateStr = format(new Date(tx.date || tx.createdAt), 'dd MMM'); } catch {}

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-border-subtle hover:border-border-bright transition-all duration-200"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                    style={{ background: cat.bgColor }}
                  >
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-medium truncate">
                      {tx.notes || tx.description || tx.note || cat.label}
                    </p>
                    <p className="text-text-disabled text-xs">{dateStr} · {cat.label}</p>
                  </div>
                  <p className="text-expense-red font-bold text-sm tabular-nums flex-shrink-0">
                    -{formatCurrency(tx.amount)}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {filtered.length > 10 && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="w-full mt-3 py-2.5 rounded-xl border border-border-default text-text-muted text-sm hover:bg-bg-elevated hover:text-text-secondary transition-all duration-200"
        >
          {showAll ? 'Show less ↑' : `Show all ${filtered.length} transactions ↓`}
        </button>
      )}
    </motion.div>
  );
};

export default TransactionHistory;
