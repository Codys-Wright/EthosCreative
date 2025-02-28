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
import { ExampleError } from "./errors";
import {
  NotFoundError,
  DatabaseError,
  ValidationError,
  UnexpectedError,
} from "@/features/global/lib/errors/base-errors";

export namespace ExampleOperations {
  // Define type for query key variables - only need id now
  type ExampleVars = {
    id?: string;
  };

  // Create a typed query key creator that accepts variables
  export const exampleQueryKey = createQueryKey<"example", ExampleVars>("example");
  
  // Create a single query data helper for managing cache data - we'll use the list approach
  const exampleData = createQueryDataHelpers<Example[], ExampleVars>(exampleQueryKey);

  export const useGetAll = () => {
    return useEffectQuery({
      queryKey: exampleQueryKey({}), // Empty variables for the collection
      queryFn: () => 
        ExampleService.getAll().pipe(
          E.withSpan("ExampleService.getAll")
        ),
      staleTime: "5 minutes",
    });
  };

  export const useGetById = (id: string | undefined) => {
    return useEffectQuery({
      queryKey: exampleQueryKey({ id: id || '' }),
      queryFn: () =>
        ExampleService.getById(id!).pipe(
          E.withSpan("ExampleService.getById"),
          E.tap(() => E.annotateCurrentSpan("example.id", id!)),
          E.mapError((error) =>
            (error as any)?._tag === "NotFoundError"
              ? new NotFoundError({
                  message: `Example with ID ${id} not found`,
                  entity: "Example",
                  id: id!,
                })
              : new ExampleError({ message: String(error) }),
          ),
          // After successfully fetching, update the list cache if it exists
          E.tap((example) => E.sync(() => {
            // Get the current list from cache (if it exists)
            const currentList = queryClient.getQueryData<Example[]>(exampleQueryKey({}));
            
            // If we have a list, update the example in it
            if (currentList) {
              const updatedList = currentList.map(item => 
                String(item.id) === id ? example : item
              );
              
              // Update the list cache
              queryClient.setQueryData(exampleQueryKey({}), updatedList);
            }
          }))
        ),
      // We can also try to get the example from the list cache first
      select: (data) => data,
      // Only enable the query when we have a valid ID
      enabled: !!id && id.trim() !== '',
      staleTime: "5 minutes",
    });
  };

  export const useUpdate = () => {
    return useEffectMutation({
      mutationKey: ["updateExample"],
      mutationFn: ({ id, data }: { id: string; data: Partial<NewExample> }) => {
        // Immediately perform optimistic update to the list
        const timestamp = new Date();
        
        // Update list cache optimistically
        exampleData.setData({}, (draft) => {
          const index = draft.findIndex(example => String(example.id) === id);
          if (index !== -1) {
            draft[index] = {
              ...draft[index],
              ...data,
              updatedAt: timestamp
            };
          }
        });
        
        // Make the actual API call
        return ExampleService.update(id, data).pipe(
          E.tap((serverResponse) => E.sync(() => {
            // Update with real server data
            if (serverResponse) {
              // Update the list cache with the server response
              exampleData.setData({}, (draft) => {
                const index = draft.findIndex(example => String(example.id) === id);
                if (index !== -1) {
                  draft[index] = serverResponse as any;
                }
              });
            }
          }))
        );
      }
    });
  };

  export const useCreate = () => {
    return useEffectMutation({
      mutationKey: ["createExample"],
      mutationFn: (input: NewExample) => {
        // Generate temporary ID and timestamps for optimistic update
        const tempId = `temp-${Date.now()}`;
        const timestamp = new Date();
        
        // Create optimistic example with temporary values
        const optimisticExample: Example = {
          ...input,
          id: tempId as any, // Cast to satisfy the type system
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null
        };
        
        // Update list cache with optimistic data
        exampleData.setData({}, (draft) => {
          draft.push(optimisticExample as any);
        });
        
        // Make the actual API call
        return ExampleService.create(input).pipe(
          E.tap((serverResponse) => E.sync(() => {
            // Type guard to ensure the response has the expected structure
            if (serverResponse && typeof serverResponse === 'object' && 'id' in serverResponse) {
              // Update the list cache - replace the temporary item with the real one
              exampleData.setData({}, (draft) => {
                const tempIndex = draft.findIndex(ex => String(ex.id) === tempId);
                if (tempIndex !== -1) {
                  // Replace the temp item with the server response
                  draft[tempIndex] = serverResponse as any;
                } else {
                  // If for some reason the temp item isn't there, add the new one
                  draft.push(serverResponse as any);
                }
              });
            }
          }))
        );
      }
    });
  };

  export const useDelete = () => {
    return useEffectMutation({
      mutationKey: ["deleteExample"],
      mutationFn: (id: string) => {
        // Backup the list data in case we need to revert
        const currentList = queryClient.getQueryData<Example[]>(exampleQueryKey({}));
        
        // Optimistically remove from list
        exampleData.setData({}, (draft) => {
          const index = draft.findIndex(example => String(example.id) === id);
          if (index !== -1) {
            draft.splice(index, 1);
          }
        });
        
        // Make the actual API call
        return ExampleService.delete(id).pipe(
          E.tap(() => E.sync(() => {
            // Success! Nothing more to do, we already removed it optimistically
          })),
          E.catchAll((error) => {
            // On error, restore the list data
            if (currentList) {
              queryClient.setQueryData(exampleQueryKey({}), currentList);
            }
            
            return E.fail(error);
          })
        );
      }
    });
  };
}
