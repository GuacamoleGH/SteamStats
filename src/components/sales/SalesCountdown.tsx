'use client';

// =============================================================================
// SteamStats — Steam Sales Countdown Component
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Temporizador en tiempo real a la próxima gran rebaja de Steam,
 * detección de eventos en vivo, barra de progreso y conversión a hora local.
 * @spec REQ-11, RNF-04, RNF-05
 */

import React, { useState, useEffect } from 'react';
import { Flame, Clock, Calendar, Sparkles, ExternalLink, Tag } from 'lucide-react';
import { SaleEvent, getSaleStatus, SaleStatus } from '@/lib/sales';

interface SalesCountdownProps {
  sales: SaleEvent[];
}

export function SalesCountdown({ sales }: SalesCountdownProps) {
  const [status, setStatus] = useState<SaleStatus>(() => getSaleStatus(sales));
  const [mounted, setMounted] = useState(false);
  const [localTimeZone, setLocalTimeZone] = useState<string>('UTC');

  useEffect(() => {
    setMounted(true);
    try {
      setLocalTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setLocalTimeZone('Local');
    }

    const timer = setInterval(() => {
      setStatus(getSaleStatus(sales));
    }, 1000);

    return () => clearInterval(timer);
  }, [sales]);

  const targetSale = status.currentSale || status.nextSale;
  const countdown = status.countdown;

  // Formato localizado para la fecha objetivo
  const formatTargetDateTime = (dateStr?: string | null) => {
    if (!dateStr || !mounted) return '19:00 hora de España (10:00 AM PST)';
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(d);
  };

  return (
    <div className="w-full">
      {/* Tarjeta Principal del Temporizador */}
      <div className="relative overflow-hidden rounded-3xl border border-guacamole-500/30 bg-gradient-to-b from-carbon-900 to-carbon-950 p-6 sm:p-10 shadow-2xl backdrop-blur-xl mb-12">
        {/* Resplandor decorativo de fondo */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-guacamole-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Badge de Estado */}
          {status.isSaleActive ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wide uppercase mb-4 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>¡Rebajas Activas Ahora Mismo!</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold tracking-wide uppercase mb-4">
              <Flame className="w-4 h-4" />
              <span>Cuenta Atrás a la Próxima Gran Rebaja</span>
            </div>
          )}

          {/* Nombre de la Rebaja */}
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {targetSale ? targetSale.name : 'Próximas Rebajas de Steam'}
          </h2>

          <p className="text-xs sm:text-sm text-carbon-400 max-w-xl mb-8">
            {targetSale
              ? targetSale.description
              : 'Periodo de ofertas oficiales en la tienda de Steam.'}
          </p>

          {/* Reloj de Cuenta Atrás (Días, Horas, Minutos, Segundos) */}
          {countdown && (
            <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full max-w-xl mb-8">
              {/* Días (Destacado en verde) */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-guacamole-500/10 border-2 border-guacamole-400 shadow-glow relative">
                <span className="text-2xl sm:text-5xl font-extrabold font-mono text-guacamole-400 tracking-tight">
                  {countdown.days.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-mono uppercase text-guacamole-400 mt-1 font-bold">
                  Días
                </span>
              </div>

              {/* Horas */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-carbon-900/90 border border-guacamole-500/40 shadow-lg hover:border-guacamole-400/60 transition-colors">
                <span className="text-2xl sm:text-5xl font-extrabold font-mono text-white tracking-tight">
                  {countdown.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-mono uppercase text-carbon-400 mt-1 font-semibold">
                  Horas
                </span>
              </div>

              {/* Minutos */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-carbon-900/90 border border-guacamole-500/40 shadow-lg hover:border-guacamole-400/60 transition-colors">
                <span className="text-2xl sm:text-5xl font-extrabold font-mono text-white tracking-tight">
                  {countdown.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-mono uppercase text-carbon-400 mt-1 font-semibold">
                  Minutos
                </span>
              </div>

              {/* Segundos (Marco en verde, números normales) */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-carbon-900/90 border border-guacamole-500/40 shadow-lg hover:border-guacamole-400/60 transition-colors relative">
                <span className="text-2xl sm:text-5xl font-extrabold font-mono text-white tracking-tight">
                  {countdown.seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-mono uppercase text-carbon-400 mt-1 font-semibold">
                  Segundos
                </span>
              </div>
            </div>
          )}

          {/* Barra de progreso si está activa */}
          {status.isSaleActive && status.activeProgressPercent !== undefined && (
            <div className="w-full max-w-xl mb-6">
              <div className="flex items-center justify-between text-xs font-mono text-carbon-400 mb-1.5">
                <span>Progreso del evento</span>
                <span className="text-emerald-400 font-bold">{status.activeProgressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-carbon-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-guacamole-400 rounded-full transition-all duration-1000"
                  style={{ width: `${status.activeProgressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Información de Zona Horaria Local */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-carbon-400 border-t border-guacamole-500/20 pt-5 w-full">
            <Clock className="w-4 h-4 text-guacamole-400" />
            <span>
              {status.isSaleActive ? 'Finaliza el: ' : 'Comienza el: '}
              <strong className="text-slate-200">
                {formatTargetDateTime(status.targetDate)}
              </strong>
            </span>
            <span className="text-carbon-500 text-[11px]">
              (10:00 AM PST · {localTimeZone})
            </span>
          </div>
        </div>
      </div>

      {/* Listado del Calendario Completo */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-guacamole-400" />
            <h3 className="text-lg font-bold text-white">Todas las Rebajas Programadas</h3>
          </div>
          <span className="text-xs font-mono text-carbon-400">data/sales.json</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sales.map((sale) => {
            const isLive = status.currentSale?.id === sale.id;
            const isUpcoming = !isLive && new Date(sale.startDate).getTime() > Date.now();
            const isFinished = !isLive && new Date(sale.endDate).getTime() < Date.now();

            return (
              <div
                key={sale.id}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                  isLive
                    ? 'bg-carbon-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : isUpcoming
                    ? 'bg-carbon-900/80 border-guacamole-500/30 hover:border-guacamole-400/60'
                    : 'bg-carbon-950/60 border-carbon-900 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                        isLive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                          : isUpcoming
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                          : 'bg-carbon-800 text-carbon-500'
                      }`}
                    >
                      {isLive ? 'En vivo' : isUpcoming ? 'Próxima' : 'Finalizada'}
                    </span>
                    <span className="text-[11px] font-mono text-carbon-500 uppercase">
                      {sale.type}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-2">{sale.name}</h4>
                  <p className="text-xs text-carbon-400 mb-4 leading-relaxed">
                    {sale.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-carbon-border">
                  <div className="flex items-center gap-2 text-xs font-mono text-carbon-300">
                    <Calendar className="w-3.5 h-3.5 text-guacamole-400" />
                    <span>
                      {new Date(sale.startDate).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      &mdash;{' '}
                      {new Date(sale.endDate).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
