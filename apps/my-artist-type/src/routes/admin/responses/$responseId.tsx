import { Result, useAtomValue } from '@effect-atom/atom-react';
import {
  responsesAtom,
  analysesAtom,
  ArtistTypeGraphCard,
  type QuizResponse,
  type AnalysisResult,
} from '@quiz';
import { Badge, Card, Skeleton, Button } from '@shadcn';
import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { ArrowLeftIcon, ClockIcon, CalendarIcon, UserIcon, MousePointerIcon } from 'lucide-react';
import React from 'react';

export const Route = createFileRoute('/admin/responses/$responseId')({
  component: AdminResponseDetailPage,
});

// ============================================================================
// Helper Components
// ============================================================================

function LoadingState() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

function NotFoundState({ responseId }: { responseId: string }) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-semibold mb-2">Response Not Found</h2>
      <p className="text-muted-foreground mb-4">
        Could not find response with ID: {responseId}
      </p>
      <Link to="/admin">
        <Button variant="outline">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}

// ============================================================================
// Section Components
// ============================================================================

function MetadataSection({ response }: { response: QuizResponse }) {
  const sessionMeta = response.sessionMetadata;
  const startedAt = new Date(sessionMeta.startedAt.epochMillis);
  const completedAt = sessionMeta.completedAt
    ? new Date(sessionMeta.completedAt.epochMillis)
    : null;
  const durationMs = sessionMeta.totalDurationMs ?? 0;

  // Extract user info
  const userInfo = sessionMeta.customFields as { name?: string; email?: string } | undefined;

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Response Metadata
        </Card.Title>
      </Card.Header>
      <Card.Content className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Response ID</p>
            <p className="font-mono text-xs">{response.id}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Quiz ID</p>
            <p className="font-mono text-xs">{response.quizId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">User</p>
            <p>{userInfo?.name ?? userInfo?.email ?? 'Anonymous'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <Badge variant={completedAt ? 'default' : 'secondary'}>
              {completedAt ? 'Completed' : 'In Progress'}
            </Badge>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Started</p>
                <p>{startedAt.toLocaleString()}</p>
              </div>
            </div>
            {completedAt && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Completed</p>
                  <p>{completedAt.toLocaleString()}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Duration</p>
                <p>{durationMs > 0 ? `${Math.round(durationMs / 1000)}s` : '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {sessionMeta.userAgent && (
          <div className="border-t pt-4">
            <p className="text-muted-foreground text-xs mb-1">User Agent</p>
            <p className="text-xs font-mono truncate">{sessionMeta.userAgent}</p>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}

function AnalysisSection({ analysis }: { analysis: AnalysisResult }) {
  const artistData = analysis.endingResults.map((result) => {
    const shortName = result.endingId
      .replace(/^the-/, '')
      .replace(/-artist$/, '')
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      databaseId: result.endingId,
      artistType: shortName,
      fullName: `The ${shortName} Artist`,
      points: result.points,
      percentage: result.percentage,
    };
  });

  const winner = analysis.endingResults.find((r) => r.isWinner);
  const winnerName = winner?.endingId
    .replace(/^the-/, '')
    .replace(/-artist$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <Card>
      <Card.Header>
        <Card.Title>Analysis Results</Card.Title>
        <Card.Description>
          Winner: <span className="font-semibold">{winnerName ?? 'N/A'}</span> (
          {winner?.percentage.toFixed(1)}%)
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <ArtistTypeGraphCard
          data={artistData}
          showBarChart={true}
          barChartHeight="h-40"
          transparent
        />
      </Card.Content>
    </Card>
  );
}

function AnswersSection({ response }: { response: QuizResponse }) {
  const answers = response.answers ?? [];

  if (answers.length === 0) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>Answers</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-muted-foreground text-sm">No answers recorded</p>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Answers ({answers.length})</Card.Title>
        <Card.Description>Individual question responses</Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {answers.map((answer, idx) => (
            <div
              key={`${answer.questionId}-${idx}`}
              className="flex items-center justify-between p-2 rounded border bg-muted/30"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-muted-foreground truncate">
                  {answer.questionId}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{String(answer.value)}</Badge>
                {answer.timeSpentMs && (
                  <span className="text-xs text-muted-foreground">
                    {Math.round(answer.timeSpentMs / 1000)}s
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}

function InteractionsSection({ response }: { response: QuizResponse }) {
  const logs = response.interactionLogs ?? [];

  if (logs.length === 0) {
    return (
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <MousePointerIcon className="h-5 w-5" />
            Interaction Logs
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-muted-foreground text-sm">No interaction logs recorded</p>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center gap-2">
          <MousePointerIcon className="h-5 w-5" />
          Interaction Logs ({logs.length})
        </Card.Title>
        <Card.Description>User behavior tracking</Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {logs.map((log, idx) => (
            <div
              key={`${log.type}-${idx}`}
              className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-muted/50"
            >
              <Badge variant="outline" className="text-[10px] px-1.5">
                {log.type}
              </Badge>
              {log.questionId && (
                <span className="font-mono text-muted-foreground truncate max-w-[120px]">
                  {log.questionId}
                </span>
              )}
              {log.action && <span className="text-muted-foreground">{log.action}</span>}
              <span className="ml-auto text-muted-foreground">
                {new Date(log.timestamp.epochMillis).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

function AdminResponseDetailPage() {
  const { responseId } = useParams({ from: '/admin/responses/$responseId' });

  const responsesResult = useAtomValue(responsesAtom);
  const analysesResult = useAtomValue(analysesAtom);

  // Find the response and its analysis
  const response = React.useMemo(() => {
    if (!Result.isSuccess(responsesResult)) return undefined;
    return responsesResult.value.find((r) => r.id === responseId);
  }, [responsesResult, responseId]);

  const analysis = React.useMemo(() => {
    if (!Result.isSuccess(analysesResult)) return undefined;
    return analysesResult.value.find((a) => a.responseId === responseId);
  }, [analysesResult, responseId]);

  // Loading state
  if (!Result.isSuccess(responsesResult) || !Result.isSuccess(analysesResult)) {
    return <LoadingState />;
  }

  // Not found state
  if (!response) {
    return <NotFoundState responseId={responseId} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Response Detail</h2>
          <p className="text-muted-foreground text-sm">
            Created {new Date(response.createdAt.epochMillis).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <MetadataSection response={response} />
          <AnswersSection response={response} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {analysis ? (
            <AnalysisSection analysis={analysis} />
          ) : (
            <Card>
              <Card.Header>
                <Card.Title>Analysis Results</Card.Title>
              </Card.Header>
              <Card.Content>
                <p className="text-muted-foreground text-sm">
                  No analysis available for this response
                </p>
              </Card.Content>
            </Card>
          )}
          <InteractionsSection response={response} />
        </div>
      </div>
    </div>
  );
}
