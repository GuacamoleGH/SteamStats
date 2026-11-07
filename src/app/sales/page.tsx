// =============================================================================
// SteamStats — Sales Countdown Page (Phase 1 Baseline)
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import { Flame, Clock, Calendar } from 'lucide-react';
import salesData from '@/../data/sales.json';

export default function SalesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 border border-amber-500/25 text-amber-400 mb-4">
          <Flame className="w-3.5 h-3.5" />
          <span>Calendario Oficial de Rebajas de Steam</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Próximas Grandes Rebajas
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Fechas oficiales y estimadas de los periodos de descuento de Valve, con inicio a las
          10:00 AM hora del Pacífico (19:00 España peninsular).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {salesData.map((sale) => (
          <div
            key={sale.id}
            className="p-6 rounded-2xl bg-carbon-card border border-carbon-border hover:border-amber-500/40 transition-all shadow-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                  {sale.type}
                </span>
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">{sale.name}</h2>
              <p className="text-xs text-slate-400 mb-4">{sale.description}</p>
            </div>

            <div className="pt-4 border-t border-carbon-border">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-guacamole-400" />
                <span>
                  {new Date(sale.startDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  &mdash;{' '}
                  {new Date(sale.endDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
