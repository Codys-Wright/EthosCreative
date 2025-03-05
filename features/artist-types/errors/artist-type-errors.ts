import { Data } from "effect";
import {
  AppError,
  NotFoundError,
  ValidationError,
  DatabaseError,
  UnexpectedError,
} from "@/features/global/lib/errors/base-errors";

// Re-export the global error types for convenience
export { NotFoundError, ValidationError, DatabaseError, UnexpectedError };
export type { AppError };

// Base error class for all artist type-related errors
export class ArtistTypeError
  extends Data.TaggedError("ArtistTypeError")<{
    readonly message: string;
    readonly cause?: unknown;
  }>
  implements AppError {}
