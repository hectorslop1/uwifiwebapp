import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-raised": "rgb(var(--color-surface-raised) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        "line-strong": "rgb(var(--color-line-strong) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--color-ink-soft) / <alpha-value>)",
        "ink-muted": "rgb(var(--color-ink-muted) / <alpha-value>)",
        "ink-faint": "rgb(var(--color-ink-faint) / <alpha-value>)",
        brand: "rgb(var(--color-brand) / <alpha-value>)",
        "brand-soft": "rgb(var(--color-brand-soft) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        "success-soft": "rgb(var(--color-success-soft) / <alpha-value>)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
        30: "7.5rem",
        "rail-x": "1.5rem",
        "rail-y": "1rem",
        "content-x": "4rem",
        "content-y": "3rem",
        "section-gap": "3rem",
        "cluster-gap": "1.5rem",
        "hero-gap": "5rem",
      },
      fontSize: {
        "display-lg": [
          "3.5rem",
          { lineHeight: "1", letterSpacing: "-0.035em", fontWeight: "500" },
        ],
        "title-xl": [
          "2rem",
          { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "500" },
        ],
        "title-md": [
          "1.25rem",
          { lineHeight: "1.3", letterSpacing: "-0.015em", fontWeight: "500" },
        ],
        "body-lg": [
          "1.125rem",
          { lineHeight: "1.55", letterSpacing: "-0.01em", fontWeight: "400" },
        ],
        "body-md": [
          "1rem",
          { lineHeight: "1.6", letterSpacing: "-0.01em", fontWeight: "400" },
        ],
        "body-sm": [
          "0.9375rem",
          { lineHeight: "1.55", letterSpacing: "-0.005em", fontWeight: "400" },
        ],
        "label-md": [
          "0.875rem",
          { lineHeight: "1.35", letterSpacing: "0em", fontWeight: "500" },
        ],
        "label-sm": [
          "0.75rem",
          { lineHeight: "1.3", letterSpacing: "0.02em", fontWeight: "500" },
        ],
      },
      borderRadius: {
        sm: "0.75rem",
        md: "1rem",
        lg: "1.25rem",
        xl: "1.5rem",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.03), 0 10px 30px rgba(15, 23, 42, 0.04)",
      },
      maxWidth: {
        shell: "96rem",
        content: "88rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
