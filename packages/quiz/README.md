# @quiz

Quiz and personality assessment engine — survey-style quizzes with no correct answers, configurable analysis engines, and response tracking.

## Overview

This package powers the "My Artist Type" personality quiz and can support any survey-style assessment. Key capabilities:

- **Quiz authoring** — Create quizzes with ordered questions, versioning, and publication status
- **Response collection** — Capture answers with session metadata, interaction logs, and time tracking
- **Analysis engines** — Configurable scoring with weighted question rules and multiple endings
- **Active quiz management** — Map slugs to specific quiz + engine version combos (supports A/B testing)
- **Admin dashboard** — Response tables, stats cards, analysis charts, and temporal analytics

## Exports

| Entry point | Import as | Contents |
|---|---|---|
| `@quiz` | Client + Domain | Schemas, RPC definitions, atoms, UI components |
| `@quiz/server` | Server | Services, RPC/API handlers, runtime |
| `@quiz/database` | Database | Migrations (6 tables), seeders |

## Features

### Quiz

CRUD for quiz definitions with questions, metadata, versioning, and soft deletes.

**RPC** (prefix `quiz_`): `list`, `listPublished`, `getById`, `upsert`, `delete`

### Responses

Captures user quiz responses including per-question answers, time spent, session metadata, and interaction logs. Supports anonymous responses that can be linked to user accounts later.

**RPC** (prefix `response_`): `list`, `getById`, `getByQuiz`, `upsert`, `delete`

### Analysis Engine

Configurable scoring engines with:

- **Scoring config** — Primary/secondary weights, distance gamma, beta amplification
- **Question rules** — Per-question ideal answers, primary/secondary classification, custom weights
- **Ending definitions** — Named outcomes with descriptions, icons, and colors

### Analysis

Runs responses through analysis engines to produce scored results.

**RPC** (prefix `analysis_`): `list`, `getById`, `getByResponse`, `getByEngine`, `analyze`, `batchAnalyze`, `upsert`, `getSummary`, `delete`

### Active Quiz

Maps URL slugs to specific quiz + engine version pairs, enabling A/B testing of different engine configurations.

**HTTP API**: `GET /`, `GET /:slug`, `PUT /`, `DELETE /:slug`

### Admin

Admin UI components: `ResponsesTable`, `CurrentQuizPage`, `ResponseStatsCards`, `AnalysisChart`, `ResponsesOverTimeChart`

## Database Schema

6 migration files creating:

- `quizzes` — Quiz definitions with JSONB questions and metadata
- `analysis_engines` — Engine configurations
- `responses` — User quiz responses with optional `userId`
- `analysis_results` — Scored analysis outputs
- `active_quizzes` — Slug → quiz + engine mappings

## Usage

```typescript
import { ActiveQuiz, QuizResponse, AnalysisResult } from '@quiz';
import { QuizTakerPage, MyResponsePage } from '@quiz';

// Server
import { QuizApiLive, QuizRpcLive } from '@quiz/server';

// Database
import { QuizMigrations, quiz as quizSeeder } from '@quiz/database';
```

## Dependencies

- **`@core`** — Domain schemas (Slug, Version), database utilities, RPC config, atom helpers
- **`@auth`** — User authentication and userId
- **`@shadcn`** — UI components
