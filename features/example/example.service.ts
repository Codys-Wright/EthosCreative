import { Example, NewExample, ExampleId } from "./types/example.type";
import { Effect as E, Layer, Schema as S } from "effect";
import {
  NotFoundError,
  ValidationError,
  DatabaseError,
} from "@/features/global/lib/errors/base-errors";
import { Database } from "@/lib/db/db.service";
import { example } from "@/lib/db/schema";

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
            yield* E.log("Getting all examples");
            yield* E.annotateCurrentSpan("examples.count", "fetching");

            const examples = yield* db.findMany("example");

            yield* E.annotateCurrentSpan("examples.count", examples.length);
            return examples;
          }).pipe(E.withSpan("ExampleService.getAll.implementation")),

        getById: (id: string) =>
          E.gen(function* () {
            yield* E.log(`Getting example with id ${id}`);
            yield* E.annotateCurrentSpan("example.id", id);

            const example = yield* db.findById("example", id);

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
          }).pipe(E.withSpan("ExampleService.getById.implementation")),

        update: (id: string, data: Partial<Example>) =>
          E.gen(function* () {
            yield* E.log(`Updating example: ${id}`);
            yield* E.annotateCurrentSpan("example.id", id);
            yield* E.annotateCurrentSpan(
              "update.fields",
              Object.keys(data).join(","),
            );

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

            // Prepare update data
            const updateData: Record<string, any> = {};
            if (data.content) {
              updateData.content = data.content;
            }
            updateData.updatedAt = new Date();

            // Update the example
            const updatedExample = yield* db.update("example", id, updateData);

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
          }).pipe(E.withSpan("ExampleService.update.implementation")),

        create: (data: Partial<NewExample>) =>
          E.gen(function* () {
            yield* E.log("Creating new example");
            yield* E.annotateCurrentSpan(
              "create.fields",
              Object.keys(data).join(","),
            );

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

            // Create the example
            const newExample = yield* db.insert("example", {
              id: `example-${Date.now()}`,
              content: data.content,
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            yield* E.annotateCurrentSpan("example.id", (newExample as any).id);
            yield* E.annotateCurrentSpan("create.success", true);
            return newExample;
          }).pipe(E.withSpan("ExampleService.create.implementation")),

        delete: (id: string) =>
          E.gen(function* () {
            yield* E.log(`Deleting example: ${id}`);
            yield* E.annotateCurrentSpan("example.id", id);

            // Delete the example
            yield* db.delete("example", id);
            
            yield* E.annotateCurrentSpan("delete.success", true);
            return { success: true, id };
          }).pipe(E.withSpan("ExampleService.delete.implementation")),

        // Example of using a custom query
        getByContent: (content: string) =>
          E.gen(function* () {
            yield* E.log(`Getting examples with content containing: ${content}`);
            yield* E.annotateCurrentSpan("search.term", content);

            const examples = yield* db.execute<any[]>(
              (dbInstance) => 
                dbInstance.query.example.findMany({
                  where: (exampleTable: any, { like }: any) => like(exampleTable.content, `%${content}%`)
                }),
              { 
                operation: "search", 
                entity: "Example" 
              }
            );

            yield* E.annotateCurrentSpan("examples.count", examples.length);
            return examples;
          }).pipe(E.withSpan("ExampleService.getByContent.implementation")),
      };
    }),
  },
) {}
