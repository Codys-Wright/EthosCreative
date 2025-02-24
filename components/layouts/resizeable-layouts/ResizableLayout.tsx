'use client'

import React, { useRef, useEffect } from 'react'
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels'
import { usePanelStore } from './usePanelStore'
import { TopBar } from './TopBar'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type PanelPosition = 'left' | 'middle' | 'right'
type PanelId = string

interface ResizablePanel {
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

interface ResizableLayoutProps {
  storeId: string
  panels: ResizablePanel[]
  courseTitle?: string
  courseSubtitle?: string
  onCourseClick?: () => void
  defaultActiveIds?: Record<PanelPosition, PanelId>
}

const DEFAULT_SIZES = {
  left: 20,
  middle: 60,
  right: 20,
}

const DEFAULT_MIN_SIZES = {
  left: 15,
  middle: 30,
  right: 15,
}

export default function ResizableLayout({
  storeId,
  panels,
  courseTitle,
  courseSubtitle,
  onCourseClick,
  defaultActiveIds
}: ResizableLayoutProps) {
  const store = usePanelStore(storeId)
  const {
    leftVisible,
    rightVisible,
    leftSize,
    middleSize,
    rightSize,
    activeIds,
    isMobileLayout,
    activeMobilePanel,
    setLeftVisible,
    setRightVisible,
    setPanelSizes,
    setActiveId,
    setIsMobileLayout,
    setActiveMobilePanel,
    initializeActiveIds
  } = store()

  // Initialize active IDs with defaults on mount
  useEffect(() => {
    const defaultIds = defaultActiveIds ?? panels.reduce((acc, panel) => ({
      ...acc,
      [panel.position]: panel.defaultActive ? panel.id : ''
    }), {} as Record<PanelPosition, PanelId>)

    console.log(`[${storeId}] Initializing with default IDs:`, defaultIds)
    initializeActiveIds(panels.map(panel => ({
      id: panel.id,
      position: panel.position
    })))

    // Set default active IDs
    Object.entries(defaultIds).forEach(([position, id]) => {
      if (id) {
        setActiveId(position as PanelPosition, id)
      }
    })
  }, [storeId, panels, defaultActiveIds, initializeActiveIds, setActiveId])

  // Group panels by position
  const panelsByPosition = React.useMemo(() => {
    const grouped = new Map<PanelPosition, ResizablePanel[]>()
    if (!panels) return grouped

    panels.forEach(panel => {
      const positionPanels = grouped.get(panel.position) || []
      positionPanels.push(panel)
      grouped.set(panel.position, positionPanels)
    })
    return grouped
  }, [panels])

  // Validate panel configuration
  React.useEffect(() => {
    if (!panels) return

    // Ensure we have at least one panel for each position
    const positions: PanelPosition[] = ['left', 'middle', 'right']
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
  }, [panels, panelsByPosition])

  const panelRefs = {
    left: useRef<ImperativePanelHandle>(null),
    middle: useRef<ImperativePanelHandle>(null),
    right: useRef<ImperativePanelHandle>(null),
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!panels) return

    const handleKeyDown = (e: KeyboardEvent) => {
      panels.forEach(panel => {
        if (panel.shortcut) {
          const { key, ctrl, alt, shift } = panel.shortcut
          if (
            e.key.toLowerCase() === key.toLowerCase() &&
            (!ctrl || e.ctrlKey) &&
            (!alt || e.altKey) &&
            (!shift || e.shiftKey)
          ) {
            e.preventDefault()
            setActiveId(panel.position, panel.id)
          }
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [panels, setActiveId])

  // Handle initial panel sizes
  useEffect(() => {
    if (!isMobileLayout && panels.length > 0) {
      const sizes = {
        left: leftSize,
        middle: middleSize,
        right: rightSize
      }
      
      Object.entries(sizes).forEach(([position, size]) => {
        const ref = panelRefs[position as PanelPosition]
        const currentSize = ref.current?.getSize()
        if (currentSize !== size) {
          ref.current?.resize(size)
        }
      })
    }
  }, [isMobileLayout, leftSize, middleSize, rightSize, panels])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768
      if (newIsMobile !== isMobileLayout) {
        setIsMobileLayout(newIsMobile)
        if (!newIsMobile) {
          setLeftVisible(leftSize > 0)
          setRightVisible(rightSize > 0)
        }
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setIsMobileLayout, isMobileLayout, leftSize, rightSize, setLeftVisible, setRightVisible])

  const handlePanelChange = (panelId: PanelId) => {
    if (!panels) return
    
    const panel = panels.find(p => p.id === panelId)
    if (!panel) return

    if (isMobileLayout) {
      // In mobile, just switch panels
      setActiveMobilePanel(panel.position)
      setActiveId(panel.position, panel.id)
    } else {
      const isCurrentlyActive = activeIds[panel.position] === panel.id

      switch (panel.position) {
        case 'left':
          if (isCurrentlyActive && leftVisible) {
            // If clicking the active panel, collapse it
            setLeftVisible(false)
            const ref = panelRefs.left
            ref.current?.collapse()
          } else {
            // Otherwise, activate and show the panel
            setActiveId('left', panel.id)
            if (!leftVisible) {
              setLeftVisible(true)
              const ref = panelRefs.left
              ref.current?.expand()
            }
          }
          break
        case 'right':
          if (isCurrentlyActive && rightVisible) {
            // If clicking the active panel, collapse it
            setRightVisible(false)
            const ref = panelRefs.right
            ref.current?.collapse()
          } else {
            // Otherwise, activate and show the panel
            setActiveId('right', panel.id)
            if (!rightVisible) {
              setRightVisible(true)
              const ref = panelRefs.right
              ref.current?.expand()
            }
          }
          break
        case 'middle':
          setActiveId('middle', panel.id)
          break
      }
    }
  }

  const togglePanel = (position: 'left' | 'right') => {
    if (!isMobileLayout) {
      const ref = panelRefs[position]
      const isVisible = position === 'left' ? leftVisible : rightVisible
      const setVisible = position === 'left' ? setLeftVisible : setRightVisible
      
      if (isVisible) {
        setPanelSizes(
          position === 'left' ? ref.current?.getSize() || leftSize : leftSize,
          middleSize,
          position === 'right' ? ref.current?.getSize() || rightSize : rightSize
        )
        ref.current?.collapse()
      } else {
        ref.current?.expand()
      }
      setVisible(!isVisible)
    }
  }

  const handleResize = (sizes: number[]) => {
    if (!isMobileLayout && sizes.length === 3) {
      const [left, middle, right] = sizes
      const PANEL_CLOSED_THRESHOLD = 1

      const newSizes = {
        left: Math.max(0, left || 0),
        middle: Math.max(0, middle || 0),
        right: Math.max(0, right || 0)
      }

      // Update visibility states based on sizes
      if (newSizes.left <= PANEL_CLOSED_THRESHOLD && leftVisible) {
        setLeftVisible(false)
      } else if (newSizes.left > PANEL_CLOSED_THRESHOLD && !leftVisible) {
        setLeftVisible(true)
      }

      if (newSizes.right <= PANEL_CLOSED_THRESHOLD && rightVisible) {
        setRightVisible(false)
      } else if (newSizes.right > PANEL_CLOSED_THRESHOLD && !rightVisible) {
        setRightVisible(true)
      }
      
      setPanelSizes(newSizes.left, newSizes.middle, newSizes.right)
    }
  }

  const renderPanel = (position: PanelPosition) => {
    const activeId = activeIds[position]
    const positionPanels = panelsByPosition.get(position) || []
    const activePanel = positionPanels.find(p => p.id === activeId)
    
    if (!activePanel) return null
    return activePanel.render({ activeIds })
  }

  return (
    <div className="h-full flex flex-col">
      <TopBar 
        isMobileLayout={isMobileLayout}
        activeMobilePanel={activeMobilePanel}
        leftVisible={leftVisible}
        rightVisible={rightVisible}
        activeIds={activeIds}
        handlePanelChange={handlePanelChange}
        panels={panels}
        courseTitle={courseTitle} 
        courseSubtitle={courseSubtitle} 
        onCourseClick={onCourseClick}
      />
      <div className="flex-1 flex overflow-hidden">
        {isMobileLayout ? (
          <div className="flex-grow">
            {renderPanel(activeMobilePanel)}
          </div>
        ) : (
          <PanelGroup 
            direction="horizontal" 
            className="flex-grow" 
            onLayout={handleResize}
          >
            <Panel
              id="left"
              ref={panelRefs.left}
              defaultSize={leftSize}
              collapsible
              minSize={DEFAULT_MIN_SIZES.left}
              style={{ visibility: leftVisible ? 'visible' : 'hidden' }}
            >
              {renderPanel('left')}
            </Panel>
            <PanelResizeHandle 
              className={cn(
                "w-1 bg-border hover:bg-foreground/10 transition-colors",
                !leftVisible && "pointer-events-none opacity-0"
              )} 
              id="left-resize-handle" 
            />
            <Panel 
              id="middle" 
              ref={panelRefs.middle}
              defaultSize={middleSize}
              minSize={DEFAULT_MIN_SIZES.middle}
              className="overflow-hidden"
            >
              <div className="h-full overflow-y-auto">
                {renderPanel('middle')}
              </div>
            </Panel>
            <PanelResizeHandle 
              className={cn(
                "w-1 bg-border hover:bg-foreground/10 transition-colors",
                !rightVisible && "pointer-events-none opacity-0"
              )} 
              id="right-resize-handle" 
            />
            <Panel
              id="right"
              ref={panelRefs.right}
              defaultSize={rightSize}
              collapsible
              minSize={DEFAULT_MIN_SIZES.right}
              style={{ visibility: rightVisible ? 'visible' : 'hidden' }}
            >
              {renderPanel('right')}
            </Panel>
          </PanelGroup>
        )}
      </div>
    </div>
  )
}

