// =============================================================================
// SteamStats — Vanity Profile Resolver Page
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import { redirect, notFound } from 'next/navigation';
import { resolveToSteamId64 } from '@/lib/steam/id-resolver';

interface VanityPageProps {
  params: Promise<{
    vanity: string;
  }>;
}

export default async function VanityPage({ params }: VanityPageProps) {
  const { vanity } = await params;

  let targetSteamId: string | null = null;
  try {
    const result = await resolveToSteamId64(vanity);
    targetSteamId = result.steamId;
  } catch {
    notFound();
  }

  if (targetSteamId) {
    redirect(`/profile/${targetSteamId}`);
  }
}
