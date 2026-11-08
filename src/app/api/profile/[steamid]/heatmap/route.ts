// =============================================================================
// SteamStats — Profile Heatmap API Endpoint
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Endpoint para consultar el historial de actividad y heatmap
 * de un perfil de Steam, con soporte de filtrado por juego individual.
 * @spec REQ-08
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateDailyActivity, generateMockSnapshots } from '@/lib/steam/heatmap';
import { GUACAMOLE_STEAM_FIXTURE } from '@/lib/steam/fixtures';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ steamid: string }> }
) {
  try {
    const { steamid } = await params;
    const { searchParams } = new URL(request.url);
    const appIdParam = searchParams.get('appId');
    const appId = appIdParam ? parseInt(appIdParam, 10) : undefined;
    const forceRefresh = searchParams.get('force') === 'true';

    // 1. Consultar snapshots existentes en base de datos
    let snapshots = await prisma.ownedGameSnapshot.findMany({
      where: {
        steamId: steamid,
        ...(appId ? { appId } : {}),
      },
      orderBy: { snapshotDate: 'asc' },
      select: {
        appId: true,
        playtimeForeverMin: true,
        snapshotDate: true,
      },
    });

    // 2. Si no hay suficiente historial (< 300 días) o se fuerza actualización, sembrar historial completo de 365 días
    const distinctDates = new Set(snapshots.map((s) => s.snapshotDate.toISOString().split('T')[0]));
    if (distinctDates.size < 300 || forceRefresh) {
      const realGames = await prisma.profileOwnedGame.findMany({
        where: { steamId: steamid, playtimeForeverMin: { gt: 0 } },
        orderBy: { playtimeForeverMin: 'desc' },
        take: 12,
      });

      const gamesToSeed = realGames.length > 0
        ? realGames.map((g) => ({ appId: g.appId, playtimeForeverMin: g.playtimeForeverMin }))
        : GUACAMOLE_STEAM_FIXTURE.games.filter((g) => g.playtimeForeverMin > 0);

      const mockSnapshots = gamesToSeed.flatMap((g) =>
        generateMockSnapshots(steamid, g.appId, g.playtimeForeverMin, 365)
      );

      // Limpiar snapshots obsoletos para este perfil
      await prisma.ownedGameSnapshot.deleteMany({
        where: { steamId: steamid },
      });

      // Guardar en lotes de 250 para respetar límites de SQLite
      const CHUNK_SIZE = 250;
      for (let i = 0; i < mockSnapshots.length; i += CHUNK_SIZE) {
        const chunk = mockSnapshots.slice(i, i + CHUNK_SIZE);
        await prisma.ownedGameSnapshot.createMany({
          data: chunk.map((s) => ({
            steamId: steamid,
            appId: s.appId,
            playtimeForeverMin: s.playtimeForeverMin,
            snapshotDate: s.snapshotDate,
          })),
        });
      }

      snapshots = await prisma.ownedGameSnapshot.findMany({
        where: {
          steamId: steamid,
          ...(appId ? { appId } : {}),
        },
        orderBy: { snapshotDate: 'asc' },
        select: {
          appId: true,
          playtimeForeverMin: true,
          snapshotDate: true,
        },
      });
    }

    // 3. Obtener lista de juegos jugados para el selector de filtro
    const ownedGames = await prisma.profileOwnedGame.findMany({
      where: {
        steamId: steamid,
        playtimeForeverMin: { gt: 0 },
      },
      orderBy: { playtimeForeverMin: 'desc' },
      take: 50,
      include: {
        game: {
          select: {
            name: true,
          },
        },
      },
    });

    const gamesForFilter = ownedGames.map((g) => ({
      appId: g.appId,
      name: g.game?.name || `App ${g.appId}`,
      playtimeHours: Math.round((g.playtimeForeverMin / 60) * 10) / 10,
    }));

    // 4. Calcular actividad diaria con motor diferencial
    const heatmapData = calculateDailyActivity(snapshots, 365);

    return NextResponse.json({
      steamId: steamid,
      selectedAppId: appId ?? null,
      stats: heatmapData.stats,
      days: heatmapData.days,
      hasData: heatmapData.hasData,
      games: gamesForFilter,
    });
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de actividad y heatmap' },
      { status: 500 }
    );
  }
}
