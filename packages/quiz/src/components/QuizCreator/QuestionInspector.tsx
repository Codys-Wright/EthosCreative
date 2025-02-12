'use client'

import { useQuizStore } from './store'
import type { QuestionType } from './store'

export function QuestionInspector() {
  const { quiz, currentQuestionId, updateQuestion } = useQuizStore()
  const currentQuestion = quiz.questions.find(q => q.id === currentQuestionId)

  if (!currentQuestion) {
    return (
      <div className="p-4 text-muted-foreground">
        No question selected
      </div>
    )
  }

  const handleChange = (field: keyof typeof currentQuestion) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    updateQuestion(currentQuestion.id, { [field]: value })
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Question Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Question Type</label>
          <select 
            className="w-full p-2 rounded border bg-background"
            value={currentQuestion.type}
            onChange={handleChange('type') as any}
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="true-false">True/False</option>
            <option value="short-answer">Short Answer</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Title</label>
          <input 
            type="text"
            className="w-full p-2 rounded border bg-background"
            value={currentQuestion.title}
            onChange={handleChange('title')}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Points</label>
          <input 
            type="number" 
            className="w-full p-2 rounded border bg-background"
            value={currentQuestion.points}
            onChange={handleChange('points')}
            min={1}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Time Limit</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              className="w-full p-2 rounded border bg-background"
              value={currentQuestion.timeLimit}
              onChange={handleChange('timeLimit')}
              min={5}
            />
            <span className="text-sm text-muted-foreground self-center">seconds</span>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Question Content</label>
          <textarea 
            className="w-full p-2 rounded border bg-background min-h-[100px]"
            value={currentQuestion.content}
            onChange={handleChange('content') as any}
          />
        </div>
      </div>
    </div>
  )
} 