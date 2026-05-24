import clsx from 'clsx';

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-bg-elevated text-text-muted border-border-default',
    pending: 'badge-pending',
    received: 'badge-received',
    expense: 'badge-expense',
    purple: 'bg-brand-purple/10 text-brand-purple-light border-brand-purple/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-2xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full font-medium border', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};

export default Badge;
