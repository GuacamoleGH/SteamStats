# Autenticación, Claves de API y Resiliencia en SteamStats

> Ecosistema homelab GuacamoleGH · steamstats.guacamolegh.es

Este documento detalla todas las APIs externas que consume SteamStats, cómo se configuran las credenciales en `.env`, sus límites de uso y cómo el sistema se comporta con o sin ellas.

---

## 1. Resumen de Credenciales

| Variable de Entorno | Servicio | ¿Es Obligatoria? | ¿Tiene Coste? | Función Principal |
| :--- | :--- | :---: | :---: | :--- |
| `STEAM_API_KEY` | Steam Web API (Valve) | **Recomendada** | Gratuita | Consulta de perfiles, juegos poseídos, horas, nivel e insignias. |
| *(Ninguna)* | Steam Storefront API | **No requerida** | Gratuita (Pública) | Precios actuales en euros (`cc=es`) y descuentos de la tienda. |
| `ITAD_API_KEY` | IsThereAnyDeal API | Opcional | Gratuita | Mínimos históricos de precios de los juegos. |
| `IGDB_CLIENT_ID` | IGDB / Twitch API | Opcional | Gratuita | Próximos lanzamientos de videojuegos en `/releases`. |
| `IGDB_CLIENT_SECRET`| Twitch OAuth | Opcional | Gratuita | Token de autenticación para consultar IGDB. |

---

## 2. Cómo Obtener Cada Clave

### A. Steam Web API (`STEAM_API_KEY`)
1. Inicia sesión en Steam en el navegador.
2. Accede a: **https://steamcommunity.com/dev/apikey**
3. Introduce cualquier nombre de dominio (por ejemplo `steamstats.guacamolegh.es` o `localhost`).
4. Copia la clave de 32 caracteres generada.
5. Pégala en tu archivo `.env`:
   ```bash
   STEAM_API_KEY="TU_CLAVE_AQUI"
   ```

> **¿Qué pasa si NO la configuro?**  
> SteamStats detecta automáticamente que no hay clave y activa el perfil de pruebas de alta fidelidad **`GuacamoleSteam` (SteamID64: `76561198337759875`)**. Si un visitante busca otro perfil, la aplicación muestra una alerta amigable explicando que se requiere `STEAM_API_KEY` para consultas en vivo a Valve.

---

### B. Precios de la Tienda de Steam (Storefront API)
- **No necesita clave de API**.
- Endpoint oficial: `https://store.steampowered.com/api/appdetails?appids={appId}&cc=es&filters=price_overview`
- **Política de Caché y Rate-Limiting**:
  - Valve limita a ~200 peticiones cada 5 minutos por IP pública.
  - SteamStats almacena todos los precios en la tabla `GameCache` de la base de datos con un **TTL de 24 horas**.
  - Las consultas se realizan en pequeños lotes con pausas preventivas de 150 ms para no saturar la tienda.

---

### C. IsThereAnyDeal (`ITAD_API_KEY`)
1. Crea una cuenta gratuita en **https://isthereanydeal.com/**.
2. Solicita una clave de API en el portal de desarrolladores de ITAD.
3. Añádela a tu `.env`:
   ```bash
   ITAD_API_KEY="TU_ITAD_KEY"
   ```

> **¿Qué pasa si NO la configuro?**  
> Si no hay clave de ITAD configurada, SteamStats utiliza el precio actual de la tienda como mínimo histórico de respaldo, calculando el ahorro con los datos disponibles sin romper la aplicación.

---

### D. IGDB / Twitch Developer (`IGDB_CLIENT_ID` y `IGDB_CLIENT_SECRET`)
1. Inicia sesión en **https://dev.twitch.tv/console/apps**.
2. Registra una nueva aplicación (nombre: `SteamStats Guacamole`, categoría: `Website Integration`).
3. Obtén el **Client ID** y genera un **Client Secret**.
4. Añádelos a tu `.env`:
   ```bash
   IGDB_CLIENT_ID="tu_client_id"
   IGDB_CLIENT_SECRET="tu_client_secret"
   ```

> **¿Qué pasa si NO las configuro?**  
> SteamStats incluye un catálogo curado de respaldo en `CURATED_UPCOMING_RELEASES` con los mayores estrenos (GTA VI, DOOM, Monster Hunter Wilds, etc.) con portadas HD oficiales, plataformas y géneros. La vista `/releases`, los filtros y los favoritos guardados en navegador funcionan al 100% de inmediato.

---

## 3. Caché y Políticas de Invocación

- **Perfiles de Steam**: TTL de 1 hora en base de datos. Botón de refresco manual con enfriamiento (*cooldown*) de 5 minutos para evitar saturación.
- **Precios de Juegos**: TTL de 24 horas en base de datos.
- **Lanzamientos IGDB**: TTL de 12 horas en base de datos y caché de Next.js (`revalidate = 43200`).
- **Instantáneas Diarias (Heatmap)**: Tarea cron programada una vez al día a las 00:00 UTC por el worker independiente.
