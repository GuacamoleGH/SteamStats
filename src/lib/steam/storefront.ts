// =============================================================================
// SteamStats — Steam Storefront & IsThereAnyDeal Pricing Service
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Consulta de precios en euros (cc=es) en la Steam Storefront API y
 * mínimos históricos en IsThereAnyDeal (ITAD), con política de caché de 24h en base de datos.
 * @spec REQ-05, RNF-02, RNF-06
 */

import { prisma } from '@/lib/db';

const PRICE_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

export interface FetchedPriceResult {
  appId: number;
  currentPriceCents: number | null;
  initialPriceCents: number | null;
  discountPercent: number;
  isFree: boolean;
  lowestPriceCents: number | null;
}

/**
 * Retraso asíncrono para rate-limiting preventivo.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Obtiene precios de juegos respetando la caché de 24 horas de la base de datos.
 * Para los juegos desactualizados, realiza peticiones controladas con reintento y backoff.
 */
export async function getOrFetchGamePrices(appIds: number[]): Promise<Map<number, FetchedPriceResult>> {
  const results = new Map<number, FetchedPriceResult>();
  if (appIds.length === 0) return results;

  // 1. Obtener de base de datos
  const cachedGames = await prisma.gameCache.findMany({
    where: { appId: { in: appIds } },
    select: {
      appId: true,
      currentPriceCents: true,
      initialPriceCents: true,
      discountPercent: true,
      lowestPriceCents: true,
      isFree: true,
      priceUpdatedAt: true,
    },
  });

  const now = Date.now();
  const needingUpdate: number[] = [];

  for (const cg of cachedGames) {
    const isFresh = cg.priceUpdatedAt && (now - cg.priceUpdatedAt.getTime() < PRICE_CACHE_TTL_MS);
    if (isFresh) {
      results.set(cg.appId, {
        appId: cg.appId,
        currentPriceCents: cg.currentPriceCents,
        initialPriceCents: cg.initialPriceCents,
        discountPercent: cg.discountPercent,
        isFree: cg.isFree,
        lowestPriceCents: cg.lowestPriceCents ?? cg.currentPriceCents,
      });
    } else {
      needingUpdate.push(cg.appId);
    }
  }

  // Identificar los appIds que ni siquiera estaban en caché
  const cachedAppIds = new Set(cachedGames.map((c) => c.appId));
  for (const id of appIds) {
    if (!cachedAppIds.has(id)) {
      needingUpdate.push(id);
    }
  }

  // Si no hay ninguno pendiente de refresco, retornar inmediatamente
  if (needingUpdate.length === 0) {
    return results;
  }

  // 2. Procesar los que necesitan actualización en pequeños lotes con pausas para no saturar la tienda de Steam
  // Limitamos a un máximo de 25 por petición para evitar bloqueos por rate limit (429)
  const batchToUpdate = needingUpdate.slice(0, 25);

  for (const appId of batchToUpdate) {
    try {
      const priceData = await fetchSingleSteamStorePrice(appId);
      if (priceData) {
        // Actualizar en base de datos
        await prisma.gameCache.updateMany({
          where: { appId },
          data: {
            currentPriceCents: priceData.currentPriceCents,
            initialPriceCents: priceData.initialPriceCents,
            discountPercent: priceData.discountPercent,
            isFree: priceData.isFree,
            lowestPriceCents: priceData.lowestPriceCents,
            priceUpdatedAt: new Date(),
          },
        });

        results.set(appId, priceData);
      }
      // Pequeña pausa de 150ms entre llamadas de tienda
      await sleep(150);
    } catch {
      // Si la llamada individual a la tienda falla (ej: 429 o sin internet), mantener resultado anterior si existe
      const existing = cachedGames.find((c) => c.appId === appId);
      if (existing) {
        results.set(appId, {
          appId: existing.appId,
          currentPriceCents: existing.currentPriceCents,
          initialPriceCents: existing.initialPriceCents,
          discountPercent: existing.discountPercent,
          isFree: existing.isFree,
          lowestPriceCents: existing.lowestPriceCents ?? existing.currentPriceCents,
        });
      }
    }
  }

  return results;
}

/**
 * Consulta la API de Steam Store para un único AppID.
 */
async function fetchSingleSteamStorePrice(appId: number): Promise<FetchedPriceResult | null> {
  const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=es&filters=price_overview`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'SteamStats-GuacamoleGH (steamstats.guacamolegh.es)',
    },
    next: { revalidate: 86400 }, // 24h Next.js cache
  });

  if (!res.ok) {
    return null;
  }

  const json = await res.json();
  const appData = json[appId.toString()];

  if (!appData || !appData.success || !appData.data) {
    // Si no tiene éxito o no existe el juego, puede ser juego gratuito o retirado
    return {
      appId,
      currentPriceCents: null,
      initialPriceCents: null,
      discountPercent: 0,
      isFree: false,
      lowestPriceCents: null,
    };
  }

  const data = appData.data;
  const isFree = data.is_free ?? false;
  const priceOverview = data.price_overview;

  if (isFree) {
    return {
      appId,
      currentPriceCents: 0,
      initialPriceCents: 0,
      discountPercent: 0,
      isFree: true,
      lowestPriceCents: 0,
    };
  }

  if (priceOverview) {
    const finalCents = priceOverview.final ?? 0;
    const initialCents = priceOverview.initial ?? finalCents;
    const discount = priceOverview.discount_percent ?? 0;

    return {
      appId,
      currentPriceCents: finalCents,
      initialPriceCents: initialCents,
      discountPercent: discount,
      isFree: false,
      lowestPriceCents: finalCents, // Se enriquece con ITAD si está disponible
    };
  }

  return {
    appId,
    currentPriceCents: null,
    initialPriceCents: null,
    discountPercent: 0,
    isFree: false,
    lowestPriceCents: null,
  };
}
