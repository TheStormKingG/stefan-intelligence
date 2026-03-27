import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#E8EDF4",
        foreground: "#1C2A3A",
        secondary: "#5A6B7E",
        tertiary: "#8494A7",
        border: "#D4DBE5",
        "surface-elevated": "rgba(255, 255, 255, 0.72)",
        "surface-solid": "#FFFFFF",
        severity: {
          critical: "#E8505B",
          high: "#F0923B",
          medium: "#EAB930",
          low: "#3FBF6E",
        },
        objective: {
          revenue: "#5B8DEF",
          operational: "#7B6CD9",
          strategic: "#B06ED9",
          growth: "#3FBF6E",
        },
        status: {
          "on-track": "#3FBF6E",
          "at-risk": "#F0923B",
          behind: "#E8505B",
          completed: "#8494A7",
        },
        accent: {
          blue: "#5B8DEF",
          purple: "#7B6CD9",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        "title-lg": ["28px", { lineHeight: "34px", fontWeight: "700" }],
        "title-md": ["22px", { lineHeight: "28px", fontWeight: "600" }],
        "title-sm": ["17px", { lineHeight: "22px", fontWeight: "600" }],
        "body-lg": ["17px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["15px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
      borderRadius: {
        card: "18px",
        button: "12px",
        badge: "20px",
      },
      boxShadow: {
        neu: "8px 8px 16px rgba(163, 177, 198, 0.35), -8px -8px 16px rgba(255, 255, 255, 0.9)",
        "neu-sm": "4px 4px 8px rgba(163, 177, 198, 0.3), -4px -4px 8px rgba(255, 255, 255, 0.85)",
        "neu-inset": "inset 3px 3px 6px rgba(163, 177, 198, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.7)",
        "neu-pressed": "inset 2px 2px 5px rgba(163, 177, 198, 0.35), inset -2px -2px 5px rgba(255, 255, 255, 0.7)",
        glass: "0 8px 32px rgba(31, 38, 135, 0.08)",
      },
      maxWidth: {
        app: "430px",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
      },
      keyframes: {
        "check-bounce": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "check-bounce": "check-bounce 200ms ease-out",
        "fade-in": "fade-in 250ms ease-out",
        "slide-up": "slide-up 300ms ease-out both",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
