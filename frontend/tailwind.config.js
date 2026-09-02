/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        agri: {
          dark: '#0A2412',      // Deep forest dark green from user screenshot
          primary: '#0F380F',   // Rich earthy green
          accent: '#22C55E',    // Bright vibrant tech green
          light: '#A7F3D0',     // Soft muted leaf green
          earth: '#F4F1EA',
          cardDark: '#0E3319',
          gold: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
