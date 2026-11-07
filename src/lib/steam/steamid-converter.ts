// =============================================================================
// SteamStats — SteamID Multi-Format Converter Engine
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Conversor bidireccional entre formatos de identificación de Steam:
 * SteamID64, SteamID2 (STEAM_0:Y:Z), SteamID3 ([U:1:W]) y AccountID (32-bit).
 * Emplea aritmética BigInt para evitar pérdida de precisión de números de 64 bits.
 * @spec REQ-12
 */

export const STEAM64_BASE = 76561197960265728n; // 0x0110000100000000

export interface ConvertedSteamIDs {
  steamId64: string;
  steamId2: string;
  steamId3: string;
  accountId: number;
  profileUrl: string;
  invitedUrl: string;
}

/**
 * Convierte un SteamID64 numérico en todos los formatos estándar de Steam.
 */
export function convertFromSteamId64(steamId64Str: string): ConvertedSteamIDs | null {
  try {
    const trimmed = steamId64Str.trim();
    if (!/^\d{17}$/.test(trimmed)) return null;

    const id64 = BigInt(trimmed);
    if (id64 < STEAM64_BASE) return null;

    const accountIdBig = id64 - STEAM64_BASE;
    const accountId = Number(accountIdBig);

    const y = accountIdBig % 2n;
    const z = accountIdBig / 2n;

    const steamId2 = `STEAM_0:${y}:${z}`;
    const steamId3 = `[U:1:${accountId}]`;
    const profileUrl = `https://steamcommunity.com/profiles/${trimmed}`;
    const invitedUrl = `https://s.team/p/${encodeInviteCode(accountId)}`;

    return {
      steamId64: trimmed,
      steamId2,
      steamId3,
      accountId,
      profileUrl,
      invitedUrl,
    };
  } catch {
    return null;
  }
}

/**
 * Convierte un formato SteamID2 (ej: "STEAM_0:1:188747073" o "STEAM_1:1:188747073") a todos los formatos.
 */
export function convertFromSteamId2(steam2Str: string): ConvertedSteamIDs | null {
  const match = steam2Str.trim().match(/^STEAM_[0-1]:([0-1]):(\d+)$/i);
  if (!match) return null;

  try {
    const y = BigInt(match[1]);
    const z = BigInt(match[2]);
    const accountIdBig = z * 2n + y;
    const id64 = STEAM64_BASE + accountIdBig;

    return convertFromSteamId64(id64.toString());
  } catch {
    return null;
  }
}

/**
 * Convierte un formato SteamID3 (ej: "[U:1:377494147]" o "U:1:377494147") a todos los formatos.
 */
export function convertFromSteamId3(steam3Str: string): ConvertedSteamIDs | null {
  const match = steam3Str.trim().match(/^\[?U:1:(\d+)\]?$/i);
  if (!match) return null;

  try {
    const accountIdBig = BigInt(match[1]);
    const id64 = STEAM64_BASE + accountIdBig;
    return convertFromSteamId64(id64.toString());
  } catch {
    return null;
  }
}

/**
 * Convierte un AccountID de 32 bits a todos los formatos.
 */
export function convertFromAccountId(accountIdNum: number | string): ConvertedSteamIDs | null {
  try {
    const accBig = BigInt(accountIdNum.toString().trim());
    if (accBig <= 0n || accBig > 0xffffffffn) return null;

    const id64 = STEAM64_BASE + accBig;
    return convertFromSteamId64(id64.toString());
  } catch {
    return null;
  }
}

/**
 * Convierte cualquier entrada de usuario en los formatos estándar de Steam.
 */
export function parseAndConvertAnySteamId(input: string): ConvertedSteamIDs | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1. Si es URL de perfil directo (ej: https://steamcommunity.com/profiles/76561198337759875)
  const profileUrlMatch = trimmed.match(/profiles\/(\d{17})/i);
  if (profileUrlMatch) {
    return convertFromSteamId64(profileUrlMatch[1]);
  }

  // 2. Si es SteamID64 de 17 dígitos
  if (/^\d{17}$/.test(trimmed)) {
    return convertFromSteamId64(trimmed);
  }

  // 3. Si es SteamID2 (STEAM_0:Y:Z o STEAM_1:Y:Z)
  if (/^STEAM_[0-1]:[0-1]:\d+$/i.test(trimmed)) {
    return convertFromSteamId2(trimmed);
  }

  // 4. Si es SteamID3 ([U:1:W] o U:1:W)
  if (/^\[?U:1:\d+\]?$/i.test(trimmed)) {
    return convertFromSteamId3(trimmed);
  }

  // 5. Si es número entero menor a 17 dígitos (AccountID de 32 bits)
  if (/^\d{1,10}$/.test(trimmed)) {
    return convertFromAccountId(trimmed);
  }

  return null;
}

/**
 * Genera el código de invitación corto de Steam (ej. s.team/p/...) a partir del AccountID.
 */
function encodeInviteCode(accountId: number): string {
  const chars = 'bcdfghjkmnpqrtvw';
  let num = BigInt(accountId);
  let result = '';

  while (num > 0n) {
    const remainder = Number(num % 16n);
    result = chars[remainder] + result;
    num = num / 16n;
  }

  return result || '0';
}
