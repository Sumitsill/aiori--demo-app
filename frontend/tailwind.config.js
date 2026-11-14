/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0a0d14",
          card: "#121724",
          cardHover: "#181f31",
          border: "rgba(255, 255, 255, 0.08)",
          subtle: "#1b2236",
        },
        brand: {
          primary: "#10b981",    // Emerald progress
          secondary: "#06b6d4",  // Cyan telemetry
          privacy: "#f59e0b",    // Amber consent
          danger: "#f43f5e",     // Rose withdrawn/blocked
        }
      },
    },
  },
  plugins: [],
}

