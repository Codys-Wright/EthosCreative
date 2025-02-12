'use client'

import { FolderTree, FileText, BookOpen, Inspect, MessageCircle, ArrowUp, ArrowDown, CornerLeftDown, CornerRightDown } from 'lucide-react'
import ResizableLayout from './ResizableLayout'
import { Panel, PANEL_POSITIONS } from './types'

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

// Define panels configuration
const panels: Panel[] = [
  {
    id: 'top-panel',
    position: PANEL_POSITIONS.TOP,
    label: 'Top Panel',
    icon: ArrowUp,
    shortcut: { key: 'y', ctrl: true },
    collapsible: true,
    render: () => <TopPanel />
  },
  {
    id: 'tree-editor',
    position: PANEL_POSITIONS.LEFT,
    label: 'Tree Editor',
    icon: FolderTree,
    shortcut: { key: 't', ctrl: true },
    render: ({ activeIds }) => (
      <TreeEditor mode={activeIds.middle === 'curriculum-editor' ? 'curriculum' : 'editor'} />
    )
  },
  {
    id: 'concept-editor',
    position: PANEL_POSITIONS.MIDDLE,
    label: 'Concept Editor',
    icon: FileText,
    shortcut: { key: 'e', ctrl: true },
    render: () => <ConceptEditor />
  },
  {
    id: 'curriculum-editor',
    position: PANEL_POSITIONS.MIDDLE,
    label: 'Curriculum Editor',
    icon: BookOpen,
    shortcut: { key: 'c', ctrl: true },
    render: () => <CurriculumEditor />
  },
  {
    id: 'inspector',
    position: PANEL_POSITIONS.RIGHT,
    label: 'Inspector',
    icon: Inspect,
    shortcut: { key: 'i', ctrl: true },
    render: () => <Inspector />
  },
  {
    id: 'chat',
    position: PANEL_POSITIONS.RIGHT,
    label: 'Chat',
    icon: MessageCircle,
    shortcut: { key: 'm', ctrl: true },
    render: () => <Chat />
  },
  {
    id: 'bottom-panel',
    position: PANEL_POSITIONS.BOTTOM,
    label: 'Bottom Panel',
    icon: ArrowDown,
    shortcut: { key: 'b', ctrl: true },
    render: () => <BottomPanel />
  },
  {
    id: 'bottom-left-panel',
    position: PANEL_POSITIONS.BOTTOM_LEFT,
    label: 'Bottom Left Panel',
    icon: CornerLeftDown,
    shortcut: { key: 'l', ctrl: true },
    render: () => <BottomLeftPanel />
  },
  {
    id: 'bottom-right-panel',
    position: PANEL_POSITIONS.BOTTOM_RIGHT,
    label: 'Bottom Right Panel',
    icon: CornerRightDown,
    render: () => <BottomRightPanel />
  },
  
]

export default function ExampleLayout() {
  return (
    <ResizableLayout
      storeId="example-layout"
      panels={panels}
      courseTitle="Example Course"
      courseSubtitle="Example Subtitle"
      onCourseClick={() => console.log('Course clicked')}
    />
  )
}