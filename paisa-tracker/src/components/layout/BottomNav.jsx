import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, ListOrdered, Store, Users, BarChart3, FileText } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/expenses', icon: ListOrdered, label: 'Expenses' },
  { to: '/shop', icon: Store, label: 'Shop' },
  { to: '/friends', icon: Users, label: 'Friends' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

const BottomNav = () => {
  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex items-center justify-around py-2 px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`nav-item relative ${isActive ? 'active' : ''}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(124,58,237,0.12)' }}
                    transition={{ type: 'spring', duration: 0.4 }}
                  />
                )}
                <Icon size={20} className="relative z-10" />
                <span className={`text-2xs font-medium relative z-10 ${isActive ? 'text-brand-purple' : 'text-text-disabled'}`}>
                  {label}
                </span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
