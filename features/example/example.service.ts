import { Example, NewExample } from "./types/example.type";
import { Effect as E, Layer } from "effect";
import { 
  ExampleError, 
  ExampleNotFoundError,
  ExampleCreateError,
  ExampleUpdateError,
  ExampleDeleteError
} from "./errors";
import { NotFoundError, UnexpectedError } from "@/features/global/lib/errors/base-errors";

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
            // Simulate fetching data
            const examples: Example[] = []; // Replace with actual data fetching
            yield* E.annotateCurrentSpan("examples.count", examples.length);
            return examples;
          }).pipe(
            E.withSpan("ExampleService.getAll.implementation")
          ),
          
        getById: (id: string) =>
          E.gen(function* () {
            yield* E.log(`Getting example with id ${id}`);
            yield* E.annotateCurrentSpan("example.id", id);
            
            try {
              // Simulate fetching data
              const example = {}; // Replace with actual data fetching
              
              // Check if example exists
              if (!example) {
                yield* E.annotateCurrentSpan("example.found", false);
                return yield* E.fail(new ExampleNotFoundError({
                  message: `Example with ID ${id} not found`,
                  id
                }));
              }
              
              yield* E.annotateCurrentSpan("example.found", true);
              return example;
            } catch (error) {
              yield* E.annotateCurrentSpan("error", "true");
              yield* E.annotateCurrentSpan("error.type", "unexpected");
              return yield* E.fail(new UnexpectedError({
                message: `Unexpected error fetching example with ID ${id}`,
                cause: error
              }));
            }
          }).pipe(
            E.withSpan("ExampleService.getById.implementation")
          ),
          
        update: (id: string, data: Partial<Example>) =>
          E.gen(function* () {
            yield* E.log(`Updating example: ${id}`);
            yield* E.annotateCurrentSpan("example.id", id);
            yield* E.annotateCurrentSpan("update.fields", Object.keys(data).join(","));
            
            try {
              // Simulate updating data
              const updatedExample = { ...data, id }; // Replace with actual update logic
              
              // Check if example exists
              if (!updatedExample) {
                yield* E.annotateCurrentSpan("update.success", false);
                return yield* E.fail(new ExampleNotFoundError({
                  message: `Example with ID ${id} not found`,
                  id
                }));
              }
              
              yield* E.annotateCurrentSpan("update.success", true);
              return updatedExample;
            } catch (error) {
              yield* E.annotateCurrentSpan("error", "true");
              yield* E.annotateCurrentSpan("error.type", "update_failed");
              return yield* E.fail(new ExampleUpdateError({
                message: `Failed to update example with ID ${id}`,
                id,
                data,
                cause: error
              }));
            }
          }).pipe(
            E.withSpan("ExampleService.update.implementation")
          ),
          
        create: (data: Partial<NewExample>) =>
          E.gen(function* () {
            yield* E.log("Creating new example");
            yield* E.annotateCurrentSpan("create.fields", Object.keys(data).join(","));
            
            try {
              // Simulate creating data
              const newId = `example-${Date.now()}`;
              const newExample = { 
                ...data, 
                id: newId,
                createdAt: new Date(),
                updatedAt: new Date()
              }; // Replace with actual creation logic
              
              yield* E.annotateCurrentSpan("example.id", newId);
              yield* E.annotateCurrentSpan("create.success", true);
              return newExample;
            } catch (error) {
              yield* E.annotateCurrentSpan("error", "true");
              yield* E.annotateCurrentSpan("error.type", "create_failed");
              return yield* E.fail(new ExampleCreateError({
                message: `Failed to create example`,
                input: data,
                cause: error
              }));
            }
          }).pipe(
            E.withSpan("ExampleService.create.implementation")
          ),
          
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
                return yield* E.fail(new ExampleNotFoundError({
                  message: `Example with ID ${id} not found`,
                  id
                }));
              }
              
              yield* E.annotateCurrentSpan("delete.success", true);
              return { success: true, id };
            } catch (error) {
              yield* E.annotateCurrentSpan("error", "true");
              yield* E.annotateCurrentSpan("error.type", "delete_failed");
              return yield* E.fail(new ExampleDeleteError({
                message: `Failed to delete example with ID ${id}`,
                id,
                cause: error
              }));
            }
          }).pipe(
            E.withSpan("ExampleService.delete.implementation")
          ),
      };
    }),
  },
) {
  //
}
