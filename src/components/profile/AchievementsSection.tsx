// =============================================================================
// SteamStats — Achievements & Platinums Section Component
// Copyright (c) 2026 GuacamoleGH · steamstats.guacamolegh.es
// Licensed under the MIT License. Built with dbv-specs-ops
// @spec REQ-13, RNF-03
// =============================================================================

import React from 'react';
import Image from 'next/image';
import { Trophy, Award, CheckCircle2, Percent, Sparkles } from 'lucide-react';
import { ProfileAchievementsSummary } from '@/lib/steam/achievements';

interface AchievementsSectionProps {
  data: ProfileAchievementsSummary;
}

export function AchievementsSection({ data }: AchievementsSectionProps) {
  if (!data || data.gamesTracked === 0) {
    return null;
  }

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-carbon-card border border-carbon-border shadow-card mb-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-guacamole-500/10 border border-guacamole-400/20 text-guacamole-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Logros y Platinos
                <span className="text-xs px-2 py-0.5 rounded-full bg-guacamole-500/20 border border-guacamole-400/30 text-guacamole-400 font-mono">
                  {data.gamesTracked} analizados
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Progreso de insignias y juegos completados al 100%
              </p>
            </div>
          </div>
        </div>

        {/* Métricas destacadas */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-carbon-surface border border-carbon-border">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Platinos (100%)</div>
              <div className="text-sm font-bold text-amber-400 font-mono">
                {data.perfectGamesCount} juegos
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-carbon-surface border border-carbon-border">
            <Percent className="w-4 h-4 text-guacamole-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Tasa Media</div>
              <div className="text-sm font-bold text-guacamole-400 font-mono">
                {data.averageCompletionRate}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-carbon-surface border border-carbon-border">
            <Award className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Desbloqueados</div>
              <div className="text-sm font-bold text-cyan-400 font-mono">
                {data.totalAchievementsEarned}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Juegos con Progreso */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.games.map((game) => (
          <div
            key={game.appId}
            className={`p-4 rounded-xl border transition-all ${
              game.isPerfect
                ? 'bg-amber-500/[0.04] border-amber-500/30 hover:border-amber-400/50 shadow-sm'
                : 'bg-carbon-surface border-carbon-border hover:border-white/20'
            }`}
          >
            <div className="flex gap-3">
              {/* Carátula */}
              <div className="w-20 h-10 rounded-lg overflow-hidden bg-carbon-deep shrink-0 border border-white/5 relative">
                {game.headerImage ? (
                  <Image
                    src={game.headerImage}
                    alt={game.gameName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full bg-carbon-surface" />
                )}
              </div>

              {/* Título y Badge Platino */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs font-semibold text-white truncate" title={game.gameName}>
                    {game.gameName}
                  </h3>
                  {game.isPerfect && (
                    <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Trophy className="w-2.5 h-2.5" />
                      100%
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1">
                  <span>
                    {game.achievedCount} / {game.totalCount} logros
                  </span>
                  <span
                    className={
                      game.isPerfect
                        ? 'text-amber-400 font-bold'
                        : 'text-guacamole-400'
                    }
                  >
                    {game.completionPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-3 w-full bg-carbon-deep rounded-full h-1.5 overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  game.isPerfect
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                    : 'bg-gradient-to-r from-guacamole-500 to-guacamole-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, game.completionPercentage))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
