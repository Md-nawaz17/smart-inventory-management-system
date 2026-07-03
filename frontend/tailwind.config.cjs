/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        4.5: "1.125rem",
        5.5: "1.375rem",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "ui-sans-serif", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 8px 24px -8px rgb(0 0 0 / 0.08)",
        "card-dark": "0 1px 3px 0 rgb(0 0 0 / 0.3), 0 8px 24px -8px rgb(0 0 0 / 0.4)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: 0, transform: "translateX(-8px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
