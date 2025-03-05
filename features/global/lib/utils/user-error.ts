import { Data } from "effect";

export class UserError extends Data.TaggedError("UserError")<{
  readonly message: string;
}> {}
