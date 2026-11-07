'use client';

// =============================================================================
// SteamStats — GitHub-Style Activity Heatmap Component
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Cuadrícula anual interactiva de 52 semanas inspirada en GitHub
 * con niveles de color verde Guacamole, filtro por juego, cálculo de rachas y tooltip.
 * @spec REQ-08, RNF-04, RNF-05
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Flame, Zap, Award, Info, Filter } from 'lucide-react';
import { DailyActivityDay, HeatmapStats } from '@/lib/steam/heatmap';
import { formatHours, formatNumber } from '@/lib/formatters';

interface GameOption {
  appId: number;
  name: string;
  playtimeHours: number;
}

interface ActivityHeatmapProps {
  steamId: string;
}

export function ActivityHeatmap({ steamId }: ActivityHeatmapProps) {
  const [selectedAppId, setSelectedAppId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [days, setDays] = useState<DailyActivityDay[]>([]);
  const [stats, setStats] = useState<HeatmapStats | null>(null);
  const [hasData, setHasData] = useState<boolean>(false);
  const [games, setGames] = useState<GameOption[]>([]);
  const [hoveredDay, setHoveredDay] = useState<DailyActivityDay | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const query = selectedAppId !== 'all' ? `?appId=${selectedAppId}` : '';
    fetch(`/api/profile/${steamId}/heatmap${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setDays(data.days || []);
        setStats(data.stats || null);
        setHasData(data.hasData || false);
        if (data.games && games.length === 0) {
          setGames(data.games);
        }
      })
      .catch((err) => {
        console.error('Error fetching heatmap:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [steamId, selectedAppId]);

  // Organizar los 365 días en columnas semanales de 7 días (0 = Domingo a 6 = Sábado, o Lunes a Domingo)
  const weeks = useMemo(() => {
    if (days.length === 0) return [];

    const result: (DailyActivityDay | null)[][] = [];
    let currentWeek: (DailyActivityDay | null)[] = [];

    // Ajustar el primer día de la semana (Lunes = 0 .. Domingo = 6)
    const firstDate = new Date(days[0].date);
    let dayOfWeek = firstDate.getUTCDay(); // 0 es domingo
    const adjustedDay = (dayOfWeek + 6) % 7; // Convertir: Lunes=0, Martes=1, ..., Domingo=6

    // Rellenar espacios vacíos antes del primer día si no empieza en lunes
    for (let i = 0; i < adjustedDay; i++) {
      currentWeek.push(null);
    }

    for (const day of days) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      result.push(currentWeek);
    }

    return result;
  }, [days]);

  // Colores por nivel de intensidad
  const levelClassMap = {
    0: 'bg-carbon-800/80 border-carbon-700/40 hover:border-carbon-500',
    1: 'bg-guacamole-950 border-guacamole-800/50 hover:border-guacamole-400',
    2: 'bg-guacamole-700 border-guacamole-600 hover:border-guacamole-300',
    3: 'bg-guacamole-500 border-guacamole-400 hover:border-white',
    4: 'bg-guacamole-400 border-guacamole-300 shadow-sm shadow-guacamole-400/50 hover:border-white',
  };

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Formato legible de fecha para el tooltip
  const formatTooltipDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  };

  return (
    <div className="rounded-2xl border border-carbon-800 bg-carbon-900/90 p-6 sm:p-8 backdrop-blur-sm shadow-xl mb-8">
      {/* Cabecera y Selector de Juego */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-carbon-800/80 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium tracking-wider text-guacamole-400 uppercase">
              Ritmo de Juego
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-guacamole-400"></span>
            <span className="text-xs font-mono text-carbon-400">Últimos 365 días</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-0.5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-guacamole-400" />
            <span>Actividad Diaria</span>
          </h2>
        </div>

        {/* Filtro por Juego */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-carbon-400" />
          <select
            value={selectedAppId}
            onChange={(e) =>
              setSelectedAppId(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            aria-label="Filtrar actividad por juego"
            className="bg-carbon-950 border border-carbon-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-guacamole-400 transition-colors cursor-pointer max-w-xs"
          >
            <option value="all">🎮 Todos los juegos combinados</option>
            {games.map((g) => (
              <option key={g.appId} value={g.appId}>
                {g.name} ({g.playtimeHours} h)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Métricas Resumen del Heatmap */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="p-3.5 rounded-xl bg-carbon-950/70 border border-carbon-800 flex flex-col">
            <span className="text-[11px] font-mono text-carbon-400">Horas en el año</span>
            <span className="text-xl font-mono font-bold text-white mt-0.5">
              {formatHours(stats.totalHours)}{' '}
              <span className="text-xs text-guacamole-400">h</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-carbon-950/70 border border-carbon-800 flex flex-col">
            <span className="text-[11px] font-mono text-carbon-400">Días activos</span>
            <span className="text-xl font-mono font-bold text-white mt-0.5">
              {formatNumber(stats.activeDays)}{' '}
              <span className="text-xs text-carbon-400">/ 365</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-carbon-950/70 border border-carbon-800 flex flex-col">
            <span className="text-[11px] font-mono text-carbon-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Racha máxima</span>
            </span>
            <span className="text-xl font-mono font-bold text-amber-400 mt-0.5">
              {stats.longestStreak}{' '}
              <span className="text-xs text-carbon-400">días</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-carbon-950/70 border border-carbon-800 flex flex-col">
            <span className="text-[11px] font-mono text-carbon-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-guacamole-400" />
              <span>Racha actual</span>
            </span>
            <span className="text-xl font-mono font-bold text-guacamole-400 mt-0.5">
              {stats.currentStreak}{' '}
              <span className="text-xs text-carbon-400">días</span>
            </span>
          </div>
        </div>
      )}

      {/* Contenedor del Heatmap con Scroll Horizontal Responsivo */}
      <div className="relative overflow-x-auto pb-2 pt-1">
        {loading ? (
          <div className="h-40 flex items-center justify-center text-xs font-mono text-carbon-400">
            Cargando historial de actividad...
          </div>
        ) : !hasData ? (
          /* Estado Vacío Claro */
          <div className="p-8 rounded-xl bg-carbon-950/50 border border-carbon-800/80 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-carbon-800/50 border border-carbon-700/50 flex items-center justify-center text-carbon-400 mb-3">
              <Info className="w-6 h-6 text-guacamole-400" />
            </div>
            <h4 className="text-base font-semibold text-white">
              Historial de actividad en acumulación
            </h4>
            <p className="text-xs text-carbon-400 max-w-md mt-1 leading-relaxed">
              El proceso background worker de SteamStats guarda una instantánea diaria a medianoche.
              Conforme pasen los días, aquí verás el cálculo por diferencia de tus sesiones de juego.
            </p>
          </div>
        ) : (
          <div>
            {/* Meses en cabecera */}
            <div className="flex text-[10px] font-mono text-carbon-400 mb-2 pl-7 select-none">
              {monthNames.map((m, i) => (
                <div key={i} className="flex-1 text-left min-w-[50px]">
                  {m}
                </div>
              ))}
            </div>

            {/* Cuadrícula de Semanas (52 columnas x 7 filas) */}
            <div className="flex gap-1.5 items-start">
              {/* Días de la semana (Lunes, Miércoles, Viernes) */}
              <div className="flex flex-col gap-1.5 text-[10px] font-mono text-carbon-400 pr-2 pt-0.5 select-none shrink-0">
                <span className="h-3 flex items-center">Lun</span>
                <span className="h-3 flex items-center opacity-0">Mar</span>
                <span className="h-3 flex items-center">Mié</span>
                <span className="h-3 flex items-center opacity-0">Jue</span>
                <span className="h-3 flex items-center">Vie</span>
                <span className="h-3 flex items-center opacity-0">Sáb</span>
                <span className="h-3 flex items-center opacity-0">Dom</span>
              </div>

              {/* Columnas Semanales */}
              <div className="flex gap-1">
                {weeks.map((week, wIndex) => (
                  <div key={wIndex} className="flex flex-col gap-1">
                    {week.map((day, dIndex) => {
                      if (!day) {
                        return <div key={dIndex} className="w-3 h-3 rounded-[3px] opacity-0" />;
                      }

                      return (
                        <div
                          key={day.date}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`w-3 h-3 rounded-[3px] border transition-transform hover:scale-125 cursor-pointer ${
                            levelClassMap[day.level]
                          }`}
                          title={`${formatTooltipDate(day.date)}: ${
                            day.hours > 0 ? `${day.hours.toFixed(1).replace('.', ',')} h` : 'Sin actividad'
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Tooltip Detallado al pasar el ratón */}
            <div className="h-6 mt-3 flex items-center justify-between text-xs font-mono">
              <div className="text-slate-300">
                {hoveredDay ? (
                  <span>
                    <strong className="text-white">{formatTooltipDate(hoveredDay.date)}</strong>:{' '}
                    {hoveredDay.hours > 0 ? (
                      <span className="text-guacamole-400 font-bold">
                        {hoveredDay.hours.toFixed(1).replace('.', ',')} horas jugadas
                      </span>
                    ) : (
                      <span className="text-carbon-400">Sin actividad registrada</span>
                    )}
                  </span>
                ) : (
                  <span className="text-carbon-400 text-[11px]">
                    Pasa el cursor sobre un día para ver detalles
                  </span>
                )}
              </div>

              {/* Leyenda de Intensidad */}
              <div className="flex items-center gap-1.5 text-[11px] text-carbon-400 select-none">
                <span>Menos</span>
                <span className="w-2.5 h-2.5 rounded-[2px] bg-carbon-800 border border-carbon-700/40 inline-block" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-guacamole-950 border border-guacamole-800/50 inline-block" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-guacamole-700 border border-guacamole-600 inline-block" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-guacamole-500 border border-guacamole-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-guacamole-400 border border-guacamole-300 inline-block" />
                <span>Más</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
