import { Schema as S } from "@effect/schema";

/**
 * Schema for an individual artist type
 */
export const ArtistTypeSchema = S.Struct({
  name: S.String,
  shortDescription: S.String,
  image: S.String,
});

/**
 * Schema for a collection of artist types
 */
export const ArtistTypeCollection = S.Array(ArtistTypeSchema);

/**
 * Type definitions derived from schemas
 */
export type ArtistType = typeof ArtistTypeSchema.Type;
export type ArtistTypeCollectionType = typeof ArtistTypeCollection.Type; 