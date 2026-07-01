import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E99D5",
          dark: "#11499E",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F4F5F7",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted: "#5C5F66",
        },
        border: {
          DEFAULT: "#D6D9DD",
        },
        status: {
          active: "#1E7A4C",
          dueSoon: "#B8860B",
          overdue: "#B3261E",
          paid: "#11499E",
        },
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "0px",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
