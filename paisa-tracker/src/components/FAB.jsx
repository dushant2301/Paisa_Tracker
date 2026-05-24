import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const FAB = ({ onAdd }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (onAdd) {
      onAdd();
    } else {
      setOpen((prev) => !prev);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow-purple md:bottom-6 md:right-6"
      style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)' }}
      animate={{ rotate: open ? 45 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <Plus size={24} className="text-white" />
    </motion.button>
  );
};

export default FAB;
