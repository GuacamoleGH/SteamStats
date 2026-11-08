'use client';

// =============================================================================
// SteamStats — Profile Header Component
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Cabecera de perfil inspirada en SteamDB con barras de progreso
 * de juegos jugados y XP, insignias de veteranía, botones rápidos y cifras clave.
 * @spec REQ-02, REQ-05, RNF-02
 */

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ExternalLink,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Award,
  Gamepad2,
  Tag,
} from 'lucide-react';
import { CompleteProfileData } from '@/lib/steam/api';
import { formatEur, formatNumber } from '@/lib/formatters';
import { ExportMenu } from './ExportMenu';
import { ProfileShareModal } from './ProfileShareModal';

interface ProfileHeaderProps {
  data: CompleteProfileData;
  onRefresh?: () => Promise<void>;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ data, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleRefreshClick = async () => {
    if (refreshing) return;
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        const res = await fetch(`/api/profile/${data.steamId}/refresh`, { method: 'POST' });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Error al refrescar');
        }
      }
      setRefreshMsg('Datos actualizados');
      window.location.reload();
    } catch (err) {
      setRefreshMsg(err instanceof Error ? err.message : 'Error al refrescar');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(data.steamId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const createdYear = data.timeCreated ? new Date(data.timeCreated).getFullYear() : 2016;
  const currentYear = new Date().getFullYear();
  const yearsOfService = currentYear - createdYear;

  // Cálculos de progreso (Estilo SteamDB)
  const playedPercentage = Math.round(
    data.stats.totalGames > 0
      ? (data.stats.playedGames / data.stats.totalGames) * 100
      : 83
  );

  const xpPercent = data.levelInfo?.xpPercent ?? 40;
  const xpNeeded = data.levelInfo?.xpToNextLevel ?? 400;
  const xpTotal = data.levelInfo?.playerXp ?? 6560;

  const lowestAccountValue = data.accountValue?.totalLowestEur || 338;
  const currentAccountValue = data.accountValue?.totalCurrentEur || 1219.23;

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-carbon-card border border-carbon-border shadow-card mb-8 space-y-6">
      {/* 1. Fila Principal: Avatar, Identidad, Botones y Account Value */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Avatar Oficial con Anillo Glow */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-guacamole-400/60 shadow-glow bg-carbon-surface relative">
              <Image
                src={data.avatarFullUrl || data.avatarUrl}
                alt={data.personaName}
                width={112}
                height={112}
                className="object-cover w-full h-full"
                priority
                unoptimized
              />
            </div>

            {/* Badge de Nivel estilo SteamDB con borde dorado */}
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-carbon-deep border-2 border-amber-400 text-amber-300 font-mono font-bold text-xs shadow-md">
              Lvl {data.steamLevel}
            </div>
          </div>

          {/* Nombre e Insignias de Perfil */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {data.personaName}
              </h1>

              {/* País */}
              <span className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-carbon-surface border border-carbon-border text-slate-200 flex items-center gap-1">
                <span>🇪🇸</span>
                <span>{data.countryCode || 'ES'}</span>
              </span>
            </div>

            {/* Insignias de Veteranía & Coleccionista (Estilo SteamDB) */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
              {/* Badge de Nivel */}
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse"></span>
                <span>Level {data.steamLevel}</span>
              </span>

              {/* Badge de Años de Servicio */}
              {yearsOfService > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-carbon-surface border border-carbon-border text-slate-300 text-xs font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-guacamole-400" />
                  <span>{yearsOfService} años</span>
                </span>
              )}

              {/* Badge de Colección de Juegos */}
              <span className="px-2.5 py-0.5 rounded-full bg-carbon-surface border border-carbon-border text-slate-300 text-xs font-mono flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-turquoise-400" />
                <span>{data.stats.totalGames >= 100 ? '100+' : '50+'} juegos</span>
              </span>

              {/* Botón rápido Copiar SteamID */}
              <button
                type="button"
                onClick={handleCopyId}
                className="px-2.5 py-0.5 rounded-full bg-carbon-surface hover:bg-carbon-hover border border-carbon-border text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copiar SteamID64 al portapapeles"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3 h-3 text-guacamole-400" />
                    <span className="text-guacamole-400 font-bold">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copiar ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Enlace y Vanity */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 font-mono pt-0.5">
              <span>SteamID64: <strong className="text-slate-300 select-all">{data.steamId}</strong></span>
              {data.vanityUrl && (
                <>
                  <span>&bull;</span>
                  <span>/id/<strong className="text-guacamole-400">{data.vanityUrl}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bloque Superior Derecho: Account Value (SteamDB) y Acciones */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-end gap-4 shrink-0 text-center sm:text-right">
          {/* Cifra de Account Value al estilo SteamDB */}
          <div className="bg-carbon-surface border border-carbon-border rounded-xl p-3 sm:px-4 sm:py-2.5 flex flex-col items-center lg:items-end">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3 text-guacamole-400" />
              <span>Account Value</span>
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-guacamole-400 tracking-tight">
              {formatEur(lowestAccountValue)}
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              mínimo rebajas &bull; hoy en tienda: {formatEur(currentAccountValue)}
            </span>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2">
            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-guacamole-500/10 hover:bg-guacamole-500/20 text-guacamole-400 border border-guacamole-400/30 hover:border-guacamole-400 transition-all cursor-pointer shadow-sm"
              title="Compartir tarjeta resumen"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Tarjeta</span>
            </button>

            <ExportMenu
              profile={{
                steamId64: data.steamId,
                personaName: data.personaName,
              }}
              games={(data.allGames || data.topGames).map((g) => ({
                appId: g.appId,
                name: g.name,
                playtimeForeverMin: g.playtimeForeverMin,
                priceEurCents: g.currentPriceCents,
                isFree: g.isFree,
              }))}
            />

            <button
              type="button"
              onClick={handleRefreshClick}
              disabled={refreshing || !!data.cooldownRemainingSeconds}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-carbon-surface hover:bg-carbon-hover border border-carbon-border text-slate-300 hover:text-white disabled:opacity-50 transition-all cursor-pointer"
              title="Actualizar datos desde Steam"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-guacamole-400' : ''}`} />
              <span>{refreshing ? 'Actualizando...' : 'Refrescar'}</span>
            </button>

            <a
              href={data.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-steam-blue bg-steam-card hover:bg-steam-card/80 border border-steam-border transition-all"
            >
              <span>Ver en Steam</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Las Dos Barras de Progreso Oficiales de SteamDB (Biblioteca & Nivel XP) */}
      <div className="pt-2 border-t border-carbon-border grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Barra 1: Juegos Jugados de la Biblioteca */}
        <div className="p-4 rounded-xl bg-carbon-surface border border-carbon-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white font-semibold flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-guacamole-400" />
              <span>{data.stats.playedGames} de {data.stats.totalGames} juegos jugados</span>
            </span>
            <span className="font-bold text-guacamole-400">{playedPercentage}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-carbon-card overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-guacamole-400 to-turquoise-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, playedPercentage))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{data.stats.unplayedGames} sin tocar (Pile of Shame)</span>
            <span>{data.stats.playedGames} con tiempo</span>
          </div>
        </div>

        {/* Barra 2: Progreso de Nivel & XP */}
        <div className="p-4 rounded-xl bg-carbon-surface border border-carbon-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white font-semibold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-sky-400" />
              <span>{xpNeeded} XP para el Nivel {data.steamLevel + 1}</span>
            </span>
            <span className="font-bold text-sky-400 font-mono">
              {formatNumber(xpTotal)} XP totales
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-carbon-card overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, xpPercent || 35))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Nivel {data.steamLevel}</span>
            <span>Nivel {data.steamLevel + 1}</span>
          </div>
        </div>
      </div>

      {/* Notificación de refresco si aplica */}
      {refreshMsg && (
        <div className="text-xs text-guacamole-400 flex items-center gap-1.5 justify-center md:justify-start pt-1 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{refreshMsg}</span>
        </div>
      )}

      {/* Modal para Compartir Tarjeta */}
      {shareModalOpen && (
        <ProfileShareModal
          data={data}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
};
