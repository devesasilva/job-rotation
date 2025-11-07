/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        salmon: '#FFBBAB',   
        polaris: '#BC93FF', 
        galactic: '#C3F292', 
        lavender: '#DD9BF0', 
        nebula: '#FBFBFB',
        black: '#09081C'
      },
    },
  },
  plugins: [],
}