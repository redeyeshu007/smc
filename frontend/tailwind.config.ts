import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        sm: "2rem",
        lg: "3rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#202020",
        border: "#EAEAEA",
        input: "#EAEAEA",
        ring: "#C5A572",
        primary: {
          DEFAULT: "#C5A572",
          hover: "#B3925F",
          foreground: "#FFFFFF",
        },
        dark: {
          DEFAULT: "#202020",
          hover: "#333333",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#777777",
          foreground: "#202020",
        },
        muted: {
          DEFAULT: "#F9F9F9",
          foreground: "#777777",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#202020",
        },
        accent: {
          DEFAULT: "#C5A572",
          subtle: "#FAF7F2",
          foreground: "#202020",
        },
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
