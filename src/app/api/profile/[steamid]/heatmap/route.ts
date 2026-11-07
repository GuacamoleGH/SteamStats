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

    // 2. Si no hay suficiente historial (< 2 días distintos) y es el perfil de prueba (GuacamoleSteam), sembrar datos de simulación
    const distinctDates = new Set(snapshots.map((s) => s.snapshotDate.toISOString().split('T')[0]));
    if (distinctDates.size < 2 && steamid === GUACAMOLE_STEAM_FIXTURE.profile.steamId) {
      const mockSnapshots = GUACAMOLE_STEAM_FIXTURE.games
        .filter((g) => g.playtimeForeverMin > 0)
        .flatMap((g) => generateMockSnapshots(steamid, g.appId, g.playtimeForeverMin));

      // Guardar en base de datos para persistencia
      await prisma.$transaction(
        mockSnapshots.map((s) =>
          prisma.ownedGameSnapshot.upsert({
            where: {
              steamId_appId_snapshotDate: {
                steamId: steamid,
                appId: s.appId,
                snapshotDate: s.snapshotDate,
              },
            },
            create: {
              steamId: steamid,
              appId: s.appId,
              playtimeForeverMin: s.playtimeForeverMin,
              snapshotDate: s.snapshotDate,
            },
            update: {
              playtimeForeverMin: s.playtimeForeverMin,
            },
          })
        )
      );

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
        hasPlayed: true,
      },
      include: {
        game: {
          select: {
            appId: true,
            name: true,
            headerImage: true,
          },
        },
      },
      orderBy: { playtimeForeverMin: 'desc' },
      take: 50,
    });

    const gamesList = ownedGames.map((og) => ({
      appId: og.appId,
      name: og.game.name,
      playtimeHours: Math.round((og.playtimeForeverMin / 60) * 10) / 10,
    }));

    // 4. Calcular actividad diaria y rachas
    const activity = calculateDailyActivity(snapshots, 365);

    return NextResponse.json({
      steamId: steamid,
      selectedAppId: appId ?? null,
      stats: activity.stats,
      days: activity.days,
      hasData: activity.hasData,
      games: gamesList,
    });
  } catch (error) {
    console.error('[API Heatmap] Error calculando heatmap:', error);
    return NextResponse.json(
      { error: 'Error interno obteniendo datos de actividad.' },
      { status: 500 }
    );
  }
}
