# Backlog - SteamStats (v0.1.0)

> Motor SDD: dbv-specs-ops v3.2.0 · https://github.com/davidbuenov/dbv-specs-ops

## Contexto del Proyecto (Context Snapshot)
* **Objetivo**: Desarrollar y desplegar `SteamStats` en el homelab personal de GuacamoleGH (`steamstats.guacamolegh.es`) mediante Docker Compose.
* **Estado actual**: Fase 5 completada y validada; listo para Fase 6 (Comparador de perfiles lado a lado y herramientas auxiliares).
* **Última decisión técnica**: Integración de lanzamientos de videojuegos de IGDB con Twitch OAuth y fallback resiliente en SQLite/fixtures, filtros por mes y género con deseados guardados en localStorage, y cuenta atrás en tiempo real a las rebajas de Steam con detección de evento activo y hora local del visitante.
* **Próximo paso**: Iniciar Fase 6 (`REQ-09`, `REQ-12`): Implementar vista de comparación de dos perfiles `/compare` con cálculo de juegos compartidos, conversor de formatos SteamID y ruleta aleatoria de juegos de la biblioteca.

---

## Checklist de Tareas por Fases

### Fase 1: Esqueleto del Proyecto, Docker, Tokens y Búsqueda de Perfil
- [x] **Configuración inicial**: Next.js 15 App Router, TypeScript estricto, Tailwind CSS con tokens de diseño GuacamoleGH (`@spec RNF-01`, `RNF-03`).
- [x] **Docker Compose y Dockerfile**: Contenedor web multi-stage y volumen para base de datos SQLite (`@spec RNF-01`).
- [x] **Prisma ORM**: Modelos de base de datos (`schema.prisma`) y cliente singleton (`@spec RNF-01`).
- [x] **Sistema de Layout y Diseño**: Header con logo oficial de GuacamoleGH y enlace directo al Hub (`hub.guacamolegh.es`), Footer estandarizado (`@spec RNF-03`).
- [x] **Buscador de Perfiles**: Componente de búsqueda en portada con atajo `/` o `Ctrl+K` (`@spec REQ-01`, `RNF-03`).
- [x] **API de Resolución**: Endpoint `/api/profile/resolve` que procesa vanity URL, URL completa o SteamID64 numérico (`@spec REQ-01`).

### Fase 2: Resumen del Perfil, Algoritmo de XP y Top de Juegos
- [x] **Cliente Steam Web API**: `GetPlayerSummaries`, `GetSteamLevel`, `GetBadges`, `GetOwnedGames`, `GetRecentlyPlayedGames` (`@spec REQ-02`, `RNF-02`).
- [x] **Algoritmo de XP y Nivel**: Implementación de la fórmula exacta de Steam y cálculo de progreso (`@spec REQ-03`).
- [x] **Tarjetas de Resumen**: Horas totales, horas recientes, desglose del *Pile of Shame* y porcentaje (`@spec REQ-02`).
- [x] **Top de Juegos**: Tabla con portadas oficiales, horas, precios y coste por hora (`@spec REQ-04`).
- [x] **Gestión de Perfiles Privados**: Detección de visibilidad y guía visual para hacer público el perfil (`@spec RNF-06`).
- [x] **Caché de Perfil**: TTL de 1 hora con botón de refresco y cooldown (`@spec RNF-02`).

### Fase 3: Precios de Tienda, IsThereAnyDeal y Valor de Cuenta
- [x] **Cliente Storefront API de Steam**: Precios en euros (`cc=es`) con cola de ritmo, caché de 24h y *backoff* (`@spec REQ-05`, `RNF-02`).
- [x] **Integración IsThereAnyDeal / Fallbacks**: Mínimos históricos de precios y cálculo de porcentaje de ahorro (`@spec REQ-05`).
- [x] **Calculadora de Valor**: Suma total de cuenta (actual y mínimo histórico), coste por hora interactivo (todos, de pago, jugados) y desglose de juegos gratuitos/retirados (`@spec REQ-05`, `RNF-05`).
- [x] **Distribuciones Recharts**: Gráfica de tramos de horas (8 tramos) y gráfica de tramos de precio (7 tramos) (`@spec REQ-06`).
- [x] **Top Games Enriquecido**: Columnas de precio actual y coste por hora amortizado por título (`@spec REQ-04`, `REQ-05`).
- [x] **Tests Unitarios de Precios**: Cobertura con Vitest en `tests/pricing.test.ts` (`@spec RNF-01`).

### Fase 4: Snapshots Diarios y Heatmap de Actividad
- [x] **Proceso Worker**: Script autónomo con `node-cron` para captura periódica de minutos por juego (`@spec REQ-08`, `RNF-01`).
- [x] **Endpoint Heatmap**: `/api/profile/[steamid]/heatmap` con cálculo de actividad por diferencia diaria (`@spec REQ-08`).
- [x] **Componente Heatmap**: Cuadrícula de actividad anual interactiva en verde Guacamole con filtro por juego individual (`@spec REQ-08`).
- [x] **Tests Unitarios del Heatmap**: Cobertura con Vitest en `tests/heatmap.test.ts` (`@spec RNF-01`).

### Fase 5: Calendario de Lanzamientos y Cuenta Atrás de Rebajas
- [x] **Integración IGDB**: Autenticación Twitch OAuth, persistencia en SQLite (`Release`) y catálogo resiliente (`@spec REQ-10`).
- [x] **Página de Lanzamientos**: Vista `/releases` con portadas, filtros por mes y género, buscador en vivo y deseados persistidos en navegador (`@spec REQ-10`).
- [x] **Cuenta Atrás de Rebajas**: Lectura de `data/sales.json`, temporizador en tiempo real a las 10:00 PST / 19:00 España con zona horaria del visitante y barra de progreso de evento activo (`@spec REQ-11`).
- [x] **Tests Unitarios de Lanzamientos y Rebajas**: Cobertura con Vitest en `tests/sales.test.ts` y `tests/igdb.test.ts` (`@spec RNF-01`).

### Fase 6: Comparador de Perfiles y Herramientas Auxiliares
- [ ] **Comparador de Bibliotecas**: Vista `/compare` con comparación lado a lado y juegos compartidos (`@spec REQ-09`).
- [ ] **Conversor de IDs**: Herramienta `/tools/converter` para formatos de SteamID (`@spec REQ-12`).
- [ ] **Selector Aleatorio**: Ruleta interactiva de juegos de la biblioteca con filtros (`@spec REQ-12`).

### Fase 7: Pulido, Tests de Calidad y Despliegue
- [ ] **Tests Unitarios (Vitest)**: Algoritmo de XP, conversor de IDs, formateadores de moneda `es-ES` y parseo de rebajas (`@spec RNF-01`).
- [ ] **Auditoría de Accesibilidad (WCAG AA)**: Revisión de navegación por teclado y contraste de colores (`@spec RNF-03`).
- [ ] **Agent Readiness**: Archivos `robots.txt`, `llms.txt`, `auth.md` y metadatos (`@spec RNF-IA-01`).
- [ ] **Verificación Docker Compose**: Despliegue y verificación local completa (`@spec RNF-01`).

---

## Deuda Técnica
* [Ninguna por ahora]

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-11-08  
> **Exact point / Punto exacto:** Fase 5 (Calendario de lanzamientos IGDB, deseados en localStorage y cuenta atrás de rebajas en tiempo real con zona horaria) completada y validada en local.  
> **Pending / Pendiente:** Revisión del usuario y confirmación para iniciar Fase 6 (Comparador de perfiles y herramientas auxiliares).  
> **Next step / Próximo paso:** Implementar la vista `/compare` para comparar dos bibliotecas de Steam y herramientas de conversión de SteamID y juego aleatorio.
