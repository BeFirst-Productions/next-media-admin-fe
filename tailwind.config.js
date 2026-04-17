/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  'rgb(var(--brand-50, 240 244 255) / <alpha-value>)',
          100: 'rgb(var(--brand-100, 224 233 255) / <alpha-value>)',
          200: 'rgb(var(--brand-200, 199 215 254) / <alpha-value>)',
          300: 'rgb(var(--brand-300, 165 184 252) / <alpha-value>)',
          400: 'rgb(var(--brand-400, 129 140 248) / <alpha-value>)',
          500: 'rgb(var(--brand-500, 99 102 241) / <alpha-value>)',
          600: 'rgb(var(--brand-600, 79 70 229) / <alpha-value>)',
          700: 'rgb(var(--brand-700, 67 56 202) / <alpha-value>)',
          800: 'rgb(var(--brand-800, 55 48 163) / <alpha-value>)',
          900: 'rgb(var(--brand-900, 49 46 129) / <alpha-value>)',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card:       '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover':'0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        sidebar:    '4px 0 24px -2px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
};