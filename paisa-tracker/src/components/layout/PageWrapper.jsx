import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -5 },
};

const PageWrapper = ({ children }) => {
  return (
    <div className="min-h-dvh bg-bg-primary flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 min-h-dvh md:ml-64 overflow-x-hidden">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="min-h-dvh"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
};

export default PageWrapper;
