/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx}',
    './Navigation.{js,jsx}',
    './components/**/*.{js,jsx}',
    './screens/**/*.{js,jsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
