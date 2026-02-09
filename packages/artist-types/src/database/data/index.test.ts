import { describe, expect, it } from 'vitest';
import {
  getAllArtistTypeSeedData,
  getArtistTypeSeedData,
  getArtistTypeSeedDataBySlug,
  getArtistTypeSeedDataByOrder,
  getAllArtistTypeSeedDataSync,
  getArtistTypeSeedDataSync,
  getArtistTypeSeedDataBySlugSync,
} from './index.js';

describe('getAllArtistTypeSeedData', () => {
  it('returns all 10 artist types', async () => {
    const data = await getAllArtistTypeSeedData();
    expect(data).toHaveLength(10);
  });

  it('each artist type has required fields', async () => {
    const data = await getAllArtistTypeSeedData();
    for (const artist of data) {
      expect(artist.id).toBeTruthy();
      expect(artist.name).toBeTruthy();
      expect(artist.shortName).toBeTruthy();
      expect(artist.abbreviation).toBeTruthy();
      expect(typeof artist.order).toBe('number');
      expect(artist.icon).toBeTruthy();
      expect(artist.subtitle).toBeTruthy();
      expect(artist.elevatorPitch).toBeTruthy();
      expect(artist.shortDescription).toBeTruthy();
      expect(artist.longDescription).toBeTruthy();
      expect(artist.metadata.strengths.length).toBeGreaterThan(0);
      expect(artist.metadata.challenges.length).toBeGreaterThan(0);
    }
  });

  it('all IDs are unique', async () => {
    const data = await getAllArtistTypeSeedData();
    const ids = data.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all orders are unique', async () => {
    const data = await getAllArtistTypeSeedData();
    const orders = data.map((d) => d.order);
    expect(new Set(orders).size).toBe(orders.length);
  });
});

describe('getArtistTypeSeedData', () => {
  it('returns artist type by full ID', async () => {
    const data = await getArtistTypeSeedData('the-visionary-artist');
    expect(data).not.toBeNull();
    expect(data!.id).toBe('the-visionary-artist');
    expect(data!.name).toBe('The Visionary Artist');
  });

  it('returns null for non-existent ID', async () => {
    const data = await getArtistTypeSeedData('the-nonexistent-artist');
    expect(data).toBeNull();
  });

  it('returns null for empty string', async () => {
    const data = await getArtistTypeSeedData('');
    expect(data).toBeNull();
  });
});

describe('getArtistTypeSeedDataBySlug', () => {
  it('resolves full ID format', async () => {
    const data = await getArtistTypeSeedDataBySlug('the-visionary-artist');
    expect(data).not.toBeNull();
    expect(data!.id).toBe('the-visionary-artist');
  });

  it('resolves short slug to full ID', async () => {
    const data = await getArtistTypeSeedDataBySlug('visionary');
    expect(data).not.toBeNull();
    expect(data!.id).toBe('the-visionary-artist');
  });

  it('resolves all short slugs correctly', async () => {
    const slugMap: Record<string, string> = {
      visionary: 'the-visionary-artist',
      consummate: 'the-consummate-artist',
      analyzer: 'the-analyzer-artist',
      tech: 'the-tech-artist',
      entertainer: 'the-entertainer-artist',
      maverick: 'the-maverick-artist',
      dreamer: 'the-dreamer-artist',
      feeler: 'the-feeler-artist',
      tortured: 'the-tortured-artist',
      solo: 'the-solo-artist',
    };
    for (const [slug, expectedId] of Object.entries(slugMap)) {
      const data = await getArtistTypeSeedDataBySlug(slug);
      expect(data).not.toBeNull();
      expect(data!.id).toBe(expectedId);
    }
  });

  it('returns null for invalid slug', async () => {
    const data = await getArtistTypeSeedDataBySlug('nonexistent');
    expect(data).toBeNull();
  });
});

describe('getArtistTypeSeedDataByOrder', () => {
  it('returns artist type by order number', async () => {
    const data = await getArtistTypeSeedDataByOrder(1);
    expect(data).not.toBeNull();
    expect(data!.order).toBe(1);
  });

  it('returns null for non-existent order', async () => {
    const data = await getArtistTypeSeedDataByOrder(999);
    expect(data).toBeNull();
  });

  it('all orders from 1 to 10 are present', async () => {
    for (let order = 1; order <= 10; order++) {
      const data = await getArtistTypeSeedDataByOrder(order);
      expect(data).not.toBeNull();
      expect(data!.order).toBe(order);
    }
  });
});

describe('sync variants', () => {
  it('getAllArtistTypeSeedDataSync returns all types', () => {
    const data = getAllArtistTypeSeedDataSync();
    expect(data).toHaveLength(10);
  });

  it('getArtistTypeSeedDataSync returns by ID', () => {
    const data = getArtistTypeSeedDataSync('the-tech-artist');
    expect(data).not.toBeNull();
    expect(data!.shortName).toBe('Tech');
  });

  it('getArtistTypeSeedDataSync returns null for invalid ID', () => {
    const data = getArtistTypeSeedDataSync('not-a-real-id');
    expect(data).toBeNull();
  });

  it('getArtistTypeSeedDataBySlugSync resolves slugs', () => {
    const data = getArtistTypeSeedDataBySlugSync('dreamer');
    expect(data).not.toBeNull();
    expect(data!.id).toBe('the-dreamer-artist');
  });

  it('getArtistTypeSeedDataBySlugSync resolves full IDs', () => {
    const data = getArtistTypeSeedDataBySlugSync('the-feeler-artist');
    expect(data).not.toBeNull();
    expect(data!.id).toBe('the-feeler-artist');
  });
});
