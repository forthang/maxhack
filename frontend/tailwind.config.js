/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#007AFF', // A nice blue, similar to Telegram
          dark: '#005ECB',
        },
      },
    },
  },
  plugins: [],
}
