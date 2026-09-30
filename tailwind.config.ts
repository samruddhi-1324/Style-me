import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F8F5EF",
        sand: "#EDE5D9",
        forest: "#20382E",
        espresso: "#302A27",
        sage: "#718276",
        terracotta: "#C66A55",
        rose: "#DCC5BE",
        plum: "#241526",
        cream: "#F2E8DE",
        coral: "#D95C4F",
        lilac: "#D9CDE4",
        muted: "#8E8580",
        charcoal: "#292626",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "serif"],
        sans: ["Inter", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "18px",
        xl: "24px",
      },
    },
  },
  plugins: [],
};
export default config;
