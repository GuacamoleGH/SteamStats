# Backlog - SteamStats (v0.1.0)

> Motor SDD: dbv-specs-ops v3.2.0 · https://github.com/davidbuenov/dbv-specs-ops

## Contexto del Proyecto (Context Snapshot)
* **Objetivo**: Desarrollar y desplegar `SteamStats` en el homelab personal de GuacamoleGH (`steamstats.guacamolegh.es`) mediante Docker Compose.
* **Estado actual**: Fase 3 completada y validada; listo para Fase 4 (Snapshots diarios del worker con node-cron y Heatmap de actividad estilo GitHub).
* **Última decisión técnica**: Cálculo financiero en euros (es-ES) de valor actual, mínimos históricos, coste por hora interactivo en 3 modos (todos, de pago, jugados), y distribuciones de Recharts para horas y precios con 21 tests unitarios en Vitest.
* **Próximo paso**: Iniciar Fase 4 (`REQ-08`): Implementar el worker programado (`node-cron`), snapshots en SQLite (`OwnedGameSnapshot`) y heatmap anual estilo GitHub con filtro por juego.

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
- [ ] **Proceso Worker**: Script autónomo con `node-cron` para captura periódica de minutos por juego (`@spec REQ-08`, `RNF-01`).
- [ ] **Endpoint Heatmap**: `/api/profile/[steamid]/heatmap` con cálculo de actividad por diferencia diaria (`@spec REQ-08`).
- [ ] **Componente Heatmap**: Cuadrícula de actividad anual interactiva en verde Guacamole con filtro por juego individual (`@spec REQ-08`).

### Fase 5: Calendario de Lanzamientos y Cuenta Atrás de Rebajas
- [ ] **Integración IGDB**: Autenticación Twitch OAuth y consulta de próximos lanzamientos (`@spec REQ-10`).
- [ ] **Página de Lanzamientos**: Vista `/releases` con portadas, filtros de mes/género y persistencia de favoritos (`@spec REQ-10`).
- [ ] **Cuenta Atrás de Rebajas**: Lectura de `data/sales.json` y temporizador dinámico en portada y `/sales` ajustado a zona horaria (`@spec REQ-11`).

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

> **Last update / Última actualización:** 2026-11-07  
> **Exact point / Punto exacto:** Fase 3 (Precios, valor de cuenta y distribuciones Recharts) completada y validada en local. Dev server corriendo en http://localhost:3000.  
> **Pending / Pendiente:** Revisión del usuario y confirmación para iniciar Fase 4 (Snapshots diarios y Heatmap).  
> **Next step / Próximo paso:** Implementar el worker con `node-cron`, endpoint de heatmap y componente visual estilo GitHub.
