/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1B365D',
        'secondary': '#2E5984',
        'accent': '#00B4A6',
        'background': '#FAFBFC',
        'surface': '#F5F7FA',
        'text-primary': '#1A202C',
        'text-secondary': '#4A5568',
        'success': '#38A169',
        'warning': '#D69E2E',
        'error': '#E53E3E',
        'border': '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}