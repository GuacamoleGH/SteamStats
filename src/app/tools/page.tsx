// =============================================================================
// SteamStats — Tools Hub Page
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Vista /tools con el catálogo de utilidades auxiliares para Steam.
 * @spec REQ-12
 */

import Link from 'next/link';
import { Wrench, Binary, Dice5, ArrowRight, GitCompare } from 'lucide-react';

export const metadata = {
  title: 'Herramientas y Utilidades de Steam — SteamStats | GuacamoleGH',
  description:
    'Colección de herramientas para Steam: conversor universal de SteamID, selector aleatorio de juegos de biblioteca y comparador.',
};

export default function ToolsHubPage() {
  const tools = [
    {
      title: 'Conversor de SteamID',
      description:
        'Traduce cualquier identificador entre SteamID64, SteamID2, SteamID3 y AccountID de 32 bits.',
      href: '/tools/converter',
      icon: Binary,
      color: 'guacamole',
    },
    {
      title: '¿A qué juego hoy? (Ruleta)',
      description:
        'Selector aleatorio de títulos de tu biblioteca con ruleta animada y filtro de títulos sin jugar.',
      href: '/tools/random',
      icon: Dice5,
      color: 'cyan',
    },
    {
      title: 'Comparador de Perfiles',
      description:
        'Contrasta dos bibliotecas de juegos lado a lado: juegos compartidos, horas y exclusivos.',
      href: '/compare',
      icon: GitCompare,
      color: 'amber',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-guacamole-400/10 border border-guacamole-400/25 text-guacamole-400 mb-4">
          <Wrench className="w-3.5 h-3.5" />
          <span>Utilidades del Ecosistema</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          Herramientas de Steam
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Herramientas prácticas para exprimir al máximo tu cuenta de Steam, resolver dudas de
          partidas y convertir identificadores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="p-6 sm:p-8 rounded-2xl bg-carbon-card border border-carbon-border hover:border-guacamole-400/40 transition-all shadow-card flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-carbon-surface border border-carbon-border flex items-center justify-center text-guacamole-400 group-hover:scale-110 transition-transform mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-guacamole-400 transition-colors mb-2">
                  {t.title}
                </h3>
                <p className="text-xs text-carbon-400 leading-relaxed mb-6">{t.description}</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono font-bold text-guacamole-400 pt-4 border-t border-carbon-border/50">
                <span>Abrir herramienta</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
