// =============================================================================
// SteamStats — Test Fixture for GuacamoleSteam (76561198337759875)
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

export const GUACAMOLE_STEAM_FIXTURE = {
  profile: {
    steamId: '76561198337759875',
    vanityUrl: 'GuacamoleSteam',
    personaName: 'Guacamole',
    avatarUrl: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg',
    avatarMediumUrl: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg',
    avatarFullUrl: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
    profileUrl: 'https://steamcommunity.com/id/GuacamoleSteam/',
    timeCreated: new Date('2016-10-23T18:00:00Z'),
    countryCode: 'ES',
    steamLevel: 28,
    isPrivate: false,
  },
  xp: {
    playerXp: 5420,
    playerLevel: 28,
  },
  games: [
    {
      appId: 730,
      name: 'Counter-Strike 2',
      playtimeForeverMin: 84320, // ~1405 h
      playtime2WeeksMin: 720,    // 12 h
      headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg',
    },
    {
      appId: 1086940,
      name: "Baldur's Gate 3",
      playtimeForeverMin: 18240, // 304 h
      playtime2WeeksMin: 1200,   // 20 h
      headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg',
    },
    {
      appId: 1091500,
      name: 'Cyberpunk 2077',
      playtimeForeverMin: 11450, // 190.8 h
      playtime2WeeksMin: 0,
      headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
    },
    {
      appId: 1245620,
      name: 'ELDEN RING',
      playtimeForeverMin: 9800, // 163.3 h
      playtime2WeeksMin: 340,   // 5.6 h
      headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
    },
    {
      appId: 292030,
      name: 'The Witcher 3: Wild Hunt',
      playtimeForeverMin: 8900, // 148.3 h
      playtime2WeeksMin: 0,
      headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg',
    },
    {
      appId: 1145360,
      name: 'Hades',
      playtimeForeverMin: 5600, // 93.3 h
      playtime2WeeksMin: 0,
      headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg',
    },
    {
      appId: 252490,
      name: 'Rust',
      playtimeForeverMin: 4800, // 80 h
      playtime2WeeksMin: 0,
      headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/header.jpg',
    },
    {
      appId: 1172470,
      name: 'Apex Legends',
      playtimeForeverMin: 4200, // 70 h
      playtime2WeeksMin: 0,
      headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/header.jpg',
    },
    {
      appId: 271590,
      name: 'Grand Theft Auto V',
      playtimeForeverMin: 3900, // 65 h
      playtime2WeeksMin: 0,
      headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg',
    },
    {
      appId: 814380,
      name: 'Sekiro: Shadows Die Twice',
      playtimeForeverMin: 3100, // 51.6 h
      playtime2WeeksMin: 0,
      headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg',
    },
    // Juegos sin jugar (Backlog / Pile of Shame)
    {
      appId: 377160,
      name: 'Fallout 4',
      playtimeForeverMin: 0,
      playtime2WeeksMin: 0,
      headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/377160/header.jpg',
    },
    {
      appId: 489830,
      name: 'The Elder Scrolls V: Skyrim Special Edition',
      playtimeForeverMin: 0,
      playtime2WeeksMin: 0,
      headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/489830/header.jpg',
    },
    {
      appId: 582010,
      name: 'Monster Hunter: World',
      playtimeForeverMin: 0,
      playtime2WeeksMin: 0,
      headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/582010/header.jpg',
    },
    {
      appId: 883710,
      name: 'Resident Evil 2',
      playtimeForeverMin: 0,
      playtime2WeeksMin: 0,
      headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/header.jpg',
    },
    {
      appId: 105600,
      name: 'Terraria',
      playtimeForeverMin: 0,
      playtime2WeeksMin: 0,
      headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg',
    },
  ],
  badges: [
    {
      badgeId: 1,
      level: 10,
      completionTime: new Date('2024-01-15T12:00:00Z'),
      xp: 500,
      scarcity: 15000,
    },
    {
      badgeId: 13,
      level: 8,
      completionTime: new Date('2024-06-25T18:00:00Z'),
      xp: 400,
      scarcity: 8200,
    },
    {
      badgeId: 2,
      level: 5,
      completionTime: new Date('2023-12-28T20:00:00Z'),
      xp: 250,
      scarcity: 45000,
    },
    {
      badgeId: 4,
      level: 1,
      completionTime: new Date('2022-07-04T10:00:00Z'),
      xp: 100,
      scarcity: 120000,
    },
  ],
};
