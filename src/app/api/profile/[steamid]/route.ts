// =============================================================================
// SteamStats — Profile API Route Handler
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getCompleteProfile } from '@/lib/steam/api';

interface RouteContext {
  params: Promise<{
    steamid: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { steamid } = await context.params;
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const data = await getCompleteProfile(steamid, { forceRefresh });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener datos del perfil';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
