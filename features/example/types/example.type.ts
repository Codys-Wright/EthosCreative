import { Schema as S } from "effect";

export const ExampleId = S.String.pipe(S.brand("ExampleId"));

export const Example = S.Struct({
  id: ExampleId,
  title: S.NullOr(S.String),
  subtitle: S.NullOr(S.String),
  content: S.NullOr(S.String),
  createdAt: S.DateFromSelf,
  updatedAt: S.DateFromSelf,
  deletedAt: S.NullOr(S.DateFromSelf),
});

//the same as Example but without id and without database timestamps
export const NewExample = S.Struct({
  title: S.NullOr(S.String),
  subtitle: S.NullOr(S.String),
  content: S.NullOr(S.String),
});

//export types for normal ts usage
export type Example = typeof Example.Type;
export type NewExample = typeof NewExample.Type;
