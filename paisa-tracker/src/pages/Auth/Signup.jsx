import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Wallet, IndianRupee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    initialBalance: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Please fill all fields');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password || form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        initialBalance: Number(form.initialBalance) || 0,
      });
      toast.success('🎉 Account created! Welcome to Paisa Tracker!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bg-primary flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-glow-purple"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)' }}
          >
            <Wallet size={30} className="text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-text-primary">Create account</h2>
          <p className="text-text-muted text-sm mt-1">Start tracking your money today</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: s === step ? '2rem' : '0.75rem',
                background: s <= step ? 'linear-gradient(135deg,#7C3AED,#3B82F6)' : '#1E1E2E',
              }}
            />
          ))}
        </div>

        <div className="glass-card p-6">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleNext}
              className="space-y-4"
            >
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-dark pl-10"
                  autoFocus
                />
              </div>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-dark pl-10"
                />
              </div>
              <Button type="submit" variant="primary" size="lg" fullWidth>
                Continue →
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password (min 6 chars)"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-dark pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-muted">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="input-dark pl-10"
                />
              </div>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
                <input
                  type="number"
                  placeholder="Current balance (optional)"
                  value={form.initialBalance}
                  onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
                  className="input-dark pl-10"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)} className="flex-1">
                  ← Back
                </Button>
                <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1">
                  Create Account
                </Button>
              </div>
            </motion.form>
          )}

          <p className="text-center text-text-muted text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-purple-light font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
