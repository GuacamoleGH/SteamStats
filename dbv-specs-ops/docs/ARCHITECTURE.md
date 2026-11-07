# 🏗️ Arquitectura Técnica: SteamStats

> Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops

---

## 1. Visión General de la Arquitectura

SteamStats opera como una plataforma desacoplada diseñada para ejecutarse en entornos contenerizados (Docker Compose) en un servidor doméstico expuesto mediante Cloudflare Tunnel.

```
                      +---------------------------------------+
                      |       Internet / Cloudflare Tunnel    |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |         Docker Compose Host           |
                      |                                       |
                      |   +-------------------------------+   |
                      |   |    Servidor Web (Next.js)     |   |
                      |   |  - Next.js 15 App Router      |   |
                      |   |  - Server & Client Components |   |
                      |   |  - API Routes + Zod           |   |
                      |   |  - Recharts & Tailwind CSS    |   |
                      |   +---------------+---------------+   |
                      |                   |                   |
                      |                   v                   |
                      |   +-------------------------------+   |
                      |   |    Capa de Datos (Prisma)     |   |
                      |   |  - SQLite (Dev / Test)        |   |
                      |   |  - PostgreSQL (Producción)    |   |
                      |   +---------------+---------------+   |
                      |                   ^                   |
                      |                   |                   |
                      |   +---------------+---------------+   |
                      |   |    Proceso Worker Separado    |   |
                      |   |  - Tareas con node-cron       |   |
                      |   |  - Snapshots diarios horas    |   |
                      |   |  - Actualización periódica    |   |
                      |   +-------------------------------+   |
                      +---------------------------------------+
                                          |
                   +----------------------+----------------------+
                   |                      |                      |
                   v                      v                      v
        +--------------------+  +--------------------+  +--------------------+
        |   Steam Web API    |  |  IsThereAnyDeal    |  |     IGDB API       |
        |  & Storefront API  |  |    (Precios min)   |  | (Lanzamientos)     |
        +--------------------+  +--------------------+  +--------------------+
```

---

## 2. Pila Tecnológica (Stack)

- **Frontend:** Next.js 15 (React 19), App Router, Tailwind CSS v3/v4 con tokens personalizados, Lucide React (iconos).
- **Backend:** Next.js Route Handlers (`src/app/api/...`), TypeScript estricto, Zod para parseo y validación de esquemas.
- **ORM / Persistencia:** Prisma ORM.
  - Entorno de desarrollo: SQLite (`prisma/dev.db`).
  - Entorno de producción: SQLite persistente en volumen Docker o PostgreSQL configurable mediante `DATABASE_URL`.
- **Proceso en Segundo Plano:** Proceso Node.js independiente con `node-cron` que comparte los modelos Prisma y la lógica de base de datos.
- **Gráficas y Analítica:** Recharts para gráficos de barras y áreas con los colores de marca GuacamoleGH.
- **Testing:** Vitest para pruebas unitarias de negocio (resolución de vanity, algoritmo de XP, parseo de rebajas).
- **Contenerización:** Docker multi-stage build + Docker Compose (servicios `web` y `worker`).

---

## 3. Modelo de Datos (Prisma Schema)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model SteamProfile {
  steamId              String               @id
  vanityUrl            String?
  personaName          String
  avatarUrl            String
  avatarMediumUrl      String?
  avatarFullUrl        String?
  profileUrl           String
  timeCreated          DateTime?
  countryCode          String?
  steamLevel           Int                  @default(0)
  totalPlaytimeMinutes Int                  @default(0)
  isPrivate            Boolean              @default(false)
  lastUpdated          DateTime             @default(now())
  createdAt            DateTime             @default(now())

  ownedGames           ProfileOwnedGame[]
  snapshots            OwnedGameSnapshot[]
  badges               ProfileBadge[]

  @@index([vanityUrl])
  @@index([lastUpdated])
}

model ProfileOwnedGame {
  id                   String        @id @default(cuid())
  steamId              String
  appId                Int
  playtimeForeverMin   Int           @default(0)
  playtime2WeeksMin    Int           @default(0)
  lastPlayedTime       DateTime?
  hasPlayed            Boolean       @default(false)

  profile              SteamProfile  @relation(fields: [steamId], references: [steamId], onDelete: Cascade)
  game                 GameCache     @relation(fields: [appId], references: [appId], onDelete: Cascade)

  @@unique([steamId, appId])
  @@index([steamId])
  @@index([appId])
}

model GameCache {
  appId                Int                  @id
  name                 String
  headerImage          String?
  isFree               Boolean              @default(false)
  isDelisted           Boolean              @default(false)
  currentPriceCents    Int?
  initialPriceCents    Int?
  discountPercent      Int                  @default(0)
  lowestPriceCents     Int?
  lowestPriceDate      DateTime?
  priceUpdatedAt       DateTime?
  createdAt            DateTime             @default(now())

  profileGames         ProfileOwnedGame[]
  snapshots            OwnedGameSnapshot[]

  @@index([priceUpdatedAt])
  @@index([name])
}

model OwnedGameSnapshot {
  id                   String        @id @default(cuid())
  steamId              String
  appId                Int
  playtimeForeverMin   Int
  snapshotDate         DateTime

  profile              SteamProfile  @relation(fields: [steamId], references: [steamId], onDelete: Cascade)
  game                 GameCache     @relation(fields: [appId], references: [appId], onDelete: Cascade)

  @@unique([steamId, appId, snapshotDate])
  @@index([steamId, snapshotDate])
}

model ProfileBadge {
  id                   String        @id @default(cuid())
  steamId              String
  badgeId              Int
  level                Int           @default(1)
  completionTime       DateTime?
  xp                   Int           @default(0)
  scarcity             Int?

  profile              SteamProfile  @relation(fields: [steamId], references: [steamId], onDelete: Cascade)

  @@unique([steamId, badgeId])
  @@index([steamId])
}

model Release {
  id                   Int           @id
  name                 String
  summary              String?
  coverUrl             String?
  releaseDate          DateTime
  platforms            String
  genres               String
  lastUpdated          DateTime      @default(now())

  @@index([releaseDate])
}
```

---

## 4. Endpoints Internos de API

- `GET /api/profile/resolve?input=...`: Resuelve URLs de perfil, vanity URL o SteamID64 a un SteamID64 canónico (`@spec REQ-01`).
- `GET /api/profile/[steamid]`: Devuelve el resumen, insignias y biblioteca con TTL de 1 hora (`@spec REQ-02`, `REQ-03`, `REQ-07`).
- `GET /api/profile/[steamid]/heatmap?appId=...`: Devuelve la matriz diaria de minutos jugados para el componente heatmap (`@spec REQ-08`).
- `GET /api/profile/compare?id1=...&id2=...`: Compara dos bibliotecas lado a lado (`@spec REQ-09`).
- `GET /api/prices/batch?appids=...`: Consulta precios en cola controlada con caché de 24 horas (`@spec REQ-05`).
- `GET /api/releases?month=...&genre=...`: Próximos lanzamientos desde IGDB (`@spec REQ-10`).
- `GET /api/sales`: Lista de rebajas leídas de `data/sales.json` (`@spec REQ-11`).
- `GET /api/tools/convert?id=...`: Conversor de formatos SteamID (`@spec REQ-12`).

---

## 5. Estrategias de Resiliencia y Control de Cuotas

1. **Storefront API de Steam:** Límite aproximado de 200 peticiones / 5 minutos. Mitigación con cola *token-bucket*, lotes de 10 peticiones, TTL en base de datos de 24 horas y retroceso exponencial ante códigos 429/503.
2. **Steam Web API:** TTL de 1 hora por perfil para no saturar la clave de usuario. Botón de refresco protegido por cooldown de 5 minutos.
3. **Perfiles Privados:** Detección de visibilidad restringida y presentación de guía asistida para configurar la privacidad en Steam en vez de error 500.
