import { IdField, TimestampField } from './system';
import { TextField } from './text';
import { NumberField } from './number';
import { EmailField } from './email';
import { DateField } from './date';
import { BooleanField } from './boolean';
import { Schema as S } from 'effect';

/**
 * Common preset field definitions with standardized labels, descriptions, and validation
 * These can be used directly in your schema definitions without having to specify the same properties repeatedly
 */

// ===== ID Presets =====

/**
 * Standard ID field for database records
 * Auto-generated and read-only
 */
export const Id = IdField({
  description: 'Unique identifier for this record'
});

/**
 * User ID field for referencing users
 */
export const UserId = IdField({
  label: 'User ID',
  description: 'Reference to a user account'
});

/**
 * Organization ID field for referencing organizations
 */
export const OrganizationId = IdField({
  label: 'Organization ID',
  description: 'Reference to an organization'
});

// ===== Timestamp Presets =====

/**
 * Created At timestamp
 * Auto-generated when a record is created
 */
export const CreatedAt = TimestampField({
  label: 'Created At',
  description: 'When this record was created'
});

/**
 * Updated At timestamp
 * Auto-generated when a record is updated
 */
export const UpdatedAt = TimestampField({
  label: 'Updated At',
  description: 'When this record was last updated'
});

/**
 * Deleted At timestamp for soft deletes
 * Set when a record is soft-deleted
 */
export const DeletedAt = TimestampField({
  label: 'Deleted At',
  description: 'When this record was deleted (if applicable)'
});

// ===== Common Field Presets =====

/**
 * Standard name field with validation
 */
export const Name = TextField({
  label: 'Name',
  placeholder: 'Enter name...',
  description: 'Full name',
  isRequired: true,
  maxLength: 100
});

/**
 * First name field with validation
 */
export const FirstName = TextField({
  label: 'First Name',
  placeholder: 'Enter first name...',
  description: 'First name or given name',
  isRequired: true,
  maxLength: 50
});

/**
 * Last name field with validation
 */
export const LastName = TextField({
  label: 'Last Name',
  placeholder: 'Enter last name...',
  description: 'Last name or surname',
  isRequired: true,
  maxLength: 50
});

/**
 * Standard email field with validation
 */
export const Email = EmailField({
  label: 'Email Address',
  placeholder: 'name@example.com',
  description: 'Contact email address',
  isRequired: true
});

/**
 * Standard phone number field with validation
 */
export const Phone = TextField({
  label: 'Phone Number',
  placeholder: '(123) 456-7890',
  description: 'Contact phone number'
});

/**
 * Order/sequence number for sorting
 */
export const SortOrder = NumberField({
  label: 'Sort Order',
  description: 'Sequence number for ordering',
  min: 0
});

/**
 * Standard active status field
 */
export const IsActive = BooleanField({
  label: 'Active Status',
  description: 'Whether this item is active'
});

// ===== Address-related Presets =====

/**
 * Street address field
 */
export const StreetAddress = TextField({
  label: 'Street Address',
  placeholder: '123 Main St',
  description: 'Street address including number and street name'
});

/**
 * City field
 */
export const City = TextField({
  label: 'City',
  placeholder: 'Enter city...',
  description: 'City name'
});

/**
 * State/Province field
 */
export const State = TextField({
  label: 'State/Province',
  placeholder: 'Enter state...',
  description: 'State or province name'
});

/**
 * Postal/Zip code field
 */
export const PostalCode = TextField({
  label: 'Postal Code',
  placeholder: 'Enter postal code...',
  description: 'Postal or zip code'
});

/**
 * Country field
 */
export const Country = TextField({
  label: 'Country',
  placeholder: 'Enter country...',
  description: 'Country name'
});

// ===== Date-related Presets =====

/**
 * Birth date field
 */
export const BirthDate = DateField({
  label: 'Birth Date',
  description: 'Date of birth'
});

/**
 * Start date field
 */
export const StartDate = DateField({
  label: 'Start Date',
  description: 'When something begins'
});

/**
 * End date field
 */
export const EndDate = DateField({
  label: 'End Date',
  description: 'When something ends'
});

/**
 * Due date field
 */
export const DueDate = DateField({
  label: 'Due Date',
  description: 'When something is due'
});

// ===== Common Compound Schemas =====

/**
 * Standard address schema
 */
export const AddressSchema = S.Struct({
  street: StreetAddress,
  city: City,
  state: State,
  postalCode: PostalCode,
  country: Country
});

/**
 * Standard person name schema
 */
export const PersonNameSchema = S.Struct({
  firstName: FirstName,
  lastName: LastName
}); 