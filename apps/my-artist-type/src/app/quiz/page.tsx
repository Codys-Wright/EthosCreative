"use client";

import { QuizTaker } from "@repo/quiz";
import { defaultQuiz } from "@repo/quiz/src/components/QuizCreator/defaultQuiz";
import type { QuizAnalysisResult } from "@repo/quiz/src/components/QuizTaker/analysis/types";

export default function QuizPage() {
  const handleQuizComplete = (
    responses: { questionId: string; response: number | null }[],
    analysis: QuizAnalysisResult,
  ) => {
    console.log("Quiz completed with responses:", responses);
    console.log("Analysis results:", analysis);

    // You can now use the analysis results to show the user their artist type
    console.log("Dominant type:", analysis.dominantType);
    console.log("Secondary type:", analysis.secondaryType);
    console.log("All types ranked:", analysis.results);
  };

  return (
    <div className="min-h-screen">
      <QuizTaker quiz={defaultQuiz} onComplete={handleQuizComplete} />
    </div>
  );
}
