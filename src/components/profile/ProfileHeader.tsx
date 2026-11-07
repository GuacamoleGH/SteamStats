// =============================================================================
// SteamStats — Profile Header Component
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, RefreshCw, Calendar, MapPin, Award, CheckCircle2 } from 'lucide-react';
import { CompleteProfileData } from '@/lib/steam/api';

interface ProfileHeaderProps {
  data: CompleteProfileData;
  onRefresh?: () => Promise<void>;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ data, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  const handleRefreshClick = async () => {
    if (refreshing || !onRefresh) return;
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      await onRefresh();
      setRefreshMsg('Datos actualizados');
      setTimeout(() => setRefreshMsg(null), 3000);
    } catch (err) {
      setRefreshMsg(err instanceof Error ? err.message : 'Error al refrescar');
    } finally {
      setRefreshing(false);
    }
  };

  const createdYear = data.timeCreated ? new Date(data.timeCreated).getFullYear() : null;

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-carbon-card border border-carbon-border shadow-card mb-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar Oficial con Borde de Nivel */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-guacamole-400/50 shadow-glow bg-carbon-surface relative">
            <Image
              src={data.avatarFullUrl || data.avatarUrl}
              alt={data.personaName}
              width={112}
              height={112}
              className="object-cover w-full h-full"
              priority
            />
          </div>

          {/* Badge de Nivel flotante */}
          <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-carbon-deep border border-guacamole-400 text-guacamole-400 font-mono font-bold text-xs shadow-md">
            Lvl {data.steamLevel}
          </div>
        </div>

        {/* Datos del Jugador */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {data.personaName}
                </h1>

                {data.countryCode && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-carbon-surface border border-carbon-border text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-guacamole-400" />
                    <span>{data.countryCode}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1.5 text-xs text-slate-400 font-mono">
                <span>SteamID64: <strong className="text-slate-200">{data.steamId}</strong></span>
                {data.vanityUrl && (
                  <>
                    <span>&bull;</span>
                    <span>/id/<strong className="text-guacamole-400">{data.vanityUrl}</strong></span>
                  </>
                )}
                {createdYear && (
                  <>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>Miembro desde {createdYear}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-center md:justify-end gap-2.5 shrink-0">
              {/* Botón Refrescar */}
              <button
                type="button"
                onClick={handleRefreshClick}
                disabled={refreshing || !!data.cooldownRemainingSeconds}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-carbon-surface hover:bg-carbon-hover border border-carbon-border text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                title={
                  data.cooldownRemainingSeconds
                    ? `Espera ${data.cooldownRemainingSeconds}s para volver a refrescar`
                    : 'Actualizar estadísticas desde Steam'
                }
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-guacamole-400' : ''}`} />
                <span>
                  {refreshing
                    ? 'Actualizando...'
                    : data.cooldownRemainingSeconds
                    ? `Enfriamiento (${data.cooldownRemainingSeconds}s)`
                    : 'Refrescar'}
                </span>
              </button>

              {/* Botón Ver en Steam */}
              <a
                href={data.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-steam-blue bg-steam-card hover:bg-steam-card/80 border border-steam-border transition-all"
              >
                <span>Ver en Steam</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Notificación de refresco */}
          {refreshMsg && (
            <div className="mt-3 text-xs text-guacamole-400 flex items-center gap-1.5 justify-center md:justify-start">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{refreshMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
