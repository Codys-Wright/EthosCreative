import type { AnalysisEngine, QuestionAnalysis, IdealAnswer, ArtistType, QuizAnalysisResult } from './types'
import { artistTypeIdealAnswers, getIdealAnswer } from './artistTypeData'

const specialCases = {
  lowValueQuestions: ['42', '43'],
  feelerLowQuestions: ['3', '12'],
  entertainerLowQuestions: ['6', '21'],
  maverickLowQuestions: ['4', '8', '20']
}

export class ArtistTypeAnalysisEngine implements AnalysisEngine {
  name = 'Artist Type Analysis'
  description = 'Analyzes quiz responses to determine artist type based on ideal answer ranges'
  questionAnalysis: QuestionAnalysis[]

  constructor(questionIds: string[]) {
    this.questionAnalysis = this.generateQuestionAnalysis(questionIds)
  }

  calculatePoints(value: number, idealAnswer: IdealAnswer): number {
    // Check if value is within ideal range
    if (idealAnswer.values.includes(value)) {
      const points = idealAnswer.primary ? 10 : 5
      console.log(`Exact match! Value: ${value}, Ideal values: ${idealAnswer.values}, Primary: ${idealAnswer.primary}, Points awarded: ${points}`)
      return points
    }

    // Find closest ideal value
    const closestIdeal = idealAnswer.values.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    )
    const distance = Math.abs(value - closestIdeal)

    // For primary answers (max 10 points)
    if (idealAnswer.primary) {
      let points = -4 // Base negative points for large distances
      if (distance === 1) points = 8
      if (distance === 2) points = 6
      if (distance === 3) points = 4
      if (distance === 4) points = 2
      if (distance === 5) points = 0
      if (distance === 6) points = -1
      if (distance === 7) points = -2
      if (distance >= 8) points = -4
      console.log(`Primary answer - Value: ${value}, Closest ideal: ${closestIdeal}, Distance: ${distance}, Points awarded: ${points}`)
      return points
    }
    
    // For secondary answers (max 5 points)
    let points = -2 // Base negative points for large distances
    if (distance === 1) points = 4
    if (distance === 2) points = 3
    if (distance === 3) points = 2
    if (distance === 4) points = 1
    if (distance === 5) points = 0
    if (distance === 6) points = -1
    if (distance >= 7) points = -2
    console.log(`Secondary answer - Value: ${value}, Closest ideal: ${closestIdeal}, Distance: ${distance}, Points awarded: ${points}`)
    return points
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

  private getFeelerArtistValues(questionId: string, primaryQuestions: Record<ArtistType, string[]>): number[] {
    // Special cases for Feeler Artist
    if (specialCases.feelerLowQuestions.includes(questionId)) {
      return primaryQuestions['The Feeler Artist'].includes(questionId) 
        ? [0, 1, 2, 3] // Primary questions with low values
        : [7, 8]       // Secondary questions with normal values
    }
    
    return primaryQuestions['The Feeler Artist'].includes(questionId)
      ? [9, 10] // Normal primary questions
      : [7, 8]  // Normal secondary questions
  }
} 