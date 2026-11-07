// =============================================================================
// SteamStats — Profile View Page (Skeleton & Resolver Integration)
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import Link from 'next/link';
import { ArrowLeft, User, ShieldCheck, Clock, ExternalLink } from 'lucide-react';

interface ProfilePageProps {
  params: Promise<{
    steamid: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { steamid } = await params;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Botón Volver */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-guacamole-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al buscador</span>
        </Link>
      </div>

      {/* Header del Perfil (Esqueleto inicial de Fase 1) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-carbon-card border border-carbon-border shadow-card mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Placeholder */}
          <div className="w-24 h-24 rounded-full bg-carbon-surface border-2 border-guacamole-400/40 flex items-center justify-center text-guacamole-400 shadow-glow shrink-0">
            <User className="w-12 h-12" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Perfil de Steam
                </h1>
                <p className="text-sm font-mono text-slate-400 mt-1 flex items-center gap-2 justify-center sm:justify-start">
                  <span>SteamID64:</span>
                  <span className="text-guacamole-400 font-semibold">{steamid}</span>
                </p>
              </div>

              {/* Botón Ver en Steam */}
              <a
                href={`https://steamcommunity.com/profiles/${steamid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-steam-blue bg-steam-card hover:bg-steam-card/80 border border-steam-border transition-colors self-center sm:self-auto"
              >
                <span>Ver en Steam</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Aviso informativo de Fase 1 */}
            <div className="mt-6 p-4 rounded-xl bg-carbon-surface border border-carbon-border flex items-center gap-3 text-sm text-slate-300">
              <ShieldCheck className="w-5 h-5 text-guacamole-400 shrink-0" />
              <span>
                Resolución de identificador completada con éxito. En la <strong>Fase 2</strong> se
                integrará la llamada a la Steam Web API para mostrar horas, insignias, nivel y
                catálogo de juegos.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
