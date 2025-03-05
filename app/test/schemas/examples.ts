import { Schema as S } from 'effect';
import { TextField } from './text';
import { NumberField } from './number';
import { DateField } from './date';

// Import our preset fields and compound schemas
import {
  Id,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Email,
  Phone,
  IsActive,
  SortOrder,
  StartDate,
  EndDate,
  DueDate,
  BirthDate,
  AddressSchema,
  PersonNameSchema
} from './presets';

/**
 * Example: User Profile Schema
 * Shows how to combine preset fields and compound schemas
 */
export const UserProfileSchema = S.Struct({
  // System fields
  id: Id,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  
  // Use the compound person name schema
  ...PersonNameSchema.fields,
  
  // Contact details
  email: Email,
  phone: Phone,
  
  // Additional fields
  birthDate: BirthDate,
  bio: TextField({
    label: 'Biography',
    description: 'Short bio or description',
    maxLength: 500
  }),
  
  // Use the compound address schema
  address: AddressSchema,
  
  // Status fields
  isActive: IsActive
});

/**
 * Example: Project Schema
 * Demonstrates how presets make complex schemas more readable
 */
export const ProjectSchema = S.Struct({
  // System fields
  id: Id,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  deletedAt: S.optional(DeletedAt),
  
  // Basic info
  name: TextField({
    label: 'Project Name',
    isRequired: true,
    maxLength: 100
  }),
  description: TextField({
    label: 'Description',
    maxLength: 1000
  }),
  
  // Dates
  startDate: StartDate,
  endDate: S.optional(EndDate),
  dueDate: DueDate,
  
  // Ownership and assignment
  ownerId: Id,
  assignedToIds: S.Array(Id),
  
  // Status and organization
  isActive: IsActive,
  sortOrder: SortOrder,
  
  // Budget
  budget: NumberField({
    label: 'Budget',
    description: 'Total budget allocated to this project',
    min: 0
  })
});

/**
 * Example: Task Schema
 * Shows how to build on existing schemas
 */
export const TaskSchema = S.Struct({
  // System fields
  id: Id,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  
  // References
  projectId: Id,
  
  // Basic info
  title: TextField({
    label: 'Task Title',
    description: 'Brief title describing the task',
    isRequired: true,
    maxLength: 200
  }),
  description: TextField({
    label: 'Description',
    description: 'Detailed task description',
    maxLength: 2000
  }),
  
  // Scheduling
  dueDate: DueDate,
  estimatedHours: NumberField({
    label: 'Estimated Hours',
    description: 'Estimated hours to complete',
    min: 0
  }),
  
  // Assignment and progress
  assignedToId: S.optional(Id),
  completionPercentage: NumberField({
    label: 'Completion %',
    description: 'Percentage complete',
    min: 0,
    max: 100
  })
});

// Export types
export type UserProfile = typeof UserProfileSchema.Type;
export type Project = typeof ProjectSchema.Type;
export type Task = typeof TaskSchema.Type; 