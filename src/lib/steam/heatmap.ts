// =============================================================================
// SteamStats — Activity Heatmap & Snapshot Difference Engine
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Motor de cálculo de actividad diaria por diferencia de instantáneas,
 * rachas consecutivas (streaks), niveles de intensidad y cuadrícula anual estilo GitHub.
 * @spec REQ-08, RNF-04, RNF-05
 */

export interface DailyActivityDay {
  date: string; // Formato YYYY-MM-DD
  minutes: number;
  hours: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface HeatmapStats {
  totalHours: number;
  activeDays: number;
  longestStreak: number;
  currentStreak: number;
  maxDay: { date: string; hours: number } | null;
}

export interface HeatmapData {
  stats: HeatmapStats;
  days: DailyActivityDay[];
  hasData: boolean;
}

/**
 * Asigna un nivel de intensidad 0..4 según los minutos jugados en el día.
 */
export function getIntensityLevel(minutes: number): 0 | 1 | 2 | 3 | 4 {
  if (minutes <= 0) return 0;
  if (minutes < 60) return 1;       // < 1h
  if (minutes < 180) return 2;      // 1h - 3h
  if (minutes < 360) return 3;      // 3h - 6h
  return 4;                         // 6h+
}

/**
 * Formatea un objeto Date a string YYYY-MM-DD en UTC.
 */
export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Genera el rango completo de fechas de los últimos N días (por defecto 365 días)
 * terminando en la fecha de referencia (o hoy).
 */
export function generateDateRange(daysCount: number = 365, endDate: Date = new Date()): string[] {
  const dates: string[] = [];
  const current = new Date(endDate);
  current.setUTCHours(0, 0, 0, 0);

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(current);
    d.setUTCDate(current.getUTCDate() - i);
    dates.push(formatDateKey(d));
  }

  return dates;
}

export interface RawSnapshotItem {
  appId: number;
  playtimeForeverMin: number;
  snapshotDate: Date;
}

/**
 * Calcula la actividad diaria por diferencia de minutos entre snapshots sucesivos.
 * @spec REQ-08
 */
export function calculateDailyActivity(
  snapshots: RawSnapshotItem[],
  daysCount: number = 365,
  endDate: Date = new Date()
): HeatmapData {
  if (snapshots.length === 0) {
    const emptyRange = generateDateRange(daysCount, endDate);
    return {
      stats: {
        totalHours: 0,
        activeDays: 0,
        longestStreak: 0,
        currentStreak: 0,
        maxDay: null,
      },
      days: emptyRange.map((date) => ({
        date,
        minutes: 0,
        hours: 0,
        level: 0,
      })),
      hasData: false,
    };
  }

  // 1. Agrupar snapshots por juego y ordenar cronológicamente
  const snapshotsByGame = new Map<number, RawSnapshotItem[]>();
  for (const s of snapshots) {
    if (!snapshotsByGame.has(s.appId)) {
      snapshotsByGame.set(s.appId, []);
    }
    snapshotsByGame.get(s.appId)!.push(s);
  }

  // 2. Para cada juego, calcular la diferencia diaria entre snapshots consecutivos
  // dailyMinutesMap: fecha (YYYY-MM-DD) -> minutos jugados ese día
  const dailyMinutesMap = new Map<string, number>();

  for (const [, gameSnapshots] of snapshotsByGame.entries()) {
    gameSnapshots.sort((a, b) => a.snapshotDate.getTime() - b.snapshotDate.getTime());

    for (let i = 1; i < gameSnapshots.length; i++) {
      const prev = gameSnapshots[i - 1];
      const curr = gameSnapshots[i];
      const diffMin = Math.max(0, curr.playtimeForeverMin - prev.playtimeForeverMin);

      if (diffMin > 0) {
        const dateKey = formatDateKey(curr.snapshotDate);
        const existing = dailyMinutesMap.get(dateKey) ?? 0;
        dailyMinutesMap.set(dateKey, existing + diffMin);
      }
    }
  }

  // 3. Rellenar los 365 días en la cuadrícula completa
  const dateRange = generateDateRange(daysCount, endDate);
  let totalMinutes = 0;
  let activeDays = 0;
  let maxDay: { date: string; hours: number } | null = null;

  const days: DailyActivityDay[] = dateRange.map((date) => {
    const minutes = dailyMinutesMap.get(date) ?? 0;
    const hours = Math.round((minutes / 60) * 10) / 10;
    const level = getIntensityLevel(minutes);

    if (minutes > 0) {
      activeDays++;
      totalMinutes += minutes;

      if (!maxDay || hours > maxDay.hours) {
        maxDay = { date, hours };
      }
    }

    return {
      date,
      minutes,
      hours,
      level,
    };
  });

  // 4. Calcular rachas (streaks) consecutivas
  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  for (let i = 0; i < days.length; i++) {
    if (days[i].minutes > 0) {
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
  }

  // Racha actual (contando desde hoy hacia atrás)
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].minutes > 0) {
      currentStreak++;
    } else {
      // Si hoy aún no ha jugado, permitimos que la racha de ayer cuente
      if (i === days.length - 1) {
        continue;
      }
      break;
    }
  }

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const hasData = dailyMinutesMap.size > 0;

  return {
    stats: {
      totalHours,
      activeDays,
      longestStreak,
      currentStreak,
      maxDay,
    },
    days,
    hasData,
  };
}

/**
 * Generador de datos simulados para pruebas y para el perfil de ejemplo
 * (GuacamoleSteam) cuando aún no hay historial de snapshots registrado.
 */
export function generateMockSnapshots(steamId: string, appId: number, totalMinutes: number): RawSnapshotItem[] {
  const snapshots: RawSnapshotItem[] = [];
  const now = new Date();

  // Generamos una progresión histórica realista en los últimos 180 días
  let currentMin = Math.max(0, totalMinutes - 2400); // Horas previas
  for (let i = 180; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(now.getUTCDate() - i);
    d.setUTCHours(0, 0, 0, 0);

    // Mayor probabilidad de jugar en fines de semana
    const dayOfWeek = d.getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const playChance = isWeekend ? 0.65 : 0.35;

    if (Math.random() < playChance && i > 0) {
      const addedMinutes = isWeekend
        ? Math.floor(Math.random() * 180) + 45
        : Math.floor(Math.random() * 90) + 20;
      currentMin += addedMinutes;
    }

    snapshots.push({
      appId,
      playtimeForeverMin: Math.min(currentMin, totalMinutes),
      snapshotDate: d,
    });
  }

  return snapshots;
}
