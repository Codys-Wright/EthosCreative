import { Schema as S } from 'effect';
import { FieldTypeId, LabelId, PlaceholderId, IsRequiredId, IsUpdateOnlyId, DescriptionId } from './types';

/**
 * Creates a schema for an email field with validation and metadata
 */
export const EmailField = (options: {
  label?: string;
  placeholder?: string;
  description?: string;
  isRequired?: boolean;
  isUpdateOnly?: boolean;
}) => S.String
  .pipe(
    S.pattern(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, {
      message: () => "Invalid email address format"
    })
  )
  .annotations({
    [FieldTypeId]: 'email',
    [LabelId]: options.label || 'Email',
    [PlaceholderId]: options.placeholder || 'name@example.com',
    [IsRequiredId]: options.isRequired ?? false,
    [IsUpdateOnlyId]: options.isUpdateOnly ?? false,
    [DescriptionId]: options.description || 'Valid email address',
    identifier: 'Email',
    title: 'Email Address',
    examples: ["john.doe@example.com", "jane@test.org"]
  }); 