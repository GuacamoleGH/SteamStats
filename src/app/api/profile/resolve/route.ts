// =============================================================================
// SteamStats — Resolve Profile Route Handler
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveToSteamId64 } from '@/lib/steam/id-resolver';

/**
 * @fileoverview Endpoint para resolver identificadores de Steam a SteamID64 canónico.
 * @spec REQ-01, RNF-04
 */

const querySchema = z.object({
  input: z
    .string()
    .min(1, 'El parámetro de búsqueda no puede estar vacío')
    .max(256, 'El parámetro de búsqueda es demasiado largo'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      input: searchParams.get('input') ?? '',
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? 'Entrada inválida',
        },
        { status: 400 }
      );
    }

    const result = await resolveToSteamId64(parsed.data.input);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno al resolver perfil';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 404 }
    );
  }
}
