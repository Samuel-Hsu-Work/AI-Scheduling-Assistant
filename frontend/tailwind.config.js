/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0f1117",
          raised: "#1a1d27",
          border: "#2a2d3a",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#818cf8",
          muted: "#312e81",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
