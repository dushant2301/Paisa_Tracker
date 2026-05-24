import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Edit2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, groupByDate } from '../../utils/formatDate';
import { CATEGORIES, getCategoryById } from '../../constants/categories';
import PageWrapper from '../../components/layout/PageWrapper';
import TopBar from '../../components/layout/TopBar';
import FAB from '../../components/FAB';
import AddExpenseModal from './AddExpenseModal';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const Expenses = () => {
  const { expenses, deleteExpense } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchCat = selectedCat === 'all' || e.category === selectedCat;
      const matchSearch = !search || 
        e.note?.toLowerCase().includes(search.toLowerCase()) ||
        getCategoryById(e.category).label.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [expenses, search, selectedCat]);

  const grouped = groupByDate(filtered, 'date');
  const totalFiltered = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleDelete = (expense) => {
    deleteExpense(expense.id);
    toast.success('Expense deleted');
    setDeleteConfirm(null);
  };

  return (
    <PageWrapper>
      <div className="page-container">
        <TopBar
          title="Expenses"
          subtitle="Track your spending"
          showSearch
          onSearch={() => setShowSearch((s) => !s)}
        />

        {/* Search bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3"
            >
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
                <input
                  placeholder="Search expenses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-dark pl-10"
                  autoFocus
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-muted">
                    <X size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Filter */}
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCat('all')}
            className={clsx('category-chip whitespace-nowrap', selectedCat === 'all' && 'selected')}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={clsx('category-chip whitespace-nowrap', selectedCat === cat.id && 'selected')}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Summary */}
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex items-center justify-between px-1"
          >
            <p className="text-text-muted text-xs">{filtered.length} transactions</p>
            <p className="text-expense-red font-semibold text-sm">{formatCurrency(totalFiltered)}</p>
          </motion.div>
        )}

        {/* Grouped list */}
        <div className="mt-3 space-y-4">
          {filtered.length === 0 ? (
            <EmptyState
              emoji="📭"
              title="No expenses found"
              description={search || selectedCat !== 'all' ? 'Try a different filter' : 'Add your first expense using the + button'}
            />
          ) : (
            Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <p className="text-text-disabled text-xs font-medium uppercase tracking-wider mb-2">{dateLabel}</p>
                <div className="glass-card divide-y divide-border-subtle">
                  {items.map((expense, idx) => {
                    const cat = getCategoryById(expense.category);
                    return (
                      <motion.div
                        key={expense.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-center gap-3 px-4 py-3 group"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: cat.bgColor, border: `1px solid ${cat.borderColor}` }}
                        >
                          {cat.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary text-sm font-medium truncate">{expense.note || cat.label}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="default" size="sm">{cat.label}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-expense-red font-semibold text-sm">-{formatCurrency(expense.amount)}</p>
                          <div className="hidden group-hover:flex items-center gap-1">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => { setEditItem(expense); setAddModal(true); }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-brand-purple hover:bg-brand-purple/10 transition-all"
                            >
                              <Edit2 size={12} />
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setDeleteConfirm(expense)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-expense-red hover:bg-expense-red-bg transition-all"
                            >
                              <Trash2 size={12} />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="h-4" />
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={addModal}
        onClose={() => { setAddModal(false); setEditItem(null); }}
        editItem={editItem}
      />

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 bottom-8 z-50 glass-card-elevated p-5 max-w-sm mx-auto"
            >
              <h3 className="text-text-primary font-semibold mb-1">Delete expense?</h3>
              <p className="text-text-muted text-sm mb-4">This will permanently remove {formatCurrency(deleteConfirm.amount)} from your records.</p>
              <div className="flex gap-3">
                <Button variant="secondary" size="md" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
                <Button variant="danger" size="md" onClick={() => handleDelete(deleteConfirm)} className="flex-1">Delete</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <FAB onAdd={() => { setEditItem(null); setAddModal(true); }} />
    </PageWrapper>
  );
};

export default Expenses;
