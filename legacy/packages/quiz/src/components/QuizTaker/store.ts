import { create } from 'zustand'
import type { Quiz, RatingQuestion } from '../QuizCreator/store'

interface QuestionAnalytics {
  questionId: string
  timeSpent: number
  answerChanges: number
  startTime: number | null
}

interface QuizAnalytics {
  startTime: number | null
  totalTime: number
  questionAnalytics: QuestionAnalytics[]
}

interface QuizResponse {
  questionId: string
  response: number | null
}

interface QuizTakerState {
  quiz: Quiz | null
  currentQuestionIndex: number
  responses: QuizResponse[]
  isComplete: boolean
  analytics: QuizAnalytics

  // Actions
  setQuiz: (quiz: Quiz) => void
  setResponse: (questionId: string, response: number) => void
  nextQuestion: () => void
  previousQuestion: () => void
  completeQuiz: () => void
  resetQuiz: () => void
  canAdvanceToIndex: (targetIndex: number) => boolean
  fillWithDefaultResponses: (defaultValue: number) => void
  fillWithRandomResponses: () => void
}

export const useQuizTakerStore = create<QuizTakerState>((set, get) => ({
  quiz: null,
  currentQuestionIndex: 0,
  responses: [],
  isComplete: false,
  analytics: {
    startTime: null,
    totalTime: 0,
    questionAnalytics: []
  },

  setQuiz: (quiz) => {
    const questionAnalytics = quiz.questions.map(q => ({
      questionId: q.id,
      timeSpent: 0,
      answerChanges: 0,
      startTime: null
    }))

    set({ 
      quiz,
      currentQuestionIndex: 0,
      responses: quiz.questions.map(q => ({ questionId: q.id, response: null })),
      isComplete: false,
      analytics: {
        startTime: Date.now(),
        totalTime: 0,
        questionAnalytics
      }
    })
  },

  canAdvanceToIndex: (targetIndex) => {
    const { quiz, responses, currentQuestionIndex } = get()
    if (!quiz) return false

    // Can always go backwards
    if (targetIndex <= currentQuestionIndex) return true

    // Check if all questions up to the target index have been answered
    for (let i = 0; i <= targetIndex - 1; i++) {
      const questionId = quiz.questions[i]?.id
      if (!questionId) return false
      const response = responses.find(r => r.questionId === questionId)
      if (response?.response === null) return false
    }
    return true
  },

  setResponse: (questionId, response) => {
    const { quiz, currentQuestionIndex, analytics } = get()
    if (!quiz) return

    // Check if this is the first answer before updating state
    const isFirstAnswer = get().responses.find(r => r.questionId === questionId)?.response === null

    // Update response
    set(state => {
      const currentResponse = state.responses.find(r => r.questionId === questionId)
      const isChangingAnswer = currentResponse?.response !== null && currentResponse.response !== response

      // Update analytics for answer changes
      const updatedQuestionAnalytics = state.analytics.questionAnalytics.map(qa => {
        if (qa.questionId === questionId) {
          return {
            ...qa,
            answerChanges: isChangingAnswer ? qa.answerChanges + 1 : qa.answerChanges
          }
        }
        return qa
      })

      return {
        responses: state.responses.map(r => 
          r.questionId === questionId ? { ...r, response } : r
        ),
        analytics: {
          ...state.analytics,
          questionAnalytics: updatedQuestionAnalytics
        }
      }
    })

    // Auto-advance only if this is the first time answering and not on the last question
    if (isFirstAnswer && currentQuestionIndex < quiz.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      if (get().canAdvanceToIndex(nextIndex)) {
        setTimeout(() => {
          get().nextQuestion()
        }, 500) // Small delay for better UX
      }
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex, quiz, analytics } = get()
    if (!quiz) return
    
    const nextIndex = currentQuestionIndex + 1
    if (nextIndex < quiz.questions.length && get().canAdvanceToIndex(nextIndex)) {
      // Update time spent on current question
      const currentQuestionId = quiz.questions[currentQuestionIndex].id
      const now = Date.now()
      
      set(state => ({
        currentQuestionIndex: nextIndex,
        analytics: {
          ...state.analytics,
          questionAnalytics: state.analytics.questionAnalytics.map(qa => {
            if (qa.questionId === currentQuestionId && qa.startTime) {
              return {
                ...qa,
                timeSpent: qa.timeSpent + (now - qa.startTime),
                startTime: null
              }
            } else if (qa.questionId === quiz.questions[nextIndex].id) {
              return {
                ...qa,
                startTime: now
              }
            }
            return qa
          })
        }
      }))
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex, quiz } = get()
    if (!quiz || currentQuestionIndex <= 0) return

    // Update time spent on current question
    const currentQuestionId = quiz.questions[currentQuestionIndex].id
    const previousIndex = currentQuestionIndex - 1
    const now = Date.now()

    set(state => ({
      currentQuestionIndex: previousIndex,
      analytics: {
        ...state.analytics,
        questionAnalytics: state.analytics.questionAnalytics.map(qa => {
          if (qa.questionId === currentQuestionId && qa.startTime) {
            return {
              ...qa,
              timeSpent: qa.timeSpent + (now - qa.startTime),
              startTime: null
            }
          } else if (qa.questionId === quiz.questions[previousIndex].id) {
            return {
              ...qa,
              startTime: now
            }
          }
          return qa
        })
      }
    }))
  },

  completeQuiz: () => {
    const { quiz, analytics } = get()
    if (!quiz) return

    // Update final analytics
    const now = Date.now()
    set(state => ({
      isComplete: true,
      analytics: {
        ...state.analytics,
        totalTime: analytics.startTime ? now - analytics.startTime : 0,
        questionAnalytics: state.analytics.questionAnalytics.map(qa => {
          if (qa.startTime) {
            return {
              ...qa,
              timeSpent: qa.timeSpent + (now - qa.startTime),
              startTime: null
            }
          }
          return qa
        })
      }
    }))
  },

  resetQuiz: () => {
    const { quiz } = get()
    if (quiz) {
      const questionAnalytics = quiz.questions.map(q => ({
        questionId: q.id,
        timeSpent: 0,
        answerChanges: 0,
        startTime: null
      }))

      set({
        currentQuestionIndex: 0,
        responses: quiz.questions.map(q => ({ questionId: q.id, response: null })),
        isComplete: false,
        analytics: {
          startTime: Date.now(),
          totalTime: 0,
          questionAnalytics
        }
      })
    }
  },

  fillWithDefaultResponses: (defaultValue) => {
    const { quiz } = get()
    if (!quiz) return

    const responses = quiz.questions.map(q => ({
      questionId: q.id,
      response: defaultValue
    }))

    set({ responses })
  },

  fillWithRandomResponses: () => {
    const { quiz } = get()
    if (!quiz) return

    const responses = quiz.questions.map(q => ({
      questionId: q.id,
      response: Math.floor(Math.random() * 11) // Random number between 0-10
    }))

    set({ responses })
  }
})) 