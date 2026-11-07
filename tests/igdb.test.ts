// =============================================================================
// SteamStats — Unit Tests: IGDB Releases Filtering
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import { describe, it, expect } from 'vitest';
import { filterReleases } from '@/lib/igdb/api';
import { IGDBReleaseGame } from '@/lib/igdb/types';

describe('IGDB Upcoming Releases Filter Engine (@spec REQ-10)', () => {
  const sampleReleases: IGDBReleaseGame[] = [
    {
      id: 1,
      name: 'Grand Theft Auto VI',
      summary: 'Acción en Vice City',
      releaseDate: '2026-11-20T00:00:00Z',
      platforms: ['PS5', 'Xbox Series X/S'],
      genres: ['Acción', 'Aventura'],
    },
    {
      id: 2,
      name: 'DOOM: The Dark Ages',
      summary: 'Shooter visceral',
      releaseDate: '2026-11-28T00:00:00Z',
      platforms: ['PC', 'PS5'],
      genres: ['Shooter', 'Acción'],
    },
    {
      id: 3,
      name: 'Monster Hunter Wilds',
      summary: 'Cacerías épicas',
      releaseDate: '2026-12-15T00:00:00Z',
      platforms: ['PC', 'PS5'],
      genres: ['RPG', 'Acción'],
    },
    {
      id: 4,
      name: 'Metroid Prime 4: Beyond',
      summary: 'Exploración con Samus',
      releaseDate: '2027-03-05T00:00:00Z',
      platforms: ['Switch'],
      genres: ['Aventura', 'Shooter'],
    },
  ];

  it('filters by search query case-insensitively', () => {
    const results = filterReleases(sampleReleases, { searchQuery: 'doom' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(2);
  });

  it('filters by month (YYYY-MM)', () => {
    const novResults = filterReleases(sampleReleases, { month: '2026-11' });
    expect(novResults).toHaveLength(2);

    const decResults = filterReleases(sampleReleases, { month: '2026-12' });
    expect(decResults).toHaveLength(1);
    expect(decResults[0].id).toBe(3);
  });

  it('filters by future year 2027+', () => {
    const results = filterReleases(sampleReleases, { month: '2027+' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(4);
  });

  it('filters by genre', () => {
    const rpgResults = filterReleases(sampleReleases, { genre: 'RPG' });
    expect(rpgResults).toHaveLength(1);
    expect(rpgResults[0].id).toBe(3);

    const shooterResults = filterReleases(sampleReleases, { genre: 'Shooter' });
    expect(shooterResults).toHaveLength(2);
  });

  it('filters by interested games (Me interesa)', () => {
    const interested = new Set([1, 4]);
    const results = filterReleases(sampleReleases, { onlyInterested: true }, interested);
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.id)).toEqual([1, 4]);
  });
});
