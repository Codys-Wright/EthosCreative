import { Data } from "effect";

/**
 * Base error interface for all application errors
 */
export interface AppError {
  readonly _tag: string;
  readonly message: string;
  readonly cause?: unknown;
}

/**
 * Database-related errors
 */
export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly message: string;
  readonly operation?: string;
  readonly entity?: string;
  readonly cause?: unknown;
}> implements AppError {}

/**
 * HTTP-related errors
 */
export class HttpError extends Data.TaggedError("HttpError")<{
  readonly message: string;
  readonly statusCode?: number;
  readonly url?: string;
  readonly cause?: unknown;
}> implements AppError {}

/**
 * Validation errors
 */
export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
  readonly field?: string;
  readonly value?: unknown;
  readonly cause?: unknown;
}> implements AppError {}

/**
 * Not found errors
 */
export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly message: string;
  readonly entity: string;
  readonly id?: string;
  readonly cause?: unknown;
}> implements AppError {}

/**
 * Authorization errors
 */
export class AuthorizationError extends Data.TaggedError("AuthorizationError")<{
  readonly message: string;
  readonly requiredPermission?: string;
  readonly userId?: string;
  readonly cause?: unknown;
}> implements AppError {}

/**
 * Unexpected errors
 */
export class UnexpectedError extends Data.TaggedError("UnexpectedError")<{
  readonly message: string;
  readonly cause: unknown;
}> implements AppError {} 