// =============================================================================
// SteamStats — Unit Tests: Profile Comparison Engine
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import { describe, it, expect } from 'vitest';
import { compareProfiles } from '@/lib/steam/compare';
import { CompleteProfileData } from '@/lib/steam/api';

describe('Profile Comparison Engine (@spec REQ-09)', () => {
  const mockProfileA: CompleteProfileData = {
    steamId: '76561198337759875',
    personaName: 'Player One',
    avatarUrl: 'https://example.com/avatar1.jpg',
    profileUrl: 'https://steamcommunity.com/id/playerone',
    steamLevel: 50,
    isPrivate: false,
    levelInfo: {
      currentLevel: 50,
      xpForCurrentLevel: 15000,
      xpForNextLevel: 15600,
      xpNeededForNextLevel: 600,
      currentXpProgress: 300,
      progressPercentage: 50,
    },
    stats: {
      totalGames: 10,
      playedGames: 8,
      unplayedGames: 2,
      unplayedPercentage: 20,
      totalPlaytimeHours: 500,
      twoWeeksPlaytimeHours: 20,
      badgesCount: 15,
    },
    accountValue: {
      totalCurrentEur: 450,
      totalLowestEur: 200,
      totalSavingsEur: 250,
      savingsPercent: 55,
      totalGames: 10,
      paidGamesCount: 8,
      freeGamesCount: 2,
      unpricedGamesCount: 0,
      costPerHourAll: 0.9,
      costPerHourPaid: 1.1,
      costPerHourPlayed: 0.9,
      totalPlaytimeHours: 500,
      paidPlaytimeHours: 400,
      playedGamesPlaytimeHours: 500,
    },
    distributions: { playtimeBuckets: [], priceBuckets: [] },
    topGames: [
      {
        appId: 730,
        name: 'Counter-Strike 2',
        headerImage: 'cs2.jpg',
        playtimeForeverMin: 6000,
        playtimeForeverHours: 100,
        playtime2WeeksMin: 0,
        playtime2WeeksHours: 0,
        hasPlayed: true,
      },
      {
        appId: 1086940,
        name: "Baldur's Gate 3",
        headerImage: 'bg3.jpg',
        playtimeForeverMin: 12000,
        playtimeForeverHours: 200,
        playtime2WeeksMin: 0,
        playtime2WeeksHours: 0,
        hasPlayed: true,
      },
      {
        appId: 10,
        name: 'Game Only A',
        headerImage: 'a.jpg',
        playtimeForeverMin: 3000,
        playtimeForeverHours: 50,
        playtime2WeeksMin: 0,
        playtime2WeeksHours: 0,
        hasPlayed: true,
      },
    ],
    recentGames: [],
    badges: [],
    lastUpdated: new Date(),
    isCached: false,
  };

  const mockProfileB: CompleteProfileData = {
    steamId: '76561198000000000',
    personaName: 'Player Two',
    avatarUrl: 'https://example.com/avatar2.jpg',
    profileUrl: 'https://steamcommunity.com/id/playertwo',
    steamLevel: 40,
    isPrivate: false,
    levelInfo: {
      currentLevel: 40,
      xpForCurrentLevel: 10000,
      xpForNextLevel: 10500,
      xpNeededForNextLevel: 500,
      currentXpProgress: 250,
      progressPercentage: 50,
    },
    stats: {
      totalGames: 8,
      playedGames: 6,
      unplayedGames: 2,
      unplayedPercentage: 25,
      totalPlaytimeHours: 400,
      twoWeeksPlaytimeHours: 15,
      badgesCount: 10,
    },
    accountValue: {
      totalCurrentEur: 300,
      totalLowestEur: 150,
      totalSavingsEur: 150,
      savingsPercent: 50,
      totalGames: 8,
      paidGamesCount: 6,
      freeGamesCount: 2,
      unpricedGamesCount: 0,
      costPerHourAll: 0.75,
      costPerHourPaid: 0.9,
      costPerHourPlayed: 0.75,
      totalPlaytimeHours: 400,
      paidPlaytimeHours: 350,
      playedGamesPlaytimeHours: 400,
    },
    distributions: { playtimeBuckets: [], priceBuckets: [] },
    topGames: [
      {
        appId: 730,
        name: 'Counter-Strike 2',
        headerImage: 'cs2.jpg',
        playtimeForeverMin: 18000,
        playtimeForeverHours: 300,
        playtime2WeeksMin: 0,
        playtime2WeeksHours: 0,
        hasPlayed: true,
      },
      {
        appId: 1086940,
        name: "Baldur's Gate 3",
        headerImage: 'bg3.jpg',
        playtimeForeverMin: 6000,
        playtimeForeverHours: 100,
        playtime2WeeksMin: 0,
        playtime2WeeksHours: 0,
        hasPlayed: true,
      },
      {
        appId: 20,
        name: 'Game Only B',
        headerImage: 'b.jpg',
        playtimeForeverMin: 1800,
        playtimeForeverHours: 30,
        playtime2WeeksMin: 0,
        playtime2WeeksHours: 0,
        hasPlayed: true,
      },
    ],
    recentGames: [],
    badges: [],
    lastUpdated: new Date(),
    isCached: false,
  };

  it('correctly identifies shared games and assigns the leader per game', () => {
    const result = compareProfiles(mockProfileA, mockProfileB);

    expect(result.sharedGames).toHaveLength(2);

    // CS2: A has 100h, B has 300h -> Combined = 400h, Leader is B
    const cs2 = result.sharedGames.find((g) => g.appId === 730);
    expect(cs2).toBeDefined();
    expect(cs2?.hoursA).toBe(100);
    expect(cs2?.hoursB).toBe(300);
    expect(cs2?.totalCombinedHours).toBe(400);
    expect(cs2?.leader).toBe('B');

    // BG3: A has 200h, B has 100h -> Combined = 300h, Leader is A
    const bg3 = result.sharedGames.find((g) => g.appId === 1086940);
    expect(bg3).toBeDefined();
    expect(bg3?.hoursA).toBe(200);
    expect(bg3?.hoursB).toBe(100);
    expect(bg3?.leader).toBe('A');
  });

  it('identifies exclusive games for each player', () => {
    const result = compareProfiles(mockProfileA, mockProfileB);

    expect(result.onlyAGames).toHaveLength(1);
    expect(result.onlyAGames[0].appId).toBe(10);

    expect(result.onlyBGames).toHaveLength(1);
    expect(result.onlyBGames[0].appId).toBe(20);
  });

  it('calculates global comparison metrics', () => {
    const result = compareProfiles(mockProfileA, mockProfileB);

    expect(result.metrics.sharedCount).toBe(2);
    expect(result.metrics.hoursLeader).toBe('A'); // 500 > 400
    expect(result.metrics.hoursDiff).toBe(100);
    expect(result.metrics.levelLeader).toBe('A'); // 50 > 40
    expect(result.metrics.valueDiff).toBe(150); // 450 - 300
    expect(result.metrics.mostPlayedSharedGame?.appId).toBe(730);
  });
});
