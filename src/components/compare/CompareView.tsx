'use client';

// =============================================================================
// SteamStats — Profile Comparison Component
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Interfaz interactiva para comparar dos perfiles de Steam:
 * selección de perfiles, métricas enfrentadas y desglose de juegos en común.
 * @spec REQ-09, RNF-04, RNF-05
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  GitCompare,
  Search,
  Trophy,
  Gamepad2,
  Clock,
  Sparkles,
  ExternalLink,
  Flame,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { ProfileComparisonResult, SharedGameItem } from '@/lib/steam/compare';
import { ProfileGameItem } from '@/lib/steam/api';
import { formatHours, formatNumber, formatEur } from '@/lib/formatters';

interface CompareViewProps {
  initialU1?: string;
  initialU2?: string;
}

export function CompareView({ initialU1 = '', initialU2 = '' }: CompareViewProps) {
  const [u1, setU1] = useState(initialU1);
  const [u2, setU2] = useState(initialU2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProfileComparisonResult | null>(null);
  const [activeTab, setActiveTab] = useState<'shared' | 'onlyA' | 'onlyB'>('shared');

  const executeCompare = async (user1: string, user2: string) => {
    if (!user1.trim() || !user2.trim()) {
      setError('Debes introducir dos perfiles de Steam para realizar la comparación.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/compare?u1=${encodeURIComponent(user1.trim())}&u2=${encodeURIComponent(user2.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al contrastar los perfiles.');
      }

      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Error de conexión.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialU1 && initialU2) {
      executeCompare(initialU1, initialU2);
    }
  }, [initialU1, initialU2]);

  const loadSample = () => {
    setU1('GuacamoleSteam');
    setU2('76561198337759875');
    executeCompare('GuacamoleSteam', '76561198337759875');
  };

  return (
    <div className="w-full">
      {/* Formulario de Entrada Dual */}
      <div className="p-6 sm:p-8 rounded-3xl bg-carbon-900/90 border border-carbon-800 shadow-xl backdrop-blur-sm mb-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeCompare(u1, u2);
          }}
          className="flex flex-col gap-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative">
            {/* Perfil 1 */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono font-medium text-guacamole-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-guacamole-400" />
                <span>Jugador 1 (Perfil A)</span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-carbon-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={u1}
                  onChange={(e) => setU1(e.target.value)}
                  placeholder="Vanity URL, SteamID64 o enlace..."
                  className="w-full bg-carbon-950 border border-carbon-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-carbon-500 focus:outline-none focus:border-guacamole-400 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Perfil 2 */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono font-medium text-brand-cyan flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-cyan" />
                <span>Jugador 2 (Perfil B)</span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-carbon-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={u2}
                  onChange={(e) => setU2(e.target.value)}
                  placeholder="Vanity URL, SteamID64 o enlace..."
                  className="w-full bg-carbon-950 border border-carbon-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-carbon-500 focus:outline-none focus:border-brand-cyan transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-carbon-800/80">
            <button
              type="button"
              onClick={loadSample}
              className="text-xs font-mono text-carbon-400 hover:text-guacamole-400 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-guacamole-400" />
              <span>Probar con perfil de ejemplo</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-guacamole-400 to-brand-cyan hover:opacity-95 text-carbon-950 font-bold text-sm transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 ml-auto"
            >
              <GitCompare className="w-4 h-4" />
              <span>{loading ? 'Comparando...' : 'Comparar Perfiles'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}
      </div>

      {/* Resultados de la Comparación */}
      {result && (
        <div className="flex flex-col gap-8">
          {/* Tarjeta de Enfrentamiento (Versus) */}
          <div className="rounded-3xl border border-carbon-800 bg-carbon-900/90 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Jugador A */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-carbon-950/70 border border-guacamole-500/20">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-guacamole-400 shrink-0">
                  <Image
                    src={result.profileA.avatarUrl}
                    alt={result.profileA.personaName}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-guacamole-400 font-bold tracking-wider">
                    Jugador A
                  </span>
                  <h3 className="text-lg font-bold text-white truncate">
                    {result.profileA.personaName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-guacamole-500/20 text-guacamole-400 font-mono font-bold text-xs border border-guacamole-500/30">
                      Nivel {result.profileA.steamLevel}
                    </span>
                    <span className="text-xs font-mono text-carbon-400">
                      {formatNumber(result.profileA.stats.totalGames)} juegos
                    </span>
                  </div>
                </div>
              </div>

              {/* VS Central Badge */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-carbon-800 border border-carbon-700 flex items-center justify-center shadow-lg font-mono font-extrabold text-lg text-white">
                  VS
                </div>
                <span className="text-xs font-mono text-carbon-400 mt-2 font-medium">
                  {result.metrics.sharedCount} juegos en común
                </span>
              </div>

              {/* Jugador B */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-carbon-950/70 border border-brand-cyan/20">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-cyan shrink-0">
                  <Image
                    src={result.profileB.avatarUrl}
                    alt={result.profileB.personaName}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-brand-cyan font-bold tracking-wider">
                    Jugador B
                  </span>
                  <h3 className="text-lg font-bold text-white truncate">
                    {result.profileB.personaName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-brand-cyan/20 text-brand-cyan font-mono font-bold text-xs border border-brand-cyan/30">
                      Nivel {result.profileB.steamLevel}
                    </span>
                    <span className="text-xs font-mono text-carbon-400">
                      {formatNumber(result.profileB.stats.totalGames)} juegos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Barras de Comparación Cara a Cara */}
            <div className="mt-8 pt-6 border-t border-carbon-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Horas Totales */}
              <div className="p-4 rounded-xl bg-carbon-950 border border-carbon-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-guacamole-400 font-bold">
                    {formatHours(result.profileA.stats.totalPlaytimeHours)} h
                  </span>
                  <span className="text-carbon-400 font-medium">Horas Totales</span>
                  <span className="text-brand-cyan font-bold">
                    {formatHours(result.profileB.stats.totalPlaytimeHours)} h
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-carbon-800 overflow-hidden flex">
                  <div
                    className="bg-guacamole-400 h-full"
                    style={{
                      width: `${
                        (result.profileA.stats.totalPlaytimeHours /
                          (result.profileA.stats.totalPlaytimeHours +
                            result.profileB.stats.totalPlaytimeHours || 1)) *
                        100
                      }%`,
                    }}
                  />
                  <div className="bg-brand-cyan h-full flex-1" />
                </div>
              </div>

              {/* Nivel */}
              <div className="p-4 rounded-xl bg-carbon-950 border border-carbon-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-guacamole-400 font-bold">
                    Lvl {result.profileA.steamLevel}
                  </span>
                  <span className="text-carbon-400 font-medium">Nivel de Steam</span>
                  <span className="text-brand-cyan font-bold">
                    Lvl {result.profileB.steamLevel}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-carbon-800 overflow-hidden flex">
                  <div
                    className="bg-guacamole-400 h-full"
                    style={{
                      width: `${
                        (result.profileA.steamLevel /
                          (result.profileA.steamLevel + result.profileB.steamLevel || 1)) *
                        100
                      }%`,
                    }}
                  />
                  <div className="bg-brand-cyan h-full flex-1" />
                </div>
              </div>

              {/* Valor de Biblioteca */}
              <div className="p-4 rounded-xl bg-carbon-950 border border-carbon-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-guacamole-400 font-bold">
                    {formatEur(result.profileA.accountValue.totalCurrentEur)}
                  </span>
                  <span className="text-carbon-400 font-medium">Valor Cuenta</span>
                  <span className="text-brand-cyan font-bold">
                    {formatEur(result.profileB.accountValue.totalCurrentEur)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-carbon-800 overflow-hidden flex">
                  <div
                    className="bg-guacamole-400 h-full"
                    style={{
                      width: `${
                        (result.profileA.accountValue.totalCurrentEur /
                          (result.profileA.accountValue.totalCurrentEur +
                            result.profileB.accountValue.totalCurrentEur || 1)) *
                        100
                      }%`,
                    }}
                  />
                  <div className="bg-brand-cyan h-full flex-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Selector de Pestañas */}
          <div className="flex items-center gap-2 p-1 bg-carbon-900 rounded-2xl border border-carbon-800 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('shared')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'shared'
                  ? 'bg-guacamole-500 text-carbon-950 shadow'
                  : 'text-carbon-400 hover:text-white'
              }`}
            >
              🎮 Juegos en común ({result.sharedGames.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('onlyA')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'onlyA'
                  ? 'bg-guacamole-500 text-carbon-950 shadow'
                  : 'text-carbon-400 hover:text-white'
              }`}
            >
              Solo {result.profileA.personaName} ({result.onlyAGames.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('onlyB')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'onlyB'
                  ? 'bg-guacamole-500 text-carbon-950 shadow'
                  : 'text-carbon-400 hover:text-white'
              }`}
            >
              Solo {result.profileB.personaName} ({result.onlyBGames.length})
            </button>
          </div>

          {/* Tabla de Juegos en Común */}
          {activeTab === 'shared' && (
            <div className="p-6 rounded-2xl bg-carbon-900/90 border border-carbon-800 shadow-xl overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-carbon-800 text-xs font-semibold text-carbon-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Juego</th>
                    <th className="py-3 px-3 w-36 text-right text-guacamole-400">
                      {result.profileA.personaName}
                    </th>
                    <th className="py-3 px-3 w-40 text-center">Proporción de Horas</th>
                    <th className="py-3 px-3 w-36 text-right text-brand-cyan">
                      {result.profileB.personaName}
                    </th>
                    <th className="py-3 px-3 w-28 text-right">Total Juntos</th>
                    <th className="py-3 px-3 w-14 text-center">Tienda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-carbon-800/60 text-sm">
                  {result.sharedGames.map((game) => {
                    const total = game.hoursA + game.hoursB || 1;
                    const pctA = Math.round((game.hoursA / total) * 100);

                    return (
                      <tr key={game.appId} className="hover:bg-carbon-800/40 transition-colors">
                        {/* Portada y Título */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-8 rounded overflow-hidden bg-carbon-950 shrink-0 border border-carbon-800">
                              <Image
                                src={game.headerImage}
                                alt={game.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <span className="font-semibold text-white truncate max-w-xs">
                              {game.name}
                            </span>
                          </div>
                        </td>

                        {/* Horas Jugador A */}
                        <td className="py-3.5 px-3 text-right font-mono text-xs">
                          <span className={game.leader === 'A' ? 'font-bold text-guacamole-400' : 'text-slate-300'}>
                            {formatHours(game.hoursA)} h
                          </span>
                        </td>

                        {/* Barra Proporcional */}
                        <td className="py-3.5 px-3">
                          <div className="w-full h-2 rounded-full bg-carbon-800 overflow-hidden flex">
                            <div className="bg-guacamole-400 h-full" style={{ width: `${pctA}%` }} />
                            <div className="bg-brand-cyan h-full flex-1" />
                          </div>
                        </td>

                        {/* Horas Jugador B */}
                        <td className="py-3.5 px-3 text-right font-mono text-xs">
                          <span className={game.leader === 'B' ? 'font-bold text-brand-cyan' : 'text-slate-300'}>
                            {formatHours(game.hoursB)} h
                          </span>
                        </td>

                        {/* Total Horas */}
                        <td className="py-3.5 px-3 text-right font-mono text-xs font-bold text-white">
                          {formatHours(game.totalCombinedHours)} h
                        </td>

                        {/* Enlace Tienda */}
                        <td className="py-3.5 px-3 text-center">
                          <a
                            href={`https://store.steampowered.com/app/${game.appId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md hover:bg-carbon-800 text-carbon-400 hover:text-white inline-flex items-center justify-center transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabla de Exclusivos de A */}
          {activeTab === 'onlyA' && (
            <ExclusiveGamesTable
              games={result.onlyAGames}
              playerName={result.profileA.personaName}
              accentColor="guacamole"
            />
          )}

          {/* Tabla de Exclusivos de B */}
          {activeTab === 'onlyB' && (
            <ExclusiveGamesTable
              games={result.onlyBGames}
              playerName={result.profileB.personaName}
              accentColor="cyan"
            />
          )}
        </div>
      )}
    </div>
  );
}

function ExclusiveGamesTable({
  games,
  playerName,
  accentColor,
}: {
  games: ProfileGameItem[];
  playerName: string;
  accentColor: 'guacamole' | 'cyan';
}) {
  if (games.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-carbon-900 border border-carbon-800 text-center">
        <p className="text-carbon-400 text-xs">
          No hay juegos exclusivos en la biblioteca de {playerName}.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-carbon-900/90 border border-carbon-800 shadow-xl overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-carbon-800 text-xs font-semibold text-carbon-400 uppercase tracking-wider">
            <th className="py-3 px-3">Juego</th>
            <th className="py-3 px-3 w-36 text-right">Tiempo Registrado</th>
            <th className="py-3 px-3 w-16 text-center">Tienda</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-carbon-800/60 text-sm">
          {games.map((game) => (
            <tr key={game.appId} className="hover:bg-carbon-800/40 transition-colors">
              <td className="py-3.5 px-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-8 rounded overflow-hidden bg-carbon-950 shrink-0 border border-carbon-800">
                    <Image
                      src={game.headerImage}
                      alt={game.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <span className="font-semibold text-white truncate max-w-sm">{game.name}</span>
                </div>
              </td>
              <td className="py-3.5 px-3 text-right font-mono text-xs font-bold text-white">
                {formatHours(game.playtimeForeverHours)} h
              </td>
              <td className="py-3.5 px-3 text-center">
                <a
                  href={`https://store.steampowered.com/app/${game.appId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-carbon-800 text-carbon-400 hover:text-white inline-flex items-center justify-center transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
