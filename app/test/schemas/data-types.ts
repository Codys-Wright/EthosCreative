import { Schema as S, Effect, ParseResult } from 'effect';
import { TextField, TextareaField } from './text';
import { NumberField } from './number';
import { BooleanField } from './boolean';
import { DateField, DateTimeField, DateStringField } from './date';
import { EmailField } from './email';
import { VoidField, NullableStringField } from './special';
import { TabGroupsConfigId, TabGroupsConfigSchema, FieldTypeId, LabelId, IsRequiredId, IsUpdateOnlyId, DescriptionId } from './types';

// Import our preset fields
import { Id, CreatedAt, UpdatedAt, Email } from './presets';

/**
 * Schema for an existing data type
 * Using a mix of custom fields and preset fields with tab groups defined at schema level
 */

export const DataTypeId = Id.pipe(S.brand('DataTypeId'));

// Define the tab groups configuration once to avoid duplication
const baseTabGroups = {
  main: ['stringValue', 'numberValue', 'booleanValue', 'email'],
  dates: ['dateValue', 'dateString'],
  optional: ['nullableString', 'void'],
  system: ['id', 'createdAt', 'updatedAt']
};

// Clone the config without the system group for new items
const newItemTabGroups = {
  main: [...baseTabGroups.main],
  dates: [...baseTabGroups.dates],
  optional: [...baseTabGroups.optional]
  // system group intentionally omitted
};

// Create BaseDataTypeSchema with all fields
const BaseDataTypeSchema = S.Struct({
  // Primary Key
  id: S.String.annotations({
    [FieldTypeId]: 'string',
    [LabelId]: 'ID',
    [IsRequiredId]: true,
    [IsUpdateOnlyId]: true,
    [DescriptionId]: 'Unique identifier'
  }),
  
  // Main field group
  stringValue: S.optional(TextField({
    label: 'Text Value',
    isRequired: true,
    description: 'A simple text field'
  })),
  
  // Add a textarea field
  description: S.optional(TextareaField({
    label: 'Description',
    placeholder: 'Enter detailed description...',
    description: 'A longer description field'
  })),
  
  numberValue: S.optional(NumberField({
    isRequired: true,
    description: 'A numeric value'
  })),
  
  booleanValue: S.optional(BooleanField({
    isRequired: true,
    description: 'A yes/no value'
  })),
  

  // Use DateStringField for date/time string values
  dateString: S.optional(DateStringField({
    label: 'Date as String',
    isRequired: true,
    description: 'A date stored as string'
  })),
  
  // Optional fields using S.optional
  nullableString: S.optional(NullableStringField({
    description: 'An optional text value'
  })),
  
  // Add fields with explicit UI types
  tags: S.optional(TextField({
    label: 'Tags',
    description: 'Tags for categorization',
    uiType: 'tags' // This will use the tags input component
  })),
  
  void: S.optional(VoidField({
    description: 'A field with no value'
  })),
  
  // Standard preset email field
  email: S.optional(Email),
  
  // Standard preset timestamp fields
  createdAt: CreatedAt,
  updatedAt: S.optional(UpdatedAt)
}).annotations({
  // Define tab groups at the schema level
  [TabGroupsConfigId]: baseTabGroups
});

// Define the Schema instances
// Use the base schema as the main schema
export const DataTypeSchema = BaseDataTypeSchema;

// Create NewDataTypeSchema by omitting system fields from DataTypeSchema
// and adding its own tab groups configuration
export const NewDataTypeSchema = BaseDataTypeSchema
  .omit("id", "createdAt", "updatedAt")
  .annotations({
    // Define tab groups at the schema level for creation form
    [TabGroupsConfigId]: newItemTabGroups
  });

// Export type definitions
export type DataType = typeof BaseDataTypeSchema.Type;
export type NewDataType = typeof NewDataTypeSchema.Type;
 