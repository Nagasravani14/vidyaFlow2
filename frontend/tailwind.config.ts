import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F19",
        card: "#111827",
        border: "rgba(255, 255, 255, 0.1)",
        cyan: {
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
        },
        purple: {
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
        },
        emerald: {
          400: "#34D399",
          500: "#10B981",
        },
        amber: {
          400: "#FBBF24",
          500: "#F59E0B",
        },
        coral: {
          500: "#EF4444",
        },
        navy: {
          950: "#050818",
          900: "#070b1f",
          800: "#0d1330",
          700: "#151c42",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        "neon-cyan": "0 0 20px -3px rgba(6, 182, 212, 0.4)",
        "neon-purple": "0 0 20px -3px rgba(139, 92, 246, 0.4)",
        "neon-emerald": "0 0 20px -3px rgba(16, 185, 129, 0.4)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
