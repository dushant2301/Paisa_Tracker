import { motion } from 'framer-motion';
import { Bell, Search, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ title, subtitle, showSearch = false, onSearch }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 pt-4 pb-2"
    >
      <div>
        {subtitle && <p className="text-text-disabled text-xs font-medium uppercase tracking-wider mb-0.5">{subtitle}</p>}
        <h1 className="text-text-primary font-bold text-xl">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {showSearch && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            onClick={onSearch}
          >
            <Search size={16} />
          </motion.button>
        )}
        {user && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-9 h-9 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-expense-red transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </motion.button>
        )}
        {user && (
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)' }}
          >
            {user.avatar || user.name?.[0]?.toUpperCase() || 'U'}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TopBar;
