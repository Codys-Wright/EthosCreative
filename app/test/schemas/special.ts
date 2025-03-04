import { Schema as S } from 'effect';
import { FieldTypeId, FieldUITypeId, LabelId, PlaceholderId, IsRequiredId, IsUpdateOnlyId, DescriptionId } from './types';

/**
 * Creates a schema for a void field (a field with no value)
 */
export const VoidField = (options: {
  label?: string;
  description?: string;
}) => S.Void
  .annotations({
    [FieldTypeId]: 'void',
    [LabelId]: options.label,
    [DescriptionId]: options.description,
    identifier: `VoidField${options.label ? `-${options.label}` : ''}`,
    title: options.label || 'Void Field'
  });

/**
 * Creates a schema for a string field that can be null with metadata
 */
export const NullableStringField = (options: {
  label?: string;
  placeholder?: string;
  description?: string;
  isRequired?: boolean;
  isUpdateOnly?: boolean;
  uiType?: 'text' | 'textarea' | 'password' | 'tags';
}) => S.NullOr(S.String)
  .annotations({
    [FieldTypeId]: 'string',
    [FieldUITypeId]: options.uiType || 'text', // Default to text input
    [LabelId]: options.label,
    [PlaceholderId]: options.placeholder || 'Enter text...',
    [IsRequiredId]: options.isRequired ?? false,
    [IsUpdateOnlyId]: options.isUpdateOnly ?? false,
    [DescriptionId]: options.description,
    identifier: `NullableString${options.label ? `-${options.label}` : ''}`,
    title: options.label || 'Nullable String Field'
  }); 