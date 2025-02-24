import { LucideIcon } from 'lucide-react'

export type PanelPosition = 'left' | 'middle' | 'right'
export type PanelId = string

export interface Panel {
  id: PanelId
  label: string
  icon: LucideIcon
  position: PanelPosition
  defaultActive?: boolean
  shortcut?: {
    key: string
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
  }
  defaultSize?: number
  minSize?: number
  render: (props: { activeIds: Record<PanelPosition, PanelId> }) => React.ReactNode
}

export type PanelsByPosition = {
  [K in PanelPosition]: Panel[]
}

export type ActivePanelIds = {
  [K in PanelPosition]: PanelId
}

export const validatePanels = (panels: Panel[]) => {
  // Ensure we have at least one panel for each position
  const positions: PanelPosition[] = ['left', 'middle', 'right']
  const panelsByPosition = new Map<PanelPosition, Panel[]>()
  
  panels.forEach(panel => {
    const positionPanels = panelsByPosition.get(panel.position) || []
    positionPanels.push(panel)
    panelsByPosition.set(panel.position, positionPanels)
  })

  positions.forEach(pos => {
    if (!panelsByPosition.has(pos)) {
      console.warn(`No panels configured for ${pos} position`)
    }
  })

  // Check for duplicate shortcuts
  const shortcuts = new Set<string>()
  panels.forEach(panel => {
    if (panel.shortcut) {
      const shortcutKey = [
        panel.shortcut.ctrl && 'Ctrl',
        panel.shortcut.alt && 'Alt',
        panel.shortcut.shift && 'Shift',
        panel.shortcut.key
      ].filter(Boolean).join('+')
      
      if (shortcuts.has(shortcutKey)) {
        console.error(`Duplicate shortcut ${shortcutKey} for panel ${panel.id}`)
      }
      shortcuts.add(shortcutKey)
    }
  })

  return panels
} 