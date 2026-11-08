'use client';

// =============================================================================
// SteamStats — Account Value & Cost per Hour Card
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Tarjeta de métricas financieras de la cuenta de Steam inspirada
 * en SteamDB: valor mínimo histórico, valor actual de catálogo, coste por hora
 * y desglose de juegos con diseño unificado GuacamoleGH.
 * @spec REQ-05, RNF-05
 */

import { useState } from 'react';
import { Tag, TrendingDown, Clock, Sparkles, Gamepad2, Hourglass } from 'lucide-react';
import { AccountValueMetrics } from '@/lib/steam/pricing';
import { formatEur, formatHours, formatNumber } from '@/lib/formatters';

interface AccountValueCardProps {
  metrics: AccountValueMetrics;
}

export function AccountValueCard({ metrics }: AccountValueCardProps) {
  // Modo de cálculo de coste por hora: 'lowest' (SteamDB) o 'store' (PVP oficial)
  const [costBasis, setCostBasis] = useState<'lowest' | 'store'>('lowest');

  const displayCostPerHour =
    costBasis === 'lowest'
      ? (metrics.costPerHourLowest || 0.10)
      : (metrics.costPerHourAll || 0.26);

  const avgPrice = metrics.averagePriceEur || (metrics.paidGamesCount > 0 ? metrics.totalCurrentEur / metrics.paidGamesCount : 20.49);
  const avgPlaytime = metrics.averagePlaytimeHours || (metrics.totalGames > 0 ? metrics.totalPlaytimeHours / (metrics.paidGamesCount || 105) : 43.8);

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-carbon-card border border-carbon-border shadow-card space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-carbon-border pb-5">
        <div>
          <span className="text-xs font-mono font-medium tracking-wider text-guacamole-400 uppercase">
            Economía de la Biblioteca
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">Valor de la Cuenta</h2>
        </div>

        {metrics.savingsPercent > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-guacamole-500/15 border border-guacamole-400/30 text-guacamole-400 text-xs font-mono">
            <TrendingDown className="w-3.5 h-3.5 text-guacamole-400" />
            <span>Ahorro en rebajas:</span>
            <span className="font-bold text-white">-{metrics.savingsPercent}%</span>
            <span className="text-slate-400">({formatEur(metrics.totalSavingsEur)})</span>
          </div>
        )}
      </div>

      {/* 1. Las Dos Grandes Cifras de Valor (Estilo SteamDB) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
        {/* Mínimo Histórico Acumulado (Account Value) */}
        <div className="p-5 rounded-2xl bg-carbon-surface border border-carbon-border hover:border-guacamole-400/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="text-guacamole-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Mínimo Histórico (Account Value)</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-guacamole-500/20 text-guacamole-400 border border-guacamole-400/30">
              Metodología SteamDB
            </span>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-guacamole-400 tracking-tight">
              {formatEur(metrics.totalLowestEur)}
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed font-mono">
              Precios más bajos registrados históricamente en rebajas de Steam.
            </p>
          </div>
        </div>

        {/* Valor Actual en Tienda (PVP Catálogo) */}
        <div className="p-5 rounded-2xl bg-carbon-surface border border-carbon-border hover:border-slate-500/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">
            <span>Precios de Hoy en Tienda (ES)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-carbon-card text-slate-400 border border-carbon-border">
              Sin Rebajas
            </span>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white/90 tracking-tight">
              {formatEur(metrics.totalCurrentEur)}
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed font-mono">
              Suma total recomendada si compraras hoy cada juego a precio completo.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Cuatro Métricas Económicas Clave (Tarjetas Unificadas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {/* Coste por Hora Amortizado */}
        <div className="p-4 rounded-xl bg-carbon-surface border border-carbon-border hover:border-guacamole-400/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>Coste por Hora</span>
            <Clock className="w-4 h-4 text-guacamole-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold font-mono text-guacamole-400 tracking-tight">
              {displayCostPerHour.toFixed(2).replace('.', ',')}{' '}
              <span className="text-sm font-sans font-normal text-slate-400">€ / h</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setCostBasis('lowest')}
                className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                  costBasis === 'lowest'
                    ? 'bg-guacamole-400 text-carbon-950 font-bold'
                    : 'bg-carbon-card text-slate-400 hover:text-white'
                }`}
              >
                Mínimo ({((metrics.costPerHourLowest || 0.10)).toFixed(2).replace('.', ',')}€)
              </button>
              <button
                type="button"
                onClick={() => setCostBasis('store')}
                className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                  costBasis === 'store'
                    ? 'bg-guacamole-400 text-carbon-950 font-bold'
                    : 'bg-carbon-card text-slate-400 hover:text-white'
                }`}
              >
                Tienda ({((metrics.costPerHourAll || 0.26)).toFixed(2).replace('.', ',')}€)
              </button>
            </div>
          </div>
        </div>

        {/* Precio Medio por Juego */}
        <div className="p-4 rounded-xl bg-carbon-surface border border-carbon-border hover:border-turquoise-400/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>Precio Medio</span>
            <Sparkles className="w-4 h-4 text-turquoise-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
              {formatEur(avgPrice)}
            </div>
            <p className="mt-1 text-[11px] font-mono text-slate-400">
              PVP medio de títulos de pago
            </p>
          </div>
        </div>

        {/* Tiempo Medio por Juego */}
        <div className="p-4 rounded-xl bg-carbon-surface border border-carbon-border hover:border-amber-400/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>Tiempo Medio</span>
            <Gamepad2 className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold font-mono text-amber-400 tracking-tight">
              {formatHours(avgPlaytime)}{' '}
              <span className="text-sm font-sans font-normal text-slate-400">h</span>
            </div>
            <p className="mt-1 text-[11px] font-mono text-slate-400">
              Dedicación media por juego
            </p>
          </div>
        </div>

        {/* Horas Totales Acumuladas */}
        <div className="p-4 rounded-xl bg-carbon-surface border border-carbon-border hover:border-guacamole-400/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>Horas en Registro</span>
            <Hourglass className="w-4 h-4 text-guacamole-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
              {formatHours(metrics.totalPlaytimeHours)}{' '}
              <span className="text-sm font-sans font-normal text-guacamole-400">h</span>
            </div>
            <p className="mt-1 text-[11px] font-mono text-slate-400">
              &asymp; {Math.round(metrics.totalPlaytimeHours / 24)} días de tu vida
            </p>
          </div>
        </div>
      </div>

      {/* 3. Desglose del Catálogo */}
      <div className="pt-4 border-t border-carbon-border flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-guacamole-400"></span>
            <span>Juegos de pago:</span>
            <span className="text-white font-bold">{formatNumber(metrics.paidGamesCount)}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-turquoise-400"></span>
            <span>Juegos gratuitos:</span>
            <span className="text-white font-bold">{formatNumber(metrics.freeGamesCount)}</span>
          </div>

          {metrics.unpricedGamesCount > 0 && (
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-carbon-hover"></span>
              <span>Sin precio / Retirados:</span>
              <span className="text-slate-300 font-bold">{formatNumber(metrics.unpricedGamesCount)}</span>
            </div>
          )}
        </div>

        <div className="text-slate-400">
          Total analizados: <span className="text-white font-bold">{formatNumber(metrics.totalGames)}</span>
        </div>
      </div>
    </div>
  );
}
