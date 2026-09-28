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
        ops: {
          dark: '#0B0F17',
          surface: '#121824',
          card: '#182234',
          border: '#223049',
          accent: '#3B82F6',
          accentHover: '#2563EB',
          emerald: '#10B981',
          rose: '#EF4444',
          amber: '#F59E0B',
          purple: '#8B5CF6',
          muted: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
