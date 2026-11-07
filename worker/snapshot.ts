// =============================================================================
// SteamStats — Scheduled Snapshot Engine
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Lógica de captura diaria de minutos por juego para todos los perfiles
 * monitorizados en la base de datos de SteamStats.
 * @spec REQ-08, RNF-01, RNF-02
 */

import { PrismaClient } from '@prisma/client';
import { GUACAMOLE_STEAM_FIXTURE } from '../src/lib/steam/fixtures';

const prisma = new PrismaClient();

/**
 * Captura las instantáneas de tiempo jugado de hoy para todos los perfiles registrados.
 */
export async function captureSnapshotsForAllProfiles(): Promise<{ profilesProcessed: number; snapshotsSaved: number }> {
  console.log('[Worker] Iniciando captura diaria de snapshots de juegos...');

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const profiles = await prisma.steamProfile.findMany({
    where: { isPrivate: false },
    select: { steamId: true, personaName: true },
  });

  if (profiles.length === 0) {
    console.log('[Worker] No hay perfiles públicos registrados para procesar.');
    return { profilesProcessed: 0, snapshotsSaved: 0 };
  }

  const apiKey = process.env.STEAM_API_KEY;
  let totalSnapshots = 0;

  for (const profile of profiles) {
    try {
      console.log(`[Worker] Procesando perfil ${profile.personaName} (${profile.steamId})...`);

      let gamesData: { appId: number; playtimeForeverMin: number }[] = [];

      if (apiKey) {
        // Consulta en vivo a la Steam Web API
        const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${profile.steamId}&include_appdetails=1&include_played_free_games=1`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const rawGames = json?.response?.games || [];
          gamesData = rawGames.map((g: any) => ({
            appId: g.appid,
            playtimeForeverMin: g.playtime_forever ?? 0,
          }));
        } else {
          console.warn(`[Worker] Error HTTP ${res.status} al consultar juegos de ${profile.steamId}`);
        }
      } else if (profile.steamId === GUACAMOLE_STEAM_FIXTURE.profile.steamId) {
        // Perfil de prueba con fixture local
        gamesData = GUACAMOLE_STEAM_FIXTURE.games.map((g) => ({
          appId: g.appId,
          playtimeForeverMin: g.playtimeForeverMin,
        }));
      }

      // Guardar snapshots en SQLite
      for (const game of gamesData) {
        // Asegurar que el juego existe en GameCache para respetar la clave foránea
        await prisma.gameCache.upsert({
          where: { appId: game.appId },
          create: {
            appId: game.appId,
            name: `App ${game.appId}`,
          },
          update: {},
        });

        await prisma.ownedGameSnapshot.upsert({
          where: {
            steamId_appId_snapshotDate: {
              steamId: profile.steamId,
              appId: game.appId,
              snapshotDate: today,
            },
          },
          create: {
            steamId: profile.steamId,
            appId: game.appId,
            playtimeForeverMin: game.playtimeForeverMin,
            snapshotDate: today,
          },
          update: {
            playtimeForeverMin: game.playtimeForeverMin,
          },
        });

        totalSnapshots++;
      }
    } catch (err) {
      console.error(`[Worker] Error procesando perfil ${profile.steamId}:`, err);
    }
  }

  console.log(
    `[Worker] Captura finalizada con éxito: ${profiles.length} perfiles procesados, ${totalSnapshots} instantáneas registradas.`
  );

  return { profilesProcessed: profiles.length, snapshotsSaved: totalSnapshots };
}
