// =============================================================================
// SteamStats — Library Exporter Utility
// Copyright (c) 2026 GuacamoleGH · steamstats.guacamolegh.es
// Licensed under the MIT License. Built with dbv-specs-ops
// @spec REQ-15
// =============================================================================

export interface ExportableGame {
  appId: number;
  name: string;
  playtimeForeverMin: number;
  priceEurCents?: number | null;
  isFree?: boolean;
}

/**
 * Escapes a field for CSV compliance (RFC 4180).
 */
function escapeCsvField(val: string | number): string {
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates a clean CSV file string from owned games list.
 * @spec REQ-15
 */
export function generateLibraryCsv(games: ExportableGame[]): string {
  const headers = ['appId', 'name', 'playtimeHours', 'priceEur', 'costPerHourEur', 'status'];
  
  const rows = games.map((game) => {
    const hours = Math.round((game.playtimeForeverMin / 60) * 10) / 10;
    const price = game.isFree
      ? 0
      : typeof game.priceEurCents === 'number'
      ? Math.round(game.priceEurCents) / 100
      : 0;
    
    let costPerHour = 0;
    if (hours > 0 && price > 0) {
      costPerHour = Math.round((price / hours) * 100) / 100;
    }

    const status = game.isFree
      ? 'Free to Play'
      : hours === 0
      ? 'Unplayed (Pile of Shame)'
      : 'Played';

    return [
      escapeCsvField(game.appId),
      escapeCsvField(game.name),
      hours.toFixed(1),
      price.toFixed(2),
      costPerHour.toFixed(2),
      escapeCsvField(status),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generates formatted JSON data for export.
 * @spec REQ-15
 */
export function generateLibraryJson(
  profile: { steamId64: string; personaName: string },
  games: ExportableGame[]
): string {
  const data = {
    exportedAt: new Date().toISOString(),
    generator: 'SteamStats GuacamoleGH (steamstats.guacamolegh.es)',
    profile: {
      steamId64: profile.steamId64,
      personaName: profile.personaName,
      totalGames: games.length,
    },
    games: games.map((g) => ({
      appId: g.appId,
      name: g.name,
      playtimeMinutes: g.playtimeForeverMin,
      playtimeHours: Math.round((g.playtimeForeverMin / 60) * 10) / 10,
      priceEur: g.isFree
        ? 0
        : typeof g.priceEurCents === 'number'
        ? Math.round(g.priceEurCents) / 100
        : null,
      isFree: !!g.isFree,
    })),
  };

  return JSON.stringify(data, null, 2);
}
