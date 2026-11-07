// =============================================================================
// SteamStats — Unit Tests: Sales Countdown Engine
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import { describe, it, expect } from 'vitest';
import { calculateCountdown, getSaleStatus, type SaleEvent } from '@/lib/sales';

describe('Sales Countdown Engine (@spec REQ-11)', () => {
  const sampleSales: SaleEvent[] = [
    {
      id: 'autumn-2026',
      name: 'Rebajas de Otoño 2026',
      nameEn: 'Autumn Sale 2026',
      startDate: '2026-11-24T18:00:00Z',
      endDate: '2026-12-01T18:00:00Z',
      type: 'major',
      description: 'Rebajas otoñales',
    },
    {
      id: 'winter-2026',
      name: 'Rebajas de Invierno 2026',
      nameEn: 'Winter Sale 2026',
      startDate: '2026-12-17T18:00:00Z',
      endDate: '2027-01-07T18:00:00Z',
      type: 'major',
      description: 'Rebajas navideñas',
    },
  ];

  it('calculates days, hours, minutes and seconds accurately', () => {
    // 2 days, 3 hours, 4 minutes, 5 seconds
    const now = new Date('2026-11-20T10:00:00Z');
    const target = new Date('2026-11-22T13:04:05Z');

    const countdown = calculateCountdown(target, now);

    expect(countdown.isPast).toBe(false);
    expect(countdown.days).toBe(2);
    expect(countdown.hours).toBe(3);
    expect(countdown.minutes).toBe(4);
    expect(countdown.seconds).toBe(5);
  });

  it('flags past target dates with isPast: true and zeros', () => {
    const now = new Date('2026-11-25T00:00:00Z');
    const target = new Date('2026-11-20T00:00:00Z');

    const countdown = calculateCountdown(target, now);
    expect(countdown.isPast).toBe(true);
    expect(countdown.totalSeconds).toBe(0);
    expect(countdown.days).toBe(0);
    expect(countdown.hours).toBe(0);
  });

  it('identifies upcoming next sale when no sale is currently active', () => {
    const now = new Date('2026-11-10T12:00:00Z');
    const status = getSaleStatus(sampleSales, now);

    expect(status.isSaleActive).toBe(false);
    expect(status.nextSale?.id).toBe('autumn-2026');
    expect(status.countdown).not.toBeNull();
    expect(status.countdown?.days).toBe(14); // 24 - 10 = 14 days
  });

  it('detects when a sale is currently live and calculates remaining time and progress', () => {
    // Halfway through autumn sale
    const now = new Date('2026-11-28T06:00:00Z');
    const status = getSaleStatus(sampleSales, now);

    expect(status.isSaleActive).toBe(true);
    expect(status.currentSale?.id).toBe('autumn-2026');
    expect(status.activeProgressPercent).toBe(50);
    expect(status.countdown?.isPast).toBe(false);
  });

  it('returns empty when no future or active sales exist', () => {
    const now = new Date('2028-01-01T00:00:00Z');
    const status = getSaleStatus(sampleSales, now);

    expect(status.isSaleActive).toBe(false);
    expect(status.nextSale).toBeNull();
    expect(status.currentSale).toBeNull();
  });
});
