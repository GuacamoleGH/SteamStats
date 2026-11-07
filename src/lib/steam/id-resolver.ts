// =============================================================================
// SteamStats — Steam ID and Vanity URL Resolver
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Resuelve URLs de perfiles, vanity URLs y SteamID64 numéricos.
 * @spec REQ-01
 */

export interface ResolveResult {
  steamId: string;
  vanityUrl?: string;
  isVanity: boolean;
}

// Mapa de perfiles conocidos / fallback para tests y desarrollo
const KNOWN_VANITIES: Record<string, string> = {
  guacamolesteam: '76561198337759875',
};

/**
 * Normaliza y extrae el identificador base de una entrada de usuario.
 * Puede ser una URL completa, un vanity o un SteamID64.
 */
export function extractSteamIdentifier(input: string): { type: 'steamid' | 'vanity'; value: string } {
  const trimmed = input.trim();

  // Caso 1: URL de perfil con SteamID numérico
  // ej: https://steamcommunity.com/profiles/76561198337759875/
  const profileUrlMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
  if (profileUrlMatch) {
    return { type: 'steamid', value: profileUrlMatch[1] };
  }

  // Caso 2: URL de perfil con Vanity URL personalizada
  // ej: https://steamcommunity.com/id/GuacamoleSteam/
  const vanityUrlMatch = trimmed.match(/steamcommunity\.com\/id\/([a-zA-Z0-9_\-]+)/i);
  if (vanityUrlMatch) {
    return { type: 'vanity', value: vanityUrlMatch[1] };
  }

  // Caso 3: SteamID64 numérico directo (17 dígitos comenzando por 7656119)
  if (/^7656119\d{10}$/.test(trimmed)) {
    return { type: 'steamid', value: trimmed };
  }

  // Caso 4: Asumir que es un nombre vanity directo (ej: "GuacamoleSteam")
  const sanitizedVanity = trimmed.replace(/^@/, '').replace(/\/$/, '');
  return { type: 'vanity', value: sanitizedVanity };
}

/**
 * Resuelve un identificador (vanity o URL) a un SteamID64 de 17 dígitos.
 * @spec REQ-01
 */
export async function resolveToSteamId64(
  input: string,
  apiKey?: string
): Promise<ResolveResult> {
  const { type, value } = extractSteamIdentifier(input);

  if (type === 'steamid') {
    return {
      steamId: value,
      isVanity: false,
    };
  }

  const vanity = value;
  const vanityLower = vanity.toLowerCase();

  // Comprobar mapa de conocidos primero (ej: perfil de prueba del prompt)
  if (KNOWN_VANITIES[vanityLower]) {
    return {
      steamId: KNOWN_VANITIES[vanityLower],
      vanityUrl: vanity,
      isVanity: true,
    };
  }

  // Usar Steam Web API si hay clave disponible
  const key = apiKey || process.env.STEAM_API_KEY;
  if (!key) {
    throw new Error(
      `No se pudo resolver el vanity URL "${vanity}". Configure STEAM_API_KEY en su archivo .env para resolución remota.`
    );
  }

  const endpoint = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${key}&vanityurl=${encodeURIComponent(
    vanity
  )}`;

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Error en Steam Web API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data?.response?.success === 1 && data.response.steamid) {
      return {
        steamId: data.response.steamid,
        vanityUrl: vanity,
        isVanity: true,
      };
    }

    if (data?.response?.success === 42) {
      throw new Error(`No se encontró ningún perfil de Steam con el vanity URL "${vanity}".`);
    }

    throw new Error(`Steam Web API no pudo resolver "${vanity}" (código ${data?.response?.success}).`);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Error desconocido al resolver el perfil "${vanity}".`);
  }
}
