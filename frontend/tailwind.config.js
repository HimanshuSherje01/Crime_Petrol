/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F1A",
        card: "#131826",
        border: "#1F2937",
        primary: "#22D3EE",
        secondary: "#F59E0B",
        danger: "#EF4444",
        success: "#10B981"
      }
    },
  },
  plugins: [],
}
