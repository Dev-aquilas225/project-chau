/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#111111',
        paper: '#ffffff',
        muted: '#6b7280',
        line: '#e5e7eb',
        sale: '#b71c1c',
        luxury: {
          beige: '#F9F7F2',
          gold: '#C5A059',
          dark: '#1A1A1A',
          muted: '#717171',
          cream: '#F0EBE1',
        },
      },
      keyframes: {
        'page-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'card-rise': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'page-in': 'page-in 200ms ease-out',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
      },
      maxWidth: {
        '8xl': '1440px',
      },
    },
  },
  plugins: [],
};
