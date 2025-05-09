/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#fdf2f4',
          100: '#fae6ea',
          200: '#f5d0d9',
          300: '#eeadbf',
          400: '#e3809e',
          500: '#d5527d',
          600: '#c03365',
          700: '#a82555',
          800: '#8a2347',
          900: '#71203c',
          950: '#800020', // Main burgundy
        },
        gold: {
          50: '#fbf9eb',
          100: '#f7f2c7',
          200: '#f3e991',
          300: '#efda51',
          400: '#eacb2c',
          500: '#d4af37', // Main gold
          600: '#b78e18',
          700: '#956716',
          800: '#7a5218',
          900: '#67441a',
          950: '#3b240c',
        },
        elegant: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#121212', // Main black
        },
      },
      fontFamily: {
        'playfair': ['"Playfair Display"', 'serif'],
        'raleway': ['Raleway', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)' },
        }
      }
    },
  },
  plugins: [],
};