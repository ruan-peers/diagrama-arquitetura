/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        azure: {
          deep: '#011334',
          green: '#e1ff00',
        }
      }
    },
  },
  plugins: [],
}