// =============================================================================
// SteamStats — Sales Countdown & Schedule Page
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Vista /sales con cuenta atrás dinámica a la próxima gran rebaja
 * de Steam y calendario editable desde data/sales.json.
 * @spec REQ-11, RNF-04, RNF-05
 */

import { Flame } from 'lucide-react';
import salesData from '@/../data/sales.json';
import { SalesCountdown } from '@/components/sales/SalesCountdown';

export const metadata = {
  title: 'Cuenta Atrás a las Rebajas de Steam — SteamStats | GuacamoleGH',
  description:
    'Temporizador en vivo con días, horas, minutos y segundos para las grandes rebajas de Steam (invierno, verano, otoño, primavera).',
};

export default function SalesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      {/* Cabecera de Página */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 border border-amber-500/25 text-amber-400 mb-4">
          <Flame className="w-3.5 h-3.5" />
          <span>Calendario Oficial de Descuentos</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          Rebajas de Steam
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Fechas oficiales de los periodos de descuento de Valve, con inicio a las
          10:00 AM hora del Pacífico (19:00 España peninsular).
        </p>
      </div>

      {/* Componente Interactivo de Cuenta Atrás */}
      <SalesCountdown sales={salesData} />
    </div>
  );
}
