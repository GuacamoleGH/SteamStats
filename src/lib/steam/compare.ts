// =============================================================================
// SteamStats — Profile Comparison Engine
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Motor de análisis comparativo entre dos bibliotecas de Steam:
 * juegos compartidos, discrepancia de horas, títulos exclusivos y métricas globales.
 * @spec REQ-09
 */

import { CompleteProfileData, ProfileGameItem } from './api';

export interface SharedGameItem {
  appId: number;
  name: string;
  headerImage: string;
  hoursA: number;
  hoursB: number;
  totalCombinedHours: number;
  diffHours: number;
  leader: 'A' | 'B' | 'tied';
}

export interface ProfileComparisonResult {
  profileA: CompleteProfileData;
  profileB: CompleteProfileData;

  sharedGames: SharedGameItem[];
  onlyAGames: ProfileGameItem[];
  onlyBGames: ProfileGameItem[];

  metrics: {
    sharedCount: number;
    onlyACount: number;
    onlyBCount: number;
    sharedPercentageA: number;
    sharedPercentageB: number;

    hoursA: number;
    hoursB: number;
    hoursDiff: number;
    hoursLeader: 'A' | 'B' | 'tied';

    levelA: number;
    levelB: number;
    levelLeader: 'A' | 'B' | 'tied';

    valueA: number;
    valueB: number;
    valueDiff: number;

    mostPlayedSharedGame: SharedGameItem | null;
  };
}

/**
 * Realiza la comparación exhaustiva entre dos perfiles de Steam.
 * @spec REQ-09
 */
export function compareProfiles(
  profileA: CompleteProfileData,
  profileB: CompleteProfileData
): ProfileComparisonResult {
  const gamesMapA = new Map<number, ProfileGameItem>();
  const allGamesA = [...profileA.topGames, ...(profileA.recentGames || [])];
  // Reconstruir lista de juegos de A
  profileA.topGames.forEach((g) => gamesMapA.set(g.appId, g));

  const gamesMapB = new Map<number, ProfileGameItem>();
  profileB.topGames.forEach((g) => gamesMapB.set(g.appId, g));

  const sharedGames: SharedGameItem[] = [];
  const onlyAGames: ProfileGameItem[] = [];
  const onlyBGames: ProfileGameItem[] = [];

  // 1. Recorrer juegos de A para identificar compartidos y exclusivos de A
  for (const [appId, gameA] of gamesMapA.entries()) {
    if (gamesMapB.has(appId)) {
      const gameB = gamesMapB.get(appId)!;
      const hoursA = gameA.playtimeForeverHours;
      const hoursB = gameB.playtimeForeverHours;
      const totalCombinedHours = Math.round((hoursA + hoursB) * 10) / 10;
      const diffHours = Math.round(Math.abs(hoursA - hoursB) * 10) / 10;
      const leader = hoursA > hoursB ? 'A' : hoursB > hoursA ? 'B' : 'tied';

      sharedGames.push({
        appId,
        name: gameA.name,
        headerImage: gameA.headerImage,
        hoursA,
        hoursB,
        totalCombinedHours,
        diffHours,
        leader,
      });
    } else {
      onlyAGames.push(gameA);
    }
  }

  // 2. Recorrer juegos de B para identificar exclusivos de B
  for (const [appId, gameB] of gamesMapB.entries()) {
    if (!gamesMapA.has(appId)) {
      onlyBGames.push(gameB);
    }
  }

  // Ordenar juegos compartidos por horas combinadas descendente
  sharedGames.sort((a, b) => b.totalCombinedHours - a.totalCombinedHours);

  // Ordenar exclusivos por horas de juego
  onlyAGames.sort((a, b) => b.playtimeForeverHours - a.playtimeForeverHours);
  onlyBGames.sort((a, b) => b.playtimeForeverHours - a.playtimeForeverHours);

  const sharedCount = sharedGames.length;
  const totalGamesA = profileA.stats.totalGames || 1;
  const totalGamesB = profileB.stats.totalGames || 1;

  const sharedPercentageA = Math.round((sharedCount / totalGamesA) * 100);
  const sharedPercentageB = Math.round((sharedCount / totalGamesB) * 100);

  const hoursA = profileA.stats.totalPlaytimeHours;
  const hoursB = profileB.stats.totalPlaytimeHours;
  const hoursDiff = Math.round(Math.abs(hoursA - hoursB) * 10) / 10;
  const hoursLeader = hoursA > hoursB ? 'A' : hoursB > hoursA ? 'B' : 'tied';

  const levelA = profileA.steamLevel;
  const levelB = profileB.steamLevel;
  const levelLeader = levelA > levelB ? 'A' : levelB > levelA ? 'B' : 'tied';

  const valueA = profileA.accountValue.totalCurrentEur;
  const valueB = profileB.accountValue.totalCurrentEur;
  const valueDiff = Math.round(Math.abs(valueA - valueB) * 100) / 100;

  const mostPlayedSharedGame = sharedGames.length > 0 ? sharedGames[0] : null;

  return {
    profileA,
    profileB,
    sharedGames,
    onlyAGames,
    onlyBGames,
    metrics: {
      sharedCount,
      onlyACount: onlyAGames.length,
      onlyBCount: onlyBGames.length,
      sharedPercentageA,
      sharedPercentageB,
      hoursA,
      hoursB,
      hoursDiff,
      hoursLeader,
      levelA,
      levelB,
      levelLeader,
      valueA,
      valueB,
      valueDiff,
      mostPlayedSharedGame,
    },
  };
}
