import { withForbiddenHandling } from "@/features/global/lib/utils/schema-utils";
import { Schema as S } from "@effect/schema";

export const CrmCategory = S.Union(
  S.Literal("info"),
  S.Literal("artistType"),
  S.Literal("image"),
);

export const CrmObject = S.Struct({
  id: S.String,
  name: S.String,
  category: CrmCategory,
  content: withForbiddenHandling(S.Object),
  metadata: withForbiddenHandling(S.Object),
});

export const NewCrmObject = S.Struct({
  id: S.String,
  name: S.String,
  category: CrmCategory,
  content: withForbiddenHandling(S.Object),
  metadata: withForbiddenHandling(S.Object),
});

export type NewCrmObjectType = typeof NewCrmObject.Type;
