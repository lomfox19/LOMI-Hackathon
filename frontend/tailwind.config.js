/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ai-bg': '#F5F1EA',
        'ai-primary': '#0F3D2E',
        'ai-secondary': '#2E7D5B',
        'ai-hover': '#0A2B21',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl-card': '16px',
      },
      boxShadow: {
        'ai-card': '0 18px 45px rgba(15, 61, 46, 0.18)',
      },
    },
  },
  plugins: [],
}