# Memoria del Proyecto - SteamStats

> Registro persistente de decisiones arquitectónicas (ADRs), lecciones aprendidas y enfoques descartados.  
> Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops

---

## 🏛️ Decisiones de Arquitectura (ADRs)

### ADR-01 (2026-11-07) · Metodología de Desarrollo: Spec-Driven Development con dbv-specs-ops
- **Decisión:** Adoptar formalmente el framework `dbv-specs-ops` v3.2.0 en el subdirectorio `dbv-specs-ops/`, manteniendo los archivos de activación en la raíz (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `ANTIGRAVITY.md`).
- **Motivo:** Asegurar consistencia con los demás proyectos del ecosistema (`Flags` y `Games`), garantizar la trazabilidad de requisitos (`REQ-01`..`REQ-12`) y evitar la pérdida de contexto en sesiones continuas.

### ADR-02 (2026-11-07) · Stack Tecnológico Principal: Next.js 15 App Router + TypeScript + Prisma
- **Decisión:** Utilizar Next.js 15 con App Router y Server Components para las vistas analíticas, TypeScript estricto para modelos de datos y Prisma como capa de abstracción de datos.
- **Motivo:** Combina excelente velocidad de renderizado en servidor (ideal para SEO y perfiles públicos de Steam) con endpoints API integrados en la misma aplicación, reduciendo la sobrecarga de mantenimiento.

### ADR-03 (2026-11-07) · Arquitectura de Procesos Duales (Web + Worker)
- **Decisión:** Separar la aplicación web del procesamiento en segundo plano en dos contenedores Docker coordinados por `docker-compose.yml`: `web` (Next.js) y `worker` (script Node.js con `node-cron`).
- **Motivo:** Los snapshots diarios de horas de juego para el heatmap y la actualización progresiva de precios de la tienda de Steam no deben bloquear ni degradar las peticiones HTTP del servidor web.

### ADR-04 (2026-11-07) · Estrategia de Caché Multinivel y Resiliencia ante Rate Limits
- **Decisión:** 
  1. Perfiles de Steam: TTL de 1 hora en base de datos con botón de refresco y cooldown de 5 minutos.
  2. Precios de la Storefront API de Steam: TTL de 24 horas en `GameCache`.
  3. Cola de peticiones con retroceso exponencial ante códigos 429/503.
- **Motivo:** La Storefront API de Steam aplica límites estrictos por IP (~200 req / 5 min). La caché minimiza peticiones externas en bibliotecas grandes.

### ADR-05 (2026-11-07) · Identidad Visual y Cohesión del Ecosistema
- **Decisión:** Reutilizar estrictamente los tokens del ecosistema GuacamoleGH: fondo profundo `#080b11` / `#0c0e12`, superficies `#181d26`, acento verde neón `#00f59b`, turquesa `#00d9c4` y tipografías `Inter` + `JetBrains Mono`. Incluir botón permanente de regreso al Hub (`hub.guacamolegh.es`) en la cabecera.
- **Motivo:** Cumplir el requisito obligatorio de pertenencia al homelab personal de GuacamoleGH.

### ADR-06 (2026-11-07) · Cálculo Financiero de la Biblioteca y Distribuciones Estadísticas
- **Decisión:** Modelar las finanzas de la cuenta en tres métricas de coste por hora amortizado (todos los juegos, solo de pago, solo jugados) con formato de moneda estándar en España (`es-ES`, euros €). Representar la segmentación de tiempo en 8 tramos y de precio en 7 tramos con Recharts en Server Components hijos (`'use client'`).
- **Motivo:** Cumplir `REQ-05`, `REQ-06` y `RNF-05` ofreciendo al usuario una perspectiva clara de amortización de su gasto en videojuegos similar a SteamDB.

### ADR-07 (2026-11-07) · Generación de Actividad Diaria por Diferencia de Snapshots (Heatmap)
- **Decisión:** En lugar de intentar deducir sesiones de juego por llamadas de sondeo continuo en tiempo real, almacenar una instantánea diaria a medianoche de `playtimeForeverMin` por juego en `OwnedGameSnapshot`. El backend calcula dinámicamente las horas del día evaluando $\Delta = S_{\text{hoy}} - S_{\text{ayer}}$, permitiendo al usuario además aislar la actividad de un juego individual con el selector de filtrado.
- **Motivo:** Cumplir `REQ-08` respetando la política de no saturación de la API de Steam y permitiendo una reconstrucción fiel del historial a lo largo de 365 días en una cuadrícula anual estilo GitHub.

---

## ⚠️ Lecciones Aprendidas

- *(2026-11-07)*: En entornos Windows sobre sistemas de archivos exFAT (como discos duros externos), `fs.readlink` lanza `EISDIR` en lugar de `EINVAL` para ficheros regulares, lo que hace fallar el snapshot resolver de Webpack en Next.js. Se solucionó con un hook ligero en `scripts/patch-exfat.js` activado con `--require` antes de ejecutar Next.js.
- *(2026-11-07)*: En proyectos que consumen la Storefront API de Steam, es indispensable contemplar títulos gratuitos o retirados que no devuelven objeto `price_overview`, marcándolos con flags booleanos explícitos para no romper cálculos de valor total.

---

## 🚫 Rejection Memory

*(Enfoques probados o evaluados y descartados, para no volver a proponerlos).*

- **REJECTED-01** (2026-11-07) · Ámbito: Orquestación de tareas en segundo plano — Intento: Usar BullMQ con Redis → Motivo: Introduce la dependencia de un contenedor Redis adicional, excesiva para el volumen de un homelab personal → En su lugar: Worker ligero con `node-cron` que comparte la base de datos mediante Prisma.
