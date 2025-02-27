import { Example, NewExample, ExampleId } from "./types/example.type";
import { Effect as E, Layer, Schema as S } from "effect";
import {
  NotFoundError,
  ValidationError,
  DatabaseError,
  UnexpectedError,
} from "@/features/global/lib/errors/base-errors";

// Mock data for examples
const mockExamples: Example[] = [
  {
    id: "example-1",
    content: "This is the first example",
    createdAt: new Date("2023-01-15T10:30:00Z"),
    updatedAt: new Date("2023-01-15T10:30:00Z"),
  },
  {
    id: "example-2",
    content: "This is the second example with more details",
    createdAt: new Date("2023-02-20T14:45:00Z"),
    updatedAt: new Date("2023-03-05T09:15:00Z"),
  },
  {
    id: "example-3",
    content: "Third example showing how to use the database",
    createdAt: new Date("2023-04-10T16:20:00Z"),
    updatedAt: new Date("2023-04-10T16:20:00Z"),
  },
];

export class ExampleService extends E.Service<ExampleService>()(
  "ExampleService",
  {
    accessors: true,
    dependencies: [],
    effect: E.gen(function* () {
      return {
        // use E.gen to create a method that returns a gen function
        getAll: () =>
          E.gen(function* () {
            yield* E.log("Getting all examples");
            // Return mock data
            yield* E.annotateCurrentSpan("examples.count", mockExamples.length);
            return mockExamples;
          }).pipe(E.withSpan("ExampleService.getAll.implementation")),

        getById: (id: string) =>
          E.gen(function* () {
            yield* E.log(`Getting example with id ${id}`);
            yield* E.annotateCurrentSpan("example.id", id);

            try {
              // Find example in mock data
              const example = mockExamples.find((ex) => ex.id === id);

              // Check if example exists
              if (!example) {
                yield* E.annotateCurrentSpan("example.found", false);
                return yield* E.fail(
                  new NotFoundError({
                    message: `Example with ID ${id} not found`,
                    entity: "Example",
                    id,
                  }),
                );
              }

              yield* E.annotateCurrentSpan("example.found", true);
              return example;
            } catch (error) {
              yield* E.annotateCurrentSpan("error", "true");
              yield* E.annotateCurrentSpan("error.type", "unexpected");
              return yield* E.fail(
                new UnexpectedError({
                  message: `Unexpected error fetching example with ID ${id}`,
                  cause: error,
                }),
              );
            }
          }).pipe(E.withSpan("ExampleService.getById.implementation")),

        update: (id: string, data: Partial<Example>) =>
          E.gen(function* () {
            yield* E.log(`Updating example: ${id}`);
            yield* E.annotateCurrentSpan("example.id", id);
            yield* E.annotateCurrentSpan(
              "update.fields",
              Object.keys(data).join(","),
            );

            try {
              // Validate data
              if (data.content && typeof data.content !== "string") {
                yield* E.annotateCurrentSpan("validation.error", "true");
                return yield* E.fail(
                  new ValidationError({
                    message: `Invalid value for field 'content' in Example`,
                    field: "content",
                    value: data.content,
                  }),
                );
              }

              // Simulate updating data
              const updatedExample = { ...data, id }; // Replace with actual update logic

              // Check if example exists
              if (!updatedExample) {
                yield* E.annotateCurrentSpan("update.success", false);
                return yield* E.fail(
                  new NotFoundError({
                    message: `Example with ID ${id} not found`,
                    entity: "Example",
                    id,
                  }),
                );
              }

              yield* E.annotateCurrentSpan("update.success", true);
              return updatedExample;
            } catch (error) {
              yield* E.annotateCurrentSpan("error", "true");
              yield* E.annotateCurrentSpan("error.type", "database_error");
              return yield* E.fail(
                new DatabaseError({
                  message: `Database error during update operation on Example`,
                  operation: "update",
                  entity: "Example",
                  cause: error,
                }),
              );
            }
          }).pipe(E.withSpan("ExampleService.update.implementation")),

        create: (data: Partial<NewExample>) =>
          E.gen(function* () {
            yield* E.log("Creating new example");
            yield* E.annotateCurrentSpan(
              "create.fields",
              Object.keys(data).join(","),
            );

            try {
              // Validate data
              if (data.content && typeof data.content !== "string") {
                yield* E.annotateCurrentSpan("validation.error", "true");
                return yield* E.fail(
                  new ValidationError({
                    message: `Invalid value for field 'content' in Example`,
                    field: "content",
                    value: data.content,
                  }),
                );
              }

              // Simulate creating data
              const newId = `example-${Date.now()}`;
              const newExample = {
                ...data,
                id: newId,
                createdAt: new Date(),
                updatedAt: new Date(),
              }; // Replace with actual creation logic

              yield* E.annotateCurrentSpan("example.id", newId);
              yield* E.annotateCurrentSpan("create.success", true);
              return newExample;
            } catch (error) {
              yield* E.annotateCurrentSpan("error", "true");
              yield* E.annotateCurrentSpan("error.type", "database_error");
              return yield* E.fail(
                new DatabaseError({
                  message: `Database error during create operation on Example`,
                  operation: "create",
                  entity: "Example",
                  cause: error,
                }),
              );
            }
          }).pipe(E.withSpan("ExampleService.create.implementation")),

        delete: (id: string) =>
          E.gen(function* () {
            yield* E.log(`Deleting example: ${id}`);
            yield* E.annotateCurrentSpan("example.id", id);

            try {
              // Simulate deletion
              const success = true; // Replace with actual deletion logic

              // Check if example exists
              if (!success) {
                yield* E.annotateCurrentSpan("delete.success", false);
                return yield* E.fail(
                  new NotFoundError({
                    message: `Example with ID ${id} not found`,
                    entity: "Example",
                    id,
                  }),
                );
              }

              yield* E.annotateCurrentSpan("delete.success", true);
              return { success: true, id };
            } catch (error) {
              yield* E.annotateCurrentSpan("error", "true");
              yield* E.annotateCurrentSpan("error.type", "database_error");
              return yield* E.fail(
                new DatabaseError({
                  message: `Database error during delete operation on Example`,
                  operation: "delete",
                  entity: "Example",
                  cause: error,
                }),
              );
            }
          }).pipe(E.withSpan("ExampleService.delete.implementation")),
      };
    }),
  },
) {}
