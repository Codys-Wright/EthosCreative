import { Schema as S } from 'effect';
import { FieldTypeId, FieldUITypeId, LabelId, PlaceholderId, IsRequiredId, IsUpdateOnlyId, DescriptionId } from './types';

/**
 * Creates a schema for a text field with optional validations and metadata
 */
export const TextField = (options: {
  label?: string;
  placeholder?: string;
  description?: string;
  isRequired?: boolean;
  isUpdateOnly?: boolean;
  uiType?: 'text' | 'textarea' | 'password' | 'tags';
  minLength?: number;
  maxLength?: number;
}) => {
  let schema = S.String;
  
  // Apply validations as needed
  if (options.minLength) {
    schema = schema.pipe(
      S.minLength(options.minLength, {
        message: () => `Must be at least ${options.minLength} characters`
      })
    );
  }
  
  if (options.maxLength) {
    schema = schema.pipe(
      S.maxLength(options.maxLength, {
        message: () => `Cannot exceed ${options.maxLength} characters`
      })
    );
  }
  
  // Create the annotated schema
  const result = schema.annotations({
    [FieldTypeId]: 'string',
    [FieldUITypeId]: options.uiType || 'text',
    [LabelId]: options.label,
    [PlaceholderId]: options.placeholder || 'Enter text...',
    [IsRequiredId]: options.isRequired ?? false,
    [IsUpdateOnlyId]: options.isUpdateOnly ?? false,
    [DescriptionId]: options.description,
    identifier: `Text${options.label ? `-${options.label}` : ''}`,
    title: options.label || 'Text Field'
  });
  
  // Add direct mapping properties for easy access (workaround for annotation access issues)
  (result as any)._uiType = options.uiType || 'text';
  (result as any)._fieldType = 'string';
  (result as any)._metadata = {
    type: 'string',
    uiType: options.uiType || 'text',
    label: options.label,
    placeholder: options.placeholder || 'Enter text...',
    isRequired: options.isRequired ?? false,
    isUpdateOnly: options.isUpdateOnly ?? false,
    description: options.description
  };
  
  return result;
};

/**
 * Creates a schema for a text area field with optional validations and metadata
 */
export const TextareaField = (options: {
  label?: string;
  placeholder?: string;
  description?: string;
  isRequired?: boolean;
  isUpdateOnly?: boolean;
  minLength?: number;
  maxLength?: number;
}) => TextField({
  ...options,
  uiType: 'textarea'
});

/**
 * Creates a schema for a password field with optional validations and metadata
 */
export const PasswordField = (options: {
  label?: string;
  placeholder?: string;
  description?: string;
  isRequired?: boolean;
  isUpdateOnly?: boolean;
  minLength?: number;
  maxLength?: number;
}) => TextField({
  ...options,
  uiType: 'password',
  placeholder: options.placeholder || 'Enter password...'
});

// Reexport the TextareaField and PasswordField for convenience
export { TextareaField as Textarea, PasswordField as Password }; 