import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#6366f1", light: "#818cf8", dark: "#4f46e5" },
        surface: { DEFAULT: "#ffffff", dark: "#0f172a" },
        card: { DEFAULT: "#f8fafc", dark: "#1e293b" },
        text: { primary: "#0f172a", secondary: "#475569", dark: "#f1f5f9", darkSecondary: "#94a3b8" },
        score: {
          high: "#22c55e",
          mid: "#eab308",
          low: "#6b7280",
        },
        source: {
          twitter: "#1d9bf0",
          youtube: "#ff0000",
          rss: "#f97316",
          reddit: "#ff4500",
          hackernews: "#ff6600",
          github: "#6e5494",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
