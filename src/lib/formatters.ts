// =============================================================================
// SteamStats — Formatters & Localization Helpers (es-ES)
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Formateo estándar de importes en euros (€), números y horas
 * según las convenciones de localización de España (es-ES).
 * @spec RNF-05
 */

/**
 * Formatea una cantidad en céntimos de euro a formato de moneda en euros (ej: 5999 -> "59,99 €").
 */
export function formatEurFromCents(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return 'N/D';
  if (cents === 0) return 'Gratis';

  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Formatea una cantidad en euros a formato de moneda (ej: 59.99 -> "59,99 €").
 */
export function formatEur(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'N/D';
  if (amount === 0) return 'Gratis';

  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea horas de juego con 1 decimal (ej: 1405.3 -> "1.405,3").
 */
export function formatHours(hours: number): string {
  return new Intl.NumberFormat('es-ES', {
    useGrouping: true,
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(hours);
}

/**
 * Formatea enteros con separador de miles (ej: 15420 -> "15.420").
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    useGrouping: true,
  }).format(value);
}
