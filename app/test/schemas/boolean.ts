import { Schema as S } from 'effect';
import { FieldTypeId, LabelId, IsRequiredId, IsUpdateOnlyId, DescriptionId } from './types';

/**
 * Creates a schema for a boolean field with metadata
 */
export const BooleanField = (options: {
  label?: string;
  description?: string;
  isRequired?: boolean;
  isUpdateOnly?: boolean;
}) => S.Boolean
  .annotations({
    [FieldTypeId]: 'boolean',
    [LabelId]: options.label,
    [IsRequiredId]: options.isRequired ?? false,
    [IsUpdateOnlyId]: options.isUpdateOnly ?? false,
    [DescriptionId]: options.description,
    identifier: `Boolean${options.label ? `-${options.label}` : ''}`,
    title: options.label || 'Boolean Field'
  }); 