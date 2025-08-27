/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3ff',
          100: '#fce8ff',
          200: '#f9d0ff',
          300: '#f5a9ff',
          400: '#ee73ff',
          500: '#e03eff',
          600: '#c91af4',
          700: '#aa0dd7',
          800: '#8c0fb1',
          900: '#731490',
        },
        secondary: {
          50: '#f0fdff',
          100: '#ccf8ff',
          200: '#99efff',
          300: '#66e6ff',
          400: '#1ad6ff',
          500: '#00bde6',
          600: '#0099bf',
          700: '#007599',
          800: '#005c7a',
          900: '#004865',
        },
        accent: {
          yellow: '#FFD93D',
          orange: '#FF6B6B',
          green: '#4ECDC4',
          pink: '#FF69B4',
          purple: '#9B59B6',
        },
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'gradient': 'gradient 8s ease infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}