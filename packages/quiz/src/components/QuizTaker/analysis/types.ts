export type ArtistType = 
  | 'The Visionary Artist'
  | 'The Consummate Artist'
  | 'The Analyzer Artist'
  | 'The Tech Artist'
  | 'The Entertainer Artist'
  | 'The Maverick Artist'
  | 'The Dreamer Artist'
  | 'The Feeler Artist'
  | 'The Tortured Artist'
  | 'The Solo Artist'

export interface IdealAnswer {
  values: number[]
  primary: boolean // true = max 10 points, false = max 5 points
}

export interface QuestionAnalysis {
  questionId: string
  idealAnswers: Partial<Record<ArtistType, IdealAnswer>>
}

export interface AnalysisEngine {
  name: string
  description: string
  questionAnalysis: QuestionAnalysis[]
  calculatePoints: (value: number, idealAnswer: IdealAnswer) => number
}

export interface AnalysisResult {
  artistType: ArtistType
  points: number
  percentage: number
}

export interface QuizAnalysisResult {
  results: AnalysisResult[]
  dominantType: ArtistType
  secondaryType: ArtistType
} 