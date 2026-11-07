// =============================================================================
// SteamStats — IGDB Client & Releases Service
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Cliente de integración con IGDB (Twitch API v4), persistencia
 * en Prisma (SQLite) y filtrado de próximos lanzamientos de videojuegos.
 * @spec REQ-10, RNF-02, RNF-06
 */

import { prisma } from '@/lib/db';
import { IGDBReleaseGame, ReleasesFilterOptions } from './types';
import { CURATED_UPCOMING_RELEASES } from './fixtures';

let cachedTwitchToken: { token: string; expiresAt: number } | null = null;
const RELEASES_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

/**
 * Obtiene un token de acceso OAuth2 para Twitch Client Credentials.
 */
async function getTwitchAccessToken(clientId: string, clientSecret: string): Promise<string | null> {
  const now = Date.now();
  if (cachedTwitchToken && cachedTwitchToken.expiresAt > now + 60000) {
    return cachedTwitchToken.token;
  }

  try {
    const res = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: 'POST' }
    );

    if (!res.ok) {
      console.warn(`[IGDB] Error obteniendo token OAuth de Twitch: HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    cachedTwitchToken = {
      token: data.access_token,
      expiresAt: now + (data.expires_in ?? 3600) * 1000,
    };
    return cachedTwitchToken.token;
  } catch (err) {
    console.error('[IGDB] Error en solicitud de token Twitch:', err);
    return null;
  }
}

/**
 * Obtiene la lista de próximos lanzamientos, priorizando caché de BD y consultando
 * a la API de IGDB si está disponible. En caso de fallo o ausencia de claves,
 * recurre al catálogo curado sin romper la interfaz.
 */
export async function getUpcomingReleases(): Promise<{ releases: IGDBReleaseGame[]; source: 'igdb' | 'cache' | 'fixture' }> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  // 1. Revisar caché en base de datos
  const cachedDb = await prisma.release.findMany({
    orderBy: { releaseDate: 'asc' },
  });

  const now = Date.now();
  const isDbFresh =
    cachedDb.length > 0 &&
    now - cachedDb[0].lastUpdated.getTime() < RELEASES_CACHE_TTL_MS;

  if (isDbFresh) {
    const releases: IGDBReleaseGame[] = cachedDb.map((r) => ({
      id: r.id,
      name: r.name,
      summary: r.summary ?? undefined,
      coverUrl: r.coverUrl ?? undefined,
      releaseDate: r.releaseDate.toISOString(),
      platforms: JSON.parse(r.platforms || '[]'),
      genres: JSON.parse(r.genres || '[]'),
    }));
    return { releases, source: 'cache' };
  }

  // 2. Si no hay credenciales configuradas, sembrar o servir fixture curado
  if (!clientId || !clientSecret) {
    // Si la BD está vacía, sembramos el fixture en SQLite para que persista
    if (cachedDb.length === 0) {
      await seedFixtureReleases();
    }
    return { releases: CURATED_UPCOMING_RELEASES, source: 'fixture' };
  }

  // 3. Consultar la API de IGDB
  try {
    const token = await getTwitchAccessToken(clientId, clientSecret);
    if (!token) {
      return { releases: CURATED_UPCOMING_RELEASES, source: 'fixture' };
    }

    const currentTimestamp = Math.floor(now / 1000);
    const bodyQuery = `
      fields id, name, summary, cover.url, first_release_date, platforms.name, genres.name, hypes;
      where first_release_date >= ${currentTimestamp} & hypes != null;
      sort first_release_date asc;
      limit 40;
    `;

    const res = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: bodyQuery,
    });

    if (!res.ok) {
      console.warn(`[IGDB] Error al consultar juegos: HTTP ${res.status}`);
      return { releases: CURATED_UPCOMING_RELEASES, source: 'fixture' };
    }

    const rawGames: any[] = await res.json();
    if (!Array.isArray(rawGames) || rawGames.length === 0) {
      return { releases: CURATED_UPCOMING_RELEASES, source: 'fixture' };
    }

    // Procesar y transformar a IGDBReleaseGame
    const freshReleases: IGDBReleaseGame[] = rawGames.map((g) => {
      let cover = g.cover?.url || '';
      if (cover.startsWith('//')) cover = `https:${cover}`;
      // Reemplazar tamaño t_thumb por t_cover_big
      cover = cover.replace('t_thumb', 't_cover_big');

      return {
        id: g.id,
        name: g.name,
        summary: g.summary || '',
        coverUrl: cover || undefined,
        releaseDate: new Date(g.first_release_date * 1000).toISOString(),
        platforms: (g.platforms || []).map((p: any) => p.name).filter(Boolean),
        genres: (g.genres || []).map((gen: any) => gen.name).filter(Boolean),
        hypes: g.hypes ?? 0,
      };
    });

    // Guardar en Prisma SQLite
    await prisma.$transaction(async (tx) => {
      await tx.release.deleteMany({});
      for (const r of freshReleases) {
        await tx.release.create({
          data: {
            id: r.id,
            name: r.name,
            summary: r.summary,
            coverUrl: r.coverUrl,
            releaseDate: new Date(r.releaseDate),
            platforms: JSON.stringify(r.platforms),
            genres: JSON.stringify(r.genres),
            lastUpdated: new Date(),
          },
        });
      }
    });

    return { releases: freshReleases, source: 'igdb' };
  } catch (err) {
    console.error('[IGDB] Error conectando con API externa:', err);
    return { releases: CURATED_UPCOMING_RELEASES, source: 'fixture' };
  }
}

/**
 * Guarda los lanzamientos de prueba en la base de datos local.
 */
async function seedFixtureReleases(): Promise<void> {
  try {
    for (const r of CURATED_UPCOMING_RELEASES) {
      await prisma.release.upsert({
        where: { id: r.id },
        create: {
          id: r.id,
          name: r.name,
          summary: r.summary,
          coverUrl: r.coverUrl,
          releaseDate: new Date(r.releaseDate),
          platforms: JSON.stringify(r.platforms),
          genres: JSON.stringify(r.genres),
          lastUpdated: new Date(),
        },
        update: {
          name: r.name,
          summary: r.summary,
          coverUrl: r.coverUrl,
          releaseDate: new Date(r.releaseDate),
          platforms: JSON.stringify(r.platforms),
          genres: JSON.stringify(r.genres),
          lastUpdated: new Date(),
        },
      });
    }
  } catch (err) {
    console.warn('[IGDB] Aviso sembrando fixture:', err);
  }
}

/**
 * Aplica filtros de mes, género, texto de búsqueda y deseados.
 * @spec REQ-10
 */
export function filterReleases(
  releases: IGDBReleaseGame[],
  options: ReleasesFilterOptions,
  interestedIds: Set<number> = new Set()
): IGDBReleaseGame[] {
  return releases.filter((game) => {
    // 1. Filtro de búsqueda
    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const q = options.searchQuery.toLowerCase().trim();
      const matchName = game.name.toLowerCase().includes(q);
      const matchSummary = game.summary?.toLowerCase().includes(q);
      if (!matchName && !matchSummary) return false;
    }

    // 2. Filtro de mes (ej: "2026-11" o "all")
    if (options.month && options.month !== 'all') {
      const gameMonth = game.releaseDate.substring(0, 7); // YYYY-MM
      if (options.month === '2027+' ) {
        const year = parseInt(game.releaseDate.substring(0, 4), 10);
        if (year < 2027) return false;
      } else if (gameMonth !== options.month) {
        return false;
      }
    }

    // 3. Filtro de género
    if (options.genre && options.genre !== 'all') {
      if (!game.genres.includes(options.genre)) {
        return false;
      }
    }

    // 4. Filtro de juegos deseados ("Me interesa")
    if (options.onlyInterested) {
      if (!interestedIds.has(game.id)) {
        return false;
      }
    }

    return true;
  });
}
