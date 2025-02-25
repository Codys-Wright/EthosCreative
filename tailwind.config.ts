import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"
import typography from "@tailwindcss/typography"

const config = {
  darkMode: "class",
  content: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "landing-page/**/*.{ts,tsx}",
    "features/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {},
  },
  plugins: [typography, tailwindcssAnimate],
} satisfies Config

export default config
