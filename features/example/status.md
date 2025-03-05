# Example Status

A simple status page for each of the things we need for the example feature

# Entity Structure Guide

This document outlines the complete structure for implementing a new entity in the system, using the `Example` entity as a reference implementation.

## Table of Contents

1. [Directory Structure](#directory-structure)
2. [Type Definitions with Effect Schema](#type-definitions-with-effect-schema)
3. [Service Implementation](#service-implementation)
4. [React Hooks](#react-hooks)
5. [UI Configuration](#ui-configuration)
6. [Error Handling](#error-handling)
7. [Testing and Demo Components](#testing-and-demo-components)
8. [Entry Points and Exports](#entry-points-and-exports)

## Directory Structure

The standard directory structure for an entity should look like this:

```
features/
└── example/                 # Replace "example" with your entity name
    ├── api/                 # API-related functionality
    │   ├── example.hooks.ts # React hooks for UI components
    │   ├── example.service.ts # Effect-based service implementation
    │   └── index.ts         # Export API functionality
    ├── errors/              # Entity-specific errors
    │   └── example-errors.ts
    ├── presentation/        # UI components specific to this entity
    │   └── components/
    │       ├── example-card.tsx
    │       ├── example-editor.tsx
    │       └── index.ts
    ├── types/               # Type definitions for the entity
    │   ├── example.type.ts  # Core schemas and types
    │   ├── example-fields.ts # Field customizations
    │   └── index.ts
    ├── config/              # Configuration for UI components
    │   └── example-table.config.ts
    ├── __tests__/           # Test and demo implementations
    │   ├── demo/
    │   │   └── example-demo-page.tsx
    │   └── generators/
    │       └── generateExampleData.ts
    ├── status.md            # Documentation (this file)
    └── index.ts             # Main entry point for the feature
```

## Type Definitions with Effect Schema

### Basic Structure

Create a type definition file at `types/example.type.ts`:

```typescript
import { TabDefinition } from "@/components/crud/data-editor-dialog";
import { Schema as S } from "effect";

// 1. Define a branded type for the ID (for type safety)
export const ExampleId = S.String.pipe(S.brand("ExampleId"));

// 2. Define the full entity schema with all fields
export const Example = S.Struct({
  id: ExampleId,
  title: S.NullOr(S.String),
  subtitle: S.NullOr(S.String),
  content: S.NullOr(S.String),
  createdAt: S.DateFromSelf,
  updatedAt: S.DateFromSelf,
  deletedAt: S.NullOr(S.DateFromSelf),
});

// 3. Define schema for creating new entities (without auto-generated fields)
export const NewExample = S.Struct({
  title: S.NullOr(S.String),
  subtitle: S.NullOr(S.String),
  content: S.NullOr(S.String),
});

// 4. Export typescript types for normal usage
export type ExampleType = typeof Example.Type;
export type NewExampleType = typeof NewExample.Type;

// 5. Define tab groups for form organization
export const ExampleGroups: TabDefinition<ExampleType>[] = [
  {
    id: "content",
    label: "Content",
    fields: ["title", "subtitle", "content"]
  },
  {
    id: "metadata",
    label: "Metadata",
    fields: ["id", "createdAt", "updatedAt", "deletedAt"]
  }
];
```

### Naming Conventions

- **Types**: Use PascalCase for type names
  - `ExampleType` - The full entity type
  - `NewExampleType` - Type for creating new entities
- **Schemas**: Use PascalCase for schema definitions
  - `Example` - The full entity schema
  - `NewExample` - Schema for creating new entities
- **Type IDs**: Use [EntityName]Id pattern for branded IDs
  - `ExampleId` - Branded ID type

### Field Customizations

Create a field customizations file at `types/example-fields.ts`:

```typescript
import { FieldCustomizationRecord } from "@/components/crud/field-types";
import { ExampleType } from "./example.type";

// Field customizations for forms and editors
export const ExampleFields: FieldCustomizationRecord<ExampleType> = {
  title: {
    label: "Title",
    description: "The main title of the example",
    placeholder: "Enter a descriptive title..."
  },
  subtitle: {
    label: "Subtitle",
    description: "A short description or subtitle",
    placeholder: "Brief description of this example..."
  },
  content: {
    type: "textarea",
    label: "Content",
    description: "The main content for this example",
    placeholder: "Enter detailed content here..."
  },
  id: {
    label: "ID",
    description: "Unique identifier (read-only)",
    readOnly: true
  },
  createdAt: {
    label: "Created Date",
    description: "When this item was created",
    type: "date",
    readOnly: true
  },
  updatedAt: {
    label: "Last Updated",
    description: "When this item was last updated",
    type: "date",
    readOnly: true
  },
  deletedAt: {
    label: "Deleted Date",
    description: "When this item was deleted (if applicable)",
    type: "date",
    readOnly: true
  }
};
```

## Service Implementation

Create a service file at `api/example.service.ts`:

```typescript
import { Example, NewExample, ExampleType, NewExampleType } from "../types/example.type";
import { Effect as E, Schema as S } from "effect";
import { NotFoundError } from "@/features/global/lib/errors/base-errors";
import { Database } from "@/lib/db/db.service";

export class ExampleService extends E.Service<ExampleService>()(
  "ExampleService",
  {
    accessors: true,
    dependencies: [Database.Default],

    effect: E.gen(function* () {
      const db = yield* Database;

      return {
        // Get all active examples
        getAll: () => E.gen(function* () {
          const response = yield* db.findMany("example");
          const validatedExamples = response.map((ex) =>
            S.decodeSync(Example)(ex as any)
          );
          const activeExamples = validatedExamples.filter(
            (example) => example.deletedAt === null
          );
          return activeExamples;
        }).pipe(E.withSpan("ExampleService.getAll.implementation")),

        // Get example by ID
        getById: (id: string) => E.gen(function* () {
          const response = yield* db.findById("example", id);
          
          if (response && (response as any).deletedAt) {
            return E.fail(
              new NotFoundError({
                message: `Example with id ${id} has been deleted`,
                entity: "example",
                id,
              })
            );
          }
          
          return S.decodeSync(Example)(response as any);
        }).pipe(E.withSpan("ExampleService.getById.implementation")),

        // Update an existing example
        update: (id: string, data: Partial<ExampleType>) => E.gen(function* () {
          const updatedExample = yield* db.update("example", id, data);
          return updatedExample;
        }).pipe(E.withSpan("ExampleService.update.implementation")),

        // Create a new example
        create: (data: NewExampleType) => E.gen(function* () {
          const newExample = yield* db.insert("example", data);
          return newExample;
        }).pipe(E.withSpan("ExampleService.create.implementation")),

        // Soft delete an example
        delete: (id: string) => E.gen(function* () {
          yield* db.update("example", id, {
            deletedAt: new Date(),
          });
          return { success: true, id };
        }).pipe(E.withSpan("ExampleService.delete.implementation")),

        // Restore a deleted example
        undoDelete: (id: string) => E.gen(function* () {
          const example = yield* db.findById("example", id);
          
          if (!example) {
            return E.fail(
              new NotFoundError({
                message: `Example with id ${id} not found`,
                entity: "example",
                id,
              })
            );
          }
          
          if (!(example as any).deletedAt) {
            return { success: false, id, message: "Example is not deleted" };
          }
          
          const restoredExample = yield* db.update("example", id, {
            deletedAt: null,
          });

          return { 
            success: true, 
            id, 
            message: "Example restored successfully",
            example: restoredExample
          };
        }).pipe(E.withSpan("ExampleService.undoDelete.implementation")),

        // Permanently delete an example
        permanentDelete: (id: string) => E.gen(function* () {
          yield* db.delete("example", id);
          return { success: true, id };
        }).pipe(E.withSpan("ExampleService.permanentDelete.implementation")),
      };
    }),
  }
) {}
```

## React Hooks

Create hooks file at `api/example.hooks.ts`:

```typescript
import { Effect as E } from "effect";
import { ExampleService } from "./example.service";
import {
  createQueryDataHelpers,
  createQueryKey,
} from "@/features/global/lib/utils/query-data-helpers";
import {
  useEffectMutation,
  useEffectQuery,
  queryClient,
} from "@/features/global/lib/utils/tanstack-query";
import { ExampleType, NewExampleType } from "./../types/example.type";
import { ExampleError } from "./../errors/example-errors";
import { NotFoundError } from "@/features/global/lib/errors/base-errors";
import { toast } from "sonner";

export namespace ExampleHooks {
  // Define query key variables
  type ExampleVars = {
    id?: string;
  };

  // Create query key creator
  export const exampleQueryKey = createQueryKey<"example", ExampleVars>("example");

  // Create data helpers for cache management
  export const exampleData = createQueryDataHelpers<ExampleType[], ExampleVars>(
    exampleQueryKey
  );

  // Get all examples
  export const useGetAll = () => {
    return useEffectQuery({
      queryKey: exampleQueryKey({}),
      queryFn: () => ExampleService.getAll().pipe(
        // Error handling and notifications
      ),
      staleTime: "5 minutes",
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    });
  };

  // Get example by ID
  export const useGetById = (id: string | undefined) => {
    return useEffectQuery({
      queryKey: exampleQueryKey({ id: id || "" }),
      queryFn: () => ExampleService.getById(id!).pipe(
        // Error handling and notifications
      ),
      enabled: !!id && id.trim() !== "",
      staleTime: "5 minutes",
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    });
  };

  // Update an example
  export const useUpdate = () => {
    return useEffectMutation({
      mutationKey: ["updateExample"],
      mutationFn: ({ id, data }: { id: string; data: Partial<NewExampleType> }) => {
        // Optimistic updates
        // API call with error handling
        // Cache updates and notifications
      },
    });
  };

  // Create a new example
  export const useCreate = () => {
    return useEffectMutation({
      mutationKey: ["createExample"],
      mutationFn: (input: NewExampleType) => {
        // Optimistic creation
        // API call with error handling
        // Cache updates and notifications
      },
    });
  };

  // Delete an example
  export const useDelete = () => {
    // Create the undo mutation that will be used internally
    const undoDeleteMutation = useUndoDelete();
    
    return useEffectMutation({
      mutationKey: ["deleteExample"],
      mutationFn: (id: string) => {
        // Optimistic deletion
        // API call with error handling
        // Show toast with undo button that uses undoDeleteMutation
        // Cache updates and notifications
      },
    });
  };

  // Restore a deleted example
  export const useUndoDelete = () => {
    return useEffectMutation({
      mutationKey: ["undoDeleteExample"],
      mutationFn: (id: string) => {
        // API call to restore with error handling
        // Cache updates and notifications
      }
    });
  };
}
```

## UI Configuration

### Table Configuration

Create a table configuration file at `config/example-table.config.ts`:

```typescript
import {
  DataTableProps,
  DataTableColumnConfig,
  RendererType,
} from "@/components/crud/data-table";
import {
  Example,
  NewExample,
  type ExampleType,
  type NewExampleType,
  ExampleGroups,
} from "../types/example.type";
import { ExampleFields } from "../types/example-fields";

// Define table columns configuration
export const exampleColumns: DataTableColumnConfig<ExampleType>[] = [
  {
    field: "id",
    header: "ID",
    width: 100,
    rendererType: RendererType.ID,
  },
  {
    field: "title",
    header: "Title",
    width: 200,
    maxTextWidth: 180,
  },
  // Add more columns as needed
];

// Define editor key info for the dialog
export const exampleEditorKeyInfo = {
  title: {
    field: "title",
    label: "Title",
  },
  subtitle: {
    field: "subtitle",
    label: "Subtitle",
  },
  additionalFields: [
    {
      field: "id",
      label: "Example ID",
    },
    {
      field: "createdAt",
      label: "Created At",
    },
  ],
};

// Define the table props type
export type ExampleTableProps = DataTableProps<ExampleType>;

// Define base configuration for the table
export const exampleTableBaseProps: Partial<ExampleTableProps> = {
  columns: exampleColumns,
  schema: Example as any,
  createSchema: NewExample as any,
  editSchema: Example as any,
  tabs: ExampleGroups,
  fieldCustomizations: ExampleFields,
  editorKeyInfo: exampleEditorKeyInfo,
  
  title: "Examples",
  description: "Manage examples with inline and dialog editing",
  emptyStateMessage: "No examples found",
  emptyStateDescription: "Create a new example to get started",
  
  useIntegratedEditor: true,
  enableSelection: true,
};

// Define runtime props type for specific instances
export type ExampleTableRuntimeProps = Pick<
  ExampleTableProps,
  "data" | "onEdit" | "onDelete" | "onCreateNew" | "onFieldUpdate"
> & {
  customTitle?: string;
  readOnly?: boolean;
  editable?: boolean;
};
```

## Error Handling

Create entity-specific errors at `errors/example-errors.ts`:

```typescript
import { BaseError } from "@/features/global/lib/errors/base-errors";

export class ExampleError extends BaseError<{
  message: string;
  cause?: unknown;
}> {
  readonly _tag = "ExampleError";

  constructor(args: {
    message: string;
    cause?: unknown;
  }) {
    super({
      ...args,
      name: "ExampleError",
    });
  }
}
```

## Testing and Demo Components

### Data Generator

Create a data generator at `__tests__/generators/generateExampleData.ts`:

```typescript
import { faker } from '@faker-js/faker';
import { ExampleType, ExampleId, NewExampleType } from '@/features/example/types/example.type';

// Set a fixed seed for consistent generation
faker.seed(456);

// Generate a random example ID
export function generateExampleId(): string & typeof ExampleId.Type {
  return `ex_${faker.string.alphanumeric(10)}` as string & typeof ExampleId.Type;
}

// Generate a single random example
export function generateExample(): ExampleType {
  const createdAt = faker.date.past({ years: 1 });
  const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
  const deletedAt = faker.helpers.maybe(
    () => faker.date.between({ from: updatedAt, to: new Date() }),
    { probability: 0.2 }
  ) || null;
  
  return {
    id: generateExampleId(),
    title: faker.helpers.maybe(() => faker.lorem.sentence({ min: 3, max: 8 }), { probability: 0.9 }) || null,
    subtitle: faker.helpers.maybe(() => faker.lorem.sentence({ min: 5, max: 15 }), { probability: 0.7 }) || null,
    content: faker.helpers.maybe(() => faker.lorem.paragraphs({ min: 1, max: 5 }), { probability: 0.8 }) || null,
    createdAt,
    updatedAt,
    deletedAt,
  };
}

// Generate a new example (without ID and timestamps)
export function generateNewExample(): NewExampleType {
  return {
    title: faker.helpers.maybe(() => faker.lorem.sentence({ min: 3, max: 8 }), { probability: 0.9 }) || null,
    subtitle: faker.helpers.maybe(() => faker.lorem.sentence({ min: 5, max: 15 }), { probability: 0.7 }) || null,
    content: faker.helpers.maybe(() => faker.lorem.paragraphs({ min: 1, max: 5 }), { probability: 0.8 }) || null,
  };
}

// Generate multiple examples
export function generateExamples(count: number = 10): ExampleType[] {
  return Array.from({ length: count }, () => generateExample());
}

// Sample fixed examples for consistent testing
export const sampleExamples: ExampleType[] = [
  // Add 3-5 hand-crafted examples with fixed IDs and realistic data
];
```

### Demo Page

Create a demo page at `__tests__/demo/example-demo-page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/features/global/lib/utils/tanstack-query";
import { ExampleHooks } from "@/features/example/api/example.hooks";
import { ExampleType, NewExampleType } from "@/features/example/types/example.type";
import { DataTable } from "@/components/crud/data-table";
import {
  exampleTableBaseProps,
  ExampleTableRuntimeProps,
} from "@/features/example/config/example-table.config";

export default function ExampleDemoPage() {
  // Track if component is mounted on client
  const [isMounted, setIsMounted] = useState(false);
  
  // Use hooks for data fetching and mutations
  const exampleQuery = ExampleHooks.useGetAll();
  const examples = (exampleQuery.data || []) as ExampleType[];
  const updateMutation = ExampleHooks.useUpdate();
  const createMutation = ExampleHooks.useCreate();
  const deleteMutation = ExampleHooks.useDelete();

  // Set mounted flag to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // CRUD handler functions that use the hooks
  // ...

  // Define runtime props
  const runtimeProps: ExampleTableRuntimeProps = {
    data: examples,
    onEdit: saveExample,
    onDelete: deleteExample,
    onCreateNew: createExample,
    onFieldUpdate: handleFieldUpdate,
    editable: true,
  };

  // Compose complete props
  const tableProps = {
    ...exampleTableBaseProps,
    ...runtimeProps,
  };

  // Render the component
  return (
    <QueryClientProvider client={queryClient}>
      {/* Component JSX */}
    </QueryClientProvider>
  );
}
```

## Entry Points and Exports

Create index files to export functionality:

### Main index file at `features/example/index.ts`:

```typescript
// Re-export type definitions
export * from './types';

// Re-export API functionality
export * from './api';

// Re-export UI components
export * from './presentation/components';

// Re-export config
export * from './config/example-table.config';
```

### Types index at `features/example/types/index.ts`:

```typescript
export * from './example.type';
export * from './example-fields';
```

### API index at `features/example/api/index.ts`:

```typescript
export * from './example.hooks';
export * from './example.service';
```

### Component index at `features/example/presentation/components/index.ts`:

```typescript
export * from './example-card';
export * from './example-editor';
```

## Database Schema (in lib/db/schema.ts)

Ensure you define the database schema for your entity:

```typescript
export const example = pgTable(
  "example",
  {
    id: text("id").notNull().primaryKey(),
    title: text("title"),
    subtitle: text("subtitle"),
    content: text("content"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
    // Generated columns if needed
    contentSearch: tsVector("content_search").generatedAlwaysAs(
      (): SQL => sql`to_tsvector('english', COALESCE(${example.title}, '') || ' ' || COALESCE(${example.subtitle}, '') || ' ' || ${example.content})`
    ),
    displayName: text("display_name").generatedAlwaysAs(
      (): SQL => sql`CASE WHEN ${example.title} IS NOT NULL AND ${example.subtitle} IS NOT NULL 
                       THEN ${example.title} || ' - ' || ${example.subtitle} 
                       WHEN ${example.title} IS NOT NULL THEN ${example.title} 
                       WHEN ${example.subtitle} IS NOT NULL THEN ${example.subtitle} 
                       ELSE 'Untitled Example' END`
    ),
  },
  (table) => ({
    // Add indexes if needed
    contentSearchIdx: index("idx_example_content_search").on(table.contentSearch),
  })
);
```

## API Routes

Create necessary API routes:

### GET & POST at `app/api/example/route.ts`
### GET, PATCH, DELETE at `app/api/example/[id]/route.ts`
### POST at `app/api/example/[id]/restore/route.ts`

Follow the existing API route structure, using your service to handle the requests.

## Best Practices

1. **Consistent Naming**: Follow the naming conventions throughout the implementation
2. **Complete Type Safety**: Leverage Effect schemas for runtime and compile-time type safety
3. **Optimistic Updates**: Implement optimistic updates for a better user experience
4. **Error Handling**: Provide clear, user-friendly error messages
5. **Modular Structure**: Keep functionality neatly organized by responsibility
6. **Reusable Components**: Abstract components that can be reused across features
7. **Documentation**: Document complex logic and maintain this guide
8. **Testing**: Create comprehensive tests and demonstration components

## Implementation Checklist

When implementing a new entity:

- [ ] Database schema in schema.ts
- [ ] Type definitions with Effect schemas
- [ ] Field customizations
- [ ] Service implementation
- [ ] React hooks
- [ ] Error classes
- [ ] Table configuration
- [ ] Data generator with Faker
- [ ] Demo component
- [ ] API routes
- [ ] Index exports
- [ ] Documentation update

Following this structure will ensure a consistent, maintainable codebase with proper separation of concerns.
