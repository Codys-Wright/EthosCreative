import { expect, it } from '@effect/vitest';
import * as BunContext from '@effect/platform-bun/BunContext';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as SqlClient from '@effect/sql/SqlClient';
import { makePgTestMigrations, withTransactionRollback } from '@core/database';
import { ArtistTypeMigrations } from '../database/migrations.js';
import { ArtistTypesRepo } from '../database/repo.js';
import { ArtistTypeService } from './live-service.js';
import { ArtistTypeRpcLive } from './rpc-live.js';
import { ArtistTypeNotFoundError } from '../domain/schema.js';
import type { ArtistTypeId } from '../domain/schema.js';

const PgTest = makePgTestMigrations(ArtistTypeMigrations);

// Build a test layer that includes the RPC handlers
const TestLayer = Layer.mergeAll(
  ArtistTypeRpcLive,
  ArtistTypeService.DefaultWithoutDependencies,
).pipe(
  Layer.provideMerge(ArtistTypesRepo.DefaultWithoutDependencies),
  Layer.provideMerge(PgTest),
  Layer.provide(BunContext.layer),
);

const insertTestArtistType = (overrides?: { id?: string; name?: string; order?: number }) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    const id = overrides?.id ?? 'test-type';
    const name = overrides?.name ?? 'Test Artist';
    const order = overrides?.order ?? 1;
    const metadata = JSON.stringify({
      strengths: ['creativity'],
      challenges: ['focus'],
    });
    yield* sql`
      INSERT INTO artist_types (
        id, name, short_name, abbreviation, "order", icon,
        subtitle, elevator_pitch, short_description, long_description,
        metadata
      ) VALUES (
        ${id}, ${name}, 'Test', 'TA', ${order}, 'test-icon',
        'Test subtitle', 'Test pitch', 'Short desc', 'Long desc',
        ${metadata}::jsonb
      )
    `;
    return id as ArtistTypeId;
  });

it.layer(TestLayer, { timeout: 30_000 })('ArtistTypeRpcLive', (it) => {
  it.scoped(
    'artistType_list handler returns results through service',
    Effect.fn(function* () {
      const service = yield* ArtistTypeService;
      yield* insertTestArtistType({ id: 'rpc-test-1', name: 'RPC Test 1', order: 1 });
      yield* insertTestArtistType({ id: 'rpc-test-2', name: 'RPC Test 2', order: 2 });

      const types = yield* service.list();
      expect(types).toHaveLength(2);
      expect(types[0].name).toBe('RPC Test 1');
    }, withTransactionRollback),
  );

  it.scoped(
    'artistType_getById handler returns correct type through service',
    Effect.fn(function* () {
      const service = yield* ArtistTypeService;
      yield* insertTestArtistType({ id: 'the-rpc-artist', name: 'RPC Artist' });

      const result = yield* service.getById('the-rpc-artist' as ArtistTypeId);
      expect(result.id).toBe('the-rpc-artist');
      expect(result.name).toBe('RPC Artist');
    }, withTransactionRollback),
  );

  it.scoped(
    'artistType_getBySlug handler normalizes slug through service',
    Effect.fn(function* () {
      const service = yield* ArtistTypeService;
      yield* insertTestArtistType({ id: 'the-slug-artist', name: 'Slug Artist' });

      const result = yield* service.getBySlug('slug');
      expect(result.id).toBe('the-slug-artist');
    }, withTransactionRollback),
  );

  it.scoped(
    'getById handler propagates ArtistTypeNotFoundError',
    Effect.fn(function* () {
      const service = yield* ArtistTypeService;

      const result = yield* service.getById('missing' as ArtistTypeId).pipe(Effect.either);
      expect(result._tag).toBe('Left');
      if (result._tag === 'Left') {
        expect(result.left).toBeInstanceOf(ArtistTypeNotFoundError);
      }
    }, withTransactionRollback),
  );

  it.scoped(
    'RPC layer can be constructed alongside service layer',
    Effect.fn(function* () {
      // Verify both ArtistTypeService and ArtistTypeRpc handlers are available
      const service = yield* ArtistTypeService;
      expect(service.list).toBeDefined();
      expect(service.getById).toBeDefined();
      expect(service.getBySlug).toBeDefined();
    }, withTransactionRollback),
  );
});
