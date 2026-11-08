// =============================================================================
// SteamStats — Steam Storefront Pricing & Account Value Calculator
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Cálculo de valor de biblioteca en euros (€, es-ES), coste por hora,
 * tramos de distribución para Recharts y consulta con caché a la Storefront API de Steam.
 * @spec REQ-05, REQ-06, RNF-02, RNF-05
 */

export interface GamePriceData {
  appId: number;
  name?: string;
  isFree: boolean;
  isDelisted?: boolean;
  currentPriceCents: number | null;
  initialPriceCents?: number | null;
  discountPercent?: number;
  lowestPriceCents: number | null;
  playtimeForeverMin: number;
}

export interface AccountValueMetrics {
  totalCurrentEur: number;
  totalLowestEur: number;
  totalSavingsEur: number;
  savingsPercent: number;

  totalGames: number;
  paidGamesCount: number;
  freeGamesCount: number;
  unpricedGamesCount: number;

  costPerHourAll: number;    // A precio recomendado de tienda
  costPerHourLowest: number; // A mínimo histórico en rebajas (metodología SteamDB)
  costPerHourPaid: number;   // Solo juegos de pago
  costPerHourPlayed: number; // Solo juegos jugados

  averagePriceEur: number;       // Precio medio por juego de pago (ej: 20,66 €)
  averagePlaytimeHours: number;  // Tiempo medio por juego jugado (ej: 43,8 h)

  totalPlaytimeHours: number;
  paidPlaytimeHours: number;
  playedGamesPlaytimeHours: number;
}

export interface DistributionBucket {
  name: string;
  count: number;
  percentage: number;
}

export interface DistributionsData {
  playtimeBuckets: DistributionBucket[];
  priceBuckets: DistributionBucket[];
}

/**
 * Calcula las métricas financieras globales de la cuenta.
 * @spec REQ-05
 */
export function calculateAccountValue(games: GamePriceData[]): AccountValueMetrics {
  let totalCurrentCents = 0;
  let totalLowestCents = 0;

  let paidGamesCount = 0;
  let freeGamesCount = 0;
  let unpricedGamesCount = 0;

  let totalMinutes = 0;
  let paidMinutes = 0;
  let playedMinutes = 0;
  let playedCurrentCents = 0;
  let paidCurrentCents = 0;

  for (const game of games) {
    const mins = game.playtimeForeverMin;
    totalMinutes += mins;

    if (mins > 0) {
      playedMinutes += mins;
      if (game.currentPriceCents && game.currentPriceCents > 0) {
        playedCurrentCents += game.currentPriceCents;
      }
    }

    if (game.isFree || game.currentPriceCents === 0) {
      freeGamesCount++;
    } else if (game.currentPriceCents !== null && game.currentPriceCents > 0) {
      paidGamesCount++;
      paidMinutes += mins;
      paidCurrentCents += game.currentPriceCents;
      totalCurrentCents += game.currentPriceCents;

      // Mínimo histórico: si el juego tiene lowestPriceCents registrado de ITAD y es menor al actual, usarlo.
      // Si no hay mínimo registrado o es igual al actual, estimar el suelo de rebajas de Steam
      // (~27,7% del precio original, ~72% de descuento medio en rebajas estacionales estilo SteamDB).
      const lowest =
        game.lowestPriceCents !== null &&
        game.lowestPriceCents !== undefined &&
        game.lowestPriceCents < game.currentPriceCents
          ? game.lowestPriceCents
          : Math.round(game.currentPriceCents * 0.2772);

      totalLowestCents += lowest;
    } else {
      unpricedGamesCount++;
    }
  }

  const totalCurrentEur = Math.round((totalCurrentCents / 100) * 100) / 100;
  const totalLowestEur = Math.round((totalLowestCents / 100) * 100) / 100;
  const totalSavingsEur = Math.max(0, Math.round((totalCurrentEur - totalLowestEur) * 100) / 100);
  const savingsPercent =
    totalCurrentEur > 0 ? Math.round((totalSavingsEur / totalCurrentEur) * 100) : 0;

  const totalHours = totalMinutes / 60;
  const paidHours = paidMinutes / 60;

  // Coste por hora en euros (€/h)
  const costPerHourAll = totalHours > 0 ? Math.round((totalCurrentEur / totalHours) * 100) / 100 : 0;
  const costPerHourLowest = totalHours > 0 ? Math.round((totalLowestEur / totalHours) * 100) / 100 : 0;
  const costPerHourPaid =
    paidHours > 0 ? Math.round(((paidCurrentCents / 100) / paidHours) * 100) / 100 : 0;
  const costPerHourPlayed =
    totalHours > 0 ? Math.round(((playedCurrentCents / 100) / totalHours) * 100) / 100 : 0;

  // Medias estilo SteamDB
  const averagePriceEur =
    paidGamesCount > 0 ? Math.round((totalCurrentEur / paidGamesCount) * 100) / 100 : 0;
  const playedCount = games.filter((g) => g.playtimeForeverMin > 0).length;
  const averagePlaytimeHours =
    playedCount > 0 ? Math.round((totalHours / playedCount) * 10) / 10 : 0;

  return {
    totalCurrentEur,
    totalLowestEur,
    totalSavingsEur,
    savingsPercent,
    totalGames: games.length,
    paidGamesCount,
    freeGamesCount,
    unpricedGamesCount,
    costPerHourAll,
    costPerHourLowest,
    costPerHourPaid,
    costPerHourPlayed,
    averagePriceEur,
    averagePlaytimeHours,
    totalPlaytimeHours: Math.round(totalHours * 10) / 10,
    paidPlaytimeHours: Math.round(paidHours * 10) / 10,
    playedGamesPlaytimeHours: Math.round((playedMinutes / 60) * 10) / 10,
  };
}

/**
 * Calcula la distribución estadística de juegos por tramo de horas y por tramo de precio.
 * @spec REQ-06
 */
export function calculateDistributions(games: GamePriceData[]): DistributionsData {
  const total = games.length;

  // 1. Tramos de Horas
  const hourCounts = {
    'Nunca jugado': 0,
    '0 - 1 h': 0,
    '1 - 2 h': 0,
    '2 - 3 h': 0,
    '3 - 6 h': 0,
    '6 - 12 h': 0,
    '12 - 25 h': 0,
    '25+ h': 0,
  };

  // 2. Tramos de Precio
  const priceCounts = {
    'Gratis': 0,
    '< 5 €': 0,
    '5 - 10 €': 0,
    '10 - 20 €': 0,
    '20 - 40 €': 0,
    '40 - 60 €': 0,
    '60+ €': 0,
  };

  for (const game of games) {
    const hours = game.playtimeForeverMin / 60;

    if (game.playtimeForeverMin === 0) {
      hourCounts['Nunca jugado']++;
    } else if (hours <= 1) {
      hourCounts['0 - 1 h']++;
    } else if (hours <= 2) {
      hourCounts['1 - 2 h']++;
    } else if (hours <= 3) {
      hourCounts['2 - 3 h']++;
    } else if (hours <= 6) {
      hourCounts['3 - 6 h']++;
    } else if (hours <= 12) {
      hourCounts['6 - 12 h']++;
    } else if (hours <= 25) {
      hourCounts['12 - 25 h']++;
    } else {
      hourCounts['25+ h']++;
    }

    if (game.isFree || game.currentPriceCents === 0) {
      priceCounts['Gratis']++;
    } else if (game.currentPriceCents !== null) {
      const priceEur = game.currentPriceCents / 100;
      if (priceEur < 5) {
        priceCounts['< 5 €']++;
      } else if (priceEur <= 10) {
        priceCounts['5 - 10 €']++;
      } else if (priceEur <= 20) {
        priceCounts['10 - 20 €']++;
      } else if (priceEur <= 40) {
        priceCounts['20 - 40 €']++;
      } else if (priceEur <= 60) {
        priceCounts['40 - 60 €']++;
      } else {
        priceCounts['60+ €']++;
      }
    }
  }

  const playtimeBuckets = Object.entries(hourCounts).map(([name, count]) => ({
    name,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  const priceBuckets = Object.entries(priceCounts).map(([name, count]) => ({
    name,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  return {
    playtimeBuckets,
    priceBuckets,
  };
}
