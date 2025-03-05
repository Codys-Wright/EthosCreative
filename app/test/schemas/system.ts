import { Schema as S } from "effect";
import {
  FieldTypeId,
  LabelId,
  PlaceholderId,
  IsRequiredId,
  IsUpdateOnlyId,
  DescriptionId,
} from "./types";

/**
 * Creates a schema for an ID field with metadata
 * These are typically auto-generated and only updatable by the system
 */
export const IdField = (options: { label?: string; description?: string }) =>
  S.String.annotations({
    [FieldTypeId]: "string",
    [LabelId]: options.label || "ID",
    [PlaceholderId]: "Auto-generated ID",
    [IsRequiredId]: true,
    [IsUpdateOnlyId]: true,
    [DescriptionId]: options.description || "Unique identifier",
    identifier: "ID",
    title: "Identifier",
  });

/**
 * Creates a schema for a timestamp field with metadata
 * These are typically auto-generated and only updatable by the system
 */
export const TimestampField = (options: {
  label?: string;
  description?: string;
}) =>
  S.DateFromSelf.annotations({
    [FieldTypeId]: "string",
    [LabelId]: options.label,
    [PlaceholderId]: "Auto-generated timestamp",
    [IsRequiredId]: true,
    [IsUpdateOnlyId]: true,
    [DescriptionId]: options.description,
    identifier: `Timestamp${options.label ? `-${options.label}` : ""}`,
    title: options.label || "Timestamp Field",
  });
