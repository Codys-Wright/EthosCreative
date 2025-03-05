import { Effect as E } from "effect";
import { ArtistTypeService } from "./artist-type.service";
import {
  createQueryDataHelpers,
  createQueryKey,
} from "@/features/global/lib/utils/query-data-helpers";
import {
  useEffectMutation,
  useEffectQuery,
  queryClient,
} from "@/features/global/lib/utils/tanstack-query";
import { NewArtistTypeType, ArtistTypeType } from "./../types/artist-type.type";
import { ArtistTypeError } from "./../errors/artist-type-errors";
import { NotFoundError } from "@/features/global/lib/errors/base-errors";
import { toast } from "sonner";
import { ExampleService } from "@/features/example/api/example.service";
import { ExampleType } from "@/features/example/types/example.type";

export namespace ArtistTypeHooks {
  // Define type for query key variables - only need id now
  type ArtistTypeVars = {
    id?: string;
  };

  // Create a typed query key creator that accepts variables
  export const artistTypeQueryKey = createQueryKey<
    "artistType",
    ArtistTypeVars
  >("artistType");

  // Create a single data helper for managing all example cache data
  export const artistTypeData = createQueryDataHelpers<
    ArtistTypeType[],
    ArtistTypeVars
  >(artistTypeQueryKey);

  export const useGetAll = () => {
    return useEffectQuery({
      queryKey: artistTypeQueryKey({}), // Empty variables for the collection
      queryFn: () =>
        ArtistTypeService.getAll().pipe(
          E.withSpan("ArtistTypeService.getAll"),
          E.catchAll((error) => {
            toast.error("Failed to load artist types", {
              description: String(
                error.message || "An unexpected error occurred",
              ),
              id: "get-all-artist-types-error",
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
      queryKey: artistTypeQueryKey({ id: id || "" }),
      queryFn: () =>
        ArtistTypeService.getById(id!).pipe(
          E.withSpan("ArtistTypeService.getById"),
          E.tap(() => E.annotateCurrentSpan("artistType.id", id!)),
          E.mapError((error) => {
            const mappedError =
              (error as any)?._tag === "NotFoundError"
                ? new NotFoundError({
                    message: `Artist type with ID ${id} not found`,
                    entity: "Artist type",
                    id: id!,
                  })
                : new ArtistTypeError({ message: String(error) });

            toast.error("Failed to load artist type", {
              description: mappedError.message,
              id: `get-artist-type-${id}-error`,
            });

            return mappedError;
          }),
        ),
      // Only enable the query when we have a valid ID
      enabled: !!id && id.trim() !== "",
      staleTime: "5 minutes", // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    });
  };

  export const useUpdate = () => {
    return useEffectMutation({
      mutationKey: ["updateArtistType"],
      mutationFn: ({
        id,
        data,
      }: {
        id: string;
        data: Partial<NewArtistTypeType>;
      }) => {
        // Apply optimistic updates directly
        const timestamp = new Date().getTime();

        // Optimistically update the individual item
        artistTypeData.setData({ id }, (draft) => {
          Object.assign(draft, {
            ...draft,
            ...data,
            __optimistic: true,
            __optimisticTimestamp: timestamp,
          });
        });

        // Update the item in the list cache
        artistTypeData.setData({}, (draft) => {
          const artistTypeList = draft as ArtistTypeType[];
          const artistTypeIndex = artistTypeList.findIndex(
            (artistType) => String(artistType.id) === String(id),
          );
          if (artistTypeIndex !== -1) {
            // Update with new data and mark as optimistic
            artistTypeList[artistTypeIndex] = {
              ...artistTypeList[artistTypeIndex],
              ...data,
            } as ArtistTypeType;
          }
        });

        // Make the actual API call
        return ArtistTypeService.update(id, data).pipe(
          E.tap((updatedArtistType) =>
            E.sync(() => {
              // Update the individual cache with server response
              if (updatedArtistType) {
                artistTypeData.setData({ id }, () => updatedArtistType);
              }

              // Update the list cache with server response
              artistTypeData.setData({}, (draft) => {
                const artistTypeList = draft as ArtistTypeType[];
                const artistTypeIndex = artistTypeList.findIndex(
                  (artistType) => String(artistType.id) === String(id),
                );
                if (artistTypeIndex !== -1 && updatedArtistType) {
                  artistTypeList[artistTypeIndex] =
                    updatedArtistType as ArtistTypeType;
                }
              });

              // Show success toast
              toast.success("Artist type updated", {
                description: "Your changes have been saved successfully",
                id: `update-artist-type-${id}-${timestamp}`,
              });

              // Invalidate just this query
              artistTypeData.invalidateQuery({ id });
            }),
          ),
          E.catchAll((error) => {
            // Show error toast
            toast.error("Failed to update artist type", {
              description: String(
                error.message || "An unexpected error occurred",
              ),
              id: `error-update-artist-type-${id}-${timestamp}`,
            });

            // Invalidate to refresh data
            artistTypeData.invalidateQuery({ id });

            return E.fail(error);
          }),
        );
      },
    });
  };

  export const useCreate = () => {
    return useEffectMutation({
      mutationKey: ["createArtistType"],
      mutationFn: (input: NewArtistTypeType) => {
        // Generate temporary ID and timestamps for optimistic update
        const tempId = `temp-${Date.now()}`;
        const timestamp = new Date();

        // Create optimistic example with temporary values
        const optimisticArtistType: ArtistTypeType = {
          ...input,
          id: tempId as any, // Cast to satisfy the type system
          createdAt: timestamp.toISOString(),
          updatedAt: timestamp.toISOString(),
          deletedAt: undefined,
        };

        // Update individual cache with optimistic data
        artistTypeData.setData({ id: tempId }, () => optimisticArtistType);

        // Update list cache with optimistic data
        artistTypeData.setData({}, (draft) => {
          const artistTypeList = draft as ArtistTypeType[];
          artistTypeList.push(optimisticArtistType as any);
        });

        // Make the actual API call
        return ArtistTypeService.create(input).pipe(
          E.tap((serverResponse) =>
            E.sync(() => {
              // Type guard to ensure the response has the expected structure
              if (
                serverResponse &&
                typeof serverResponse === "object" &&
                "id" in serverResponse
              ) {
                const newId = String(serverResponse.id);

                // Remove temporary item
                artistTypeData.setData({}, (draft) => {
                  const artistTypeList = draft as ArtistTypeType[];
                  const tempIndex = artistTypeList.findIndex(
                    (artistType) => String(artistType.id) === tempId,
                  );
                  if (tempIndex !== -1) {
                    artistTypeList.splice(tempIndex, 1);
                  }
                });

                // Remove temporary cache entry
                artistTypeData.removeQuery({ id: tempId });

                // Add real item to individual cache
                artistTypeData.setData({ id: newId }, () => serverResponse);

                // Add real item to list cache
                artistTypeData.setData({}, (draft) => {
                  const artistTypeList = draft as ArtistTypeType[];
                  artistTypeList.push(serverResponse as any);
                });

                // Invalidate queries to ensure any components using the data get the latest version
                artistTypeData.invalidateAllQueries();

                // Show success toast
                toast.success("Example created", {
                  description:
                    "Your new artist type has been created successfully",
                  id: `create-artist-type-${newId}-success`,
                });
              }
            }),
          ),
          E.catchAll((error) => {
            // On error, remove the optimistic update
            artistTypeData.setData({}, (draft) => {
              const artistTypeList = draft as ArtistTypeType[];
              const tempIndex = artistTypeList.findIndex(
                (artistType) => String(artistType.id) === tempId,
              );
              if (tempIndex !== -1) {
                artistTypeList.splice(tempIndex, 1);
              }
            });

            // Remove temporary cache entry
            artistTypeData.removeQuery({ id: tempId });

            // Show error toast
            toast.error("Failed to create example", {
              description: String(
                error.message || "An unexpected error occurred",
              ),
              id: `create-artist-type-error`,
            });

            return E.fail(error);
          }),
        );
      },
    });
  };

  export const useDelete = () => {
    // Create the undo mutation that will be used internally
    const undoDeleteMutation = useUndoDelete();

    return useEffectMutation({
      mutationKey: ["deleteExample"],
      mutationFn: (id: string) => {
        // Store the current example for potential undo
        // First get example from cache to store
        const currentArtistType = queryClient.getQueryData<ArtistTypeType>(
          artistTypeQueryKey({ id }),
        );

        // Optimistically remove from list
        artistTypeData.setData({}, (draft) => {
          const artistTypeList = draft as ArtistTypeType[];
          const index = artistTypeList.findIndex(
            (artistType) => String(artistType.id) === id,
          );
          if (index !== -1) {
            artistTypeList.splice(index, 1);
          }
        });

        // Optimistically remove individual item
        artistTypeData.removeQuery({ id });

        // Make the actual API call
        return ArtistTypeService.delete(id).pipe(
          E.tap((response) =>
            E.sync(() => {
              // Success! Nothing more to do, we already removed it optimistically
              // Invalidate queries to ensure any components using the data get the latest version
              artistTypeData.invalidateAllQueries();

              // Show success toast with undo button
              toast.success("Artist type deleted", {
                description: "This artist type has been deleted",
                action: {
                  label: "Undo",
                  onClick: () => {
                    // Use the undoDeleteMutation directly
                    undoDeleteMutation.mutate(id);
                  },
                },
                id: `delete-artist-type-${id}-success`,
              });
            }),
          ),
          E.catchAll((error) => {
            // On error, invalidate queries to refetch correct data
            artistTypeData.invalidateAllQueries();

            // Show error toast
            toast.error("Failed to delete artist type", {
              description: String(
                error.message || "An unexpected error occurred",
              ),
              id: `delete-artist-type-${id}-error`,
            });

            return E.fail(error);
          }),
        );
      },
    });
  };

  // Hook for undoing a delete (for use in components)
  export const useUndoDelete = () => {
    return useEffectMutation({
      mutationKey: ["undoDeleteExample"],
      mutationFn: (id: string) => {
        return ArtistTypeService.undoDelete(id).pipe(
          E.tap((response) =>
            E.sync(() => {
              artistTypeData.invalidateAllQueries();

              toast.success("Artist type restored", {
                description: "The artist type has been successfully restored",
                id: `restore-artist-type-${id}-success`,
              });
            }),
          ),
          E.catchAll((error) => {
            toast.error("Failed to restore artist type", {
              description: String(
                error.message || "An unexpected error occurred",
              ),
              id: `restore-artist-type-${id}-error`,
            });

            return E.fail(error);
          }),
        );
      },
    });
  };
}
