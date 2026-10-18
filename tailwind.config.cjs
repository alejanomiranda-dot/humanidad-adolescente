/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "!./src/prototypes/**"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
