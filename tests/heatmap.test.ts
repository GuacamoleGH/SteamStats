// =============================================================================
// SteamStats — Unit Tests: Heatmap & Daily Activity Engine
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  getIntensityLevel,
  formatDateKey,
  generateDateRange,
  calculateDailyActivity,
  type RawSnapshotItem,
} from '@/lib/steam/heatmap';

describe('Heatmap & Daily Activity Engine (@spec REQ-08)', () => {
  it('assigns correct intensity levels based on played minutes', () => {
    expect(getIntensityLevel(0)).toBe(0);
    expect(getIntensityLevel(-10)).toBe(0);
    expect(getIntensityLevel(30)).toBe(1);  // < 1h
    expect(getIntensityLevel(120)).toBe(2); // 1-3h
    expect(getIntensityLevel(240)).toBe(3); // 3-6h
    expect(getIntensityLevel(400)).toBe(4); // > 6h
  });

  it('formats dates consistently to YYYY-MM-DD', () => {
    const d = new Date('2026-11-07T12:00:00Z');
    expect(formatDateKey(d)).toBe('2026-11-07');
  });

  it('generates a full date range of specified length', () => {
    const endDate = new Date('2026-11-07T00:00:00Z');
    const range = generateDateRange(7, endDate);

    expect(range).toHaveLength(7);
    expect(range[range.length - 1]).toBe('2026-11-07');
    expect(range[0]).toBe('2026-11-01');
  });

  it('returns an empty state with hasData: false when no snapshots exist', () => {
    const result = calculateDailyActivity([], 30, new Date('2026-11-07T00:00:00Z'));

    expect(result.hasData).toBe(false);
    expect(result.stats.totalHours).toBe(0);
    expect(result.stats.activeDays).toBe(0);
    expect(result.stats.longestStreak).toBe(0);
    expect(result.days).toHaveLength(30);
    expect(result.days.every((d) => d.minutes === 0 && d.level === 0)).toBe(true);
  });

  it('calculates daily activity by subtracting consecutive snapshots', () => {
    const base = new Date('2026-11-01T00:00:00Z');
    const day1 = new Date('2026-11-02T00:00:00Z');
    const day2 = new Date('2026-11-03T00:00:00Z');
    const day3 = new Date('2026-11-04T00:00:00Z');

    const snapshots: RawSnapshotItem[] = [
      { appId: 730, playtimeForeverMin: 600, snapshotDate: base },
      { appId: 730, playtimeForeverMin: 720, snapshotDate: day1 }, // +120m (2h) -> lvl 2
      { appId: 730, playtimeForeverMin: 720, snapshotDate: day2 }, // +0m (0h) -> lvl 0
      { appId: 730, playtimeForeverMin: 1100, snapshotDate: day3 }, // +380m (6.3h) -> lvl 4
    ];

    const result = calculateDailyActivity(snapshots, 4, day3);

    expect(result.hasData).toBe(true);
    expect(result.stats.activeDays).toBe(2);
    // Total hours: (120 + 380) / 60 = 500 / 60 = 8.3 h
    expect(result.stats.totalHours).toBe(8.3);

    const d1 = result.days.find((d) => d.date === '2026-11-02');
    expect(d1?.minutes).toBe(120);
    expect(d1?.hours).toBe(2);
    expect(d1?.level).toBe(2);

    const d2 = result.days.find((d) => d.date === '2026-11-03');
    expect(d2?.minutes).toBe(0);
    expect(d2?.level).toBe(0);

    const d3 = result.days.find((d) => d.date === '2026-11-04');
    expect(d3?.minutes).toBe(380);
    expect(d3?.level).toBe(4);
  });

  it('calculates longest and current streaks correctly', () => {
    const d0 = new Date('2026-11-01T00:00:00Z');
    const d1 = new Date('2026-11-02T00:00:00Z');
    const d2 = new Date('2026-11-03T00:00:00Z');
    const d3 = new Date('2026-11-04T00:00:00Z');
    const d4 = new Date('2026-11-05T00:00:00Z');

    const snapshots: RawSnapshotItem[] = [
      { appId: 10, playtimeForeverMin: 100, snapshotDate: d0 },
      { appId: 10, playtimeForeverMin: 160, snapshotDate: d1 }, // played
      { appId: 10, playtimeForeverMin: 220, snapshotDate: d2 }, // played
      { appId: 10, playtimeForeverMin: 220, snapshotDate: d3 }, // idle
      { appId: 10, playtimeForeverMin: 300, snapshotDate: d4 }, // played
    ];

    const result = calculateDailyActivity(snapshots, 5, d4);
    expect(result.stats.longestStreak).toBe(2);
    expect(result.stats.currentStreak).toBe(1);
  });
});
