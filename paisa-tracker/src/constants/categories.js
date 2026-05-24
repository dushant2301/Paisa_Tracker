// Expense categories with icons (emoji) and colors
export const CATEGORIES = [
  {
    id: 'food',
    label: 'Food',
    emoji: '🍔',
    color: '#F59E0B',
    bgColor: 'rgba(245,158,11,0.12)',
    borderColor: 'rgba(245,158,11,0.25)',
  },
  {
    id: 'travel',
    label: 'Travel',
    emoji: '✈️',
    color: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.12)',
    borderColor: 'rgba(59,130,246,0.25)',
  },
  {
    id: 'shopping',
    label: 'Shopping',
    emoji: '🛍️',
    color: '#EC4899',
    bgColor: 'rgba(236,72,153,0.12)',
    borderColor: 'rgba(236,72,153,0.25)',
  },
  {
    id: 'education',
    label: 'Education',
    emoji: '📚',
    color: '#8B5CF6',
    bgColor: 'rgba(139,92,246,0.12)',
    borderColor: 'rgba(139,92,246,0.25)',
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    emoji: '🎮',
    color: '#6366F1',
    bgColor: 'rgba(99,102,241,0.12)',
    borderColor: 'rgba(99,102,241,0.25)',
  },
  {
    id: 'bills',
    label: 'Bills',
    emoji: '⚡',
    color: '#EF4444',
    bgColor: 'rgba(239,68,68,0.12)',
    borderColor: 'rgba(239,68,68,0.25)',
  },
  {
    id: 'health',
    label: 'Health',
    emoji: '❤️',
    color: '#10B981',
    bgColor: 'rgba(16,185,129,0.12)',
    borderColor: 'rgba(16,185,129,0.25)',
  },
  {
    id: 'others',
    label: 'Others',
    emoji: '💡',
    color: '#94A3B8',
    bgColor: 'rgba(148,163,184,0.12)',
    borderColor: 'rgba(148,163,184,0.25)',
  },
];

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

export const CHART_COLORS = [
  '#7C3AED', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#6366F1', '#94A3B8',
];
