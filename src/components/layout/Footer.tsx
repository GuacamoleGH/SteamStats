// =============================================================================
// SteamStats — Footer Component
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import React from 'react';
import Link from 'next/link';
import { Github, LayoutGrid, Gamepad2, Flag, ShieldCheck } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();
const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL || 'https://hub.guacamolegh.es';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-carbon-border bg-carbon-deep mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Copyright */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 select-none">
            <span className="text-xl">🥑</span>
            <span className="text-sm font-bold text-white tracking-tight">
              Steam<span className="text-guacamole-400">Stats</span>
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono sm:pt-1">
            &copy; {CURRENT_YEAR} GuacamoleGH &middot; Homelab personal &middot; Licencia MIT
          </span>
        </div>

        {/* Ecosistema Links */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
          <a
            href={HUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-guacamole-400 transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-guacamole-400" />
            <span>Hub</span>
          </a>

          <a
            href="https://games.guacamolegh.es"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-turquoise-400 transition-colors"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-turquoise-400" />
            <span>Games</span>
          </a>

          <a
            href="https://flags.guacamolegh.es"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-guacamole-400 transition-colors"
          >
            <Flag className="w-3.5 h-3.5 text-guacamole-400" />
            <span>Flags</span>
          </a>

          <div className="h-3 w-[1px] bg-carbon-border hidden sm:block" />

          <a
            href="https://github.com/GuacamoleGH/SteamStats"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Github className="w-3.5 h-3.5 text-slate-300" />
            <span>GitHub</span>
          </a>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-carbon-surface text-slate-400 border border-carbon-border">
            <ShieldCheck className="w-3 h-3 text-guacamole-400" />
            <span>SDD dbv-specs-ops</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
