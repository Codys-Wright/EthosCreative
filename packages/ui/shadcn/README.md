# @shadcn

50+ accessible React components built on [Radix UI](https://www.radix-ui.com/) and [Tailwind CSS](https://tailwindcss.com/), using a namespace pattern for compound components.

## Overview

This is the core UI component library for the monorepo. All compound components use `Object.assign()` for dot notation access:

```tsx
import { Card, Dialog } from '@shadcn';

<Card>
  <Card.Header>
    <Card.Title>My Card</Card.Title>
  </Card.Header>
  <Card.Content>Content here</Card.Content>
</Card>
```

## Components

### Compound (Namespace Pattern)

Accordion, Alert, AlertDialog, Avatar, Breadcrumb, Card, Carousel, Chart, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, HoverCard, InputOTP, Menubar, NavigationMenu, Pagination, Popover, RadioGroup, ResizablePanelGroup, ScrollArea, Select, Sheet, Sidebar, Table, Tabs, ToggleGroup, Tooltip

### Simple

AspectRatio, Badge, Banner, Button, ButtonGroup, Calendar, Checkbox, Empty, Field, Form, Input, InputGroup, Item, Kbd, Label, Progress, Separator, Skeleton, Slider, Sonner, Spinner, Switch, Textarea, Toggle

## Utilities

```typescript
import { cn } from '@shadcn';

// Class name merging with Tailwind conflict resolution
cn('px-4 py-2', 'px-6'); // "px-6 py-2"
```

## Hooks

```typescript
import { useIsMobile } from '@shadcn';

const isMobile = useIsMobile(); // true if viewport < 768px
```

## Dependencies

No internal monorepo dependencies — this package only depends on Radix UI, Tailwind, and other external libraries.
