"use client"

import * as React from "react"
import { Button } from "@shadcn"
import { useThemeSystem } from "./theme-system-provider.js"
import { randomizeThemeParams } from "../lib/randomize.js"

/**
 * Button component that randomizes all theme parameters (theme, font, radius)
 */
export function RandomizeButton() {
  const { setThemeName, setFontName, setRadius } = useThemeSystem()

  const handleRandomize = React.useCallback(() => {
    const randomized = randomizeThemeParams()
    
    setThemeName(randomized.theme || "neutral")
    setFontName(randomized.font || "inter")
    setRadius(randomized.radius || "default")
  }, [setThemeName, setFontName, setRadius])

  return (
    <Button onClick={handleRandomize} variant="outline" size="sm">
      🎲 Randomize Theme
    </Button>
  )
}

