import { Schema } from "effect";
import { GeneratedFieldType, FieldCustomizationRecord } from "@/components/crud/field-types";
// Field renderer imports will be added later
// import { getFieldTypeOverride } from "./field-renderers";

/**
 * Helper function to extract field information from a schema
 */
export function getSchemaFieldInfo<T extends Record<string, any>>(
  schema: ReturnType<typeof Schema.make<T>>,
  sampleData?: Partial<T>,
  fieldCustomizations?: FieldCustomizationRecord<T>
): Record<string, { type: GeneratedFieldType; required: boolean }> {
  const fields: Record<string, { type: GeneratedFieldType; required: boolean }> = {};

  try {
    // First try to determine fields from the schema object
    // This is a simplified approach as Effect.Schema can have complex structures
    // We'll just check for properties and try to infer types
    if (schema && typeof schema === 'object') {
      // Try to extract field information from various locations in the schema object
      // This is a best-effort approach that may need adjustments based on your actual schema structure
      const schemaFields = Object.keys(sampleData || {});
      
      for (const key of schemaFields) {
        // Use field customization if available
        const customization = fieldCustomizations?.[key as keyof T & string];
        let required = customization?.required ?? false;
        
        // Determine field type based on sample data or customization
        let fieldType: GeneratedFieldType = customization?.type || "text";
        
        if (!customization?.type && sampleData && key in sampleData) {
          const value = sampleData[key];
          if (typeof value === "number") fieldType = "number";
          else if (typeof value === "boolean") fieldType = "checkbox";
          else if (Object.prototype.toString.call(value) === "[object Date]") fieldType = "date";
          else if (typeof value === "string" && value.includes("@")) fieldType = "email";
        }
        
        fields[key] = { type: fieldType, required };
      }
    }

    // If we couldn't determine fields from schema, use sample data
    if (Object.keys(fields).length === 0 && sampleData) {
      const fieldNames = Object.keys(sampleData);
      fieldNames.forEach(key => {
        // Try to infer type from the data value
        let fieldType: GeneratedFieldType = "text";
        const value = sampleData[key];
        
        if (typeof value === "number") fieldType = "number";
        else if (typeof value === "boolean") fieldType = "checkbox";
        else if (Object.prototype.toString.call(value) === "[object Date]") fieldType = "date";
        else if (typeof value === "string" && value.includes("@")) fieldType = "email";
        
        // Check if there's a customization that explicitly sets required
        const customization = fieldCustomizations?.[key as keyof T & string];
        // If required is explicitly set in customization, use that value, otherwise default to false
        const required = customization?.required ?? false;
        
        fields[key] = { type: fieldType, required };
      });
    }
  } catch (e) {
    console.error("Error parsing schema:", e);
  }

  return fields;
}

/**
 * Determines the field type based on customizations, schema info, and field name patterns
 * @param fieldName The name of the field
 * @param fieldCustomizations Customizations that may specify the field type
 * @param schemaFields Schema field information with inferred types
 * @returns The determined field type
 */
export function getFieldType<T extends Record<string, any>>(
  fieldName: keyof T & string,
  fieldCustomizations: FieldCustomizationRecord<T>,
  schemaFields: Record<string, { type: GeneratedFieldType; required: boolean }>
): GeneratedFieldType {
  // First priority: explicit customization if provided
  if (fieldCustomizations[fieldName]?.type) {
    return fieldCustomizations[fieldName]!.type!;
  }

  // Second priority: schema-inferred type if available
  if (schemaFields[fieldName]?.type) {
    // Check if we should use a specialized renderer based on field name
    // This would require importing the field renderer module, which we may do in the future
    return schemaFields[fieldName].type;
  }

  // Fallback: default to text
  return "text";
}

/**
 * Helper to get field label (with smart defaults)
 */
export function getFieldLabel<T extends Record<string, any>>(
  fieldName: keyof T & string,
  fieldCustomizations: FieldCustomizationRecord<T>
): string {
  // Check for field customization first
  const customLabel = fieldCustomizations[fieldName]?.label;
  if (customLabel) return customLabel;

  // Generate label from field name (convert camelCase to Title Case)
  return (fieldName as string)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

/**
 * Helper to get field description
 */
export function getFieldDescription<T extends Record<string, any>>(
  fieldName: keyof T & string,
  fieldCustomizations: FieldCustomizationRecord<T>
): string | undefined {
  return fieldCustomizations[fieldName]?.description;
}

/**
 * Helper to get field placeholder
 */
export function getFieldPlaceholder<T extends Record<string, any>>(
  fieldName: keyof T & string,
  defaultLabel: string,
  fieldCustomizations: FieldCustomizationRecord<T>
): string {
  if (fieldCustomizations[fieldName]?.placeholder) {
    return fieldCustomizations[fieldName]?.placeholder!;
  }
  return defaultLabel;
}

/**
 * Helper to check if field is readonly
 */
export function isFieldReadonly<T extends Record<string, any>>(
  fieldName: keyof T & string,
  fieldCustomizations: FieldCustomizationRecord<T>
): boolean {
  return fieldCustomizations[fieldName]?.readOnly === true;
}

/**
 * Helper to check if field is required
 */
export function isFieldRequired<T extends Record<string, any>>(
  fieldName: keyof T & string,
  schemaFields: Record<string, { type: GeneratedFieldType; required: boolean }>
): boolean {
  return schemaFields[fieldName as string]?.required || false;
}

/**
 * Tab definition for grouping fields
 */
export type TabDefinition<T extends Record<string, any>> = {
  id: string;
  label: string;
  description?: string;
  fields: Array<keyof T & string>;
}; 