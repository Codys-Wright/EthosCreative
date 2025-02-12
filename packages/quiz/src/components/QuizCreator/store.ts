import { create } from 'zustand'

export type QuestionType = 'rating' | 'multiple-choice' | 'true-false' | 'short-answer'

export interface BaseQuestion {
  id: string
  type: QuestionType
  title: string
  points: number
  timeLimit: number
  content: string
}

export interface RatingQuestion extends BaseQuestion {
  type: 'rating'
  minLabel: string
  maxLabel: string
  min: number
  max: number
  selectedRating?: number
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice'
  options: string[]
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false'
  options: ['True', 'False']
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short-answer'
}

export type Question = RatingQuestion | MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion

export interface Quiz {
  title: string
  version: string
  questions: Question[]
}

interface QuizStore {
  quiz: Quiz
  currentQuestionId: string | null
  setCurrentQuestionId: (id: string) => void
  setQuizData: (quiz: Quiz) => void
  addQuestion: (question: Omit<Question, 'id'>) => void
  updateQuestion: (id: string, updates: Partial<Question>) => void
  removeQuestion: (id: string) => void
  exportQuiz: () => Quiz
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  quiz: {
    title: 'New Quiz',
    version: '1.0.0',
    questions: [
      {
        id: '1',
        type: 'rating',
        title: 'Sample Question 1',
        points: 1,
        timeLimit: 30,
        content: 'Rate your agreement with this statement:',
        minLabel: 'Strongly Disagree',
        maxLabel: 'Strongly Agree',
        min: 1,
        max: 10
      }
    ]
  },
  currentQuestionId: '1',
  setQuizData: (quiz) => set({ quiz, currentQuestionId: quiz.questions[0]?.id ?? null }),
  setCurrentQuestionId: (id) => set({ currentQuestionId: id }),
  addQuestion: (question) => set((state) => ({
    quiz: {
      ...state.quiz,
      questions: [...state.quiz.questions, { ...question, id: Math.random().toString(36).slice(2) }]
    }
  })),
  updateQuestion: (id, updates) => set((state) => ({
    quiz: {
      ...state.quiz,
      questions: state.quiz.questions.map((q) => 
        q.id === id ? { ...q, ...updates } : q
      )
    }
  })),
  removeQuestion: (id) => set((state) => ({
    quiz: {
      ...state.quiz,
      questions: state.quiz.questions.filter((q) => q.id !== id)
    },
    currentQuestionId: state.currentQuestionId === id ? 
      (state.quiz.questions[0]?.id ?? null) : 
      state.currentQuestionId
  })),
  exportQuiz: () => get().quiz
})) 