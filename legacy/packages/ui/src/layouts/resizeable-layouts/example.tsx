'use client'

import { FolderTree, FileText, BookOpen, Inspect, MessageCircle } from 'lucide-react'
import ResizableLayout from './ResizableLayout'
import type { Panel } from './types'

// Define the panels configuration with proper typing
const panels: Panel[] = [
  {
    id: 'tree-editor',
    label: 'Tree Editor',
    icon: FolderTree,
    position: 'left',
    defaultActive: true,
    shortcut: { key: 't', ctrl: true },
    render: ({ activeIds }) => (
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">
          Tree Editor ({activeIds.middle === 'curriculum-editor' ? 'curriculum' : 'editor'} mode)
        </h2>
        <div className="space-y-2">
          <div className="p-2 bg-muted rounded">Sample Section 1</div>
          <div className="p-2 bg-muted rounded">Sample Section 2</div>
        </div>
      </div>
    )
  },
  {
    id: 'concept-editor',
    label: 'Concept Editor',
    icon: FileText,
    position: 'middle',
    defaultActive: true,
    shortcut: { key: 'e', ctrl: true },
    render: () => (
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Concept Editor</h2>
        <div className="p-4 bg-muted rounded">Concept editing interface</div>
      </div>
    )
  },
  {
    id: 'curriculum-editor',
    label: 'Curriculum Editor',
    icon: BookOpen,
    position: 'middle',
    shortcut: { key: 'c', ctrl: true },
    render: () => (
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Curriculum Editor</h2>
        <div className="p-4 bg-muted rounded">Curriculum editing interface</div>
      </div>
    )
  },
  {
    id: 'inspector',
    label: 'Inspector',
    icon: Inspect,
    position: 'right',
    defaultActive: true,
    shortcut: { key: 'i', ctrl: true },
    render: () => (
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Inspector</h2>
        <div className="p-4 bg-muted rounded">Properties and settings</div>
      </div>
    )
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageCircle,
    position: 'right',
    shortcut: { key: 'm', ctrl: true },
    render: () => (
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Chat</h2>
        <div className="p-4 bg-muted rounded">Chat interface</div>
      </div>
    )
  }
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