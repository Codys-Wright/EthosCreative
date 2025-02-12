'use client'

import * as React from 'react'
import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Switch,
} from '@repo/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { useQuizStore } from './store'
import type { Quiz, RatingQuestion } from './store'
import { cn } from '@repo/ui'
import { useEffect } from 'react'
import type { CarouselApi } from '@repo/ui'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function QuizPreview() {
  const { quiz, currentQuestionId, setCurrentQuestionId, updateQuestion } = useQuizStore()
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [showResults, setShowResults] = React.useState(false)
  const [autoAdvance, setAutoAdvance] = React.useState(true)

  // Find the index of the current question
  const currentIndex = quiz.questions.findIndex(q => q.id === currentQuestionId)

  useEffect(() => {
    if (api && currentIndex !== -1) {
      api.scrollTo(currentIndex)
    }
  }, [api, currentIndex])

  useEffect(() => {
    if (!api) return

    api.on("select", () => {
      const currentIndex = api.selectedScrollSnap()
      setCurrent(currentIndex)
      // Update the currentQuestionId when carousel changes
      setCurrentQuestionId(quiz.questions[currentIndex].id)
    })
  }, [api, setCurrentQuestionId, quiz.questions])

  const handleRatingSelect = (questionId: string, rating: number) => {
    const question = quiz.questions.find(q => q.id === questionId)
    if (question?.type === 'rating') {
      updateQuestion(questionId, { selectedRating: rating })
      if (autoAdvance && !isLastQuestion && api) {
        setTimeout(() => {
          api.scrollNext()
        }, 300) // Small delay for better UX
      }
    }
  }

  const renderQuestionContent = (question: typeof quiz.questions[number]) => {
    switch (question.type) {
      case 'rating': {
        const ratings = Array.from({ length: question.max - question.min + 1 }, (_, i) => i + question.min)
        const totalRatings = ratings.length
        
        // Calculate optimal size based on number of ratings
        const getCardSize = () => {
          if (totalRatings <= 5) return 'h-20 w-20'
          if (totalRatings <= 7) return 'h-16 w-16'
          if (totalRatings <= 10) return 'h-14 w-14'
          return 'h-12 w-12'
        }
        const cardSize = getCardSize()
        const fontSize = totalRatings <= 7 ? 'text-xl' : 'text-lg'
        
        return (
          <div className="space-y-6">
            <p className="text-lg">{question.content}</p>
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between gap-2 max-w-4xl mx-auto">
                {ratings.map((rating) => (
                  <motion.div
                    key={rating}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, delay: rating * 0.03 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-accent/10 rounded-md border border-border/40 shadow-none h-14 w-14",
                        (question as RatingQuestion).selectedRating === rating && "bg-accent border-accent"
                      )}
                      onClick={() => handleRatingSelect(question.id, rating)}
                    >
                      <CardHeader className="p-0 h-full">
                        <CardTitle className={cn("flex items-center justify-center h-full font-normal text-foreground/80 text-lg")}>
                          {rating}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground px-2 max-w-4xl mx-auto">
                <span>{question.minLabel}</span>
                <span>{question.maxLabel}</span>
              </div>
            </div>
          </div>
        )
      }
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <p className="text-lg">{question.content}</p>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 rounded-lg border"
                >
                  <div className="h-4 w-4 rounded-full border" />
                  <span>{option}</span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'true-false':
        return (
          <div className="space-y-4">
            <p className="text-lg">{question.content}</p>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 rounded-lg border"
                >
                  <div className="h-4 w-4 rounded-full border" />
                  <span>{option}</span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'short-answer':
        return (
          <div className="space-y-4">
            <p className="text-lg">{question.content}</p>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-lg border resize-none"
              placeholder="Type your answer here..."
              disabled
            />
          </div>
        )
    }
  }

  const isLastQuestion = current === quiz.questions.length - 1

  const handleComplete = () => {
    setShowResults(true)
  }

  return (
    <>
      <div className="h-full flex flex-col">
        <Carousel
          className="h-full flex flex-col"
          setApi={setApi}
        >
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold">Quiz Preview</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Auto-advance</span>
                <Switch
                  checked={autoAdvance}
                  onCheckedChange={setAutoAdvance}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Question {current + 1} of {quiz.questions.length}
                </span>
                <Button variant="outline" size="icon" onClick={() => api?.scrollPrev()}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {isLastQuestion ? (
                  <Button variant="default" onClick={handleComplete}>
                    Complete Quiz
                  </Button>
                ) : (
                  <Button variant="outline" size="icon" onClick={() => api?.scrollNext()}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 p-4 min-h-0">
            <div className="mb-4">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${((current + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>
            </div>
            <CarouselContent className="-ml-0">
              {quiz.questions.map((question) => (
                <CarouselItem key={question.id} className="pl-0">
                  <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {question.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderQuestionContent(question)}
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </Carousel>
      </div>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-[90vw] h-[80vh] w-[600px]">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
            <DialogTitle className="text-xl">Quiz Results</DialogTitle>
            <Button 
              variant="outline" 
              onClick={() => {
                const results = {
                  ...quiz,
                  completedAt: new Date().toISOString(),
                  responses: quiz.questions.map(q => ({
                    questionId: q.id,
                    response: q.type === 'rating' ? q.selectedRating : null
                  }))
                }
                const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${quiz.title.toLowerCase().replace(/\s+/g, '-')}-results.json`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
            >
              Export Results
            </Button>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            <div className="space-y-4 py-4">
              <div className="grid gap-4">
                {quiz.questions.map((question, index) => (
                  <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Q{index + 1}: {question.content}</p>
                      {question.type === 'rating' && (
                        <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                          <span>{question.minLabel}</span>
                          <span>→</span>
                          <span>{question.maxLabel}</span>
                        </div>
                      )}
                    </div>
                    {question.type === 'rating' && (
                      <div className="ml-4 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rating:</span>
                        <span className={cn(
                          "font-medium",
                          question.selectedRating ? "text-primary" : "text-muted-foreground"
                        )}>
                          {question.selectedRating || 'N/A'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 