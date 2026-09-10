/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        },
        ink: "#10233D",
        paper: "#F3F4F1",
        signal: "#1E7F73",
        amberCustom: "#D98E04",
        line: "#DADDD6",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
}
