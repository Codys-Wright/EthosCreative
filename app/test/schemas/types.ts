import { SchemaAST, Schema as S } from 'effect';
import { Option } from 'effect';

// Define field metadata annotation symbols
export const FieldTypeId = Symbol.for("app/field/type");
export const FieldUITypeId = Symbol.for("app/field/uiType");
export const LabelId = Symbol.for("app/field/label");
export const PlaceholderId = Symbol.for("app/field/placeholder");
export const IsRequiredId = Symbol.for("app/field/isRequired");
export const IsUpdateOnlyId = Symbol.for("app/field/isUpdateOnly");
export const DescriptionId = Symbol.for("app/field/description");
// Add tab group annotation symbol
export const TabGroupId = Symbol.for("app/field/tabGroup");
// Add schema-level tab groups configuration symbol
export const TabGroupsConfigId = Symbol.for("app/schema/tabGroups");

// Field types we support
export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'void' | 'email';

// UI-specific field types that map to form controls
export type FieldUIType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'password'
  | 'date'
  | 'calendar'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'tags'
  | 'color'
  | 'file'
  | 'range';

// Define the shape of our field metadata
export type FieldMetadata = {
  type: FieldType;
  uiType?: FieldUIType; // New field for UI rendering type
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
  isUpdateOnly?: boolean;
  description?: string;
  tabGroup?: string; // Add tab group to field metadata
};

// Helper to get field metadata from a schema field
export const getFieldMetadata = (schema: any, fieldName: string): FieldMetadata | null => {
  const fieldSchema = schema.fields?.[fieldName];
  if (!fieldSchema) return null;
  
  // Debug: log the field schema to understand its structure
  console.log(`Field schema for ${fieldName}:`, {
    fieldSchema,
    ast: fieldSchema.ast,
    annotations: fieldSchema.annotations
  });
  
  // Get field type from AST annotations
  const fieldType = SchemaAST.getAnnotation<FieldType>(FieldTypeId)(fieldSchema.ast)
    .pipe(Option.getOrElse(() => {
      // Try to infer field type from schema type if annotation is missing
      if (fieldSchema.ast.Type === 'BooleanKeyword') return 'boolean' as FieldType;
      if (fieldSchema.ast.Type === 'NumberKeyword') return 'number' as FieldType;
      if (fieldSchema.ast.Type === 'DateConstructor') return 'date' as FieldType;
      
      // Default to string as fallback
      return 'string' as FieldType;
    }));
  
  return {
    type: fieldType,
    uiType: SchemaAST.getAnnotation<FieldUIType>(FieldUITypeId)(fieldSchema.ast)
      .pipe(Option.getOrElse(() => undefined)),
    label: SchemaAST.getAnnotation<string>(LabelId)(fieldSchema.ast)
      .pipe(Option.getOrElse(() => fieldName.charAt(0).toUpperCase() + fieldName.slice(1))),
    placeholder: SchemaAST.getAnnotation<string>(PlaceholderId)(fieldSchema.ast)
      .pipe(Option.getOrElse(() => 'Enter value...')),
    isRequired: SchemaAST.getAnnotation<boolean>(IsRequiredId)(fieldSchema.ast)
      .pipe(Option.getOrElse(() => false)),
    isUpdateOnly: SchemaAST.getAnnotation<boolean>(IsUpdateOnlyId)(fieldSchema.ast)
      .pipe(Option.getOrElse(() => false)),
    description: SchemaAST.getAnnotation<string>(DescriptionId)(fieldSchema.ast)
      .pipe(Option.getOrElse(() => undefined)),
    tabGroup: SchemaAST.getAnnotation<string>(TabGroupId)(fieldSchema.ast)
      .pipe(Option.getOrElse(() => 'general')) // Default tab group if not specified
  };
};

// Helper to provide defaults for empty values based on field type
export const getDefaultValueForType = (type: FieldType) => {
  switch (type) {
    case 'string':
    case 'email': 
      return '';
    case 'number': 
      return 0;
    case 'boolean': 
      return false;
    case 'date': 
      return '';
    default: 
      return undefined;
  }
};

// Format value for display in table
export const formatValue = (value: any, type: FieldType): string => {
  if (value === null || value === undefined) return '-';
  if (type === 'boolean') return value ? 'Yes' : 'No';
  if (type === 'date' && value instanceof Date) return value.toLocaleDateString();
  return String(value);
}; 

// Define schema for a tab group configuration
export const TabGroupSchema = S.Struct({
  label: S.optional(S.String), // Optional custom label 
  description: S.optional(S.String), // Optional description
  order: S.optional(S.Number), // Optional ordering
  fields: S.Array(S.String) // Array of field names in this group
});

// Define the tab groups configuration schema using Record
export const TabGroupsConfigSchema = S.Record({
  key: S.String, // The tab group name
  value: TabGroupSchema // The tab group configuration
});

// Type for a single tab group
export type TabGroup = {
  label?: string;
  description?: string;
  order?: number;
  fields: string[];
};

// Type for the entire tab groups configuration
export type TabGroupsConfig = Record<string, TabGroup>;

// Helper to get default label for a tab group
const getDefaultLabel = (groupName: string): string => 
  groupName.charAt(0).toUpperCase() + groupName.slice(1);

// Function to get all tab groups from a schema
export const getTabGroups = (schema: any): TabGroupsConfig => {
  // First check if there's a schema-level tab groups configuration
  const schemaConfig = SchemaAST.getAnnotation<Record<string, string[]>>(TabGroupsConfigId)(schema.ast)
    .pipe(Option.getOrNull);
  
  if (schemaConfig) {
    // Convert simple config to full TabGroupsConfig
    const result: TabGroupsConfig = {};
    
    // Process each group in the configuration
    Object.entries(schemaConfig).forEach(([groupName, fieldNames], index) => {
      result[groupName] = {
        label: getDefaultLabel(groupName),
        order: index,
        fields: fieldNames
      };
    });
    
    return result;
  }
  
  // Fall back to the old field-by-field approach if no schema-level config
  const result: TabGroupsConfig = {};
  
  // Gather all fields and their tab groups
  Object.keys(schema.fields || {}).forEach(fieldName => {
    const metadata = getFieldMetadata(schema, fieldName);
    const tabGroup = metadata?.tabGroup || 'general';
    
    if (!result[tabGroup]) {
      result[tabGroup] = {
        label: getDefaultLabel(tabGroup),
        fields: []
      };
    }
    
    result[tabGroup].fields.push(fieldName);
  });
  
  return result;
};

// Function to add tab group annotations to a schema
export const withTabGroups = <T>(schema: T, tabGroups: Record<string, string[]>): T => {
  const schemaCopy = { ...schema as any };
  
  // Apply tab group annotations to each field
  Object.entries(tabGroups).forEach(([groupName, fieldNames]) => {
    fieldNames.forEach(fieldName => {
      if (schemaCopy.fields?.[fieldName]) {
        schemaCopy.fields[fieldName] = schemaCopy.fields[fieldName].annotations({
          [TabGroupId]: groupName
        });
      }
    });
  });
  
  return schemaCopy as T;
}; 