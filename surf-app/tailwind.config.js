/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#e6f7ff',
          100: '#c8efff',
          200: '#98ddf8',
          300: '#64c8f2',
          400: '#35afe9',
          500: '#1c96d1',
          600: '#0f79ab',
          700: '#0d5f85',
          800: '#0e4c68',
          900: '#0f3d55',
          950: '#0b1220',
        },
        sand: {
          100: '#f3ede1',
          200: '#e5d7c2',
        },
      },
      boxShadow: {
        glow: '0 0 24px rgba(46, 189, 238, 0.2)',
      },
    },
  },
  plugins: [],
}
