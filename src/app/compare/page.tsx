// =============================================================================
// SteamStats — Profile Comparison Page
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Vista /compare para contrastar dos bibliotecas de Steam lado a lado.
 * @spec REQ-09, RNF-04, RNF-05
 */

import { GitCompare } from 'lucide-react';
import { CompareView } from '@/components/compare/CompareView';

interface ComparePageProps {
  searchParams: Promise<{
    u1?: string;
    u2?: string;
  }>;
}

export const metadata = {
  title: 'Comparador de Perfiles — SteamStats | GuacamoleGH',
  description:
    'Compara dos cuentas de Steam frente a frente: descubre juegos compartidos, quién ha jugado más horas y títulos exclusivos de cada biblioteca.',
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { u1, u2 } = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      {/* Cabecera */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-guacamole-400/10 border border-guacamole-400/25 text-guacamole-400 mb-4">
          <GitCompare className="w-3.5 h-3.5" />
          <span>Comparativa Cara a Cara</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          Comparar Perfiles
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Contrasta dos bibliotecas de juegos para descubrir títulos en común, horas de cada jugador
          y qué títulos tiene uno que le faltan al otro.
        </p>
      </div>

      {/* Vista Reactiva de Comparación */}
      <CompareView initialU1={u1} initialU2={u2} />
    </div>
  );
}
