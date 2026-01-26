/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'cairo': ['Cairo', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        'sans': ['Cairo', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#ff500d',
          dark: '#0a2f5c',
          muted: '#9aa6b2'
        },
        'brand-primary': '#ff500d',
        'brand-dark': '#0a2f5c',
      },
      backgroundColor: {
        'brand-primary': '#ff500d',
        'brand-dark': '#0a2f5c',
      },
      borderColor: {
        'brand-primary': '#ff500d',
      },
      textColor: {
        'brand-primary': '#ff500d',
        'brand-dark': '#0a2f5c',
      }
    },
  },
  plugins: [],
}
