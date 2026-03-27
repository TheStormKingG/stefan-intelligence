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
        background: "#FAFAFA",
        foreground: "#1D1D1F",
        secondary: "#6E6E73",
        tertiary: "#86868B",
        border: "#E5E5EA",
        "surface-elevated": "#FFFFFF",
        severity: {
          critical: "#FF3B30",
          high: "#FF9500",
          medium: "#FFCC00",
          low: "#34C759",
        },
        objective: {
          revenue: "#007AFF",
          operational: "#5856D6",
          strategic: "#AF52DE",
          growth: "#34C759",
        },
        status: {
          "on-track": "#34C759",
          "at-risk": "#FF9500",
          behind: "#FF3B30",
          completed: "#86868B",
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
        card: "12px",
        button: "8px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 2px 8px rgba(0, 0, 0, 0.08)",
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
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "check-bounce": "check-bounce 200ms ease-out",
        "fade-in": "fade-in 200ms ease-out",
        "slide-up": "slide-up 250ms ease-out",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
