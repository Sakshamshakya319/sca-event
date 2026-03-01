/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Roboto Mono", "monospace"]
      },
      colors: {
        background: "#f8fafc",
        surface: "#ffffff",
        primary: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
        },
        text: {
          main: "#0f172a",
          muted: "#64748b",
        },
        border: {
          color: "#e2e8f0",
        }
      }
    }
  },
  plugins: []
};

