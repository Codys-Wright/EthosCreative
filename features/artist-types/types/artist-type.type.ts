import { Schema as S } from "effect";
import { Id, CreatedAt, UpdatedAt } from "@/app/test/schemas/presets";
import { TextField, TextareaField } from "@/app/test/schemas/text";
import { NumberField } from "@/app/test/schemas/number";
import { DateField } from "@/app/test/schemas/date";
import { NullableStringField } from "@/app/test/schemas/special";
import {
  TabGroupsConfigId,
  FieldTypeId,
  LabelId,
  IsRequiredId,
  IsUpdateOnlyId,
  DescriptionId,
} from "@/app/test/schemas/types";

// 1. Define a branded type for the ID
export const ArtistTypeId = Id.pipe(S.brand("ArtistTypeId"));

// 2. Define Blog schema as a structured object
export const BlogSchema = S.Struct({
  title: S.optional(
    S.NullOr(
      TextField({
        label: "Blog Title",
        description: "Title of the blog post",
      }),
    ),
  ),
  content: S.optional(
    S.NullOr(
      TextareaField({
        label: "Blog Content",
        description: "Main content of the blog post",
      }),
    ),
  ),
  author: S.optional(
    S.NullOr(
      TextField({
        label: "Author",
        description: "Author of the blog post",
      }),
    ),
  ),
  publishDate: S.optional(
    S.NullOr(
      DateField({
        label: "Publish Date",
        description: "Date when the blog post was published",
      }),
    ),
  ),
  tags: S.optional(
    S.NullOr(
      TextField({
        label: "Blog Tags",
        description: "Tags for the blog post",
        uiType: "tags",
      }),
    ),
  ),
});

// 3. Define tab groups configuration
export const ArtistTypeGroups = {
  basic: ["title", "subtitle", "elevatorPitch", "order"],
  content: ["description", "blog"],
  attributes: ["imageUrl", "tags", "icon"],
  additional: ["metadata", "notes", "version"],
  system: ["id", "createdAt", "updatedAt", "deletedAt"],
};

// Clone the config without the system group for new items
const newItemTabGroups = {
  basic: [...ArtistTypeGroups.basic],
  content: [...ArtistTypeGroups.content],
  attributes: [...ArtistTypeGroups.attributes],
  additional: [...ArtistTypeGroups.additional],
  // system group intentionally omitted
};

// 4. Define the full ArtistType schema with all fields
export const ArtistType = S.Struct({
  // Primary Key (system field)
  id: ArtistTypeId,

  // Basic fields
  title: S.NullOr(
    TextField({
      label: "Title",
      isRequired: true,
      description: "Name of the artist type",
      minLength: 1,
    }),
  ),

  subtitle: S.optional(
    S.NullOr(
      TextField({
        label: "Subtitle",
        description: "Secondary title or tagline",
      }),
    ),
  ),

  elevatorPitch: S.optional(
    S.NullOr(
      TextareaField({
        label: "Elevator Pitch",
        description: "Brief summary of the artist type",
      }),
    ),
  ),

  // Add order field to basic fields
  order: S.optional(
    S.NullOr(
      NumberField({
        label: "Order",
        description: "Numerical order for sorting (lower numbers appear first)",
        min: 0,
        uiType: "number",
      }),
    ),
  ),

  // Content fields
  description: S.optional(
    S.NullOr(
      TextareaField({
        label: "Description",
        description: "Detailed description of the artist type",
      }),
    ),
  ),

  // Add blog field that contains a structured blog object
  blog: S.optional(
    S.NullOr(
      BlogSchema.annotations({
        [FieldTypeId]: "string",
        [LabelId]: "Blog Content",
        [DescriptionId]: "Blog content for this artist type",
        uiType: "blog-selector",
      }),
    ),
  ),

  // Attribute fields
  tags: S.optional(
    S.NullOr(
      TextField({
        label: "Tags",
        description: "Tags for categorizing artist types",
        uiType: "tags",
      }),
    ),
  ),

  imageUrl: S.optional(
    S.NullOr(
      TextField({
        label: "Image URL",
        description: "URL to an image representing this artist type",
        placeholder: "https://example.com/image.jpg",
        uiType: "image-url",
      }),
    ),
  ),

  icon: S.optional(
    S.NullOr(
      TextField({
        label: "Icon",
        description: "Icon identifier for this artist type",
      }),
    ),
  ),

  // Additional fields
  metadata: S.optional(
    S.NullOr(
      S.Unknown.annotations({
        [FieldTypeId]: "string",
        [LabelId]: "Metadata",
        [DescriptionId]: "Additional metadata for the artist type",
      }),
    ),
  ),

  notes: S.optional(
    S.NullOr(
      TextareaField({
        label: "Notes",
        description: "Internal notes about this artist type",
      }),
    ),
  ),

  version: S.optional(
    S.NullOr(
      NumberField({
        label: "Version",
        description: "Version number of this artist type",
      }),
    ),
  ),

  // System fields
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  deletedAt: S.optional(
    S.NullOr(
      DateField({
        label: "Deleted At",
        description: "Timestamp when this item was soft-deleted",
        isUpdateOnly: true,
      }),
    ),
  ),
}).annotations({
  // Define tab groups at the schema level
  [TabGroupsConfigId]: ArtistTypeGroups,
});

// 5. Define schema for creating new entities (without auto-generated fields)
export const NewArtistType = ArtistType.omit(
  "id",
  "createdAt",
  "updatedAt",
  "deletedAt",
).annotations({
  // Define tab groups at the schema level for creation form
  [TabGroupsConfigId]: newItemTabGroups,
});

// 6. Export typescript types for normal usage
export type ArtistTypeType = typeof ArtistType.Type;
export type NewArtistTypeType = typeof NewArtistType.Type;
export type BlogType = typeof BlogSchema.Type;
