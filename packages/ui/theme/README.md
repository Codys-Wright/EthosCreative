# @theme

Dynamic theming system with OKLCH color palettes, font selection, radius presets, dark mode, and SSR-safe hydration.

## Overview

Provides a complete theming layer for the monorepo with:

- **7 color themes** using OKLCH color format (light + dark variants)
- **10 font options** loaded via Google Fonts
- **7 border-radius presets**
- **Dark mode** with system preference detection
- **SSR support** via cookie-based theme resolution and FOUC prevention

## Themes

| Name | Description |
|---|---|
| `neutral` | Grayscale base (default) |
| `blue` | Cool blue primary |
| `green` | Green primary |
| `rose` | Rose/pink primary |
| `purple` | Purple primary |
| `orange` | Orange primary |
| `cyan` | Cyan primary |

Each theme defines 20+ CSS variables (background, foreground, card, primary, secondary, accent, destructive, border, input, ring, chart 1–5, sidebar variants) in both light and dark modes.

## Fonts

Sans: Inter (default), Noto Sans, Nunito Sans, Figtree, Roboto, Raleway, DM Sans, Public Sans, Outfit
Mono: JetBrains Mono

## Radius Presets

`none` | `sm` | `default` (0.625rem) | `md` | `lg` | `xl` | `2xl`

## Atoms

```typescript
import { themeNameAtom, radiusAtom, colorModeAtom } from '@theme';

// All atoms sync with localStorage and validate values
const theme = useAtomValue(themeNameAtom);     // 'neutral' | 'blue' | ...
const radius = useAtomValue(radiusAtom);       // 'none' | 'sm' | 'default' | ...
const mode = useAtomValue(colorModeAtom);      // 'light' | 'dark' | 'system'
```

## Components

### Providers

```tsx
import { ThemeProvider, ThemeSystemProvider, ThemeSystemProviderWithContext } from '@theme';

// ThemeProvider — color mode context (light/dark/system)
// ThemeSystemProvider — injects CSS variables for the active theme
// ThemeSystemProviderWithContext — full provider with useThemeSystem() hook
```

### Controls

```tsx
import { ModeToggle, ThemeSwitcher, ThemeDropdown, RandomizeButton } from '@theme';

<ModeToggle />        // Light/dark/system dropdown
<ThemeSwitcher />     // Color theme selector
<ThemeDropdown />     // All-in-one: mode + theme + radius + randomize
<RandomizeButton />   // Randomize all theme parameters
```

### SSR

```tsx
import { ThemeScript } from '@theme';

// Inline script to prevent FOUC — reads cookies before first paint
<ThemeScript />
```

## Utilities

```typescript
import { getTheme, getFont, getDefaultFont, generateThemeCSS, randomizeThemeParams } from '@theme';
import { getThemeFromCookies, getActualColorMode } from '@theme';

getTheme('blue');                    // Theme definition object
generateThemeCSS('blue', 'dark', 'lg');  // CSS string for theme/mode/radius
getThemeFromCookies(cookies);        // Server-side theme resolution
```

## Dependencies

- **`@shadcn`** — Button, DropdownMenu components
- **External** — Effect Atom, Lucide icons
