import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forest: "var(--forest)",
        deep: "var(--deep)",
        cream: "var(--cream)",
        ivory: "var(--ivory)",
        beige: "var(--beige)",
        sage: "var(--sage)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
      },
      fontFamily: {
        serif: ["var(--font-serif)"],
        sans: ["var(--font-sans)"],
      },
      boxShadow: {
        soft: "0 18px 60px rgba(36, 49, 39, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
