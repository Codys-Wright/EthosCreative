import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as SqlClient from "@effect/sql/SqlClient";
import { PgLive } from "../../../../packages/core/src/database/pg-live.js";

const resetDatabase = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  yield* Effect.log("[ResetDatabase] Dropping all tables...");

  // Drop all tables in public schema
  yield* sql`
    DO $$
    DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;
  `;

  yield* Effect.log("[ResetDatabase] All tables dropped.");
  yield* Effect.log(
    "[ResetDatabase] Run `bun run db:migrate` to recreate tables."
  );
});

const ResetLive = Layer.mergeAll(PgLive, BunContext.layer, Logger.pretty);

await Effect.runPromise(
  resetDatabase.pipe(
    Effect.provide(ResetLive),
    Effect.tapError((error) =>
      Effect.logError(`[ResetDatabase] Failed: ${error}`)
    ),
    Effect.orDie
  )
);
