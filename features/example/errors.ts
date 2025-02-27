import { Data } from "effect";
import { 
  AppError, 
  NotFoundError, 
  ValidationError 
} from "@/features/global/lib/errors/base-errors";

// Define the EffectfulError interface to match what's expected
interface EffectfulError {
  readonly _tag: string;
}

// Base error class for all example-related errors
export class ExampleError extends Data.TaggedError("ExampleError")<{
  readonly message: string;
  readonly cause?: unknown;
}> implements AppError {}

// Specific error for example not found
export class ExampleNotFoundError extends NotFoundError {
  constructor(params: { message: string; id: string; cause?: unknown }) {
    super({ ...params, entity: "Example" });
  }
}

// Specific error for example creation failures
export class ExampleCreateError extends Data.TaggedError("ExampleCreateError")<{
  readonly message: string;
  readonly input?: unknown;
  readonly cause?: unknown;
}> implements AppError {}

// Specific error for example update failures
export class ExampleUpdateError extends Data.TaggedError("ExampleUpdateError")<{
  readonly message: string;
  readonly id: string;
  readonly data?: unknown;
  readonly cause?: unknown;
}> implements AppError {}

// Specific error for example deletion failures
export class ExampleDeleteError extends Data.TaggedError("ExampleDeleteError")<{
  readonly message: string;
  readonly id: string;
  readonly cause?: unknown;
}> implements AppError {}
