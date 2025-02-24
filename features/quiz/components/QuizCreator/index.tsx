'use client'

import * as React from 'react'
import { ListChecks, Eye, Settings } from 'lucide-react'
import { ResizableLayout, type ResizablePanel } from '@/components/layouts/resizeable-layouts'
import { QuestionList } from './QuestionList'
import { QuizPreview } from './QuizPreview'
import { QuestionInspector } from './QuestionInspector'
import { useQuizStore } from './store'
import { useEffect } from 'react'
import type { Quiz } from './store'
import { defaultQuiz } from './defaultQuiz'

const panels: ResizablePanel[] = [
  {
    id: 'question-list',
    label: 'Questions',
    icon: ListChecks,
    position: 'left',
    defaultActive: true,
    shortcut: { key: 'q', ctrl: true },
    render: () => <QuestionList />
  },
  {
    id: 'quiz-preview',
    label: 'Preview',
    icon: Eye,
    position: 'middle',
    defaultActive: true,
    shortcut: { key: 'p', ctrl: true },
    render: () => <QuizPreview />
  },
  {
    id: 'question-inspector',
    label: 'Inspector',
    icon: Settings,
    position: 'right',
    defaultActive: true,
    shortcut: { key: 'i', ctrl: true },
    render: () => <QuestionInspector />
  }
]

const defaultActiveIds = {
  left: 'question-list',
  middle: 'quiz-preview',
  right: 'question-inspector'
}

interface QuizCreatorProps {
  initialQuiz?: Quiz
}

export function QuizCreator({ initialQuiz = defaultQuiz }: QuizCreatorProps) {
  const { quiz, setQuizData } = useQuizStore()

  useEffect(() => {
    if (initialQuiz) {
      setQuizData(initialQuiz)
    }
  }, [initialQuiz, setQuizData])

  return (
    <ResizableLayout
      storeId="quiz-creator"
      panels={panels}
      defaultActiveIds={defaultActiveIds}
      courseTitle={quiz.title}
      courseSubtitle={`Version ${quiz.version}`}
      onCourseClick={() => console.log('Edit quiz title')}
    />
  )
} 
