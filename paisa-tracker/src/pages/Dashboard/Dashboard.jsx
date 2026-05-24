import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, Clock, Users, Store, Plus, Eye, EyeOff, ArrowRight, IndianRupee, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getCategoryById } from '../../constants/categories';
import PageWrapper from '../../components/layout/PageWrapper';
import FAB from '../../components/FAB';
import AddExpenseModal from '../Expenses/AddExpenseModal';
import { Link } from 'react-router-dom';
import { StatCard } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const { user, balance, updateBalance } = useAuth();
  const { expenses, currentMonthExpenses, totalMonthlySpend, totalPending, pendingShopTotal, pendingFriendTotal } = useApp();

  const [showBalance, setShowBalance] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [balanceModal, setBalanceModal] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');
  const [balanceMode, setBalanceMode] = useState('add'); // 'add' or 'set'

  // ✅ FIX: remaining = stored balance - this month's spend (no double counting)
  const remaining = balance - totalMonthlySpend;
  const recentExpenses = expenses.slice(0, 5);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleBalanceSave = () => {
    const amt = Number(balanceInput);
    if (!balanceInput || amt < 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (balanceMode === 'add') {
      updateBalance(balance + amt);
      toast.success(`₹${amt.toLocaleString('en-IN')} added to balance! 💰`);
    } else {
      updateBalance(amt);
      toast.success('Balance updated! 💰');
    }
    setBalanceInput('');
    setBalanceModal(false);
  };

  return (
    <PageWrapper>
      <div className="page-container">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between pt-4 pb-2"
        >
          <div>
            <p className="text-text-disabled text-xs uppercase tracking-wider">{getGreeting()},</p>
            <h1 className="text-text-primary font-bold text-xl">{user?.name?.split(' ')[0] || 'User'} 👋</h1>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBalance((b) => !b)}
              className="w-9 h-9 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            >
              {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
            </motion.button>
            <motion.div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)' }}
            >
              {user?.avatar}
            </motion.div>
          </div>
        </motion.div>

        {/* Balance Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-4 rounded-3xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #0A1A3E 50%, #0F0F1A 100%)' }}
        >
          {/* Decorative glows */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />

          <div className="relative z-10">
            {/* Available Balance */}
            <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Available Balance</p>
            <div className="flex items-baseline gap-3 mb-1">
              <span className={`text-4xl font-bold ${remaining < 0 ? 'text-expense-red' : 'text-text-primary'}`}>
                {showBalance ? formatCurrency(remaining) : '₹ ••••'}
              </span>
              {remaining < 0 && (
                <span className="text-expense-red text-xs font-medium bg-expense-red-bg px-2 py-0.5 rounded-full border border-expense-red/20">
                  Overspent
                </span>
              )}
            </div>

            {/* Total balance row */}
            <div className="flex items-center gap-2 mb-4">
              <p className="text-text-disabled text-xs">
                Total balance: {showBalance ? formatCurrency(balance) : '••••'}
              </p>
              {/* Add Balance button inline */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setBalanceModal(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-brand-purple-light border border-brand-purple/30 bg-brand-purple/10 hover:bg-brand-purple/20 transition-all"
              >
                <PlusCircle size={11} />
                Add Money
              </motion.button>
            </div>

            {/* 3-stat row */}
            <div className="flex items-center gap-4">
              <div>
                <p className="text-text-disabled text-2xs uppercase tracking-wider">Spent</p>
                <p className="text-expense-red font-semibold text-sm">
                  {showBalance ? formatCurrency(totalMonthlySpend) : '••••'}
                </p>
              </div>
              <div className="h-8 w-px bg-border-subtle" />
              <div>
                <p className="text-text-disabled text-2xs uppercase tracking-wider">Pending</p>
                <p className="text-pending-yellow font-semibold text-sm">
                  {showBalance ? formatCurrency(totalPending) : '••••'}
                </p>
              </div>
              <div className="h-8 w-px bg-border-subtle" />
              <div>
                <p className="text-text-disabled text-2xs uppercase tracking-wider">Txns</p>
                <p className="text-income-green font-semibold text-sm">{currentMonthExpenses.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 mt-4"
        >
          <motion.div variants={itemVariants}>
            <StatCard
              label="This Month"
              value={showBalance ? formatCurrency(totalMonthlySpend, true) : '••••'}
              icon={<TrendingDown size={18} className="text-expense-red" />}
              iconColor="#EF4444"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              label="Pending Money"
              value={showBalance ? formatCurrency(totalPending, true) : '••••'}
              icon={<Clock size={18} className="text-pending-yellow" />}
              iconColor="#F59E0B"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              label="Friends Owe"
              value={showBalance ? formatCurrency(pendingFriendTotal, true) : '••••'}
              icon={<Users size={18} className="text-brand-blue" />}
              iconColor="#3B82F6"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              label="Shop Pending"
              value={showBalance ? formatCurrency(pendingShopTotal, true) : '••••'}
              icon={<Store size={18} className="text-income-green" />}
              iconColor="#10B981"
            />
          </motion.div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-text-primary font-semibold">Recent Transactions</h2>
            <Link to="/expenses" className="flex items-center gap-1 text-brand-purple-light text-sm font-medium hover:gap-2 transition-all">
              See all <ArrowRight size={14} />
            </Link>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="glass-card py-8 flex flex-col items-center text-center">
              <span className="text-3xl mb-2">💸</span>
              <p className="text-text-muted text-sm">No expenses yet</p>
              <p className="text-text-disabled text-xs mt-1">Tap + to add your first expense</p>
            </div>
          ) : (
            <div className="glass-card divide-y divide-border-subtle">
              {recentExpenses.map((expense, idx) => {
                const cat = getCategoryById(expense.category);
                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: cat.bgColor, border: `1px solid ${cat.borderColor}` }}
                    >
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{expense.note || cat.label}</p>
                      <p className="text-text-disabled text-xs">{formatDate(expense.date || expense.createdAt)}</p>
                    </div>
                    <p className="text-expense-red font-semibold text-sm flex-shrink-0">-{formatCurrency(expense.amount)}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 grid grid-cols-2 gap-3"
        >
          <Link to="/shop">
            <div className="glass-card p-4 hover:border-income-green/30 transition-all cursor-pointer">
              <Store size={20} className="text-income-green mb-2" />
              <p className="text-text-primary text-sm font-medium">Shop Tracker</p>
              <p className="text-text-disabled text-xs mt-0.5">{formatCurrency(pendingShopTotal)} pending</p>
            </div>
          </Link>
          <Link to="/friends">
            <div className="glass-card p-4 hover:border-brand-blue/30 transition-all cursor-pointer">
              <Users size={20} className="text-brand-blue mb-2" />
              <p className="text-text-primary text-sm font-medium">Friends</p>
              <p className="text-text-disabled text-xs mt-0.5">{formatCurrency(pendingFriendTotal)} pending</p>
            </div>
          </Link>
        </motion.div>

        <div className="h-4" />
      </div>

      {/* FAB */}
      <FAB onAdd={() => setAddModal(true)} />
      <AddExpenseModal isOpen={addModal} onClose={() => setAddModal(false)} />

      {/* ── Add Balance Modal ── */}
      <AnimatePresence>
        {balanceModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => { setBalanceModal(false); setBalanceInput(''); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              className="fixed inset-x-4 bottom-8 z-50 glass-card-elevated p-5 max-w-sm mx-auto"
            >
              <h3 className="text-text-primary font-semibold text-base mb-1">Manage Balance</h3>
              <p className="text-text-muted text-xs mb-4">
                Current balance: <span className="text-text-primary font-semibold">{formatCurrency(balance)}</span>
              </p>

              {/* Mode toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setBalanceMode('add')}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                    balanceMode === 'add'
                      ? 'bg-income-green/15 border-income-green text-income-green'
                      : 'bg-bg-elevated border-border-subtle text-text-muted'
                  }`}
                >
                  + Add Money
                </button>
                <button
                  onClick={() => setBalanceMode('set')}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                    balanceMode === 'set'
                      ? 'bg-brand-purple/15 border-brand-purple text-brand-purple-light'
                      : 'bg-bg-elevated border-border-subtle text-text-muted'
                  }`}
                >
                  ✎ Set Balance
                </button>
              </div>

              <p className="text-text-disabled text-xs mb-2">
                {balanceMode === 'add'
                  ? 'How much money are you adding? (received salary, pocket money, etc.)'
                  : 'Set your total balance to this amount'}
              </p>

              <div className="relative mb-4">
                <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
                <input
                  type="number"
                  placeholder={balanceMode === 'add' ? 'Amount to add' : 'New total balance'}
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                  className="input-dark pl-10 text-lg font-semibold"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleBalanceSave()}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => { setBalanceModal(false); setBalanceInput(''); }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant={balanceMode === 'add' ? 'success' : 'primary'}
                  size="lg"
                  onClick={handleBalanceSave}
                  className="flex-1"
                >
                  {balanceMode === 'add' ? 'Add Money' : 'Set Balance'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default Dashboard;
