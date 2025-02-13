import type { AnalysisEngine, IdealAnswer, QuizAnalysisResult, ArtistType } from './types'
import type { QuizResponse } from '../store'

export function calculateDistancePoints(value: number, idealAnswer: IdealAnswer): number {
  // If the value matches any of the ideal values, return full points
  if (idealAnswer.values.includes(value)) {
    return idealAnswer.primary ? 10 : 5
  }

  // Find the closest ideal value
  const closestIdeal = idealAnswer.values.reduce((prev, curr) => 
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  )

  // Calculate distance and points
  const distance = Math.abs(closestIdeal - value)
  
  // For primary answers (max 10 points)
  if (idealAnswer.primary) {
    if (distance === 1) return 4
    if (distance === 2) return 3
    if (distance === 3) return 2
    if (distance === 4) return 1
    if (distance === 5) return -1
    if (distance === 6) return -2
    if (distance === 7) return -3
    return -4
  }
  
  // For secondary answers (max 5 points)
  if (distance === 1) return 3
  if (distance === 2) return 2
  if (distance === 3) return 1
  if (distance === 4) return 0
  if (distance === 5) return -1
  if (distance === 6) return -2
  if (distance === 7) return -3
  return -4
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