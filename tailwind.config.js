/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
      },
      spacing: {
        sidebar: 'var(--sidebar-width-expanded)',
        'sidebar-collapsed': 'var(--sidebar-width-collapsed)',
      },
      zIndex: {
        sidebar: 'var(--z-sidebar)',
        header: 'var(--z-header)',
        overlay: 'var(--z-overlay)',
        dropdown: 'var(--z-dropdown)',
      },
      transitionProperty: {
        width: 'width',
        spacing: 'margin, padding',
      },
      animation: {
        'fade-in': 'fadeIn var(--transition-normal)',
        'slide-in': 'slideIn var(--transition-normal)',
      },
    },
  },
  plugins: [],
};