// =============================================================================
// SteamStats — Home Page
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import Link from 'next/link';
import { SearchHero } from '@/components/profile/SearchHero';
import { Flame, BarChart3, Clock, ShieldCheck, Gamepad2, ArrowRight } from 'lucide-react';
import salesData from '@/../data/sales.json';

export default function HomePage() {
  const nextSale = salesData[0];

  return (
    <div className="flex flex-col flex-1">
      {/* Hero con buscador reactivo */}
      <SearchHero />

      {/* Próxima Rebaja Banner de Acceso Rápido */}
      {nextSale && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full mb-16">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-steam-card via-carbon-card to-carbon-surface border border-carbon-border p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-guacamole-400/40 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  Próxima Gran Rebaja de Steam
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {nextSale.name}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Inicio programado para el{' '}
                  <span className="text-slate-200 font-medium">
                    {new Date(nextSale.startDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>{' '}
                  (19:00 España / 10:00 Pacífico).
                </p>
              </div>
            </div>

            <Link
              href="/sales"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-carbon-surface hover:bg-carbon-hover border border-carbon-border hover:border-guacamole-400/50 transition-all shadow-sm shrink-0"
            >
              <span>Ver cuenta atrás</span>
              <ArrowRight className="w-4 h-4 text-guacamole-400" />
            </Link>
          </div>
        </section>
      )}

      {/* Características del Ecosistema */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-carbon-card border border-carbon-border hover:border-guacamole-400/30 transition-all shadow-card">
            <div className="w-10 h-10 rounded-xl bg-guacamole-400/10 border border-guacamole-400/20 flex items-center justify-center text-guacamole-400 mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Valor & Horas</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Calcula el valor en euros de toda tu cuenta a precio actual de la tienda española y
              precio mínimo histórico según IsThereAnyDeal.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-carbon-card border border-carbon-border hover:border-turquoise-400/30 transition-all shadow-card">
            <div className="w-10 h-10 rounded-xl bg-turquoise-400/10 border border-turquoise-400/20 flex items-center justify-center text-turquoise-400 mb-4">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Pile of Shame</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Descubre cuántos títulos de tu biblioteca tienes sin tocar y qué porcentaje de tu
              dinero invertido sigue pendiente de amortizar.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-carbon-card border border-carbon-border hover:border-guacamole-400/30 transition-all shadow-card">
            <div className="w-10 h-10 rounded-xl bg-guacamole-400/10 border border-guacamole-400/20 flex items-center justify-center text-guacamole-400 mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Actividad Diaria</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Un worker diario captura tus horas jugadas para generar un heatmap de actividad anual
              estilo GitHub, filtrable por juego.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
