"use client";

import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import * as React from "react";

import { AlertDialog, Badge, Button, Card, Separator, Skeleton } from "@shadcn";
import { enginesAtom } from "@quiz/features/analysis-engine/client/atoms.js";
import {
  quizzesAtom,
  toggleQuizPublishAtom,
} from "@quiz/features/quiz/client/atoms.js";
import {
  CheckIcon,
  ChevronRightIcon,
  RadioIcon,
  RocketIcon,
  ServerIcon,
} from "lucide-react";

// ============================================================================
// Loading State
// ============================================================================

function LoadingState() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32" />
      <Skeleton className="h-64" />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export const CurrentQuizPage: React.FC = () => {
  const quizzesResult = useAtomValue(quizzesAtom);
  const enginesResult = useAtomValue(enginesAtom);
  const toggleQuizPublish = useAtomSet(toggleQuizPublishAtom, {
    mode: "promise",
  });

  const [isPublishing, setIsPublishing] = React.useState(false);
  const [pendingQuizId, setPendingQuizId] = React.useState<string | null>(null);

  // Get non-temp quizzes only (permanent versions)
  const availableQuizzes = React.useMemo(() => {
    if (!Result.isSuccess(quizzesResult)) return [];
    return quizzesResult.value
      .filter((q) => !q.isTemp && q.title === "My Artist Type Quiz")
      .sort((a, b) => b.version.semver.localeCompare(a.version.semver));
  }, [quizzesResult]);

  // Get all engines
  const engines = React.useMemo(() => {
    if (!Result.isSuccess(enginesResult)) return [];
    return enginesResult.value.filter((e) => !e.isTemp);
  }, [enginesResult]);

  // Get the currently published quiz
  const currentlyPublishedQuiz = React.useMemo(() => {
    return availableQuizzes.find((q) => q.isPublished);
  }, [availableQuizzes]);

  // Get engine for a quiz
  const getEngineForQuiz = React.useCallback(
    (quizId: string) => engines.find((e) => e.quizId === quizId),
    [engines]
  );

  const currentEngine = currentlyPublishedQuiz
    ? getEngineForQuiz(currentlyPublishedQuiz.id)
    : undefined;

  const pendingQuiz = pendingQuizId
    ? availableQuizzes.find((q) => q.id === pendingQuizId)
    : null;

  const handlePublish = async () => {
    if (!pendingQuiz) return;

    setIsPublishing(true);
    try {
      // Unpublish current if different
      if (
        currentlyPublishedQuiz &&
        currentlyPublishedQuiz.id !== pendingQuiz.id
      ) {
        await toggleQuizPublish({
          quiz: currentlyPublishedQuiz,
          isPublished: false,
        });
      }

      // Publish selected
      await toggleQuizPublish({
        quiz: pendingQuiz,
        isPublished: true,
      });

      setPendingQuizId(null);
    } catch (error) {
      console.error("Failed to publish quiz:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const isLoading =
    !Result.isSuccess(quizzesResult) || !Result.isSuccess(enginesResult);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Current Quiz</h1>

      {/* Currently Live */}
      <Card className="border-green-500/50">
        <Card.Header className="pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <Card.Title className="text-base">Live Now</Card.Title>
          </div>
        </Card.Header>
        <Card.Content>
          {currentlyPublishedQuiz ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold">
                  v{currentlyPublishedQuiz.version.semver}
                </span>
                <Badge className="bg-green-500 text-white">Active</Badge>
              </div>
              {currentlyPublishedQuiz.version.comment && (
                <p className="text-sm text-muted-foreground">
                  {currentlyPublishedQuiz.version.comment}
                </p>
              )}
              {currentEngine && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                  <ServerIcon className="h-3.5 w-3.5" />
                  <span>
                    {currentEngine.name} v{currentEngine.version.semver}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No quiz is currently live</p>
          )}
        </Card.Content>
      </Card>

      {/* Version List */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Switch Version
        </h2>
        <Card>
          <div className="divide-y">
            {availableQuizzes.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No quiz versions available
              </div>
            ) : (
              availableQuizzes.map((quiz) => {
                const engine = getEngineForQuiz(quiz.id);
                const isLive = quiz.isPublished;
                const canPublish = !!engine && !isLive;

                return (
                  <button
                    key={quiz.id}
                    onClick={() => canPublish && setPendingQuizId(quiz.id)}
                    disabled={!canPublish}
                    className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                      canPublish
                        ? "hover:bg-muted/50 cursor-pointer"
                        : "cursor-default"
                    } ${isLive ? "bg-green-500/5" : ""}`}
                  >
                    {/* Radio indicator */}
                    <div
                      className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isLive
                          ? "border-green-500 bg-green-500"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {isLive && (
                        <CheckIcon className="h-2.5 w-2.5 text-white" />
                      )}
                    </div>

                    {/* Version info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">
                          v{quiz.version.semver}
                        </span>
                        {isLive && (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600/30 text-xs"
                          >
                            Live
                          </Badge>
                        )}
                      </div>
                      {quiz.version.comment ? (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {quiz.version.comment}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground/50 italic mt-0.5">
                          No version notes
                        </p>
                      )}
                      {!engine && (
                        <p className="text-xs text-yellow-600 mt-1">
                          No engine linked
                        </p>
                      )}
                    </div>

                    {/* Action hint */}
                    {canPublish && (
                      <ChevronRightIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!pendingQuizId}
        onOpenChange={() => setPendingQuizId(null)}
      >
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>
              Switch to v{pendingQuiz?.version.semver}?
            </AlertDialog.Title>
            <AlertDialog.Description>
              {currentlyPublishedQuiz ? (
                <>
                  This will replace{" "}
                  <strong>v{currentlyPublishedQuiz.version.semver}</strong> as
                  the live quiz.
                </>
              ) : (
                <>This version will become the live quiz.</>
              )}
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={isPublishing}>
              Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? "Switching..." : "Make Live"}
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </div>
  );
};
