// =============================================================================
// SteamStats — Releases Page (Phase 1 Baseline)
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import { Calendar, Sparkles } from 'lucide-react';

export default function ReleasesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-turquoise-400/10 border border-turquoise-400/25 text-turquoise-400 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>Próximos Estrenos</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Calendario de Lanzamientos
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Explora los próximos videojuegos programados con filtros por mes y género impulsado por IGDB.
        </p>
      </div>

      <div className="max-w-xl mx-auto p-8 rounded-2xl bg-carbon-card border border-carbon-border text-center shadow-card">
        <div className="w-12 h-12 rounded-xl bg-turquoise-400/10 border border-turquoise-400/20 text-turquoise-400 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Preparado para Fase 5</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          En la Fase 5 se integrará la conexión con la API de IGDB y la lista de títulos deseados persistidos en navegador.
        </p>
      </div>
    </div>
  );
}
