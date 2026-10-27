/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF9F6',
          100: '#F5F4F0',
          200: '#ECE9E2',
          300: '#DFDBD0',
        },
        paper: {
          light: '#FDFCF9',
          base: '#EBE7DE',
          edge: '#D5D0C3',
          dark: '#B0AA9B',
        },
        ink: {
          900: '#111111',
          800: '#1D1D1D',
          600: '#5A5852',
          400: '#8A8780',
          200: '#C2BFB6',
        }
      },
      fontFamily: {
        display: ['"Anton"', '"Bebas Neue"', 'sans-serif'],
        condensed: ['"Anton"', '"Bebas Neue"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'print': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
        'print-hover': '0 35px 65px -15px rgba(0, 0, 0, 0.35), 0 15px 30px -8px rgba(0, 0, 0, 0.15)',
        'dock': '0 10px 30px -5px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
