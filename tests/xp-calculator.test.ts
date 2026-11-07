// =============================================================================
// SteamStats — Unit Tests: Steam Level & XP Formula
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  getTotalXpForLevel,
  getXpCostForNextLevel,
  calculateLevelProgress,
} from '../src/lib/steam/xp-calculator';

/**
 * @fileoverview Verificación matemática de la regla de Steam:
 * Coste del nivel L = 100 * (floor(L / 10) + 1)
 * @spec REQ-03
 */

describe('Steam XP Calculator (REQ-03)', () => {
  it('coste para subir desde los primeros niveles (0 a 9) debe ser 100 XP por nivel', () => {
    expect(getXpCostForNextLevel(0)).toBe(100);
    expect(getXpCostForNextLevel(1)).toBe(100);
    expect(getXpCostForNextLevel(9)).toBe(100);
  });

  it('coste para subir desde niveles 10 a 19 debe ser 200 XP por nivel', () => {
    expect(getXpCostForNextLevel(10)).toBe(200);
    expect(getXpCostForNextLevel(15)).toBe(200);
    expect(getXpCostForNextLevel(19)).toBe(200);
  });

  it('coste para subir desde niveles 20 a 29 debe ser 300 XP por nivel', () => {
    expect(getXpCostForNextLevel(20)).toBe(300);
    expect(getXpCostForNextLevel(29)).toBe(300);
  });

  it('calcula correctamente el XP total acumulado en puntos clave', () => {
    expect(getTotalXpForLevel(0)).toBe(0);
    expect(getTotalXpForLevel(1)).toBe(100);
    expect(getTotalXpForLevel(10)).toBe(1000); // 10 niveles de 100
    expect(getTotalXpForLevel(11)).toBe(1200); // 1000 + 200
    expect(getTotalXpForLevel(20)).toBe(3000); // 1000 + 10*200
    expect(getTotalXpForLevel(30)).toBe(6000); // 3000 + 10*300
  });

  it('calcula progreso porcentual y XP restante para un jugador con nivel y XP', () => {
    // Jugador nivel 12 con 1500 XP:
    // Nivel 12 base = 1000 + 2*200 = 1400 XP
    // Nivel 13 = 1600 XP (coste 200 XP)
    // XP actual = 1500 XP (ganados 100 XP de 200 -> 50% de progreso, faltan 100 XP)
    const progress = calculateLevelProgress(12, 1500);
    expect(progress.level).toBe(12);
    expect(progress.currentXp).toBe(1500);
    expect(progress.levelStartXp).toBe(1400);
    expect(progress.nextLevelXp).toBe(1600);
    expect(progress.xpNeededToNextLevel).toBe(100);
    expect(progress.xpCostForCurrentLevel).toBe(200);
    expect(progress.progressPercent).toBe(50);
  });
});
