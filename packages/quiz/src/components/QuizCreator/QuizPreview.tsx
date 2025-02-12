'use client'

import * as React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@repo/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { useQuizStore } from './store'
import type { Quiz, RatingQuestion } from './store'
import { cn } from '@repo/ui'
import { useEffect } from 'react'
import type { CarouselApi } from '@repo/ui'

export function QuizPreview() {
  const { quiz, currentQuestionId, setCurrentQuestionId, updateQuestion } = useQuizStore()
  const [api, setApi] = React.useState<CarouselApi>()

  // Find the index of the current question
  const currentIndex = quiz.questions.findIndex(q => q.id === currentQuestionId)

  useEffect(() => {
    if (api && currentIndex !== -1) {
      api.scrollTo(currentIndex)
    }
  }, [api, currentIndex])

  const handleRatingSelect = (questionId: string, rating: number) => {
    const question = quiz.questions.find(q => q.id === questionId)
    if (question?.type === 'rating') {
      updateQuestion(questionId, { selectedRating: rating })
    }
  }

  const renderQuestionContent = (question: typeof quiz.questions[number]) => {
    switch (question.type) {
      case 'rating': {
        const ratings = Array.from({ length: question.max - question.min + 1 }, (_, i) => i + question.min)
        return (
          <div className="space-y-6">
            <p className="text-lg">{question.content}</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {ratings.map((rating) => (
                <Card
                  key={rating}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-accent",
                    (question as RatingQuestion).selectedRating === rating && "bg-accent"
                  )}
                  onClick={() => handleRatingSelect(question.id, rating)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-center text-2xl">{rating}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-center text-sm text-muted-foreground">
                      {rating === question.min ? question.minLabel :
                       rating === question.max ? question.maxLabel : ''}
                    </p>
                  </CardContent>
                </Card>
              ))}
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

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-bold">Quiz Preview</h2>
      </div>
      <div className="flex-1 p-4 min-h-0 overflow-visible">
        <Carousel
          className="w-full h-full relative"
          setApi={setApi}
          onSelect={(index) => setCurrentQuestionId(quiz.questions[index].id)}
        >
          <CarouselContent className="-ml-0 overflow-visible">
            {quiz.questions.map((question) => (
              <CarouselItem key={question.id} className="pl-0 overflow-visible">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{question.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {question.points} {question.points === 1 ? 'point' : 'points'} • {question.timeLimit}s
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderQuestionContent(question)}
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <CarouselPrevious className="static" />
            <CarouselNext className="static" />
          </div>
        </Carousel>
      </div>
    </div>
  )
} 