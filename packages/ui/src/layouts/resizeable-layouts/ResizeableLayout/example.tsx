'use client'

import { FolderTree, FileText, BookOpen, Inspect, MessageCircle, ArrowUp, ArrowDown, CornerLeftDown, CornerRightDown } from 'lucide-react'
import ResizableLayout from './ResizableLayout'
import { usePanelStore, type PanelPosition } from './usePanelStore'
import { useEffect, useMemo } from 'react'

// Simple placeholder components
const TreeEditor = ({ mode }: { mode: 'curriculum' | 'editor' }) => (
  <div className="p-4">
    <h2 className="text-lg font-bold mb-4">Tree Editor ({mode} mode)</h2>
    <div className="space-y-2">
      <div className="p-2 bg-muted rounded">Sample Section 1</div>
      <div className="p-2 bg-muted rounded">Sample Section 2</div>
    </div>
  </div>
)

const ConceptEditor = () => (
  <div className="p-4">
    <h2 className="text-lg font-bold mb-4">Concept Editor</h2>
    <div className="p-4 bg-muted rounded">Concept editing interface</div>
  </div>
)

const CurriculumEditor = () => (
  <div className="p-4">
    <h2 className="text-lg font-bold mb-4">Curriculum Editor</h2>
    <div className="p-4 bg-muted rounded">Curriculum editing interface</div>
  </div>
)

const Inspector = () => (
  <div className="p-4">
    <h2 className="text-lg font-bold mb-4">Inspector</h2>
    <div className="p-4 bg-muted rounded">Properties and settings</div>
  </div>
)

const Chat = () => (
  <div className="p-4">
    <h2 className="text-lg font-bold mb-4">Chat</h2>
    <div className="p-4 bg-muted rounded">Chat interface</div>
  </div>
)

const TopPanel = () => (
  <div className="p-4 bg-background border-b">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold">Top Panel Content</h2>
        <p className="text-sm text-muted-foreground">This is a toggleable top panel</p>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-muted rounded">Action 1</button>
        <button className="px-4 py-2 bg-muted rounded">Action 2</button>
      </div>
    </div>
  </div>
)

const BottomPanel = () => (
  <div className="p-4">
    <h2 className="text-lg font-bold mb-4">Bottom Panel</h2>
    <div className="p-4 bg-muted rounded">Bottom panel content</div>
  </div>
)

const BottomLeftPanel = () => (
  <div className="p-4">
    <h2 className="text-lg font-bold mb-4">Bottom Left Panel</h2>
    <div className="p-4 bg-muted rounded">Bottom left content</div>
  </div>
)

const BottomRightPanel = () => (
  <div className="p-4">
    <h2 className="text-lg font-bold mb-4">Bottom Right Panel</h2>
    <div className="p-4 bg-muted rounded">Bottom right content</div>
  </div>
)

// Define panels configuration outside component to prevent recreation
const createPanels = () => [
  {
    id: 'top-panel',
    label: 'Top Panel',
    icon: ArrowUp,
    position: 'top' as const,
    shortcut: { key: 'y', ctrl: true },
    collapsible: true,
    render: () => <TopPanel />
  },
  {
    id: 'tree-editor',
    label: 'Tree Editor',
    icon: FolderTree,
    position: 'left' as const,
    shortcut: { key: 't', ctrl: true },
    render: ({ activeIds }: { activeIds: Record<PanelPosition, string> }) => (
      <TreeEditor mode={activeIds.middle === 'curriculum-editor' ? 'curriculum' : 'editor'} />
    )
  },
  {
    id: 'concept-editor',
    label: 'Concept Editor',
    icon: FileText,
    position: 'middle' as const,
    shortcut: { key: 'e', ctrl: true },
    render: () => <ConceptEditor />
  },
  {
    id: 'curriculum-editor',
    label: 'Curriculum Editor',
    icon: BookOpen,
    position: 'middle' as const,
    shortcut: { key: 'c', ctrl: true },
    render: () => <CurriculumEditor />
  },
  {
    id: 'inspector',
    label: 'Inspector',
    icon: Inspect,
    position: 'right' as const,
    shortcut: { key: 'i', ctrl: true },
    render: () => <Inspector />
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageCircle,
    position: 'right' as const,
    shortcut: { key: 'm', ctrl: true },
    render: () => <Chat />
  },
  {
    id: 'bottom-panel',
    label: 'Bottom Panel',
    icon: ArrowDown,
    position: 'bottom' as const,
    shortcut: { key: 'b', ctrl: true },
    render: () => <BottomPanel />
  },
  {
    id: 'bottom-left-panel',
    label: 'Bottom Left Panel',
    icon: CornerLeftDown,
    position: 'bottom-left' as const,
    shortcut: { key: 'l', ctrl: true },
    render: () => <BottomLeftPanel />
  },
  {
    id: 'bottom-right-panel',
    label: 'Bottom Right Panel',
    icon: CornerRightDown,
    position: 'bottom-right' as const,
    render: () => <BottomRightPanel />
  }
]

const defaultActiveIds = {
  top: 'top-panel',
  left: 'tree-editor',
  middle: 'concept-editor',
  right: 'inspector',
  bottom: 'bottom-panel',
  'bottom-left': 'bottom-left-panel',
  'bottom-right': 'bottom-right-panel'
} as const

export default function ExampleLayout() {
  const store = usePanelStore('example-layout')
  const setIsMobileLayout = store((state: any) => state.setIsMobileLayout)
  const setActiveId = store((state: any) => state.setActiveId)

  // Memoize panels to prevent recreation on each render
  const panels = useMemo(() => createPanels(), [])

  // Initialize active panels
  useEffect(() => {
    Object.entries(defaultActiveIds).forEach(([position, id]) => {
      setActiveId(position as PanelPosition, id)
    })
  }, [setActiveId])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      panels.forEach(panel => {
        if (panel.shortcut) {
          const { key, ctrl } = panel.shortcut
          if (
            e.key.toLowerCase() === key.toLowerCase() &&
            (!ctrl || (ctrl && (e.ctrlKey || e.metaKey)))
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

  // Handle mobile layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobileLayout(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setIsMobileLayout])

  return (
    <ResizableLayout
      storeId="example-layout"
      panels={panels}
      defaultActiveIds={defaultActiveIds}
      courseTitle="Example Course"
      courseSubtitle="Example Subtitle"
      onCourseClick={() => console.log('Course clicked')}
      topBarToggleable={false}
    />
  )
}