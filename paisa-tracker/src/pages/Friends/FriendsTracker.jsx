import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, CheckCircle, Trash2, ChevronDown, IndianRupee, FileText, Calendar, User, Search } from 'lucide-react';
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

const FRIEND_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];

const getFriendColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return FRIEND_COLORS[Math.abs(hash) % FRIEND_COLORS.length];
};

const FriendCard = ({ friendName, transactions, onMarkReceived, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const pending = transactions.filter(t => t.status === 'pending');
  const pendingTotal = pending.reduce((sum, t) => sum + Number(t.amount), 0);
  const color = getFriendColor(friendName);

  return (
    <motion.div layout className="glass-card overflow-hidden">
      <motion.div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-base flex-shrink-0" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
          {friendName[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="text-text-primary font-semibold">{friendName}</p>
          <p className="text-text-muted text-xs">{transactions.length} transactions</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingTotal > 0 && (
            <span className="text-pending-yellow font-bold text-sm">{formatCurrency(pendingTotal)}</span>
          )}
          {pending.length > 0 && <Badge variant="pending">{pending.length} pending</Badge>}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} className="text-text-muted" />
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border-subtle divide-y divide-border-subtle">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm truncate">{t.description || 'No description'}</p>
                    <p className="text-text-disabled text-xs">{formatDate(t.date || t.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className={clsx('font-semibold text-sm', t.status === 'pending' ? 'text-pending-yellow' : 'text-income-green')}>
                      {formatCurrency(t.amount)}
                    </p>
                    {t.status === 'pending' ? (
                      <>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onMarkReceived(t)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-income-green hover:bg-income-green-bg transition-all">
                          <CheckCircle size={14} />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onDelete(t)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-expense-red hover:bg-expense-red-bg transition-all">
                          <Trash2 size={14} />
                        </motion.button>
                      </>
                    ) : (
                      <Badge variant="received" size="sm">✓ Received</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FriendsTracker = () => {
  const { friendTransactions, addFriendTransaction, markFriendReceived, deleteFriendTransaction, pendingFriendTotal } = useApp();
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ friendName: '', amount: '', description: '', date: getTodayString() });
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const totalReceived = friendTransactions.filter(f => f.status === 'received').reduce((sum, f) => sum + Number(f.amount), 0);

  // Group by friend name
  const grouped = useMemo(() => {
    const g = {};
    friendTransactions.forEach(t => {
      const name = t.friendName;
      if (!g[name]) g[name] = [];
      g[name].push(t);
    });
    return g;
  }, [friendTransactions]);

  const filteredFriends = useMemo(() => {
    if (!search) return Object.keys(grouped);
    return Object.keys(grouped).filter(name => name.toLowerCase().includes(search.toLowerCase()));
  }, [grouped, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.friendName.trim()) { toast.error('Enter friend name'); return; }
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter valid amount'); return; }
    setLoading(true);
    try {
      await addFriendTransaction({ friendName: form.friendName.trim(), amount: Number(form.amount), description: form.description, date: form.date });
      toast.success(`Added ₹${form.amount} for ${form.friendName}! 💸`);
      setAddModal(false);
      setForm({ friendName: '', amount: '', description: '', date: getTodayString() });
    } catch (err) {
      console.error('[FriendsTracker] addFriendTransaction error:', err);
      toast.error(err?.message || 'Failed to add transaction');
    } finally { setLoading(false); }
  };

  const handleMarkReceived = async (t) => {
    try {
      await markFriendReceived(t.id);
      toast.success(`Received ${formatCurrency(t.amount)} from ${t.friendName}! ✅`);
    } catch (err) {
      console.error('[FriendsTracker] markFriendReceived error:', err);
      toast.error(err?.message || 'Failed to update transaction');
    }
  };

  const handleDelete = async (t) => {
    try {
      await deleteFriendTransaction(t.id);
      toast.success('Transaction deleted 🗑️');
    } catch (err) {
      console.error('[FriendsTracker] deleteFriendTransaction error:', err);
      toast.error(err?.message || 'Failed to delete transaction');
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <PageWrapper>
      <div className="page-container">
        <TopBar title="Friends" subtitle="Money tracker" />

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <StatCard label="You'll Receive" value={formatCurrency(pendingFriendTotal, true)} icon={<span className="text-lg">🔄</span>} iconColor="#F59E0B" />
          <StatCard label="Received" value={formatCurrency(totalReceived, true)} icon={<span className="text-lg">✅</span>} iconColor="#10B981" />
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
          <input placeholder="Search friend..." value={search} onChange={e => setSearch(e.target.value)} className="input-dark pl-10" />
        </div>

        {/* Friend Cards */}
        <div className="mt-4 space-y-3">
          {filteredFriends.length === 0 ? (
            <EmptyState emoji="👥" title="No friends added" description="Add transactions to track money from friends" />
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredFriends.map(name => (
                <FriendCard
                  key={name}
                  friendName={name}
                  transactions={grouped[name]}
                  onMarkReceived={handleMarkReceived}
                  onDelete={setDeleteConfirm}
                />
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
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow-blue md:bottom-6 md:right-6"
        style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)' }}
      >
        <Plus size={24} className="text-white" />
      </motion.button>

      {/* Add Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Friend Transaction">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
            <input type="text" placeholder="Friend's name" value={form.friendName} onChange={e => setForm({...form, friendName: e.target.value})} className="input-dark pl-10" autoFocus />
          </div>
          <div className="relative">
            <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
            <input type="number" placeholder="Amount you paid" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="input-dark pl-10 text-lg font-semibold" />
          </div>
          <div className="relative">
            <FileText size={16} className="absolute left-3.5 top-3.5 text-text-disabled" />
            <textarea placeholder="What was it for? (e.g. Movie tickets)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-dark pl-10 resize-none h-20" rows={2} />
          </div>
          <div className="relative">
            <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-dark pl-10" style={{ colorScheme: 'dark' }} />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" size="lg" onClick={() => setAddModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1">Add Transaction</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-x-4 bottom-8 z-50 glass-card-elevated p-5 max-w-sm mx-auto">
              <h3 className="text-text-primary font-semibold mb-1">Delete transaction?</h3>
              <p className="text-text-muted text-sm mb-4">{deleteConfirm.friendName} - {formatCurrency(deleteConfirm.amount)}</p>
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

export default FriendsTracker;
