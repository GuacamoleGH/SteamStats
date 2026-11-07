// =============================================================================
// SteamStats — Steam Web API Integration & Profile Service
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Servicio de integración con la Steam Web API, persistencia en Prisma
 * y gestión de caché de perfiles de 1 hora con cooldown de refresco de 5 minutos.
 * @spec REQ-02, REQ-03, REQ-04, REQ-07, RNF-02, RNF-06
 */

import { prisma } from '@/lib/db';
import { calculateLevelProgress, LevelXpInfo } from './xp-calculator';
import { GUACAMOLE_STEAM_FIXTURE } from './fixtures';

const PROFILE_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora
const REFRESH_COOLDOWN_MS = 5 * 60 * 1000;   // 5 minutos

export interface ProfileSummaryStats {
  totalGames: number;
  playedGames: number;
  unplayedGames: number;
  unplayedPercentage: number;
  totalPlaytimeHours: number;
  twoWeeksPlaytimeHours: number;
  badgesCount: number;
}

export interface ProfileGameItem {
  appId: number;
  name: string;
  headerImage: string;
  playtimeForeverMin: number;
  playtimeForeverHours: number;
  playtime2WeeksMin: number;
  playtime2WeeksHours: number;
  hasPlayed: boolean;
  lastPlayedTime?: Date | null;
}

export interface ProfileBadgeItem {
  badgeId: number;
  level: number;
  completionTime?: Date | null;
  xp: number;
  scarcity?: number | null;
}

export interface CompleteProfileData {
  steamId: string;
  vanityUrl?: string | null;
  personaName: string;
  avatarUrl: string;
  avatarMediumUrl?: string | null;
  avatarFullUrl?: string | null;
  profileUrl: string;
  timeCreated?: Date | null;
  countryCode?: string | null;
  steamLevel: number;
  isPrivate: boolean;
  levelInfo: LevelXpInfo;
  stats: ProfileSummaryStats;
  topGames: ProfileGameItem[];
  recentGames: ProfileGameItem[];
  badges: ProfileBadgeItem[];
  lastUpdated: Date;
  isCached: boolean;
  cooldownRemainingSeconds?: number;
}

/**
 * Obtiene los datos completos del perfil de Steam, combinando caché de base de datos
 * y llamadas a la Steam Web API.
 * @spec REQ-02, RNF-02, RNF-06
 */
export async function getCompleteProfile(
  steamId: string,
  options?: { forceRefresh?: boolean; apiKey?: string }
): Promise<CompleteProfileData> {
  const forceRefresh = options?.forceRefresh ?? false;
  const apiKey = options?.apiKey || process.env.STEAM_API_KEY;

  // 1. Consultar caché en la base de datos
  const existingProfile = await prisma.steamProfile.findUnique({
    where: { steamId },
    include: {
      ownedGames: {
        include: {
          game: true,
        },
      },
      badges: true,
    },
  });

  const now = Date.now();
  if (existingProfile) {
    const age = now - existingProfile.lastUpdated.getTime();
    const isStillFresh = age < PROFILE_CACHE_TTL_MS;

    // Si no se pide forzar refresco y la caché está vigente, retornar de BD
    if (!forceRefresh && isStillFresh) {
      return formatProfileFromDb(existingProfile, true);
    }

    // Si se pide forzar refresco pero no ha pasado el cooldown de 5 minutos
    if (forceRefresh && age < REFRESH_COOLDOWN_MS) {
      const cooldownRemainingSeconds = Math.ceil((REFRESH_COOLDOWN_MS - age) / 1000);
      const data = formatProfileFromDb(existingProfile, true);
      data.cooldownRemainingSeconds = cooldownRemainingSeconds;
      return data;
    }
  }

  // 2. Si no hay clave de API configurada, emplear fixture para perfil de prueba
  if (!apiKey) {
    if (steamId === GUACAMOLE_STEAM_FIXTURE.profile.steamId) {
      return await saveAndFormatFixture();
    }
    throw new Error(
      'Para consultar perfiles de Steam en vivo es necesario configurar STEAM_API_KEY en el archivo .env.'
    );
  }

  // 3. Realizar llamadas a la Steam Web API
  try {
    const [summaryRes, levelRes, badgesRes, gamesRes, recentRes] = await Promise.all([
      fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
      ).then((r) => r.json()),
      fetch(
        `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${apiKey}&steamid=${steamId}`
      ).then((r) => r.json()).catch(() => ({ response: {} })),
      fetch(
        `https://api.steampowered.com/IPlayerService/GetBadges/v1/?key=${apiKey}&steamid=${steamId}`
      ).then((r) => r.json()).catch(() => ({ response: {} })),
      fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&include_appdetails=1&include_played_free_games=1`
      ).then((r) => r.json()).catch(() => ({ response: {} })),
      fetch(
        `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${apiKey}&steamid=${steamId}`
      ).then((r) => r.json()).catch(() => ({ response: {} })),
    ]);

    const player = summaryRes?.response?.players?.[0];
    if (!player) {
      throw new Error(`No se encontró el perfil de Steam con ID ${steamId}.`);
    }

    // Comprobar privacidad: communityvisibilitystate !== 3 o sin juegos visibles
    const isPrivate =
      player.communityvisibilitystate !== 3 ||
      !gamesRes?.response?.games ||
      gamesRes.response.games.length === 0;

    const steamLevel = levelRes?.response?.player_level ?? 0;
    const playerXp = badgesRes?.response?.player_xp;

    const rawGames: any[] = gamesRes?.response?.games ?? [];
    const rawBadges: any[] = badgesRes?.response?.badges ?? [];

    // Calcular estadísticas y actualizar base de datos con transacción
    let totalMinutes = 0;
    let twoWeeksMinutes = 0;
    let playedCount = 0;

    const processedGames = rawGames.map((g: any) => {
      const foreverMin = g.playtime_forever ?? 0;
      const twoWeeksMin = g.playtime_2weeks ?? 0;
      const hasPlayed = foreverMin > 0;

      totalMinutes += foreverMin;
      twoWeeksMinutes += twoWeeksMin;
      if (hasPlayed) playedCount++;

      return {
        appId: g.appid,
        name: g.name || `App ${g.appid}`,
        headerImage: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${g.appid}/header.jpg`,
        playtimeForeverMin: foreverMin,
        playtime2WeeksMin: twoWeeksMin,
        hasPlayed,
      };
    });

    // Guardar en Prisma SQLite
    await prisma.$transaction(async (tx) => {
      // 1. Guardar/Actualizar Perfil
      await tx.steamProfile.upsert({
        where: { steamId },
        create: {
          steamId,
          personaName: player.personaname || 'Usuario de Steam',
          avatarUrl: player.avatar || '',
          avatarMediumUrl: player.avatarmedium,
          avatarFullUrl: player.avatarfull,
          profileUrl: player.profileurl || `https://steamcommunity.com/profiles/${steamId}`,
          timeCreated: player.timecreated ? new Date(player.timecreated * 1000) : null,
          countryCode: player.loccountrycode || null,
          steamLevel,
          totalPlaytimeMinutes: totalMinutes,
          isPrivate,
          lastUpdated: new Date(),
        },
        update: {
          personaName: player.personaname || 'Usuario de Steam',
          avatarUrl: player.avatar || '',
          avatarMediumUrl: player.avatarmedium,
          avatarFullUrl: player.avatarfull,
          profileUrl: player.profileurl || `https://steamcommunity.com/profiles/${steamId}`,
          steamLevel,
          totalPlaytimeMinutes: totalMinutes,
          isPrivate,
          lastUpdated: new Date(),
        },
      });

      // 2. Guardar juegos en GameCache y ProfileOwnedGame
      for (const g of processedGames) {
        await tx.gameCache.upsert({
          where: { appId: g.appId },
          create: {
            appId: g.appId,
            name: g.name,
            headerImage: g.headerImage,
          },
          update: {
            name: g.name,
            headerImage: g.headerImage,
          },
        });

        await tx.profileOwnedGame.upsert({
          where: {
            steamId_appId: {
              steamId,
              appId: g.appId,
            },
          },
          create: {
            steamId,
            appId: g.appId,
            playtimeForeverMin: g.playtimeForeverMin,
            playtime2WeeksMin: g.playtime2WeeksMin,
            hasPlayed: g.hasPlayed,
          },
          update: {
            playtimeForeverMin: g.playtimeForeverMin,
            playtime2WeeksMin: g.playtime2WeeksMin,
            hasPlayed: g.hasPlayed,
          },
        });
      }

      // 3. Guardar Insignias
      await tx.profileBadge.deleteMany({ where: { steamId } });
      if (rawBadges.length > 0) {
        await tx.profileBadge.createMany({
          data: rawBadges.map((b: any) => ({
            steamId,
            badgeId: b.badgeid,
            level: b.level ?? 1,
            completionTime: b.completion_time ? new Date(b.completion_time * 1000) : null,
            xp: b.xp ?? 0,
            scarcity: b.scarcity ?? null,
          })),
        });
      }
    });

    // Cargar perfil completo actualizado
    const freshProfile = await prisma.steamProfile.findUniqueOrThrow({
      where: { steamId },
      include: {
        ownedGames: {
          include: { game: true },
        },
        badges: true,
      },
    });

    return formatProfileFromDb(freshProfile, false);
  } catch (error) {
    // Si hay error en la API externa pero tenemos datos en caché, servirlos con advertencia
    if (existingProfile) {
      return formatProfileFromDb(existingProfile, true);
    }
    throw error;
  }
}

/**
 * Transforma el modelo Prisma a la estructura pública de CompleteProfileData.
 */
function formatProfileFromDb(profile: any, isCached: boolean): CompleteProfileData {
  const games: ProfileGameItem[] = (profile.ownedGames || []).map((og: any) => ({
    appId: og.appId,
    name: og.game.name,
    headerImage:
      og.game.headerImage ||
      `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${og.appId}/header.jpg`,
    playtimeForeverMin: og.playtimeForeverMin,
    playtimeForeverHours: Math.round((og.playtimeForeverMin / 60) * 10) / 10,
    playtime2WeeksMin: og.playtime2WeeksMin,
    playtime2WeeksHours: Math.round((og.playtime2WeeksMin / 60) * 10) / 10,
    hasPlayed: og.hasPlayed,
    lastPlayedTime: og.lastPlayedTime,
  }));

  const totalGames = games.length;
  const playedGames = games.filter((g) => g.hasPlayed).length;
  const unplayedGames = totalGames - playedGames;
  const unplayedPercentage = totalGames > 0 ? Math.round((unplayedGames / totalGames) * 100) : 0;

  const totalMinutes = games.reduce((acc, g) => acc + g.playtimeForeverMin, 0);
  const twoWeeksMinutes = games.reduce((acc, g) => acc + g.playtime2WeeksMin, 0);

  // Top de juegos más jugados
  const topGames = [...games]
    .sort((a, b) => b.playtimeForeverMin - a.playtimeForeverMin)
    .slice(0, 10);

  // Juegos recientes
  const recentGames = [...games]
    .filter((g) => g.playtime2WeeksMin > 0)
    .sort((a, b) => b.playtime2WeeksMin - a.playtime2WeeksMin);

  // Insignias
  const badges: ProfileBadgeItem[] = (profile.badges || []).map((b: any) => ({
    badgeId: b.badgeId,
    level: b.level,
    completionTime: b.completionTime,
    xp: b.xp,
    scarcity: b.scarcity,
  }));

  const levelInfo = calculateLevelProgress(profile.steamLevel);

  return {
    steamId: profile.steamId,
    vanityUrl: profile.vanityUrl,
    personaName: profile.personaName,
    avatarUrl: profile.avatarUrl,
    avatarMediumUrl: profile.avatarMediumUrl,
    avatarFullUrl: profile.avatarFullUrl,
    profileUrl: profile.profileUrl,
    timeCreated: profile.timeCreated,
    countryCode: profile.countryCode,
    steamLevel: profile.steamLevel,
    isPrivate: profile.isPrivate,
    levelInfo,
    stats: {
      totalGames,
      playedGames,
      unplayedGames,
      unplayedPercentage,
      totalPlaytimeHours: Math.round((totalMinutes / 60) * 10) / 10,
      twoWeeksPlaytimeHours: Math.round((twoWeeksMinutes / 60) * 10) / 10,
      badgesCount: badges.length,
    },
    topGames,
    recentGames,
    badges,
    lastUpdated: profile.lastUpdated,
    isCached,
  };
}

/**
 * Guarda y devuelve los datos del fixture de prueba cuando no hay STEAM_API_KEY.
 */
async function saveAndFormatFixture(): Promise<CompleteProfileData> {
  const fix = GUACAMOLE_STEAM_FIXTURE;

  await prisma.$transaction(async (tx) => {
    await tx.steamProfile.upsert({
      where: { steamId: fix.profile.steamId },
      create: {
        ...fix.profile,
        totalPlaytimeMinutes: fix.games.reduce((acc, g) => acc + g.playtimeForeverMin, 0),
        lastUpdated: new Date(),
      },
      update: {
        ...fix.profile,
        totalPlaytimeMinutes: fix.games.reduce((acc, g) => acc + g.playtimeForeverMin, 0),
        lastUpdated: new Date(),
      },
    });

    for (const g of fix.games) {
      await tx.gameCache.upsert({
        where: { appId: g.appId },
        create: {
          appId: g.appId,
          name: g.name,
          headerImage: g.headerImage,
        },
        update: {
          name: g.name,
          headerImage: g.headerImage,
        },
      });

      await tx.profileOwnedGame.upsert({
        where: {
          steamId_appId: {
            steamId: fix.profile.steamId,
            appId: g.appId,
          },
        },
        create: {
          steamId: fix.profile.steamId,
          appId: g.appId,
          playtimeForeverMin: g.playtimeForeverMin,
          playtime2WeeksMin: g.playtime2WeeksMin,
          hasPlayed: g.playtimeForeverMin > 0,
        },
        update: {
          playtimeForeverMin: g.playtimeForeverMin,
          playtime2WeeksMin: g.playtime2WeeksMin,
          hasPlayed: g.playtimeForeverMin > 0,
        },
      });
    }

    await tx.profileBadge.deleteMany({ where: { steamId: fix.profile.steamId } });
    await tx.profileBadge.createMany({
      data: fix.badges.map((b) => ({
        steamId: fix.profile.steamId,
        ...b,
      })),
    });
  });

  const fresh = await prisma.steamProfile.findUniqueOrThrow({
    where: { steamId: fix.profile.steamId },
    include: {
      ownedGames: { include: { game: true } },
      badges: true,
    },
  });

  return formatProfileFromDb(fresh, false);
}
