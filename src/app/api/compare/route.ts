// =============================================================================
// SteamStats — Profile Comparison API Endpoint
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Endpoint para contrastar dos bibliotecas de Steam recibiendo
 * dos identificadores (SteamID64, vanity URL o enlace completo).
 * @spec REQ-09
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveToSteamId64 } from '@/lib/steam/id-resolver';
import { getCompleteProfile } from '@/lib/steam/api';
import { compareProfiles } from '@/lib/steam/compare';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q1 = searchParams.get('u1') || searchParams.get('q1');
    const q2 = searchParams.get('u2') || searchParams.get('q2');

    if (!q1 || !q2) {
      return NextResponse.json(
        { error: 'Debes proporcionar dos identificadores de perfil (parámetros u1 y u2).' },
        { status: 400 }
      );
    }

    // 1. Resolver ambos identificadores
    const [res1, res2] = await Promise.all([
      resolveToSteamId64(q1).catch(() => null),
      resolveToSteamId64(q2).catch(() => null),
    ]);

    if (!res1 || !res1.steamId) {
      return NextResponse.json(
        { error: `No se pudo encontrar o resolver el primer perfil: "${q1}".` },
        { status: 404 }
      );
    }

    if (!res2 || !res2.steamId) {
      return NextResponse.json(
        { error: `No se pudo encontrar o resolver el segundo perfil: "${q2}".` },
        { status: 404 }
      );
    }

    // 2. Obtener los datos completos de ambos perfiles
    const [profileA, profileB] = await Promise.all([
      getCompleteProfile(res1.steamId),
      getCompleteProfile(res2.steamId),
    ]);

    // 3. Ejecutar comparación
    const comparison = compareProfiles(profileA, profileB);

    return NextResponse.json(comparison);
  } catch (error: any) {
    console.error('[API Compare] Error en comparativa:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al procesar la comparación de perfiles.' },
      { status: 500 }
    );
  }
}
