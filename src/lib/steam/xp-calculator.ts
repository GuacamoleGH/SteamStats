// =============================================================================
// SteamStats — Steam Level & XP Calculator
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Algoritmo matemático oficial de cálculo de niveles y XP de Steam.
 * @spec REQ-03
 *
 * Regla de Steam:
 * El coste de subir desde el nivel L al nivel L + 1 es:
 * Coste = 100 * (floor(L / 10) + 1)
 */

export interface LevelXpInfo {
  level: number;
  currentXp: number;
  levelStartXp: number;
  nextLevelXp: number;
  xpNeededToNextLevel: number;
  xpCostForCurrentLevel: number;
  progressPercent: number;
}

/**
 * Calcula el XP acumulado total necesario para alcanzar el nivel L desde cero.
 */
export function getTotalXpForLevel(level: number): number {
  if (level <= 0) return 0;

  const fullDecades = Math.floor(level / 10);
  const remainderLevels = level % 10;

  // Suma de cada decena completa: 10 niveles * (k + 1) * 100 XP
  // Sumatorio de k=0 hasta fullDecades-1 de (1000 * (k + 1))
  // = 1000 * (fullDecades * (fullDecades + 1) / 2)
  const decadesXp = 1000 * ((fullDecades * (fullDecades + 1)) / 2);

  // Niveles en la decena actual
  const remainderXp = remainderLevels * (fullDecades + 1) * 100;

  return decadesXp + remainderXp;
}

/**
 * Devuelve el coste en XP para subir del nivel L al nivel L + 1.
 */
export function getXpCostForNextLevel(level: number): number {
  if (level < 0) return 100;
  return 100 * (Math.floor(level / 10) + 1);
}

/**
 * Calcula la información completa de progreso de nivel a partir del nivel y XP actual.
 * @spec REQ-03
 */
export function calculateLevelProgress(level: number, currentXp?: number): LevelXpInfo {
  const safeLevel = Math.max(0, Math.floor(level));
  const levelStartXp = getTotalXpForLevel(safeLevel);
  const xpCost = getXpCostForNextLevel(safeLevel);
  const nextLevelXp = levelStartXp + xpCost;

  // Si no se proporciona currentXp o es menor que la base del nivel, usar base
  const safeCurrentXp =
    currentXp !== undefined && currentXp >= levelStartXp
      ? currentXp
      : levelStartXp;

  const xpEarnedInLevel = Math.max(0, safeCurrentXp - levelStartXp);
  const xpNeeded = Math.max(0, nextLevelXp - safeCurrentXp);
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpEarnedInLevel / xpCost) * 100)));

  return {
    level: safeLevel,
    currentXp: safeCurrentXp,
    levelStartXp,
    nextLevelXp,
    xpNeededToNextLevel: xpNeeded,
    xpCostForCurrentLevel: xpCost,
    progressPercent,
  };
}
