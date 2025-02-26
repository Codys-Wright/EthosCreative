"use client";

import { QuizTaker } from "@/features/quiz/components/QuizTaker/index"; 
import { defaultQuiz } from "@/features/quiz/components/QuizCreator/defaultQuiz";
import type { QuizAnalysisResult } from "@/features/quiz/components/QuizTaker/analysis/types";
import { useSession, useListOrganizations } from "@/lib/auth-client";

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

  const { data: session } = useSession();
  const { data: organizations } = useListOrganizations();
  
  const hasMyArtistTypeOrg = organizations?.some(
    (org) => org.name === "MyArtistType"
  );
  return (
    <div className="min-h-screen">
      <QuizTaker 
        quiz={defaultQuiz} 
        onComplete={handleQuizComplete}
        showQuestionTitle={true}
        isAdmin={hasMyArtistTypeOrg}
      />
    </div>
  );
}
