/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'buffer-dots': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '-20px 0%' },
        },
      },
      animation: {
        'buffer-dots': 'buffer-dots 0.6s linear infinite',
      }
    },
  },
  plugins: [],
}