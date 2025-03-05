import { Schema } from "effect";
import { GeneratedFieldType, FieldCustomizationRecord } from "@/components/crud/field-types";
// Field renderer imports will be added later
// import { getFieldTypeOverride } from "./field-renderers";

/**
 * Helper function to extract field information from a schema
 * Now with improved required field detection based on Schema structure
 */
export function getSchemaFieldInfo<T extends Record<string, any>>(
  schema: ReturnType<typeof Schema.make<T>>,
  sampleData?: Partial<T>,
  fieldCustomizations?: FieldCustomizationRecord<T>
): Record<string, { type: GeneratedFieldType; required: boolean }> {
  console.log("🔍 [Schema Utils] getSchemaFieldInfo called with:", {
    schema: schema !== undefined ? "Schema provided" : "No schema",
    sampleDataFields: sampleData ? Object.keys(sampleData) : "No sample data",
    fieldCustomizationsCount: fieldCustomizations ? Object.keys(fieldCustomizations).length : 0
  });

  const fields: Record<string, { type: GeneratedFieldType; required: boolean }> = {};

  try {
    // First try to determine fields from the schema object
    if (schema && typeof schema === 'object') {
      // Try to extract field information directly from schema when no sample data is provided
      let schemaFields: string[] = [];
      
      // Extract fields from sample data if available
      if (sampleData && Object.keys(sampleData).length > 0) {
        schemaFields = Object.keys(sampleData);
      } 
      // If no sample data, extract fields directly from schema structure
      else if (schema) {
        try {
          const schemaAny = schema as any;
          
          // Try different schema structures that might contain field definitions
          if (schemaAny.fields && typeof schemaAny.fields === 'object') {
            schemaFields = Object.keys(schemaAny.fields);
          } else if (schemaAny.$schema && schemaAny.$schema.fields) {
            schemaFields = Object.keys(schemaAny.$schema.fields);
          } else if (schemaAny.proto && schemaAny.proto.fields) {
            schemaFields = Object.keys(schemaAny.proto.fields);
          }
          
          // If we have fieldCustomizations, ensure those fields are included
          if (fieldCustomizations) {
            const customizationFields = Object.keys(fieldCustomizations);
            schemaFields = [...new Set([...schemaFields, ...customizationFields])];
          }
          
          console.log("🔍 [Schema Utils] Extracted fields from schema:", schemaFields);
        } catch (e) {
          console.warn("Error extracting fields directly from schema:", e);
        }
      }
      
      console.log("🔍 [Schema Utils] Processing schema fields:", schemaFields);
      
      // Function to check if a schema field is optional
      const isFieldOptional = (schema: any, key: string): boolean => {
        console.log(`🔍 [Schema Utils] Checking if field '${key}' is optional`);
        
        if (!schema) return false;
        
        // Try to access the schema's internal structure
        // This is a heuristic approach since Effect Schema's internal structure might change
        const schemaAny = schema as any;
        
        // Check if we can find references to optional types
        try {
          // For schema.fields approach (S.Struct)
          if (schemaAny.fields && typeof schemaAny.fields === 'object') {
            const field = schemaAny.fields[key];
            if (!field) return false;
            
            // Check for NullOr or Optional constructors or "| null" in type string
            const fieldStr = field.toString();
            console.log(`🔍 [Schema Utils] Field '${key}' string representation: "${fieldStr}"`);
            
            // Check different patterns that indicate a field is optional
            const isNullOr = fieldStr.includes('NullOr');
            const isOptionalKeyword = fieldStr.includes('Optional');
            const isNullable = fieldStr.includes('nullable');
            const hasNullInType = fieldStr.includes('| null');
            
            const isOptional = isNullOr || isOptionalKeyword || isNullable || hasNullInType;
            
            console.log(`🔍 [Schema Utils] Field '${key}' optionality checks:`, {
              isNullOr,
              isOptionalKeyword, 
              isNullable,
              hasNullInType,
              finalDecision: isOptional ? 'optional' : 'required'
            });
            
            return isOptional;
          }
          
          // For schema.proto.fields approach (another possible structure)
          if (schemaAny.proto && schemaAny.proto.fields && typeof schemaAny.proto.fields === 'object') {
            const field = schemaAny.proto.fields[key];
            if (!field) return false;
            
            // Check for NullOr or Optional constructors or "| null" in type string
            const fieldStr = field.toString();
            const isOptional = fieldStr.includes('NullOr') || 
                   fieldStr.includes('Optional') || 
                   fieldStr.includes('nullable') ||
                   fieldStr.includes('| null'); // Add check for "| null" in type string
                   
            console.log(`🔍 [Schema Utils] Field '${key}' is determined to be ${isOptional ? 'optional' : 'required'} from proto.fields`);
            
            return isOptional;
          }
          
          // Additional check for Effect.Schema structure
          if (schemaAny.$schema && schemaAny.$schema.fields) {
            const field = schemaAny.$schema.fields[key];
            if (!field) return false;
            
            const fieldStr = JSON.stringify(field);
            const isOptional = fieldStr.includes('NullOr') || 
                   fieldStr.includes('Optional') || 
                   fieldStr.includes('nullable') ||
                   fieldStr.includes('| null'); // Add check for "| null" in type string
                   
            console.log(`🔍 [Schema Utils] Field '${key}' is determined to be ${isOptional ? 'optional' : 'required'} from $schema.fields`);
            
            return isOptional;
          }
        } catch (e) {
          console.warn(`Error inspecting schema for field ${key}:`, e);
        }
        
        // If we can't determine from schema structure, check the sample data
        // If a field in sample data is null or undefined, it's likely optional
        if (sampleData && key in sampleData) {
          const isOptional = sampleData[key] === null || sampleData[key] === undefined;
          console.log(`🔍 [Schema Utils] Field '${key}' is determined to be ${isOptional ? 'optional' : 'required'} from sample data`);
          return isOptional;
        }
        
        // IMPORTANT: In case of doubt, default to NOT optional (required)
        // This matches Effect Schema's behavior where fields are required by default
        const result = false; // Default to NOT optional (i.e., required)
        console.log(`🔍 [Schema Utils] Field '${key}' is determined to be ${result ? 'optional' : 'required'} by default`);
        return result;
      };
      
      for (const key of schemaFields) {
        // Use field customization if available
        const customization = fieldCustomizations?.[key as keyof T & string];
        
        // IMPORTANT CHANGE: Default to false (NOT required) unless:
        // 1. The schema explicitly indicates it's required, or
        // 2. Field customization explicitly sets required to true
        const isOptional = isFieldOptional(schema, key);
        let required = false; // Default to NOT required
        
        if (!isOptional) {
          required = true; // Only set to required if schema explicitly indicates
        }
        
        // Field customization can override the schema inference
        if (customization?.required !== undefined) {
          required = customization.required;
        }
        
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
        
        // For sample data only, assume fields are required by default
        // unless they are null or explicitly marked as not required
        let required = true;
        
        if (value === null || value === undefined) {
          required = false;
        }
        
        // Check if there's a customization that explicitly sets required
        const customization = fieldCustomizations?.[key as keyof T & string];
        if (customization?.required !== undefined) {
          required = customization.required;
        }
        
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