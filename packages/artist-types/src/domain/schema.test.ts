import { describe, expect, it } from 'vitest';
import * as S from 'effect/Schema';
import {
  ArtistTypeId,
  ArtistTypeMetadata,
  ArtistTypeNotFoundError,
  ARTIST_TYPE_IDS,
  isValidArtistTypeId,
  normalizeArtistTypeId,
} from './schema.js';

describe('ArtistTypeId', () => {
  it('brands a string as ArtistTypeId', () => {
    const decoded = S.decodeSync(ArtistTypeId)('the-visionary-artist');
    expect(decoded).toBe('the-visionary-artist');
  });

  it('rejects non-string values', () => {
    expect(() => S.decodeSync(ArtistTypeId)(123 as unknown as string)).toThrow(
      'Expected string',
    );
  });
});

describe('ARTIST_TYPE_IDS', () => {
  it('contains exactly 10 artist type IDs', () => {
    expect(ARTIST_TYPE_IDS).toHaveLength(10);
  });

  it('contains all expected artist types', () => {
    expect(ARTIST_TYPE_IDS).toContain('the-visionary-artist');
    expect(ARTIST_TYPE_IDS).toContain('the-consummate-artist');
    expect(ARTIST_TYPE_IDS).toContain('the-analyzer-artist');
    expect(ARTIST_TYPE_IDS).toContain('the-tech-artist');
    expect(ARTIST_TYPE_IDS).toContain('the-entertainer-artist');
    expect(ARTIST_TYPE_IDS).toContain('the-maverick-artist');
    expect(ARTIST_TYPE_IDS).toContain('the-dreamer-artist');
    expect(ARTIST_TYPE_IDS).toContain('the-feeler-artist');
    expect(ARTIST_TYPE_IDS).toContain('the-tortured-artist');
    expect(ARTIST_TYPE_IDS).toContain('the-solo-artist');
  });

  it('all IDs follow the-*-artist naming convention', () => {
    for (const id of ARTIST_TYPE_IDS) {
      expect(id).toMatch(/^the-\w+-artist$/);
    }
  });
});

describe('isValidArtistTypeId', () => {
  it('returns true for valid artist type IDs', () => {
    expect(isValidArtistTypeId('the-visionary-artist')).toBe(true);
    expect(isValidArtistTypeId('the-solo-artist')).toBe(true);
    expect(isValidArtistTypeId('the-tech-artist')).toBe(true);
  });

  it('returns false for invalid IDs', () => {
    expect(isValidArtistTypeId('invalid')).toBe(false);
    expect(isValidArtistTypeId('the-unknown-artist')).toBe(false);
    expect(isValidArtistTypeId('')).toBe(false);
    expect(isValidArtistTypeId('visionary')).toBe(false);
  });
});

describe('normalizeArtistTypeId', () => {
  it('returns full ID unchanged when already in correct format', () => {
    expect(normalizeArtistTypeId('the-visionary-artist')).toBe('the-visionary-artist');
    expect(normalizeArtistTypeId('the-tech-artist')).toBe('the-tech-artist');
  });

  it('converts short slug to full ID format', () => {
    expect(normalizeArtistTypeId('visionary')).toBe('the-visionary-artist');
    expect(normalizeArtistTypeId('tech')).toBe('the-tech-artist');
    expect(normalizeArtistTypeId('solo')).toBe('the-solo-artist');
  });

  it('lowercases the slug before normalizing', () => {
    expect(normalizeArtistTypeId('Visionary')).toBe('the-visionary-artist');
    expect(normalizeArtistTypeId('TECH')).toBe('the-tech-artist');
  });

  it('handles edge cases with partial format', () => {
    // Has "the-" prefix but no "-artist" suffix
    expect(normalizeArtistTypeId('the-visionary')).toBe('the-the-visionary-artist');
    // Has "-artist" suffix but no "the-" prefix
    expect(normalizeArtistTypeId('visionary-artist')).toBe('the-visionary-artist-artist');
  });
});

describe('ArtistTypeNotFoundError', () => {
  it('creates error with correct tag', () => {
    const error = new ArtistTypeNotFoundError({ id: 'test-id' });
    expect(error._tag).toBe('ArtistTypeNotFoundError');
  });

  it('includes the ID in the message', () => {
    const error = new ArtistTypeNotFoundError({ id: 'the-missing-artist' });
    expect(error.message).toBe("Artist type 'the-missing-artist' not found");
  });

  it('stores the id field', () => {
    const error = new ArtistTypeNotFoundError({ id: 'some-id' });
    expect(error.id).toBe('some-id');
  });
});

describe('ArtistTypeMetadata', () => {
  it('decodes metadata with required fields only', () => {
    const result = S.decodeUnknownSync(ArtistTypeMetadata)({
      strengths: ['creativity'],
      challenges: ['focus'],
    });
    expect(result.strengths).toEqual(['creativity']);
    expect(result.challenges).toEqual(['focus']);
  });

  it('decodes metadata with all optional fields', () => {
    const result = S.decodeUnknownSync(ArtistTypeMetadata)({
      strengths: ['creativity'],
      challenges: ['focus'],
      idealCollaborators: ['The Tech Artist'],
      recommendedPractices: ['practice daily'],
      careerPaths: ['Creative Director'],
      colorPalette: ['#FF0000'],
      relatedTypes: ['the-tech-artist'],
    });
    expect(result.idealCollaborators).toEqual(['The Tech Artist']);
    expect(result.careerPaths).toEqual(['Creative Director']);
    expect(result.colorPalette).toEqual(['#FF0000']);
    expect(result.relatedTypes).toEqual(['the-tech-artist']);
  });

  it('rejects metadata missing required strengths', () => {
    expect(() =>
      S.decodeUnknownSync(ArtistTypeMetadata)({
        challenges: ['focus'],
      }),
    ).toThrow('is missing');
  });

  it('rejects metadata missing required challenges', () => {
    expect(() =>
      S.decodeUnknownSync(ArtistTypeMetadata)({
        strengths: ['creativity'],
      }),
    ).toThrow('is missing');
  });
});
