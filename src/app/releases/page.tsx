// =============================================================================
// SteamStats — Releases Calendar Page
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Vista /releases con el calendario de próximos lanzamientos
 * de videojuegos (IGDB), filtros por mes y género, y gestión de deseados.
 * @spec REQ-10, RNF-04, RNF-05
 */

import { Calendar, Sparkles } from 'lucide-react';
import { getUpcomingReleases } from '@/lib/igdb/api';
import { ReleasesCalendar } from '@/components/releases/ReleasesCalendar';

export const revalidate = 43200; // 12 horas

export const metadata = {
  title: 'Calendario de Lanzamientos — SteamStats | GuacamoleGH',
  description:
    'Explora los próximos lanzamientos de videojuegos en Steam, PlayStation, Xbox y Nintendo Switch con portadas, fechas y filtros por mes y género.',
};

export default async function ReleasesPage() {
  const { releases, source } = await getUpcomingReleases();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      {/* Cabecera de Página */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-turquoise-400/10 border border-turquoise-400/25 text-turquoise-400 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>Próximos Estrenos · IGDB</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          Calendario de Lanzamientos
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Explora los videojuegos más esperados, marca tus favoritos con &quot;Me interesa&quot;
          y filtra por mes y género.
        </p>
      </div>

      {/* Componente Interactivo de Lanzamientos */}
      <ReleasesCalendar initialReleases={releases} />
    </div>
  );
}
