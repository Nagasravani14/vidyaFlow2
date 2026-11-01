import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--spider-bg)",
        foreground: "var(--spider-text)",
        spider: {
          red: {
            400: "#FB7185",
            500: "#F43F5E",
            600: "#E11D48",
            700: "#BE123C",
            900: "#881337",
          },
          blue: {
            400: "#38BDF8",
            500: "#0EA5E9",
            600: "#0284C7",
            700: "#0369A1",
            900: "#0C4A6E",
          },
          cyan: {
            300: "#67E8F9",
            400: "#22D3EE",
            500: "#06B6D4",
          },
          dark: {
            950: "#050818",
            900: "#070B1F",
            850: "#0B112C",
            800: "#0D1430",
          },
        },
        navy: {
          950: "#050818",
          900: "#070B1F",
          850: "#0B112C",
          800: "#0D1330",
          700: "#151C42",
        },
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
      },
      boxShadow: {
        "neon-cyan": "0 0 20px -3px rgba(6, 182, 212, 0.4)",
        "neon-purple": "0 0 20px -3px rgba(139, 92, 246, 0.4)",
        "neon-emerald": "0 0 20px -3px rgba(16, 185, 129, 0.4)",
        "neon-red": "0 0 20px -3px rgba(244, 63, 94, 0.4)",
        "spider-combo": "0 0 25px -4px rgba(244, 63, 94, 0.35), 0 0 35px -6px rgba(56, 189, 248, 0.25)",
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
