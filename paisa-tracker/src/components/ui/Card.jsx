import { motion } from 'framer-motion';
import clsx from 'clsx';

const Card = ({ children, className = '', hover = false, gradient, onClick, animate = true }) => {
  const Component = animate ? motion.div : 'div';
  const motionProps = animate ? {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
    ...(hover && { whileHover: { y: -2, boxShadow: '0 8px 40px rgba(124,58,237,0.2)' } }),
  } : {};

  return (
    <Component
      className={clsx(
        'glass-card p-4',
        hover && 'cursor-pointer transition-all duration-300',
        gradient && `bg-gradient-${gradient}`,
        className
      )}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
};

export const StatCard = ({ label, value, icon: Icon, iconColor = '#7C3AED', trend, trendLabel, gradient, children, className = '' }) => {
  return (
    <Card className={clsx('relative overflow-hidden', className)} gradient={gradient}>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full" style={{ background: iconColor }} />
      </div>
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: `${iconColor}20`, border: `1px solid ${iconColor}30` }}
          >
            {Icon}
          </div>
          {trend !== undefined && (
            <span className={clsx(
              'text-xs font-medium px-2 py-1 rounded-full',
              trend >= 0
                ? 'text-income-green bg-income-green-bg'
                : 'text-expense-red bg-expense-red-bg'
            )}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-text-muted text-xs font-medium mb-1 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        {trendLabel && <p className="text-text-disabled text-xs mt-1">{trendLabel}</p>}
        {children}
      </div>
    </Card>
  );
};

export default Card;
