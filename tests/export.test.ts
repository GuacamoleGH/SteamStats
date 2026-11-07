// =============================================================================
// SteamStats — Library Exporter Tests
// Copyright (c) 2026 GuacamoleGH · steamstats.guacamolegh.es
// Licensed under the MIT License. Built with dbv-specs-ops
// @spec REQ-15, RNF-01
// =============================================================================

import { describe, it, expect } from 'vitest';
import { generateLibraryCsv, generateLibraryJson, ExportableGame } from '../src/lib/export';

describe('Library Exporter (@spec REQ-15)', () => {
  const sampleGames: ExportableGame[] = [
    {
      appId: 730,
      name: 'Counter-Strike 2',
      playtimeForeverMin: 12000,
      isFree: true,
      priceEurCents: 0,
    },
    {
      appId: 1091500,
      name: 'Cyberpunk 2077, Deluxe "Edition"',
      playtimeForeverMin: 6000,
      isFree: false,
      priceEurCents: 5999,
    },
    {
      appId: 292030,
      name: 'The Witcher 3: Wild Hunt',
      playtimeForeverMin: 0,
      isFree: false,
      priceEurCents: 2999,
    },
  ];

  it('generates valid RFC 4180 CSV with escaped quotes and commas', () => {
    const csv = generateLibraryCsv(sampleGames);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('appId,name,playtimeHours,priceEur,costPerHourEur,status');
    expect(lines[1]).toContain('730,Counter-Strike 2,200.0,0.00,0.00,Free to Play');
    // Name with comma and quotes must be escaped
    expect(lines[2]).toContain('"Cyberpunk 2077, Deluxe ""Edition"""');
    expect(lines[3]).toContain('292030,The Witcher 3: Wild Hunt,0.0,29.99,0.00,Unplayed (Pile of Shame)');
  });

  it('generates well-formatted JSON with metadata', () => {
    const profile = { steamId64: '76561198337759875', personaName: 'GuacamoleSteam' };
    const jsonStr = generateLibraryJson(profile, sampleGames);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.generator).toContain('SteamStats');
    expect(parsed.profile.personaName).toBe('GuacamoleSteam');
    expect(parsed.games).toHaveLength(3);
    expect(parsed.games[0].appId).toBe(730);
    expect(parsed.games[0].isFree).toBe(true);
    expect(parsed.games[1].priceEur).toBe(59.99);
  });
});
