// =============================================================================
// SteamStats — Steam Sales Countdown Engine
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Motor de cálculo de cuenta atrás para las grandes rebajas de Steam,
 * detección de rebajas activas y conversión horaria para el visitante.
 * @spec REQ-11, RNF-05
 */

export interface SaleEvent {
  id: string;
  name: string;
  nameEn: string;
  startDate: string; // ISO 8601 UTC
  endDate: string;   // ISO 8601 UTC
  type: string;      // major, seasonal, publisher
  description: string;
}

export interface CountdownRemaining {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export interface SaleStatus {
  currentSale: SaleEvent | null;
  nextSale: SaleEvent | null;
  targetDate: string | null;
  countdown: CountdownRemaining | null;
  isSaleActive: boolean;
  activeProgressPercent?: number;
}

/**
 * Calcula la diferencia desglosada en días, horas, minutos y segundos hasta una fecha objetivo.
 */
export function calculateCountdown(targetDate: Date, currentDate: Date = new Date()): CountdownRemaining {
  const diffMs = targetDate.getTime() - currentDate.getTime();

  if (diffMs <= 0) {
    return {
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
  };
}

/**
 * Evalúa una lista de rebajas y determina la rebaja en curso o la próxima rebaja programada.
 * @spec REQ-11
 */
export function getSaleStatus(sales: SaleEvent[], now: Date = new Date()): SaleStatus {
  const nowMs = now.getTime();

  // 1. Comprobar si hay una rebaja activa en este instante
  for (const sale of sales) {
    const startMs = new Date(sale.startDate).getTime();
    const endMs = new Date(sale.endDate).getTime();

    if (nowMs >= startMs && nowMs < endMs) {
      const totalDuration = endMs - startMs;
      const elapsed = nowMs - startMs;
      const activeProgressPercent = Math.min(
        100,
        Math.max(0, Math.round((elapsed / totalDuration) * 100))
      );

      // Cuenta atrás para la finalización de la rebaja
      const countdown = calculateCountdown(new Date(sale.endDate), now);

      return {
        currentSale: sale,
        nextSale: null,
        targetDate: sale.endDate,
        countdown,
        isSaleActive: true,
        activeProgressPercent,
      };
    }
  }

  // 2. Si no hay ninguna activa, buscar la más cercana en el futuro
  const futureSales = sales
    .filter((s) => new Date(s.startDate).getTime() > nowMs)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  if (futureSales.length > 0) {
    const nextSale = futureSales[0];
    const countdown = calculateCountdown(new Date(nextSale.startDate), now);

    return {
      currentSale: null,
      nextSale,
      targetDate: nextSale.startDate,
      countdown,
      isSaleActive: false,
    };
  }

  // No hay rebajas futuras registradas
  return {
    currentSale: null,
    nextSale: null,
    targetDate: null,
    countdown: null,
    isSaleActive: false,
  };
}
