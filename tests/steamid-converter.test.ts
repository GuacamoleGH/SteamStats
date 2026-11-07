// =============================================================================
// SteamStats — Unit Tests: SteamID Multi-Format Converter
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  convertFromSteamId64,
  convertFromSteamId2,
  convertFromSteamId3,
  convertFromAccountId,
  parseAndConvertAnySteamId,
} from '@/lib/steam/steamid-converter';

describe('SteamID Converter Engine (@spec REQ-12)', () => {
  // Datos conocidos para GuacamoleSteam
  const STEAM64 = '76561198337759875';
  const STEAM2 = 'STEAM_0:1:188747073';
  const STEAM3 = '[U:1:377494147]';
  const ACCOUNT_ID = 377494147;

  it('converts accurately from SteamID64', () => {
    const result = convertFromSteamId64(STEAM64);
    expect(result).not.toBeNull();
    expect(result?.steamId64).toBe(STEAM64);
    expect(result?.steamId2).toBe(STEAM2);
    expect(result?.steamId3).toBe(STEAM3);
    expect(result?.accountId).toBe(ACCOUNT_ID);
    expect(result?.profileUrl).toBe(`https://steamcommunity.com/profiles/${STEAM64}`);
  });

  it('converts accurately from SteamID2', () => {
    const result = convertFromSteamId2(STEAM2);
    expect(result).not.toBeNull();
    expect(result?.steamId64).toBe(STEAM64);
    expect(result?.accountId).toBe(ACCOUNT_ID);
    expect(result?.steamId3).toBe(STEAM3);
  });

  it('converts accurately from SteamID3 with and without brackets', () => {
    const withBrackets = convertFromSteamId3(STEAM3);
    expect(withBrackets?.steamId64).toBe(STEAM64);

    const withoutBrackets = convertFromSteamId3('U:1:377494147');
    expect(withoutBrackets?.steamId64).toBe(STEAM64);
  });

  it('converts accurately from 32-bit AccountID', () => {
    const result = convertFromAccountId(ACCOUNT_ID);
    expect(result?.steamId64).toBe(STEAM64);
    expect(result?.steamId2).toBe(STEAM2);
  });

  it('auto-detects and parses any format through parseAndConvertAnySteamId', () => {
    expect(parseAndConvertAnySteamId(STEAM64)?.steamId64).toBe(STEAM64);
    expect(parseAndConvertAnySteamId(STEAM2)?.steamId64).toBe(STEAM64);
    expect(parseAndConvertAnySteamId(STEAM3)?.steamId64).toBe(STEAM64);
    expect(parseAndConvertAnySteamId('377494147')?.steamId64).toBe(STEAM64);
    expect(
      parseAndConvertAnySteamId(`https://steamcommunity.com/profiles/${STEAM64}`)?.steamId64
    ).toBe(STEAM64);
  });

  it('returns null for invalid inputs', () => {
    expect(parseAndConvertAnySteamId('')).toBeNull();
    expect(parseAndConvertAnySteamId('invalid-string')).toBeNull();
    expect(parseAndConvertAnySteamId('12345678901234567890')).toBeNull(); // Too long
  });
});
