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

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ChevronDown,
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
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);
  const [genreMenuOpen, setGenreMenuOpen] = useState(false);
  const monthMenuRef = useRef<HTMLDivElement>(null);
  const genreMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (monthMenuRef.current && !monthMenuRef.current.contains(e.target as Node)) {
        setMonthMenuOpen(false);
      }
      if (genreMenuRef.current && !genreMenuRef.current.contains(e.target as Node)) {
        setGenreMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Limpiar nombres de plataformas para que no desborden
  const cleanPlatformName = (name: string) => {
    return name
      .replace('PC (Microsoft Windows)', 'PC')
      .replace('Microsoft Windows', 'Windows')
      .replace('Nintendo Switch 2', 'Switch 2')
      .replace('Nintendo Switch', 'Switch')
      .replace('PlayStation 5', 'PS5')
      .replace('PlayStation 4', 'PS4')
      .replace('Xbox Series X/S', 'Xbox')
      .replace('Xbox Series X|S', 'Xbox')
      .replace('Xbox One', 'XOne');
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
      <div className="p-5 sm:p-6 rounded-2xl bg-carbon-card border border-guacamole-500/30 shadow-xl backdrop-blur-sm mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Pestañas: Todos vs Deseados */}
          <div className="flex items-center gap-1.5 p-1.5 bg-carbon-deep rounded-xl border border-guacamole-500/40 w-fit">
            <button
              type="button"
              onClick={() => setOnlyInterested(false)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                !onlyInterested
                  ? 'bg-guacamole-400 text-carbon-deep shadow-glow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Todos los juegos ({releases.length})
            </button>
            <button
              type="button"
              onClick={() => setOnlyInterested(true)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                onlyInterested
                  ? 'bg-guacamole-400 text-carbon-deep shadow-glow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  onlyInterested
                    ? 'fill-carbon-deep text-carbon-deep'
                    : mounted && interestedIds.size > 0
                    ? 'fill-current text-rose-500'
                    : ''
                }`}
              />
              <span>Mis deseados ({mounted ? interestedIds.size : 0})</span>
            </button>
          </div>

          {/* Buscador de Texto */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-guacamole-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título o descripción..."
              className="w-full bg-carbon-deep border border-guacamole-500/40 hover:border-guacamole-400/60 focus:border-guacamole-400 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Selectores Personalizados de Mes y Género */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mes */}
            <div className="relative" ref={monthMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setMonthMenuOpen(!monthMenuOpen);
                  setGenreMenuOpen(false);
                }}
                className="flex items-center gap-2 bg-carbon-deep border border-guacamole-500/40 hover:border-guacamole-400 rounded-xl px-3 py-2 text-xs text-slate-200 transition-all cursor-pointer shadow-sm"
                aria-haspopup="listbox"
                aria-expanded={monthMenuOpen}
              >
                <Calendar className="w-3.5 h-3.5 text-guacamole-400" />
                <span className="font-medium">
                  {selectedMonth === 'all' ? 'Todos los meses' : formatMonthOption(selectedMonth)}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    monthMenuOpen ? 'rotate-180 text-guacamole-400' : ''
                  }`}
                />
              </button>

              {monthMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-carbon-card border border-guacamole-500/40 shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonth('all');
                      setMonthMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                      selectedMonth === 'all'
                        ? 'bg-guacamole-500/15 text-guacamole-400 font-bold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>Todos los meses</span>
                    {selectedMonth === 'all' && (
                      <Check className="w-3.5 h-3.5 text-guacamole-400" />
                    )}
                  </button>

                  {availableMonths.map((m) => {
                    const isSelected = selectedMonth === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setSelectedMonth(m);
                          setMonthMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                          isSelected
                            ? 'bg-guacamole-500/15 text-guacamole-400 font-bold'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>{formatMonthOption(m)}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-guacamole-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Género */}
            <div className="relative" ref={genreMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setGenreMenuOpen(!genreMenuOpen);
                  setMonthMenuOpen(false);
                }}
                className="flex items-center gap-2 bg-carbon-deep border border-guacamole-500/40 hover:border-guacamole-400 rounded-xl px-3 py-2 text-xs text-slate-200 transition-all cursor-pointer shadow-sm"
                aria-haspopup="listbox"
                aria-expanded={genreMenuOpen}
              >
                <Tag className="w-3.5 h-3.5 text-turquoise-400" />
                <span className="font-medium">
                  {selectedGenre === 'all' ? 'Todos los géneros' : selectedGenre}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    genreMenuOpen ? 'rotate-180 text-guacamole-400' : ''
                  }`}
                />
              </button>

              {genreMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-carbon-card border border-guacamole-500/40 shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGenre('all');
                      setGenreMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                      selectedGenre === 'all'
                        ? 'bg-guacamole-500/15 text-guacamole-400 font-bold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>Todos los géneros</span>
                    {selectedGenre === 'all' && (
                      <Check className="w-3.5 h-3.5 text-guacamole-400" />
                    )}
                  </button>

                  {availableGenres.map((g) => {
                    const isSelected = selectedGenre === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setSelectedGenre(g);
                          setGenreMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                          isSelected
                            ? 'bg-guacamole-500/15 text-guacamole-400 font-bold'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>{g}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-guacamole-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reset */}
            {(searchQuery || selectedMonth !== 'all' || selectedGenre !== 'all' || onlyInterested) && (
              <button
                type="button"
                onClick={resetFilters}
                className="p-2 rounded-xl text-slate-400 hover:text-guacamole-400 hover:bg-carbon-surface border border-transparent hover:border-guacamole-500/30 transition-all"
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
        <div className="p-12 rounded-2xl bg-carbon-card border border-guacamole-500/20 text-center flex flex-col items-center justify-center">
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
                className="group rounded-2xl bg-carbon-card border border-guacamole-500/20 hover:border-guacamole-400/60 transition-all shadow-lg flex flex-col justify-between overflow-hidden h-full"
              >
                <div className="flex-1 flex flex-col">
                  {/* Portada con insignia de estreno y botón Me Interesa */}
                  <div className="relative aspect-[3/4] w-full bg-carbon-deep overflow-hidden shrink-0">
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
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                        Sin Portada
                      </div>
                    )}

                    {/* Gradiente superior protector para que el badge y el corazón contrasten siempre al 100% */}
                    <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none z-10" />

                    {/* Gradiente inferior en portada */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-carbon-card via-carbon-card/50 to-transparent pointer-events-none z-10" />

                    {/* Insignia de Días Restantes */}
                    <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-carbon-deep/95 border border-guacamole-400/60 text-[11px] font-mono font-bold text-guacamole-400 shadow-xl z-20 backdrop-blur-md flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-guacamole-400" />
                      <span>{getDaysUntil(game.releaseDate)}</span>
                    </div>

                    {/* Botón Flotante "Me Interesa" */}
                    <button
                      type="button"
                      onClick={() => toggleInterest(game.id)}
                      className={`absolute top-3 right-3 p-2 rounded-xl border transition-all z-20 cursor-pointer shadow-xl backdrop-blur-md ${
                        isInterested
                          ? 'bg-rose-500/25 border-rose-500 text-rose-400 shadow-rose-500/30'
                          : 'bg-carbon-deep/95 border-white/20 hover:border-rose-400 text-slate-300 hover:text-rose-400'
                      }`}
                      aria-label={isInterested ? 'Quitar de deseados' : 'Marcar como deseado'}
                      title={isInterested ? 'Quitar de deseados' : 'Marcar como deseado'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform active:scale-125 ${
                          isInterested ? 'fill-current text-rose-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Contenido de la Tarjeta con alturas uniformes */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-1.5">
                        <Calendar className="w-3 h-3 text-guacamole-400" />
                        <span>{formatReleaseDate(game.releaseDate)}</span>
                      </div>

                      <h4
                        className="text-base font-bold text-white group-hover:text-guacamole-400 transition-colors line-clamp-1 mb-2"
                        title={game.name}
                      >
                        {game.name}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3 h-9 overflow-hidden">
                        {game.summary || 'Próximo estreno en catálogo de Steam.'}
                      </p>
                    </div>

                    {/* Etiquetas de Género */}
                    <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                      {game.genres.slice(0, 2).map((genre) => (
                        <span
                          key={genre}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-carbon-surface text-slate-300 border border-white/5"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pie con Plataformas y Botón Me Interesa con altura fija y alineación uniforme */}
                <div className="px-4 py-3 border-t border-guacamole-500/20 bg-carbon-deep/50 flex items-center justify-between gap-2 min-h-[52px]">
                  <div className="flex items-center flex-wrap gap-1 max-w-[55%]">
                    {game.platforms.slice(0, 3).map((plat) => (
                      <span
                        key={plat}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-carbon-surface text-slate-300 border border-guacamole-500/20 whitespace-nowrap"
                      >
                        {cleanPlatformName(plat)}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleInterest(game.id)}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shrink-0 ${
                      isInterested
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 font-bold'
                        : 'bg-carbon-surface hover:bg-carbon-hover border-carbon-border hover:border-guacamole-500/40 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isInterested ? 'fill-current text-rose-500' : ''
                      }`}
                    />
                    <span>{isInterested ? 'Deseado' : 'Me interesa'}</span>
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
