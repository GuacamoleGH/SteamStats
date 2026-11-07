// =============================================================================
// SteamStats — SteamID Converter Page
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Vista /tools/converter con conversor universal de formatos SteamID.
 * @spec REQ-12, RNF-04, RNF-05
 */

import { Binary } from 'lucide-react';
import { SteamIdConverter } from '@/components/tools/SteamIdConverter';

export const metadata = {
  title: 'Conversor de SteamID — SteamStats | GuacamoleGH',
  description:
    'Convierte al instante cualquier identificador de Steam entre SteamID64, SteamID2, SteamID3 y AccountID.',
};

export default function ConverterPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      {/* Cabecera */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-guacamole-400/10 border border-guacamole-400/25 text-guacamole-400 mb-4">
          <Binary className="w-3.5 h-3.5" />
          <span>Herramienta de Conversión</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          Conversor de SteamID
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Traduce cualquier identificador entre SteamID64 (Comunidad), SteamID2 (Source/CS),
          SteamID3 y AccountID de 32 bits de forma instantánea.
        </p>
      </div>

      <SteamIdConverter />
    </div>
  );
}
