/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: { 950: '#ffffff', 900: '#f8fafc', 800: '#f1f5f9', 700: '#e2e8f0', 600: '#cbd5e1' },
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        gold: { 400: '#fbbf24', 500: '#f59e0b' },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #d97706, #f59e0b)',
      },
      boxShadow: {
        brand: '0 0 30px rgba(217, 119, 6, 0.25)',
        card: '0 2px 16px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
