import { Schema as S } from 'effect';
import { FieldTypeId, FieldUITypeId, LabelId, PlaceholderId, IsRequiredId, IsUpdateOnlyId, DescriptionId } from './types';

/**
 * Creates a schema for a date field with metadata
 */
export const DateField = (options: {
  label?: string;
  placeholder?: string;
  description?: string;
  isRequired?: boolean;
  isUpdateOnly?: boolean;
}) => S.Date
  .annotations({
    [FieldTypeId]: 'date',
    [FieldUITypeId]: 'calendar',
    [LabelId]: options.label,
    [PlaceholderId]: options.placeholder || 'Select date...',
    [IsRequiredId]: options.isRequired ?? false,
    [IsUpdateOnlyId]: options.isUpdateOnly ?? false,
    [DescriptionId]: options.description,
    identifier: `Date${options.label ? `-${options.label}` : ''}`,
    title: options.label || 'Date Field'
  });

// Helper type for transform result
type TransformResult<T> = { success: true; value: T } | { success: false; error: Error };

/**
 * Creates a schema for a date-time field that accepts ISO date strings
 * and converts them to Date objects
 */
export const DateTimeField = (options: {
  label?: string;
  placeholder?: string;
  description?: string;
  isRequired?: boolean;
  isUpdateOnly?: boolean;
}) => {
  // Add annotations to Date schema to better handle string inputs
  return S.Date.annotations({
    [FieldTypeId]: 'date',
    [FieldUITypeId]: 'calendar', // Use calendar UI with time
    [LabelId]: options.label || 'Date Time',
    [PlaceholderId]: options.placeholder || 'Select date and time...',
    [IsRequiredId]: options.isRequired ?? false,
    [IsUpdateOnlyId]: options.isUpdateOnly ?? false,
    [DescriptionId]: options.description,
    identifier: `DateTime${options.label ? `-${options.label}` : ''}`,
    title: options.label || 'Date Time Field'
  });
};

/**
 * Creates a schema for a date stored as string (ISO format YYYY-MM-DD)
 */
export const DateStringField = (options: {
  label?: string;
  placeholder?: string;
  description?: string;
  isRequired?: boolean;
  isUpdateOnly?: boolean;
}) => {
  return S.String
    .pipe(
      // Validate that the string is in YYYY-MM-DD format
      S.pattern(/^\d{4}-\d{2}-\d{2}$/, {
        message: () => "Date must be in YYYY-MM-DD format"
      })
    )
    .annotations({
      [FieldTypeId]: 'date', // Mark as date type for data handling
      [FieldUITypeId]: 'date', // Use date input field (not calendar) for UI
      [LabelId]: options.label || 'Date',
      [PlaceholderId]: options.placeholder || 'YYYY-MM-DD',
      [IsRequiredId]: options.isRequired ?? false,
      [IsUpdateOnlyId]: options.isUpdateOnly ?? false,
      [DescriptionId]: options.description,
      identifier: `DateString${options.label ? `-${options.label}` : ''}`,
      title: options.label || 'Date String Field'
    });
}; 