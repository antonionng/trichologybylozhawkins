import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          sand: "#FDF8F0",
          ivory: "#FFF9F2",
          salmon: "#ED908D",
          sage: "#C1D780",
          graphite: "#000000",
          clay: "#D7ADCC",
          mist: "#80CCDD",
          night: "#1a1a19",
        },
        admin: {
          bg: "#0a0a0b",
          panel: "#141416",
          elevated: "#1c1c1f",
          border: "rgba(255,255,255,0.06)",
          "border-strong": "rgba(255,255,255,0.1)",
          text: "#fafafa",
          "text-secondary": "#a1a1aa",
          "text-muted": "#52525b",
          accent: "#fab826",
          "accent-hover": "#e5a820",
          danger: "#ef4444",
          success: "#22c55e",
          info: "#3b82f6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        display: ["var(--font-dm-sans)", ...fontFamily.sans],
        serif: ["var(--font-gentium)", ...fontFamily.serif],
      },
      spacing: {
        section: "7.5rem",
        "section-sm": "4.5rem",
        gutter: "3.5rem",
      },
      borderRadius: {
        "glass-lg": "28px",
        "glass-md": "20px",
        "glass-sm": "14px",
      },
      boxShadow: {
        glass: "0 32px 80px -40px rgba(23, 24, 27, 0.35)",
        card: "0 18px 48px -24px rgba(23, 24, 27, 0.28)",
        "soft-top": "0 8px 24px -12px rgba(35, 34, 32, 0.18)",
      },
      backdropBlur: {
        xs: "6px",
        md: "14px",
      },
      transitionTimingFunction: {
        "lux-ease": "cubic-bezier(0.25, 0.95, 0.45, 1)",
        "glide": "cubic-bezier(0.33, 1, 0.68, 1)",
      },
      backgroundImage: {
        "texture-linen": "url('/textures/linen.svg')",
        "texture-veined": "url('/textures/veined-paper.svg')",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float-slow": {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
          "100%": { transform: "translateY(0px)" },
        },
        "parallax-hover": {
          "0%": { transform: "translate3d(0,0,0)" },
          "100%": { transform: "translate3d(var(--parallax-x, 0), var(--parallax-y, 0), 0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s var(--tw-ease) forwards",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "parallax-hover": "parallax-hover 8s ease-in-out alternate infinite",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
