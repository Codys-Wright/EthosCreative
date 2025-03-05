"use server";
import { Data, Effect as E, Layer } from "effect";

import { Schema as S } from "@effect/schema";
import { eq } from "drizzle-orm";
import { NewCrmObject, NewCrmObjectType } from "./types/crm.type";
import { db } from "@/lib/db";
import { crmObject } from "@/lib/db/schema";

class CrmError extends Data.TaggedError("CrmError")<{
  readonly message: string;
}> {}

export class CrmService extends E.Service<CrmService>()("CrmService", {
  dependencies: [],
  accessors: true,
  effect: E.gen(function* () {
    return {
      /**
       * Get all CRM objects
       */
      getAll: () =>
        E.gen(function* () {
          yield* E.log("Fetching all crm objects from database");
          return E.succeed("hello");
        }),

      /**
       * Get a CRM object by ID
       */
      getById: (id: string) =>
        E.gen(function* () {
          yield* E.log(`Fetching crm object with id: ${id}`);
          return E.succeed(null);
        }),

      /**
       * Create a new CRM object
       * @param input The CRM object to create
       */
      create: (crmObj: NewCrmObjectType) =>
        E.gen(function* () {
          yield* E.log(`Creating new crm object: ${crmObj.name}`);
          const newDbObject = S.encodeSync(NewCrmObject)(crmObj);
          yield* E.log("Transformed crm object to:", newDbObject);
          const dbResponse = yield* E.tryPromise({
            try: () =>
              db
                .insert(crmObject)
                .values({
                  ...newDbObject,
                  createdAt: new Date(),
                })
                .returning(),
            catch: (error) =>
              new CrmError({
                message: `Failed to create crm object: ${error}`,
              }),
          });
          yield* E.log("Successfully created crm object:", dbResponse);
          return dbResponse;
        }),

      /**
       * Get CRM objects by category
       * @param category The category to filter by
       */
      getByCategory: (category: string) =>
        E.gen(function* () {
          yield* E.log(`Fetching crm objects with category: ${category}`);
          return E.succeed([]);
        }),
    };
  }),
}) {
  // static Test = Layer.succeed(
  //     this,
  //     this.make({
  //
  //
  //     })
  // )
}
