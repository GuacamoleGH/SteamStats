// =============================================================================
// SteamStats — Summary Cards Component
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import React from 'react';
import { Clock, Flame, Ghost, Zap } from 'lucide-react';
import { CompleteProfileData } from '@/lib/steam/api';

interface SummaryCardsProps {
  data: CompleteProfileData;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
  const { stats, levelInfo } = data;

  // Formato es-ES para números
  const formatHours = (hours: number) =>
    new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
      hours
    );

  const totalDays = Math.round((stats.totalPlaytimeHours / 24) * 10) / 10;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* 1. Horas Totales */}
      <div className="p-5 rounded-2xl bg-carbon-card border border-carbon-border hover:border-guacamole-400/30 transition-all shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Horas Totales</span>
          <div className="p-2 rounded-lg bg-carbon-surface text-guacamole-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {formatHours(stats.totalPlaytimeHours)}{' '}
            <span className="text-lg font-sans font-semibold text-guacamole-400">h</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            &asymp; {new Intl.NumberFormat('es-ES').format(totalDays)} días de tu vida
          </p>
        </div>
      </div>

      {/* 2. Horas Últimas 2 Semanas */}
      <div className="p-5 rounded-2xl bg-carbon-card border border-carbon-border hover:border-turquoise-400/30 transition-all shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Últimas 2 Semanas</span>
          <div className="p-2 rounded-lg bg-carbon-surface text-turquoise-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {formatHours(stats.twoWeeksPlaytimeHours)}{' '}
            <span className="text-lg font-sans font-semibold text-turquoise-400">h</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {stats.twoWeeksPlaytimeHours > 0
              ? 'Actividad reciente en Steam'
              : 'Sin tiempo registrado recientemente'}
          </p>
        </div>
      </div>

      {/* 3. Pile of Shame (Juegos sin tocar) */}
      <div className="p-5 rounded-2xl bg-carbon-card border border-carbon-border hover:border-rose-500/30 transition-all shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Pile of Shame</span>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <Ghost className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {stats.unplayedGames}
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
              {stats.unplayedPercentage}% sin jugar
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {stats.playedGames} jugados de {stats.totalGames} totales
          </p>
        </div>
      </div>

      {/* 4. Nivel & Progreso de XP */}
      <div className="p-5 rounded-2xl bg-carbon-card border border-carbon-border hover:border-amber-400/30 transition-all shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Nivel & XP</span>
          <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              Nivel {levelInfo.level}
            </div>
            <span className="text-xs font-mono text-slate-400">
              Faltan <strong className="text-amber-400">{levelInfo.xpNeededToNextLevel} XP</strong>
            </span>
          </div>

          {/* Barra de progreso hacia el siguiente nivel */}
          <div className="w-full bg-carbon-surface h-2 rounded-full overflow-hidden border border-carbon-border">
            <div
              className="bg-accent-gradient h-full rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progressPercent}%` }}
              role="progressbar"
              aria-valuenow={levelInfo.progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="flex justify-between items-center mt-1.5 text-[11px] font-mono text-slate-500">
            <span>Lvl {levelInfo.level}</span>
            <span>{levelInfo.progressPercent}% hacia Lvl {levelInfo.level + 1}</span>
            <span>Lvl {levelInfo.level + 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
