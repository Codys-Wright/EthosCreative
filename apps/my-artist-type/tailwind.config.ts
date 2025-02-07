import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import baseConfig from "@repo/ui/tailwind.config";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/dashboard/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/widgets/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      screens: {
        "3xl": "1920px",
        "4xl": "2560px", // 2K
        "5xl": "3200px",
        "6xl": "3840px", // 4K
        "7xl": "4480px",
        "8xl": "5120px", // 5K
        "9xl": "5760px",
        "10xl": "6400px", // 6K
      },
      gridTemplateColumns: {
        "13": "repeat(13, 1fr)",
        "14": "repeat(14, 1fr)",
        "15": "repeat(15, 1fr)",
        "16": "repeat(16, 1fr)",
        "17": "repeat(17, 1fr)",
        "18": "repeat(18, 1fr)",
        "19": "repeat(19, 1fr)",
        "20": "repeat(20, 1fr)",
        "21": "repeat(21, 1fr)",
        "22": "repeat(22, 1fr)",
        "23": "repeat(23, 1fr)",
        "24": "repeat(24, 1fr)",
      },
      gridColumn: {
        "span-7": "span 7 / span 7",
        "span-8": "span 8 / span 8",
        "span-9": "span 9 / span 9",
        "span-10": "span 10 / span 10",
        "span-11": "span 11 / span 11",
        "span-12": "span 12 / span 12",
        "span-13": "span 13 / span 13",
        "span-14": "span 14 / span 14",
        "span-15": "span 15 / span 15",
        "span-16": "span 16 / span 16",
        "span-17": "span 17 / span 17",
        "span-18": "span 18 / span 18",
        "span-19": "span 19 / span 19",
        "span-20": "span 20 / span 20",
        "span-21": "span 21 / span 21",
        "span-22": "span 22 / span 22",
        "span-23": "span 23 / span 23",
        "span-24": "span 24 / span 24",
      },
    },
  },
  plugins: [typography],
  presets: [baseConfig],
} satisfies Config;
