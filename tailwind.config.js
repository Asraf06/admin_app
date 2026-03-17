/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./www/**/*.html", "./www/**/*.js"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mono: { 900: '#111827' }
      }
    }
  },
  plugins: [],
}
