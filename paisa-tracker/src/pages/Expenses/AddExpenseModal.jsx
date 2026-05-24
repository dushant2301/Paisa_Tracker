import { useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, FileText, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { CATEGORIES } from '../../constants/categories';
import { getTodayString } from '../../utils/formatDate';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const AddExpenseModal = ({ isOpen, onClose, editItem = null }) => {
  const { addExpense, updateExpense } = useApp();
  const [form, setForm] = useState({
    amount: editItem?.amount || '',
    category: editItem?.category || 'food',
    note: editItem?.note || '',
    date: editItem?.date || getTodayString(),
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      if (editItem) {
        updateExpense(editItem.id, { ...form, amount: Number(form.amount) });
        toast.success('Expense updated! ✏️');
      } else {
        addExpense({ ...form, amount: Number(form.amount) });
        toast.success('Expense added! 💸');
      }
      onClose();
      setForm({ amount: '', category: 'food', note: '', date: getTodayString() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Edit Expense' : 'Add Expense'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div className="relative">
          <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="input-dark pl-10 text-lg font-semibold"
            autoFocus
          />
        </div>

        {/* Category */}
        <div>
          <p className="text-text-muted text-xs mb-2 uppercase tracking-wider">Category</p>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setForm({ ...form, category: cat.id })}
                className={clsx(
                  'flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all duration-200',
                  form.category === cat.id
                    ? 'border-brand-purple bg-brand-purple/10 text-brand-purple-light'
                    : 'border-border-subtle bg-bg-elevated text-text-disabled hover:border-border-bright'
                )}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-2xs font-medium leading-none">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="relative">
          <FileText size={16} className="absolute left-3.5 top-3.5 text-text-disabled" />
          <textarea
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="input-dark pl-10 resize-none h-20"
            rows={2}
          />
        </div>

        {/* Date */}
        <div className="relative">
          <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="input-dark pl-10"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" size="lg" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1">{
            editItem ? 'Update' : 'Add Expense'
          }</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddExpenseModal;
