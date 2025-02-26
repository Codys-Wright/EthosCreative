import { Schema as S } from "@effect/schema";
import { Effect as E } from "effect";
import { CrmService } from "./crm.service";
import {
  createQueryDataHelpers,
  createQueryKey,
} from "@/features/global/lib/utils/query-data-helpers";
import {
  useEffectMutation,
  useEffectQuery,
} from "@/features/global/lib/utils/tanstack-query";
import { CrmObject, NewCrmObjectType } from "./types/crm.type";

// Define the query key creator with proper typing
const crmQueryKey = createQueryKey("CrmHooks.useUserQuery");
const crmQueryData = createQueryDataHelpers<(typeof CrmObject)[]>(crmQueryKey);

export const useCrmQuery = () => {
  return useEffectQuery({
    queryKey: crmQueryKey(), // This creates the actual query key
    queryFn: () => CrmService.getAll(),
    staleTime: "5 minutes",
  });
};

export const useCrm = (id: string) => {
  return useEffectQuery({
    queryKey: crmQueryKey(),
    queryFn: () => CrmService.getById(id),
    staleTime: "5 minutes",
  });
};
export const useCreateCrmObject = () => {
  return useEffectMutation({
    mutationKey: ["createCrmObject"],
    mutationFn: (input: NewCrmObjectType) =>
      CrmService.create(input).pipe(
        E.tap(() =>
          E.gen(function* () {
            yield* E.log("Optimistically updating crm list");
          }),
        ),
      ),
  });
};
