/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cabgo: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Primary Amber/Gold
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          dark: '#0f172a',     // Slate 900
          charcoal: '#1e293b', // Slate 800
          surface: '#334155',  // Slate 700
          card: '#ffffff',
          light: '#f8fafc',
          muted: '#64748b',
          accent: '#facc15'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.08)',
        'glow': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'lift': '0 10px 30px -5px rgba(15, 23, 42, 0.12)'
      }
    },
  },
  plugins: [],
}
