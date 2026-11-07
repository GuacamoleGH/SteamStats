# Backlog - SteamStats (v0.1.0)

> Motor SDD: dbv-specs-ops v3.2.0 · https://github.com/davidbuenov/dbv-specs-ops

## Contexto del Proyecto (Context Snapshot)
* **Objetivo**: Desarrollar y desplegar `SteamStats` en el homelab personal de GuacamoleGH (`steamstats.guacamolegh.es`) mediante Docker Compose.
* **Estado actual**: Fase 6 completada y validada; listo para Fase 7 (Pulido final, accesibilidad WCAG AA, agent readiness y despliegue Docker en servidor).
* **Última decisión técnica**: Comparador cara a cara de perfiles con métricas de horas compartidas vs exclusivas, conversor universal de formatos SteamID mediante aritmética BigInt y ruleta interactiva de elección aleatoria con enlaces a cliente Steam `steam://run`.
* **Próximo paso**: Iniciar Fase 7 (`RNF-01`, `RNF-03`, `RNF-IA-01`): Auditoría de accesibilidad WCAG AA, archivos de metadata y agent readiness (`llms.txt`, `robots.txt`), verificación final de Docker Compose y documentación en README.

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
- [x] **Comparador de Bibliotecas**: Vista `/compare` y endpoint `/api/compare` con comparación cara a cara, juegos compartidos y exclusivos (`@spec REQ-09`).
- [x] **Conversor de IDs**: Herramienta `/tools/converter` con motor BigInt bidireccional entre SteamID64, SteamID2, SteamID3 y AccountID (`@spec REQ-12`).
- [x] **Selector Aleatorio**: Vista `/tools/random` con ruleta interactiva de juegos, filtros de tiempo y lanzamiento directo en cliente de Steam (`@spec REQ-12`).
- [x] **Hub de Herramientas**: Vista `/tools` de navegación y enlace en la cabecera del sitio (`@spec RNF-03`).
- [x] **Tests Unitarios de Comparación y Conversión**: Cobertura en `tests/compare.test.ts` y `tests/steamid-converter.test.ts` (`@spec RNF-01`).

### Fase 7: Pulido, Tests de Calidad y Despliegue
- [x] **Tests Unitarios (Vitest)**: Algoritmo de XP, conversor de IDs, formateadores de moneda `es-ES` y parseo de rebajas (`@spec RNF-01`).
- [x] **Auditoría de Accesibilidad (WCAG AA)**: Revisión de navegación por teclado y contraste de colores (`@spec RNF-03`).
- [x] **Agent Readiness**: Archivos `robots.txt`, `llms.txt`, `auth.md` y metadatos (`@spec RNF-IA-01`).
- [x] **Verificación Docker Compose**: Despliegue y verificación local completa (`@spec RNF-01`).

---

## Deuda Técnica
* [Ninguna]

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-11-08  
> **Exact point / Punto exacto:** Fase 7 completada y validada al 100%. Todas las fases del backlog (Fases 1 a 7) implementadas, testeadas con Vitest (46/46 tests pasando) y documentadas.  
> **Pending / Pendiente:** Ninguna tarea técnica pendiente. Listo para puesta en marcha y uso en producción en el homelab (`steamstats.guacamolegh.es`).  
> **Next step / Próximo paso:** Entrega final al usuario y cierre de ciclo SDD.
