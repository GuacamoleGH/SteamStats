# 🎮 SteamStats — GuacamoleGH

<div align="center">
  <p><strong>Plataforma web de estadísticas de Steam, valor de cuenta y calendario de lanzamientos para el homelab GuacamoleGH</strong></p>
  <p>
    <img src="https://img.shields.io/badge/version-v0.1.0--dev-00f59b?style=flat-square" alt="Version" />
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/methodology-DBV%20Specs%20Ops%20v3.2.0-00d9c4?style=flat-square" alt="Methodology" />
    <img src="https://img.shields.io/badge/next.js-15%20(App%20Router)-black?style=flat-square" alt="Next.js" />
    <img src="https://img.shields.io/badge/typescript-strict-3178c6?style=flat-square" alt="TypeScript" />
  </p>
</div>

---

## 📑 Índice

- [📌 Sobre el proyecto](#about)
- [✨ Funcionalidades Clave](#features)
- [🛠️ Stack Tecnológico](#stack)
- [🔑 Configuración de APIs y Variables de Entorno](#apis)
- [🧰 Requisitos Previos](#requirements)
- [⚙️ Instalación y Uso Local](#usage)
- [🐳 Despliegue con Docker (Homelab GuacamoleGH)](#docker)
- [🤖 Agent Readiness y LLM Discovery](#agents)
- [📂 Estructura del Proyecto](#structure)
- [🧪 Pruebas y Calidad](#testing)
- [📄 Licencia](#license)

---

<a name="about"></a>
## 📌 Sobre el proyecto

**SteamStats** (`steamstats.guacamolegh.es`) es una aplicación analítica para perfiles públicos de Steam diseñada dentro del ecosistema GuacamoleGH. Inspirada en herramientas como SteamDB y MySteamStats, permite calcular el valor económico de la biblioteca, analizar el tiempo de juego, visualizar el *Pile of Shame*, monitorear la actividad diaria mediante heatmaps y consultar cuentas atrás para las próximas grandes rebajas de Steam.

Desarrollada bajo la metodología **Spec-Driven Development (SDD)** con el framework [dbv-specs-ops](https://github.com/davidbuenov/dbv-specs-ops).

---

<a name="features"></a>
## ✨ Funcionalidades Clave

- 🔍 **Búsqueda universal de perfiles:** Soporta vanity URLs (`/id/GuacamoleSteam`), URLs completas de comunidad y SteamID64 numéricos.
- 📊 **Tarjetas de resumen y métricas:** Horas totales, horas recientes (últimas 2 semanas), porcentaje de *Pile of Shame* (juegos comprados sin jugar), nivel y medallas.
- 🎯 **Cálculo matemático de XP y nivel:** Algoritmo exacto de Steam para predecir el coste de XP del siguiente nivel.
- 💰 **Calculadora de valor de cuenta:** Suma de precios actuales de la tienda española (EUR `€`) y mínimos históricos vía IsThereAnyDeal, junto con coste por hora jugada.
- 📈 **Gráficas de distribución (Recharts):** Distribución de biblioteca por tramos de horas jugadas y tramos de precio.
- 🗓️ **Calendario de lanzamientos:** Próximos estrenos con carátulas, géneros y plataformas vía IGDB.
- ⏳ **Cuenta atrás de rebajas:** Temporizador en tiempo real a las próximas grandes rebajas de Steam (`data/sales.json`) ajustado a la zona horaria del visitante.
- 🔥 **Heatmap de actividad:** Capturas diarias automatizadas mediante un proceso *worker* en segundo plano.
- ⚖️ **Comparador de perfiles:** Comparativa lado a lado de dos bibliotecas, juegos en común y horas compartidas.
- 🎲 **Herramientas extra:** Conversor de formatos SteamID (ID64, ID3, ID2, AccountID) y ruleta aleatoria de biblioteca.

---

<a name="stack"></a>
## 🛠️ Stack Tecnológico

- **Frontend / Backend:** Next.js 15 (App Router) + React + TypeScript estricto
- **Estilos:** Tailwind CSS con la paleta de diseño de GuacamoleGH (gama carbón y neón tecnológico `#00f59b`)
- **Base de Datos / ORM:** Prisma ORM con SQLite (desarrollo local) y compatibilidad PostgreSQL (producción)
- **Visualización:** Recharts
- **Proceso en segundo plano:** Worker Node.js con `node-cron`
- **Validación y Testing:** Zod + Vitest
- **Contenedores:** Docker & Docker Compose

---

<a name="apis"></a>
## 🔑 Configuración de APIs y Variables de Entorno

SteamStats está diseñado con una arquitectura **resiliente**: la aplicación funciona al 100% en modo local incluso sin ninguna clave de API configurada, gracias a sus sistemas de respaldo y *fixtures* integrados.

Para habilitar todas las funciones en vivo contra Valve e IGDB, consulta la guía detallada en [docs/auth.md](docs/auth.md) o revisa la siguiente tabla:

| Variable | Servicio | Requerida | Cómo obtenerla | Comportamiento si no se configura |
| :--- | :--- | :---: | :--- | :--- |
| `STEAM_API_KEY` | Steam Web API | Recomendada | Gratuita en [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey) | Usa el fixture completo de `GuacamoleSteam` (`76561198337759875`). Si buscas otro perfil, muestra un aviso guiado. |
| *(Ninguna)* | Steam Storefront API | **No requerida** | Endpoint público oficial (`store.steampowered.com/api/appdetails?cc=es`) | Descarga precios en euros en tiempo real y los guarda en caché 24h. |
| `ITAD_API_KEY` | IsThereAnyDeal | Opcional | Gratuita en [isthereanydeal.com](https://isthereanydeal.com) | Utiliza el precio actual de la tienda de Steam como mínimo histórico estimado. |
| `IGDB_CLIENT_ID` | Twitch / IGDB API | Opcional | Gratuita en [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps) | Muestra el catálogo curado offline de grandes lanzamientos (`data/releases.json` / fixtures). |
| `IGDB_CLIENT_SECRET` | Twitch OAuth | Opcional | Generable en la misma consola de Twitch | Complementa a `IGDB_CLIENT_ID` para autenticación OAuth2. |

### Configuración Rápida del `.env`

Copia la plantilla y rellena tus claves:

```bash
cp .env.example .env
```

```env
# Base de datos
DATABASE_URL="file:./dev.db"

# Clave de desarrollador de Steam (Gratuita)
STEAM_API_KEY="TU_CLAVE_STEAM"

# IsThereAnyDeal (Opcional)
ITAD_API_KEY=""

# IGDB / Twitch (Opcional)
IGDB_CLIENT_ID=""
IGDB_CLIENT_SECRET=""

# URLs del Ecosistema GuacamoleGH
NEXT_PUBLIC_HUB_URL="https://hub.guacamolegh.es"
NEXT_PUBLIC_SITE_URL="https://steamstats.guacamolegh.es"
```

---

<a name="requirements"></a>
## 🧰 Requisitos Previos

- **Node.js:** Versión 20.x o superior (desarrollo local)
- **Gestor de paquetes:** `npm` (incluido con Node.js)
- **Docker & Docker Compose:** Para despliegue contenerizado en homelab
- **Claves de API:** Ver sección [Configuración de APIs](#apis) (o en [docs/auth.md](docs/auth.md))

---

<a name="usage"></a>
## ⚙️ Instalación y Uso Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/GuacamoleGH/SteamStats.git
cd SteamStats

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus claves de API

# 4. Inicializar base de datos SQLite con Prisma
npx prisma migrate dev

# 5. Iniciar servidor de desarrollo
npm run dev

# 6. (En otra terminal) Iniciar el worker de tareas programadas
npm run worker
```

La aplicación estará disponible en `http://localhost:3000`.

---

<a name="docker"></a>
## 🐳 Despliegue con Docker (Homelab GuacamoleGH)

SteamStats incluye configuración lista para producción con Docker Compose, dividida en dos servicios:
1. **`steamstats-web`**: Aplicación Next.js 15 compilada en modo *standalone*, optimizada para alto rendimiento y bajo consumo de memoria.
2. **`steamstats-worker`**: Proceso ligero en segundo plano que ejecuta tareas programadas (`node-cron`) para capturar snapshots diarios a las 00:00 UTC.

### Levantar los contenedores

```bash
# 1. Asegúrate de tener tu archivo .env configurado
# 2. Construir y levantar en segundo plano
docker compose up -d --build

# 3. Comprobar el estado y logs
docker compose ps
docker compose logs -f
```

### Configuración de Reverse Proxy (Homelab)

Para exponer el servicio en `https://steamstats.guacamolegh.es`:

- **Cloudflare Tunnel (`cloudflared`):** Apunta el hostname `steamstats.guacamolegh.es` a `http://localhost:3000` (o `http://steamstats-web:3000` dentro de la red Docker).
- **Traefik / Nginx Proxy Manager:** Reenvía el tráfico del puerto 80/443 al puerto `3000` del contenedor con cabeceras `Host`, `X-Real-IP`, `X-Forwarded-For` y `X-Forwarded-Proto`.

El volumen `steamstats-data` garantiza la persistencia continua de la base de datos SQLite entre actualizaciones de los contenedores.

---

<a name="agents"></a>
## 🤖 Agent Readiness y LLM Discovery

SteamStats implementa las directrices de indexación semántica y compatibilidad con agentes autónomos e IAs generativas:

- 📄 **`public/robots.txt`**: Permite la indexación de todas las páginas informativas y enlaza al manifiesto semántico.
- 📋 **`public/llms.txt`**: Especificación estructurada del catálogo de rutas, parámetros de API, modelos de datos y fórmulas matemáticas (coste de XP y conversión de SteamID).
- 🛡️ **`docs/auth.md`**: Guía técnica completa sobre gestión de tokens, cuotas de peticiones y estrategias de mitigación de errores para agentes.

---

---

<a name="structure"></a>
## 📂 Estructura del Proyecto

```
SteamStats/
├── .claude/commands/       # Comandos nativos SDD (/spec, /plan, /build, /test...)
├── data/
│   └── sales.json          # Archivo editable con fechas de rebajas de Steam
├── dbv-specs-ops/          # Motor de especificaciones y memoria SDD
│   ├── docs/
│   │   ├── ARCHITECTURE.md # Arquitectura técnica, modelo de datos y endpoints
│   │   ├── DESIGN.md       # Sistema de diseño, paleta carbón/neón y componentes
│   │   └── SPECIFICATIONS.md # Especificaciones formales (REQ-01..12, RNF-01..06)
│   ├── memory.md           # Registro de decisiones arquitectónicas (ADRs)
│   ├── project.config.md   # Configuración de identidad del proyecto
│   └── task.md             # Backlog y seguimiento de fases
├── prisma/
│   └── schema.prisma       # Esquema de datos Prisma
├── src/                    # Código fuente Next.js
│   ├── app/                # Rutas y páginas (App Router)
│   ├── components/         # Componentes UI, layout, gráficos y tablas
│   ├── lib/                # Clientes de APIs, utilidades y fórmulas
│   └── types/              # Definiciones TypeScript
├── tests/                  # Tests unitarios con Vitest
├── worker/                 # Proceso worker para tareas programadas (node-cron)
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

<a name="testing"></a>
## 🧪 Pruebas y Calidad

```bash
# Ejecutar suite de pruebas unitarias
npm test

# Ejecutar linter
npm run lint

# Verificar tipos de TypeScript
npm run type-check
```

---

<a name="license"></a>
## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

Copyright (c) 2026 GuacamoleGH.
