// =============================================================================
// SteamStats — Releases API Endpoint
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Endpoint público para consultar los próximos lanzamientos
 * de videojuegos sincronizados desde IGDB con caché local.
 * @spec REQ-10
 */

import { NextResponse } from 'next/server';
import { getUpcomingReleases } from '@/lib/igdb/api';

export const revalidate = 43200; // 12 horas

export async function GET() {
  try {
    const data = await getUpcomingReleases();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[API Releases] Error recuperando lanzamientos:', err);
    return NextResponse.json(
      { error: 'Error al recuperar lanzamientos de videojuegos.' },
      { status: 500 }
    );
  }
}
