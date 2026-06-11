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
      },
    },
  },
  plugins: [],
};
