"use client";

import { useQuizStore } from "./store";
import { Question, RatingQuestion } from "./store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, Download, Plus } from "lucide-react";

export function QuestionList() {
  const {
    quiz,
    currentQuestionId,
    setCurrentQuestionId,
    addQuestion,
    setQuizData,
  } = useQuizStore();

  const handleAddQuestion = () => {
    const questionCount = quiz.questions.length;
    addQuestion({
      type: "rating",
      title: `Question ${questionCount + 1}`,
      points: 1,
      timeLimit: 30,
      content: "Rate your agreement with the following statement:",
      minLabel: "Strongly Disagree",
      maxLabel: "Strongly Agree",
      min: 1,
      max: 10,
    });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const quiz = JSON.parse(e.target?.result as string);
            setQuizData(quiz);
          } catch (error) {
            console.error("Failed to parse quiz JSON:", error);
            alert("Invalid quiz file format");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    const quiz = useQuizStore.getState().exportQuiz();
    const blob = new Blob([JSON.stringify(quiz, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quiz.title.toLowerCase().replace(/\s+/g, "-")}-v${quiz.version}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-lg font-bold">Questions</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleImport}
            title="Import Quiz"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleExport}
            title="Export Quiz"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={handleAddQuestion}
            title="Add Question"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {quiz.questions.map((question) => (
            <div
              key={question.id}
              onClick={() => setCurrentQuestionId(question.id)}
              className={cn(
                "p-3 rounded cursor-pointer transition-colors",
                currentQuestionId === question.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm text-muted-foreground flex-shrink-0 w-6">
                    {quiz.questions.indexOf(question) + 1}.
                  </span>
                  <span className="font-medium truncate block">
                    {question.title}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {question.type}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 truncate pl-8">
                {question.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
