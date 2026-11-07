'use client';

// =============================================================================
// SteamStats — Profile Share Modal & Card Generator
// Copyright (c) 2026 GuacamoleGH · steamstats.guacamolegh.es
// Licensed under the MIT License. Built with dbv-specs-ops
// @spec REQ-14, RNF-03
// =============================================================================

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Share2, Download, Copy, Check, X, Sparkles, Award } from 'lucide-react';
import { formatEur, formatHours, formatNumber } from '@/lib/formatters';

interface ProfileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    steamId: string;
    personaName: string;
    avatarUrl: string;
    steamLevel: number;
    totalPlaytimeHours: number;
    totalValueEur: number;
    unplayedPercentage: number;
    topGameName?: string;
    topGameHours?: number;
  };
}

export function ProfileShareModal({ isOpen, onClose, profile }: ProfileShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadPng = async () => {
    setDownloading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setDownloading(false);
      return;
    }

    // 1. Fondo Oscuro Carbón
    ctx.fillStyle = '#080b11';
    ctx.fillRect(0, 0, 1200, 630);

    // 2. Gradientes decorativos
    const grad1 = ctx.createRadialGradient(200, 150, 20, 200, 150, 450);
    grad1.addColorStop(0, 'rgba(0, 245, 155, 0.15)');
    grad1.addColorStop(1, 'rgba(8, 11, 17, 0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, 1200, 630);

    const grad2 = ctx.createRadialGradient(1000, 500, 20, 1000, 500, 450);
    grad2.addColorStop(0, 'rgba(0, 217, 196, 0.12)');
    grad2.addColorStop(1, 'rgba(8, 11, 17, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, 1200, 630);

    // 3. Borde exterior Neón
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 1160, 590);

    ctx.strokeStyle = '#00f59b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, 120);
    ctx.lineTo(20, 20);
    ctx.lineTo(120, 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1180, 530);
    ctx.lineTo(1180, 610);
    ctx.lineTo(1080, 610);
    ctx.stroke();

    // 4. Logo / Marca de agua
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#00f59b';
    ctx.fillText('STEAMSTATS', 60, 75);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('steamstats.guacamolegh.es', 230, 75);

    // 5. Marco Avatar
    ctx.fillStyle = '#181d26';
    ctx.fillRect(60, 130, 130, 130);
    ctx.strokeStyle = '#00f59b';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 130, 130, 130);

    // Monograma del avatar
    ctx.font = 'bold 64px system-ui, sans-serif';
    ctx.fillStyle = '#00f59b';
    ctx.textAlign = 'center';
    ctx.fillText(profile.personaName.charAt(0).toUpperCase(), 125, 220);
    ctx.textAlign = 'left';

    // Badge Nivel flotante
    ctx.fillStyle = '#080b11';
    ctx.fillRect(140, 230, 70, 34);
    ctx.strokeStyle = '#00f59b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(140, 230, 70, 34);
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#00f59b';
    ctx.fillText(`LVL ${profile.steamLevel}`, 148, 253);

    // 6. Nombre del Perfil
    ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(profile.personaName, 220, 185);

    ctx.font = '18px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`SteamID64: ${profile.steamId}`, 220, 225);

    // 7. Grid de Métricas Principales (4 cajas)
    const metrics = [
      {
        label: 'HORAS TOTALES',
        value: `${formatHours(profile.totalPlaytimeHours)}h`,
        color: '#00f59b',
      },
      {
        label: 'VALOR BIBLIOTECA',
        value: formatEur(profile.totalValueEur),
        color: '#38bdf8',
      },
      {
        label: 'PILE OF SHAME',
        value: `${profile.unplayedPercentage}%`,
        color: profile.unplayedPercentage > 50 ? '#f87171' : '#facc15',
      },
      {
        label: 'JUEGO ESTRELLA',
        value: profile.topGameName
          ? `${profile.topGameName} (${formatHours(profile.topGameHours || 0)}h)`
          : 'N/A',
        color: '#e2e8f0',
      },
    ];

    const boxWidth = 255;
    const boxHeight = 130;
    const boxY = 320;

    metrics.forEach((m, idx) => {
      const boxX = 60 + idx * (boxWidth + 20);

      // Fondo caja
      ctx.fillStyle = '#131822';
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      // Etiqueta
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(m.label, boxX + 20, boxY + 40);

      // Valor
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = m.color;
      // Truncar si es muy largo
      const text = m.value.length > 20 ? m.value.substring(0, 19) + '…' : m.value;
      ctx.fillText(text, boxX + 20, boxY + 85);
    });

    // 8. Pie de tarjeta
    ctx.font = '14px monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText('Generado con SteamStats · Ecosistema GuacamoleGH Homelab', 60, 580);

    // Descarga directa
    const safeName = profile.personaName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const link = document.createElement('a');
    link.download = `steamstats_${safeName}_card.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl bg-carbon-card border border-carbon-border p-6 sm:p-8 shadow-2xl">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-guacamole-500/10 border border-guacamole-400/20 text-guacamole-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Tarjeta de Perfil</h3>
            <p className="text-xs text-slate-400">
              Genera una tarjeta oficial en alta resolución lista para compartir en Discord o redes.
            </p>
          </div>
        </div>

        {/* Vista Previa de la Tarjeta */}
        <div className="relative rounded-xl bg-carbon-deep border border-guacamole-400/30 p-6 shadow-inner overflow-hidden mb-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-guacamole-400 bg-carbon-surface shrink-0">
                <Image
                  src={profile.avatarUrl}
                  alt={profile.personaName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  {profile.personaName}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-guacamole-500/20 text-guacamole-400 border border-guacamole-400/30 font-mono">
                    Lvl {profile.steamLevel}
                  </span>
                </h4>
                <div className="text-xs font-mono text-slate-400">
                  {profile.steamId}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-guacamole-400 font-bold tracking-wider">
                SteamStats
              </span>
              <div className="text-[10px] font-mono text-slate-500">guacamolegh.es</div>
            </div>
          </div>

          {/* Grid Miniatura */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-carbon-surface/60 border border-white/5">
              <div className="text-[10px] font-mono text-slate-400">Horas Totales</div>
              <div className="text-sm font-bold text-guacamole-400 font-mono mt-0.5">
                {formatHours(profile.totalPlaytimeHours)}h
              </div>
            </div>

            <div className="p-3 rounded-lg bg-carbon-surface/60 border border-white/5">
              <div className="text-[10px] font-mono text-slate-400">Valor Cuenta</div>
              <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                {formatEur(profile.totalValueEur)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-carbon-surface/60 border border-white/5">
              <div className="text-[10px] font-mono text-slate-400">Pile of Shame</div>
              <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                {profile.unplayedPercentage}%
              </div>
            </div>

            <div className="p-3 rounded-lg bg-carbon-surface/60 border border-white/5">
              <div className="text-[10px] font-mono text-slate-400">Top Juego</div>
              <div className="text-xs font-bold text-white truncate mt-0.5" title={profile.topGameName}>
                {profile.topGameName || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-carbon-surface hover:bg-carbon-hover border border-carbon-border transition-all"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-guacamole-400" />
                <span>¡Enlace copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Enlace</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPng}
            disabled={downloading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-carbon-deep bg-guacamole-400 hover:bg-guacamole-300 transition-all shadow-glow hover:shadow-glow-lg disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Generando...' : 'Descargar Tarjeta (PNG 1200x630)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
