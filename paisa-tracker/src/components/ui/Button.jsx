import { motion } from 'framer-motion';
import clsx from 'clsx';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const base = 'relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'btn-gradient focus:ring-brand-purple',
    secondary: 'bg-bg-elevated border border-border-default text-text-primary hover:bg-bg-hover hover:border-border-bright focus:ring-brand-purple',
    ghost: 'bg-transparent text-text-muted hover:text-text-primary hover:bg-bg-elevated focus:ring-brand-purple',
    danger: 'bg-expense-red-bg border border-expense-red/30 text-expense-red hover:bg-red-900/30 focus:ring-expense-red',
    success: 'bg-income-green-bg border border-income-green/30 text-income-green hover:bg-green-900/30 focus:ring-income-green',
    warning: 'bg-pending-yellow-bg border border-pending-yellow/30 text-pending-yellow hover:bg-yellow-900/30 focus:ring-pending-yellow',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
    xl: 'px-8 py-4 text-lg rounded-2xl',
    icon: 'p-2.5 rounded-xl',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
        </>
      )}
    </motion.button>
  );
};

export default Button;
