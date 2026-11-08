// =============================================================================
// SteamStats — Profile Refresh API Route
// Copyright (c) 2026 GuacamoleGH · steamstats.guacamolegh.es
// Licensed under the MIT License. Built with dbv-specs-ops
// @spec REQ-02, RNF-02
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getCompleteProfile } from '@/lib/steam/api';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ steamid: string }> }
) {
  try {
    const { steamid } = await params;
    if (!steamid) {
      return NextResponse.json({ error: 'SteamID requerido' }, { status: 400 });
    }

    const profile = await getCompleteProfile(steamid, { forceRefresh: true });
    return NextResponse.json({ ok: true, lastUpdated: profile.lastUpdated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error al forzar actualización' },
      { status: 500 }
    );
  }
}
