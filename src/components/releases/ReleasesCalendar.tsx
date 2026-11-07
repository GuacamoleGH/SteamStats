'use client';

// =============================================================================
// SteamStats — Releases Calendar & Wishlist Component
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Calendario interactivo de lanzamientos de videojuegos (IGDB)
 * con filtros por mes, género, buscador y botón "Me interesa" persistido en navegador.
 * @spec REQ-10, RNF-04, RNF-05
 */

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Calendar,
  Filter,
  Search,
  Heart,
  Sparkles,
  Gamepad2,
  Tag,
  Check,
  RotateCcw,
} from 'lucide-react';
import { IGDBReleaseGame } from '@/lib/igdb/types';
import { filterReleases } from '@/lib/igdb/api';

interface ReleasesCalendarProps {
  initialReleases: IGDBReleaseGame[];
}

const STORAGE_KEY = 'steamstats_interested_releases';

export function ReleasesCalendar({ initialReleases }: ReleasesCalendarProps) {
  const [releases] = useState<IGDBReleaseGame[]>(initialReleases);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [onlyInterested, setOnlyInterested] = useState(false);
  const [interestedIds, setInterestedIds] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Cargar deseados de localStorage en montaje
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setInterestedIds(new Set(parsed));
        }
      }
    } catch (e) {
      console.warn('Error leyendo favoritos de localStorage:', e);
    }
  }, []);

  // Alternar estado de "Me interesa"
  const toggleInterest = (id: number) => {
    setInterestedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch (e) {
        console.warn('Error guardando en localStorage:', e);
      }
      return next;
    });
  };

  // Extraer géneros únicos
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    releases.forEach((r) => r.genres.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [releases]);

  // Extraer meses únicos
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    releases.forEach((r) => {
      const ym = r.releaseDate.substring(0, 7);
      const year = parseInt(r.releaseDate.substring(0, 4), 10);
      if (year >= 2027) {
        set.add('2027+');
      } else {
        set.add(ym);
      }
    });
    return Array.from(set).sort();
  }, [releases]);

  // Filtrado reactivo
  const filteredGames = useMemo(() => {
    return filterReleases(
      releases,
      {
        searchQuery,
        month: selectedMonth,
        genre: selectedGenre,
        onlyInterested,
      },
      interestedIds
    );
  }, [releases, searchQuery, selectedMonth, selectedGenre, onlyInterested, interestedIds]);

  // Formato de nombre de mes para selector (ej: "2026-11" -> "Noviembre 2026")
  const formatMonthOption = (monthCode: string) => {
    if (monthCode === '2027+') return 'Año 2027 en adelante';
    const [year, month] = monthCode.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  // Formatear fecha del juego
  const formatReleaseDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  };

  // Días restantes hasta el estreno
  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Disponible';
    if (days === 0) return '¡Hoy!';
    if (days === 1) return 'Mañana';
    return `En ${days} días`;
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedMonth('all');
    setSelectedGenre('all');
    setOnlyInterested(false);
  };

  return (
    <div className="w-full">
      {/* Barra de Filtros y Búsqueda */}
      <div className="p-5 sm:p-6 rounded-2xl bg-carbon-900/90 border border-carbon-800 shadow-xl backdrop-blur-sm mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Pestañas: Todos vs Deseados */}
          <div className="flex items-center gap-2 p-1 bg-carbon-950 rounded-xl border border-carbon-800 w-fit">
            <button
              type="button"
              onClick={() => setOnlyInterested(false)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                !onlyInterested
                  ? 'bg-guacamole-500 text-carbon-950 shadow'
                  : 'text-carbon-400 hover:text-white'
              }`}
            >
              Todos los juegos ({releases.length})
            </button>
            <button
              type="button"
              onClick={() => setOnlyInterested(true)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                onlyInterested
                  ? 'bg-guacamole-500 text-carbon-950 shadow'
                  : 'text-carbon-400 hover:text-white'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  mounted && interestedIds.size > 0 ? 'fill-current text-rose-500' : ''
                }`}
              />
              <span>Mis deseados ({mounted ? interestedIds.size : 0})</span>
            </button>
          </div>

          {/* Buscador de Texto */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-carbon-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título o descripción..."
              className="w-full bg-carbon-950 border border-carbon-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-carbon-500 focus:outline-none focus:border-guacamole-400 transition-colors"
            />
          </div>

          {/* Selectores de Mes y Género */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mes */}
            <div className="flex items-center gap-1.5 bg-carbon-950 border border-carbon-700/80 rounded-xl px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-guacamole-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                aria-label="Filtrar por mes de estreno"
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-carbon-950 text-slate-200">
                  Todos los meses
                </option>
                {availableMonths.map((m) => (
                  <option key={m} value={m} className="bg-carbon-950 text-slate-200">
                    {formatMonthOption(m)}
                  </option>
                ))}
              </select>
            </div>

            {/* Género */}
            <div className="flex items-center gap-1.5 bg-carbon-950 border border-carbon-700/80 rounded-xl px-3 py-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-cyan" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                aria-label="Filtrar por género"
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-carbon-950 text-slate-200">
                  Todos los géneros
                </option>
                {availableGenres.map((g) => (
                  <option key={g} value={g} className="bg-carbon-950 text-slate-200">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset */}
            {(searchQuery || selectedMonth !== 'all' || selectedGenre !== 'all' || onlyInterested) && (
              <button
                type="button"
                onClick={resetFilters}
                className="p-2 rounded-xl text-carbon-400 hover:text-white hover:bg-carbon-800 transition-colors"
                title="Limpiar filtros"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas de Juegos */}
      {filteredGames.length === 0 ? (
        <div className="p-12 rounded-2xl bg-carbon-900/60 border border-carbon-800 text-center flex flex-col items-center justify-center">
          <Gamepad2 className="w-10 h-10 text-carbon-500 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">
            No se encontraron lanzamientos
          </h3>
          <p className="text-xs text-carbon-400 max-w-sm mb-4">
            No hay videojuegos que coincidan con los filtros aplicados.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-carbon-800 hover:bg-carbon-700 text-white transition-colors"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => {
            const isInterested = mounted && interestedIds.has(game.id);

            return (
              <div
                key={game.id}
                className="group rounded-2xl bg-carbon-900 border border-carbon-800 hover:border-guacamole-400/40 transition-all shadow-lg flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Portada con insignia de estreno */}
                  <div className="relative aspect-[3/4] w-full bg-carbon-950 overflow-hidden">
                    {game.coverUrl ? (
                      <Image
                        src={game.coverUrl}
                        alt={game.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-carbon-600 font-mono text-xs">
                        Sin Portada
                      </div>
                    )}

                    {/* Gradiente inferior en portada */}
                    <div className="absolute inset-0 bg-gradient-to-t from-carbon-900 via-transparent to-transparent pointer-events-none" />

                    {/* Insignia de Días Restantes */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-carbon-950/80 backdrop-blur-md border border-carbon-700/60 text-[11px] font-mono font-bold text-guacamole-400 shadow">
                      {getDaysUntil(game.releaseDate)}
                    </div>

                    {/* Botón Flotante "Me Interesa" */}
                    <button
                      type="button"
                      onClick={() => toggleInterest(game.id)}
                      className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md border transition-all ${
                        isInterested
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/20'
                          : 'bg-carbon-950/70 border-carbon-700/60 text-carbon-400 hover:text-white hover:border-carbon-500'
                      }`}
                      aria-label={isInterested ? 'Quitar de deseados' : 'Marcar como deseado'}
                      title={isInterested ? 'Quitar de deseados' : 'Marcar como deseado'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform active:scale-125 ${
                          isInterested ? 'fill-current' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Contenido de la Tarjeta */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-carbon-400 mb-1.5">
                      <Calendar className="w-3 h-3 text-guacamole-400" />
                      <span>{formatReleaseDate(game.releaseDate)}</span>
                    </div>

                    <h4 className="text-base font-bold text-white group-hover:text-guacamole-400 transition-colors line-clamp-1 mb-2">
                      {game.name}
                    </h4>

                    {game.summary && (
                      <p className="text-xs text-carbon-400 line-clamp-2 leading-relaxed mb-3">
                        {game.summary}
                      </p>
                    )}

                    {/* Etiquetas de Género */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {game.genres.slice(0, 2).map((genre) => (
                        <span
                          key={genre}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-carbon-800 text-carbon-300 border border-carbon-700/50"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pie con Plataformas y Botón Me Interesa */}
                <div className="px-4 pb-4 pt-3 border-t border-carbon-800/80 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {game.platforms.slice(0, 3).map((plat) => (
                      <span
                        key={plat}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-carbon-950 text-carbon-400 border border-carbon-800"
                      >
                        {plat.replace('PlayStation ', 'PS').replace('Xbox Series ', 'Xbox ')}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleInterest(game.id)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 shrink-0 ${
                      isInterested
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-carbon-800 hover:bg-carbon-700 border-carbon-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isInterested ? (
                      <>
                        <Check className="w-3 h-3 text-rose-400" />
                        <span>Deseado</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-3 h-3" />
                        <span>Me interesa</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
