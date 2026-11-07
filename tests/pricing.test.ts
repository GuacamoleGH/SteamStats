// =============================================================================
// SteamStats — Unit Tests: Pricing, Account Value & Distribution Buckets
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import { describe, it, expect } from 'vitest';
import { calculateAccountValue, calculateDistributions, type GamePriceData } from '@/lib/steam/pricing';
import { formatEur, formatEurFromCents, formatHours, formatNumber } from '@/lib/formatters';

describe('Pricing & Account Value Calculator (@spec REQ-05)', () => {
  const sampleGames: GamePriceData[] = [
    {
      appId: 10,
      name: 'Counter-Strike',
      isFree: false,
      currentPriceCents: 819, // 8.19 €
      lowestPriceCents: 163,  // 1.63 €
      playtimeForeverMin: 600, // 10 hours
    },
    {
      appId: 730,
      name: 'Counter-Strike 2',
      isFree: true,
      currentPriceCents: 0,
      lowestPriceCents: 0,
      playtimeForeverMin: 1200, // 20 hours
    },
    {
      appId: 105600,
      name: 'Terraria',
      isFree: false,
      currentPriceCents: 999, // 9.99 €
      lowestPriceCents: 499,  // 4.99 €
      playtimeForeverMin: 1800, // 30 hours
    },
    {
      appId: 999999,
      name: 'Delisted Game',
      isFree: false,
      currentPriceCents: null, // Unpriced / delisted
      lowestPriceCents: null,
      playtimeForeverMin: 0,
    },
  ];

  it('calculates total current and lowest account values accurately', () => {
    const metrics = calculateAccountValue(sampleGames);

    // Paid games: 8.19 + 9.99 = 18.18 €
    expect(metrics.totalCurrentEur).toBe(18.18);
    // Lowest: 1.63 + 4.99 = 6.62 €
    expect(metrics.totalLowestEur).toBe(6.62);
    // Savings: 18.18 - 6.62 = 11.56 €
    expect(metrics.totalSavingsEur).toBe(11.56);
    expect(metrics.savingsPercent).toBe(64); // Math.round(11.56 / 18.18 * 100)
  });

  it('counts paid, free, and unpriced games correctly', () => {
    const metrics = calculateAccountValue(sampleGames);

    expect(metrics.totalGames).toBe(4);
    expect(metrics.paidGamesCount).toBe(2);
    expect(metrics.freeGamesCount).toBe(1);
    expect(metrics.unpricedGamesCount).toBe(1);
  });

  it('calculates cost per hour for all three modes (all, paid only, played only)', () => {
    const metrics = calculateAccountValue(sampleGames);

    // Total playtime: (600 + 1200 + 1800 + 0) / 60 = 60 hours
    expect(metrics.totalPlaytimeHours).toBe(60);

    // Cost per hour all: 18.18 / 60 = 0.30 €/h
    expect(metrics.costPerHourAll).toBe(0.3);

    // Paid playtime: (600 + 1800) / 60 = 40 hours
    expect(metrics.paidPlaytimeHours).toBe(40);
    // Cost per hour paid: 18.18 / 40 = 0.45 €/h
    expect(metrics.costPerHourPaid).toBe(0.45);

    // Played games cost: paid played (18.18) / total hours (60) = 0.30 €/h
    expect(metrics.costPerHourPlayed).toBe(0.3);
  });

  it('handles empty library gracefully without dividing by zero', () => {
    const metrics = calculateAccountValue([]);

    expect(metrics.totalCurrentEur).toBe(0);
    expect(metrics.costPerHourAll).toBe(0);
    expect(metrics.costPerHourPaid).toBe(0);
    expect(metrics.costPerHourPlayed).toBe(0);
    expect(metrics.totalGames).toBe(0);
  });
});

describe('Distribution Buckets (@spec REQ-06)', () => {
  const games: GamePriceData[] = [
    { appId: 1, playtimeForeverMin: 0, isFree: true, currentPriceCents: 0, lowestPriceCents: 0 }, // Nunca jugado, Gratis
    { appId: 2, playtimeForeverMin: 45, isFree: false, currentPriceCents: 399, lowestPriceCents: 199 }, // 0 - 1 h, < 5 €
    { appId: 3, playtimeForeverMin: 90, isFree: false, currentPriceCents: 799, lowestPriceCents: 499 }, // 1 - 2 h, 5 - 10 €
    { appId: 4, playtimeForeverMin: 150, isFree: false, currentPriceCents: 1499, lowestPriceCents: 999 }, // 2 - 3 h, 10 - 20 €
    { appId: 5, playtimeForeverMin: 300, isFree: false, currentPriceCents: 2999, lowestPriceCents: 1999 }, // 3 - 6 h, 20 - 40 €
    { appId: 6, playtimeForeverMin: 600, isFree: false, currentPriceCents: 4999, lowestPriceCents: 3999 }, // 6 - 12 h, 40 - 60 €
    { appId: 7, playtimeForeverMin: 1200, isFree: false, currentPriceCents: 6999, lowestPriceCents: 5999 }, // 12 - 25 h, 60+ €
    { appId: 8, playtimeForeverMin: 2000, isFree: false, currentPriceCents: 5999, lowestPriceCents: 2999 }, // 25+ h, 40 - 60 €
  ];

  it('segments playtime into 8 accurate buckets', () => {
    const dist = calculateDistributions(games);
    expect(dist.playtimeBuckets).toHaveLength(8);

    const bucketNames = dist.playtimeBuckets.map((b) => b.name);
    expect(bucketNames).toEqual([
      'Nunca jugado',
      '0 - 1 h',
      '1 - 2 h',
      '2 - 3 h',
      '3 - 6 h',
      '6 - 12 h',
      '12 - 25 h',
      '25+ h',
    ]);

    // Every bucket has 1 game
    dist.playtimeBuckets.forEach((b) => {
      expect(b.count).toBe(1);
      expect(b.percentage).toBe(13); // 1/8 * 100 = 12.5 -> 13
    });
  });

  it('segments price into 7 accurate buckets', () => {
    const dist = calculateDistributions(games);
    expect(dist.priceBuckets).toHaveLength(7);

    const priceNames = dist.priceBuckets.map((b) => b.name);
    expect(priceNames).toEqual([
      'Gratis',
      '< 5 €',
      '5 - 10 €',
      '10 - 20 €',
      '20 - 40 €',
      '40 - 60 €',
      '60+ €',
    ]);

    const gratis = dist.priceBuckets.find((b) => b.name === 'Gratis');
    expect(gratis?.count).toBe(1);

    const fortyToSixty = dist.priceBuckets.find((b) => b.name === '40 - 60 €');
    expect(fortyToSixty?.count).toBe(2);
  });
});

describe('Formatters & Localization (es-ES) (@spec RNF-05)', () => {
  it('formats euro cents correctly in es-ES', () => {
    expect(formatEurFromCents(5999)).toMatch(/59,99\s*€/);
    expect(formatEurFromCents(0)).toBe('Gratis');
    expect(formatEurFromCents(null)).toBe('N/D');
  });

  it('formats decimal euros correctly in es-ES', () => {
    expect(formatEur(14.5)).toMatch(/14,50\s*€/);
    expect(formatEur(0)).toBe('Gratis');
    expect(formatEur(null)).toBe('N/D');
  });

  it('formats hours with 1 decimal', () => {
    expect(formatHours(1405.3)).toBe('1.405,3');
  });

  it('formats thousands numbers correctly', () => {
    expect(formatNumber(15420)).toBe('15.420');
  });
});
