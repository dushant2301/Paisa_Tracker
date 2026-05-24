/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Background layers
        'bg-primary': '#0A0A0F',
        'bg-card': '#13131A',
        'bg-elevated': '#1C1C27',
        'bg-hover': '#22223A',
        // Brand
        'brand-purple': '#7C3AED',
        'brand-purple-light': '#9D5CF6',
        'brand-blue': '#3B82F6',
        'brand-blue-light': '#60A5FA',
        // Semantic
        'income-green': '#10B981',
        'income-green-bg': '#052E16',
        'expense-red': '#EF4444',
        'expense-red-bg': '#2D0A0A',
        'pending-yellow': '#F59E0B',
        'pending-yellow-bg': '#2D1A00',
        // Text
        'text-primary': '#F8FAFC',
        'text-secondary': '#CBD5E1',
        'text-muted': '#94A3B8',
        'text-disabled': '#475569',
        // Borders
        'border-subtle': '#1E1E2E',
        'border-default': '#2D2D45',
        'border-bright': '#3D3D5C',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
        'gradient-card-purple': 'linear-gradient(135deg, #1A0A2E 0%, #1C1C27 100%)',
        'gradient-card-blue': 'linear-gradient(135deg, #0A1A2E 0%, #1C1C27 100%)',
        'gradient-card-green': 'linear-gradient(135deg, #0A2E1A 0%, #1C1C27 100%)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(124,58,237,0.2)',
        'glow-purple': '0 0 20px rgba(124,58,237,0.35)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.35)',
        'glow-green': '0 0 20px rgba(16,185,129,0.35)',
        'inner-border': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'count-up': 'countUp 0.6s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
