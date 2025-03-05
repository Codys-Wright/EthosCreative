import { Schema as S } from "effect";
import {
  FieldTypeId,
  FieldUITypeId,
  LabelId,
  PlaceholderId,
  IsRequiredId,
  IsUpdateOnlyId,
  DescriptionId,
} from "./types";

/**
 * Creates a schema for a number field with optional range validation and metadata
 */
export const NumberField = (options: {
  label?: string;
  placeholder?: string;
  description?: string;
  isRequired?: boolean;
  isUpdateOnly?: boolean;
  uiType?: "number" | "range";
  min?: number;
  max?: number;
}) => {
  let schema = S.Number;

  // Apply validations as needed
  if (options.min !== undefined) {
    schema = schema.pipe(
      S.greaterThanOrEqualTo(options.min, {
        message: () => `Must be at least ${options.min}`,
      }),
    );
  }

  if (options.max !== undefined) {
    schema = schema.pipe(
      S.lessThanOrEqualTo(options.max, {
        message: () => `Cannot exceed ${options.max}`,
      }),
    );
  }

  return schema.annotations({
    [FieldTypeId]: "number",
    [FieldUITypeId]: options.uiType || "number",
    [LabelId]: options.label,
    [PlaceholderId]: options.placeholder || "Enter a number...",
    [IsRequiredId]: options.isRequired ?? false,
    [IsUpdateOnlyId]: options.isUpdateOnly ?? false,
    [DescriptionId]: options.description,
    identifier: `Number${options.label ? `-${options.label}` : ""}`,
    title: options.label || "Number Field",
  });
};
