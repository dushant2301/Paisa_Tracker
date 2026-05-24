import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Plus, CheckCircle, Trash2, IndianRupee, FileText, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, getTodayString } from '../../utils/formatDate';
import PageWrapper from '../../components/layout/PageWrapper';
import TopBar from '../../components/layout/TopBar';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { StatCard } from '../../components/ui/Card';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const ShopTracker = () => {
  const { shopExpenses, addShopExpense, deleteShopExpense, markShopReceived, pendingShopTotal } = useApp();
  const [filter, setFilter] = useState('all');
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ amount: '', itemDescription: '', date: getTodayString() });
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const totalReceived = shopExpenses.filter(s => s.status === 'received').reduce((sum, s) => sum + Number(s.amount), 0);
  const filtered = useMemo(() => {
    if (filter === 'all') return shopExpenses;
    return shopExpenses.filter(s => s.status === filter);
  }, [shopExpenses, filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter valid amount'); return; }
    if (!form.itemDescription.trim()) { toast.error('Enter item description'); return; }
    setLoading(true);
    try {
      addShopExpense({ amount: Number(form.amount), itemDescription: form.itemDescription, date: form.date });
      toast.success('Shop expense added!');
      setAddModal(false);
      setForm({ amount: '', itemDescription: '', date: getTodayString() });
    } finally { setLoading(false); }
  };

  const handleMarkReceived = (item) => {
    markShopReceived(item.id);
    toast.success(`₹${item.amount} marked as received from shop!`);
  };

  const handleDelete = (item) => {
    deleteShopExpense(item.id);
    toast.success('Entry deleted');
    setDeleteConfirm(null);
  };

  return (
    <PageWrapper>
      <div className="page-container">
        <TopBar title="Shop Tracker" subtitle="Father's kirana shop" />

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <StatCard
            label="Pending"
            value={formatCurrency(pendingShopTotal, true)}
            icon={<span className="text-lg">⏳</span>}
            iconColor="#F59E0B"
          />
          <StatCard
            label="Received"
            value={formatCurrency(totalReceived, true)}
            icon={<span className="text-lg">✅</span>}
            iconColor="#10B981"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-4">
          {['all', 'pending', 'received'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'flex-1 py-2 rounded-xl text-sm font-medium border transition-all duration-200',
                filter === f
                  ? 'bg-brand-purple/15 border-brand-purple text-brand-purple-light'
                  : 'bg-bg-elevated border-border-subtle text-text-muted hover:border-border-bright'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="mt-4 space-y-2">
          {filtered.length === 0 ? (
            <EmptyState
              emoji="🏪"
              title="No shop expenses"
              description={filter !== 'all' ? `No ${filter} entries` : 'Add money you spent for the shop'}
            />
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.04 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary font-medium text-sm truncate">{item.itemDescription}</p>
                      <p className="text-text-disabled text-xs mt-0.5">{formatDate(item.date || item.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className={clsx('font-bold text-base', item.status === 'pending' ? 'text-pending-yellow' : 'text-income-green')}>
                        {formatCurrency(item.amount)}
                      </p>
                      <Badge variant={item.status === 'pending' ? 'pending' : 'received'}>
                        {item.status === 'pending' ? '⏳ Pending' : '✅ Received'}
                      </Badge>
                    </div>
                  </div>
                  {item.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="success"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => handleMarkReceived(item)}
                        className="flex-1"
                      >
                        Mark Received
                      </Button>
                      <Button
                        variant="danger"
                        size="icon"
                        onClick={() => setDeleteConfirm(item)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                  {item.status === 'received' && (
                    <div className="flex justify-end mt-2">
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(item)}>
                        <Trash2 size={12} className="mr-1" /> Delete
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        <div className="h-4" />
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setAddModal(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow-green md:bottom-6 md:right-6"
        style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
      >
        <Plus size={24} className="text-white" />
      </motion.button>

      {/* Add Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Shop Expense">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
            <input type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="input-dark pl-10 text-lg font-semibold" autoFocus />
          </div>
          <div className="relative">
            <FileText size={16} className="absolute left-3.5 top-3.5 text-text-disabled" />
            <textarea placeholder="Item description (e.g. Rice, Sugar, Oil)" value={form.itemDescription} onChange={e => setForm({...form, itemDescription: e.target.value})} className="input-dark pl-10 resize-none h-20" rows={2} />
          </div>
          <div className="relative">
            <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-dark pl-10" style={{ colorScheme: 'dark' }} />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" size="lg" onClick={() => setAddModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="success" size="lg" loading={loading} className="flex-1">Add Entry</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-x-4 bottom-8 z-50 glass-card-elevated p-5 max-w-sm mx-auto">
              <h3 className="text-text-primary font-semibold mb-1">Delete entry?</h3>
              <p className="text-text-muted text-sm mb-4">Remove {formatCurrency(deleteConfirm.amount)} - {deleteConfirm.itemDescription}?</p>
              <div className="flex gap-3">
                <Button variant="secondary" size="md" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
                <Button variant="danger" size="md" onClick={() => handleDelete(deleteConfirm)} className="flex-1">Delete</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default ShopTracker;
