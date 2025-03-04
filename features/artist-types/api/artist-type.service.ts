import {
  ArtistType,
  NewArtistType,
  ArtistTypeType,
  NewArtistTypeType,
} from "../types/artist-type.type";
import { Effect as E, Schema as S } from "effect";
import { NotFoundError } from "@/features/global/lib/errors/base-errors";
import { Database } from "@/lib/db/db.service";

export class ArtistTypeService extends E.Service<ArtistTypeService>()(
  "ArtistTypeService",
  {
    accessors: true,
    dependencies: [Database.Default],

    effect: E.gen(function* () {
      const db = yield* Database;

      return {
        getAll: () =>
          E.gen(function* () {
            // Fetch all artist types
            const response = yield* db.findMany("artistType");

            // Validate all artist types
            const validatedArtistTypes = response.map((at) =>
              S.decodeSync(ArtistType)(at as any),
            );

            // Filter out artist types with deletedAt not null
            const activeArtistTypes = validatedArtistTypes.filter(
              (artistType) => artistType.deletedAt === null,
            );

            return activeArtistTypes;
          }).pipe(E.withSpan("ArtistTypeService.getAll.Default")),

        getById: (id: string) =>
          E.gen(function* () {
            // Only fetch non-deleted records where id matches
            const response = yield* db.findById("artistType", id);

            // Check if the record is deleted
            if (response && (response as any).deletedAt) {
              return E.fail(
                new NotFoundError({
                  message: `Artist Type with id ${id} has been deleted`,
                  entity: "artistType",
                  id,
                }),
              );
            }

            // Use as any to bypass TypeScript's type checking, since S.decodeSync will validate at runtime
            return S.decodeSync(ArtistType)(response as any);
          }).pipe(E.withSpan("ArtistTypeService.getById.Default")),

        update: (id: string, data: Partial<ArtistTypeType>) =>
          E.gen(function* () {
            // Update the artist type
            const updatedArtistType = yield* db.update("artistType", id, data);

            return updatedArtistType;
          }).pipe(E.withSpan("ArtistTypeService.update.Default")),

        create: (data: NewArtistTypeType) =>
          E.gen(function* () {
            // Create the artist type
            const newArtistType = yield* db.insert("artistType", data);

            return newArtistType;
          }).pipe(E.withSpan("ArtistTypeService.create.Default")),

        // Soft delete implementation
        delete: (id: string) =>
          E.gen(function* () {
            // Instead of deleting, update the deletedAt field to current timestamp
            yield* db.update("artistType", id, {
              deletedAt: new Date(),
            });

            return { success: true, id };
          }).pipe(E.withSpan("ArtistTypeService.delete.Default")),

        // Add undo delete method
        undoDelete: (id: string) =>
          E.gen(function* () {
            // Find the artist type first to check if it exists and is deleted
            const artistType = yield* db.findById("artistType", id);

            if (!artistType) {
              return E.fail(
                new NotFoundError({
                  message: `Artist Type with id ${id} not found`,
                  entity: "artistType",
                  id,
                }),
              );
            }

            // If the artist type isn't deleted, there's nothing to restore
            if (!(artistType as any).deletedAt) {
              return {
                success: false,
                id,
                message: "Artist Type is not deleted",
              };
            }

            // Restore the artist type by setting deletedAt to null
            const restoredArtistType = yield* db.update("artistType", id, {
              deletedAt: null,
            });

            return {
              success: true,
              id,
              message: "Artist Type restored successfully",
              artistType: restoredArtistType,
            };
          }).pipe(E.withSpan("ArtistTypeService.undoDelete.Default")),
      };
    }),
  },
) {}
