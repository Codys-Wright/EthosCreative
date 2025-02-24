'use client'

import { useQuizStore } from './store'
import type { QuestionType } from './store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export function QuestionInspector() {
  const { quiz, currentQuestionId, updateQuestion } = useQuizStore()
  const currentQuestion = quiz.questions.find(q => q.id === currentQuestionId)

  if (!currentQuestion) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No question selected
      </div>
    )
  }

  const handleChange = (field: keyof typeof currentQuestion) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    updateQuestion(currentQuestion.id, { [field]: value })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{quiz.questions.indexOf(currentQuestion) + 1}.</span>
          <h2 className="text-lg font-bold">Question Settings</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question Type</label>
              <Select 
                value={currentQuestion.type}
                onValueChange={(value) => updateQuestion(currentQuestion.id, { type: value as QuestionType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating Scale</SelectItem>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={currentQuestion.title}
                onChange={handleChange('title')}
                placeholder="Question title..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Question Content</label>
              <Textarea
                value={currentQuestion.content}
                onChange={handleChange('content')}
                placeholder="Enter your question here..."
                className="min-h-[100px] resize-none"
              />
            </div>

            {currentQuestion.type === 'rating' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Rating Scale Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Min Value</label>
                      <Input
                        type="number"
                        value={currentQuestion.min}
                        onChange={handleChange('min')}
                        min={0}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Value</label>
                      <Input
                        type="number"
                        value={currentQuestion.max}
                        onChange={handleChange('max')}
                        min={1}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Label</label>
                    <Input
                      value={currentQuestion.minLabel}
                      onChange={handleChange('minLabel')}
                      placeholder="e.g., Strongly Disagree"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Maximum Label</label>
                    <Input
                      value={currentQuestion.maxLabel}
                      onChange={handleChange('maxLabel')}
                      placeholder="e.g., Strongly Agree"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
