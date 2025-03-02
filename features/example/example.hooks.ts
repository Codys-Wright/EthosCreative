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
import { NewExample, Example,  } from "./types/example.type";
import { ExampleError } from "./errors";
import {
  NotFoundError,
  DatabaseError,
  ValidationError,
  UnexpectedError,
} from "@/features/global/lib/errors/base-errors";
import { toast } from "sonner";

export namespace ExampleOperations {
  // Define type for query key variables - only need id now
  type ExampleVars = {
    id?: string;
  };

  // Create a typed query key creator that accepts variables
  export const exampleQueryKey = createQueryKey<"example", ExampleVars>("example");
  
  // Create a single data helper for managing all example cache data
  export const exampleData = createQueryDataHelpers< Example [], ExampleVars>(exampleQueryKey);

  

  export const useGetAll = () => {
    return useEffectQuery({
      queryKey: exampleQueryKey({}), // Empty variables for the collection
      queryFn: () => 
        ExampleService.getAll().pipe(
          E.withSpan("ExampleService.getAll"),
          E.catchAll((error) => {
            toast.error("Failed to load examples", {
              description: String(error.message || "An unexpected error occurred"),
              id: "get-all-examples-error",
            });
            return E.fail(error);
          }),
        ),
      staleTime: "5 minutes", // 5 minutes
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
          E.mapError((error) => {
            const mappedError = (error as any)?._tag === "NotFoundError"
              ? new NotFoundError({
                  message: `Example with ID ${id} not found`,
                  entity: "Example",
                  id: id!,
                })
              : new ExampleError({ message: String(error) });
            
            toast.error("Failed to load example", {
              description: mappedError.message,
              id: `get-example-${id}-error`,
            });
            
            return mappedError;
          }),
        ),
      // Only enable the query when we have a valid ID
      enabled: !!id && id.trim() !== '',
      staleTime: "5 minutes", // 5 minutes
      refetchOnWindowFocus: true, 
      refetchOnMount: true,
    });
  };

  export const useUpdate = () => {
    return useEffectMutation({
      mutationKey: ["updateExample"],
      mutationFn: ({ id, data }: { id: string; data: Partial<NewExample> }) => {
        // Apply optimistic updates directly
        const timestamp = new Date().getTime();
        
        // Optimistically update the individual item
        exampleData.setData({ id }, (draft) => {
          Object.assign(draft, {
            ...draft,
            ...data,
            __optimistic: true,
            __optimisticTimestamp: timestamp,
          });
        });
        
        // Update the item in the list cache
        exampleData.setData({}, (draft) => {
          const exampleList = draft as (Example)[];
          const exampleIndex = exampleList.findIndex(example => String(example.id) === String(id));
          if (exampleIndex !== -1) {
            // Update with new data and mark as optimistic
            exampleList[exampleIndex] = {
              ...exampleList[exampleIndex],
              ...data,
            } as Example;
          }
        });
        
        // Make the actual API call
        return ExampleService.update(id, data).pipe(
          E.tap((updatedExample) => E.sync(() => {
            // Update the individual cache with server response
            if (updatedExample) {
              exampleData.setData({ id }, () => updatedExample);
            }
            
            // Update the list cache with server response
            exampleData.setData({}, (draft) => {
              const exampleList = draft as (Example)[];
              const exampleIndex = exampleList.findIndex(example => String(example.id) === String(id));
              if (exampleIndex !== -1 && updatedExample) {
                exampleList[exampleIndex] = updatedExample as Example;
              }
            });
            
            // Show success toast
            toast.success("Example updated", {
              description: "Your changes have been saved successfully",
              id: `update-example-${id}-${timestamp}`,
            });
            
            // Invalidate just this query
            exampleData.invalidateQuery({ id });
          })),
          E.catchAll((error) => {
            // Show error toast
            toast.error("Failed to update example", {
              description: String(error.message || "An unexpected error occurred"),
              id: `error-update-example-${id}-${timestamp}`,
            });
            
            // Invalidate to refresh data
            exampleData.invalidateQuery({ id });
            
            return E.fail(error);
          })
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
          deletedAt: null,
        
        };
        
        // Update individual cache with optimistic data
        exampleData.setData({ id: tempId }, () => optimisticExample);
        
        // Update list cache with optimistic data
        exampleData.setData({}, (draft) => {
          const exampleList = draft as (Example)[];
          exampleList.push(optimisticExample as any);
        });
        
        // Make the actual API call
        return ExampleService.create(input).pipe(
          E.tap((serverResponse) => E.sync(() => {
            // Type guard to ensure the response has the expected structure
            if (serverResponse && typeof serverResponse === 'object' && 'id' in serverResponse) {
              const newId = String(serverResponse.id);
              
              // Remove temporary item
              exampleData.setData({}, (draft) => {
                const exampleList = draft as (Example)[];
                const tempIndex = exampleList.findIndex(ex => String(ex.id) === tempId);
                if (tempIndex !== -1) {
                  exampleList.splice(tempIndex, 1);
                }
              });
              
              // Remove temporary cache entry
              exampleData.removeQuery({ id: tempId });
              
              // Add real item to individual cache
              exampleData.setData({ id: newId }, () => serverResponse);
              
              // Add real item to list cache
              exampleData.setData({}, (draft) => {
                const exampleList = draft as (Example)[];
                exampleList.push(serverResponse as any);
              });
              
              // Invalidate queries to ensure any components using the data get the latest version
              exampleData.invalidateAllQueries();
              
              // Show success toast
              toast.success("Example created", {
                description: "Your new example has been created successfully",
                id: `create-example-${newId}-success`,
              });
            }
          })),
          E.catchAll((error) => {
            // On error, remove the optimistic update
            exampleData.setData({}, (draft) => {
              const exampleList = draft as (Example)[];
              const tempIndex = exampleList.findIndex(ex => String(ex.id) === tempId);
              if (tempIndex !== -1) {
                exampleList.splice(tempIndex, 1);
              }
            });
            
            // Remove temporary cache entry
            exampleData.removeQuery({ id: tempId });
            
            // Show error toast
            toast.error("Failed to create example", {
              description: String(error.message || "An unexpected error occurred"),
              id: `create-example-error`,
            });
            
            return E.fail(error);
          })
        );
      }
    });
  };

  export const useDelete = () => {
    return useEffectMutation({
      mutationKey: ["deleteExample"],
      mutationFn: (id: string) => {
        // Store the current example for potential undo
        // First get example from cache to store
        const currentExample = queryClient.getQueryData<Example>(exampleQueryKey({ id }));
        
       
        
        // Optimistically remove from list
        exampleData.setData({}, (draft) => {
          const exampleList = draft as (Example)[];
          const index = exampleList.findIndex(example => String(example.id) === id);
          if (index !== -1) {
            exampleList.splice(index, 1);
          }
        });
        
        // Optimistically remove individual item
        exampleData.removeQuery({ id });
        
        // Make the actual API call
        return ExampleService.delete(id).pipe(
          E.tap((response) => E.sync(() => {
            // Success! Nothing more to do, we already removed it optimistically
            // Invalidate queries to ensure any components using the data get the latest version
            exampleData.invalidateAllQueries();
            
            // Show success toast with undo button
            toast.success("Example deleted", {
              description: "This example has been deleted",
              action: {
                label: "Undo",
                onClick: () => {
                  // Call undoDelete if we have the example
                 console.log("Undo delete");
                //  TODO: Implement undo delete
                },
              },
              id: `delete-example-${id}-success`,
            });
          })),
          E.catchAll((error) => {
            // On error, invalidate queries to refetch correct data
            exampleData.invalidateAllQueries();
            
            // Show error toast
            toast.error("Failed to delete example", {
              description: String(error.message || "An unexpected error occurred"),
              id: `delete-example-${id}-error`,
            });
            
            return E.fail(error);
          })
        );
      }
    });
  };
  
  // Utility function for undoing a delete
  const handleUndoDelete = (example: Example) => {
    // Add back to the list cache
    exampleData.setData({}, (draft) => {
      const exampleList = draft as (Example)[];
      exampleList.push(example);
    });
    
    // Add back to individual cache
    exampleData.setData({ id: example.id }, () => example);
    
    // Show success toast
    toast.success("Delete undone", {
      description: "The example has been restored",
      id: `undo-delete-example-${example.id}-success`,
    });
  };
  
  // Function to undo a delete - can be called from outside
  export const undoDelete = (id: string) => {
    console.log("Undo delete");
    //  TODO: Implement undo delete
    return true;
    }
   
  };
  
