"use client"

import { Palette } from "lucide-react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useThemeSystem } from "./theme-system-provider"
import { themes } from "../lib/themes"

export function ThemeSwitcher() {
  const { themeName, setThemeName } = useThemeSystem()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.keys(themes).map((name) => (
          <DropdownMenuItem
            key={name}
            onClick={() => setThemeName(name)}
            data-active={themeName === name}
            className="capitalize data-[active=true]:bg-accent"
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

