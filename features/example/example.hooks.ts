import { Schema as S } from "@effect/schema";
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
import { NewExample, Example } from "./types/example.type";
import { 
  ExampleError, 
  ExampleCreateError, 
  ExampleUpdateError, 
  ExampleDeleteError,
  ExampleNotFoundError
} from "./errors";

// Define the query key creator with proper typing
const exampleQueryKey = createQueryKey("ExampleOperations.useExampleQuery");
const exampleQueryData =
  createQueryDataHelpers<(typeof Example)[]>(exampleQueryKey);

export const useGetAll = () => {
  return useEffectQuery({
    queryKey: exampleQueryKey(), // This creates the actual query key
    queryFn: () => ExampleService.getAll().pipe(
      // Add a span for tracing the getAll operation
      E.withSpan("ExampleService.getAll")
    ),
    staleTime: "5 minutes",
  });
};

export const useGetById = (id: string) => {
  return useEffectQuery({
    queryKey: exampleQueryKey(),
    queryFn: () => ExampleService.getById(id).pipe(
      // Add a span for tracing the getById operation
      E.withSpan("ExampleService.getById"),
      // Annotate the span with the example ID
      E.tap(() => E.annotateCurrentSpan("example.id", id)),
      // Handle specific error types if needed
      E.mapError(error => 
        // Use type assertion since we can't guarantee the error structure
        (error as any)?._tag === "NotFoundError" 
          ? new ExampleNotFoundError({
              message: `Example with ID ${id} not found`,
              id
            })
          : new ExampleError({ message: String(error) })
      )
    ),
    staleTime: "5 minutes",
  });
};

export const useUpdate = () => {
  return useEffectMutation({
    mutationKey: ["updateUser"],
    mutationFn: ({ id, data }: { id: string; data: Partial<NewExample> }) => {
      // Store the previous state for potential rollback
      const previousExamples = queryClient.getQueryData(exampleQueryKey());
      
      // Create a parent span for the entire update operation
      return E.gen(function* (_) {
        // Log the start of optimistic update
        yield* E.log("Starting optimistic update");
        
        // Perform optimistic update
        yield* E.sync(() => {
          exampleQueryData.setData(undefined, (draft) => {
            const exampleIndex = draft.findIndex(example => 
              // Access id safely with type checking
              'id' in example && example.id === id
            );
            if (exampleIndex !== -1) {
              // Update the example with the new data
              draft[exampleIndex] = { ...draft[exampleIndex], ...data };
            }
          });
        }).pipe(
          E.withSpan("optimistic.update"),
          E.tap(() => E.annotateCurrentSpan("example.id", id)),
          E.tap(() => E.annotateCurrentSpan("update.type", "optimistic"))
        );
        
        // Log the completion of optimistic update
        yield* E.log("Optimistic update completed, sending to server");
        
        // Execute the actual update operation
        const result = yield* ExampleService.update(id, data).pipe(
          E.withSpan("ExampleService.update"),
          E.tap(() => E.annotateCurrentSpan("example.id", id))
        );
        
        // On success, invalidate queries
        yield* E.sync(() => {
          queryClient.invalidateQueries({ queryKey: exampleQueryKey() });
        }).pipe(
          E.withSpan("cache.invalidate"),
          E.tap(() => E.log("Cache invalidated after successful update"))
        );
        
        return result;
      }).pipe(
        E.withSpan("example.update.operation"),
        E.mapError(error => {
          // Roll back to the previous state
          if (previousExamples) {
            queryClient.setQueryData(exampleQueryKey(), previousExamples);
          }
          
          // Log the error
          console.error('Error updating example:', error);
          
          // Map to appropriate error type
          return (error as any)?._tag === "NotFoundError"
            ? new ExampleNotFoundError({
                message: `Example with ID ${id} not found`,
                id
              })
            : new ExampleUpdateError({
                message: `Failed to update example with ID ${id}`,
                id,
                data,
                cause: error
              });
        })
      );
    },
  });
};

export const useCreate = () => {
  return useEffectMutation({
    mutationKey: ["createUser"],
    mutationFn: (input: NewExample) => {
      // Generate a temporary ID for the optimistic update
      const tempId = `temp-${Date.now()}`;
      
      // Create a temporary example with the input data
      const tempExample = {
        ...input,
        id: tempId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store the previous state for potential rollback
      const previousExamples = queryClient.getQueryData(exampleQueryKey());
      
      // Create a parent span for the entire create operation
      return E.gen(function* (_) {
        // Log the start of optimistic create
        yield* E.log("Starting optimistic create");
        
        // Perform optimistic update by adding the new example to the list
        if (previousExamples) {
          yield* E.sync(() => {
            exampleQueryData.setData(undefined, (draft) => {
              // Using type assertion to bypass type checking for the temporary object
              draft.push(tempExample as any);
            });
          }).pipe(
            E.withSpan("optimistic.create"),
            E.tap(() => E.annotateCurrentSpan("temp.id", tempId)),
            E.tap(() => E.annotateCurrentSpan("update.type", "optimistic"))
          );
        }
        
        // Log the completion of optimistic create
        yield* E.log("Optimistic create completed, sending to server");
        
        // Execute the actual create operation
        const createdExample = yield* ExampleService.create(input).pipe(
          E.withSpan("ExampleService.create")
        );
        
        // Replace the temporary example with the real one
        yield* E.sync(() => {
          exampleQueryData.setData(undefined, (draft) => {
            const tempIndex = draft.findIndex(example => 
              'id' in example && example.id === tempId
            );
            if (tempIndex !== -1) {
              // Replace the temporary example with the real one from the server
              draft[tempIndex] = createdExample as any;
            }
          });
          // Also invalidate queries to ensure cache is in sync with server
          queryClient.invalidateQueries({ queryKey: exampleQueryKey() });
        }).pipe(
          E.withSpan("cache.update"),
          E.tap(() => E.log("Cache updated with real example after successful create"))
        );
        
        return createdExample;
      }).pipe(
        E.withSpan("example.create.operation"),
        E.mapError(error => {
          // Roll back to the previous state
          if (previousExamples) {
            queryClient.setQueryData(exampleQueryKey(), previousExamples);
          }
          
          // Log the error
          console.error('Error creating example:', error);
          
          // Return a specific create error
          return new ExampleCreateError({
            message: `Failed to create example`,
            input,
            cause: error
          });
        })
      );
    },
  });
};

export const useDelete = () => {
  return useEffectMutation({
    mutationKey: ["deleteUser"],
    mutationFn: (id: string) => {
      // Store the previous state for potential rollback
      const previousExamples = queryClient.getQueryData(exampleQueryKey());
      
      // Create a parent span for the entire delete operation
      return E.gen(function* (_) {
        // Log the start of optimistic delete
        yield* E.log("Starting optimistic delete");
        
        // Perform optimistic update by removing the example from the list
        yield* E.sync(() => {
          exampleQueryData.setData(undefined, (draft) => {
            const exampleIndex = draft.findIndex(example => 
              'id' in example && example.id === id
            );
            if (exampleIndex !== -1) {
              draft.splice(exampleIndex, 1);
            }
          });
        }).pipe(
          E.withSpan("optimistic.delete"),
          E.tap(() => E.annotateCurrentSpan("example.id", id)),
          E.tap(() => E.annotateCurrentSpan("update.type", "optimistic"))
        );
        
        // Log the completion of optimistic delete
        yield* E.log("Optimistic delete completed, sending to server");
        
        // Execute the actual delete operation
        const result = yield* ExampleService.delete(id).pipe(
          E.withSpan("ExampleService.delete"),
          E.tap(() => E.annotateCurrentSpan("example.id", id))
        );
        
        // On success, invalidate queries
        yield* E.sync(() => {
          queryClient.invalidateQueries({ queryKey: exampleQueryKey() });
        }).pipe(
          E.withSpan("cache.invalidate"),
          E.tap(() => E.log("Cache invalidated after successful delete"))
        );
        
        return result;
      }).pipe(
        E.withSpan("example.delete.operation"),
        E.mapError(error => {
          // Roll back to the previous state
          if (previousExamples) {
            queryClient.setQueryData(exampleQueryKey(), previousExamples);
          }
          
          // Log the error
          console.error('Error deleting example:', error);
          
          // Map to appropriate error type
          return (error as any)?._tag === "NotFoundError"
            ? new ExampleNotFoundError({
                message: `Example with ID ${id} not found`,
                id
              })
            : new ExampleDeleteError({
                message: `Failed to delete example with ID ${id}`,
                id,
                cause: error
              });
        })
      );
    },
  });
};
