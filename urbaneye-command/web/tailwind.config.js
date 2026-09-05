/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0b2545',
          navyDark: '#07162c',
          blue: '#134074',
          accent: '#1d70b8',
          light: '#f4f6f8',
          border: '#d9e2ec',
          amber: '#d97706',
          red: '#dc2626',
          emerald: '#059669',
        }
      }
    },
  },
  plugins: [],
}
