/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6', // Blue
          dark: '#2563EB',
        },
        secondary: {
          DEFAULT: '#8B5CF6', // Purple
          dark: '#7C3AED',
        },
        dark: {
          DEFAULT: '#111827', // Dark gray
          lighter: '#1F2937',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
