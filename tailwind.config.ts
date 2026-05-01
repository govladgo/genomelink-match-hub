import type { Config } from "tailwindcss";

const config: Config = {
  prefix: "tw-",
  corePlugins: {
    preflight: false,
  },
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gl: {
          orange: "#ff7c11",
          "orange-dark": "#f2690b",
          blue: "#4582c9",
          "blue-dark": "#225a9c",
          green: "#7abf43",
          red: "#d52c43",
          yellow: "#ffb300",
          "gray-950": "#111d2e",
          "gray-900": "#1b2b3e",
          "gray-800": "#2d3e52",
          "gray-700": "#3f5168",
          "gray-600": "#5a6f86",
          "gray-500": "#7b8fa3",
          "gray-400": "#9baab9",
          "gray-300": "#bcc7d3",
          "gray-200": "#dce2ea",
          "gray-100": "#edf1f5",
          "gray-50": "#f5f8fc",
        },
      },
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
