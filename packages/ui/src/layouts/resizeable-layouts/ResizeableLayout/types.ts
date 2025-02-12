import { LucideIcon } from 'lucide-react'

// Panel positions as const to enable literal types
export const PANEL_POSITIONS = {
  TOP: 'top',
  LEFT: 'left',
  MIDDLE: 'middle',
  RIGHT: 'right',
  BOTTOM: 'bottom',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_MIDDLE: 'bottom-middle',
  BOTTOM_RIGHT: 'bottom-right',
} as const

// Convert the object values to a union type
export type PanelPosition = typeof PANEL_POSITIONS[keyof typeof PANEL_POSITIONS]

// Type for panel ID
export type PanelId = string

// Type for keyboard shortcuts
export interface PanelShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
}

// Type for the render function props
export interface PanelRenderProps {
  activeIds: Record<PanelPosition, PanelId>
}

// Position-specific panel interfaces
export interface Panel {
  id: PanelId
  position: PanelPosition
  label: string
  icon: LucideIcon
  shortcut?: PanelShortcut
  defaultSize?: number
  minSize?: number
  maxSize?: number
  resizable?: boolean
  collapsible?: boolean
  render: (props: PanelRenderProps) => React.ReactNode
}

// Default sizes configuration
export const DEFAULT_SIZES: Record<PanelPosition, number> = {
  [PANEL_POSITIONS.TOP]: 10,
  [PANEL_POSITIONS.LEFT]: 20,
  [PANEL_POSITIONS.MIDDLE]: 60,
  [PANEL_POSITIONS.RIGHT]: 20,
  [PANEL_POSITIONS.BOTTOM]: 30,
  [PANEL_POSITIONS.BOTTOM_LEFT]: 30,
  [PANEL_POSITIONS.BOTTOM_MIDDLE]: 30,
  [PANEL_POSITIONS.BOTTOM_RIGHT]: 30,
}

// Default minimum sizes configuration
export const DEFAULT_MIN_SIZES: Record<PanelPosition, number> = {
  [PANEL_POSITIONS.TOP]: 5,
  [PANEL_POSITIONS.LEFT]: 15,
  [PANEL_POSITIONS.MIDDLE]: 30,
  [PANEL_POSITIONS.RIGHT]: 15,
  [PANEL_POSITIONS.BOTTOM]: 15,
  [PANEL_POSITIONS.BOTTOM_LEFT]: 15,
  [PANEL_POSITIONS.BOTTOM_MIDDLE]: 15,
  [PANEL_POSITIONS.BOTTOM_RIGHT]: 15,
}

// Default maximum sizes configuration
export const DEFAULT_MAX_SIZES: Record<PanelPosition, number> = {
  [PANEL_POSITIONS.TOP]: 50,
  [PANEL_POSITIONS.LEFT]: 40,
  [PANEL_POSITIONS.MIDDLE]: 80,
  [PANEL_POSITIONS.RIGHT]: 40,
  [PANEL_POSITIONS.BOTTOM]: 50,
  [PANEL_POSITIONS.BOTTOM_LEFT]: 40,
  [PANEL_POSITIONS.BOTTOM_MIDDLE]: 50,
  [PANEL_POSITIONS.BOTTOM_RIGHT]: 40,
} 