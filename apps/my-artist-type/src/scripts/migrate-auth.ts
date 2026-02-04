/**
 * Run Better Auth migrations only.
 *
 * Usage: NETLIFY_DATABASE_URL=<url> bun run ./src/scripts/migrate-auth.ts
 */
import * as Effect from 'effect/Effect';
import * as Logger from 'effect/Logger';
import { runBetterAuthMigrations } from '@auth/database';

console.log('[migrate-auth] Starting Better Auth migrations...');
console.log('[migrate-auth] DATABASE_URL:', process.env.DATABASE_URL ? 'set' : 'not set');
console.log('[migrate-auth] NETLIFY_DATABASE_URL:', process.env.NETLIFY_DATABASE_URL ? 'set' : 'not set');

await Effect.runPromise(
  runBetterAuthMigrations.pipe(Effect.provide(Logger.pretty))
).then(() => {
  console.log('[migrate-auth] Done!');
}).catch((err) => {
  console.error('[migrate-auth] Failed:', err);
  process.exit(1);
});
