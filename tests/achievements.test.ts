// =============================================================================
// SteamStats — Achievements Calculator Tests
// Copyright (c) 2026 GuacamoleGH · steamstats.guacamolegh.es
// Licensed under the MIT License. Built with dbv-specs-ops
// @spec REQ-13, RNF-01
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  calculateAchievementsSummary,
  GUACAMOLE_ACHIEVEMENTS_FIXTURE,
  GameAchievementProgress,
} from '../src/lib/steam/achievements';

describe('Achievements Calculator (@spec REQ-13)', () => {
  it('handles empty input gracefully', () => {
    const summary = calculateAchievementsSummary([]);
    expect(summary.totalAchievementsEarned).toBe(0);
    expect(summary.perfectGamesCount).toBe(0);
    expect(summary.averageCompletionRate).toBe(0);
    expect(summary.games).toEqual([]);
  });

  it('correctly calculates perfect games and average completion', () => {
    const summary = calculateAchievementsSummary(GUACAMOLE_ACHIEVEMENTS_FIXTURE);

    // Cyberpunk (45/45), CS2 (1/1), Hades (49/49) = 3 perfect games
    expect(summary.perfectGamesCount).toBe(3);
    expect(summary.perfectGames).toHaveLength(3);
    expect(summary.totalAchievementsEarned).toBe(45 + 1 + 49 + 58 + 36 + 28);
    expect(summary.gamesTracked).toBe(6);
    expect(summary.averageCompletionRate).toBeGreaterThan(70);
  });

  it('sorts games by completion percentage descending', () => {
    const games: GameAchievementProgress[] = [
      {
        appId: 1,
        gameName: 'Game 50%',
        headerImage: '',
        achievedCount: 5,
        totalCount: 10,
        completionPercentage: 50,
        isPerfect: false,
      },
      {
        appId: 2,
        gameName: 'Game 100%',
        headerImage: '',
        achievedCount: 10,
        totalCount: 10,
        completionPercentage: 100,
        isPerfect: true,
      },
      {
        appId: 3,
        gameName: 'Game 20%',
        headerImage: '',
        achievedCount: 2,
        totalCount: 10,
        completionPercentage: 20,
        isPerfect: false,
      },
    ];

    const summary = calculateAchievementsSummary(games);
    expect(summary.games[0].appId).toBe(2);
    expect(summary.games[1].appId).toBe(1);
    expect(summary.games[2].appId).toBe(3);
  });
});
