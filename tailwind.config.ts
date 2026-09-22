import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "rgb(var(--bg) / <alpha-value>)",
          subtle: "rgb(var(--bg-subtle) / <alpha-value>)",
          card: "rgb(var(--bg-card) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
        },
        fg: {
          DEFAULT: "rgb(var(--fg) / <alpha-value>)",
          muted: "rgb(var(--fg-muted) / <alpha-value>)",
          subtle: "rgb(var(--fg-subtle) / <alpha-value>)",
        },
        accent: {
          green: "rgb(var(--accent-green) / <alpha-value>)",
          orange: "rgb(var(--accent-orange) / <alpha-value>)",
          blue: "rgb(var(--accent-blue) / <alpha-value>)",
          red: "rgb(var(--accent-red) / <alpha-value>)",
          yellow: "rgb(var(--accent-yellow) / <alpha-value>)",
          purple: "rgb(var(--accent-purple) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        cardDark: "0 1px 2px 0 rgb(0 0 0 / 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
