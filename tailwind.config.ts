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
        paper: "#F5F5F0",
        ink: "#0A0A0A",
        accent: "#FF4500",
      },
      fontFamily: {
        heading: ['"Space Mono"', "monospace"],
        body: ['"Inter"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
