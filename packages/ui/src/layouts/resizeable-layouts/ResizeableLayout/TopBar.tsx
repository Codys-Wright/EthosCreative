import React from 'react'
import { ArrowLeft, LucideIcon } from 'lucide-react'
import { Button } from '@repo/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@repo/ui'
import { cn } from "@repo/ui"
import { DEFAULT_SIZES } from './ResizableLayout'

type PanelPosition = 'left' | 'middle' | 'right' | 'top' | 'bottom' | 'bottom-left' | 'bottom-middle' | 'bottom-right'
type PanelId = string

interface PanelConfig {
  id: PanelId
  label: string
  icon: LucideIcon
  position: PanelPosition
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

interface TopBarProps {
  isMobileLayout: boolean
  activeMobilePanel: PanelPosition
  leftVisible: boolean
  rightVisible: boolean
  activeIds: Record<PanelPosition, PanelId>
  handlePanelChange: (panelId: PanelId) => void
  panels: PanelConfig[]
  courseTitle?: string
  courseSubtitle?: string
  onCourseClick?: () => void
  topBarToggleable?: boolean
  onResetPanelSize?: (position: PanelPosition) => void
  onResetAllPanelSizes?: () => void
}

export function TopBar({
  isMobileLayout,
  activeMobilePanel,
  leftVisible,
  rightVisible,
  activeIds,
  handlePanelChange,
  panels,
  courseTitle = "Course Editor",
  courseSubtitle = "Manage your course structure and content",
  onCourseClick,
  topBarToggleable = false,
  onResetPanelSize,
  onResetAllPanelSizes
}: TopBarProps) {
  // Group panels by position
  const panelsByPosition = React.useMemo(() => {
    const grouped = new Map<PanelPosition, PanelConfig[]>()
    panels.forEach(panel => {
      const positionPanels = grouped.get(panel.position) || []
      positionPanels.push(panel)
      grouped.set(panel.position, positionPanels)
    })
    return grouped
  }, [panels])

  const renderPanelButtons = (positions: PanelPosition[]) => {
    return positions.map(position => {
      const positionPanels = panelsByPosition.get(position) || []
      return positionPanels.map(panel => {
        const isTopBarButton = panel.position === 'top'
        const isDisabled = isTopBarButton && !topBarToggleable
        
        const button = (
          <Button
            variant="ghost"
            className={cn(
              "hover:bg-muted",
              (isMobileLayout 
                ? activeMobilePanel === position && activeIds[position] === panel.id
                : activeIds[position] === panel.id
              ) && "bg-accent hover:bg-accent",
              isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
            )}
            size="icon"
            onClick={() => !isDisabled && handlePanelChange(panel.id)}
            aria-label={panel.label}
            disabled={isDisabled}
          >
            <panel.icon className="h-4 w-4" />
          </Button>
        )

        const tooltipContent = (
          <>
            <p>{panel.label}</p>
            {panel.shortcut && (
              <p className="text-xs text-muted-foreground">
                {[
                  panel.shortcut.ctrl && 'Ctrl',
                  panel.shortcut.alt && 'Alt',
                  panel.shortcut.shift && 'Shift',
                  panel.shortcut.key.toUpperCase()
                ].filter(Boolean).join('+')}
                {isDisabled && " (disabled)"}
              </p>
            )}
          </>
        )

        return (
          <ContextMenu key={panel.id}>
            <ContextMenuTrigger>
              <Tooltip>
                <TooltipTrigger asChild>
                  {button}
                </TooltipTrigger>
                <TooltipContent>
                  {tooltipContent}
                </TooltipContent>
              </Tooltip>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem 
                onClick={() => onResetPanelSize?.(panel.position)}
                disabled={isDisabled}
              >
                Reset {panel.label} Size
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => onResetAllPanelSizes?.()}
                disabled={isDisabled}
              >
                Reset All Panel Sizes
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )
      })
    })
  }

  return (
    <TooltipProvider>
      <div className="flex items-center p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div
            className="cursor-pointer hover:opacity-80"
            onClick={onCourseClick}
          >
            <h1 className="text-lg font-semibold">{courseTitle}</h1>
            <p className="text-sm text-muted-foreground">{courseSubtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {/* Left section buttons */}
          {renderPanelButtons(['left'])}
          {panelsByPosition.has('left') && panelsByPosition.has('middle') && (
            <div className="h-6 w-px bg-border mx-2" />
          )}

          {/* Middle section buttons */}
          {renderPanelButtons(['middle'])}
          {panelsByPosition.has('middle') && (panelsByPosition.has('right') || panelsByPosition.has('top') || panelsByPosition.has('bottom')) && (
            <div className="h-6 w-px bg-border mx-2" />
          )}

          {/* Right section with all other panel buttons */}
          {renderPanelButtons(['right', 'top', 'bottom', 'bottom-left', 'bottom-middle', 'bottom-right'])}
        </div>
      </div>
    </TooltipProvider>
  )
}

