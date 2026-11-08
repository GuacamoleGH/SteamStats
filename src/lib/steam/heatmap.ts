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
  avgHoursPerActiveDay: number;
  weekendPercentage: number;
  favoriteDayName: string;
  mostActiveMonth: string;
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

const SPANISH_DAY_NAMES = [
  'Domingos',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábados',
];

const SPANISH_MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

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
        avgHoursPerActiveDay: 0,
        weekendPercentage: 0,
        favoriteDayName: 'Fines de semana',
        mostActiveMonth: 'Noviembre',
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
  const dayOfWeekMinutes = new Array(7).fill(0);
  const monthMinutesMap = new Map<string, number>();

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

      // Distribución por día de la semana y por mes
      const [y, m, d] = date.split('-').map(Number);
      const dateObj = new Date(Date.UTC(y, m - 1, d));
      const dow = dateObj.getUTCDay();
      dayOfWeekMinutes[dow] += minutes;

      const monthName = SPANISH_MONTH_NAMES[m - 1] || 'Noviembre';
      monthMinutesMap.set(monthName, (monthMinutesMap.get(monthName) ?? 0) + minutes);
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
      if (i === days.length - 1) {
        continue;
      }
      break;
    }
  }

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const hasData = dailyMinutesMap.size > 0;
  const avgHoursPerActiveDay =
    activeDays > 0 ? Math.round((totalHours / activeDays) * 10) / 10 : 0;

  // Fin de semana (Domingo=0, Sábado=6)
  const weekendMinutes = dayOfWeekMinutes[0] + dayOfWeekMinutes[6];
  const weekendPercentage =
    totalMinutes > 0 ? Math.round((weekendMinutes / totalMinutes) * 100) : 0;

  // Día favorito de la semana
  let maxDowMinutes = -1;
  let favoriteDayName = 'Sábados';
  for (let dow = 0; dow < 7; dow++) {
    if (dayOfWeekMinutes[dow] > maxDowMinutes) {
      maxDowMinutes = dayOfWeekMinutes[dow];
      favoriteDayName = SPANISH_DAY_NAMES[dow];
    }
  }

  // Mes más activo
  let maxMonthMinutes = -1;
  let mostActiveMonth = 'Noviembre';
  for (const [mName, mMin] of monthMinutesMap.entries()) {
    if (mMin > maxMonthMinutes) {
      maxMonthMinutes = mMin;
      mostActiveMonth = mName;
    }
  }

  return {
    stats: {
      totalHours,
      activeDays,
      longestStreak,
      currentStreak,
      maxDay,
      avgHoursPerActiveDay,
      weekendPercentage,
      favoriteDayName,
      mostActiveMonth,
    },
    days,
    hasData,
  };
}

/**
 * Generador de datos simulados para un perfil cuando aún no hay snapshots
 * históricos acumulados por el background worker. Distribuye el tiempo de juego
 * a lo largo de los 365 días del año de forma orgánica, destacando fines de semana,
 * rachas de sesiones y actividad reciente.
 */
export function generateMockSnapshots(
  steamId: string,
  appId: number,
  totalMinutes: number,
  daysCount: number = 365,
  endDate: Date = new Date()
): RawSnapshotItem[] {
  const end = new Date(endDate);
  end.setUTCHours(0, 0, 0, 0);

  // Semilla pseudoaleatoria determinista basada en steamId + appId
  let seed = appId * 37 + 101;
  for (let c = 0; c < steamId.length; c++) {
    seed = (seed * 31 + steamId.charCodeAt(c)) % 2147483647;
  }
  const pseudoRandom = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // Estimamos cuántos minutos corresponden al último año
  // Para juegos muy jugados (>100h), ~20-35% en el último año.
  // Para juegos medianos o recientes, hasta el 50-80%.
  const targetYearMinutes = Math.min(
    totalMinutes,
    Math.max(
      60,
      Math.floor(
        totalMinutes > 30000
          ? totalMinutes * 0.22
          : totalMinutes > 6000
          ? totalMinutes * 0.35
          : totalMinutes * 0.65
      )
    )
  );

  // Generamos incrementos diarios a lo largo de los 365 días
  const dailyIncrements: number[] = new Array(daysCount).fill(0);
  let accumulated = 0;

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - (daysCount - 1 - i));
    const dow = d.getUTCDay();
    const isWeekend = dow === 0 || dow === 6;
    const isFriday = dow === 5;

    // Mayor probabilidad de juego en fines de semana y viernes
    const playChance = isWeekend ? 0.68 : isFriday ? 0.52 : 0.34;
    const roll = pseudoRandom();

    if (roll < playChance) {
      const addedMin = isWeekend
        ? Math.floor(pseudoRandom() * 160) + 45
        : isFriday
        ? Math.floor(pseudoRandom() * 110) + 30
        : Math.floor(pseudoRandom() * 75) + 20;

      dailyIncrements[i] = addedMin;
      accumulated += addedMin;
    }
  }

  // Normalizar los incrementos al objetivo anual sin superar totalMinutes
  const scale = accumulated > 0 ? targetYearMinutes / accumulated : 1;
  for (let i = 0; i < daysCount; i++) {
    dailyIncrements[i] = Math.round(dailyIncrements[i] * scale);
  }

  // Asegurar actividad en los últimos 7 días si el juego tiene tiempo registrado
  if (totalMinutes > 300) {
    dailyIncrements[daysCount - 1] = Math.max(dailyIncrements[daysCount - 1], 45);
    dailyIncrements[daysCount - 2] = Math.max(dailyIncrements[daysCount - 2], 60);
  }

  // Recalcular la suma ajustada
  let finalYearSum = dailyIncrements.reduce((sum, val) => sum + val, 0);
  if (finalYearSum > totalMinutes) {
    finalYearSum = totalMinutes;
  }

  // Construir snapshots acumulados (playtimeForeverMin) de más antiguo a más reciente
  const initialBase = Math.max(0, totalMinutes - finalYearSum);
  let runningTotal = initialBase;
  const snapshots: RawSnapshotItem[] = [];

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - (daysCount - 1 - i));
    d.setUTCHours(0, 0, 0, 0);

    runningTotal += dailyIncrements[i];
    const playtime = Math.min(runningTotal, totalMinutes);

    snapshots.push({
      appId,
      playtimeForeverMin: i === daysCount - 1 ? totalMinutes : playtime,
      snapshotDate: d,
    });
  }

  return snapshots;
}
