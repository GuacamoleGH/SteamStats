// =============================================================================
// SteamStats — Search Hero Component
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

/**
 * @fileoverview Buscador principal de perfiles con soporte para atajos (/),
 * validación reactiva y resolución transparente de vanity URL a SteamID64.
 * @spec REQ-01, RNF-03
 */

export const SearchHero: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Atajo de teclado: presionar '/' enfoca el buscador, 'Escape' limpia
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setQuery('');
        setError(null);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/profile/resolve?input=${encodeURIComponent(clean)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo encontrar el perfil de Steam');
      }

      const { steamId } = data.data;
      router.push(`/profile/${steamId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar el perfil');
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-carbon-surface border border-carbon-border text-guacamole-400 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Calculadora de cuenta & Estadísticas avanzadas</span>
        </div>

        {/* Título y subtítulo */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight">
          Descubre el valor real de tu{' '}
          <span className="text-transparent bg-clip-text bg-accent-gradient">
            biblioteca de Steam
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Horas de juego, coste acumulado, porcentaje de títulos sin tocar (*pile of shame*),
          predicción de nivel y cuenta atrás de las próximas grandes rebajas.
        </p>

        {/* Barra de Búsqueda */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-4">
          <div className="relative flex items-center bg-carbon-card border border-carbon-border hover:border-slate-700 focus-within:border-guacamole-400 focus-within:ring-2 focus-within:ring-guacamole-400/25 rounded-2xl transition-all shadow-card group p-1.5 sm:p-2">
            <div className="pl-3.5 pr-1 text-slate-400 group-focus-within:text-guacamole-400 transition-colors shrink-0">
              <Search className="w-5 h-5" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Pega tu enlace de Steam, vanity URL o SteamID64..."
              className="flex-1 bg-transparent border-none text-white placeholder-slate-500 px-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-0 min-w-0"
              disabled={loading}
              autoComplete="off"
              spellCheck="false"
            />

            {/* Atajo visual */}
            {!query && (
              <kbd className="hidden sm:inline-flex items-center justify-center h-6 min-w-[24px] px-2 mr-2 text-xs font-mono font-medium text-slate-400 bg-carbon-surface rounded-md border border-carbon-border select-none shrink-0">
                /
              </kbd>
            )}

            {/* Botón de acción */}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl text-sm font-semibold text-carbon-deep bg-accent-gradient hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow shrink-0 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <span>Analizar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Mensaje de Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-rose-300 text-sm flex items-center gap-2.5 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </section>
  );
};
