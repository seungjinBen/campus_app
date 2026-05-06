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
        brand: {
          dark: "#111827",
          mid: "#6B7280",
          light: "#9CA3AF",
          rose: "#F97066",
          "rose-light": "#FEF2F0",
          cream: "#F8F8FA",
          warm: "#F3F4F6",
          sand: "#E5E7EB",
        },
      },
      boxShadow: {
        card: "0 1px 8px 0 rgba(0,0,0,0.06)",
        "card-lg": "0 4px 20px 0 rgba(0,0,0,0.10)",
        modal: "0 8px 40px 0 rgba(0,0,0,0.12)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
