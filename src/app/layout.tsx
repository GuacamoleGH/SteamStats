// =============================================================================
// SteamStats — Root Layout
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'SteamStats — Estadísticas y Calculadora de Steam | GuacamoleGH',
  description:
    'Calculadora de cuenta de Steam, estadísticas de tiempo de juego, pile of shame, insignias, nivel y cuenta atrás a la próxima gran rebaja para el homelab GuacamoleGH.',
  keywords: ['Steam', 'SteamStats', 'SteamDB', 'GuacamoleGH', 'Calculadora Steam', 'Horas jugadas'],
  authors: [{ name: 'GuacamoleGH', url: 'https://guacamolegh.es' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://steamstats.guacamolegh.es'),
  openGraph: {
    title: 'SteamStats — Estadísticas y Calculadora de Steam',
    description: 'Descubre el valor real de tu biblioteca de Steam, horas de juego y nivel.',
    url: 'https://steamstats.guacamolegh.es',
    siteName: 'SteamStats GuacamoleGH',
    locale: 'es_ES',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-theme="dark" className="dark">
      <body className="min-h-screen flex flex-col bg-carbon-deep text-slate-100 antialiased selection:bg-guacamole-400 selection:text-carbon-deep">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
