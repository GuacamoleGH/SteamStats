'use client';

// =============================================================================
// SteamStats — Random Game Picker ("¿A qué juego hoy?")
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Selector aleatorio de juegos de la biblioteca ("¿A qué juego un random?")
 * con filtros de tiempo (pile of shame, poco jugados) y animación de ruleta.
 * @spec REQ-12, RNF-04, RNF-05
 */

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Dice5,
  Play,
  ExternalLink,
  Sparkles,
  Flame,
  Search,
  Check,
  RotateCw,
} from 'lucide-react';
import { ProfileGameItem } from '@/lib/steam/api';
import { formatHours, formatEurFromCents } from '@/lib/formatters';

type FilterMode = 'all' | 'unplayed' | 'under2h' | 'played';

export function RandomGamePicker() {
  const [profileInput, setProfileInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<ProfileGameItem[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedGame, setSelectedGame] = useState<ProfileGameItem | null>(null);
  const [spinIndex, setSpinIndex] = useState(0);

  const loadLibrary = async () => {
    if (!profileInput.trim()) return;
    setLoading(true);
    setSelectedGame(null);

    try {
      // 1. Resolver identificador si es vanity o URL
      const resolveRes = await fetch(
        `/api/profile/resolve?q=${encodeURIComponent(profileInput.trim())}`
      );
      const resolveData = await resolveRes.json();
      if (!resolveRes.ok || !resolveData.steamId) {
        throw new Error('No se pudo encontrar el perfil especificado.');
      }

      // 2. Cargar perfil completo
      const profileRes = await fetch(`/api/profile/${resolveData.steamId}`);
      const profileData = await profileRes.json();
      if (!profileRes.ok || !profileData.topGames) {
        throw new Error('No se pudieron obtener los juegos de la biblioteca.');
      }

      // Combinar juegos disponibles
      const allGames = profileData.topGames || [];
      setGames(allGames);
    } catch (err: any) {
      alert(err.message || 'Error cargando la biblioteca.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCandidateGames = (): ProfileGameItem[] => {
    if (games.length === 0) return [];
    switch (filterMode) {
      case 'unplayed':
        return games.filter((g) => g.playtimeForeverMin === 0);
      case 'under2h':
        return games.filter((g) => g.playtimeForeverMin > 0 && g.playtimeForeverHours < 2);
      case 'played':
        return games.filter((g) => g.playtimeForeverHours >= 10);
      case 'all':
      default:
        return games;
    }
  };

  const spinRoulette = () => {
    const candidates = getFilteredCandidateGames();
    if (candidates.length === 0) {
      alert('No hay juegos que cumplan el filtro seleccionado en esta biblioteca.');
      return;
    }

    setIsSpinning(true);
    setSelectedGame(null);

    let counter = 0;
    const totalSpins = 25; // 25 ciclos de animación
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * candidates.length);
      setSpinIndex(randomIndex);
      counter++;

      if (counter >= totalSpins) {
        clearInterval(interval);
        const finalWinner = candidates[Math.floor(Math.random() * candidates.length)];
        setSelectedGame(finalWinner);
        setIsSpinning(false);
      }
    }, 80);
  };

  const candidates = getFilteredCandidateGames();
  const currentPreviewGame =
    isSpinning && candidates.length > 0 ? candidates[spinIndex] : selectedGame;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Selector de Perfil y Carga */}
      <div className="p-6 sm:p-8 rounded-3xl bg-carbon-900/90 border border-carbon-800 shadow-xl backdrop-blur-sm mb-8">
        <label className="text-xs font-mono font-medium text-guacamole-400 flex items-center gap-2 mb-2">
          <Dice5 className="w-4 h-4" />
          <span>Perfil de Steam para la ruleta</span>
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-carbon-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={profileInput}
              onChange={(e) => setProfileInput(e.target.value)}
              placeholder="Introduce tu SteamID64, enlace o vanity..."
              className="w-full bg-carbon-950 border border-carbon-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-carbon-500 focus:outline-none focus:border-guacamole-400 font-mono transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={loadLibrary}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-white font-semibold text-xs transition-colors shrink-0 disabled:opacity-50"
          >
            {loading ? 'Cargando biblioteca...' : 'Cargar Biblioteca'}
          </button>
        </div>

        {/* Filtros de la Ruleta */}
        {games.length > 0 && (
          <div className="mt-6 pt-5 border-t border-carbon-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  filterMode === 'all'
                    ? 'bg-guacamole-500 text-carbon-950 font-bold shadow'
                    : 'bg-carbon-800 text-carbon-400 hover:text-white'
                }`}
              >
                Cualquiera ({games.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('unplayed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  filterMode === 'unplayed'
                    ? 'bg-guacamole-500 text-carbon-950 font-bold shadow'
                    : 'bg-carbon-800 text-carbon-400 hover:text-white'
                }`}
              >
                Pile of Shame (Sin jugar)
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('under2h')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  filterMode === 'under2h'
                    ? 'bg-guacamole-500 text-carbon-950 font-bold shadow'
                    : 'bg-carbon-800 text-carbon-400 hover:text-white'
                }`}
              >
                Poco jugados (&lt; 2h)
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('played')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  filterMode === 'played'
                    ? 'bg-guacamole-500 text-carbon-950 font-bold shadow'
                    : 'bg-carbon-800 text-carbon-400 hover:text-white'
                }`}
              >
                Favoritos habituales (&gt; 10h)
              </button>
            </div>

            <button
              type="button"
              onClick={spinRoulette}
              disabled={isSpinning || candidates.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-guacamole-400 to-brand-cyan hover:opacity-95 text-carbon-950 font-bold text-sm shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
            >
              <Dice5 className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Girando ruleta...' : '¡Elegir juego al azar!'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Pantalla de Ruleta / Juego Ganador */}
      {currentPreviewGame && (
        <div
          className={`p-6 sm:p-10 rounded-3xl border transition-all duration-300 shadow-2xl flex flex-col md:flex-row items-center gap-8 ${
            selectedGame
              ? 'bg-gradient-to-r from-carbon-900 via-carbon-900 to-guacamole-950/40 border-guacamole-500/50 shadow-guacamole-500/10'
              : 'bg-carbon-900 border-carbon-800 animate-pulse'
          }`}
        >
          {/* Portada */}
          <div className="relative w-72 h-36 sm:w-80 sm:h-40 rounded-2xl overflow-hidden bg-carbon-950 shrink-0 border border-carbon-700/80 shadow-xl">
            <Image
              src={currentPreviewGame.headerImage}
              alt={currentPreviewGame.name}
              fill
              sizes="320px"
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Información y Acciones */}
          <div className="flex-1 text-center md:text-left">
            {selectedGame ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-guacamole-500/10 border border-guacamole-500/30 text-guacamole-400 text-xs font-mono font-bold uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>¡Juego seleccionado para hoy!</span>
              </div>
            ) : (
              <span className="text-xs font-mono text-carbon-400 uppercase tracking-wider">
                Eligiendo al azar entre {candidates.length} juegos...
              </span>
            )}

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              {currentPreviewGame.name}
            </h3>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-mono text-carbon-300 mb-6">
              <span>
                Tiempo jugado:{' '}
                <strong className="text-white">
                  {formatHours(currentPreviewGame.playtimeForeverHours)} h
                </strong>
              </span>
              <span>•</span>
              <span>
                Precio:{' '}
                <strong className="text-guacamole-400">
                  {formatEurFromCents(currentPreviewGame.currentPriceCents)}
                </strong>
              </span>
            </div>

            {selectedGame && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {/* Botón directo steam://run */}
                <a
                  href={`steam://run/${selectedGame.appId}`}
                  className="px-5 py-2.5 rounded-xl bg-guacamole-500 hover:bg-guacamole-400 text-carbon-950 font-bold text-xs font-mono flex items-center gap-2 shadow-lg transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Jugar en Steam</span>
                </a>

                {/* Enlace Tienda Web */}
                <a
                  href={`https://store.steampowered.com/app/${selectedGame.appId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-white text-xs font-mono flex items-center gap-2 transition-colors border border-carbon-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver en Steam Store</span>
                </a>

                {/* Repetir giro */}
                <button
                  type="button"
                  onClick={spinRoulette}
                  className="p-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-carbon-400 hover:text-white transition-colors"
                  title="Girar de nuevo"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
