// =============================================================================
// SteamStats — Badges Section Component
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import React from 'react';
import { Award, Zap, Calendar } from 'lucide-react';
import { ProfileBadgeItem } from '@/lib/steam/api';

interface BadgesSectionProps {
  badges: ProfileBadgeItem[];
}

export const BadgesSection: React.FC<BadgesSectionProps> = ({ badges }) => {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-carbon-card border border-carbon-border shadow-card mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-guacamole-400/10 border border-guacamole-400/20 flex items-center justify-center text-guacamole-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Insignias Coleccionadas
            </h2>
            <p className="text-xs text-slate-400">
              Insignias oficiales de perfil obtenidas en Steam
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          {badges.length} insignias registradas
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {badges.map((badge) => (
          <div
            key={badge.badgeId}
            className="p-3.5 rounded-xl bg-carbon-surface border border-carbon-border hover:border-guacamole-400/30 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-carbon-card text-guacamole-400 font-bold border border-carbon-border">
                  Lvl {badge.level}
                </span>
                <span className="text-xs text-amber-400 font-mono font-semibold flex items-center gap-0.5">
                  <Zap className="w-3 h-3" />
                  <span>+{badge.xp}</span>
                </span>
              </div>
              <div className="text-xs font-semibold text-white group-hover:text-guacamole-400 transition-colors line-clamp-1">
                Badge #{badge.badgeId}
              </div>
            </div>

            {badge.completionTime && (
              <div className="mt-3 pt-2 border-t border-carbon-border/50 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(badge.completionTime).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
