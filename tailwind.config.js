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
        studio: {
          bg: '#0f141c',
          panel: '#161d27',
          surface: '#1d2633',
          border: '#2a3749',
          accent: '#3b82f6',
          'accent-hover': '#2563eb',
          text: '#f1f5f9',
          muted: '#94a3b8',
        }
      }
    },
  },
  plugins: [],
}
