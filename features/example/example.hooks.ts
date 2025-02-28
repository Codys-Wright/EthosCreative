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
  
  // Create a single query data helper for managing cache data
  const exampleData = createQueryDataHelpers<Example[], ExampleVars>(exampleQueryKey);

 

  export const useGetAll = () => {
    return useEffectQuery({
      queryKey: exampleQueryKey({}), // Empty variables for the collection
      queryFn: () => 
        ExampleService.getAll().pipe(
          E.withSpan("ExampleService.getAll"),
        ),
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnMount: true,
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
        ),
      // Only enable the query when we have a valid ID
      enabled: !!id && id.trim() !== '',
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true, 
      refetchOnMount: true,
    });
  };

  export const useUpdate = () => {
    return useEffectMutation({
      mutationKey: ["updateExample"],
      mutationFn: ({ id, data }: { id: string; data: Partial<NewExample> }) => {
        // Make the actual API call
        return ExampleService.update(id, data).pipe(
          E.tap(() => E.sync(() => {
            // Invalidate the specific example query
            queryClient.invalidateQueries({ queryKey: exampleQueryKey({ id }) });
            // Invalidate the list query
            queryClient.invalidateQueries({ queryKey: exampleQueryKey({}) });
          }))
        )
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
        
        // Update individual cache with optimistic data
        queryClient.setQueryData(exampleQueryKey({ id: tempId }), optimisticExample);
        
        // Update list cache with optimistic data
        exampleData.setData({}, (draft) => {
          draft.push(optimisticExample as any);
        });
        
        // Make the actual API call
        return ExampleService.create(input).pipe(
          E.tap((serverResponse) => E.sync(() => {
            // Type guard to ensure the response has the expected structure
            if (serverResponse && typeof serverResponse === 'object' && 'id' in serverResponse) {
              const newId = String(serverResponse.id);
              
              // Remove temporary item
              exampleData.setData({}, (draft) => {
                const tempIndex = draft.findIndex(ex => String(ex.id) === tempId);
                if (tempIndex !== -1) {
                  draft.splice(tempIndex, 1);
                }
              });
              
              // Remove temporary cache entry
              queryClient.removeQueries({ queryKey: exampleQueryKey({ id: tempId }) });
              
              // Add real item to individual cache
              queryClient.setQueryData(exampleQueryKey({ id: newId }), serverResponse);
              
              // Add real item to list cache
              exampleData.setData({}, (draft) => {
                draft.push(serverResponse as any);
              });
              
              // Invalidate queries to ensure any components using the data get the latest version
              queryClient.invalidateQueries({ queryKey: exampleQueryKey({}) });
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
        // Backup the data in case we need to revert
        const currentExample = queryClient.getQueryData<Example>(exampleQueryKey({ id }));
        const currentList = queryClient.getQueryData<Example[]>(exampleQueryKey({}));
        
        // Optimistically remove from list
        exampleData.setData({}, (draft) => {
          const index = draft.findIndex(example => String(example.id) === id);
          if (index !== -1) {
            draft.splice(index, 1);
          }
        });
        
        // Optimistically remove individual item
        queryClient.removeQueries({ queryKey: exampleQueryKey({ id }) });
        
        // Make the actual API call
        return ExampleService.delete(id).pipe(
          E.tap((response) => E.sync(() => {
            // Success! Nothing more to do, we already removed it optimistically
            // Invalidate queries to ensure any components using the data get the latest version
            queryClient.invalidateQueries({ queryKey: exampleQueryKey({}) });
          })),
          E.catchAll((error) => {
            // On error, restore the data
            if (currentExample) {
              queryClient.setQueryData(exampleQueryKey({ id }), currentExample);
            }
            
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
