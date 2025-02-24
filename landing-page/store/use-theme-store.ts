import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HeroData } from "../data/HeroData";

interface ThemeState {
  backgroundImage: string;
  setBackgroundImage: (image: string) => void;
  getInitialBackgroundImage: () => string;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      backgroundImage: HeroData.backgroundImage,
      setBackgroundImage: (image: string) => set({ backgroundImage: image }),
      getInitialBackgroundImage: () => {
        try {
          const isDark =
            localStorage.getItem("theme") === "dark" ||
            (!localStorage.getItem("theme") &&
              window.matchMedia("(prefers-color-scheme: dark)").matches);
          return isDark
            ? "/MAT-background-landing-page-dark.png"
            : HeroData.backgroundImage;
        } catch {
          return HeroData.backgroundImage;
        }
      },
    }),
    {
      name: "theme-storage",
    },
  ),
);
