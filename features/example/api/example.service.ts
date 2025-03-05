import {
  Example,
  NewExample,
  ExampleType,
  NewExampleType,
} from "../types/example.type";
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
        getAll: () =>
          E.gen(function* () {
            // Fetch all examples
            const response = yield* db.findMany("example");

            // Validate all examples
            const validatedExamples = response.map((ex) =>
              S.decodeSync(Example)(ex as any),
            );

            // Filter out examples with deletedAt not null
            const activeExamples = validatedExamples.filter(
              (example) => example.deletedAt === null,
            );

            return activeExamples;
          }).pipe(E.withSpan("ExampleService.getAll.Default")),

        getById: (id: string) =>
          E.gen(function* () {
            // Only fetch non-deleted records where id matches
            const response = yield* db.findById("example", id);

            // Check if the record is deleted
            if (response && (response as any).deletedAt) {
              return E.fail(
                new NotFoundError({
                  message: `Example with id ${id} has been deleted`,
                  entity: "example",
                  id,
                }),
              );
            }

            // Use as any to bypass TypeScript's type checking, since S.decodeSync will validate at runtime
            return S.decodeSync(Example)(response as any);
          }).pipe(E.withSpan("ExampleService.getById.Default")),

        update: (id: string, data: Partial<ExampleType>) =>
          E.gen(function* () {
            // Prepare update data

            // Update the example
            const updatedExample = yield* db.update("example", id, data);

            return updatedExample;
          }).pipe(E.withSpan("ExampleService.update.Default")),

        create: (data: NewExampleType) =>
          E.gen(function* () {
            // Create the example
            const newExample = yield* db.insert("example", data);

            return newExample;
          }).pipe(E.withSpan("ExampleService.create.Default")),

        // Soft delete implementation
        delete: (id: string) =>
          E.gen(function* () {
            // Instead of deleting, update the deletedAt field to current timestamp
            yield* db.update("example", id, {
              deletedAt: new Date(),
            });

            return { success: true, id };
          }).pipe(E.withSpan("ExampleService.delete.Default")),

        // Add undo delete method
        undoDelete: (id: string) =>
          E.gen(function* () {
            // Find the example first to check if it exists and is deleted
            const example = yield* db.findById("example", id);

            if (!example) {
              return E.fail(
                new NotFoundError({
                  message: `Example with id ${id} not found`,
                  entity: "example",
                  id,
                }),
              );
            }

            // If the example isn't deleted, there's nothing to restore
            if (!(example as any).deletedAt) {
              return { success: false, id, message: "Example is not deleted" };
            }

            // Restore the example by setting deletedAt to null
            const restoredExample = yield* db.update("example", id, {
              deletedAt: null,
            });

            return {
              success: true,
              id,
              message: "Example restored successfully",
              example: restoredExample,
            };
          }).pipe(E.withSpan("ExampleService.undoDelete.Default")),

        // Add a method for permanent deletion if needed
        permanentDeath: (id: string) =>
          E.gen(function* () {
            // Actually delete the record from the database
            yield* db.delete("example", id);

            return { success: true, id };
          }).pipe(E.withSpan("ExampleService.permanentDeath.Default")),
      };
    }),
  },
) {}
