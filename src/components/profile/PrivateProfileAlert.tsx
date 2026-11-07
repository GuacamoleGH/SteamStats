// =============================================================================
// SteamStats — Private Profile Alert Component
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

'use client';

import React, { useState } from 'react';
import { Lock, ChevronDown, ChevronUp, CheckCircle, ExternalLink } from 'lucide-react';

export const PrivateProfileAlert: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 shadow-card mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Los detalles de juego de este perfil están ocultos o privados
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Steam no permite acceder a la lista de juegos ni a las horas jugadas si la opción
              &quot;Detalles de los juegos&quot; está en Privado o Solo Amigos.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-carbon-card hover:bg-carbon-hover border border-carbon-border text-amber-300 transition-all shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <span>{isOpen ? 'Ocultar guía' : 'Cómo hacerlo público'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-6 pt-5 border-t border-amber-500/20 text-xs sm:text-sm text-slate-300 space-y-3">
          <p className="font-semibold text-white">
            Pasos para hacer visible tu biblioteca en Steam:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>
              Abre Steam, pasa el ratón por tu nombre de perfil y selecciona{' '}
              <strong className="text-white">Perfil</strong>.
            </li>
            <li>
              Haz clic en el botón <strong className="text-white">&quot;Modificar perfil&quot;</strong>.
            </li>
            <li>
              En el menú lateral izquierdo, ve a{' '}
              <strong className="text-white">Configuración de privacidad</strong>.
            </li>
            <li>
              Cambia <strong className="text-guacamole-400">&quot;Detalles de los juegos&quot;</strong> a{' '}
              <strong className="text-guacamole-400">&quot;Público&quot;</strong> y asegúrate de{' '}
              <span className="text-amber-300 font-semibold">desmarcar</span> la casilla{' '}
              <em>&quot;Mantener siempre en privado mi tiempo total de juego&quot;</em>.
            </li>
            <li>
              Regresa a esta página y pulsa el botón <strong className="text-white">&quot;Refrescar&quot;</strong>{' '}
              para volver a consultar tus estadísticas.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
