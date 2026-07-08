import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0C1A27",
        ink2: "#1A3348",
        ink3: "#2A4A66",
        sea: "#0A7A5F",
        sea2: "#0DAA85",
        seaL: "#D6F5EE",
        amber: "#D97706",
        amberL: "#FEF3C7",
        coral: "#E8401C",
        coralL: "#FEE4DD",
        ice: "#F0F6FF",
        ice2: "#E2ECF8",
        mist: "#B8C8D8",
        fog: "#6A849A",
        danger: "#DC2626",
      },
      fontFamily: {
        heading: ["Bricolage Grotesque", "sans-serif"],
        body: ["Outfit", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      borderRadius: {
        xs: "8px",
        sm: "12px",
        md: "18px",
        lg: "24px",
        xl: "36px",
      },
    },
  },
  plugins: [],
};
export default config;
