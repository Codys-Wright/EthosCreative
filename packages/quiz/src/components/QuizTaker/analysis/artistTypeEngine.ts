import type { AnalysisEngine, QuestionAnalysis, IdealAnswer, ArtistType, QuizAnalysisResult } from './types'
import { artistTypeIdealAnswers, getIdealAnswer } from './artistTypeData'

  export const SCORING_CONFIG = {
  PRIMARY_IDEAL_POINTS: 10,
  SECONDARY_IDEAL_POINTS: 3,
  POINT_FALLOFF: 0.3,
  MIN_POINTS: 0 as number | null
}

export class ArtistTypeAnalysisEngine implements AnalysisEngine {
  name = 'Artist Type Analysis'
  description = 'Analyzes quiz responses to determine artist type based on ideal answer ranges'
  questionAnalysis: QuestionAnalysis[]

  constructor(questionIds: string[]) {
    this.questionAnalysis = this.generateQuestionAnalysis(questionIds)
  }

  updateScoringConfig(config: Partial<typeof SCORING_CONFIG>) {
    Object.assign(SCORING_CONFIG, config)
  }

  getScoringConfig() {
    return { ...SCORING_CONFIG }
  }

  calculatePoints(value: number, idealAnswer: IdealAnswer): number {
    // Check if value is within ideal range (exact match)
    if (idealAnswer.values.includes(value)) {
      return idealAnswer.primary ? SCORING_CONFIG.PRIMARY_IDEAL_POINTS : SCORING_CONFIG.SECONDARY_IDEAL_POINTS
    }

    // Find closest ideal value for this artist type's ideal answers
    const closestIdeal = idealAnswer.values.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    )
    const distance = Math.abs(value - closestIdeal)

    // Calculate points based on distance from this artist type's ideal value
    const points = SCORING_CONFIG.SECONDARY_IDEAL_POINTS - (SCORING_CONFIG.POINT_FALLOFF * distance)
    
    // Only apply minimum points if MIN_POINTS is not null
    return SCORING_CONFIG.MIN_POINTS !== null ? Math.max(points, SCORING_CONFIG.MIN_POINTS) : points
  }

  getCurrentPoints(responses: { questionId: string; response: number | null }[]): Record<ArtistType, number> {
    console.log('Getting current points for responses:', responses)
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
      console.log(`Processing response for question ${response.questionId}, value: ${response.response}`)

      const analysis = this.questionAnalysis.find(qa => qa.questionId === response.questionId)
      if (!analysis) {
        console.log(`No analysis found for question ${response.questionId}`)
        return
      }
      console.log(`Found analysis for question ${response.questionId}:`, analysis)

      Object.entries(analysis.idealAnswers).forEach(([type, idealAnswer]) => {
        const artistType = type as ArtistType
        const calculatedPoints = this.calculatePoints(response.response!, idealAnswer)
        points[artistType] = (points[artistType] || 0) + calculatedPoints
        console.log(`Added ${calculatedPoints} points to ${artistType} (total: ${points[artistType]})`)
      })
    })

    console.log('Final points:', points)
    return points
  }

  analyze(responses: { questionId: string; response: number | null }[]): QuizAnalysisResult {
    const points = this.getCurrentPoints(responses)
    
    // Calculate total points and percentages
    const results = Object.entries(points).map(([type, points]) => ({
      artistType: type as ArtistType,
      points,
      percentage: 0 // Will be calculated below
    }))

    // Calculate percentages
    const totalPoints = results.reduce((sum, result) => sum + result.points, 0)
    results.forEach(result => {
      result.percentage = totalPoints > 0 ? (result.points / totalPoints) * 100 : 0
    })

    // Sort by points to find dominant and secondary types
    results.sort((a, b) => b.points - a.points)

    return {
      results,
      dominantType: results[0].artistType,
      secondaryType: results[1].artistType
    }
  }

  private generateQuestionAnalysis(questionIds: string[]): QuestionAnalysis[] {
    console.log('Generating question analysis for IDs:', questionIds)
    const analysis = questionIds.map(questionId => {
      // Strip the 'q' prefix from the question ID
      const normalizedId = questionId.replace('q', '')
      console.log(`Normalized question ID ${questionId} to ${normalizedId}`)
      
      const analysis: QuestionAnalysis = {
        questionId,
        idealAnswers: {}
      }

      // Add ideal answers for each artist type using the artistTypeData
      Object.keys(artistTypeIdealAnswers).forEach((artistType) => {
        const idealAnswer = getIdealAnswer(artistType as ArtistType, normalizedId)
        if (idealAnswer) {
          analysis.idealAnswers[artistType as ArtistType] = idealAnswer
          console.log(`Set ideal answer for ${artistType} question ${questionId}:`, idealAnswer)
        } else {
          console.log(`No ideal answer found for ${artistType} question ${questionId}`)
        }
      })

      return analysis
    })
    console.log('Generated question analysis:', analysis)
    return analysis
  }
} 