import { motion } from 'framer-motion';

const EmptyState = ({ emoji = '📭', title = 'Nothing here yet', description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-6 text-center"
  >
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className="text-5xl mb-4"
    >
      {emoji}
    </motion.div>
    <h3 className="text-text-primary font-semibold text-lg mb-2">{title}</h3>
    {description && <p className="text-text-muted text-sm mb-6 max-w-xs">{description}</p>}
    {action}
  </motion.div>
);

export default EmptyState;
