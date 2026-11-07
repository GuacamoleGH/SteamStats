'use client';

// =============================================================================
// SteamStats — Price Distribution Chart (Recharts)
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Gráfica de distribución de biblioteca por tramos de precio:
 * Gratis, <5€, 5-10€, 10-20€, 20-40€, 40-60€, 60€+.
 * @spec REQ-06, RNF-04, RNF-05
 */

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { DistributionBucket } from '@/lib/steam/pricing';

interface PriceDistributionChartProps {
  data: DistributionBucket[];
}

export function PriceDistributionChart({ data }: PriceDistributionChartProps) {
  return (
    <div className="rounded-2xl border border-carbon-800 bg-carbon-900/90 p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between">
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-carbon-800/80 pb-4 mb-4">
        <div>
          <span className="text-xs font-mono font-medium tracking-wider text-brand-cyan uppercase">
            Coste de Adquisición
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">Distribución por Precio</h3>
        </div>
        <span className="text-xs font-mono text-carbon-400">Juegos por rango de €</span>
      </div>

      {/* Gráfica */}
      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222a38" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              axisLine={{ stroke: '#222a38' }}
              angle={-25}
              textAnchor="end"
              height={45}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as DistributionBucket;
                  return (
                    <div className="rounded-lg border border-carbon-700 bg-carbon-950/95 px-3 py-2 shadow-xl backdrop-blur-md">
                      <p className="text-xs font-mono text-carbon-400">{item.name}</p>
                      <p className="text-sm font-mono font-bold text-brand-cyan mt-0.5">
                        {item.count} {item.count === 1 ? 'juego' : 'juegos'}
                        <span className="text-xs text-carbon-400 font-normal ml-1.5">
                          ({item.percentage}%)
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-price-${index}`}
                  fill={entry.name === 'Gratis' ? '#10b981' : '#00d9c4'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda */}
      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-carbon-400 border-t border-carbon-800/60 pt-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block"></span>
          Free-to-Play
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-brand-cyan inline-block"></span>
          De pago comercial
        </span>
      </div>
    </div>
  );
}
