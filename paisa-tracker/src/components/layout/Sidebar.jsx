import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, ListOrdered, Store, Users, BarChart3, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: ListOrdered, label: 'Expenses' },
  { to: '/shop', icon: Store, label: 'Shop Tracker' },
  { to: '/friends', icon: Users, label: 'Friends' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

const Sidebar = () => {
  const { user, balance, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar hidden md:flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7C3AED,#3B82F6)' }}>
            <Wallet size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-text-primary text-base leading-none">Paisa</h1>
            <p className="text-brand-purple text-xs font-semibold">Tracker</p>
          </div>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg,#7C3AED,#3B82F6)' }}>
              {user.avatar}
            </div>
            <div>
              <p className="text-text-primary font-semibold text-sm">{user.name}</p>
              <p className="text-text-disabled text-xs">Balance: {formatCurrency(balance)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-brand-purple/12 text-brand-purple-light border border-brand-purple/20'
                    : 'text-text-muted hover:text-text-secondary hover:bg-bg-elevated'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-purple" />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:text-expense-red hover:bg-expense-red-bg transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Logout</span>
        </motion.button>
      </div>
    </aside>
  );
};

export default Sidebar;
