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
    },
  },
  plugins: [typography],
  presets: [baseConfig],
} satisfies Config;
