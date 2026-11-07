'use client';

// =============================================================================
// SteamStats — Account Value & Cost per Hour Card
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Tarjeta de métricas financieras de la cuenta de Steam:
 * valor actual, valor mínimo histórico, coste por hora interactivo y desglose de juegos.
 * @spec REQ-05, RNF-05
 */

import { useState } from 'react';
import { AccountValueMetrics } from '@/lib/steam/pricing';
import { formatEur, formatNumber } from '@/lib/formatters';

interface AccountValueCardProps {
  metrics: AccountValueMetrics;
}

type CostMode = 'all' | 'paid' | 'played';

export function AccountValueCard({ metrics }: AccountValueCardProps) {
  const [costMode, setCostMode] = useState<CostMode>('all');

  const activeCostPerHour =
    costMode === 'all'
      ? metrics.costPerHourAll
      : costMode === 'paid'
      ? metrics.costPerHourPaid
      : metrics.costPerHourPlayed;

  const costModeDescriptions: Record<CostMode, string> = {
    all: 'Calculado sobre el total de horas acumuladas de todos los juegos.',
    paid: 'Calculado únicamente sobre las horas dedicadas a juegos de pago.',
    played: 'Calculado dividiendo el valor de los juegos con tiempo registrado entre el total de horas.',
  };

  return (
    <div className="rounded-2xl border border-carbon-800 bg-carbon-900/90 p-6 backdrop-blur-sm shadow-xl">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-carbon-800/80 pb-5">
        <div>
          <span className="text-xs font-mono font-medium tracking-wider text-guacamole-400 uppercase">
            Economía de la Biblioteca
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">Valor de la Cuenta</h2>
        </div>

        {metrics.savingsPercent > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-guacamole-500/10 border border-guacamole-500/30 text-guacamole-400 text-xs font-mono">
            <span>Ahorro vs Mínimo:</span>
            <span className="font-bold text-white">-{metrics.savingsPercent}%</span>
            <span className="text-carbon-400">({formatEur(metrics.totalSavingsEur)})</span>
          </div>
        )}
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-carbon-800/80">
        {/* 1. Valor Actual */}
        <div className="flex flex-col">
          <span className="text-xs text-carbon-400 font-medium">Valor actual en tienda (ES)</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
              {formatEur(metrics.totalCurrentEur)}
            </span>
          </div>
          <p className="mt-2 text-xs text-carbon-400">
            Suma de precios actuales recomendados de Steam en euros.
          </p>
        </div>

        {/* 2. Mínimo Histórico */}
        <div className="flex flex-col">
          <span className="text-xs text-carbon-400 font-medium">Mínimo histórico acumulado</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-brand-cyan tracking-tight">
              {formatEur(metrics.totalLowestEur)}
            </span>
          </div>
          <p className="mt-2 text-xs text-carbon-400">
            Precios más bajos registrados históricamente en rebajas.
          </p>
        </div>

        {/* 3. Coste por hora interactivo */}
        <div className="flex flex-col bg-carbon-800/40 rounded-xl p-4 border border-carbon-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-carbon-300 font-medium">Coste por hora amortizado</span>
            <span className="text-xs font-mono font-bold text-guacamole-400">
              {activeCostPerHour.toFixed(2).replace('.', ',')} € / hora
            </span>
          </div>

          <div className="mt-3 flex gap-1 p-0.5 bg-carbon-900 rounded-lg border border-carbon-700">
            <button
              type="button"
              onClick={() => setCostMode('all')}
              className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-colors ${
                costMode === 'all'
                  ? 'bg-guacamole-500 text-carbon-950 font-semibold shadow'
                  : 'text-carbon-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setCostMode('paid')}
              className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-colors ${
                costMode === 'paid'
                  ? 'bg-guacamole-500 text-carbon-950 font-semibold shadow'
                  : 'text-carbon-400 hover:text-white'
              }`}
            >
              De pago
            </button>
            <button
              type="button"
              onClick={() => setCostMode('played')}
              className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-colors ${
                costMode === 'played'
                  ? 'bg-guacamole-500 text-carbon-950 font-semibold shadow'
                  : 'text-carbon-400 hover:text-white'
              }`}
            >
              Jugados
            </button>
          </div>

          <p className="mt-2 text-[11px] text-carbon-400 leading-tight">
            {costModeDescriptions[costMode]}
          </p>
        </div>
      </div>

      {/* Desglose de catálogo */}
      <div className="pt-5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-carbon-300">
            <span className="w-2.5 h-2.5 rounded-full bg-guacamole-400"></span>
            <span>Juegos de pago:</span>
            <span className="text-white font-bold">{formatNumber(metrics.paidGamesCount)}</span>
          </div>

          <div className="flex items-center gap-2 text-carbon-300">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan"></span>
            <span>Juegos gratuitos:</span>
            <span className="text-white font-bold">{formatNumber(metrics.freeGamesCount)}</span>
          </div>

          {metrics.unpricedGamesCount > 0 && (
            <div className="flex items-center gap-2 text-carbon-400">
              <span className="w-2.5 h-2.5 rounded-full bg-carbon-600"></span>
              <span>Sin precio / Retirados:</span>
              <span className="text-carbon-300 font-bold">{formatNumber(metrics.unpricedGamesCount)}</span>
            </div>
          )}
        </div>

        <div className="text-carbon-400">
          Total analizados: <span className="text-white font-bold">{formatNumber(metrics.totalGames)}</span>
        </div>
      </div>
    </div>
  );
}
