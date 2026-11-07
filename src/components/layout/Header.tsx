// =============================================================================
// SteamStats — Header Component with Hub Integration
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Menu, X, Flame, Calendar, GitCompare, Sparkles } from 'lucide-react';

/**
 * @fileoverview Cabecera sticky accesible con identidad GuacamoleGH y enlace al Hub.
 * @spec RNF-03
 */

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL || 'https://hub.guacamolegh.es';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Inicio', icon: Sparkles },
    { href: '/sales', label: 'Rebajas', icon: Flame },
    { href: '/releases', label: 'Lanzamientos', icon: Calendar },
    { href: '/compare', label: 'Comparar', icon: GitCompare },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-carbon-border bg-carbon-base/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-guacamole-400 rounded-lg hover:opacity-95 transition-opacity"
            aria-label="SteamStats - Ir a inicio"
          >
            {/* Logo de vapor / stats con gradiente verde */}
            <div className="w-9 h-9 rounded-xl bg-carbon-card border border-carbon-border flex items-center justify-center shadow-card group">
              <span className="text-xl group-hover:scale-110 transition-transform select-none">🥑</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white select-none">
                Guacamole<span className="text-guacamole-400">GH</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-guacamole-400/10 text-guacamole-400 border border-guacamole-400/25">
                SteamStats
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-guacamole-400'
                    : 'text-slate-300 hover:text-guacamole-400'
                }`}
              >
                <Icon className="w-4 h-4 opacity-80" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="h-4 w-[1px] bg-carbon-border" />

          {/* Enlace al Hub (obligatorio del ecosistema) */}
          <a
            href={HUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Ir al Hub de servicios de Guacamole Server"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-slate-200 bg-carbon-card hover:bg-carbon-hover border border-carbon-border hover:border-guacamole-400/40 transition-all shadow-sm"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-guacamole-400" />
            <span>Hub</span>
          </a>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-carbon-card border border-transparent focus:border-guacamole-400 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-carbon-border bg-carbon-base px-4 py-4 space-y-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-carbon-card text-guacamole-400'
                    : 'text-slate-200 hover:bg-carbon-card hover:text-guacamole-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-carbon-border">
            <a
              href={HUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md bg-carbon-card border border-carbon-border text-sm font-medium text-slate-200 hover:border-guacamole-400/50"
            >
              <LayoutGrid className="w-4 h-4 text-guacamole-400" />
              <span>Volver al Hub de Servicios</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
