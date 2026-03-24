const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        "background-rgb": "var(--color-background)",
        content: "var(--color-content)",
        "content1": "var(--color-content)",
        sidebar: "var(--color-sidebar)",
        text: "var(--color-text)",
        "text-secondary": "var(--color-textSecondary)",
        border: "var(--color-border)",
      },
      backgroundColor: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        content: "var(--color-content)",
        sidebar: "var(--color-sidebar)",
      },
      textColor: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        default: "var(--color-text)",
        "text-secondary": "var(--color-textSecondary)",
      },
      borderColor: {
        default: "var(--color-border)",
      }
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}
