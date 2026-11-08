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
 * Diseñada en perfecta consonancia visual con los tokens de diseño GuacamoleGH.
 * @spec REQ-08, RNF-04, RNF-05
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  Flame,
  Zap,
  Clock,
  Filter,
  Trophy,
  Sparkles,
  Gamepad2,
  TrendingUp,
  Info,
} from 'lucide-react';
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

  // Organizar los 365 días en columnas semanales de 7 días (Lunes a Domingo)
  const weeks = useMemo(() => {
    if (days.length === 0) return [];

    const result: (DailyActivityDay | null)[][] = [];
    let currentWeek: (DailyActivityDay | null)[] = [];

    // Ajustar el primer día de la semana (Lunes = 0 .. Domingo = 6)
    const firstDate = new Date(days[0].date);
    const dayOfWeek = firstDate.getUTCDay(); // 0 es domingo
    const adjustedDay = (dayOfWeek + 6) % 7; // Convertir: Lunes=0, Martes=1, ..., Domingo=6

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

  // Colores por nivel de intensidad - Sin bordes blancos estridentes
  const levelClassMap = {
    0: 'bg-[#12161f] border border-[#1b2230] hover:border-carbon-400',
    1: 'bg-guacamole-950 border border-guacamole-900/60 hover:border-guacamole-400',
    2: 'bg-guacamole-800 border border-guacamole-700 hover:border-guacamole-300',
    3: 'bg-guacamole-600 border border-guacamole-500 hover:border-guacamole-200',
    4: 'bg-guacamole-400 border border-guacamole-300 shadow-sm shadow-guacamole-400/40 hover:border-white',
  };

  const monthNames = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];

  // Formato legible de fecha para el tooltip (con solo la primera letra en mayúscula)
  const formatTooltipDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    const formatted = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <div className="mb-8 space-y-6">
      {/* 1. Métricas Principales (Estilo Tarjetas GuacamoleGH con iconos y subtítulo) */}
      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Horas en el año */}
            <div className="p-5 rounded-2xl bg-carbon-card border border-carbon-border hover:border-guacamole-400/30 transition-all shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Horas en el año</span>
                <div className="p-2 rounded-lg bg-carbon-surface text-guacamole-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {formatHours(stats.totalHours)}{' '}
                  <span className="text-lg font-sans font-semibold text-guacamole-400">h</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  &asymp; {formatHours(stats.avgHoursPerActiveDay)} h por día activo
                </p>
              </div>
            </div>

            {/* Días Activos */}
            <div className="p-5 rounded-2xl bg-carbon-card border border-carbon-border hover:border-turquoise-400/30 transition-all shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Días Activos</span>
                <div className="p-2 rounded-lg bg-carbon-surface text-turquoise-400">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {formatNumber(stats.activeDays)}{' '}
                  <span className="text-lg font-sans font-semibold text-slate-400">/ 365</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  &asymp; {Math.round((stats.activeDays / 365) * 100)}% de los días del año
                </p>
              </div>
            </div>

            {/* Racha Máxima */}
            <div className="p-5 rounded-2xl bg-carbon-card border border-carbon-border hover:border-amber-400/30 transition-all shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Racha Máxima</span>
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold font-mono text-amber-400 tracking-tight">
                  {stats.longestStreak}{' '}
                  <span className="text-lg font-sans font-semibold text-amber-400/80">días</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Récord histórico consecutivo
                </p>
              </div>
            </div>

            {/* Racha Actual */}
            <div className="p-5 rounded-2xl bg-carbon-card border border-carbon-border hover:border-guacamole-400/30 transition-all shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Racha Actual</span>
                <div className="p-2 rounded-lg bg-guacamole-400/10 text-guacamole-400">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold font-mono text-guacamole-400 tracking-tight">
                  {stats.currentStreak}{' '}
                  <span className="text-lg font-sans font-semibold text-guacamole-400/80">días</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {stats.currentStreak > 0
                    ? 'Activo en días consecutivos'
                    : 'Sin sesión registrada hoy'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Métricas Avanzadas Adicionales (Más Información Solicitada) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Día Récord (Pico de actividad) */}
            <div className="p-5 rounded-2xl bg-carbon-card border border-carbon-border hover:border-amber-400/30 transition-all shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Pico de Juego</span>
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {stats.maxDay ? formatHours(stats.maxDay.hours) : '0'}{' '}
                  <span className="text-lg font-sans font-semibold text-amber-400">h</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono truncate">
                  {stats.maxDay ? stats.maxDay.date : 'Sin registro'}
                </p>
              </div>
            </div>

            {/* Día Favorito */}
            <div className="p-5 rounded-2xl bg-carbon-card border border-carbon-border hover:border-guacamole-400/30 transition-all shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Día Preferido</span>
                <div className="p-2 rounded-lg bg-carbon-surface text-guacamole-400">
                  <Gamepad2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold font-sans text-white tracking-tight truncate">
                  {stats.favoriteDayName || 'Sábados'}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {stats.weekendPercentage}% horas en fin de semana
                </p>
              </div>
            </div>

            {/* Intensidad Media */}
            <div className="p-5 rounded-2xl bg-carbon-card border border-carbon-border hover:border-turquoise-400/30 transition-all shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Sesión Media</span>
                <div className="p-2 rounded-lg bg-carbon-surface text-turquoise-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {formatHours(stats.avgHoursPerActiveDay)}{' '}
                  <span className="text-lg font-sans font-semibold text-turquoise-400">h</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Intensidad media por día jugado
                </p>
              </div>
            </div>

            {/* Mes Más Activo */}
            <div className="p-5 rounded-2xl bg-carbon-card border border-carbon-border hover:border-guacamole-400/30 transition-all shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Mes Más Activo</span>
                <div className="p-2 rounded-lg bg-carbon-surface text-guacamole-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold font-sans text-white tracking-tight truncate">
                  {stats.mostActiveMonth || 'Noviembre'}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Mayor volumen de tiempo en el año
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 3. Contenedor Principal del Heatmap Anual */}
      <div className="p-6 sm:p-8 rounded-2xl bg-carbon-card border border-carbon-border shadow-card">
        {/* Cabecera y Selector de Juego */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-carbon-border pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium tracking-wider text-guacamole-400 uppercase">
                Ritmo de Juego
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-guacamole-400"></span>
              <span className="text-xs font-mono text-slate-400">Últimos 365 días</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-0.5 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-guacamole-400" />
              <span>Actividad Diaria</span>
            </h2>
          </div>

          {/* Filtro por Juego */}
          <div className="flex items-center gap-2.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedAppId}
              onChange={(e) =>
                setSelectedAppId(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              aria-label="Filtrar actividad por juego"
              className="bg-carbon-surface border border-carbon-border text-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-guacamole-400 hover:border-carbon-border transition-colors cursor-pointer max-w-xs shadow-inner"
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

        {/* Contenedor del Heatmap con Scroll Horizontal */}
        <div className="relative overflow-x-auto pb-2 pt-1">
          {loading ? (
            <div className="h-40 flex items-center justify-center text-xs font-mono text-slate-400">
              Cargando historial de actividad...
            </div>
          ) : !hasData ? (
            /* Estado Vacío Claro */
            <div className="p-8 rounded-xl bg-carbon-surface/60 border border-carbon-border text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-carbon-card border border-carbon-border flex items-center justify-center text-slate-400 mb-3">
                <Info className="w-6 h-6 text-guacamole-400" />
              </div>
              <h4 className="text-base font-semibold text-white">
                Historial de actividad en acumulación
              </h4>
              <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
                El proceso background worker de SteamStats guarda una instantánea diaria a medianoche.
                Conforme pasen los días, aquí verás el cálculo por diferencia de tus sesiones de juego.
              </p>
            </div>
          ) : (
            <div>
              {/* Meses en cabecera */}
              <div className="flex text-[10px] font-mono text-slate-400 mb-2 pl-7 select-none">
                {weeks.map((week, idx) => {
                  const firstValid = week.find((d) => d !== null);
                  if (!firstValid) return <div key={idx} className="w-3.5 mr-1" />;

                  const dayNum = parseInt(firstValid.date.split('-')[2], 10);
                  const monthNum = parseInt(firstValid.date.split('-')[1], 10);

                  // Mostrar el mes si estamos en los primeros 7 días de dicho mes
                  if (dayNum <= 7) {
                    return (
                      <div key={idx} className="w-3.5 mr-1 text-guacamole-400 font-bold">
                        {monthNames[monthNum - 1]}
                      </div>
                    );
                  }

                  return <div key={idx} className="w-3.5 mr-1" />;
                })}
              </div>

              {/* Días de la semana (Lun, Mié, Vie) y Cuadrícula */}
              <div className="flex items-start">
                {/* Etiquetas de días de la semana */}
                <div className="flex flex-col justify-between text-[9px] font-mono text-slate-400 pr-2 pt-0.5 h-[106px] select-none">
                  <span className="leading-none">Lun</span>
                  <span className="leading-none">Mié</span>
                  <span className="leading-none">Vie</span>
                </div>

                {/* Columnas Semanales */}
                <div className="flex gap-1" role="grid" aria-label="Cuadrícula de actividad anual">
                  {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-1" role="row">
                      {week.map((day, dayIdx) => {
                        if (!day) {
                          return (
                            <div
                              key={dayIdx}
                              className="w-3 h-3 rounded-sm opacity-0 pointer-events-none"
                            />
                          );
                        }

                        const colorClass = levelClassMap[day.level];

                        return (
                          <div
                            key={day.date}
                            onMouseEnter={() => setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                            tabIndex={0}
                            role="gridcell"
                            aria-label={`${day.date}: ${day.hours} horas jugadas`}
                            className={`w-3 h-3 rounded-[3px] transition-all duration-150 cursor-pointer ${colorClass}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Leyenda y Tooltip Flotante */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-carbon-border text-xs font-mono">
                {/* Tooltip Dinámico o Texto Informativo */}
                <div className="text-slate-300 min-h-[20px] flex items-center">
                  {hoveredDay ? (
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">
                        {formatTooltipDate(hoveredDay.date)}:
                      </span>
                      {hoveredDay.minutes > 0 ? (
                        <span className="text-guacamole-400 font-bold">
                          {formatHours(hoveredDay.hours)} h jugadas ({hoveredDay.minutes} min)
                        </span>
                      ) : (
                        <span className="text-slate-400">Sin tiempo registrado</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">Pasa el cursor sobre un día para ver detalles</span>
                  )}
                </div>

                {/* Escala de Intensidad */}
                <div className="flex items-center gap-2 text-slate-400">
                  <span>Menos</span>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-[3px] bg-[#12161f] border border-[#1b2230]" />
                    <span className="w-3 h-3 rounded-[3px] bg-guacamole-950 border border-guacamole-900/60" />
                    <span className="w-3 h-3 rounded-[3px] bg-guacamole-800 border border-guacamole-700" />
                    <span className="w-3 h-3 rounded-[3px] bg-guacamole-600 border border-guacamole-500" />
                    <span className="w-3 h-3 rounded-[3px] bg-guacamole-400 border border-guacamole-300 shadow-sm shadow-guacamole-400/40" />
                  </div>
                  <span>Más</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
