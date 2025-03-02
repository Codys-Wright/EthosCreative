import { Schema as S } from "@effect/schema";

// Define a branded type for User ID
export const UserId = S.String.pipe(S.brand("UserId"));
// Helper to create a valid UserId from a string
export const makeUserId = (id: string): typeof UserId.Type => id as typeof UserId.Type;

// Define the schema for User type
export const User = S.Struct({
  id: UserId,
  name: S.String.pipe(
    S.minLength(2, { message: () => "Name must be at least 2 characters" }),
    S.maxLength(50, { message: () => "Name must be at most 50 characters" })
  ),
  email: S.String.pipe(
    S.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: () => "Must be a valid email address" })
  ),
  status: S.Union(
    S.Literal("active"),
    S.Literal("inactive"),
    S.Literal("pending")
  ),
  role: S.Union(
    S.Literal("admin"),
    S.Literal("user"),
    S.Literal("editor")
  ),
  lastLogin: S.String, // Could use S.DateFromSelf if storing as Date objects
  createdAt: S.String, // Could use S.DateFromSelf if storing as Date objects
  notes: S.optional(S.String),
  subscribed: S.Boolean
});

// Schema for creating a new user (without id and timestamps)
export const NewUser = S.Struct({
  name: S.String.pipe(
    S.minLength(2, { message: () => "Name must be at least 2 characters" }),
    S.maxLength(50, { message: () => "Name must be at most 50 characters" })
  ),
  email: S.String.pipe(
    S.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: () => "Must be a valid email address" })
  ),
  status: S.Union(
    S.Literal("active"),
    S.Literal("inactive"),
    S.Literal("pending")
  ),
  role: S.Union(
    S.Literal("admin"),
    S.Literal("user"),
    S.Literal("editor")
  ),
  notes: S.optional(S.String),
  subscribed: S.Boolean
});

// Export types for normal TS usage
export type User = typeof User.Type;
export type NewUser = typeof NewUser.Type;

// For backward compatibility with the DataTable component
// Keep the old schema exports
export const UserSchema = User as any;
export const NewUserSchema = NewUser as any; 