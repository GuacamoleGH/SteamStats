'use client';

// =============================================================================
// SteamStats — SteamID Multi-Format Converter Component
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Conversor bidireccional entre SteamID64, SteamID2, SteamID3 y
 * AccountID con copia al portapapeles y enlace de análisis directo.
 * @spec REQ-12, RNF-04, RNF-05
 */

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Binary,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  parseAndConvertAnySteamId,
  ConvertedSteamIDs,
} from '@/lib/steam/steamid-converter';

export function SteamIdConverter() {
  const [input, setInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const converted: ConvertedSteamIDs | null = parseAndConvertAnySteamId(input);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleValues = [
    { label: 'SteamID64', val: '76561197960287930' },
    { label: 'SteamID2', val: 'STEAM_0:0:11101' },
    { label: 'SteamID3', val: '[U:1:22202]' },
    { label: 'AccountID', val: '22202' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Caja de Entrada */}
      <div className="p-6 sm:p-8 rounded-3xl bg-carbon-900/90 border border-carbon-800 shadow-xl backdrop-blur-sm mb-8">
        <label className="text-xs font-mono font-medium text-guacamole-400 flex items-center gap-2 mb-2">
          <Binary className="w-4 h-4" />
          <span>Introduce cualquier formato de identificación de Steam</span>
        </label>

        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pega SteamID64, STEAM_0:..., [U:1:...], AccountID o URL..."
            className="w-full bg-carbon-950 border border-carbon-700 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white placeholder-carbon-500 focus:outline-none focus:border-guacamole-400 font-mono transition-colors shadow-inner"
          />
        </div>

        {/* Ejemplos Rápidos */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-carbon-400">Probar ejemplo:</span>
          {sampleValues.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setInput(s.val)}
              className="px-2.5 py-1 rounded-lg bg-carbon-800 hover:bg-carbon-700 text-carbon-300 hover:text-white transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados de la Conversión */}
      {converted ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* SteamID64 */}
          <FormatCard
            title="SteamID64 (Community ID)"
            value={converted.steamId64}
            description="El identificador numérico de 64 bits utilizado por la Steam Web API."
            badge="Estándar Web"
            copied={copiedKey === 'id64'}
            onCopy={() => copyToClipboard(converted.steamId64, 'id64')}
          />

          {/* SteamID2 */}
          <FormatCard
            title="SteamID (Legacy Steam2)"
            value={converted.steamId2}
            description="Formato clásico empleado por juegos Source (Counter-Strike, TF2, Garry's Mod)."
            badge="GoldSrc / Source"
            copied={copiedKey === 'id2'}
            onCopy={() => copyToClipboard(converted.steamId2, 'id2')}
          />

          {/* SteamID3 */}
          <FormatCard
            title="SteamID3 (Modern Steam3)"
            value={converted.steamId3}
            description="Formato moderno de cuenta utilizado en consolas de desarrollador y Dota 2."
            badge="Dota 2 / CS2"
            copied={copiedKey === 'id3'}
            onCopy={() => copyToClipboard(converted.steamId3, 'id3')}
          />

          {/* AccountID */}
          <FormatCard
            title="AccountID (32-bit)"
            value={converted.accountId.toString()}
            description="Número de cuenta entero de 32 bits utilizado en la base de datos interna de Valve."
            badge="32-bit Int"
            copied={copiedKey === 'account'}
            onCopy={() => copyToClipboard(converted.accountId.toString(), 'account')}
          />

          {/* URL de Perfil */}
          <div className="md:col-span-2 p-5 sm:p-6 rounded-2xl bg-carbon-900 border border-carbon-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-carbon-400 font-medium">
                Enlace Oficial de la Comunidad
              </span>
              <p className="text-sm font-mono font-bold text-white mt-1 break-all">
                {converted.profileUrl}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => copyToClipboard(converted.profileUrl, 'url')}
                className="px-3.5 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-guacamole-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar</span>
              </button>

              <Link
                href={`/profile/${converted.steamId64}`}
                className="px-4 py-2 rounded-xl bg-guacamole-500 hover:bg-guacamole-400 text-carbon-950 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors shadow"
              >
                <span>Analizar Perfil</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-carbon-900/60 border border-carbon-800 text-center flex flex-col items-center justify-center">
          <Info className="w-8 h-8 text-carbon-500 mb-2" />
          <h4 className="text-sm font-bold text-white">Formato no reconocido</h4>
          <p className="text-xs text-carbon-400 max-w-md mt-1 leading-relaxed">
            Introduce un SteamID64 de 17 dígitos, un STEAM_0:Y:Z, un [U:1:W] o una URL directa para
            ver la conversión a todos los formatos disponibles.
          </p>
        </div>
      )}
    </div>
  );
}

function FormatCard({
  title,
  value,
  description,
  badge,
  copied,
  onCopy,
}: {
  title: string;
  value: string;
  description: string;
  badge: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="p-5 rounded-2xl bg-carbon-900 border border-carbon-800 hover:border-carbon-700 transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-mono font-medium text-carbon-300">{title}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-carbon-800 text-carbon-400 border border-carbon-700/60">
            {badge}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-carbon-950 border border-carbon-800/80 flex items-center justify-between gap-3 font-mono text-sm font-bold text-guacamole-400">
          <span className="truncate select-all">{value}</span>
          <button
            type="button"
            onClick={onCopy}
            className="p-1.5 rounded-lg hover:bg-carbon-800 text-carbon-400 hover:text-white transition-colors shrink-0"
            title="Copiar al portapapeles"
          >
            {copied ? <Check className="w-4 h-4 text-guacamole-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <p className="text-[11px] text-carbon-400 mt-3 leading-relaxed">{description}</p>
    </div>
  );
}
