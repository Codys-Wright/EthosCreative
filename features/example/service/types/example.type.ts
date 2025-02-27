import { Schema as S } from "effect";

export const ExampleId = S.String.pipe(S.brand("ExampleId"));

export const Example = S.Struct({
  id: ExampleId,
  content: S.String,
  createdAt: S.DateTimeUtc,
  updatedAt: S.DateTimeUtc,
});

//the same as Example but without id and without database timestamps
export const NewExample = S.Struct({
  content: S.String,
});

//export types for normal ts usage
export type Example = typeof Example.Type;
export type NewExample = typeof NewExample.Type;
