# @components

Custom React components for rich content display and premium UI effects — blog layouts, animated backgrounds, and responsive navigation.

## Overview

This package provides higher-level UI components built on top of `@shadcn` and Framer Motion. All components are from the Aceternity UI collection, adapted for the monorepo.

## Components

### BackgroundRippleEffect

Animated grid background with click-triggered ripple effects.

```tsx
import { BackgroundRippleEffect } from '@components';

<BackgroundRippleEffect
  ambient              // Auto-trigger ripples at intervals
  portal               // Render via portal to escape layout boundaries
  vignettePosition="bottom"
  opacity={0.5}
/>
```

**Props**: `rows`, `cols`, `cellSize`, `ambient`, `ambientInterval`, `portal`, `vignettePosition` (`top` | `center` | `bottom`), `vignetteFadeCenter`, `opacity`, `className`

### BlogContentWithToc

Full-featured blog article with responsive table of contents.

```tsx
import { BlogContentWithToc } from '@components';

<BlogContentWithToc
  title="My Post"
  content={markdownString}
  author="Jane"
  date={new Date()}
  thumbnail="/hero.jpg"
/>
```

- Auto-generates TOC from H2 headers with slug anchors
- Desktop sidebar TOC + mobile floating menu button
- Renders markdown via `react-markdown`
- SVG/icon detection for special thumbnail styling

### SimpleBlogWithGrid / BlogCard

Grid layout for displaying multiple blog/content items.

```tsx
import { SimpleBlogWithGrid } from '@components';

<SimpleBlogWithGrid
  title="Blog"
  items={[{ title: 'Post', description: '...', slug: 'post' }]}
  columns={3}
/>
```

**Props**: `title`, `description`, `items` (BlogGridItem[]), `basePath`, `columns` (2 | 3 | 4), `isIconImage`, `withNavbarSpacing`, `renderCard`

### Resizable Navbar

Compound navigation component with scroll-based animations.

```tsx
import { Navbar, NavBody, NavItems, MobileNav, MobileNavHeader, MobileNavMenu, MobileNavToggle, NavbarLogo, NavbarButton } from '@components';

<Navbar>
  <NavBody>
    <NavbarLogo />
    <NavItems items={navLinks} />
    <NavbarButton variant="primary">Sign In</NavbarButton>
  </NavBody>
  <MobileNav>
    <MobileNavHeader>
      <NavbarLogo />
      <MobileNavToggle />
    </MobileNavHeader>
    <MobileNavMenu>{/* links */}</MobileNavMenu>
  </MobileNav>
</Navbar>
```

- Scroll-based reveal/hide with glassmorphic blur
- Spring animations via Framer Motion
- Mobile breakpoint at `lg`
- Button variants: `primary`, `secondary`, `dark`, `gradient`

## Markdown Editor (Disabled)

A Lexical-based markdown editor exists at `src/markdown-editor/` but is currently disabled in the main exports due to TypeScript errors. It can be imported directly:

```tsx
import { Editor } from '@components/markdown-editor/editor';
```

## Dependencies

- **`@shadcn`** — UI utilities (`cn` helper, Tooltip)
- **External** — Framer Motion, react-markdown, date-fns, Lucide icons, Lexical
