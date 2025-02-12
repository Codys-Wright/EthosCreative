"use client";

import { QuizCreator } from "@repo/quiz";

export default function QuizPage() {
  return (
    <div className="h-[calc(100vh-theme(spacing.16))]">
      <QuizCreator />
    </div>
  );
}
