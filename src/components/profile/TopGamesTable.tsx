// =============================================================================
// SteamStats — Top Games Table Component
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import React from 'react';
import Image from 'next/image';
import { Trophy, ExternalLink, Flame } from 'lucide-react';
import { ProfileGameItem } from '@/lib/steam/api';
import { formatEurFromCents, formatHours } from '@/lib/formatters';

interface TopGamesTableProps {
  games: ProfileGameItem[];
}

export const TopGamesTable: React.FC<TopGamesTableProps> = ({ games }) => {
  const maxHours = games.length > 0 ? games[0].playtimeForeverHours : 1;

  if (games.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-carbon-card border border-carbon-border text-center">
        <p className="text-slate-400 text-sm">No hay registros de juegos jugados en esta cuenta.</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-carbon-card border border-carbon-border shadow-card mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Top Juegos Más Jugados
            </h2>
            <p className="text-xs text-slate-400">
              Títulos a los que más tiempo has dedicado con su amortización económica
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Top {games.length} de la biblioteca
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-carbon-border text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-3">Juego</th>
              <th className="py-3 px-3 w-36 text-right">Tiempo Total</th>
              <th className="py-3 px-3 w-32 text-right hidden md:table-cell">Últimas 2 Sem.</th>
              <th className="py-3 px-3 w-28 text-right hidden sm:table-cell">Precio Actual</th>
              <th className="py-3 px-3 w-28 text-right font-mono">Coste / Hora</th>
              <th className="py-3 px-3 w-14 text-center">Tienda</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-carbon-border/50 text-sm">
            {games.map((game, index) => {
              const percentageOfMax = Math.min(
                100,
                Math.round((game.playtimeForeverHours / maxHours) * 100)
              );

              return (
                <tr
                  key={game.appId}
                  className="hover:bg-carbon-hover/50 transition-colors group"
                >
                  {/* Posición / Ranking */}
                  <td className="py-3.5 px-3 text-center font-mono font-bold">
                    {index === 0 && <span className="text-amber-400">🥇</span>}
                    {index === 1 && <span className="text-slate-300">🥈</span>}
                    {index === 2 && <span className="text-amber-600">🥉</span>}
                    {index > 2 && <span className="text-slate-500">{index + 1}</span>}
                  </td>

                  {/* Imagen y Nombre del Juego */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-8 sm:w-20 sm:h-9 rounded-md overflow-hidden bg-carbon-surface shrink-0 border border-carbon-border relative">
                        <Image
                          src={game.headerImage}
                          alt={game.name}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-white group-hover:text-guacamole-400 transition-colors line-clamp-1">
                          {game.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          AppID: {game.appId}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Horas Totales con barra proporcional */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="font-mono font-bold text-white">
                      {formatHours(game.playtimeForeverHours)}{' '}
                      <span className="text-xs text-guacamole-400">h</span>
                    </div>
                    {/* Barra de progreso */}
                    <div className="w-full bg-carbon-surface h-1.5 rounded-full overflow-hidden mt-1.5 ml-auto max-w-[100px]">
                      <div
                        className="bg-accent-gradient h-full rounded-full"
                        style={{ width: `${percentageOfMax}%` }}
                      />
                    </div>
                  </td>

                  {/* Horas 2 Semanas */}
                  <td className="py-3.5 px-3 text-right hidden md:table-cell font-mono">
                    {game.playtime2WeeksHours > 0 ? (
                      <span className="inline-flex items-center gap-1 text-turquoise-400 font-semibold text-xs">
                        <Flame className="w-3 h-3" />
                        <span>{formatHours(game.playtime2WeeksHours)} h</span>
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs">&mdash;</span>
                    )}
                  </td>

                  {/* Precio actual */}
                  <td className="py-3.5 px-3 text-right hidden sm:table-cell font-mono text-xs">
                    <span className={game.isFree || game.currentPriceCents === 0 ? 'text-emerald-400 font-medium' : 'text-slate-300'}>
                      {formatEurFromCents(game.currentPriceCents)}
                    </span>
                  </td>

                  {/* Coste por hora */}
                  <td className="py-3.5 px-3 text-right font-mono text-xs">
                    {game.isFree || game.currentPriceCents === 0 ? (
                      <span className="text-emerald-400 font-medium">Gratis</span>
                    ) : game.costPerHourEur !== null && game.costPerHourEur !== undefined ? (
                      <span className="text-guacamole-400 font-bold">
                        {game.costPerHourEur.toFixed(2).replace('.', ',')} €/h
                      </span>
                    ) : (
                      <span className="text-slate-500">&mdash;</span>
                    )}
                  </td>

                  {/* Enlace a Steam Store */}
                  <td className="py-3.5 px-3 text-center">
                    <a
                      href={`https://store.steampowered.com/app/${game.appId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-carbon-surface text-slate-400 hover:text-steam-blue inline-flex items-center justify-center transition-colors"
                      title="Ver en la tienda de Steam"
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
    </div>
  );
};
