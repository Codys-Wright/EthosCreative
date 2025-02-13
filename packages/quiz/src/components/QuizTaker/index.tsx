'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Progress, 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  cn,
  Input,
  Label
} from '@repo/ui'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { useQuizTakerStore } from './store'
import type { Quiz } from '../QuizCreator/store'
import type { CarouselApi } from '@repo/ui'
import type { AnalysisEngine, QuizAnalysisResult, ArtistType } from './analysis/types'
import { ArtistTypeAnalysisEngine } from './analysis/artistTypeEngine'
import { DefaultAnalysisEngine } from './analysis/engine'

interface QuizTakerProps {
  quiz: Quiz
  analysisEngine?: AnalysisEngine
  onComplete?: (responses: { questionId: string; response: number | null }[], analysis: QuizAnalysisResult) => void
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function QuizTaker({ quiz, analysisEngine, onComplete }: QuizTakerProps) {
  const {
    currentQuestionIndex,
    responses,
    isComplete,
    analytics,
    setQuiz,
    setResponse,
    nextQuestion,
    previousQuestion,
    completeQuiz,
    canAdvanceToIndex,
    fillWithDefaultResponses
  } = useQuizTakerStore()

  const [api, setApi] = React.useState<CarouselApi>()
  const [showResults, setShowResults] = React.useState(false)
  const [defaultResponse, setDefaultResponse] = React.useState(5)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [engine] = React.useState(() => 
    analysisEngine || new ArtistTypeAnalysisEngine(quiz.questions.map(q => q.id))
  )

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100
  const currentResponse = responses.find(r => r.questionId === currentQuestion?.id)?.response

  // Initialize quiz
  React.useEffect(() => {
    setQuiz(quiz)
  }, [quiz, setQuiz])

  // Live timer update
  React.useEffect(() => {
    const questionAnalytics = analytics.questionAnalytics.find(qa => qa.questionId === currentQuestion?.id)
    if (!questionAnalytics) return

    const updateTimer = () => {
      if (questionAnalytics.startTime) {
        const elapsed = questionAnalytics.timeSpent + (Date.now() - questionAnalytics.startTime)
        setCurrentTime(elapsed)
      } else {
        setCurrentTime(questionAnalytics.timeSpent)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [currentQuestion?.id, analytics.questionAnalytics])

  // Sync carousel with current question index
  React.useEffect(() => {
    if (api) {
      api.scrollTo(currentQuestionIndex, false)
    }
  }, [api, currentQuestionIndex])

  // Handle carousel changes
  React.useEffect(() => {
    if (!api) return

    const handleSelect = () => {
      const selectedIndex = api.selectedScrollSnap()
      if (selectedIndex !== currentQuestionIndex) {
        // Only allow moving to this index if we can advance to it
        if (selectedIndex > currentQuestionIndex && !canAdvanceToIndex(selectedIndex)) {
          // If we can't advance, scroll back to the current question
          api.scrollTo(currentQuestionIndex, false)
          return
        }
        
        if (selectedIndex > currentQuestionIndex) {
          nextQuestion()
        } else {
          previousQuestion()
        }
      }
    }

    api.on("select", handleSelect)
    return () => {
      api.off("select", handleSelect)
    }
  }, [api, currentQuestionIndex, nextQuestion, previousQuestion, canAdvanceToIndex])

  // Check if all questions are answered
  const allQuestionsAnswered = quiz.questions.every(q => 
    responses.find(r => r.questionId === q.id)?.response !== null
  )

  // Get current points for admin card
  const currentPoints = (engine as DefaultAnalysisEngine).getCurrentPoints(responses)
  const sortedPoints = Object.entries(currentPoints)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([type, points]) => ({
      type,
      points: points as number,
      percentage: Object.values(currentPoints).reduce((sum, p) => sum + Math.max(0, p as number), 0) > 0
        ? (Math.max(0, points as number) / Object.values(currentPoints).reduce((sum, p) => sum + Math.max(0, p as number), 0)) * 100
        : 0
    }))

  if (isComplete) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Thank you for completing the quiz. Your results are being processed.
            </p>
            <Button 
              className="mt-4"
              onClick={() => {
                setShowResults(true)
                onComplete?.(responses, engine.analyze(responses))
              }}
            >
              View Results
            </Button>
          </CardContent>
        </Card>

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
                    responses: responses
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
                            responses.find(r => r.questionId === question.id)?.response ? "text-primary" : "text-muted-foreground"
                          )}>
                            {responses.find(r => r.questionId === question.id)?.response || 'N/A'}
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
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-lg font-bold">{quiz.title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => previousQuestion()} 
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button 
              variant="default" 
              onClick={() => {
                completeQuiz()
                if (allQuestionsAnswered) {
                  const analysis = engine.analyze(responses)
                  onComplete?.(responses, analysis)
                }
              }}
              disabled={!allQuestionsAnswered}
            >
              Complete Quiz
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => nextQuestion()}
              disabled={!canAdvanceToIndex(currentQuestionIndex + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-hidden px-4">
            <Carousel 
              className="h-full" 
              setApi={setApi}
              opts={{
                align: "start",
                dragFree: false
              }}
            >
              <CarouselContent>
                {quiz.questions.map((question) => (
                  <CarouselItem key={question.id}>
                    <div className="h-full flex items-center justify-center">
                      <Card className="w-full max-w-3xl">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {question.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <p className="text-lg">{question.content}</p>
                            {question.type === 'rating' && (
                              <div className="space-y-4">
                                <div className="flex flex-wrap justify-between gap-2">
                                  {Array.from(
                                    { length: question.max - question.min + 1 },
                                    (_, i) => i + question.min
                                  ).map((rating) => (
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
                                          "cursor-pointer transition-colors hover:bg-accent/10 h-14 w-14",
                                          responses.find(r => r.questionId === question.id)?.response === rating && "bg-accent border-accent"
                                        )}
                                        onClick={() => setResponse(question.id, rating)}
                                      >
                                        <CardHeader className="p-0 h-full">
                                          <CardTitle className="flex items-center justify-center h-full font-normal text-lg">
                                            {rating}
                                          </CardTitle>
                                        </CardHeader>
                                      </Card>
                                    </motion.div>
                                  ))}
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground px-2">
                                  <span>{question.minLabel}</span>
                                  <span>{question.maxLabel}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>

        <div className="p-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            {/* Admin Analytics Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Admin Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* Quiz Time */}
                  <div className="space-y-1">
                    <Label>Total Quiz Time</Label>
                    <div className="flex items-center gap-2 text-lg">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(analytics.startTime ? Date.now() - analytics.startTime : 0)}</span>
                    </div>
                  </div>

                  {/* Current Question Time */}
                  <div className="space-y-1">
                    <Label>Current Question Time</Label>
                    <div className="text-lg">
                      {formatTime(currentTime)}
                    </div>
                  </div>

                  {/* Answer Changes */}
                  <div className="space-y-1">
                    <Label>Answer Changes</Label>
                    <div className="text-lg">
                      {analytics.questionAnalytics.find(qa => qa.questionId === currentQuestion?.id)?.answerChanges || 0}
                    </div>
                  </div>
                </div>

                {/* Default Response Fill */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Label>Fill with Default Response:</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={defaultResponse}
                      onChange={(e) => setDefaultResponse(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => fillWithDefaultResponses(defaultResponse)}
                  >
                    Fill All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Results Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {sortedPoints.map(({ type, points, percentage }) => (
                    <div key={type} className="space-y-1.5">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{type}</span>
                        <div className="flex items-center justify-between text-sm">
                          <Progress value={percentage} className="flex-1 h-2" />
                          <div className="flex items-center gap-2 ml-2 min-w-[100px] justify-end">
                            <span>{points.toFixed(1)}</span>
                            <span className="text-muted-foreground">({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 