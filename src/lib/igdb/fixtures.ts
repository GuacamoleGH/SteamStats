// =============================================================================
// SteamStats — Curated Upcoming Game Releases Fixtures
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Catálogo de prueba con lanzamientos estelares de videojuegos
 * con portadas oficiales, fechas, plataformas y géneros para funcionamiento offline
 * o cuando no se dispone de credenciales de IGDB/Twitch.
 * @spec REQ-10
 */

import { IGDBReleaseGame } from './types';

export const CURATED_UPCOMING_RELEASES: IGDBReleaseGame[] = [
  {
    id: 119171,
    name: 'Grand Theft Auto VI',
    summary:
      'Ambientado en el estado ficticio de Leonida y las calles bañadas por luces de neón de Vice City, sigue la historia de Lucia y Jason en la evolución más ambiciosa de la saga GTA.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7d6q.webp',
    releaseDate: '2026-11-20T00:00:00Z',
    platforms: ['PlayStation 5', 'Xbox Series X/S'],
    genres: ['Acción', 'Aventura', 'Mundo Abierto'],
    hypes: 4890,
  },
  {
    id: 191692,
    name: 'DOOM: The Dark Ages',
    summary:
      'La precuela de los aclamados DOOM (2016) y DOOM Eternal que narra el épico origen cinemático de la furia del DOOM Slayer con armamento medieval-demoníaco y un escudo con sierra circular.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8ajv.webp',
    releaseDate: '2026-11-28T00:00:00Z',
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X/S'],
    genres: ['Shooter', 'Acción', 'Ciencia Ficción'],
    hypes: 2340,
  },
  {
    id: 285436,
    name: 'Ghost of Yōtei',
    summary:
      'Ambientado en 1603, más de 300 años después de los eventos de Ghost of Tsushima, sigue a una nueva heroína, Atsu, en las vastas tierras salvajes que rodean el majestuoso monte Yōtei en Ezo (Hokkaido).',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8pyl.webp',
    releaseDate: '2026-12-05T00:00:00Z',
    platforms: ['PlayStation 5'],
    genres: ['Acción', 'Aventura', 'Mundo Abierto'],
    hypes: 3120,
  },
  {
    id: 145942,
    name: 'Monster Hunter Wilds',
    summary:
      'Adéntrate en tierras inexploradas con ecosistemas dinámicos donde el clima cambia radicalmente y los monstruos se adaptan a su entorno en brutales cacerías en grupo.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8jts.webp',
    releaseDate: '2026-12-15T00:00:00Z',
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X/S'],
    genres: ['RPG', 'Acción', 'Aventura'],
    hypes: 3450,
  },
  {
    id: 228495,
    name: 'Death Stranding 2: On The Beach',
    summary:
      'Hideo Kojima regresa con una nueva odisea interconectada explorando la fragilidad de los lazos humanos a través de Sam Porter Bridges y un elenco estelar que desafía la realidad.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7qu9.webp',
    releaseDate: '2027-01-22T00:00:00Z',
    platforms: ['PlayStation 5'],
    genres: ['Aventura', 'Acción', 'Ciencia Ficción'],
    hypes: 2800,
  },
  {
    id: 260842,
    name: 'Subnautica 2',
    summary:
      'Una nueva aventura de supervivencia submarina en un planeta alienígena totalmente desconocido, introduciendo por primera vez cooperativo multijugador y criaturas abisales asombrosas.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8pzi.webp',
    releaseDate: '2027-02-12T00:00:00Z',
    platforms: ['PC', 'Xbox Series X/S'],
    genres: ['Supervivencia', 'Aventura', 'Exploración'],
    hypes: 1950,
  },
  {
    id: 11133,
    name: 'Metroid Prime 4: Beyond',
    summary:
      'Samus Aran aterriza en una nueva frontera galáctica en la esperada continuación de la aclamada saga Metroid Prime en primera persona con exploración profunda y puzzles biomiméticos.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8a1t.webp',
    releaseDate: '2027-03-05T00:00:00Z',
    platforms: ['Nintendo Switch'],
    genres: ['Aventura', 'Shooter', 'Ciencia Ficción'],
    hypes: 3670,
  },
  {
    id: 136551,
    name: 'Fable',
    summary:
      'Un nuevo comienzo para la legendaria franquicia de fantasía británica de Playground Games, donde tus decisiones morales forjan el destino de Albion con humor ingenioso.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8a38.webp',
    releaseDate: '2027-03-20T00:00:00Z',
    platforms: ['PC', 'Xbox Series X/S'],
    genres: ['RPG', 'Acción', 'Fantasía'],
    hypes: 2190,
  },
  {
    id: 115276,
    name: 'Hollow Knight: Silksong',
    summary:
      'Juega como Hornet, la princesa y protectora de Hallownest, y aventúrate en un reino completamente nuevo gobernado por la seda y la música en la secuela del aclamado metroidvania.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.webp',
    releaseDate: '2027-04-10T00:00:00Z',
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X/S', 'Nintendo Switch'],
    genres: ['Metroidvania', 'Plataformas', 'Acción'],
    hypes: 4950,
  },
  {
    id: 228122,
    name: 'Judas',
    summary:
      'Un shooter narrativo en primera persona para un jugador desarrollado por Ghost Story Games, el estudio dirigido por Ken Levine (creador de System Shock 2 y BioShock).',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5w3d.webp',
    releaseDate: '2027-04-28T00:00:00Z',
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X/S'],
    genres: ['Shooter', 'Ciencia Ficción', 'Acción'],
    hypes: 1650,
  },
];
