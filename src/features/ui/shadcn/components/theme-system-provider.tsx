"use client"

import * as React from "react"
import { getTheme, type ThemeDefinition } from "../lib/themes.js"
import { getFont, getDefaultFont } from "../lib/fonts.js"
import { useTheme } from "./theme-provider.js"

type ThemeSystemProviderProps = {
  children: React.ReactNode
  themeName?: string
  fontName?: string
  radius?: string
}

/**
 * ThemeSystemProvider dynamically injects CSS variables for theme switching at runtime.
 * Works alongside ThemeProvider to handle both light/dark mode and color theme switching.
 * Also handles font and radius switching.
 */
export function ThemeSystemProvider({
  children,
  themeName = "neutral",
  fontName,
  radius,
}: ThemeSystemProviderProps) {
  const { theme: colorMode } = useTheme()
  const theme = React.useMemo(() => getTheme(themeName), [themeName])
  const font = React.useMemo(
    () => (fontName ? getFont(fontName) : getDefaultFont()),
    [fontName]
  )

  // Use useLayoutEffect for synchronous CSS var updates to prevent flash
  React.useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    // Update theme CSS variables
    if (theme && theme.cssVars) {
      const styleId = "theme-system-vars"
      let styleElement = document.getElementById(
        styleId
      ) as HTMLStyleElement | null

      if (!styleElement) {
        styleElement = document.createElement("style")
        styleElement.id = styleId
        // Insert after the last stylesheet to ensure our variables override
        const stylesheets = Array.from(document.head.querySelectorAll("link[rel='stylesheet']"))
        if (stylesheets.length > 0) {
          const lastStylesheet = stylesheets[stylesheets.length - 1]
          document.head.insertBefore(styleElement, lastStylesheet.nextSibling)
        } else {
          document.head.appendChild(styleElement)
        }
      }

      const { light: lightVars, dark: darkVars } = theme.cssVars

      let cssText = ":root {\n"
      // Always set light vars as default
      Object.entries(lightVars).forEach(([key, value]) => {
        if (value) {
          cssText += `  --${key}: ${value};\n`
        }
      })
      cssText += "}\n\n"

      cssText += ".dark {\n"
      // Set dark vars for dark mode
      Object.entries(darkVars).forEach(([key, value]) => {
        if (value) {
          cssText += `  --${key}: ${value};\n`
        }
      })
      cssText += "}\n"

      styleElement.textContent = cssText
      
      // Force a reflow to ensure styles are applied
      void styleElement.offsetHeight
    }

    // Update font CSS variable
    if (font) {
      document.documentElement.style.setProperty("--font-sans", font.family)
    }

    // Update radius CSS variable
    if (radius) {
      const radiusMap: Record<string, string> = {
        none: "0",
        sm: "0.125rem",
        default: "0.625rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
      }
      const radiusValue = radiusMap[radius] || radiusMap.default
      document.documentElement.style.setProperty("--radius", radiusValue)
    }
  }, [theme, colorMode, font, radius])

  return <>{children}</>
}

/**
 * Hook to get and set theme system parameters
 */
type ThemeSystemContextType = {
  themeName: string
  setThemeName: (name: string) => void
  fontName: string
  setFontName: (name: string) => void
  radius: string
  setRadius: (radius: string) => void
}

const ThemeSystemContext = React.createContext<ThemeSystemContextType>({
  themeName: "neutral",
  setThemeName: () => {},
  fontName: "inter",
  setFontName: () => {},
  radius: "default",
  setRadius: () => {},
})

export function ThemeSystemProviderWithContext({
  children,
  defaultThemeName = "neutral",
  defaultFontName = "inter",
  defaultRadius = "default",
  storageKey = "vite-ui-theme-name",
  fontStorageKey = "vite-ui-font-name",
  radiusStorageKey = "vite-ui-radius",
}: {
  children: React.ReactNode
  defaultThemeName?: string
  defaultFontName?: string
  defaultRadius?: string
  storageKey?: string
  fontStorageKey?: string
  radiusStorageKey?: string
}) {
  const [themeName, setThemeNameState] = React.useState<string>(() => {
    if (typeof window === "undefined") {
      return defaultThemeName
    }
    return (
      (localStorage.getItem(storageKey) as string) || defaultThemeName
    )
  })

  const [fontName, setFontNameState] = React.useState<string>(() => {
    if (typeof window === "undefined") {
      return defaultFontName
    }
    return (
      (localStorage.getItem(fontStorageKey) as string) || defaultFontName
    )
  })

  const [radius, setRadiusState] = React.useState<string>(() => {
    if (typeof window === "undefined") {
      return defaultRadius
    }
    return (
      (localStorage.getItem(radiusStorageKey) as string) || defaultRadius
    )
  })

  const setThemeName = React.useCallback(
    (name: string) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, name)
      }
      setThemeNameState(name)
    },
    [storageKey]
  )

  const setFontName = React.useCallback(
    (name: string) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(fontStorageKey, name)
      }
      setFontNameState(name)
    },
    [fontStorageKey]
  )

  const setRadius = React.useCallback(
    (radiusValue: string) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(radiusStorageKey, radiusValue)
      }
      setRadiusState(radiusValue)
    },
    [radiusStorageKey]
  )

  return (
    <ThemeSystemContext.Provider
      value={{ themeName, setThemeName, fontName, setFontName, radius, setRadius }}
    >
      <ThemeSystemProvider
        themeName={themeName}
        fontName={fontName}
        radius={radius}
      >
        {children}
      </ThemeSystemProvider>
    </ThemeSystemContext.Provider>
  )
}

export function useThemeSystem() {
  const context = React.useContext(ThemeSystemContext)
  if (context === undefined) {
    throw new Error(
      "useThemeSystem must be used within a ThemeSystemProviderWithContext"
    )
  }
  return context
}

