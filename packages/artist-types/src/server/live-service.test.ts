import { expect, it } from '@effect/vitest';
import * as BunContext from '@effect/platform-bun/BunContext';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as SqlClient from '@effect/sql/SqlClient';
import { makePgTestMigrations, withTransactionRollback } from '@core/database';
import { ArtistTypeMigrations } from '../database/migrations.js';
import { ArtistTypesRepo } from '../database/repo.js';
import { ArtistTypeService } from './live-service.js';
import { ArtistTypeNotFoundError } from '../domain/schema.js';
import type { ArtistTypeId } from '../domain/schema.js';

const PgTest = makePgTestMigrations(ArtistTypeMigrations);

const TestLayer = ArtistTypeService.DefaultWithoutDependencies.pipe(
  Layer.provideMerge(ArtistTypesRepo.DefaultWithoutDependencies),
  Layer.provideMerge(PgTest),
  Layer.provide(BunContext.layer),
);

// Helper to insert test data directly via SQL
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

it.layer(TestLayer, { timeout: 30_000 })('ArtistTypeService', (it) => {
  it.scoped(
    'list - returns empty array when no artist types exist',
    Effect.fn(function* () {
      const service = yield* ArtistTypeService;
      const types = yield* service.list();
      expect(types).toHaveLength(0);
    }, withTransactionRollback),
  );

  it.scoped(
    'list - returns all artist types ordered by order field',
    Effect.fn(function* () {
      const service = yield* ArtistTypeService;

      yield* insertTestArtistType({ id: 'type-c', name: 'Third', order: 3 });
      yield* insertTestArtistType({ id: 'type-a', name: 'First', order: 1 });
      yield* insertTestArtistType({ id: 'type-b', name: 'Second', order: 2 });

      const types = yield* service.list();
      expect(types).toHaveLength(3);
      expect(types[0].name).toBe('First');
      expect(types[1].name).toBe('Second');
      expect(types[2].name).toBe('Third');
    }, withTransactionRollback),
  );

  it.scoped(
    'getById - returns artist type when found',
    Effect.fn(function* () {
      const service = yield* ArtistTypeService;
      yield* insertTestArtistType({ id: 'the-test-artist', name: 'Test Artist' });

      const result = yield* service.getById('the-test-artist' as ArtistTypeId);
      expect(result.id).toBe('the-test-artist');
      expect(result.name).toBe('Test Artist');
    }, withTransactionRollback),
  );

  it.scoped(
    'getById - fails with ArtistTypeNotFoundError for missing type',
    Effect.fn(function* () {
      const service = yield* ArtistTypeService;

      const result = yield* service.getById('nonexistent' as ArtistTypeId).pipe(Effect.either);
      expect(result._tag).toBe('Left');
      if (result._tag === 'Left') {
        expect(result.left).toBeInstanceOf(ArtistTypeNotFoundError);
      }
    }, withTransactionRollback),
  );

  it.scoped(
    'getBySlug - resolves short slug to full ID and returns artist type',
    Effect.fn(function* () {
      const service = yield* ArtistTypeService;
      yield* insertTestArtistType({ id: 'the-visionary-artist', name: 'Visionary' });

      const result = yield* service.getBySlug('visionary');
      expect(result.id).toBe('the-visionary-artist');
      expect(result.name).toBe('Visionary');
    }, withTransactionRollback),
  );

  it.scoped(
    'getBySlug - handles full ID format directly',
    Effect.fn(function* () {
      const service = yield* ArtistTypeService;
      yield* insertTestArtistType({ id: 'the-tech-artist', name: 'Tech' });

      const result = yield* service.getBySlug('the-tech-artist');
      expect(result.id).toBe('the-tech-artist');
    }, withTransactionRollback),
  );

  it.scoped(
    'getBySlug - fails with ArtistTypeNotFoundError for invalid slug',
    Effect.fn(function* () {
      const service = yield* ArtistTypeService;

      const result = yield* service.getBySlug('nonexistent').pipe(Effect.either);
      expect(result._tag).toBe('Left');
      if (result._tag === 'Left') {
        expect(result.left).toBeInstanceOf(ArtistTypeNotFoundError);
      }
    }, withTransactionRollback),
  );

  it.scoped(
    'invalidateCache - runs without error',
    Effect.fn(function* () {
      const service = yield* ArtistTypeService;
      // Should complete without throwing
      yield* service.invalidateCache();
    }, withTransactionRollback),
  );
});
