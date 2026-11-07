// =============================================================================
// SteamStats — IGDB Game Releases Types
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Definición de tipos para próximos lanzamientos de videojuegos
 * sincronizados desde IGDB (Internet Game Database).
 * @spec REQ-10
 */

export interface IGDBReleaseGame {
  id: number;
  name: string;
  summary?: string;
  coverUrl?: string;
  releaseDate: string; // ISO 8601 YYYY-MM-DD
  platforms: string[];
  genres: string[];
  hypes?: number;
}

export interface ReleasesFilterOptions {
  month?: string; // YYYY-MM o "all"
  genre?: string;
  onlyInterested?: boolean;
  searchQuery?: string;
}
