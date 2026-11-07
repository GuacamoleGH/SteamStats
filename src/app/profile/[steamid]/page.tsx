// =============================================================================
// SteamStats — Full Profile View Page
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import { getCompleteProfile } from '@/lib/steam/api';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { SummaryCards } from '@/components/profile/SummaryCards';
import { TopGamesTable } from '@/components/profile/TopGamesTable';
import { BadgesSection } from '@/components/profile/BadgesSection';
import { PrivateProfileAlert } from '@/components/profile/PrivateProfileAlert';
import { AccountValueCard } from '@/components/stats/AccountValueCard';
import { PlaytimeDistributionChart } from '@/components/charts/PlaytimeDistributionChart';
import { PriceDistributionChart } from '@/components/charts/PriceDistributionChart';
import { ActivityHeatmap } from '@/components/profile/ActivityHeatmap';

interface ProfilePageProps {
  params: Promise<{
    steamid: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { steamid } = await params;

  let profileData;
  try {
    profileData = await getCompleteProfile(steamid);
  } catch (err) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Botón Volver & Badge de Caché */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-guacamole-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al buscador</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-carbon-card px-3 py-1.5 rounded-lg border border-carbon-border">
          <Clock className="w-3.5 h-3.5 text-guacamole-400" />
          <span>
            {profileData.isCached ? 'Datos en caché' : 'Actualizado en vivo'}:{' '}
            {new Date(profileData.lastUpdated).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Header del Perfil */}
      <ProfileHeader data={profileData} />

      {/* Alerta de Perfil Privado si aplica */}
      {profileData.isPrivate && <PrivateProfileAlert />}

      {/* Tarjetas de Resumen (Horas, 2 Semanas, Pile of Shame, Nivel/XP) */}
      <SummaryCards data={profileData} />

      {/* Valor de la Cuenta & Coste por Hora */}
      <div className="mb-8">
        <AccountValueCard metrics={profileData.accountValue} />
      </div>

      {/* Gráficas de Distribución de Horas y Precio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PlaytimeDistributionChart data={profileData.distributions.playtimeBuckets} />
        <PriceDistributionChart data={profileData.distributions.priceBuckets} />
      </div>

      {/* Heatmap de Actividad Anual (Estilo GitHub) */}
      <ActivityHeatmap steamId={profileData.steamId} />

      {/* Top 10 Juegos Más Jugados con Coste/Hora */}
      <TopGamesTable games={profileData.topGames} />

      {/* Insignias Coleccionadas */}
      <BadgesSection badges={profileData.badges} />
    </div>
  );
}
