// Format number as INR currency
export const formatCurrency = (amount, compact = false) => {
  const num = Number(amount) || 0;

  if (compact && Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }
  if (compact && Math.abs(num) >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// Format just the number with commas (no symbol)
export const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN').format(Number(amount) || 0);
};
