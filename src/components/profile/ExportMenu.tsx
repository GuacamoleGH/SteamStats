'use client';

// =============================================================================
// SteamStats — Export Menu Component
// Copyright (c) 2026 GuacamoleGH · steamstats.guacamolegh.es
// Licensed under the MIT License. Built with dbv-specs-ops
// @spec REQ-15, RNF-03
// =============================================================================

import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileCode, Check } from 'lucide-react';
import { generateLibraryCsv, generateLibraryJson, ExportableGame } from '@/lib/export';

interface ExportMenuProps {
  profile: {
    steamId64: string;
    personaName: string;
  };
  games: ExportableGame[];
}

export function ExportMenu({ profile, games }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = (format: 'csv' | 'json') => {
    let content = '';
    let mimeType = '';
    let filename = '';

    const safeName = profile.personaName.replace(/[^a-zA-Z0-9_-]/g, '_');

    if (format === 'csv') {
      content = generateLibraryCsv(games);
      mimeType = 'text/csv;charset=utf-8;';
      filename = `steamstats_${safeName}_library.csv`;
    } else {
      content = generateLibraryJson(profile, games);
      mimeType = 'application/json;charset=utf-8;';
      filename = `steamstats_${safeName}_library.json`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedFormat(format);
    setTimeout(() => {
      setDownloadedFormat(null);
      setIsOpen(false);
    }, 1200);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-surface-card border border-white/10 hover:border-guac-neon/40 hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-guac-neon/50"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Download className="w-3.5 h-3.5 text-guac-neon" />
        Exportar Biblioteca
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface-card border border-white/10 shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/5 mb-1">
            Formato de descarga
          </div>
          <button
            onClick={() => handleDownload('csv')}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/5 hover:text-guac-neon transition-colors text-left"
          >
            <span className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              CSV (Excel / Hojas)
            </span>
            {downloadedFormat === 'csv' && <Check className="w-3.5 h-3.5 text-guac-neon" />}
          </button>
          <button
            onClick={() => handleDownload('json')}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/5 hover:text-guac-neon transition-colors text-left"
          >
            <span className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              JSON (Datos brutos)
            </span>
            {downloadedFormat === 'json' && <Check className="w-3.5 h-3.5 text-guac-neon" />}
          </button>
        </div>
      )}
    </div>
  );
}
