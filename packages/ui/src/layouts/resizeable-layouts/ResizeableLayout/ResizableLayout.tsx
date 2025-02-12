'use client'

import React, { useRef, useEffect } from 'react'
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels'
import { usePanelStore } from './usePanelStore'
import { TopBar } from './TopBar'
import { LucideIcon } from 'lucide-react'
import { cn } from '@repo/ui'
import {
  PanelConfig,
  PanelPosition,
  PanelId,
  DEFAULT_SIZES,
  DEFAULT_MIN_SIZES,
  DEFAULT_MAX_SIZES,
  PANEL_POSITIONS
} from './types'

interface ResizableLayoutProps {
  storeId: string
  panels?: PanelConfig[]
  defaultActiveIds?: Partial<Record<PanelPosition, PanelId>>
  courseTitle?: string
  courseSubtitle?: string
  onCourseClick?: () => void
  topBarToggleable?: boolean
}

export default function ResizableLayout({
  storeId,
  panels = [],
  defaultActiveIds,
  courseTitle,
  courseSubtitle,
  onCourseClick,
  topBarToggleable = false
}: ResizableLayoutProps) {
  // Group panels by position
  const panelsByPosition = React.useMemo(() => {
    const grouped = new Map<PanelPosition, PanelConfig[]>()
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

  const store = usePanelStore(storeId)
  const { 
    topVisible,
    leftVisible, 
    rightVisible, 
    bottomVisible,
    bottomLeftVisible,
    bottomMiddleVisible,
    bottomRightVisible,
    
    topSize,
    leftSize, 
    middleSize, 
    rightSize, 
    bottomSize,
    bottomLeftSize,
    bottomMiddleSize,
    bottomRightSize,
    
    activeIds,
    isMobileLayout,
    activeMobilePanel,
    isHydrated,
    
    setTopVisible,
    setLeftVisible, 
    setRightVisible, 
    setBottomVisible,
    setBottomLeftVisible,
    setBottomMiddleVisible,
    setBottomRightVisible,
    
    setPanelSizes,
    setActiveId,
    setIsMobileLayout,
    setActiveMobilePanel
  } = store()

  const panelRefs = {
    top: useRef<ImperativePanelHandle>(null),
    left: useRef<ImperativePanelHandle>(null),
    middle: useRef<ImperativePanelHandle>(null),
    right: useRef<ImperativePanelHandle>(null),
    bottom: useRef<ImperativePanelHandle>(null),
    'bottom-left': useRef<ImperativePanelHandle>(null),
    'bottom-middle': useRef<ImperativePanelHandle>(null),
    'bottom-right': useRef<ImperativePanelHandle>(null),
  }

  // Initialize store with default active IDs and visibility states
  useEffect(() => {
    if (defaultActiveIds && typeof window !== 'undefined' && isHydrated) {
      // Only set initial active IDs if they're not already set
      Object.entries(defaultActiveIds).forEach(([position, id]) => {
        if (!id) return // Skip if no active ID
        
        // Only set if there's no existing active ID for this position
        if (!activeIds[position as PanelPosition]) {
          setActiveId(position as PanelPosition, id)
        }
      })
    }
  }, [defaultActiveIds, setActiveId, isHydrated, activeIds])

  // Handle initial panel sizes and visibility
  useEffect(() => {
    if (!isMobileLayout && isHydrated) {
      // Initialize all panel sizes based on stored visibility states
      const allSizes = {
        left: leftVisible ? leftSize : 0,
        middle: middleSize,
        right: rightVisible ? rightSize : 0,
        bottom: bottomVisible ? bottomSize : 0,
        'bottom-left': bottomLeftVisible ? bottomLeftSize : 0,
        'bottom-middle': bottomMiddleVisible ? bottomMiddleSize : 0,
        'bottom-right': bottomRightVisible ? bottomRightSize : 0,
        top: topVisible ? topSize : 0
      }
      
      Object.entries(allSizes).forEach(([position, size]) => {
        const ref = panelRefs[position as PanelPosition]
        if (ref.current) {
          if (size > 0) {
            ref.current.resize(size)
            ref.current.expand()
          } else {
            ref.current.collapse()
          }
        }
      })
    }
  }, [isMobileLayout, isHydrated, 
      leftSize, middleSize, rightSize, 
      bottomSize, bottomLeftSize, bottomMiddleSize, bottomRightSize, topSize,
      leftVisible, rightVisible, bottomVisible, bottomLeftVisible, bottomMiddleVisible, bottomRightVisible, topVisible])

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

  // Initialize store
  useEffect(() => {
    if (typeof window !== 'undefined') {
      store.persist.rehydrate()
    }
  }, [store])

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
      const getVisibilityState = (pos: PanelPosition) => {
        switch (pos) {
          case 'top': return topVisible
          case 'left': return leftVisible
          case 'right': return rightVisible
          case 'bottom': return bottomVisible
          case 'bottom-left': return bottomLeftVisible
          case 'bottom-middle': return bottomMiddleVisible
          case 'bottom-right': return bottomRightVisible
          default: return true
        }
      }
      
      const setVisibilityState = (pos: PanelPosition, visible: boolean) => {
        switch (pos) {
          case 'top': setTopVisible(visible); break
          case 'left': setLeftVisible(visible); break
          case 'right': setRightVisible(visible); break
          case 'bottom': setBottomVisible(visible); break
          case 'bottom-left': setBottomLeftVisible(visible); break
          case 'bottom-middle': setBottomMiddleVisible(visible); break
          case 'bottom-right': setBottomRightVisible(visible); break
        }
      }

      const isVisible = getVisibilityState(panel.position)
      const ref = panelRefs[panel.position]

      if (isCurrentlyActive && isVisible && panel.collapsible !== false) {
        // If clicking the active panel and it's collapsible, collapse it
        setVisibilityState(panel.position, false)
        ref.current?.collapse()
      } else {
        // Otherwise, activate and show the panel
        setActiveId(panel.position, panel.id)
        if (!isVisible && panel.collapsible !== false) {
          setVisibilityState(panel.position, true)
          // Only expand the panel, don't reset sizes
          ref.current?.expand()
        }
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

  const handleResize = (sizes: number[], direction: 'horizontal' | 'vertical' = 'horizontal') => {
    if (!isMobileLayout && isHydrated) {
      const PANEL_CLOSED_THRESHOLD = 1

      if (direction === 'horizontal') {
        const [left, middle, right] = sizes
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
        
        // Only update horizontal sizes
        setPanelSizes({
          left: newSizes.left,
          middle: newSizes.middle,
          right: newSizes.right
        })
      } else if (direction === 'vertical') {
        // For vertical resizing, we get [top, main, bottom] sizes
        const [top, main, bottom] = sizes
        console.log('Vertical resize - Raw sizes:', { top, main, bottom })
        
        // Only update the bottom size since that's what we're resizing
        const newBottomSize = Math.max(0, bottom || 0)
        console.log('New bottom size:', newBottomSize)

        if (newBottomSize <= PANEL_CLOSED_THRESHOLD && bottomVisible) {
          setBottomVisible(false)
        } else if (newBottomSize > PANEL_CLOSED_THRESHOLD && !bottomVisible) {
          setBottomVisible(true)
        }

        // Only update the bottom size, preserving all other sizes
        setPanelSizes({
          bottom: newBottomSize
        })
      }
    }
  }

  const renderPanel = (position: PanelPosition) => {
    const activeId = activeIds[position]
    const positionPanels = panelsByPosition.get(position) || []
    const activePanel = positionPanels.find(p => p.id === activeId)
    
    if (!activePanel) return null
    return activePanel.render({ activeIds })
  }

  const handleResetPanelSize = (position: PanelPosition) => {
    if (!isMobileLayout && isHydrated) {
      const ref = panelRefs[position]
      if (ref.current) {
        const defaultSize = DEFAULT_SIZES[position]
        ref.current.resize(defaultSize)
        setPanelSizes({ [position]: defaultSize })
      }
    }
  }

  const handleResetAllPanelSizes = () => {
    if (!isMobileLayout && isHydrated) {
      Object.entries(DEFAULT_SIZES).forEach(([position, size]) => {
        const ref = panelRefs[position as PanelPosition]
        if (ref.current) {
          ref.current.resize(size)
        }
      })
      setPanelSizes(DEFAULT_SIZES)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Main vertical PanelGroup to handle top/bottom layout */}
      <PanelGroup 
        direction="vertical" 
        className="h-full"
        onLayout={(sizes) => {
          console.log('Vertical PanelGroup onLayout:', sizes)
          // Only trigger resize if we have valid sizes for vertical resizing
          if (sizes && sizes.length === 2) {
            // Convert 2-panel sizes to 3-panel format [0, main, bottom]
            const [main, bottom] = sizes
            handleResize([0, main, bottom], 'vertical')
          }
        }}
      >
        {/* TopBar section */}
        {topBarToggleable ? (
          <>
            <Panel
              id="top"
              ref={panelRefs.top}
              defaultSize={isHydrated ? (topVisible ? topSize : 0) : DEFAULT_SIZES.top}
              collapsible
              minSize={DEFAULT_MIN_SIZES.top}
              maxSize={30}
              style={{ visibility: topVisible ? 'visible' : 'hidden' }}
            >
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
                topBarToggleable={topBarToggleable}
                onResetPanelSize={handleResetPanelSize}
                onResetAllPanelSizes={handleResetAllPanelSizes}
              />
            </Panel>
            <PanelResizeHandle 
              className={cn(
                "h-1 bg-border hover:bg-foreground/10 transition-colors",
                !topVisible && "pointer-events-none opacity-0"
              )}
              id="top-resize-handle"
            />
          </>
        ) : (
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
            topBarToggleable={topBarToggleable}
            onResetPanelSize={handleResetPanelSize}
            onResetAllPanelSizes={handleResetAllPanelSizes}
          />
        )}

        {/* Main content panel */}
        <Panel>
          <div className="h-full flex flex-col">
            <div className="flex-1 flex overflow-hidden">
              {isMobileLayout ? (
                <div className="flex-grow">
                  {renderPanel(activeMobilePanel)}
                </div>
              ) : (
                <PanelGroup direction="horizontal" className="flex-grow" onLayout={(sizes) => handleResize(sizes, 'horizontal')}>
                  {/* Left Panel */}
                  <Panel
                    id="left"
                    ref={panelRefs.left}
                    defaultSize={isHydrated ? (leftVisible ? leftSize : 0) : DEFAULT_SIZES.left}
                    collapsible={panels.find(p => p.position === 'left')?.collapsible ?? true}
                    minSize={panels.find(p => p.position === 'left')?.minSize ?? DEFAULT_MIN_SIZES.left}
                    maxSize={panels.find(p => p.position === 'left')?.maxSize ?? DEFAULT_MAX_SIZES.left}
                    style={{ visibility: leftVisible ? 'visible' : 'hidden' }}
                  >
                    <PanelGroup direction="vertical">
                      <Panel className="flex-grow">
                        {renderPanel('left')}
                      </Panel>
                      {panelsByPosition.has('bottom-left') && (
                        <>
                          <PanelResizeHandle 
                            className={cn(
                              "h-1 bg-border hover:bg-foreground/10 transition-colors",
                              !bottomLeftVisible && "pointer-events-none opacity-0"
                            )}
                          />
                          <Panel
                            defaultSize={bottomLeftSize}
                            collapsible={panels.find(p => p.position === 'bottom-left')?.collapsible ?? true}
                            minSize={panels.find(p => p.position === 'bottom-left')?.minSize ?? DEFAULT_MIN_SIZES['bottom-left']}
                            maxSize={panels.find(p => p.position === 'bottom-left')?.maxSize ?? DEFAULT_MAX_SIZES['bottom-left']}
                            style={{ visibility: bottomLeftVisible ? 'visible' : 'hidden' }}
                          >
                            {renderPanel('bottom-left')}
                          </Panel>
                        </>
                      )}
                    </PanelGroup>
                  </Panel>

                  <PanelResizeHandle 
                    className={cn(
                      "w-1 bg-border hover:bg-foreground/10 transition-colors",
                      !leftVisible && "pointer-events-none opacity-0"
                    )} 
                    id="left-resize-handle" 
                  />

                  {/* Middle Panel */}
                  <Panel 
                    id="middle" 
                    ref={panelRefs.middle}
                    defaultSize={isHydrated ? middleSize : DEFAULT_SIZES.middle}
                    minSize={panels.find(p => p.position === 'middle')?.minSize ?? DEFAULT_MIN_SIZES.middle}
                    maxSize={panels.find(p => p.position === 'middle')?.maxSize ?? DEFAULT_MAX_SIZES.middle}
                    className="overflow-hidden"
                  >
                    <PanelGroup direction="vertical">
                      <Panel className="flex-grow">
                        <div className="h-full overflow-y-auto">
                          {renderPanel('middle')}
                        </div>
                      </Panel>
                      {panelsByPosition.has('bottom-middle') && (
                        <>
                          <PanelResizeHandle 
                            className={cn(
                              "h-1 bg-border hover:bg-foreground/10 transition-colors",
                              !bottomMiddleVisible && "pointer-events-none opacity-0"
                            )}
                          />
                          <Panel
                            defaultSize={bottomMiddleSize}
                            collapsible={panels.find(p => p.position === 'bottom-middle')?.collapsible ?? true}
                            minSize={panels.find(p => p.position === 'bottom-middle')?.minSize ?? DEFAULT_MIN_SIZES['bottom-middle']}
                            maxSize={panels.find(p => p.position === 'bottom-middle')?.maxSize ?? DEFAULT_MAX_SIZES['bottom-middle']}
                            style={{ visibility: bottomMiddleVisible ? 'visible' : 'hidden' }}
                          >
                            {renderPanel('bottom-middle')}
                          </Panel>
                        </>
                      )}
                    </PanelGroup>
                  </Panel>

                  <PanelResizeHandle 
                    className={cn(
                      "w-1 bg-border hover:bg-foreground/10 transition-colors",
                      !rightVisible && "pointer-events-none opacity-0"
                    )} 
                    id="right-resize-handle" 
                  />

                  {/* Right Panel */}
                  <Panel
                    id="right"
                    ref={panelRefs.right}
                    defaultSize={isHydrated ? (rightVisible ? rightSize : 0) : DEFAULT_SIZES.right}
                    collapsible={panels.find(p => p.position === 'right')?.collapsible ?? true}
                    minSize={panels.find(p => p.position === 'right')?.minSize ?? DEFAULT_MIN_SIZES.right}
                    maxSize={panels.find(p => p.position === 'right')?.maxSize ?? DEFAULT_MAX_SIZES.right}
                    style={{ visibility: rightVisible ? 'visible' : 'hidden' }}
                  >
                    <PanelGroup direction="vertical">
                      <Panel className="flex-grow">
                        {renderPanel('right')}
                      </Panel>
                      {panelsByPosition.has('bottom-right') && (
                        <>
                          <PanelResizeHandle 
                            className={cn(
                              "h-1 bg-border hover:bg-foreground/10 transition-colors",
                              !bottomRightVisible && "pointer-events-none opacity-0"
                            )}
                          />
                          <Panel
                            defaultSize={bottomRightSize}
                            collapsible={panels.find(p => p.position === 'bottom-right')?.collapsible ?? true}
                            minSize={panels.find(p => p.position === 'bottom-right')?.minSize ?? DEFAULT_MIN_SIZES['bottom-right']}
                            maxSize={panels.find(p => p.position === 'bottom-right')?.maxSize ?? DEFAULT_MAX_SIZES['bottom-right']}
                            style={{ visibility: bottomRightVisible ? 'visible' : 'hidden' }}
                          >
                            {renderPanel('bottom-right')}
                          </Panel>
                        </>
                      )}
                    </PanelGroup>
                  </Panel>
                </PanelGroup>
              )}
            </div>
          </div>
        </Panel>

        {/* Bottom Panel */}
        {panelsByPosition.has('bottom') && (
          <>
            <PanelResizeHandle 
              className={cn(
                "h-1 bg-border hover:bg-foreground/10 transition-colors",
                !bottomVisible && "pointer-events-none opacity-0"
              )}
              id="bottom-resize-handle"
            />
            <Panel
              id="bottom"
              ref={panelRefs.bottom}
              defaultSize={isHydrated ? (bottomVisible ? bottomSize : 0) : DEFAULT_SIZES.bottom}
              collapsible={panels.find(p => p.position === 'bottom')?.collapsible ?? true}
              minSize={panels.find(p => p.position === 'bottom')?.minSize ?? DEFAULT_MIN_SIZES.bottom}
              maxSize={panels.find(p => p.position === 'bottom')?.maxSize ?? DEFAULT_MAX_SIZES.bottom}
              style={{ visibility: bottomVisible ? 'visible' : 'hidden' }}
            >
              {renderPanel('bottom')}
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  )
}

