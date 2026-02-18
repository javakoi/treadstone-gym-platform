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
        treadstone: {
          50: "#fef7ee",
          100: "#fdedd6",
          200: "#f9d7ad",
          300: "#f4ba79",
          400: "#ef9343",
          500: "#eb7620",
          600: "#dc5c16",
          700: "#b64414",
          800: "#913618",
          900: "#752f16",
          950: "#3f1509",
        },
      },
    },
  },
  plugins: [],
};
export default config;
