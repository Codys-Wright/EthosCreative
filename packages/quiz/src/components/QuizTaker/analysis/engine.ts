import type { AnalysisEngine, IdealAnswer, QuizAnalysisResult, ArtistType } from './types'
import type { QuizResponse } from '../store'

// Scoring Configuration
export const SCORING_CONFIG = {
  PRIMARY_IDEAL_POINTS: 10,    // Maximum points for exact match on primary questions
  SECONDARY_IDEAL_POINTS: 5,   // Maximum points for exact match on secondary questions
  POINT_FALLOFF: 1,           // Points deducted per step away from ideal value
  MIN_POINTS: -4              // Minimum points possible for any answer
}

export function calculateDistancePoints(value: number, idealAnswer: IdealAnswer): number {
  // If the value matches any of the ideal values exactly, return full points based on primary/secondary
  if (idealAnswer.values.includes(value)) {
    return idealAnswer.primary ? SCORING_CONFIG.PRIMARY_IDEAL_POINTS : SCORING_CONFIG.SECONDARY_IDEAL_POINTS
  }

  // For non-exact matches, always start from SECONDARY_IDEAL_POINTS regardless of primary/secondary
  const closestIdeal = idealAnswer.values.reduce((prev, curr) => 
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  )

  // Calculate distance and points, always starting from SECONDARY_IDEAL_POINTS
  const distance = Math.abs(closestIdeal - value)
  const points = SCORING_CONFIG.SECONDARY_IDEAL_POINTS - (distance * SCORING_CONFIG.POINT_FALLOFF)

  // Return the calculated points, but not less than MIN_POINTS
  return Math.max(SCORING_CONFIG.MIN_POINTS, points)
}

export class DefaultAnalysisEngine implements AnalysisEngine {
  name = 'Default Artist Type Analysis'
  description = 'Analyzes quiz responses to determine artist type based on response patterns'
  questionAnalysis = [] // This will be populated by the specific implementation

  calculatePoints(value: number, idealAnswer: IdealAnswer): number {
    return calculateDistancePoints(value, idealAnswer)
  }

  analyze(responses: QuizResponse[]): QuizAnalysisResult {
    // Initialize points for each artist type
    const points: Record<ArtistType, number> = {
      'The Visionary Artist': 0,
      'The Consummate Artist': 0,
      'The Analyzer Artist': 0,
      'The Tech Artist': 0,
      'The Entertainer Artist': 0,
      'The Maverick Artist': 0,
      'The Dreamer Artist': 0,
      'The Feeler Artist': 0,
      'The Tortured Artist': 0,
      'The Solo Artist': 0
    }

    // Calculate points for each response
    responses.forEach(response => {
      if (response.response === null) return

      const analysis = this.questionAnalysis.find(qa => qa.questionId === response.questionId)
      if (!analysis) return

      // Calculate points for each artist type for this question
      Object.entries(analysis.idealAnswers).forEach(([type, idealAnswer]) => {
        const calculatedPoints = this.calculatePoints(response.response!, idealAnswer)
        points[type as ArtistType] += calculatedPoints
      })
    })

    // Calculate total points and percentages
    const totalPoints = Object.values(points).reduce((sum, p) => sum + Math.max(0, p), 0)
    const results = Object.entries(points).map(([type, points]) => ({
      artistType: type as ArtistType,
      points,
      percentage: totalPoints > 0 ? (Math.max(0, points) / totalPoints) * 100 : 0
    }))

    // Sort results by points in descending order
    results.sort((a, b) => b.points - a.points)

    return {
      results,
      dominantType: results[0].artistType,
      secondaryType: results[1].artistType
    }
  }

  // Helper method to get current points for admin card
  getCurrentPoints(responses: QuizResponse[]): Record<ArtistType, number> {
    const points: Record<ArtistType, number> = {
      'The Visionary Artist': 0,
      'The Consummate Artist': 0,
      'The Analyzer Artist': 0,
      'The Tech Artist': 0,
      'The Entertainer Artist': 0,
      'The Maverick Artist': 0,
      'The Dreamer Artist': 0,
      'The Feeler Artist': 0,
      'The Tortured Artist': 0,
      'The Solo Artist': 0
    }

    responses.forEach(response => {
      if (response.response === null) return

      const analysis = this.questionAnalysis.find(qa => qa.questionId === response.questionId)
      if (!analysis) return

      Object.entries(analysis.idealAnswers).forEach(([type, idealAnswer]) => {
        const calculatedPoints = this.calculatePoints(response.response!, idealAnswer)
        points[type as ArtistType] += calculatedPoints
      })
    })

    return points
  }
} 