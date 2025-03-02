import { TabDefinition } from "@/components/crud/data-editor-dialog";
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
export type ExampleType = typeof Example.Type;
export type NewExampleType = typeof NewExample.Type;

// Tab definitions for organizing example fields in forms
export const ExampleGroups: TabDefinition<ExampleType>[] = [
  {
    id: "content",
    label: "Content",
    fields: ["title", "subtitle", "content"]
  },
  {
    id: "metadata",
    label: "Metadata",
    fields: ["id", "createdAt", "updatedAt", "deletedAt"]
  }
];
