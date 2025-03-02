import { TabDefinition } from "@/components/crud/data-editor-dialog";
import { Schema as S } from "effect";

// 1. Define a branded type for the ID (for type safety)
export const ArtistTypeId = S.String.pipe(S.brand("ArtistTypeId"));

// Define Blog schema as a structured object
export const BlogSchema = S.Struct({
  title: S.NullOr(S.String),
  content: S.NullOr(S.String),
  author: S.NullOr(S.String),
  publishDate: S.NullOr(S.DateFromSelf),
  tags: S.NullOr(S.Array(S.String))
});

// 2. Define the full entity schema with all fields
export const ArtistType = S.Struct({
  id: ArtistTypeId,
  title: S.String,
  subtitle: S.NullOr(S.String),
  elevatorPitch: S.NullOr(S.String),
  description: S.NullOr(S.String),
  blog: S.NullOr(BlogSchema),
  tags: S.NullOr(S.Array(S.String)),
  icon: S.NullOr(S.String),
  metadata: S.NullOr(S.Unknown),
  notes: S.NullOr(S.String),
  version: S.NullOr(S.Number),
  createdAt: S.DateFromSelf,
  updatedAt: S.DateFromSelf,
  deletedAt: S.NullOr(S.DateFromSelf),
});

// 3. Define schema for creating new entities (without auto-generated fields)
export const NewArtistType = S.Struct({
  title: S.String,
  subtitle: S.NullOr(S.String),
  elevatorPitch: S.NullOr(S.String),
  description: S.NullOr(S.String),
  blog: S.NullOr(BlogSchema),
  tags: S.NullOr(S.Array(S.String)),
  icon: S.NullOr(S.String),
  metadata: S.NullOr(S.Unknown),
  notes: S.NullOr(S.String),
  version: S.NullOr(S.Number),
});

// 4. Export typescript types for normal usage
export type ArtistTypeType = typeof ArtistType.Type;
export type NewArtistTypeType = typeof NewArtistType.Type;
export type BlogType = typeof BlogSchema.Type;

// 5. Define tab groups for form organization
export const ArtistTypeGroups: TabDefinition<ArtistTypeType>[] = [
  {
    id: "basic",
    label: "Basic Info",
    fields: ["title", "subtitle", "elevatorPitch"]
  },
  {
    id: "content",
    label: "Content",
    fields: ["description", "blog"]
  },
  {
    id: "attributes",
    label: "Attributes",
    fields: ["tags", "icon"]
  },
  {
    id: "additional",
    label: "Additional",
    fields: ["metadata", "notes", "version"]
  },
  {
    id: "system",
    label: "System",
    fields: ["id", "createdAt", "updatedAt", "deletedAt"]
  }
];
