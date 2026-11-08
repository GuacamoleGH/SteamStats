// =============================================================================
// SteamStats — Steam Achievements & Platinums Calculator
// Copyright (c) 2026 GuacamoleGH · steamstats.guacamolegh.es
// Licensed under the MIT License. Built with dbv-specs-ops
// @spec REQ-13
// =============================================================================

export interface GameAchievementProgress {
  appId: number;
  gameName: string;
  headerImage: string;
  achievedCount: number;
  totalCount: number;
  completionPercentage: number;
  isPerfect: boolean;
}

export interface ProfileAchievementsSummary {
  totalAchievementsEarned: number;
  perfectGamesCount: number;
  averageCompletionRate: number;
  gamesTracked: number;
  games: GameAchievementProgress[];
  perfectGames: GameAchievementProgress[];
}

/**
 * Calculates aggregate stats from individual game achievements.
 * @spec REQ-13
 */
export function calculateAchievementsSummary(
  games: GameAchievementProgress[]
): ProfileAchievementsSummary {
  if (!games || games.length === 0) {
    return {
      totalAchievementsEarned: 0,
      perfectGamesCount: 0,
      averageCompletionRate: 0,
      gamesTracked: 0,
      games: [],
      perfectGames: [],
    };
  }

  const validGames = games.filter((g) => g.totalCount > 0);
  const totalEarned = validGames.reduce((acc, g) => acc + g.achievedCount, 0);
  const perfectGames = validGames.filter((g) => g.achievedCount === g.totalCount && g.totalCount > 0);

  const sumPercentages = validGames.reduce((acc, g) => acc + g.completionPercentage, 0);
  const avgRate = validGames.length > 0
    ? Math.round((sumPercentages / validGames.length) * 10) / 10
    : 0;

  // Ordenar: primero los platinos (100%), luego por mayor porcentaje
  const sortedGames = [...validGames].sort((a, b) => {
    if (b.completionPercentage !== a.completionPercentage) {
      return b.completionPercentage - a.completionPercentage;
    }
    return b.achievedCount - a.achievedCount;
  });

  return {
    totalAchievementsEarned: totalEarned,
    perfectGamesCount: perfectGames.length,
    averageCompletionRate: avgRate,
    gamesTracked: validGames.length,
    games: sortedGames,
    perfectGames,
  };
}

/**
 * Fixture data for GuacamoleSteam achievements.
 */
export const GUACAMOLE_ACHIEVEMENTS_FIXTURE: GameAchievementProgress[] = [
  {
    appId: 1091500,
    gameName: 'Cyberpunk 2077',
    headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
    achievedCount: 45,
    totalCount: 45,
    completionPercentage: 100,
    isPerfect: true,
  },
  {
    appId: 730,
    gameName: 'Counter-Strike 2',
    headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg',
    achievedCount: 1,
    totalCount: 1,
    completionPercentage: 100,
    isPerfect: true,
  },
  {
    appId: 1145360,
    gameName: 'Hades',
    headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg',
    achievedCount: 49,
    totalCount: 49,
    completionPercentage: 100,
    isPerfect: true,
  },
  {
    appId: 292030,
    gameName: 'The Witcher 3: Wild Hunt',
    headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg',
    achievedCount: 58,
    totalCount: 78,
    completionPercentage: 74.4,
    isPerfect: false,
  },
  {
    appId: 1245620,
    gameName: 'ELDEN RING',
    headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
    achievedCount: 36,
    totalCount: 42,
    completionPercentage: 85.7,
    isPerfect: false,
  },
  {
    appId: 413150,
    gameName: 'Stardew Valley',
    headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg',
    achievedCount: 28,
    totalCount: 40,
    completionPercentage: 70.0,
    isPerfect: false,
  },
];

/**
 * Fetches achievement progress for a given Steam profile and game list.
 * @spec REQ-13
 */
export async function getProfileAchievements(
  steamId: string,
  topGames: Array<{ appId: number; name: string; headerImage: string }>
): Promise<ProfileAchievementsSummary> {
  const apiKey = process.env.STEAM_API_KEY;

  // Si no hay API key, servir el fixture oficial
  if (!apiKey) {
    return calculateAchievementsSummary(GUACAMOLE_ACHIEVEMENTS_FIXTURE);
  }

  // Si hay API key, consultar los juegos más jugados
  const results: GameAchievementProgress[] = [];

  for (const game of topGames.slice(0, 6)) {
    try {
      const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${game.appId}&key=${apiKey}&steamid=${steamId}`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) continue;

      const data = await res.json();
      const achievements: Array<{ apiname: string; achieved: number }> =
        data.playerstats?.achievements || [];

      if (achievements.length > 0) {
        const achievedCount = achievements.filter((a) => a.achieved === 1).length;
        const totalCount = achievements.length;
        const completionPercentage = Math.round((achievedCount / totalCount) * 1000) / 10;

        results.push({
          appId: game.appId,
          gameName: game.name,
          headerImage: game.headerImage,
          achievedCount,
          totalCount,
          completionPercentage,
          isPerfect: achievedCount === totalCount && totalCount > 0,
        });
      }
    } catch {
      // Ignorar fallos puntuales por juego
    }
  }

  if (results.length === 0) {
    return calculateAchievementsSummary(GUACAMOLE_ACHIEVEMENTS_FIXTURE);
  }

  return calculateAchievementsSummary(results);
}
