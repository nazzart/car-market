/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Цвета задаются в lib/colors.ts (Tailwind v4 не читает этот файл без @config)
    extend: {},
  },
  plugins: [],
};
