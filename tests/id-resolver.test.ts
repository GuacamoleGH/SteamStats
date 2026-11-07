// =============================================================================
// SteamStats — Unit Tests: ID & Vanity Resolver
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import { describe, it, expect } from 'vitest';
import { extractSteamIdentifier, resolveToSteamId64 } from '../src/lib/steam/id-resolver';

/**
 * @fileoverview Pruebas unitarias para la extracción y resolución de perfiles de Steam.
 * @spec REQ-01
 */

describe('Steam ID Resolver (REQ-01)', () => {
  it('debe extraer SteamID numérico directo de 17 dígitos', () => {
    const result = extractSteamIdentifier('76561198337759875');
    expect(result).toEqual({
      type: 'steamid',
      value: '76561198337759875',
    });
  });

  it('debe extraer SteamID desde URL completa de perfiles', () => {
    const result = extractSteamIdentifier('https://steamcommunity.com/profiles/76561198337759875/');
    expect(result).toEqual({
      type: 'steamid',
      value: '76561198337759875',
    });
  });

  it('debe extraer vanity URL desde URL completa de /id/', () => {
    const result = extractSteamIdentifier('https://steamcommunity.com/id/GuacamoleSteam/');
    expect(result).toEqual({
      type: 'vanity',
      value: 'GuacamoleSteam',
    });
  });

  it('debe extraer vanity simple sin protocolo', () => {
    const result = extractSteamIdentifier('GuacamoleSteam');
    expect(result).toEqual({
      type: 'vanity',
      value: 'GuacamoleSteam',
    });
  });

  it('debe resolver el perfil de ejemplo GuacamoleSteam al SteamID64 correcto', async () => {
    const resolved = await resolveToSteamId64('GuacamoleSteam');
    expect(resolved.steamId).toBe('76561198337759875');
    expect(resolved.isVanity).toBe(true);
  });

  it('debe resolver URL directa sin necesidad de API key', async () => {
    const resolved = await resolveToSteamId64('76561198337759875');
    expect(resolved.steamId).toBe('76561198337759875');
    expect(resolved.isVanity).toBe(false);
  });
});
