/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5cb87a',
          50: '#f0f9f3',
          100: '#dbf0e2',
          200: '#bae2c9',
          300: '#8dcdab',
          400: '#5cb87a',
          500: '#3d9d5c',
          600: '#2d7d48',
          700: '#26643b',
          800: '#225033',
          900: '#1e432c',
        },
        surface: {
          DEFAULT: '#1e293b',
          light: '#334155',
          lighter: '#475569',
        },
        accent: {
          blue: '#6b9bd1',
          orange: '#e8a76a',
        },
        // Identificación rápida por tipo de partido (F5, F7, F8, F9, F11)
        matchType: {
          f5: '#22c55e',
          f7: '#3b82f6',
          f8: '#f59e0b',
          f9: '#8b5cf6',
          f11: '#e11d48',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1rem',
        modal: '1.25rem',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        modal: '0 25px 50px -12px rgb(0 0 0 / 0.2)',
      },
    },
  },
  plugins: [],
}
