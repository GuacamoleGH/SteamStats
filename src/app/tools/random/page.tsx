// =============================================================================
// SteamStats — Random Game Picker Page
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Vista /tools/random con ruleta interactiva para elegir un juego
 * al azar de la biblioteca ("¿A qué juego hoy?").
 * @spec REQ-12, RNF-04, RNF-05
 */

import { Dice5 } from 'lucide-react';
import { RandomGamePicker } from '@/components/tools/RandomGamePicker';

export const metadata = {
  title: '¿A qué juego hoy? Ruleta Aleatoria — SteamStats | GuacamoleGH',
  description:
    'Elige un juego al azar de tu biblioteca de Steam con ruleta animada, filtros para el pile of shame y enlace directo para lanzarlo.',
};

export default function RandomPickerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      {/* Cabecera */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-turquoise-400/10 border border-turquoise-400/25 text-turquoise-400 mb-4">
          <Dice5 className="w-3.5 h-3.5" />
          <span>Selector Aleatorio de Biblioteca</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          ¿A qué juego hoy?
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          ¿Indeciso ante cientos de títulos? Haz girar la ruleta para elegir un juego al azar de tu
          cuenta, filtra por títulos sin jugar o rescata una joya olvidada.
        </p>
      </div>

      <RandomGamePicker />
    </div>
  );
}
