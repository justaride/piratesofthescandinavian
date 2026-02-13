/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fjord: {
          900: '#0b1720',
          800: '#102330',
          700: '#1b3b4f'
        },
        ember: {
          400: '#f6ab5d',
          500: '#eb8b3a'
        },
        moss: {
          400: '#7abf83',
          500: '#4b8b59'
        }
      },
      boxShadow: {
        hud: '0 12px 30px rgba(7, 14, 18, 0.45)'
      }
    }
  },
  plugins: []
};
