import React from 'react'
import { ArrowLeft, LucideIcon } from 'lucide-react'
import { Button } from '@repo/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui'
import { cn } from "@repo/ui"

type PanelPosition = 'left' | 'middle' | 'right'
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
  onCourseClick
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

  const renderPanelButtons = (position: PanelPosition) => {
    const positionPanels = panelsByPosition.get(position) || []
    return positionPanels.map(panel => (
      <Tooltip key={panel.id}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "hover:bg-muted",
              (isMobileLayout 
                ? activeMobilePanel === position && activeIds[position] === panel.id
                : (position === 'middle' || ((position === 'left' && leftVisible) || (position === 'right' && rightVisible))) && activeIds[position] === panel.id
              ) && "bg-accent hover:bg-accent"
            )}
            size="icon"
            onClick={() => handlePanelChange(panel.id)}
            aria-label={panel.label}
          >
            <panel.icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{panel.label}</p>
        </TooltipContent>
      </Tooltip>
    ))
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
          {renderPanelButtons('left')}
          {panelsByPosition.has('left') && panelsByPosition.has('middle') && (
            <div className="h-6 w-px bg-border mx-2" />
          )}
          {renderPanelButtons('middle')}
          {panelsByPosition.has('middle') && panelsByPosition.has('right') && (
            <div className="h-6 w-px bg-border mx-2" />
          )}
          {renderPanelButtons('right')}
        </div>
      </div>
    </TooltipProvider>
  )
}

