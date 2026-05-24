import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Wallet, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Google name prompt state
  const [googleModal, setGoogleModal] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [gLoading, setGLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleConfirm = async () => {
    if (!googleName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    setGLoading(true);
    try {
      await googleSignIn(googleName.trim());
      toast.success(`Welcome, ${googleName.trim()}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Sign-in failed');
    } finally {
      setGLoading(false);
      setGoogleModal(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bg-primary flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
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
          <h2 className="text-2xl font-bold text-text-primary">Welcome back</h2>
          <p className="text-text-muted text-sm mt-1">Sign in to Paisa Tracker</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 space-y-4">
          {/* Google */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setGoogleModal(true)}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-bg-elevated border border-border-default text-text-primary font-medium text-sm hover:bg-bg-hover hover:border-border-bright transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-text-disabled text-xs">or sign in with email</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-dark pl-10"
                autoComplete="email"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-dark pl-10 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-muted transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-text-muted text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-purple-light font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>

      {/* ── Google Name Prompt Modal ── */}
      <AnimatePresence>
        {googleModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => { setGoogleModal(false); setGoogleName(''); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              className="fixed inset-x-4 bottom-8 z-50 glass-card-elevated p-5 max-w-sm mx-auto"
            >
              {/* Google icon */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border-default flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                    <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                    <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-text-primary font-semibold">Sign in with Google</h3>
                  <p className="text-text-muted text-xs">What should we call you?</p>
                </div>
              </div>

              <div className="relative mb-4">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
                <input
                  type="text"
                  placeholder="Your name (e.g. Harsh)"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="input-dark pl-10"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleGoogleConfirm()}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => { setGoogleModal(false); setGoogleName(''); }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  loading={gLoading}
                  onClick={handleGoogleConfirm}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
