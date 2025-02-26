import { Effect as E, Function, Predicate } from "effect";
import { ArrayFormatter, Schema as S } from "@effect/schema";

/**
 * Wraps a schema in a nullable type that properly handles forbidden errors
 * If a forbidden error occurs during decoding, it will be propagated
 * For other errors, the field will be set to null
 */
export const withForbiddenHandling = <A, I, R>(schema: S.Schema<A, I, R>) =>
  S.NullOr(schema).annotations({
    decodingFallback: (issue) => {
      const issues = ArrayFormatter.formatIssueSync(issue);
      if (issues.some((issue) => issue._tag === "Forbidden"))
        return E.fail(issue); // Propagate forbidden errors
      return E.succeed(null); // Otherwise, fallback to null
    },
  });

// Helper function to handle arrays that may contain null values
// This is used when we want to filter out nulls and keep only valid items

const NonNullableArrayFromFallible = <A, I, R>(schema: S.Schema<A, I, R>) =>
  S.transform(
    S.Array(
      S.NullOr(schema).annotations({
        identifier: "Project", // More specific identifier
        decodingFallback: (issue) =>
          E.zipRight(
            E.logWarning(
              `[NonNullableArrayFromFallible] Project filtered: ${ArrayFormatter.formatIssueSync(
                issue,
              )
                .map((issue) => issue.message)
                .join(", ")}`,
            ),
            E.succeed(null),
          ),
      }),
    ),
    S.typeSchema(S.Array(schema)),
    {
      decode: (decoded) => decoded.filter(Predicate.isNotNull),
      encode: Function.identity,
      strict: true,
    },
  );

export { NonNullableArrayFromFallible };
